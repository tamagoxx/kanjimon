'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore, PokemonCard } from '@/store/collectionStore';
import { 
  Heart, Swords, Shield, Zap, X, ArrowLeft, Trophy, Skull, 
  Flame, Droplets, Leaf, Eye, Sparkles, Wind, CircleDot
} from 'lucide-react';

// ============================================================
// Types
// ============================================================
type CardStatus = 'normal' | 'burning' | 'paralyzed' | 'boosted' | 'defending';

interface BattleCard {
  id: string;
  name: string;
  element: 'FIRE' | 'WATER' | 'GRASS' | 'ELECTRIC' | 'PSYCHIC' | 'NORMAL';
  attack: number;
  defense: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  cost: number;
  status: CardStatus;
  image?: string;
}

interface BattleState {
  phase: 'select-opponent' | 'battle' | 'result';
  playerHand: BattleCard[];
  playerActiveCard: BattleCard | null;
  playerDeck: BattleCard[];
  playerDiscard: BattleCard[];
  opponentHand: BattleCard[];
  opponentActiveCard: BattleCard | null;
  opponentDeck: BattleCard[];
  opponentDiscard: BattleCard[];
  playerHp: number;
  opponentHp: number;
  turn: number;
  isPlayerTurn: boolean;
  energy: number;
  maxEnergy: number;
  comboCount: number;
  lastElement: string | null;
}

interface BattleLogEntry {
  id: string;
  text: string;
  type: 'damage' | 'heal' | 'status' | 'info' | 'combo' | 'faint';
  element?: string;
}

// ============================================================
// Constants
// ============================================================
const ELEMENT_COLORS: Record<string, string> = {
  FIRE: '#ff6b35',
  WATER: '#4facfe',
  GRASS: '#4bddb7',
  ELECTRIC: '#ffd93d',
  PSYCHIC: '#c77dff',
  NORMAL: '#a8a8a8',
};

const ELEMENT_ICONS: Record<string, any> = {
  FIRE: Flame,
  WATER: Droplets,
  GRASS: Leaf,
  ELECTRIC: CircleDot,
  PSYCHIC: Eye,
  NORMAL: Sparkles,
};

// Element effectiveness: key beats target
const EFFECTIVENESS: Record<string, string[]> = {
  FIRE: ['GRASS'],
  GRASS: ['WATER'],
  WATER: ['FIRE'],
  ELECTRIC: ['WATER'],
  PSYCHIC: ['NORMAL'],
  NORMAL: [],
};

const OPPONENTS = [
  { id: 'sensei', name: 'Sensei Bot', emoji: '👨‍🏫', atk: 25, def: 20, hp: 100, level: 1, strategy: 'balanced' },
  { id: 'ninja', name: 'Ninja Bot', emoji: '🥷', atk: 35, def: 15, hp: 80, level: 5, strategy: 'aggressive' },
  { id: 'samurai', name: 'Samurai Bot', emoji: '⚔️', atk: 20, def: 30, hp: 120, level: 10, strategy: 'defensive' },
  { id: 'shogun', name: 'Shogun Bot', emoji: '🛡️', atk: 30, def: 25, hp: 100, level: 20, strategy: 'smart' },
  { id: 'dragon', name: 'Dragon Bot', emoji: '🐉', atk: 45, def: 20, hp: 130, level: 35, strategy: 'boss' },
];

const ACTION_COSTS = { ATTACK: 1, STUDY: 1, DEFEND: 1, SPECIAL: 2 };

// ============================================================
// Helper Functions
// ============================================================
function getElementAdvantage(attacker: string, defender: string): number {
  if (EFFECTIVENESS[attacker]?.includes(defender)) return 2;
  if (EFFECTIVENESS[defender]?.includes(attacker)) return 0.5;
  return 1;
}

function getStatusEffectColor(status: CardStatus): string {
  switch (status) {
    case 'burning': return '#ff6b35';
    case 'paralyzed': return '#ffd93d';
    case 'boosted': return '#c77dff';
    case 'defending': return '#4facfe';
    default: return '#a8a8a8';
  }
}

function getStatusIcon(status: CardStatus): any {
  switch (status) {
    case 'burning': return Flame;
    case 'paralyzed': return Zap;
    case 'boosted': return Sparkles;
    case 'defending': return Shield;
    default: return null;
  }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createBattleCard(card: any, isPlayer: boolean): BattleCard {
  const maxHp = card.hp || 80;
  return {
    id: card.id || `${isPlayer ? 'p' : 'e'}-${Date.now()}-${Math.random()}`,
    name: card.name || card.japanese || 'Card',
    element: card.element || card.types?.[0]?.toUpperCase() || 'NORMAL',
    attack: card.attack || card.attackPower || 40,
    defense: card.defense || card.defenseRating || 15,
    hp: maxHp,
    maxHp,
    energy: isPlayer ? 3 : 3,
    maxEnergy: 3,
    cost: 1,
    status: 'normal',
    image: card.image || undefined,
  };
}

// ============================================================
// Damage Number Animation
// ============================================================
function DamageNumber({ value, type }: { value: number; type: 'damage' | 'heal' | 'combo' }) {
  const color = type === 'heal' ? '#4bddb7' : type === 'combo' ? '#ffd93d' : '#ff6b35';
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: 1, y: -40, scale: 1.2 }}
      exit={{ opacity: 0, y: -80, scale: 0.8 }}
      transition={{ duration: 0.8 }}
      className="absolute font-black text-3xl pointer-events-none"
      style={{ 
        left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        color, textShadow: `0 0 10px ${color}`
      }}
    >
      {type === 'heal' ? `+${value}` : `-${value}`}
    </motion.div>
  );
}

// ============================================================
// Status Badge
// ============================================================
function StatusBadge({ status }: { status: CardStatus }) {
  if (status === 'normal') return null;
  const Icon = getStatusIcon(status);
  const color = getStatusEffectColor(status);
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
      style={{ backgroundColor: color }}
    >
      {Icon && <Icon className="w-3 h-3 text-white" />}
    </motion.div>
  );
}

// ============================================================
// Card in Hand (mini)
// ============================================================
function HandCardMini({ card, index, isSelected, onClick }: {
  card: BattleCard; index: number; isSelected: boolean; onClick: () => void;
}) {
  const col = ELEMENT_COLORS[card.element];
  const ElementIcon = ELEMENT_ICONS[card.element];
  const hpPercent = card.hp / card.maxHp;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -12, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative w-20 h-[116px] rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
        isSelected ? 'ring-2 ring-white shadow-2xl shadow-white/20' : ''
      }`}
      style={{ 
        background: `linear-gradient(135deg, #1a1a2e 0%, ${col}22 100%)`,
        border: `2px solid ${isSelected ? '#fff' : col + '60'}`,
      }}
    >
      <StatusBadge status={card.status} />
      
      {/* Energy Cost */}
      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">{card.cost}</span>
      </div>

      {/* Card Art */}
      <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: col + '20' }}>
        {card.image ? (
          <img src={card.image} alt={card.name} className="w-10 h-10 object-contain" />
        ) : card.element === 'NORMAL' ? (
          <span className="text-2xl">📝</span>
        ) : (
          ElementIcon && <ElementIcon className="w-6 h-6" style={{ color: col }} />
        )}
      </div>

      {/* Name */}
      <span className="text-[10px] text-white/70 capitalize mt-1 truncate w-full text-center">{card.name}</span>

      {/* HP Bar */}
      <div className="w-full mt-1 h-1.5 rounded-full bg-black/40 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${hpPercent * 100}%` }}
          style={{ backgroundColor: hpPercent > 0.5 ? '#4bddb7' : hpPercent > 0.25 ? '#ffd93d' : '#ff6b35' }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-1 text-[9px] mt-0.5">
        <span className="text-red-400 font-bold">{card.attack}</span>
        <span className="text-blue-400 font-bold">{card.defense}</span>
      </div>
    </motion.div>
  );
}

// ============================================================
// Active Card Display
// ============================================================
function ActiveCardDisplay({ card, isPlayer, damage, showDamage }: {
  card: BattleCard; isPlayer: boolean; damage?: number; showDamage?: boolean;
}) {
  const col = ELEMENT_COLORS[card.element];
  const ElementIcon = ELEMENT_ICONS[card.element];
  const hpPercent = card.hp / card.maxHp;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative ${isPlayer ? 'border-t-4' : 'border-b-4'}`}
      style={{ 
        borderColor: col,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
      }}
    >
      <AnimatePresence>
        {showDamage && damage !== undefined && (
          <DamageNumber value={damage} type="damage" />
        )}
      </AnimatePresence>

      <div className="p-3 flex items-center gap-3">
        {/* Card Art */}
        <div className="w-16 h-20 rounded-xl flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: col + '25' }}>
          {card.image ? (
            <img src={card.image} alt={card.name} className="w-14 h-14 object-contain" />
          ) : (
            <div className="flex flex-col items-center">
              {ElementIcon && <ElementIcon className="w-8 h-8 mb-1" style={{ color: col }} />}
            </div>
          )}
          <StatusBadge status={card.status} />
        </div>

        {/* Card Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-white capitalize">{card.name}</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: col + '30', color: col }}>
                {card.element}
              </span>
              {card.status !== 'normal' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full" 
                  style={{ backgroundColor: getStatusEffectColor(card.status) + '30', color: getStatusEffectColor(card.status) }}>
                  {card.status}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-red-400 flex items-center gap-1">
              <Swords className="w-3 h-3" /> {card.attack}
            </span>
            <span className="text-blue-400 flex items-center gap-1">
              <Shield className="w-3 h-3" /> {card.defense}
            </span>
            <span className="text-green-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> {card.energy}/{card.maxEnergy}
            </span>
          </div>

          {/* HP Bar */}
          <div className="mt-2 h-2 rounded-full overflow-hidden bg-black/50">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${hpPercent * 100}%` }}
              style={{ backgroundColor: hpPercent > 0.5 ? '#4bddb7' : hpPercent > 0.25 ? '#ffd93d' : '#ff6b35' }}
            />
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[10px] text-white/40">
              {card.hp}/{card.maxHp} HP
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Opponent Select Modal
// ============================================================
function OpponentSelectModal({ onSelect, onClose }: { 
  onSelect: (opp: typeof OPPONENTS[0]) => void; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm mx-4 rounded-3xl overflow-hidden"
        style={{ background: '#0f1923', borderTop: '3px solid #6c5ce7' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-black text-white text-center mb-1">🎯 Pilih Lawan</h2>
          <p className="text-xs text-white/40 text-center mb-4">Pilih opponent untuk battle</p>
          <div className="space-y-3">
            {OPPONENTS.map((opp, i) => (
              <button
                key={i}
                onClick={() => onSelect(opp)}
                className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
                style={{ backgroundColor: '#1a1a2e' }}
              >
                <span className="text-4xl">{opp.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-bold text-white">{opp.name}</p>
                  <p className="text-xs text-white/40">
                    Level {opp.level} • HP {opp.hp} • ATK {opp.atk} • DEF {opp.def}
                  </p>
                </div>
                <div className="text-[#6c5ce7]">
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="w-full py-4 border-t border-white/10 text-white/40 text-sm font-bold">
          Batal
        </button>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Result Modal
// ============================================================
function ResultModal({ win, xpGained, streak, onClose }: { 
  win: boolean; xpGained: number; streak: number; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5 }} animate={{ scale: 1 }}
        className="text-center p-8"
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1.5 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-7xl mb-4"
        >
          {win ? '🏆' : '💀'}
        </motion.div>
        <h2 className="text-3xl font-black text-white mb-2">{win ? 'VICTORY!' : 'DEFEAT'}</h2>
        {win ? (
          <>
            <p className="text-white/60 mb-1">Kamu menang! +{xpGained} XP</p>
            {streak > 1 && (
              <p className="text-yellow-400 text-sm">🔥 {streak} win streak!</p>
            )}
          </>
        ) : (
          <p className="text-white/60 mb-4">Jangan menyerah! Coba lagi.</p>
        )}
        <button
          onClick={onClose}
          className="mt-6 px-8 py-3 rounded-2xl bg-[#6c5ce7] text-white font-bold active:scale-95"
        >
          Lanjutkan
        </button>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Study Question Modal
// ============================================================
function StudyModal({ question, onAnswer }: {
  question: { question: string; options: string[]; correctAnswer: string };
  onAnswer: (correct: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📚</div>
          <h3 className="text-xl font-bold text-white mb-2">Study Time!</h3>
          <p className="text-lg text-white">{question.question}</p>
        </div>

        <div className="space-y-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => onAnswer(option === question.correctAnswer)}
              className="w-full p-4 bg-[#2d2d44] hover:bg-[#6c5ce7] rounded-xl text-white text-left transition-colors"
            >
              <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
              {option}
            </button>
          ))}
        </div>

        <div className="mt-4 text-center text-xs text-white/40">
          Answer correctly to boost your card's power!
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Type Advantage Indicator
// ============================================================
function TypeAdvantageIndicator({ advantage }: { advantage: 'super' | 'weak' | 'neutral' }) {
  if (advantage === 'neutral') return null;
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-full text-xs font-bold"
      style={{ 
        backgroundColor: advantage === 'super' ? '#4bddb7' : '#ff6b35',
        color: '#fff'
      }}
    >
      {advantage === 'super' ? 'SUPER EFFECTIVE!' : 'NOT VERY EFFECTIVE'}
    </motion.div>
  );
}

// ============================================================
// Main Battle Arena Page
// ============================================================
export default function BattleArenaPage() {
  const router = useRouter();
  const { ownedPokemon, addCoins } = useCollectionStore();

  // Game state
  const [phase, setPhase] = useState<'select-opponent' | 'battle' | 'result'>('select-opponent');
  const [selectedOpponent, setSelectedOpponent] = useState<typeof OPPONENTS[0] | null>(null);
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(0);
  const [maxOpponentHp, setMaxOpponentHp] = useState(0);
  const [playerHand, setPlayerHand] = useState<BattleCard[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [activeCard, setActiveCard] = useState<BattleCard | null>(null);
  const [opponentActiveCard, setOpponentActiveCard] = useState<BattleCard | null>(null);
  const [turn, setTurn] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [energy, setEnergy] = useState(3);
  const [maxEnergy] = useState(3);
  const [comboCount, setComboCount] = useState(0);
  const [lastElement, setLastElement] = useState<string | null>(null);
  const [battleLog, setBattleLog] = useState<BattleLogEntry[]>([]);
  const [showDamage, setShowDamage] = useState(false);
  const [damageValue, setDamageValue] = useState(0);
  const [opponentDamage, setOpponentDamage] = useState(false);
  const [showStudy, setShowStudy] = useState(false);
  const [studyQuestion, setStudyQuestion] = useState<{ question: string; options: string[]; correctAnswer: string } | null>(null);
  const [result, setResult] = useState<{ win: boolean; xpGained: number } | null>(null);
  const [winStreak, setWinStreak] = useState(0);
  const [turnTransitioning, setTurnTransitioning] = useState(false);

  const logIdRef = useRef(0);
  const addLog = useCallback((text: string, type: BattleLogEntry['type'], element?: string) => {
    const id = `log-${logIdRef.current++}`;
    setBattleLog(prev => [...prev.slice(-4), { id, text, type, element }]);
  }, []);

  // Initialize player hand
  useEffect(() => {
    if (ownedPokemon.length >= 3) {
      const cards = ownedPokemon.slice(0, 5).map(p => createBattleCard(p, true));
      setPlayerHand(cards);
    } else {
      const demoCards = [
        { id: 'demo-1', name: 'Mizu', element: 'WATER', attack: 55, defense: 30, hp: 90, image: '' },
        { id: 'demo-2', name: 'Hi', element: 'FIRE', attack: 70, defense: 20, hp: 75, image: '' },
        { id: 'demo-3', name: 'Ki', element: 'GRASS', attack: 50, defense: 25, hp: 95, image: '' },
        { id: 'demo-4', name: 'Kaze', element: 'ELECTRIC', attack: 60, defense: 22, hp: 80, image: '' },
        { id: 'demo-5', name: 'Hikari', element: 'PSYCHIC', attack: 65, defense: 28, hp: 85, image: '' },
      ];
      setPlayerHand(demoCards.map(c => createBattleCard(c, true)));
    }
  }, [ownedPokemon]);

  // Start battle
  const startBattle = useCallback((opponent: typeof OPPONENTS[0]) => {
    setSelectedOpponent(opponent);
    setOpponentHp(opponent.hp);
    setMaxOpponentHp(opponent.hp);
    setPlayerHp(100);
    setSelectedCardIndex(null);
    setActiveCard(null);
    setTurn(1);
    setIsPlayerTurn(true);
    setEnergy(3);
    setComboCount(0);
    setLastElement(null);
    setBattleLog([]);
    addLog(`⚔️ Battle dimulai melawan ${opponent.name}!`, 'info');
    addLog('🎯 Pilih kartu dari tanganmu untuk bertarung.', 'info');
    setPhase('battle');
  }, [addLog]);

  // Generate study question
  const generateStudyQuestion = (card: BattleCard) => {
    const meanings = ['makan', 'minum', 'pergi', 'lihat', 'dengar', 'belajar', 'bekerja', 'bermain', 'tidur', 'bangun'];
    const wrong = meanings.filter(m => m !== card.name.toLowerCase()).slice(0, 3);
    const options = shuffle([...wrong, card.name.toLowerCase()]);
    return {
      question: `Apa arti dari "${card.name}"?`,
      options,
      correctAnswer: card.name.toLowerCase(),
    };
  };

  // Play card (select from hand)
  const playCard = useCallback((index: number) => {
    if (!isPlayerTurn || turnTransitioning) return;
    
    const card = playerHand[index];
    if (!card || card.hp <= 0) return;
    if (energy < card.cost) {
      addLog(`⚡ Tidak cukup energy! Butuh ${card.cost}, punya ${energy}`, 'info');
      return;
    }

    // Select card as active
    setSelectedCardIndex(index);
    setActiveCard({ ...card, energy, maxEnergy: card.maxEnergy });
    addLog(`🃏 Kamu memilih ${card.name} (${card.element})`, 'info');
  }, [isPlayerTurn, turnTransitioning, playerHand, energy, addLog]);

  // Handle attack
  const handleAttack = useCallback(() => {
    if (!activeCard || !isPlayerTurn || turnTransitioning) return;
    if (energy < activeCard.cost) {
      addLog(`⚡ Tidak cukup energy!`, 'info');
      return;
    }

    // Consume energy
    setEnergy(prev => prev - activeCard.cost);

    // Calculate damage
    let damage = activeCard.attack;
    
    // Element advantage
    let advantage: 'super' | 'weak' | 'neutral' = 'neutral';
    if (selectedOpponent) {
      const eff = getElementAdvantage(activeCard.element, opponentActiveCard?.element || 'NORMAL');
      if (eff > 1) { advantage = 'super'; damage = Math.floor(damage * eff); }
      else if (eff < 1) { advantage = 'weak'; damage = Math.floor(damage * eff); }
    }

    // Combo bonus
    if (lastElement === activeCard.element) {
      const comboBonus = Math.floor(damage * 0.25 * comboCount);
      damage += comboBonus;
      addLog(`🔥 Combo ${comboCount + 1}x! +${comboBonus} damage`, 'combo', activeCard.element);
    }

    // Defense reduction
    if (opponentActiveCard) {
      damage = Math.max(5, damage - opponentActiveCard.defense);
    }

    // Apply damage to opponent active card or opponent HP directly
    let newOppCardHp = opponentActiveCard?.hp ?? 0;
    let newOppHp = opponentHp;
    
    if (opponentActiveCard) {
      newOppCardHp = Math.max(0, opponentActiveCard.hp - damage);
      if (newOppCardHp <= 0) {
        addLog(`💀 ${opponentActiveCard.name} sudah fainted!`, 'faint');
      }
    } else {
      newOppHp = Math.max(0, opponentHp - damage);
    }

    setDamageValue(damage);
    setShowDamage(true);

    // Status effect
    const appliedStatus = Math.random() < 0.2 && activeCard.status === 'normal' ? 'burning' : null;

    setTimeout(() => {
      setShowDamage(false);
      setOpponentDamage(false);

      if (advantage === 'super') addLog(`✨ SUPER EFFECTIVE! -${damage}`, 'damage', activeCard.element);
      else addLog(`⚔️ ${activeCard.name} menyerang -${damage} damage!`, 'damage', activeCard.element);

      // Update combo
      if (lastElement === activeCard.element) {
        setComboCount(prev => prev + 1);
      } else {
        setComboCount(1);
        setLastElement(activeCard.element);
      }

      // Check win condition
      if (newOppCardHp <= 0 || newOppHp <= 0) {
        const xpGained = 10 + (selectedOpponent?.level || 1) * 5;
        addCoins(xpGained);
        setResult({ win: true, xpGained });
        addLog(`🏆 VICTORY! +${xpGained} XP`, 'info');
        setPhase('result');
      } else {
        // Transition to opponent turn
        setTurnTransitioning(true);
        setTimeout(() => {
          setIsPlayerTurn(false);
          setTurnTransitioning(false);
          // Remove used card from hand
          if (selectedCardIndex !== null) {
            const newHand = [...playerHand];
            if (newOppCardHp <= 0 && opponentActiveCard) {
              // Card that attacked fainted too
            }
            const cardIdx = newHand.findIndex(c => c.id === activeCard?.id);
            if (cardIdx !== -1) {
              newHand.splice(cardIdx, 1);
            }
            setPlayerHand(newHand);
          }
          setActiveCard(null);
          setSelectedCardIndex(null);
          
          // Opponent turn
          setTimeout(() => doOpponentTurn(), 500);
        }, 500);
      }
    }, 600);
  }, [activeCard, isPlayerTurn, turnTransitioning, energy, opponentActiveCard, opponentHp, selectedOpponent, lastElement, comboCount, selectedCardIndex, playerHand, addLog, addCoins]);

  // Opponent AI turn
  const doOpponentTurn = useCallback(() => {
    if (!selectedOpponent || phase !== 'battle') return;

    // Regenerate energy
    const newEnergy = 3;
    
    // Simple AI decision
    const rand = Math.random();
    let action = 'attack';
    if (rand < 0.2) action = 'defend';
    else if (rand < 0.35 && activeCard) action = 'study';

    // Pick a card from opponent hand (use opponentActiveCard if exists)
    if (!opponentActiveCard) {
      // No active card - pick one from hand
      const oppCard = createBattleCard({
        id: `opp-${Date.now()}`,
        name: selectedOpponent.name,
        element: 'NORMAL',
        attack: selectedOpponent.atk,
        defense: selectedOpponent.def,
        hp: selectedOpponent.hp,
      }, false);
      setOpponentActiveCard(oppCard);
      addLog(`🤖 ${selectedOpponent.name} memunculkan ${oppCard.name}!`, 'info');
      setTimeout(() => doOpponentTurn(), 1000);
      return;
    }

    if (action === 'attack') {
      // Calculate AI damage
      let damage = selectedOpponent.atk - (activeCard?.defense || 0);
      damage = Math.max(5, damage + Math.floor(Math.random() * 10 - 3));

      // Element advantage for AI
      let eff = 1;
      if (activeCard && opponentActiveCard) {
        eff = getElementAdvantage(opponentActiveCard.element, activeCard.element);
        if (eff > 1) damage = Math.floor(damage * eff);
        else if (eff < 1) damage = Math.floor(damage * eff);
      }

      setOpponentDamage(true);
      setDamageValue(damage);

      setTimeout(() => {
        setOpponentDamage(false);
        
        if (activeCard) {
          const newHp = Math.max(0, activeCard.hp - damage);
          
          if (eff > 1) addLog(`✨ SUPER EFFECTIVE! -${damage}`, 'damage', opponentActiveCard.element);
          else addLog(`💥 ${selectedOpponent.name} menyerang -${damage} damage!`, 'damage');
          
          if (newHp <= 0) {
            addLog(`💀 ${activeCard.name} sudah fainted!`, 'faint');
            // Remove fainted card
            setPlayerHand(prev => prev.filter(c => c.id !== activeCard.id));
            setActiveCard(null);
            setSelectedCardIndex(null);
          } else {
            setActiveCard({ ...activeCard, hp: newHp });
          }

          const newPlayerHp = Math.max(0, playerHp - damage);
          setPlayerHp(newPlayerHp);

          if (newPlayerHp <= 0) {
            setWinStreak(0);
            setResult({ win: false, xpGained: 0 });
            addLog(`💀 DEFEAT!`, 'info');
            setPhase('result');
          } else {
            // Back to player turn
            setTimeout(() => {
              setTurn(prev => prev + 1);
              setIsPlayerTurn(true);
              setEnergy(3);
              addLog(`🎯 Giliran ${turn + 1}. Pilih kartu!`, 'info');
            }, 800);
          }
        }
      }, 600);
    } else if (action === 'defend') {
      addLog(`🛡️ ${selectedOpponent.name} bertahan!`, 'status');
      setTimeout(() => {
        setTurn(prev => prev + 1);
        setIsPlayerTurn(true);
        setEnergy(3);
        addLog(`🎯 Giliran ${turn + 1}. energy di-reset!`, 'info');
      }, 800);
    } else if (action === 'study' && opponentActiveCard) {
      const q = generateStudyQuestion(opponentActiveCard);
      setStudyQuestion(q);
      setShowStudy(true);
      return; // Will handle turn transition after answer
    }
  }, [selectedOpponent, phase, activeCard, opponentActiveCard, turn, playerHp, addLog]);

  // Answer study question (AI)
  const answerStudy = useCallback((correct: boolean) => {
    setShowStudy(false);
    
    if (correct && opponentActiveCard) {
      const boosted: BattleCard = { 
        ...opponentActiveCard, 
        attack: Math.floor(opponentActiveCard.attack * 1.3),
        status: 'boosted' 
      };
      setOpponentActiveCard(boosted);
      addLog(`✨ ${selectedOpponent?.name} menjawab benar! +30% ATK!`, 'status');
    }

    setTimeout(() => {
      setTurn(prev => prev + 1);
      setIsPlayerTurn(true);
      setEnergy(3);
      addLog(`🎯 Giliran ${turn + 1}.`, 'info');
    }, 500);
  }, [opponentActiveCard, selectedOpponent, addLog, turn]);

  // Handle defend
  const handleDefend = useCallback(() => {
    if (!isPlayerTurn || turnTransitioning) return;
    
    setEnergy(0); // Use all energy for defense
    addLog(`🛡️ Kamu bertahan! Damage dikurangi + defense bonus.`, 'status');
    
    setTimeout(() => {
      setIsPlayerTurn(false);
      setTimeout(() => doOpponentTurn(), 500);
    }, 500);
  }, [isPlayerTurn, turnTransitioning, doOpponentTurn, addLog]);

  // Handle study
  const handleStudy = useCallback(() => {
    if (!activeCard || !isPlayerTurn || turnTransitioning) return;
    
    const q = generateStudyQuestion(activeCard);
    setStudyQuestion(q);
    setShowStudy(true);
  }, [activeCard, isPlayerTurn, turnTransitioning]);

  // Answer study (player)
  const answerPlayerStudy = useCallback((correct: boolean) => {
    setShowStudy(false);
    setEnergy(prev => prev - 1);
    
    if (correct && activeCard) {
      const boosted: BattleCard = { 
        ...activeCard, 
        attack: Math.floor(activeCard.attack * 1.3),
        status: 'boosted' 
      };
      setActiveCard(boosted);
      setPlayerHand(prev => prev.map(c => c.id === activeCard.id ? boosted : c));
      addLog(`✨ Jawaban benar! +30% ATK untuk ${activeCard.name}!`, 'status');
    } else if (activeCard) {
      addLog(`❌ Salah! Jawaban: ${studyQuestion?.correctAnswer}`, 'info');
    }

    setTimeout(() => {
      setIsPlayerTurn(false);
      setTimeout(() => doOpponentTurn(), 500);
    }, 1000);
  }, [activeCard, studyQuestion, addLog, doOpponentTurn]);

  // Go back
  const handleBack = () => {
    if (phase === 'battle') {
      setPhase('select-opponent');
      setSelectedOpponent(null);
      setActiveCard(null);
      setOpponentActiveCard(null);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0d0d1a' }}>
      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-orange-900/10" />
      
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      {/* Opponent Select */}
      <AnimatePresence>
        {phase === 'select-opponent' && (
          <OpponentSelectModal
            onSelect={startBattle}
            onClose={() => router.push('/')}
          />
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {result && (
          <ResultModal
            win={result.win}
            xpGained={result.xpGained}
            streak={winStreak}
            onClose={() => {
              setResult(null);
              setPhase('select-opponent');
              setSelectedOpponent(null);
              setActiveCard(null);
              setOpponentActiveCard(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Study Modal */}
      <AnimatePresence>
        {showStudy && studyQuestion && (
          <StudyModal
            question={studyQuestion}
            onAnswer={isPlayerTurn ? answerPlayerStudy : answerStudy}
          />
        )}
      </AnimatePresence>

      <main className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#162125' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">⚔️ Battle</span>
            {selectedOpponent && (
              <span className="text-sm text-white/40">vs {selectedOpponent.name}</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs">
              <span className="text-white/40">Turn:</span>
              <span className="text-white ml-1 font-bold">{turn}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              isPlayerTurn ? 'bg-[#4bddb7] text-black' : 'bg-[#ff6b35] text-white'
            }`}>
              {isPlayerTurn ? 'Your Turn' : selectedOpponent?.name}
            </div>
          </div>
        </div>

        {/* Energy Bar */}
        <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: '#1a1a2e' }}>
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-white/60">Energy:</span>
          <div className="flex-1 flex gap-1">
            {[...Array(maxEnergy)].map((_, i) => (
              <div
                key={i}
                className="h-2 flex-1 rounded-full transition-all"
                style={{ 
                  backgroundColor: i < energy ? '#ffd93d' : 'rgba(255,255,255,0.1)'
                }}
              />
            ))}
          </div>
          <span className="text-xs font-bold" style={{ color: '#ffd93d' }}>{energy}/{maxEnergy}</span>
          {comboCount > 1 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#ff6b35', color: '#fff' }}>
              🔥 {comboCount}x
            </span>
          )}
        </div>

        {/* Battlefield */}
        <div className="flex-1 px-4 py-4 space-y-3 overflow-hidden">
          {/* Opponent Active Card */}
          {opponentActiveCard && (
            <ActiveCardDisplay 
              card={opponentActiveCard} 
              isPlayer={false}
              damage={opponentDamage ? damageValue : undefined}
              showDamage={opponentDamage}
            />
          )}

          {/* VS Divider */}
          {selectedOpponent && (
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-white/10" />
              <div className="px-4 py-2 rounded-full bg-white/5">
                <span className="text-sm font-bold text-white/40">VS</span>
              </div>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          )}

          {/* Player Active Card */}
          {activeCard && (
            <ActiveCardDisplay 
              card={activeCard} 
              isPlayer={true}
              damage={showDamage ? damageValue : undefined}
              showDamage={showDamage}
            />
          )}

          {/* Opponent Info Bar */}
          {selectedOpponent && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl" style={{ backgroundColor: '#1a1a2e' }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedOpponent.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-white">{selectedOpponent.name}</p>
                  <p className="text-xs text-white/40">Level {selectedOpponent.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-white/40">HP</p>
                  <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: `${(opponentHp / maxOpponentHp) * 100}%` }}
                      style={{ backgroundColor: opponentHp / maxOpponentHp > 0.5 ? '#4bddb7' : opponentHp / maxOpponentHp > 0.25 ? '#ffd93d' : '#ff6b35' }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-white">{opponentHp}/{maxOpponentHp}</span>
              </div>
            </div>
          )}

          {/* Player HP */}
          {selectedOpponent && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl" style={{ backgroundColor: '#1a1a2e' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: '#6c5ce7' }}>
                  T
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Tamago</p>
                  <p className="text-xs text-white/40">{ownedPokemon.length} Pokemon</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-white/40">HP</p>
                  <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
                    <motion.div
                      className="h-full rounded-full"
                      animate={{ width: `${playerHp}%` }}
                      style={{ backgroundColor: '#4bddb7' }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold text-white">{playerHp}/100</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!selectedOpponent && phase !== 'select-opponent' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <span className="text-6xl">⚔️</span>
              <p className="text-white/40 text-center">Pilih opponent untuk memulai battle</p>
            </div>
          )}
        </div>

        {/* Battle Log */}
        {battleLog.length > 0 && (
          <div className="px-4 py-2 flex items-center gap-3 overflow-hidden" style={{ backgroundColor: '#1a1a2e' }}>
            <div className="w-2 h-2 rounded-full bg-[#4bddb7] animate-pulse" />
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-4">
                {battleLog.slice(-3).map((log) => (
                  <span key={log.id} className="text-xs text-white/60 whitespace-nowrap">{log.text}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Player Hand */}
        {phase === 'battle' && (
          <div className="px-4 pb-4 pt-2" style={{ backgroundColor: '#0f1923' }}>
            <div className="text-xs text-white/40 mb-2">Your Hand ({playerHand.length})</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {playerHand.map((card, i) => (
                <HandCardMini
                  key={card.id}
                  card={card}
                  index={i}
                  isSelected={selectedCardIndex === i}
                  onClick={() => playCard(i)}
                />
              ))}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button
                onClick={handleAttack}
                disabled={!activeCard || !isPlayerTurn || turnTransitioning}
                className="h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-sm bg-[#ff6b35] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Swords className="w-4 h-4" /> Attack
              </button>
              <button
                onClick={handleStudy}
                disabled={!isPlayerTurn || turnTransitioning}
                className="h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-sm bg-[#6c5ce7] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                📚 Study
              </button>
              <button
                onClick={handleDefend}
                disabled={!isPlayerTurn || turnTransitioning}
                className="h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-sm bg-[#4facfe] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Shield className="w-4 h-4" /> Defend
              </button>
            </div>

            {!activeCard && isPlayerTurn && (
              <p className="text-xs text-center text-white/40 mt-2">
                💡 Klik kartu di tanganmu untuk memilih, lalu tekan action!
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}