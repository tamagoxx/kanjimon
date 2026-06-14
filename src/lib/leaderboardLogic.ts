// ============================================================
// Leaderboard — Pure decision logic (no React, no Supabase)
// ============================================================

export type GameMode = 'kanji-drop' | 'battle' | 'kanji-stack';
export type TimeWindow = 'TODAY' | 'THIS_WEEK' | 'ALL_TIME';

export interface LeaderboardEntry {
  /** Stable id — Supabase uuid for cloud, derived for local */
  id: string;
  userId: string;
  username: string;
  gameMode: GameMode;
  score: number;
  wave: number;
  kills: number;
  maxCombo: number;
  /** ISO timestamp string */
  playedAt: string;
}

export interface LocalRunInput {
  score: number;
  wave: number;
  kills: number;
  maxCombo: number;
  durationSec: number;
  destroyed: string[];
  playedAt: string;
}

const WINDOW_MS: Record<TimeWindow, number> = {
  TODAY: 24 * 60 * 60 * 1000,
  THIS_WEEK: 7 * 24 * 60 * 60 * 1000,
  ALL_TIME: Number.POSITIVE_INFINITY,
};

/**
 * Sort entries by score desc, then by playedAt desc (newer = higher rank on tie).
 * If limit provided, truncate to top N.
 */
export function sortByScore(
  entries: LeaderboardEntry[],
  limit?: number,
): LeaderboardEntry[] {
  const sorted = [...entries].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime();
  });
  return typeof limit === 'number' ? sorted.slice(0, limit) : sorted;
}

/**
 * Filter entries to a time window. nowMs defaults to Date.now().
 * "TODAY" = last 24h, "THIS_WEEK" = last 7 days, "ALL_TIME" = keep all.
 */
export function filterByTimeWindow(
  entries: LeaderboardEntry[],
  window: TimeWindow,
  nowMs: number = Date.now(),
): LeaderboardEntry[] {
  const cutoff = nowMs - WINDOW_MS[window];
  return entries.filter((e) => new Date(e.playedAt).getTime() >= cutoff);
}

/**
 * Get the 1-indexed rank of a user in an entry list.
 * Returns null when user is not present.
 * IMPORTANT: pass entries that are already sorted (e.g. via sortByScore).
 */
export function getUserRank(
  entries: LeaderboardEntry[],
  userId: string,
): number | null {
  const idx = entries.findIndex((e) => e.userId === userId);
  return idx === -1 ? null : idx + 1;
}

/**
 * Convert local kanji-drop runs into LeaderboardEntry[].
 * All entries are attributed to the current user.
 *
 * `id` is a stable hash of (playedAt + score) so React keys stay stable
 * across re-renders even if the source array is re-created.
 */
export function aggregateLocalKanjiDropScores(
  runs: LocalRunInput[],
  username: string,
): LeaderboardEntry[] {
  return runs.map((r) => ({
    id: `local-${r.playedAt}-${r.score}`,
    userId: 'me',
    username,
    gameMode: 'kanji-drop',
    score: r.score,
    wave: r.wave,
    kills: r.kills,
    maxCombo: r.maxCombo,
    playedAt: r.playedAt,
  }));
}
