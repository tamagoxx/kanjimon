import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OwnedCard, Deck, DailyQuest } from '@/types';

interface CollectionState {
  ownedCards: OwnedCard[];
  decks: Deck[];
  dailyQuests: DailyQuest[];
  lastLoginDate: string | null;
  coins: number;

  // Card actions
  addCard: (card: OwnedCard) => void;
  addCards: (cards: OwnedCard[]) => void;
  markCardSeen: (cardId: string) => void;

  // Deck actions
  createDeck: (name: string, cardIds: string[]) => void;
  updateDeck: (deckId: string, cardIds: string[]) => void;
  deleteDeck: (deckId: string) => void;

  // Quest actions
  updateQuestProgress: (questId: string, progress: number) => void;
  completeQuest: (questId: string) => void;
  resetDailyQuests: () => void;

  // Daily login
  checkDailyLogin: () => boolean;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      ownedCards: [],
      decks: [],
      dailyQuests: [],
      lastLoginDate: null,
      coins: 0,

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

      updateQuestProgress: (questId, progress) => {
        set(state => ({
          dailyQuests: state.dailyQuests.map(q =>
            q.id === questId ? { ...q, progress } : q
          ),
        }));
      },

      completeQuest: (questId) => {
        const { dailyQuests } = get();
        const quest = dailyQuests.find(q => q.id === questId);
        if (!quest) return;

        set(state => ({
          dailyQuests: state.dailyQuests.map(q =>
            q.id === questId ? { ...q, completed: true } : q
          ),
          coins: state.coins + quest.xpReward,
        }));
      },

      resetDailyQuests: () => {
        // TODO: Implement proper daily reset
        set({
          dailyQuests: [],
        });
      },

      checkDailyLogin: () => {
        const { lastLoginDate } = get();
        const today = new Date().toDateString();
        if (lastLoginDate !== today) {
          set({ lastLoginDate: today, coins: get().coins + 10 });
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
