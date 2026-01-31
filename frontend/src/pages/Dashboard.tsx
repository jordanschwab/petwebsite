import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PetList from '@/components/PetList';
import { Pet } from '@/types';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handlePetClick = (pet: Pet) => {
    navigate(`/pets/${pet.id}`);
  };

  const handleCreatePet = () => {
    navigate('/pets/new');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">My Pets</h1>
              {user && (
                <p className="text-gray-600">
                  Welcome back, {user.displayName || user.email}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCreatePet}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                + Add Pet
              </button>
              <button
                onClick={() => signOut()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Pet List */}
        <PetList onPetClick={handlePetClick} onCreatePet={handleCreatePet} />
      </div>
    </div>
  );
}
