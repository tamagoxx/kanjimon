// ============================================================
// Post-Battle Actions
// Pure helpers for choosing the next opponent after a battle.
// Battle page wires these to the ResultModal buttons.
// ============================================================

export interface OpponentRef {
  id: string;
  name: string;
  level: number;
}

export interface PostBattleAction {
  id: 'restart' | 'play-again' | 'next-chapter' | 'back';
  label: string; // Indonesian UI string
  emoji: string;
  description: string; // tooltip / aria-label
}

/**
 * Returns the next opponent in the list (by order). Null if current is last
 * or current is not in the list.
 */
export function getNextOpponent<T extends OpponentRef>(
  current: T,
  opponents: readonly T[]
): T | null {
  const idx = opponents.findIndex((o) => o.id === current.id);
  if (idx === -1) return null;
  if (idx === opponents.length - 1) return null;
  return opponents[idx + 1];
}

/**
 * Returns true when there is a next opponent available.
 */
export function canGoNextChapter<T extends OpponentRef>(
  current: T,
  opponents: readonly T[]
): boolean {
  return getNextOpponent(current, opponents) !== null;
}

/**
 * Returns a random opponent that is NOT the current one.
 * Returns null when there is no other opponent to choose.
 *
 * Note: not seeded — visual variety is enough. Tests assert inequality, not
 * distribution, so no PRNG dependency is needed.
 */
export function getRandomOpponent<T extends OpponentRef>(
  current: T,
  opponents: readonly T[]
): T | null {
  const others = opponents.filter((o) => o.id !== current.id);
  if (others.length === 0) return null;
  const idx = Math.floor(Math.random() * others.length);
  return others[idx];
}

/**
 * 4 post-battle action buttons in display order. Battle page renders these
 * in the ResultModal after a normal Battle Card match finishes.
 *
 * - restart: replay SAME opponent with fresh state (HP, energy, turn)
 * - play-again: random opponent (mix it up)
 * - next-chapter: progress to next opponent in story order
 * - back: return to deck selection
 */
export const POST_BATTLE_ACTIONS: readonly PostBattleAction[] = [
  {
    id: 'restart',
    label: 'Restart',
    emoji: '🔄',
    description: 'Ulangi battle dengan opponent yang sama (HP fresh)',
  },
  {
    id: 'play-again',
    label: 'Main Lagi',
    emoji: '🎲',
    description: 'Pilih opponent secara acak',
  },
  {
    id: 'next-chapter',
    label: 'Next Chapter',
    emoji: '⏭️',
    description: 'Lanjut ke opponent berikutnya',
  },
  {
    id: 'back',
    label: 'Kembali',
    emoji: '🏠',
    description: 'Kembali ke pilihan deck',
  },
] as const;
