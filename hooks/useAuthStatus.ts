'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthStatus() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/status');
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const redirectToLogin = () => {
    if (!isAuthenticated && !isLoading) {
      router.push('/admin/login');
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      setIsAuthenticated(false);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Optionally, set an error message
    }
  };

  return { isAuthenticated, isLoading, redirectToLogin, logout };
}
