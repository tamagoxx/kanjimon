import { create } from 'zustand';
import type { BattleState, BattleAction, StudyQuestion, BossPhase, Difficulty, Buff, Debuff, BuffType, DebuffType, StatusEffect, AIBehaviorPattern } from '../types';
import { CARDS_BY_ID } from '@/data/cards';

// Elemental effectiveness chart: attacker -> defender
const ELEMENT_EFFECTIVENESS: Record<string, Record<string, number>> = {
  FIRE: { GRASS: 1.5, WATER: 0.5, FIRE: 1.0, ELECTRIC: 1.0, PSYCHIC: 1.0, NORMAL: 1.0 },
  WATER: { FIRE: 1.5, GRASS: 0.5, WATER: 1.0, ELECTRIC: 0.5, PSYCHIC: 1.0, NORMAL: 1.0 },
  GRASS: { WATER: 1.5, FIRE: 0.5, GRASS: 1.0, ELECTRIC: 0.5, PSYCHIC: 1.0, NORMAL: 1.0 },
  ELECTRIC: { WATER: 1.5, GRASS: 0.5, FIRE: 1.0, ELECTRIC: 1.0, PSYCHIC: 1.0, NORMAL: 1.0 },
  PSYCHIC: { GRASS: 1.0, FIRE: 1.0, WATER: 1.0, ELECTRIC: 1.0, PSYCHIC: 1.0, NORMAL: 1.0 },
  NORMAL: {},
};

// Boss special moves by phase
const BOSS_MOVES: Record<BossPhase, { name: string; damage: number; effect?: DebuffType; effectValue?: number; description: string }[]> = {
  PHASE_1: [],
  PHASE_2: [
    { name: 'Elemental Burst', damage: 40, effect: 'WEAKEN', effectValue: 20, description: 'uses Elemental Burst! -40 DMG + -20% ATK' },
    { name: 'Power Crush', damage: 50, description: 'uses Power Crush! 50 DMG' },
  ],
  PHASE_3: [
    { name: 'Inferno Rush', damage: 60, effect: 'BURN', effectValue: 5, description: 'uses Inferno Rush! 60 DMG + Burn 5/turn' },
    { name: 'Tsunami Strike', damage: 55, effect: 'SLOW', effectValue: 20, description: 'uses Tsunami Strike! 55 DMG + Slow Energy' },
    { name: 'Toxic Storm', damage: 45, effect: 'POISON', effectValue: 3, description: 'uses Toxic Storm! 45 DMG + Poison 3/turn' },
  ],
  ENRAGED: [
    { name: 'Ultimate Destruction', damage: 80, effect: 'WEAKEN', effectValue: 30, description: 'uses Ultimate Destruction! 80 DMG + -30% ATK' },
    { name: 'Rampage', damage: 70, effect: 'STUN', effectValue: 1, description: 'uses Rampage! 70 DMG + chance to stun' },
    { name: 'Despair Wave', damage: 60, effect: 'POISON', effectValue: 5, description: 'uses Despair Wave! 60 DMG + Poison 5/turn' },
  ],
};

// Difficulty scaling for enemy stats
const DIFFICULTY_SCALE: Record<Difficulty, number> = {
  EASY: 0.7,
  NORMAL: 1.0,
  HARD: 1.3,
  INSANE: 1.5,
};

// Default AI behavior pattern
const DEFAULT_AI_BEHAVIOR: AIBehaviorPattern = {
  lastActions: [],
  defenseCount: 0,
  attackCount: 0,
  studyCount: 0,
  lastPlayerAction: null,
};

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
  
  // New mechanics
  applyShield: (target: 'player' | 'ai', amount: number) => void;
  applyBuff: (target: 'player' | 'ai', buff: Buff) => void;
  applyDebuff: (target: 'player' | 'ai', debuff: Debuff) => void;
  processEndOfTurn: () => void;
  checkBossPhaseTransition: () => void;
  getSmarterAIAction: () => BattleAction;
  calculateDamage: (cardId: string, isPlayer: boolean, defending: boolean) => number;
  applyElementalEffects: (attackerId: string, defenderId: string, baseDamage: number) => number;
}

export const useBattleStore = create<BattleStore>((set, get) => ({
  battle: null,
  isInBattle: false,

  startBattle: (battle) => set({ 
    battle, 
    isInBattle: true 
  }),

  endBattle: () => set({ 
    battle: null, 
    isInBattle: false 
  }),

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
    const { battle, getSmarterAIAction, applyElementalEffects, processEndOfTurn } = get();
    if (!battle) return;

    const newLog = [...battle.battleLog];
    let damage = 0;
    let description = '';
    let playerTookDamage = false;

    // Check player debuffs at start of turn
    const updatedBattle = processPlayerDebuffs(battle);

    // Study action
    if (action === 'STUDY') {
      if (battle.playerActiveCard) {
        const card = CARDS_BY_ID.get(battle.playerActiveCard);
        if (card) {
          // Apply Focus buff if active
          const hasFocus = battle.playerBuffs.some(b => b.type === 'FOCUS');
          const studyBonus = hasFocus ? 1.5 : 1.0;
          
          description = hasFocus ? 'Ultimate Study! +50% ATK, +30 HP!' : 'Player studies!';
          
          // Apply study bonus to player
          set(prev => {
            const newState = prev;
            if (newState.battle) {
              newState.battle.playerBuffs = [
                ...newState.battle.playerBuffs,
                { type: 'FOCUS', turnsRemaining: 2, value: 50 }
              ];
            }
            return newState;
          });

          newLog.push({
            turn: battle.turn,
            actor: 'player',
            action: 'STUDY',
            description,
            damage: 0,
          });
        }
      }
      
      set({
        battle: {
          ...battle,
          battleLog: newLog,
          isPlayerTurn: false,
        },
      });
      return;
    }

    // Attack action
    if (action === 'ATTACK' && cardId) {
      const card = CARDS_BY_ID.get(cardId);
      if (!card) return;

      // Check if player has Fury buff
      const furyBuff = battle.playerBuffs.find(b => b.type === 'FURY');
      const furyMultiplier = furyBuff ? 1 + (furyBuff.value / 100) : 1.0;

      // Calculate base damage
      const baseDamage = card.attackPower * furyMultiplier;
      
      // Apply elemental effectiveness
      let elementalMultiplier = 1.0;
      if (battle.aiActiveCard) {
        const aiCard = CARDS_BY_ID.get(battle.aiActiveCard);
        if (aiCard) {
          elementalMultiplier = ELEMENT_EFFECTIVENESS[card.element]?.[aiCard.element] || 1.0;
        }
      }

      // Check combo from recent actions
      const recentPlayerActions = battle.battleLog.filter(l => l.actor === 'player').slice(-5);
      let consecutiveAttacks = 0;
      for (let i = recentPlayerActions.length - 1; i >= 0; i--) {
        if (recentPlayerActions[i].action === 'ATTACK') {
          consecutiveAttacks++;
        } else {
          break;
        }
      }
      const comboMultiplier = consecutiveAttacks >= 3 ? 1.5 : 1.0;

      // Calculate final damage
      const defenseMultiplier = battle.aiDefending ? 0.5 : 1.0;
      damage = Math.floor(baseDamage * elementalMultiplier * comboMultiplier * defenseMultiplier);

      // Apply shield absorption
      let remainingDamage = damage;
      if (battle.aiShield > 0) {
        const absorbed = Math.min(battle.aiShield, remainingDamage);
        remainingDamage -= absorbed;
        set(prev => {
          if (prev.battle) {
            return { battle: { ...prev.battle, aiShield: prev.battle.aiShield - absorbed } };
          }
          return prev;
        });
      }

      // Apply damage
      const newAiHP = Math.max(0, battle.aiHP - remainingDamage);
      playerTookDamage = remainingDamage > 0;

      // Check for debuff application based on element
      const elementDebuff = getElementalDebuff(card.element);
      if (elementDebuff && Math.random() < 0.3) { // 30% chance
        set(prev => {
          if (prev.battle) {
            return {
              battle: {
                ...prev.battle,
                aiDebuffs: [...prev.battle.aiDebuffs, { type: elementDebuff.type, turnsRemaining: elementDebuff.duration, value: elementDebuff.value }]
              }
            };
          }
          return prev;
        });
      }

      description = `${card.japanese} attacks! ${elementalMultiplier > 1 ? 'Super effective!' : elementalMultiplier < 1 ? 'Not very effective...' : ''} ${comboMultiplier > 1 ? '(3+ COMBO!)' : ''}`;

      if (battle.aiDefending) {
        description += ' (Blocked!)';
      }

      newLog.push({
        turn: battle.turn,
        actor: 'player',
        action: 'ATTACK',
        description,
        damage: remainingDamage,
      });

      // Check boss phase transition
      const newBossPhase = checkBossHPThreshold(newAiHP, battle.aiMaxHP, battle.bossPhase);

      // Check battle end
      const battleEnded = newAiHP <= 0 ? 'VICTORY' : null;

      set({
        battle: {
          ...battle,
          aiHP: newAiHP,
          battleLog: newLog,
          bossPhase: newBossPhase,
          phase: battleEnded ? 'VICTORY' : battle.phase,
          isPlayerTurn: false,
          flawlessVictory: battle.flawlessVictory && remainingDamage === 0,
        },
      });
      return;
    }

    // Defend action
    if (action === 'DEFEND') {
      // Player gains shield
      const shieldAmount = 20 + (battle.playerBuffs.some(b => b.type === 'SHIELD') ? 10 : 0);
      
      newLog.push({
        turn: battle.turn,
        actor: 'player',
        action: 'DEFEND',
        description: `Player defends! +${shieldAmount} Shield`,
        damage: 0,
      });

      set({
        battle: {
          ...battle,
          playerDefending: true,
          playerShield: battle.playerShield + shieldAmount,
          battleLog: newLog,
          isPlayerTurn: false,
        },
      });
      return;
    }

    // SPECIAL action (using card's special ability)
    if (action === 'SPECIAL' && cardId) {
      const card = CARDS_BY_ID.get(cardId);
      if (!card) return;

      // Card special abilities - could be heal, shield, or special attack
      // For now, just add a shield
      const shieldAmount = 25;
      
      newLog.push({
        turn: battle.turn,
        actor: 'player',
        action: 'SPECIAL',
        description: `${card.japanese} uses Special Ability! +${shieldAmount} Shield`,
        damage: 0,
      });

      set({
        battle: {
          ...battle,
          playerShield: battle.playerShield + shieldAmount,
          battleLog: newLog,
          isPlayerTurn: false,
        },
      });
    }
  },

  answerStudy: (answer) => {
    const { battle } = get();
    if (!battle || !battle.studyQuestion) {
      return { correct: false, correctAnswer: '' };
    }

    const correct = answer === battle.studyQuestion.correctAnswer;

    // If correct, apply buff to active card
    if (correct && battle.playerActiveCard) {
      set(prev => {
        if (prev.battle) {
          return {
            battle: {
              ...prev.battle,
              playerBuffs: [...prev.battle.playerBuffs, { type: 'FURY', turnsRemaining: 3, value: 30 }],
            }
          };
        }
        return prev;
      });
    }

    return {
      correct,
      correctAnswer: battle.studyQuestion.correctAnswer,
    };
  },

  aiTurn: () => {
    const { battle, getSmarterAIAction, processEndOfTurn, checkBossPhaseTransition } = get();
    if (!battle) return;

    // Process AI debuffs first
    let currentBattle = processAIDebuffs(battle);

    // Check if AI is stunned
    const isStunned = currentBattle.aiDebuffs.some(d => d.type === 'STUN' && d.turnsRemaining > 0);
    if (isStunned) {
      // Skip AI turn
      const logEntry = {
        turn: currentBattle.turn,
        actor: 'ai' as const,
        action: 'STUDY' as const,
        description: `${currentBattle.opponentName} is stunned!`,
        damage: 0,
      };
      
      set({
        battle: {
          ...currentBattle,
          battleLog: [...currentBattle.battleLog, logEntry],
          isPlayerTurn: true,
          aiDebuffs: currentBattle.aiDebuffs.map(d => d.type === 'STUN' ? { ...d, turnsRemaining: d.turnsRemaining - 1 } : d),
        },
      });
      
      // Process end of turn
      setTimeout(() => processEndOfTurn(), 500);
      return;
    }

    // Boss charging move telegraphing
    if (currentBattle.isBossBattle && currentBattle.bossChargingMove) {
      // Boss executes the charged move
      const chargedMove = BOSS_MOVES[currentBattle.bossPhase]?.find(m => m.name === currentBattle.bossCurrentMove);
      if (chargedMove) {
        const bossDamage = chargedMove.damage * (currentBattle.bossPhase === 'ENRAGED' ? 1.3 : 1.0);
        
        // Apply damage to player
        let remainingDamage = bossDamage;
        if (currentBattle.playerShield > 0) {
          const absorbed = Math.min(currentBattle.playerShield, remainingDamage);
          remainingDamage -= absorbed;
        }
        
        const newPlayerHP = Math.max(0, currentBattle.playerHP - remainingDamage);
        
        const logEntry = {
          turn: currentBattle.turn,
          actor: 'ai' as const,
          action: 'ATTACK' as const,
          description: `${currentBattle.opponentName} ${chargedMove.description}`,
          damage: remainingDamage,
        };

        // Apply debuff if any
        let newPlayerDebuffs = [...currentBattle.playerDebuffs];
        if (chargedMove.effect) {
          newPlayerDebuffs.push({
            type: chargedMove.effect,
            turnsRemaining: chargedMove.effectValue || 2,
            value: chargedMove.effectValue || 0,
          });
        }

        set({
          battle: {
            ...currentBattle,
            playerHP: newPlayerHP,
            playerDebuffs: newPlayerDebuffs,
            bossChargingMove: false,
            bossCurrentMove: null,
            battleLog: [...currentBattle.battleLog, logEntry],
            isPlayerTurn: true,
            flawlessVictory: false, // Player took damage
          },
        });
        
        // Check battle end
        if (newPlayerHP <= 0) {
          setTimeout(() => {
            set(prev => ({
              battle: prev.battle ? { ...prev.battle, phase: 'DEFEAT' as const } : null,
            }));
          }, 500);
          return;
        }
        
        setTimeout(() => processEndOfTurn(), 500);
        return;
      }
    }

    // Get AI action based on smarter logic
    const action = getSmarterAIAction();

    // Boss special move logic
    if (currentBattle.isBossBattle) {
      // Check if boss should start charging a move
      const hpPercent = currentBattle.aiHP / currentBattle.aiMaxHP;
      
      // Phase 2 transition (50% HP)
      if (hpPercent <= 0.5 && currentBattle.bossPhase === 'PHASE_1') {
        const newPhase: BossPhase = 'PHASE_2';
        const logEntry = {
          turn: currentBattle.turn,
          actor: 'ai' as const,
          action: 'STUDY' as const,
          description: `⚠️ ${currentBattle.opponentName} is changing strategy! Phase 2!`,
          damage: 0,
        };
        
        set({
          battle: {
            ...currentBattle,
            bossPhase: newPhase,
            battleLog: [...currentBattle.battleLog, logEntry],
          },
        });
        
        setTimeout(() => {
          // Boss starts charging a move
          const phase2Moves = BOSS_MOVES['PHASE_2'];
          const randomMove = phase2Moves[Math.floor(Math.random() * phase2Moves.length)];
          
          set(prev => {
            if (prev.battle) {
              return {
                battle: {
                  ...prev.battle,
                  bossChargingMove: true,
                  bossCurrentMove: randomMove.name,
                }
              };
            }
            return prev;
          });
        }, 1000);
        return;
      }
      
      // Phase 3 transition (25% HP)
      if (hpPercent <= 0.25 && currentBattle.bossPhase === 'PHASE_2') {
        const newPhase: BossPhase = 'PHASE_3';
        const logEntry = {
          turn: currentBattle.turn,
          actor: 'ai' as const,
          action: 'STUDY' as const,
          description: `🔥 ${currentBattle.opponentName} is going all out! Phase 3!`,
          damage: 0,
        };
        
        set({
          battle: {
            ...currentBattle,
            bossPhase: newPhase,
            battleLog: [...currentBattle.battleLog, logEntry],
          },
        });
        
        setTimeout(() => {
          const phase3Moves = BOSS_MOVES['PHASE_3'];
          const randomMove = phase3Moves[Math.floor(Math.random() * phase3Moves.length)];
          
          set(prev => {
            if (prev.battle) {
              return {
                battle: {
                  ...prev.battle,
                  bossChargingMove: true,
                  bossCurrentMove: randomMove.name,
                }
              };
            }
            return prev;
          });
        }, 1000);
        return;
      }
      
      // Enraged (10% HP)
      if (hpPercent <= 0.1 && currentBattle.bossPhase === 'PHASE_3') {
        const newPhase: BossPhase = 'ENRAGED';
        const logEntry = {
          turn: currentBattle.turn,
          actor: 'ai' as const,
          action: 'STUDY' as const,
          description: `💀 ${currentBattle.opponentName} IS ENRAGED! Ultimate power!`,
          damage: 0,
        };
        
        set({
          battle: {
            ...currentBattle,
            bossPhase: newPhase,
            battleLog: [...currentBattle.battleLog, logEntry],
          },
        });
        
        setTimeout(() => {
          const enragedMoves = BOSS_MOVES['ENRAGED'];
          const randomMove = enragedMoves[Math.floor(Math.random() * enragedMoves.length)];
          
          set(prev => {
            if (prev.battle) {
              return {
                battle: {
                  ...prev.battle,
                  bossChargingMove: true,
                  bossCurrentMove: randomMove.name,
                }
              };
            }
            return prev;
          });
        }, 1000);
        return;
      }
      
      // Telegraph next move if in Phase 2+
      if (currentBattle.bossPhase !== 'PHASE_1' && !currentBattle.bossChargingMove) {
        const phaseMoves = BOSS_MOVES[currentBattle.bossPhase];
        if (phaseMoves && phaseMoves.length > 0 && Math.random() < 0.4) {
          const randomMove = phaseMoves[Math.floor(Math.random() * phaseMoves.length)];
          
          const logEntry = {
            turn: currentBattle.turn,
            actor: 'ai' as const,
            action: 'STUDY' as const,
            description: `⚡ ${currentBattle.opponentName} is charging ${randomMove.name}...`,
            damage: 0,
          };
          
          set({
            battle: {
              ...currentBattle,
              battleLog: [...currentBattle.battleLog, logEntry],
              bossChargingMove: true,
              bossCurrentMove: randomMove.name,
            },
          });
          
          setTimeout(() => processEndOfTurn(), 500);
          return;
        }
      }
    }

    // Normal AI turn
    const aiCardId = currentBattle.aiHand[0];
    const aiCard = aiCardId ? CARDS_BY_ID.get(aiCardId) : null;

    if (action === 'ATTACK' && aiCard) {
      // Calculate AI damage
      const furyBuff = currentBattle.aiBuffs.find(b => b.type === 'FURY');
      const furyMultiplier = furyBuff ? 1 + (furyBuff.value / 100) : 1.0;
      
      let baseDamage = aiCard.attackPower * furyMultiplier;
      
      // Elemental effectiveness
      let elementalMultiplier = 1.0;
      if (currentBattle.playerActiveCard) {
        const playerCard = CARDS_BY_ID.get(currentBattle.playerActiveCard);
        if (playerCard) {
          elementalMultiplier = ELEMENT_EFFECTIVENESS[aiCard.element]?.[playerCard.element] || 1.0;
        }
      }

      // Combo
      const recentAiActions = currentBattle.battleLog.filter(l => l.actor === 'ai').slice(-5);
      let consecutiveAttacks = 0;
      for (let i = recentAiActions.length - 1; i >= 0; i--) {
        if (recentAiActions[i].action === 'ATTACK') {
          consecutiveAttacks++;
        } else {
          break;
        }
      }
      const comboMultiplier = consecutiveAttacks >= 3 ? 1.5 : 1.0;

      // Difficulty scaling
      const difficultyScale = DIFFICULTY_SCALE[currentBattle.difficulty];
      const defenseMultiplier = currentBattle.playerDefending ? 0.5 : 1.0;
      
      let damage = Math.floor(baseDamage * elementalMultiplier * comboMultiplier * defenseMultiplier * difficultyScale);

      // Apply shield
      let remainingDamage = damage;
      if (currentBattle.playerShield > 0) {
        const absorbed = Math.min(currentBattle.playerShield, remainingDamage);
        remainingDamage -= absorbed;
      }

      const newPlayerHP = Math.max(0, currentBattle.playerHP - remainingDamage);

      // Apply elemental debuff
      const elementDebuff = getElementalDebuff(aiCard.element);
      let newPlayerDebuffs = [...currentBattle.playerDebuffs];
      if (elementDebuff && Math.random() < 0.3) {
        newPlayerDebuffs.push({
          type: elementDebuff.type,
          turnsRemaining: elementDebuff.duration,
          value: elementDebuff.value,
        });
      }

      const logEntry = {
        turn: currentBattle.turn,
        actor: 'ai' as const,
        action: 'ATTACK' as const,
        description: `${currentBattle.opponentName} attacks with ${aiCard.japanese}! ${elementalMultiplier > 1 ? 'Super effective!' : ''} ${comboMultiplier > 1 ? '(3+ COMBO!)' : ''}`,
        damage: remainingDamage,
      };

      set({
        battle: {
          ...currentBattle,
          playerHP: newPlayerHP,
          playerDebuffs: newPlayerDebuffs,
          battleLog: [...currentBattle.battleLog, logEntry],
          isPlayerTurn: true,
          flawlessVictory: currentBattle.flawlessVictory && remainingDamage === 0,
        },
      });

      // Check battle end
      if (newPlayerHP <= 0) {
        setTimeout(() => {
          set(prev => ({
            battle: prev.battle ? { ...prev.battle, phase: 'DEFEAT' as const } : null,
          }));
        }, 500);
        return;
      }
    } else if (action === 'DEFEND') {
      const shieldAmount = 20;
      
      const logEntry = {
        turn: currentBattle.turn,
        actor: 'ai' as const,
        action: 'DEFEND' as const,
        description: `${currentBattle.opponentName} defends! +${shieldAmount} Shield`,
        damage: 0,
      };

      set({
        battle: {
          ...currentBattle,
          aiDefending: true,
          aiShield: currentBattle.aiShield + shieldAmount,
          battleLog: [...currentBattle.battleLog, logEntry],
          isPlayerTurn: true,
        },
      });
    } else if (action === 'STUDY') {
      const logEntry = {
        turn: currentBattle.turn,
        actor: 'ai' as const,
        action: 'STUDY' as const,
        description: `${currentBattle.opponentName} studies...`,
        damage: 0,
      };

      set({
        battle: {
          ...currentBattle,
          aiBuffs: [...currentBattle.aiBuffs, { type: 'FOCUS', turnsRemaining: 2, value: 50 }],
          battleLog: [...currentBattle.battleLog, logEntry],
          isPlayerTurn: true,
        },
      });
    }

    setTimeout(() => processEndOfTurn(), 500);
  },

  nextTurn: () => {
    const { battle } = get();
    if (!battle) return;

    // Check turn limit
    if (battle.turn >= battle.maxTurns) {
      // Draw - neither wins
      set({
        battle: {
          ...battle,
          phase: 'END' as const,
          battleLog: [...battle.battleLog, {
            turn: battle.turn,
            actor: 'player' as const,
            action: 'STUDY' as const,
            description: '⏰ Turn limit reached! Battle ended in Draw!',
            damage: 0,
          }],
        },
      });
      return;
    }

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

  // Apply shield to target
  applyShield: (target, amount) => {
    const { battle } = get();
    if (!battle) return;

    if (target === 'player') {
      set({ battle: { ...battle, playerShield: battle.playerShield + amount } });
    } else {
      set({ battle: { ...battle, aiShield: battle.aiShield + amount } });
    }
  },

  // Apply buff to target
  applyBuff: (target, buff) => {
    const { battle } = get();
    if (!battle) return;

    if (target === 'player') {
      set({ battle: { ...battle, playerBuffs: [...battle.playerBuffs, buff] } });
    } else {
      set({ battle: { ...battle, aiBuffs: [...battle.aiBuffs, buff] } });
    }
  },

  // Apply debuff to target
  applyDebuff: (target, debuff) => {
    const { battle } = get();
    if (!battle) return;

    if (target === 'player') {
      set({ battle: { ...battle, playerDebuffs: [...battle.playerDebuffs, debuff] } });
    } else {
      set({ battle: { ...battle, aiDebuffs: [...battle.aiDebuffs, debuff] } });
    }
  },

  // Process end of turn effects (buffs, debuffs ticking)
  processEndOfTurn: () => {
    const { battle, nextTurn } = get();
    if (!battle) return;

    let newPlayerBuffs = battle.playerBuffs.map(b => ({ ...b, turnsRemaining: b.turnsRemaining - 1 })).filter(b => b.turnsRemaining > 0);
    let newPlayerDebuffs = battle.playerDebuffs.map(d => ({ ...d, turnsRemaining: d.turnsRemaining - 1 })).filter(d => d.turnsRemaining > 0);
    let newAiBuffs = battle.aiBuffs.map(b => ({ ...b, turnsRemaining: b.turnsRemaining - 1 })).filter(b => b.turnsRemaining > 0);
    let newAiDebuffs = battle.aiDebuffs.map(d => ({ ...d, turnsRemaining: d.turnsRemaining - 1 })).filter(d => d.turnsRemaining > 0);

    // Process damage-over-time debuffs
    let playerDotDamage = 0;
    let aiDotDamage = 0;

    // Player burn/poison damage
    const burnDebuff = battle.playerDebuffs.find(d => d.type === 'BURN');
    if (burnDebuff) {
      playerDotDamage += burnDebuff.value;
    }
    const poisonDebuff = battle.playerDebuffs.find(d => d.type === 'POISON');
    if (poisonDebuff) {
      playerDotDamage += poisonDebuff.value;
    }

    // AI burn/poison damage
    const aiBurnDebuff = battle.aiDebuffs.find(d => d.type === 'BURN');
    if (aiBurnDebuff) {
      aiDotDamage += aiBurnDebuff.value;
    }
    const aiPoisonDebuff = battle.aiDebuffs.find(d => d.type === 'POISON');
    if (aiPoisonDebuff) {
      aiDotDamage += aiPoisonDebuff.value;
    }

    // Apply DoT damage
    const newPlayerHP = Math.max(0, battle.playerHP - playerDotDamage);
    const newAiHP = Math.max(0, battle.aiHP - aiDotDamage);

    // Process regeneration buffs
    const playerRegenBuff = battle.playerBuffs.find(b => b.type === 'REGENERATION');
    if (playerRegenBuff) {
      const healAmount = Math.min(playerRegenBuff.value, battle.playerMaxHP - newPlayerHP);
    }

    const aiRegenBuff = battle.aiBuffs.find(b => b.type === 'REGENERATION');
    if (aiRegenBuff) {
      const healAmount = Math.min(aiRegenBuff.value, battle.aiMaxHP - newAiHP);
    }

    // Log DoT effects
    const newLog = [...battle.battleLog];
    if (playerDotDamage > 0) {
      newLog.push({
        turn: battle.turn,
        actor: 'player',
        action: 'STUDY',
        description: `🔥 DoT deals ${playerDotDamage} damage to player!`,
        damage: playerDotDamage,
      });
    }
    if (aiDotDamage > 0) {
      newLog.push({
        turn: battle.turn,
        actor: 'ai',
        action: 'STUDY',
        description: `🔥 DoT deals ${aiDotDamage} damage to ${battle.opponentName}!`,
        damage: aiDotDamage,
      });
    }

    set({
      battle: {
        ...battle,
        playerHP: newPlayerHP,
        aiHP: newAiHP,
        playerBuffs: newPlayerBuffs,
        playerDebuffs: newPlayerDebuffs,
        aiBuffs: newAiBuffs,
        aiDebuffs: newAiDebuffs,
        battleLog: newLog,
      },
    });

    // Check for battle end after DoT
    if (newPlayerHP <= 0) {
      set({ battle: { ...battle, playerHP: 0, phase: 'DEFEAT' as const } });
      return;
    }
    if (newAiHP <= 0) {
      set({ battle: { ...battle, aiHP: 0, phase: 'VICTORY' as const } });
      return;
    }

    nextTurn();
  },

  // Check boss phase transition based on HP
  checkBossPhaseTransition: () => {
    const { battle } = get();
    if (!battle || !battle.isBossBattle) return;

    const hpPercent = battle.aiHP / battle.aiMaxHP;
    let newPhase = battle.bossPhase;

    if (hpPercent <= 0.1 && battle.bossPhase !== 'ENRAGED') {
      newPhase = 'ENRAGED';
    } else if (hpPercent <= 0.25 && battle.bossPhase !== 'PHASE_3') {
      newPhase = 'PHASE_3';
    } else if (hpPercent <= 0.5 && battle.bossPhase !== 'PHASE_2') {
      newPhase = 'PHASE_2';
    }

    if (newPhase !== battle.bossPhase) {
      set({ battle: { ...battle, bossPhase: newPhase } });
    }
  },

  // Smart AI that adapts to player's patterns
  getSmarterAIAction: (): BattleAction => {
    const { battle } = get();
    if (!battle) return 'ATTACK';

    const behavior = battle.aiBehavior;
    const lastPlayerAction = behavior.lastPlayerAction;
    const recentPlayerActions = behavior.lastActions;

    // Boss AI is always aggressive
    if (battle.isBossBattle) {
      // In later phases, boss becomes more aggressive
      if (battle.bossPhase === 'PHASE_3' || battle.bossPhase === 'ENRAGED') {
        return 'ATTACK';
      }
      // Phase 2: mostly attack but occasionally defends
      if (battle.bossPhase === 'PHASE_2') {
        return Math.random() < 0.8 ? 'ATTACK' : 'DEFEND';
      }
      // Phase 1: balanced
      return Math.random() < 0.6 ? 'ATTACK' : (Math.random() < 0.5 ? 'DEFEND' : 'STUDY');
    }

    // Analyze player's recent actions
    const recentAttacks = recentPlayerActions.filter(a => a === 'ATTACK').length;
    const recentDefends = recentPlayerActions.filter(a => a === 'DEFEND').length;
    const recentStudies = recentPlayerActions.filter(a => a === 'STUDY').length;

    // Pattern: Player spams attacks → AI should defend more
    if (recentAttacks >= 3 && lastPlayerAction === 'ATTACK') {
      // High chance to defend to counter
      const defendChance = 0.6;
      if (Math.random() < defendChance) {
        return 'DEFEND';
      }
    }

    // Pattern: Player defends twice → AI should attack (punish passive)
    if (recentDefends >= 2) {
      const attackChance = 0.7;
      if (Math.random() < attackChance) {
        return 'ATTACK';
      }
    }

    // Pattern: Player studied → AI ready for attack, plays defensively
    if (lastPlayerAction === 'STUDY') {
      const defendChance = 0.5;
      if (Math.random() < defendChance) {
        return 'DEFEND';
      }
    }

    // Pattern: Player attacks after studying → AI predicts attack
    if (recentPlayerActions.length >= 2) {
      const twoAgo = recentPlayerActions[recentPlayerActions.length - 2];
      const last = recentPlayerActions[recentPlayerActions.length - 1];
      if (twoAgo === 'STUDY' && last === 'ATTACK') {
        // Player is using study-attack combo, defend to counter
        return Math.random() < 0.6 ? 'DEFEND' : 'ATTACK';
      }
    }

    // Default behavior based on AI strategy
    const strategy = battle.opponentId;
    
    // Adaptive AI uses player patterns
    if (behavior.lastPlayerAction) {
      // If player is aggressive, become defensive
      if (recentAttacks > recentDefends && recentAttacks >= 2) {
        return Math.random() < 0.5 ? 'DEFEND' : 'ATTACK';
      }
      // If player is passive, punish with attack
      if (recentDefends > recentAttacks && recentDefends >= 2) {
        return 'ATTACK';
      }
    }

    // Balanced fallback
    const roll = Math.random();
    if (roll < 0.5) return 'ATTACK';
    if (roll < 0.75) return 'DEFEND';
    return 'STUDY';
  },

  // Calculate damage with all modifiers
  calculateDamage: (cardId, isPlayer, defending) => {
    const { battle } = get();
    if (!battle) return 0;

    const card = CARDS_BY_ID.get(cardId);
    if (!card) return 0;

    const isPlayerCard = isPlayer ? card : null;
    const targetCard = isPlayer ? (battle.aiActiveCard ? CARDS_BY_ID.get(battle.aiActiveCard) : null) : (battle.playerActiveCard ? CARDS_BY_ID.get(battle.playerActiveCard) : null);

    // Base damage from card attack power
    let baseDamage = card.attackPower;

    // Fury buff
    const furyBuff = isPlayer ? battle.playerBuffs.find(b => b.type === 'FURY') : battle.aiBuffs.find(b => b.type === 'FURY');
    if (furyBuff) {
      baseDamage *= (1 + furyBuff.value / 100);
    }

    // Elemental effectiveness
    if (targetCard) {
      const elementalMult = ELEMENT_EFFECTIVENESS[card.element]?.[targetCard.element] || 1.0;
      baseDamage *= elementalMult;
    }

    // Combo bonus
    const recentActions = (isPlayer ? battle.battleLog.filter(l => l.actor === 'player') : battle.battleLog.filter(l => l.actor === 'ai')).slice(-5);
    let consecutiveAttacks = 0;
    for (let i = recentActions.length - 1; i >= 0; i--) {
      if (recentActions[i].action === 'ATTACK') consecutiveAttacks++;
      else break;
    }
    if (consecutiveAttacks >= 3) {
      baseDamage *= 1.5;
    }

    // Defense reduction
    if (defending) {
      baseDamage *= 0.5;
    }

    // Difficulty scaling for AI attacks
    if (!isPlayer) {
      baseDamage *= DIFFICULTY_SCALE[battle.difficulty];
    }

    return Math.floor(baseDamage);
  },

  // Apply elemental effects for attack
  applyElementalEffects: (attackerId, defenderId, baseDamage) => {
    const attacker = CARDS_BY_ID.get(attackerId);
    const defender = CARDS_BY_ID.get(defenderId);
    
    if (!attacker || !defender) return baseDamage;

    const elementalMult = ELEMENT_EFFECTIVENESS[attacker.element]?.[defender.element] || 1.0;
    return Math.floor(baseDamage * elementalMult);
  },
}));

// Helper function to get elemental debuff
function getElementalDebuff(element: string): { type: DebuffType; duration: number; value: number } | null {
  switch (element) {
    case 'FIRE':
      return { type: 'BURN', duration: 3, value: 5 };
    case 'WATER':
      return { type: 'SLOW', duration: 2, value: 20 };
    case 'GRASS':
      return { type: 'POISON', duration: 2, value: 3 };
    case 'ELECTRIC':
      return { type: 'STUN', duration: 1, value: 1 }; // chance to skip turn
    default:
      return null;
  }
}

// Process player debuffs at start of turn
function processPlayerDebuffs(battle: BattleState): BattleState {
  let newPlayerDebuffs = battle.playerDebuffs.map(d => ({ ...d }));
  
  // Check for Slow debuff (reduces energy regen - not implemented yet in this version)
  // Check for Weaken debuff (reduces attack power handled in calculateDamage)

  return {
    ...battle,
    playerDebuffs: newPlayerDebuffs,
  };
}

// Process AI debuffs at start of turn
function processAIDebuffs(battle: BattleState): BattleState {
  let newAiDebuffs = battle.aiDebuffs.map(d => ({ ...d }));
  
  return {
    ...battle,
    aiDebuffs: newAiDebuffs,
  };
}

// Check boss HP threshold for phase transition
function checkBossHPThreshold(currentHP: number, maxHP: number, currentPhase: BossPhase): BossPhase {
  const hpPercent = currentHP / maxHP;

  if (hpPercent <= 0.1 && currentPhase !== 'ENRAGED') {
    return 'ENRAGED';
  }
  if (hpPercent <= 0.25 && currentPhase !== 'PHASE_3' && currentPhase !== 'ENRAGED') {
    return 'PHASE_3';
  }
  if (hpPercent <= 0.5 && currentPhase === 'PHASE_1') {
    return 'PHASE_2';
  }

  return currentPhase;
}