import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../utils/logger';

const logger = createLogger('ErrorHandler');

/**
 * Standard API error response format
 */
export interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  method?: string;
  requestId?: string;
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global error handler middleware
 * Should be added as the last middleware in Express app
 * Catches all errors and returns formatted JSON response
 *
 * @param err - Error object
 * @param req - Express request
 * @param res - Express response
 * @param next - Express next function (required for error handler signature)
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;

    const errorResponse: ErrorResponse = {
      error: getErrorName(statusCode),
      message,
      code,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    };

    if (process.env.NODE_ENV === 'development' && err.details) {
      (errorResponse as any).details = err.details;
    }

    logger.warn('Application error', {
      statusCode,
      code,
      message,
      path: req.path,
      method: req.method,
      details: err.details,
    });

    res.status(statusCode).json(errorResponse);
    return;
  }

  // Handle validation errors (Zod or similar)
  if ('statusCode' in err && typeof err.statusCode === 'number') {
    statusCode = err.statusCode;
  }

  // Handle common error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    code = 'UNAUTHORIZED';
    message = err.message || 'Unauthorized access';
  } else if (err.name === 'NotFoundError') {
    statusCode = 404;
    code = 'NOT_FOUND';
    message = err.message || 'Resource not found';
  } else if (err.name === 'ConflictError') {
    statusCode = 409;
    code = 'CONFLICT';
    message = err.message || 'Resource conflict';
  }

  const errorResponse: ErrorResponse = {
    error: getErrorName(statusCode),
    message,
    code,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  if (process.env.NODE_ENV === 'development') {
    (errorResponse as any).stack = err.stack;
  }

  logger.error('Unhandled error', {
    statusCode,
    code,
    message: err.message,
    name: err.name,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  res.status(statusCode).json(errorResponse);
}

/**
 * 404 Not Found handler middleware
 * Should be added after all other routes
 *
 * @param req - Express request
 * @param res - Express response
 */
export function notFoundHandler(req: Request, res: Response): void {
  const errorResponse: ErrorResponse = {
    error: 'Not Found',
    message: `Route not found: ${req.method} ${req.path}`,
    code: 'ROUTE_NOT_FOUND',
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
  };

  logger.warn('Route not found', {
    path: req.path,
    method: req.method,
  });

  res.status(404).json(errorResponse);
}

/**
 * Get human-readable error name from status code
 *
 * @param statusCode - HTTP status code
 * @returns Error name
 */
function getErrorName(statusCode: number): string {
  const errorNames: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };

  return errorNames[statusCode] || 'Internal Server Error';
}
