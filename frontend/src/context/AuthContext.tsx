import React, { createContext, useState, useContext, useCallback } from 'react';

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
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        setUser(json.data ?? null);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    }
  }, []);

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
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
