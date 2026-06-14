// ============================================================
// Leaderboard Data Layer — Supabase (cloud) + local fallback
// ============================================================
//
// Architecture:
// - When Supabase is configured, fetchTopScores reads from
//   `leaderboard_scores` table and subscribes to Realtime.
// - When Supabase is NOT configured, falls back to local runs
//   from kanjiDropStore (and any other game mode stores).
// - The page composes both: try cloud first, then merge with
//   local so the player always sees their own scores.
//
// Schema lives in: supabase/migrations/0001_leaderboard_scores.sql

import { isSupabaseConfigured, getSupabase } from './supabase';
import { useKanjiDropStore } from '../store/kanjiDropStore';
import {
  sortByScore,
  filterByTimeWindow,
  aggregateLocalKanjiDropScores,
  type LeaderboardEntry,
  type GameMode,
  type TimeWindow,
} from './leaderboardLogic';

const DEFAULT_LIMIT = 50;

// ---- Supabase row shape (must match the SQL migration) ----
interface CloudRow {
  id: string;
  user_id: string;
  username: string;
  game_mode: GameMode;
  score: number;
  wave: number;
  kills: number;
  max_combo: number;
  played_at: string;
}

function rowToEntry(r: CloudRow): LeaderboardEntry {
  return {
    id: r.id,
    userId: r.user_id,
    username: r.username,
    gameMode: r.game_mode,
    score: r.score,
    wave: r.wave,
    kills: r.kills,
    maxCombo: r.max_combo,
    playedAt: r.played_at,
  };
}

/**
 * Read the most recent runs from local kanjiDrop store.
 *
 * Hydration bug fix: Zustand's persist middleware runs hydration
 * AFTER the module is first imported. On Next.js the server creates
 * the store with empty initial state, the client takes over the
 * same module instance, and `getState()` returns the server's empty
 * state until hydration completes. The leaderboard page calls
 * `getState()` inside a useEffect that runs BEFORE hydration, so
 * we miss the localStorage data.
 *
 * Fix: also read directly from localStorage and merge. Zustand
 * keeps the most recent state in localStorage (sync write on
 * every `set()`), so the localStorage data is always at least as
 * fresh as what `getState()` returns. We still prefer Zustand's
 * in-memory state for the current tick in case a `set()` was made
 * but not yet flushed (rare but possible).
 *
 * Returns [] if SSR, no data, or parse error.
 */
const LS_KEY = 'kanjimon-kanji-drop';

function readLocalStorageRuns(): import('./leaderboardLogic').LocalRunInput[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Zustand persist default shape: { state: {...}, version: 0 }
    const runs = parsed?.state?.recentRuns;
    return Array.isArray(runs) ? runs : [];
  } catch {
    return [];
  }
}

export function readLocalKanjiDropRuns(): import('./leaderboardLogic').LocalRunInput[] {
  if (typeof window === 'undefined') return [];
  let zustandRuns: import('./leaderboardLogic').LocalRunInput[] = [];
  try {
    const state = useKanjiDropStore.getState();
    zustandRuns = state.recentRuns ?? [];
  } catch {
    // ignore
  }
  const lsRuns = readLocalStorageRuns();

  // If both sources agree, return Zustand's (it might have a more
  // recent in-memory write that hasn't flushed yet). Otherwise merge
  // and dedup by (playedAt + score).
  if (lsRuns.length === 0) return zustandRuns;
  if (zustandRuns.length === 0) return lsRuns;

  const seen = new Set<string>();
  const merged: import('./leaderboardLogic').LocalRunInput[] = [];
  for (const r of [...zustandRuns, ...lsRuns]) {
    const key = `${r.playedAt}-${r.score}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(r);
  }
  return merged;
}

/**
 * Pure local fallback. Used both as a return value when Supabase
 * is down and as a "my scores" overlay.
 */
export function getLocalEntries(
  mode: GameMode,
  username: string,
): LeaderboardEntry[] {
  if (mode !== 'kanji-drop') return [];
  return aggregateLocalKanjiDropScores(readLocalKanjiDropRuns(), username);
}

export interface FetchOptions {
  mode: GameMode;
  window: TimeWindow;
  limit?: number;
}

/**
 * Fetch top scores from Supabase. Returns [] on error so the page
 * can fall back to local data.
 */
export async function fetchTopScores(opts: FetchOptions): Promise<LeaderboardEntry[]> {
  if (!isSupabaseConfigured) return [];
  const limit = opts.limit ?? DEFAULT_LIMIT;

  try {
    // We fetch more than we need then filter by window client-side.
    // This keeps the SQL simple and gives us room to switch to a
    // windowed query later without changing the page contract.
    const { data, error } = await getSupabase()
      .from('leaderboard_scores')
      .select('*')
      .eq('game_mode', opts.mode)
      .order('score', { ascending: false })
      .order('played_at', { ascending: false })
      .limit(Math.max(limit, 100));

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('[leaderboard] fetchTopScores error:', error.message);
      return [];
    }
    const entries = (data as CloudRow[]).map(rowToEntry);
    return sortByScore(filterByTimeWindow(entries, opts.window), limit);
  } catch (err) {
    // Network errors (DNS, CORS, offline) throw TypeError "Failed to fetch"
    // instead of returning a structured Supabase error. Catch so the page
    // can fall back to local data instead of hanging on "Memuat...".
    // eslint-disable-next-line no-console
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[leaderboard] fetchTopScores network error:', message);
    return [];
  }
}

export interface SubmitPayload {
  userId: string;
  username: string;
  gameMode: GameMode;
  score: number;
  wave: number;
  kills: number;
  maxCombo: number;
  playedAt: string;
}

/**
 * Submit a score to the leaderboard. No-op when Supabase isn't
 * configured (the local store still records it for the local UI).
 * Returns { ok: true } on success, { ok: false, error } on failure.
 */
export async function submitScore(
  payload: SubmitPayload,
): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Supabase belum dikonfigurasi' };
  }
  const { error } = await getSupabase().from('leaderboard_scores').insert({
    user_id: payload.userId,
    username: payload.username,
    game_mode: payload.gameMode,
    score: payload.score,
    wave: payload.wave,
    kills: payload.kills,
    max_combo: payload.maxCombo,
    played_at: payload.playedAt,
  });
  if (error) {
    // eslint-disable-next-line no-console
    console.warn('[leaderboard] submitScore error:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Subscribe to new scores via Realtime. Returns an unsubscribe fn.
 * If Supabase isn't configured, returns a no-op unsubscribe.
 */
export function subscribeToNewScores(
  mode: GameMode,
  onNew: (entry: LeaderboardEntry) => void,
): () => void {
  if (!isSupabaseConfigured) return () => {};
  const channel = getSupabase()
    .channel(`leaderboard-${mode}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'leaderboard_scores', filter: `game_mode=eq.${mode}` },
      (payload) => {
        const row = payload.new as CloudRow;
        if (row.game_mode === mode) onNew(rowToEntry(row));
      },
    )
    .subscribe();
  return () => {
    void getSupabase().removeChannel(channel);
  };
}

/**
 * Merge cloud entries with local runs (dedup by playedAt+score+username).
 * Used by the page so the player always sees their own recent runs,
 * even if the cloud write failed or is pending.
 */
export function mergeWithLocal(
  cloud: LeaderboardEntry[],
  local: LeaderboardEntry[],
): LeaderboardEntry[] {
  const seen = new Set<string>();
  const merged: LeaderboardEntry[] = [];
  for (const e of [...cloud, ...local]) {
    const key = `${e.userId}-${e.playedAt}-${e.score}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(e);
  }
  return merged;
}
