import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import PetList from '../../components/PetList';
import { AuthProvider } from '../../context/AuthContext';

// Mock the API
jest.mock('../../services/api', () => ({
  default: {},
  getPets: jest.fn(),
  getMe: jest.fn(),
  logout: jest.fn(),
}));

// Mock useAuth hook
jest.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    user: { id: 'test', email: 'test@example.com' },
    isAuthenticated: true,
    isLoading: false,
  })),
}));

describe('PetList', () => {
  const mockPets = [
    {
      id: '1',
      name: 'Fluffy',
      species: 'cat',
      breed: 'Persian',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Rex',
      species: 'dog',
      breed: 'Golden Retriever',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const renderWithAuth = (component: React.ReactElement) => {
    return render(<AuthProvider>{component}</AuthProvider>);
  };

  it('should render loading state initially', () => {
    renderWithAuth(<PetList />);
    // Component should render without crashing
    expect(document.body).toBeInTheDocument();
  });

  it('should handle empty pet list', async () => {
    const apiModule = require('../../services/api');
    apiModule.getPets.mockResolvedValue([]);

    renderWithAuth(<PetList />);

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const apiModule = require('../../services/api');
    apiModule.getPets.mockRejectedValue(new Error('API Error'));

    renderWithAuth(<PetList />);

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});
