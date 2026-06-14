import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================
// Kanji Stack — Persistent Stats & Settings
// ============================================================

export interface KanjiStackRunStats {
  score: number;
  level: number;
  totalLines: number;
  maxCombo: number;
  durationSec: number;
  /** ISO timestamp */
  playedAt: string;
}

interface KanjiStackState {
  // Persistent stats
  highScore: number;
  bestLevel: number;
  bestLines: number;
  totalLines: number;
  totalGames: number;
  recentRuns: KanjiStackRunStats[]; // last 10

  // Settings
  soundEnabled: boolean;

  // Actions
  recordRun: (stats: KanjiStackRunStats) => void;
  setSoundEnabled: (v: boolean) => void;
  resetStats: () => void;
}

const MAX_RECENT = 10;

export const useKanjiStackStore = create<KanjiStackState>()(
  persist(
    (set) => ({
      highScore: 0,
      bestLevel: 1,
      bestLines: 0,
      totalLines: 0,
      totalGames: 0,
      recentRuns: [],

      soundEnabled: true,

      recordRun: (stats) =>
        set((s) => ({
          highScore: Math.max(s.highScore, stats.score),
          bestLevel: Math.max(s.bestLevel, stats.level),
          bestLines: Math.max(s.bestLines, stats.totalLines),
          totalLines: s.totalLines + stats.totalLines,
          totalGames: s.totalGames + 1,
          recentRuns: [stats, ...s.recentRuns].slice(0, MAX_RECENT),
        })),

      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),

      resetStats: () =>
        set({
          highScore: 0,
          bestLevel: 1,
          bestLines: 0,
          totalLines: 0,
          totalGames: 0,
          recentRuns: [],
        }),
    }),
    {
      name: 'kanjimon-kanji-stack',
    },
  ),
);
