import { describe, it, expect } from 'vitest';
import {
  EVOLUTION_TIERS,
  NEXT_TIER,
  TIER_LABELS,
  TIER_ICONS,
  TIER_COLORS_HEX,
  type EvolutionTier,
} from './evolutionChain';

describe('evolutionChain', () => {
  it('12 tiers in chain order', () => {
    expect(EVOLUTION_TIERS).toHaveLength(12);
    expect(EVOLUTION_TIERS).toEqual([
      'NONE', 'LIMITED_EDITION', 'LEGENDARY', 'MYTHICAL',
      'TRANSCENDENT', 'CELESTIAL', 'DIVINE', 'ULTIMATE', 'ETERNAL',
      'NIHIL', 'PRIMORDIAL', 'OMNIPOTENT',
    ]);
  });

  it('NEXT_TIER chains every tier (no self-loops except max)', () => {
    // The user's reported bug: MYTHICAL was self-looped to MYTHICAL.
    // This is the regression test — if MYTHICAL is mapped to MYTHICAL again,
    // Mythical fused cards cannot advance.
    for (const tier of EVOLUTION_TIERS) {
      if (tier === 'OMNIPOTENT') {
        // max tier is allowed to self-loop
        expect(NEXT_TIER[tier]).toBe('OMNIPOTENT');
      } else {
        expect(NEXT_TIER[tier]).not.toBe(tier);
      }
    }
    // Spot-check the user's exact reported case
    expect(NEXT_TIER.MYTHICAL).toBe('TRANSCENDENT');
    expect(NEXT_TIER.TRANSCENDENT).toBe('CELESTIAL');
    expect(NEXT_TIER.ETERNAL).toBe('NIHIL');
  });

  it('TIER_LABELS, TIER_ICONS, TIER_COLORS_HEX cover all 12 tiers', () => {
    for (const tier of EVOLUTION_TIERS) {
      expect(TIER_LABELS[tier]).toBeTruthy();
      expect(TIER_ICONS[tier]).toBeTruthy();
      expect(TIER_COLORS_HEX[tier]).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('chain forms a single path NONE → OMNIPOTENT (no dead ends except max)', () => {
    let current: EvolutionTier = 'NONE';
    const visited = new Set<EvolutionTier>([current]);
    while (current !== 'OMNIPOTENT') {
      const next: EvolutionTier = NEXT_TIER[current] as EvolutionTier;
      expect(visited.has(next)).toBe(false); // no cycle before max
      visited.add(next);
      current = next;
    }
    expect(visited.size).toBe(EVOLUTION_TIERS.length);
  });
});
