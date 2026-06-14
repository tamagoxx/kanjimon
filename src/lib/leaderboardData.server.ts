// ============================================================
// leaderboardData.server.ts — server-only Supabase data layer
// for the leaderboard. Used by the RSC /leaderboard page.
// ============================================================
//
// Mirrors the browser-only `fetchTopScores` in `./leaderboardData.ts`
// but takes a Supabase client as a parameter (since `getSupabase()`
// in `./supabase.ts` builds a browser client via createBrowserClient).
// The RSC page calls `createServerSupabaseClient()` from
// `@/lib/supabase/server` to get a cookie-aware client, then passes
// it here.
//
// All errors are swallowed and return `[]` so the page can fall
// back to local data without crashing the render.
// ============================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import {
  sortByScore,
  filterByTimeWindow,
  type LeaderboardEntry,
  type GameMode,
  type TimeWindow,
} from './leaderboardLogic';

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

const DEFAULT_LIMIT = 50;
const FETCH_CAP = 100; // always fetch at least this many, then window-filter

export interface FetchOptions {
  mode: GameMode;
  window: TimeWindow;
  limit?: number;
}

/**
 * Server-side top-N query for the leaderboard.
 *
 * Returns `[]` on any failure (env missing handled at caller,
 * table missing, RLS denied, network down) so the RSC page can
 * still render with local fallback data.
 */
export async function fetchTopScoresFromServer(
  supabase: SupabaseClient,
  opts: FetchOptions,
): Promise<LeaderboardEntry[]> {
  const limit = opts.limit ?? DEFAULT_LIMIT;
  try {
    const { data, error } = await supabase
      .from('leaderboard_scores')
      .select('*')
      .eq('game_mode', opts.mode)
      .order('score', { ascending: false })
      .order('played_at', { ascending: false })
      .limit(Math.max(limit, FETCH_CAP));

    if (error) {
      // eslint-disable-next-line no-console
      console.warn('[leaderboard:server] fetch error:', error.message);
      return [];
    }
    if (!data) return [];
    const entries = (data as CloudRow[]).map(rowToEntry);
    return sortByScore(filterByTimeWindow(entries, opts.window), limit);
  } catch (err) {
    // Network errors (DNS, CORS, offline) throw TypeError "Failed to fetch"
    // instead of returning a structured Supabase error.
    // eslint-disable-next-line no-console
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[leaderboard:server] network error:', message);
    return [];
  }
}
