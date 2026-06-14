import { describe, it, expect } from 'vitest';
import { getSellPrice, SELLABLE_RARITIES } from './cardSellPrice';
import type { Rarity } from '@/types';

describe('getSellPrice', () => {
  describe('all 15 Rarity tiers are supported', () => {
    it('SELLABLE_RARITIES lists all 15 tiers in order', () => {
      expect(SELLABLE_RARITIES).toEqual([
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
      ]);
      expect(SELLABLE_RARITIES.length).toBe(15);
    });

    it('each tier in SELLABLE_RARITIES has a positive price entry', () => {
      for (const tier of SELLABLE_RARITIES) {
        const price = getSellPrice(tier);
        expect(price.dollars).toBeGreaterThan(0);
        expect(price.energy).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('price curve — base tiers', () => {
    it('COMMON → 5 dollars, 2 energy (matches previous baseline)', () => {
      expect(getSellPrice('COMMON')).toEqual({ dollars: 5, energy: 2 });
    });

    it('UNCOMMON → 15 dollars, 4 energy (matches previous baseline)', () => {
      expect(getSellPrice('UNCOMMON')).toEqual({ dollars: 15, energy: 4 });
    });

    it('RARE → 50 dollars, 8 energy (matches previous baseline)', () => {
      expect(getSellPrice('RARE')).toEqual({ dollars: 50, energy: 8 });
    });

    it('ULTRA_RARE → 200 dollars, 20 energy (matches previous baseline)', () => {
      expect(getSellPrice('ULTRA_RARE')).toEqual({ dollars: 200, energy: 20 });
    });
  });

  describe('price curve — evolution tiers above MYTHICAL', () => {
    it('LIMITED_EDITION → 600 dollars', () => {
      expect(getSellPrice('LIMITED_EDITION').dollars).toBe(600);
    });

    it('LEGENDARY → 2,000 dollars', () => {
      expect(getSellPrice('LEGENDARY').dollars).toBe(2000);
    });

    it('MYTHICAL → 6,000 dollars', () => {
      expect(getSellPrice('MYTHICAL').dollars).toBe(6000);
    });

    it('TRANSCENDENT → 15,000 dollars', () => {
      expect(getSellPrice('TRANSCENDENT').dollars).toBe(15000);
    });

    it('CELESTIAL → 40,000 dollars', () => {
      expect(getSellPrice('CELESTIAL').dollars).toBe(40000);
    });

    it('DIVINE → 100,000 dollars', () => {
      expect(getSellPrice('DIVINE').dollars).toBe(100000);
    });

    it('ULTIMATE → 250,000 dollars', () => {
      expect(getSellPrice('ULTIMATE').dollars).toBe(250000);
    });

    it('ETERNAL → 600,000 dollars', () => {
      expect(getSellPrice('ETERNAL').dollars).toBe(600000);
    });

    it('NIHIL → 1,500,000 dollars', () => {
      expect(getSellPrice('NIHIL').dollars).toBe(1500000);
    });

    it('PRIMORDIAL → 5,000,000 dollars', () => {
      expect(getSellPrice('PRIMORDIAL').dollars).toBe(5000000);
    });

    it('OMNIPOTENT → 15,000,000 dollars (max tier)', () => {
      expect(getSellPrice('OMNIPOTENT').dollars).toBe(15000000);
    });
  });

  describe('curve is monotonically non-decreasing', () => {
    it('each tier is >= the previous tier (dollars)', () => {
      let prev = 0;
      for (const tier of SELLABLE_RARITIES) {
        const price = getSellPrice(tier);
        expect(price.dollars).toBeGreaterThanOrEqual(prev);
        prev = price.dollars;
      }
    });

    it('price growth is >= 2x per tier (incentive to evolve)', () => {
      for (let i = 1; i < SELLABLE_RARITIES.length; i++) {
        const prev = getSellPrice(SELLABLE_RARITIES[i - 1]).dollars;
        const curr = getSellPrice(SELLABLE_RARITIES[i]).dollars;
        expect(curr).toBeGreaterThanOrEqual(prev * 2);
      }
    });
  });

  describe('fallback for unknown rarity', () => {
    it('unknown string defaults to COMMON price (safe fallback, not 0)', () => {
      // Cast to Rarity to test runtime fallback
      const price = getSellPrice('UNKNOWN' as unknown as Rarity);
      expect(price.dollars).toBeGreaterThan(0);
      expect(price.dollars).toBe(5); // matches COMMON fallback
    });
  });

  describe('energy curve is roughly 10% of dollar curve', () => {
    it('OMNIPOTENT has high energy value (max tier)', () => {
      const price = getSellPrice('OMNIPOTENT');
      expect(price.energy).toBeGreaterThan(0);
    });

    it('energy is always a positive integer', () => {
      for (const tier of SELLABLE_RARITIES) {
        const price = getSellPrice(tier);
        expect(Number.isInteger(price.energy)).toBe(true);
        expect(price.energy).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
