import jwt, { VerifyOptions } from 'jsonwebtoken';
import { createLogger } from './logger';

const logger = createLogger('JWT');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-min-32-chars';
const JWT_EXPIRATION: string | number = process.env.JWT_EXPIRATION || '24h';
const REFRESH_TOKEN_EXPIRATION: string | number = '7d';

/**
 * Payload interface for JWT tokens
 */
export interface TokenPayload {
  userId: string;
  email?: string;
  iat?: number;
  exp?: number;
}

/**
 * Signs a JWT token for a user
 * @param userId - The user ID to encode in the token
 * @param email - Optional email to include in token
 * @returns Signed JWT token string
 */
export function signToken(userId: string, email?: string): string {
  try {
    const payload: TokenPayload = {
      userId,
      email,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
      algorithm: 'HS256',
    } as any);

    logger.info('JWT token signed', { userId, expiresIn: JWT_EXPIRATION });
    return token;
  } catch (error) {
    logger.error('Error signing JWT token', { error, userId });
    throw new Error('Failed to sign token');
  }
}

/**
 * Verifies and decodes a JWT token
 * @param token - The JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): TokenPayload {
  try {
    const options: VerifyOptions = {
      algorithms: ['HS256'],
    };

    const decoded = jwt.verify(token, JWT_SECRET, options) as TokenPayload;

    logger.debug('JWT token verified', { userId: decoded.userId });
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      logger.warn('JWT token expired', { expiredAt: (error as jwt.TokenExpiredError).expiredAt });
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      logger.warn('Invalid JWT token', { error: (error as jwt.JsonWebTokenError).message });
      throw new Error('Invalid token');
    } else if (error instanceof jwt.NotBeforeError) {
      logger.warn('JWT token not yet valid', { date: (error as jwt.NotBeforeError).date });
      throw new Error('Token not yet valid');
    }
    logger.error('Error verifying JWT token', error);
    throw new Error('Token verification failed');
  }
}

/**
 * Creates a refresh token for a user
 * Used to obtain new access tokens without re-authenticating
 * @param userId - The user ID to encode in the refresh token
 * @returns Signed refresh token string
 */
export function signRefreshToken(userId: string): string {
  try {
    const payload: TokenPayload = {
      userId,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
      algorithm: 'HS256',
    } as any);

    logger.info('Refresh token signed', { userId, expiresIn: REFRESH_TOKEN_EXPIRATION });
    return token;
  } catch (error) {
    logger.error('Error signing refresh token', { error, userId });
    throw new Error('Failed to sign refresh token');
  }
}

/**
 * Verifies a refresh token and returns a new access token
 * @param refreshToken - The refresh token to verify
 * @returns New access token and refreshed token payload
 */
export function refreshAccessToken(refreshToken: string): { accessToken: string; payload: TokenPayload } {
  try {
    const payload = verifyToken(refreshToken);
    const accessToken = signToken(payload.userId, payload.email);

    logger.info('Access token refreshed', { userId: payload.userId });
    return { accessToken, payload };
  } catch (error) {
    logger.error('Error refreshing access token', { error });
    throw new Error('Failed to refresh access token');
  }
}

/**
 * Extracts token from Authorization header
 * Expected format: "Bearer <token>"
 * @param authHeader - The Authorization header value
 * @returns The token or null if header is invalid
 */
export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}
