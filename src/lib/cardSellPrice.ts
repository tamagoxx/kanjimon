/**
 * Card sell price calculator
 *
 * Returns the dollar + energy reward for selling a card of a given Rarity.
 * Covers all 15 Rarity tiers in the evolution chain (COMMON → OMNIPOTENT).
 *
 * Curve: ~3x growth per tier past MYTHICAL, with LIMITED_EDITION at ~3x ULTRA_RARE.
 * This is steeper than the stat bonus curve (1.5x) to incentivize evolving cards
 * rather than selling them at lower tiers.
 *
 * The energy curve is ~10% of the dollar curve (rounded), capped at reasonable
 * values to prevent energy overflow.
 *
 * Pure utility — no React, no state. Safe to call from anywhere.
 */

import type { Rarity } from '@/types';

export interface SellPrice {
  dollars: number;
  energy: number;
}

/**
 * The full Rarity chain in ascending order.
 * Used by the Pokedex filter UI and by the price table generation.
 */
export const SELLABLE_RARITIES: readonly Rarity[] = [
  'COMMON',
  'UNCOMMON',
  'RARE',
  'ULTRA_RARE',
  'LIMITED_EDITION',
  'LEGENDARY',
  'MYTHICAL',
  'TRANSCENDENT',
  'CELESTIAL',
  'DIVINE',
  'ULTIMATE',
  'ETERNAL',
  'NIHIL',
  'PRIMORDIAL',
  'OMNIPOTENT',
] as const;

/**
 * Sell price table — dollars earned per Rarity tier.
 * Ordered to match SELLABLE_RARITIES (1:1 index).
 *
 * Curve rationale:
 *   COMMON → ULTRA_RARE matches the previous baseline (preserves balance).
 *   LIMITED_EDITION onward grows ~3x per tier.
 */
const DOLLAR_TABLE: Record<Rarity, number> = {
  COMMON: 5,
  UNCOMMON: 15,
  RARE: 50,
  ULTRA_RARE: 200,
  LIMITED_EDITION: 600,
  LEGENDARY: 2_000,
  MYTHICAL: 6_000,
  TRANSCENDENT: 15_000,
  CELESTIAL: 40_000,
  DIVINE: 100_000,
  ULTIMATE: 250_000,
  ETERNAL: 600_000,
  NIHIL: 1_500_000,
  PRIMORDIAL: 5_000_000,
  OMNIPOTENT: 15_000_000,
};

/**
 * Energy reward per Rarity tier.
 * Roughly 1% of dollar value, rounded to a reasonable number.
 *
 * Pre-OMNIPOTENT energy is capped at 500 to prevent energy bar overflow.
 * (The /sell page caps energy gain at 20 - current anyway, but the source
 * value should still be reasonable.)
 */
const ENERGY_TABLE: Record<Rarity, number> = {
  COMMON: 2,
  UNCOMMON: 4,
  RARE: 8,
  ULTRA_RARE: 20,
  LIMITED_EDITION: 50,
  LEGENDARY: 150,
  MYTHICAL: 400,
  TRANSCENDENT: 500,
  CELESTIAL: 500,
  DIVINE: 500,
  ULTIMATE: 500,
  ETERNAL: 500,
  NIHIL: 500,
  PRIMORDIAL: 500,
  OMNIPOTENT: 500,
};

/**
 * Get the sell price (dollars + energy) for a card of the given Rarity.
 *
 * Unknown Rarity values fall back to COMMON pricing rather than 0,
 * so a typo or new tier never silently gives the player nothing.
 */
export function getSellPrice(rarity: Rarity): SellPrice {
  return {
    dollars: DOLLAR_TABLE[rarity] ?? 5,
    energy: ENERGY_TABLE[rarity] ?? 2,
  };
}
