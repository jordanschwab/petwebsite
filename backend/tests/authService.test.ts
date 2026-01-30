import { handleGoogleLogin, refreshAuthToken } from '../src/services/authService.js';

jest.mock('../src/auth/google.js', () => ({
  verifyGoogleToken: jest.fn(async () => ({
    sub: 'google-123',
    email: 'unit@example.com',
    name: 'Unit Test',
    email_verified: true,
  })),
}));

const mockUser = {
  id: 'user-1',
  email: 'unit@example.com',
  googleId: 'google-123',
  displayName: 'Unit Test',
  profilePictureUrl: null,
};

jest.mock('@prisma/client', () => {
  const m = {
    PrismaClient: function () {
      return {
        user: {
          findUnique: jest.fn(async (opts: any) => {
            if (opts.where.googleId === 'google-123' || opts.where.email === 'unit@example.com' || opts.where.id === 'user-1') return mockUser;
            return null;
          }),
          update: jest.fn(async (_opts: any) => ({ ...mockUser })),
          create: jest.fn(async (_opts: any) => ({ ...mockUser })),
        },
        refreshToken: {
          create: jest.fn(async (opts: any) => ({ id: 'rt-1', ...opts.data })),
          findUnique: jest.fn(async (opts: any) => ({ id: 'rt-1', token: opts.where.token, userId: 'user-1', expiresAt: new Date(Date.now() + 1000 * 60 * 60), revoked: false })),
          update: jest.fn(async (opts: any) => ({ id: opts.where.id, revoked: true })),
        },
      };
    },
  };
  return m;
});

describe('AuthService', () => {
  it('handleGoogleLogin creates user and returns tokens', async () => {
    const result = await handleGoogleLogin('fake-id');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.email).toBe('unit@example.com');
  });

  it('refreshAuthToken validates and rotates tokens', async () => {
    // Create a fake refresh token by calling handleGoogleLogin first
    const login = await handleGoogleLogin('fake-id');
    const refreshed = await refreshAuthToken(login.refreshToken);
    expect(refreshed).toHaveProperty('accessToken');
    expect(refreshed).toHaveProperty('refreshToken');
    expect(refreshed.user.email).toBe('unit@example.com');
  });
});
