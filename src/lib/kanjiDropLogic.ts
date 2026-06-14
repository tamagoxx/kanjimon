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
  NIHIL: 13000,         // void - faster
  PRIMORDIAL: 17000,    // cosmic - faster still
  OMNIPOTENT: 22000,    // absolute power
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
  /** 3 multiple-choice options for this kanji (A/B/C). Generated at spawn. */
  options: ChoiceOption[];
}

export interface WaveConfig {
  wave: number;
  maxConcurrent: number;
  fallDurationMs: number;
  spawnIntervalMs: number;
}

export interface ChoiceOption {
  label: 'A' | 'B' | 'C';
  romaji: string;
  isCorrect: boolean;
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
// Multiple Choice (A/B/C) mode
// ============================================================

/**
 * Pick the kanji closest to the bottom (largest y).
 * This is the one the player must answer first (most urgent).
 */
export function pickActiveTarget(active: ActiveKanji[]): ActiveKanji | null {
  if (active.length === 0) return null;
  return active.reduce((a, b) => (a.y > b.y ? a : b));
}

/**
 * Generate 3 multiple-choice options (A/B/C) for a given kanji.
 * - Exactly one is correct (the kanji's own romaji)
 * - 2 distractors are picked from the pool, distinct from the correct answer
 * - Options are shuffled, labels assigned A/B/C in order
 * - If pool is too small, placeholder distractors are used
 * - Deterministic when `seed` is provided
 */
export function generateOptions(
  card: JapaneseCard,
  pool: JapaneseCard[],
  seed?: number,
): ChoiceOption[] {
  const labels: ChoiceOption['label'][] = ['A', 'B', 'C'];
  const correctRomaji = card.romaji;
  const correct: ChoiceOption = { label: 'A', romaji: correctRomaji, isCorrect: true };

  const candidates = pool.filter((p) => p.romaji !== correctRomaji && p.romaji);
  const random = seed !== undefined ? mulberry32(seed) : Math.random;

  const distractors: ChoiceOption[] = [];
  const seen = new Set<string>([correctRomaji]);
  // Try to pick 2 unique distractors; fall back to numbered placeholders if pool is too small
  for (let i = 0; i < 2; i++) {
    const available = candidates.filter((c) => !seen.has(c.romaji));
    if (available.length === 0) {
      distractors.push({ label: 'B', romaji: `???${i + 1}`, isCorrect: false });
      continue;
    }
    const pickIdx = Math.floor(random() * available.length);
    const picked = available[pickIdx];
    seen.add(picked.romaji);
    distractors.push({ label: 'B', romaji: picked.romaji, isCorrect: false });
  }

  const all = [correct, ...distractors];
  // Fisher–Yates shuffle (deterministic when random is seeded)
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.map((o, i) => ({ ...o, label: labels[i] }));
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

/**
 * Fast-kill time bonus: reward players for killing a kanji quickly after it spawns.
 * Encourages aggressive play and breaks up the "wait and see" meta.
 *
 * Formula (linear decay from t=0 to t=fastWindowMs):
 *   bonus = floor(rarityBaseScore * maxBonusFraction * (1 - t / fastWindowMs))
 *
 * - t = 0            → max bonus (rarityBaseScore * maxBonusFraction)
 * - t = fastWindowMs → 0 (boundary, no bonus)
 * - t > fastWindowMs → 0 (no bonus, regular scoring only)
 * - t < 0            → 0 (clock-skew guard, treated as "not fast")
 *
 * Returns an integer (Math.floor). Unknown rarities fall back to COMMON's base.
 */
export function fastKillBonus(
  rarity: Rarity,
  timeSinceSpawnMs: number,
  fastWindowMs: number = 2000,
  maxBonusFraction: number = 0.5,
): number {
  if (timeSinceSpawnMs < 0 || timeSinceSpawnMs >= fastWindowMs) return 0;
  const base = RARITY_BASE_SCORE[rarity] ?? RARITY_BASE_SCORE.COMMON;
  const fraction = 1 - timeSinceSpawnMs / fastWindowMs;
  return Math.floor(base * maxBonusFraction * fraction);
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
