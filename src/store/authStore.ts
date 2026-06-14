import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, UserProgress, Badge } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCloudSynced: boolean;
  // Stats
  totalBattles: number;
  totalWins: number;
  totalCards: number;
  studySessions: number;
  // Actions
  login: (userData: { username: string; email: string }) => void;
  register: (userData: { username: string; email: string }) => void;
  setUser: (user: UserProfile | null) => void;
  addXP: (amount: number) => void;
  addBadge: (badge: Badge) => void;
  updateProgress: (updates: Partial<UserProgress>) => void;
  incrementStat: (stat: 'battles' | 'wins' | 'studySessions') => void;
  logout: () => void;
  // New user onboarding
  initNewUser: (userData: { username: string; email: string }, initCollection: () => void) => void;
  // Cloud auth (Supabase)
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null; isCloudSynced?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null; isCloudSynced?: boolean }>;
  signOutCloud: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isCloudSynced: false,
      // Stats
      totalBattles: 0,
      totalWins: 0,
      totalCards: 0,
      studySessions: 0,

      login: (userData) => {
        const newUser: UserProfile = {
          id: crypto.randomUUID(),
          username: userData.username,
          email: userData.email,
          level: 1,
          xp: 0,
          badges: [],
          createdAt: new Date().toISOString(),
        };
        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      register: (userData) => {
        const newUser: UserProfile = {
          id: crypto.randomUUID(),
          username: userData.username,
          email: userData.email,
          level: 1,
          xp: 0,
          badges: [],
          createdAt: new Date().toISOString(),
        };
        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
        });
      },

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
        // XP curve: level 1 needs 500, each next level needs 10% more
        // level 100 = ~490,000 XP total
        let level = 1;
        let remaining = newXP;
        const XP_BASE = 500;
        const XP_GROWTH = 0.10;
        while (level < 100) {
          const needed = Math.floor(XP_BASE * Math.pow(1 + XP_GROWTH, level - 1));
          if (remaining < needed) break;
          remaining -= needed;
          level++;
        }

        set({
          user: {
            ...user,
            xp: newXP,
            level,
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

      incrementStat: (stat) => {
        const s = get();
        if (stat === 'battles') set({ totalBattles: s.totalBattles + 1 });
        else if (stat === 'wins') set({ totalWins: s.totalWins + 1 });
        else if (stat === 'studySessions') set({ studySessions: s.studySessions + 1 });
      },

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          totalBattles: 0,
          totalWins: 0,
          totalCards: 0,
          studySessions: 0,
        }),

      initNewUser: (userData, initCollection) => {
        const newUser: UserProfile = {
          id: crypto.randomUUID(),
          username: userData.username,
          email: userData.email,
          level: 1,
          xp: 0,
          badges: [],
          createdAt: new Date().toISOString(),
        };
        set({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
        });
        // Initialize collection with starting cards
        initCollection();
      },

      // ===== Cloud auth (Supabase) =====

      signUp: async (email, password, username) => {
        if (!isSupabaseConfigured) {
          return { error: 'Supabase belum dikonfigurasi. Set NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local' };
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (error) return { error: error.message };
        if (!data.user) return { error: 'Signup berhasil tapi user tidak dibuat' };

        const newUser: UserProfile = {
          id: data.user.id,
          username,
          email,
          level: 1,
          xp: 0,
          badges: [],
          createdAt: new Date().toISOString(),
        };
        set({
          user: newUser,
          isAuthenticated: true,
          isCloudSynced: true,
          isLoading: false,
        });
        return { error: null, isCloudSynced: true };
      },

      signIn: async (email, password) => {
        if (!isSupabaseConfigured) {
          return { error: 'Supabase belum dikonfigurasi. Set NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local' };
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        if (!data.user) return { error: 'Login berhasil tapi session tidak dibuat' };

        const username = (data.user.user_metadata?.username as string) || email.split('@')[0];
        const newUser: UserProfile = {
          id: data.user.id,
          username,
          email,
          level: 1,
          xp: 0,
          badges: [],
          createdAt: new Date().toISOString(),
        };
        set({
          user: newUser,
          isAuthenticated: true,
          isCloudSynced: true,
          isLoading: false,
        });
        return { error: null, isCloudSynced: true };
      },

      signOutCloud: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          isAuthenticated: false,
          isCloudSynced: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'kanjimon-auth',
    }
  )
);