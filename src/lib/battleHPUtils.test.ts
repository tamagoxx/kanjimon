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
  // Unified shape: all 3 card types (Japanese, Pokemon, Fused) normalize to
  // { hp, attack, defense } before reaching this function. The page.tsx caller
  // is responsible for the field-name normalization (attackPower→attack etc).
  test('empty deck at level 1 returns base stats (hp=100, atk=0, def=0)', () => {
    const stats = calculatePlayerStatsFromDeck([], 1);
    expect(stats.hp).toBe(100);
    expect(stats.attack).toBe(0);
    expect(stats.defense).toBe(0);
  });

  test('default level is 1 when not provided', () => {
    const stats = calculatePlayerStatsFromDeck([{ hp: 100, attack: 50, defense: 3 }]);
    expect(stats.hp).toBe(100);
    expect(stats.attack).toBe(50);
    expect(stats.defense).toBe(3);
  });

  test('5 Japanese cards sum all stats: hp=540, atk=275, def=17', () => {
    // Mirrors the 5-card Japanese deck (水=100/50/3, 火=120/60/4, 木=80/40/2, 金=150/70/5, 土=90/55/3)
    const stats = calculatePlayerStatsFromDeck([
      { hp: 100, attack: 50, defense: 3 },
      { hp: 120, attack: 60, defense: 4 },
      { hp: 80, attack: 40, defense: 2 },
      { hp: 150, attack: 70, defense: 5 },
      { hp: 90, attack: 55, defense: 3 },
    ], 1);
    expect(stats.hp).toBe(540);
    expect(stats.attack).toBe(275);
    expect(stats.defense).toBe(17);
  });

  test('5 Pokemon cards @ 100hp each give player HP=500 (user bug report)', () => {
    // User scenario: 5x Pokemon with hp=100, attack=50, defense=20 each
    // → player pool HP = 500 (no level bonus at level 1)
    const stats = calculatePlayerStatsFromDeck([
      { hp: 100, attack: 50, defense: 20 },
      { hp: 100, attack: 50, defense: 20 },
      { hp: 100, attack: 50, defense: 20 },
      { hp: 100, attack: 50, defense: 20 },
      { hp: 100, attack: 50, defense: 20 },
    ], 1);
    expect(stats.hp).toBe(500);
    expect(stats.attack).toBe(250);
    expect(stats.defense).toBe(100);
  });

  test('5 Fused Pokemon cards @ 80hp each give player HP=400', () => {
    const stats = calculatePlayerStatsFromDeck([
      { hp: 80, attack: 60, defense: 30 },
      { hp: 80, attack: 60, defense: 30 },
      { hp: 80, attack: 60, defense: 30 },
      { hp: 80, attack: 60, defense: 30 },
      { hp: 80, attack: 60, defense: 30 },
    ], 1);
    expect(stats.hp).toBe(400);
    expect(stats.attack).toBe(300);
    expect(stats.defense).toBe(150);
  });

  test('mixed deck: 2 Japanese + 2 Pokemon + 1 Fused sum correctly', () => {
    // 2 JP: 100+50+3, 120+60+4
    // 2 PKM: 100+50+20, 100+50+20
    // 1 FUSED: 80+60+30
    // Totals: hp=500, atk=270, def=77
    const stats = calculatePlayerStatsFromDeck([
      { hp: 100, attack: 50, defense: 3 },
      { hp: 120, attack: 60, defense: 4 },
      { hp: 100, attack: 50, defense: 20 },
      { hp: 100, attack: 50, defense: 20 },
      { hp: 80, attack: 60, defense: 30 },
    ], 1);
    expect(stats.hp).toBe(500);
    expect(stats.attack).toBe(270);
    expect(stats.defense).toBe(77);
  });

  test('level bonus scales HP only (not atk/def)', () => {
    // Level 10: +90 HP bonus
    const stats = calculatePlayerStatsFromDeck([
      { hp: 100, attack: 50, defense: 3 },
    ], 10);
    expect(stats.hp).toBe(100 + (10 - 1) * 10); // 100 + 90 = 190
    expect(stats.attack).toBe(50);
    expect(stats.defense).toBe(3);
  });

  test('handles missing attack/defense with 0 fallback', () => {
    const stats = calculatePlayerStatsFromDeck([{ hp: 100 }], 1);
    expect(stats.hp).toBe(100);
    expect(stats.attack).toBe(0);
    expect(stats.defense).toBe(0);
  });

  test('stronger deck gives strictly more total stats', () => {
    const strong = calculatePlayerStatsFromDeck([
      { hp: 200, attack: 80, defense: 5 },
      { hp: 200, attack: 80, defense: 5 },
    ], 1);
    const weak = calculatePlayerStatsFromDeck([
      { hp: 60, attack: 10, defense: 1 },
      { hp: 60, attack: 10, defense: 1 },
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

  test('real-world boss battle scenario: mid-tier 5-card deck at level 5', () => {
    // User brings 5 mixed cards to fight Onyx Guardian (boss 400 HP, ~90 atk, ~35 def)
    // After fix: player HP=550+40, atk=260, def=15
    const stats = calculatePlayerStatsFromDeck([
      { hp: 120, attack: 60, defense: 4 },
      { hp: 110, attack: 50, defense: 3 },
      { hp: 100, attack: 55, defense: 3 },
      { hp: 105, attack: 45, defense: 2 },
      { hp: 115, attack: 50, defense: 3 },
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
