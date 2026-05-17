'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore, PokemonCard } from '@/store/collectionStore';
import { Loader2, Gem, Lock, ChevronDown, ChevronUp, Sparkles, X, Shield, Swords, Heart, Zap } from 'lucide-react';

// ============================================================
// Types
// ============================================================
type GachaTier = 'bronze' | 'silver' | 'gold' | 'diamond';
type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'ULTRA_RARE';

interface GachaBanner {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  attempts: number;
  tiers: { tier: GachaTier; chance: number; rarities: Rarity[] }[];
  featured?: boolean;
}

interface PullResult {
  pokemon: PokemonCard;
  rarity: Rarity;
  isNew: boolean;
  tier: GachaTier;
}

// ============================================================
// Constants
// ============================================================
const TYPE_COLORS: Record<string, string> = {
  fire: '#ff6b35', water: '#4facfe', grass: '#4bddb7', electric: '#ffd93d',
  psychic: '#c77dff', normal: '#a8a8a8', bug: '#7cb342', poison: '#ba68c8',
  ground: '#c69c6d', rock: '#8d6e63', flying: '#81d4fa', fighting: '#ef5350',
  ghost: '#7c4dff', ice: '#4dd0e1', dragon: '#ff7043', dark: '#5c6bc0',
  steel: '#90a4ae', fairy: '#f48fb1',
};

const TYPE_TO_ELEMENT: Record<string, string> = {
  fire: 'FIRE', water: 'WATER', grass: 'GRASS', electric: 'ELECTRIC',
  psychic: 'PSYCHIC', normal: 'NORMAL', bug: 'GRASS', poison: 'PSYCHIC',
  ground: 'WATER', rock: 'NORMAL', flying: 'ELECTRIC', fighting: 'FIRE',
  ghost: 'PSYCHIC', ice: 'WATER', dragon: 'FIRE', dark: 'PSYCHIC',
  steel: 'NORMAL', fairy: 'PSYCHIC',
};

const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: '#a8a8a8',
  UNCOMMON: '#4facfe',
  RARE: '#c77dff',
  ULTRA_RARE: '#ffd700',
};

const RARITY_WEIGHTS: Record<GachaTier, Record<Rarity, number>> = {
  bronze: { COMMON: 70, UNCOMMON: 25, RARE: 5, ULTRA_RARE: 0 },
  silver: { COMMON: 50, UNCOMMON: 35, RARE: 14, ULTRA_RARE: 1 },
  gold: { COMMON: 30, UNCOMMON: 40, RARE: 25, ULTRA_RARE: 5 },
  diamond: { COMMON: 10, UNCOMMON: 30, RARE: 45, ULTRA_RARE: 15 },
};

const BANNERS: GachaBanner[] = [
  {
    id: 'starter',
    name: 'Starter Gacha',
    emoji: '🎁',
    description: 'Untuk pemula! Peluang menangkap Pokemon bagus.',
    cost: 30,
    attempts: 5,
    tiers: [
      { tier: 'bronze', chance: 60, rarities: ['COMMON', 'UNCOMMON'] },
      { tier: 'silver', chance: 30, rarities: ['UNCOMMON', 'RARE'] },
      { tier: 'gold', chance: 10, rarities: ['RARE', 'ULTRA_RARE'] },
    ],
  },
  {
    id: 'adventure',
    name: 'Adventure Gacha',
    emoji: '⚔️',
    description: 'Tantangan yang lebih besar, reward lebih tinggi!',
    cost: 80,
    attempts: 3,
    tiers: [
      { tier: 'bronze', chance: 30, rarities: ['COMMON', 'UNCOMMON'] },
      { tier: 'silver', chance: 40, rarities: ['UNCOMMON', 'RARE'] },
      { tier: 'gold', chance: 25, rarities: ['RARE', 'ULTRA_RARE'] },
      { tier: 'diamond', chance: 5, rarities: ['ULTRA_RARE'] },
    ],
  },
  {
    id: 'legendary',
    name: 'Legendary Gacha',
    emoji: '👑',
    description: 'Kesempatan terbesar mendapat Pokemon Legendary!',
    cost: 150,
    attempts: 1,
    tiers: [
      { tier: 'silver', chance: 20, rarities: ['UNCOMMON', 'RARE'] },
      { tier: 'gold', chance: 50, rarities: ['RARE', 'ULTRA_RARE'] },
      { tier: 'diamond', chance: 30, rarities: ['ULTRA_RARE'] },
    ],
    featured: true,
  },
];

// ============================================================
// Utilities
// ============================================================
function calculateHP(base: number) { return Math.floor(base * 0.9) + 50; }
function calculateAttack(base: number) { return Math.floor(base * 0.5) + 10; }
function calculateDefense(base: number) { return Math.floor(base * 0.1) + 1; }
function calculateSpeed(base: number) { return Math.floor(base * 0.5) + 5; }

function getRarityFromBase(baseTotal: number): Rarity {
  if (baseTotal >= 600) return 'ULTRA_RARE';
  if (baseTotal >= 450) return 'RARE';
  if (baseTotal >= 300) return 'UNCOMMON';
  return 'COMMON';
}

function getRarityFromTier(tier: GachaTier): Rarity {
  const weights = RARITY_WEIGHTS[tier];
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const [rarity, chance] of Object.entries(weights)) {
    cumulative += chance;
    if (rand < cumulative) return rarity as Rarity;
  }
  return 'COMMON';
}

function pickTier(tiers: GachaBanner['tiers']): GachaTier {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const { tier, chance } of tiers) {
    cumulative += chance;
    if (rand < cumulative) return tier;
  }
  return 'bronze';
}

// ============================================================
// Components
// ============================================================

// Currency display
function CurrencyBar({ diamonds, scrolls, pity, spark }: { diamonds: number; scrolls: number; pity: number; spark: number }) {
  const PITY_MAX = 50;
  return (
    <div className="sticky top-0 z-40 px-4 h-[72px] flex items-center justify-between" style={{ backgroundColor: '#0a1519' }}>
      <button onClick={() => window.history.back()} className="text-white/60 hover:text-white">← Back</button>
      <div className="flex items-center gap-2">
        {/* Scrolls */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: '#1a1a2e' }}>
          <span className="text-sm">📜</span>
          <span className="text-xs font-bold" style={{ color: '#c6bfff' }}>{scrolls}</span>
        </div>
        {/* Diamonds */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: '#1a1a2e' }}>
          <Gem className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold text-cyan-400">{diamonds.toLocaleString()}</span>
        </div>
        {/* Spark (every 5 pulls) */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: '#1a1a2e' }} title="Spark: Setiap 5 pull, guaranteed RARE+">
          <span className="text-xs">✨</span>
          <span className="text-[10px] font-bold" style={{ color: '#ffd700' }}>{spark}/5</span>
        </div>
        {/* Pity (50 pulls = guaranteed UR) */}
        <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: '#1a1a2e' }} title="Pity: Setelah 50 pull tanpa UR, pull berikutnya guaranteed ULTRA RARE">
          <span className="text-xs">💎</span>
          <span className="text-[10px] font-bold" style={{ color: pity >= PITY_MAX ? '#ff6b35' : '#a8a8a8' }}>{pity}/{PITY_MAX}</span>
        </div>
      </div>
    </div>
  );
}

// Banner card
function BannerCard({ banner, canPull, onPull, pulling }: {
  banner: GachaBanner; canPull: boolean; onPull: () => void; pulling: boolean;
}) {
  const gradient = banner.featured
    ? 'linear-gradient(135deg, #ffd70040, #ff8c0040, #ffd70020)'
    : 'linear-gradient(135deg, #1a1a2e, #2d2d44)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`rounded-2xl overflow-hidden ${banner.featured ? 'ring-2 ring-yellow-500/50' : ''}`}
      style={{ background: gradient }}
    >
      {banner.featured && (
        <div className="px-3 py-1 text-xs font-bold text-black text-center" style={{ backgroundColor: '#ffd700' }}>
          ⭐ FEATURED - Chance ULTRA RARE lebih tinggi!
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{banner.emoji}</span>
          <div>
            <h3 className="font-black text-white text-lg">{banner.name}</h3>
            <p className="text-xs text-white/50">{banner.description}</p>
          </div>
        </div>

        {/* Tier breakdown */}
        <div className="mb-4">
          <p className="text-xs text-white/40 mb-2">Tier Probabilities:</p>
          <div className="flex gap-2">
            {banner.tiers.map(t => (
              <div key={t.tier} className="flex-1 text-center p-2 rounded-lg" style={{ backgroundColor: '#ffffff10' }}>
                <span className="text-lg">{t.tier === 'bronze' ? '🥉' : t.tier === 'silver' ? '🥈' : t.tier === 'gold' ? '🥇' : '💎'}</span>
                <p className="text-[10px] text-white/60">{t.chance}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pull info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gem className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">{banner.cost} 💎</span>
            <span className="text-xs text-white/40">• {banner.attempts}x pull</span>
          </div>
          <button
            onClick={onPull}
            disabled={!canPull || pulling}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95 ${
              !canPull ? 'opacity-40 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90'
            }`}
          >
            {pulling ? <><Loader2 className="w-4 h-4 animate-spin inline" /> Processing...</> : '🎰 Pull!'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Individual Pokemon card reveal
function PokemonRevealCard({ result, index, delay }: { result: PullResult; index: number; delay: number }) {
  const [revealed, setRevealed] = useState(false);
  const rarityColor = RARITY_COLORS[result.rarity];

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), delay + index * 400);
    return () => clearTimeout(timer);
  }, [delay, index]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
      animate={revealed ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
      transition={{ type: 'spring', damping: 15, stiffness: 100 }}
      className={`relative rounded-2xl overflow-hidden ${
        result.rarity === 'ULTRA_RARE' ? 'ring-2 ring-yellow-400 shadow-yellow-400/50 shadow-2xl' :
        result.rarity === 'RARE' ? 'ring-1 ring-purple-400' : ''
      }`}
      style={{ backgroundColor: '#1a1a2e', borderTop: `4px solid ${rarityColor}` }}
    >
      {result.rarity === 'ULTRA_RARE' && (
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent pointer-events-none" />
      )}

      <div className="p-4 flex flex-col items-center">
        {/* Rarity badge */}
        <div className="mb-2 px-3 py-1 rounded-full text-xs font-bold text-black" style={{ backgroundColor: rarityColor }}>
          {result.rarity.replace('_', ' ')}
        </div>

        {/* Pokemon image */}
        <div className="relative w-24 h-24 flex items-center justify-center mb-3" style={{ backgroundColor: TYPE_COLORS[result.pokemon.types[0]] + '20' }}>
          <img src={result.pokemon.image} alt={result.pokemon.name} className="w-20 h-20 object-contain" />
          
          {/* Shiny indicator */}
          {result.pokemon.shinyImage && Math.random() < 0.1 && (
            <div className="absolute top-0 right-0 px-1 py-0.5 rounded-full bg-pink-500 text-[8px] font-bold text-white">✨ SHINY!</div>
          )}
        </div>

        {/* Pokemon name */}
        <p className="text-sm font-bold text-white capitalize mb-1">{result.pokemon.name}</p>
        <p className="text-[10px] text-white/40 mb-3">#{result.pokemon.pokemonId}</p>

        {/* Stats */}
        <div className="w-full grid grid-cols-3 gap-2 text-center">
          <div className="p-1.5 rounded-lg bg-black/20">
            <Heart className="w-3 h-3 text-red-400 mx-auto mb-0.5" />
            <span className="text-xs font-bold text-white">{result.pokemon.hp}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-black/20">
            <Swords className="w-3 h-3 text-orange-400 mx-auto mb-0.5" />
            <span className="text-xs font-bold text-white">{result.pokemon.attack}</span>
          </div>
          <div className="p-1.5 rounded-lg bg-black/20">
            <Shield className="w-3 h-3 text-blue-400 mx-auto mb-0.5" />
            <span className="text-xs font-bold text-white">{result.pokemon.defense}</span>
          </div>
        </div>

        {/* Type badges */}
        <div className="flex gap-1 mt-3">
          {result.pokemon.types.map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ backgroundColor: TYPE_COLORS[t] + 'cc' }}>
              {t.toUpperCase()}
            </span>
          ))}
        </div>

        {/* New indicator */}
        {result.isNew && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold text-black bg-green-400">
            🆕 NEW!
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Multi-pull results modal
function PullResultsModal({ results, onClose }: { results: PullResult[]; onClose: () => void }) {
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowResults(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4"
    >
      {/* Spinning animation until reveal */}
      {!showResults && (
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="text-6xl mb-4"
          >
            🎰
          </motion.div>
          <p className="text-white/60 animate-pulse">Mencari Pokemon...</p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {showResults && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white">
                🎉 {results.length}x Pull Results!
              </h2>
              <button onClick={onClose} className="text-white/40 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {results.map((r, i) => (
                <PokemonRevealCard key={`${r.pokemon.id}-${i}`} result={r} index={i} delay={0} />
              ))}
            </div>

            <button
              onClick={onClose}
              className="w-full mt-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500 active:scale-95"
            >
              Lanjutkan
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Diamond earning info
function DiamondInfo() {
  const [expanded, setExpanded] = useState(false);
  
  const sources = [
    { source: 'Battle Victory', amount: 5, icon: '⚔️', desc: 'per menang' },
    { source: 'Battle Win Streak', amount: 15, icon: '🔥', desc: 'per 3 streak' },
    { source: 'Complete Quiz (100%)', amount: 3, icon: '📚', desc: 'per quiz sempurna' },
    { source: 'Complete Module', amount: 10, icon: '📖', desc: 'per modul selesai' },
    { source: 'Daily Login', amount: 5, icon: '🎁', desc: 'harian' },
    { source: 'Daily Quest Complete', amount: 20, icon: '✅', desc: 'per quest' },
    { source: 'Catch Pokemon', amount: 2, icon: '🎯', desc: 'per pokemon berhasil' },
    { source: 'Share Collection', amount: 5, icon: '📤', desc: 'sekali' },
  ];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: '#1a1a2e' }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Gem className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-white">Cara Mendapatkan 💎</span>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              {sources.map((s, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-black/20">
                  <span className="text-lg">{s.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-white">{s.source}</p>
                    <p className="text-[10px] text-cyan-400">+{s.amount} 💎 {s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function GachaPage() {
  const router = useRouter();
  const { diamonds, scrolls, spendDiamonds, spendScrolls, addDiamonds, ownedPokemon, catchPokemon, isPokemonCaught } = useCollectionStore();

  const [selectedBanner, setSelectedBanner] = useState<GachaBanner | null>(null);
  const [pulling, setPulling] = useState(false);
  const [pullResults, setPullResults] = useState<PullResult[] | null>(null);
  const [pokemonCache, setPokemonCache] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(false);
  // Pity system: after PITY_THRESHOLD non-UR pulls, next pull is guaranteed UR
  const PITY_THRESHOLD = 50;
  const [pityCounter, setPityCounter] = useState(0);
  // Spark counter: every 5 pulls gives a guaranteed rare+
  const [sparkCounter, setSparkCounter] = useState(0);

  // Pre-fetch Pokemon for gacha
  const prefetchPokemon = useCallback(async (count: number = 20) => {
    setLoading(true);
    try {
      const ids = Array.from({ length: count }, () => Math.floor(Math.random() * 1010) + 1);
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          if (!res.ok) return null;
          const data = await res.json();
          const speciesRes = await fetch(data.species.url);
          if (!speciesRes.ok) return null;
          const species = await speciesRes.json();
          const flavorText = species.flavor_text_entries
            .filter((e: any) => e.language.name === 'en')
            .slice(-1)[0]?.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ') || '';

          const stats = data.stats;
          const baseTotal = stats.reduce((acc: number, s: any) => acc + s.base_stat, 0);
          const hpS = stats.find((s: any) => s.stat.name === 'hp')?.base_stat || 50;
          const atkS = stats.find((s: any) => s.stat.name === 'attack')?.base_stat || 50;
          const defS = stats.find((s: any) => s.stat.name === 'defense')?.base_stat || 50;
          const spdS = stats.find((s: any) => s.stat.name === 'speed')?.base_stat || 50;

          return {
            id: `poke-${data.id}`,
            pokemonId: data.id,
            name: data.name,
            types: data.types.map((t: any) => t.type.name),
            image: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
            shinyImage: data.sprites.front_shiny,
            hp: calculateHP(hpS),
            attack: calculateAttack(atkS),
            defense: calculateDefense(defS),
            speed: calculateSpeed(spdS),
            height: data.height,
            weight: data.weight,
            ability: data.abilities.find((a: any) => !a.is_hidden)?.ability.name.replace('-', ' ') || '',
            hiddenAbility: data.abilities.find((a: any) => a.is_hidden)?.ability.name.replace('-', ' '),
            rarity: getRarityFromBase(baseTotal),
            element: TYPE_TO_ELEMENT[data.types[0].type.name] || 'NORMAL',
            flavorText,
            color: species.color?.name || 'gray',
          } as PokemonCard;
        })
      );

      const valid = (results.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<PokemonCard>[]).map(r => r.value);
      setPokemonCache(valid);
    } catch (err) {
      console.error('Failed to prefetch:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    prefetchPokemon(20);
  }, [prefetchPokemon]);

  // Pull gacha
  const doPull = async (banner: GachaBanner) => {
    // Use scrolls if available, else diamonds
    const useScrolls = scrolls >= 1;
    if (!useScrolls && diamonds < banner.cost) {
      alert(`Tidak cukup 💎! Butuh ${banner.cost}, punya ${diamonds}. Kumpulkan scroll di toko!`);
      return;
    }

    if (useScrolls) {
      spendScrolls(1);
    } else {
      if (!spendDiamonds(banner.cost)) return;
    }

    setPulling(true);
    setSelectedBanner(banner);

    // Wait for animation
    await new Promise(r => setTimeout(r, 800));

    // Generate results
    const results: PullResult[] = [];

    // Determine rarity with pity + spark
    const isPity = pityCounter >= PITY_THRESHOLD;
    const isSpark = sparkCounter >= 4; // Every 5th pull (0-indexed, so 4)

    let rarity: Rarity;
    if (isPity) {
      rarity = 'ULTRA_RARE';
      setPityCounter(0);
    } else {
      const tier = pickTier(banner.tiers);
      rarity = getRarityFromTier(tier);
      // Spark: force RARE+ on every 5th pull
      if (isSpark && (rarity === 'COMMON' || rarity === 'UNCOMMON')) {
        rarity = 'RARE';
      }
    }

    // Increment counters
    const newPity = rarity !== 'ULTRA_RARE' ? pityCounter + 1 : 0;
    const newSpark = (sparkCounter + 1) % 5;
    setPityCounter(newPity);
    setSparkCounter(newSpark);

    for (let i = 0; i < banner.attempts; i++) {
      // Get a random Pokemon from cache matching rarity
      let candidates = pokemonCache;
      if (rarity !== 'COMMON') {
        candidates = pokemonCache.filter(p => p.rarity === rarity);
      }
      if (candidates.length === 0) candidates = pokemonCache;

      const pokemon = candidates[Math.floor(Math.random() * candidates.length)];
      if (!pokemon) continue;

      const isNew = !isPokemonCaught(pokemon.pokemonId);

      results.push({ pokemon, rarity, isNew, tier: rarity === 'ULTRA_RARE' ? 'diamond' : rarity === 'RARE' ? 'gold' : rarity === 'UNCOMMON' ? 'silver' : 'bronze' });

      // Auto-catch if new
      if (isNew) {
        catchPokemon(pokemon);
        addDiamonds(3); // Earn 3 diamonds for catching new pokemon
      }
    }

    setPulling(false);
    setPullResults(results);

    // Prefetch more
    if (pokemonCache.length < 10) {
      prefetchPokemon(15);
    }
  };

  // Close results
  const closeResults = () => {
    setPullResults(null);
    setSelectedBanner(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d0d1a' }}>
      <CurrencyBar diamonds={diamonds} scrolls={scrolls} pity={pityCounter} spark={sparkCounter} />

      <main className="max-w-md mx-auto px-4 pt-4 pb-8 space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-white mb-1">🎰 Gacha Machine</h1>
          <p className="text-sm text-white/40">Tarik untuk mendapat Pokemon langka!</p>
        </div>

        {/* Diamond earning info */}
        <DiamondInfo />

        {/* Loading cache indicator */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-3">
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="text-xs text-white/40">Menyiapkan Pokemon...</span>
          </div>
        )}

        {/* Banners */}
        <div className="space-y-4">
          {BANNERS.map((banner, i) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              canPull={diamonds >= banner.cost}
              pulling={pulling && selectedBanner?.id === banner.id}
              onPull={() => doPull(banner)}
            />
          ))}
        </div>

        {/* Info */}
        <div className="text-center text-xs text-white/30 py-4">
          <p>🔄 Pokemon di Gacha refresh setiap kali kamu pull</p>
          <p>✨ Shiny Pokemon chance: 10% per pull</p>
          <p>💎 Setiap catch berhasil dapat +2 💎</p>
        </div>
      </main>

      {/* Results Modal */}
      <AnimatePresence>
        {pullResults && <PullResultsModal results={pullResults} onClose={closeResults} />}
      </AnimatePresence>
    </div>
  );
}