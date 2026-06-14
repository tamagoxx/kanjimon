/**
 * Battle HP calculation utilities.
 *
 * Player battle stats (HP/Attack/Defense) are derived from the 5 cards in the
 * player's active deck. All 3 card types (Japanese, Pokemon, Fused) are
 * normalized to a unified `DeckStats` shape and aggregated by
 * `calculatePlayerStatsFromDeck`. The caller is responsible for the field-name
 * normalization (e.g. attackPower → attack for Japanese cards).
 */

export interface DeckStats {
  hp?: number;
  attack?: number;
  defense?: number;
}

export interface PlayerStats {
  hp: number;
  attack: number;
  defense: number;
}

const BASE_HP = 100;
const LEVEL_BONUS_PER_LEVEL = 10; // 10 HP per level above 1

/**
 * Player battle stats derived from the 5 cards in the player's active deck.
 *
 * Accepts a unified `DeckStats` shape ({ hp, attack, defense }). All 3 deck
 * card types (Japanese, Pokemon, Fused Pokemon) must be normalized to this
 * shape by the caller (see /app/battle/page.tsx prefix dispatch).
 *
 * - HP: sum of card.hp + (level-1)*10 (level bonus preserves progression)
 * - Attack: sum of card.attack (no level bonus — cards ARE the source)
 * - Defense: sum of card.defense (no level bonus)
 * - Empty deck → hp=BASE_HP, attack=0, defense=0
 */
export function calculatePlayerStatsFromDeck(
  deck: DeckStats[] = [],
  level: number = 1,
): PlayerStats {
  const safeLevel = Math.max(1, level);
  if (deck.length === 0) {
    return { hp: BASE_HP, attack: 0, defense: 0 };
  }
  const totalHp = deck.reduce((sum, c) => sum + (c.hp ?? 0), 0);
  const totalAtk = deck.reduce((sum, c) => sum + (c.attack ?? 0), 0);
  const totalDef = deck.reduce((sum, c) => sum + (c.defense ?? 0), 0);
  const levelBonus = (safeLevel - 1) * LEVEL_BONUS_PER_LEVEL;
  return {
    hp: totalHp + levelBonus,
    attack: totalAtk,
    defense: totalDef,
  };
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
