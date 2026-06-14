'use client';

import { useState, useEffect, useRef, useReducer, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pause, Play, RotateCcw, Home, Trophy, Layers } from 'lucide-react';
import {
  createBoard,
  generatePiece,
  canPlaceShape,
  placeShape,
  clearFullRows,
  rotateShape,
  calcLineScore,
  isGameOver as isGameOverLogic,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  type KanjiStackPool,
  type Board,
  type ActivePiece,
} from '@/lib/kanjiStackLogic';
import { useKanjiStackStore } from '@/store/kanjiStackStore';
import { useAuthStore } from '@/store/authStore';
import { submitScore } from '@/lib/leaderboardData';

// ============================================================
// Kanji Stack — Game Component (Tetris-mechanic)
// ============================================================
//
// Spatial puzzle: tetrominoes fall, player rotates/moves/drops.
// Each tetromino cell holds a kanji glyph → passive N5 learning
// during play. Line clear awards score; every 10 lines advances
// the level (faster fall).
//
// State management mirrors KanjiDrop:
//   - useReducer: discrete game state (phase, score, level, etc.)
//   - refs:        per-frame data (board, current piece, last tick time)
//
// This split avoids 60fps re-renders while keeping React-state-driven HUD.

type Phase = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

interface GameState {
  phase: Phase;
  score: number;
  level: number;
  totalLines: number;
  maxCombo: number;
  /** running combo: rows cleared in a row, reset on lock with 0 lines */
  combo: number;
  startedAt: number;
  /** bumped on each frame to force HUD re-render of the board */
  boardVersion: number;
}

type Action =
  | { type: 'START'; now: number }
  | { type: 'TICK' }
  | { type: 'LOCK'; rowsCleared: number; newLevel: number }
  | { type: 'GAMEOVER' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART'; now: number };

const INITIAL: GameState = {
  phase: 'IDLE',
  score: 0,
  level: 1,
  totalLines: 0,
  maxCombo: 0,
  combo: 0,
  startedAt: 0,
  boardVersion: 0,
};

const LINES_PER_LEVEL = 10;

// Fall speed: level 1 = 1000ms per cell, decreasing 80ms per level
const baseFallMs = 1000;
const fallStepMs = 80;
const minFallMs = 100;
function fallMsForLevel(level: number): number {
  return Math.max(minFallMs, baseFallMs - (level - 1) * fallStepMs);
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START':
    case 'RESTART':
      return { ...INITIAL, phase: 'PLAYING', startedAt: action.now, boardVersion: state.boardVersion + 1 };
    case 'TICK':
      return { ...state, boardVersion: state.boardVersion + 1 };
    case 'LOCK': {
      const newTotal = state.totalLines + action.rowsCleared;
      const newCombo = action.rowsCleared > 0 ? state.combo + 1 : 0;
      return {
        ...state,
        score: state.score + action.rowsCleared, // score added in tick; level bump here
        level: action.newLevel,
        totalLines: newTotal,
        combo: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        boardVersion: state.boardVersion + 1,
      };
    }
    case 'GAMEOVER':
      return { ...state, phase: 'GAMEOVER' };
    case 'PAUSE':
      if (state.phase !== 'PLAYING') return state;
      return { ...state, phase: 'PAUSED' };
    case 'RESUME':
      if (state.phase !== 'PAUSED') return state;
      return { ...state, phase: 'PLAYING' };
    default:
      return state;
  }
}

// ============================================================
// Component
// ============================================================

interface KanjiStackGameProps {
  initialPool: KanjiStackPool[];
  poolSize: number;
}

export default function KanjiStackGame({ initialPool }: KanjiStackGameProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const recordRun = useKanjiStackStore((s) => s.recordRun);
  const highScore = useKanjiStackStore((s) => s.highScore);
  const user = useAuthStore((s) => s.user);
  const runRecordedRef = useRef<boolean>(false);

  // ---- Refs for per-frame data (not React state) ----
  const boardRef = useRef<Board>(createBoard());
  const pieceRef = useRef<ActivePiece | null>(null);
  const lastFrameRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const fallMs = useMemo(() => fallMsForLevel(state.level), [state.level]);

  // ---- Start / restart ----
  const startGame = useCallback(() => {
    boardRef.current = createBoard();
    pieceRef.current = generatePiece(initialPool);
    lastFrameRef.current = 0;
    runRecordedRef.current = false;
    dispatch({ type: 'START', now: Date.now() });
  }, [initialPool]);

  // ---- Visible state for rendering (read refs during render) ----
  const board = state.phase === 'PLAYING' || state.phase === 'PAUSED' ? boardRef.current : createBoard();
  const piece = state.phase === 'PLAYING' || state.phase === 'PAUSED' ? pieceRef.current : null;

  // ---- Move / rotate / drop (discrete, no RAF) ----
  const tryMove = useCallback((dx: number): boolean => {
    if (state.phase !== 'PLAYING' || !pieceRef.current) return false;
    const p = pieceRef.current;
    if (canPlaceShape(boardRef.current, p.shape, p.x + dx, p.y)) {
      pieceRef.current = { ...p, x: p.x + dx };
      dispatch({ type: 'TICK' });
      return true;
    }
    return false;
  }, [state.phase]);

  const tryRotate = useCallback((): boolean => {
    if (state.phase !== 'PLAYING' || !pieceRef.current) return false;
    const p = pieceRef.current;
    const rotated = rotateShape(p.shape);
    if (canPlaceShape(boardRef.current, rotated, p.x, p.y)) {
      pieceRef.current = { ...p, shape: rotated };
      dispatch({ type: 'TICK' });
      return true;
    }
    return false;
  }, [state.phase]);

  const hardDrop = useCallback(() => {
    if (state.phase !== 'PLAYING' || !pieceRef.current) return;
    let p = pieceRef.current;
    while (canPlaceShape(boardRef.current, p.shape, p.x, p.y + 1)) {
      p = { ...p, y: p.y + 1 };
    }
    // Lock immediately
    boardRef.current = placeShape(boardRef.current, p.shape, p.kanjis, p.x, p.y);
    const { board: cleared, rowsCleared } = clearFullRows(boardRef.current);
    boardRef.current = cleared;
    const earned = calcLineScore(rowsCleared, stateRef.current.level);
    const newTotalLines = stateRef.current.totalLines + rowsCleared;
    const newLevel = Math.floor(newTotalLines / LINES_PER_LEVEL) + 1;
    dispatch({
      type: 'LOCK',
      rowsCleared: earned,
      newLevel,
    });
    // Spawn next piece; check game over
    const next = generatePiece(initialPool);
    if (isGameOverLogic(boardRef.current, next.shape)) {
      pieceRef.current = null;
      dispatch({ type: 'GAMEOVER' });
    } else {
      pieceRef.current = { ...next, x: Math.floor((BOARD_WIDTH - next.shape[0].length) / 2), y: 0 };
    }
  }, [state.phase, initialPool]);

  // ---- Game loop: gravity tick at fallMs interval ----
  useEffect(() => {
    if (state.phase !== 'PLAYING') return;
    lastFrameRef.current = 0;
    const onVis = () => { lastFrameRef.current = 0; };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'PLAYING') return;
    const tick = (timestamp: number) => {
      if (lastFrameRef.current === 0) {
        lastFrameRef.current = timestamp;
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }
      const dt = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;
      // Use refs to avoid stale closure on fallMs
      const fall = fallMsForLevel(stateRef.current.level);
      if (dt >= fall && pieceRef.current) {
        const p = pieceRef.current;
        if (canPlaceShape(boardRef.current, p.shape, p.x, p.y + 1)) {
          pieceRef.current = { ...p, y: p.y + 1 };
          dispatch({ type: 'TICK' });
        } else {
          // Auto-lock on gravity stall
          boardRef.current = placeShape(boardRef.current, p.shape, p.kanjis, p.x, p.y);
          const { board: cleared, rowsCleared } = clearFullRows(boardRef.current);
          boardRef.current = cleared;
          const earned = calcLineScore(rowsCleared, stateRef.current.level);
          const newTotalLines = stateRef.current.totalLines + rowsCleared;
          const newLevel = Math.floor(newTotalLines / LINES_PER_LEVEL) + 1;
          dispatch({ type: 'LOCK', rowsCleared: earned, newLevel });
          const next = generatePiece(initialPool);
          if (isGameOverLogic(boardRef.current, next.shape)) {
            pieceRef.current = null;
            dispatch({ type: 'GAMEOVER' });
          } else {
            pieceRef.current = { ...next, x: Math.floor((BOARD_WIDTH - next.shape[0].length) / 2), y: 0 };
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [state.phase, initialPool]);

  // ---- Game over → record run + submit to leaderboard ----
  useEffect(() => {
    if (state.phase === 'GAMEOVER' && !runRecordedRef.current) {
      runRecordedRef.current = true;
      const durationSec = Math.max(0, Math.round((Date.now() - state.startedAt) / 1000));
      const playedAt = new Date().toISOString();
      recordRun({
        score: state.score,
        level: state.level,
        totalLines: state.totalLines,
        maxCombo: state.maxCombo,
        durationSec,
        playedAt,
      });
      if (user?.id) {
        void submitScore({
          userId: user.id,
          username: user.username,
          gameMode: 'kanji-stack',
          score: state.score,
          wave: state.level,
          kills: state.totalLines,
          maxCombo: state.maxCombo,
          playedAt,
        });
      }
    }
  }, [state.phase, state.score, state.level, state.totalLines, state.maxCombo, state.startedAt, recordRun, user]);

  // ---- Keyboard (document-level so it works without focus) ----
  const handleKey = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      const ph = stateRef.current.phase;
      if (ph === 'PLAYING') {
        // hard drop
        hardDrop();
      } else if (ph === 'GAMEOVER' || ph === 'IDLE') {
        startGame();
      }
      return;
    }
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      e.preventDefault();
      const ph = stateRef.current.phase;
      if (ph === 'PLAYING') dispatch({ type: 'PAUSE' });
      else if (ph === 'PAUSED') dispatch({ type: 'RESUME' });
      return;
    }
    if (stateRef.current.phase !== 'PLAYING') return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); tryMove(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); tryMove(1); }
    else if (e.key === 'ArrowUp' || e.key === 'x' || e.key === 'X') { e.preventDefault(); tryRotate(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hardDrop(); } // soft drop = hard drop for simplicity
  }, [tryMove, tryRotate, hardDrop, startGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // ---- Render helpers ----
  const renderCell = (x: number, y: number): string | null => {
    // Active piece takes precedence
    if (piece) {
      const lx = x - piece.x;
      const ly = y - piece.y;
      if (lx >= 0 && lx < piece.shape[0]?.length && ly >= 0 && ly < piece.shape.length && piece.shape[ly][lx] === 1) {
        // Find the kanji at this cell (filled cells in row-major order)
        let idx = 0;
        for (let i = 0; i < ly; i++) {
          for (let j = 0; j < piece.shape[i].length; j++) {
            if (piece.shape[i][j] === 1) idx++;
          }
        }
        idx += piece.shape[ly].slice(0, lx).filter((c) => c === 1).length;
        return piece.kanjis[idx] || '?';
      }
    }
    return board[y][x]?.kanji || null;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* HUD */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-sm">
        <div className="flex gap-4">
          <div>
            <div className="text-gray-400 text-xs">Skor</div>
            <div className="text-2xl font-bold text-[#4bddb7]">{state.score}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">Level</div>
            <div className="text-2xl font-bold text-[#6c5ce7]">{state.level}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">Baris</div>
            <div className="text-2xl font-bold text-[#f0bf63]">{state.totalLines}</div>
          </div>
          <div>
            <div className="text-gray-400 text-xs">Combo</div>
            <div className="text-2xl font-bold text-white">{state.combo}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {state.phase === 'PLAYING' && (
            <button
              onClick={() => dispatch({ type: 'PAUSE' })}
              className="px-3 py-1.5 rounded bg-[#1a1a2e] hover:bg-[#212c30] text-sm flex items-center gap-1"
            >
              <Pause size={14} /> Jeda
            </button>
          )}
          {state.phase === 'PAUSED' && (
            <button
              onClick={() => dispatch({ type: 'RESUME' })}
              className="px-3 py-1.5 rounded bg-[#4bddb7] text-black hover:opacity-90 text-sm flex items-center gap-1"
            >
              <Play size={14} /> Lanjut
            </button>
          )}
          {(state.phase === 'GAMEOVER' || state.phase === 'IDLE') && (
            <button
              onClick={startGame}
              className="px-3 py-1.5 rounded bg-[#4bddb7] text-black hover:opacity-90 text-sm flex items-center gap-1"
            >
              <Play size={14} /> {state.phase === 'GAMEOVER' ? 'Main Lagi' : 'Mulai'}
            </button>
          )}
          <button
            onClick={() => router.push('/')}
            className="px-3 py-1.5 rounded bg-[#1a1a2e] hover:bg-[#212c30] text-sm flex items-center gap-1"
          >
            <Home size={14} /> Beranda
          </button>
        </div>
      </div>

      {/* High score badge */}
      {highScore > 0 && (
        <div className="mb-3 text-xs text-gray-400 flex items-center gap-2">
          <Trophy size={14} className="text-[#f0bf63]" /> Skor tertinggi: <span className="text-[#f0bf63] font-semibold">{highScore}</span>
        </div>
      )}

      {/* Board */}
      <div className="relative bg-[#0d1f24] border border-[#1a2e35] rounded-lg p-2 mx-auto" style={{ maxWidth: '320px' }}>
        <div
          className="grid gap-px bg-[#0a1519]"
          style={{
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
            aspectRatio: `${BOARD_WIDTH} / ${BOARD_HEIGHT}`,
          }}
        >
          {Array.from({ length: BOARD_HEIGHT }).map((_, y) =>
            Array.from({ length: BOARD_WIDTH }).map((_, x) => {
              const ch = renderCell(x, y);
              const isActive = piece && ch && board[y][x] === null;
              return (
                <div
                  key={`${x}-${y}-${state.boardVersion}`}
                  className="flex items-center justify-center text-xs md:text-sm font-bold"
                  style={{
                    backgroundColor: ch
                      ? isActive
                        ? '#6c5ce7'
                        : '#1a2e35'
                      : 'transparent',
                    color: isActive ? '#fff' : ch ? '#c8c4d7' : 'transparent',
                    border: ch && !isActive ? '1px solid #212c30' : 'none',
                  }}
                >
                  {ch}
                </div>
              );
            }),
          )}
        </div>

        {/* IDLE / GAMEOVER overlay */}
        {state.phase === 'IDLE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a1519]/95 rounded-lg">
            <Layers size={48} className="text-[#6c5ce7] mb-3" />
            <h2 className="text-2xl font-bold mb-2">Kanji Stack</h2>
            <p className="text-sm text-gray-400 mb-4 text-center max-w-xs">
              Susun kanji yang jatuh. Hapus baris untuk dapat skor. Setiap sel = 1 kanji.
            </p>
            <button
              onClick={startGame}
              className="px-6 py-2 rounded bg-[#4bddb7] text-black font-semibold hover:opacity-90"
            >
              Mulai
            </button>
            <p className="text-xs text-gray-500 mt-4 text-center max-w-xs">
              ← → gerak | ↑ / X putar | Spasi drop | P jeda
            </p>
          </div>
        )}

        {state.phase === 'GAMEOVER' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a1519]/95 rounded-lg">
            <h2 className="text-3xl font-bold text-[#ff5b6b] mb-2">Game Over</h2>
            <div className="text-sm text-gray-300 mb-1">Skor: <span className="text-[#4bddb7] font-bold">{state.score}</span></div>
            <div className="text-sm text-gray-300 mb-1">Level: <span className="text-[#6c5ce7] font-bold">{state.level}</span></div>
            <div className="text-sm text-gray-300 mb-4">Baris: <span className="text-[#f0bf63] font-bold">{state.totalLines}</span></div>
            <button
              onClick={startGame}
              className="px-6 py-2 rounded bg-[#4bddb7] text-black font-semibold hover:opacity-90 flex items-center gap-2"
            >
              <RotateCcw size={14} /> Main Lagi
            </button>
          </div>
        )}

        {state.phase === 'PAUSED' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a1519]/80 rounded-lg">
            <Pause size={48} className="text-[#f0bf63] mb-3" />
            <h2 className="text-2xl font-bold mb-3">Jeda</h2>
            <button
              onClick={() => dispatch({ type: 'RESUME' })}
              className="px-6 py-2 rounded bg-[#4bddb7] text-black font-semibold hover:opacity-90 flex items-center gap-2"
            >
              <Play size={14} /> Lanjut
            </button>
          </div>
        )}
      </div>

      {/* Footer help */}
      <div className="mt-3 text-center text-xs text-gray-500">
        Spasi = drop cepat | ← → = gerak | ↑/X = putar | P = jeda
      </div>
    </div>
  );
}
