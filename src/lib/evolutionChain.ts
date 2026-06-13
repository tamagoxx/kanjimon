// Evolution chain constants for the fusion page UI.
// Single source of truth for NEXT_TIER, TIER_LABELS, TIER_ICONS, TIER_COLORS_HEX.
// All four must stay in sync — see `chainCoversAllTiers` test.

// The 12 evolution tiers, in chain order. The 4 "old" tiers precede the
// 8 "new" tiers past MYTHICAL (TRANSCENDENT → OMNIPOTENT).
export const EVOLUTION_TIERS = [
  'NONE',
  'LIMITED_EDITION',
  'LEGENDARY',
  'MYTHICAL',
  'TRANSCENDENT',
  'CELESTIAL',
  'DIVINE',
  'ULTIMATE',
  'ETERNAL',
  'NIHIL',
  'PRIMORDIAL',
  'OMNIPOTENT',
] as const;

export type EvolutionTier = typeof EVOLUTION_TIERS[number];

// Chain map: tier → next tier. Max tier (OMNIPOTENT) self-loops.
// BUG-FIX: MYTHICAL was self-looped to MYTHICAL, preventing the fusion page
// from advancing the user-reported Mythical fused card. Extended to full
// 12-tier chain in fix(mythical-evolution-chain).
export const NEXT_TIER: Record<EvolutionTier, EvolutionTier> = {
  NONE: 'LIMITED_EDITION',
  LIMITED_EDITION: 'LEGENDARY',
  LEGENDARY: 'MYTHICAL',
  MYTHICAL: 'TRANSCENDENT',
  TRANSCENDENT: 'CELESTIAL',
  CELESTIAL: 'DIVINE',
  DIVINE: 'ULTIMATE',
  ULTIMATE: 'ETERNAL',
  ETERNAL: 'NIHIL',
  NIHIL: 'PRIMORDIAL',
  PRIMORDIAL: 'OMNIPOTENT',
  OMNIPOTENT: 'OMNIPOTENT',
};

export const TIER_LABELS: Record<EvolutionTier, string> = {
  NONE: 'Standard',
  LIMITED_EDITION: 'Limited',
  LEGENDARY: 'Legendary',
  MYTHICAL: 'Mythical',
  TRANSCENDENT: 'Transcendent',
  CELESTIAL: 'Celestial',
  DIVINE: 'Divine',
  ULTIMATE: 'Ultimate',
  ETERNAL: 'Eternal',
  NIHIL: 'Nihil',
  PRIMORDIAL: 'Primordial',
  OMNIPOTENT: 'Omnipotent',
};

export const TIER_ICONS: Record<EvolutionTier, string> = {
  NONE: '⚡',
  LIMITED_EDITION: '🌟',
  LEGENDARY: '🏆',
  MYTHICAL: '💎',
  TRANSCENDENT: '✨',
  CELESTIAL: '💎',
  DIVINE: '🌟',
  ULTIMATE: '🔮',
  ETERNAL: '💫',
  NIHIL: '🕳️',
  PRIMORDIAL: '🌌',
  OMNIPOTENT: '👁️',
};

export const TIER_COLORS_HEX: Record<EvolutionTier, string> = {
  NONE: '#f0bf63',
  LIMITED_EDITION: '#ff8c00',
  LEGENDARY: '#c0392b',
  MYTHICAL: '#e91e8c',
  TRANSCENDENT: '#00ffff',
  CELESTIAL: '#ffd700',
  DIVINE: '#ff00ff',
  ULTIMATE: '#ff4500',
  ETERNAL: '#ffffff',
  NIHIL: '#6a0dad',
  PRIMORDIAL: '#0074d9',
  OMNIPOTENT: '#ffd700',
};
