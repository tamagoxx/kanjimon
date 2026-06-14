import { describe, it, expect } from 'vitest';
import {
  ESSENCE_TYPES,
  ESSENCE_PULL_PRICES,
  rollEssence,
  rollEssenceAmount,
  simulateEssencePulls,
  calculateEssencePullCost,
  aggregateEssenceResults,
  type ElementEssence,
  type EssencePullResult,
} from './essenceGacha';

describe('ESSENCE_TYPES', () => {
  it('has exactly 6 element types', () => {
    expect(ESSENCE_TYPES).toHaveLength(6);
  });

  it('contains all 6 expected types', () => {
    expect(ESSENCE_TYPES).toEqual([
      'FIRE_ESSENCE', 'WATER_ESSENCE', 'GRASS_ESSENCE',
      'ELECTRIC_ESSENCE', 'PSYCHIC_ESSENCE', 'NORMAL_ESSENCE',
    ]);
  });
});

describe('rollEssence', () => {
  it('returns one of the 6 valid essence types', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollEssence();
      expect(ESSENCE_TYPES).toContain(result);
    }
  });

  it('is deterministic with seeded RNG (rng returns 0 → first type)', () => {
    expect(rollEssence(() => 0)).toBe('FIRE_ESSENCE');
  });

  it('is deterministic with seeded RNG (rng returns 0.99 → last type)', () => {
    // 0.99 * 6 = 5.94 → floor = 5 → NORMAL_ESSENCE
    expect(rollEssence(() => 0.99)).toBe('NORMAL_ESSENCE');
  });

  it('uniform distribution over many rolls (6 elements × ~1000 rolls)', () => {
    const counts: Record<string, number> = {};
    for (let i = 0; i < 6000; i++) {
      const e = rollEssence();
      counts[e] = (counts[e] || 0) + 1;
    }
    // Each should be ~1000 (±25% tolerance)
    for (const t of ESSENCE_TYPES) {
      expect(counts[t]).toBeGreaterThan(700);
      expect(counts[t]).toBeLessThan(1300);
    }
  });
});

describe('rollEssenceAmount', () => {
  it('returns amount between 1 and 5 inclusive', () => {
    for (let i = 0; i < 200; i++) {
      const v = rollEssenceAmount();
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('weighted distribution — most rolls are 1-3, few are 4-5', () => {
    let high = 0; // 4 or 5
    for (let i = 0; i < 1000; i++) {
      if (rollEssenceAmount() >= 4) high++;
    }
    // 4+5 weighted = 8+2 = 10% → ~100 of 1000
    expect(high).toBeGreaterThan(50);
    expect(high).toBeLessThan(200);
  });
});

describe('simulateEssencePulls', () => {
  it('returns N results for N pulls', () => {
    const results = simulateEssencePulls(5);
    expect(results).toHaveLength(5);
  });

  it('each result has valid essence type and integer amount 1-5', () => {
    const results = simulateEssencePulls(20);
    for (const r of results) {
      expect(ESSENCE_TYPES).toContain(r.essence);
      expect(r.amount).toBeGreaterThanOrEqual(1);
      expect(r.amount).toBeLessThanOrEqual(5);
    }
  });

  it('handles 0 pulls (empty array)', () => {
    expect(simulateEssencePulls(0)).toEqual([]);
  });

  it('handles large batches (100 pulls)', () => {
    const results = simulateEssencePulls(100);
    expect(results).toHaveLength(100);
  });
});

describe('calculateEssencePullCost', () => {
  it('single pull costs 50💎', () => {
    expect(calculateEssencePullCost(1)).toBe(50);
  });

  it('2-9 pulls cost 50💎 per pull (no bulk discount)', () => {
    expect(calculateEssencePullCost(5)).toBe(250);
    expect(calculateEssencePullCost(9)).toBe(450);
  });

  it('10-pull bundle costs 450💎 (10% off)', () => {
    expect(calculateEssencePullCost(10)).toBe(450);
  });

  it('11-29 pulls cost 10-pull bundle × ceil(pulls/10)', () => {
    expect(calculateEssencePullCost(11)).toBe(900);  // 2× 10-pull
    expect(calculateEssencePullCost(20)).toBe(900);
    expect(calculateEssencePullCost(29)).toBe(1350);
  });

  it('30-pull bundle costs 1200💎 (20% off)', () => {
    expect(calculateEssencePullCost(30)).toBe(1200);
  });

  it('31-99 pulls cost 30-pull + 10-pulls for remainder (ceil)', () => {
    expect(calculateEssencePullCost(31)).toBe(1650);  // 30 + ceil(1/10)·450
    expect(calculateEssencePullCost(40)).toBe(1650);  // 30 + 1×10
    expect(calculateEssencePullCost(50)).toBe(2100);  // 30 + 2×10
    expect(calculateEssencePullCost(99)).toBe(4350);  // 30 + 7×10
  });

  it('100-pull bundle costs 3500💎 (30% off)', () => {
    expect(calculateEssencePullCost(100)).toBe(3500);
  });

  it('caps at 100 pulls (101+ same cost as 100)', () => {
    expect(calculateEssencePullCost(101)).toBe(3500);
    expect(calculateEssencePullCost(500)).toBe(3500);
  });

  it('returns 0 for 0 pulls', () => {
    expect(calculateEssencePullCost(0)).toBe(0);
  });
});

describe('ESSENCE_PULL_PRICES', () => {
  it('exposes the bundle tiers as a constant', () => {
    expect(ESSENCE_PULL_PRICES).toEqual({ 1: 50, 10: 450, 30: 1200, 100: 3500 });
  });
});

describe('aggregateEssenceResults', () => {
  it('returns 0 for every essence when input is empty', () => {
    const agg = aggregateEssenceResults([]);
    for (const t of ESSENCE_TYPES) {
      expect(agg[t]).toBe(0);
    }
  });

  it('sums amounts per essence type', () => {
    const results: EssencePullResult[] = [
      { essence: 'FIRE_ESSENCE', amount: 3 },
      { essence: 'WATER_ESSENCE', amount: 2 },
      { essence: 'FIRE_ESSENCE', amount: 1 },
    ];
    const agg = aggregateEssenceResults(results);
    expect(agg.FIRE_ESSENCE).toBe(4);
    expect(agg.WATER_ESSENCE).toBe(2);
    expect(agg.GRASS_ESSENCE).toBe(0);
  });

  it('all 6 keys present in result', () => {
    const agg = aggregateEssenceResults([]);
    expect(Object.keys(agg).sort()).toEqual([...ESSENCE_TYPES].sort());
  });
});
