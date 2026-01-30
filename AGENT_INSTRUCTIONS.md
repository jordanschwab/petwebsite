# Agent & Developer Instructions

This document provides guidance for all agents and developers working on the Pet Management Platform. Follow these conventions to maintain code quality and consistency across the project.

---

## Quick Reference

- **Main Branch**: `master` - Always production-ready
- **Test Command**: `npm run test` (123+ tests expected)
- **Type Check**: `npm run type-check` (0 errors expected)
- **Lint**: `npm run lint` (0 errors, warnings acceptable)
- **Backend Dir**: `backend/`
- **Frontend Dir**: `frontend/`

---

## Git Workflow

### Commit Message Format

Use conventional commits:
```
type(scope): description

Optional detailed explanation

Fixes #123
```

**Types**: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`
**Scopes**: `auth`, `middleware`, `oauth`, `pets`, `validation`, `plan`

**Examples**:
```
feat(auth): implement JWT token verification
fix(middleware): resolve error handler ordering
test(oauth): add token validation tests
docs(plan): update implementation progress
```

### Before Every Commit

1. Run `npm run type-check` in backend (0 errors required)
2. Run `npm run lint` in backend (0 errors required)
3. Run `npm run test` in backend (all tests must pass)
4. Verify `git status` is clean or ready to commit
5. Use descriptive commit messages with context

---

## Code Organization

### Backend Structure
```
backend/
├── src/
│   ├── auth/               # OAuth utilities (google.ts)
│   ├── middleware/         # Express middleware (auth.ts, errorHandler.ts)
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   ├── routes/             # API routes
│   ├── utils/              # Utilities (jwt.ts, validation.ts, logger.ts, errors.ts)
│   ├── types/              # TypeScript interfaces
│   └── server.ts           # Express app setup
├── tests/                  # Test files mirror src structure
├── prisma/                 # Database schema and migrations
└── package.json
```

### Naming Conventions
- **Files**: `camelCase.ts` (e.g., `authService.ts`, `petValidator.ts`)
- **Directories**: `lowercase` (e.g., `middleware/`, `services/`)
- **Classes**: `PascalCase` (e.g., `AppError`, `AuthService`)
- **Functions**: `camelCase` (e.g., `verifyToken()`, `validateEmail()`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `JWT_EXPIRATION`, `MAX_PET_NAME_LENGTH`)
- **Test Files**: `descriptive.test.ts` (e.g., `middleware.auth.test.ts`, `utils.jwt.test.ts`)

---

## Authentication Patterns

### Middleware Ordering (in Express)

Always maintain this order in `server.ts`:
```typescript
// 1. Security headers
app.use(helmet());

// 2. CORS setup
app.use(cors(corsOptions));

// 3. Body parsers
app.use(express.json());

// 4. Optional authentication (doesn't block if missing)
app.use(authenticateToken);

// 5. Health check (before routes)
app.get('/health', ...);

// 6. API routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);

// 7. 404 handler (before error handler)
app.use(notFoundHandler);

// 8. Error handler (last middleware)
app.use(errorHandler);
```

### Protected Routes Pattern

```typescript
// Optional auth (continues if no token)
router.get('/pets', authenticateToken, getPets);

// Required auth (401 if missing token)
router.post('/pets', requireAuth, createPet);

// Authorization check (403 if user doesn't own resource)
router.patch('/pets/:id', requireAuth, requireResourceOwnership('userId'), updatePet);
```

### Error Handling Pattern

Always throw `AppError` with appropriate status code:

```typescript
import { AppError } from '../utils/errors';

// In service or controller
if (!user) {
  throw new AppError('User not found', 404, 'USER_NOT_FOUND');
}

if (user.id !== requestUserId) {
  throw new AppError('Forbidden', 403, 'FORBIDDEN');
}
```

---

## Testing Conventions

### Test File Organization

Each `test.ts` file should have this structure:
```typescript
import { describe, it, expect } from '@jest/globals';
import { functionToTest } from '../src/path/file';

describe('Feature Name', () => {
  describe('Function Name', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionToTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      // Test edge case
    });
  });
});
```

### Test Coverage Goals

- **Utilities** (jwt.ts, validation.ts): 85%+ coverage
- **Middleware**: 90%+ coverage
- **Services**: 80%+ coverage
- **Routes/Controllers**: 70%+ coverage

### Running Tests

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- --testPathPattern="middleware"

# Run with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

---

## TypeScript Strict Mode

All TypeScript code must pass `strict` mode:

```bash
npm run type-check
```

**Requirements**:
- All functions have return types
- All parameters are typed
- No `any` types without comment explaining why
- Explicit type definitions for complex objects

**Good**:
```typescript
interface UserProfile {
  sub: string;
  email: string;
  name: string;
}

async function verifyToken(token: string): Promise<UserProfile> {
  // implementation
}
```

**Avoid**:
```typescript
async function verifyToken(token: any): any {
  // missing types
}
```

---

## Code Quality Standards

### ESLint Configuration

```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues
```

**Rules**:
- No console statements (except intentional logging)
- No unused imports
- No unused variables
- Maximum line length: 120 characters

**Exception**: `console.log()` in development can be enabled, but should be removed in commits.

### Formatting

```bash
npm run format      # Format all src files with Prettier
```

---

## Logging Standards

Use the provided logger utility:

```typescript
import { createLogger } from '../utils/logger';

const logger = createLogger('ModuleName');

logger.info('Operation successful', { userId: '123', action: 'create' });
logger.warn('Unusual condition', { value: 'unexpected' });
logger.error('Operation failed', { error: err.message });
logger.debug('Debug info', { state: 'intermediate' });
```

**Never use** `console.log()` in production code.

---

## Database Patterns

### Prisma Migrations

After schema changes:
```bash
npx prisma migrate dev --name descriptive_name
```

**Naming**: `add_user_oauth_fields`, `create_audit_table`, `update_pet_indexes`

### Query Patterns

```typescript
// Always include userId for authorization checks
const pet = await db.pet.findUnique({
  where: { id: petId },
});

// Verify ownership in service layer
if (pet.userId !== requestUserId) {
  throw new AppError('Forbidden', 403, 'FORBIDDEN');
}
```

---

## API Response Format

All responses should follow this pattern:

**Success Response**:
```json
{
  "data": { "id": "123", "name": "Fluffy" },
  "message": "Pet created successfully",
  "timestamp": "2026-01-31T21:00:00Z"
}
```

**Error Response**:
```json
{
  "error": "Bad Request",
  "message": "Pet name is required",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "timestamp": "2026-01-31T21:00:00Z",
  "path": "/api/pets",
  "method": "POST"
}
```

---

## Week Progression

### Week 1 Status: ✅ COMPLETE
- ✅ 123 tests passing
- ✅ All middleware implemented
- ✅ JWT utilities ready
- ✅ OAuth utilities created

**Files**: See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md#L1)

### Week 2: Authentication Implementation
**Tasks**:
1. OAuth Routes: POST /auth/google, POST /auth/logout, GET /auth/me
2. Token Storage: Secure httpOnly cookies
3. Frontend: Google Sign-In button, Auth context, Protected routes

**When to start Week 2**: After Week 1 testing checklist is ✅

### Week 3: Pet Management CRUD
**Tasks**:
1. Create Pet endpoint and form
2. List/view pets with pagination
3. Edit/delete with authorization checks

### Week 4: Testing, Polish & Release
**Tasks**:
1. Comprehensive test coverage (80%+)
2. Bug fixes and UI/UX polish
3. Documentation and deployment prep

---

## Common Patterns

### Creating a New Endpoint

1. Create route handler in `routes/api.ts`
2. Create controller function in `controllers/`
3. Create service function in `services/`
4. Add TypeScript interfaces in `types/index.ts`
5. Write tests in `tests/feature.test.ts`
6. Update middleware chain in `server.ts` if needed

### Adding Validation

```typescript
import { validateEmail, validatePetName } from '../utils/validation';

// In service/controller
const email = validateEmail(user.email);
if (!email) {
  throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
}
```

### Error Scenarios

Always test:
- Missing required fields (400)
- Invalid authorization (401)
- Insufficient permissions (403)
- Resource not found (404)
- Server errors (500)
- Edge cases (empty strings, null, undefined)

---

## Performance Considerations

1. **Database Queries**: Add indexes for frequently filtered columns
2. **JWT Tokens**: Keep 24h expiration, use refresh tokens for extension
3. **Logging**: Log important operations but not every parameter
4. **Error Messages**: Be specific but don't expose sensitive data

---

## Security Reminders

1. **Never log passwords or tokens** - only reference their ID
2. **Always verify ownership** - check userId matches authenticated user
3. **Validate input** - use validation utilities before processing
4. **Use httpOnly cookies** - for token storage in browser
5. **Environment variables** - never commit `.env` files

---

## Troubleshooting

### Tests Failing
```bash
npm run test:coverage     # Check coverage
npm run test -- --testNamePattern="specific"  # Run specific test
npm run test:watch       # Debug with watch mode
```

### TypeScript Errors
```bash
npm run type-check       # See all type errors
npm run lint:fix         # Auto-fix some issues
```

### Port Already in Use
```bash
# Kill process using port 3000
lsof -i :3000 | awk 'NR>1 {print $2}' | xargs kill -9
```

---

## References

- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) - Project phases and tasks
- [DEVELOPMENT.md](DEVELOPMENT.md) - Local setup instructions
- [Prisma Schema](backend/prisma/schema.prisma) - Database structure
- [Authentication Middleware](backend/src/middleware/auth.ts) - Auth patterns
- [Error Handling](backend/src/middleware/errorHandler.ts) - Error patterns

---

**Last Updated**: January 31, 2026  
**Applicable**: Week 1 ✅ → Week 2+ 📋  
**Status**: Agent-Ready ✓
