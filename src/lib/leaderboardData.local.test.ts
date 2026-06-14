// ============================================================
// leaderboardData.local.test.ts — TDD for the hydration bug
// ============================================================
//
// Bug: the leaderboard page shows "Belum ada skor" even when
// the player has kanji-drop runs saved in localStorage. Root
// cause: the page calls `load()` inside useEffect which runs
// BEFORE Zustand's persist middleware finishes rehydrating
// from localStorage (the project already uses setTimeout(50ms)
// in profile/page.tsx to work around this). The page does NOT
// have such a guard, so `useKanjiDropStore.getState().recentRuns`
// returns the empty initial state (the server's empty state
// that the client takes over because the module is shared).
//
// Fix: `readLocalKanjiDropRuns()` should read from localStorage
// directly as a fallback. Zustand's persist serializes to
// `{ state: {...}, version: 0 }` by default — easy to parse.

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the store so it ALWAYS returns the empty initial state
// (simulates pre-hydration / SSR-taken-over client)
vi.mock('../store/kanjiDropStore', () => ({
  useKanjiDropStore: {
    getState: () => ({ recentRuns: [] }), // <-- pre-hydration: empty
    persist: { rehydrate: vi.fn(), hasHydrated: () => false },
  },
}));

// Mock the supabase client (so isSupabaseConfigured is false)
vi.mock('../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: false,
}));

import { useKanjiDropStore } from '../store/kanjiDropStore';
import { getLocalEntries, readLocalKanjiDropRuns } from './leaderboardData';

describe('readLocalKanjiDropRuns (hydration bug fix)', () => {
  beforeEach(() => {
    // Mock localStorage with actual data — even though Zustand is empty
    const persisted = {
      state: {
        highScore: 5000,
        bestWave: 5,
        totalKills: 50,
        totalGames: 1,
        bestCombo: 12,
        recentRuns: [
          {
            score: 5000,
            wave: 5,
            kills: 50,
            maxCombo: 12,
            durationSec: 60,
            destroyed: [],
            playedAt: new Date().toISOString(),
          },
        ],
        difficulty: 'NORMAL',
        showReading: true,
        soundEnabled: true,
      },
      version: 0,
    };
    const memStore: Record<string, string> = {
      'kanjimon-kanji-drop': JSON.stringify(persisted),
    };
    globalThis.localStorage = {
      getItem: (key: string) => memStore[key] ?? null,
      setItem: (key: string, value: string) => { memStore[key] = value; },
      removeItem: (key: string) => { delete memStore[key]; },
      clear: () => { for (const k in memStore) delete memStore[k]; },
      key: (i: number) => Object.keys(memStore)[i] ?? null,
      length: Object.keys(memStore).length,
    } as any;
  });

  it('returns runs from localStorage even when Zustand has not hydrated', () => {
    const runs = readLocalKanjiDropRuns();
    expect(runs).toHaveLength(1);
    expect(runs[0].score).toBe(5000);
  });

  it('falls back to localStorage when Zustand store returns empty recentRuns', () => {
    // Even though our mock Zustand returns empty, we should still get data
    const entries = getLocalEntries('kanji-drop', 'Tamago');
    expect(entries).toHaveLength(1);
    expect(entries[0].score).toBe(5000);
    expect(entries[0].username).toBe('Tamago');
  });

  it('returns empty array when localStorage is empty (no data, no hydration)', () => {
    globalThis.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    } as any;
    const entries = getLocalEntries('kanji-drop', 'Tamago');
    expect(entries).toEqual([]);
  });

  it('returns empty array on malformed localStorage (defensive)', () => {
    globalThis.localStorage = {
      getItem: () => '{not valid json',
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 1,
    } as any;
    const entries = getLocalEntries('kanji-drop', 'Tamago');
    expect(entries).toEqual([]);
  });

  it('merges localStorage runs with Zustand runs (Zustand may have more recent writes)', () => {
    // Simulate Zustand having ONE run that wasn't yet persisted
    const zustandRun = {
      score: 9999,
      wave: 7,
      kills: 70,
      maxCombo: 20,
      durationSec: 80,
      destroyed: [],
      playedAt: new Date(Date.now() + 60_000).toISOString(), // newer
    };
    (useKanjiDropStore as any).getState = () => ({ recentRuns: [zustandRun] });

    const entries = getLocalEntries('kanji-drop', 'Tamago');
    // Should have BOTH runs (1 from localStorage + 1 from Zustand)
    expect(entries).toHaveLength(2);
    // Higher score first
    expect(entries[0].score).toBe(9999);
    expect(entries[1].score).toBe(5000);
  });
});
