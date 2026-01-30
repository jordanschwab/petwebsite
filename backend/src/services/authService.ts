import { PrismaClient } from '@prisma/client';
import { verifyGoogleToken, GoogleUserProfile } from '../auth/google.js';
import { signToken, signRefreshToken } from '../utils/jwt.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('AuthService');
const prisma = new PrismaClient();

export interface AuthResult {
  user: any;
  accessToken: string;
  refreshToken: string;
}

/**
 * Create or update a user based on Google profile
 */
export async function createOrUpdateUser(profile: GoogleUserProfile) {
  const { sub: googleId, email, name, picture } = profile;

  // Try to find by googleId first, fall back to email
  let user = await prisma.user.findUnique({ where: { googleId } as any });

  if (!user) {
    user = await prisma.user.findUnique({ where: { email } as any });
  }

  if (user) {
    // Update existing user
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        email,
        displayName: name || user.displayName,
        profilePictureUrl: picture || user.profilePictureUrl,
      },
    });

    logger.info('Updated existing user', { userId: updated.id });
    return updated;
  }

  // Create new user
  const created = await prisma.user.create({
    data: {
      email,
      googleId,
      displayName: name || '',
      profilePictureUrl: picture || null,
    },
  });

  logger.info('Created new user', { userId: created.id });
  return created;
}

/**
 * Handle login via Google ID token: verify, upsert user, and issue tokens
 */
export async function handleGoogleLogin(idToken: string): Promise<AuthResult> {
  const profile = await verifyGoogleToken(idToken);

  const user = await createOrUpdateUser(profile);

  const accessToken = signToken(user.id, user.email);
  const refreshToken = signRefreshToken(user.id);

  // Persist refresh token
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 7 days

  await (prisma as any).refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: expiryDate,
    },
  });

  return { user, accessToken, refreshToken };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } as any });
}

/**
 * Refresh access token using refresh token
 * Returns new access token and rotated refresh token
 */
export async function refreshAuthToken(refreshToken: string): Promise<AuthResult> {
  // Verify refresh token payload using jwt utils
  const { refreshAccessToken } = await import('../utils/jwt.js');
  const { accessToken: newAccessToken, payload } = refreshAccessToken(refreshToken);

  // Validate persisted refresh token exists and is not revoked/expired
  const stored = await (prisma as any).refreshToken.findUnique({ where: { token: refreshToken } as any });
  if (!stored || stored.revoked) {
    throw new Error('Refresh token invalid or revoked');
  }

  if (stored.expiresAt < new Date()) {
    throw new Error('Refresh token expired');
  }

  const user = await getUserById(payload.userId);
  if (!user) throw new Error('User not found');

  // Revoke old token and create a rotated one
  await (prisma as any).refreshToken.update({ where: { id: stored.id }, data: { revoked: true } });

  const newRefreshToken = signRefreshToken(user.id);
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  await (prisma as any).refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: user.id,
      expiresAt: expiryDate,
    },
  });

  return { user, accessToken: newAccessToken, refreshToken: newRefreshToken };
}
