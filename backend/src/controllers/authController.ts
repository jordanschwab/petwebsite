import { Request, Response } from 'express';
import { handleGoogleLogin, getUserById } from '../services/authService.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('AuthController');

export async function googleLogin(req: Request, res: Response) {
  try {
    const { idToken } = req.body as { idToken?: string };

    if (!idToken || typeof idToken !== 'string') {
      return res.status(400).json({ error: 'idToken is required', code: 'INVALID_REQUEST' });
    }

    const { user, accessToken, refreshToken } = await handleGoogleLogin(idToken);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ data: { user, accessToken }, message: 'Logged in successfully' });
  } catch (error) {
    logger.error('Error in googleLogin', { error });
    return res.status(500).json({ error: 'Authentication failed', code: 'AUTH_FAILED' });
  }
}

export async function logout(_req: Request, res: Response) {
  // Clear refresh token cookie
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  return res.json({ message: 'Logged out successfully' });
}

export async function getCurrentUser(req: Request, res: Response) {
  // Auth middleware sets userId on request if present
  const anyReq = req as any;
  const userId = anyReq.userId as string | undefined;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    }

    return res.json({ data: { user } });
  } catch (error) {
    logger.error('Error fetching current user', { error });
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}
