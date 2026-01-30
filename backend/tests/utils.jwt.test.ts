import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as jwtUtils from '../utils/jwt';
import jwt from 'jsonwebtoken';

describe('JWT Utilities', () => {
  const testUserId = 'test-user-123';
  const testEmail = 'test@example.com';
  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production-min-32-chars';

  describe('signToken', () => {
    it('should create a valid JWT token', () => {
      const token = jwtUtils.signToken(testUserId);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should include userId in token payload', () => {
      const token = jwtUtils.signToken(testUserId);
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(testUserId);
    });

    it('should include email in token payload when provided', () => {
      const token = jwtUtils.signToken(testUserId, testEmail);
      const decoded = jwt.decode(token) as any;
      expect(decoded.email).toBe(testEmail);
    });

    it('should not include email in token payload when not provided', () => {
      const token = jwtUtils.signToken(testUserId);
      const decoded = jwt.decode(token) as any;
      expect(decoded.email).toBeUndefined();
    });

    it('should throw error if userId is empty', () => {
      expect(() => {
        jwtUtils.signToken('');
      }).toThrow();
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = jwtUtils.signToken(testUserId, testEmail);
      const payload = jwtUtils.verifyToken(token);
      expect(payload.userId).toBe(testUserId);
      expect(payload.email).toBe(testEmail);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      expect(() => {
        jwtUtils.verifyToken(invalidToken);
      }).toThrow('Invalid token');
    });

    it('should throw error for expired token', () => {
      // Create a token that expires immediately
      const expiredToken = jwt.sign({ userId: testUserId }, jwtSecret, { expiresIn: '-1s' });
      
      // Wait a moment to ensure expiration
      expect(() => {
        jwtUtils.verifyToken(expiredToken);
      }).toThrow('Token has expired');
    });

    it('should throw error for tampered token', () => {
      const token = jwtUtils.signToken(testUserId);
      const tampered = token.slice(0, -5) + 'xxxxx';
      expect(() => {
        jwtUtils.verifyToken(tampered);
      }).toThrow('Invalid token');
    });

    it('should return TokenPayload with correct structure', () => {
      const token = jwtUtils.signToken(testUserId, testEmail);
      const payload = jwtUtils.verifyToken(token);
      expect(payload).toHaveProperty('userId');
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('iat');
      expect(payload).toHaveProperty('exp');
    });
  });

  describe('signRefreshToken', () => {
    it('should create a valid refresh token', () => {
      const token = jwtUtils.signRefreshToken(testUserId);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should allow verification with verifyToken', () => {
      const refreshToken = jwtUtils.signRefreshToken(testUserId);
      const payload = jwtUtils.verifyToken(refreshToken);
      expect(payload.userId).toBe(testUserId);
    });

    it('should have longer expiration than access token', () => {
      const accessToken = jwtUtils.signToken(testUserId);
      const refreshToken = jwtUtils.signRefreshToken(testUserId);
      
      const accessDecoded = jwt.decode(accessToken) as any;
      const refreshDecoded = jwt.decode(refreshToken) as any;
      
      expect(refreshDecoded.exp - refreshDecoded.iat).toBeGreaterThan(
        accessDecoded.exp - accessDecoded.iat
      );
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token and payload', () => {
      const refreshToken = jwtUtils.signRefreshToken(testUserId);
      const result = jwtUtils.refreshAccessToken(refreshToken);
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('payload');
      expect(typeof result.accessToken).toBe('string');
      expect(result.payload.userId).toBe(testUserId);
    });

    it('should create valid new access token', () => {
      const refreshToken = jwtUtils.signRefreshToken(testUserId);
      const result = jwtUtils.refreshAccessToken(refreshToken);
      
      const payload = jwtUtils.verifyToken(result.accessToken);
      expect(payload.userId).toBe(testUserId);
    });

    it('should throw error with invalid refresh token', () => {
      expect(() => {
        jwtUtils.refreshAccessToken('invalid.token');
      }).toThrow();
    });

    it('should throw error with expired refresh token', () => {
      const expiredRefreshToken = jwt.sign(
        { userId: testUserId },
        jwtSecret,
        { expiresIn: '-1s' }
      );
      
      expect(() => {
        jwtUtils.refreshAccessToken(expiredRefreshToken);
      }).toThrow();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid Authorization header', () => {
      const token = jwtUtils.signToken(testUserId);
      const authHeader = `Bearer ${token}`;
      const extracted = jwtUtils.extractTokenFromHeader(authHeader);
      expect(extracted).toBe(token);
    });

    it('should return null for missing Authorization header', () => {
      const extracted = jwtUtils.extractTokenFromHeader(undefined);
      expect(extracted).toBeNull();
    });

    it('should return null for empty Authorization header', () => {
      const extracted = jwtUtils.extractTokenFromHeader('');
      expect(extracted).toBeNull();
    });

    it('should return null for invalid Authorization header format', () => {
      const extracted = jwtUtils.extractTokenFromHeader('InvalidFormat token');
      expect(extracted).toBeNull();
    });

    it('should return null for header without Bearer prefix', () => {
      const token = jwtUtils.signToken(testUserId);
      const authHeader = `Token ${token}`;
      const extracted = jwtUtils.extractTokenFromHeader(authHeader);
      expect(extracted).toBeNull();
    });

    it('should return null for header with only Bearer prefix', () => {
      const extracted = jwtUtils.extractTokenFromHeader('Bearer');
      expect(extracted).toBeNull();
    });
  });

  describe('Integration tests', () => {
    it('should complete full token lifecycle', () => {
      // 1. Sign a token
      const accessToken = jwtUtils.signToken(testUserId, testEmail);
      expect(accessToken).toBeTruthy();

      // 2. Extract from header
      const header = `Bearer ${accessToken}`;
      const extracted = jwtUtils.extractTokenFromHeader(header);
      expect(extracted).toBe(accessToken);

      // 3. Verify token
      const payload = jwtUtils.verifyToken(extracted!);
      expect(payload.userId).toBe(testUserId);
      expect(payload.email).toBe(testEmail);
    });

    it('should handle token refresh cycle', () => {
      // 1. Create initial tokens
      const accessToken1 = jwtUtils.signToken(testUserId);
      const refreshToken = jwtUtils.signRefreshToken(testUserId);

      // 2. Verify first access token
      const payload1 = jwtUtils.verifyToken(accessToken1);
      expect(payload1.userId).toBe(testUserId);

      // 3. Refresh to get new access token
      const { accessToken: accessToken2 } = jwtUtils.refreshAccessToken(refreshToken);
      expect(accessToken2).toBeTruthy();
      expect(accessToken2).not.toBe(accessToken1);

      // 4. Verify new access token
      const payload2 = jwtUtils.verifyToken(accessToken2);
      expect(payload2.userId).toBe(testUserId);
    });
  });
});
