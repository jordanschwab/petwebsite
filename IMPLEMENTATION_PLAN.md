# Implementation Action Plan - Phase 1 (MVP)

## Overview

This document outlines the concrete, executable steps needed to implement the Pet Management Platform MVP (Phase 1) over 4 weeks.

**Duration**: Weeks 1-4  
**Goal**: Deploy working authentication and basic pet management  
**Team Size**: 1-2 developers

---

## Week 1: Foundation & Project Setup

### Days 1-2: Repository & Environment Setup

**Deliverables**: 
- ✅ Project repositories initialized
- ✅ Docker services running locally
- ✅ All developers can run application

**Tasks**:

1. **Backend Setup** (2 hours)
   - [ ] Copy `.env.example` to `.env.local`
   - [ ] Update Google OAuth credentials
   - [ ] Run `npm install` in backend directory
   - [ ] Run `docker-compose up -d`
   - [ ] Run `npx prisma migrate dev`
   - [ ] Run `npx prisma db seed`
   - [ ] Verify `npm run dev` starts on port 3000
   - [ ] Verify health endpoint: `curl http://localhost:3000/health`

2. **Frontend Setup** (1.5 hours)
   - [ ] Copy `.env.example` to `.env.local`
   - [ ] Update `VITE_GOOGLE_CLIENT_ID`
   - [ ] Run `npm install` in frontend directory
   - [ ] Verify `npm run dev` starts on port 5173
   - [ ] Verify TypeScript compilation: `npm run type-check`

3. **Git Repository** (1 hour)
   - [ ] Initialize Git repository
   - [ ] Create `.gitignore` (already created ✅)
   - [ ] Setup branch protection rules (optional)
   - [ ] Verify commits work

4. **Documentation** (1 hour)
   - [ ] Review DEVELOPMENT.md
   - [ ] Ensure all team members have Google OAuth credentials
   - [ ] Create shared setup checklist

### Days 3-5: Database & Authentication Foundation

**Deliverables**:
- ✅ Prisma schema finalized
- ✅ Database migrations working
- ✅ Backend authentication middleware ready
- ✅ JWT utilities implemented

**Tasks**:

1. **Prisma Schema Validation** (3 hours)
   - [ ] Review `prisma/schema.prisma`
   - [ ] Verify all relationships are correct
   - [ ] Check indexes are on right columns
   - [ ] Run migrations: `npx prisma migrate dev`
   - [ ] Open Prisma Studio to verify: `npm run db:studio`
   - [ ] Test seed data is created correctly

2. **JWT & Auth Utilities** (4 hours)
   - [ ] Create `src/utils/jwt.ts`:
     - [ ] `signToken(userId: string)` - Creates JWT
     - [ ] `verifyToken(token: string)` - Validates JWT
     - [ ] `refreshToken(token: string)` - Token refresh logic
   - [ ] Create `src/utils/validation.ts`:
     - [ ] User email validation
     - [ ] Pet name validation
     - [ ] Other common validators
   - [ ] Write unit tests for JWT utilities
   - [ ] Write unit tests for validators

3. **Authentication Middleware** (3 hours)
   - [ ] Create `src/middleware/auth.ts`:
     - [ ] `authenticateToken()` - Verify JWT middleware
     - [ ] `requireAuth()` - Express middleware for protected routes
   - [ ] Create `src/middleware/errorHandler.ts`:
     - [ ] Global error handler
     - [ ] Error response formatting
     - [ ] Logging errors
   - [ ] Apply middleware to Express app
   - [ ] Write integration tests

4. **Google OAuth Configuration** (2 hours)
   - [ ] Create `src/auth/google.ts`:
     - [ ] OAuth client initialization
     - [ ] ID token verification function
     - [ ] User profile extraction
   - [ ] Write tests for OAuth verification

**Testing Checklist**:
- [ ] All new functions have unit tests
- [ ] Test coverage > 80% for utilities
- [ ] No TypeScript errors: `npm run type-check`
- [ ] Linting passes: `npm run lint`

---

## Week 2: Authentication Implementation

### Days 1-3: Google OAuth Flow

**Deliverables**:
- ✅ Backend auth endpoints working
- ✅ Frontend can initiate Google login
- ✅ User profile created in database
- ✅ JWT tokens generated and stored

**Backend Tasks**:

1. **OAuth Routes** (4 hours)
   - [ ] Create `src/routes/auth.ts`:
     ```
     POST /auth/google
     POST /auth/logout
     GET /auth/me
     ```
   - [ ] Create `src/controllers/authController.ts`:
     - [ ] `googleLogin()` - Handle OAuth callback
     - [ ] `logout()` - Clear session
     - [ ] `getCurrentUser()` - Return auth user
   - [ ] Create `src/services/authService.ts`:
     - [ ] `verifyGoogleToken()`
     - [ ] `createOrUpdateUser()`
     - [ ] `generateAuthTokens()`
   - [ ] Create User record in database if new
   - [ ] Return JWT in response

2. **Token Storage** (2 hours)
   - [ ] Implement secure httpOnly cookie storage
   - [ ] Set cookie domain and path correctly
   - [ ] Add CORS cookie support
   - [ ] Test cookie is sent with requests

3. **Testing** (3 hours)
   - [ ] Unit tests for auth service functions
   - [ ] Integration tests for auth endpoints
   - [ ] Test user creation flow
   - [ ] Test token generation
   - [ ] Aim for 85%+ coverage

**Frontend Tasks**:

1. **Google Login Flow** (3 hours)
   - [ ] Install Google Auth library: `npm install @react-oauth/google`
   - [ ] Create `src/components/LoginButton.tsx`:
     - [ ] Display "Login with Google" button
     - [ ] Handle authorization response
     - [ ] Send auth code to backend
   - [ ] Create landing page with login
   - [ ] Styling with Tailwind

2. **Auth Context** (3 hours)
   - [ ] Create `src/context/AuthContext.tsx`:
     - [ ] User state
     - [ ] isAuthenticated flag
     - [ ] Login/logout functions
   - [ ] Create `src/hooks/useAuth.ts`:
     - [ ] Custom hook to access auth state
   - [ ] Add Provider to App component

3. **Protected Routes** (2 hours)
   - [ ] Create `src/components/ProtectedRoute.tsx`:
     - [ ] Check authentication
     - [ ] Redirect to login if not authenticated
   - [ ] Wrap dashboard routes with ProtectedRoute
   - [ ] Test redirection works

### Days 4-5: Token Management & Session

**Tasks**:

1. **Token Refresh** (2 hours)
   - [ ] Backend: Implement refresh token endpoint
   - [ ] Backend: Refresh token logic
   - [ ] Frontend: Automatic token refresh on expiration
   - [ ] Frontend: Handle 401 responses globally

2. **Logout** (1 hour)
   - [ ] Clear cookies on backend
   - [ ] Clear auth state on frontend
   - [ ] Redirect to landing page
   - [ ] Clear any cached data

3. **Integration Testing** (2 hours)
   - [ ] E2E test: Complete login flow
   - [ ] E2E test: Logout
   - [ ] E2E test: Token expiration and refresh
   - [ ] Verify no console errors

**End of Week 2 Goal**: Users can login and logout successfully ✓

---

## Week 3: Pet Management - Core CRUD

### Days 1-2: Create Pet

**Deliverables**:
- ✅ Pet creation endpoint working
- ✅ Pet form component built
- ✅ Form validation complete
- ✅ Success feedback to user

**Backend Tasks** (3 hours):

1. **Create Pet Endpoint**
   - [ ] Route: `POST /pets`
   - [ ] Controller: `createPet()`
   - [ ] Service: `createPet()` with validation
   - [ ] Database: Save pet with userId
   - [ ] Response: Return created pet
   - [ ] Error handling: Validate required fields

2. **Audit Logging** (1 hour)
   - [ ] Log pet creation to audit table
   - [ ] Include user ID and timestamp

**Frontend Tasks** (4 hours):

1. **Pet Form Component**
   - [ ] Create `src/pages/CreatePet.tsx`
   - [ ] Form fields:
     - [ ] Name (required)
     - [ ] Species (dropdown)
     - [ ] Breed, birth date, weight, color, notes
   - [ ] Validation on submit
   - [ ] Error messages display
   - [ ] Loading state while submitting

2. **Form Styling**
   - [ ] Use Tailwind CSS
   - [ ] Responsive design
   - [ ] Accessible labels and inputs

### Days 3-4: List & View Pets

**Backend Tasks** (3 hours):

1. **List Pets Endpoint**
   - [ ] Route: `GET /pets`
   - [ ] Service: `getPets()` with pagination
   - [ ] Filter by user ID
   - [ ] Order by name (default)
   - [ ] Return paginated results

2. **Get Pet Detail**
   - [ ] Route: `GET /pets/:id`
   - [ ] Service: `getPet()` with authorization
   - [ ] Check pet belongs to user
   - [ ] Return full pet data

**Frontend Tasks** (5 hours):

1. **Dashboard/Pet List Page**
   - [ ] Create `src/pages/Dashboard.tsx`
   - [ ] Fetch pets with React Query
   - [ ] Display pet cards:
     - [ ] Name, species, breed, age
     - [ ] Clickable to view details
   - [ ] Loading state
   - [ ] Empty state if no pets
   - [ ] "Add Pet" button

2. **Pet Detail Page**
   - [ ] Create `src/pages/PetDetail.tsx`
   - [ ] Fetch pet data on load
   - [ ] Display all pet information
   - [ ] Edit and Delete buttons
   - [ ] Back button to list

3. **Search & Filter** (2 hours)
   - [ ] Add search input to dashboard
   - [ ] Filter by species dropdown
   - [ ] Real-time search (debounced)
   - [ ] Update pet list on filter change

### Day 5: Edit & Delete

**Backend Tasks** (2 hours):

1. **Update Pet**
   - [ ] Route: `PATCH /pets/:id`
   - [ ] Service: Validate ownership and update
   - [ ] Log changes to audit table

2. **Delete Pet** (Soft Delete)
   - [ ] Route: `DELETE /pets/:id`
   - [ ] Service: Set deletedAt timestamp
   - [ ] Log deletion

**Frontend Tasks** (3 hours):

1. **Edit Pet**
   - [ ] Create `src/pages/EditPet.tsx`
   - [ ] Pre-populate form with current data
   - [ ] Same validation as create
   - [ ] Submit updates
   - [ ] Success message and redirect

2. **Delete Confirmation**
   - [ ] Modal confirmation dialog
   - [ ] Clear warning message
   - [ ] Delete button only after confirmation

**End of Week 3 Goal**: Full pet CRUD working, users can create/view/edit/delete pets ✓

---

## Week 4: Testing, Polish & Deployment Ready

### Days 1-2: Comprehensive Testing

**Backend Testing** (6 hours):

1. **Unit Tests**
   - [ ] Auth utilities: 100% coverage
   - [ ] Pet validation: 100% coverage
   - [ ] Helper functions: 80%+ coverage

2. **Integration Tests**
   - [ ] Auth endpoints (login, logout, me)
   - [ ] Pet CRUD endpoints
   - [ ] Authorization checks
   - [ ] Pagination and filtering

3. **E2E Test Scenarios**
   - [ ] User signup and login
   - [ ] Create first pet
   - [ ] View pet list
   - [ ] Edit pet
   - [ ] Delete pet
   - [ ] Logout

**Frontend Testing** (4 hours):

1. **Component Tests**
   - [ ] LoginButton renders
   - [ ] Pet form validates
   - [ ] Pet list displays
   - [ ] Navigation works

2. **Integration Tests**
   - [ ] Login flow
   - [ ] Create pet flow
   - [ ] View pet list
   - [ ] Edit and delete

### Days 3-4: Bug Fixes & Polish

**Tasks**:

1. **Code Quality** (3 hours)
   - [ ] Run all tests: `npm run test`
   - [ ] Check types: `npm run type-check`
   - [ ] Lint: `npm run lint`
   - [ ] Format: `npm run format`
   - [ ] Fix all issues

2. **Error Handling** (2 hours)
   - [ ] Catch all API errors
   - [ ] Display user-friendly messages
   - [ ] Log errors with context
   - [ ] No unhandled rejections

3. **UI/UX Polish** (3 hours)
   - [ ] Loading states on all buttons
   - [ ] Success/error messages
   - [ ] Responsive design check (mobile, tablet, desktop)
   - [ ] Accessibility check (keyboard navigation)
   - [ ] Console clean (no errors/warnings)

4. **Documentation** (2 hours)
   - [ ] Update README files
   - [ ] Document API endpoints
   - [ ] Update environment variables guide
   - [ ] Create deployment checklist

### Day 5: Final QA & Release

**Pre-Release Checklist**:

- [ ] All tests passing (100%)
- [ ] Code coverage > 80%
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Documentation complete
- [ ] Security review passed (basic)
- [ ] Performance acceptable

**Manual Testing** (3 hours):

1. **Fresh Install Test**
   - [ ] Clone repo
   - [ ] Follow DEVELOPMENT.md
   - [ ] Setup works perfectly
   - [ ] No missing steps

2. **User Journey Test**
   - [ ] Login with Google works
   - [ ] Create pet works
   - [ ] View pets works
   - [ ] Edit pet works
   - [ ] Delete pet works
   - [ ] Logout works

3. **Edge Cases**
   - [ ] Long pet names
   - [ ] Special characters
   - [ ] Rapid clicking
   - [ ] Network slowness
   - [ ] Multiple tabs

**Deployment**:

- [ ] Final code review
- [ ] Merge to main branch
- [ ] Tag release v0.1.0
- [ ] Document deployment steps
- [ ] Verify on staging (if available)

---

## Development Workflow

### Daily Standup Topics
1. Blockers or issues
2. What was completed yesterday
3. What will be completed today
4. Help needed

### Code Review Checklist
- [ ] Tests written and passing
- [ ] Code follows style guide
- [ ] No console.log statements
- [ ] TypeScript strict mode
- [ ] Comments for complex logic

### Commit Message Format
```
type(scope): description

feat(auth): implement Google OAuth flow
fix(pets): resolve form validation bug
docs(readme): update setup instructions
test(auth): add OAuth token tests
```

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Google OAuth setup issues | Medium | High | Dedicated day for OAuth; test with real credentials early |
| Database migration problems | Low | High | Test migrations daily; keep backups |
| TypeScript type issues | Medium | Medium | Setup strict mode early; type-check frequently |
| Team stuck on setup | Medium | Medium | Comprehensive DEVELOPMENT.md; pair programming |

---

## Success Criteria

✅ **Week 1 Complete If**:
- All developers can run app locally
- Database is seeded with test data
- Backend compiles with no errors

✅ **Week 2 Complete If**:
- Users can login with Google
- JWT tokens working
- User stored in database

✅ **Week 3 Complete If**:
- Users can create pets
- Users can view their pets
- Users can edit and delete pets
- All CRUD operations work

✅ **Week 4 Complete If**:
- 80%+ test coverage
- All tests passing
- No critical bugs
- Documentation complete
- Ready to deploy MVP

---

## Post-MVP Phase 2 Planning

Once Phase 1 is complete, plan for Phase 2:

- [ ] Photo uploads
- [ ] Health records
- [ ] Pet sharing with family
- [ ] Appointment calendar
- [ ] Mobile app (React Native)

---

**Version**: 1.0  
**Status**: Ready to Start  
**Last Updated**: January 31, 2026  
**Estimated Team**: 1-2 developers  
**Estimated Hours**: 200-240 hours
