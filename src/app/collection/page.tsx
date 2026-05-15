'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore, PokemonCard } from '@/store/collectionStore';
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

type TabType = 'all' | 'japanese' | 'pokemon';
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

// Pokemon Card Component
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
                  <button
                    onClick={() => useRouter().push('/shop')}
                    className="px-4 py-2 rounded-xl bg-[#6c5ce7] text-white text-xs font-bold"
                  >
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

          {/* Empty states */}
          {activeTab === 'pokemon' && ownedPokemon.length === 0 && (
            <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
              <span className="text-5xl">🎮</span>
              <p className="text-[#c8c4d7] mt-3 mb-4">Belum ada Pokemon yang ditangkap</p>
              <button
                onClick={() => useRouter().push('/shop')}
                className="px-6 py-2 rounded-xl bg-[#4bddb7] text-black text-sm font-bold"
              >
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