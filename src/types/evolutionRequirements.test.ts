import { describe, it, expect } from 'vitest';
import { EVOLUTION_REQUIREMENTS, type EvolutionTier } from '@/types';
import { EVOLUTION_TIERS } from '@/lib/evolutionChain';

describe('EVOLUTION_REQUIREMENTS', () => {
  it('covers all 12 tiers in the chain', () => {
    // Bug: MYTHICAL card selected for evolution showed blank Step 1 panel
    // because EVOLUTION_REQUIREMENTS only had 4 keys. The `requirements &&
    // evolveStep === 1` guard in FusionPageContent was falsy for
    // nextTier = 'TRANSCENDENT' through 'OMNIPOTENT'.
    for (const tier of EVOLUTION_TIERS) {
      expect(EVOLUTION_REQUIREMENTS[tier], `missing requirements for ${tier}`).toBeDefined();
      const req = EVOLUTION_REQUIREMENTS[tier];
      expect(req.resultTier).toBe(tier);
      expect(req.stardust).toBeGreaterThanOrEqual(0);
      expect(req.japaneseCardCount).toBeGreaterThanOrEqual(0);
    }
  });

  it('NONE has zero cost (terminal state)', () => {
    const r = EVOLUTION_REQUIREMENTS.NONE;
    expect(r.stardust).toBe(0);
    expect(r.japaneseCardCount).toBe(0);
  });

  it('higher tiers cost more (stardust + cards monotonically non-decreasing)', () => {
    let lastStardust = -1;
    let lastCardCount = -1;
    for (const tier of EVOLUTION_TIERS) {
      const r = EVOLUTION_REQUIREMENTS[tier];
      if (r.stardust > 0) {
        expect(r.stardust, `${tier} stardust regressed`).toBeGreaterThanOrEqual(lastStardust);
        lastStardust = r.stardust;
      }
      if (r.japaneseCardCount > 0) {
        expect(r.japaneseCardCount, `${tier} card count regressed`).toBeGreaterThanOrEqual(lastCardCount);
        lastCardCount = r.japaneseCardCount;
      }
    }
  });

  it('MYTHICAL+ tiers require essence (for new tier UI to show essence selector)', () => {
    // Regression: canEvolve in FusionPageContent checks `nextTier === 'MYTHICAL'`
    // to gate the essence selector. Once generalized, the requirement object
    // itself should encode essence need.
    for (const tier of ['MYTHICAL', 'TRANSCENDENT', 'CELESTIAL', 'DIVINE', 'ULTIMATE', 'ETERNAL', 'NIHIL', 'PRIMORDIAL', 'OMNIPOTENT'] as EvolutionTier[]) {
      const r = EVOLUTION_REQUIREMENTS[tier];
      expect(r.essenceCount, `${tier} should require essence`).toBeGreaterThanOrEqual(1);
    }
  });

  it('LIM/LEG do NOT require essence (only added at MYTHICAL+)', () => {
    expect(EVOLUTION_REQUIREMENTS.LIMITED_EDITION.essenceCount ?? 0).toBe(0);
    expect(EVOLUTION_REQUIREMENTS.LEGENDARY.essenceCount ?? 0).toBe(0);
  });
});
