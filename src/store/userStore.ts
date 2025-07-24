import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  preferredSports: string[];
  balance: number;
  isBusinessOwner: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  updateBalance: (amount: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  
  // Selectors
  getUserBalance: () => number;
  getPreferredSports: () => string[];
  isBusinessUser: () => boolean;
}

export const useUserStore = create<UserState>()(
  subscribeWithSelector((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    
    setUser: (user) => set({ 
      user, 
      isAuthenticated: !!user,
      error: null 
    }),
    
    updateUser: (updates) => set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    })),
    
    updateBalance: (amount) => set((state) => ({
      user: state.user ? { ...state.user, balance: amount } : null
    })),
    
    setLoading: (isLoading) => set({ isLoading }),
    
    setError: (error) => set({ error }),
    
    logout: () => set({ 
      user: null, 
      isAuthenticated: false, 
      error: null 
    }),
    
    // Selectors
    getUserBalance: () => get().user?.balance ?? 0,
    getPreferredSports: () => get().user?.preferredSports ?? [],
    isBusinessUser: () => get().user?.isBusinessOwner ?? false,
  }))
);