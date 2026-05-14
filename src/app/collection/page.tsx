'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { CARDS_BY_ID, getCardsByElement, getCardsByRarity } from '@/data/cards';

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

// Element colors from Figma
const elementColors: Record<string, string> = {
  FIRE: '#ffb4ab',
  WATER: '#6c5ce7',
  GRASS: '#4bddb7',
  ELECTRIC: '#f0bf63',
  PSYCHIC: '#c6bfff',
  NORMAL: '#c8c4d7',
};

const elementLabels: Record<string, string> = {
  FIRE: 'Api',
  WATER: 'Air',
  GRASS: 'Tanah',
  ELECTRIC: 'Listrik',
  PSYCHIC: 'Psi',
  NORMAL: 'Umum',
};

type FilterType = 'all' | 'verbs' | 'nouns' | 'adjectives' | 'particles';
type ElementFilter = 'all' | 'FIRE' | 'WATER' | 'GRASS' | 'ELECTRIC' | 'PSYCHIC' | 'NORMAL';

const categoryFilters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'verbs', label: 'Kata Kerja' },
  { id: 'nouns', label: 'Kata Benda' },
  { id: 'adjectives', label: 'Kata Sifat' },
  { id: 'particles', label: 'Partikel' },
];

const elementFilters: { id: ElementFilter; label: string; color: string }[] = [
  { id: 'all', label: 'Semua', color: colors.darkText },
  { id: 'FIRE', label: 'Api', color: elementColors.FIRE },
  { id: 'WATER', label: 'Air', color: elementColors.WATER },
  { id: 'GRASS', label: 'Tanah', color: elementColors.GRASS },
  { id: 'ELECTRIC', label: 'Listrik', color: elementColors.ELECTRIC },
  { id: 'PSYCHIC', label: 'Psi', color: elementColors.PSYCHIC },
];

// Rarity colors
const rarityColors: Record<string, string> = {
  COMMON: '#c8c4d7',
  UNCOMMON: '#4bddb7',
  RARE: '#6c5ce7',
  ULTRA_RARE: '#f0bf63',
};

// Get all cards as array
const allCards = Object.values(CARDS_BY_ID);

// Top Navigation Bar
function TopAppBar() {
  const router = useRouter();
  
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
      <button className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${colors.brand}30`, color: colors.brand }}>
        💎 1,250
      </button>
    </div>
  );
}

// Search Bar
function SearchBar() {
  return (
    <div className="px-4 mb-3">
      <div
        className="flex items-center gap-3 px-4 rounded-xl h-14"
        style={{ backgroundColor: colors.cardBg }}
      >
        <svg width="18" height="24" viewBox="0 0 18 24" fill="none" stroke="#c8c4d7" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Cari kartu..."
          className="flex-1 bg-transparent outline-none text-[#d8e4ea] placeholder-[#c8c4d7]/50"
        />
      </div>
    </div>
  );
}

// Category Filter Bar
function CategoryFilters({ active, onChange }: { active: FilterType; onChange: (v: FilterType) => void }) {
  return (
    <div className="px-4 mb-2">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categoryFilters.map(cat => (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
            style={
              active === cat.id
                ? { backgroundColor: colors.brand, color: 'white' }
                : { backgroundColor: '#162125', color: colors.darkText }
            }
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Element Filter Bar
function ElementFilters({ active, onChange }: { active: ElementFilter; onChange: (v: ElementFilter) => void }) {
  return (
    <div className="px-4 mb-4">
      <div className="flex gap-3 items-center">
        {/* All filter */}
        <button
          onClick={() => onChange('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            active === 'all' ? 'ring-2 ring-white/30' : ''
          }`}
          style={{
            backgroundColor: '#162125',
            color: active === 'all' ? 'white' : colors.darkText,
          }}
        >
          Semua
        </button>
        
        {/* Element filters */}
        {elementFilters.filter(e => e.id !== 'all').map(el => (
          <button
            key={el.id}
            onClick={() => onChange(el.id as ElementFilter)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              active === el.id ? 'ring-2 ring-white/30' : ''
            }`}
            style={{
              backgroundColor: '#162125',
              color: active === el.id ? 'white' : colors.darkText,
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: el.color }} />
            {el.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Card Component (based on Figma design)
function CardItem({ card, index }: { card: any; index: number }) {
  const elementColor = elementColors[card.element] || colors.darkText;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        backgroundColor: colors.cardBg,
        aspectRatio: '3/4',
      }}
    >
      {/* Card Content */}
      <div className="absolute inset-0 p-3 flex flex-col">
        {/* Element Badge + Rarity */}
        <div className="flex items-start justify-between">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: `${elementColor}20`, color: elementColor }}
          >
            {card.element === 'FIRE' ? '🔥' : 
             card.element === 'WATER' ? '💧' :
             card.element === 'GRASS' ? '🌱' :
             card.element === 'ELECTRIC' ? '⚡' :
             card.element === 'PSYCHIC' ? '🔮' : '📝'}
          </div>
          <div
            className="px-2 py-1 rounded text-xs font-bold"
            style={{ 
              backgroundColor: `${rarityColors[card.rarity]}20`,
              color: rarityColors[card.rarity]
            }}
          >
            {card.rarity.replace('_', ' ')}
          </div>
        </div>

        {/* Center Character */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-4xl font-bold text-white">{card.japanese}</div>
        </div>

        {/* Card Info */}
        <div className="space-y-1">
          <div className="text-xs text-[#d8e4ea] font-medium text-center">{card.reading}</div>
          <div className="text-xs text-[#c8c4d7] text-center truncate">{card.indonesian}</div>
          
          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="text-xs">
              <span className="text-[#ffb4ab] font-bold">{card.attack}</span>
              <span className="text-[#c8c4d7]/50 ml-0.5">ATK</span>
            </div>
            <div className="w-px h-3 bg-[#2b363b]" />
            <div className="text-xs">
              <span className="text-[#4bddb7] font-bold">{card.defense}</span>
              <span className="text-[#c8c4d7]/50 ml-0.5">DEF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rarity Border Effect */}
      {card.rarity === 'ULTRA_RARE' && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-[#f0bf63]/50 animate-pulse" />
      )}
      {card.rarity === 'RARE' && (
        <div className="absolute inset-0 rounded-2xl ring-1 ring-[#6c5ce7]/50" />
      )}
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
    <div
      className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-50"
      style={{ backgroundColor: '#162125' }}
    >
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
  const [categoryFilter, setCategoryFilter] = useState<FilterType>('all');
  const [elementFilter, setElementFilter] = useState<ElementFilter>('all');

  // Filter cards
  const filteredCards = allCards.filter(card => {
    if (categoryFilter !== 'all' && card.type !== categoryFilter) return false;
    if (elementFilter !== 'all' && card.element !== elementFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />
      
      <main className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#d8e4ea]">Koleksiku</h1>
            <p className="text-sm text-[#c8c4d7]">{allCards.length} kartu terkumpul</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🃏</span>
            <span className="text-sm font-medium text-[#c8c4d7]">1/241</span>
          </div>
        </div>

        <SearchBar />
        <CategoryFilters active={categoryFilter} onChange={setCategoryFilter} />
        <ElementFilters active={elementFilter} onChange={setElementFilter} />

        {/* Stats */}
        <div className="px-4 mb-3 flex gap-3">
          <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: colors.cardBg }}>
            <div className="text-lg font-bold text-[#4bddb7]">
              {allCards.filter(c => c.rarity === 'UNCOMMON' || c.rarity === 'RARE' || c.rarity === 'ULTRA_RARE').length}
            </div>
            <div className="text-xs text-[#c8c4d7]">Ungu+</div>
          </div>
          <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: colors.cardBg }}>
            <div className="text-lg font-bold text-[#f0bf63]">12</div>
            <div className="text-xs text-[#c8c4d7]">Rare+</div>
          </div>
          <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: colors.cardBg }}>
            <div className="text-lg font-bold text-[#ffb4ab]">3</div>
            <div className="text-xs text-[#c8c4d7]">Ultra Rare</div>
          </div>
        </div>

        {/* Card Grid */}
        <div className="px-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredCards.slice(0, 12).map((card, i) => (
              <CardItem key={card.id} card={card} index={i} />
            ))}
          </div>
          
          {filteredCards.length > 12 && (
            <p className="text-center text-sm text-[#c8c4d7] py-4">
              +{filteredCards.length - 12} kartu lainnya
            </p>
          )}

          {filteredCards.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-[#c8c4d7]">Tidak ada kartu yang cocok</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}