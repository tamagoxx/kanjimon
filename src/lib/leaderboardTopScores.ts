// ============================================================
// leaderboardTopScores.ts — Pure mapper: raw rows → ranked entries
// ============================================================
//
// Use this anywhere you need to display a "Top N" leaderboard
// list. The widget component handles fetching; this module is
// 100% pure so it's trivially testable and stable across server /
// client boundaries.
// ============================================================

import type { LeaderboardScoreRow, GameMode } from '@/lib/supabase/types';

export interface TopScoreEntry {
  /** Stable React key — the row's uuid. Survives reorders. */
  id: string;
  rank: number;
  username: string;
  score: number;
  gameMode: GameMode;
  medal: '🥇' | '🥈' | '🥉' | null;
  /** ISO-8601 timestamp from `played_at` — feed into formatRelativeTime(). */
  playedAt: string;
}

const MEDALS: Array<'🥇' | '🥈' | '🥉' | null> = ['🥇', '🥈', '🥉', null, null];

/**
 * Map raw leaderboard rows (assumed pre-sorted by the caller —
 * Supabase `.order('score', { ascending: false })`) into UI
 * entries with rank + medal. Caps medals at top 3; everyone
 * else gets null. Propagates `id` and `playedAt` so the caller
 * can use a stable React key and render relative time.
 */
export function mapTopScores(rows: LeaderboardScoreRow[]): TopScoreEntry[] {
  return rows.map((r, i) => ({
    id: r.id,
    rank: i + 1,
    username: r.username,
    score: r.score,
    gameMode: r.game_mode,
    medal: MEDALS[i] ?? null,
    playedAt: r.played_at,
  }));
}

/** Game-mode display label (Indonesian). */
export function gameModeLabel(mode: GameMode): string {
  switch (mode) {
    case 'kanji-drop':
      return 'Kanji Drop';
    case 'kanji-stack':
      return 'Kanji Stack';
    case 'battle':
      return 'Battle';
  }
}

/** Game-mode emoji (for the top-scores widget). */
export function gameModeIcon(mode: GameMode): string {
  switch (mode) {
    case 'kanji-drop':
      return '🌧️';
    case 'kanji-stack':
      return '🧱';
    case 'battle':
      return '⚔️';
  }
}
