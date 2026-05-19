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
  kanji: ModuleProgress;

  // Actions - all return boolean for confirmation
  markCharLearned: (module: 'hiragana' | 'katakana' | 'kanji', char: string, romaji: string) => boolean;
  markBatchLearned: (module: 'hiragana' | 'katakana' | 'kanji', chars: Array<{ char: string; romaji: string }>) => number;
  isCharLearned: (module: 'hiragana' | 'katakana' | 'kanji', char: string) => boolean;
  getModuleProgress: (module: 'hiragana' | 'katakana' | 'kanji') => { learned: number; total: number; percentage: number };
  resetProgress: () => void;
}

// Count actual characters from characters.ts data
// HIRAGANA_BASIC: 46, HIRAGANA_DAKUTEN: 25, HIRAGANA_COMBINATIONS: 33 = 104 total
// KATAKANA_BASIC: 46
export const HIRAGANA_TOTAL = 104;
export const KATAKANA_TOTAL = 46;
export const KANJI_N5_TOTAL = 103;

export const useLearningProgressStore = create<LearningProgressState>()(
  persist(
    (set, get) => ({
      hiragana: { total: HIRAGANA_TOTAL, learned: [] },
      katakana: { total: KATAKANA_TOTAL, learned: [] },
      kanji: { total: KANJI_N5_TOTAL, learned: [] },

      markCharLearned: (module, char, romaji) => {
        try {
          const state = get();
          const moduleData = state[module];

          if (!moduleData) {
            console.error(`[LearningProgress] Unknown module: ${module}`);
            return false;
          }

          // Already learned - check by char key
          if (moduleData.learned.some(c => c.char === char)) {
            return false;
          }

          // Use get() after set to verify persistence
          set(state => {
            const current = state[module];
            if (current.learned.some(c => c.char === char)) {
              // Already added by a concurrent call
              return state;
            }
            return {
              [module]: {
                ...current,
                learned: [...current.learned, { char, romaji, learnedAt: new Date().toISOString() }],
              },
            };
          });

          // Verify immediately after set
          const after = get()[module];
          const wasAdded = after.learned.some(c => c.char === char);

          console.log(`[LearningProgress] ${wasAdded ? '✓' : '✗'} ${char} (${romaji}) in ${module}. Total: ${after.learned.length}/${after.total}`);
          return wasAdded;
        } catch (err) {
          console.error(`[LearningProgress] Error marking ${char} as learned:`, err);
          return false;
        }
      },

      // Batch version - more efficient for quiz completion
      markBatchLearned: (module, chars) => {
        try {
          const state = get();
          const moduleData = state[module];

          if (!moduleData) {
            console.error(`[LearningProgress] Unknown module: ${module}`);
            return 0;
          }

          const currentLearned = new Set(moduleData.learned.map(c => c.char));
          const newChars = chars.filter(c => !currentLearned.has(c.char));

          if (newChars.length === 0) {
            console.log(`[LearningProgress] No new chars to add in ${module}`);
            return 0;
          }

          set(state => ({
            [module]: {
              ...state[module],
              learned: [
                ...state[module].learned,
                ...newChars.map(c => ({ char: c.char, romaji: c.romaji, learnedAt: new Date().toISOString() })),
              ],
            },
          }));

          // Verify
          const after = get()[module];
          const actuallyAdded = newChars.filter(c => after.learned.some(l => l.char === c.char));

          console.log(`[LearningProgress] ✓ Batch: ${actuallyAdded.length} chars added to ${module}. Total: ${after.learned.length}/${after.total}`);
          return actuallyAdded.length;
        } catch (err) {
          console.error(`[LearningProgress] Error in batch mark:`, err);
          return 0;
        }
      },

      isCharLearned: (module, char) => {
        try {
          const data = get()[module];
          return data?.learned.some(c => c.char === char) ?? false;
        } catch {
          return false;
        }
      },

      getModuleProgress: (module) => {
        try {
          const data = get()[module];
          if (!data) {
            return { learned: 0, total: 0, percentage: 0 };
          }
          const learned = data.learned.length;
          const total = data.total;
          const percentage = total > 0 ? Math.round((learned / total) * 100) : 0;
          return { learned, total, percentage };
        } catch {
          return { learned: 0, total: 0, percentage: 0 };
        }
      },

      resetProgress: () => {
        set({
          hiragana: { total: HIRAGANA_TOTAL, learned: [] },
          katakana: { total: KATAKANA_TOTAL, learned: [] },
          kanji: { total: KANJI_N5_TOTAL, learned: [] },
        });
      },
    }),
    {
      name: 'kanjimon-learning-progress',
    }
  )
);