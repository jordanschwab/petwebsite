import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor: attach access token from localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type RefreshResponse = { data?: { accessToken?: string } };
let refreshPromise: Promise<RefreshResponse> | null = null;

async function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = apiClient.post<RefreshResponse>('/api/auth/refresh').then((r) => {
      if (r.data?.data?.accessToken) {
        localStorage.setItem('accessToken', r.data.data.accessToken);
      }
      return r.data;
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Response interceptor: on 401 attempt refresh then retry original request once
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return apiClient(originalRequest);
      } catch (refreshErr) {
        // if refresh fails, clear token and redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Pet API functions
export const petApi = {
  // List all pets for the authenticated user
  listPets: async (params?: { search?: string; species?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/api/pets', { params });
    return response.data?.data ?? response.data;
  },

  // Get a single pet by ID
  getPet: async (id: string) => {
    const response = await apiClient.get(`/api/pets/${id}`);
    return response.data?.data ?? response.data;
  },

  // Create a new pet
  createPet: async (petData: {
    name: string;
    species: string;
    breed?: string;
    birthDate?: string;
    weight?: number;
    colorDescription?: string;
    microchipId?: string;
    notes?: string;
  }) => {
    const response = await apiClient.post('/api/pets', petData);
    return response.data?.data ?? response.data;
  },

  // Update an existing pet
  updatePet: async (id: string, petData: Partial<{
    name: string;
    species: string;
    breed?: string;
    birthDate?: string;
    weight?: number;
    colorDescription?: string;
    microchipId?: string;
    notes?: string;
  }>) => {
    const response = await apiClient.patch(`/api/pets/${id}`, petData);
    return response.data?.data ?? response.data;
  },

  // Delete a pet (soft delete)
  deletePet: async (id: string) => {
    const response = await apiClient.delete(`/api/pets/${id}`);
    return response.data?.data ?? response.data;
  },
};

export default apiClient;
