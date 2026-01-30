# Pet Management Platform - Design Document

## 📋 Executive Summary

The Pet Management Platform is a web application that enables users to manage a personal database of pets. Users authenticate via Google OAuth, then can create, view, edit, and manage detailed pet profiles. The platform supports multiple pets per user with rich metadata and ownership tracking.

**Key Objective**: Provide a simple, intuitive interface for users to maintain comprehensive pet information.

---

## 🎯 Application Overview

### Purpose
- Allow users to securely authenticate via Google
- Maintain a personal pet registry with detailed information
- Track pet ownership and relationships
- Support collaborative pet management for families/groups

### Target Users
- Pet owners (individual consumers)
- Families managing multiple pets
- Pet care businesses
- Veterinary clinics for client records

### Success Metrics
- User registration completion rate > 80%
- Average session duration > 10 minutes
- Pet creation within first session
- Feature adoption rate > 60% for edit functionality

---

## ✨ Core Features

### 1. Authentication & User Management
- **Google OAuth Integration**
  - One-click login with Google credentials
  - Automatic user profile creation
  - Email verification via Google
  - Secure token management
  
- **User Profile**
  - Email address (from Google)
  - Display name (editable)
  - Profile picture (from Google)
  - Account creation date
  - Timezone preference

### 2. Pet Management
- **Create Pet**
  - Pet name (required)
  - Species (dog, cat, bird, etc.)
  - Breed
  - Birth date
  - Weight
  - Color/markings
  - Health notes
  - Photo upload
  - Microchip ID (optional)

- **View Pets**
  - List all user's pets
  - Pet cards with summary info
  - Search and filter capabilities
  - Sort by name, species, date added
  - Quick stats (total pets, by species)

- **Edit Pet**
  - Update any pet information
  - Add/remove photos
  - Update health notes
  - Change pet details
  - View edit history (timestamp + user)

- **Delete Pet**
  - Soft delete with archive
  - Restore from archive (30-day window)
  - Permanent deletion option
  - Audit trail of deletions

### 3. Pet Details & Metadata
- **Core Information**
  - Name, species, breed, birth date
  - Weight, color, distinguishing marks
  - Microchip ID, registration numbers

- **Health Information**
  - Vaccinations (type, date, expiration)
  - Medical conditions
  - Allergies
  - Current medications
  - Veterinarian contact info
  - Last checkup date

- **Behavioral Notes**
  - Personality traits
  - Training notes
  - Special needs
  - Behavior history

- **Media**
  - Multiple photos per pet
  - Primary profile picture
  - Photo gallery
  - Photo upload/management

### 4. Additional Features (Phase 2+)
- Pet sharing with family members
- Veterinary appointment calendar
- Medical record attachments
- Pet care reminders
- Breed information database
- Pet expense tracking
- Insurance information storage

---

## 🗄️ Database Schema

### Users Table
```
id (UUID, PK)
email (VARCHAR, UNIQUE)
google_id (VARCHAR, UNIQUE)
display_name (VARCHAR)
profile_picture_url (TEXT)
timezone (VARCHAR, default: UTC)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
deleted_at (TIMESTAMP, nullable)
```

### Pets Table
```
id (UUID, PK)
user_id (UUID, FK -> Users)
name (VARCHAR, NOT NULL)
species (VARCHAR, NOT NULL) [dog, cat, bird, rabbit, etc.]
breed (VARCHAR, nullable)
birth_date (DATE, nullable)
weight (DECIMAL, nullable) [in kg]
color_description (TEXT, nullable)
microchip_id (VARCHAR, nullable)
notes (TEXT, nullable)
profile_picture_url (TEXT, nullable)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
deleted_at (TIMESTAMP, nullable)
created_by (UUID, FK -> Users)
```

### Pet_Photos Table
```
id (UUID, PK)
pet_id (UUID, FK -> Pets)
photo_url (TEXT, NOT NULL)
photo_key (VARCHAR, unique storage identifier)
uploaded_at (TIMESTAMP)
uploaded_by (UUID, FK -> Users)
is_primary (BOOLEAN, default: false)
deleted_at (TIMESTAMP, nullable)
```

### Pet_Health_Records Table
```
id (UUID, PK)
pet_id (UUID, FK -> Pets)
record_type (VARCHAR) [vaccination, medication, condition, checkup]
title (VARCHAR)
description (TEXT)
recorded_date (DATE)
expiration_date (DATE, nullable)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
deleted_at (TIMESTAMP, nullable)
```

### Audit_Log Table
```
id (UUID, PK)
user_id (UUID, FK -> Users)
entity_type (VARCHAR) [User, Pet, Pet_Photo, Pet_Health]
entity_id (UUID)
action (VARCHAR) [CREATE, UPDATE, DELETE, VIEW]
changes (JSONB, contains before/after values)
timestamp (TIMESTAMP)
ip_address (VARCHAR, nullable)
```

---

## 🏗️ Architecture Overview

### Technology Stack

**Frontend**
- React 18+
- TypeScript
- Tailwind CSS
- React Query (data fetching)
- React Router (navigation)
- Google OAuth Library
- Axios (HTTP client)

**Backend**
- Node.js + Express OR Python + FastAPI
- PostgreSQL 13+
- Redis (sessions/caching)
- JWT for token management
- Passport.js or similar auth middleware

**Infrastructure**
- Docker & Docker Compose
- AWS or similar cloud provider
- CDN for static assets
- S3/Object storage for pet photos
- SSL/TLS encryption

### System Architecture

```
┌─────────────────────┐
│    Frontend (React) │
│  - Auth UI          │
│  - Pet Dashboard    │
│  - Pet Forms        │
│  - Photo Gallery    │
└──────────┬──────────┘
           │ HTTPS
    ┌──────▼──────┐
    │   API GW    │
    └──────┬──────┘
           │
    ┌──────▼─────────────────┐
    │   Backend Services     │
    │ - Auth Service         │
    │ - Pet Service          │
    │ - User Service         │
    │ - Photo Service        │
    └──────┬──────────────────┘
           │
    ┌──────▼──────────────┐
    │  Data Layer         │
    │ - PostgreSQL (DB)   │
    │ - Redis (Cache)     │
    │ - S3 (Photo Store)  │
    └─────────────────────┘
```

---

## 🔄 User Flows

### Flow 1: New User Registration & Login

```
1. User visits website
2. Clicks "Login with Google"
3. Redirected to Google OAuth consent
4. User authorizes application
5. Google redirects back with auth code
6. Backend exchanges code for tokens
7. Check if user exists in database
   - If NO: Create new user record
   - If YES: Update last login
8. Generate session JWT token
9. Redirect to dashboard
10. Dashboard displays "Welcome" + prompt to create first pet
```

### Flow 2: Create Pet

```
1. User clicks "Add New Pet" button
2. Form opens with pet input fields
3. User fills in pet information
4. User can upload pet photos
5. User clicks "Save Pet"
6. Frontend validates form data
7. API request sent to backend
8. Backend validates and saves to database
9. Backend returns new pet with ID
10. Frontend adds pet to list
11. Success message displayed
12. User redirected to pet detail view
```

### Flow 3: View Pet Details

```
1. User clicks on pet card in dashboard
2. Pet detail page loads
3. Displays all pet information
4. Shows photo gallery (if available)
5. Displays health records/notes
6. User can click "Edit" or "Delete"
```

### Flow 4: Edit Pet Information

```
1. User navigates to pet detail page
2. Clicks "Edit Pet" button
3. Form pre-populates with current data
4. User modifies any fields
5. User can upload new photos
6. User clicks "Save Changes"
7. Frontend validates updates
8. API sends PATCH request to backend
9. Backend updates database
10. Audit log entry created
11. Frontend updates display
12. Success message shown
```

### Flow 5: Delete Pet

```
1. User on pet detail page
2. Clicks "Delete Pet" button
3. Confirmation modal appears
4. User confirms deletion
5. Pet marked as deleted (soft delete)
6. Pet moved to archive
7. Dashboard refreshes
8. Success message shown
9. Option to "Undo" for 30 days
```

---

## 🎨 User Interface Design

### Key Pages

#### 1. Landing Page
- Welcome message
- Login button (Google OAuth)
- Brief feature overview
- Call-to-action

#### 2. Dashboard / Pet List
- Header with user profile dropdown
- "Add New Pet" button (prominent)
- Pet list in card format showing:
  - Pet photo (primary)
  - Pet name
  - Species icon
  - Quick info (age, breed)
  - Last updated timestamp
- Search and filter options
- Stats sidebar (total pets, by species)

#### 3. Pet Detail Page
- Pet profile section
  - Large pet photo
  - Basic info (name, species, breed, age)
  - Edit/Delete buttons
- Information tabs
  - Overview (basic details)
  - Health Records
  - Photos
  - Notes
- Photo gallery section
- Action buttons

#### 4. Pet Edit Form
- Form fields organized into sections
  - Basic Information
  - Physical Description
  - Health Information
  - Notes
- Photo upload area (drag & drop)
- Primary photo selector
- Save/Cancel buttons
- Unsaved changes warning

#### 5. User Profile Page
- User information display
- Profile picture (from Google)
- Edit display name option
- Timezone preference
- Account settings
- Logout button

### Responsive Design
- Mobile-first approach
- Breakpoints: 320px, 640px, 1024px, 1280px
- Touch-friendly buttons (48px minimum)
- Adaptive layouts for pet cards

---

## 🔐 Security Considerations

### Authentication
- Google OAuth 2.0 for secure authentication
- JWT tokens with 24-hour expiration
- Refresh tokens for session extension
- Secure cookie storage with HttpOnly flag
- CSRF token validation for state-changing operations

### Authorization
- User can only access their own pets
- Role-based access (expanded in phase 2)
- API endpoint authorization checks
- Audit logging of all data access

### Data Protection
- HTTPS/TLS encryption for all traffic
- Password hashing (N/A - using Google OAuth)
- SQL injection prevention (parameterized queries)
- XSS protection via input sanitization
- Rate limiting on API endpoints
- CORS policy configuration

### Privacy
- Explicit consent for data collection
- Privacy policy accessible
- Data retention policies
- GDPR compliance (data export/deletion)
- No third-party tracking (optional analytics)

---

## 📱 API Endpoints

### Authentication Endpoints
```
POST   /api/auth/google             # Google OAuth callback
POST   /api/auth/logout             # Logout user
GET    /api/auth/me                 # Get current user info
POST   /api/auth/refresh            # Refresh JWT token
```

### User Endpoints
```
GET    /api/users/profile           # Get user profile
PATCH  /api/users/profile           # Update user profile
DELETE /api/users/account           # Delete account
```

### Pet Endpoints
```
GET    /api/pets                    # List all user's pets
POST   /api/pets                    # Create new pet
GET    /api/pets/:id                # Get pet details
PATCH  /api/pets/:id                # Update pet
DELETE /api/pets/:id                # Delete pet (soft delete)
POST   /api/pets/:id/restore        # Restore deleted pet

GET    /api/pets/:id/photos         # List pet photos
POST   /api/pets/:id/photos         # Upload pet photo
DELETE /api/pets/:id/photos/:photoId # Delete pet photo
PATCH  /api/pets/:id/photos/:photoId/primary # Set primary photo

GET    /api/pets/:id/health-records # Get health records
POST   /api/pets/:id/health-records # Add health record
PATCH  /api/pets/:id/health-records/:recordId # Update record
DELETE /api/pets/:id/health-records/:recordId # Delete record
```

### Additional Endpoints
```
GET    /api/species                 # Get list of species options
GET    /api/breeds/:species         # Get breeds for species
```

---

## 📊 Database Indexes

```sql
-- Performance optimization indexes
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_pets_deleted_at ON pets(deleted_at);
CREATE INDEX idx_pet_photos_pet_id ON pet_photos(pet_id);
CREATE INDEX idx_pet_photos_deleted_at ON pet_photos(deleted_at);
CREATE INDEX idx_health_records_pet_id ON pet_health_records(pet_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_users_email ON users(email);
```

---

## 🚀 Implementation Phases

### Phase 1: MVP (Weeks 1-4)
- [x] Project setup and architecture
- [ ] Google OAuth integration
- [ ] User authentication and profiles
- [ ] Basic pet CRUD operations
- [ ] Simple UI (dashboard, pet form, pet detail)
- [ ] Database setup and migrations
- [ ] Basic error handling
- [ ] Unit tests for core functions

### Phase 2: Enhancement (Weeks 5-8)
- [ ] Photo upload and gallery
- [ ] Health records tracking
- [ ] Enhanced filtering/search
- [ ] Audit logging
- [ ] Soft delete with restore
- [ ] Image optimization
- [ ] Performance optimization
- [ ] Integration tests

### Phase 3: Polish & Features (Weeks 9-12)
- [ ] Pet sharing with family
- [ ] Appointment calendar
- [ ] Export functionality
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Offline support
- [ ] Advanced caching
- [ ] Load testing & optimization

### Phase 4: Production (Week 13+)
- [ ] Security audit
- [ ] Performance testing
- [ ] Deployment automation
- [ ] Monitoring setup
- [ ] Documentation completion
- [ ] User testing
- [ ] Bug fixes and refinement
- [ ] Production deployment

---

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| Page Load Time | < 2 seconds |
| API Response Time (p95) | < 200ms |
| Photo Upload | < 5 seconds (5MB file) |
| Dashboard Load | < 1 second (< 50 pets) |
| Search Performance | < 500ms (across 100+ pets) |
| Database Query Time | < 100ms (p95) |
| Uptime | 99.5% |

---

## 🧪 Testing Strategy

### Unit Tests
- User authentication logic
- Pet validation rules
- Permission checks
- Utility functions
- Target: 80%+ coverage

### Integration Tests
- OAuth flow
- Pet CRUD operations
- Photo upload/storage
- Database transactions
- API endpoint validation

### E2E Tests
- Complete user registration flow
- Pet creation and editing
- Photo management
- Search and filtering
- Deletion and restoration

### Performance Tests
- Load testing (100+ concurrent users)
- Stress testing (500+ concurrent users)
- Database query optimization
- Cache effectiveness

---

## 📝 Development Guidelines

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Commit messages follow Conventional Commits
- PR reviews required before merge

### Documentation
- API documentation (Swagger/OpenAPI)
- Code comments for complex logic
- README files in each major directory
- Architecture decision records (ADR)
- User documentation/help articles

### Deployment
- Docker containerization
- CI/CD pipeline (GitHub Actions/GitLab CI)
- Automated testing on every commit
- Staging environment for QA
- Blue-green deployment strategy
- Database migration strategy

---

## 🔮 Future Enhancements

- **Multi-user Sharing**: Invite family members to manage pets
- **AI Features**: Breed identification from photos
- **Mobile Apps**: Native iOS/Android applications
- **Integration**: Vet clinic data exchange
- **Marketplace**: Pet services marketplace
- **Community**: Pet social network features
- **IoT Integration**: Pet wearable device data
- **Advanced Analytics**: Pet health trends and insights

---

## 📊 Success Metrics & KPIs

### User Metrics
- Monthly Active Users (MAU)
- User retention rate (7-day, 30-day)
- Average session duration
- User engagement rate

### Feature Adoption
- Pet creation rate (% of users creating pets)
- Photo upload rate
- Health record usage
- Edit frequency

### Technical Metrics
- API error rate (target: < 0.1%)
- Page load time (p95: < 2s)
- Database query performance
- Server uptime

### Business Metrics
- Conversion rate (visitor to user)
- Daily Active Users (DAU)
- Feature adoption velocity
- User satisfaction (NPS score)

---

## 📞 Contact & Support

For questions about this design document, please contact the development team.

---

**Document Version**: 1.0  
**Last Updated**: January 31, 2026  
**Status**: Design Complete - Ready for Implementation
