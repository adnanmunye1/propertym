'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { login as apiLogin, logout as apiLogout, getCachedUser, isAuthenticated } from '@/lib/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    if (isAuthenticated()) {
      const cachedUser = getCachedUser();
      setUser(cachedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      setUser(response.user);
      router.push('/dashboard');
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Login failed. Please try again.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
    router.push('/login');
  };

  return {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };
}

