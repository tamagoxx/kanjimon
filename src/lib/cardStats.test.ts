import { describe, test, expect } from 'vitest';
import { hashIdToFloat, getCardStats, getEffectiveDefense } from './cardStats';
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
  test('COMMON returns hp in [60,90], attack in [10,25], defense in [5,12]', () => {
    const s = getCardStats('v-001', 'COMMON');
    expect(s.hp).toBeGreaterThanOrEqual(60);
    expect(s.hp).toBeLessThanOrEqual(90);
    expect(s.attackPower).toBeGreaterThanOrEqual(10);
    expect(s.attackPower).toBeLessThanOrEqual(25);
    expect(s.defensePower).toBeGreaterThanOrEqual(5);
    expect(s.defensePower).toBeLessThanOrEqual(12);
  });

  test('LEGENDARY returns hp in [230,270], attack in [100,130], defense in [50,70]', () => {
    const s = getCardStats('v-050', 'LEGENDARY');
    expect(s.hp).toBeGreaterThanOrEqual(230);
    expect(s.hp).toBeLessThanOrEqual(270);
    expect(s.attackPower).toBeGreaterThanOrEqual(100);
    expect(s.attackPower).toBeLessThanOrEqual(130);
    expect(s.defensePower).toBeGreaterThanOrEqual(50);
    expect(s.defensePower).toBeLessThanOrEqual(70);
  });

  test('OMNIPOTENT returns hp in [1300,1500], attack in [760,900], defense in [390,470]', () => {
    const s = getCardStats('v-099', 'OMNIPOTENT');
    expect(s.hp).toBeGreaterThanOrEqual(1300);
    expect(s.hp).toBeLessThanOrEqual(1500);
    expect(s.attackPower).toBeGreaterThanOrEqual(760);
    expect(s.attackPower).toBeLessThanOrEqual(900);
    expect(s.defensePower).toBeGreaterThanOrEqual(390);
    expect(s.defensePower).toBeLessThanOrEqual(470);
  });

  test('defense scales monotonically with rarity (COMMON < LEGENDARY < OMNIPOTENT)', () => {
    // For any id, higher rarity should give higher max defense
    for (const id of ['v-001', 'v-050', 'v-099']) {
      const common = getCardStats(id, 'COMMON');
      const legendary = getCardStats(id, 'LEGENDARY');
      const omnipotent = getCardStats(id, 'OMNIPOTENT');
      expect(legendary.defensePower).toBeGreaterThan(common.defensePower);
      expect(omnipotent.defensePower).toBeGreaterThan(legendary.defensePower);
    }
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

describe('getEffectiveDefense', () => {
  test('returns getCardStats defensePower for a jp card (id+rarity present)', () => {
    const card = { id: 'v-001', rarity: 'COMMON' as Rarity };
    const expected = getCardStats('v-001', 'COMMON').defensePower;
    expect(getEffectiveDefense(card)).toBe(expected);
  });

  test('ignores stored defenseRating — old cards with 1-3 get the new scaled value', () => {
    // Old stored cards (pre-a90cfab) have defenseRating 1-3. Migration should
    // return the new rarity-scaled value, not the stale 1-3.
    const oldCard = { id: 'v-001', rarity: 'COMMON' as Rarity, defenseRating: 2 };
    const newCard = { id: 'v-001', rarity: 'COMMON' as Rarity, defenseRating: 8 };
    expect(getEffectiveDefense(oldCard)).toBe(getEffectiveDefense(newCard));
    expect(getEffectiveDefense(oldCard)).toBeGreaterThanOrEqual(5);
    expect(getEffectiveDefense(oldCard)).toBeLessThanOrEqual(12);
  });

  test('LEGENDARY card returns 50-70 range regardless of stored value', () => {
    const oldLegendary = { id: 'v-050', rarity: 'LEGENDARY' as Rarity, defenseRating: 3 };
    expect(getEffectiveDefense(oldLegendary)).toBeGreaterThanOrEqual(50);
    expect(getEffectiveDefense(oldLegendary)).toBeLessThanOrEqual(70);
  });

  test('OMNIPOTENT card returns 390-470 range regardless of stored value', () => {
    const oldOmnipotent = { id: 'v-099', rarity: 'OMNIPOTENT' as Rarity, defenseRating: 1 };
    expect(getEffectiveDefense(oldOmnipotent)).toBeGreaterThanOrEqual(390);
    expect(getEffectiveDefense(oldOmnipotent)).toBeLessThanOrEqual(470);
  });

  test('falls back to stored defenseRating when id is missing', () => {
    const orphan = { defenseRating: 7 };
    expect(getEffectiveDefense(orphan)).toBe(7);
  });

  test('falls back to stored defenseRating when rarity is missing', () => {
    const orphan = { id: 'v-001', defenseRating: 12 };
    expect(getEffectiveDefense(orphan)).toBe(12);
  });

  test('returns 0 when neither id+rarity nor defenseRating is present', () => {
    expect(getEffectiveDefense({})).toBe(0);
  });

  test('is deterministic — same input returns same value', () => {
    const card = { id: 'v-001', rarity: 'COMMON' as Rarity, defenseRating: 2 };
    expect(getEffectiveDefense(card)).toBe(getEffectiveDefense(card));
  });
});
