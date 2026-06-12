import { describe, it, expect } from 'vitest';
import { getSacrificeOptions } from './evolutionSacrificePool';
import type { PokemonCard } from '@/store/collectionStore';
import type { FusedPokemon } from '@/types';

const wildRare = (id: number): PokemonCard => ({
  id: `wild-${id}`,
  pokemonId: id,
  name: `Wild #${id}`,
  types: ['NORMAL'],
  image: `img/${id}.png`,
  shinyImage: `img/${id}.shiny.png`,
  hp: 100, attack: 50, defense: 30, speed: 20,
  height: 1, weight: 10, ability: '—',
  rarity: 'RARE',
  element: 'NORMAL',
  flavorText: '',
  color: '#000',
  moves: [],
});

const wildUR = (id: number): PokemonCard => ({
  ...wildRare(id),
  rarity: 'ULTRA_RARE',
  name: `WildUR #${id}`,
});

const fusedUR = (id: number, uuid: string): FusedPokemon => ({
  id: uuid,
  pokemonId: id,
  parentPokemonIds: [1, 2],
  name: `Fused #${id}`,
  types: ['FIRE', 'WATER'],
  baseHp: 200, baseAttack: 80, baseDefense: 60, baseSpeed: 50,
  level: 1, exp: 0, fusionCount: 1,
  learnedAt: new Date().toISOString(),
  element: 'FIRE',
  image: `fused/${id}.png`,
  rarity: 'ULTRA_RARE',
  evolutionTier: 'NONE',
});

const evolveTarget = (uuid: string, pid: number, parents: [number, number]) => ({
  id: uuid,
  pokemonId: pid,
  parentPokemonIds: parents,
});

describe('getSacrificeOptions', () => {
  it('returns empty array when no UR pokemon owned', () => {
    const result = getSacrificeOptions([wildRare(1)], [], null);
    expect(result).toEqual([]);
  });

  it('includes wild ULTRA_RARE pokemon', () => {
    const result = getSacrificeOptions([wildUR(5), wildRare(3)], [], null);
    expect(result).toHaveLength(1);
    expect(result[0].pokemonId).toBe(5);
    expect(result[0].source).toBe('wild');
  });

  it('includes FUSED ULTRA_RARE pokemon (the bug fix)', () => {
    const result = getSacrificeOptions([], [fusedUR(10001, 'f-uuid')], null);
    expect(result).toHaveLength(1);
    expect(result[0].pokemonId).toBe(10001);
    expect(result[0].source).toBe('fused');
    expect(result[0].fusedId).toBe('f-uuid');
  });

  it('combines wild and fused UR pokemon', () => {
    const result = getSacrificeOptions(
      [wildUR(5)],
      [fusedUR(10001, 'f-1'), fusedUR(10002, 'f-2')],
      null
    );
    expect(result).toHaveLength(3);
    const sources = result.map(r => r.source).sort();
    expect(sources).toEqual(['fused', 'fused', 'wild']);
  });

  it('excludes the evolve target itself', () => {
    const result = getSacrificeOptions(
      [wildUR(10001)], // rare coincidence: same id as the fused target
      [fusedUR(10002, 'f-target')],
      evolveTarget('f-target', 10002, [1, 2])
    );
    // wildUR(10001) is NOT the target (different uuid scope), but the fusedUR with id 10002 IS the target
    expect(result.find(r => r.pokemonId === 10002)).toBeUndefined();
    expect(result.find(r => r.pokemonId === 10001)).toBeDefined();
  });

  it('excludes both parents of the evolve target', () => {
    const result = getSacrificeOptions(
      [wildUR(11), wildUR(22), wildUR(33)],
      [],
      evolveTarget('f-t', 99999, [11, 22])
    );
    expect(result).toHaveLength(1);
    expect(result[0].pokemonId).toBe(33);
  });

  it('excludes parents even if they are fused pokemon', () => {
    const result = getSacrificeOptions(
      [wildUR(11)],
      [fusedUR(22, 'f-22'), fusedUR(33, 'f-33')],
      evolveTarget('f-t', 99999, [11, 22])
    );
    // wildUR(11) excluded (parent), fusedUR(22) excluded (parent), only fusedUR(33) remains
    expect(result).toHaveLength(1);
    expect(result[0].pokemonId).toBe(33);
  });

  it('only includes ULTRA_RARE rarity, not higher tiers', () => {
    const result = getSacrificeOptions([], [
      { ...fusedUR(10001, 'f-ur'), rarity: 'ULTRA_RARE' },
      { ...fusedUR(10002, 'f-le'), rarity: 'LEGENDARY' },
      { ...fusedUR(10003, 'f-my'), rarity: 'MYTHICAL' },
    ], null);
    expect(result).toHaveLength(1);
    expect(result[0].pokemonId).toBe(10001);
  });

  it('preserves all display fields (name, image, rarity, element)', () => {
    const result = getSacrificeOptions([], [fusedUR(10001, 'f-1')], null);
    expect(result[0]).toMatchObject({
      pokemonId: 10001,
      name: 'Fused #10001',
      image: 'fused/10001.png',
      rarity: 'ULTRA_RARE',
      element: 'FIRE',
      source: 'fused',
      fusedId: 'f-1',
    });
  });
});
