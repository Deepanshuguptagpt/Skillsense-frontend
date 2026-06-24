import axios, { AxiosError, AxiosInstance } from 'axios';
import { useAuthStore } from './auth';
import { API_ROUTES } from './constants';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean;
    };

    // Don't try to refresh if the request was to signin or signup
    const isAuthRoute = 
      originalRequest?.url?.includes(API_ROUTES.SIGNIN) || 
      originalRequest?.url?.includes(API_ROUTES.SIGNUP);

    // If 401 and not already retried (and not an auth route), try to refresh token
    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try backend refresh endpoint
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}${API_ROUTES.REFRESH}`,
          { refreshToken }
        );

        // Backend returns camelCase (accessToken, refreshToken)
        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        if (!newAccessToken) {
          throw new Error('No access token in refresh response');
        }

        // Update both tokens in store
        useAuthStore.getState().setAccessToken(newAccessToken);
        if (newRefreshToken) {
          // Update refresh token if provided
          useAuthStore.getState().setAuth(
            useAuthStore.getState().user!,
            newAccessToken,
            newRefreshToken
          );
        }

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        useAuthStore.getState().clearAuth();
        window.location.href = '/auth/signin';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper function to handle API errors
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Handle FastAPI validation errors (422)
    if (error.response?.data?.detail && Array.isArray(error.response.data.detail)) {
      return error.response.data.detail[0].msg;
    }
    
    return (
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
