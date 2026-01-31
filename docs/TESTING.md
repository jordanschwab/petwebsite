# Testing Guide - Pet Management Platform MVP

## Overview

This guide covers manual testing procedures for Phase 1 MVP. Automated test suites are configured; manual testing validates full user workflows.

## Test Environment Setup

### Prerequisites
- Backend running: `npm run dev` in `/backend` (port 3000)
- Frontend running: `npm run dev` in `/frontend` (port 5173)
- Docker services: `docker-compose up -d` (PostgreSQL, Redis)
- Google OAuth credentials configured in `.env.local`

### Test Data
- Backend seeds test data on startup: `npx prisma db seed`
- Database can be reset: `npx prisma migrate reset`

---

## Manual E2E Test Scenarios

### Scenario 1: User Authentication Flow

**Setup**: Fresh browser session (no cache)

**Steps**:
1. Open http://localhost:5173
2. Should see landing page with "Pet Manager" title
3. Click Google Login button
4. Authorize app with Google account
5. Should redirect to dashboard automatically
6. Dashboard shows user display name
7. Verify page refresh maintains login state
8. Click "Sign Out" button
9. Should redirect to landing page
10. Refresh page - should still be on landing (logged out)

**Success Criteria**:
- ✅ OAuth flow completes without errors
- ✅ Token stored in localStorage
- ✅ Session persists across refreshes
- ✅ Logout clears session completely
- ✅ No console errors

---

### Scenario 2: Create Pet

**Setup**: Logged in, on dashboard

**Steps**:
1. Click "+ Add Pet" button
2. Verify form renders with all fields
3. Try submitting empty form → should show validation error
4. Fill in required fields (name="Fluffy", species="cat")
5. Leave optional fields empty
6. Click "Create Pet"
7. Should redirect to pet detail page
8. Verify pet data displays correctly
9. Try searching for pet on dashboard → should find it

**Test Data**:
- Name: "Fluffy"
- Species: "cat"
- Breed: "Persian" (optional)
- Birth Date: 2022-01-15 (optional)
- Weight: 4.5 kg (optional)

**Success Criteria**:
- ✅ Form validation works
- ✅ Pet created with user ownership
- ✅ Detail page shows all entered data
- ✅ Pet appears in list immediately
- ✅ No console errors

---

### Scenario 3: View Pets List

**Setup**: Logged in with 3+ pets

**Steps**:
1. Navigate to dashboard
2. Verify pet grid displays
3. Each pet shows: photo/icon, name, species, breed, age
4. Hover over pet card → shadow effect
5. Click pet card → detail page loads
6. Test pagination (if 20+ pets):
   - Click "Next" → loads next page
   - Click "Previous" → loads previous page
7. Test search:
   - Type pet name in search → filters results
   - Try partial name match → should work
8. Test species filter:
   - Select species → list filtered
   - Search + filter together → both work
9. Clear filters → all pets show again

**Success Criteria**:
- ✅ Pet list loads with correct data
- ✅ Search filters in real-time
- ✅ Species filter works
- ✅ Pagination navigates correctly
- ✅ Combined filters work together
- ✅ UI is responsive on mobile

---

### Scenario 4: View Pet Details

**Setup**: Logged in, viewing pet detail page

**Steps**:
1. Navigate to pet detail page
2. Verify all fields display:
   - Photo/icon
   - Name, species, breed
   - Birth date and calculated age
   - Weight, color, microchip ID
   - Notes
   - Created/updated timestamps
3. Verify edit and delete buttons present
4. Click "← Back to Dashboard" → returns to list
5. Test age calculation for various birth dates

**Test Cases**:
- Pet born 2022-01-15 → should show age (1-2 years)
- Pet born last month → should show months
- Pet with no birth date → "Unknown"

**Success Criteria**:
- ✅ All fields display correctly
- ✅ Age calculates properly
- ✅ Navigation works
- ✅ Date formatting is readable
- ✅ No layout issues on mobile

---

### Scenario 5: Edit Pet

**Setup**: On pet detail page

**Steps**:
1. Click "Edit" button
2. Form pre-populates with current data
3. Change pet name: "Fluffy" → "Fluffy Jr."
4. Change species: "cat" → "dog"
5. Add notes: "Very friendly"
6. Try submitting with invalid birth date (future) → error
7. Fix birth date (past)
8. Click "Update Pet"
9. Should save and return to detail view
10. Verify updated data displays
11. Refresh page → data persists
12. Dashboard list shows updated name

**Success Criteria**:
- ✅ Form pre-populates correctly
- ✅ Validation prevents invalid data
- ✅ Changes save successfully
- ✅ Detail page updates
- ✅ List updates immediately
- ✅ Data persists across refreshes

---

### Scenario 6: Delete Pet

**Setup**: On pet detail page

**Steps**:
1. Click "Delete" button
2. Confirmation modal appears
3. Modal shows: "Delete [PetName]?"
4. Modal has "Cancel" and "Delete" buttons
5. Click "Cancel" → modal closes, pet still visible
6. Click "Delete" again
7. Click "Delete" in modal → redirects to dashboard
8. Pet no longer in list
9. Try accessing deleted pet URL directly → 404 error or list view

**Success Criteria**:
- ✅ Delete confirmation prevents accidents
- ✅ Pet removed from list
- ✅ Navigation works after delete
- ✅ Deleted data no longer accessible
- ✅ User gets feedback (redirect)

---

### Scenario 7: Token Refresh

**Setup**: Logged in, pet detail page open

**Steps**:
1. Open browser DevTools → Network tab
2. Open browser console
3. Wait for or manually trigger access token expiration (24 hours or modify JWT)
4. Attempt any action (search, navigate, edit)
5. Observe Network tab:
   - First request fails with 401
   - Automatic retry request succeeds
   - No user-visible interruption
6. Verify action completes successfully
7. New token in localStorage

**Success Criteria**:
- ✅ Token refresh happens automatically
- ✅ No redirect to login needed
- ✅ Action completes successfully
- ✅ User sees no interruption
- ✅ New token stored

---

### Scenario 8: Error Handling

**Test Cases**:

#### 8a: Network Error
1. Disable network or throttle connection
2. Try to create/search pets
3. Error message displays: "Failed to load pets"
4. Can retry operation
5. Re-enable network → works

#### 8b: Auth Error
1. Clear localStorage accessToken
2. Try to navigate to dashboard
3. Redirects to login
4. Login again works

#### 8c: Server Error
1. Stop backend server
2. Try to create pet
3. Error message displays
4. Restart backend
5. Can retry successfully

**Success Criteria**:
- ✅ All errors display user-friendly messages
- ✅ No cryptic error codes
- ✅ UI remains responsive
- ✅ Can retry operations
- ✅ Recovery workflow is clear

---

### Scenario 9: Responsive Design

**Test on Devices/Viewports**:

#### Mobile (375px - iPhone SE):
- [ ] Login button centered and tappable
- [ ] Pet form fields full-width
- [ ] Pet grid shows 1 column
- [ ] Search/filter controls stack vertically
- [ ] Buttons have minimum 44px height
- [ ] No horizontal scrolling

#### Tablet (768px - iPad):
- [ ] Pet grid shows 2-3 columns
- [ ] Search/filter controls on one row
- [ ] Form remains readable
- [ ] All text is accessible

#### Desktop (1024px+):
- [ ] Pet grid shows 3-4 columns
- [ ] Optimal use of space
- [ ] No overflow or layout issues

**Success Criteria**:
- ✅ Responsive on all breakpoints
- ✅ Touch targets minimum 44x44px
- ✅ Text readable without zoom
- ✅ Images scale appropriately

---

## Testing Checklist

### Pre-Release (Week 4)

- [ ] **Authentication**
  - [ ] Google OAuth login works
  - [ ] Session persists across refresh
  - [ ] Logout clears session
  - [ ] Token refresh works automatically

- [ ] **Pet CRUD**
  - [ ] Create pet works with validation
  - [ ] View pet list with search/filter
  - [ ] View pet details
  - [ ] Edit pet updates correctly
  - [ ] Delete pet with confirmation

- [ ] **Error Handling**
  - [ ] Network errors handled gracefully
  - [ ] Auth errors redirect to login
  - [ ] Server errors show user messages
  - [ ] Validation errors display properly

- [ ] **Responsive Design**
  - [ ] Mobile (375px) - fully functional
  - [ ] Tablet (768px) - optimized layout
  - [ ] Desktop (1024px+) - uses full space

- [ ] **Performance**
  - [ ] Pet list loads in <2 seconds with 50+ pets
  - [ ] Search responds <500ms
  - [ ] Create/edit/delete complete in <3 seconds
  - [ ] No memory leaks on long sessions

- [ ] **Code Quality**
  - [ ] TypeScript: 0 errors
  - [ ] ESLint: 0 errors
  - [ ] Console: no errors/warnings
  - [ ] Network: no failed requests

---

## Known Issues / Workarounds

(None documented yet - add as discovered)

---

## Deployment QA Checklist

Before deploying to production:

- [ ] Fresh install from `.env.example` works
- [ ] All test scenarios pass
- [ ] Database migrations work
- [ ] No hardcoded URLs or credentials
- [ ] Error messages appropriate for users
- [ ] Analytics/monitoring configured
- [ ] Backups tested

---

## Contact / Issues

For issues during testing, check:
1. Browser console for errors
2. Backend logs: `docker-compose logs backend`
3. Database logs: `docker-compose logs postgres`
4. Network tab for failed requests

---

**Last Updated**: January 31, 2026  
**Phase**: 1 (MVP)  
**Version**: 0.1.0
