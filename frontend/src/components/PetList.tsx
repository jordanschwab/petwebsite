import { useState, useEffect, useCallback } from 'react';
import type { AxiosError } from 'axios';
import { Pet } from '@/types';
import { petApi } from '@/services/api';

type PetListParams = { search?: string; species?: string; page?: number; limit?: number };
type ApiErrorResponse = { error?: { message?: string } };
const getErrorMessage = (err: unknown, fallback: string) => {
  const axiosError = err as AxiosError<ApiErrorResponse>;
  return axiosError?.response?.data?.error?.message || fallback;
};

interface PetListProps {
  onPetClick?: (pet: Pet) => void;
  onCreatePet?: () => void;
}

export default function PetList({ onPetClick, onCreatePet }: PetListProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const SPECIES_OPTIONS = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'fish', 'other'];

  const fetchPets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: PetListParams = { page: currentPage, limit: 20 };
      if (searchQuery) params.search = searchQuery;
      if (speciesFilter) params.species = speciesFilter;

      const response = await petApi.listPets(params);
      setPets(response.pets || []);
      
      // Calculate total pages if pagination data is available
      if (response.total) {
        setTotalPages(Math.ceil(response.total / 20));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load pets'));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, speciesFilter]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const calculateAge = (birthDate?: string): string => {
    if (!birthDate) return 'Unknown';
    
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  };

  const getSpeciesIcon = (species: string): string => {
    const icons: Record<string, string> = {
      dog: '🐕',
      cat: '🐈',
      bird: '🐦',
      rabbit: '🐰',
      hamster: '🐹',
      fish: '🐠',
      other: '🐾',
    };
    return icons[species] || '🐾';
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleSpeciesFilterChange = (value: string) => {
    setSpeciesFilter(value);
    setCurrentPage(1); // Reset to first page on filter
  };

  if (isLoading && pets.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading pets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by pet name..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={speciesFilter}
            onChange={(e) => handleSpeciesFilterChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Species</option>
            {SPECIES_OPTIONS.map((species) => (
              <option key={species} value={species}>
                {species.charAt(0).toUpperCase() + species.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty State */}
      {pets.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">🐾</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchQuery || speciesFilter ? 'No pets found' : 'No pets yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || speciesFilter
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first pet'}
          </p>
          {!searchQuery && !speciesFilter && onCreatePet && (
            <button
              onClick={onCreatePet}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Your First Pet
            </button>
          )}
        </div>
      )}

      {/* Pet Grid */}
      {pets.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pets.map((pet) => (
              <div
                key={pet.id}
                onClick={() => onPetClick?.(pet)}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Pet Photo or Placeholder */}
                <div className="w-full h-48 bg-gray-100 rounded-md mb-3 flex items-center justify-center overflow-hidden">
                  {pet.profilePictureUrl ? (
                    <img
                      src={pet.profilePictureUrl}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl">{getSpeciesIcon(pet.species)}</div>
                  )}
                </div>

                {/* Pet Info */}
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{pet.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <span>{getSpeciesIcon(pet.species)}</span>
                  <span className="capitalize">{pet.species}</span>
                </div>
                {pet.breed && (
                  <p className="text-sm text-gray-500 mb-1">{pet.breed}</p>
                )}
                <p className="text-sm text-gray-500">Age: {calculateAge(pet.birthDate)}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
