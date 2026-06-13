import { describe, it, expect } from 'vitest';
import { calculateRewards, calculateStardust, calculateEssence, calculateDiamonds } from './bossRewards';

describe('bossRewards', () => {
  describe('calculateStardust', () => {
    it('returns 0 for level 0', () => {
      expect(calculateStardust(0)).toBe(0);
    });

    it('returns 10 for level 1', () => {
      expect(calculateStardust(1)).toBe(10);
    });

    it('returns 100 for level 10', () => {
      expect(calculateStardust(10)).toBe(100);
    });

    it('returns 1000 for level 100', () => {
      expect(calculateStardust(100)).toBe(1000);
    });

    it('returns 3000 for level 300', () => {
      expect(calculateStardust(300)).toBe(3000);
    });

    it('is linear: 10x level', () => {
      for (let lvl = 1; lvl <= 300; lvl += 50) {
        expect(calculateStardust(lvl)).toBe(lvl * 10);
      }
    });
  });

  describe('calculateEssence', () => {
    it('returns 0 for level 0-9', () => {
      for (let lvl = 0; lvl <= 9; lvl++) {
        expect(calculateEssence(lvl)).toBe(0);
      }
    });

    it('returns 1 for level 10', () => {
      expect(calculateEssence(10)).toBe(1);
    });

    it('returns 30 for level 300', () => {
      expect(calculateEssence(300)).toBe(30);
    });

    it('is floor(level / 10)', () => {
      expect(calculateEssence(19)).toBe(1);
      expect(calculateEssence(20)).toBe(2);
      expect(calculateEssence(99)).toBe(9);
      expect(calculateEssence(100)).toBe(10);
    });
  });

  describe('calculateDiamonds', () => {
    it('returns 0 for level 0-4', () => {
      for (let lvl = 0; lvl <= 4; lvl++) {
        expect(calculateDiamonds(lvl)).toBe(0);
      }
    });

    it('returns 1 for level 5', () => {
      expect(calculateDiamonds(5)).toBe(1);
    });

    it('returns 60 for level 300', () => {
      expect(calculateDiamonds(300)).toBe(60);
    });

    it('is floor(level / 5)', () => {
      expect(calculateDiamonds(4)).toBe(0);
      expect(calculateDiamonds(5)).toBe(1);
      expect(calculateDiamonds(9)).toBe(1);
      expect(calculateDiamonds(10)).toBe(2);
      expect(calculateDiamonds(99)).toBe(19);
    });
  });

  describe('calculateRewards', () => {
    it('returns stardust + essence + diamonds', () => {
      const rewards = calculateRewards(50);
      expect(rewards).toEqual({
        stardust: 500,
        essence: 5,
        diamonds: 10,
      });
    });

    it('handles level 1 (no essence, no diamonds)', () => {
      const rewards = calculateRewards(1);
      expect(rewards).toEqual({
        stardust: 10,
        essence: 0,
        diamonds: 0,
      });
    });

    it('handles level 300 (max rewards)', () => {
      const rewards = calculateRewards(300);
      expect(rewards).toEqual({
        stardust: 3000,
        essence: 30,
        diamonds: 60,
      });
    });

    it('all values are non-negative integers', () => {
      const rewards = calculateRewards(42);
      expect(Number.isInteger(rewards.stardust)).toBe(true);
      expect(Number.isInteger(rewards.essence)).toBe(true);
      expect(Number.isInteger(rewards.diamonds)).toBe(true);
      expect(rewards.stardust).toBeGreaterThanOrEqual(0);
      expect(rewards.essence).toBeGreaterThanOrEqual(0);
      expect(rewards.diamonds).toBeGreaterThanOrEqual(0);
    });
  });
});
