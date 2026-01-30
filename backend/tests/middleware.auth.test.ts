import { describe, it, expect, beforeEach } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import * as jwtUtils from '../src/utils/jwt';
import { authenticateToken, requireAuth, AuthenticatedRequest, requireResourceOwnership } from '../src/middleware/auth';
import { errorHandler, notFoundHandler, AppError } from '../src/middleware/errorHandler';

describe('Authentication Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(authenticateToken);
  });

  describe('authenticateToken', () => {
    it('should extract and verify valid JWT token', async () => {
      const testUserId = 'test-user-123';
      const token = jwtUtils.signToken(testUserId, 'test@example.com');

      app.get('/protected', (req: AuthenticatedRequest, res) => {
        res.json({
          userId: req.userId,
          email: req.user?.email,
        });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.email).toBe('test@example.com');
    });

    it('should continue without token if not provided', async () => {
      app.get('/optional', (req: AuthenticatedRequest, res) => {
        res.json({
          userId: req.userId || null,
          isAuthenticated: !!req.user,
        });
      });

      const response = await request(app)
        .get('/optional');

      expect(response.status).toBe(200);
      expect(response.body.userId).toBeNull();
      expect(response.body.isAuthenticated).toBe(false);
    });

    it('should continue with invalid token format', async () => {
      app.get('/optional', (req: AuthenticatedRequest, res) => {
        res.json({
          userId: req.userId || null,
          isAuthenticated: !!req.user,
        });
      });

      const response = await request(app)
        .get('/optional')
        .set('Authorization', 'Invalid token format');

      expect(response.status).toBe(200);
      expect(response.body.userId).toBeNull();
      expect(response.body.isAuthenticated).toBe(false);
    });

    it('should continue with expired token', async () => {
      // Create a token that's already expired
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZXhwIjoxfQ.invalid';

      app.get('/optional', (req: AuthenticatedRequest, res) => {
        res.json({
          userId: req.userId || null,
          isAuthenticated: !!req.user,
        });
      });

      const response = await request(app)
        .get('/optional')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBeNull();
      expect(response.body.isAuthenticated).toBe(false);
    });

    it('should handle Authorization header case-insensitively', async () => {
      const testUserId = 'test-user-123';
      const token = jwtUtils.signToken(testUserId);

      app.get('/protected', (req: AuthenticatedRequest, res) => {
        res.json({ userId: req.userId });
      });

      const response = await request(app)
        .get('/protected')
        .set('authorization', `Bearer ${token}`); // lowercase header

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(testUserId);
    });
  });

  describe('requireAuth', () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(authenticateToken);
    });

    it('should deny access without token', async () => {
      app.get('/protected', requireAuth, (req: AuthenticatedRequest, res) => {
        res.json({ userId: req.userId });
      });

      const response = await request(app)
        .get('/protected');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('AUTH_REQUIRED');
      expect(response.body.message).toContain('authentication token');
    });

    it('should deny access with invalid token', async () => {
      app.get('/protected', requireAuth, (req: AuthenticatedRequest, res) => {
        res.json({ userId: req.userId });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('AUTH_REQUIRED');
    });

    it('should allow access with valid token', async () => {
      const testUserId = 'test-user-123';
      const token = jwtUtils.signToken(testUserId);

      app.get('/protected', requireAuth, (req: AuthenticatedRequest, res) => {
        res.json({ userId: req.userId, message: 'Success' });
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(testUserId);
      expect(response.body.message).toBe('Success');
    });

    it('should include 401 response format', async () => {
      app.get('/protected', requireAuth, (req: AuthenticatedRequest, res) => {
        res.json({ userId: req.userId });
      });

      const response = await request(app)
        .get('/protected');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('code');
    });
  });

  describe('requireResourceOwnership', () => {
    beforeEach(() => {
      app = express();
      app.use(express.json());
      app.use(authenticateToken);
    });

    it('should deny access if userId does not match', async () => {
      const ownerId = 'owner-123';
      const middleware = requireResourceOwnership(ownerId);

      app.get('/resource', middleware, (_req, res) => {
        res.json({ message: 'Success' });
      });

      const testUserId = 'other-user-123';
      const token = jwtUtils.signToken(testUserId);

      const response = await request(app)
        .get('/resource')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('FORBIDDEN');
    });

    it('should allow access if userId matches', async () => {
      const testUserId = 'test-user-123';
      const middleware = requireResourceOwnership(testUserId);

      app.get('/resource', middleware, (req: AuthenticatedRequest, res) => {
        res.json({ message: 'Success', userId: req.userId });
      });

      const token = jwtUtils.signToken(testUserId);

      const response = await request(app)
        .get('/resource')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Success');
      expect(response.body.userId).toBe(testUserId);
    });

    it('should deny access if not authenticated', async () => {
      const ownerId = 'owner-123';
      const middleware = requireResourceOwnership(ownerId);

      app.get('/resource', middleware, (_req, res) => {
        res.json({ message: 'Success' });
      });

      const response = await request(app)
        .get('/resource');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('AUTH_REQUIRED');
    });

    it('should return 403 response format for ownership mismatch', async () => {
      const ownerId = 'owner-123';
      const middleware = requireResourceOwnership(ownerId);

      app.get('/resource', middleware, (_req, res) => {
        res.json({ message: 'Success' });
      });

      const token = jwtUtils.signToken('other-user');

      const response = await request(app)
        .get('/resource')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('code');
    });
  });
});

describe('Error Handler Middleware', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('AppError class', () => {
    it('should create AppError with correct properties', () => {
      const error = new AppError(400, 'VALIDATION_ERROR', 'Invalid input', { field: 'email' });

      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Invalid input');
      expect(error.details).toEqual({ field: 'email' });
    });

    it('should be instanceof AppError', () => {
      const error = new AppError(500, 'SERVER_ERROR', 'Internal error');
      expect(error instanceof AppError).toBe(true);
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError correctly', async () => {
      app.get('/error', (_req, _res, next) => {
        next(new AppError(400, 'BAD_REQUEST', 'Invalid request data'));
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/error');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('BAD_REQUEST');
      expect(response.body.message).toBe('Invalid request data');
      expect(response.body.error).toBe('Bad Request');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should include path and method in error response', async () => {
      app.get('/test-error', (_req, _res, next) => {
        next(new AppError(500, 'TEST_ERROR', 'Test error'));
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/test-error');

      expect(response.body.path).toBe('/test-error');
      expect(response.body.method).toBe('GET');
    });

    it('should handle generic Error objects', async () => {
      app.get('/error', (_req, _res, next) => {
        next(new Error('Generic error message'));
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/error');

      expect(response.status).toBe(500);
      expect(response.body.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.body.statusCode).toBe(500);
    });

    it('should handle ValidationError by name', async () => {
      app.get('/error', (_req, _res, next) => {
        const err = new Error('Validation failed');
        err.name = 'ValidationError';
        next(err);
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/error');

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should handle UnauthorizedError by name', async () => {
      app.get('/error', (_req, _res, next) => {
        const err = new Error('Not authorized');
        err.name = 'UnauthorizedError';
        next(err);
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/error');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('UNAUTHORIZED');
    });

    it('should handle NotFoundError by name', async () => {
      app.get('/error', (_req, _res, next) => {
        const err = new Error('Not found');
        err.name = 'NotFoundError';
        next(err);
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/error');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('NOT_FOUND');
    });

    it('should include stack trace in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      app.get('/error', (_req, _res, next) => {
        next(new Error('Test error with stack'));
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/error');

      expect(response.body).toHaveProperty('stack');
      expect(response.body.stack).toContain('Error: Test error with stack');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      app.get('/error', (_req, _res, next) => {
        next(new Error('Test error'));
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/error');

      expect(response.body).not.toHaveProperty('stack');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('notFoundHandler', () => {
    it('should return 404 for unknown routes', async () => {
      app.use(notFoundHandler);

      const response = await request(app)
        .get('/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('ROUTE_NOT_FOUND');
      expect(response.body.error).toBe('Not Found');
    });

    it('should include path and method in 404 response', async () => {
      app.use(notFoundHandler);

      const response = await request(app)
        .post('/api/unknown');

      expect(response.status).toBe(404);
      expect(response.body.path).toBe('/api/unknown');
      expect(response.body.method).toBe('POST');
    });

    it('should include timestamp in 404 response', async () => {
      app.use(notFoundHandler);

      const response = await request(app)
        .get('/not-found');

      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  describe('Integration: Auth + Error Handler', () => {
    it('should chain authentication error to error handler', async () => {
      app.use(authenticateToken);

      app.get('/protected', requireAuth, (_req, res) => {
        res.json({ message: 'Success' });
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/protected');

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('AUTH_REQUIRED');
      // requireAuth sends direct response, not passed through error handler
      expect(response.body).toHaveProperty('message');
    });

    it('should handle error thrown in protected route', async () => {
      app.use(authenticateToken);

      const testUserId = 'test-user-123';
      const token = jwtUtils.signToken(testUserId);

      app.get('/protected', requireAuth, (_req, _res, next) => {
        next(new AppError(403, 'PERMISSION_DENIED', 'You do not have access'));
      });

      app.use(errorHandler);

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('PERMISSION_DENIED');
    });
  });
});
