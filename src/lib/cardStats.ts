import type { Rarity } from '@/types';

/**
 * FNV-1a 32-bit hash. Deterministic across JS engines for the same string.
 * Used so a card's stats are stable across module loads (collection ↔ battle).
 */
function fnv1a(str: string): number {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV prime
  }
  return hash >>> 0; // unsigned 32-bit
}

/**
 * Map a card id to a deterministic float in [0, 1).
 * Same id → same float. Different ids → different floats (FNV-1a, no practical collision).
 */
export function hashIdToFloat(id: string): number {
  return fnv1a(id) / 0x100000000; // 2^32
}

/**
 * HP / Attack / Defense ranges per rarity.
 * Mirrors RARITY_STATS in src/data/cards.ts (kept in sync — this is the single source).
 * Bug fix: previously Math.random() in cards.ts re-rolled stats on every module load,
 * causing collection ↔ battle stats to drift.
 *
 * Defense scale (2026-06): ~40-50% of attack range per rarity. Before this fix,
 * defense was a flat 1-3 by card type (VERB/NOUN/ADJ/PARTICLE), detached from
 * rarity. With min damage floor 5, that 1-3 was invisible. New scale makes
 * defense a real stat that scales with card strength.
 */
const STAT_RANGES: Record<Rarity, { hp: [number, number]; attack: [number, number]; defense: [number, number] }> = {
  COMMON: { hp: [60, 90], attack: [10, 25], defense: [5, 12] },
  UNCOMMON: { hp: [90, 130], attack: [25, 40], defense: [12, 20] },
  RARE: { hp: [130, 170], attack: [40, 60], defense: [20, 30] },
  ULTRA_RARE: { hp: [170, 200], attack: [60, 80], defense: [30, 40] },
  LIMITED_EDITION: { hp: [200, 230], attack: [80, 100], defense: [40, 50] },
  LEGENDARY: { hp: [230, 270], attack: [100, 130], defense: [50, 70] },
  MYTHICAL: { hp: [270, 350], attack: [130, 180], defense: [70, 90] },
  TRANSCENDENT: { hp: [350, 420], attack: [180, 220], defense: [90, 110] },
  CELESTIAL: { hp: [420, 500], attack: [220, 270], defense: [110, 140] },
  DIVINE: { hp: [500, 600], attack: [270, 330], defense: [140, 170] },
  ULTIMATE: { hp: [600, 720], attack: [330, 400], defense: [170, 210] },
  ETERNAL: { hp: [720, 900], attack: [400, 500], defense: [210, 260] },
  NIHIL: { hp: [900, 1100], attack: [500, 620], defense: [260, 320] },
  PRIMORDIAL: { hp: [1100, 1300], attack: [620, 760], defense: [320, 390] },
  OMNIPOTENT: { hp: [1300, 1500], attack: [760, 900], defense: [390, 470] },
};

/**
 * Get deterministic hp/attack/defense for a (cardId, rarity) pair.
 * Uses three independent sub-hashes so hp, attack, and defense vary
 * independently per id. Unknown rarity falls back to COMMON range (safe default).
 */
export function getCardStats(
  id: string,
  rarity: Rarity,
): { hp: number; attackPower: number; defensePower: number } {
  const r = STAT_RANGES[rarity] ?? STAT_RANGES.COMMON;
  const hpHash = hashIdToFloat(`${id}__hp`);
  const atkHash = hashIdToFloat(`${id}__atk`);
  const defHash = hashIdToFloat(`${id}__def`);
  const hpRange = r.hp[1] - r.hp[0];
  const atkRange = r.attack[1] - r.attack[0];
  const defRange = r.defense[1] - r.defense[0];
  const hp = r.hp[0] + Math.floor(hpHash * hpRange);
  const attackPower = r.attack[0] + Math.floor(atkHash * atkRange);
  const defensePower = r.defense[0] + Math.floor(defHash * defRange);
  return { hp, attackPower, defensePower };
}

/**
 * Get the effective defense for a card. Source of truth is the deterministic
 * getCardStats hash — ignores any stored `defenseRating` on the card.
 *
 * Migration: pre-a90cfab stored cards had `defenseRating: 1-3` (flat by type).
 * Post-a90cfab stored cards have `defenseRating: 5-470` (rarity-scaled). This
 * helper normalizes both cases to the new rarity-scaled value, so old stored
 * cards display and battle correctly without localStorage migration.
 *
 * Falls back to stored `defenseRating` only when id/rarity are missing
 * (e.g., legacy fixtures or non-jp card shapes).
 *
 * Browser-verified 2026-06-13: injected 4 cards (3 COMMON stored def:5,
 * 1 LEGENDARY stored def:10) into localStorage. /collection displayed
 * 11/10/11/50 respectively — different per id (FNV-1a hash), in correct
 * rarity ranges (COMMON 5-12, LEGENDARY 50-70). Battle page uses this
 * helper at L1953/L1981 for player deck defense.
 */
export function getEffectiveDefense(card: {
  id?: string;
  rarity?: Rarity;
  defenseRating?: number;
}): number {
  if (card.id && card.rarity) {
    return getCardStats(card.id, card.rarity).defensePower;
  }
  return card.defenseRating ?? 0;
}
