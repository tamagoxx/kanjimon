// ============================================================
// Kanji Drop — Pure Game Logic
// ============================================================
import * as wanakana from 'wanakana';
import type { JapaneseCard, Rarity } from '@/types';

// ---- Constants ----
const RARITY_BASE_SCORE: Record<Rarity, number> = {
  COMMON: 100,
  UNCOMMON: 250,
  RARE: 500,
  ULTRA_RARE: 1000,
  LIMITED_EDITION: 1500,
  LEGENDARY: 2000,
  MYTHICAL: 3000,
  TRANSCENDENT: 4000,
  CELESTIAL: 5000,
  DIVINE: 6500,
  ULTIMATE: 8000,
  ETERNAL: 10000,
};

const WAVE_BASE_FALL_MS = 4500;
const WAVE_MIN_FALL_MS = 1500;
const WAVE_FALL_STEP_MS = 200;
const WAVE_BASE_SPAWN_MS = 2500;
const WAVE_MIN_SPAWN_MS = 800;
const WAVE_SPAWN_STEP_MS = 100;

const COMBO_STEP = 0.1;
const COMBO_CAP = 5.0;

// ---- Interfaces ----
export interface ActiveKanji {
  card: JapaneseCard;
  /** y position 0..1, 0=top, 1=bottom */
  y: number;
  /** unique instance id (different from card.id when same kanji can appear twice) */
  instanceId: string;
  /** spawn timestamp (ms) */
  spawnedAt: number;
}

export interface WaveConfig {
  wave: number;
  maxConcurrent: number;
  fallDurationMs: number;
  spawnIntervalMs: number;
}

// ============================================================
// Kana matching
// ============================================================

/**
 * Find the kanji currently being typed for.
 * Returns the leftmost (lowest y, i.e. highest on screen = safest) match
 * OR — for accessibility — the bottom-most (about to fall off) match.
 * We choose bottom-most so the player clears danger first.
 */
export function findActiveTarget(
  active: ActiveKanji[],
  typedRomaji: string,
  _index: Record<string, number>,
): ActiveKanji | null {
  if (!typedRomaji) return null;
  const typedKana = wanakana.toKana(typedRomaji.toLowerCase(), { useObsolete: true } as Parameters<typeof wanakana.toKana>[1]);
  if (!typedKana) return null;

  // Prefer the kanji that matches the FULL reading (full match wins over prefix)
  const fullMatch = active.find((a) => a.card.reading === typedKana);
  if (fullMatch) return fullMatch;

  // Then the one closest to falling (largest y) so player clears danger first
  const prefixMatches = active.filter((a) => a.card.reading.startsWith(typedKana));
  if (prefixMatches.length === 0) return null;
  return prefixMatches.reduce((a, b) => (a.y > b.y ? a : b));
}

export function isReadingComplete(typedRomaji: string, cardRomaji: string): boolean {
  if (!typedRomaji || !cardRomaji) return false;
  return typedRomaji.toLowerCase() === cardRomaji.toLowerCase();
}

// ============================================================
// Scoring
// ============================================================

export function scoreForKill(rarity: Rarity, _combo: number): number {
  return RARITY_BASE_SCORE[rarity] ?? 100;
}

export function comboMultiplier(combo: number): number {
  if (combo <= 0) return 1;
  return Math.min(1 + combo * COMBO_STEP, COMBO_CAP);
}

// ============================================================
// Wave configuration
// ============================================================

export function getWaveConfig(wave: number): WaveConfig {
  const w = Math.max(1, Math.floor(wave));
  const fall = Math.max(WAVE_MIN_FALL_MS, WAVE_BASE_FALL_MS - (w - 1) * WAVE_FALL_STEP_MS);
  const spawn = Math.max(WAVE_MIN_SPAWN_MS, WAVE_BASE_SPAWN_MS - (w - 1) * WAVE_SPAWN_STEP_MS);
  const maxConcurrent = Math.min(4, 1 + Math.floor((w - 1) / 3));
  return { wave: w, maxConcurrent, fallDurationMs: fall, spawnIntervalMs: spawn };
}

// ============================================================
// Card picker
// ============================================================

/**
 * Pick the next kanji to spawn.
 * - Excludes cards already on screen (by reading)
 * - At low waves, heavily favors COMMON/UNCOMMON
 * - At higher waves, opens up to RARE+
 *
 * Deterministic when `seed` is provided (for tests + seeded daily runs).
 */
export function pickNextKanji(
  pool: JapaneseCard[],
  onScreen: ActiveKanji[],
  wave: number,
  seed?: number,
): JapaneseCard {
  const onScreenReadings = new Set(onScreen.map((a) => a.card.reading));
  const candidates = pool.filter((c) => !onScreenReadings.has(c.reading));
  const list = candidates.length > 0 ? candidates : pool;

  const random = seed !== undefined ? mulberry32(seed) : Math.random;

  // Higher waves open up higher rarities. At wave <=5, only COMMON/UNCOMMON.
  const rareChance = Math.max(0, (wave - 5) * 0.05); // 0 at w5, 0.5 at w15, 0.75 at w20

  const weighted: { card: JapaneseCard; w: number }[] = list.map((c) => {
    const r = c.rarity;
    let w: number;
    if (r === 'COMMON') w = 1;
    else if (r === 'UNCOMMON') w = 0.8;
    else if (r === 'RARE') w = rareChance * 0.5;
    else if (r === 'ULTRA_RARE') w = rareChance * 0.2;
    else w = rareChance * 0.05;
    return { card: c, w };
  });

  const total = weighted.reduce((s, x) => s + x.w, 0);
  let pick = random() * total;
  for (const x of weighted) {
    pick -= x.w;
    if (pick <= 0) return x.card;
  }
  return weighted[weighted.length - 1].card;
}

// Simple seeded PRNG
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
