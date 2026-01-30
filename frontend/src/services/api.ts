import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

async function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = apiClient.post('/api/auth/refresh').then((r) => r.data).finally(() => {
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
        // if refresh fails, redirect to login
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
