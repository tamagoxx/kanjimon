'use client';

import { useState, useEffect, useRef, useReducer, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Pause, Play, RotateCcw, Home, Heart, Zap, Trophy } from 'lucide-react';
import { allJapaneseCards, ALL_CARDS } from '@/data/cards';
import {
  pickActiveTarget,
  pickNextKanji,
  getWaveConfig,
  generateOptions,
  scoreForKill,
  comboMultiplier,
  fastKillBonus,
  type ActiveKanji,
  type ChoiceOption,
} from '@/lib/kanjiDropLogic';
import { useKanjiDropStore } from '@/store/kanjiDropStore';
import { useAuthStore } from '@/store/authStore';
import { submitScore } from '@/lib/leaderboardData';

// ============================================================
// Kanji Drop — Game Component
// ============================================================
//
// Falling kanji multiple-choice game.
// Kanji drop from top; player picks the correct romaji (A/B/C) to destroy them.
// Options are pre-generated at spawn (deterministic per instance).
//
// State management:
//   - useReducer: discrete game state (lives, score, phase, etc.)
//   - refs:        per-frame animation values (positions, last tick time)
//
// This split avoids 60fps re-renders while keeping React-state-driven HUD.

const colors = {
  background: '#0a1519',
  cardBg: '#1a1a2e',
  inputBg: '#212c30',
  brand: '#6c5ce7',
  teal: '#4bddb7',
  gold: '#f0bf63',
  coral: '#ffb4ab',
  lightPurple: '#c6bfff',
  danger: '#ff5b6b',
  darkText: '#c8c4d7',
  lightText: '#d8e4ea',
};

const RARITY_COLOR: Record<string, string> = {
  COMMON: '#a8a8a8',
  UNCOMMON: '#4bddb7',
  RARE: '#4facfe',
  ULTRA_RARE: '#c77dff',
  LIMITED_EDITION: '#ffd93d',
  LEGENDARY: '#ff6b35',
  MYTHICAL: '#ff5b6b',
  TRANSCENDENT: '#00d9ff',
  CELESTIAL: '#9d4edd',
  DIVINE: '#f72585',
  ULTIMATE: '#ffd60a',
  ETERNAL: '#ffffff',
  NIHIL: '#2d1b4e',          // void black with violet glow
  PRIMORDIAL: '#001f3f',     // deep navy cosmic
  OMNIPOTENT: '#ffaa00',     // gold with supercharged orange ring
};

type Phase = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

interface GameState {
  phase: Phase;
  lives: number;
  score: number;
  combo: number;
  maxCombo: number;
  wave: number;
  kills: number;
  startedAt: number;
  destroyed: string[];
  // active kanji state lives in a ref to avoid 60fps re-renders;
  // a counter here forces re-render on add/remove
  activeVersion: number;
  // brief feedback for wrong answer: which button was wrong, when, for which kanji
  lastWrong: { instanceId: string; choice: string; at: number } | null;
}

type Action =
  | { type: 'START'; now: number }
  | { type: 'TICK_FALL' }
  | { type: 'TICK_SPAWN' }
  | { type: 'COMPLETE'; cardId: string; rarity: string; now: number; timeSinceSpawnMs: number }
  | { type: 'WRONG_ANSWER'; instanceId: string; choice: string; now: number }
  | { type: 'CLEAR_WRONG' }
  | { type: 'MISS' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'GAMEOVER' }
  | { type: 'RESTART'; now: number };

const INITIAL: GameState = {
  phase: 'IDLE',
  lives: 3,
  score: 0,
  combo: 0,
  maxCombo: 0,
  wave: 1,
  kills: 0,
  startedAt: 0,
  destroyed: [],
  activeVersion: 0,
  lastWrong: null,
};

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'START':
      return { ...INITIAL, phase: 'PLAYING', startedAt: action.now, activeVersion: state.activeVersion + 1 };
    case 'RESTART':
      return { ...INITIAL, phase: 'PLAYING', startedAt: action.now, activeVersion: state.activeVersion + 1 };
    case 'TICK_FALL':
    case 'TICK_SPAWN':
      return { ...state, activeVersion: state.activeVersion + 1 };
    case 'COMPLETE': {
      const newCombo = state.combo + 1;
      const baseScore = scoreForKill(action.rarity as never, newCombo);
      const multiplier = comboMultiplier(newCombo);
      const fastBonus = fastKillBonus(action.rarity as never, action.timeSinceSpawnMs);
      return {
        ...state,
        score: state.score + Math.round(baseScore * multiplier) + fastBonus,
        combo: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        kills: state.kills + 1,
        destroyed: [action.cardId, ...state.destroyed].slice(0, 100),
        // advance wave every 8 kills
        wave: Math.floor(state.kills / 8) + 1,
        activeVersion: state.activeVersion + 1,
      };
    }
    case 'WRONG_ANSWER':
      return {
        ...state,
        combo: 0,
        lastWrong: { instanceId: action.instanceId, choice: action.choice, at: action.now },
        activeVersion: state.activeVersion + 1,
      };
    case 'CLEAR_WRONG':
      return { ...state, lastWrong: null };
    case 'MISS': {
      const newLives = state.lives - 1;
      if (typeof window !== 'undefined') {
        const w = window as unknown as { __kdMiss?: number[] };
        w.__kdMiss = w.__kdMiss || [];
        w.__kdMiss.push(state.lives);
        // eslint-disable-next-line no-console
        console.log('[kd] MISS', state.lives, '->', newLives, 'reached at t=', Date.now());
      }
      return {
        ...state,
        lives: newLives,
        combo: 0,
        phase: newLives <= 0 ? 'GAMEOVER' : state.phase,
        activeVersion: state.activeVersion + 1,
      };
    }
    case 'PAUSE':
      if (state.phase !== 'PLAYING') return state;
      return { ...state, phase: 'PAUSED' };
    case 'RESUME':
      if (state.phase !== 'PAUSED') return state;
      return { ...state, phase: 'PLAYING' };
    case 'GAMEOVER':
      return { ...state, phase: 'GAMEOVER' };
    default:
      return state;
  }
}

const ACTIVE_POOL = ALL_CARDS.filter((c) => c.reading.length >= 2 && c.reading.length <= 6);
const LANES = 5;
const LANE_WIDTH_PCT = 100 / LANES;

// ============================================================
// Component
// ============================================================

interface KanjiDropGameProps {
  onExit: () => void;
}

export default function KanjiDropGame({ onExit }: KanjiDropGameProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const recordRun = useKanjiDropStore((s) => s.recordRun);
  const highScore = useKanjiDropStore((s) => s.highScore);
  const showReading = useKanjiDropStore((s) => s.showReading);
  const user = useAuthStore((s) => s.user);

  // Refs for per-frame data (not React state)
  const activeRef = useRef<ActiveKanji[]>([]);
  const lastFrameRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const laneIndexRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const runRecordedRef = useRef<boolean>(false);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  const waveConfig = useMemo(() => getWaveConfig(state.wave), [state.wave]);

  // ---- Start / restart ----
  const startGame = useCallback(() => {
    activeRef.current = [];
    lastFrameRef.current = 0;
    lastSpawnRef.current = 0;
    laneIndexRef.current = 0;
    runRecordedRef.current = false;
    dispatch({ type: 'START', now: Date.now() });
  }, []);

  // ---- Game loop (runs while PLAYING) ----
  useEffect(() => {
    if (state.phase !== 'PLAYING') return;
    // Reset frame baseline on entry so a long pause (or tab return) doesn't
    // produce a huge dt that teleports the kanji past the bottom in one tick.
    lastFrameRef.current = 0;
    const onVis = () => {
      lastFrameRef.current = 0;
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase !== 'PLAYING') return;

    const tick = (timestamp: number) => {
      // First frame after (re)entry: just record baseline
      if (lastFrameRef.current === 0) {
        lastFrameRef.current = timestamp;
        lastSpawnRef.current = timestamp;
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;
      const fallMs = waveConfig.fallDurationMs;

      // ---- Move active kanji down (using elapsed time / fallMs as 0..1) ----
      let needsRender = false;
      const reached: ActiveKanji[] = [];
      activeRef.current = activeRef.current.map((a) => {
        const newY = a.y + dt / fallMs;
        if (newY >= 1) {
          reached.push(a);
          return null as unknown as ActiveKanji;
        }
        needsRender = true;
        return { ...a, y: newY };
      }).filter(Boolean) as ActiveKanji[];

      // Kanji that reached bottom → lose a life
      if (reached.length > 0) {
        dispatch({ type: 'MISS' });
      }

      // ---- Spawn check ----
      if (
        timestamp - lastSpawnRef.current >= waveConfig.spawnIntervalMs &&
        activeRef.current.length < waveConfig.maxConcurrent
      ) {
        lastSpawnRef.current = timestamp;
        const next = pickNextKanji(ACTIVE_POOL, activeRef.current, state.wave);
        const lane = laneIndexRef.current % LANES;
        laneIndexRef.current++;
        // Generate the 3 options for this kanji now (deterministic per instance)
        const options = generateOptions(next, ACTIVE_POOL, Math.floor(timestamp));
        activeRef.current.push({
          card: next,
          y: 0,
          instanceId: `${next.id}-${timestamp}-${Math.random().toString(36).slice(2, 6)}`,
          spawnedAt: timestamp,
          options,
          // Store lane in instance for rendering
          ...({ lane } as object),
        } as ActiveKanji & { lane: number });
        needsRender = true;
      }

      if (needsRender) dispatch({ type: 'TICK_FALL' });

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [state.phase, state.wave, waveConfig.fallDurationMs, waveConfig.spawnIntervalMs, waveConfig.maxConcurrent]);

  // ---- Watch the activeVersion counter → re-read activeRef on each render ----
  // The animation loop mutates activeRef in place, and bumps activeVersion via dispatch,
  // so we re-derive a stable list for rendering. We read the ref directly each render.
  const activeList: (ActiveKanji & { lane: number })[] = state.phase === 'PLAYING' || state.phase === 'PAUSED'
    ? (activeRef.current as (ActiveKanji & { lane: number })[])
    : [];

  // ---- Resolve active target (bottom-most kanji) ----
  const activeTarget = useMemo<ActiveKanji | null>(() => {
    if (state.phase !== 'PLAYING') return null;
    return pickActiveTarget(activeRef.current);
  }, [state.phase, state.activeVersion]);

  // ---- Player picks an option for the active target ----
  const chooseOption = useCallback((option: ChoiceOption) => {
    if (state.phase !== 'PLAYING') return;
    const target = pickActiveTarget(activeRef.current);
    if (!target) return;
    const choiceRomaji = option.romaji;
    if (option.isCorrect) {
      // Correct: remove from active list, then dispatch COMPLETE for scoring
      activeRef.current = activeRef.current.filter((a) => a.instanceId !== target.instanceId);
      dispatch({
        type: 'COMPLETE',
        cardId: target.card.id,
        rarity: target.card.rarity,
        now: Date.now(),
        // spawnedAt is RAF timestamp (ms since page load), so use performance.now()
        // for a consistent time origin — Date.now() would give a ~1.7T ms offset.
        timeSinceSpawnMs: performance.now() - target.spawnedAt,
      });
    } else {
      dispatch({
        type: 'WRONG_ANSWER',
        instanceId: target.instanceId,
        choice: choiceRomaji,
        now: Date.now(),
      });
      // Auto-clear the wrong-flash after a short delay
      setTimeout(() => dispatch({ type: 'CLEAR_WRONG' }), 400);
    }
  }, [state.phase]);

  // ---- Game over → record run + submit to leaderboard ----
  useEffect(() => {
    if (state.phase === 'GAMEOVER' && !runRecordedRef.current) {
      runRecordedRef.current = true;
      const durationSec = Math.max(0, Math.round((Date.now() - state.startedAt) / 1000));
      const playedAt = new Date().toISOString();
      recordRun({
        score: state.score,
        wave: state.wave,
        kills: state.kills,
        maxCombo: state.maxCombo,
        durationSec,
        destroyed: state.destroyed,
        playedAt,
      });
      // Fire-and-forget: submit to cloud leaderboard if user is signed in.
      // Skip if not configured or not signed in — local recordRun already covers it.
      if (user?.id) {
        void submitScore({
          userId: user.id,
          username: user.username,
          gameMode: 'kanji-drop',
          score: state.score,
          wave: state.wave,
          kills: state.kills,
          maxCombo: state.maxCombo,
          playedAt,
        });
      }
    }
  }, [state.phase, state.score, state.wave, state.kills, state.maxCombo, state.startedAt, state.destroyed, recordRun, user]);

  // ---- Input handling (document-level so it works without focus) ----
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (state.phase !== 'PLAYING') return;
    // Don't intercept if user is typing in a real form field
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (state.phase === 'PLAYING') dispatch({ type: 'PAUSE' });
      else if (state.phase === 'PAUSED') dispatch({ type: 'RESUME' });
      return;
    }
    // A/B/C or 1/2/3 → pick option for the bottom-most kanji
    const choiceMap: Record<string, number> = { 'a': 0, 'b': 1, 'c': 2, '1': 0, '2': 1, '3': 2 };
    const lower = e.key.toLowerCase();
    if (lower in choiceMap) {
      e.preventDefault();
      const current = pickActiveTarget(activeRef.current);
      if (!current) return;
      const opt = current.options[choiceMap[lower]];
      if (opt) chooseOption(opt);
    }
  }, [state.phase, chooseOption]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  // ============================================================
  // Render
  // ============================================================
  if (state.phase === 'IDLE') {
    return <StartScreen onStart={startGame} onExit={onExit} highScore={highScore} />;
  }
  if (state.phase === 'GAMEOVER') {
    return (
      <GameOverScreen
        score={state.score}
        wave={state.wave}
        kills={state.kills}
        maxCombo={state.maxCombo}
        isNewHigh={state.score > 0 && state.score >= highScore}
        onRestart={startGame}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.background }}>
      {/* HUD */}
      <div className="px-4 py-3 flex items-center justify-between border-b" style={{ borderColor: colors.inputBg }}>
        <button onClick={onExit} className="p-2 rounded-lg" style={{ backgroundColor: colors.inputBg }}>
          <ArrowLeft size={18} color={colors.darkText} />
        </button>
        <div className="flex items-center gap-3">
          {[0, 1, 2].map((i) => (
            <Heart
              key={i}
              size={20}
              color={i < state.lives ? colors.coral : colors.inputBg}
              fill={i < state.lives ? colors.coral : 'transparent'}
            />
          ))}
        </div>
        <div className="text-right">
          <div className="text-xs" style={{ color: colors.darkText }}>SCORE</div>
          <div className="text-lg font-bold" style={{ color: colors.gold }}>
            {state.score.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Wave + Combo strip */}
      <div className="px-4 py-2 flex items-center justify-between text-sm" style={{ backgroundColor: colors.cardBg }}>
        <div className="flex items-center gap-2">
          <Zap size={14} color={colors.brand} />
          <span style={{ color: colors.darkText }}>Wave</span>
          <span className="font-bold" style={{ color: colors.lightPurple }}>{state.wave}</span>
        </div>
        <div className="flex items-center gap-2">
          {state.combo > 0 && (
            <motion.span
              key={state.combo}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="font-bold"
              style={{ color: colors.teal }}
            >
              ×{state.combo}
            </motion.span>
          )}
          <span style={{ color: colors.darkText }}>Combo</span>
        </div>
        <button
          onClick={() => dispatch({ type: 'PAUSE' })}
          className="p-1.5 rounded-md"
          style={{ backgroundColor: colors.inputBg }}
        >
          <Pause size={14} color={colors.darkText} />
        </button>
      </div>

      {/* Playing field */}
      <div className="flex-1 relative overflow-hidden">
        {/* Lane guides */}
        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from({ length: LANES - 1 }).map((_, i) => (
            <div
              key={i}
              className="flex-1 border-l border-dashed"
              style={{ borderColor: `${colors.inputBg}66` }}
            />
          ))}
        </div>

        {/* Falling kanji */}
        <AnimatePresence>
          {activeList.map((a) => (
            <FallingKanji
              key={a.instanceId}
              active={a}
              showReading={showReading}
              isTarget={activeTarget?.instanceId === a.instanceId}
            />
          ))}
        </AnimatePresence>

        {/* Danger line at bottom */}
        <div
          className="absolute left-0 right-0 h-0.5"
          style={{ bottom: '0%', backgroundColor: `${colors.danger}55` }}
        />
      </div>

      {/* Multiple choice input area */}
      <div className="px-4 py-3 border-t" style={{ backgroundColor: colors.cardBg, borderColor: colors.inputBg }}>
        {activeTarget ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs" style={{ color: colors.darkText }}>Pilih romaji untuk</span>
              <span className="text-sm font-bold" style={{ color: colors.lightPurple }}>
                {activeTarget.card.japanese}
              </span>
              <span className="text-xs" style={{ color: colors.darkText }}>({activeTarget.card.reading})</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {activeTarget.options.map((opt) => {
                const isWrongFlash =
                  state.lastWrong !== null &&
                  state.lastWrong.instanceId === activeTarget.instanceId &&
                  state.lastWrong.choice === opt.romaji;
                return (
                  <motion.button
                    key={opt.label}
                    onClick={() => chooseOption(opt)}
                    animate={isWrongFlash ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-xl py-3 px-2 flex flex-col items-center justify-center active:scale-95"
                    style={{
                      backgroundColor: isWrongFlash ? `${colors.danger}40` : colors.inputBg,
                      border: `2px solid ${isWrongFlash ? colors.danger : colors.darkText}33`,
                    }}
                    data-testid={`kd-option-${opt.label}`}
                  >
                    <span
                      className="text-xs font-bold mb-1"
                      style={{ color: isWrongFlash ? colors.danger : colors.teal }}
                    >
                      {opt.label}
                    </span>
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: colors.lightText }}
                    >
                      {opt.romaji}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center text-sm" style={{ color: `${colors.darkText}77` }}>
            Kanji akan muncul sebentar lagi...
          </div>
        )}
        <p className="text-xs mt-2 text-center" style={{ color: `${colors.darkText}77` }}>
          Tekan <kbd className="px-1 rounded" style={{ backgroundColor: colors.inputBg }}>A</kbd>
          <kbd className="px-1 rounded ml-1" style={{ backgroundColor: colors.inputBg }}>B</kbd>
          <kbd className="px-1 rounded ml-1" style={{ backgroundColor: colors.inputBg }}>C</kbd>
          {' '}atau klik tombol, <kbd className="px-1 rounded" style={{ backgroundColor: colors.inputBg }}>Spasi</kbd> untuk pause
        </p>
      </div>

      {/* Pause overlay */}
      <AnimatePresence>
        {state.phase === 'PAUSED' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-30"
            style={{ backgroundColor: 'rgba(10,21,25,0.85)' }}
          >
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-2" style={{ color: colors.lightText }}>Pause</h2>
              <p className="text-sm mb-6" style={{ color: colors.darkText }}>Tekan Spasi untuk pause</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => dispatch({ type: 'RESUME' })}
                  className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.brand, color: '#fff' }}
                >
                  <Play size={18} /> Lanjut
                </button>
                <button
                  onClick={startGame}
                  className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.inputBg, color: colors.darkText }}
                >
                  <RotateCcw size={18} /> Mulai Ulang
                </button>
                <button
                  onClick={onExit}
                  className="px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{ backgroundColor: colors.inputBg, color: colors.darkText }}
                >
                  <Home size={18} /> Keluar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

interface FallingKanjiProps {
  active: ActiveKanji & { lane: number };
  showReading: boolean;
  isTarget: boolean;
}

function FallingKanji({ active, showReading, isTarget }: FallingKanjiProps) {
  const left = active.lane * LANE_WIDTH_PCT + LANE_WIDTH_PCT / 2;
  const top = active.y * 100;
  const rarityColor = RARITY_COLOR[active.card.rarity] ?? colors.darkText;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.5 }}
      className="absolute flex flex-col items-center justify-center pointer-events-none"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold"
        style={{
          backgroundColor: isTarget ? `${colors.brand}40` : colors.cardBg,
          border: `2px solid ${isTarget ? colors.brand : rarityColor}`,
          color: rarityColor,
          boxShadow: isTarget ? `0 0 20px ${colors.brand}80` : 'none',
          transition: 'box-shadow 0.15s, background-color 0.15s',
        }}
      >
        {active.card.japanese}
      </div>
      {showReading && (
        <div className="mt-1 text-xs" style={{ color: colors.darkText }}>
          {active.card.reading}
        </div>
      )}
    </motion.div>
  );
}

function StartScreen({
  onStart,
  onExit,
  highScore,
}: {
  onStart: () => void;
  onExit: () => void;
  highScore: number;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm text-center"
      >
        <div className="text-7xl mb-4">⏬</div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: colors.lightText }}>Kanji Drop</h1>
        <p className="text-sm mb-6" style={{ color: colors.darkText }}>
          Kanji jatuh dari atas. Pilih romaji yang benar (A/B/C) sebelum nyawa habis.
          Jangan sampai combo putus!
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6 text-left">
          <InfoBox label="❤️ Nyawa" value="3" />
          <InfoBox label="🔥 Combo" value="Bonus" />
          <InfoBox label="🌊 Wave" value="Makin cepat" />
          <InfoBox label="🏆 High Score" value={highScore > 0 ? highScore.toLocaleString() : '—'} />
        </div>

        <div
          className="text-left text-xs p-3 rounded-xl mb-6"
          style={{ backgroundColor: colors.cardBg, color: colors.darkText }}
        >
          <p className="font-bold mb-1" style={{ color: colors.lightPurple }}>Cara main:</p>
          <ul className="space-y-1">
            <li>• Lihat kanji yang jatuh (paling bawah = paling urgent)</li>
            <li>• Pilih romaji yang benar dari 3 pilihan <span className="font-mono" style={{ color: colors.teal }}>A/B/C</span></li>
            <li>• Tekan <kbd className="px-1 rounded font-mono" style={{ backgroundColor: colors.inputBg }}>A</kbd> <kbd className="px-1 rounded font-mono" style={{ backgroundColor: colors.inputBg }}>B</kbd> <kbd className="px-1 rounded font-mono" style={{ backgroundColor: colors.inputBg }}>C</kbd> (atau 1/2/3), atau klik tombol</li>
            <li>• Tekan <kbd className="px-1 rounded font-mono" style={{ backgroundColor: colors.inputBg }}>Spasi</kbd> untuk pause</li>
          </ul>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 rounded-2xl font-bold text-lg mb-3"
          style={{ backgroundColor: colors.brand, color: '#fff' }}
        >
          🚀 Mulai Main
        </button>
        <button
          onClick={onExit}
          className="w-full py-3 rounded-2xl font-medium"
          style={{ backgroundColor: colors.inputBg, color: colors.darkText }}
        >
          ← Kembali
        </button>
      </motion.div>
    </div>
  );
}

function GameOverScreen({
  score,
  wave,
  kills,
  maxCombo,
  isNewHigh,
  onRestart,
  onExit,
}: {
  score: number;
  wave: number;
  kills: number;
  maxCombo: number;
  isNewHigh: boolean;
  onRestart: () => void;
  onExit: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm text-center"
      >
        <div className="text-7xl mb-4">💥</div>
        <h1 className="text-3xl font-bold mb-1" style={{ color: colors.coral }}>Game Over</h1>
        {isNewHigh && (
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-sm font-bold mb-4"
            style={{ color: colors.gold }}
          >
            🏆 NEW HIGH SCORE!
          </motion.p>
        )}
        {!isNewHigh && <div className="mb-4" />}

        <div className="grid grid-cols-2 gap-3 mb-6">
          <InfoBox label="🏆 Score" value={score.toLocaleString()} highlight />
          <InfoBox label="🌊 Wave" value={wave.toString()} />
          <InfoBox label="💀 Kills" value={kills.toString()} />
          <InfoBox label="🔥 Best Combo" value={`×${maxCombo}`} />
        </div>

        <button
          onClick={onRestart}
          className="w-full py-4 rounded-2xl font-bold text-lg mb-3"
          style={{ backgroundColor: colors.brand, color: '#fff' }}
        >
          🔄 Main Lagi
        </button>
        <button
          onClick={onExit}
          className="w-full py-3 rounded-2xl font-medium"
          style={{ backgroundColor: colors.inputBg, color: colors.darkText }}
        >
          ← Kembali
        </button>
      </motion.div>
    </div>
  );
}

function InfoBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className="p-3 rounded-xl"
      style={{
        backgroundColor: highlight ? `${colors.gold}20` : colors.cardBg,
        border: `1px solid ${highlight ? colors.gold : colors.inputBg}`,
      }}
    >
      <div className="text-xs" style={{ color: colors.darkText }}>{label}</div>
      <div className="text-lg font-bold" style={{ color: highlight ? colors.gold : colors.lightText }}>
        {value}
      </div>
    </div>
  );
}
