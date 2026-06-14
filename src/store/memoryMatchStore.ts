import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================================
// Memory Match — Persistent Stats & Settings
// ============================================================

export interface MemoryMatchRunStats {
  score: number;
  pairsMatched: number;
  totalPairs: number;
  maxCombo: number;
  durationSec: number;
  /** ISO timestamp */
  playedAt: string;
}

interface MemoryMatchState {
  // Persistent stats
  highScore: number;
  bestCombo: number;
  totalMatches: number;
  totalGames: number;
  recentRuns: MemoryMatchRunStats[]; // last 10

  // Settings
  soundEnabled: boolean;
  showTimer: boolean;

  // Actions
  recordRun: (stats: MemoryMatchRunStats) => void;
  setSoundEnabled: (v: boolean) => void;
  setShowTimer: (v: boolean) => void;
  resetStats: () => void;
}

const MAX_RECENT = 10;

export const useMemoryMatchStore = create<MemoryMatchState>()(
  persist(
    (set) => ({
      highScore: 0,
      bestCombo: 0,
      totalMatches: 0,
      totalGames: 0,
      recentRuns: [],

      soundEnabled: true,
      showTimer: true,

      recordRun: (stats) =>
        set((s) => ({
          highScore: Math.max(s.highScore, stats.score),
          bestCombo: Math.max(s.bestCombo, stats.maxCombo),
          totalMatches: s.totalMatches + stats.pairsMatched,
          totalGames: s.totalGames + 1,
          recentRuns: [stats, ...s.recentRuns].slice(0, MAX_RECENT),
        })),

      setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
      setShowTimer: (showTimer) => set({ showTimer }),

      resetStats: () =>
        set({
          highScore: 0,
          bestCombo: 0,
          totalMatches: 0,
          totalGames: 0,
          recentRuns: [],
        }),
    }),
    {
      name: 'kanjimon-memory-match',
    },
  ),
);
