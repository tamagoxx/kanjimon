import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock supabase BEFORE importing the store
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
    },
  },
  isSupabaseConfigured: true,
}));

vi.mock('../lib/supabaseSync', () => ({
  loadPlayerSave: vi.fn(),
  serializeState: vi.fn((s) => s),
  deserializeState: vi.fn((s) => s),
}));

import { useAuthStore } from './authStore';
import { supabase } from '../lib/supabase';

describe('authStore Supabase methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isCloudSynced: false,
      isLoading: false,
    });
  });

  describe('signUp', () => {
    it('creates new user, sets isCloudSynced=true on success', async () => {
      (supabase.auth.signUp as any).mockResolvedValue({
        data: {
          user: {
            id: 'supa-1',
            email: 'a@b.com',
            user_metadata: { username: 'alice' },
          },
          session: { access_token: 'tok' },
        },
        error: null,
      });

      const result = await useAuthStore.getState().signUp('a@b.com', 'pw123', 'alice');
      expect(result.error).toBeNull();
      expect(result.isCloudSynced).toBe(true);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.isCloudSynced).toBe(true);
      expect(state.user?.id).toBe('supa-1');
      expect(state.user?.username).toBe('alice');
      expect(state.user?.email).toBe('a@b.com');
    });

    it('returns error on failure without changing state', async () => {
      (supabase.auth.signUp as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Email already registered' },
      });

      const result = await useAuthStore.getState().signUp('a@b.com', 'pw', 'alice');
      expect(result.error).toBe('Email already registered');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isCloudSynced).toBe(false);
    });
  });

  describe('signIn', () => {
    it('signs in existing user, sets isCloudSynced=true', async () => {
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: {
          user: {
            id: 'supa-2',
            email: 'b@c.com',
            user_metadata: { username: 'bob' },
          },
          session: { access_token: 'tok' },
        },
        error: null,
      });

      const result = await useAuthStore.getState().signIn('b@c.com', 'pw456');
      expect(result.error).toBeNull();
      expect(result.isCloudSynced).toBe(true);

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.isCloudSynced).toBe(true);
      expect(state.user?.username).toBe('bob');
    });

    it('returns error on invalid credentials', async () => {
      (supabase.auth.signInWithPassword as any).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      });

      const result = await useAuthStore.getState().signIn('b@c.com', 'wrong');
      expect(result.error).toBe('Invalid login credentials');

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isCloudSynced).toBe(false);
    });
  });

  describe('signOutCloud', () => {
    it('calls supabase.auth.signOut and clears state', async () => {
      (supabase.auth.signOut as any).mockResolvedValue({ error: null });

      // pre-set state
      useAuthStore.setState({
        user: {
          id: 'supa-3',
          username: 'x',
          email: 'x@y.com',
          level: 1,
          xp: 0,
          badges: [],
          createdAt: new Date().toISOString(),
        },
        isAuthenticated: true,
        isCloudSynced: true,
      });

      await useAuthStore.getState().signOutCloud();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isCloudSynced).toBe(false);
    });
  });
});
