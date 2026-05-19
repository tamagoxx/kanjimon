// Pokemon Moves Cache - fetched from PokeAPI https://pokeapi.co/api/v2/move/{id or name}/
// Moves are cached to avoid repeated API calls

export interface PokemonMove {
  id: number;
  name: string;
  accuracy: number;       // 0-100 percentage
  power: number;          // base damage (0 if no damage)
  pp: number;             // uses per battle
  type: string;           // elemental type e.g. "fire", "water"
  category: 'physical' | 'special' | 'status';
  description: string;    // effect text
  drain: number;          // HP drain % (for leech seed type moves)
  recoil: number;         // damage taken by user %
  critRate: number;        // additional crit chance %
  priority: number;       // turn order priority
  minHits?: number;       // for multi-hit moves
  maxHits?: number;
}

const moveCache = new Map<string, PokemonMove>();

// Popular moves to pre-load for common Pokemon
export const POPULAR_MOVE_IDS: string[] = [
  'tackle', 'scratch', 'vine-whip', 'water-gun', 'ember', 'thunder-shock',
  'quick-attack', 'bite', 'headbutt', 'horn-attack', 'body-slam', 'take-down',
  'double-edge', 'growl', 'leer', 'roar', 'sing', 'supersonic',
  'thunder-wave', 'toxic', 'hypnosis', 'mimic', 'screech', 'withdraw',
  'defense-curl', 'focus-energy', 'bide', 'slash', 'substitute',
  'rest', 'sleep-talk', 'curse', 'protect', 'spikes', 'rollout',
  'swagger', 'attract', 'return', 'frustration', 'safeguard', 'pain-split',
  'wish', 'future-sight', 'stockpile', 'spit-up', 'swallow', 'heat-wave',
  'hail', 'torment', 'flail', 'facade', 'focus-punch', 'follow-me',
  'nature-power', 'charge', 'taunt', 'helping-hand', 'knock-off',
  'sucker-punch', 'exit', 'skill-swap', 'role-play', 'captivate', 'power-swap',
  'guard-swap', 'speed-swap', 'heart-swap', 'power-trick', 'psycho-shift',
  'cooldown', 'attack-order', 'defend-order', 'recover', 'transform',
];

export const MOVE_TYPE_COLORS: Record<string, string> = {
  fire: '#ff6b35', water: '#4facfe', grass: '#4bddb7', electric: '#ffd93d',
  psychic: '#c77dff', normal: '#a8a8a8', bug: '#7cb342', poison: '#ba68c8',
  ground: '#c69c6d', rock: '#8d6e63', flying: '#81d4fa', fighting: '#ef5350',
  ghost: '#7c4dff', ice: '#4dd0e1', dragon: '#ff7043', dark: '#5c6bc0',
  steel: '#90a4ae', fairy: '#f48fb1',
};

export const MOVE_CATEGORY_ICONS: Record<string, string> = {
  physical: '💥',
  special: '✨',
  status: '🛡️',
};

export function getMoveCacheKey(moveIdentifier: string): string {
  return moveIdentifier.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function fetchMove(moveIdentifier: string): Promise<PokemonMove | null> {
  const key = getMoveCacheKey(moveIdentifier);

  if (moveCache.has(key)) {
    return moveCache.get(key)!;
  }

  try {
    const response = await fetch(`https://pokeapi.co/api/v2/move/${encodeURIComponent(moveIdentifier.toLowerCase())}`);
    if (!response.ok) {
      console.warn(`[Moves] Move not found: ${moveIdentifier}`);
      return null;
    }

    const data = await response.json();

    // Extract effect from flavor_text_entries (English)
    let description = '';
    const enEntry = data.flavor_text_entries?.find((e: any) => e.language.name === 'en');
    if (enEntry) {
      description = enEntry.flavor_text.replace(/\f/g, ' ').trim();
    }

    // Extract secondary effect from effect_entries
    let secondaryEffect = '';
    const effEntry = data.effect_entries?.find((e: any) => e.language.name === 'en');
    if (effEntry) {
      secondaryEffect = effEntry.effect.replace(/\$effect_chance/g, `${data.meta?.accuracy || 0}`).replace(/\[.+?\]/g, '');
    }

    const move: PokemonMove = {
      id: data.id,
      name: data.name.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      accuracy: data.accuracy ?? 0,
      power: data.power ?? 0,
      pp: data.pp ?? 5,
      type: data.type?.name || 'normal',
      category: data.damage_class?.name === 'physical' ? 'physical' :
                data.damage_class?.name === 'special' ? 'special' : 'status',
      description: description || secondaryEffect || 'No additional effect.',
      drain: data.drain ?? 0,
      recoil: data.recoil ?? 0,
      critRate: data.crit_rate ?? 0,
      priority: data.priority ?? 0,
      minHits: data.min_hits,
      maxHits: data.max_hits,
    };

    moveCache.set(key, move);
    return move;
  } catch (error) {
    console.error(`[Moves] Failed to fetch move ${moveIdentifier}:`, error);
    return null;
  }
}

// Batch fetch multiple moves (for preloading a Pokemon's movepool)
export async function fetchMoves(moveIdentifiers: string[]): Promise<Record<string, PokemonMove>> {
  const results: Record<string, PokemonMove> = {};

  await Promise.all(
    moveIdentifiers.map(async (id) => {
      const move = await fetchMove(id);
      if (move) {
        const key = getMoveCacheKey(id);
        results[key] = move;
      }
    })
  );

  return results;
}

// Get mock moves for a Pokemon based on its types (fallback when API unavailable)
export function getMockMovesForTypes(types: string[]): PokemonMove[] {
  const typeToMoves: Record<string, string[]> = {
    fire: ['ember', 'fire-spin', 'flame-wheel', 'flame-burst'],
    water: ['water-gun', 'bubble', 'aqua-jet', 'hydro-pump'],
    grass: ['vine-whip', 'absorb', 'leech-seed', 'synthesis'],
    electric: ['thunder-shock', 'spark', 'charge', 'thunder'],
    psychic: ['confusion', 'psybeam', 'psycho-shift', 'psychic'],
    normal: ['tackle', 'quick-attack', 'body-slam', 'return'],
    fighting: ['karate-chop', 'double-kick', 'focus-energy', 'cross-chop'],
    flying: ['peck', 'wing-attack', 'aerial-ace', 'sky-attack'],
    poison: ['poison-sting', 'acid', 'toxic-spikes', 'sludge'],
    ground: ['mud-slap', 'dig', 'earthquake', 'fissure'],
    rock: ['rock-throw', 'rollout', 'rock-slide', 'stone-edge'],
    ghost: ['lick', 'night-shade', 'shadow-ball', 'destiny-bond'],
    ice: ['powder-snow', 'ice-beam', 'frost-breath', 'blizzard'],
    dragon: ['dragon-breath', 'twister', 'dragon-pulse', 'outrage'],
    dark: ['bite', 'pursuit', 'crunch', 'dark-pulse'],
    steel: ['tackle', 'iron-head', 'steel-wing', 'flash-cannon'],
    fairy: ['charm', 'disarming-voice', 'dazzling-gleam', 'moonblast'],
    bug: ['bug-bite', 'string-shot', 'struggle', 'u-turn'],
  };

  const moves: PokemonMove[] = [];
  for (const type of types) {
    const typeMoves = typeToMoves[type] || typeToMoves.normal;
    typeMoves.forEach(moveId => {
      if (!moves.find(m => m.type === type)) {
        // Add mock move
        moves.push({
          id: Math.floor(Math.random() * 900) + 100,
          name: moveId.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          accuracy: 95,
          power: 40,
          pp: 20,
          type,
          category: 'physical',
          description: 'A reliable move.',
          drain: 0,
          recoil: 0,
          critRate: 0,
          priority: 0,
        });
      }
    });
  }

  return moves.slice(0, 4);
}

export function formatMoveName(name: string): string {
  return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}