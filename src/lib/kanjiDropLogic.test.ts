import { describe, it, expect } from 'vitest';
import {
  findActiveTarget,
  isReadingComplete,
  scoreForKill,
  comboMultiplier,
  getWaveConfig,
  pickNextKanji,
  pickActiveTarget,
  generateOptions,
  fastKillBonus,
  type ChoiceOption,
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

const active = (c: JapaneseCard, y = 0, instanceId = c.id, options: ChoiceOption[] = []): ActiveKanji => ({
  card: c,
  y,
  instanceId,
  spawnedAt: 0,
  options,
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

describe('pickActiveTarget', () => {
  it('returns null when active list is empty', () => {
    expect(pickActiveTarget([])).toBeNull();
  });

  it('returns the kanji closest to the bottom (largest y)', () => {
    const a = active(card({ id: 'a', reading: 'たべる' }), 0.2);
    const b = active(card({ id: 'b', reading: 'のむ' }), 0.8);
    const c = active(card({ id: 'c', reading: 'いく' }), 0.5);
    const target = pickActiveTarget([a, b, c]);
    expect(target?.card.id).toBe('b');
  });

  it('returns the only kanji when there is just one', () => {
    const a = active(card({ id: 'a' }), 0.4);
    expect(pickActiveTarget([a])?.card.id).toBe('a');
  });
});

describe('generateOptions', () => {
  const pool: JapaneseCard[] = [
    card({ id: 'correct', romaji: 'taberu', reading: 'たべる' }),
    card({ id: 'd1', romaji: 'nomu', reading: 'のむ' }),
    card({ id: 'd2', romaji: 'iku', reading: 'いく' }),
    card({ id: 'd3', romaji: 'kuru', reading: 'くる' }),
    card({ id: 'd4', romaji: 'miru', reading: 'みる' }),
  ];

  it('returns exactly 3 options labeled A, B, C', () => {
    const opts = generateOptions(pool[0], pool);
    expect(opts).toHaveLength(3);
    expect(opts.map((o) => o.label)).toEqual(['A', 'B', 'C']);
  });

  it('always includes the correct romaji as one of the options', () => {
    for (let seed = 0; seed < 20; seed++) {
      const opts = generateOptions(pool[0], pool, seed);
      const correct = opts.filter((o) => o.isCorrect);
      expect(correct).toHaveLength(1);
      expect(correct[0].romaji).toBe('taberu');
    }
  });

  it('distractors are different romaji from the correct answer', () => {
    const opts = generateOptions(pool[0], pool, 42);
    const distractors = opts.filter((o) => !o.isCorrect);
    expect(distractors).toHaveLength(2);
    for (const d of distractors) {
      expect(d.romaji).not.toBe('taberu');
    }
    const romajiSet = new Set(distractors.map((d) => d.romaji));
    expect(romajiSet.size).toBe(2); // no duplicate distractors
  });

  it('does not repeat any option romaji', () => {
    const opts = generateOptions(pool[0], pool, 99);
    const romajiSet = new Set(opts.map((o) => o.romaji));
    expect(romajiSet.size).toBe(opts.length);
  });

  it('is deterministic given the same seed', () => {
    const a = generateOptions(pool[0], pool, 7);
    const b = generateOptions(pool[0], pool, 7);
    expect(a).toEqual(b);
  });

  it('falls back to placeholder distractors when pool is too small', () => {
    const tinyPool = [card({ id: 'only', romaji: 'a' })];
    const opts = generateOptions(tinyPool[0], tinyPool);
    expect(opts).toHaveLength(3);
    expect(opts.filter((o) => o.isCorrect)).toHaveLength(1);
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

describe('fastKillBonus', () => {
  // Default: 2s window, max 50% of rarity base score

  it('returns 0 when timeSinceSpawnMs equals the fast window (boundary)', () => {
    expect(fastKillBonus('COMMON', 2000)).toBe(0);
  });

  it('returns 0 when timeSinceSpawnMs exceeds the fast window', () => {
    expect(fastKillBonus('COMMON', 3000)).toBe(0);
    expect(fastKillBonus('RARE', 9999)).toBe(0);
  });

  it('returns 0 for negative time (clock skew guard)', () => {
    expect(fastKillBonus('COMMON', -100)).toBe(0);
  });

  it('returns the max bonus when killed instantly (t=0)', () => {
    // COMMON base=100, 50% = 50
    expect(fastKillBonus('COMMON', 0)).toBe(50);
    // RARE base=500, 50% = 250
    expect(fastKillBonus('RARE', 0)).toBe(250);
    // ETERNAL base=10000, 50% = 5000
    expect(fastKillBonus('ETERNAL', 0)).toBe(5000);
  });

  it('returns half the max bonus at the midpoint of the window', () => {
    // 1000ms = halfway, COMMON: 100 * 0.5 * 0.5 = 25
    expect(fastKillBonus('COMMON', 1000)).toBe(25);
    // RARE halfway: 500 * 0.5 * 0.5 = 125
    expect(fastKillBonus('RARE', 1000)).toBe(125);
  });

  it('scales linearly between t=0 and t=window', () => {
    // 500ms = quarter: COMMON: 100 * 0.5 * 0.75 = 37 (37.5 floored)
    expect(fastKillBonus('COMMON', 500)).toBe(37);
    // 1500ms = 3/4: COMMON: 100 * 0.5 * 0.25 = 12 (12.5 floored)
    expect(fastKillBonus('COMMON', 1500)).toBe(12);
  });

  it('higher rarities yield strictly larger bonuses at the same elapsed time', () => {
    const t = 400;
    const bonus = (r: 'COMMON' | 'RARE' | 'LEGENDARY' | 'ETERNAL') => fastKillBonus(r, t);
    expect(bonus('COMMON')).toBeLessThan(bonus('RARE'));
    expect(bonus('RARE')).toBeLessThan(bonus('LEGENDARY'));
    expect(bonus('LEGENDARY')).toBeLessThan(bonus('ETERNAL'));
  });

  it('respects custom fast window', () => {
    // 1s window, t=500ms (halfway) → 25 for COMMON
    expect(fastKillBonus('COMMON', 500, 1000)).toBe(25);
    // 1s window, t=1000ms (boundary) → 0
    expect(fastKillBonus('COMMON', 1000, 1000)).toBe(0);
  });

  it('respects custom max bonus fraction', () => {
    // 100% bonus, t=0, COMMON: 100 * 1.0 * 1.0 = 100
    expect(fastKillBonus('COMMON', 0, 2000, 1.0)).toBe(100);
    // 25% bonus, t=0, RARE: 500 * 0.25 * 1.0 = 125
    expect(fastKillBonus('RARE', 0, 2000, 0.25)).toBe(125);
  });

  it('always returns an integer (floored)', () => {
    // 700ms, COMMON: 100 * 0.5 * (1 - 0.7/2) = 100 * 0.5 * 0.65 = 32.5 → 32
    const result = fastKillBonus('COMMON', 700);
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBe(32);
  });
});
