import api from './api';
import { LoginResponse, User } from '@/types';

/**
 * Login user
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await api.post<{ success: boolean; data: LoginResponse }>('/auth/login', {
    email,
    password,
  });

  const { user, accessToken, refreshToken, expiresIn } = response.data.data;

  // Store tokens
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));

  return response.data.data;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Continue with logout even if API call fails
  } finally {
    // Clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

/**
 * Get current user from API
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get<{ success: boolean; data: User }>('/auth/me');
  return response.data.data;
}

/**
 * Get cached user from local storage
 */
export function getCachedUser(): User | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('accessToken');
}

