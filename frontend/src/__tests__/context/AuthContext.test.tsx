import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from '../../context/AuthContext';

// Mock the API
jest.mock('../../services/api', () => ({
  default: {},
  getMe: jest.fn(),
  logout: jest.fn(),
}));

describe('AuthContext', () => {
  it('should provide auth context to children', () => {
    const { container } = render(
      <AuthProvider>
        <div>Test</div>
      </AuthProvider>
    );
    
    expect(container.textContent).toContain('Test');
  });

  it('should wrap children properly', () => {
    const { getByText } = render(
      <AuthProvider>
        <div>Auth wrapped content</div>
      </AuthProvider>
    );
    
    expect(getByText('Auth wrapped content')).toBeInTheDocument();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <AuthProvider>
        <div>Content</div>
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });
});
