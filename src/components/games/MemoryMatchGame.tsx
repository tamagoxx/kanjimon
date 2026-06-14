'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  generateMemoryMatchBoard,
  flipCard as flipCardPure,
  isBoardComplete,
  type MemoryMatchState,
  type MemoryCard,
} from '@/lib/memoryMatchLogic';
import { useMemoryMatchStore } from '@/store/memoryMatchStore';

// ============================================================
// Memory Match — Game Component
// ============================================================
// Rules:
// - 6 pairs (12 cards) on a 4x3 grid.
// - Click 2 cards. If they match (same kanji), both stay flipped.
//   Otherwise flip them back after 800ms.
// - Score: 100 per match + 10 × combo bonus.
// - Timer counts up. All pairs matched → win.
// ============================================================

const POOL: { kanji: string; romaji: string }[] = [
  { kanji: '水', romaji: 'mizu' },
  { kanji: '火', romaji: 'hi' },
  { kanji: '風', romaji: 'kaze' },
  { kanji: '山', romaji: 'yama' },
  { kanji: '人', romaji: 'hito' },
  { kanji: '月', romaji: 'tsuki' },
  { kanji: '木', romaji: 'ki' },
  { kanji: '犬', romaji: 'inu' },
  { kanji: '花', romaji: 'hana' },
  { kanji: '空', romaji: 'sora' },
  { kanji: '雨', romaji: 'ame' },
  { kanji: '雪', romaji: 'yuki' },
];

const PAIRS_PER_GAME = 6;
const FLIP_BACK_MS = 800;
const MATCH_BASE_SCORE = 100;
const COMBO_BONUS = 10;

function freshBoard(): MemoryMatchState {
  return { board: generateMemoryMatchBoard(PAIRS_PER_GAME, POOL), score: 0, combo: 0 };
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function scoreForMatch(combo: number): number {
  return MATCH_BASE_SCORE + COMBO_BONUS * combo;
}

export default function MemoryMatchGame() {
  const [logic, setLogic] = useState<MemoryMatchState>(() => freshBoard());
  const [status, setStatus] = useState<'IDLE' | 'PLAYING' | 'WIN'>('IDLE');
  const [locked, setLocked] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const startedAtRef = useRef<number>(0);

  const recordRun = useMemoryMatchStore(s => s.recordRun);
  const recentRuns = useMemoryMatchStore(s => s.recentRuns);
  const highScore = useMemoryMatchStore(s => s.highScore);

  // Timer tick (1Hz) while playing
  useEffect(() => {
    if (status !== 'PLAYING') return;
    const id = window.setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [status]);

  // After 2nd card flipped, schedule flip-back if no match
  useEffect(() => {
    const flipped = logic.board.filter(c => c.isFlipped && !c.isMatched);
    if (flipped.length < 2) return;

    const isMatch = flipped[0].kanji === flipped[1].kanji;
    if (isMatch) {
      // Both stay flipped; check win
      if (isBoardComplete(logic)) {
        const durationSec = Math.floor((Date.now() - startedAtRef.current) / 1000);
        setStatus('WIN');
        recordRun({
          score: logic.score,
          pairsMatched: logic.combo, // Wait — combo != pairsMatched (combo can be > N)
          totalPairs: PAIRS_PER_GAME,
          maxCombo: logic.combo,
          durationSec,
          playedAt: new Date().toISOString(),
        });
      }
      return;
    }

    // Mismatch — flip both back after delay
    setLocked(true);
    const id = window.setTimeout(() => {
      setLogic(prev => ({
        ...prev,
        board: prev.board.map(c =>
          c.isFlipped && !c.isMatched ? { ...c, isFlipped: false } : c,
        ),
        combo: 0,
      }));
      setLocked(false);
    }, FLIP_BACK_MS);
    return () => window.clearTimeout(id);
  }, [logic, recordRun]);

  const handleStart = useCallback(() => {
    setLogic(freshBoard());
    setStatus('PLAYING');
    setElapsedSec(0);
    startedAtRef.current = Date.now();
  }, []);

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (status !== 'PLAYING' || locked) return;
      setLogic(prev => {
        const next = flipCardPure(prev, cardId);
        // Apply combo bonus on match
        if (next.combo > prev.combo) {
          const bonus = scoreForMatch(next.combo);
          return { ...next, score: next.score + bonus };
        }
        return next;
      });
    },
    [status, locked],
  );

  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🧠 Memory Match</h1>
        <div className="flex gap-4 text-sm">
          <span>⏱ {formatTime(elapsedSec)}</span>
          <span>⭐ {logic.score}</span>
          <span>🔥 Combo {logic.combo}</span>
        </div>
      </header>

      {status === 'IDLE' ? (
        <div className="flex flex-col items-center gap-4 p-8">
          <p className="text-slate-300">Cocokkan kartu kanji dengan romajinya!</p>
          <p className="text-sm text-slate-400">
            6 pasang (12 kartu) • Skor + combo • Tanpa batas waktu
          </p>
          <button
            onClick={handleStart}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-bold text-slate-900 hover:bg-emerald-400"
          >
            Mulai Main →
          </button>
          {highScore > 0 && (
            <p className="text-xs text-slate-500">Skor tertinggi: {highScore}</p>
          )}
        </div>
      ) : status === 'WIN' ? (
        <div className="flex flex-col items-center gap-4 p-8">
          <h2 className="text-3xl font-bold text-emerald-400">🎉 Menang!</h2>
          <div className="text-center">
            <p className="text-lg">Skor akhir: <strong>{logic.score}</strong></p>
            <p className="text-sm text-slate-400">
              {PAIRS_PER_GAME} pasangan dalam {formatTime(elapsedSec)} • Combo terbaik: {logic.combo}
            </p>
          </div>
          <button
            onClick={handleStart}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-bold text-slate-900 hover:bg-emerald-400"
          >
            Main Lagi →
          </button>
        </div>
      ) : (
        <Board board={logic.board} onCardClick={handleCardClick} />
      )}

      {recentRuns.length > 0 && status !== 'PLAYING' && (
        <div className="mt-4 border-t border-slate-700 pt-4 text-sm">
          <h3 className="mb-2 font-bold text-slate-300">Run Terakhir</h3>
          <ul className="space-y-1 text-slate-400">
            {recentRuns.slice(0, 3).map((r, i) => (
              <li key={i}>
                {r.score} pts • {r.pairsMatched}/{r.totalPairs} pairs •{' '}
                {formatTime(r.durationSec)} • {new Date(r.playedAt).toLocaleString('id-ID')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Board({
  board,
  onCardClick,
}: {
  board: MemoryCard[];
  onCardClick: (id: string) => void;
}) {
  return (
    <div
      className="grid gap-3 mx-auto"
      style={{
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        maxWidth: '480px',
      }}
    >
      {board.map(card => (
        <Card key={card.id} card={card} onClick={() => onCardClick(card.id)} />
      ))}
    </div>
  );
}

function Card({ card, onClick }: { card: MemoryCard; onClick: () => void }) {
  const showFace = card.isFlipped || card.isMatched;
  return (
    <button
      onClick={onClick}
      disabled={card.isMatched}
      className={[
        'aspect-square rounded-lg text-2xl font-bold transition-all',
        'flex items-center justify-center',
        showFace
          ? card.isMatched
            ? 'bg-emerald-500/20 text-emerald-300 border-2 border-emerald-500/40'
            : 'bg-slate-700 text-white border-2 border-slate-500'
          : 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white hover:scale-105',
      ].join(' ')}
    >
      {showFace ? (card.side === 'kanji' ? card.kanji : card.romaji) : '?'}
    </button>
  );
}
