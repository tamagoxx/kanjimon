'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore } from '@/store/collectionStore';
import { Gem, Zap, Flame, Crown, Star, Shield, Loader2, ArrowRight } from 'lucide-react';

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
// Currency Icons
// ============================================================
function CurrencyDisplay({ dollars, diamonds, coins, energy, scrolls }: {
  dollars: number; diamonds: number; coins: number; energy: number; scrolls: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {/* Dollars */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: colors.cardBg }}>
        <span className="text-sm">💵</span>
        <span className="text-xs font-bold" style={{ color: '#4ade80' }}>{dollars.toLocaleString()}</span>
      </div>
      {/* Diamonds */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: colors.cardBg }}>
        <Gem className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-xs font-bold text-cyan-400">{diamonds.toLocaleString()}</span>
      </div>
      {/* Coins */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: colors.cardBg }}>
        <span className="text-sm">💰</span>
        <span className="text-xs font-bold" style={{ color: colors.gold }}>{coins.toLocaleString()}</span>
      </div>
      {/* Energy */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: colors.cardBg }}>
        <Zap className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-xs font-bold text-yellow-400">{energy}</span>
      </div>
      {/* Scrolls */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: colors.cardBg }}>
        <span className="text-sm">📜</span>
        <span className="text-xs font-bold" style={{ color: colors.lightPurple }}>{scrolls}</span>
      </div>
    </div>
  );
}

// Top App Bar
function TopAppBar() {
  const { dollars, coins, diamonds, energy, scrolls } = useCollectionStore();

  return (
    <div className="sticky top-0 z-40 px-4 h-[72px] flex items-center justify-between" style={{ backgroundColor: colors.background }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.brand }}>
          <span className="text-white font-bold text-xs">T</span>
        </div>
        <span className="text-sm font-medium text-[#c6bfff]">Toko</span>
      </div>
      <CurrencyDisplay dollars={dollars} diamonds={diamonds} coins={coins} energy={energy} scrolls={scrolls} />
    </div>
  );
}

// ============================================================
// Shop Item Card
// ============================================================
function ShopItem({ 
  name, price, currency, emoji, description, color, tag, tagColor,
  onBuy, disabled, highlight
}: {
  name: string; price: number; currency: '💎' | '💰' | '⚡';
  emoji: string; description: string; color: string;
  tag?: string; tagColor?: string; onBuy: () => void;
  disabled?: boolean; highlight?: boolean;
}) {
  const { diamonds, coins, energy } = useCollectionStore();
  const canAfford = currency === '💎' ? diamonds >= price
    : currency === '💰' ? coins >= price
    : energy >= price;

  return (
    <motion.div
      whileHover={canAfford ? { scale: 1.01 } : {}}
      whileTap={canAfford ? { scale: 0.99 } : {}}
      className={`rounded-2xl overflow-hidden relative ${!canAfford ? 'opacity-60' : ''} ${highlight ? 'ring-2 ring-yellow-400/50' : ''}`}
      style={{ backgroundColor: colors.cardBg }}
    >
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 pointer-events-none" />
      )}
      {tag && (
        <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold ${tagColor || 'bg-yellow-500/20 text-yellow-400'}`}>
          {tag}
        </div>
      )}
      <div className="h-24 flex items-center justify-center relative" style={{ background: `linear-gradient(135deg, ${color}20, ${colors.cardBg})` }}>
        <span className="text-4xl">{emoji}</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-sm text-white mb-0.5">{name}</h3>
        <p className="text-[10px] text-white/40 mb-3">{description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm">{currency}</span>
            <span className="font-bold text-white text-sm">{price.toLocaleString()}</span>
          </div>
          <button
            onClick={onBuy}
            disabled={!canAfford || disabled}
            className="px-4 py-2 rounded-xl font-bold text-white text-xs active:scale-95 disabled:opacity-40 transition-transform"
            style={{ backgroundColor: canAfford ? colors.brand : colors.inputBg }}
          >
            Beli
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// IAP Diamond Bundle
// ============================================================
function DiamondBundle({ amount, bonus, price, original, popular }: {
  amount: number; bonus: number; price: number; original?: number; popular?: boolean;
}) {
  const { diamonds, addDiamonds, spendDiamonds } = useCollectionStore();
  const canAfford = diamonds >= price;

  return (
    <div className={`rounded-2xl overflow-hidden relative ${popular ? 'ring-2 ring-cyan-400/60' : ''}`} style={{ backgroundColor: colors.cardBg }}>
      {popular && (
        <div className="absolute top-0 left-0 right-0 py-1 text-center text-[10px] font-bold text-black" style={{ backgroundColor: '#4facfe' }}>
          ⭐ PALING POPULER
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #06b6d420, #06b6d410)' }}>
            <Gem className="w-7 h-7 text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-cyan-400">{amount.toLocaleString()}</span>
              {bonus > 0 && <span className="text-xs font-bold text-green-400">+{bonus}</span>}
            </div>
            {original && <span className="text-xs text-white/30 line-through">${original}</span>}
            <p className="text-sm font-bold text-white">${price}</p>
          </div>
          <button
            onClick={() => {
              // In a real app, this would open payment flow
              // For now, simulate direct diamond purchase
              addDiamonds(amount + bonus);
            }}
            className="px-4 py-2 rounded-xl font-bold text-white text-xs"
            style={{ backgroundColor: colors.brand }}
          >
            Beli
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Daily Deal
// ============================================================
function DailyDeal() {
  const { diamonds, spendDiamonds } = useCollectionStore();

  const deal = {
    name: 'Mega Bundle',
    original: 500,
    price: 250,
    emoji: '🎁',
    color: '#f0bf63',
    bonus: 50,
    total: 550,
  };

  const canAfford = diamonds >= deal.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${deal.color}15, ${colors.cardBg})`, border: `1px solid ${deal.color}30` }}
    >
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${deal.color}20` }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🔥</span>
          <span className="text-sm font-bold text-white">Deal Harian</span>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-black" style={{ backgroundColor: deal.color }}>HEMAT 50%</span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl" style={{ background: `${deal.color}20` }}>
            {deal.emoji}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm">{deal.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-white/40 line-through">{deal.original}💎</span>
              <Gem className="w-3 h-3 text-cyan-400" />
              <span className="text-sm font-black text-cyan-400">{deal.price}</span>
            </div>
            <p className="text-[10px] text-green-400 mt-0.5">Bonus +{deal.bonus}💎</p>
          </div>
          <button
            onClick={() => {
              if (diamonds >= deal.price) {
                spendDiamonds(deal.price);
                useCollectionStore.getState().addDiamonds(deal.total);
              }
            }}
            disabled={!canAfford}
            className="px-4 py-2 rounded-xl font-bold text-white text-xs disabled:opacity-40"
            style={{ backgroundColor: deal.color }}
          >
            Klaim
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Energy Info Card
// ============================================================
function EnergyInfo() {
  const [expanded, setExpanded] = useState(false);
  const { energy } = useCollectionStore();

  const sources = [
    { icon: '🔄', name: 'Daily Login', amount: '+5', desc: 'setiap login' },
    { icon: '⚔️', name: 'Battle Victory', amount: '+2', desc: 'per menang' },
    { icon: '📜', name: 'Quest Complete', amount: '+1', desc: 'per quest' },
    { icon: '💎', name: 'Diamond Refill', amount: 'MAX', desc: 'isi penuh' },
  ];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: colors.cardBg }}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-white">⚡ Sistem Energy</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${colors.gold}20`, color: colors.gold }}>
            {energy}/20
          </span>
        </div>
        <span className="text-xs text-white/40">{expanded ? '▲' : '▼'}</span>
      </button>

      <div className="px-4 pb-3 grid grid-cols-2 gap-2">
        {sources.map((s, i) => (
          <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-black/20">
            <span className="text-sm">{s.icon}</span>
            <div>
              <p className="text-[10px] font-bold text-white">{s.name}</p>
              <p className="text-[9px] text-yellow-400">{s.amount} ⚡</p>
            </div>
          </div>
        ))}
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
    { icon: '⚔️', label: 'Battle', route: '/battle' },
    { icon: '🃏', label: 'Kartu', route: '/collection' },
    { icon: '🛒', label: 'Toko', route: '/shop', active: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-50" style={{ backgroundColor: '#162125' }}>
      {navItems.map((item, i) => (
        <button
          key={i}
          onClick={() => router.push(item.route)}
          className="flex flex-col items-center gap-1 transition-opacity"
          style={{ opacity: item.active ? 1 : 0.5 }}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs" style={{ color: item.active ? colors.teal : colors.darkText }}>{item.label}</span>
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
  const { coins, diamonds, energy, scrolls, spendDiamonds, spendCoins, spendEnergy, addEnergy, addScrolls, addDiamonds } = useCollectionStore();
  const [buying, setBuying] = useState(false);

  const handleBuy = (currency: '💎' | '💰' | '⚡', price: number, action: () => void) => {
    if (currency === '💎' && diamonds < price) return;
    if (currency === '💰' && coins < price) return;
    if (currency === '⚡' && energy < price) return;
    setBuying(true);
    setTimeout(() => {
      action();
      setBuying(false);
    }, 300);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">

        {/* Gacha CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/gacha')}
          className="w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3"
          style={{ background: 'linear-gradient(135deg, #6c5ce7, #4bddb7)', boxShadow: '0 4px 20px #6c5ce740' }}
        >
          <span className="text-2xl">🎰</span>
          <span className="text-white">Buka Gacha!</span>
          <span className="text-sm text-white/70">📜 1x pull</span>
        </motion.button>

        {/* 🔥 Jual / Burn Kartu CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/sell')}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3"
          style={{ backgroundColor: colors.cardBg, border: `1px solid #ff6b3540` }}
        >
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-white">Jual / Burn Kartu</span>
          <span className="text-xs text-white/40">💵 + ⚡ energy</span>
          <ArrowRight className="w-4 h-4 text-white/40" />
        </motion.button>

        {/* Daily Deal */}
        <DailyDeal />

        {/* Energy System */}
        <EnergyInfo />

        {/* 💎 Buy Diamonds */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Gem className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">💎 Beli Diamond</h2>
          </div>
          <div className="space-y-2">
            <DiamondBundle amount={100} bonus={0} price={1} />
            <DiamondBundle amount={500} bonus={50} price={5} popular />
            <DiamondBundle amount={1200} bonus={200} price={10} />
            <DiamondBundle amount={3000} bonus={750} price={20} original={30} />
          </div>
        </section>

        {/* 📜 Gacha Scrolls */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📜</span>
            <h2 className="text-sm font-bold text-white">Gacha Scrolls</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ShopItem
              name="3 Scrolls"
              price={50}
              currency="💎"
              emoji="📜"
              description="3x Gacha pull"
              color="#6c5ce7"
              tag="TERSEDIA"
              tagColor="bg-green-500/20 text-green-400"
              onBuy={() => handleBuy('💎', 50, () => addScrolls(3))}
            />
            <ShopItem
              name="10 Scrolls"
              price={150}
              currency="💎"
              emoji="📜"
              description="10x Gacha pull + bonus 2"
              color="#c77dff"
              tag="HEMAT"
              tagColor="bg-purple-500/20 text-purple-400"
              onBuy={() => handleBuy('💎', 150, () => addScrolls(12))}
              highlight
            />
            <ShopItem
              name="30 Scrolls"
              price={400}
              currency="💎"
              emoji="📜"
              description="30x + bonus 10"
              color="#ffd700"
              tag="MEGA"
              tagColor="bg-yellow-500/20 text-yellow-400"
              onBuy={() => handleBuy('💎', 400, () => addScrolls(40))}
            />
            <ShopItem
              name="1 Scroll"
              price={20}
              currency="💎"
              emoji="📜"
              description="1x Gacha pull"
              color="#4facfe"
              onBuy={() => handleBuy('💎', 20, () => addScrolls(1))}
            />
          </div>
        </section>

        {/* ⚡ Energy Refills */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-bold text-white">⚡ Energy Refill</h2>
            <span className="text-xs text-white/40">({energy}/20)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ShopItem
              name="+5 Energy"
              price={10}
              currency="💎"
              emoji="⚡"
              description="Refill 5 energy"
              color="#ffd93d"
              onBuy={() => handleBuy('💎', 10, () => addEnergy(Math.min(5, 20 - energy)))}
              disabled={energy >= 20}
            />
            <ShopItem
              name="Full Refill"
              price={30}
              currency="💎"
              emoji="⚡"
              description="Isi energy penuh"
              color="#ff6b35"
              tag="MAX"
              tagColor="bg-orange-500/20 text-orange-400"
              onBuy={() => handleBuy('💎', 30, () => addEnergy(20 - energy))}
              disabled={energy >= 20}
              highlight
            />
          </div>
        </section>

        {/* 📦 Japanese Card Packs */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white">📦 Paket Kartu Jepang</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ShopItem
              name="Elemental Pack"
              price={100}
              currency="💎"
              emoji="⚡"
              description="5 kartu acak"
              color="#4facfe"
              onBuy={() => handleBuy('💎', 100, () => {})}
            />
            <ShopItem
              name="Spirit Pack"
              price={200}
              currency="💎"
              emoji="✨"
              description="10 kartu + bonus"
              color="#4bddb7"
              onBuy={() => handleBuy('💎', 200, () => {})}
              highlight
            />
          </div>
        </section>

        {/* Info Footer */}
        <div className="text-center py-4 space-y-1">
          <p className="text-xs text-white/30">
            💡 Diamond bisa didapat dari Battle, Quest Harian, dan Login
          </p>
          <p className="text-[10px] text-white/20">
            Scrolls diperlukan untuk Gacha Pokemon
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}