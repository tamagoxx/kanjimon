'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore, PokemonCard } from '@/store/collectionStore';
import { Heart, Swords, Shield, Zap, X, ArrowLeft, Trophy, Skull, Loader2 } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  fire: '#ff6b35', water: '#4facfe', grass: '#4bddb7', electric: '#ffd93d',
  psychic: '#c77dff', normal: '#a8a8a8', bug: '#7cb342', poison: '#ba68c8',
  ground: '#c69c6d', rock: '#8d6e63', flying: '#81d4fa', fighting: '#ef5350',
  ghost: '#7c4dff', ice: '#4dd0e1', dragon: '#ff7043', dark: '#5c6bc0',
  steel: '#90a4ae', fairy: '#f48fb1',
};

const OPPONENTS = [
  { name: 'Sensei Bot', emoji: '🥋', atk: 30, def: 20, hp: 60, level: 1 },
  { name: 'Ninja Bot', emoji: '🥷', atk: 40, def: 25, hp: 75, level: 5 },
  { name: 'Samurai Bot', emoji: '⚔️', atk: 50, def: 30, hp: 90, level: 10 },
  { name: 'Shogun Bot', emoji: '🛡️', atk: 60, def: 35, hp: 110, level: 20 },
  { name: 'Dragon Bot', emoji: '🐉', atk: 75, def: 40, hp: 130, level: 35 },
];

function calculatePokemonRarityScore(pokemon: PokemonCard): number {
  return pokemon.hp + pokemon.attack * 2 + pokemon.defense * 1.5 + pokemon.speed;
}

// Hand Card Component
function HandCard({ card, index, isSelected, isPokemon, onClick }: {
  card: any; index: number; isSelected: boolean; isPokemon: boolean; onClick?: () => void;
}) {
  const col = isPokemon ? TYPE_COLORS[card.types?.[0]] || '#a8a8a8' : '#6c5ce7';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={onClick ? { y: -8 } : {}}
      onClick={onClick}
      className={`w-20 h-[112px] rounded-xl p-2 flex flex-col items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
        isSelected ? 'ring-2 ring-white shadow-lg' : ''
      }`}
      style={{ backgroundColor: '#1a1a2e', borderColor: isSelected ? '#fff' : 'transparent', borderWidth: 2 }}
    >
      {isPokemon ? (
        <>
          <img src={card.image} alt={card.name} className="w-12 h-12 object-contain" />
          <span className="text-[10px] text-white/70 capitalize mt-1 truncate w-full text-center">{card.name}</span>
          <div className="flex items-center gap-1 text-[10px] mt-1">
            <span className="text-red-400">{card.hp}</span>
            <span className="text-orange-400">{card.attack}</span>
          </div>
        </>
      ) : (
        <>
          <div className="text-2xl font-bold mb-1" style={{ color: col }}>{card.japanese || card.symbol}</div>
          <span className="text-xs text-white/70">{card.romaji || card.name}</span>
          <div className="flex items-center gap-1 text-xs mt-1">
            <span className="text-red-400">{card.attackPower}</span>
            <span className="text-blue-400">{card.defenseRating}</span>
          </div>
        </>
      )}
    </motion.div>
  );
}

// Battlefield Card
function BattlefieldCard({ card, isPlayer, isPokemon }: {
  card: any; isPlayer: boolean; isPokemon: boolean;
}) {
  const col = isPokemon ? TYPE_COLORS[card.types?.[0]] || '#a8a8a8' : '#6c5ce7';
  const hpPercent = isPlayer ? (card.currentHp / card.hp) * 100 : (card.currentHp / card.maxHp) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative ${isPlayer ? 'border-t-4' : 'border-b-4'}`}
      style={{ borderColor: col, backgroundColor: '#1a1a2e99' }}
    >
      <div className="p-3 flex items-center gap-3">
        <div className="w-16 h-20 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${col}20` }}>
          {isPokemon ? (
            <img src={card.image} alt={card.name} className="w-14 h-14 object-contain" />
          ) : (
            <div className="text-2xl font-bold" style={{ color: col }}>{card.japanese || card.symbol}</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-bold text-white capitalize">{isPlayer ? 'Kamu' : card.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/30 text-white/70">
              {isPokemon ? card.types?.[0] : card.element}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-red-400 flex items-center gap-1"><Swords className="w-3 h-3" /> {card.attack}</span>
            <span className="text-blue-400 flex items-center gap-1"><Shield className="w-3 h-3" /> {card.defense}</span>
          </div>
          <div className="mt-2 h-2 rounded-full overflow-hidden bg-black/30">
            <motion.div
              className="h-full rounded-full"
              animate={{ width: `${hpPercent}%` }}
              style={{ backgroundColor: isPlayer ? '#4bddb7' : '#ff6b35' }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-white/50">
              {isPlayer ? card.currentHp : card.currentHp}/{isPlayer ? card.hp : card.maxHp} HP
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Floating Damage
function FloatingDamage({ value }: { value: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: 1, y: -30, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute text-4xl font-black text-red-500 pointer-events-none"
      style={{ left: '50%', top: '40%', transform: 'translateX(-50%)' }}
    >
      -{value}
    </motion.div>
  );
}

// Opponent Select Modal
function OpponentSelect({ onSelect, onClose }: { onSelect: (opp: any) => void; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
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
                  <p className="text-xs text-white/40">Level {opp.level} • HP {opp.hp} • ATK {opp.atk}</p>
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
        <button
          onClick={onClose}
          className="w-full py-4 border-t border-white/10 text-white/40 text-sm font-bold"
        >
          Batal
        </button>
      </motion.div>
    </motion.div>
  );
}

// Result Modal
function ResultModal({ win, xpGained, onClose }: { win: boolean; xpGained: number; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5 }} animate={{ scale: 1 }}
        className="text-center p-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1.5 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-7xl mb-4"
        >
          {win ? '🏆' : '💀'}
        </motion.div>
        <h2 className="text-3xl font-black text-white mb-2">{win ? 'VICTORY!' : 'DEFEAT'}</h2>
        <p className="text-white/60 mb-4">{win ? 'Kamu menang! +10 XP' : 'Jangan menyerah!'}</p>
        {win && (
          <div className="flex items-center justify-center gap-2 text-[#4bddb7]">
            <Trophy className="w-5 h-5" />
            <span className="font-bold">+{xpGained} XP</span>
          </div>
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

export default function BattleArenaPage() {
  const router = useRouter();
  const { ownedPokemon, coins, addCoins } = useCollectionStore();

  const [battleState, setBattleState] = useState<'idle' | 'select-opponent' | 'battle' | 'result'>('idle');
  const [selectedOpponent, setSelectedOpponent] = useState<any>(null);
  const [playerHand, setPlayerHand] = useState<any[]>([]);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [playerHp, setPlayerHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(0);
  const [maxOpponentHp, setMaxOpponentHp] = useState(0);
  const [showDamage, setShowDamage] = useState(false);
  const [damageValue, setDamageValue] = useState(0);
  const [battleResult, setBattleResult] = useState<{ win: boolean; xpGained: number } | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(true);

  // Initialize player hand with owned Pokemon (or demo cards if none)
  useEffect(() => {
    if (ownedPokemon.length >= 3) {
      setPlayerHand(ownedPokemon.slice(0, 5).map(p => ({
        ...p,
        currentHp: p.hp,
      })));
    } else {
      // Demo cards for testing
      setPlayerHand([
        { id: 'demo-1', name: 'Mizu', symbol: '💧', element: 'WATER', attack: 65, defense: 30, hp: 85, currentHp: 85, image: '' },
        { id: 'demo-2', name: 'Hi', symbol: '🔥', element: 'FIRE', attack: 80, defense: 20, hp: 70, currentHp: 70, image: '' },
        { id: 'demo-3', name: 'Ki', symbol: '🌱', element: 'GRASS', attack: 55, defense: 25, hp: 90, currentHp: 90, image: '' },
        { id: 'demo-4', name: 'Kaze', symbol: '⚡', element: 'ELECTRIC', attack: 60, defense: 22, hp: 75, currentHp: 75, image: '' },
        { id: 'demo-5', name: 'Hikari', symbol: '✨', element: 'PSYCHIC', attack: 70, defense: 28, hp: 80, currentHp: 80, image: '' },
      ]);
    }
  }, [ownedPokemon]);

  const startBattle = (opponent: any) => {
    setSelectedOpponent(opponent);
    setOpponentHp(opponent.hp);
    setMaxOpponentHp(opponent.hp);
    setPlayerHp(100);
    setSelectedCardIndex(null);
    setBattleLog([`Battle dimulai melawan ${opponent.name}!`, 'Pilih kartu untuk menyerang.']);
    setBattleState('battle');
  };

  const handleAttack = () => {
    if (selectedCardIndex === null || !isMyTurn) return;
    const card = playerHand[selectedCardIndex];
    if (!card || card.currentHp <= 0) return;

    // Calculate damage (player attack - opponent defense, with variance)
    const baseDamage = card.attack - (selectedOpponent.def / 2);
    const variance = Math.floor(Math.random() * 10) - 3;
    const finalDamage = Math.max(5, baseDamage + variance);

    setDamageValue(finalDamage);
    setShowDamage(true);

    const newOpponentHp = Math.max(0, opponentHp - finalDamage);
    setOpponentHp(newOpponentHp);
    setBattleLog(prev => [...prev, `⚔️ ${card.name} menyerang ${finalDamage} damage!`]);

    setTimeout(() => {
      setShowDamage(false);
      if (newOpponentHp <= 0) {
        // Win!
        setBattleResult({ win: true, xpGained: 10 + selectedOpponent.level * 2 });
        addCoins(10 + selectedOpponent.level * 2);
      } else {
        // Opponent turn
        setIsMyTurn(false);
        setTimeout(() => {
          const oppDamage = Math.max(3, selectedOpponent.atk - card.defense + Math.floor(Math.random() * 5));
          const newPlayerHp = Math.max(0, playerHp - oppDamage);
          setPlayerHp(newPlayerHp);
          setBattleLog(prev => [...prev, `💥 ${selectedOpponent.name} menyerang ${oppDamage} damage!`]);

          if (newPlayerHp <= 0) {
            setBattleResult({ win: false, xpGained: 0 });
          } else {
            setIsMyTurn(true);
          }
        }, 1000);
      }
    }, 600);
  };

  const handleDefend = () => {
    if (!isMyTurn) return;
    setBattleLog(prev => [...prev, '🛡️ Kamu bertahan! (+5 HP)']);
    setPlayerHp(prev => Math.min(100, prev + 5));
    setIsMyTurn(false);
    setTimeout(() => {
      const oppDamage = Math.max(1, selectedOpponent.atk - 10);
      const newPlayerHp = Math.max(0, playerHp - oppDamage);
      setPlayerHp(newPlayerHp);
      setBattleLog(prev => [...prev, `💥 ${selectedOpponent.name} menyerang ${oppDamage} damage!`]);
      if (newPlayerHp > 0) setIsMyTurn(true);
    }, 1000);
  };

  const handleStudy = () => {
    if (!isMyTurn) return;
    setBattleLog(prev => [...prev, '📖 Kamu mempelajari strategi baru! (+3 HP sementara)']);
    setPlayerHp(prev => Math.min(100, prev + 3));
    setIsMyTurn(false);
    setTimeout(() => {
      const oppDamage = Math.max(1, selectedOpponent.atk - 5);
      const newPlayerHp = Math.max(0, playerHp - oppDamage);
      setPlayerHp(newPlayerHp);
      setBattleLog(prev => [...prev, `💥 ${selectedOpponent.name} menyerang ${oppDamage} damage!`]);
      if (newPlayerHp > 0) setIsMyTurn(true);
    }, 1000);
  };

  const handleBack = () => {
    if (battleState === 'battle') {
      setBattleState('idle');
      setSelectedOpponent(null);
    } else {
      router.push('/');
    }
  };

  const selectedCard = selectedCardIndex !== null ? playerHand[selectedCardIndex] : null;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0d0d1a' }}>
      {/* Background */}
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
        {battleState === 'select-opponent' && (
          <OpponentSelect
            onSelect={startBattle}
            onClose={() => setBattleState('idle')}
          />
        )}
      </AnimatePresence>

      {/* Result Modal */}
      <AnimatePresence>
        {battleResult && (
          <ResultModal
            win={battleResult.win}
            xpGained={battleResult.xpGained}
            onClose={() => {
              setBattleResult(null);
              setBattleState('idle');
              setSelectedOpponent(null);
            }}
          />
        )}
      </AnimatePresence>

      <main className="relative z-10 flex flex-col h-screen">
        {/* Player Stats Bar */}
        <div className="px-4 py-3 flex items-center gap-4" style={{ backgroundColor: '#162125' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: '#6c5ce7' }}>
            T
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-white">Tamago</span>
              <span className="text-xs" style={{ color: '#4bddb7' }}>HP {playerHp}/100</span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
              <motion.div
                animate={{ width: `${playerHp}%` }}
                className="h-full rounded-full"
                style={{ backgroundColor: '#4bddb7' }}
              />
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/50">{ownedPokemon.length} Pokemon</span>
          </div>
        </div>

        {/* Battlefield */}
        <div className="flex-1 px-4 py-4 space-y-3 overflow-hidden">
          {/* Opponent Card */}
          {selectedOpponent && (
            <BattlefieldCard
              card={{ ...selectedOpponent, currentHp: opponentHp, maxHp: maxOpponentHp }}
              isPlayer={false}
              isPokemon={false}
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
          {selectedCard && (
            <BattlefieldCard
              card={selectedCard}
              isPlayer={true}
              isPokemon={!!selectedCard.image}
            />
          )}

          {/* Floating Damage */}
          <AnimatePresence>
            {showDamage && <FloatingDamage value={damageValue} />}
          </AnimatePresence>

          {/* Empty State */}
          {!selectedOpponent && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <span className="text-6xl">⚔️</span>
              <p className="text-white/40 text-center">Pilih opponent untuk memulai battle</p>
              <button
                onClick={() => setBattleState('select-opponent')}
                className="px-6 py-3 rounded-2xl bg-[#6c5ce7] text-white font-bold active:scale-95"
              >
                🎯 Pilih Lawan
              </button>
            </div>
          )}
        </div>

        {/* Battle Log */}
        {selectedOpponent && (
          <div className="px-4 py-2 flex items-center gap-3 overflow-hidden" style={{ backgroundColor: '#1a1a2e' }}>
            <div className="w-2 h-2 rounded-full bg-[#4bddb7] animate-pulse" />
            <div className="flex-1 overflow-x-auto">
              <div className="flex gap-4">
                {battleLog.slice(-3).map((log, i) => (
                  <span key={i} className="text-xs text-white/60 whitespace-nowrap">{log}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Grid */}
        {selectedOpponent && (
          <div className="px-4 pb-2 grid grid-cols-3 gap-2">
            <button
              onClick={handleAttack}
              disabled={selectedCardIndex === null || !isMyTurn || !selectedCard || selectedCard.currentHp <= 0}
              className="h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-sm bg-[#ff6b35] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Swords className="w-4 h-4" /> Serang
            </button>
            <button
              onClick={handleDefend}
              disabled={!isMyTurn}
              className="h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-sm bg-[#4facfe] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Shield className="w-4 h-4" /> defense
            </button>
            <button
              onClick={handleStudy}
              disabled={!isMyTurn}
              className="h-12 rounded-xl flex items-center justify-center gap-2 font-bold text-white text-sm bg-[#6c5ce7] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📖 Study
            </button>
          </div>
        )}

        {/* Turn Indicator */}
        {selectedOpponent && (
          <div className="px-4 pb-2 text-center">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isMyTurn ? 'bg-[#4bddb7]/20 text-[#4bddb7]' : 'bg-[#ff6b35]/20 text-[#ff6b35]'}`}>
              {isMyTurn ? "✨ Giliranmu" : "⏳ Giliran opponent"}
            </span>
          </div>
        )}

        {/* Player Hand */}
        {selectedOpponent && (
          <div className="px-4 pb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {playerHand.map((card, i) => (
                <HandCard
                  key={card.id}
                  card={card}
                  index={i}
                  isSelected={selectedCardIndex === i}
                  isPokemon={!!card.image}
                  onClick={() => {
                    if (card.currentHp > 0) {
                      setSelectedCardIndex(i);
                    }
                  }}
                />
              ))}
              {/* Dead cards indicator */}
              {playerHand.filter(c => c.currentHp <= 0).length > 0 && (
                <div className="w-12 h-[112px] rounded-xl flex items-center justify-center bg-black/30">
                  <span className="text-xs text-white/30">{playerHand.filter(c => c.currentHp <= 0).length} KO</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}