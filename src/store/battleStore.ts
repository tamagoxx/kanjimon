import { create } from 'zustand';
import type { BattleState, BattleAction, StudyQuestion } from '@/types';

interface BattleStore {
  battle: BattleState | null;
  isInBattle: boolean;

  // Actions
  startBattle: (battle: BattleState) => void;
  endBattle: () => void;
  setPhase: (phase: BattleState['phase']) => void;
  playCard: (cardId: string) => void;
  performAction: (action: BattleAction, cardId?: string) => void;
  answerStudy: (answer: string) => { correct: boolean; correctAnswer: string };
  aiTurn: () => void;
  nextTurn: () => void;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  battle: null,
  isInBattle: false,

  startBattle: (battle) => set({ battle, isInBattle: true }),

  endBattle: () => set({ battle: null, isInBattle: false }),

  setPhase: (phase) => {
    const { battle } = get();
    if (!battle) return;
    set({ battle: { ...battle, phase } });
  },

  playCard: (cardId) => {
    const { battle } = get();
    if (!battle) return;

    const newHand = battle.playerHand.filter(id => id !== cardId);
    set({
      battle: {
        ...battle,
        playerHand: newHand,
        playerActiveCard: cardId,
      },
    });
  },

  performAction: (action, cardId) => {
    const { battle } = get();
    if (!battle) return;

    const newLog = [...battle.battleLog];

    if (action === 'ATTACK' && cardId && battle.playerActiveCard) {
      // TODO: Calculate damage based on card stats vs AI defense
      newLog.push({
        turn: battle.turn,
        actor: 'player',
        action: 'ATTACK',
        description: `Player attacks with card!`,
        damage: 30,
      });
    }

    set({
      battle: {
        ...battle,
        battleLog: newLog,
      },
    });
  },

  answerStudy: (answer) => {
    const { battle } = get();
    if (!battle || !battle.studyQuestion) {
      return { correct: false, correctAnswer: '' };
    }

    const correct = answer === battle.studyQuestion.correctAnswer;
    return {
      correct,
      correctAnswer: battle.studyQuestion.correctAnswer,
    };
  },

  aiTurn: () => {
    const { battle } = get();
    if (!battle) return;

    // Simple AI: random action
    const actions: BattleAction[] = ['ATTACK', 'STUDY', 'DEFEND'];
    const randomAction = actions[Math.floor(Math.random() * actions.length)];

    const newLog = [...battle.battleLog];
    newLog.push({
      turn: battle.turn,
      actor: 'ai',
      action: randomAction,
      description: `AI uses ${randomAction}`,
    });

    set({
      battle: {
        ...battle,
        battleLog: newLog,
        isPlayerTurn: true,
      },
    });
  },

  nextTurn: () => {
    const { battle } = get();
    if (!battle) return;

    set({
      battle: {
        ...battle,
        turn: battle.turn + 1,
        isPlayerTurn: true,
        playerDefending: false,
        aiDefending: false,
      },
    });
  },
}));
