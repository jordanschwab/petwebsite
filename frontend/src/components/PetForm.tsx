import { useState, FormEvent } from 'react';
import { Pet } from '@/types';

interface PetFormProps {
  initialData?: Pet;
  onSubmit: (petData: PetFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export interface PetFormData {
  name: string;
  species: string;
  breed?: string;
  birthDate?: string;
  weight?: number;
  colorDescription?: string;
  microchipId?: string;
  notes?: string;
}

const SPECIES_OPTIONS = [
  { value: 'dog', label: 'Dog' },
  { value: 'cat', label: 'Cat' },
  { value: 'bird', label: 'Bird' },
  { value: 'rabbit', label: 'Rabbit' },
  { value: 'hamster', label: 'Hamster' },
  { value: 'fish', label: 'Fish' },
  { value: 'other', label: 'Other' },
];

export default function PetForm({ initialData, onSubmit, onCancel, isLoading = false }: PetFormProps) {
  const [formData, setFormData] = useState<PetFormData>({
    name: initialData?.name || '',
    species: initialData?.species || 'dog',
    breed: initialData?.breed || '',
    birthDate: initialData?.birthDate ? initialData.birthDate.split('T')[0] : '',
    weight: initialData?.weight || undefined,
    colorDescription: initialData?.colorDescription || '',
    microchipId: initialData?.microchipId || '',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PetFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PetFormData, string>> = {};

    // Name is required
    if (!formData.name.trim()) {
      newErrors.name = 'Pet name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Pet name must be less than 100 characters';
    }

    // Birth date cannot be in the future
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birthDate > today) {
        newErrors.birthDate = 'Birth date cannot be in the future';
      }
    }

    // Weight must be positive
    if (formData.weight !== undefined && formData.weight <= 0) {
      newErrors.weight = 'Weight must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Remove empty optional fields
    const cleanedData: PetFormData = {
      name: formData.name,
      species: formData.species,
    };

    if (formData.breed?.trim()) cleanedData.breed = formData.breed.trim();
    if (formData.birthDate) cleanedData.birthDate = formData.birthDate;
    if (formData.weight && formData.weight > 0) cleanedData.weight = formData.weight;
    if (formData.colorDescription?.trim()) cleanedData.colorDescription = formData.colorDescription.trim();
    if (formData.microchipId?.trim()) cleanedData.microchipId = formData.microchipId.trim();
    if (formData.notes?.trim()) cleanedData.notes = formData.notes.trim();

    await onSubmit(cleanedData);
  };

  const handleChange = (field: keyof PetFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Pet Name - Required */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Pet Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., Fluffy"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      {/* Species - Required */}
      <div>
        <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-1">
          Species <span className="text-red-500">*</span>
        </label>
        <select
          id="species"
          value={formData.species}
          onChange={(e) => handleChange('species', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        >
          {SPECIES_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Breed - Optional */}
      <div>
        <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-1">
          Breed
        </label>
        <input
          id="breed"
          type="text"
          value={formData.breed}
          onChange={(e) => handleChange('breed', e.target.value)}
          placeholder="e.g., Golden Retriever"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Birth Date - Optional */}
      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
          Birth Date
        </label>
        <input
          id="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={(e) => handleChange('birthDate', e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.birthDate ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>}
      </div>

      {/* Weight - Optional */}
      <div>
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
          Weight (kg)
        </label>
        <input
          id="weight"
          type="number"
          step="0.1"
          min="0"
          value={formData.weight || ''}
          onChange={(e) => handleChange('weight', e.target.value ? parseFloat(e.target.value) : '')}
          placeholder="e.g., 12.5"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.weight ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight}</p>}
      </div>

      {/* Color/Description - Optional */}
      <div>
        <label htmlFor="colorDescription" className="block text-sm font-medium text-gray-700 mb-1">
          Color/Description
        </label>
        <input
          id="colorDescription"
          type="text"
          value={formData.colorDescription}
          onChange={(e) => handleChange('colorDescription', e.target.value)}
          placeholder="e.g., Golden with white markings"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Microchip ID - Optional */}
      <div>
        <label htmlFor="microchipId" className="block text-sm font-medium text-gray-700 mb-1">
          Microchip ID
        </label>
        <input
          id="microchipId"
          type="text"
          value={formData.microchipId}
          onChange={(e) => handleChange('microchipId', e.target.value)}
          placeholder="e.g., 123456789012345"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Notes - Optional */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Any additional information about your pet..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Pet' : 'Create Pet'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
