// Boss scaling logic. Pure functions — testable in isolation.
//
// Difficulty curve: stat = base * 1.05^level
// User choice: B (exponential). Level 300 = ~2.27 million × base.

import { BOSS_TEMPLATES, type BossTemplate } from '@/data/bosses';

export const BOSS_LEVEL_MIN = 1;
export const BOSS_LEVEL_MAX = 300;

export interface ScaledStats {
  hp: number;
  attack: number;
  defense: number;
}

const SCALING_FACTOR = 1.05;

/**
 * Scale a stat by `1.05^level`. Returns a floored integer.
 *   scale(100, 1)   = 105
 *   scale(100, 50)  = 1146
 *   scale(100, 300) = 227,255,246 (capped at MAX_SAFE_INTEGER)
 */
export function scaleStat(base: number, level: number): number {
  if (base === 0) return 0;
  if (level <= 0) return Math.floor(base);

  // Use Math.pow (safe up to ~1.05^1023, beyond returns Infinity).
  // Cap at MAX_SAFE_INTEGER to avoid floating-point precision loss.
  const scaled = base * Math.pow(SCALING_FACTOR, level);
  if (!Number.isFinite(scaled) || scaled > Number.MAX_SAFE_INTEGER) {
    return Number.MAX_SAFE_INTEGER;
  }
  return Math.floor(scaled);
}

/**
 * Scale a stat block for a given level.
 *   scaleStats({hp: 100, attack: 10, defense: 5}, 1)
 *   => {hp: 105, attack: 10, defense: 5}
 */
export function scaleStats(
  base: { hp: number; attack: number; defense: number },
  level: number,
): ScaledStats {
  return {
    hp: scaleStat(base.hp, level),
    attack: scaleStat(base.attack, level),
    defense: scaleStat(base.defense, level),
  };
}

/**
 * Pick a boss template for the given level. The level determines the
 * template (cycles through BOSS_TEMPLATES — 30 templates, 300 levels,
 * so each template gets ~10 levels of "ownership").
 *
 * Open-world model: user picks any level 1-300, no unlock gate.
 * Clamps levels outside [1, 300] to the boundary.
 */
export function getBossForLevel(level: number): BossTemplate {
  const clamped = Math.max(BOSS_LEVEL_MIN, Math.min(BOSS_LEVEL_MAX, level));
  // Every 10 levels cycles through templates.
  // Level 1-10 → template 0, level 11-20 → template 1, etc.
  const templateIndex = Math.floor((clamped - 1) / 10) % BOSS_TEMPLATES.length;
  return BOSS_TEMPLATES[templateIndex];
}

/**
 * Get the scaled boss (template + stats) for a level.
 */
export function getScaledBoss(level: number): {
  boss: BossTemplate;
  level: number;
  hp: number;
  attack: number;
  defense: number;
} {
  const boss = getBossForLevel(level);
  const stats = scaleStats(
    { hp: boss.baseHP, attack: boss.baseAttack, defense: boss.baseDefense },
    level,
  );
  return {
    boss,
    level,
    hp: stats.hp,
    attack: stats.attack,
    defense: stats.defense,
  };
}
