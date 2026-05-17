'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCollectionStore } from '@/store/collectionStore';
import { useAuthStore } from '@/store/authStore';
import { useLearningProgressStore } from '@/store/learningProgressStore';

const QUEST_ICONS: Record<string, string> = {
  BATTLE: '⚔️',
  MODULE: '📚',
  REVIEW: '🔁',
  STREAK: '🔥',
  COLLECT: '🎰',
};

const QUEST_COLORS: Record<string, string> = {
  BATTLE: '#ff6b35',
  MODULE: '#6c5ce7',
  REVIEW: '#4bddb7',
  STREAK: '#f0bf63',
  COLLECT: '#4facfe',
};

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

// TopAppBar must also subscribe to re-render on quest changes
function TopAppBar() {
  const diamonds = useCollectionStore(s => s.diamonds);
  const dailyQuests = useCollectionStore(s => s.dailyQuests);
  const user = useAuthStore(s => s.user);
  const router = useRouter();

  const displayName = user?.username || 'Tamago';
  const displayLevel = user?.level || 1;
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const xp = user?.xp || 0;
  const xpPerLevel = 1000;
  const xpProgress = xp % xpPerLevel;
  
  return (
    <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: '#0a1519' }}>
      {/* Left: Profile button */}
      <button onClick={() => router.push('/profile')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.brand }}>
          <span className="text-white font-bold">{avatarInitial}</span>
        </div>
        <div>
          <span className="text-base font-medium text-[#c6bfff]">{displayName}</span>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[#f0bf63]">⭐</span>
            <span className="text-[#c8c4d7]">Level {displayLevel}</span>
          </div>
        </div>
      </button>
      {/* Right: Settings button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ backgroundColor: `${colors.gold}20` }}>
          <span className="text-sm">💎</span>
          <span className="text-sm font-bold text-[#f0bf63]">{diamonds.toLocaleString()}</span>
        </div>
        <button onClick={() => router.push('/settings')} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.inputBg }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c6bfff" strokeWidth="2">
            <circle cx="10" cy="10" r="3" />
            <path d="M10 1v2M10 17v2M1 10h2M17 10h2M3.22 3.22l1.42 1.42M15.36 15.36l1.42 1.42M3.22 16.78l1.42-1.42M15.36 4.64l1.42-1.42" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Bottom Navigation
function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  
  const navItems = [
    { icon: '🏠', label: 'Home', route: '/' },
    { icon: '📚', label: 'Belajar', route: '/learn' },
    { icon: '⚔️', label: 'Battle', route: '/battle' },
    { icon: '🃏', label: 'Kartu', route: '/collection' },
    { icon: '🛒', label: 'Toko', route: '/shop' },
  ];

  const isActive = (route: string) => {
    if (route === '/') return pathname === '/';
    return pathname.startsWith(route);
  };
  
  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-50"
      style={{ backgroundColor: '#162125' }}
    >
      {navItems.map((item, i) => (
        <button
          key={i}
          onClick={() => router.push(item.route)}
          className={`flex flex-col items-center gap-1 ${isActive(item.route) ? 'opacity-100' : 'opacity-60'} transition-opacity`}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs" style={{ color: isActive(item.route) ? colors.teal : colors.darkText }}>
            {item.label}
          </span>
          {isActive(item.route) && <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: colors.teal }} />}
        </button>
      ))}
    </div>
  );
}

// Daily Quest Card
function QuestCard({ quest }: { quest: any }) {
  const progress = quest.progress || 0;
  const target = quest.target || 1;
  const percent = Math.min(100, Math.round((progress / target) * 100));
  const icon = QUEST_ICONS[quest.type] || '📋';
  const color = QUEST_COLORS[quest.type] || colors.teal;

  return (
    <div className="p-3 rounded-xl" style={{ backgroundColor: colors.cardBg }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-[#d8e4ea]">{quest.title}</span>
            <span className="text-xs text-[#f0bf63]">+{quest.xpReward} XP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
              />
            </div>
            <span className="text-xs text-[#c8c4d7] w-12 text-right">{progress}/{target}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// FeaturedCard - shows JapaneseCard stats
// JapaneseCard: attackPower, defenseRating, meaningId (indonesian)
function FeaturedCard({ card, index }: { card: any; index: number }) {
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

  const isPokemon = card._type === 'pokemon' || card._type === 'fused';
  const cardColor = elementColors[card.element] || colors.darkText;
  const attackVal = card.attackPower ?? card.attack ?? card.baseAttack ?? 0;
  const defenseVal = card.defenseRating ?? card.defense ?? card.baseDefense ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="w-36 flex-shrink-0 rounded-2xl overflow-hidden"
      style={{ backgroundColor: colors.cardBg }}
    >
      {/* Card Visual */}
      <div
        className="h-48 flex flex-col items-center justify-center p-3"
        style={{ background: `linear-gradient(135deg, ${cardColor}30, ${colors.cardBg})` }}
      >
        {isPokemon ? (
          <>
            {card.image && (
              <img src={card.image} alt={card.name} className="w-20 h-20 object-contain mb-1" />
            )}
            <div className="text-sm font-bold text-white capitalize">{card.name}</div>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold text-white mb-1">{card.japanese}</div>
            <div className="text-sm text-[#c8c4d7] mb-2">{card.reading}</div>
          </>
        )}
        <div
          className="px-2 py-1 rounded-full text-xs font-medium mt-1"
          style={{ backgroundColor: `${cardColor}30`, color: cardColor }}
        >
          {elementIcons[card.element] || card.element || '📝'}
        </div>
      </div>

      {/* Card Info */}
      <div className="p-3">
        <div className="text-xs text-[#d8e4ea] mb-1 truncate">
          {isPokemon ? card.name : (card.meaningId ?? card.meaning ?? '')}
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#ffb4ab] font-bold">{attackVal} ATK</span>
          <span className="text-[#4bddb7] font-bold">{defenseVal} DEF</span>
        </div>
      </div>
    </motion.div>
  );
}

// Quick Action Button
function QuickAction({ icon, label, color, route }: { icon: string; label: string; color: string; route: string }) {
  const router = useRouter();
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push(route)}
      className="flex flex-col items-center gap-2 p-3 rounded-2xl"
      style={{ backgroundColor: colors.cardBg }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
        style={{ backgroundColor: `${color}20` }}
      >
        {icon}
      </div>
      <span className="text-xs font-medium text-[#c8c4d7]">{label}</span>
    </motion.button>
  );
}

// Get featured cards: top 3 by combined ATK+DEF across ALL owned cards (Japanese + Pokemon)
// Starter cards only shown for new users with very few cards
function useFeaturedCards() {
  const ownedCards = useCollectionStore(s => s.ownedCards);
  const ownedPokemon = useCollectionStore(s => s.ownedPokemon);
  const fusedPokemon = useCollectionStore(s => s.fusedPokemon);

  if (ownedCards.length === 0 && ownedPokemon.length === 0 && fusedPokemon.length === 0) return [];

  // Build combined list of all cards with their stats
  type AnyCard = { id: string; type: 'jp' | 'pokemon' | 'fused'; attack: number; defense: number; data: any };
  const allCards: AnyCard[] = [];

  // Japanese cards
  ownedCards.forEach(oc => {
    allCards.push({
      id: oc.cardId,
      type: 'jp',
      attack: oc.card.attackPower ?? 0,
      defense: oc.card.defenseRating ?? 0,
      data: oc.card,
    });
  });

  // Pokemon cards
  ownedPokemon.forEach(p => {
    allCards.push({
      id: `poke-${p.pokemonId}`,
      type: 'pokemon',
      attack: p.attack ?? 0,
      defense: p.defense ?? 0,
      data: p,
    });
  });

  // Fused Pokemon
  fusedPokemon.forEach(f => {
    allCards.push({
      id: f.id,
      type: 'fused',
      attack: f.baseAttack ?? 0,
      defense: f.baseDefense ?? 0,
      data: f,
    });
  });

  // Sort by combined ATK + DEF
  const sorted = [...allCards].sort((a, b) => (b.attack + b.defense) - (a.attack + a.defense));

  // New user (total < 5 cards) → show first 3 from starter Japanese cards
  if (allCards.length <= 5) {
    return sorted.slice(0, 3).map(c => ({ ...c.data, _type: c.type }));
  }

  // Existing user → top 3 by ATK+DEF across all types
  return sorted.slice(0, 3).map(c => ({ ...c.data, _type: c.type }));
}

export default function HomePage() {
  const router = useRouter();
  const dailyQuests = useCollectionStore(s => s.dailyQuests);
  const user = useAuthStore(s => s.user);
  const hiraganaProgress = useLearningProgressStore(s => s.getModuleProgress)('hiragana');
  const katakanaProgress = useLearningProgressStore(s => s.getModuleProgress)('katakana');
  const featuredCards = useFeaturedCards();

  const displayName = user?.username || 'Tamago';
  const userLevel = user?.level || 1;
  const totalXP = user?.xp || 0;
  const xpPerLevel = 1000;
  const levelProgress = totalXP > 0 ? (totalXP % xpPerLevel) / xpPerLevel * 100 : 0;

  // Determine active module for continue learning card
  const activeModule = hiraganaProgress.learned > 0
    ? { id: 'hiragana', name: 'Hiragana', subtitle: 'Dasar', icon: 'あ', progress: hiraganaProgress }
    : katakanaProgress.learned > 0
    ? { id: 'katakana', name: 'Katakana', subtitle: 'Dasar', icon: 'ア', progress: katakanaProgress }
    : { id: 'hiragana', name: 'Hiragana', subtitle: 'Dasar', icon: 'あ', progress: hiraganaProgress };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto px-4 pt-4">
        {/* Greeting Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-2xl"
          style={{ backgroundColor: colors.cardBg }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#d8e4ea] mb-1">
                Halo, {displayName}! 👋
              </h1>
              <p className="text-sm text-[#c8c4d7]">
                Lanjutkan perjalanan belajarmu hari ini
              </p>
            </div>
            <div className="relative">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#051013' }}>
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#4bddb7" strokeWidth="4" strokeDasharray="120 176" transform="rotate(-90 32 32)" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-[#4bddb7]">45%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="mb-4 grid grid-cols-4 gap-2">
          <QuickAction icon="📚" label="Belajar" color={colors.brand} route="/learn" />
          <QuickAction icon="⚔️" label="Battle" color={colors.coral} route="/battle" />
          <QuickAction icon="🃏" label="Kartu" color={colors.lightPurple} route="/collection" />
          <QuickAction icon="🏆" label="Peringkat" color={colors.gold} route="/leaderboard" />
        </div>

        {/* Continue Learning Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => router.push('/learn')}
          className="mb-4 p-4 rounded-2xl cursor-pointer"
          style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.inputBg}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#c8c4d7]">Lanjutkan Belajar</span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${colors.brand}20`, color: colors.brand }}>Lanjutkan</span>
          </div>
          <p className="text-lg font-bold text-[#d8e4ea]">
            {activeModule.name} - {activeModule.subtitle} ({activeModule.progress.total} karakter)
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.inputBg }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${activeModule.progress.percentage}%`, backgroundColor: colors.teal }}
              />
            </div>
            <span className="text-xs text-[#c8c4d7] whitespace-nowrap">
              {activeModule.progress.learned}/{activeModule.progress.total}
            </span>
          </div>
        </motion.div>

        {/* Daily Quests */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#c8c4d7] tracking-wider">QUEST HARIAN</h2>
            <button onClick={() => router.push('/quests')} className="text-xs text-[#4bddb7] font-medium">Lihat Semua →</button>
          </div>
          <div className="space-y-2">
            {dailyQuests.slice(0, 3).map((quest) => (
              <QuestCard key={quest.id} quest={quest} />
            ))}
          </div>
        </div>

        {/* Featured Cards */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#c8c4d7] tracking-wider">KARTU ANDALAN</h2>
            <button onClick={() => router.push('/collection')} className="text-xs text-[#4bddb7] font-medium">
              Lihat Semua →
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {featuredCards.map((card, i) => (
              <FeaturedCard key={card.id} card={card} index={i} />
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-[#c8c4d7] tracking-wider mb-3">AKTIVITAS TERAKHIR</h2>
          <div className="space-y-2">
            {[
              { icon: '⚔️', text: 'Battle vs Sensei Bot - Menang', time: '2 jam lalu', color: colors.teal },
              { icon: '📚', text: 'Belajar Katakana - Dasar', time: '5 jam lalu', color: colors.brand },
              { icon: '🃏', text: 'Dapat kartu baru: 水 (Mizu)', time: '1 hari lalu', color: colors.lightPurple },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ backgroundColor: colors.cardBg }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  {item.icon}
                </div>
                <div className="flex-1">
                  <span className="text-sm text-[#d8e4ea]">{item.text}</span>
                </div>
                <span className="text-xs text-[#c8c4d7]">{item.time}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}