import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EvolutionMaterial, EvoTier, Rarity } from '@/types';
import { EVO_REQUIREMENTS, STAT_BOOST_PER_TIER, EVO_TIER_ORDER } from '@/types';
import { useCollectionStore } from './collectionStore';

// ============================================================
// Evolution Store - manages card evolution system
// ============================================================

interface EvolutionState {
  // Evolution materials inventory
  materials: Record<EvolutionMaterial, number>;

  // Evolved cards tracking (by card ID)
  evolvedCards: Record<string, {
    cardId: string;
    evolutionTier: EvoTier;
    originalRarity: Rarity;
    boostedHp: number;
    boostedAttack: number;
    boostedDefense: number;
    evolvedAt: string;
  }>;

  // Check if a card can evolve
  canEvolveCard: (cardId: string) => { canEvolve: boolean; nextTier: EvoTier | null; reason?: string };

  // Get evolution requirements for next tier
  getEvolutionRequirements: (currentRarity: Rarity) => typeof EVO_REQUIREMENTS[EvoTier] | null;

  // Get material costs for a specific evolution
  getMaterialCost: (targetTier: EvoTier) => { gold: number; materials: Partial<Record<EvolutionMaterial, number>> };

  // Check if user has enough materials for evolution
  hasEnoughMaterials: (targetTier: EvoTier) => boolean;

  // Evolve a card
  evolveCard: (cardId: string, currentRarity: Rarity, cardStats: { hp: number; attack: number; defense: number }) => {
    success: boolean;
    error?: string;
    newTier?: EvoTier;
    boostedStats?: { hp: number; attack: number; defense: number };
  };

  // Get evolution info for a card
  getEvolutionInfo: (cardId: string) => {
    isEvolved: boolean;
    evolutionTier: EvoTier | null;
    statMultiplier: number;
  } | null;

  // Add evolution materials (from rewards/shop)
  addMaterials: (material: EvolutionMaterial, amount: number) => void;

  // Get current material counts
  getMaterialCount: (material: EvolutionMaterial) => number;
}

export const useEvolutionStore = create<EvolutionState>()(
  persist(
    (set, get) => ({
      materials: {
        COSMIC_DUST: 0,
        CELESTIAL_SHARD: 0,
        DIVINE_ESSENCE: 0,
        ULTIMATE_CORE: 0,
        ETERNAL_FRAGMENT: 0,
      },

      evolvedCards: {},

      canEvolveCard: (cardId: string) => {
        const collection = useCollectionStore.getState();
        const card = collection.ownedCards.find(oc => oc.cardId === cardId)?.card ||
                     collection.fusedPokemon.find(fp => fp.id === cardId);

        if (!card) {
          return { canEvolve: false, nextTier: null, reason: 'Card not found' };
        }

        const rarity = 'rarity' in card ? card.rarity : 'MYTHICAL';

        // Check if already at max tier
        if (rarity === 'ETERNAL') {
          return { canEvolve: false, nextTier: null, reason: 'Already at max tier' };
        }

        // Check if it's MYTHICAL or above
        const evolvableTiers: Rarity[] = ['MYTHICAL', 'TRANSCENDENT', 'CELESTIAL', 'DIVINE', 'ULTIMATE'];
        if (!evolvableTiers.includes(rarity)) {
          return { canEvolve: false, nextTier: null, reason: 'Only MYTHICAL+ cards can evolve' };
        }

        // Check if it's a fused Pokemon (they have fusionCount)
        const fusionCount = 'fusionCount' in card ? card.fusionCount : 0;

        // Get next tier
        let nextTier: EvoTier | null = null;
        if (rarity === 'MYTHICAL') nextTier = 'TRANSCENDENT';
        else if (rarity === 'TRANSCENDENT') nextTier = 'CELESTIAL';
        else if (rarity === 'CELESTIAL') nextTier = 'DIVINE';
        else if (rarity === 'DIVINE') nextTier = 'ULTIMATE';
        else if (rarity === 'ULTIMATE') nextTier = 'ETERNAL';

        if (!nextTier) {
          return { canEvolve: false, nextTier: null, reason: 'Already at max tier' };
        }

        // Check fusion count requirement
        const requirements = EVO_REQUIREMENTS[nextTier];
        if (requirements.fusionCount && fusionCount < requirements.fusionCount) {
          return { canEvolve: false, nextTier, reason: `Need ${requirements.fusionCount} fusion count (current: ${fusionCount})` };
        }

        // Check materials
        const state = get();
        for (const [mat, count] of Object.entries(requirements.materials)) {
          if ((state.materials as any)[mat] < count) {
            return { canEvolve: false, nextTier, reason: `Need more ${mat.replace('_', ' ').toLowerCase()}` };
          }
        }

        // Check gold
        if (collection.coins < requirements.gold) {
          return { canEvolve: false, nextTier, reason: `Need ${requirements.gold.toLocaleString()} coins (have: ${collection.coins.toLocaleString()})` };
        }

        return { canEvolve: true, nextTier };
      },

      getEvolutionRequirements: (currentRarity: Rarity) => {
        let nextTier: EvoTier | null = null;
        if (currentRarity === 'MYTHICAL') nextTier = 'TRANSCENDENT';
        else if (currentRarity === 'TRANSCENDENT') nextTier = 'CELESTIAL';
        else if (currentRarity === 'CELESTIAL') nextTier = 'DIVINE';
        else if (currentRarity === 'DIVINE') nextTier = 'ULTIMATE';
        else if (currentRarity === 'ULTIMATE') nextTier = 'ETERNAL';

        if (!nextTier) return null;
        return EVO_REQUIREMENTS[nextTier];
      },

      getMaterialCost: (targetTier: EvoTier) => {
        const req = EVO_REQUIREMENTS[targetTier];
        return { gold: req.gold, materials: req.materials };
      },

      hasEnoughMaterials: (targetTier: EvoTier) => {
        const collection = useCollectionStore.getState();
        const req = EVO_REQUIREMENTS[targetTier];

        // Check gold
        if (collection.coins < req.gold) return false;

        // Check materials
        const state = get();
        for (const [mat, count] of Object.entries(req.materials)) {
          if ((state.materials as any)[mat] < count) return false;
        }

        return true;
      },

      evolveCard: (cardId, currentRarity, cardStats) => {
        const { canEvolveCard, hasEnoughMaterials } = get();

        const check = canEvolveCard(cardId);
        if (!check.canEvolve || !check.nextTier) {
          return { success: false, error: check.reason };
        }

        const nextTier = check.nextTier;
        const req = EVO_REQUIREMENTS[nextTier];

        // Check materials and gold again
        if (!hasEnoughMaterials(nextTier)) {
          return { success: false, error: 'Not enough materials or gold' };
        }

        // Deduct gold
        const collection = useCollectionStore.getState();
        if (!collection.spendCoins(req.gold)) {
          return { success: false, error: 'Not enough coins' };
        }

        // Deduct materials
        const newMaterials = { ...get().materials };
        for (const [mat, count] of Object.entries(req.materials)) {
          newMaterials[mat as EvolutionMaterial] -= count as number;
        }

        // Calculate boosted stats
        const boostMultiplier = 1 + STAT_BOOST_PER_TIER[nextTier];
        const boostedStats = {
          hp: Math.round(cardStats.hp * boostMultiplier),
          attack: Math.round(cardStats.attack * boostMultiplier),
          defense: Math.round(cardStats.defense * boostMultiplier),
        };

        // Update evolved cards tracking
        const newEvolvedCards = { ...get().evolvedCards };
        newEvolvedCards[cardId] = {
          cardId,
          evolutionTier: nextTier,
          originalRarity: currentRarity,
          boostedHp: boostedStats.hp,
          boostedAttack: boostedStats.attack,
          boostedDefense: boostedStats.defense,
          evolvedAt: new Date().toISOString(),
        };

        set({
          materials: newMaterials,
          evolvedCards: newEvolvedCards,
        });

        return {
          success: true,
          newTier: nextTier,
          boostedStats,
        };
      },

      getEvolutionInfo: (cardId: string) => {
        const evolved = get().evolvedCards[cardId];
        if (!evolved) return null;

        const tierIndex = EVO_TIER_ORDER.indexOf(evolved.evolutionTier);
        const multiplier = tierIndex >= 0 ? 1 + STAT_BOOST_PER_TIER[EVO_TIER_ORDER[tierIndex]] : 1;

        return {
          isEvolved: true,
          evolutionTier: evolved.evolutionTier,
          statMultiplier: multiplier,
        };
      },

      addMaterials: (material, amount) => {
        set(state => ({
          materials: {
            ...state.materials,
            [material]: state.materials[material] + amount,
          },
        }));
      },

      getMaterialCount: (material) => {
        return get().materials[material];
      },
    }),
    {
      name: 'kanjimon-evolution',
    }
  )
);