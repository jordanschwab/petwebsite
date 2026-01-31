import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AxiosError } from 'axios';
import PetForm, { PetFormData } from '@/components/PetForm';
import { petApi } from '@/services/api';

export default function CreatePet() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type ApiErrorResponse = { error?: { message?: string } };
  const getErrorMessage = (err: unknown, fallback: string) => {
    const axiosError = err as AxiosError<ApiErrorResponse>;
    return axiosError?.response?.data?.error?.message || fallback;
  };

  const handleSubmit = async (petData: PetFormData) => {
    try {
      setIsSaving(true);
      setError(null);
      const response = await petApi.createPet(petData);
      // Navigate to the newly created pet's detail page
      navigate(`/pets/${response.pet.id}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create pet'));
      setIsSaving(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Add New Pet</h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700 mb-6">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <PetForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard')}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
}
