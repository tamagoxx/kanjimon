import {
  describe, test, expect,
} from 'vitest';
import {
  calculatePlayerMaxHp,
  calculateOpponentMaxHp,
  calculateBossMaxHp,
  calculatePlayerStatsFromDeck,
} from './battleHPUtils';

describe('calculatePlayerStatsFromDeck', () => {
  test('empty deck at level 1 returns base stats (hp=100, atk=0, def=0)', () => {
    const stats = calculatePlayerStatsFromDeck([], 1);
    expect(stats.hp).toBe(100);
    expect(stats.attack).toBe(0);
    expect(stats.defense).toBe(0);
  });

  test('default level is 1 when not provided', () => {
    const stats = calculatePlayerStatsFromDeck([{ hp: 100, attackPower: 50, defenseRating: 3 }]);
    expect(stats.hp).toBe(100);
    expect(stats.attack).toBe(50);
    expect(stats.defense).toBe(3);
  });

  test('5 cards sum all stats: hp=540, atk=275, def=17', () => {
    // Mirrors the 5-card Japanese deck (水=100/50/3, 火=120/60/4, 木=80/40/2, 金=150/70/5, 土=90/55/3)
    const stats = calculatePlayerStatsFromDeck([
      { hp: 100, attackPower: 50, defenseRating: 3 },
      { hp: 120, attackPower: 60, defenseRating: 4 },
      { hp: 80, attackPower: 40, defenseRating: 2 },
      { hp: 150, attackPower: 70, defenseRating: 5 },
      { hp: 90, attackPower: 55, defenseRating: 3 },
    ], 1);
    expect(stats.hp).toBe(540);
    expect(stats.attack).toBe(275);
    expect(stats.defense).toBe(17);
  });

  test('level bonus scales HP only (not atk/def)', () => {
    // Level 10: +90 HP bonus
    const stats = calculatePlayerStatsFromDeck([
      { hp: 100, attackPower: 50, defenseRating: 3 },
    ], 10);
    expect(stats.hp).toBe(100 + (10 - 1) * 10); // 100 + 90 = 190
    expect(stats.attack).toBe(50);
    expect(stats.defense).toBe(3);
  });

  test('handles missing attackPower/defenseRating with 0 fallback', () => {
    const stats = calculatePlayerStatsFromDeck([{ hp: 100 }], 1);
    expect(stats.hp).toBe(100);
    expect(stats.attack).toBe(0);
    expect(stats.defense).toBe(0);
  });

  test('stronger deck gives strictly more total stats', () => {
    const strong = calculatePlayerStatsFromDeck([
      { hp: 200, attackPower: 80, defenseRating: 5 },
      { hp: 200, attackPower: 80, defenseRating: 5 },
    ], 1);
    const weak = calculatePlayerStatsFromDeck([
      { hp: 60, attackPower: 10, defenseRating: 1 },
      { hp: 60, attackPower: 10, defenseRating: 1 },
    ], 1);
    expect(strong.hp).toBeGreaterThan(weak.hp);
    expect(strong.attack).toBeGreaterThan(weak.attack);
    expect(strong.defense).toBeGreaterThan(weak.defense);
  });

  test('handles zero cards gracefully (no division by zero, returns base)', () => {
    const stats = calculatePlayerStatsFromDeck([], 1);
    expect(stats.hp).toBe(100);
    expect(stats.attack).toBe(0);
    expect(stats.defense).toBe(0);
  });

  test('real-world boss battle scenario: mid-tier 5-card deck', () => {
    // User brings 5 mixed N5 cards to fight Onyx Guardian (boss 400 HP, ~90 atk, ~35 def)
    // After fix: player HP=540, atk=275, def=17 — boss can be killed in 2-3 turns
    const stats = calculatePlayerStatsFromDeck([
      { hp: 120, attackPower: 60, defenseRating: 4 },
      { hp: 110, attackPower: 50, defenseRating: 3 },
      { hp: 100, attackPower: 55, defenseRating: 3 },
      { hp: 105, attackPower: 45, defenseRating: 2 },
      { hp: 115, attackPower: 50, defenseRating: 3 },
    ], 5);
    expect(stats.hp).toBe(550 + 40); // sum 550 + (5-1)*10
    expect(stats.attack).toBe(260);
    expect(stats.defense).toBe(15);
  });
});

describe('calculatePlayerMaxHp', () => {
  test('empty deck at level 1 returns 100 (base HP)', () => {
    expect(calculatePlayerMaxHp([], 1)).toBe(100);
  });

  test('avg hp = 80 gives no deck bonus (base 100 + level scaling)', () => {
    expect(calculatePlayerMaxHp([{ hp: 80 }], 1)).toBe(100);
  });

  test('avg hp = 130 gives +25 deck bonus', () => {
    // 100 + (1-1)*10 + 25 = 125
    expect(calculatePlayerMaxHp([{ hp: 130 }], 1)).toBe(125);
  });

  test('avg hp = 200 gives +60 deck bonus', () => {
    // 100 + 0 + 60 = 160
    expect(calculatePlayerMaxHp([{ hp: 200 }], 1)).toBe(160);
  });

  test('weak deck (avg hp < 80) is floored at 100 (no negative bonus)', () => {
    expect(calculatePlayerMaxHp([{ hp: 60 }], 1)).toBe(100);
  });

  test('level 5 adds 40 HP (10 per level above 1)', () => {
    // 100 + (5-1)*10 + 25 = 165
    expect(calculatePlayerMaxHp([{ hp: 130 }], 5)).toBe(165);
  });

  test('stronger deck gives strictly more HP than weaker deck at same level', () => {
    const strong = calculatePlayerMaxHp([{ hp: 200 }, { hp: 200 }, { hp: 200 }], 1);
    const weak = calculatePlayerMaxHp([{ hp: 60 }, { hp: 60 }, { hp: 60 }], 1);
    expect(strong).toBeGreaterThan(weak);
  });

  test('higher level gives more HP than lower level with same deck', () => {
    const deck = [{ hp: 150 }, { hp: 150 }];
    expect(calculatePlayerMaxHp(deck, 10)).toBeGreaterThan(calculatePlayerMaxHp(deck, 1));
  });

  test('handles missing hp field with 80 fallback', () => {
    expect(calculatePlayerMaxHp([{}], 1)).toBe(100);
  });

  test('default level is 1 when not provided', () => {
    expect(calculatePlayerMaxHp([{ hp: 130 }])).toBe(125);
  });
});

describe('calculateOpponentMaxHp', () => {
  test('returns the opponent hp value as-is', () => {
    expect(calculateOpponentMaxHp({ hp: 150 })).toBe(150);
    expect(calculateOpponentMaxHp({ hp: 80 })).toBe(80);
  });
});

describe('calculateBossMaxHp', () => {
  test('returns the boss maxHp value as-is', () => {
    expect(calculateBossMaxHp({ maxHp: 500 })).toBe(500);
    expect(calculateBossMaxHp({ maxHp: 1000 })).toBe(1000);
  });
});
