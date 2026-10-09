import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "./api/client";
import type { Me } from "./api/types";

interface AuthState {
  me: Me | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    setToken(null);
    setMe(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setMe(null));
    if (!getToken()) {
      setReady(true);
      return;
    }
    api<Me>("/api/auth/me")
      .then(setMe)
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  const afterToken = useCallback(async (token: string) => {
    setToken(token);
    setMe(await api<Me>("/api/auth/me"));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      me,
      ready,
      logout,
      login: async (email, password) => {
        const r = await api<{ access_token: string }>("/api/auth/login", { method: "POST", body: { email, password } });
        await afterToken(r.access_token);
      },
      register: async (email, password, displayName) => {
        const r = await api<{ access_token: string }>("/api/auth/register", {
          method: "POST",
          body: { email, password, display_name: displayName || null },
        });
        await afterToken(r.access_token);
      },
    }),
    [me, ready, logout, afterToken],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth fuera de AuthProvider");
  return ctx;
}
