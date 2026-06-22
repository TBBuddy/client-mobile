import React, { createContext, useContext, useEffect, useState } from 'react';

import { AuthService } from '../services/repository/auth-service';
import { TokenStorage } from '../services/repository/token-storage';
import type { AuthSessionUser } from '../services/repository/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthContextValue = {
  /** The currently logged-in user, or null if unauthenticated / still loading. */
  user: AuthSessionUser | null;
  /**
   * - `'loading'`        — bootstrap in progress (checking SecureStore + /auth/me)
   * - `'authenticated'`  — valid session, user is set
   * - `'unauthenticated'`— no token or token invalid/expired
   */
  status: AuthStatus;
  /** Call after a successful login to set the user and trigger navigation. */
  signIn: (user: AuthSessionUser) => void;
  /** Call after logout to clear the user and trigger navigation. */
  signOut: () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

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

  return (
    <AuthContext.Provider value={{ user, status, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
