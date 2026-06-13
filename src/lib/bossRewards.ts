// Boss battle reward calculation. Pure functions.
//
// Rewards scale with boss level:
//   stardust:  10 * level
//   essence:   floor(level / 10)
//   diamonds:  floor(level / 5)
//
// Linear progression keeps it predictable. Higher-level bosses
// reward proportionally more.

export interface BossRewards {
  stardust: number;
  essence: number;
  diamonds: number;
}

export function calculateStardust(level: number): number {
  return Math.max(0, Math.floor(level * 10));
}

export function calculateEssence(level: number): number {
  return Math.max(0, Math.floor(level / 10));
}

export function calculateDiamonds(level: number): number {
  return Math.max(0, Math.floor(level / 5));
}

export function calculateRewards(level: number): BossRewards {
  return {
    stardust: calculateStardust(level),
    essence: calculateEssence(level),
    diamonds: calculateDiamonds(level),
  };
}
