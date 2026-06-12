import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================
// Kanji Drop — Persistent Stats & Settings
// ============================================================

export interface KanjiDropRunStats {
  score: number;
  wave: number;
  kills: number;
  maxCombo: number;
  durationSec: number;
  /** Cards destroyed by id (for learning analytics) */
  destroyed: string[];
  /** ISO timestamp */
  playedAt: string;
}

export type KanjiDropDifficulty = 'EASY' | 'NORMAL' | 'HARD';

interface KanjiDropState {
  // Persistent stats
  highScore: number;
  bestWave: number;
  totalKills: number;
  totalGames: number;
  bestCombo: number;
  recentRuns: KanjiDropRunStats[]; // last 10

  // Settings
  difficulty: KanjiDropDifficulty;
  showReading: boolean; // show hiragana reading under the kanji
  soundEnabled: boolean;

  // Actions
  recordRun: (stats: KanjiDropRunStats) => void;
  setDifficulty: (d: KanjiDropDifficulty) => void;
  setShowReading: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
  resetStats: () => void;
}

const MAX_RECENT = 10;

export const useKanjiDropStore = create<KanjiDropState>()(
  persist(
    (set) => ({
      highScore: 0,
      bestWave: 0,
      totalKills: 0,
      totalGames: 0,
      bestCombo: 0,
      recentRuns: [],

      difficulty: 'NORMAL',
      showReading: true,
      soundEnabled: true,

      recordRun: (stats) =>
        set((s) => ({
          highScore: Math.max(s.highScore, stats.score),
          bestWave: Math.max(s.bestWave, stats.wave),
          totalKills: s.totalKills + stats.kills,
          totalGames: s.totalGames + 1,
          bestCombo: Math.max(s.bestCombo, stats.maxCombo),
          recentRuns: [stats, ...s.recentRuns].slice(0, MAX_RECENT),
        })),

      setDifficulty: (difficulty) => set({ difficulty }),
      setShowReading: (showReading) => set({ showReading }),
      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),

      resetStats: () =>
        set({
          highScore: 0,
          bestWave: 0,
          totalKills: 0,
          totalGames: 0,
          bestCombo: 0,
          recentRuns: [],
        }),
    }),
    {
      name: 'kanjimon-kanji-drop',
    },
  ),
);
