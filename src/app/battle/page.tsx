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

// Sample player cards
const playerCards = [
  { id: '1', name: 'Mizu', element: 'WATER', hp: 95, attack: 65, defense: 30 },
  { id: '2', name: 'Hi', element: 'FIRE', hp: 85, attack: 80, defense: 20 },
  { id: '3', name: 'Ki', element: 'GRASS', hp: 100, attack: 55, defense: 25 },
];

// Sample opponent
const opponent = {
  name: 'Sensei Bot',
  level: 1,
  hp: 100,
  maxHp: 100,
};

// Top App Bar
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
        <div>
          <span className="text-base font-medium text-[#c6bfff]">KanjiMon Battle</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${colors.teal}20`, color: colors.teal }}>
          ⚡ 150 XP
        </div>
        <button className="w-8 h-8 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c6bfff" strokeWidth="2">
            <circle cx="10" cy="10" r="3" />
            <path d="M10 1v3M10 16v3M1 10h3M16 10h3M3.5 3.5l2 2M14.5 14.5l2 2M3.5 16.5l2-2M14.5 3.5l2-2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Health Bar Component
function HealthBar({ current, max, color = colors.teal }: { current: number; max: number; color?: string }) {
  const percent = Math.max(0, Math.min(100, (current / max) * 100));
  
  return (
    <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.5 }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// Battle Card Component
function BattleCard({ card, isActive, onClick }: { card: typeof playerCards[0]; isActive: boolean; onClick?: () => void }) {
  const elementColors: Record<string, string> = {
    WATER: '#6c5ce7',
    FIRE: '#ffb4ab',
    GRASS: '#4bddb7',
    ELECTRIC: '#f0bf63',
  };
  
  const elementIcons: Record<string, string> = {
    WATER: '💧',
    FIRE: '🔥',
    GRASS: '🌱',
    ELECTRIC: '⚡',
  };
  
  const cardColor = elementColors[card.element] || colors.darkText;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative rounded-xl p-3 cursor-pointer transition-all ${
        isActive ? 'ring-2 ring-white shadow-lg' : 'opacity-80'
      }`}
      style={{ 
        backgroundColor: colors.cardBg,
        borderColor: cardColor,
      }}
    >
      {/* Element indicator */}
      <div
        className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs"
        style={{ backgroundColor: cardColor }}
      >
        {elementIcons[card.element]}
      </div>
      
      {/* Card visual */}
      <div className="w-full aspect-[3/4] flex flex-col items-center justify-center mb-2 rounded-lg" style={{ backgroundColor: `${cardColor}15` }}>
        <div className="text-2xl font-bold text-white">{card.name[0]}</div>
        <div className="text-xs text-[#c8c4d7]">{card.name}</div>
      </div>
      
      {/* Stats */}
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="text-[#ffb4ab] font-bold">{card.attack}</span>
          <span className="text-[#c8c4d7]/50 ml-0.5">ATK</span>
        </div>
        <div className="text-xs">
          <span className="text-[#4bddb7] font-bold">{card.defense}</span>
          <span className="text-[#c8c4d7]/50 ml-0.5">DEF</span>
        </div>
      </div>
      
      {/* HP Bar */}
      <div className="mt-2">
        <div className="flex items-center gap-1 mb-1">
          <span className="text-xs text-[#c8c4d7]">HP</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
            <div className="h-full rounded-full" style={{ width: `${(card.hp / 120) * 100}%`, backgroundColor: cardColor }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Action HUD
function ActionHUD() {
  return (
    <div className="fixed bottom-20 left-0 right-0 px-4 z-30">
      <div className="flex gap-3 max-w-md mx-auto">
        <button
          className="flex-1 h-14 rounded-xl font-bold text-white flex items-center justify-center gap-2"
          style={{ backgroundColor: colors.brand }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2">
            <path d="M10 2L18 10L10 18L2 10L10 2Z" />
          </svg>
          Lawan
        </button>
        <button
          className="flex-1 h-14 rounded-xl font-bold flex items-center justify-center gap-2"
          style={{ backgroundColor: colors.inputBg, color: colors.teal }}
        >
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke={colors.teal} strokeWidth="2">
            <path d="M8 18V8M8 8L4 12M8 8L12 12" />
            <path d="M4 4h8" />
          </svg>
          Pelajari
        </button>
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

export default function BattlePage() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [battlePhase, setBattlePhase] = useState<'select' | 'battle' | 'result'>('select');

  const handleAttack = () => {
    // Simple attack animation
    setBattlePhase('battle');
    setTimeout(() => {
      setBattlePhase('result');
    }, 1500);
  };

  return (
    <div className="min-h-screen pb-32 relative" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      {/* Battle Arena Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-[#6c5ce7]/20 via-transparent to-[#ffb4ab]/20" />
      </div>

      <main className="relative z-10 max-w-md mx-auto px-4 pt-4">
        {/* VS Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: colors.darkGray }} />
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.cardBg }}>
            <span className="text-xl font-bold text-[#c8c4d7]">VS</span>
          </div>
          <div className="flex-1 h-px" style={{ backgroundColor: colors.darkGray }} />
        </div>

        {/* Opponent Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl"
          style={{ backgroundColor: colors.cardBg }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: colors.brand }}
              >
                🤖
              </div>
              <div>
                <h3 className="font-bold text-[#d8e4ea]">{opponent.name}</h3>
                <p className="text-xs text-[#c8c4d7]">Level {opponent.level}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#ffb4ab]">{opponent.hp}</span>
              <span className="text-sm text-[#c8c4d7]"> / {opponent.maxHp}</span>
            </div>
          </div>
          <HealthBar current={opponent.hp} max={opponent.maxHp} color={colors.coral} />
        </motion.div>

        {/* Player Hand */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-[#c8c4d7] mb-3">Pilih Kartu</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {playerCards.map((card, i) => (
              <div key={card.id} className="flex-shrink-0 w-28">
                <BattleCard
                  card={card}
                  isActive={selectedCard === card.id}
                  onClick={() => setSelectedCard(card.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Battle Result Overlay */}
        {battlePhase === 'result' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 z-50"
          >
            <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
              <div className="text-5xl mb-3">🏆</div>
              <h2 className="text-2xl font-bold text-[#d8e4ea] mb-2">Kamu Menang!</h2>
              <p className="text-[#c8c4d7] mb-4">+50 XP • +3 Kartu</p>
              <button
                onClick={() => setBattlePhase('select')}
                className="px-6 py-3 rounded-xl font-bold text-white"
                style={{ backgroundColor: colors.brand }}
              >
                Lanjutkan
              </button>
            </div>
          </motion.div>
        )}
      </main>

      {/* Action HUD */}
      {selectedCard && battlePhase === 'select' && (
        <ActionHUD />
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}