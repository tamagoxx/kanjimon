import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EvolutionMaterial, EvoTier, Rarity, FusedPokemon } from '@/types';
import { EVO_REQUIREMENTS, STAT_BOOST_PER_TIER, EVO_TIER_ORDER } from '@/types';
import { useCollectionStore } from './collectionStore';

// Fusion card sacrifice value by rarity (what materials they replace)
export const FUSION_SACRIFICE_VALUES: Record<Rarity, { cosmicDust: number; celestialShard: number }> = {
  COMMON: { cosmicDust: 0, celestialShard: 0 },
  UNCOMMON: { cosmicDust: 0, celestialShard: 0 },
  RARE: { cosmicDust: 0, celestialShard: 0 },
  ULTRA_RARE: { cosmicDust: 1, celestialShard: 0 },      // 1 UR = 1 Cosmic Dust
  LIMITED_EDITION: { cosmicDust: 1, celestialShard: 0 },// 1 LE = 1 Cosmic Dust
  LEGENDARY: { cosmicDust: 2, celestialShard: 0 },       // 1 LEG = 2 Cosmic Dust
  MYTHICAL: { cosmicDust: 3, celestialShard: 1 },        // 1 MYTH = 3 Cosmic Dust + 1 Celestial Shard
  TRANSCENDENT: { cosmicDust: 3, celestialShard: 1 },    // 1 TRANS = 3 Cosmic Dust + 1 Celestial Shard
  CELESTIAL: { cosmicDust: 4, celestialShard: 2 },       // 1 CEL = 4 Cosmic Dust + 2 Celestial Shard
  DIVINE: { cosmicDust: 5, celestialShard: 2 },           // 1 DIV = 5 Cosmic Dust + 2 Celestial Shard
  ULTIMATE: { cosmicDust: 6, celestialShard: 3 },        // 1 ULT = 6 Cosmic Dust + 3 Celestial Shard
  ETERNAL: { cosmicDust: 8, celestialShard: 4 },          // 1 ETERN = 8 Cosmic Dust + 4 Celestial Shard
};

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

  // Check if user has enough materials for evolution (optionally including fusion card sacrifices)
  hasEnoughMaterials: (targetTier: EvoTier, sacrificeContribution?: { cosmicDust: number; celestialShard: number }) => boolean;

  // Evolve a card (optionally pass sacrificed fusion card IDs to use them as materials)
  evolveCard: (cardId: string, currentRarity: Rarity, cardStats: { hp: number; attack: number; defense: number }, sacrificedCardIds?: string[]) => {
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

  // Fusion card sacrifice system
  getFusionSacrificeValue: (card: FusedPokemon) => { cosmicDust: number; celestialShard: number };
  getEligibleFusionCards: () => FusedPokemon[];
  calculateSacrificeContribution: (sacrificedCardIds: string[]) => { cosmicDust: number; celestialShard: number };
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

      getFusionSacrificeValue: (card: FusedPokemon) => {
        return FUSION_SACRIFICE_VALUES[card.rarity] || { cosmicDust: 0, celestialShard: 0 };
      },

      getEligibleFusionCards: () => {
        const collection = useCollectionStore.getState();
        // Only fusion cards with rarity >= ULTRA_RARE can be sacrificed
        return collection.fusedPokemon.filter(fp => {
          const value = FUSION_SACRIFICE_VALUES[fp.rarity];
          return value.cosmicDust > 0 || value.celestialShard > 0;
        });
      },

      calculateSacrificeContribution: (sacrificedCardIds: string[]) => {
        const collection = useCollectionStore.getState();
        let totalCosmicDust = 0;
        let totalCelestialShard = 0;

        for (const id of sacrificedCardIds) {
          const card = collection.fusedPokemon.find(fp => fp.id === id);
          if (card) {
            const value = FUSION_SACRIFICE_VALUES[card.rarity];
            totalCosmicDust += value.cosmicDust;
            totalCelestialShard += value.celestialShard;
          }
        }

        return { cosmicDust: totalCosmicDust, celestialShard: totalCelestialShard };
      },

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

      hasEnoughMaterials: (targetTier: EvoTier, sacrificeContribution?: { cosmicDust: number; celestialShard: number }) => {
        const collection = useCollectionStore.getState();
        const req = EVO_REQUIREMENTS[targetTier];

        // Check gold
        if (collection.coins < req.gold) return false;

        // Check materials with optional sacrifice contribution
        const state = get();
        const cosmicDust = (sacrificeContribution?.cosmicDust || 0);
        const celestialShard = (sacrificeContribution?.celestialShard || 0);

        // Calculate effective materials
        const effectiveCosmicDust = (state.materials.COSMIC_DUST + cosmicDust);
        const effectiveCelestialShard = (state.materials.CELESTIAL_SHARD + celestialShard);

        for (const [mat, count] of Object.entries(req.materials)) {
          if (mat === 'COSMIC_DUST' && effectiveCosmicDust < (count as number)) return false;
          if (mat === 'CELESTIAL_SHARD' && effectiveCelestialShard < (count as number)) return false;
          if (mat !== 'COSMIC_DUST' && mat !== 'CELESTIAL_SHARD' && (state.materials as any)[mat] < count) return false;
        }

        return true;
      },

      evolveCard: (cardId, currentRarity, cardStats, sacrificedCardIds = []) => {
        const { canEvolveCard, hasEnoughMaterials, calculateSacrificeContribution } = get();

        const check = canEvolveCard(cardId);
        if (!check.canEvolve || !check.nextTier) {
          return { success: false, error: check.reason };
        }

        const nextTier = check.nextTier;
        const req = EVO_REQUIREMENTS[nextTier];

        // Calculate sacrifice contribution if any cards are being sacrificed
        const sacrificeContribution = sacrificedCardIds.length > 0
          ? calculateSacrificeContribution(sacrificedCardIds)
          : undefined;

        // Check materials and gold again (including sacrifice contribution)
        if (!hasEnoughMaterials(nextTier, sacrificeContribution)) {
          return { success: false, error: 'Not enough materials or gold' };
        }

        // Deduct gold
        const collection = useCollectionStore.getState();
        if (!collection.spendCoins(req.gold)) {
          return { success: false, error: 'Not enough coins' };
        }

        // Deduct materials (subtract sacrifice contribution from requirements)
        const newMaterials = { ...get().materials };
        for (const [mat, count] of Object.entries(req.materials)) {
          if (mat === 'COSMIC_DUST' && sacrificeContribution?.cosmicDust) {
            newMaterials.COSMIC_DUST -= Math.min(count as number, sacrificeContribution.cosmicDust);
          } else if (mat === 'CELESTIAL_SHARD' && sacrificeContribution?.celestialShard) {
            newMaterials.CELESTIAL_SHARD -= Math.min(count as number, sacrificeContribution.celestialShard);
          } else {
            newMaterials[mat as EvolutionMaterial] -= count as number;
          }
        }

        // Remove sacrificed fusion cards from collection
        let updatedFusedPokemon = [...collection.fusedPokemon];
        for (const id of sacrificedCardIds) {
          updatedFusedPokemon = updatedFusedPokemon.filter(fp => fp.id !== id);
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

        // Update both stores
        set({
          materials: newMaterials,
          evolvedCards: newEvolvedCards,
        });

        // Update collection store to remove sacrificed cards
        if (sacrificedCardIds.length > 0) {
          useCollectionStore.setState({ fusedPokemon: updatedFusedPokemon });
        }

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