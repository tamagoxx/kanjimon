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
  return (
    <div className="sticky top-0 z-40 px-4 h-[89px] flex items-center justify-between" style={{ backgroundColor: '#0a1519' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.brand }}>
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <span className="text-base font-medium text-[#c6bfff]">Toko</span>
      </div>
      
      {/* Currency Display */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: colors.cardBg }}>
          <span className="text-sm">💎</span>
          <span className="text-sm font-bold text-[#c6bfff]">1,250</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: colors.cardBg }}>
          <span className="text-sm">🪙</span>
          <span className="text-sm font-bold text-[#c6bfff]">3,500</span>
        </div>
      </div>
    </div>
  );
}

// Card Pack Component
function CardPack({ name, price, currency, emoji, description, color, index }: { 
  name: string; price: number; currency: string; emoji: string; 
  description: string; color: string; index: number 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: colors.cardBg }}
    >
      {/* Pack Visual */}
      <div
        className="h-40 flex items-center justify-center relative"
        style={{ background: `linear-gradient(135deg, ${color}30, ${colors.cardBg})` }}
      >
        <span className="text-6xl">{emoji}</span>
        
        {/* Pack Type Badge */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: `${color}30`, color }}>
          LEGENDARY
        </div>
      </div>
      
      {/* Pack Info */}
      <div className="p-4">
        <h3 className="font-bold text-[#d8e4ea] mb-1">{name}</h3>
        <p className="text-sm text-[#c8c4d7] mb-3">{description}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-lg">{currency === '💎' ? '💎' : '🪙'}</span>
            <span className="font-bold text-[#d8e4ea]">{price.toLocaleString()}</span>
          </div>
          <button
            className="px-4 py-2 rounded-xl font-bold text-white text-sm"
            style={{ backgroundColor: colors.brand }}
          >
            Beli
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Scroll Item
function ScrollItem({ name, element, price, emoji, index }: {
  name: string; element: string; price: number; emoji: string; index: number;
}) {
  const elementColors: Record<string, string> = {
    FIRE: '#ffb4ab',
    WATER: '#6c5ce7',
    GRASS: '#4bddb7',
    ELECTRIC: '#f0bf63',
    VOID: '#c6bfff',
  };
  
  const col = elementColors[element] || colors.darkText;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="flex-1 min-w-[160px] rounded-xl p-3"
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{emoji}</span>
        <div>
          <span className="text-sm font-bold text-[#d8e4ea]">{name}</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: col }} />
            <span className="text-xs text-[#c8c4d7]">{element}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-[#f0bf63]">🪙 {price}</span>
        <button className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: colors.brand }}>
          Beli
        </button>
      </div>
    </motion.div>
  );
}

// Daily Deal Card
function DailyDealCard({ title, discount, originalPrice, salePrice, emoji, index }: {
  title: string; discount: string; originalPrice: number; salePrice: number; emoji: string; index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 rounded-2xl"
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${colors.brand}20` }}>
          {emoji}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <span className="text-sm font-bold text-[#d8e4ea]">{title}</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white bg-[#ff4b4b]">{discount}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-[#c8c4d7] line-through">🪙 {originalPrice}</span>
            <span className="text-lg font-bold text-[#f0bf63]">🪙 {salePrice}</span>
          </div>
          <button className="w-full py-2 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: colors.brand }}>
            Beli Sekarang
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
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {/* Featured Card Packs Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#d8e4ea]">Paket Kartu</h2>
            <button className="text-sm text-[#4bddb7] font-medium">Lihat Semua →</button>
          </div>
          
          <div className="space-y-4">
            <CardPack
              name="Legendary Pack"
              price={500}
              currency="💎"
              emoji="👑"
              description="3 kartu including 1 Ultra Rare"
              color="#f0bf63"
              index={0}
            />
            <CardPack
              name="Elemental Pack"
              price={200}
              currency="💎"
              emoji="⚡"
              description="5 kartu acak dengan element"
              color="#6c5ce7"
              index={1}
            />
            <CardPack
              name="Spirit Pack"
              price={100}
              currency="🪙"
              emoji="✨"
              description="10 kartu umum-uncommon"
              color="#4bddb7"
              index={2}
            />
          </div>
        </section>

        {/* Summoning Scrolls */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#d8e4ea]">Summoning Scrolls</h2>
            <button className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: colors.inputBg, color: colors.darkText }}>
              Lihat Semua
            </button>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            <ScrollItem name="Fire Scroll" element="FIRE" price={150} emoji="🔥" index={0} />
            <ScrollItem name="Water Scroll" element="WATER" price={150} emoji="💧" index={1} />
            <ScrollItem name="Lightning Scroll" element="ELECTRIC" price={150} emoji="⚡" index={2} />
            <ScrollItem name="Void Scroll" element="PSYCHIC" price={200} emoji="🌌" index={3} />
          </div>
        </section>

        {/* Daily Deals */}
        <section>
          <h2 className="text-lg font-bold text-[#d8e4ea] mb-4">🔥 Deals Harian</h2>
          
          <div className="space-y-3">
            <DailyDealCard
              title="Bundle Starter Pack"
              discount="-40%"
              originalPrice={1000}
              salePrice={600}
              emoji="📦"
              index={0}
            />
            <DailyDealCard
              title="XP Boost x3"
              discount="-25%"
              originalPrice={500}
              salePrice={375}
              emoji="⚡"
              index={1}
            />
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}