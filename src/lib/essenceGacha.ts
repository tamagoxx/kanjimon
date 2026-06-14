// ============================================================
// Elemental Essence Gacha — pure logic
// ============================================================
// Rolls random element essences for the player in exchange for Diamonds.
// Lives in src/lib/ so it can be unit-tested without React imports.
// ============================================================

export const ESSENCE_TYPES = [
  'FIRE_ESSENCE',
  'WATER_ESSENCE',
  'GRASS_ESSENCE',
  'ELECTRIC_ESSENCE',
  'PSYCHIC_ESSENCE',
  'NORMAL_ESSENCE',
] as const;

export type ElementEssence = typeof ESSENCE_TYPES[number];

export interface EssencePullResult {
  essence: ElementEssence;
  amount: number;
}

// Bundle prices in 💎 (diamond) — bulk discount
export const ESSENCE_PULL_PRICES: Record<1 | 10 | 30 | 100, number> = {
  1: 50,    // base
  10: 450,  // 10% off vs 1×10 = 500
  30: 1200, // 20% off vs 1×30 = 1500
  100: 3500, // 30% off vs 1×100 = 5000
};

// Pick a random essence type (uniform over the 6 elements)
export function rollEssence(rng: () => number = Math.random): ElementEssence {
  return ESSENCE_TYPES[Math.floor(rng() * ESSENCE_TYPES.length)];
}

// Pick a random amount per pull (weighted toward 1-3, rare 4-5 jackpot)
// Distribution: 1=40%, 2=30%, 3=20%, 4=8%, 5=2%
export function rollEssenceAmount(rng: () => number = Math.random): number {
  const r = rng() * 100;
  if (r < 40) return 1;
  if (r < 70) return 2;
  if (r < 90) return 3;
  if (r < 98) return 4;
  return 5;
}

// Simulate N pulls and return one result per pull
export function simulateEssencePulls(
  pulls: number,
  rng: () => number = Math.random,
): EssencePullResult[] {
  if (pulls <= 0) return [];
  const out: EssencePullResult[] = [];
  for (let i = 0; i < pulls; i++) {
    out.push({ essence: rollEssence(rng), amount: rollEssenceAmount(rng) });
  }
  return out;
}

// Calculate the 💎 cost for a number of pulls.
// - 1-9: 50💎 × pulls
// - 10-29: 450💎 per 10-pull bundle (ceil)
// - 30-99: 1200💎 for first 30, then 450💎 per 10-bundle for the rest
// - 100+: 3500💎 flat (cap)
export function calculateEssencePullCost(pulls: number): number {
  if (pulls <= 0) return 0;
  if (pulls >= 100) return ESSENCE_PULL_PRICES[100];
  if (pulls >= 30) {
    const after30 = pulls - 30;
    const extraBundles = Math.ceil(after30 / 10);
    return ESSENCE_PULL_PRICES[30] + extraBundles * ESSENCE_PULL_PRICES[10];
  }
  if (pulls >= 10) {
    const bundles = Math.ceil(pulls / 10);
    return bundles * ESSENCE_PULL_PRICES[10];
  }
  return pulls * ESSENCE_PULL_PRICES[1];
}

// Sum results into a per-essence count map (all 6 keys present)
export function aggregateEssenceResults(
  results: EssencePullResult[],
): Record<ElementEssence, number> {
  const agg = Object.fromEntries(ESSENCE_TYPES.map((e) => [e, 0])) as Record<
    ElementEssence,
    number
  >;
  for (const r of results) {
    agg[r.essence] += r.amount;
  }
  return agg;
}
