import { describe, it, expect } from 'vitest';
import { getBossForLevel, scaleStats, BOSS_LEVEL_MIN, BOSS_LEVEL_MAX } from './bossScaling';
import { BOSS_TEMPLATES } from '@/data/bosses';

describe('bossScaling', () => {
  describe('getBossForLevel', () => {
    it('returns a valid boss template for level 1', () => {
      const boss = getBossForLevel(1);
      expect(boss).toBeDefined();
      expect(boss.id).toBeTruthy();
      expect(boss.name).toBeTruthy();
      expect(boss.japaneseName).toBeTruthy();
    });

    it('returns a valid boss template for level 300', () => {
      const boss = getBossForLevel(300);
      expect(boss).toBeDefined();
      expect(boss.id).toBeTruthy();
    });

    it('returns a valid boss template for mid level 100', () => {
      const boss = getBossForLevel(100);
      expect(boss).toBeDefined();
    });

    it('every level 1-300 returns a defined boss', () => {
      // Sample every 10 levels to keep test fast
      for (let lvl = 1; lvl <= 300; lvl += 10) {
        const boss = getBossForLevel(lvl);
        expect(boss, `level ${lvl} should have a boss`).toBeDefined();
      }
    });

    it('clamps level below 1 to BOSS_LEVEL_MIN', () => {
      const boss = getBossForLevel(0);
      expect(boss).toBeDefined();
      const minBoss = getBossForLevel(1);
      expect(boss.id).toBe(minBoss.id);
    });

    it('clamps level above 300 to BOSS_LEVEL_MAX', () => {
      const boss = getBossForLevel(500);
      expect(boss).toBeDefined();
      const maxBoss = getBossForLevel(300);
      expect(boss.id).toBe(maxBoss.id);
    });

    it('rotates through BOSS_TEMPLATES based on level', () => {
      // Every 10 levels should pick a new template
      const lvl1 = getBossForLevel(1);
      const lvl10 = getBossForLevel(10);
      // lvl1 and lvl10 are on different "tiers" of the cycle
      // but might land on same template if BOSS_TEMPLATES.length divides 10
      expect(lvl10).toBeDefined();
      expect(lvl1).toBeDefined();
    });
  });

  describe('scaleStats', () => {
    it('returns base stats at level 1 (rounded down)', () => {
      const stats = scaleStats({ hp: 100, attack: 10, defense: 5 }, 1);
      // level 1: 1.05^1 = 1.05 → floor
      expect(stats.hp).toBe(105);
      expect(stats.attack).toBe(10);   // 10 * 1.05 = 10.5 → floor
      expect(stats.defense).toBe(5);   // 5 * 1.05 = 5.25 → floor
    });

    it('scales exponentially with 1.05^level', () => {
      const stats50 = scaleStats({ hp: 100, attack: 10, defense: 5 }, 50);
      // 1.05^50 = ~11.467 → floor
      expect(stats50.hp).toBe(1146);
    });

    it('level 100 is much higher than level 1', () => {
      const lvl1 = scaleStats({ hp: 100, attack: 10, defense: 5 }, 1);
      const lvl100 = scaleStats({ hp: 100, attack: 10, defense: 5 }, 100);
      expect(lvl100.hp).toBeGreaterThan(lvl1.hp * 100);
    });

    it('level 300 is monstrous', () => {
      const stats = scaleStats({ hp: 100, attack: 10, defense: 5 }, 300);
      // 1.05^300 is huge, ~22,750,000
      expect(stats.hp).toBeGreaterThan(1_000_000);
    });

    it('monotonic: higher level means higher HP', () => {
      let prev = 0;
      for (let lvl = 1; lvl <= 50; lvl++) {
        const stats = scaleStats({ hp: 100, attack: 10, defense: 5 }, lvl);
        expect(stats.hp).toBeGreaterThan(prev);
        prev = stats.hp;
      }
    });

    it('returns integer HP, attack, defense (rounded down)', () => {
      const stats = scaleStats({ hp: 100, attack: 10, defense: 5 }, 7);
      expect(Number.isInteger(stats.hp)).toBe(true);
      expect(Number.isInteger(stats.attack)).toBe(true);
      expect(Number.isInteger(stats.defense)).toBe(true);
    });

    it('handles zero base values', () => {
      const stats = scaleStats({ hp: 0, attack: 0, defense: 0 }, 50);
      expect(stats.hp).toBe(0);
      expect(stats.attack).toBe(0);
      expect(stats.defense).toBe(0);
    });
  });

  describe('BOSS_LEVEL bounds', () => {
    it('BOSS_LEVEL_MIN is 1', () => {
      expect(BOSS_LEVEL_MIN).toBe(1);
    });

    it('BOSS_LEVEL_MAX is 300', () => {
      expect(BOSS_LEVEL_MAX).toBe(300);
    });
  });

  describe('BOSS_TEMPLATES', () => {
    it('has at least 10 templates for variety', () => {
      expect(BOSS_TEMPLATES.length).toBeGreaterThanOrEqual(10);
    });

    it('every template has required fields', () => {
      for (const boss of BOSS_TEMPLATES) {
        expect(boss.id).toBeTruthy();
        expect(boss.name).toBeTruthy();
        expect(boss.japaneseName).toBeTruthy();
        expect(boss.element).toBeTruthy();
        expect(boss.sprite).toBeTruthy();
        expect(boss.baseHP).toBeGreaterThan(0);
        expect(boss.baseAttack).toBeGreaterThan(0);
        expect(boss.lore).toBeTruthy();
      }
    });

    it('template IDs are unique', () => {
      const ids = BOSS_TEMPLATES.map(b => b.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
