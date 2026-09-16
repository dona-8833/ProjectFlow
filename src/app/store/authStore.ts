import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (session: Session | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isAuthenticated: false,
  setAuth: (session) =>
    set({ session, user: session?.user ?? null, isAuthenticated: !!session }),
  clearAuth: () => {
    set({
      session: null,
      user: null,
      isAuthenticated: false,
    });
  },
}));
