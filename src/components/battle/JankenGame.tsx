'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCollectionStore } from '@/store/collectionStore';

const colors = {
  cardBg: '#1a1a2e',
  brand: '#6c5ce7',
};

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
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0d0d1a' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-orange-900/10" />

      <button
        onClick={onBack}
        className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center z-50"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <span className="text-white text-xl">←</span>
      </button>

      <main className="relative z-10 flex flex-col h-screen px-4 py-20">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-white mb-1">✌️ Janken Battle</h2>
          <p className="text-sm text-white/40">Batu Gunting Kertas</p>
        </div>

        {/* Score board */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl mb-4" style={{ backgroundColor: colors.cardBg }}>
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
          <div className="text-center py-2 rounded-xl mb-4" style={{ backgroundColor: '#f0bf6333' }}>
            <span className="text-sm font-bold text-yellow-400">🔥 {streak}x Streak! +1 💎</span>
          </div>
        )}

        {/* Battle arena */}
        <div className="flex items-center justify-between py-8 px-4 rounded-2xl mb-6" style={{ backgroundColor: colors.cardBg }}>
          {/* Player */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
              style={{ backgroundColor: playerChoice ? '#6c5ce733' : '#162125', border: `3px solid ${playerChoice ? colors.brand : 'transparent'}` }}
            >
              {playerChoice ? choices.find(c => c.id === playerChoice)?.emoji : '❓'}
            </div>
            <span className="text-sm text-white/60">Kamu</span>
          </div>

          {/* VS / Result */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl font-black text-white/30">VS</span>
            {result && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <div className="text-3xl">{result === 'win' ? '🏆' : result === 'lose' ? '💀' : '🤝'}</div>
                <p className="text-xs text-white/80 mt-1 whitespace-nowrap">{getResultText()}</p>
              </motion.div>
            )}
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
              style={{ backgroundColor: oppChoice ? '#ff6b3533' : '#162125', border: `3px solid ${oppChoice ? '#ff6b35' : 'transparent'}` }}
            >
              {oppChoice ? choices.find(c => c.id === oppChoice)?.emoji : '🤖'}
            </div>
            <span className="text-sm text-white/60">Bot</span>
          </div>
        </div>

        {/* Choice buttons */}
        {!result ? (
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
        <p className="text-center text-xs text-white/30 mt-4">Ronde {round}</p>
      </main>
    </div>
  );
}

export default JankenGame;