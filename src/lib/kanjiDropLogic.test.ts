import { describe, it, expect } from 'vitest';
import {
  findActiveTarget,
  isReadingComplete,
  scoreForKill,
  comboMultiplier,
  getWaveConfig,
  pickNextKanji,
} from './kanjiDropLogic';
import type { ActiveKanji } from './kanjiDropLogic';
import type { JapaneseCard } from '@/types';

const card = (overrides: Partial<JapaneseCard> = {}): JapaneseCard => ({
  id: 'test-1',
  japanese: '食べる',
  reading: 'たべる',
  romaji: 'taberu',
  meaning: 'to eat',
  meaningId: 'makan',
  type: 'VERB',
  jlptLevel: 'N5',
  hp: 100,
  attackPower: 20,
  defenseRating: 2,
  rarity: 'COMMON',
  element: 'FIRE',
  cardArtUrl: '',
  exampleSentence: '',
  exampleTranslation: '',
  tags: [],
  ...overrides,
});

const active = (c: JapaneseCard, y = 0, instanceId = c.id): ActiveKanji => ({
  card: c,
  y,
  instanceId,
  spawnedAt: 0,
});

describe('findActiveTarget', () => {
  it('returns the kanji whose reading starts with the typed kana prefix', () => {
    const a = active(card({ id: 'a', reading: 'たべる' }));
    const b = active(card({ id: 'b', reading: 'のむ' }));
    const target = findActiveTarget([a, b], 'tabe', {});
    expect(target?.card.id).toBe('a');
  });

  it('returns null when no kanji matches the prefix', () => {
    const a = active(card({ id: 'a', reading: 'たべる' }));
    const target = findActiveTarget([a], 'xyz', {});
    expect(target).toBeNull();
  });

  it('picks the bottom-most (largest y) match when multiple kanji share the prefix', () => {
    const a = active(card({ id: 'a', reading: 'たべる' }), 0.2);
    const b = active(card({ id: 'b', reading: 'たべる' }), 0.8);
    const target = findActiveTarget([a, b], 'tabe', {});
    expect(target?.card.id).toBe('b');
  });

  it('returns null when typed buffer is empty', () => {
    const a = active(card({ id: 'a' }));
    const target = findActiveTarget([a], '', {});
    expect(target).toBeNull();
  });
});

describe('isReadingComplete', () => {
  it('returns true when typed romaji fully matches card romaji', () => {
    expect(isReadingComplete('taberu', 'taberu')).toBe(true);
  });

  it('returns false when typed romaji is a prefix', () => {
    expect(isReadingComplete('tabe', 'taberu')).toBe(false);
  });

  it('returns false when typed romaji is longer than card romaji', () => {
    expect(isReadingComplete('taberux', 'taberu')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isReadingComplete('TABERU', 'taberu')).toBe(true);
  });
});

describe('scoreForKill', () => {
  it('returns base score for COMMON rarity', () => {
    expect(scoreForKill('COMMON', 0)).toBe(100);
  });

  it('returns 250 for UNCOMMON', () => {
    expect(scoreForKill('UNCOMMON', 0)).toBe(250);
  });

  it('returns 500 for RARE', () => {
    expect(scoreForKill('RARE', 0)).toBe(500);
  });

  it('returns 1000 for ULTRA_RARE', () => {
    expect(scoreForKill('ULTRA_RARE', 0)).toBe(1000);
  });
});

describe('comboMultiplier', () => {
  it('returns 1.0 for combo 0', () => {
    expect(comboMultiplier(0)).toBe(1);
  });

  it('returns 1.1 for combo 1', () => {
    expect(comboMultiplier(1)).toBeCloseTo(1.1);
  });

  it('caps at 5.0 for combos >= 40', () => {
    expect(comboMultiplier(40)).toBe(5);
    expect(comboMultiplier(100)).toBe(5);
  });
});

describe('getWaveConfig', () => {
  it('starts with slow speed and single kanji in wave 1', () => {
    const w1 = getWaveConfig(1);
    expect(w1.maxConcurrent).toBe(1);
    expect(w1.fallDurationMs).toBeGreaterThanOrEqual(3000);
    expect(w1.spawnIntervalMs).toBeGreaterThanOrEqual(2000);
  });

  it('ramps difficulty with wave number', () => {
    const w1 = getWaveConfig(1);
    const w10 = getWaveConfig(10);
    const w20 = getWaveConfig(20);
    expect(w10.fallDurationMs).toBeLessThan(w1.fallDurationMs);
    expect(w20.fallDurationMs).toBeLessThan(w10.fallDurationMs);
    expect(w10.maxConcurrent).toBeGreaterThanOrEqual(w1.maxConcurrent);
  });

  it('caps max concurrent at 4', () => {
    expect(getWaveConfig(100).maxConcurrent).toBe(4);
  });

  it('caps fall duration at a minimum', () => {
    expect(getWaveConfig(999).fallDurationMs).toBeGreaterThanOrEqual(1500);
  });
});

describe('pickNextKanji', () => {
  it('does not return kanji already on screen', () => {
    const pool: JapaneseCard[] = [
      card({ id: 'a', reading: 'a' }),
      card({ id: 'b', reading: 'b' }),
      card({ id: 'c', reading: 'c' }),
    ];
    const onScreen = [active(pool[0])];
    const next = pickNextKanji(pool, onScreen, 1, 1);
    expect(next.id).not.toBe('a');
  });

  it('prefers COMMON cards at low waves', () => {
    const pool: JapaneseCard[] = [
      card({ id: 'rare', rarity: 'RARE' }),
      card({ id: 'common', rarity: 'COMMON' }),
    ];
    let pickedRare = 0;
    for (let i = 0; i < 50; i++) {
      const next = pickNextKanji(pool, [], 1, 42 + i);
      if (next.id === 'rare') pickedRare++;
    }
    expect(pickedRare).toBeLessThan(5);
  });

  it('allows higher-rarity cards at higher waves', () => {
    const pool: JapaneseCard[] = [
      card({ id: 'rare', rarity: 'RARE' }),
      card({ id: 'common', rarity: 'COMMON' }),
    ];
    let pickedRare = 0;
    for (let i = 0; i < 100; i++) {
      const next = pickNextKanji(pool, [], 20, 42 + i);
      if (next.id === 'rare') pickedRare++;
    }
    expect(pickedRare).toBeGreaterThan(20);
  });
});
