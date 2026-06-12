/**
 * Pure helper for fusion-page evolution sacrifice pool.
 * Source: BOTH ownedPokemon (caught wild UR) AND fusedPokemon (UR+ fusions).
 * Excludes: the evolve target itself, and the target's parent Pokemon.
 */
import type { PokemonCard } from '@/store/collectionStore';
import type { FusedPokemon } from '@/types';

export type SacrificeSource = 'wild' | 'fused';

export interface SacrificeOption {
  pokemonId: number;
  name: string;
  image: string;
  rarity: string;
  element: string;
  source: SacrificeSource;
  fusedId?: string; // for source='fused' so we can remove from fusedPokemon
}

export interface EvolveTargetLite {
  id: string; // fusedPokemon uuid
  pokemonId: number; // numeric id (>= 10001 for fusions)
  parentPokemonIds: [number, number];
}

export function getSacrificeOptions(
  ownedPokemon: PokemonCard[],
  fusedPokemon: FusedPokemon[],
  evolveTarget: EvolveTargetLite | null
): SacrificeOption[] {
  const excludeIds = new Set<number>();
  if (evolveTarget) {
    excludeIds.add(evolveTarget.pokemonId);
    if (evolveTarget.parentPokemonIds[0] != null) excludeIds.add(evolveTarget.parentPokemonIds[0]);
    if (evolveTarget.parentPokemonIds[1] != null) excludeIds.add(evolveTarget.parentPokemonIds[1]);
  }

  const wild: SacrificeOption[] = ownedPokemon
    .filter(p => p.rarity === 'ULTRA_RARE' && !excludeIds.has(p.pokemonId))
    .map(p => ({
      pokemonId: p.pokemonId,
      name: p.name,
      image: p.image,
      rarity: p.rarity,
      element: p.element,
      source: 'wild',
    }));

  const fused: SacrificeOption[] = fusedPokemon
    .filter(p => p.rarity === 'ULTRA_RARE' && !excludeIds.has(p.pokemonId))
    .map(p => ({
      pokemonId: p.pokemonId,
      name: p.name,
      image: p.image,
      rarity: p.rarity,
      element: p.element,
      source: 'fused',
      fusedId: p.id,
    }));

  return [...wild, ...fused];
}
