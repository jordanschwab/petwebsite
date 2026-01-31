# Technical Architecture

## Technology Stack Overview

### Frontend
- **React 18** - UI framework with hooks
- **TypeScript** - Static type checking (strict mode)
- **Vite** - Build tool with fast HMR
- **Tailwind CSS** - Utility-first styling
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with interceptors
- **React Context** - State management

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express 4.x** - Web framework
- **TypeScript** - Type safety
- **Prisma 5.x** - ORM for database access
- **PostgreSQL 15** - Relational database
- **Redis 7** - Session cache
- **JWT** - Token-based authentication
- **Zod** - Runtime schema validation

### Development & Testing
- **Jest** - Unit and integration testing
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Docker** - Containerization

## Architecture Patterns

### Authentication Flow
```
Browser
  ↓ User clicks "Login with Google"
  ↓
Google OAuth Consent Screen
  ↓ User authorizes
  ↓
Frontend receives authorization code
  ↓
POST /api/auth/google (with code)
  ↓
Backend verifies with Google
  ↓ Valid? Generate JWT + Refresh token
  ↓
Response with JWT (header) + Refresh token (httpOnly cookie)
  ↓
Frontend stores JWT, automatic refresh on 401
```

### Request/Response Pattern

**Request Validation:**
```
Client → Zod schema validation → Route handler → Service layer → Database
```

**Response Format:**
```json
{
  "success": true,
  "data": { /* response payload */ },
  "meta": { "timestamp": "2026-01-31T..." }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "PET_NOT_FOUND",
    "message": "Pet with ID 123 not found",
    "details": {}
  },
  "meta": { "timestamp": "..." }
}
```

### Middleware Stack (Backend)

Order matters! Current stack in [backend/src/server.ts](../backend/src/server.ts):

1. **helmet()** - Security headers
2. **cors()** - CORS configuration
3. **express.json()** - Body parsing
4. **cookieParser()** - Cookie parsing
5. **authenticateToken** - Optional auth (sets req.user)
6. **/health endpoint** - Health check
7. **API routes** - /api/auth, /api/pets
8. **notFoundHandler** - 404 before error handler
9. **errorHandler** - Always last (formats errors)

### Error Handling

All errors use `AppError` class (see [backend/src/utils/errors.ts](../backend/src/utils/errors.ts)):

```typescript
throw new AppError('Pet not found', 404, 'PET_NOT_FOUND')
throw new AppError('Unauthorized', 401, 'AUTH_REQUIRED')
```

Benefits:
- Consistent error format
- Type-safe error codes
- Proper HTTP status codes
- User-friendly messages

### Database Schema

**Core Tables:**
- `User` - Google OAuth users
- `Pet` - User's pets
- `PetPhoto` - Pet images
- `PetHealthRecord` - Vaccination, medication records
- `RefreshToken` - Server-side token management

**Key Features:**
- Foreign keys enforce relationships
- Soft deletes via `deletedAt` field
- Automatic `createdAt`, `updatedAt` timestamps
- Cascade deletes on parent deletion

See [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) for full schema.

### State Management (Frontend)

**AuthContext** - Global user state
```typescript
type AuthContextType = {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
}
```

**API Service** - Centralized HTTP client
```typescript
// frontend/src/services/api.ts
- Auto-refreshes on 401
- Normalizes responses
- Type-safe error handling
```

**Local State** - React hooks
- Component state for forms
- URL state via React Router

### API Quick Reference

**Authentication:**
```
POST   /api/auth/google      # Login
GET    /api/auth/me           # Get current user
POST   /api/auth/logout       # Logout
```

**Pets (All require Authorization header):**
```
GET    /api/pets?page=1&limit=20&species=dog  # List pets
POST   /api/pets              # Create pet
GET    /api/pets/{petId}      # Get pet details
PATCH  /api/pets/{petId}      # Update pet
DELETE /api/pets/{petId}      # Delete pet
```

Full spec: See [design/API.yaml](../design/API.yaml)

## Project Structure

```
backend/
├── src/
│   ├── server.ts            # Express app setup
│   ├── routes/              # API route definitions
│   ├── controllers/         # Request handlers
│   ├── services/            # Business logic
│   ├── middleware/          # Auth, error handling
│   ├── auth/                # OAuth logic
│   ├── utils/               # JWT, validation, logging
│   └── types/               # TypeScript definitions
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Schema change history
├── tests/                   # Jest test files
└── package.json

frontend/
├── src/
│   ├── App.tsx              # Root component
│   ├── pages/               # Route pages
│   ├── components/          # Reusable UI components
│   ├── context/             # React Context (auth)
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API client
│   ├── types/               # TypeScript types
│   └── styles/              # Tailwind CSS
├── public/                  # Static assets
└── package.json
```

## Performance Considerations

### Frontend Optimization
- Code splitting via React.lazy()
- Lazy image loading
- React Query caching (future: TanStack Query)
- Tree-shaking in production build

### Backend Optimization
- Database query optimization (Prisma select)
- Connection pooling (Prisma)
- Caching with Redis (future)
- Request compression (Gzip)

### Targets
- Page load: <3 seconds
- API response: <200ms (p95)
- Database query: <100ms (p95)
- Lighthouse score: 90+

## Security Architecture

### Authentication
- Google OAuth 2.0 with ID token verification
- JWT with 24-hour expiration
- Refresh token rotation (old token revoked on new token)
- HttpOnly cookies prevent XSS

### Transport
- HTTPS enforced in production
- Security headers via Helmet.js
- CORS restricted to frontend origin

### Input Validation
- Zod schemas on all endpoints
- Client-side validation (React)
- No direct SQL queries (Prisma prevents injection)

### Data Protection
- Soft deletes preserve user data
- No sensitive data in logs
- Proper authorization checks
- Error messages don't leak internals

## Testing Strategy

### Backend (159+ tests)
- Unit tests: Utilities, validators, helpers
- Integration tests: Auth flows, pet CRUD
- Middleware tests: Error handling, auth guards

### Frontend (Manual E2E)
- 9 complete test scenarios
- User journey testing
- Error flow verification
- Responsive design validation

## Deployment Architecture

```
Production Environment:
  ┌─────────────────┐
  │   Users/Browser │
  └────────┬────────┘
           │
      ┌────▼──────┐
      │ Nginx/LB  │  (Reverse proxy, SSL)
      └────┬──────┘
           │
    ┌──────┴──────┐
    │             │
 ┌──▼───┐  ┌─────▼──┐
 │React │  │Express │ (Docker containers)
 │(SPA) │  │(API)   │
 └──────┘  └────┬───┘
               │
            ┌──▼──────┬────────┐
            │          │        │
         ┌──▼───┐  ┌──▼──┐  ┌─▼──┐
         │  DB  │  │Cache│  │... │ (Managed services)
         └──────┘  └─────┘  └────┘
```

## Key Files Reference

| File | Purpose |
|------|---------|
| [backend/src/server.ts](../backend/src/server.ts) | Express app setup, middleware |
| [backend/src/utils/errors.ts](../backend/src/utils/errors.ts) | Error handling pattern |
| [backend/src/utils/jwt.ts](../backend/src/utils/jwt.ts) | JWT creation/verification |
| [backend/prisma/schema.prisma](../backend/prisma/schema.prisma) | Database schema |
| [frontend/src/services/api.ts](../frontend/src/services/api.ts) | HTTP client |
| [frontend/src/context/AuthContext.tsx](../frontend/src/context/AuthContext.tsx) | Auth state |
| [design/API.yaml](../design/API.yaml) | API specification |

## Common Pitfalls & Solutions

### Issue: Middleware Order Wrong
**Problem**: Routes before `authenticateToken` breaks auth  
**Solution**: Always follow the middleware stack order above

### Issue: Prisma Client Error
**Problem**: Can't generate Prisma client  
**Solution**: Run `npx prisma generate` after schema changes

### Issue: React Hook Dependencies
**Problem**: ESLint warning about missing dependencies  
**Solution**: Include all used variables in dependency array

### Issue: CORS Errors
**Problem**: Frontend can't call backend  
**Solution**: Check `FRONTEND_URL` in backend .env.local

---

**Version**: Phase 1 MVP  
**Status**: Production Ready  
**Last Updated**: January 31, 2026
