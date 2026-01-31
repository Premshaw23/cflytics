import { create } from "zustand";

export type AuthUser = {
  id: string;
  handle: string;
};

type AuthStatus = "loading" | "guest" | "connected";

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  status: "loading",
  user: null,

  refresh: async () => {
    try {
      const res = await fetch("/api/auth/me", { method: "GET" });
      if (!res.ok) throw new Error("Failed to load session");
      const data: { authenticated: boolean; user: AuthUser | null } = await res.json();
      set({
        status: data.authenticated && data.user ? "connected" : "guest",
        user: data.user,
      });
    } catch {
      set({ status: "guest", user: null });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      set({ status: "guest", user: null });
    }
  },
}));

