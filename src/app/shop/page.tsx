'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore, PokemonCard } from '@/store/collectionStore';
import { X, Heart, Swords, Shield, Zap, Loader2, Gift, Star, Crown } from 'lucide-react';

const colors = {
  background: '#0a1519',
  cardBg: '#1a1a2e',
  inputBg: '#212c30',
  darkText: '#c8c4d7',
  lightText: '#d8e4ea',
  brand: '#6c5ce7',
  teal: '#4bddb7',
  gold: '#f0bf63',
  coral: '#ffb4ab',
  lightPurple: '#c6bfff',
  darkGray: '#2b363b',
};

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

function calculateHP(base: number) { return Math.floor(base * 0.9) + 50; }
function calculateAttack(base: number) { return Math.floor(base * 0.5) + 10; }
function calculateDefense(base: number) { return Math.floor(base * 0.1) + 1; }
function calculateSpeed(base: number) { return Math.floor(base * 0.5) + 5; }
function getRarity(baseTotal: number): PokemonCard['rarity'] {
  if (baseTotal >= 600) return 'ULTRA_RARE';
  if (baseTotal >= 450) return 'RARE';
  if (baseTotal >= 300) return 'UNCOMMON';
  return 'COMMON';
}

// Top App Bar with real currency
function TopAppBar() {
  const { coins, scrolls } = useCollectionStore();

  return (
    <div className="sticky top-0 z-40 px-4 h-[89px] flex items-center justify-between" style={{ backgroundColor: '#0a1519' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.brand }}>
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <span className="text-base font-medium text-[#c6bfff]">Toko</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: colors.cardBg }}>
          <span className="text-sm">💎</span>
          <span className="text-sm font-bold text-[#c6bfff]">{coins.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: colors.cardBg }}>
          <span className="text-sm">📜</span>
          <span className="text-sm font-bold text-[#c6bfff]">{scrolls}</span>
        </div>
      </div>
    </div>
  );
}

// Pokemon card for display in shop
function PokemonShopCard({ card, onCatch, disabled, catching }: {
  card: PokemonCard;
  onCatch: () => void;
  disabled: boolean;
  catching: boolean;
}) {
  const typeColor = TYPE_COLORS[card.types[0]] || '#a8a8a8';

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-2xl overflow-hidden relative ${disabled ? 'opacity-50' : ''}`}
      style={{ backgroundColor: colors.cardBg }}
    >
      {/* Rarity bar */}
      <div className={`h-1 ${
        card.rarity === 'ULTRA_RARE' ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8c00]' :
        card.rarity === 'RARE' ? 'bg-[#c77dff]' :
        card.rarity === 'UNCOMMON' ? 'bg-[#4facfe]' : 'bg-white/20'
      }`} />

      {/* Card image */}
      <div className="relative pt-4 pb-2 px-3 flex items-center justify-center"
        style={{ background: `linear-gradient(180deg, ${typeColor}15 0%, transparent 100%)` }}>
        <img src={card.image} alt={card.name} className="w-24 h-24 object-contain" loading="lazy" />

        {/* Type badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {card.types.map(t => (
            <span key={t} className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white"
              style={{ backgroundColor: TYPE_COLORS[t] + 'cc' }}>{t}</span>
          ))}
        </div>

        {/* Catch button */}
        <button
          onClick={onCatch}
          disabled={disabled || catching}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold text-white bg-[#4bddb7] hover:bg-[#5ce8c8] active:scale-95 disabled:opacity-50 flex items-center gap-1"
        >
          {catching ? <Loader2 className="w-3 h-3 animate-spin" /> : '🎯'} Tangkap
        </button>
      </div>

      {/* Card info */}
      <div className="px-3 pb-3">
        <p className="text-[10px] text-white/40 font-medium">#{card.pokemonId.toString().padStart(3, '0')}</p>
        <h3 className="text-sm font-bold text-white capitalize mb-2">{card.name}</h3>
        <div className="flex items-center gap-2 text-[10px]">
          <div className="flex items-center gap-1"><Heart className="w-3 h-3 text-red-400" /><span className="text-white/70">{card.hp}</span></div>
          <div className="flex items-center gap-1"><Swords className="w-3 h-3 text-orange-400" /><span className="text-white/70">{card.attack}</span></div>
          <div className="flex items-center gap-1"><Shield className="w-3 h-3 text-blue-400" /><span className="text-white/70">{card.defense}</span></div>
        </div>
      </div>
    </motion.div>
  );
}

// Catch animation overlay
function CatchAnimation({ pokemonName, success, onClose }: {
  pokemonName: string;
  success: boolean;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="text-center"
      >
        {success ? (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1.5 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-8xl mb-4"
            >
              🎉
            </motion.div>
            <h2 className="text-2xl font-black text-white mb-2">Berhasil Ditangkap!</h2>
            <p className="text-white/60 mb-2">{pokemonName} sekarang milikmu!</p>
            <div className="flex items-center justify-center gap-2 text-[#4bddb7]">
              <Star className="w-5 h-5" />
              <span className="font-bold">+1 Pokemon</span>
            </div>
          </>
        ) : (
          <>
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ repeat: 3, duration: 0.3 }}
              className="text-8xl mb-4"
            >
              💨
            </motion.div>
            <h2 className="text-2xl font-black text-white mb-2">Kabur!</h2>
            <p className="text-white/60 mb-4">{pokemonName} lari pergi...</p>
            <p className="text-xs text-white/40">Coba lagi nanti!</p>
          </>
        )}
        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 rounded-xl bg-[#6c5ce7] text-white font-bold active:scale-95"
        >
          Tutup
        </button>
      </motion.div>
    </motion.div>
  );
}

// Japanese Card Pack (existing)
function CardPack({ name, price, currency, emoji, description, color, index, onBuy }: {
  name: string; price: number; currency: string; emoji: string;
  description: string; color: string; index: number; onBuy: () => void;
}) {
  const { coins, spendCoins } = useCollectionStore();
  const canAfford = currency === '💎' ? coins >= price : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-2xl overflow-hidden ${!canAfford ? 'opacity-50' : ''}`}
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="h-32 flex items-center justify-center relative" style={{ background: `linear-gradient(135deg, ${color}30, ${colors.cardBg})` }}>
        <span className="text-5xl">{emoji}</span>
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${color}30`, color }}>
          PAKET
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[#d8e4ea] mb-1">{name}</h3>
        <p className="text-xs text-[#c8c4d7] mb-3">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-lg">{currency}</span>
            <span className="font-bold text-[#d8e4ea]">{price.toLocaleString()}</span>
          </div>
          <button
            onClick={onBuy}
            disabled={!canAfford}
            className="px-4 py-2 rounded-xl font-bold text-white text-sm bg-[#6c5ce7] active:scale-95 disabled:opacity-50"
          >
            Beli
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Bottom Navigation
function BottomNav() {
  const router = useRouter();
  const navItems = [
    { icon: '🏠', label: 'Home', route: '/' },
    { icon: '📚', label: 'Belajar', route: '/learn' },
    { icon: '⚔️', label: 'Battle', route: '/battle' },
    { icon: '🃏', label: 'Kartu', route: '/collection' },
    { icon: '👤', label: 'Profile', route: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-50" style={{ backgroundColor: '#162125' }}>
      {navItems.map((item, i) => (
        <button key={i} onClick={() => router.push(item.route)} className="flex flex-col items-center gap-1 opacity-60 transition-opacity">
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function ShopPage() {
  const router = useRouter();
  const { coins, scrolls, catchPokemon, isPokemonCaught, ownedPokemon } = useCollectionStore();

  const [pokemonPool, setPokemonPool] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [catchingId, setCatchingId] = useState<number | null>(null);
  const [catchResult, setCatchResult] = useState<{ name: string; success: boolean } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch random Pokemon from PokeAPI
  const fetchRandomPokemon = useCallback(async (count: number = 6) => {
    setLoading(true);
    try {
      // Get random Pokemon IDs (1 to 1010)
      const randomIds = Array.from({ length: count }, () => Math.floor(Math.random() * 1010) + 1);

      const pokemonData = await Promise.all(
        randomIds.map(async (id) => {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          if (!res.ok) throw new Error('Failed to fetch');
          const data = await res.json();

          // Get species for flavor text
          const speciesRes = await fetch(data.species.url);
          const species = await speciesRes.json();
          const flavorText = species.flavor_text_entries
            .filter((e: { language: { name: string } }) => e.language.name === 'en')
            .slice(-1)[0]?.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ') || '';

          const stats = data.stats;
          const baseTotal = stats.reduce((acc: number, s: { base_stat: number }) => acc + s.base_stat, 0);
          const hpStat = stats.find((s: { stat: { name: string } }) => s.stat.name === 'hp')?.base_stat || 50;
          const atkStat = stats.find((s: { stat: { name: string } }) => s.stat.name === 'attack')?.base_stat || 50;
          const defStat = stats.find((s: { stat: { name: string } }) => s.stat.name === 'defense')?.base_stat || 50;
          const speedStat = stats.find((s: { stat: { name: string } }) => s.stat.name === 'speed')?.base_stat || 50;

          return {
            id: `poke-${data.id}`,
            pokemonId: data.id,
            name: data.name,
            types: data.types.map((t: { type: { name: string } }) => t.type.name),
            image: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
            shinyImage: data.sprites.front_shiny,
            hp: calculateHP(hpStat),
            attack: calculateAttack(atkStat),
            defense: calculateDefense(defStat),
            speed: calculateSpeed(speedStat),
            height: data.height,
            weight: data.weight,
            ability: data.abilities.find((a: { is_hidden: boolean }) => !a.is_hidden)?.ability.name.replace('-', ' ') || '',
            hiddenAbility: data.abilities.find((a: { is_hidden: boolean }) => a.is_hidden)?.ability.name.replace('-', ' '),
            rarity: getRarity(baseTotal),
            element: TYPE_TO_ELEMENT[data.types[0].type.name] || 'NORMAL',
            flavorText,
            color: species.color?.name || 'gray',
          } as PokemonCard;
        })
      );

      setPokemonPool(pokemonData);
    } catch (err) {
      console.error('Failed to fetch Pokemon:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRandomPokemon(6);
  }, [fetchRandomPokemon]);

  // Refresh Pokemon in shop
  const refreshShop = async () => {
    setRefreshing(true);
    await fetchRandomPokemon(6);
    setRefreshing(false);
  };

  // Catch a Pokemon
  const handleCatch = (pokemon: PokemonCard) => {
    if (isPokemonCaught(pokemon.pokemonId)) return;
    if (scrolls < 1) {
      alert('Tidak cukup Scroll! Perlu 1 Scroll untuk menangkap.');
      return;
    }

    setCatchingId(pokemon.pokemonId);

    // 70% success rate
    const success = Math.random() < 0.7;

    setTimeout(() => {
      if (success) {
        catchPokemon(pokemon);
      }
      setCatchingId(null);
      setCatchResult({ name: pokemon.name, success });
    }, 1500);
  };

  // Buy Japanese card pack
  const handleBuyPack = (price: number) => {
    if (coins >= price) {
      useCollectionStore.getState().spendCoins(price);
      alert('Pack purchased! (Demo - cards would be added to collection)');
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">

        {/* 🎯 Catch Pokemon Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <h2 className="text-lg font-bold text-[#d8e4ea]">Tangkap Pokemon</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">📜 {scrolls} scroll</span>
              <button
                onClick={refreshShop}
                disabled={refreshing}
                className="px-3 py-1 rounded-full text-xs font-medium bg-[#4bddb7] text-black flex items-center gap-1"
              >
                {refreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : '🔄'} Ganti
              </button>
            </div>
          </div>

          <p className="text-xs text-white/40 mb-3">Gunakan 1 Scroll untuk menangkap. Pokemon yang sudah ditangkap tidak bisa ditangkap lagi.</p>

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 text-[#6c5ce7] animate-spin" />
              <span className="text-sm text-white/40">Memuat Pokemon...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {pokemonPool.map((pokemon) => (
                <PokemonShopCard
                  key={pokemon.id}
                  card={pokemon}
                  catching={catchingId === pokemon.pokemonId}
                  disabled={isPokemonCaught(pokemon.pokemonId)}
                  onCatch={() => handleCatch(pokemon)}
                />
              ))}
            </div>
          )}

          {ownedPokemon.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-xs text-[#4bddb7]">
              <Star className="w-4 h-4" />
              <span>{ownedPokemon.length} Pokemon sudah ditangkap</span>
              <button onClick={() => router.push('/collection')} className="ml-auto text-[#6c5ce7] font-bold">Lihat Koleksi →</button>
            </div>
          )}
        </section>

        {/* Japanese Card Packs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#d8e4ea]">📦 Paket Kartu Jepang</h2>
          </div>
          <div className="space-y-4">
            <CardPack
              name="Legendary Pack"
              price={500}
              currency="💎"
              emoji="👑"
              description="3 kartu termasuk 1 Ultra Rare"
              color="#f0bf63"
              index={0}
              onBuy={() => handleBuyPack(500)}
            />
            <CardPack
              name="Elemental Pack"
              price={200}
              currency="💎"
              emoji="⚡"
              description="5 kartu acak dengan element"
              color="#6c5ce7"
              index={1}
              onBuy={() => handleBuyPack(200)}
            />
            <CardPack
              name="Spirit Pack"
              price={100}
              currency="💎"
              emoji="✨"
              description="10 kartu umum-uncommon"
              color="#4bddb7"
              index={2}
              onBuy={() => handleBuyPack(100)}
            />
          </div>
        </section>

        {/* Daily Deals */}
        <section>
          <h2 className="text-lg font-bold text-[#d8e4ea] mb-4">🔥 Deals Harian</h2>
          <div className="p-4 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-[#f0bf63]/20">
                🎁
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <span className="text-sm font-bold text-[#d8e4ea]">Starter Bundle</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white bg-[#ff4b4b]">-50%</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-[#c8c4d7] line-through">💎 1000</span>
                  <span className="text-lg font-bold text-[#f0bf63]">💎 500</span>
                </div>
                <button
                  onClick={() => handleBuyPack(500)}
                  className="w-full py-2 rounded-xl font-bold text-white text-sm bg-[#6c5ce7]"
                >
                  Beli Sekarang
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />

      {/* Catch animation */}
      <AnimatePresence>
        {catchResult && (
          <CatchAnimation
            pokemonName={catchResult.name}
            success={catchResult.success}
            onClose={() => setCatchResult(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}