# Copilot Instructions - Pet Management Platform

## Project Overview
Full-stack TypeScript application for pet management with Google OAuth, featuring a React/Vite frontend and Express/Prisma backend. The architecture uses a layered service pattern with comprehensive error handling and token-based authentication.

## Tech Stack
- **Backend**: Express.js, Prisma ORM (PostgreSQL), JWT auth, Google OAuth, Zod validation
- **Frontend**: React 18, Vite, TanStack Query, Tailwind CSS, React Router
- **Infrastructure**: Docker Compose (PostgreSQL + Redis), Jest testing
- **Dev Tools**: TypeScript, ESLint, Prettier

## Critical Architecture Patterns

### Middleware Ordering (server.ts)
Express middleware **must** follow this exact sequence:
```typescript
1. helmet()              // Security headers
2. cors()                // CORS config
3. express.json()        // Body parsing
4. cookieParser()        // Cookie parsing
5. authenticateToken     // Optional auth (sets req.user)
6. /health endpoint      // Health check
7. API routes            // /api/auth, /api/pets
8. notFoundHandler       // 404 before error handler
9. errorHandler          // Last middleware
```

### Authentication Flow
- `authenticateToken` middleware: Sets `req.user` if valid JWT, **continues** even without token
- `requireAuth` middleware: Throws 401 if `req.user` missing (use after `authenticateToken`)
- Protected routes pattern: `router.post('/pets', requireAuth, createPet)`
- Refresh tokens: Stored in PostgreSQL (`RefreshToken` model), rotated on use, never reused
- Cookie settings: `httpOnly: true`, `secure: true` (production), `sameSite: 'lax'` (dev), `'none'` (production)

### Error Handling
Always throw `AppError` from [backend/src/utils/errors.ts](backend/src/utils/errors.ts):
```typescript
throw new AppError('User not found', 404, 'USER_NOT_FOUND');
throw new AppError('Forbidden', 403, 'FORBIDDEN');
```
Never use generic `Error` - the `errorHandler` middleware formats AppError instances for consistent API responses.

### Database Patterns
- Prisma schema: [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
- Soft deletes: Use `deletedAt` field (never hard delete user data)
- Relations: `User -> Pet -> PetPhoto/PetHealthRecord`, cascade deletes on Pet
- Migrations: `npx prisma migrate dev --name <description>` (always name migrations)
- Testing: Mock `@prisma/client` entirely (see [backend/tests/authService.test.ts](backend/tests/authService.test.ts) for pattern)

### Environment Variables
- Backend uses `.env.local` (gitignored), Prisma requires copy at `.env`
- Frontend uses Vite env vars (`VITE_` prefix): `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`
- Never commit `.env.local` - use `.env.example` as template
- Backend loads `.env.local` first, falls back to `.env` ([server.ts](backend/src/server.ts) lines 16-20)

## Development Workflow

### Setup Commands
```bash
# Start infrastructure
docker-compose up -d          # PostgreSQL + Redis

# Backend setup
cd backend
cp .env.example .env.local && cp .env.local .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev                   # Runs on :3000

# Frontend setup  
cd frontend
cp .env.example .env.local
npm install
npm run dev                   # Runs on :5173
```

### Pre-Commit Verification
**ALL code changes must pass**:
```bash
npm run type-check    # 0 errors required
npm run lint          # 0 errors required (warnings OK)
npm run test          # All tests must pass (123+ tests)
```

### Git Commit Convention
Use conventional commits: `type(scope): description`
- **Types**: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
- **Scopes**: `auth`, `middleware`, `oauth`, `pets`, `validation`, `plan`, `agent`
- **Agent commits**: Use `agent` scope for AI-generated changes
- Example: `test(agent): add refresh token rotation tests`

### Automated Agent Policy
When making changes:
1. Run verification commands before committing
2. Stage only modified files
3. Use `agent` scope in commit message
4. Update `agent-output/IMPLEMENTATION_PLAN.md` after multi-file changes
5. **Never push automatically** - wait for human authorization

## Code Organization

### File Naming
- TypeScript files: `camelCase.ts` (e.g., `authService.ts`, `petController.ts`)
- Test files: `descriptive.test.ts` (e.g., `middleware.auth.test.ts`)
- React components: `PascalCase.tsx` (e.g., `LoginButton.tsx`)
- Directories: `lowercase` (e.g., `middleware/`, `services/`)

### Backend Structure
```
backend/src/
├── auth/            # OAuth utilities (google.ts)
├── controllers/     # Request handlers (petController.ts)
├── middleware/      # Express middleware (auth.ts, errorHandler.ts)
├── routes/          # API routes (auth.ts, pets.ts)
├── services/        # Business logic (authService.ts, petService.ts)
├── utils/           # Helpers (jwt.ts, validation.ts, logger.ts, errors.ts)
└── types/           # TypeScript interfaces
```
Tests mirror `src/` structure in [backend/tests/](backend/tests/)

### Frontend Structure
```
frontend/src/
├── components/      # Reusable UI (LoginButton.tsx, ProtectedRoute.tsx)
├── context/         # React Context (AuthContext.tsx)
├── hooks/           # Custom hooks (useAuth.ts)
├── pages/           # Route pages (Dashboard.tsx, Landing.tsx)
├── services/        # API client (api.ts - axios with interceptors)
└── types/           # TypeScript types
```

## Testing Patterns

### Mocking Prisma
Always mock the entire Prisma client:
```typescript
jest.mock('@prisma/client', () => ({
  PrismaClient: function () {
    return {
      user: { findUnique: jest.fn(), create: jest.fn() },
      refreshToken: { create: jest.fn(), update: jest.fn() },
    };
  },
}));
```

### Auth Testing
- Mock `google-auth-library` for OAuth tests
- Mock `jsonwebtoken` for token verification tests
- Use `supertest` for integration tests on Express routes

## Key Conventions

### Validation
- Use Zod schemas for request validation (defined in controllers)
- Custom validators in [utils/validation.ts](backend/src/utils/validation.ts): `isValidEmail()`, `isValidPetName()`, `isValidUUID()`
- Always validate user input before passing to services

### Logging
- Use structured logger from [utils/logger.ts](backend/src/utils/logger.ts): `createLogger('ComponentName')`
- Log levels: `debug` (dev), `info` (production), `warn`, `error`
- Include context objects: `logger.error('Auth failed', { userId, error })`

### TypeScript
- Strict mode enabled (`tsconfig.json`)
- Use interface for request types: `AuthenticatedRequest extends Request { user?: TokenPayload }`
- Export types from `types/index.ts` (backend) and `types/index.ts` (frontend)

## Common Pitfalls
1. **Middleware order**: Adding routes before `authenticateToken` breaks auth
2. **Prisma schema changes**: Run `npx prisma migrate dev` after editing schema
3. **Environment sync**: Backend needs `.env.local` AND `.env` (Prisma limitation)
4. **Cookie security**: `sameSite: 'none'` requires `secure: true` (HTTPS)
5. **Test mocks**: Must mock Prisma before importing service modules
6. **Refresh token rotation**: Always revoke old token when creating new one

## Documentation References
- [DEVELOPMENT.md](../DEVELOPMENT.md) - Full setup guide with troubleshooting
- [AGENT_INSTRUCTIONS.md](.github/AGENT_INSTRUCTIONS.md) - Detailed agent/developer conventions
- [design/API.yaml](../design/API.yaml) - REST API specification
- [design/TECHNICAL.md](../design/TECHNICAL.md) - Architecture decisions
