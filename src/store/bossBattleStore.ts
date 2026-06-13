// Boss Battle progress tracking. Persisted to localStorage so the player's
// highest cleared level survives page reloads.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BossBattleProgress {
  highestCleared: number;
  lastCleared: number;
  totalVictories: number;
  totalDefeats: number;
}

interface BossBattleState extends BossBattleProgress {
  recordVictory: (level: number) => void;
  recordDefeat: (level: number) => void;
  resetProgress: () => void;
}

const initialProgress: BossBattleProgress = {
  highestCleared: 0,
  lastCleared: 0,
  totalVictories: 0,
  totalDefeats: 0,
};

export const useBossBattleStore = create<BossBattleState>()(
  persist(
    (set) => ({
      ...initialProgress,

      recordVictory: (level) =>
        set((state) => ({
          totalVictories: state.totalVictories + 1,
          lastCleared: level,
          highestCleared: Math.max(state.highestCleared, level),
        })),

      recordDefeat: (_level) =>
        set((state) => ({
          totalDefeats: state.totalDefeats + 1,
          // Defeat doesn't change highest/lastCleared
        })),

      resetProgress: () => set({ ...initialProgress }),
    }),
    {
      name: 'kanjimon-boss-battle',
      version: 1,
    },
  ),
);
