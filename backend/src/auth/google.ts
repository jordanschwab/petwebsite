import { OAuth2Client, TokenPayload as GoogleTokenPayload } from 'google-auth-library';
import { createLogger } from '../utils/logger';

const logger = createLogger('GoogleOAuth');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

// Initialize OAuth2 client
let oauthClient: OAuth2Client | null = null;

/**
 * Get or initialize the Google OAuth2 client
 * @returns Configured OAuth2Client instance
 * @throws Error if required environment variables are not set
 */
export function getOAuthClient(): OAuth2Client {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    logger.error('Google OAuth configuration missing', {
      hasClientId: !!GOOGLE_CLIENT_ID,
      hasClientSecret: !!GOOGLE_CLIENT_SECRET,
    });
    throw new Error('Google OAuth client credentials not configured');
  }

  const redactedClientId = GOOGLE_CLIENT_ID
    ? `${GOOGLE_CLIENT_ID.slice(0, 6)}...${GOOGLE_CLIENT_ID.slice(-6)}`
    : '(missing)';
  logger.info('Google OAuth client ID loaded', { clientId: redactedClientId });

  if (!oauthClient) {
    oauthClient = new OAuth2Client(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_OAUTH_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
    );
    logger.info('Google OAuth2 client initialized');
  }

  return oauthClient;
}

/**
 * Interface for extracted Google user profile
 */
export interface GoogleUserProfile {
  sub: string; // Google user ID (unique identifier)
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
  given_name?: string;
  family_name?: string;
  locale?: string;
}

/**
 * Verifies a Google ID token and extracts the user profile
 * Used when frontend sends an ID token from Google Sign-In
 * @param token - The ID token from Google Sign-In
 * @returns User profile extracted from the token
 * @throws Error if token is invalid or verification fails
 */
export async function verifyGoogleToken(token: string): Promise<GoogleUserProfile> {
  if (!token || typeof token !== 'string') {
    logger.warn('Invalid token format provided');
    throw new Error('Token must be a non-empty string');
  }

  try {
    const client = getOAuthClient();

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      logger.error('No payload in Google token verification response');
      throw new Error('Failed to extract payload from token');
    }

    // Verify email is present and verified
    if (!payload.email) {
      logger.warn('Token missing email claim');
      throw new Error('Email claim missing from token');
    }

    if (!payload.email_verified) {
      logger.warn('Token email not verified', { email: payload.email });
      throw new Error('Email not verified by Google');
    }

    const profile: GoogleUserProfile = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || '',
      email_verified: payload.email_verified === true,
      picture: payload.picture,
      given_name: payload.given_name,
      family_name: payload.family_name,
      locale: payload.locale,
    };

    logger.info('Google token verified successfully', {
      userId: profile.sub,
      email: profile.email,
    });

    return profile;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Token used too late')) {
      logger.warn('Google token is expired or used too late', { error: error.message });
      throw new Error('Token has expired');
    }

    if (error instanceof Error && error.message.includes('Token signature verification failed')) {
      logger.warn('Google token signature verification failed');
      throw new Error('Invalid token signature');
    }

    if (error instanceof Error && error.message.includes('Token is not yet valid')) {
      logger.warn('Google token is not yet valid');
      throw new Error('Token is not yet valid');
    }

    // If it's already our custom error, re-throw it
    if (error instanceof Error && (error.message.includes('Email') || error.message.includes('Token must'))) {
      throw error;
    }

    logger.error('Error verifying Google token', { error: error instanceof Error ? error.message : String(error) });
    throw new Error('Token verification failed');
  }
}

/**
 * Interface for authorization code exchange response
 */
export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  id_token?: string;
}

/**
 * Exchanges an authorization code for tokens (for server-side OAuth flow)
 * Not typically used in frontend-driven Google Sign-In, but available for server-side flow
 * @param authorizationCode - The authorization code from Google OAuth callback
 * @returns Token response with access token and optional refresh token
 * @throws Error if code exchange fails
 */
export async function exchangeAuthorizationCode(authorizationCode: string): Promise<TokenResponse> {
  if (!authorizationCode || typeof authorizationCode !== 'string') {
    logger.warn('Invalid authorization code format');
    throw new Error('Authorization code must be a non-empty string');
  }

  try {
    const client = getOAuthClient();
    const response = await client.getToken(authorizationCode);
    const credentials = response.tokens;

    if (!credentials.access_token) {
      logger.error('No access token in authorization code exchange response');
      throw new Error('Failed to obtain access token');
    }

    const tokenResponse: TokenResponse = {
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token || undefined,
      expires_in: credentials.expiry_date ? Math.floor((credentials.expiry_date - Date.now()) / 1000) : 3600,
      token_type: credentials.token_type || 'Bearer',
      id_token: credentials.id_token || undefined,
    };

    logger.info('Authorization code exchanged for tokens', {
      hasRefreshToken: !!tokenResponse.refresh_token,
      expiresIn: tokenResponse.expires_in,
    });

    return tokenResponse;
  } catch (error) {
    logger.error('Error exchanging authorization code', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw new Error('Failed to exchange authorization code');
  }
}

/**
 * Extracts user profile information from a Google ID token without verification
 * Should only be used after token is verified - useful for debugging
 * @param token - The ID token
 * @returns Decoded payload (WARNING: not cryptographically verified)
 * @throws Error if token is malformed
 */
export function decodeGoogleToken(token: string): GoogleTokenPayload | null {
  try {
    // Manually decode the JWT
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Decode the payload (second part of JWT)
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
    return payload as GoogleTokenPayload;
  } catch (error) {
    logger.warn('Error decoding Google token', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}
