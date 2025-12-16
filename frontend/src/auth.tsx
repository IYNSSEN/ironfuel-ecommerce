import React, { createContext, useContext, useEffect, useState } from "react";
import { api, ApiError } from "./api";
import { User } from "./types";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (login: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const me = await api.me();
      setUser(me as any);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function login(login: string, password: string) {
    const u = await api.login(login, password);
    setUser(u as any);
  }

  async function register(login: string, password: string) {
    await api.register(login, password);
    const u = await api.login(login, password);
    setUser(u as any);
  }

  async function logout() {
    try { await api.logout(); } catch {}
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("AuthProvider missing");
  return v;
}
