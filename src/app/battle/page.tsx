'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCollectionStore, PokemonCard } from '@/store/collectionStore';
import { useAuthStore } from '@/store/authStore';
import { Swords, Shield, ArrowLeft, Zap, Flame, Droplets, Leaf, Eye, Sparkles, CircleDot } from 'lucide-react';
import JankenGame from '@/components/battle/JankenGame';

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
  cost: number;
  status: CardStatus;
  image?: string;
}

type Phase = 'select-opponent' | 'intro' | 'battle' | 'result';

// ============================================================
// Constants
// ============================================================
const ELEMENT_COLORS: Record<string, string> = {
  FIRE: '#ff6b35', WATER: '#4facfe', GRASS: '#4bddb7',
  ELECTRIC: '#ffd93d', PSYCHIC: '#c77dff', NORMAL: '#a8a8a8',
};

const ELEMENT_ICONS: Record<string, any> = {
  FIRE: Flame, WATER: Droplets, GRASS: Leaf,
  ELECTRIC: CircleDot, PSYCHIC: Eye, NORMAL: Sparkles,
};

const EFFECTIVENESS: Record<string, string[]> = {
  FIRE: ['GRASS'], GRASS: ['WATER'], WATER: ['FIRE'],
  ELECTRIC: ['WATER'], PSYCHIC: ['NORMAL'], NORMAL: [],
};

const OPPONENTS = [
  { id: 'sensei', name: 'Sensei Bot', emoji: '👨‍🏫', atk: 25, def: 15, hp: 100, level: 1, strategy: 'balanced' },
  { id: 'ninja', name: 'Ninja Bot', emoji: '🥷', atk: 40, def: 10, hp: 80, level: 5, strategy: 'aggressive' },
  { id: 'samurai', name: 'Samurai Bot', emoji: '⚔️', atk: 20, def: 25, hp: 120, level: 10, strategy: 'defensive' },
  { id: 'shogun', name: 'Shogun Bot', emoji: '🛡️', atk: 35, def: 20, hp: 100, level: 20, strategy: 'smart' },
  { id: 'dragon', name: 'Dragon Bot', emoji: '🐉', atk: 55, def: 15, hp: 130, level: 35, strategy: 'boss' },
];

// ============================================================
// Utilities
// ============================================================
function getElementAdvantage(attacker: string, defender: string): number {
  if (EFFECTIVENESS[attacker]?.includes(defender)) return 2;
  if (EFFECTIVENESS[defender]?.includes(attacker)) return 0.5;
  return 1;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function useDemoDeck(setHand: (cards: BattleCard[]) => void) {
  const demo = [
    { id: 'd1', name: 'Mizu', element: 'WATER', attack: 55, defense: 20, hp: 85 },
    { id: 'd2', name: 'Hi', element: 'FIRE', attack: 70, defense: 15, hp: 75 },
    { id: 'd3', name: 'Ki', element: 'GRASS', attack: 50, defense: 25, hp: 90 },
    { id: 'd4', name: 'Kaze', element: 'ELECTRIC', attack: 60, defense: 18, hp: 80 },
    { id: 'd5', name: 'Hikari', element: 'PSYCHIC', attack: 65, defense: 22, hp: 85 },
  ];
  setHand(demo.map(d => createBattleCard(d, true)));
}

function createBattleCard(card: any, isPlayer: boolean): BattleCard {
  return {
    id: card.id || `${isPlayer ? 'p' : 'e'}-${Date.now()}-${Math.random()}`,
    name: card.name || card.japanese || 'Card',
    element: card.element || card.types?.[0]?.toUpperCase() || 'NORMAL',
    attack: card.attack || card.attackPower || 40,
    defense: card.defense || card.defenseRating || 10,
    hp: card.hp || 80,
    maxHp: card.maxHp || card.hp || 80,
    cost: 1,
    status: 'normal',
    image: card.image || undefined,
  };
}

// ============================================================
// Components
// ============================================================
function DamageText({ value, type }: { value: number; type: 'dmg' | 'heal' | 'combo' }) {
  const color = type === 'heal' ? '#4bddb7' : type === 'combo' ? '#ffd93d' : '#ff6b35';
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: 1, y: -50, scale: 1.2 }}
      exit={{ opacity: 0, y: -80 }}
      transition={{ duration: 0.8 }}
      className="absolute font-black text-3xl pointer-events-none"
      style={{ left: '50%', top: '40%', transform: 'translate(-50%, -50%)', color, textShadow: `0 0 12px ${color}` }}
    >
      {type === 'heal' ? `+${value}` : `-${value}`}
    </motion.div>
  );
}

function StatusBadge({ status }: { status: CardStatus }) {
  if (status === 'normal') return null;
  const colors: Record<string, string> = { burning: '#ff6b35', paralyzed: '#ffd93d', boosted: '#c77dff', defending: '#4facfe' };
  return (
    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
      style={{ backgroundColor: colors[status] || '#aaa' }}>
      {status[0].toUpperCase()}
    </div>
  );
}

function OpponentSelectModal({ onSelect, onClose }: { onSelect: any; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm mx-4 rounded-3xl overflow-hidden" style={{ background: '#0f1923', borderTop: '3px solid #6c5ce7' }}
        onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-black text-white text-center mb-1">🎯 Pilih Lawan</h2>
          <p className="text-xs text-white/40 text-center mb-4">Pilih opponent untuk battle</p>
          <div className="space-y-3">
            {OPPONENTS.map((opp, i) => (
              <button key={i} onClick={() => onSelect(opp)}
                className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
                style={{ backgroundColor: '#1a1a2e' }}>
                <span className="text-4xl">{opp.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-bold text-white">{opp.name}</p>
                  <p className="text-xs text-white/40">Level {opp.level} • HP {opp.hp} • ATK {opp.atk}</p>
                </div>
                <span style={{ color: '#6c5ce7' }}>›</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={onClose} className="w-full py-4 border-t border-white/10 text-white/40 text-sm font-bold">Batal</button>
      </motion.div>
    </motion.div>
  );
}

function ResultModal({ win, xpGained, diamondsGained, onClose }: { win: boolean; xpGained: number; diamondsGained?: number; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center p-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-7xl mb-4">{win ? '🏆' : '💀'}</motion.div>
        <h2 className="text-3xl font-black text-white mb-2">{win ? 'VICTORY!' : 'DEFEAT'}</h2>
        {win ? (
          <div className="space-y-1 mb-4">
            <p className="text-white/60">+{xpGained} XP earned!</p>
            {diamondsGained && diamondsGained > 0 && (
              <p className="text-white/60">+{diamondsGained} 💎 Diamond!</p>
            )}
          </div>
        ) : <p className="text-white/60 mb-4">Coba lagi!</p>}
        <button onClick={onClose} className="mt-4 px-8 py-3 rounded-2xl bg-[#6c5ce7] text-white font-bold active:scale-95">Lanjutkan</button>
      </motion.div>
    </motion.div>
  );
}

function StudyModal({ question, onAnswer }: { question: { q: string; opts: string[]; ans: string }; onAnswer: (c: boolean) => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md w-full">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">📚</div>
          <h3 className="text-xl font-bold text-white mb-2">Study Time!</h3>
          <p className="text-lg text-white">{question.q}</p>
        </div>
        <div className="space-y-3">
          {question.opts.map((opt, i) => (
            <button key={i} onClick={() => onAnswer(opt === question.ans)}
              className="w-full p-4 bg-[#2d2d44] hover:bg-[#6c5ce7] rounded-xl text-white text-left transition-colors">
              <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Card in hand (mini)
function HandCard({ card, idx, sel, onClick, disabled }: { card: BattleCard; idx: number; sel: boolean; onClick: () => void; disabled: boolean }) {
  const col = ELEMENT_COLORS[card.element];
  const hpPct = card.hp / card.maxHp;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
      whileHover={disabled ? {} : { y: -10, scale: 1.05 }} whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={disabled ? undefined : onClick}
      className={`relative w-[72px] h-[100px] rounded-xl p-1.5 flex flex-col items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
        sel ? 'ring-2 ring-white shadow-xl' : ''
      } ${disabled ? 'opacity-40' : ''}`}
      style={{ background: `linear-gradient(135deg, #1a1a2e 0%, ${col}22 100%)`, border: `2px solid ${sel ? '#fff' : col + '60'}` }}>
      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center">
        <span className="text-[9px] font-bold text-white">{card.cost}</span>
      </div>
      {card.image ? (
        <img src={card.image} alt={card.name} className="w-10 h-10 object-contain" />
      ) : (
        <span className="text-2xl" style={{ color: col }}>⬡</span>
      )}
      <span className="text-[9px] text-white/60 capitalize mt-0.5 truncate w-full text-center">{card.name}</span>
      <div className="w-full mt-1 h-1 rounded-full bg-black/40 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${hpPct * 100}%`, backgroundColor: hpPct > 0.5 ? '#4bddb7' : hpPct > 0.25 ? '#ffd93d' : '#ff6b35' }} />
      </div>
      <div className="flex items-center gap-0.5 text-[8px] mt-0.5">
        <span className="text-red-400">{card.attack}</span>
        <span className="text-blue-400">{card.defense}</span>
      </div>
      <StatusBadge status={card.status} />
    </motion.div>
  );
}

// Active card display
function ActiveCard({ card, isPlayer }: { card: BattleCard; isPlayer: boolean }) {
  const col = ELEMENT_COLORS[card.element];
  const hpPct = card.hp / card.maxHp;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className={`rounded-xl overflow-hidden ${isPlayer ? 'border-t-4' : 'border-b-4'}`}
      style={{ borderColor: col, background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)' }}>
      <div className="p-3 flex items-center gap-3">
        <div className="w-14 h-16 rounded-lg flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: col + '25' }}>
          {card.image ? <img src={card.image} alt={card.name} className="w-12 h-12 object-contain" /> : (
            <span className="text-3xl" style={{ color: col }}>⬡</span>
          )}
          <StatusBadge status={card.status} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-white capitalize">{card.name}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: col + '30', color: col }}>{card.element}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-red-400">⚔️ {card.attack}</span>
            <span className="text-blue-400">🛡️ {card.defense}</span>
          </div>
          <div className="mt-1.5 h-2 rounded-full overflow-hidden bg-black/50">
            <motion.div className="h-full rounded-full" animate={{ width: `${hpPct * 100}%` }}
              style={{ backgroundColor: hpPct > 0.5 ? '#4bddb7' : hpPct > 0.25 ? '#ffd93d' : '#ff6b35' }} />
          </div>
          <span className="text-[10px] text-white/40">{card.hp}/{card.maxHp} HP</span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main Component
// ============================================================
function BattlePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ownedPokemon, addCoins, addDiamonds, trackQuestEvent } = useCollectionStore();
  const { addXP, incrementStat } = useAuthStore();

  // Zustand ready check — prevent reading stale persisted state
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Battle mode: derive from URL search params
  const modeParam = searchParams.get('mode');
  const battleMode: 'card' | 'janken' | null = modeParam === 'janken' ? 'janken' : modeParam === 'card' ? 'card' : null;

  // Core state
  const [phase, setPhase] = useState<Phase>('select-opponent');
  const [opponent, setOpponent] = useState<any>(null);
  const [log, setLog] = useState<string[]>([]);
  
  // Player state
  const [playerHp, setPlayerHp] = useState(100);
  const [playerHand, setPlayerHand] = useState<BattleCard[]>([]);
  const [playerActive, setPlayerActive] = useState<BattleCard | null>(null);
  const [playerEnergy, setPlayerEnergy] = useState(3);
  
  // Opponent state
  const [oppHp, setOppHp] = useState(0);
  const [oppMaxHp, setOppMaxHp] = useState(0);
  const [oppActive, setOppActive] = useState<BattleCard | null>(null);
  const [oppEnergy, setOppEnergy] = useState(3);
  
  // Turn state
  const [turn, setTurn] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [combo, setCombo] = useState(0);
  const [lastElem, setLastElem] = useState<string | null>(null);
  
  // UI state
  const [showDmg, setShowDmg] = useState(false);
  const [dmgVal, setDmgVal] = useState(0);
  const [showStudy, setShowStudy] = useState(false);
  const [studyQ, setStudyQ] = useState<{ q: string; opts: string[]; ans: string } | null>(null);
  const [result, setResult] = useState<{ win: boolean; xp: number; diamonds: number } | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const [processing, setProcessing] = useState(false);

  const logRef = useRef(0);
  const addLog = (txt: string) => setLog(prev => [...prev.slice(-5), `[${logRef.current++}] ${txt}`]);

  // Refs for functions that need current values in callbacks
  const stateRef = useRef({ phase, opponent, turn, isPlayerTurn, oppActive, oppHp, playerActive, playerHp, playerEnergy, combo, lastElem, processing });
  useEffect(() => { stateRef.current = { phase, opponent, turn, isPlayerTurn, oppActive, oppHp, playerActive, playerHp, playerEnergy, combo, lastElem, processing }; }, [phase, opponent, turn, isPlayerTurn, oppActive, oppHp, playerActive, playerHp, playerEnergy, combo, lastElem, processing]);

  // Initialize hand — only after Zustand is ready (prevents stale persisted state)
  useEffect(() => {
    if (!ready) return;

    const activeDeck = useCollectionStore.getState().getActiveDeck();
    const { ownedCards, ownedPokemon, fusedPokemon } = useCollectionStore.getState();

    if (activeDeck && activeDeck.cardIds.length > 0) {
      // Use deck cards for battle
      const battleCards: BattleCard[] = [];
      for (const cardId of activeDeck.cardIds) {
        if (cardId.startsWith('poke-')) {
          const pokemonId = parseInt(cardId.replace('poke-', ''));
          // Check owned Pokemon first (REST API Pokemon)
          const poke = useCollectionStore.getState().ownedPokemon.find(p => p.pokemonId === pokemonId);
          if (poke) battleCards.push(createBattleCard(poke, true));
        } else if (cardId.startsWith('fused-')) {
          // Handle fused Pokemon cards (fused-{pokemonId} e.g. fused-10001)
          const fusedId = parseInt(cardId.replace('fused-', ''));
          const fused = useCollectionStore.getState().fusedPokemon.find(f => f.pokemonId === fusedId);
          if (fused) {
            battleCards.push(createBattleCard({
              id: `fused-${fused.pokemonId}`,
              pokemonId: fused.pokemonId,
              name: fused.name,
              types: fused.types,
              element: fused.element,
              image: fused.image,
              rarity: fused.rarity,
              // Map base stats to battle card fields
              hp: fused.baseHp,
              attack: fused.baseAttack,
              defense: fused.baseDefense,
              speed: fused.baseSpeed,
            }, true));
          }
        } else if (cardId.startsWith('jp-')) {
          // Handle Japanese starter cards (jp-{cardId} e.g. jp-jp_starter_1)
          const cardIdOnly = cardId.replace('jp-', '');
          const owned = ownedCards.find(oc => oc.cardId === cardIdOnly);
          if (owned) {
            battleCards.push(createBattleCard({
              id: cardId,
              name: owned.card.japanese,
              element: owned.card.element,
              hp: owned.card.hp,
              attack: owned.card.attackPower,
              defense: owned.card.defenseRating,
            }, true));
          }
        }
      }
      if (battleCards.length >= 3) {
        setPlayerHand(shuffle(battleCards));
        return;
      }
      // Not enough from deck — try owned Pokemon
      if (ownedPokemon.length >= 3) {
        setPlayerHand(shuffle(ownedPokemon.slice(0, 5)).map(p => createBattleCard(p, true)));
        return;
      }
      // Not enough from deck or Pokemon — try owned Japanese cards
      if (ownedCards.length >= 3) {
        setPlayerHand(shuffle(ownedCards.slice(0, 5).map(oc => createBattleCard({
          id: `jp-${oc.cardId}`,
          name: oc.card.japanese,
          element: oc.card.element,
          hp: oc.card.hp,
          attack: oc.card.attackPower,
          defense: oc.card.defenseRating,
        }, true))));
        return;
      }
      // Fallback to demo
      useDemoDeck(setPlayerHand);
    } else if (ownedPokemon.length >= 3) {
      setPlayerHand(shuffle(ownedPokemon.slice(0, 5)).map(p => createBattleCard(p, true)));
    } else if (ownedCards.length >= 3) {
      // No deck, no enough Pokemon — use owned Japanese cards for battle
      setPlayerHand(shuffle(ownedCards.slice(0, 5).map(oc => createBattleCard({
        id: `jp-${oc.cardId}`,
        name: oc.card.japanese,
        element: oc.card.element,
        hp: oc.card.hp,
        attack: oc.card.attackPower,
        defense: oc.card.defenseRating,
      }, true))));
    } else {
      useDemoDeck(setPlayerHand);
    }
  }, [ready]);

  // ============================================================
  // Battle Logic Functions
  // ============================================================

  // Generate study question
  const genQuestion = (card: BattleCard) => {
    const meanings = ['makan', 'minum', 'pergi', 'lihat', 'dengar', 'belajar', 'bekerja', 'bermain', 'tidur', 'bangun', 'duduk', 'berdiri', 'jatuh', 'naik', 'turun'];
    const name = card.name.toLowerCase();
    const wrong = shuffle(meanings.filter(m => m !== name)).slice(0, 3);
    const opts = shuffle([...wrong, name]);
    return { q: `Apa arti "${card.name}"?`, opts, ans: name };
  };

  // Start battle
  const startBattle = (opp: any) => {
    setOpponent(opp);
    setOppHp(opp.hp);
    setOppMaxHp(opp.hp);
    setPlayerHp(100);
    setPlayerEnergy(3);
    setOppEnergy(3);
    setTurn(1);
    setIsPlayerTurn(true);
    setCombo(0);
    setLastElem(null);
    setLog([]);
    setPlayerActive(null);
    setOppActive(null);
    setResult(null);
    setProcessing(false);
    setAutoMode(false);
    
    addLog(`⚔️ Battle dimulai vs ${opp.name}!`);
    addLog('🎯 Pilih kartu dari tanganmu');
    setPhase('intro');
    
    setTimeout(() => setPhase('battle'), 1500);
  };

  // Select card from hand
  const selectCard = (idx: number) => {
    if (!isPlayerTurn || processing) return;
    const card = playerHand[idx];
    if (!card || card.hp <= 0) return;

    if (playerActive?.id === card.id) {
      setPlayerActive(null);
      addLog(`❌ Batal memilih ${card.name}`);
      return;
    }

    if (playerEnergy < card.cost) {
      addLog(`⚡ Tidak cukup energy! Butuh ${card.cost}, punya ${playerEnergy}`);
      return;
    }

    setPlayerEnergy(prev => prev - card.cost);
    setPlayerActive(card);
    addLog(`🃏 Pilih ${card.name} (${card.element}) ⚔️ ATK:${card.attack} 🛡️ DEF:${card.defense}`);
  };

  // Answer study (player)
  const answerStudy = (correct: boolean) => {
    setShowStudy(false);
    if (correct && playerActive) {
      const b: BattleCard = { ...playerActive, attack: Math.floor(playerActive.attack * 1.3), status: 'boosted' };
      setPlayerActive(b);
      setPlayerHand(prev => prev.map(c => c.id === playerActive.id ? b : c));
      addLog(`✨ Benar! +30% ATK ke ${playerActive.name}!`);
    } else if (playerActive) {
      addLog(`❌ Salah! Jawabannya: ${studyQ?.ans}`);
    }
    setTimeout(() => doEndPlayerTurn(), 600);
  };

  // Player Defend action
  const handleDefend = () => {
    if (!isPlayerTurn || processing) return;
    setPlayerEnergy(0);
    addLog(`🛡️ Kamu bertahan! Defense +50%`);

    if (playerActive) {
      const def: BattleCard = { ...playerActive, status: 'defending' };
      setPlayerActive(def);
      setPlayerHand(prev => prev.map(c => c.id === playerActive.id ? def : c));
    }

    setTimeout(() => doEndPlayerTurn(), 500);
  };

  // Handle Study
  const handleStudy = () => {
    if (!playerActive || !isPlayerTurn || processing) return;
    setPlayerEnergy(prev => prev - 1);
    const q = genQuestion(playerActive);
    setStudyQ(q);
    setShowStudy(true);
  };

  // AI Turn logic (called directly, not as callback)
  const doAITurn = () => {
    const s = stateRef.current;
    console.log('[AI] doAITurn called', { phase: s.phase, turn: s.turn, isPlayerTurn: s.isPlayerTurn, oppActive: s.oppActive?.id, oppHp: s.oppHp });
    if (s.phase !== 'battle') { console.log('[AI] Early return - phase not battle'); return; }
    addLog(`🤖 ${s.opponent?.name} giliran...`);
    
    setOppEnergy(3);

    // Pick opponent active card if none
    if (!s.oppActive) {
      const card: BattleCard = {
        id: `opp-${Date.now()}`, name: s.opponent.name, element: 'NORMAL',
        attack: s.opponent.atk, defense: s.opponent.def, hp: s.opponent.hp, maxHp: s.opponent.hp,
        cost: 1, status: 'normal',
      };
      setOppActive(card);
      addLog(`🤖 ${s.opponent.name} kirim ${card.name}!`);
      // Need to wait for state update, then call doAITurn again
      setTimeout(() => doAITurnInner(), 1000);
      return;
    }

    // Call inner AI logic (after card is set)
    doAITurnInner();
  };

  // AI decision and action
  const doAITurnInner = () => {
    const s = stateRef.current;
    if (!s.oppActive || !s.opponent) return;

    const strat = s.opponent.strategy;
    const rand = Math.random();
    let action: 'attack' | 'defend' | 'study' = 'attack';

    if (strat === 'aggressive') {
      action = rand < 0.8 ? 'attack' : rand < 0.9 ? 'study' : 'defend';
    } else if (strat === 'defensive') {
      action = rand < 0.3 ? 'attack' : rand < 0.7 ? 'defend' : 'study';
    } else if (strat === 'smart') {
      action = !s.playerActive ? 'attack' : rand < 0.4 ? 'defend' : rand < 0.7 ? 'attack' : 'study';
    } else {
      action = rand < 0.55 ? 'attack' : rand < 0.75 ? 'defend' : 'study';
    }

    if (action === 'attack') {
      doAIAttack();
    } else if (action === 'defend') {
      addLog(`🛡️ ${s.opponent.name} bertahan!`);
      const def: BattleCard = { ...s.oppActive, status: 'defending' };
      setOppActive(def);
      setTimeout(() => doEndAITurn(), 800);
    } else if (action === 'study') {
      const q = genQuestion(s.oppActive);
      setStudyQ(q);
      setShowStudy(true);
      setTimeout(() => {
        setShowStudy(false);
        const correct = Math.random() < 0.7;
        if (correct && s.oppActive) {
          const b: BattleCard = { ...s.oppActive, attack: Math.floor(s.oppActive.attack * 1.3), status: 'boosted' };
          setOppActive(b);
          addLog(`✨ ${s.opponent.name} jawab benar! +30% ATK!`);
        } else {
          addLog(`❌ ${s.opponent.name} salah menjawab!`);
        }
        setTimeout(() => doEndAITurn(), 600);
      }, 800);
    }
  };

  // AI Attack
  const doAIAttack = () => {
    const s = stateRef.current;
    if (!s.oppActive) return;

    let damage = s.oppActive.attack;
    const eff = getElementAdvantage(s.oppActive.element, s.playerActive?.element || 'NORMAL');
    if (eff > 1) damage = Math.floor(damage * eff);
    else if (eff < 1) damage = Math.floor(damage * eff);

    if (s.playerActive) {
      const defReduction = s.playerActive.status === 'defending' ? Math.floor(s.playerActive.defense * 1.5) : s.playerActive.defense;
      damage = Math.max(5, damage - defReduction);
    }

    setDmgVal(damage);
    setShowDmg(true);

    setTimeout(() => {
      setShowDmg(false);

      if (eff > 1) addLog(`✨ SUPER EFFECTIVE! -${damage}`);
      else addLog(`💥 ${s.opponent?.name} menyerang! -${damage} damage!`);

      // Damage to player active card
      if (s.playerActive) {
        const newHp = Math.max(0, s.playerActive.hp - damage);
        if (newHp <= 0) {
          addLog(`💀 ${s.playerActive.name} sudah fainted!`);
          setPlayerHand(prev => prev.filter(c => c.id !== s.playerActive!.id));
          setPlayerActive(null);
        } else {
          setPlayerActive({ ...s.playerActive, hp: newHp });
          setPlayerHand(prev => prev.map(c => c.id === s.playerActive!.id ? { ...s.playerActive!, hp: newHp } : c));
        }
      }

      // Damage to player overall HP
      const newPlayerHp = Math.max(0, s.playerHp - Math.floor(damage * 0.3));
      setPlayerHp(newPlayerHp);

      // Check lose
      if (newPlayerHp <= 0) {
        setResult({ win: false, xp: 0, diamonds: 0 });
        addLog(`💀 DEFEAT!`);
        incrementStat('battles');
        setPhase('result');
        return;
      }

      setTimeout(() => doEndAITurn(), 500);
    }, 700);
  };

  // End AI turn
  const doEndAITurn = () => {
    console.log('[AI] endAITurn');
    setOppActive(null);
    setIsPlayerTurn(true);
    addLog(`🎯 Giliran ${stateRef.current.turn + 1} - pilih kartu!`);
  };

  // End player turn → AI turn
  const doEndPlayerTurn = () => {
    console.log('[Battle] endPlayerTurn');
    setPlayerActive(null);
    setIsPlayerTurn(false);
    setTurn(t => t + 1);

    setTimeout(() => {
      setPlayerEnergy(3);
      setTimeout(() => doAITurn(), 600);
    }, 400);
  };

  // Execute player attack
  const executePlayerAttack = () => {
    const s = stateRef.current;
    console.log('[Battle] executePlayerAttack', { playerActive: s.playerActive?.id, isPlayerTurn: s.isPlayerTurn, processing: s.processing, oppActive: s.oppActive?.id, oppHp: s.oppHp });
    if (!s.playerActive || !s.isPlayerTurn || s.processing) return;
    setProcessing(true);

    let damage = s.playerActive.attack;
    let effectiveness: 'super' | 'weak' | 'normal' = 'normal';

    const eff = getElementAdvantage(s.playerActive.element, s.oppActive?.element || 'NORMAL');
    if (eff > 1) { effectiveness = 'super'; damage = Math.floor(damage * eff); }
    else if (eff < 1) { effectiveness = 'weak'; damage = Math.floor(damage * eff); }

    if (s.lastElem === s.playerActive.element && s.lastElem !== null) {
      const bonus = Math.floor(damage * 0.25 * s.combo);
      damage += bonus;
      addLog(`🔥 Combo ${s.combo + 1}x! +${bonus} damage!`);
    }

    if (s.oppActive) {
      const defReduction = s.oppActive.status === 'defending' ? Math.floor(s.oppActive.defense * 1.5) : s.oppActive.defense;
      damage = Math.max(5, damage - defReduction);
    }

    setDmgVal(damage);
    setShowDmg(true);

    setTimeout(() => {
      setShowDmg(false);
      setProcessing(false);

      if (effectiveness === 'super') addLog(`✨ SUPER EFFECTIVE! -${damage}`);
      else addLog(`⚔️ ${s.playerActive!.name} menyerang! -${damage} damage!`);

      if (s.lastElem === s.playerActive!.element) setCombo(c => c + 1);
      else { setCombo(1); setLastElem(s.playerActive!.element); }

      const newOppHp = Math.max(0, s.oppHp - damage);
      setOppHp(newOppHp);

      if (newOppHp <= 0) {
        const xp = 10 + (s.opponent?.level || 1) * 5;
        const diamonds = 5 + (s.opponent?.level || 1) * 2;
        addCoins(xp);
        addDiamonds(diamonds);
        addXP(xp);
        incrementStat('battles');
        incrementStat('wins');
        setResult({ win: true, xp, diamonds });
        addLog(`🏆 VICTORY! +${xp} XP +${diamonds} 💎`);
        setPhase('result');

        // Update BATTLE quest progress
        trackQuestEvent('BATTLE');
        return;
      }

      setTimeout(() => doEndPlayerTurn(), 400);
    }, 700);
  };

  // Back handler
  const handleBack = () => {
    if (phase === 'battle') {
      setPhase('select-opponent');
      setOpponent(null);
      setPlayerActive(null);
      setOppActive(null);
    } else {
      // No mode selected → go to collection
      router.push('/');
    }
  };

  // Auto attack
  useEffect(() => {
    if (!autoMode || !isPlayerTurn || phase !== 'battle' || processing) return;
    if (!playerActive) return;
    const timer = setTimeout(() => executePlayerAttack(), 800);
    return () => clearTimeout(timer);
  }, [autoMode, isPlayerTurn, phase, processing, playerActive, turn]);

  // Render Janken mode
  if (battleMode === 'janken') {
    return <JankenGame onBack={() => router.push('/battle')} />;
  }

  // Render mode selector when no mode is set
  if (!battleMode || (searchParams.get('mode') === null && phase === 'select-opponent' && !opponent)) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0d0d1a' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-orange-900/10" />
        <button onClick={() => router.push('/')} className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <main className="relative z-10 flex flex-col items-center justify-center h-screen px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">⚔️ Battle</h1>
            <p className="text-white/40 text-sm">Pilih mode battle yang kamu mau!</p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <button
              onClick={() => router.push('/battle?mode=card')}
              className="w-full p-6 rounded-2xl flex items-center gap-4 transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #162125 100%)', border: '2px solid #6c5ce760' }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: '#6c5ce730' }}>🃏</div>
              <div className="text-left">
                <p className="font-bold text-white text-lg">Battle Card</p>
                <p className="text-sm text-white/40">Kumpulkan deck, kalahkan lawan dengan kartu Pokemon!</p>
              </div>
              <span style={{ color: '#6c5ce7' }}>›</span>
            </button>

            <button
              onClick={() => router.push('/battle?mode=janken')}
              className="w-full p-6 rounded-2xl flex items-center gap-4 transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #162125 100%)', border: '2px solid #ff6b3560' }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: '#ff6b3530' }}>✌️</div>
              <div className="text-left">
                <p className="font-bold text-white text-lg">Janken</p>
                <p className="text-sm text-white/40">Batu Gunting Kertas — kalahkan bot dan dapat streak reward!</p>
              </div>
              <span style={{ color: '#ff6b35' }}>›</span>
            </button>
          </div>

          <p className="text-white/20 text-xs mt-8">Pilih salah satu mode untuk mulai</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0d0d1a' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-orange-900/10" />
      
      <button onClick={handleBack} className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      <AnimatePresence>
        {phase === 'select-opponent' && <OpponentSelectModal onSelect={startBattle} onClose={() => router.push('/')} />}
      </AnimatePresence>
      <AnimatePresence>{result && <ResultModal win={result.win} xpGained={result.xp} diamondsGained={result.diamonds} onClose={() => { setResult(null); setPhase('select-opponent'); }} />}</AnimatePresence>
      <AnimatePresence>{showStudy && studyQ && <StudyModal question={studyQ} onAnswer={answerStudy} />}</AnimatePresence>

      {phase === 'intro' && opponent && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: '#0d0d1a' }}>
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5 }} transition={{ type: 'spring' }} className="text-7xl mb-4">{opponent.emoji}</motion.div>
            <h2 className="text-2xl font-black text-white mb-1">{opponent.name}</h2>
            <p className="text-white/40 mb-6">Level {opponent.level} • HP {opponent.hp} • ATK {opponent.atk}</p>
            <p className="text-white/60 animate-pulse">Battle starting...</p>
          </div>
        </motion.div>
      )}

      <main className="relative z-10 flex flex-col h-screen">
        <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: '#162125' }}>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">⚔️ Battle</span>
            {opponent && <span className="text-sm text-white/40">vs {opponent.name}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Turn: <span className="text-white font-bold">{turn}</span></span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPlayerTurn ? 'bg-[#4bddb7] text-black' : 'bg-[#ff6b35] text-white'}`}>
              {isPlayerTurn ? 'Your Turn' : opponent?.name}
            </span>
          </div>
        </div>

        <div className="px-4 py-2 flex items-center gap-3" style={{ backgroundColor: '#1a1a2e' }}>
          <Zap className="w-4 h-4 text-yellow-400" />
          <div className="flex-1 flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-2 flex-1 rounded-full transition-all" style={{ backgroundColor: i < playerEnergy ? '#ffd93d' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
          <span className="text-xs font-bold" style={{ color: '#ffd93d' }}>{playerEnergy}/3</span>
          {combo > 1 && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#ff6b35] text-white">🔥 {combo}x</span>}
          
          <button
            onClick={() => setAutoMode(prev => !prev)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${autoMode ? 'bg-[#4bddb7] text-black' : 'bg-white/10 text-white/60'}`}
          >
            AUTO {autoMode ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="flex-1 px-4 py-3 space-y-2 overflow-hidden">
          {oppActive && <ActiveCard card={oppActive} isPlayer={false} />}
          {oppActive && <AnimatePresence>{showDmg && <DamageText value={dmgVal} type="dmg" />}</AnimatePresence>}

          {opponent && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl" style={{ backgroundColor: '#1a1a2e' }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{opponent.emoji}</span>
                <span className="text-sm font-bold text-white">{opponent.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
                  <motion.div className="h-full rounded-full" animate={{ width: `${(oppHp / oppMaxHp) * 100}%` }}
                    style={{ backgroundColor: oppHp / oppMaxHp > 0.5 ? '#4bddb7' : oppHp / oppMaxHp > 0.25 ? '#ffd93d' : '#ff6b35' }} />
                </div>
                <span className="text-sm font-bold text-white">{oppHp}/{oppMaxHp}</span>
              </div>
            </div>
          )}

          {opponent && <div className="flex items-center gap-2 py-1"><div className="flex-1 h-px bg-white/10" /><span className="text-xs text-white/30">VS</span><div className="flex-1 h-px bg-white/10" /></div>}

          {playerActive && <ActiveCard card={playerActive} isPlayer={true} />}
          {playerActive && <AnimatePresence>{showDmg && <DamageText value={dmgVal} type="dmg" />}</AnimatePresence>}

          {opponent && (
            <div className="flex items-center justify-between px-4 py-2 rounded-xl" style={{ backgroundColor: '#1a1a2e' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: '#6c5ce7' }}>T</div>
                <div>
                  <p className="text-sm font-bold text-white">Tamago</p>
                  <p className="text-xs text-white/40">{playerHand.length} kartu di tangan</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
                  <motion.div className="h-full rounded-full" animate={{ width: `${playerHp}%` }} style={{ backgroundColor: '#4bddb7' }} />
                </div>
                <span className="text-sm font-bold text-white">{playerHp}/100</span>
              </div>
            </div>
          )}

          {log.length > 0 && (
            <div className="mt-1 px-4 py-2 rounded-xl" style={{ backgroundColor: '#1a1a2e' }}>
              <div className="flex gap-2 overflow-x-auto">
                {log.slice(-3).map((l, i) => <span key={i} className="text-xs text-white/50 whitespace-nowrap">{l}</span>)}
              </div>
            </div>
          )}
        </div>

        {phase === 'battle' && (
          <div className="px-4 pb-4 pt-2" style={{ backgroundColor: '#0f1923' }}>
            <div className="text-xs text-white/40 mb-2">Your Hand ({playerHand.length})</div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {playerHand.map((card, i) => (
                <HandCard key={card.id} card={card} idx={i} sel={playerActive?.id === card.id}
                  disabled={!isPlayerTurn || processing}
                  onClick={() => selectCard(i)} />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <button onClick={executePlayerAttack}
                disabled={!playerActive || !isPlayerTurn || processing}
                className="h-11 rounded-xl flex items-center justify-center gap-1.5 font-bold text-white text-sm bg-[#ff6b35] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                <Swords className="w-4 h-4" /> Attack
              </button>
              <button onClick={handleStudy}
                disabled={!isPlayerTurn || processing}
                className="h-11 rounded-xl flex items-center justify-center gap-1.5 font-bold text-white text-sm bg-[#6c5ce7] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                📚 Study
              </button>
              <button onClick={handleDefend}
                disabled={!isPlayerTurn || processing}
                className="h-11 rounded-xl flex items-center justify-center gap-1.5 font-bold text-white text-sm bg-[#4facfe] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                <Shield className="w-4 h-4" /> Defend
              </button>
            </div>

            {!playerActive && isPlayerTurn && !processing && (
              <p className="text-xs text-center text-white/40 mt-2">💡 Klik kartu di tanganmu untuk memilih!</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function BattlePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: '#0d0d1a' }}>
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    }>
      <BattlePageContent />
    </Suspense>
  );
}