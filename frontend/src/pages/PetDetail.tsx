import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Pet } from '@/types';
import { petApi } from '@/services/api';
import PetForm, { PetFormData } from '@/components/PetForm';

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [pet, setPet] = useState<Pet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPet();
    }
  }, [id]);

  const fetchPet = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await petApi.getPet(id!);
      setPet(response.pet);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load pet');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (petData: PetFormData) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await petApi.updatePet(id!, petData);
      setPet(response.pet);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update pet');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setError(null);
      await petApi.deletePet(id!);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete pet');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (birthDate?: string): string => {
    if (!birthDate) return 'Unknown';
    
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      if (months === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      }
      return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading pet details...</div>
      </div>
    );
  }

  if (error && !pet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-500">Pet not found</div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 text-blue-600 hover:text-blue-700"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Dashboard
        </button>
        
        {!isEditing && (
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-gray-900">{pet.name}</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Edit Mode */}
      {isEditing ? (
        <div>
          <h2 className="text-2xl font-semibold mb-6">Edit {pet.name}</h2>
          <PetForm
            initialData={pet}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isLoading={isSaving}
          />
        </div>
      ) : (
        /* View Mode */
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Pet Photo */}
          <div className="w-full h-96 bg-gray-100 flex items-center justify-center">
            {pet.profilePictureUrl ? (
              <img
                src={pet.profilePictureUrl}
                alt={pet.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-9xl">
                {pet.species === 'dog' && '🐕'}
                {pet.species === 'cat' && '🐈'}
                {pet.species === 'bird' && '🐦'}
                {pet.species === 'rabbit' && '🐰'}
                {pet.species === 'hamster' && '🐹'}
                {pet.species === 'fish' && '🐠'}
                {pet.species === 'other' && '🐾'}
              </div>
            )}
          </div>

          {/* Pet Information */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Species</h3>
                <p className="text-lg capitalize">{pet.species}</p>
              </div>

              {pet.breed && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Breed</h3>
                  <p className="text-lg">{pet.breed}</p>
                </div>
              )}

              {pet.birthDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Birth Date</h3>
                  <p className="text-lg">{formatDate(pet.birthDate)}</p>
                  <p className="text-sm text-gray-500">Age: {calculateAge(pet.birthDate)}</p>
                </div>
              )}

              {pet.weight && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Weight</h3>
                  <p className="text-lg">{pet.weight} kg</p>
                </div>
              )}

              {pet.colorDescription && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Color/Description</h3>
                  <p className="text-lg">{pet.colorDescription}</p>
                </div>
              )}

              {pet.microchipId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Microchip ID</h3>
                  <p className="text-lg font-mono">{pet.microchipId}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {pet.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                <p className="text-base text-gray-700 whitespace-pre-wrap">{pet.notes}</p>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-4 border-t border-gray-200 text-sm text-gray-500">
              <p>Created: {formatDate(pet.createdAt)}</p>
              <p>Last updated: {formatDate(pet.updatedAt)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Delete {pet.name}?</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this pet? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
