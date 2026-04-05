import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 800));
        if (email) {
          set({ user: { ...defaultUser, email }, isAuthenticated: true, isLoading: false });
          return true;
        }
        set({ isLoading: false });
        return false;
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
