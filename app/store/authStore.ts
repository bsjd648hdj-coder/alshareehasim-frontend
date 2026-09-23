import { create } from "zustand";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  emailVerified?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (v: boolean) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

const CACHE_KEY = "auth_user_cache";

function readCache(): AuthUser | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function writeCache(user: AuthUser | null) {
  try {
    if (user) localStorage.setItem(CACHE_KEY, JSON.stringify(user));
    else localStorage.removeItem(CACHE_KEY);
  } catch { /* ignore */ }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  initialized: false,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  fetchMe: async () => {
    if (get().initialized) return;

    // عرض الـ cache فوراً لتجنب الـ flicker
    const cached = readCache();
    if (cached) set({ user: cached, loading: false });

    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      const user = data.authenticated ? data.user : null;
      writeCache(user);
      set({ user, loading: false, initialized: true });
    } catch {
      set({ user: cached ?? null, loading: false, initialized: true });
    }
  },

  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    writeCache(null);
    try {
      localStorage.removeItem("auth_register_draft");
      sessionStorage.removeItem("auth_register_draft");
    } catch { /* ignore */ }
    set({ user: null, initialized: false });
  },
}));
