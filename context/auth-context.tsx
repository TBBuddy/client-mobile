import React, { createContext, useContext, useEffect, useState } from 'react';

import { AuthService } from '../services/repository/auth-service';
import { TokenStorage } from '../services/repository/token-storage';
import type { AuthSessionUser } from '../services/repository/types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  user: AuthSessionUser | null;
  status: AuthStatus;
  signIn: (user: AuthSessionUser) => void;
  signOut: () => void;
  updateUser: (updates: Partial<AuthSessionUser>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSessionUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await TokenStorage.getAccessToken();

        if (!token) {
          setStatus('unauthenticated');
          return;
        }

        const sessionUser = await AuthService.me();
        setUser(sessionUser);
        setStatus('authenticated');
      } catch {
        await TokenStorage.clearAccessToken().catch(() => {});
        setStatus('unauthenticated');
      }
    }

    bootstrap();
  }, []);

  function signIn(sessionUser: AuthSessionUser) {
    setUser(sessionUser);
    setStatus('authenticated');
  }

  function signOut() {
    setUser(null);
    setStatus('unauthenticated');
  }

  function updateUser(updates: Partial<AuthSessionUser>) {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }

  return (
    <AuthContext.Provider value={{ user, status, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export function needsOnboarding(user: AuthSessionUser | null): boolean {
  return user?.role === 'PATIENT' && user?.isOnboardingCompleted === false;
}
