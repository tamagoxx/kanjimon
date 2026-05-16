'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore } from '@/store/collectionStore';
import { Gem, Star, Crown, Loader2 } from 'lucide-react';

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

// ============================================================
// Components
// ============================================================

// Top App Bar with real currency (diamonds + coins)
function TopAppBar() {
  const { coins, diamonds } = useCollectionStore();

  return (
    <div className="sticky top-0 z-40 px-4 h-[89px] flex items-center justify-between" style={{ backgroundColor: '#0a1519' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.brand }}>
          <span className="text-white font-bold text-sm">T</span>
        </div>
        <span className="text-base font-medium text-[#c6bfff]">Toko</span>
      </div>
      <div className="flex items-center gap-3">
        {/* Diamonds */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: colors.cardBg }}>
          <Gem className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-cyan-400">{diamonds.toLocaleString()}</span>
        </div>
        {/* Coins */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ backgroundColor: colors.cardBg }}>
          <span className="text-sm">💰</span>
          <span className="text-sm font-bold text-[#c6bfff]">{coins.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// Gacha card (redirects to gacha page)
function GachaCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-2xl overflow-hidden cursor-pointer relative"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%)' }}
    >
      {/* Animated glow effect for featured */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
      
      <div className="relative p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
            🎰
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-black text-white text-lg">Gacha Machine</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-400">RECOMMENDED</span>
            </div>
            <p className="text-xs text-white/50 mb-2">Tarik untuk mendapat Pokemon langka!</p>
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <Gem className="w-3 h-3" />
              <span>Mulai dari 30 💎 per pull</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-yellow-500/20 text-yellow-400">🥇 Gold Tier</span>
            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-400">💎 Diamond Tier</span>
          </div>
          <div className="flex items-center gap-2 text-white font-bold">
            <span>🎯 Buka Gacha</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Card Pack (existing - Japanese cards)
function CardPack({ name, price, currency, emoji, description, color, index, onBuy }: {
  name: string; price: number; currency: string; emoji: string;
  description: string; color: string; index: number; onBuy: () => void;
}) {
  const { coins, diamonds } = useCollectionStore();
  const isDiamond = currency === '💎';
  const canAfford = isDiamond ? diamonds >= price : coins >= price;

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

// Daily Deals
function DailyDeal({ onBuy }: { onBuy: () => void }) {
  const { coins, diamonds } = useCollectionStore();
  const canAfford = diamonds >= 250;

  return (
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
            <span className="text-sm text-[#c8c4d7] line-through">💎 500</span>
            <span className="text-lg font-bold text-[#f0bf63]">💎 250</span>
          </div>
          <button
            onClick={onBuy}
            disabled={!canAfford}
            className="w-full py-2 rounded-xl font-bold text-white text-sm bg-[#6c5ce7] disabled:opacity-40"
          >
            Beli Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}

// Currency earn guide
function EarnGuide() {
  const [expanded, setExpanded] = useState(false);

  const sources = [
    { source: 'Battle Victory', amount: 5, icon: '⚔️', desc: 'per menang' },
    { source: 'Battle Win Streak', amount: 15, icon: '🔥', desc: 'per 3 streak' },
    { source: 'Quiz Sempurna', amount: 3, icon: '📚', desc: 'per 100%' },
    { source: 'Complete Module', amount: 10, icon: '📖', desc: 'per modul' },
    { source: 'Daily Login', amount: 5, icon: '🎁', desc: 'harian' },
    { source: 'Daily Quest', amount: 20, icon: '✅', desc: 'per quest' },
    { source: 'Catch Pokemon', amount: 2, icon: '🎯', desc: 'per catch' },
  ];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.cardBg }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Gem className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-white">💎 Cara Mendapatkan Diamond</span>
        </div>
        <span className="text-xs text-white/40">{expanded ? '▲' : '▼'}</span>
      </button>
      
      {expanded && (
        <div className="px-4 pb-4 grid grid-cols-2 gap-2">
          {sources.map((s, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-black/20">
              <span className="text-lg">{s.icon}</span>
              <div>
                <p className="text-xs font-bold text-white">{s.source}</p>
                <p className="text-[10px] text-cyan-400">+{s.amount} 💎</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
    { icon: '🛒', label: 'Toko', route: '/shop' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-50" style={{ backgroundColor: '#162125' }}>
      {navItems.map((item, i) => (
        <button key={i} onClick={() => router.push(item.route)} className="flex flex-col items-center gap-1 opacity-60 transition-opacity hover:opacity-100">
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Main Shop Page
// ============================================================
export default function ShopPage() {
  const router = useRouter();
  const { coins, diamonds, spendDiamonds, ownedPokemon } = useCollectionStore();

  // Buy Japanese card pack
  const handleBuyPack = (price: number, currency: string) => {
    if (currency === '💎') {
      if (diamonds >= price) {
        spendDiamonds(price);
        alert(`🎉 Pack purchased with 💎${price}! (Demo - cards would be added)`);
      }
    } else {
      if (coins >= price) {
        useCollectionStore.getState().spendCoins(price);
        alert('🎉 Pack purchased! (Demo - cards would be added)');
      }
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">

        {/* 🎰 Gacha Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎰</span>
            <h2 className="text-lg font-bold text-[#d8e4ea]">Gacha Machine</h2>
          </div>
          <GachaCard onClick={() => router.push('/gacha')} />
        </section>

        {/* 💎 Diamond earn guide */}
        <EarnGuide />

        {/* 📦 Japanese Card Packs */}
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
              onBuy={() => handleBuyPack(500, '💎')}
            />
            <CardPack
              name="Elemental Pack"
              price={200}
              currency="💎"
              emoji="⚡"
              description="5 kartu acak dengan element"
              color="#6c5ce7"
              index={1}
              onBuy={() => handleBuyPack(200, '💎')}
            />
            <CardPack
              name="Spirit Pack"
              price={100}
              currency="💎"
              emoji="✨"
              description="10 kartu umum-uncommon"
              color="#4bddb7"
              index={2}
              onBuy={() => handleBuyPack(100, '💎')}
            />
          </div>
        </section>

        {/* 🔥 Daily Deals */}
        <section>
          <h2 className="text-lg font-bold text-[#d8e4ea] mb-4">🔥 Deals Harian</h2>
          <DailyDeal onBuy={() => handleBuyPack(250, '💎')} />
        </section>

        {/* Stats */}
        <div className="text-center py-4">
          <p className="text-sm text-white/40">
            {ownedPokemon.length} Pokemon dikumpulkan
          </p>
          <p className="text-xs text-white/20 mt-1">
            Kumpulkan semua 1010 Pokemon!
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}