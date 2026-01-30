# Frontend UI

React + Vite + Tailwind CSS web application for Pet Management Platform.

## Quick Start

### Prerequisites

- Node.js 18+ LTS
- Backend running on http://localhost:3000

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local
# Update VITE_GOOGLE_CLIENT_ID if needed

# 3. Start development server
npm run dev
```

**Frontend**: http://localhost:5173

## Available Scripts

```bash
# Development
npm run dev         # Start Vite dev server with HMR

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Auto-fix linting issues
npm run type-check  # Check TypeScript types
npm run format      # Format with Prettier

# Building
npm run build       # Create optimized production build
npm run preview     # Preview production build locally
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Project Structure

```
src/
├── components/     # Reusable React components
├── pages/          # Page components (routes)
├── hooks/          # Custom React hooks
├── services/       # API client functions
├── types/          # TypeScript types
├── utils/          # Utility functions
├── styles/         # CSS files (Tailwind)
├── App.tsx         # Root component
└── main.tsx        # Entry point

public/             # Static assets
```

## Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **React Query**: Server state management
- **Axios**: HTTP client

## Key Features

### Routing

Routes defined in `App.tsx`:
- `/` - Landing page
- `/dashboard` - Pet list (authenticated)
- `/pets/:id` - Pet details
- `/pets/new` - Create pet
- `/pets/:id/edit` - Edit pet

### Authentication

- Google OAuth integration
- JWT token storage in httpOnly cookie
- Automatic token refresh
- Protected routes for authenticated users

### Components

*To be built in Phase 1*:
- Landing page
- Login flow
- Dashboard/pet list
- Pet form (create/edit)
- Pet detail view

### Styling

- Tailwind CSS for styling
- Responsive design (mobile-first)
- Dark mode support (optional)
- Consistent component patterns

## API Integration

API client in `src/services/api.ts`:

```typescript
import apiClient from '@/services/api';

// GET request
const { data } = await apiClient.get('/pets');

// POST request with auth header
const { data } = await apiClient.post('/pets', petData);

// PATCH request
const { data } = await apiClient.patch(`/pets/${id}`, updates);

// DELETE request
await apiClient.delete(`/pets/${id}`);
```

## Testing

*Test setup with Vitest + React Testing Library* (Phase 1):

```bash
npm run test        # Run tests
```

## Performance

- Code splitting for routes
- Image optimization (future)
- Production build optimized with Terser
- React Query caching
- Vite fast refresh for development

## Building for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run preview

# Output in dist/ directory
```

## Troubleshooting

### Port Already in Use

```bash
# Kill process using port 5173
lsof -i :5173
kill -9 <PID>
```

### API Connection Issues

- Check backend is running: `http://localhost:3000/health`
- Check `VITE_API_URL` in `.env.local`
- Check CORS configuration on backend

### Module Not Found

```bash
npm install
npm run type-check
```

## Contributing

1. Create feature branch
2. Make changes
3. Run: `npm run format && npm run lint:fix`
4. Check types: `npm run type-check`
5. Push and create PR

## Links

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Development Guide](../DEVELOPMENT.md)
