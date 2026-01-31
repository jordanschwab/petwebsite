# Contributing Guide

## Development Workflow

### Branch Strategy

```
main/master          - Production-ready code
├── feature/*        - New features
├── bugfix/*         - Bug fixes
└── chore/*          - Maintenance
```

### Before Starting Work

1. Create a feature branch:
   ```bash
   git checkout -b feature/pet-photos
   git checkout -b bugfix/login-issue
   ```

2. Make your changes

3. Run verification before committing:
   ```bash
   # Backend
   cd backend
   npm run type-check    # 0 errors required
   npm run lint          # 0 errors required
   npm run test          # All tests must pass

   # Frontend
   cd frontend
   npm run type-check
   npm run lint
   ```

### Commit Message Format

Use conventional commits for clarity and automatic changelog generation:

```
type(scope): description

feat(auth): add refresh token rotation
fix(pets): handle species filter edge case
docs(readme): update setup instructions
test(api): add pet creation tests
chore(deps): upgrade react to 18.3
refactor(agent): improve error handling
```

#### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **test**: Adding or updating tests
- **chore**: Dependencies, tooling, non-code changes
- **refactor**: Code restructuring without feature changes

#### Scopes (Examples)
- `auth` - Authentication & OAuth
- `pets` - Pet management CRUD
- `api` - API endpoints
- `ui` - User interface
- `db` - Database & migrations
- `test` - Testing infrastructure
- `docs` - Documentation

### Pull Request Checklist

Before opening a PR, ensure:

- [ ] Branch is up-to-date with main
- [ ] Tests pass: `npm run test`
- [ ] Type checking passes: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] No console errors/warnings
- [ ] Tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow convention

### Example Workflow

```bash
# 1. Create feature branch
git checkout -b feature/pet-photos

# 2. Make changes
# ... edit files ...

# 3. Verify everything works
cd backend && npm run type-check && npm run lint && npm run test
cd ../frontend && npm run type-check && npm run lint

# 4. Commit changes
git add .
git commit -m "feat(pets): add photo upload functionality

- Upload handler for image files
- Image optimization with sharp
- Gallery UI component
- Validation tests for uploads"

# 5. Push and create PR
git push origin feature/pet-photos
# Then open PR on GitHub
```

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No `any` types (use `unknown` if necessary)
- All public functions/methods documented
- Proper error types (no generic `Error`)

### React/Frontend
- Functional components with hooks
- Proper React Hook dependencies (exhaustive-deps)
- Semantic HTML
- Accessible forms and interactions
- Type-safe props (no `any`)

### Express/Backend
- Proper error handling with AppError
- Input validation on all endpoints
- Authentication checks on protected routes
- Comprehensive logging
- Type-safe services

### Testing
- Unit tests for utilities and services
- Integration tests for API endpoints
- E2E scenarios for user flows
- Minimum 80% coverage on critical paths
- Descriptive test names and comments

## Code Style

### Formatting
Prettier is configured to automatically format code:

```bash
npm run lint:fix    # Format all files
```

### Naming Conventions
- **Files**: `camelCase.ts`, `PascalCase.tsx`
- **Folders**: `lowercase/`
- **Functions**: `camelCase()`
- **Classes**: `PascalCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types**: `PascalCase`

### Import Organization
```typescript
// 1. External dependencies
import React, { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'

// 2. Internal imports
import { apiClient } from '../services/api'
import { AuthContext } from '../context/AuthContext'

// 3. Types
import type { User, Pet } from '../types'
```

## Troubleshooting

### Tests Failing
```bash
# Reinstall dependencies
npm install

# Regenerate type files
npx prisma generate

# Clear cache
npm run test -- --clearCache
```

### Type Errors
```bash
npm run type-check    # See full errors
npm run lint:fix      # Attempt auto-fix
```

### Git Issues
```bash
# Revert last commit (keep changes)
git reset --soft HEAD~1

# Revert last commit (discard changes)
git reset --hard HEAD~1

# Update branch from main
git fetch origin
git rebase origin/main
```

## Documentation Standards

- Update README.md if user-facing changes
- Add comments for complex logic
- Document public APIs with JSDoc
- Keep CHANGELOG updated for releases
- Link related issues/PRs in commit messages

## Release Process

When ready for release:

1. Update version in package.json
2. Create release notes (what changed, why)
3. Tag release: `git tag -a v0.2.0 -m "Release v0.2.0"`
4. Push tags: `git push origin v0.2.0`
5. Follow deployment procedures in [DEPLOYMENT.md](DEPLOYMENT.md)

## Questions?

- Check [SETUP.md](SETUP.md) for setup issues
- Review [ARCHITECTURE.md](ARCHITECTURE.md) for technical questions
- Look at existing code for style examples
- Check git log for similar changes

---

**Status**: Phase 1 MVP Complete  
**Last Updated**: January 31, 2026
