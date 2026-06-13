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
 * HP / Attack ranges per rarity.
 * Mirrors RARITY_STATS in src/data/cards.ts (kept in sync — this is the single source).
 * Bug fix: previously Math.random() in cards.ts re-rolled stats on every module load,
 * causing collection ↔ battle stats to drift.
 */
const STAT_RANGES: Record<Rarity, { hp: [number, number]; attack: [number, number] }> = {
  COMMON: { hp: [60, 90], attack: [10, 25] },
  UNCOMMON: { hp: [90, 130], attack: [25, 40] },
  RARE: { hp: [130, 170], attack: [40, 60] },
  ULTRA_RARE: { hp: [170, 200], attack: [60, 80] },
  LIMITED_EDITION: { hp: [200, 230], attack: [80, 100] },
  LEGENDARY: { hp: [230, 270], attack: [100, 130] },
  MYTHICAL: { hp: [270, 350], attack: [130, 180] },
  TRANSCENDENT: { hp: [350, 420], attack: [180, 220] },
  CELESTIAL: { hp: [420, 500], attack: [220, 270] },
  DIVINE: { hp: [500, 600], attack: [270, 330] },
  ULTIMATE: { hp: [600, 720], attack: [330, 400] },
  ETERNAL: { hp: [720, 900], attack: [400, 500] },
  NIHIL: { hp: [900, 1100], attack: [500, 620] },
  PRIMORDIAL: { hp: [1100, 1300], attack: [620, 760] },
  OMNIPOTENT: { hp: [1300, 1500], attack: [760, 900] },
};

/**
 * Get deterministic hp/attack for a (cardId, rarity) pair.
 * Uses two independent sub-hashes so hp and attack vary independently per id.
 * Unknown rarity falls back to COMMON range (safe default).
 */
export function getCardStats(
  id: string,
  rarity: Rarity,
): { hp: number; attackPower: number } {
  const r = STAT_RANGES[rarity] ?? STAT_RANGES.COMMON;
  const hpHash = hashIdToFloat(`${id}__hp`);
  const atkHash = hashIdToFloat(`${id}__atk`);
  const hpRange = r.hp[1] - r.hp[0];
  const atkRange = r.attack[1] - r.attack[0];
  const hp = r.hp[0] + Math.floor(hpHash * hpRange);
  const attackPower = r.attack[0] + Math.floor(atkHash * atkRange);
  return { hp, attackPower };
}
