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

import { supabase, isSupabaseConfigured } from './supabase';
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
 * Read the most recent N runs from local kanjiDrop store.
 * Returns [] if SSR or no runs.
 *
 * Uses useKanjiDropStore.getState() which works outside React lifecycle.
 * Guarded with typeof window to avoid SSR.
 */
export function readLocalKanjiDropRuns(): import('./leaderboardLogic').LocalRunInput[] {
  if (typeof window === 'undefined') return [];
  try {
    const state = useKanjiDropStore.getState();
    return state.recentRuns;
  } catch {
    return [];
  }
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

  // We fetch more than we need then filter by window client-side.
  // This keeps the SQL simple and gives us room to switch to a
  // windowed query later without changing the page contract.
  const { data, error } = await supabase
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
  const { error } = await supabase.from('leaderboard_scores').insert({
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
  const channel = supabase
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
    void supabase.removeChannel(channel);
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
