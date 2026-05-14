'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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

// Top App Bar
function TopAppBar() {
  const router = useRouter();
  
  return (
    <div className="sticky top-0 z-40 px-4 h-[89px] flex items-center justify-between" style={{ backgroundColor: '#0a1519' }}>
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/')} className="w-10 h-10 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c6bfff" strokeWidth="2">
            <path d="M10 12L6 8l4-4" />
          </svg>
        </button>
        <span className="text-base font-medium text-[#c6bfff]">Deck Builder</span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="px-3 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: colors.darkGray, color: colors.darkText }}>
          Auto Save
        </div>
        <button className="px-4 py-2 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: colors.brand }}>
          Simpan
        </button>
      </div>
    </div>
  );
}

// Validation Bar (Figma: #02b894 green bar)
function ValidationBar() {
  return (
    <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: '#02b894' }}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M10 3L4.5 8.5L2 6" stroke="#004233" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-sm font-medium" style={{ color: '#004233' }}>
        Deck valid • 20 kartu • 3 element
      </span>
    </div>
  );
}

// Mini Card Component
function MiniCard({ name, element, index, isSelected = false }: { name: string; element: string; index: number; isSelected?: boolean }) {
  const elementColors: Record<string, string> = {
    FIRE: '#ffb4ab',
    WATER: '#6c5ce7',
    GRASS: '#4bddb7',
    ELECTRIC: '#f0bf63',
    PSYCHIC: '#c6bfff',
    NORMAL: '#c8c4d7',
  };
  
  const elementIcons: Record<string, string> = {
    FIRE: '🔥',
    WATER: '💧',
    GRASS: '🌱',
    ELECTRIC: '⚡',
    PSYCHIC: '🔮',
    NORMAL: '📝',
  };
  
  const col = elementColors[element] || colors.darkText;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`w-16 h-[90px] rounded-lg p-2 flex flex-col items-center justify-center ${
        isSelected ? 'ring-2 ring-white' : ''
      }`}
      style={{ backgroundColor: isSelected ? colors.cardBg : `${colors.cardBg}99` }}
    >
      <div className="text-2xl font-bold text-white mb-1">{elementIcons[element]}</div>
      <span className="text-xs text-[#c8c4d7] truncate w-full text-center">{name}</span>
      <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: col }} />
    </motion.div>
  );
}

// Collection Card Component
function CollectionCard({ name, element, rarity, index, inDeck = false }: {
  name: string; element: string; rarity: string; index: number; inDeck?: boolean;
}) {
  const elementColors: Record<string, string> = {
    FIRE: '#ffb4ab',
    WATER: '#6c5ce7',
    GRASS: '#4bddb7',
    ELECTRIC: '#f0bf63',
    PSYCHIC: '#c6bfff',
    NORMAL: '#c8c4d7',
  };
  
  const elementIcons: Record<string, string> = {
    FIRE: '🔥',
    WATER: '💧',
    GRASS: '🌱',
    ELECTRIC: '⚡',
    PSYCHIC: '🔮',
    NORMAL: '📝',
  };
  
  const rarityColors: Record<string, string> = {
    COMMON: '#c8c4d7',
    UNCOMMON: '#4bddb7',
    RARE: '#6c5ce7',
    ULTRA_RARE: '#f0bf63',
  };
  
  const col = elementColors[element] || colors.darkText;
  const rcol = rarityColors[rarity] || colors.darkText;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: inDeck ? 0.5 : 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      className={`rounded-xl overflow-hidden ${inDeck ? 'opacity-50' : ''}`}
      style={{ backgroundColor: colors.cardBg }}
    >
      {/* Card Visual */}
      <div className="h-24 flex items-center justify-center relative" style={{ backgroundColor: `${col}15` }}>
        <span className="text-3xl font-bold text-white">{elementIcons[element]}</span>
        
        {/* Rarity indicator */}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: `${rcol}30`, color: rcol }}>
          {rarity.replace('_', ' ')}
        </div>
        
        {/* In deck indicator */}
        {inDeck && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs font-bold bg-[#4bddb7] text-white">
            ✓
          </div>
        )}
      </div>
      
      {/* Card Info */}
      <div className="p-2">
        <span className="text-xs text-[#d8e4ea]">{name}</span>
      </div>
    </motion.div>
  );
}

// Deck Info Bar
function DeckInfoBar() {
  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: colors.cardBg }}>
      <div className="flex items-center gap-3 mb-3">
        <input
          type="text"
          placeholder="Nama Deck..."
          className="flex-1 bg-transparent outline-none text-[#d8e4ea] font-bold text-lg"
        />
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#c8c4d7" strokeWidth="2">
          <circle cx="9" cy="9" r="6" />
          <path d="M12 12l3 3" />
        </svg>
      </div>
      
      {/* Deck Stats */}
      <div className="flex gap-3 mb-3">
        <div className="px-3 py-2 rounded-xl text-center" style={{ backgroundColor: '#162125' }}>
          <span className="text-lg font-bold text-[#d8e4ea]">20</span>
          <span className="text-xs text-[#c8c4d7] block">Kartu</span>
        </div>
        <div className="px-3 py-2 rounded-xl text-center" style={{ backgroundColor: '#162125' }}>
          <span className="text-lg font-bold text-[#ffb4ab]">8</span>
          <span className="text-xs text-[#c8c4d7] block">Api</span>
        </div>
        <div className="px-3 py-2 rounded-xl text-center" style={{ backgroundColor: '#162125' }}>
          <span className="text-lg font-bold text-[#c6bfff]">6</span>
          <span className="text-xs text-[#c8c4d7] block">Psi</span>
        </div>
        <div className="px-3 py-2 rounded-xl text-center" style={{ backgroundColor: '#162125' }}>
          <span className="text-lg font-bold text-[#4bddb7]">6</span>
          <span className="text-xs text-[#c8c4d7] block">Air</span>
        </div>
      </div>
      
      {/* Element Balance Bar */}
      <div className="h-2 rounded-full overflow-hidden flex">
        <div className="h-full bg-[#ffb4ab]" style={{ width: '40%' }} />
        <div className="h-full bg-[#c6bfff]" style={{ width: '30%' }} />
        <div className="h-full bg-[#4bddb7]" style={{ width: '30%' }} />
      </div>
    </div>
  );
}

// Bottom Navigation
function BottomNav() {
  const router = useRouter();
  
  const navItems = [
    { icon: '🏠', label: 'Home', route: '/' },
    { icon: '📚', label: 'Belajar', route: '/learn' },
    { icon: '⚔️', label: 'Battle', route: '/battle', active: true },
    { icon: '🃏', label: 'Kartu', route: '/collection' },
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
          <span className="text-xs" style={{ color: item.active ? colors.teal : colors.darkText }}>{item.label}</span>
          {item.active && <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: colors.teal }} />}
        </button>
      ))}
    </div>
  );
}

export default function DeckBuilderPage() {
  // Sample deck cards
  const deckCards = [
    { name: 'Mizu', element: 'WATER' },
    { name: 'Hi', element: 'FIRE' },
    { name: 'Ki', element: 'GRASS' },
    { name: 'Kaze', element: 'WIND' },
    { name: 'Hikari', element: 'LIGHT' },
  ];
  
  // Sample collection cards
  const collectionCards = [
    { name: 'Mizu', element: 'WATER', rarity: 'RARE', inDeck: true },
    { name: 'Hi', element: 'FIRE', rarity: 'UNCOMMON', inDeck: true },
    { name: 'Ki', element: 'GRASS', rarity: 'COMMON', inDeck: true },
    { name: 'Kaze', element: 'WIND', rarity: 'RARE', inDeck: false },
    { name: 'Hikari', element: 'LIGHT', rarity: 'ULTRA_RARE', inDeck: false },
    { name: 'Yami', element: 'DARK', rarity: 'RARE', inDeck: false },
    { name: 'Tsuchi', element: 'EARTH', rarity: 'UNCOMMON', inDeck: false },
    { name: 'Mizu', element: 'WATER', rarity: 'COMMON', inDeck: true },
  ];

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: colors.background }}>
      <TopAppBar />
      <ValidationBar />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Deck Info Bar */}
        <DeckInfoBar />
        
        {/* Current Deck Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#c8c4d7]">DECK SAAT INI (5/20)</h3>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: colors.teal, color: '#004233' }}>Auto Save ON</span>
          </div>
          
          <div className="p-4 rounded-xl" style={{ backgroundColor: colors.cardBg }}>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {deckCards.map((card, i) => (
                <MiniCard key={i} name={card.name} element={card.element} index={i} />
              ))}
              {/* Add button slot */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-16 h-[90px] rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer"
                style={{ borderColor: colors.darkGray }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c8c4d7" strokeWidth="2">
                  <path d="M10 4v12M4 10h12" />
                </svg>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Collection Picker */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#c8c4d7]">PILIH KARTU</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded-full" style={{ backgroundColor: '#ff4b4b30', color: '#ff4b4b' }}>Sort: Rarity</span>
              <span className="px-2 py-1 rounded-full" style={{ backgroundColor: '#162125', color: colors.darkText }}>Filter: All</span>
            </div>
          </div>
          
          <div className="p-4 rounded-xl" style={{ backgroundColor: '#121d21' }}>
            <div className="grid grid-cols-3 gap-2">
              {collectionCards.map((card, i) => (
                <CollectionCard
                  key={i}
                  name={card.name}
                  element={card.element}
                  rarity={card.rarity}
                  index={i}
                  inDeck={card.inDeck}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}