import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import { AuthProvider } from '../../context/AuthContext';

// Mock the API first
jest.mock('../../services/api', () => ({
  default: {},
  getMe: jest.fn(),
  logout: jest.fn(),
}));

// Mock the useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('ProtectedRoute', () => {
  const useAuth = require('../../hooks/useAuth').default;
  
  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <AuthProvider>{component}</AuthProvider>
      </BrowserRouter>
    );
  };

  const mockComponent = <div>Protected Content</div>;

  it('should render when ProtectedRoute component exists', () => {
    useAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    // ProtectedRoute should render without crashing
    expect(() => {
      renderWithRouter(<ProtectedRoute>{mockComponent}</ProtectedRoute>);
    }).not.toThrow();
  });

  it('should be a React component', () => {
    expect(ProtectedRoute).toBeDefined();
    expect(typeof ProtectedRoute).toBe('function');
  });
});
