'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const colors = {
  background: '#0d0d1a',
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

// Action Button Component
function ActionButton({ icon, label, color, onClick, disabled }: {
  icon: string; label: string; color: string; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`h-14 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      style={{ backgroundColor: disabled ? colors.darkGray : color }}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-white text-sm">{label}</span>
    </motion.button>
  );
}

// Hand Card Component
function HandCard({ card, index, isSelected, onClick }: {
  card: any; index: number; isSelected: boolean; onClick?: () => void;
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
  
  const col = elementColors[card.element] || colors.darkText;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      onClick={onClick}
      className={`w-20 h-[112px] rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-white shadow-lg' : ''
      }`}
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="text-2xl font-bold mb-1" style={{ color: col }}>{card.symbol}</div>
      <span className="text-xs text-[#d8e4ea] mb-1">{card.name}</span>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[#ffb4ab]">{card.atk}⚔️</span>
        <span className="text-[#4bddb7]">{card.def}🛡️</span>
      </div>
    </motion.div>
  );
}

// Player Stats Bar
function PlayerStatsBar() {
  return (
    <div className="px-4 py-3 flex items-center gap-4" style={{ backgroundColor: '#162125' }}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: colors.brand }}>
        T
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-[#d8e4ea]">Tamago</span>
          <span className="text-xs text-[#4bddb7]">HP 85/100</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
          <motion.div
            initial={{ width: '85%' }}
            animate={{ width: '85%' }}
            className="h-full rounded-full"
            style={{ backgroundColor: colors.teal }}
          />
        </div>
      </div>
      <div className="text-right">
        <span className="text-xs text-[#c8c4d7]">Turn 3</span>
      </div>
    </div>
  );
}

// Battle Log
function BattleLog() {
  const logs = [
    { text: 'Kamu menyerang 25 damage!', color: colors.coral },
    { text: 'Musuh bertahan.', color: colors.darkText },
  ];
  
  return (
    <div className="px-4 py-2 flex items-center gap-3 overflow-hidden" style={{ backgroundColor: colors.cardBg }}>
      <div className="w-2 h-2 rounded-full bg-[#4bddb7]" />
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-4">
          {logs.map((log, i) => (
            <span key={i} className="text-xs whitespace-nowrap" style={{ color: log.color }}>
              {log.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Floating Damage Text
function FloatingDamage({ value, index }: { value: number; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: 1, y: -20, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute text-3xl font-bold text-[#ff4b4b]"
      style={{ left: '50%', top: '50%' }}
    >
      -{value}
    </motion.div>
  );
}

// Battlefield Card (Opponent/Player side)
function BattlefieldCard({ card, isPlayer, isActive }: {
  card: any; isPlayer: boolean; isActive: boolean;
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
  
  const col = elementColors[card.element] || colors.darkText;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative ${isPlayer ? 'border-t-4' : 'border-b-4'}`}
      style={{ 
        borderColor: isActive ? col : 'transparent',
        backgroundColor: `${colors.cardBg}99`
      }}
    >
      <div className="p-3 flex items-center gap-3">
        <div
          className="w-16 h-20 rounded-lg flex items-center justify-center text-2xl font-bold"
          style={{ backgroundColor: `${col}20` }}
        >
          {card.symbol}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-[#d8e4ea]">{isPlayer ? 'Kamu' : card.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${col}30`, color: col }}>
              {elementIcons[card.element]}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#ffb4ab]">⚔️ {card.atk}</span>
            <span className="text-[#4bddb7]">🛡️ {card.def}</span>
          </div>
          {/* HP Bar */}
          <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
            <div className="h-full rounded-full" style={{ width: `${card.hp}%`, backgroundColor: isPlayer ? colors.teal : colors.coral }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function BattleArenaPage() {
  const [selectedCard, setSelectedCard] = useState<number | null>(null);
  const [battlePhase, setBattlePhase] = useState<'select' | 'action' | 'result'>('select');
  const [showDamage, setShowDamage] = useState(false);
  const [log, setLog] = useState<string[]>(['Battle dimulai!', 'Pilih kartu untuk menyerang.']);
  const router = useRouter();

  // Player hand cards
  const playerCards = [
    { id: 0, name: 'Mizu', symbol: '💧', element: 'WATER', atk: 65, def: 30, hp: 85 },
    { id: 1, name: 'Hi', symbol: '🔥', element: 'FIRE', atk: 80, def: 20, hp: 70 },
    { id: 2, name: 'Ki', symbol: '🌱', element: 'GRASS', atk: 55, def: 25, hp: 90 },
    { id: 3, name: 'Kaze', symbol: '🌪️', element: 'WIND', atk: 60, def: 22, hp: 75 },
    { id: 4, name: 'Hikari', symbol: '✨', element: 'LIGHT', atk: 70, def: 28, hp: 80 },
  ];

  // Opponent card
  const opponentCard = { name: 'Sensei Bot', symbol: '🤖', element: 'PSYCHIC', atk: 55, def: 25, hp: 72 };

  const handleAction = (action: string) => {
    if (selectedCard === null) return;
    
    if (action === 'attack') {
      setShowDamage(true);
      setLog(prev => [...prev, `Kamu menyerang ${playerCards[selectedCard].atk} damage!`]);
      setTimeout(() => setShowDamage(false), 1000);
    } else if (action === 'defend') {
      setLog(prev => [...prev, 'Kamu bertahan dan meningkatkan pertahanan!']);
    } else if (action === 'study') {
      setLog(prev => [...prev, 'Kamu mempelajari kartu baru!']);
    }
  };

  const handleCardSelect = (index: number) => {
    setSelectedCard(index);
    setBattlePhase('action');
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: colors.background }}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#6c5ce7]/10 via-transparent to-[#ffb4ab]/10" />
      
      <main className="relative z-10 flex flex-col h-screen">
        {/* Player Stats */}
        <PlayerStatsBar />
        
        {/* Battlefield */}
        <div className="flex-1 px-4 py-4 space-y-3">
          {/* Opponent Card */}
          <BattlefieldCard card={opponentCard} isPlayer={false} isActive={false} />
          
          {/* VS Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px" style={{ backgroundColor: colors.darkGray }} />
            <div className="px-4 py-2 rounded-full" style={{ backgroundColor: colors.cardBg }}>
              <span className="text-sm font-bold text-[#c8c4d7]">VS</span>
            </div>
            <div className="flex-1 h-px" style={{ backgroundColor: colors.darkGray }} />
          </div>
          
          {/* Player Card */}
          {selectedCard !== null && (
            <BattlefieldCard card={playerCards[selectedCard]} isPlayer={true} isActive={true} />
          )}
          
          {/* Floating Damage */}
          <AnimatePresence>
            {showDamage && <FloatingDamage value={playerCards[selectedCard!]?.atk || 0} index={0} />}
          </AnimatePresence>
        </div>
        
        {/* Battle Log */}
        <BattleLog />
        
        {/* Action Grid */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              icon="⚔️"
              label="Serang"
              color={colors.coral}
              onClick={() => handleAction('attack')}
              disabled={selectedCard === null}
            />
            <ActionButton
              icon="🛡️"
              label="Bertahan"
              color={colors.teal}
              onClick={() => handleAction('defend')}
              disabled={selectedCard === null}
            />
            <ActionButton
              icon="📖"
              label="Pelajari"
              color={colors.brand}
              onClick={() => handleAction('study')}
              disabled={selectedCard === null}
            />
            <ActionButton
              icon="✨"
              label="Spesial"
              color={colors.gold}
              disabled={true}
            />
          </div>
        </div>
        
        {/* Player Hand */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {playerCards.map((card, i) => (
              <HandCard
                key={i}
                card={card}
                index={i}
                isSelected={selectedCard === i}
                onClick={() => handleCardSelect(i)}
              />
            ))}
            
            {/* Draw Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-12 h-[112px] rounded-xl flex items-center justify-center cursor-pointer"
              style={{ backgroundColor: colors.inputBg }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#c8c4d7" strokeWidth="2">
                <path d="M10 4v12M4 10h12" />
              </svg>
            </motion.div>
          </div>
        </div>
      </main>
      
      {/* Back Button */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="2">
          <path d="M12 4L6 10l6 6" />
        </svg>
      </button>
    </div>
  );
}