import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { TokenPayload } from '../utils/jwt';

const logger = createLogger('AuthMiddleware');

/**
 * Extended Express Request with authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  userId?: string;
}

/**
 * Middleware to verify JWT token from Authorization header
 * Sets user data on request if token is valid
 * Continues to next middleware even if no token (token may be optional)
 *
 * @param req - Express request
 * @param _res - Express response (unused)
 * @param next - Express next function
 */
export function authenticateToken(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.debug('No authorization header provided');
      return next();
    }

    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      logger.warn('Invalid authorization header format', { authHeader });
      return next();
    }

    try {
      const payload = verifyToken(token);
      req.user = payload;
      req.userId = payload.userId;

      logger.debug('JWT token authenticated', { userId: payload.userId });
      return next();
    } catch (verifyError) {
      logger.warn('JWT verification failed', { error: verifyError instanceof Error ? verifyError.message : String(verifyError) });
      return next();
    }
  } catch (error) {
    logger.error('Authentication middleware error', { error });
    return next();
  }
}

/**
 * Middleware to require authentication
 * Throws 401 Unauthorized if no valid token is present
 * Use after authenticateToken() middleware
 *
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function
 * @throws 401 Unauthorized if not authenticated
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || !req.userId) {
    logger.warn('Authentication required but no valid token', {
      path: req.path,
      method: req.method,
    });

    res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid authentication token is required',
      code: 'AUTH_REQUIRED',
    });
    return;
  }

  logger.debug('Authentication requirement satisfied', { userId: req.userId });
  next();
}

/**
 * Middleware to check if user owns a resource (e.g., pet, health record)
 * Verifies userId matches the resource owner
 *
 * @param resourceUserId - The userId of the resource owner
 * @returns Middleware function
 */
export function requireResourceOwnership(resourceUserId: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.userId) {
      logger.warn('Resource ownership check failed: no userId', { resourceUserId, path: req.path });
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    if (req.userId !== resourceUserId) {
      logger.warn('Resource ownership check failed: userId mismatch', {
        userId: req.userId,
        resourceUserId,
        path: req.path,
      });

      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
        code: 'FORBIDDEN',
      });
      return;
    }

    logger.debug('Resource ownership verified', { userId: req.userId, resourceUserId });
    next();
  };
}
