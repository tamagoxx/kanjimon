// ============================================================
// Leaderboard — Pure decision logic (no React, no Supabase)
// ============================================================

export type GameMode = 'kanji-drop' | 'battle' | 'kanji-stack' | 'memory-match';

/**
 * Display + UX metadata for each game mode shown in the leaderboard
 * tabs and empty-state CTAs. Single source of truth — the
 * LeaderboardClient imports this instead of hardcoding labels.
 *
 * Adding a new mode:
 *   1. Extend the `GameMode` union above.
 *   2. Add an entry below.
 *   3. The "every GameMode has a config" test will fail until you do.
 */
export interface GameModeConfig {
  id: GameMode;
  /** Short label shown in the mode tab. */
  label: string;
  /** Emoji / icon shown next to the label. */
  icon: string;
  /** Helper text shown in the empty state ("Belum ada skor …"). */
  emptyMessage: string;
  /** Path of the "Main Sekarang" CTA button. */
  ctaPath: string;
  /** CTA button text. */
  ctaLabel: string;
}

const GAME_MODE_CONFIGS: Record<GameMode, GameModeConfig> = {
  'kanji-drop': {
    id: 'kanji-drop',
    label: 'Kanji Drop',
    icon: '⏬',
    emptyMessage: 'Mainkan Kanji Drop untuk masuk leaderboard!',
    ctaPath: '/kanji-drop',
    ctaLabel: 'Main Kanji Drop →',
  },
  battle: {
    id: 'battle',
    label: 'Battle',
    icon: '⚔️',
    emptyMessage: 'Menangkan battle untuk masuk leaderboard!',
    ctaPath: '/battle',
    ctaLabel: 'Mulai Battle →',
  },
  'kanji-stack': {
    id: 'kanji-stack',
    label: 'Kanji Stack',
    icon: '🗂',
    emptyMessage: 'Susun kartu di Kanji Stack untuk masuk leaderboard!',
    ctaPath: '/kanji-stack',
    ctaLabel: 'Main Kanji Stack →',
  },
  'memory-match': {
    id: 'memory-match',
    label: 'Memory Match',
    icon: '🧠',
    emptyMessage: 'Mainkan Memory Match untuk masuk leaderboard!',
    ctaPath: '/memory-match',
    ctaLabel: 'Main Memory Match →',
  },
};

/** All game modes in the order they should appear as tabs. */
export const ALL_GAME_MODES: readonly GameMode[] = [
  'kanji-drop',
  'battle',
  'kanji-stack',
  'memory-match',
] as const;

/** Get the display/UX config for a game mode. */
export function getGameModeConfig(mode: GameMode): GameModeConfig {
  return GAME_MODE_CONFIGS[mode];
}
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
