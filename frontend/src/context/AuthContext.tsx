'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { getToken, setToken, clearToken } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (jwt: string) => {
    try {
      const profile = await apiFetch<User>('/auth/me', { token: jwt });
      setUser(profile);
    } catch {
      clearToken();
      setTokenState(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const stored = getToken();
    if (stored) {
      setTokenState(stored);
      fetchProfile(stored).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (email: string, password: string) => {
    const res = await apiFetch<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: { email, password },
    });
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
