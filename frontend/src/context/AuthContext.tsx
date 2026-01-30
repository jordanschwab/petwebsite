import React, { createContext, useState, useContext, useCallback } from 'react';
import apiClient from '@/services/api';

type User = { id: string; email: string; displayName?: string } | null;

type AuthContextValue = {
  user: User;
  setUser: (u: User) => void;
  setUserFromBackend: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);

  const setUserFromBackend = useCallback(async () => {
    try {
      const res = await apiClient.get('/api/auth/me');
      setUser(res.data?.data?.user ?? null);
    } catch (err) {
      setUser(null);
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    localStorage.removeItem('accessToken');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, setUserFromBackend, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
