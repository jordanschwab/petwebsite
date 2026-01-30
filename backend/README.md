# Backend API

Express.js REST API server for the Pet Management Platform.

## Quick Start

### Prerequisites

- Node.js 18+ LTS
- PostgreSQL 15+ (running via Docker)
- Redis (running via Docker)

### Setup

```bash
# 1. From project root, start services
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Setup database
npx prisma migrate dev

# 4. Seed sample data
npx prisma db seed

# 5. Start development server
npm run dev
```

**API Server**: http://localhost:3000

## Available Scripts

```bash
# Development
npm run dev         # Start with auto-reload (tsx watch)

# Database
npm run db:migrate  # Run migrations
npm run db:seed     # Seed sample data
npm run db:reset    # Reset database (WARNING: deletes all data)
npm run db:studio   # Open Prisma Studio GUI

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Auto-fix linting issues
npm run type-check  # Check TypeScript types
npm run format      # Format with Prettier

# Testing
npm run test        # Run all tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report

# Building
npm run build       # Compile TypeScript
npm start           # Run compiled version
```

## Environment Variables

Copy `.env.example` to `.env.local` and update values:

```
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
JWT_SECRET="..."
```

See `.env.example` for all available options.

## Project Structure

```
src/
├── routes/         # API route definitions
├── controllers/    # Route handler logic
├── services/       # Business logic
├── middleware/     # Express middleware
├── auth/           # Authentication logic
├── types/          # TypeScript types
├── utils/          # Utility functions
└── server.ts       # Main Express app

prisma/
├── schema.prisma   # Database schema
└── seed.ts         # Seed data

tests/              # Test files

```

## Architecture

### Layers

1. **Routes**: Define HTTP endpoints and map to controllers
2. **Controllers**: Handle requests, call services, return responses
3. **Services**: Business logic, database operations
4. **Database**: Prisma ORM + PostgreSQL

### Key Technologies

- **Express**: HTTP server framework
- **Prisma**: Type-safe ORM and database
- **TypeScript**: Type safety
- **JWT**: Authentication tokens
- **Google OAuth**: Third-party authentication

## API Endpoints

See [`/design/API.yaml`](../design/API.yaml) for complete OpenAPI specification.

**Main Categories**:
- Authentication: `/auth/*`
- Users: `/users/*`
- Pets: `/pets/*`
- Health Records: `/pets/{id}/health-records/*`
- Photos: `/pets/{id}/photos/*`

## Testing

```bash
# Run all tests
npm run test

# Watch mode (re-run on file change)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Structure

- **Unit tests**: Business logic, validators
- **Integration tests**: API endpoints with database
- **Test utilities**: Test database setup, fixtures

## Security

- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Zod schema validation
- **Authorization**: Per-endpoint permission checks
- **CORS**: Cross-origin configuration
- **Helmet**: Security headers
- **Environment variables**: Sensitive data management

## Database

### Migrations

```bash
# Create new migration
npx prisma migrate dev --name describe_change

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

### Viewing Data

```bash
# Open Prisma Studio GUI
npm run db:studio
```

## Performance

- Database indexes on frequently queried columns
- Pagination for list endpoints
- Query optimization with Prisma
- Caching with Redis (future)

## Logging

Structured JSON logs with context:
- Request ID for tracing
- User ID for auditing
- Performance metrics
- Error stack traces (development only)

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Connection Failed

```bash
# Check services running
docker-compose ps

# Restart services
docker-compose restart
```

### Prisma Client Not Found

```bash
npm install
npx prisma generate
```

## Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: your feature"`
3. Format code: `npm run format`
4. Run tests: `npm run test`
5. Push branch: `git push origin feature/your-feature`
6. Open pull request

### Code Style

- ESLint for linting
- Prettier for formatting
- TypeScript strict mode
- JSDoc for complex functions

## Links

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express Guide](https://expressjs.com)
- [OpenAPI Specification](../design/API.yaml)
- [Development Guide](../DEVELOPMENT.md)
