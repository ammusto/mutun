import axios, { AxiosError, AxiosResponse } from 'axios';

const API_URL = 'https://api.mihbara.com';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface LoginResponse {
  token: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
}

interface UpdateProfileData {
  name?: string;
  email?: string;
}

const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Login failed';
      throw new Error(errorMessage);
    }
  },

  async register(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.post('/api/auth/register', { email, password });
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  async getCurrentUser(): Promise<UserProfile> {
    try {
      const response = await api.get('/api/users/profile');
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Failed to get user profile';
      throw new Error(errorMessage);
    }
  },

  async updateProfile(profileData: UpdateProfileData): Promise<UserProfile> {
    try {
      const response = await api.put('/api/users/profile', profileData);
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Failed to update profile';
      throw new Error(errorMessage);
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await api.put('/api/users/password', { currentPassword, newPassword });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Failed to change password';
      throw new Error(errorMessage);
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const response = await api.get('/api/users/all');
      return response.data;
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Failed to get users';
      throw new Error(errorMessage);
    }
  },

  async deleteUser(userId: string): Promise<void> {
    try {
      await api.delete(`/api/users/${userId}`);
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Failed to delete user';
      throw new Error(errorMessage);
    }
  },

  async updateUserRank(userId: string, rank: string): Promise<void> {
    try {
      await api.put(`/api/users/${userId}/rank`, { rank });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error || 'Failed to update user rank';
      throw new Error(errorMessage);
    }
  }
};

export default authService;
