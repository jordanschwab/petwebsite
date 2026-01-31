# Development Setup Guide

## Prerequisites

- **Node.js**: 18+ LTS (https://nodejs.org/)
- **Git**: Latest version
- **Docker**: 24+ with Docker Compose (https://www.docker.com/products/docker-desktop)

### Verify Installation

```bash
node --version      # Should be v18.x or higher
npm --version       # Should be 9.x or higher
docker --version    # Should be 24.x or higher
docker-compose --version  # Should be 2.20+ or v2.x
```

## Quick Start (5 minutes)

### 1. Start Database Services

```bash
# From project root
docker-compose up -d

# Verify services are running
docker-compose ps

# Output should show:
# NAME          STATUS
# pets_db       Up (healthy)
# pets_cache    Up (healthy)
```

### 2. Setup Backend

```bash
cd backend

# Copy environment file
cp .env.example .env.local

# Edit .env.local if needed (optional for local dev)
# Most defaults work for local development

# Install dependencies
npm install

# Setup database
npx prisma migrate dev --name init

# Seed sample data
npx prisma db seed

# Start backend server
npm run dev
```

**Backend should be running at**: http://localhost:3000

### 3. Setup Frontend (New Terminal)

```bash
cd frontend

# Copy environment file
cp .env.example .env.local

# Install dependencies
npm install

# Start development server
npm run dev
```

**Frontend should be running at**: http://localhost:5173

### 4. Test the Setup

- Open http://localhost:5173 in your browser
- You should see the frontend application
- Health check: http://localhost:3000/health should return `{"status":"ok"}`

## Database Management

### View Database

```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
```

### Reset Database

```bash
cd backend
npx prisma migrate reset
# This will:
# - Delete all data
# - Re-run all migrations
# - Reseed sample data
```

### Create New Migration

```bash
cd backend
npx prisma migrate dev --name describe_your_change
# Example: npx prisma migrate dev --name add_pet_age_field
```

## Common Commands

### Backend

```bash
cd backend

# Development
npm run dev         # Start with auto-reload

# Database
npm run db:migrate  # Run migrations
npm run db:seed     # Seed data
npm run db:reset    # Reset database

# Code quality
npm run lint        # Check code style
npm run lint:fix    # Auto-fix code style
npm run type-check  # Check TypeScript types
npm run format      # Auto-format code

# Testing
npm run test        # Run tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report

# Build
npm run build       # Compile TypeScript
npm start           # Run compiled version
```

### Frontend

```bash
cd frontend

# Development
npm run dev         # Start with Vite HMR

# Code quality
npm run lint        # Check code style
npm run lint:fix    # Auto-fix code style
npm run type-check  # Check TypeScript types
npm run format      # Auto-format code

# Build
npm run build       # Create optimized build
npm run preview     # Preview production build
```

### Docker

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs postgres    # DB logs
docker-compose logs redis       # Cache logs

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild images
docker-compose up --build
```

## Google OAuth Setup (Required for Login)

1. Go to https://console.cloud.google.com
2. Create a new project: "Pet Management Platform"
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins:
     - `http://localhost:5173`
   - Authorized redirect URIs:
     - `http://localhost:3000/auth/google/callback`
     - `http://localhost:5173/auth/callback`
5. Copy credentials and update:
   - **Backend** `.env.local`: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
   - **Frontend** `.env.local`: `VITE_GOOGLE_CLIENT_ID`

## Project Structure

```
claudewebsite/
├── backend/
│   ├── src/
│   │   ├── routes/        # API route definitions
│   │   ├── controllers/   # Route handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utilities
│   │   ├── auth/          # Auth logic
│   │   └── server.ts      # Express setup
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Seed data
│   ├── tests/             # Test files
│   ├── package.json
│   └── .env.local         # LOCAL ONLY - git-ignored
│
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API clients
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utilities
│   │   ├── styles/        # CSS files
│   │   ├── App.tsx        # Root component
│   │   └── main.tsx       # Entry point
│   ├── index.html
│   ├── package.json
│   └── .env.local         # LOCAL ONLY - git-ignored
│
└── docker-compose.yml     # Local services config
```

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**:
```bash
# Verify services are running
docker-compose ps

# Restart services
docker-compose restart

# Or recreate them
docker-compose down
docker-compose up -d
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:
```bash
# Find process using the port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill the process or use different port
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows

# Or change port in .env.local
API_PORT=3001
```

### Module Not Found

```
Error: Cannot find module '@prisma/client'
```

**Solution**:
```bash
cd backend
npm install
npx prisma generate
```

### Prisma Migration Issues

```bash
cd backend

# Reset to clean state
npx prisma migrate reset

# Or manually fix migrations
npx prisma migrate resolve --rolled-back <migration_name>
```

## Tips & Best Practices

1. **Always start with Docker**: `docker-compose up -d` before anything else
2. **Keep .env files local**: Never commit `.env.local` (it's in .gitignore)
3. **Use env.example as template**: Check `.env.example` for required variables
4. **Check logs**: Use `docker-compose logs` to debug issues
5. **Format before committing**: Run `npm run format` and `npm run lint:fix`
6. **Test locally**: Run tests before pushing: `npm run test`

## Performance Notes

- First `npm install` may take 2-3 minutes (normal)
- First `npx prisma migrate dev` takes longer (generating client)
- Subsequent runs are much faster

## Need Help?

- Check logs: `docker-compose logs`
- Reset everything: `docker-compose down -v && npm install && npm run db:migrate`
- Review `.env.example` files for configuration options
