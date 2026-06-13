import {
  describe, test, expect,
} from 'vitest';
import { calculatePlayerMaxHp, calculateOpponentMaxHp, calculateBossMaxHp } from './battleHPUtils';

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
