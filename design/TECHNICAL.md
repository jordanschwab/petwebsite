# Pet Management Platform - Technical Design Document

## 📋 Overview

This document specifies the technical stack for the Pet Management Platform, focusing on free, open-source technologies that can be run locally for development and testing.

---

## 🏗️ Technology Stack

### Frontend

#### **React 18**
- **Version**: 18.2.0+
- **Purpose**: Modern UI framework with hooks and concurrent features
- **Why**: Industry standard, excellent documentation, large community
- **Cost**: Free (MIT license)
- **Local Setup**: npm/yarn/pnpm, no external dependencies required

#### **TypeScript**
- **Version**: 5.0+
- **Purpose**: Static type checking for JavaScript
- **Why**: Catch errors at compile time, better IDE support, improved maintainability
- **Cost**: Free (Apache 2.0 license)
- **Integration**: Compiles to JavaScript, full React support

#### **Vite**
- **Version**: 5.0+
- **Purpose**: Next-generation build tool and dev server
- **Why**: Lightning-fast dev server, instant HMR, optimized production builds
- **Cost**: Free (MIT license)
- **Benefits**: 
  - Development: ~100ms startup time
  - Native ES module support
  - Out-of-the-box TypeScript support

#### **Tailwind CSS**
- **Version**: 3.3+
- **Purpose**: Utility-first CSS framework
- **Why**: Rapid UI development, consistent design system, small bundle size
- **Cost**: Free (MIT license)
- **Setup**: PostCSS configuration, included with Vite

#### **React Router**
- **Version**: 6.x
- **Purpose**: Client-side routing and navigation
- **Why**: Modern API, excellent nested routing, built-in data loading
- **Cost**: Free (MIT license)
- **Key Features**:
  - Protected routes for authenticated pages
  - Route parameters for pet IDs
  - URL state management

#### **TanStack Query (React Query)**
- **Version**: 5.x
- **Purpose**: Server state management and data fetching
- **Why**: Automatic caching, background refetching, built-in loading/error states
- **Cost**: Free (MIT license)
- **Use Cases**:
  - Fetching pet lists
  - Handling API responses
  - Automatic cache invalidation

#### **Axios**
- **Version**: 1.5+
- **Purpose**: HTTP client for API requests
- **Why**: Simple API, interceptor support, built-in request/response transformation
- **Cost**: Free (MIT license)
- **Integration**: Integrated with React Query for data fetching

#### **Google OAuth2 Library**
- **Version**: google-auth-library-nodejs (for ID token verification)
- **Purpose**: Secure Google authentication
- **Why**: Secure, official Google library, handles token validation
- **Cost**: Free (Apache 2.0 license)
- **Local Testing**: Google OAuth works with localhost:3000

#### **State Management**
- **React Context + Hooks** (built-in)
  - User authentication state
  - Global app state
  - No external library needed
- **Alternative**: Zustand (free, if more complex state needed later)

#### **Development Tools**
```
ESLint 8.x          - Code quality analysis (free, MIT)
Prettier 3.x        - Code formatting (free, MIT)
@types/react        - Type definitions (free, MIT)
@types/node         - Type definitions (free, MIT)
```

---

### Backend

#### **Node.js + Express**
- **Version**: Node.js 18+ LTS, Express 4.18+
- **Purpose**: RESTful API server
- **Why**: JavaScript everywhere (same language as frontend), large ecosystem, excellent performance
- **Cost**: Free (MIT license for both)
- **Local Setup**: Download from nodejs.org, no external server required

#### **TypeScript**
- **Version**: 5.0+
- **Purpose**: Type-safe backend code
- **Benefits**: Catch errors at compile time, better IDE support, self-documenting code

#### **Prisma ORM**
- **Version**: 5.x
- **Purpose**: Database abstraction layer and query builder
- **Why**: 
  - Type-safe database access
  - Automatic migrations
  - Excellent developer experience
  - Query builder with great TypeScript support
- **Cost**: Free (Apache 2.0 license)
- **Features**:
  - Schema definition in `.prisma` file
  - Auto-generated typed client
  - Database migrations
  - Seed data management

#### **PostgreSQL**
- **Version**: 15+
- **Purpose**: Primary relational database
- **Why**: 
  - Powerful, standards-compliant SQL
  - Excellent for structured data (pets, users, health records)
  - Free and open-source
  - JSONB support for flexible fields
  - Runs perfectly locally via Docker
- **Cost**: Free (PostgreSQL License)
- **Local Setup**: Docker container (see Docker section)

#### **Redis** (Optional, for caching/sessions)
- **Version**: 7.0+
- **Purpose**: In-memory cache and session store
- **Why**: Fast, reduces database queries, session management
- **Cost**: Free (BSD license)
- **Local Setup**: Docker container
- **Use Cases**:
  - User session caching
  - Pet list caching (TTL-based)
  - Rate limiting counters

#### **Authentication & Security**
```
express-oauth20    - OAuth server middleware (free, MIT)
jsonwebtoken       - JWT creation and verification (free, MIT)
passport          - Authentication middleware (free, MIT)
passport-google-oauth20 - Google OAuth strategy (free, MIT)
bcrypt            - Password hashing (if needed later, free, MIT)
dotenv            - Environment variable management (free, BSD)
express-validator - Input validation (free, MIT)
cors              - Cross-origin resource sharing (free, MIT)
helmet            - Security headers (free, MIT)
```

#### **Database & Utilities**
```
pg                - PostgreSQL client (free, MIT)
@prisma/client    - Prisma client (free, Apache 2.0)
uuid              - UUID generation (free, MIT)
date-fns          - Date manipulation (free, MIT)
zod               - Schema validation (free, MIT)
```

#### **File Storage (Local Development)**
**Option 1: Local File System** (simplest for local dev)
```
multer            - Middleware for file uploads (free, MIT)
sharp             - Image optimization (free, Apache 2.0)
```

**Option 2: MinIO** (S3-compatible, local)
```
minio             - S3-compatible object storage (free, Apache 2.0)
```

For local development, we'll use **local filesystem with multer and sharp**. The backend serves uploaded images directly during development. This is simpler and requires no additional services.

#### **Development Tools**
```
nodemon           - Auto-restart on file changes (free, MIT)
jest              - Unit testing (free, MIT)
supertest         - HTTP assertion library (free, MIT)
@types/express    - Express type definitions (free, MIT)
ts-node           - TypeScript execution (free, MIT)
tsx               - TypeScript runtime (free, MIT)
```

---

### Database

#### **PostgreSQL 15+**
- **Setup**: Docker container (postgres:15-alpine)
- **Features**:
  - Relational schema for structured data
  - JSONB for flexible health records
  - Full-text search (future enhancement)
  - ACID compliance for data integrity

#### **Database Migrations**
- **Tool**: Prisma Migrate
- **Workflow**:
  1. Define schema in `schema.prisma`
  2. Run `prisma migrate dev`
  3. Automatic migration file generation
  4. Applied to local database
  5. Type-safe client regenerated

#### **Seed Data**
- **Tool**: Prisma Seed
- **File**: `prisma/seed.ts`
- **Usage**: `prisma db seed` for local data population

---

### DevOps & Local Development

#### **Docker & Docker Compose**
- **Version**: Docker 24+, Docker Compose 2.20+
- **Purpose**: Containerized local development environment
- **Cost**: Free (Docker Community Edition)
- **Services**:
  ```yaml
  # docker-compose.yml
  postgres:
    image: postgres:15-alpine
    ports: 5432:5432
    
  redis:
    image: redis:7-alpine
    ports: 6379:6379
  ```

**Benefits**:
- One-command setup: `docker-compose up`
- Consistent environment across team
- Easy database reset
- No local PostgreSQL installation needed
- Data persisted between sessions

#### **Environment Management**
```
.env.local         - Local development variables (git-ignored)
.env.example       - Template for environment variables
.env.production    - Production configuration (for reference)
```

**Example .env.local**:
```
DATABASE_URL="postgresql://user:password@localhost:5432/pets_db"
REDIS_URL="redis://localhost:6379"
NODE_ENV="development"
JWT_SECRET="local-dev-secret-change-in-production"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FRONTEND_URL="http://localhost:5173"
API_PORT=3000
```

#### **Git & Version Control**
- **Tool**: Git (built-in)
- **Workflow**: Feature branches, pull requests
- **.gitignore**: Exclude node_modules, .env, uploads, etc.

---

### Testing

#### **Backend Testing**

**Jest**
- **Framework**: Unit and integration testing
- **Cost**: Free (MIT license)
- **Coverage Target**: 80%+

**Supertest**
- **Purpose**: HTTP assertion library
- **Integration**: Test Express endpoints without server startup
- **Cost**: Free (MIT license)

**Example Test Structure**:
```typescript
// tests/pets.test.ts
describe('Pet Endpoints', () => {
  it('should create a pet', async () => {
    const response = await request(app)
      .post('/api/pets')
      .set('Authorization', 'Bearer token')
      .send({ name: 'Fluffy', species: 'cat' });
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

#### **Frontend Testing**

**Vitest** (or Jest)
- **Framework**: Unit testing for React components
- **Cost**: Free (MIT license)

**React Testing Library**
- **Purpose**: Component testing following user behavior
- **Cost**: Free (MIT license)
- **Philosophy**: Test what users see, not implementation details

**Example**:
```typescript
// tests/PetForm.test.tsx
describe('PetForm', () => {
  it('should submit pet data', async () => {
    render(<PetForm onSubmit={mockSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Pet Name'), {
      target: { value: 'Fluffy' }
    });
    fireEvent.click(screen.getByText('Save Pet'));
    
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Fluffy' })
    );
  });
});
```

---

### Development Workflow

#### **Code Quality**

**ESLint**
- **Config**: `.eslintrc.json`
- **Rules**: Enforces best practices
- **Runs**: On save (IDE integration), pre-commit

**Prettier**
- **Config**: `.prettierrc`
- **Purpose**: Automatic code formatting
- **Runs**: On save, pre-commit

**TypeScript Compiler**
- **Strict Mode**: All type checking enabled
- **Output**: Compiled JavaScript in build directory

#### **Pre-commit Hooks**
```
husky              - Git hooks manager (free, MIT)
lint-staged        - Run linters on staged files (free, MIT)
```

**Hook Workflow**:
1. Developer commits code
2. Husky runs pre-commit hook
3. lint-staged runs linters on changed files
4. If errors: commit blocked with feedback
5. If success: commit proceeds

---

## 📦 Project Structure

```
claudewebsite/
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   ├── pages/                # Route pages
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # API clients
│   │   ├── types/                # TypeScript interfaces
│   │   ├── utils/                # Utility functions
│   │   ├── App.tsx               # Root component
│   │   └── main.tsx              # Entry point
│   ├── public/                   # Static assets
│   ├── vite.config.ts            # Vite configuration
│   ├── tsconfig.json             # TypeScript config
│   ├── tailwind.config.js        # Tailwind config
│   └── package.json
│
├── backend/                      # Express API
│   ├── src/
│   │   ├── routes/               # API endpoints
│   │   ├── controllers/          # Route handlers
│   │   ├── services/             # Business logic
│   │   ├── middleware/           # Express middleware
│   │   ├── types/                # TypeScript interfaces
│   │   ├── utils/                # Utility functions
│   │   ├── auth/                 # Authentication logic
│   │   └── app.ts                # Express app setup
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── migrations/           # Migration files
│   ├── tests/                    # Test files
│   ├── uploads/                  # Local file storage (git-ignored)
│   ├── .env.local                # Environment variables (git-ignored)
│   ├── tsconfig.json             # TypeScript config
│   ├── package.json              # Dependencies
│   └── docker-compose.yml        # Local services
│
├── design/                       # Documentation
│   ├── README.md                 # Design document
│   └── TECHNICAL.md              # This file
│
├── docs/                         # User documentation
├── tests/                        # E2E tests (future)
├── .gitignore                    # Git ignore rules
└── README.md                     # Project overview
```

---

## 🚀 Local Development Setup

### Prerequisites
- Git
- Node.js 18+ LTS
- Docker & Docker Compose
- Code editor (VS Code recommended)

### Quick Start

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/claudewebsite.git
   cd claudewebsite
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env.local
   # Configure .env.local with Google OAuth credentials
   ```

3. **Start Services**
   ```bash
   docker-compose up -d
   # Starts PostgreSQL and Redis
   ```

4. **Setup Database**
   ```bash
   npx prisma migrate dev
   # Creates tables and generates Prisma client
   npx prisma db seed
   # Populates sample data
   ```

5. **Start Backend**
   ```bash
   npm run dev
   # Backend running on http://localhost:3000
   ```

6. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   # Configure Google OAuth client ID
   ```

7. **Start Frontend**
   ```bash
   npm run dev
   # Frontend running on http://localhost:5173
   ```

8. **Access Application**
   - Open http://localhost:5173
   - Login with Google (local development credentials)

---

## 📊 API Response Format

### Standard Response
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Fluffy",
    ...
  },
  "meta": {
    "timestamp": "2024-01-31T10:00:00Z"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "PET_NOT_FOUND",
    "message": "Pet with ID 123 not found",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-31T10:00:00Z"
  }
}
```

---

## 🔐 Security Architecture

### Authentication Flow
```
1. Frontend redirects to Google OAuth
2. User authorizes application
3. Google returns authorization code
4. Backend exchanges code for ID token
5. Backend creates JWT token (24-hour expiration)
6. Frontend stores JWT in secure httpOnly cookie
7. Backend validates JWT on each request
```

### Request Validation
```
Frontend                          Backend
  ↓                                ↓
Zod schema validation      →  Express validator
TypeScript types           →  Type checking
UI error messages          →  Return errors
                           
                           Prisma validation
                               ↓
                           Database constraints
```

### CORS Configuration
```typescript
// Allow frontend only
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
})
```

---

## 📈 Performance Considerations

### Frontend Optimizations
- **Code Splitting**: Lazy load route components with React.lazy()
- **Image Optimization**: Serve optimized pet photos with next-gen formats
- **Caching**: React Query automatic caching and background refetching
- **Bundle Size**: Tree-shaking, minification in production build

### Backend Optimizations
- **Database Indexes**: On frequently queried columns (user_id, email)
- **Query Optimization**: Prisma select to fetch only needed fields
- **Caching**: Redis for session storage and frequently accessed data
- **Connection Pooling**: PostgreSQL connection pooling via Prisma

### Monitoring Targets
- Frontend: Lighthouse scores (aim for 90+)
- Backend: Response times < 200ms (p95)
- Database: Query times < 100ms (p95)

---

## 🧪 Testing Strategy

### Unit Tests
- **Backend**: Business logic, validators, utilities
- **Frontend**: Utility functions, hooks
- **Command**: `npm run test`

### Integration Tests
- **Backend**: API endpoints with database
- **Frontend**: Component integration, user flows
- **Command**: `npm run test:integration`

### E2E Tests (Phase 2)
- **Tool**: Playwright or Cypress (free)
- **Scope**: Complete user workflows
- **Command**: `npm run test:e2e`

### Running Tests
```bash
# All tests
npm run test

# Watch mode (re-run on file change)
npm run test:watch

# Coverage report
npm run test:coverage

# Specific test file
npm run test -- pets.test.ts
```

---

## 📝 Documentation

### Code Comments
```typescript
/**
 * Fetches all pets for the authenticated user
 * @param userId - The user's unique identifier
 * @returns Promise resolving to array of Pet objects
 * @throws {UnauthorizedError} If user is not authenticated
 */
async function getPetsByUser(userId: string): Promise<Pet[]> {
  // Implementation
}
```

### API Documentation
```bash
# Generate OpenAPI/Swagger docs
npm run docs:generate

# View at http://localhost:3000/api-docs
```

### README Files
- Root: Project overview
- `/frontend`: Frontend-specific setup
- `/backend`: Backend-specific setup
- `/design`: Design documents
- `/tests`: Testing guide

---

## 🔄 Development Workflow

### Branch Strategy (Git Flow)
```
main                 - Production-ready code
├── develop         - Integration branch
│   ├── feature/*   - New features
│   ├── bugfix/*    - Bug fixes
│   └── chore/*     - Maintenance
```

### Commit Message Format (Conventional Commits)
```
feat(pets): add photo upload functionality
fix(auth): resolve token expiration issue
docs(readme): update setup instructions
test(pets): add test for pet creation
chore(deps): upgrade react to 18.3
```

### Pull Request Checklist
- [ ] Tests pass (`npm run test`)
- [ ] Code formatted (`npm run lint:fix`)
- [ ] Types check (`npm run type-check`)
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

---

## 🎯 Technology Decision Rationale

| Technology | Why Chosen | Free | Local | Alternative |
|-----------|-----------|------|-------|-------------|
| React 18 | Industry standard, React Query built for it | ✓ | ✓ | Vue, Svelte |
| TypeScript | Type safety, catches errors early | ✓ | ✓ | JavaScript |
| Vite | Fast builds and HMR | ✓ | ✓ | Webpack, Parcel |
| Tailwind | Rapid UI development | ✓ | ✓ | Bootstrap, CSS-in-JS |
| Express | Lightweight, flexible, large ecosystem | ✓ | ✓ | Fastify, Koa |
| Prisma | Type-safe ORM, excellent DX | ✓ | ✓ | TypeORM, Sequelize |
| PostgreSQL | Powerful, standards-compliant | ✓ | ✓ | MySQL, MongoDB |
| Docker | Consistent local environment | ✓ | ✓ | Local installation |
| Jest | Comprehensive testing | ✓ | ✓ | Mocha, Vitest |

---

## 📋 Implementation Checklist

### Backend Setup
- [ ] Node.js project initialized with TypeScript
- [ ] Express app configured
- [ ] Docker Compose with PostgreSQL and Redis
- [ ] Prisma schema designed
- [ ] Database migrations created
- [ ] Google OAuth configured
- [ ] JWT token system implemented
- [ ] API routes established
- [ ] Error handling middleware
- [ ] Logging system
- [ ] Tests written (80%+ coverage)
- [ ] API documentation generated

### Frontend Setup
- [ ] React + Vite project created
- [ ] TypeScript configured
- [ ] Tailwind CSS integrated
- [ ] React Router configured
- [ ] React Query set up
- [ ] Google OAuth flow implemented
- [ ] API service layer created
- [ ] Main pages built
- [ ] Form components created
- [ ] Authentication guard implemented
- [ ] Tests written
- [ ] Build optimization completed

### DevOps
- [ ] Docker images created
- [ ] Docker Compose configured
- [ ] Environment variables documented
- [ ] .gitignore configured
- [ ] Pre-commit hooks set up
- [ ] CI/CD pipeline created (if needed)
- [ ] Database backup strategy planned

---

## 🔗 Useful Links & Resources

### Official Documentation
- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs
- Express: https://expressjs.com
- Prisma: https://www.prisma.io/docs
- PostgreSQL: https://www.postgresql.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Docker: https://docs.docker.com

### Online Tools
- Database Visualization: https://dbdiagram.io
- API Testing: https://www.postman.com
- JSON Formatter: https://jsoncrack.com

---

**Document Version**: 1.0  
**Last Updated**: January 31, 2026  
**Status**: Ready for Implementation  
**Tech Stack**: 100% Free & Locally Runnable
