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

interface CollectionState {
  ownedCards: OwnedCard[];
  ownedPokemon: PokemonCard[];
  decks: Deck[];
  dailyQuests: DailyQuest[];
  lastLoginDate: string | null;
  coins: number;
  diamonds: number;
  scrolls: number;
  totalDiamondsEarned: number;

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
  resetDailyQuests: () => void;

  // Currency
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addDiamonds: (amount: number) => void;
  spendDiamonds: (amount: number) => boolean;
  addScrolls: (amount: number) => void;
  spendScrolls: (amount: number) => boolean;

  // Daily login
  checkDailyLogin: () => boolean;
}

const DEFAULT_QUESTS: DailyQuest[] = [
  { id: 'q1', type: 'BATTLE', title: 'Juara Pemula', description: 'Menangkan 1 battles', target: 1, progress: 0, xpReward: 50, diamondReward: 5, completed: false },
  { id: 'q2', type: 'MODULE', title: 'Pelajar Keras', description: 'Selesaikan 1 modul belajar', target: 1, progress: 0, xpReward: 30, diamondReward: 3, completed: false },
  { id: 'q3', type: 'REVIEW', title: 'Ulang Harian', description: 'Review 10 kartu', target: 10, progress: 0, xpReward: 20, diamondReward: 2, completed: false },
  { id: 'q4', type: 'COLLECT', title: 'Kolektor', description: 'Tangkap 3 Pokemon baru', target: 3, progress: 0, xpReward: 60, diamondReward: 8, completed: false },
  { id: 'q5', type: 'STREAK', title: 'Streak 3 Hari', description: 'Login 3 hari berturut-turut', target: 3, progress: 0, xpReward: 100, diamondReward: 10, completed: false },
];

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      ownedCards: [],
      ownedPokemon: [],
      decks: [],
      dailyQuests: DEFAULT_QUESTS,
      lastLoginDate: null,
      coins: 500,
      diamonds: 0,
      scrolls: 3,
      totalDiamondsEarned: 0,

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
        const { ownedPokemon } = get();
        // Check if already caught
        if (ownedPokemon.some(p => p.pokemonId === pokemon.pokemonId)) {
          return; // Already caught
        }
        set(state => {
          const newOwnedPokemon = [...state.ownedPokemon, pokemon];
          // Update COLLECT quest progress
          const collectQuest = state.dailyQuests.find(q => q.type === 'COLLECT' && !q.completed);
          let newQuests = state.dailyQuests;
          if (collectQuest) {
            const newProgress = collectQuest.progress + 1;
            const completed = newProgress >= collectQuest.target;
            console.log(`[Gacha] Pokemon caught: ${pokemon.name}. COLLECT quest: ${newProgress}/${collectQuest.target}`);
            newQuests = state.dailyQuests.map(q =>
              q.id === collectQuest.id ? { ...q, progress: newProgress, completed } : q
            );
          }
          return {
            ownedPokemon: newOwnedPokemon,
            dailyQuests: newQuests,
          };
        });
        // Give diamond reward for new catch
        const { addDiamonds: addDiam } = get();
        addDiam(2);
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
        // Read all state at once, inside set() to avoid stale reads
        set(state => {
          const quest = state.dailyQuests.find(q => q.id === questId);
          if (!quest || quest.completed || quest.claimed) {
            console.warn(`[Quest] Cannot complete quest ${questId}: ${!quest ? 'not found' : quest.completed ? 'already completed' : 'already claimed'}`);
            return state;
          }

          console.log(`[Quest] ✓ Completing quest: ${quest.title} (${quest.type}). Claiming reward: ${quest.xpReward} XP + ${quest.diamondReward} 💎`);

          // Return new state with quest completed AND currency added in ONE atomic set
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

      resetDailyQuests: () => {
        set({ dailyQuests: DEFAULT_QUESTS });
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
        const { lastLoginDate } = get();
        const today = new Date().toDateString();
        if (lastLoginDate !== today) {
          set({ lastLoginDate: today, coins: get().coins + 10, scrolls: get().scrolls + 1 });
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
