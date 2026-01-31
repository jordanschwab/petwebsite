import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PetForm from '../../components/PetForm';

// Mock the API
jest.mock('../../services/api', () => ({
  default: {},
  createPet: jest.fn(),
  getMe: jest.fn(),
  logout: jest.fn(),
}));

describe('PetForm', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    mockSubmit.mockClear();
  });

  it('should render form fields', () => {
    render(<PetForm onSubmit={mockSubmit} />);
    
    expect(screen.getByLabelText(/pet name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/species/i)).toBeInTheDocument();
  });

  it('should render submit button', () => {
    render(<PetForm onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /save|submit|create/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should call onSubmit with form data when submitted', async () => {
    const user = userEvent.setup();
    render(<PetForm onSubmit={mockSubmit} />);
    
    const nameInput = screen.getByLabelText(/pet name/i);
    const speciesSelect = screen.getByLabelText(/species/i);
    
    await user.type(nameInput, 'Fluffy');
    await user.selectOptions(speciesSelect, 'cat');
    
    const submitButton = screen.getByRole('button', { name: /save|submit|create/i });
    await user.click(submitButton);
    
    expect(mockSubmit).toHaveBeenCalled();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    render(<PetForm onSubmit={mockSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /save|submit|create/i });
    await user.click(submitButton);
    
    // Form validation should prevent submission
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('should handle species selection', async () => {
    const user = userEvent.setup();
    render(<PetForm onSubmit={mockSubmit} />);
    
    const speciesSelect = screen.getByLabelText(/species/i);
    await user.selectOptions(speciesSelect, 'dog');
    
    expect(speciesSelect).toHaveValue('dog');
  });
});
