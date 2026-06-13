/**
 * Battle HP calculation utilities.
 *
 * Bug fix: playerMaxHp was hardcoded to `100 + (level-1)*10` in /battle/page.tsx,
 * ignoring deck strength. Now HP scales with the average HP of the player's deck
 * (so a stronger deck → more HP), while preserving a floor of BASE_HP and the
 * existing per-level scaling.
 */

export interface DeckCard {
  hp?: number;
}

const BASE_HP = 100;
const LEVEL_BONUS_PER_LEVEL = 10; // 10 HP per level above 1
const DECK_AVG_BASELINE = 80;     // avg HP at which deck bonus = 0
const DECK_BONUS_MULTIPLIER = 0.5; // (avg - baseline) * 0.5 = bonus HP

/**
 * Player max HP for a battle.
 * Formula: BASE_HP + (level-1)*10 + max(0, floor((avgDeckHp - 80) * 0.5))
 *
 * - Empty deck → BASE_HP + level scaling (was 100 hardcoded; now scales w/ level)
 * - Avg deck HP = 80 → no deck bonus
 * - Avg deck HP > 80 → bonus (e.g. RARE cards avg ~150 → +35 HP)
 * - Avg deck HP < 80 → floored at 0 bonus (no penalty for fresh accounts)
 */
export function calculatePlayerMaxHp(
  deck: DeckCard[] = [],
  level: number = 1,
): number {
  const safeLevel = Math.max(1, level);
  if (deck.length === 0) {
    return BASE_HP + (safeLevel - 1) * LEVEL_BONUS_PER_LEVEL;
  }
  const avgDeckHp =
    deck.reduce((sum, c) => sum + (c.hp ?? DECK_AVG_BASELINE), 0) / deck.length;
  const deckBonus = Math.max(
    0,
    Math.floor((avgDeckHp - DECK_AVG_BASELINE) * DECK_BONUS_MULTIPLIER),
  );
  return (
    BASE_HP +
    (safeLevel - 1) * LEVEL_BONUS_PER_LEVEL +
    deckBonus
  );
}

/**
 * Opponent max HP for non-boss battles. The opponent's `hp` is already its
 * starting/max HP, so we just return it.
 */
export function calculateOpponentMaxHp(opponent: { hp: number }): number {
  return opponent.hp;
}

/**
 * Boss max HP for boss battles. The boss's `maxHp` is its scaled max for
 * the chosen level (1.05^level scaling already applied upstream).
 */
export function calculateBossMaxHp(boss: { maxHp: number }): number {
  return boss.maxHp;
}
