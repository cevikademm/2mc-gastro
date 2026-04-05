import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  email: string;
  fullName: string;
  company: string;
  role: string;
  avatar?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  sector?: string;
  language: string;
  region: string;
  currency: string;
  dateFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    projectUpdates: boolean;
    bomChanges: boolean;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<void>;
  register: (data: Partial<User> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

const defaultUser: User = {
  id: '1',
  email: 'admin@2mcgastro.com',
  fullName: 'Adem Cevik',
  company: '2MC Gastro',
  role: 'Admin',
  phone: '+49 123 456 789',
  address: 'Berlin, Deutschland',
  taxId: 'DE123456789',
  sector: 'Gastronomi',
  language: 'tr',
  region: 'EU',
  currency: 'EUR',
  dateFormat: 'DD.MM.YYYY',
  notifications: {
    email: true,
    push: true,
    projectUpdates: true,
    bomChanges: true,
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: { ...defaultUser },
      isAuthenticated: true,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        // Try Supabase if configured
        if (supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (!error && data.user) {
            const user: User = {
              ...defaultUser,
              id: data.user.id,
              email: data.user.email || email,
              fullName: data.user.user_metadata?.full_name || defaultUser.fullName,
              avatar: data.user.user_metadata?.avatar_url,
            };
            set({ user, isAuthenticated: true, isLoading: false });
            return true;
          }
          set({ isLoading: false });
          return false;
        }
        // Fallback mock auth
        await new Promise((r) => setTimeout(r, 800));
        if (email) {
          set({ user: { ...defaultUser, email }, isAuthenticated: true, isLoading: false });
          return true;
        }
        set({ isLoading: false });
        return false;
      },

      loginWithGoogle: async () => {
        if (!supabase) {
          // Mock: just authenticate directly
          set({ user: { ...defaultUser }, isAuthenticated: true });
          return;
        }
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/#/dashboard`,
          },
        });
      },

      register: async (data) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 800));
        const newUser: User = {
          ...defaultUser,
          ...data,
          id: Date.now().toString(),
        };
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },
    }),
    {
      name: '2mc-gastro-auth',
      version: 1,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
