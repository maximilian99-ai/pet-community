import { create } from 'zustand';
import { User, Pet } from '@/types';

interface ProfileState {
  user: User | null;
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setPets: (pets: Pet[]) => void;
  addPet: (pet: Pet) => void;
  removePet: (petId: string) => void;
  updatePet: (petId: string, updates: Partial<Pet>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearProfile: () => void;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  username: string | null;
  userId: string | null;
  setToken: (token: string | null) => void;
  setUsername: (username: string | null) => void;
  setUserId: (userId: string | null) => void;
  logout: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  user: null,
  pets: [],
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),
  setPets: (pets) => set({ pets }),
  addPet: (pet) =>
    set((state) => ({
      pets: [...state.pets, pet],
    })),
  removePet: (petId) =>
    set((state) => ({
      pets: state.pets.filter((p) => p.id !== petId),
    })),
  updatePet: (petId, updates) =>
    set((state) => ({
      pets: state.pets.map((p) =>
        p.id === petId ? { ...p, ...updates } : p
      ),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearProfile: () => set({ user: null, pets: [], error: null }),
}));

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  username: typeof window !== 'undefined' ? localStorage.getItem('username') : null,
  userId: typeof window !== 'undefined' ? localStorage.getItem('userId') : null,

  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token, isAuthenticated: !!token });
  },
  setUsername: (username) => {
    if (username) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
    set({ username });
  },
  setUserId: (userId) => {
    if (userId) {
      localStorage.setItem('userId', userId);
    } else {
      localStorage.removeItem('userId');
    }
    set({ userId });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    set({ token: null, isAuthenticated: false, username: null, userId: null });
  },
}));
