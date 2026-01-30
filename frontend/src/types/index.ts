// Type definitions for frontend

export interface User {
  id: string;
  email: string;
  displayName: string;
  profilePictureUrl?: string;
}

export interface Pet {
  id: string;
  userId: string;
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  weight?: number;
  colorDescription?: string;
  microchipId?: string;
  notes?: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PetPhoto {
  id: string;
  petId: string;
  photoUrl: string;
  isPrimary: boolean;
  uploadedAt: string;
}

export interface HealthRecord {
  id: string;
  petId: string;
  recordType: 'vaccination' | 'medication' | 'condition' | 'checkup';
  title: string;
  description?: string;
  recordedDate: string;
  expirationDate?: string;
}

export interface AuthContext {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string;
}
