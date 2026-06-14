import { describe, it, expect, vi } from 'vitest';
import {
  PITY_4_THRESHOLD,
  PITY_5_THRESHOLD,
  rollEssenceAmountWithPity,
  pullWithPity,
  type PityState,
} from './essenceGachaPity';

const freshPity: PityState = { pullsSinceRare4: 0, pullsSinceJackpot5: 0 };

describe('pity thresholds', () => {
  it('PITY_4_THRESHOLD = 50', () => expect(PITY_4_THRESHOLD).toBe(50));
  it('PITY_5_THRESHOLD = 100', () => expect(PITY_5_THRESHOLD).toBe(100));
});

describe('rollEssenceAmountWithPity', () => {
  it('returns random amount when far from pity', () => {
    const rng = vi.fn().mockReturnValue(0.5); // → amount 2 from base
    const result = rollEssenceAmountWithPity(freshPity, rng);
    expect(result.amount).toBe(2);
    expect(result.newPity.pullsSinceRare4).toBe(1);
    expect(result.newPity.pullsSinceJackpot5).toBe(1);
  });

  it('resets pullsSinceRare4 when amount >= 4', () => {
    const rng = vi.fn().mockReturnValue(0.99); // → amount 5
    const pity: PityState = { pullsSinceRare4: 30, pullsSinceJackpot5: 30 };
    const result = rollEssenceAmountWithPity(pity, rng);
    expect(result.amount).toBe(5);
    expect(result.newPity.pullsSinceRare4).toBe(0);  // reset
    expect(result.newPity.pullsSinceJackpot5).toBe(0); // reset (5 is jackpot)
  });

  it('resets pullsSinceRare4 when amount = 4 (not 5)', () => {
    const rng = vi.fn().mockReturnValue(0.97); // → amount 4 (r=97, in 98 range)
    const pity: PityState = { pullsSinceRare4: 45, pullsSinceJackpot5: 80 };
    const result = rollEssenceAmountWithPity(pity, rng);
    expect(result.amount).toBe(4);
    expect(result.newPity.pullsSinceRare4).toBe(0);   // reset
    expect(result.newPity.pullsSinceJackpot5).toBe(81); // NOT reset (4 isn't jackpot)
  });

  it('forces amount = 4 when pullsSinceRare4 hits 49 (next pull pity)', () => {
    // At 49, the next pull (50th) is guaranteed 4
    const rng = vi.fn().mockReturnValue(0.1); // would normally be 1
    const pity: PityState = { pullsSinceRare4: 49, pullsSinceJackpot5: 30 };
    const result = rollEssenceAmountWithPity(pity, rng);
    expect(result.amount).toBe(4);
    expect(result.newPity.pullsSinceRare4).toBe(0);
    expect(result.newPity.pullsSinceJackpot5).toBe(31);
  });

  it('forces amount = 5 when pullsSinceJackpot5 hits 99', () => {
    const rng = vi.fn().mockReturnValue(0.1); // would normally be 1
    const pity: PityState = { pullsSinceRare4: 30, pullsSinceJackpot5: 99 };
    const result = rollEssenceAmountWithPity(pity, rng);
    expect(result.amount).toBe(5);
    expect(result.newPity.pullsSinceJackpot5).toBe(0);
    expect(result.newPity.pullsSinceRare4).toBe(0); // 5 also resets rare pity
  });

  it('5-pity takes priority over 4-pity when both threshold hit', () => {
    const rng = vi.fn().mockReturnValue(0.1);
    const pity: PityState = { pullsSinceRare4: 49, pullsSinceJackpot5: 99 };
    const result = rollEssenceAmountWithPity(pity, rng);
    // 5 is rarer + more specific guarantee → give 5
    expect(result.amount).toBe(5);
  });
});

describe('pullWithPity', () => {
  it('simulates 10 pulls and updates pity state', () => {
    const rng = vi.fn().mockReturnValue(0.5); // amount 2 each time
    const { results, newPity } = pullWithPity(10, freshPity, rng);
    expect(results).toHaveLength(10);
    expect(newPity.pullsSinceRare4).toBe(10);
    expect(newPity.pullsSinceJackpot5).toBe(10);
  });

  it('guarantees at least one rare (4+) in 50 consecutive pulls', () => {
    // Worst case: 49 pulls of amount 1, 50th is forced 4
    let callCount = 0;
    const rng = vi.fn(() => {
      callCount++;
      if (callCount <= 49) return 0.1; // amount 1
      return 0.99; // shouldn't matter, pity takes over
    });
    const { results, newPity } = pullWithPity(50, freshPity, rng);
    const maxAmount = Math.max(...results.map((r) => r.amount));
    expect(maxAmount).toBeGreaterThanOrEqual(4);
    expect(newPity.pullsSinceRare4).toBe(0); // reset on the pity pull
  });

  it('guarantees at least one jackpot (5) in 100 consecutive pulls', () => {
    let callCount = 0;
    const rng = vi.fn(() => {
      callCount++;
      if (callCount <= 99) return 0.1; // amount 1
      return 0.99;
    });
    const { results, newPity } = pullWithPity(100, freshPity, rng);
    const hasJackpot = results.some((r) => r.amount === 5);
    expect(hasJackpot).toBe(true);
    expect(newPity.pullsSinceJackpot5).toBe(0);
  });

  it('returns empty for pulls <= 0', () => {
    const { results, newPity } = pullWithPity(0, freshPity, () => 0.5);
    expect(results).toEqual([]);
    expect(newPity).toEqual(freshPity); // unchanged
  });
});
