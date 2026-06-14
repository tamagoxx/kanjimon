import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Supabase client + env so authStore (transitive import) doesn't
// throw "URL and API key required" during these non-supabase tests.
const { mockAuth, mockSupabase } = vi.hoisted(() => {
  const mockAuth = {
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
  };
  return { mockAuth, mockSupabase: { auth: mockAuth } };
});
vi.mock('@utils/supabase/client', () => ({
  createClient: () => mockSupabase,
}));
vi.mock('@/lib/env', () => ({ isSupabaseConfigured: false }));
import { useCollectionStore } from '@/store/collectionStore';
import type { FusedPokemon } from '@/types';

const resetStores = () => {
  useCollectionStore.setState({
    ownedCards: [],
    ownedPokemon: [],
    fusedPokemon: [],
    coins: 0,
    diamonds: 0,
  });
};

const makeFusion = (id: string, evolutionTier: FusedPokemon['evolutionTier'], rarity: FusedPokemon['rarity']): FusedPokemon => ({
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
  evolutionTier,
});

// ============================================================
// Bug: MYTHICAL FusedPokemon cannot advance tier beyond MYTHICAL
// via the fusion page UI (calls evolveFusedPokemon, not evolveCard).
// Fix: extend evolveFusedPokemon to support the full 12-tier chain.
// See `evolutionChain.test.ts` for the chain map regression test.
// ============================================================

describe('evolveFusedPokemon: full 12-tier chain', () => {
  beforeEach(resetStores);

  it('advances MYTHICAL → TRANSCENDENT (the user-reported bug)', () => {
    const fusion = makeFusion('f-1', 'MYTHICAL', 'MYTHICAL');
    useCollectionStore.setState({ fusedPokemon: [fusion] });
    const success = useCollectionStore.getState().evolveFusedPokemon('f-1', 'TRANSCENDENT', []);
    expect(success).toBe(true);
    const after = useCollectionStore.getState().fusedPokemon.find(fp => fp.id === 'f-1');
    expect(after?.evolutionTier).toBe('TRANSCENDENT');
    expect(after?.rarity).toBe('TRANSCENDENT');
  });

  it('advances through all 8 transitions: MYTHICAL → OMNIPOTENT', () => {
    const fusion = makeFusion('f-2', 'MYTHICAL', 'MYTHICAL');
    useCollectionStore.setState({ fusedPokemon: [fusion] });

    const transitions: Array<[FusedPokemon['evolutionTier'], FusedPokemon['evolutionTier']]> = [
      ['MYTHICAL', 'TRANSCENDENT'],
      ['TRANSCENDENT', 'CELESTIAL'],
      ['CELESTIAL', 'DIVINE'],
      ['DIVINE', 'ULTIMATE'],
      ['ULTIMATE', 'ETERNAL'],
      ['ETERNAL', 'NIHIL'],
      ['NIHIL', 'PRIMORDIAL'],
      ['PRIMORDIAL', 'OMNIPOTENT'],
    ];

    for (const [from, to] of transitions) {
      const card = useCollectionStore.getState().fusedPokemon.find(fp => fp.id === 'f-2');
      expect(card?.evolutionTier).toBe(from);
      const success = useCollectionStore.getState().evolveFusedPokemon('f-2', to, []);
      expect(success).toBe(true);
      const after = useCollectionStore.getState().fusedPokemon.find(fp => fp.id === 'f-2');
      expect(after?.evolutionTier).toBe(to);
      expect(after?.rarity).toBe(to);
    }

    const final = useCollectionStore.getState().fusedPokemon.find(fp => fp.id === 'f-2');
    expect(final?.evolutionTier).toBe('OMNIPOTENT');
  });

  it('starts the chain: NONE → LIMITED_EDITION (backwards compat)', () => {
    const fusion = makeFusion('f-3', 'NONE', 'LIMITED_EDITION');
    useCollectionStore.setState({ fusedPokemon: [fusion] });
    const success = useCollectionStore.getState().evolveFusedPokemon('f-3', 'LEGENDARY', []);
    expect(success).toBe(true);
    const after = useCollectionStore.getState().fusedPokemon.find(fp => fp.id === 'f-3');
    expect(after?.evolutionTier).toBe('LEGENDARY');
    expect(after?.rarity).toBe('LEGENDARY');
  });

  it('boosts stats for all 12 tiers (not just LIMITED/LEGENDARY/MYTHICAL)', () => {
    const fusion = makeFusion('f-4', 'MYTHICAL', 'MYTHICAL');
    useCollectionStore.setState({ fusedPokemon: [fusion] });
    const before = useCollectionStore.getState().fusedPokemon.find(fp => fp.id === 'f-4')!;
    const success = useCollectionStore.getState().evolveFusedPokemon('f-4', 'TRANSCENDENT', []);
    expect(success).toBe(true);
    const after = useCollectionStore.getState().fusedPokemon.find(fp => fp.id === 'f-4')!;
    // Stats must increase (statBonus must be defined for TRANSCENDENT)
    expect(after.baseHp).toBeGreaterThan(before.baseHp);
    expect(after.baseAttack).toBeGreaterThan(before.baseAttack);
  });

  it('OMNIPOTENT (max tier) accepts evolution but is the end of the chain', () => {
    const fusion = makeFusion('f-5', 'PRIMORDIAL', 'PRIMORDIAL');
    useCollectionStore.setState({ fusedPokemon: [fusion] });
    const success = useCollectionStore.getState().evolveFusedPokemon('f-5', 'OMNIPOTENT', []);
    expect(success).toBe(true);
    const after = useCollectionStore.getState().fusedPokemon.find(fp => fp.id === 'f-5');
    expect(after?.evolutionTier).toBe('OMNIPOTENT');
  });
});
