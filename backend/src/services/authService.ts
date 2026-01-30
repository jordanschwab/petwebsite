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

  return { user, accessToken, refreshToken };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } as any });
}
