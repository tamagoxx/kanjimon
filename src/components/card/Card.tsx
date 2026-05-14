'use client';

import { motion } from 'framer-motion';
import type { JapaneseCard, Element } from '@/types';

const ELEMENT_COLORS: Record<Element, string> = {
  FIRE: '#E17055',
  WATER: '#0984E3',
  GRASS: '#00B894',
  ELECTRIC: '#FDCB6E',
  PSYCHIC: '#A29BFE',
  NORMAL: '#B2BEC3',
};

const ELEMENT_ICONS: Record<Element, string> = {
  FIRE: '🔥',
  WATER: '💧',
  GRASS: '🌿',
  ELECTRIC: '⚡',
  PSYCHIC: '🔮',
  NORMAL: '⭐',
};

const RARITY_BORDER: Record<string, string> = {
  COMMON: '#B2BEC3',
  UNCOMMON: '#00B894',
  RARE: '#0984E3',
  ULTRA_RARE: '#FDCB6E',
};

interface CardProps {
  card: JapaneseCard;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showStats?: boolean;
  isFlipped?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  onFlip?: () => void;
}

export function Card({
  card,
  size = 'md',
  interactive = false,
  showStats = true,
  isSelected = false,
  isDisabled = false,
  onClick,
}: CardProps) {
  const sizeClasses = {
    sm: 'w-24 h-36 text-xs',
    md: 'w-32 h-44 text-sm',
    lg: 'w-40 h-56 text-base',
  };

  const borderColor = RARITY_BORDER[card.rarity];
  const elementColor = ELEMENT_COLORS[card.element];

  return (
    <motion.div
      whileHover={interactive ? { scale: 1.05 } : undefined}
      whileTap={interactive ? { scale: 0.95 } : undefined}
      onClick={interactive && !isDisabled ? onClick : undefined}
      className={`
        relative rounded-xl bg-gradient-to-br from-[#1A1A2E] to-[#2D2D44]
        border-2 overflow-hidden cursor-pointer
        transition-all duration-200
        ${sizeClasses[size]}
        ${isSelected ? 'ring-4 ring-[#FDCB6E] ring-offset-2 ring-offset-[#0F0F1A]' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${card.rarity === 'ULTRA_RARE' ? 'animate-pulse-glow' : ''}
      `}
      style={{
        borderColor,
        boxShadow: isSelected
          ? `0 0 20px ${borderColor}60`
          : `0 4px 20px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Element Badge */}
      <div
        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-sm z-10"
        style={{ backgroundColor: elementColor }}
      >
        {ELEMENT_ICONS[card.element]}
      </div>

      {/* Card Content */}
      <div className="h-full flex flex-col items-center justify-center p-2 text-center">
        {/* Japanese Character */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`font-bold text-white mb-0.5 ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl'}`}
        >
          {card.japanese}
        </motion.div>

        {/* Reading */}
        <div className="text-[#636E72] text-xs mb-1">
          {card.reading}
        </div>

        {/* Meaning */}
        <div className={`text-[#B2BEC3] ${size === 'lg' ? 'text-sm' : 'text-xs'} leading-tight`}>
          {card.meaning}
        </div>
      </div>

      {/* Stats Bar */}
      {showStats && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/40 px-2 py-1.5 flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="text-red-400 text-xs">❤️</span>
            <span className="text-white text-xs font-bold">{card.hp}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-orange-400 text-xs">⚔️</span>
            <span className="text-white text-xs font-bold">{card.attackPower}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-blue-400 text-xs">🛡️</span>
            <span className="text-white text-xs font-bold">{card.defenseRating}</span>
          </div>
        </div>
      )}

      {/* Rarity indicator */}
      <div
        className="absolute bottom-0 left-0 h-1 w-full"
        style={{
          background: `linear-gradient(to right, ${borderColor}, transparent)`,
        }}
      />

      {/* Type indicator */}
      <div className="absolute top-1.5 left-1.5">
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
          card.type === 'VERB' ? 'bg-red-500/30 text-red-300' :
          card.type === 'NOUN' ? 'bg-blue-500/30 text-blue-300' :
          card.type === 'ADJECTIVE' ? 'bg-green-500/30 text-green-300' :
          'bg-purple-500/30 text-purple-300'
        }`}>
          {card.type}
        </span>
      </div>
    </motion.div>
  );
}

interface CardBackProps {
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function CardBack({ size = 'md', onClick }: CardBackProps) {
  const sizeClasses = {
    sm: 'w-24 h-36',
    md: 'w-32 h-44',
    lg: 'w-40 h-56',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        ${sizeClasses[size]} rounded-xl
        bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE]
        border-2 border-[#6C5CE7] cursor-pointer
        flex items-center justify-center
        overflow-hidden
      `}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">🃏</div>
        <div className="text-white/60 text-xs">KanjiMon</div>
      </div>
      {/* Card pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`,
        }} />
      </div>
    </motion.div>
  );
}
