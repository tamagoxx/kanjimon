import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LearnedCharacter {
  char: string;
  romaji: string;
  learnedAt: string;
}

interface ModuleProgress {
  total: number;
  learned: LearnedCharacter[];
}

interface LearningProgressState {
  hiragana: ModuleProgress;
  katakana: ModuleProgress;

  // Actions
  markCharLearned: (module: 'hiragana' | 'katakana', char: string, romaji: string) => void;
  isCharLearned: (module: 'hiragana' | 'katakana', char: string) => boolean;
  getModuleProgress: (module: 'hiragana' | 'katakana') => { learned: number; total: number; percentage: number };
  resetProgress: () => void;
}

const HIRAGANA_TOTAL = 104; // 46 basic + 25 dakuten + 33 combinations
const KATAKANA_TOTAL = 46;  // basic only for now

export const useLearningProgressStore = create<LearningProgressState>()(
  persist(
    (set, get) => ({
      hiragana: { total: HIRAGANA_TOTAL, learned: [] },
      katakana: { total: KATAKANA_TOTAL, learned: [] },

      markCharLearned: (module, char, romaji) => {
        set(state => {
          const moduleData = state[module];
          // Already learned
          if (moduleData.learned.some(c => c.char === char)) return state;
          
          return {
            [module]: {
              ...moduleData,
              learned: [...moduleData.learned, { char, romaji, learnedAt: new Date().toISOString() }],
            },
          };
        });
      },

      isCharLearned: (module, char) => {
        return get()[module].learned.some(c => c.char === char);
      },

      getModuleProgress: (module) => {
        const data = get()[module];
        return {
          learned: data.learned.length,
          total: data.total,
          percentage: Math.round((data.learned.length / data.total) * 100),
        };
      },

      resetProgress: () => {
        set({
          hiragana: { total: HIRAGANA_TOTAL, learned: [] },
          katakana: { total: KATAKANA_TOTAL, learned: [] },
        });
      },
    }),
    {
      name: 'kanjimon-learning-progress',
    }
  )
);