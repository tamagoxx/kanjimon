'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore, PokemonCard } from '@/store/collectionStore';
import { useFusionStore } from '@/store/fusionStore';
import { CARDS_BY_ID } from '@/data/cards';
import { Heart, Swords, Shield, Zap, Star, X, Loader2, Crown, Package } from 'lucide-react';

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

const elementColors: Record<string, string> = {
  FIRE: '#ffb4ab',
  WATER: '#6c5ce7',
  GRASS: '#4bddb7',
  ELECTRIC: '#f0bf63',
  PSYCHIC: '#c6bfff',
  NORMAL: '#c8c4d7',
};

const TYPE_COLORS: Record<string, string> = {
  fire: '#ff6b35', water: '#4facfe', grass: '#4bddb7', electric: '#ffd93d',
  psychic: '#c77dff', normal: '#a8a8a8', bug: '#7cb342', poison: '#ba68c8',
  ground: '#c69c6d', rock: '#8d6e63', flying: '#81d4fa', fighting: '#ef5350',
  ghost: '#7c4dff', ice: '#4dd0e1', dragon: '#ff7043', dark: '#5c6bc0',
  steel: '#90a4ae', fairy: '#f48fb1',
};

const rarityColors: Record<string, string> = {
  COMMON: '#c8c4d7',
  UNCOMMON: '#4bddb7',
  RARE: '#6c5ce7',
  ULTRA_RARE: '#f0bf63',
};

const allJapaneseCards = Object.values(CARDS_BY_ID);

type TabType = 'all' | 'japanese' | 'pokemon' | 'fusion';
type FilterType = 'all' | 'verbs' | 'nouns' | 'adjectives' | 'particles';

// Top Navigation Bar
function TopAppBar() {
  const router = useRouter();
  const { coins, ownedPokemon } = useCollectionStore();

  return (
    <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: '#0a1519' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/')}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.brand }}
        >
          <span className="text-white font-bold text-sm">T</span>
        </button>
        <span className="text-base font-medium text-[#c6bfff]">Koleksiku</span>
      </div>
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${colors.brand}30`, color: colors.brand }}>
        💎 {coins.toLocaleString()}
      </button>
    </div>
  );
}

// Japanese Card Component
function JapaneseCardItem({ card, index }: { card: any; index: number }) {
  const elementColor = elementColors[card.element] || colors.darkText;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className="relative rounded-2xl overflow-hidden"
      style={{ backgroundColor: colors.cardBg, aspectRatio: '3/4' }}
    >
      <div className="absolute inset-0 p-3 flex flex-col">
        {/* Top: Element Badge + Rarity */}
        <div className="flex items-start justify-between">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs"
            style={{ backgroundColor: `${elementColor}20`, color: elementColor }}
          >
            {card.element === 'FIRE' ? '🔥' :
             card.element === 'WATER' ? '💧' :
             card.element === 'GRASS' ? '🌱' :
             card.element === 'ELECTRIC' ? '⚡' :
             card.element === 'PSYCHIC' ? '🔮' : '📝'}
          </div>
          <div
            className="px-2 py-1 rounded text-[10px] font-bold"
            style={{ backgroundColor: `${rarityColors[card.rarity]}20`, color: rarityColors[card.rarity] }}
          >
            {card.rarity.replace('_', ' ')}
          </div>
        </div>

        {/* Center: Kanji Character */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-4xl font-bold text-white">{card.japanese}</div>
        </div>

        {/* Bottom: Reading + Meaning + Stats */}
        <div className="space-y-1">
          <div className="text-xs text-[#d8e4ea] font-medium text-center">{card.reading}</div>
          <div className="text-xs text-[#c8c4d7] text-center truncate">{card.meaning}</div>
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="text-xs">
              <span className="text-[#ffb4ab] font-bold">{card.attackPower}</span>
              <span className="text-[#c8c4d7]/50 ml-0.5">ATK</span>
            </div>
            <div className="w-px h-3 bg-[#2b363b]" />
            <div className="text-xs">
              <span className="text-[#4bddb7] font-bold">{card.defenseRating}</span>
              <span className="text-[#c8c4d7]/50 ml-0.5">DEF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rarity glow */}
      {card.rarity === 'ULTRA_RARE' && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-[#f0bf63]/50 animate-pulse" />
      )}
      {card.rarity === 'RARE' && (
        <div className="absolute inset-0 rounded-2xl ring-1 ring-[#6c5ce7]/50" />
      )}
    </motion.div>
  );
}

// Fusion Tab Content
function FusionContent() {
  const router = useRouter();
  const { ownedPokemon, diamonds, fusedPokemon } = useCollectionStore();
  const { fusePokemon, canFuse } = useFusionStore();
  const [selectedIds, setSelectedIds] = useState<[number | null, number | null]>([null, null]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastFusedPokemon, setLastFusedPokemon] = useState<any>(null);
  const [lastRarity, setLastRarity] = useState<string>('COMMON');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pokeA = ownedPokemon.find(p => p.pokemonId === selectedIds[0]);
  const pokeB = ownedPokemon.find(p => p.pokemonId === selectedIds[1]);

  const fusionCheck = (selectedIds[0] !== null && selectedIds[1] !== null)
    ? canFuse(selectedIds[0], selectedIds[1])
    : null;

  const togglePokemon = (pokemonId: number) => {
    setErrorMsg(null);
    setSelectedIds(prev => {
      if (prev[0] === pokemonId) return [null, prev[1]];
      if (prev[1] === pokemonId) return [prev[0], null];
      if (prev[0] === null) return [pokemonId, prev[1]];
      if (prev[1] === null) return [prev[0], pokemonId];
      return [pokemonId, null];
    });
  };

  const handleFuse = () => {
    if (selectedIds[0] === null || selectedIds[1] === null) return;
    const result = fusePokemon(selectedIds[0], selectedIds[1]);
    if (result.success && result.fusedPokemonId) {
      const fused = useCollectionStore.getState().getFusedPokemonById(result.fusedPokemonId);
      if (fused) {
        setLastFusedPokemon(fused);
        setLastRarity(fused.rarity);
        setShowSuccess(true);
        setSelectedIds([null, null]);
      }
    } else {
      setErrorMsg(result.error || 'Fusion gagal');
    }
  };

  const sortedPokemon = [...ownedPokemon].sort((a, b) => {
    const order = ['ULTRA_RARE', 'RARE', 'UNCOMMON', 'COMMON'];
    return order.indexOf(a.rarity) - order.indexOf(b.rarity);
  });

  const RARITY_COLORS: Record<string, string> = {
    COMMON: '#a8a8a8', UNCOMMON: '#4facfe', RARE: '#c77dff', ULTRA_RARE: '#ffd700',
  };

  const resultRarity = fusionCheck?.resultRarity || 'COMMON';

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="flex gap-3">
        <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: colors.cardBg }}>
          <div className="text-lg font-bold text-white">{ownedPokemon.length}</div>
          <div className="text-xs text-[#c8c4d7]">Pokemon</div>
        </div>
        <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: colors.cardBg }}>
          <div className="text-lg font-bold text-purple-400">{fusedPokemon.length}</div>
          <div className="text-xs text-[#c8c4d7]">Terfusion</div>
        </div>
        <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: colors.cardBg }}>
          <div className="text-lg font-bold text-yellow-400">💎 {diamonds}</div>
          <div className="text-xs text-[#c8c4d7]">Diamond</div>
        </div>
      </div>

      {/* Selection slots */}
      <div className="flex items-center gap-3 justify-center">
        {[0, 1].map(slot => {
          const selected = slot === 0 ? pokeA : pokeB;
          return (
            <div key={slot} className="flex flex-col items-center gap-1">
              <div
                className="w-16 h-20 rounded-xl flex items-center justify-center text-xs"
                style={{
                  backgroundColor: selected ? '#1a1a2e' : colors.cardBg,
                  border: `2px ${selected ? 'solid' : 'dashed'} ${selected ? RARITY_COLORS[selected.rarity] : '#2b363b'}`,
                }}
              >
                {selected ? (
                  <div className="flex flex-col items-center">
                    <img src={selected.image} alt={selected.name} className="w-10 h-10 object-contain" />
                    <span className="text-[8px] text-gray-400 truncate max-w-[60px]">{selected.name}</span>
                  </div>
                ) : (
                  <span className="text-gray-600">{slot + 1}#</span>
                )}
              </div>
              {selected && (
                <button onClick={() => togglePokemon(selected.pokemonId)} className="text-xs text-red-400">✕</button>
              )}
            </div>
          );
        })}
        {pokeA && pokeB && <span className="text-2xl font-bold text-gray-500">+</span>}
      </div>

      {/* Error */}
      {errorMsg && <p className="text-center text-sm text-red-400">{errorMsg}</p>}
      {fusionCheck && !fusionCheck.possible && fusionCheck.reason && (
        <p className="text-center text-sm text-red-400">{fusionCheck.reason}</p>
      )}

      {/* Fuse button */}
      {pokeA && pokeB && fusionCheck?.possible && (
        <button
          onClick={handleFuse}
          className="w-full py-3 rounded-xl font-bold text-white text-lg"
          style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)', boxShadow: '0 4px 20px #6c5ce755' }}
        >
          ⚡ FUSION! ({fusionCheck.cost}💎)
        </button>
      )}

      {/* Pokemon grid */}
      {ownedPokemon.length === 0 ? (
        <div className="text-center py-8 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
          <span className="text-4xl">🎰</span>
          <p className="text-sm text-[#c8c4d7] mt-2 mb-4">Belum punya Pokemon untuk fusion</p>
          <button onClick={() => router.push('/gacha')} className="px-6 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-500">
            Buka Gacha!
          </button>
        </div>
      ) : (
        <div>
          <p className="text-xs text-[#c8c4d7] mb-2">Pilih 2 Pokemon:</p>
          <div className="grid grid-cols-4 gap-2">
            {sortedPokemon.map(poke => {
              const selected = selectedIds[0] === poke.pokemonId || selectedIds[1] === poke.pokemonId;
              return (
                <motion.button
                  key={poke.pokemonId}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => togglePokemon(poke.pokemonId)}
                  className="relative aspect-square rounded-xl overflow-hidden flex flex-col items-center justify-center"
                  style={{
                    backgroundColor: '#1a1a2e',
                    border: `2px solid ${selected ? RARITY_COLORS[poke.rarity] : 'transparent'}`,
                    boxShadow: selected ? `0 0 10px ${RARITY_COLORS[poke.rarity]}66` : 'none',
                  }}
                >
                  <img src={poke.image} alt={poke.name} className="w-10 h-10 object-contain" />
                  <span className="text-[8px] text-white truncate px-1">{poke.name}</span>
                  {selected && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(108,92,231,0.4)' }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: RARITY_COLORS[poke.rarity] }}>
                        <span className="text-black font-bold text-xs">✓</span>
                      </div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Fused Pokemon */}
      {fusedPokemon.length > 0 && (
        <div>
          <p className="text-xs text-[#c8c4d7] mb-2">⚡ Pokemon Terfusion:</p>
          <div className="grid grid-cols-3 gap-2">
            {fusedPokemon.map(fp => (
              <div key={fp.id} className="rounded-xl p-2 flex flex-col items-center gap-1" style={{ backgroundColor: '#1a1a2e', border: `1px solid ${RARITY_COLORS[fp.rarity]}55` }}>
                <img src={fp.image} alt={fp.name} className="w-12 h-12 object-contain" />
                <p className="text-[9px] font-bold text-white text-center truncate w-full">{fp.name}</p>
                <div className="flex gap-1">
                  {fp.types.map((t: string) => (
                    <span key={t} className="text-[7px] px-1 py-0.5 rounded-full" style={{ backgroundColor: `${TYPE_COLORS[t]}88`, color: 'white' }}>{t.toUpperCase()}</span>
                  ))}
                </div>
                <div className="text-[8px] text-gray-500">HP {fp.baseHp} / ATK {fp.baseAttack}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && lastFusedPokemon && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
          onClick={() => setShowSuccess(false)}
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="w-full max-w-sm rounded-2xl p-6 flex flex-col items-center gap-4"
            style={{ backgroundColor: '#1a1a2e', border: `2px solid ${RARITY_COLORS[lastRarity]}` }}
            onClick={e => e.stopPropagation()}
          >
            <div className="text-4xl">⚡</div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">Fusion Berhasil!</h2>
              <p className="text-sm text-gray-400">{lastFusedPokemon.name}</p>
            </div>
            <img src={lastFusedPokemon.image} alt={lastFusedPokemon.name} className="w-20 h-20 object-contain" />
            <button onClick={() => setShowSuccess(false)} className="w-full py-3 rounded-xl font-bold text-white" style={{ backgroundColor: RARITY_COLORS[lastRarity] }}>
              Lanjutkan
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
function PokemonCardItem({ card, index }: { card: PokemonCard; index: number }) {
  const typeColor = TYPE_COLORS[card.types[0]] || '#a8a8a8';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className="relative rounded-2xl overflow-hidden"
      style={{ backgroundColor: colors.cardBg, aspectRatio: '3/4' }}
    >
      {/* Rarity top bar */}
      <div className={`h-1 ${
        card.rarity === 'ULTRA_RARE' ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8c00]' :
        card.rarity === 'RARE' ? 'bg-[#c77dff]' :
        card.rarity === 'UNCOMMON' ? 'bg-[#4facfe]' : 'bg-white/20'
      }`} />

      <div className="absolute inset-0 p-3 flex flex-col">
        {/* Top: Type badges + Rarity */}
        <div className="flex items-start justify-between mb-1">
          <div className="flex flex-col gap-1">
            {card.types.map(t => (
              <span key={t} className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white"
                style={{ backgroundColor: TYPE_COLORS[t] + 'cc' }}>{t}</span>
            ))}
          </div>
          <div
            className="px-2 py-1 rounded text-[10px] font-bold"
            style={{ backgroundColor: `${rarityColors[card.rarity]}20`, color: rarityColors[card.rarity] }}
          >
            {card.rarity.replace('_', ' ')}
          </div>
        </div>

        {/* Pokemon Image */}
        <div className="flex-1 flex items-center justify-center" style={{ background: `linear-gradient(180deg, ${typeColor}15 0%, transparent 100%)` }}>
          <img src={card.image} alt={card.name} className="w-20 h-20 object-contain" loading="lazy" />
        </div>

        {/* Bottom: Name + Stats */}
        <div className="space-y-1">
          <p className="text-[10px] text-white/40 font-medium text-center">#{card.pokemonId.toString().padStart(3, '0')}</p>
          <div className="text-xs font-bold text-white text-center capitalize truncate">{card.name}</div>
          <div className="flex items-center justify-center gap-2 pt-1">
            <div className="flex items-center gap-1 text-[10px]">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-white/70">{card.hp}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <Swords className="w-3 h-3 text-orange-400" />
              <span className="text-white/70">{card.attack}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <Shield className="w-3 h-3 text-blue-400" />
              <span className="text-white/70">{card.defense}</span>
            </div>
          </div>
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
    { icon: '🃏', label: 'Kartu', route: '/collection', active: true },
    { icon: '👤', label: 'Profile', route: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-50" style={{ backgroundColor: '#162125' }}>
      {navItems.map((item, i) => (
        <button
          key={i}
          onClick={() => router.push(item.route)}
          className={`flex flex-col items-center gap-1 ${item.active ? 'opacity-100' : 'opacity-60'} transition-opacity`}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs" style={{ color: item.active ? colors.teal : colors.darkText }}>
            {item.label}
          </span>
          {item.active && <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: colors.teal }} />}
        </button>
      ))}
    </div>
  );
}

export default function CollectionPage() {
  const router = useRouter();
  const { ownedPokemon, coins } = useCollectionStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [categoryFilter, setCategoryFilter] = useState<FilterType>('all');

  // For Japanese cards, we show all (in a real app, would filter by owned)
  const filteredJapanese = allJapaneseCards.filter(card => {
    if (categoryFilter !== 'all') {
      const typeMap: Record<string, string> = { verbs: 'VERB', nouns: 'NOUN', adjectives: 'ADJECTIVE', particles: 'PARTICLE' };
      if (card.type !== typeMap[categoryFilter]) return false;
    }
    return true;
  });

  const totalCards = allJapaneseCards.length + ownedPokemon.length;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#d8e4ea]">Koleksiku</h1>
            <p className="text-sm text-[#c8c4d7]">{totalCards} kartu terkumpul</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🃏</span>
            <span className="text-sm font-medium text-[#c8c4d7]">📦 {allJapaneseCards.length} + 🎮 {ownedPokemon.length}</span>
          </div>
        </div>

        {/* Tabs: All / Jepang / Pokemon */}
        <div className="px-4 mb-3">
          <div className="flex gap-2 p-1 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
            {[
              { id: 'all' as TabType, label: 'Semua', icon: '📦' },
              { id: 'japanese' as TabType, label: 'Kartu Jepang', icon: '📜' },
              { id: 'pokemon' as TabType, label: 'Pokemon', icon: '🎮' },
              { id: 'fusion' as TabType, label: 'Fusion', icon: '⚡' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-white/40'
                }`}
                style={activeTab === tab.id ? { backgroundColor: colors.brand } : {}}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category filters (only for Japanese) */}
        {activeTab !== 'pokemon' && (
          <div className="px-4 mb-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all' as FilterType, label: 'Semua' },
                { id: 'verbs' as FilterType, label: 'Kata Kerja' },
                { id: 'nouns' as FilterType, label: 'Kata Benda' },
                { id: 'adjectives' as FilterType, label: 'Kata Sifat' },
                { id: 'particles' as FilterType, label: 'Partikel' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                  style={
                    categoryFilter === cat.id
                      ? { backgroundColor: colors.brand, color: 'white' }
                      : { backgroundColor: '#162125', color: colors.darkText }
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="px-4 mb-3 flex gap-3">
          <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: colors.cardBg }}>
            <div className="text-lg font-bold text-[#4bddb7]">{allJapaneseCards.length}</div>
            <div className="text-xs text-[#c8c4d7]">Kartu Jepang</div>
          </div>
          <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: colors.cardBg }}>
            <div className="text-lg font-bold text-[#ff6b35]">{ownedPokemon.length}</div>
            <div className="text-xs text-[#c8c4d7]">Pokemon</div>
          </div>
          <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: colors.cardBg }}>
            <div className="text-lg font-bold text-[#f0bf63]">{ownedPokemon.filter(p => p.rarity === 'ULTRA_RARE').length}</div>
            <div className="text-xs text-[#c8c4d7]">Ultra Rare</div>
          </div>
        </div>

        {/* Card Grid */}
        <div className="px-4">
          {/* Japanese Cards */}
          {(activeTab === 'all' || activeTab === 'japanese') && (
            <div>
              {activeTab === 'all' && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-white/30 font-medium">KARTU JEPANG</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {filteredJapanese.slice(0, activeTab === 'all' ? 6 : 12).map((card, i) => (
                  <JapaneseCardItem key={card.id} card={card} index={i} />
                ))}
              </div>
              {filteredJapanese.length > (activeTab === 'all' ? 6 : 12) && (
                <p className="text-center text-xs text-[#c8c4d7] py-2 mb-4">
                  +{filteredJapanese.length - (activeTab === 'all' ? 6 : 12)} kartu Jepang lainnya
                </p>
              )}
            </div>
          )}

          {/* Pokemon Cards */}
          {(activeTab === 'all' || activeTab === 'pokemon') && (
            <div>
              {activeTab === 'all' && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-white/30 font-medium">POKEMON</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              )}
              {ownedPokemon.length === 0 ? (
                <div className="text-center py-8 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
                  <span className="text-4xl">🎮</span>
                  <p className="text-sm text-[#c8c4d7] mt-2 mb-3">Belum ada Pokemon</p>
                  <button onClick={() => router.push('/shop')} className="px-4 py-2 rounded-xl bg-[#6c5ce7] text-white text-xs font-bold">
                    Tangkap di Toko
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {ownedPokemon.map((card, i) => (
                    <PokemonCardItem key={card.id} card={card} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fusion Tab */}
          {activeTab === 'fusion' && <FusionContent />}

          {/* Empty states */}
          {activeTab === 'pokemon' && ownedPokemon.length === 0 && (
            <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
              <span className="text-5xl">🎮</span>
              <p className="text-[#c8c4d7] mt-3 mb-4">Belum ada Pokemon yang ditangkap</p>
              <button onClick={() => router.push('/shop')} className="px-6 py-2 rounded-xl bg-[#4bddb7] text-black text-sm font-bold">
                🎯 Tangkap Sekarang
              </button>
            </div>
          )}

          {activeTab === 'japanese' && filteredJapanese.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl">🔍</span>
              <p className="text-[#c8c4d7] mt-2">Tidak ada kartu yang cocok</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}