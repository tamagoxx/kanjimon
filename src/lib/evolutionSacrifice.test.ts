import { describe, it, expect, beforeEach } from 'vitest';
import { useCollectionStore } from '@/store/collectionStore';
import { useEvolutionStore, FUSION_SACRIFICE_VALUES } from '@/store/evolutionStore';
import type { FusedPokemon } from '@/types';

// Reset stores between tests
const resetStores = () => {
  useCollectionStore.setState({
    ownedCards: [],
    ownedPokemon: [],
    fusedPokemon: [],
    coins: 100000,
    diamonds: 1000,
  });
  useEvolutionStore.setState({
    materials: {
      COSMIC_DUST: 0, CELESTIAL_SHARD: 0, DIVINE_ESSENCE: 0, ULTIMATE_CORE: 0, ETERNAL_FRAGMENT: 0,
      VOID_SHARD: 0, PRIMORDIAL_CRYSTAL: 0, OMNIPOTENT_RUNE: 0,
    },
    evolvedCards: {},
  });
};

const makeFusion = (id: string, rarity: FusedPokemon['rarity']): FusedPokemon => ({
  id,
  pokemonId: 10000 + parseInt(id.split('-')[1] || '0'),
  parentPokemonIds: [1, 2],
  name: `Fusion ${id}`,
  types: ['NORMAL'],
  baseHp: 100,
  baseAttack: 50,
  baseDefense: 30,
  baseSpeed: 20,
  level: 1,
  exp: 0,
  fusionCount: 1,
  learnedAt: new Date().toISOString(),
  element: 'NORMAL',
  image: '',
  rarity,
  evolutionTier: 'NONE',
});

describe('FUSION_SACRIFICE_VALUES', () => {
  it('UR yields 1 cosmic dust only (the user’s case)', () => {
    expect(FUSION_SACRIFICE_VALUES.ULTRA_RARE).toEqual({ cosmicDust: 1, celestialShard: 0 });
  });

  it('higher tiers yield more dust and shards', () => {
    expect(FUSION_SACRIFICE_VALUES.MYTHICAL.celestialShard).toBe(1);
    expect(FUSION_SACRIFICE_VALUES.ETERNAL.celestialShard).toBeGreaterThan(FUSION_SACRIFICE_VALUES.MYTHICAL.celestialShard);
  });

  it('tiers below UR yield nothing (cannot sacrifice)', () => {
    expect(FUSION_SACRIFICE_VALUES.COMMON).toEqual({ cosmicDust: 0, celestialShard: 0 });
    expect(FUSION_SACRIFICE_VALUES.RARE).toEqual({ cosmicDust: 0, celestialShard: 0 });
  });
});

describe('getEligibleFusionCards', () => {
  beforeEach(resetStores);

  it('returns empty when no fusion cards', () => {
    expect(useEvolutionStore.getState().getEligibleFusionCards()).toEqual([]);
  });

  it('excludes COMMON/UNCOMMON/RARE fusion cards', () => {
    useCollectionStore.setState({
      fusedPokemon: [
        makeFusion('f-1', 'COMMON'),
        makeFusion('f-2', 'RARE'),
        makeFusion('f-3', 'ULTRA_RARE'),
      ],
    });
    const eligible = useEvolutionStore.getState().getEligibleFusionCards();
    expect(eligible.map(c => c.id)).toEqual(['f-3']);
  });

  it('includes UR and all higher tiers', () => {
    useCollectionStore.setState({
      fusedPokemon: [
        makeFusion('f-1', 'ULTRA_RARE'),
        makeFusion('f-2', 'LEGENDARY'),
        makeFusion('f-3', 'MYTHICAL'),
        makeFusion('f-4', 'ETERNAL'),
      ],
    });
    const ids = useEvolutionStore.getState().getEligibleFusionCards().map(c => c.id);
    expect(ids).toEqual(['f-1', 'f-2', 'f-3', 'f-4']);
  });
});

describe('calculateSacrificeContribution', () => {
  beforeEach(resetStores);

  it('sums dust and shards across multiple fusion cards', () => {
    useCollectionStore.setState({
      fusedPokemon: [
        makeFusion('f-1', 'ULTRA_RARE'),   // 1 dust
        makeFusion('f-2', 'ULTRA_RARE'),   // 1 dust
        makeFusion('f-3', 'MYTHICAL'),     // 3 dust + 1 shard
      ],
    });
    const result = useEvolutionStore.getState().calculateSacrificeContribution(['f-1', 'f-2', 'f-3']);
    expect(result.cosmicDust).toBe(5);
    expect(result.celestialShard).toBe(1);
  });

  it('returns zeros for empty selection', () => {
    expect(useEvolutionStore.getState().calculateSacrificeContribution([])).toEqual({ cosmicDust: 0, celestialShard: 0 });
  });

  it('skips non-existent card ids', () => {
    useCollectionStore.setState({ fusedPokemon: [makeFusion('f-1', 'ULTRA_RARE')] });
    const result = useEvolutionStore.getState().calculateSacrificeContribution(['f-1', 'f-999']);
    expect(result.cosmicDust).toBe(1);
  });
});

describe('hasEnoughMaterials with sacrifice', () => {
  beforeEach(resetStores);

  it('returns false when no dust AND no sacrifice covers gap', () => {
    const result = useEvolutionStore.getState().hasEnoughMaterials('TRANSCENDENT');
    expect(result).toBe(false);
  });

  it('returns true when sacrifice contribution covers the gap', () => {
    // TRANSCENDENT needs 3 cosmic dust + 1 celestial shard + 5000 gold
    useCollectionStore.setState({ coins: 100000 });
    useCollectionStore.setState({
      fusedPokemon: [
        makeFusion('f-1', 'MYTHICAL'),  // 3 dust + 1 shard
      ],
    });
    const contribution = useEvolutionStore.getState().calculateSacrificeContribution(['f-1']);
    const result = useEvolutionStore.getState().hasEnoughMaterials('TRANSCENDENT', contribution);
    expect(result).toBe(true);
  });
});

describe('evolveCard with sacrifice', () => {
  beforeEach(resetStores);

  it('removes sacrificed fusion cards from collection after evolve', () => {
    // Setup: a MYTHICAL pokemon to evolve, plus 2 UR fusions to sacrifice
    const target = {
      id: 'poke-target',
      pokemonId: 25,
      name: 'Pikachu',
      types: ['ELECTRIC'],
      hp: 100,
      attack: 50,
      defense: 30,
      speed: 90,
      level: 1,
      exp: 0,
      fusionCount: 1,
      learnedAt: new Date().toISOString(),
      element: 'ELECTRIC',
      image: '',
      rarity: 'MYTHICAL' as const,
    };
    useCollectionStore.setState({
      ownedPokemon: [target as any],
      coins: 100000,
      fusedPokemon: [
        makeFusion('f-1', 'ULTRA_RARE'),
        makeFusion('f-2', 'ULTRA_RARE'),
        makeFusion('f-3', 'ULTRA_RARE'),
      ],
    });

    const sacrifice = useEvolutionStore.getState().calculateSacrificeContribution(['f-1', 'f-2', 'f-3']);
    expect(sacrifice.cosmicDust).toBe(3);
    const canCheck = useEvolutionStore.getState().canEvolveCard('poke-target', sacrifice);
    if (!canCheck.canEvolve) {
      // eslint-disable-next-line no-console
      console.error('CAN EVOLVE FAILED:', canCheck.reason);
    }
    expect(canCheck.canEvolve).toBe(true);

    const result = useEvolutionStore.getState().evolveCard(
      'poke-target',
      'MYTHICAL',
      { hp: 100, attack: 50, defense: 30 },
      ['f-1', 'f-2', 'f-3']
    );
    if (!result.success) console.error('EVOLVE FAILED:', result.error);
    // eslint-disable-next-line no-console
    expect(result.error).toBeUndefined();
    expect(result.success).toBe(true);

    // Sacrificed cards removed
    const remaining = useCollectionStore.getState().fusedPokemon;
    expect(remaining.map(c => c.id)).toEqual([]);
    // Evolved card tracked
    expect(useEvolutionStore.getState().evolvedCards['poke-target']).toBeDefined();
  });
});

// ============================================================
// Evolution chain: card's actual rarity must advance
// MYTHICAL → TRANSCENDENT → CELESTIAL → DIVINE → ULTIMATE → ETERNAL
// ============================================================

describe('evolution chain: rarity actually advances', () => {
  beforeEach(resetStores);

  const makeMythicalTarget = (id: string) => ({
    id,
    pokemonId: 25,
    name: 'Pikachu',
    types: ['ELECTRIC'],
    hp: 100,
    attack: 50,
    defense: 30,
    speed: 90,
    level: 1,
    exp: 0,
    fusionCount: 2,  // satisfies TRANSCENDENT+ fusionCount req
    learnedAt: new Date().toISOString(),
    element: 'ELECTRIC',
    image: '',
    rarity: 'MYTHICAL' as const,
  });

  const topUpMaterials = () => {
    useEvolutionStore.setState({
      materials: {
        COSMIC_DUST: 99, CELESTIAL_SHARD: 99, DIVINE_ESSENCE: 99, ULTIMATE_CORE: 99, ETERNAL_FRAGMENT: 99,
        VOID_SHARD: 99, PRIMORDIAL_CRYSTAL: 99, OMNIPOTENT_RUNE: 99,
      },
    });
  };

  it('evolveCard updates the actual card rarity to TRANSCENDENT', () => {
    useCollectionStore.setState({ ownedPokemon: [makeMythicalTarget('p')] as any, coins: 1_000_000 });
    topUpMaterials();
    const result = useEvolutionStore.getState().evolveCard('p', 'MYTHICAL', { hp: 100, attack: 50, defense: 30 });
    expect(result.success).toBe(true);
    const card = useCollectionStore.getState().ownedPokemon.find(p => p.id === 'p');
    expect(card?.rarity).toBe('TRANSCENDENT');
  });

  it('evolveCard updates fusedPokemon rarity when target is a fusion', () => {
    const fusion: FusedPokemon = { ...makeFusion('f-1', 'MYTHICAL'), fusionCount: 2 };
    useCollectionStore.setState({ fusedPokemon: [fusion], coins: 1_000_000 });
    topUpMaterials();
    const result = useEvolutionStore.getState().evolveCard('f-1', 'MYTHICAL', { hp: 100, attack: 50, defense: 30 });
    expect(result.success).toBe(true);
    const card = useCollectionStore.getState().fusedPokemon.find(p => p.id === 'f-1');
    expect(card?.rarity).toBe('TRANSCENDENT');
  });

  it('chain: MYTHICAL → TRANSCENDENT → CELESTIAL → DIVINE → ULTIMATE → ETERNAL (still evolvable to NIHIL after this)', () => {
    useCollectionStore.setState({ ownedPokemon: [makeMythicalTarget('p')] as any, coins: 10_000_000 });
    topUpMaterials();
    const tiers: Array<'MYTHICAL' | 'TRANSCENDENT' | 'CELESTIAL' | 'DIVINE' | 'ULTIMATE' | 'ETERNAL' | 'NIHIL' | 'PRIMORDIAL' | 'OMNIPOTENT'> =
      ['MYTHICAL', 'TRANSCENDENT', 'CELESTIAL', 'DIVINE', 'ULTIMATE', 'ETERNAL', 'NIHIL', 'PRIMORDIAL', 'OMNIPOTENT'];
    for (let i = 0; i < tiers.length - 1; i++) {
      const before = useCollectionStore.getState().ownedPokemon.find(p => p.id === 'p')!;
      expect(before.rarity).toBe(tiers[i]);
      const result = useEvolutionStore.getState().evolveCard('p', tiers[i], { hp: 100, attack: 50, defense: 30 });
      if (!result.success) throw new Error(`evolve ${tiers[i]}→${tiers[i+1]} failed: ${result.error}`);
      const after = useCollectionStore.getState().ownedPokemon.find(p => p.id === 'p')!;
      expect(after.rarity).toBe(tiers[i + 1]);
    }
    // Now OMNIPOTENT: canEvolve should say no (max tier)
    const check = useEvolutionStore.getState().canEvolveCard('p');
    expect(check.canEvolve).toBe(false);
    expect(check.reason).toBe('Already at max tier');
  });

  it('chain works for fusedPokemon too (f-1 evolves to OMNIPOTENT)', () => {
    const fusion: FusedPokemon = { ...makeFusion('f-1', 'MYTHICAL'), fusionCount: 15 };
    useCollectionStore.setState({ fusedPokemon: [fusion], coins: 5_000_000 });
    topUpMaterials();
    let current: 'MYTHICAL' | 'TRANSCENDENT' | 'CELESTIAL' | 'DIVINE' | 'ULTIMATE' | 'ETERNAL' | 'NIHIL' | 'PRIMORDIAL' | 'OMNIPOTENT' = 'MYTHICAL';
    while (current !== 'OMNIPOTENT') {
      const result = useEvolutionStore.getState().evolveCard('f-1', current, { hp: 100, attack: 50, defense: 30 });
      if (!result.success) throw new Error(`evolve ${current} failed: ${result.error}`);
      const card = useCollectionStore.getState().fusedPokemon.find(p => p.id === 'f-1')!;
      current = card.rarity as typeof current;
    }
    expect(current).toBe('OMNIPOTENT');
  });
});

// ============================================================
// Extended evolution chain: MYTHICAL → ... → ETERNAL → NIHIL → PRIMORDIAL → OMNIPOTENT
// ============================================================

describe('evolution chain: tiers above ETERNAL (NIHIL → OMNIPOTENT)', () => {
  beforeEach(resetStores);

  const makeMythicalTarget = (id: string, fusionCount = 15) => ({
    id,
    pokemonId: 25,
    name: 'Pikachu',
    types: ['ELECTRIC'],
    hp: 100,
    attack: 50,
    defense: 30,
    speed: 90,
    level: 1,
    exp: 0,
    fusionCount,
    learnedAt: new Date().toISOString(),
    element: 'ELECTRIC',
    image: '',
    rarity: 'MYTHICAL' as const,
  });

  const topUpMaterials = () => {
    useEvolutionStore.setState({
      materials: {
        COSMIC_DUST: 99, CELESTIAL_SHARD: 99, DIVINE_ESSENCE: 99, ULTIMATE_CORE: 99, ETERNAL_FRAGMENT: 99,
        VOID_SHARD: 99, PRIMORDIAL_CRYSTAL: 99, OMNIPOTENT_RUNE: 99,
      },
    });
  };

  it('canEvolveToTier returns NIHIL for ETERNAL', () => {
    // canEvolveCard uses the chain logic
    useCollectionStore.setState({ ownedPokemon: [makeMythicalTarget('p', 15)] as any, coins: 5_000_000 });
    topUpMaterials();
    // EARN ETERNAL first
    let current: 'MYTHICAL' | 'TRANSCENDENT' | 'CELESTIAL' | 'DIVINE' | 'ULTIMATE' | 'ETERNAL' | 'NIHIL' | 'PRIMORDIAL' | 'OMNIPOTENT' = 'MYTHICAL';
    while (current !== 'ETERNAL') {
      const r = useEvolutionStore.getState().evolveCard('p', current, { hp: 100, attack: 50, defense: 30 });
      if (!r.success) throw new Error(`Failed at ${current}: ${r.error}`);
      current = useCollectionStore.getState().ownedPokemon.find(x => x.id === 'p')!.rarity as typeof current;
    }
    expect(current).toBe('ETERNAL');
    // Now check that ETERNAL can evolve to NIHIL
    const check = useEvolutionStore.getState().canEvolveCard('p');
    expect(check.canEvolve).toBe(true);
    expect(check.nextTier).toBe('NIHIL');
  });

  it('full chain: MYTHICAL → OMNIPOTENT (8 evolutions)', () => {
    useCollectionStore.setState({ ownedPokemon: [makeMythicalTarget('p', 15)] as any, coins: 5_000_000 });
    topUpMaterials();
    const tiers: Array<'MYTHICAL' | 'TRANSCENDENT' | 'CELESTIAL' | 'DIVINE' | 'ULTIMATE' | 'ETERNAL' | 'NIHIL' | 'PRIMORDIAL' | 'OMNIPOTENT'> =
      ['MYTHICAL', 'TRANSCENDENT', 'CELESTIAL', 'DIVINE', 'ULTIMATE', 'ETERNAL', 'NIHIL', 'PRIMORDIAL', 'OMNIPOTENT'];
    for (let i = 0; i < tiers.length - 1; i++) {
      const before = useCollectionStore.getState().ownedPokemon.find(x => x.id === 'p')!;
      expect(before.rarity).toBe(tiers[i]);
      const r = useEvolutionStore.getState().evolveCard('p', tiers[i], { hp: 100, attack: 50, defense: 30 });
      if (!r.success) throw new Error(`evolve ${tiers[i]}→${tiers[i+1]} failed: ${r.error}`);
      const after = useCollectionStore.getState().ownedPokemon.find(x => x.id === 'p')!;
      expect(after.rarity).toBe(tiers[i + 1]);
    }
    // OMNIPOTENT = max tier, no further evolution
    const check = useEvolutionStore.getState().canEvolveCard('p');
    expect(check.canEvolve).toBe(false);
    expect(check.reason).toBe('Already at max tier');
  });

  it('full chain works for fusedPokemon too', () => {
    const fusion: FusedPokemon = { ...makeFusion('f-1', 'MYTHICAL'), fusionCount: 15 };
    useCollectionStore.setState({ fusedPokemon: [fusion], coins: 5_000_000 });
    topUpMaterials();
    const tiers: Array<'MYTHICAL' | 'TRANSCENDENT' | 'CELESTIAL' | 'DIVINE' | 'ULTIMATE' | 'ETERNAL' | 'NIHIL' | 'PRIMORDIAL' | 'OMNIPOTENT'> =
      ['MYTHICAL', 'TRANSCENDENT', 'CELESTIAL', 'DIVINE', 'ULTIMATE', 'ETERNAL', 'NIHIL', 'PRIMORDIAL', 'OMNIPOTENT'];
    for (let i = 0; i < tiers.length - 1; i++) {
      const r = useEvolutionStore.getState().evolveCard('f-1', tiers[i], { hp: 100, attack: 50, defense: 30 });
      if (!r.success) throw new Error(`evolve ${tiers[i]} failed: ${r.error}`);
    }
    const final = useCollectionStore.getState().fusedPokemon.find(p => p.id === 'f-1')!;
    expect(final.rarity).toBe('OMNIPOTENT');
  });

  it('getEvoStatMultiplier: NIHIL=2.5, PRIMORDIAL=3.0, OMNIPOTENT=3.5', async () => {
    const types = await import('@/types');
    expect(types.getEvoStatMultiplier('NIHIL')).toBeCloseTo(2.5, 2);
    expect(types.getEvoStatMultiplier('PRIMORDIAL')).toBeCloseTo(3.0, 2);
    expect(types.getEvoStatMultiplier('OMNIPOTENT')).toBeCloseTo(3.5, 2);
  });

  it('canEvolveToTier pure: ETERNAL→NIHIL, NIHIL→PRIMORDIAL, PRIMORDIAL→OMNIPOTENT, OMNIPOTENT→null', async () => {
    const types = await import('@/types');
    expect(types.canEvolveToTier('ETERNAL', 15)).toEqual({ canEvolve: true, nextTier: 'NIHIL' });
    expect(types.canEvolveToTier('NIHIL', 15)).toEqual({ canEvolve: true, nextTier: 'PRIMORDIAL' });
    expect(types.canEvolveToTier('PRIMORDIAL', 15)).toEqual({ canEvolve: true, nextTier: 'OMNIPOTENT' });
    expect(types.canEvolveToTier('OMNIPOTENT', 15)).toEqual({ canEvolve: false, nextTier: null });
  });

  it('FUSION_SACRIFICE_VALUES has entries for new tiers (NIHIL/PRIMORDIAL/OMNIPOTENT yield more dust)', () => {
    expect(FUSION_SACRIFICE_VALUES.NIHIL.celestialShard).toBeGreaterThan(FUSION_SACRIFICE_VALUES.ETERNAL.celestialShard);
    expect(FUSION_SACRIFICE_VALUES.PRIMORDIAL.celestialShard).toBeGreaterThan(FUSION_SACRIFICE_VALUES.NIHIL.celestialShard);
    expect(FUSION_SACRIFICE_VALUES.OMNIPOTENT.celestialShard).toBeGreaterThan(FUSION_SACRIFICE_VALUES.PRIMORDIAL.celestialShard);
  });
});
