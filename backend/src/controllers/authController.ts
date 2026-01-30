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

    // Set refresh token as httpOnly cookie with hardened attributes for production
    const cookieOptions: any = {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true; // send only over HTTPS
      cookieOptions.sameSite = 'none'; // required for cross-site in many deployments
      if (process.env.COOKIE_DOMAIN) cookieOptions.domain = process.env.COOKIE_DOMAIN;
    } else {
      cookieOptions.sameSite = 'lax';
    }

    res.cookie('refreshToken', refreshToken, cookieOptions);

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

export async function refreshToken(req: Request, res: Response) {
  try {
    // Read refresh token from cookie or body
    const cookieToken = (req as any).cookies?.refreshToken as string | undefined;
    const bodyToken = (req.body && (req.body.refreshToken as string | undefined)) || undefined;
    const token = cookieToken || bodyToken;

    if (!token) {
      return res.status(400).json({ error: 'Refresh token required', code: 'INVALID_REQUEST' });
    }

    const { refreshAuthToken } = await import('../services/authService.js');
    const { user, accessToken, refreshToken } = await refreshAuthToken(token);

    // Set new refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ data: { user, accessToken }, message: 'Token refreshed' });
  } catch (error) {
    logger.error('Error in refreshToken', { error });
    return res.status(401).json({ error: 'Invalid refresh token', code: 'INVALID_REFRESH' });
  }
}
