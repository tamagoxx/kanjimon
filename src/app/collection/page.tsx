'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useCollectionStore, PokemonCard } from '@/store/collectionStore';
import { CARDS_BY_ID, ALL_CARDS } from '@/data/cards';
import { Heart, Swords, Shield, Zap, Star, X, Loader2, Crown, Package } from 'lucide-react';

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

const elementColors: Record<string, string> = {
  FIRE: '#ffb4ab',
  WATER: '#6c5ce7',
  GRASS: '#4bddb7',
  ELECTRIC: '#f0bf63',
  PSYCHIC: '#c6bfff',
  NORMAL: '#c8c4d7',
};

const TYPE_COLORS: Record<string, string> = {
  fire: '#ff6b35', water: '#4facfe', grass: '#4bddb7', electric: '#ffd93d',
  psychic: '#c77dff', normal: '#a8a8a8', bug: '#7cb342', poison: '#ba68c8',
  ground: '#c69c6d', rock: '#8d6e63', flying: '#81d4fa', fighting: '#ef5350',
  ghost: '#7c4dff', ice: '#4dd0e1', dragon: '#ff7043', dark: '#5c6bc0',
  steel: '#90a4ae', fairy: '#f48fb1',
};

const rarityColors: Record<string, string> = {
  COMMON: '#c8c4d7',
  UNCOMMON: '#4bddb7',
  RARE: '#6c5ce7',
  ULTRA_RARE: '#f0bf63',
};

const allJapaneseCards = Object.values(CARDS_BY_ID);

type TabType = 'all' | 'japanese' | 'pokemon' | 'battle';
type FilterType = 'all' | 'verbs' | 'nouns' | 'adjectives' | 'particles';

// Top Navigation Bar
function TopAppBar() {
  const router = useRouter();
  const { coins, ownedPokemon } = useCollectionStore();
  const canFuse = ownedPokemon.filter(p => p.pokemonId < 10000).length >= 2;

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
        <span className="text-base font-medium text-[#c6bfff]">Koleksiku</span>
      </div>
      <button
        onClick={() => router.push('/fusion')}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${canFuse ? 'bg-[#6c5ce720] text-[#c6bfff] border border-[#6c5ce760] hover:bg-[#6c5ce740]' : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'}`}
        title={canFuse ? 'Gabungkan 2 Pokemon untuk membuat yang lebih kuat!' : 'Butuh minimal 2 Pokemon untuk fusion'}
      >
        🔀 Fusion
      </button>
    </div>
  );
}

// Japanese Card Component
function JapaneseCardItem({ card, index }: { card: any; index: number }) {
  const elementColor = elementColors[card.element] || colors.darkText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: 'easeOut' }}
      className="relative rounded-xl overflow-hidden"
      style={{ backgroundColor: '#1a1a2e' }}
      whileHover={{ y: -2 }}
    >
      {/* Rarity top bar */}
      <div className={`h-0.5 ${
        card.rarity === 'ULTRA_RARE' ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8c00]' :
        card.rarity === 'RARE' ? 'bg-[#c77dff]' :
        card.rarity === 'UNCOMMON' ? 'bg-[#4facfe]' : 'bg-white/10'
      }`} />

      <div className="p-2">
        {/* Top: Element icon + Rarity badge */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: elementColor }}>
            {card.element === 'FIRE' ? '🔥' :
             card.element === 'WATER' ? '💧' :
             card.element === 'GRASS' ? '🌱' :
             card.element === 'ELECTRIC' ? '⚡' :
             card.element === 'PSYCHIC' ? '🔮' : '📝'}
          </span>
          {card.rarity !== 'COMMON' && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: `${rarityColors[card.rarity]}25`, color: rarityColors[card.rarity] }}>
              {card.rarity === 'ULTRA_RARE' ? 'UR' : card.rarity === 'RARE' ? 'R' : 'U'}
            </span>
          )}
        </div>

        {/* Center: Kanji Character */}
        <div className="flex items-center justify-center py-1">
          <div className="text-2xl font-bold text-white">{card.japanese}</div>
        </div>

        {/* Bottom: Reading + Meaning + Stats compact */}
        <div className="mt-1.5 space-y-0.5">
          <p className="text-[10px] text-white/60 text-center font-medium truncate">{card.reading}</p>
          <p className="text-[9px] text-white/30 text-center truncate">{card.meaning}</p>
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <div className="flex items-center gap-0.5">
              <Swords className="w-2.5 h-2.5 text-orange-400" />
              <span className="text-[9px] text-white/50">{card.attackPower}</span>
            </div>
            <div className="w-px h-2.5 bg-white/10" />
            <div className="flex items-center gap-0.5">
              <Shield className="w-2.5 h-2.5 text-blue-400" />
              <span className="text-[9px] text-white/50">{card.defenseRating}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rarity glow for ultra rare */}
      {card.rarity === 'ULTRA_RARE' && (
        <div className="absolute inset-0 rounded-xl ring-1 ring-[#f0bf63]/40 animate-pulse pointer-events-none" />
      )}
    </motion.div>
  );
}

// Janken (Rock Paper Scissors) Game
function JankenGame({ onBack }: { onBack: () => void }) {
  const { addCoins, addDiamonds, trackQuestEvent } = useCollectionStore();
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [oppChoice, setOppChoice] = useState<string | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(1);
  const [streak, setStreak] = useState(0);

  const choices = [
    { id: 'rock', emoji: '✊', label: 'Batu' },
    { id: 'paper', emoji: '✋', label: 'Kertas' },
    { id: 'scissors', emoji: '✌️', label: 'Gunting' },
  ];

  const getResult = (p: string, o: string): 'win' | 'lose' | 'draw' => {
    if (p === o) return 'draw';
    if (
      (p === 'rock' && o === 'scissors') ||
      (p === 'paper' && o === 'rock') ||
      (p === 'scissors' && o === 'paper')
    ) return 'win';
    return 'lose';
  };

  const play = (choice: string) => {
    if (isPlaying) return;
    setIsPlaying(true);
    setPlayerChoice(choice);

    const opp = choices[Math.floor(Math.random() * 3)];
    setOppChoice(opp.id);

    const r = getResult(choice, opp.id);
    setResult(r);

    setTimeout(() => {
      setScore(prev => ({
        ...prev,
        wins: r === 'win' ? prev.wins + 1 : prev.wins,
        losses: r === 'lose' ? prev.losses + 1 : prev.losses,
        draws: r === 'draw' ? prev.draws + 1 : prev.draws,
      }));
      if (r === 'win') {
        setStreak(s => s + 1);
        const reward = 10 + streak * 2;
        addCoins(reward);
        trackQuestEvent('BATTLE');
        if (streak >= 2) addDiamonds(1);
      } else {
        setStreak(0);
      }
      setRound(r => r + 1);
      setIsPlaying(false);
    }, 800);
  };

  const reset = () => {
    setPlayerChoice(null);
    setOppChoice(null);
    setResult(null);
  };

  const getResultText = () => {
    if (!result) return '';
    if (result === 'win') return streak > 1 ? `🏆 Menang! +${10 + (streak - 1) * 2} coins +1💎 (${streak}x streak!)` : '🏆 Menang! +10 coins';
    if (result === 'lose') return '💀 Kalah!';
    return '🤝 Seri!';
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-xs text-white/40 hover:text-white">
        ← Pilih Mode
      </button>

      {/* Score board */}
      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
        <div className="text-center">
          <div className="text-lg font-bold text-green-400">{score.wins}</div>
          <div className="text-xs text-white/40">Menang</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-400">{score.draws}</div>
          <div className="text-xs text-white/40">Seri</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-400">{score.losses}</div>
          <div className="text-xs text-white/40">Kalah</div>
        </div>
      </div>

      {streak >= 2 && (
        <div className="text-center py-2 rounded-xl" style={{ backgroundColor: '#f0bf6333' }}>
          <span className="text-sm font-bold text-yellow-400">🔥 {streak}x Streak! +1 💎</span>
        </div>
      )}

      {/* Battle arena */}
      <div className="flex items-center justify-between py-6 px-4 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
        {/* Player */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ backgroundColor: playerChoice ? '#6c5ce733' : '#162125', border: `2px solid ${playerChoice ? colors.brand : 'transparent'}` }}
          >
            {playerChoice ? choices.find(c => c.id === playerChoice)?.emoji : '❓'}
          </div>
          <span className="text-xs text-white/60">Kamu</span>
        </div>

        {/* VS / Result */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-black text-white/30">VS</span>
          {result && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-2xl">{result === 'win' ? '🏆' : result === 'lose' ? '💀' : '🤝'}</div>
              <p className="text-xs text-white/80 mt-1 whitespace-nowrap">{getResultText()}</p>
            </motion.div>
          )}
        </div>

        {/* Opponent */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ backgroundColor: oppChoice ? '#ff6b3533' : '#162125', border: `2px solid ${oppChoice ? '#ff6b35' : 'transparent'}` }}
          >
            {oppChoice ? choices.find(c => c.id === oppChoice)?.emoji : '🤖'}
          </div>
          <span className="text-xs text-white/60">Bot</span>
        </div>
      </div>

      {/* Opponent thinking indicator */}
      {playerChoice && !oppChoice && (
        <div className="text-center">
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className="text-sm text-white/40"
          >
           🤖 Bot sedang memilih...
          </motion.div>
        </div>
      )}

      {/* Choice buttons */}
      {!playerChoice || !result ? (
        <div className="flex justify-center gap-4">
          {choices.map(c => (
            <motion.button
              key={c.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => play(c.id)}
              disabled={isPlaying}
              className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 disabled:opacity-40"
              style={{ backgroundColor: colors.cardBg, border: `2px solid ${colors.brand}60` }}
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="text-[10px] text-white/60">{c.label}</span>
            </motion.button>
          ))}
        </div>
      ) : (
        <button
          onClick={reset}
          className="w-full py-3 rounded-xl font-bold text-white"
          style={{ backgroundColor: colors.brand }}
        >
          ▶️ Main Lagi
        </button>
      )}

      {/* Rounds */}
      <p className="text-center text-xs text-white/30">Ronde {round}</p>
    </div>
  );
}

// Battle Tab Content
function BattleContent() {
  const router = useRouter();
  const { ownedPokemon, decks, activeDeckId, setActiveDeck, getActiveDeck } = useCollectionStore();
  const [showDeckPicker, setShowDeckPicker] = useState(false);
  const [battleMode, setBattleMode] = useState<'card' | 'janken' | null>(null);

  const activeDeck = getActiveDeck();
  const hasDeck = activeDeck && activeDeck.cardIds.length >= 5;

  const handleBattle = () => {
    if (!activeDeck) {
      if (decks.length === 0) {
        router.push('/deck');
      } else {
        setShowDeckPicker(true);
      }
    } else {
      router.push('/battle?mode=card');
    }
  };

  const handleSelectDeck = (deckId: string) => {
    setActiveDeck(deckId);
    setShowDeckPicker(false);
    router.push('/battle?mode=card');
  };

  // Janken (Rock Paper Scissors) inline game
  if (battleMode === 'janken') {
    return <JankenGame onBack={() => router.push('/collection?tab=battle')} />;
  }

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      {battleMode === null && (
        <>
          <div className="text-center mb-2">
            <p className="text-sm text-white/50">Pilih mode battle</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setBattleMode('card')}
              className="p-5 rounded-2xl flex flex-col items-center gap-2"
              style={{ backgroundColor: colors.cardBg, border: `2px solid ${colors.brand}40` }}
            >
              <span className="text-4xl">🃏</span>
              <span className="font-bold text-white text-sm">Card Battle</span>
              <span className="text-xs text-white/40 text-center">Pakai kartu deck untuk menang</span>
            </button>
            <button
              onClick={() => setBattleMode('janken')}
              className="p-5 rounded-2xl flex flex-col items-center gap-2"
              style={{ backgroundColor: colors.cardBg, border: `2px solid ${colors.teal}40` }}
            >
              <span className="text-4xl">✌️</span>
              <span className="font-bold text-white text-sm">Janken</span>
              <span className="text-xs text-white/40 text-center">Batu Gunting Kertas</span>
            </button>
          </div>
        </>
      )}

      {/* Card battle UI */}
      {battleMode === 'card' && (
        <>
          <button
            onClick={() => setBattleMode(null)}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white"
          >
            ← Pilih Mode
          </button>

          {/* Deck status card */}
          <div className="p-4 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">⚔️</span>
              <div className="flex-1">
                <p className="font-bold text-white">
                  {activeDeck ? activeDeck.name : 'Belum pilih deck'}
                </p>
                <p className="text-xs text-white/40">
                  {activeDeck ? `${activeDeck.cardIds.length} kartu` : 'Pilih deck untuk battle'}
                </p>
              </div>
              {activeDeck && (
                <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: '#4bddb733', color: '#4bddb7' }}>
                  ACTIVE
                </span>
              )}
            </div>

            {!hasDeck && (
              <p className="text-xs text-red-400 mb-3">Deck minimal 5 kartu untuk battle</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => router.push('/deck')}
                className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm"
                style={{ backgroundColor: '#162125' }}
              >
                {decks.length === 0 ? '📝 Buat Deck' : '🔧 Edit Deck'}
              </button>
              <button
                onClick={handleBattle}
                disabled={!hasDeck && !!activeDeck}
                className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-40"
                style={{ backgroundColor: hasDeck ? colors.brand : '#2b363b' }}
              >
                ⚔️ {hasDeck ? 'Mulai Battle' : 'Pilih Deck Dulu'}
              </button>
            </div>
          </div>

          {/* Deck list */}
          {decks.length > 0 && (
            <div>
              <p className="text-xs text-white/40 mb-2 px-1">Deck tersedia:</p>
              <div className="space-y-2">
                {decks.map(deck => (
                  <button
                    key={deck.id}
                    onClick={() => handleSelectDeck(deck.id)}
                    className="w-full p-3 rounded-xl flex items-center gap-3"
                    style={{
                      backgroundColor: colors.cardBg,
                      border: activeDeckId === deck.id ? `2px solid ${colors.teal}` : `2px solid transparent`,
                    }}
                  >
                    <span className="text-xl">🃏</span>
                    <div className="flex-1 text-left">
                      <p className="font-bold text-white text-sm">{deck.name}</p>
                      <p className="text-xs text-white/40">{deck.cardIds.length} kartu</p>
                    </div>
                    {activeDeckId === deck.id && (
                      <span className="text-xs font-bold" style={{ color: colors.teal }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No deck message */}
          {decks.length === 0 && (
            <div className="text-center py-6 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
              <span className="text-4xl">🃏</span>
              <p className="text-sm text-white/60 mt-2 mb-3">Kamu belum punya deck</p>
              <button
                onClick={() => router.push('/deck')}
                className="px-6 py-2 rounded-xl font-bold text-white text-sm"
                style={{ backgroundColor: colors.brand }}
              >
                Buat Deck Pertama
              </button>
            </div>
          )}

          {/* No pokemon message */}
          {ownedPokemon.length < 3 && (
            <div className="text-center py-4 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
              <p className="text-xs text-white/40">Minimum 3 Pokemon dibutuhkan untuk battle</p>
              <button
                onClick={() => router.push('/shop')}
                className="mt-2 px-4 py-2 rounded-xl bg-[#4bddb7] text-black text-xs font-bold"
              >
                🎯 Tangkap Pokemon
              </button>
            </div>
          )}

          {/* Deck picker modal */}
          {showDeckPicker && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDeckPicker(false)}>
              <div
                className="w-full max-w-md rounded-t-3xl p-6"
                style={{ backgroundColor: '#0f1923' }}
                onClick={e => e.stopPropagation()}
              >
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-4">Pilih Deck untuk Battle</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {decks.map(deck => (
                    <button
                      key={deck.id}
                      onClick={() => handleSelectDeck(deck.id)}
                      className="w-full p-4 rounded-xl flex items-center gap-3"
                      style={{ backgroundColor: colors.cardBg }}
                    >
                      <span className="text-2xl">🃏</span>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-white">{deck.name}</p>
                        <p className="text-xs text-white/40">{deck.cardIds.length} kartu</p>
                      </div>
                      <span style={{ color: colors.teal }}>›</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowDeckPicker(false)}
                  className="w-full mt-4 py-3 rounded-xl text-white/40 font-bold text-sm"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PokemonCardItem({ card, index, onClick }: { card: PokemonCard; index: number; onClick?: (card: PokemonCard) => void }) {
  const typeColor = TYPE_COLORS[card.types[0]] || '#a8a8a8';
  const elColor = elementColors[card.types[0] as keyof typeof elementColors] || '#a8a8a8';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: 'easeOut' }}
      className="relative rounded-xl overflow-hidden cursor-pointer"
      style={{ backgroundColor: '#1a1a2e' }}
      onClick={() => onClick?.(card)}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2 }}
    >
      {/* Rarity top bar - thin accent line */}
      <div className={`h-0.5 ${
        card.rarity === 'ULTRA_RARE' ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8c00]' :
        card.rarity === 'RARE' ? 'bg-[#c77dff]' :
        card.rarity === 'UNCOMMON' ? 'bg-[#4facfe]' : 'bg-white/10'
      }`} />

      <div className="p-2">
        {/* Top row: Type icon + ID */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <span className="text-xs" style={{ color: elColor }}>
              {card.types[0] === 'FIRE' ? '🔥' :
               card.types[0] === 'WATER' ? '💧' :
               card.types[0] === 'GRASS' ? '🌱' :
               card.types[0] === 'ELECTRIC' ? '⚡' :
               card.types[0] === 'PSYCHIC' ? '🔮' : '✨'}
            </span>
            <span className="text-[9px] text-white/30 font-medium">#{card.pokemonId.toString().padStart(3, '0')}</span>
          </div>
          {card.rarity !== 'COMMON' && (
            <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: `${rarityColors[card.rarity]}25`, color: rarityColors[card.rarity] }}>
              {card.rarity === 'ULTRA_RARE' ? 'UR' : card.rarity === 'RARE' ? 'R' : 'U'}
            </span>
          )}
        </div>

        {/* Pokemon Image */}
        <div className="flex items-center justify-center py-1" style={{ background: `linear-gradient(180deg, ${typeColor}10 0%, transparent 100%)` }}>
          <img src={card.image} alt={card.name} className="w-14 h-14 object-contain" loading="lazy" />
        </div>

        {/* Name + Stats compact */}
        <div className="mt-1.5 space-y-0.5">
          <p className="text-[10px] font-bold text-white text-center capitalize truncate leading-tight">{card.name}</p>
          <div className="flex items-center justify-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <Heart className="w-2.5 h-2.5 text-red-400" />
              <span className="text-[9px] text-white/50">{card.hp}</span>
            </div>
            <div className="w-px h-2.5 bg-white/10" />
            <div className="flex items-center gap-0.5">
              <Swords className="w-2.5 h-2.5 text-orange-400" />
              <span className="text-[9px] text-white/50">{card.attack}</span>
            </div>
            <div className="w-px h-2.5 bg-white/10" />
            <div className="flex items-center gap-0.5">
              <Shield className="w-2.5 h-2.5 text-blue-400" />
              <span className="text-[9px] text-white/50">{card.defense}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Pokemon Detail Modal
function PokemonDetailModal({ card, onClose }: { card: PokemonCard; onClose: () => void }) {
  const typeColor = TYPE_COLORS[card.types[0]] || '#a8a8a8';
  const elementColor = elementColors[card.types[0] as keyof typeof elementColors] || '#a8a8a8';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ backgroundColor: '#1a1a2e' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Rarity top bar */}
        <div className={`h-1.5 ${
          card.rarity === 'ULTRA_RARE' ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8c00]' :
          card.rarity === 'RARE' ? 'bg-[#c77dff]' :
          card.rarity === 'UNCOMMON' ? 'bg-[#4facfe]' : 'bg-white/20'
        }`} />

        {/* Header with image */}
        <div className="relative p-6 flex flex-col items-center" style={{ background: `linear-gradient(180deg, ${typeColor}20 0%, #1a1a2e 100%)` }}>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#162125' }}
          >
            <X className="w-4 h-4 text-white/60" />
          </button>

          {/* Pokemon ID + Name */}
          <p className="text-sm text-white/40 font-medium mb-1">#{card.pokemonId.toString().padStart(4, '0')}</p>
          <h2 className="text-xl font-black text-white capitalize mb-2">{card.name}</h2>

          {/* Type badges */}
          <div className="flex gap-2 mb-4">
            {card.types.map(t => (
              <span key={t} className="px-3 py-1 rounded-full text-xs font-bold uppercase text-white"
                style={{ backgroundColor: TYPE_COLORS[t] + 'dd' }}>{t}</span>
            ))}
          </div>

          {/* Pokemon Image */}
          <div className="w-40 h-40 flex items-center justify-center">
            <img src={card.image} alt={card.name} className="w-full h-full object-contain" />
          </div>

          {/* Rarity badge */}
          <div
            className="mt-3 px-3 py-1 rounded-full text-xs font-bold"
            style={{ backgroundColor: `${rarityColors[card.rarity]}20`, color: rarityColors[card.rarity] }}
          >
            {card.rarity.replace('_', ' ')}
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-5 space-y-4">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Statistik</h3>

          {/* HP */}
          <div className="flex items-center gap-3">
            <div className="w-10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/60">HP</span>
                <span className="text-sm font-bold text-white">{card.hp}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#0a0a1a' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (card.hp / 255) * 100)}%` }}
                  style={{ backgroundColor: '#ff6b6b' }}
                />
              </div>
            </div>
          </div>

          {/* Attack */}
          <div className="flex items-center gap-3">
            <div className="w-10 flex items-center justify-center">
              <Swords className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/60">Attack</span>
                <span className="text-sm font-bold text-white">{card.attack}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#0a0a1a' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (card.attack / 255) * 100)}%` }}
                  style={{ backgroundColor: '#ffa500' }}
                />
              </div>
            </div>
          </div>

          {/* Defense */}
          <div className="flex items-center gap-3">
            <div className="w-10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-white/60">Defense</span>
                <span className="text-sm font-bold text-white">{card.defense}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#0a0a1a' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (card.defense / 255) * 100)}%` }}
                  style={{ backgroundColor: '#4facfe' }}
                />
              </div>
            </div>
          </div>

          {/* Speed (if available) */}
          {'speed' in card && card.speed && (
            <div className="flex items-center gap-3">
              <div className="w-10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">Speed</span>
                  <span className="text-sm font-bold text-white">{card.speed}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#0a0a1a' }}>
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ((card.speed as number) / 255) * 100)}%` }}
                    style={{ backgroundColor: '#ffd93d' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Element */}
          <div className="flex items-center gap-3 pt-2 border-t border-white/10">
            <div className="w-10 flex items-center justify-center">
              <span className="text-lg" style={{ color: elementColor }}>
                {card.types[0] === 'FIRE' ? '🔥' :
                 card.types[0] === 'WATER' ? '💧' :
                 card.types[0] === 'GRASS' ? '🌱' :
                 card.types[0] === 'ELECTRIC' ? '⚡' :
                 card.types[0] === 'PSYCHIC' ? '🔮' : '⭐'}
              </span>
            </div>
            <div className="flex-1">
              <span className="text-xs text-white/60">Element</span>
              <p className="text-sm font-bold text-white capitalize">{card.types[0].toLowerCase()}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
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

  const currentPath = usePathname();
  const isActive = (route: string) => currentPath === route;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-50" style={{ backgroundColor: '#162125' }}>
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

export default function CollectionPage() {
  const router = useRouter();
  const { ownedPokemon, coins, ownedCards } = useCollectionStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [categoryFilter, setCategoryFilter] = useState<FilterType>('all');
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonCard | null>(null);

  // For Japanese tab: show owned cards directly from ownedCards store
  // (starter cards jp_starter_1-5 are NOT in CARDS_BY_ID, they exist only in ownedCards)
  const displayedJapanese = activeTab === 'japanese'
    ? ownedCards.map(oc => oc.card)
    : activeTab === 'all'
      ? ownedCards.slice(0, 6).map(oc => oc.card)
      : ownedCards.map(oc => oc.card);

  const totalOwned = ownedCards.length + ownedPokemon.length;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#d8e4ea]">Koleksiku</h1>
            <p className="text-sm text-[#c8c4d7]">{totalOwned} kartu terkumpul</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🃏</span>
            <span className="text-sm font-medium text-[#c8c4d7]">📦 {ownedCards.length} + 🎮 {ownedPokemon.length}</span>
          </div>
        </div>

        {/* Tabs: All / Jepang / Pokemon */}
        <div className="px-4 mb-3">
          <div className="flex gap-2 p-1 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
            {[
              { id: 'all' as TabType, label: 'Semua', icon: '📦' },
              { id: 'japanese' as TabType, label: 'Kartu Jepang', icon: '📜' },
              { id: 'pokemon' as TabType, label: 'Pokemon', icon: '🎮' },
              { id: 'battle' as TabType, label: 'Battle', icon: '⚔️' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-white/40'
                }`}
                style={activeTab === tab.id ? { backgroundColor: colors.brand } : {}}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category filters (only for Japanese) */}
        {activeTab !== 'pokemon' && (
          <div className="px-4 mb-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: 'all' as FilterType, label: 'Semua' },
                { id: 'verbs' as FilterType, label: 'Kata Kerja' },
                { id: 'nouns' as FilterType, label: 'Kata Benda' },
                { id: 'adjectives' as FilterType, label: 'Kata Sifat' },
                { id: 'particles' as FilterType, label: 'Partikel' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all"
                  style={
                    categoryFilter === cat.id
                      ? { backgroundColor: colors.brand, color: 'white' }
                      : { backgroundColor: '#162125', color: colors.darkText }
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Summary */}
        <div className="px-4 mb-3 flex gap-3">
          <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: colors.cardBg }}>
            <div className="text-lg font-bold text-[#4bddb7]">{ownedCards.length}</div>
            <div className="text-xs text-[#c8c4d7]">Kartu Jepang</div>
          </div>
          <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: colors.cardBg }}>
            <div className="text-lg font-bold text-[#ff6b35]">{ownedPokemon.length}</div>
            <div className="text-xs text-[#c8c4d7]">Pokemon</div>
          </div>
          <div className="flex-1 p-3 rounded-xl text-center" style={{ backgroundColor: colors.cardBg }}>
            <div className="text-lg font-bold text-[#f0bf63]">{ownedPokemon.filter(p => p.rarity === 'ULTRA_RARE').length}</div>
            <div className="text-xs text-[#c8c4d7]">Ultra Rare</div>
          </div>
        </div>

        {/* Card Grid */}
        <div className="px-4">
          {/* Japanese Cards */}
          {(activeTab === 'all' || activeTab === 'japanese') && (
            <div>
              {activeTab === 'all' && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-white/30 font-medium">KARTU JEPANG</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {displayedJapanese.slice(0, activeTab === 'all' ? 6 : undefined).map((card, i) => (
                  <JapaneseCardItem key={card.id} card={card} index={i} />
                ))}
              </div>
              {displayedJapanese.length > (activeTab === 'all' ? 6 : 0) && (
                <p className="text-center text-xs text-[#c8c4d7] py-2 mb-4">
                  +{displayedJapanese.length - (activeTab === 'all' ? 6 : 0)} kartu Jepang lainnya
                </p>
              )}
            </div>
          )}

          {/* Pokemon Cards */}
          {(activeTab === 'all' || activeTab === 'pokemon') && (
            <div>
              {activeTab === 'all' && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-xs text-white/30 font-medium">POKEMON</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>
              )}
              {ownedPokemon.length === 0 ? (
                <div className="text-center py-8 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
                  <span className="text-4xl">🎮</span>
                  <p className="text-sm text-[#c8c4d7] mt-2 mb-3">Belum ada Pokemon</p>
                  <button onClick={() => router.push('/shop')} className="px-4 py-2 rounded-xl bg-[#6c5ce7] text-white text-xs font-bold">
                    Tangkap di Toko
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {ownedPokemon.map((card, i) => (
                    <PokemonCardItem key={card.id} card={card} index={i} onClick={setSelectedPokemon} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Battle Tab */}
          {activeTab === 'battle' && <BattleContent />}

          {/* Empty states */}
          {activeTab === 'pokemon' && ownedPokemon.length === 0 && (
            <div className="text-center py-12 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
              <span className="text-5xl">🎮</span>
              <p className="text-[#c8c4d7] mt-3 mb-4">Belum ada Pokemon yang ditangkap</p>
              <button onClick={() => router.push('/shop')} className="px-6 py-2 rounded-xl bg-[#4bddb7] text-black text-sm font-bold">
                🎯 Tangkap Sekarang
              </button>
            </div>
          )}

          {activeTab === 'japanese' && displayedJapanese.length === 0 && (
            <div className="text-center py-12">
              <span className="text-4xl">🔍</span>
              <p className="text-[#c8c4d7] mt-2">Tidak ada kartu yang cocok</p>
            </div>
          )}
        </div>
      </main>

      {/* Pokemon Detail Modal */}
      <AnimatePresence>
        {selectedPokemon && (
          <PokemonDetailModal card={selectedPokemon} onClose={() => setSelectedPokemon(null)} />
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}