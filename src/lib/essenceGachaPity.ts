// ============================================================
// Essence Gacha Pity — pure logic
// ============================================================
// Guarantees the player gets at least one rare (amount=4) within 50 pulls
// and at least one jackpot (amount=5) within 100 pulls, regardless of RNG.
//
// Lives in src/lib/ so it can be unit-tested without React imports.
// ============================================================

import { rollEssenceAmount } from './essenceGacha';
import type { ElementEssence } from './essenceGacha';

export const PITY_4_THRESHOLD = 50;
export const PITY_5_THRESHOLD = 100;

export interface PityState {
  pullsSinceRare4: number;   // increments per pull, resets on amount >= 4
  pullsSinceJackpot5: number; // increments per pull, resets on amount === 5
}

export const FRESH_PITY: PityState = {
  pullsSinceRare4: 0,
  pullsSinceJackpot5: 0,
};

export interface PityAmountResult {
  amount: number;
  newPity: PityState;
}

export interface PityPullResult {
  essence: ElementEssence;
  amount: number;
}

/**
 * Roll an essence amount with pity override.
 *
 * Pity priority (highest first):
 * 1. If pullsSinceJackpot5 >= PITY_5_THRESHOLD → force amount=5
 * 2. If pullsSinceRare4 >= PITY_4_THRESHOLD → force amount=4
 * 3. Otherwise → use base weighted roll
 *
 * After roll:
 * - pullsSinceJackpot5 resets to 0 if amount === 5
 * - pullsSinceRare4 resets to 0 if amount >= 4
 * - Otherwise counters increment by 1
 */
export function rollEssenceAmountWithPity(
  pity: PityState,
  rng: () => number = Math.random,
): PityAmountResult {
  let amount: number;

  // Pity fires on the THRESHOLD'th pull (e.g. 50th pull after 49 unsuccessful).
  // Check `+ 1` to convert "counter" to "upcoming pull number".
  if (pity.pullsSinceJackpot5 + 1 >= PITY_5_THRESHOLD) {
    // Jackpot pity takes priority (rarer + more specific guarantee)
    amount = 5;
  } else if (pity.pullsSinceRare4 + 1 >= PITY_4_THRESHOLD) {
    // Rare pity
    amount = 4;
  } else {
    amount = rollEssenceAmount(rng);
  }

  const newPity: PityState = {
    pullsSinceRare4: amount >= 4 ? 0 : pity.pullsSinceRare4 + 1,
    pullsSinceJackpot5: amount === 5 ? 0 : pity.pullsSinceJackpot5 + 1,
  };

  return { amount, newPity };
}

/**
 * Pull N essences with pity, using the same RNG for element + amount selection.
 * Uses an internal combined RNG that draws two values per pull (element + amount).
 */
export function pullWithPity(
  pulls: number,
  pity: PityState,
  rng: () => number = Math.random,
): { results: PityPullResult[]; newPity: PityState } {
  if (pulls <= 0) return { results: [], newPity: pity };

  const ESSENCE_TYPES: readonly ElementEssence[] = [
    'FIRE_ESSENCE', 'WATER_ESSENCE', 'GRASS_ESSENCE',
    'ELECTRIC_ESSENCE', 'PSYCHIC_ESSENCE', 'NORMAL_ESSENCE',
  ];

  const results: PityPullResult[] = [];
  let currentPity = pity;

  for (let i = 0; i < pulls; i++) {
    const elementIdx = Math.floor(rng() * ESSENCE_TYPES.length);
    const essence = ESSENCE_TYPES[elementIdx];
    // Use a "branch" RNG that delegates to the same source for amount
    // We pass a fresh closure that calls rng() for the amount too
    const { amount, newPity } = rollEssenceAmountWithPity(currentPity, rng);
    results.push({ essence, amount });
    currentPity = newPity;
  }

  return { results, newPity: currentPity };
}
