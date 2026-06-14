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
  rank: number;
  username: string;
  score: number;
  gameMode: GameMode;
  medal: '🥇' | '🥈' | '🥉' | null;
}

const MEDALS: Array<'🥇' | '🥈' | '🥉' | null> = ['🥇', '🥈', '🥉', null, null];

/**
 * Map raw leaderboard rows (assumed pre-sorted by the caller —
 * Supabase `.order('score', { ascending: false })`) into UI
 * entries with rank + medal. Caps medals at top 3; everyone
 * else gets null.
 */
export function mapTopScores(rows: LeaderboardScoreRow[]): TopScoreEntry[] {
  return rows.map((r, i) => ({
    rank: i + 1,
    username: r.username,
    score: r.score,
    gameMode: r.game_mode,
    medal: MEDALS[i] ?? null,
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
