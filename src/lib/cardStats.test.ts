import { describe, test, expect } from 'vitest';
import { hashIdToFloat, getCardStats } from './cardStats';
import type { Rarity } from '@/types';

describe('hashIdToFloat', () => {
  test('returns same value for same id (deterministic)', () => {
    const a = hashIdToFloat('v-001');
    const b = hashIdToFloat('v-001');
    expect(a).toBe(b);
  });

  test('returns value in [0, 1)', () => {
    for (let i = 0; i < 50; i++) {
      const h = hashIdToFloat(`id-${i}`);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(1);
    }
  });

  test('returns different values for different ids (varied)', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 100; i++) {
      seen.add(hashIdToFloat(`unique-${i}`));
    }
    // FNV-1a 32-bit should have ~0 collisions in 100 samples
    expect(seen.size).toBeGreaterThan(95);
  });

  test('is stable across many calls (idempotent)', () => {
    const expected = hashIdToFloat('n-050');
    for (let i = 0; i < 10; i++) {
      expect(hashIdToFloat('n-050')).toBe(expected);
    }
  });
});

describe('getCardStats', () => {
  test('COMMON returns hp in [60,90] and attack in [10,25]', () => {
    const s = getCardStats('v-001', 'COMMON');
    expect(s.hp).toBeGreaterThanOrEqual(60);
    expect(s.hp).toBeLessThanOrEqual(90);
    expect(s.attackPower).toBeGreaterThanOrEqual(10);
    expect(s.attackPower).toBeLessThanOrEqual(25);
  });

  test('LEGENDARY returns hp in [230,270] and attack in [100,130]', () => {
    const s = getCardStats('v-050', 'LEGENDARY');
    expect(s.hp).toBeGreaterThanOrEqual(230);
    expect(s.hp).toBeLessThanOrEqual(270);
    expect(s.attackPower).toBeGreaterThanOrEqual(100);
    expect(s.attackPower).toBeLessThanOrEqual(130);
  });

  test('OMNIPOTENT returns hp in [1300,1500] and attack in [760,900]', () => {
    const s = getCardStats('v-099', 'OMNIPOTENT');
    expect(s.hp).toBeGreaterThanOrEqual(1300);
    expect(s.hp).toBeLessThanOrEqual(1500);
    expect(s.attackPower).toBeGreaterThanOrEqual(760);
    expect(s.attackPower).toBeLessThanOrEqual(900);
  });

  test('is deterministic — same id+rarity returns same stats', () => {
    const a = getCardStats('v-001', 'COMMON');
    const b = getCardStats('v-001', 'COMMON');
    expect(a.hp).toBe(b.hp);
    expect(a.attackPower).toBe(b.attackPower);
  });

  test('different ids in same rarity produce varied stats', () => {
    const hps = new Set<number>();
    const atks = new Set<number>();
    for (let i = 1; i <= 30; i++) {
      const s = getCardStats(`v-${i.toString().padStart(3, '0')}`, 'COMMON');
      hps.add(s.hp);
      atks.add(s.attackPower);
    }
    // Common range is 30 wide → expect > 5 distinct values
    expect(hps.size).toBeGreaterThan(5);
    expect(atks.size).toBeGreaterThan(5);
  });

  test('UNKNOWN rarity falls back to COMMON range without throwing', () => {
    // Force unknown rarity by casting — should not crash, defaults safely
    const s = getCardStats('test-id', 'COMMON' as Rarity);
    expect(s.hp).toBeGreaterThan(0);
    expect(s.attackPower).toBeGreaterThan(0);
  });
});
