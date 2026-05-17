'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore } from '@/store/collectionStore';
import { useAuthStore } from '@/store/authStore';
import { allJapaneseCards } from '@/data/cards';
import { ArrowLeft, Shield, Heart, Zap } from 'lucide-react';

const choices = [
  { id: 'rock', emoji: '✊', label: 'Batu', beats: 'scissors' },
  { id: 'paper', emoji: '✋', label: 'Kertas', beats: 'rock' },
  { id: 'scissors', emoji: '✌️', label: 'Gunting', beats: 'paper' },
];

function getResult(player: string, bot: string): 'win' | 'lose' | 'draw' {
  if (player === bot) return 'draw';
  const c = choices.find(c => c.id === player);
  return c && c.beats === bot ? 'win' : 'lose';
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Get 5 random Japanese cards as question pool
function getQuestionPool() {
  return shuffle(allJapaneseCards).slice(0, 30);
}

// Generate a question from a Japanese card
function makeQuestion(card: any) {
  const types = ['meaning', 'reading'];
  const type = types[Math.floor(Math.random() * types.length)];
  if (type === 'meaning') {
    const meanings = card.meaning.split(',').map((m: string) => m.trim());
    const correct = meanings[0];
    const pool = shuffle(allJapaneseCards.filter(c => c.id !== card.id)).slice(0, 3);
    const opts = shuffle([correct, ...pool.map((c: any) => c.meaning.split(',')[0].trim())]);
    return {
      question: `Apa arti "${card.japanese}" (${card.reading})?`,
      opts,
      answer: correct,
      card,
    };
  } else {
    // Reading question
    const pool = shuffle(allJapaneseCards.filter(c => c.id !== card.id)).slice(0, 3);
    const opts = shuffle([card.reading, ...pool.map((c: any) => c.reading)]);
    return {
      question: `Bagaimana cara baca "${card.japanese}"?`,
      opts,
      answer: card.reading,
      card,
    };
  }
}

// ============================================================
// Reward Card Modal
// ============================================================
function RewardCardModal({ card, onClose }: { card: any; onClose: () => void }) {
  const elementColors: Record<string, string> = {
    FIRE: '#ffb4ab', WATER: '#6c5ce7', GRASS: '#4bddb7',
    ELECTRIC: '#f0bf63', PSYCHIC: '#c6bfff', NORMAL: '#c8c4d7',
  };
  const col = elementColors[card.element] || '#c8c4d7';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-xs"
      >
        <div className="text-center mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.5 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-6xl mb-3"
          >🏆</motion.div>
          <h2 className="text-2xl font-black text-white">Kamu Menang 5 Ronde!</h2>
          <p className="text-white/50 text-sm mt-1">Kartu Bahasa Jepang obtained</p>
        </div>

        {/* Reward card */}
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ background: '#1a1a2e', border: `3px solid ${col}60` }}
        >
          <div className="p-4 flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-3"
              style={{ backgroundColor: `${col}25` }}
            >
              {card.element === 'FIRE' ? '🔥' :
               card.element === 'WATER' ? '💧' :
               card.element === 'GRASS' ? '🌱' :
               card.element === 'ELECTRIC' ? '⚡' :
               card.element === 'PSYCHIC' ? '🔮' : '⚪'}
            </div>
            <p className="text-2xl font-black text-white mb-1">{card.japanese}</p>
            <p className="text-sm text-white/60 mb-1">{card.reading}</p>
            <p className="text-sm font-bold" style={{ color: col }}>{card.meaning}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">{card.type}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${col}30`, color: col }}>{card.rarity}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-white"
          style={{ backgroundColor: '#6c5ce7' }}
        >
          Terima kasih!
        </button>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Question Phase Modal
// ============================================================
function QuestionPhase({
  question,
  playerWins,
  botHp,
  maxBotHp,
  onAnswer,
}: {
  question: { question: string; opts: string[]; answer: string; card: any };
  playerWins: number;
  botHp: number;
  maxBotHp: number;
  onAnswer: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = (opt: string) => {
    if (answered) return;
    setSelected(opt);
    const correct = opt === question.answer;
    setIsCorrect(correct);
    setAnswered(true);
    setTimeout(() => onAnswer(correct), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm"
      >
        <div className="rounded-2xl overflow-hidden" style={{ background: '#1a1a2e', borderTop: '3px solid #6c5ce7' }}>
          <div className="p-4 text-center border-b border-white/10">
            <p className="text-xs text-white/40 mb-1">Menang ronde {playerWins} — Lempar pertanyaan!</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-white/60">🤖 Bot HP</span>
              <div className="w-24 h-2 rounded-full overflow-hidden bg-black/50">
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${(botHp / maxBotHp) * 100}%` }}
                  style={{ backgroundColor: botHp / maxBotHp > 0.5 ? '#4bddb7' : botHp / maxBotHp > 0.25 ? '#ffd93d' : '#ff6b35' }}
                />
              </div>
              <span className="text-sm text-white">{botHp}/{maxBotHp}</span>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-bold text-white text-center mb-4">📚 Quiz Time!</h3>
            <p className="text-base text-white text-center mb-6">{question.question}</p>

            <div className="space-y-3">
              {question.opts.map((opt, i) => {
                let bg = '#2d2d44';
                let border = 'transparent';
                if (answered && opt === question.answer) {
                  bg = '#4bddb733';
                  border = '#4bddb7';
                }
                if (answered && selected === opt && opt !== question.answer) {
                  bg = '#ff6b3533';
                  border = '#ff6b35';
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt)}
                    disabled={answered}
                    className="w-full p-4 rounded-xl text-white text-left transition-all disabled:opacity-100"
                    style={{ backgroundColor: bg, border: `2px solid ${border}` }}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-center text-sm font-bold"
              >
                {isCorrect ? (
                  <span className="text-green-400">✅ Benar! Bot kehilangan HP!</span>
                ) : (
                  <span className="text-red-400">❌ Salah! Jawaban: {question.answer}</span>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// JankenGame Component
// ============================================================
export default function JankenGame({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { addCoins, addDiamonds, addJapaneseCard, trackQuestEvent } = useCollectionStore();
  const { addXP, incrementStat } = useAuthStore();

  const TOTAL_ROUNDS = 5;
  const MAX_BOT_HP = 100;
  const PLAYER_MAX_HP = 100;

  const [round, setRound] = useState(1);
  const [playerHp, setPlayerHp] = useState(PLAYER_MAX_HP);
  const [botHp, setBotHp] = useState(MAX_BOT_HP);
  const [playerArmor, setPlayerArmor] = useState(0);

  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const [botChoice, setBotChoice] = useState<string | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [gamePhase, setGamePhase] = useState<'janken' | 'question' | 'ended'>('janken');

  const [question, setQuestion] = useState<{ question: string; opts: string[]; answer: string; card: any } | null>(null);
  const [rewardCard, setRewardCard] = useState<any | null>(null);

  const questionPoolRef = allJapaneseCards;
  const [questionPool, setQuestionPool] = useState<any[]>([]);

  // Initialize question pool at start
  useEffect(() => {
    const pool = shuffle([...allJapaneseCards]).slice(0, 30);
    setQuestionPool(pool);
  }, []);

  const getNextQuestion = () => {
    if (questionPool.length === 0) {
      const pool = shuffle([...allJapaneseCards]).slice(0, 30);
      setQuestionPool(pool);
      return makeQuestion(pool[0]);
    }
    const idx = Math.floor(Math.random() * questionPool.length);
    const card = questionPool[idx];
    setQuestionPool(prev => prev.filter((_, i) => i !== idx));
    return makeQuestion(card);
  };

  const play = (choiceId: string) => {
    if (isRevealing) return;
    setPlayerChoice(choiceId);
    setIsRevealing(true);

    const bot = choices[Math.floor(Math.random() * 3)];
    setBotChoice(bot.id);

    const r = getResult(choiceId, bot.id);
    setResult(r);

    setTimeout(() => {
      setIsRevealing(false);

      if (r === 'draw') {
        // Draw: no HP change, next round
        setRound(prev => prev + 1);
        setPlayerChoice(null);
        setBotChoice(null);
        setResult(null);
      } else if (r === 'win') {
        // Win: player asks question
        setQuestion(getNextQuestion());
        setGamePhase('question');
      } else {
        // Lose: player loses HP (reduced by armor)
        const dmg = Math.max(10, 20 - playerArmor * 3);
        const newHp = Math.max(0, playerHp - dmg);
        setPlayerHp(newHp);

        if (newHp <= 0) {
          // Player lost all HP
          setGamePhase('ended');
          return;
        }

        // Check if all rounds done
        if (round >= TOTAL_ROUNDS) {
          setGamePhase('ended');
        } else {
          setRound(prev => prev + 1);
          setPlayerChoice(null);
          setBotChoice(null);
          setResult(null);
        }
      }
    }, 800);
  };

  const handleQuestionAnswer = (correct: boolean) => {
    if (correct) {
      // Bot loses HP
      const newBotHp = Math.max(0, botHp - 25);
      setBotHp(newBotHp);
      // Give armor
      setPlayerArmor(prev => Math.min(prev + 1, 5));
      trackQuestEvent('BATTLE');

      if (newBotHp <= 0) {
        // Bot HP 0, player wins early — give reward
        const xp = 15;
        const card = allJapaneseCards[Math.floor(Math.random() * allJapaneseCards.length)];
        addJapaneseCard(card);
        addXP(xp);
        incrementStat('battles');
        incrementStat('wins');
        setRewardCard(card);
        setGamePhase('ended');
        return;
      }
    }

    setQuestion(null);
    setGamePhase('janken');

    // Check if all rounds done
    if (round >= TOTAL_ROUNDS && correct) {
      // Won all rounds — give reward card
      const xp = 20;
      const card = allJapaneseCards[Math.floor(Math.random() * allJapaneseCards.length)];
      addJapaneseCard(card);
      addXP(xp);
      incrementStat('battles');
      incrementStat('wins');
      setRewardCard(card);
      setGamePhase('ended');
      return;
    }

    if (round >= TOTAL_ROUNDS) {
      // Completed all rounds without early win — player gets partial XP
      addXP(5);
      incrementStat('battles');
      setGamePhase('ended');
    } else {
      setRound(prev => prev + 1);
      setPlayerChoice(null);
      setBotChoice(null);
      setResult(null);
    }
  };

  const reset = () => {
    setRound(1);
    setPlayerHp(PLAYER_MAX_HP);
    setBotHp(MAX_BOT_HP);
    setPlayerArmor(0);
    setPlayerChoice(null);
    setBotChoice(null);
    setResult(null);
    setIsRevealing(false);
    setGamePhase('janken');
    setQuestion(null);
    setRewardCard(null);
    const pool = shuffle([...allJapaneseCards]).slice(0, 30);
    setQuestionPool(pool);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0d0d1a' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-orange-900/10" />

      <button
        onClick={() => router.push('/battle')}
        className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      <main className="relative z-10 flex flex-col h-screen px-4 py-16">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-black text-white mb-1">✌️ Janken Battle</h2>
          <p className="text-sm text-white/40">Kalahkan 5 ronde untuk dapat kartu!</p>
        </div>

        {/* HP and Status Bars */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Player */}
          <div className="rounded-xl p-3" style={{ backgroundColor: '#1a1a2e' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">🧑 Player</span>
              <div className="flex items-center gap-1">
                {playerArmor > 0 && (
                  <>
                    <Shield className="w-3 h-3 text-blue-400" />
                    <span className="text-xs text-blue-400 font-bold">{playerArmor}</span>
                  </>
                )}
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-black/50 mb-1">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${(playerHp / PLAYER_MAX_HP) * 100}%` }}
                style={{ backgroundColor: playerHp > 60 ? '#4bddb7' : playerHp > 30 ? '#ffd93d' : '#ff6b35' }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-xs text-white/60">{playerHp}/{PLAYER_MAX_HP} HP</span>
            </div>
          </div>

          {/* Bot */}
          <div className="rounded-xl p-3" style={{ backgroundColor: '#1a1a2e' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">🤖 Bot</span>
              <span className="text-xs text-white/40">Ronde {round}/{TOTAL_ROUNDS}</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-black/50 mb-1">
              <motion.div
                className="h-full rounded-full"
                animate={{ width: `${(botHp / MAX_BOT_HP) * 100}%` }}
                style={{ backgroundColor: botHp > 60 ? '#4bddb7' : botHp > 30 ? '#ffd93d' : '#ff6b35' }}
              />
            </div>
            <div className="flex items-center justify-between">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-white/60">{botHp}/{MAX_BOT_HP} HP</span>
            </div>
          </div>
        </div>

        {/* Status message */}
        {gamePhase === 'ended' && (
          <div className="text-center py-2 rounded-xl mb-3" style={{ backgroundColor: result === 'win' ? '#4bddb722' : '#ff6b3522' }}>
            <p className="text-sm font-bold" style={{ color: result === 'win' ? '#4bddb7' : '#ff6b35' }}>
              {result === 'win' ? '🎉 Kamu menang semua ronde!' : '💀 Kamu kalah!'}
            </p>
          </div>
        )}

        {/* Battle Arena */}
        <div className="flex items-center justify-between py-6 px-4 rounded-2xl mb-4" style={{ backgroundColor: '#1a1a2e' }}>
          {/* Player */}
          <div className="flex flex-col items-center gap-2">
            <motion.div
              key={playerChoice || 'player-idle'}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{
                backgroundColor: result === 'win' ? '#4bddb733' : result === 'lose' ? '#ff6b3533' : '#162125',
                border: `3px solid ${result === 'win' ? '#4bddb7' : result === 'lose' ? '#ff6b35' : playerChoice ? '#6c5ce7' : 'transparent'}`,
              }}
            >
              {playerChoice ? choices.find(c => c.id === playerChoice)?.emoji : '❓'}
            </motion.div>
            <span className="text-sm text-white/60">Kamu</span>
          </div>

          {/* VS / Result */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-black text-white/30">VS</span>
            {result && gamePhase === 'janken' && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <div className="text-3xl">
                  {result === 'win' ? '🟢' : result === 'lose' ? '🔴' : '🟡'}
                </div>
                <p className="text-xs text-white/60 mt-1">
                  {result === 'win' ? 'Menang!' : result === 'lose' ? 'Kalah!' : 'Seri!'}
                </p>
              </motion.div>
            )}
          </div>

          {/* Bot */}
          <div className="flex flex-col items-center gap-2">
            <motion.div
              key={botChoice || 'bot-idle'}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{
                backgroundColor: result === 'lose' ? '#4bddb733' : result === 'win' ? '#ff6b3533' : '#162125',
                border: `3px solid ${result === 'lose' ? '#4bddb7' : result === 'win' ? '#ff6b35' : botChoice ? '#ff6b35' : 'transparent'}`,
              }}
            >
              {botChoice ? choices.find(c => c.id === botChoice)?.emoji : '🤖'}
            </motion.div>
            <span className="text-sm text-white/60">Bot</span>
          </div>
        </div>

        {/* Choice Buttons */}
        {gamePhase === 'janken' && (
          <div className="flex justify-center gap-4 mt-auto">
            {choices.map(c => (
              <motion.button
                key={c.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => play(c.id)}
                disabled={isRevealing}
                className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 disabled:opacity-40"
                style={{ backgroundColor: '#1a1a2e', border: '2px solid #6c5ce760' }}
              >
                <span className="text-3xl">{c.emoji}</span>
                <span className="text-[10px] text-white/60">{c.label}</span>
              </motion.button>
            ))}
          </div>
        )}

        {/* End game buttons */}
        {gamePhase === 'ended' && (
          <div className="mt-auto space-y-3">
            <button
              onClick={reset}
              className="w-full py-3 rounded-xl font-bold text-white"
              style={{ backgroundColor: '#6c5ce7' }}
            >
              🔄 Main Lagi
            </button>
            <button
              onClick={() => router.push('/battle')}
              className="w-full py-3 rounded-xl font-bold text-white/60"
              style={{ backgroundColor: '#1a1a2e' }}
            >
              ← Kembali ke Battle
            </button>
          </div>
        )}
      </main>

      {/* Question Phase Modal */}
      <AnimatePresence>
        {question && gamePhase === 'question' && (
          <QuestionPhase
            question={question}
            playerWins={round}
            botHp={botHp}
            maxBotHp={MAX_BOT_HP}
            onAnswer={handleQuestionAnswer}
          />
        )}
      </AnimatePresence>

      {/* Reward Card Modal */}
      <AnimatePresence>
        {rewardCard && (
          <RewardCardModal card={rewardCard} onClose={() => setRewardCard(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}