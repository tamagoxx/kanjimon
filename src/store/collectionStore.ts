import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OwnedCard, Deck, DailyQuest, JapaneseCard } from '@/types';

// Pokemon card type (from PokeAPI)
export interface PokemonCard {
  id: string;
  pokemonId: number;
  name: string;
  types: string[];
  image: string;
  shinyImage: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  height: number;
  weight: number;
  ability: string;
  hiddenAbility?: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'ULTRA_RARE';
  element: string;
  flavorText: string;
  color: string;
}

export type AnyCard = JapaneseCard | PokemonCard;

// Daily quest templates - new quests generated each day
const DAILY_QUEST_TEMPLATES: Omit<DailyQuest, 'progress' | 'completed' | 'claimed'>[] = [
  // Easy starter quests (small diamond rewards, quick tasks)
  { id: 'dq1', type: 'BATTLE', title: 'Pertarungan Pertama', description: 'Menangkan 1 battle', target: 1, xpReward: 30, diamondReward: 2 },
  { id: 'dq2', type: 'MODULE', title: 'Murid Baru', description: 'Selesaikan 1 kuis Hiragana', target: 1, xpReward: 20, diamondReward: 2 },
  { id: 'dq3', type: 'MODULE', title: 'Latihan Karakter', description: 'Jawab 5 soal dengan benar', target: 5, xpReward: 15, diamondReward: 1 },
  { id: 'dq4', type: 'COLLECT', title: 'Dunia Pokemon', description: 'Tangkap 1 Pokemon baru', target: 1, xpReward: 25, diamondReward: 2 },
  { id: 'dq5', type: 'REVIEW', title: 'Pengulangan Harian', description: 'Pelajari 3 karakter Hiragana', target: 3, xpReward: 10, diamondReward: 1 },
  { id: 'dq6', type: 'BATTLE', title: 'Petarung Pemula', description: 'Kumpulkan 50 HP di battle', target: 50, xpReward: 15, diamondReward: 1 },
  { id: 'dq7', type: 'MODULE', title: 'Dakuten Master', description: 'Selesaikan kuis Dakuten', target: 1, xpReward: 20, diamondReward: 2 },
  { id: 'dq8', type: 'MODULE', title: 'Kombinasi Hebat', description: 'Selesaikan kuis Kombinasi', target: 1, xpReward: 20, diamondReward: 2 },
  { id: 'dq9', type: 'COLLECT', title: 'Kolektor Saya', description: 'Tangkap 2 Pokemon baru', target: 2, xpReward: 30, diamondReward: 3 },
  { id: 'dq10', type: 'STREAK', title: 'Mulai Dari Sekarang', description: 'Login dan belajar hari ini', target: 1, xpReward: 10, diamondReward: 1 },

  // Medium quests
  { id: 'dq11', type: 'BATTLE', title: 'Juara Pemula', description: 'Menangkan 3 battles', target: 3, xpReward: 80, diamondReward: 6 },
  { id: 'dq12', type: 'MODULE', title: 'Pelajar Keras', description: 'Selesaikan 3 kuis', target: 3, xpReward: 60, diamondReward: 5 },
  { id: 'dq13', type: 'REVIEW', title: 'Hafal Master', description: 'Pelajari 10 karakter baru', target: 10, xpReward: 40, diamondReward: 3 },
  { id: 'dq14', type: 'COLLECT', title: 'Pokemon Trainer', description: 'Tangkap 5 Pokemon baru', target: 5, xpReward: 100, diamondReward: 8 },
  { id: 'dq15', type: 'BATTLE', title: 'Kemenangan Beruntun', description: 'Menangkan 5 battles', target: 5, xpReward: 120, diamondReward: 10 },
  { id: 'dq16', type: 'MODULE', title: 'Luar Biasa', description: 'Dapatkan skor 8+ di kuis', target: 1, xpReward: 50, diamondReward: 4 },
  { id: 'dq17', type: 'REVIEW', title: 'Review Hebat', description: 'Review 20 kartu', target: 20, xpReward: 50, diamondReward: 4 },
  { id: 'dq18', type: 'STREAK', title: 'Streak 3 Hari', description: 'Login 3 hari berturut-turut', target: 3, xpReward: 150, diamondReward: 12 },
];

// Generate 5 random daily quests from templates
function generateDailyQuests(): DailyQuest[] {
  const shuffled = [...DAILY_QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5).map((template, i) => ({
    ...template,
    id: `dq_${Date.now()}_${i}`, // unique ID each day
    progress: 0,
    completed: false,
    claimed: false,
  }));
}

// Get today's date string (YYYY-MM-DD)
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

interface CollectionState {
  ownedCards: OwnedCard[];
  ownedPokemon: PokemonCard[];
  decks: Deck[];
  dailyQuests: DailyQuest[];
  lastQuestResetDate: string | null;
  questHistory: { date: string; questsCompleted: number; diamondsEarned: number }[];
  coins: number;
  diamonds: number;
  scrolls: number;
  totalDiamondsEarned: number;
  streakDays: number;
  lastLoginDate: string | null;

  // Card actions (Japanese)
  addCard: (card: OwnedCard) => void;
  addCards: (cards: OwnedCard[]) => void;
  markCardSeen: (cardId: string) => void;

  // Pokemon actions
  catchPokemon: (pokemon: PokemonCard) => void;
  releasePokemon: (pokemonId: number) => void;
  getPokemonById: (pokemonId: number) => PokemonCard | undefined;
  isPokemonCaught: (pokemonId: number) => boolean;

  // Deck actions
  createDeck: (name: string, cardIds: string[]) => void;
  updateDeck: (deckId: string, cardIds: string[]) => void;
  deleteDeck: (deckId: string) => void;

  // Quest actions
  updateQuestProgress: (questId: string, progress: number) => void;
  completeQuest: (questId: string) => void;
  checkAndResetDailyQuests: () => void;
  getTodayQuests: () => DailyQuest[];
  trackQuestEvent: (type: DailyQuest['type']) => void;

  // Currency
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addDiamonds: (amount: number) => void;
  spendDiamonds: (amount: number) => boolean;
  addScrolls: (amount: number) => void;
  spendScrolls: (amount: number) => boolean;

  // Daily login & streak
  checkDailyLogin: () => boolean;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      ownedCards: [],
      ownedPokemon: [],
      decks: [],
      dailyQuests: [],
      lastQuestResetDate: null,
      questHistory: [],
      coins: 500,
      diamonds: 0,
      scrolls: 3,
      totalDiamondsEarned: 0,
      streakDays: 0,
      lastLoginDate: null,

      // Japanese card actions
      addCard: (card) => {
        set(state => ({
          ownedCards: [...state.ownedCards, card],
        }));
      },

      addCards: (cards) => {
        set(state => ({
          ownedCards: [...state.ownedCards, ...cards],
        }));
      },

      markCardSeen: (cardId) => {
        set(state => ({
          ownedCards: state.ownedCards.map(oc =>
            oc.cardId === cardId ? { ...oc, isNew: false } : oc
          ),
        }));
      },

      // Pokemon actions
      catchPokemon: (pokemon) => {
        set(state => {
          // Check if already caught
          const alreadyCaught = state.ownedPokemon.some(p => p.pokemonId === pokemon.pokemonId);
          if (alreadyCaught) return state;

          const newOwnedPokemon = [...state.ownedPokemon, pokemon];

          // Update COLLECT quests - each catch adds +1 progress
          const collectQuests = state.dailyQuests.filter(q => q.type === 'COLLECT' && !q.completed);
          let newQuests = state.dailyQuests;
          if (collectQuests.length > 0) {
            newQuests = state.dailyQuests.map(q => {
              if (q.type === 'COLLECT' && !q.completed) {
                const newProgress = q.progress + 1;
                console.log(`[Gacha] Pokemon caught: ${pokemon.name}. COLLECT quest: ${newProgress}/${q.target}`);
                return { ...q, progress: newProgress, completed: newProgress >= q.target };
              }
              return q;
            });
          }

          return { ownedPokemon: newOwnedPokemon, dailyQuests: newQuests };
        });

        // Give diamond reward for new catch
        get().addDiamonds(2);
      },

      releasePokemon: (pokemonId) => {
        set(state => ({
          ownedPokemon: state.ownedPokemon.filter(p => p.pokemonId !== pokemonId),
        }));
      },

      getPokemonById: (pokemonId) => {
        return get().ownedPokemon.find(p => p.pokemonId === pokemonId);
      },

      isPokemonCaught: (pokemonId) => {
        return get().ownedPokemon.some(p => p.pokemonId === pokemonId);
      },

      // Deck actions
      createDeck: (name, cardIds) => {
        const newDeck: Deck = {
          id: crypto.randomUUID(),
          name,
          cardIds,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set(state => ({ decks: [...state.decks, newDeck] }));
      },

      updateDeck: (deckId, cardIds) => {
        set(state => ({
          decks: state.decks.map(d =>
            d.id === deckId
              ? { ...d, cardIds, updatedAt: new Date().toISOString() }
              : d
          ),
        }));
      },

      deleteDeck: (deckId) => {
        set(state => ({
          decks: state.decks.filter(d => d.id !== deckId),
        }));
      },

      // Quest actions
      updateQuestProgress: (questId, progress) => {
        const state = get();
        const quest = state.dailyQuests.find(q => q.id === questId);
        if (!quest) {
          console.warn(`[Quest] Quest not found: ${questId}`);
          return;
        }
        const completed = progress >= quest.target;
        console.log(`[Quest] updateQuestProgress ${questId}: ${quest.progress} → ${progress} (target: ${quest.target}, completed: ${completed})`);

        set(state => ({
          dailyQuests: state.dailyQuests.map(q =>
            q.id === questId ? { ...q, progress, completed } : q
          ),
        }));
      },

      completeQuest: (questId) => {
        set(state => {
          const quest = state.dailyQuests.find(q => q.id === questId);
          if (!quest || quest.completed || quest.claimed) {
            console.warn(`[Quest] Cannot complete quest ${questId}: ${!quest ? 'not found' : quest.completed ? 'already completed' : 'already claimed'}`);
            return state;
          }

          console.log(`[Quest] ✓ Completing quest: ${quest.title} (${quest.type}). Claiming reward: ${quest.xpReward} XP + ${quest.diamondReward} 💎`);

          return {
            coins: state.coins + quest.xpReward,
            diamonds: state.diamonds + (quest.diamondReward || 0),
            totalDiamondsEarned: state.totalDiamondsEarned + (quest.diamondReward || 0),
            dailyQuests: state.dailyQuests.map(q =>
              q.id === questId ? { ...q, completed: true, claimed: true } : q
            ),
          };
        });
      },

      // Auto-reset quests if it's a new day (00:00)
      checkAndResetDailyQuests: () => {
        const today = getTodayString();
        const { lastQuestResetDate, questHistory } = get();

        if (lastQuestResetDate !== today) {
          // Archive yesterday's stats
          if (lastQuestResetDate) {
            const yesterdayQuests = get().dailyQuests;
            const questsCompleted = yesterdayQuests.filter(q => q.claimed).length;
            const diamondsEarned = yesterdayQuests
              .filter(q => q.claimed)
              .reduce((sum, q) => sum + (q.diamondReward || 0), 0);

            const updatedHistory = [
              ...questHistory,
              { date: lastQuestResetDate, questsCompleted, diamondsEarned },
            ].slice(-7); // keep last 7 days

            set({
              questHistory: updatedHistory,
              dailyQuests: generateDailyQuests(),
              lastQuestResetDate: today,
              streakDays: get().streakDays + 1,
            });
            console.log(`[Quest] 🔄 Daily quests reset! New day: ${today}. Streak: ${get().streakDays}`);
          } else {
            // First time or no reset date - just initialize
            set({
              dailyQuests: generateDailyQuests(),
              lastQuestResetDate: today,
            });
            console.log(`[Quest] 🆕 First quest initialization for ${today}`);
          }
        }
      },

      getTodayQuests: () => {
        // Ensure quests are initialized/reset
        get().checkAndResetDailyQuests();
        return get().dailyQuests;
      },

      // Track specific quest progress events
      trackQuestEvent: (type) => {
        const state = get();
        const now = getTodayString();

        // Auto-reset if needed
        if (state.lastQuestResetDate !== now) {
          get().checkAndResetDailyQuests();
          return;
        }

        // Update quests matching the event type
        const matchingQuests = state.dailyQuests.filter(q => q.type === type && !q.completed);

        if (matchingQuests.length === 0) return;

        set(state => ({
          dailyQuests: state.dailyQuests.map(q => {
            if (q.type === type && !q.completed) {
              const newProgress = q.progress + 1;
              const completed = newProgress >= q.target;
              console.log(`[Quest] trackQuestEvent ${type}: ${newProgress}/${q.target}`);
              return { ...q, progress: newProgress, completed };
            }
            return q;
          }),
        }));
      },

      // Currency
      addCoins: (amount) => {
        set(state => ({ coins: state.coins + amount }));
      },

      spendCoins: (amount) => {
        const { coins } = get();
        if (coins < amount) return false;
        set(state => ({ coins: state.coins - amount }));
        return true;
      },

      addDiamonds: (amount) => {
        set(state => ({
          diamonds: state.diamonds + amount,
          totalDiamondsEarned: state.totalDiamondsEarned + amount,
        }));
      },

      spendDiamonds: (amount) => {
        const { diamonds } = get();
        if (diamonds < amount) return false;
        set(state => ({ diamonds: state.diamonds - amount }));
        return true;
      },

      addScrolls: (amount) => {
        set(state => ({ scrolls: state.scrolls + amount }));
      },

      spendScrolls: (amount) => {
        const { scrolls } = get();
        if (scrolls < amount) return false;
        set(state => ({ scrolls: state.scrolls - amount }));
        return true;
      },

      // Daily login
      checkDailyLogin: () => {
        const today = getTodayString();
        const { lastLoginDate, streakDays } = get();

        if (lastLoginDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          const newStreak = lastLoginDate === yesterdayStr ? streakDays + 1 : 1;

          set({
            lastLoginDate: today,
            streakDays: newStreak,
            coins: get().coins + 10,
            scrolls: get().scrolls + 1,
          });

          // Trigger streak quest if active
          const quests = get().dailyQuests;
          const streakQuest = quests.find(q => q.type === 'STREAK' && !q.completed);
          if (streakQuest) {
            get().updateQuestProgress(streakQuest.id, newStreak);
          }

          return true;
        }
        return false;
      },
    }),
    {
      name: 'kanjimon-collection',
    }
  )
);