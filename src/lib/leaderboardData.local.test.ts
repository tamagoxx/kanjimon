// ============================================================
// leaderboardData.local.test.ts — TDD for hydration + error bugs
// ============================================================
//
// Two bugs covered here:
// 1. Hydration race: leaderboard page shows "Belum ada skor" even
//    when player has runs in localStorage. Root cause: useEffect
//    runs BEFORE Zustand persist hydrates from localStorage.
//    Fix: readLocalKanjiDropRuns() reads BOTH Zustand getState()
//    AND localStorage directly, merges + dedupes.
// 2. Network error hang: when Supabase URL is unreachable, the
//    page gets stuck on "Memuat..." forever. Root cause: no
//    try/catch around the fetch + no fallback in the page.
//    Fix: fetchTopScores() catches network errors and returns [].

import { describe, it, expect, beforeEach, vi } from 'vitest';
// Mock the store so it ALWAYS returns the empty initial state
// (simulates pre-hydration / SSR-taken-over client)
vi.mock('../store/kanjiDropStore', () => ({
  useKanjiDropStore: {
    getState: () => ({ recentRuns: [] }), // <-- pre-hydration: empty
    persist: { rehydrate: vi.fn(), hasHydrated: () => false },
  },
}));

import * as supabaseMod from '../lib/supabase';
vi.spyOn(supabaseMod, 'isSupabaseConfigured', 'get').mockReturnValue(false);

import { useKanjiDropStore } from '../store/kanjiDropStore';
import { fetchTopScores, getLocalEntries, readLocalKanjiDropRuns } from './leaderboardData';

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
    const zustandRun = {
      score: 9999,
      wave: 7,
      kills: 70,
      maxCombo: 20,
      durationSec: 80,
      destroyed: [],
      playedAt: new Date(Date.now() + 60_000).toISOString(),
    };
    (useKanjiDropStore as any).getState = () => ({ recentRuns: [zustandRun] });

    const entries = getLocalEntries('kanji-drop', 'Tamago');
    expect(entries).toHaveLength(2);
    expect(entries[0].score).toBe(9999);
    expect(entries[1].score).toBe(5000);
  });
});

describe('fetchTopScores network error handling', () => {
  it('returns [] immediately when Supabase is not configured', async () => {
    const entries = await fetchTopScores({ mode: 'kanji-drop', window: 'ALL_TIME' });
    expect(entries).toEqual([]);
  });

  it('catches network errors (TypeError "Failed to fetch") and returns []', async () => {
    const spy = vi.spyOn(supabaseMod, 'isSupabaseConfigured', 'get');
    spy.mockReturnValueOnce(true);

    const throwingSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              order: () => ({
                limit: () => Promise.reject(new TypeError('Failed to fetch')),
              }),
            }),
          }),
        }),
      }),
    };
    vi.spyOn(supabaseMod, 'getSupabase').mockReturnValueOnce(throwingSupabase as any);

    // Should NOT throw — should resolve to []
    const entries = await fetchTopScores({ mode: 'kanji-drop', window: 'ALL_TIME' });
    expect(entries).toEqual([]);
  });

  it('catches structured Supabase errors (PostgREST errors) and returns []', async () => {
    const spy = vi.spyOn(supabaseMod, 'isSupabaseConfigured', 'get');
    spy.mockReturnValueOnce(true);

    const errorSupabase = {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => ({
              order: () => ({
                limit: () => Promise.resolve({ data: null, error: { message: 'permission denied' } }),
              }),
            }),
          }),
        }),
      }),
    };
    vi.spyOn(supabaseMod, 'getSupabase').mockReturnValueOnce(errorSupabase as any);

    const entries = await fetchTopScores({ mode: 'kanji-drop', window: 'ALL_TIME' });
    expect(entries).toEqual([]);
  });
});
