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
    <div className="sticky top-0 z-40 px-4 h-[77px] flex items-center justify-between" style={{ backgroundColor: '#0a1519' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center" style={{ borderColor: colors.brand }}>
          <div className="w-9 h-9 rounded-full bg-[#c6bfff] flex items-center justify-center text-white font-bold">
            T
          </div>
        </div>
        <span className="text-xl font-bold text-[#c6bfff]">Profil</span>
      </div>
      
      <button className="px-4 py-2 rounded-xl text-sm font-bold text-[#c6bfff]" style={{ backgroundColor: colors.brand }}>
        Edit
      </button>
    </div>
  );
}

// Stat Card
function StatCard({ icon, label, value, color }: {
  icon: string; label: string; value: string; color: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-2xl flex flex-col items-center justify-center"
      style={{ backgroundColor: colors.cardBg }}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      <span className="text-xs text-[#c8c4d7]">{label}</span>
    </motion.div>
  );
}

// Achievement Badge
function AchievementBadge({ name, icon, earned }: {
  name: string; icon: string; earned: boolean;
}) {
  return (
    <div className={`flex flex-col items-center gap-2 p-3 rounded-xl ${earned ? '' : 'opacity-40'}`}
      style={{ backgroundColor: colors.cardBg }}>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
        earned ? '' : 'grayscale'
      }`} style={{ backgroundColor: earned ? `${colors.gold}30` : colors.inputBg }}>
        {icon}
      </div>
      <span className="text-xs text-[#c8c4d7] text-center">{name}</span>
      {earned && <span className="text-xs px-2 py-0.5 rounded-full bg-[#4bddb7]/20 text-[#4bddb7]">✓</span>}
    </div>
  );
}

// Deck Preview Card
function DeckPreviewCard({ name, cards, element }: {
  name: string; cards: number; element: string;
}) {
  const elementColors: Record<string, string> = {
    FIRE: '#ffb4ab',
    WATER: '#6c5ce7',
    GRASS: '#4bddb7',
    ELECTRIC: '#f0bf63',
    PSYCHIC: '#c6bfff',
    NORMAL: '#c8c4d7',
  };
  
  const col = elementColors[element] || colors.darkText;
  
  return (
    <div className="p-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: colors.cardBg }}>
      <div className="w-12 h-16 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: `${col}20` }}>
        {element === 'FIRE' ? '🔥' : element === 'WATER' ? '💧' : '⚡'}
      </div>
      <div className="flex-1">
        <span className="text-sm font-bold text-[#d8e4ea]">{name}</span>
        <p className="text-xs text-[#c8c4d7]">{cards} kartu</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c8c4d7" strokeWidth="2">
        <path d="M6 4l4 4-4 4" />
      </svg>
    </div>
  );
}

// Recent Battle Card
function RecentBattleCard({ opponent, result, score, time }: {
  opponent: string; result: 'WIN' | 'LOSE'; score: string; time: string;
}) {
  const isWin = result === 'WIN';
  
  return (
    <div className="p-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: colors.cardBg }}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
        isWin ? 'bg-[#4bddb7]/20' : 'bg-[#ff4b4b]/20'
      }`}>
        {isWin ? '🏆' : '💀'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#d8e4ea]">vs {opponent}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            isWin ? 'bg-[#4bddb7]/20 text-[#4bddb7]' : 'bg-[#ff4b4b]/20 text-[#ff4b4b]'
          }`}>
            {result}
          </span>
        </div>
        <p className="text-xs text-[#c8c4d7]">{score} • {time}</p>
      </div>
    </div>
  );
}

// Learning Progress Item
function LearningProgressItem({ module, progress, status }: {
  module: string; progress: number; status: 'completed' | 'learning' | 'locked';
}) {
  const statusConfig = {
    completed: { color: colors.teal, label: '✓ Selesai' },
    learning: { color: colors.brand, label: '● Belajar' },
    locked: { color: colors.darkGray, label: '🔒 Terkunci' },
  };
  
  const config = statusConfig[status];
  
  return (
    <div className="p-3 rounded-xl" style={{ backgroundColor: colors.cardBg }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-[#d8e4ea]">{module}</span>
        <span className="text-xs" style={{ color: config.color }}>{config.label}</span>
      </div>
      <div className="h-2 rounded-full bg-[#212c30] overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${progress}%`, backgroundColor: config.color }}
        />
      </div>
      <span className="text-xs text-[#c8c4d7] mt-1 block">{progress}%</span>
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
    { icon: '👤', label: 'Profile', route: '/profile', active: true },
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

export default function ProfilePage() {
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl text-center"
          style={{ backgroundColor: colors.cardBg }}
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-[#c6bfff] flex items-center justify-center text-3xl font-bold text-white mb-3">
            T
          </div>
          <h2 className="text-xl font-bold text-[#d8e4ea] mb-1">Tamago</h2>
          <p className="text-sm text-[#c8c4d7] mb-3">Ninja Pemula</p>
          
          {/* Level & XP */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: colors.inputBg }}>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: colors.brand, color: 'white' }}>Lv 7</span>
            <div className="h-2 w-24 rounded-full bg-[#212c30] overflow-hidden">
              <div className="h-full rounded-full bg-[#4bddb7]" style={{ width: '65%' }} />
            </div>
            <span className="text-xs text-[#c8c4d7]">1,250 XP</span>
          </div>
          
          {/* Member Since */}
          <p className="text-xs text-[#c8c4d7] mt-3">Anggota sejak Januari 2025</p>
        </motion.div>

        {/* Quick Stats */}
        <section>
          <h3 className="text-sm font-bold text-[#c8c4d7] mb-3 tracking-wider">STATISTIK</h3>
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon="⚔️" label="Battle" value="42" color={colors.coral} />
            <StatCard icon="📚" label="Kartu" value="87" color={colors.brand} />
            <StatCard icon="🏆" label="Menang" value="28" color={colors.gold} />
          </div>
        </section>

        {/* My Decks */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#c8c4d7] tracking-wider">DECK SAYA</h3>
            <button className="text-xs text-[#4bddb7] font-medium">+ Buat Baru</button>
          </div>
          <div className="space-y-2">
            <DeckPreviewCard name="Fire Storm" cards={20} element="FIRE" />
            <DeckPreviewCard name="Water Control" cards={20} element="WATER" />
          </div>
        </section>

        {/* Recent Battles */}
        <section>
          <h3 className="text-sm font-bold text-[#c8c4d7] mb-3 tracking-wider">BATTLE TERAKHIR</h3>
          <div className="space-y-2">
            <RecentBattleCard opponent="Sensei Bot" result="WIN" score="2-1" time="2 jam lalu" />
            <RecentBattleCard opponent="Ninja Bot" result="WIN" score="2-0" time="5 jam lalu" />
            <RecentBattleCard opponent="Samurai Bot" result="LOSE" score="0-2" time="Kemarin" />
          </div>
        </section>

        {/* Learning Progress */}
        <section>
          <h3 className="text-sm font-bold text-[#c8c4d7] mb-3 tracking-wider">PROGRESS BELAJAR</h3>
          <div className="space-y-2">
            <LearningProgressItem module="Hiragana" progress={100} status="completed" />
            <LearningProgressItem module="Katakana" progress={65} status="learning" />
            <LearningProgressItem module="Kanji N5" progress={0} status="locked" />
            <LearningProgressItem module="Kosakata" progress={0} status="locked" />
          </div>
        </section>

        {/* Achievements */}
        <section>
          <h3 className="text-sm font-bold text-[#c8c4d7] mb-3 tracking-wider">PENCAPAIAN</h3>
          <div className="grid grid-cols-4 gap-3">
            <AchievementBadge name="First Win" icon="🏆" earned={true} />
            <AchievementBadge name="Collector" icon="🃏" earned={true} />
            <AchievementBadge name="Scholar" icon="📚" earned={true} />
            <AchievementBadge name="Master" icon="👑" earned={false} />
            <AchievementBadge name="Streak 7" icon="🔥" earned={true} />
            <AchievementBadge name="Battle 50" icon="⚔️" earned={false} />
            <AchievementBadge name="Perfect" icon="⭐" earned={false} />
            <AchievementBadge name="Legend" icon="🌟" earned={false} />
          </div>
        </section>

        {/* Settings */}
        <section>
          <h3 className="text-sm font-bold text-[#c8c4d7] mb-3 tracking-wider">PENGATURAN</h3>
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: colors.cardBg }}>
            {[
              { icon: '🔔', label: 'Notifikasi' },
              { icon: '🌐', label: 'Bahasa' },
              { icon: '🎨', label: 'Tema' },
              { icon: '❓', label: 'Bantuan' },
              { icon: '🚪', label: 'Keluar', color: colors.coral },
            ].map((item, i) => (
              <button
                key={i}
                className="w-full px-4 py-3 flex items-center justify-between border-b border-[#212c30] last:border-b-0"
                style={{ borderBottomWidth: i < 4 ? '1px' : '0', borderColor: colors.inputBg }}
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span className="text-sm text-[#d8e4ea]" style={{ color: item.color || colors.lightText }}>{item.label}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c8c4d7" strokeWidth="2">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </button>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}