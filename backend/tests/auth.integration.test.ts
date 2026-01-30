import request from 'supertest';
import app from '../src/server.js';

// Mock Google verification and Prisma client to avoid external dependencies
jest.mock('../src/auth/google.js', () => ({
  verifyGoogleToken: jest.fn(async (_token: string) => ({
    sub: 'google-123',
    email: 'test@example.com',
    name: 'Test User',
    email_verified: true,
  })),
}));

// Mock Prisma client
const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  googleId: 'google-123',
  displayName: 'Test User',
  profilePictureUrl: null,
};

jest.mock('@prisma/client', () => {
  const m = {
    PrismaClient: function () {
      return {
        user: {
          findUnique: jest.fn(async (_opts: any) => {
            if (_opts.where.googleId === 'google-123' || _opts.where.email === 'test@example.com' || _opts.where.id === 'user-1') return mockUser;
            return null;
          }),
          update: jest.fn(async (_opts: any) => ({ ...mockUser })),
          create: jest.fn(async (_opts: any) => ({ ...mockUser })),
        },
      };
    },
  };
  return m;
});

describe('Auth Integration', () => {
  it('POST /api/auth/google should login and return accessToken', async () => {
    const res = await request(app)
      .post('/api/auth/google')
      .send({ idToken: 'fake-id-token' })
      .expect(200);

    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  it('GET /api/auth/me should require auth and return user when provided', async () => {
    // First login to get accessToken
    const login = await request(app).post('/api/auth/google').send({ idToken: 'fake-id-token' }).expect(200);
    const accessToken = login.body.data.accessToken as string;

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(res.body.data.user.email).toBe('test@example.com');
  });

  it('POST /api/auth/logout should clear cookie and return message', async () => {
    const res = await request(app).post('/api/auth/logout').expect(200);
    expect(res.body.message).toMatch(/Logged out/i);
  });
});
