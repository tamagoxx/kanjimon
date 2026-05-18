import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Rarity, FusedPokemon } from '@/types';
import { POKEMON_FUSION_RECIPES as RECIPES } from '@/types';
import { useCollectionStore } from './collectionStore';

function getHigherRarity(a: Rarity, b: Rarity): Rarity {
  const order: Rarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'ULTRA_RARE'];
  return order.indexOf(a) >= order.indexOf(b) ? a : b;
}

function getLowerRarity(a: Rarity, b: Rarity): Rarity {
  const order: Rarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'ULTRA_RARE'];
  return order.indexOf(a) <= order.indexOf(b) ? a : b;
}

interface FusionCheck {
  possible: boolean;
  reason?: string;
  cost?: number;
  resultRarity?: Rarity;
}

interface FuseResult {
  success: boolean;
  fusedPokemon?: FusedPokemon;
  error?: string;
}

interface FusionState {
  canFuse: (pokemonIdA: number, pokemonIdB: number) => FusionCheck;
  fusePokemon: (pokemonIdA: number, pokemonIdB: number) => FuseResult;
}

export const useFusionStore = create<FusionState>()(
  persist(
    (set, get) => ({
      canFuse: (pokemonIdA: number, pokemonIdB: number): FusionCheck => {
        // Only allow fusion of Pokemon from REST API (id < 10000)
        // Fused Pokemon (id >= 10000) cannot be used for fusion
        if (pokemonIdA >= 10000 || pokemonIdB >= 10000) {
          return { possible: false, reason: 'Hanya Pokemon dari API yang bisa di-fusion' };
        }

        if (pokemonIdA === pokemonIdB) {
          return { possible: false, reason: 'Tidak bisa fuse Pokemon yang sama' };
        }

        const collection = useCollectionStore.getState();
        const pokeA = collection.ownedPokemon.find(p => p.pokemonId === pokemonIdA);
        const pokeB = collection.ownedPokemon.find(p => p.pokemonId === pokemonIdB);

        if (!pokeA || !pokeB) {
          return { possible: false, reason: 'Pokemon tidak ditemukan di koleksi' };
        }

        const rarityA = pokeA.rarity;
        const rarityB = pokeB.rarity;
        const higherRarity = getHigherRarity(rarityA, rarityB);

        if (higherRarity === 'ULTRA_RARE') {
          // UR+UR → refine stats, no rarity change
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

      fusePokemon: (pokemonIdA: number, pokemonIdB: number): FuseResult => {
        const check = get().canFuse(pokemonIdA, pokemonIdB);
        if (!check.possible || !check.cost || !check.resultRarity) {
          return { success: false, error: check.reason };
        }

        const collection = useCollectionStore.getState();
        const pokeA = collection.ownedPokemon.find(p => p.pokemonId === pokemonIdA)!;
        const pokeB = collection.ownedPokemon.find(p => p.pokemonId === pokemonIdB)!;

        // Only allow fusion of Pokemon caught from REST API (id < 10000)
        // Fused Pokemon (id >= 10000) cannot be used for further fusion
        if (pokemonIdA >= 10000 || pokemonIdB >= 10000) {
          return { success: false, error: 'Hanya Pokemon dari REST API yang bisa di-fusion' };
        }

        const rarityA = pokeA.rarity;
        const rarityB = pokeB.rarity;
        const higherRarity = getHigherRarity(rarityA, rarityB);
        const lowerRarity = getLowerRarity(rarityA, rarityB);

        // Deduct diamonds
        if (!collection.spendDiamonds(check.cost)) {
          return { success: false, error: 'Diamond tidak cukup' };
        }

        // Higher-rarity Pokemon provides base stats
        const basePoke = rarityA === higherRarity ? pokeA : pokeB;
        const recipe = RECIPES[lowerRarity];

        // Combine types (unique, max 2)
        const combinedTypes = [...new Set([...pokeA.types, ...pokeB.types])].slice(0, 2);

        // Generate fused Pokemon with pokemonId >= 10000 for deck integration
        const fusedId = `fused_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        // Use a numeric pokemonId >= 10000 so it integrates with deck/battle (poke-10001, etc.)
        const existingFusedIds = collection.fusedPokemon.map(fp => fp.pokemonId).filter(id => id >= 10000);
        const fusedPokemonId = existingFusedIds.length > 0 ? Math.max(...existingFusedIds) + 1 : 10001;
        const fusedPokemon = {
          id: fusedId,
          pokemonId: fusedPokemonId,
          parentPokemonIds: [pokemonIdA, pokemonIdB] as [number, number],
          name: `${pokeA.name} x ${pokeB.name}`,
          types: combinedTypes,
          baseHp: basePoke.hp + recipe.statBonus.hp,
          baseAttack: basePoke.attack + recipe.statBonus.attack,
          baseDefense: basePoke.defense + recipe.statBonus.defense,
          baseSpeed: basePoke.speed + recipe.statBonus.speed,
          level: 1,
          exp: 0,
          fusionCount: 1,
          learnedAt: new Date().toISOString(),
          element: basePoke.element,
          image: basePoke.image,
          rarity: check.resultRarity,
          evolutionTier: 'NONE' as const,
        };

        // Remove parent Pokemon from collection
        collection.releasePokemon(pokemonIdA);
        collection.releasePokemon(pokemonIdB);

        // Add fused Pokemon to collection
        collection.addFusedPokemon(fusedPokemon);

        return { success: true, fusedPokemon };
      },
    }),
    {
      name: 'kanjimon-fusion',
    }
  )
);