import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, UserProgress, Badge } from '@/types';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Actions
  setUser: (user: UserProfile | null) => void;
  addXP: (amount: number) => void;
  addBadge: (badge: Badge) => void;
  updateProgress: (updates: Partial<UserProgress>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      addXP: (amount) => {
        const { user } = get();
        if (!user) return;

        const newXP = user.xp + amount;
        const xpPerLevel = 1000;
        const newLevel = Math.floor(newXP / xpPerLevel) + 1;

        set({
          user: {
            ...user,
            xp: newXP,
            level: newLevel,
          },
        });
      },

      addBadge: (badge) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            badges: [...user.badges, badge],
          },
        });
      },

      updateProgress: (updates) => {
        const { user } = get();
        if (!user) return;
        set({
          user: {
            ...user,
            ...updates,
          },
        });
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: 'kanjimon-auth',
    }
  )
);
