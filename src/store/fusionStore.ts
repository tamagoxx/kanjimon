import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FusedCard, Rarity } from '@/types';
import { FUSION_RECIPES as RECIPES } from '@/types';
import { useCollectionStore } from './collectionStore';

// Helper: determine which card is "higher" rarity for stat inheritance
function getHigherRarity(a: Rarity, b: Rarity): Rarity {
  const order: Rarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'ULTRA_RARE'];
  return order.indexOf(a) >= order.indexOf(b) ? a : b;
}

function getLowerRarity(a: Rarity, b: Rarity): Rarity {
  const order: Rarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'ULTRA_RARE'];
  return order.indexOf(a) <= order.indexOf(b) ? a : b;
}

interface FusionState {
  fusedCards: FusedCard[];
  fusionHistory: Array<{
    id: string;
    cardId: string;
    parentCards: [string, string];
    fusedAt: string;
    rarityBefore: Rarity;
    rarityAfter: Rarity;
  }>;
  // Actions
  canFuse: (cardIdA: string, cardIdB: string) => { possible: boolean; reason?: string; cost?: number; resultRarity?: Rarity };
  fuseCards: (cardIdA: string, cardIdB: string) => { success: boolean; fusedCard?: FusedCard; error?: string };
  getFusedCard: (fusedCardId: string) => FusedCard | undefined;
  getFusedCardsByParent: (cardId: string) => FusedCard[];
}

export const useFusionStore = create<FusionState>()(
  persist(
    (set, get) => ({
      fusedCards: [],
      fusionHistory: [],

      canFuse: (cardIdA: string, cardIdB: string) => {
        if (cardIdA === cardIdB) {
          return { possible: false, reason: 'Tidak bisa fuse kartu yang sama' };
        }

        const collection = useCollectionStore.getState();
        const cardA = collection.ownedCards.find(c => c.cardId === cardIdA);
        const cardB = collection.ownedCards.find(c => c.cardId === cardIdB);

        if (!cardA || !cardB) {
          return { possible: false, reason: 'Kartu tidak ditemukan di koleksi' };
        }

        const rarityA = cardA.card.rarity;
        const rarityB = cardB.card.rarity;
        const higherRarity = getHigherRarity(rarityA, rarityB);

        // Check if already fused (max level UR can't be fused further for rarity)
        if (higherRarity === 'ULTRA_RARE') {
          // UR can still be fused but no rarity change — only stat refinement
          const cost = RECIPES.ULTRA_RARE.cost;
          if (collection.diamonds < cost) {
            return { possible: false, reason: `Butuh ${cost} diamonds (kamu: ${collection.diamonds})`, cost };
          }
          return { possible: true, cost, resultRarity: 'ULTRA_RARE' as Rarity };
        }

        const recipe = RECIPES[higherRarity];
        const cost = recipe.cost;

        if (collection.diamonds < cost) {
          return { possible: false, reason: `Butuh ${cost} diamonds (kamu: ${collection.diamonds})`, cost };
        }

        return { possible: true, cost, resultRarity: recipe.resultRarity };
      },

      fuseCards: (cardIdA: string, cardIdB: string) => {
        const check = get().canFuse(cardIdA, cardIdB);
        if (!check.possible || !check.cost || !check.resultRarity) {
          return { success: false, error: check.reason };
        }

        const collection = useCollectionStore.getState();
        const cardA = collection.ownedCards.find(c => c.cardId === cardIdA)!;
        const cardB = collection.ownedCards.find(c => c.cardId === cardIdB)!;

        const rarityA = cardA.card.rarity;
        const rarityB = cardB.card.rarity;
        const higherRarity = getHigherRarity(rarityA, rarityB);
        const lowerRarity = getLowerRarity(rarityA, rarityB);

        // Deduct diamonds
        collection.spendDiamonds(check.cost);

        // Use higher-rarity card as the base stats
        const baseCard = rarityA === higherRarity ? cardA : cardB;
        const recipe = RECIPES[lowerRarity]; // use the LOWER rarity's recipe for the boost

        const fusedCard: FusedCard = {
          id: `fused_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          parentCards: [cardIdA, cardIdB],
          baseHp: baseCard.card.hp + recipe.statBonus.hp,
          baseAttack: baseCard.card.attackPower + recipe.statBonus.attack,
          baseDefense: baseCard.card.defenseRating + recipe.statBonus.defense,
          level: 1,
          exp: 0,
          fusionCount: 1,
          learnedAt: new Date().toISOString(),
        };

        // Remove parent cards from ownedCards
        collection.removeCard(cardIdA);
        collection.removeCard(cardIdB);

        set(state => ({
          fusedCards: [...state.fusedCards, fusedCard],
          fusionHistory: [
            ...state.fusionHistory,
            {
              id: fusedCard.id,
              cardId: fusedCard.id,
              parentCards: [cardIdA, cardIdB],
              fusedAt: fusedCard.learnedAt,
              rarityBefore: higherRarity,
              rarityAfter: check.resultRarity!,
            },
          ],
        }));

        return { success: true, fusedCard };
      },

      getFusedCard: (fusedCardId: string) => {
        return get().fusedCards.find(fc => fc.id === fusedCardId);
      },

      getFusedCardsByParent: (cardId: string) => {
        return get().fusedCards.filter(fc => fc.parentCards.includes(cardId));
      },
    }),
    {
      name: 'kanjimon-fusion',
    }
  )
);