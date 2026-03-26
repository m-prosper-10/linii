/**
 * Authentication Service for Linii Frontend
 * Handles user login, registration, and token management
 */

import { apiClient } from '../lib/api';

export interface User {
  _id: string;
  username: string;
  fullnames: string;
  avatar: string;
  bio: string;
  coverImage: string;
  verified: boolean;
  followers: number;
  following: number;
  postsCount: number;
  website?: string;
  location?: string;
  joinedDate: string;
  followStatus?: {
    isFollowing: boolean;
    isFollowedBy: boolean;
    status: 'NONE' | 'FOLLOWING' | 'PENDING' | 'BLOCKED';
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<User>(
      '/auth/login',
      credentials,
      { skipAuth: true }
    );
    
    if (response.success && response.token) {
      apiClient.setToken(response.token);
      return { user: response.data!, token: response.token };
    }
    
    throw new Error(response.message || 'Login failed');
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    const response = await apiClient.post<User>(
      '/auth/register',
      data,
      { skipAuth: true }
    );
    
    if (response.success && response.token) {
      apiClient.setToken(response.token);
      return { user: response.data!, token: response.token };
    }
    
    throw new Error(response.message || 'Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', {});
    } finally {
      apiClient.setToken(null);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const token = apiClient.getToken();
    if (!token) return null;

    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }
  
  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const response = await apiClient.get<User>(`/auth/user/${userId}`);
      return response.success ? response.data || null : null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    const response = await apiClient.post(
      '/auth/verify-email',
      { token },
      { skipAuth: true }
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Email verification failed');
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await apiClient.post(
      '/auth/forgot-password',
      { email },
      { skipAuth: true }
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Password reset request failed');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiClient.post(
      '/auth/reset-password',
      { token, newPassword },
      { skipAuth: true }
    );
    
    if (!response.success) {
      throw new Error(response.message || 'Password reset failed');
    }
  }

  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  }
}

export const authService = new AuthService();
