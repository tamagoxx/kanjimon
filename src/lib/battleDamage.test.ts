import { describe, it, expect } from 'vitest';
import { calculateDamage } from './battleDamage';

describe('calculateDamage', () => {
  describe('basic subtraction', () => {
    it('returns base damage when defense is 0', () => {
      expect(calculateDamage(50, 0)).toBe(50);
    });

    it('subtracts defense from base damage', () => {
      expect(calculateDamage(50, 15)).toBe(35);
    });

    it('subtracts larger defense values', () => {
      expect(calculateDamage(100, 40)).toBe(60);
    });

    it('rounds defense-subtracted result down to int (defense may be float)', () => {
      // defense could be e.g. 3.7 from multipliers — use floor on result side
      expect(calculateDamage(50, 12.7)).toBe(37);
    });
  });

  describe('minimum damage floor', () => {
    it('clamps to 5 when defense exceeds base damage', () => {
      expect(calculateDamage(10, 50)).toBe(5);
    });

    it('clamps to 5 when defense equals base damage', () => {
      expect(calculateDamage(20, 20)).toBe(5);
    });

    it('uses custom minDamage when provided', () => {
      expect(calculateDamage(10, 50, { minDamage: 1 })).toBe(1);
      expect(calculateDamage(10, 50, { minDamage: 0 })).toBe(0);
    });

    it('default minDamage is 5 (matches existing boss formula)', () => {
      // Boss formula in /battle: Math.max(5, baseDmg - defense)
      const bossFormula = Math.max(5, 50 - 100);
      expect(calculateDamage(50, 100)).toBe(bossFormula);
    });
  });

  describe('attack multiplier', () => {
    it('applies atkMultiplier to base damage before subtracting defense', () => {
      // boss atkMultiplier 1.5, base 40, defense 10
      // expected: floor(40 * 1.5) - 10 = 60 - 10 = 50
      expect(calculateDamage(40, 10, { atkMultiplier: 1.5 })).toBe(50);
    });

    it('respects minDamage when atkMultiplier pushes damage low', () => {
      // base 8 * 0.5 = 4, minus 10 = -6, clamped to 5
      expect(calculateDamage(8, 10, { atkMultiplier: 0.5 })).toBe(5);
    });
  });

  describe('defense multiplier', () => {
    it('applies defMultiplier to defense before subtraction', () => {
      // base 50, defense 10 * 1.5 = 15 effective
      // expected: 50 - 15 = 35
      expect(calculateDamage(50, 10, { defMultiplier: 1.5 })).toBe(35);
    });

    it('floors defense multiplier result (matches player defending bonus)', () => {
      // player defending: floor(defense * 1.5)
      // defense 7 * 1.5 = 10.5, floored to 10
      // base 50 - 10 = 40
      expect(calculateDamage(50, 7, { defMultiplier: 1.5 })).toBe(40);
    });
  });

  describe('real-world battle scenarios', () => {
    it('boss normal attack on player (50 dmg vs 15 def)', () => {
      // current /battle line 2419: Math.max(5, normalDamage - (s.playerActive?.defense || 0))
      expect(calculateDamage(50, 15)).toBe(35);
    });

    it('boss charged attack on player (200% multiplier)', () => {
      // current /battle line 2301: Math.max(5, Math.floor(baseAtk * 2 * atkMult) - defense)
      // base 40, atkMult 1.0, defense 10
      // floor(40 * 2 * 1.0) - 10 = 80 - 10 = 70
      expect(calculateDamage(40, 10, { atkMultiplier: 2.0 })).toBe(70);
    });

    it('boss AoE on player (25 base, atkMult 1.2, def 5) — fixes current bug', () => {
      // CURRENT BUG (line 2359): Math.floor(25 * 1.2) = 30, no defense subtraction
      // FIXED: should be max(5, 30 - 5) = 25
      expect(calculateDamage(25, 5, { atkMultiplier: 1.2 })).toBe(25);
    });

    it('player attack on boss (player atk 70 vs boss def 20 with multiplier 1.0)', () => {
      // current /battle line 2497-2498: max(5, damage - floor(bossDef * defMult))
      // base 70, defense 20, defMult 1.0
      expect(calculateDamage(70, 20)).toBe(50);
    });
  });
});
