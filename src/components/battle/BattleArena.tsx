'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/card/Card';
import type { BattleState, JapaneseCard, AIOpponent, BattleAction, BattleLogEntry, StudyQuestion, BossPhase, Difficulty, Buff, Debuff } from '@/types';
import { CARDS_BY_ID } from '@/data/cards';

// Boss opponents with phases
const BOSS_OPPONENTS: AIOpponent[] = [
  { 
    id: 'onyx_shadow', 
    name: 'Onyx Shadow', 
    title: 'The Darkness', 
    strategy: 'boss_adaptive', 
    deckTheme: ['PSYCHIC', 'NORMAL'], 
    unlockLevel: 15, 
    avatarUrl: '👤',
    isBoss: true,
    maxHP: 500,
    phases: ['PHASE_1', 'PHASE_2', 'PHASE_3', 'ENRAGED'],
    specialMoves: ['Shadow Strike', 'Dark Pulse', 'Void Crush'],
    difficulty: 'HARD',
  },
  { 
    id: 'crimson_flame', 
    name: 'Crimson Flame', 
    title: 'The Inferno', 
    strategy: 'boss_adaptive', 
    deckTheme: ['FIRE'], 
    unlockLevel: 20, 
    avatarUrl: '🔥',
    isBoss: true,
    maxHP: 600,
    phases: ['PHASE_1', 'PHASE_2', 'PHASE_3', 'ENRAGED'],
    specialMoves: ['Inferno Rush', 'Flame Burst', 'Blaze Storm'],
    difficulty: 'INSANE',
  },
  { 
    id: 'final_boss', 
    name: 'KEIZER', 
    title: 'The Final Emperor', 
    strategy: 'boss_adaptive', 
    deckTheme: ['FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'PSYCHIC', 'NORMAL'], 
    unlockLevel: 100, 
    avatarUrl: '👑',
    isBoss: true,
    maxHP: 1000,
    phases: ['PHASE_1', 'PHASE_2', 'PHASE_3', 'ENRAGED'],
    specialMoves: ['World Ender', 'Nova Burst', 'Annihilation'],
    difficulty: 'INSANE',
  },
];

// Regular AI opponents with difficulty scaling
const AI_OPPONENTS: AIOpponent[] = [
  { id: 'sensei', name: 'Sensei Bot', title: 'The Guide', strategy: 'random', deckTheme: ['NORMAL', 'PSYCHIC'], unlockLevel: 1, avatarUrl: '👨‍🏫' },
  { id: 'ninja', name: 'Ninja Bot', title: 'The Shadow', strategy: 'aggressive', deckTheme: ['FIRE', 'ELECTRIC'], unlockLevel: 5, avatarUrl: '🥷' },
  { id: 'samurai', name: 'Samurai Bot', title: 'The Guardian', strategy: 'defensive', deckTheme: ['WATER', 'GRASS'], unlockLevel: 10, avatarUrl: '⚔️' },
  { id: 'shogun', name: 'Shogun Bot', title: 'The Warlord', strategy: 'balanced', deckTheme: ['FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'PSYCHIC', 'NORMAL'], unlockLevel: 20, avatarUrl: '🛡️' },
];

// All opponents combined
const ALL_OPPONENTS = [...AI_OPPONENTS, ...BOSS_OPPONENTS];

// Boss phase names for display
const BOSS_PHASE_NAMES: Record<BossPhase, string> = {
  PHASE_1: 'Phase 1',
  PHASE_2: 'Phase 2',
  PHASE_3: 'Phase 3',
  ENRAGED: 'ENRAGED!',
};

// Boss phase colors
const BOSS_PHASE_COLORS: Record<BossPhase, string> = {
  PHASE_1: '#6c5ce7',
  PHASE_2: '#fdcb6e',
  PHASE_3: '#e17055',
  ENRAGED: '#d63031',
};

// Difficulty display names
const DIFFICULTY_NAMES: Record<Difficulty, string> = {
  EASY: 'Mudah',
  NORMAL: 'Normal',
  HARD: 'Sulit',
  INSANE: 'Gila',
};

// Buff/Debuff icons
const BUFF_ICONS: Record<string, string> = {
  SHIELD: '🛡️',
  BARRIER: '🌟',
  FURY: '⚔️',
  FOCUS: '📚',
  REGENERATION: '💚',
};

const DEBUFF_ICONS: Record<string, string> = {
  BURN: '🔥',
  SLOW: '🐌',
  POISON: '☠️',
  STUN: '⚡',
  WEAKEN: '💀',
};

interface BattleArenaProps {
  playerDeck: JapaneseCard[];
  opponentId?: string;
  onBattleEnd: (won: boolean, xpEarned: number, cardsEarned: JapaneseCard[]) => void;
  onExit: () => void;
}

export function BattleArena({ playerDeck, opponentId = 'sensei', onBattleEnd, onExit }: BattleArenaProps) {
  const opponent = ALL_OPPONENTS.find(o => o.id === opponentId) || AI_OPPONENTS[0];
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'battle' | 'result'>('intro');
  const [message, setMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showStudy, setShowStudy] = useState(false);
  const [studyResult, setStudyResult] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [winStreak, setWinStreak] = useState(0);

  // Initialize battle
  const initBattle = useCallback(() => {
    const allPlayerIds = playerDeck.map(c => c.id);
    const shuffledPlayerIds = [...allPlayerIds].sort(() => Math.random() - 0.5);
    const playerHand = shuffledPlayerIds.slice(0, 5);
    const remainingDeck = shuffledPlayerIds.slice(5);

    // AI deck
    const aiDeckIds = [...allPlayerIds].sort(() => Math.random() - 0.5).slice(0, 20);
    const aiHand = aiDeckIds.slice(0, 5);
    const aiRemainingDeck = aiDeckIds.slice(5);

    // Calculate max HP based on cards in deck
    const calculateMaxHP = (cardIds: string[], isBoss: boolean) => {
      let totalHP = 0;
      cardIds.forEach(id => {
        const card = CARDS_BY_ID.get(id);
        if (card) totalHP += card.hp;
      });
      // Add boss bonus HP
      if (isBoss && opponent.maxHP) {
        return opponent.maxHP;
      }
      // Regular: average HP from deck * 5 (hand size)
      return Math.max(200, totalHP / cardIds.length * 5);
    };

    const isBoss = opponent.isBoss || false;
    const difficulty: Difficulty = (opponent.difficulty as Difficulty) || 'NORMAL';

    // Boss HP from opponent definition or calculated
    const aiMaxHP = isBoss && opponent.maxHP ? opponent.maxHP : 300;
    const playerMaxHP = 300;

    const newBattle: BattleState = {
      id: crypto.randomUUID(),
      playerId: 'player',
      opponentId: opponent.id,
      opponentName: opponent.name,
      phase: 'SETUP',
      // Boss system
      bossPhase: 'PHASE_1',
      isBossBattle: isBoss,
      bossChargingMove: false,
      bossCurrentMove: null,
      difficulty,
      // Decks
      playerDeck: remainingDeck,
      playerHand,
      playerActiveCard: null,
      playerDiscard: [],
      aiDeck: aiRemainingDeck,
      aiHand,
      aiActiveCard: null,
      aiDiscard: [],
      // Turn management
      turn: 1,
      maxTurns: 15,
      isPlayerTurn: true,
      // HP system with shields
      playerHP: playerMaxHP,
      playerMaxHP,
      playerShield: 0,
      aiHP: aiMaxHP,
      aiMaxHP,
      aiShield: 0,
      // Buffs and debuffs
      playerBuffs: [],
      playerDebuffs: [],
      aiBuffs: [],
      aiDebuffs: [],
      // Status effects
      playerStatusEffects: [],
      aiStatusEffects: [],
      // Battle state
      battleLog: [],
      studyQuestion: null,
      playerDefending: false,
      aiDefending: false,
      // AI behavior tracking
      aiBehavior: {
        lastActions: [],
        defenseCount: 0,
        attackCount: 0,
        studyCount: 0,
        lastPlayerAction: null,
      },
      // Rewards
      battleRewardMultiplier: 1,
      flawlessVictory: true,
    };

    setBattle(newBattle);
    setCurrentPhase('battle');
  }, [playerDeck, opponent]);

  // Draw card
  const drawCard = (isPlayer: boolean) => {
    if (!battle) return null;
    const deckKey = isPlayer ? 'playerDeck' : 'aiDeck';
    const handKey = isPlayer ? 'playerHand' : 'aiHand';
    const deck = [...(battle[deckKey as keyof BattleState] as string[])];
    if (deck.length === 0) return null;
    const drawnCardId = deck.pop()!;
    const hand = [...(battle[handKey as keyof BattleState] as string[]), drawnCardId];
    setBattle(prev => prev ? {
      ...prev,
      [deckKey]: deck,
      [handKey]: hand,
    } : null);
    return CARDS_BY_ID.get(drawnCardId);
  };

  // Play card from hand
  const playCard = (cardId: string) => {
    if (!battle || !battle.isPlayerTurn || isAnimating) return;
    setIsAnimating(true);

    const hand = battle.playerHand.filter(id => id !== cardId);
    const card = CARDS_BY_ID.get(cardId);

    // Update AI behavior tracking
    const newBehavior = { ...battle.aiBehavior };

    setBattle(prev => prev ? {
      ...prev,
      playerHand: hand,
      playerActiveCard: cardId,
      aiBehavior: newBehavior,
    } : null);

    setTimeout(() => setIsAnimating(false), 500);
  };

  // Perform battle action
  const performAction = (action: BattleAction) => {
    if (!battle || !battle.isPlayerTurn || isAnimating) return;

    if (action === 'STUDY') {
      if (battle.playerActiveCard) {
        const card = CARDS_BY_ID.get(battle.playerActiveCard);
        if (card) {
          const question = generateStudyQuestion(card);
          setBattle(prev => prev ? { ...prev, studyQuestion: question } : null);
          setShowStudy(true);
          
          // Update AI behavior
          setBattle(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              aiBehavior: {
                ...prev.aiBehavior,
                lastPlayerAction: 'STUDY',
                lastActions: [...prev.aiBehavior.lastActions.slice(-4), 'STUDY'],
                studyCount: prev.aiBehavior.studyCount + 1,
              },
            };
          });
        }
      }
      return;
    }

    // Update AI behavior before action
    setBattle(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        aiBehavior: {
          ...prev.aiBehavior,
          lastPlayerAction: action,
          lastActions: [...prev.aiBehavior.lastActions.slice(-4), action],
          attackCount: action === 'ATTACK' ? prev.aiBehavior.attackCount + 1 : prev.aiBehavior.attackCount,
          defenseCount: action === 'DEFEND' ? prev.aiBehavior.defenseCount + 1 : prev.aiBehavior.defenseCount,
        },
      };
    });

    executeBattleAction(action, battle.playerActiveCard);
  };

  const executeBattleAction = (action: BattleAction, cardId: string | null, isPlayer = true) => {
    if (!battle) return;
    setIsAnimating(true);

    const logEntry: BattleLogEntry = {
      turn: battle.turn,
      actor: (isPlayer ? 'player' : 'ai') as 'player' | 'ai',
      action,
      description: '',
      damage: 0,
    };

    const card = cardId ? CARDS_BY_ID.get(cardId) : null;
    const targetActiveCard = isPlayer ? (battle.aiActiveCard ? CARDS_BY_ID.get(battle.aiActiveCard) : null) : (battle.playerActiveCard ? CARDS_BY_ID.get(battle.playerActiveCard) : null);

    // ELEMENT_CHART for damage calculation
    const ELEMENT_CHART: Record<string, Record<string, number>> = {
      FIRE: { GRASS: 1.5, WATER: 0.5, FIRE: 1.0, ELECTRIC: 1.0, PSYCHIC: 1.0, NORMAL: 1.0 },
      WATER: { FIRE: 1.5, GRASS: 0.5, WATER: 1.0, ELECTRIC: 0.5, PSYCHIC: 1.0, NORMAL: 1.0 },
      GRASS: { WATER: 1.5, FIRE: 0.5, GRASS: 1.0, ELECTRIC: 0.5, PSYCHIC: 1.0, NORMAL: 1.0 },
      ELECTRIC: { WATER: 1.5, GRASS: 0.5, FIRE: 1.0, ELECTRIC: 1.0, PSYCHIC: 1.0, NORMAL: 1.0 },
      PSYCHIC: { GRASS: 1.0, FIRE: 1.0, WATER: 1.0, ELECTRIC: 1.0, PSYCHIC: 1.0, NORMAL: 1.0 },
      NORMAL: {},
    };

    // DIFFICULTY_SCALE
    const DIFFICULTY_SCALE = { EASY: 0.7, NORMAL: 1.0, HARD: 1.3, INSANE: 1.5 };

    if (action === 'ATTACK' && card) {
      // Calculate damage
      const isPlayerAction = isPlayer;
      const target = isPlayerAction ? battle.aiDefending : battle.playerDefending;
      const defenseMultiplier = target ? 0.5 : 1.0;
      
      // Fury buff check
      const furyBuff = isPlayerAction ? battle.playerBuffs.find(b => b.type === 'FURY') : battle.aiBuffs.find(b => b.type === 'FURY');
      const furyMultiplier = furyBuff ? 1 + (furyBuff.value / 100) : 1.0;

      let baseDamage = card.attackPower * furyMultiplier;

      // Elemental effectiveness
      const elementalMult = targetActiveCard ? (ELEMENT_CHART[card.element]?.[targetActiveCard.element] || 1.0) : 1.0;
      baseDamage *= elementalMult;

      // Combo: count consecutive attacks
      const recentActions = battle.battleLog.filter(l => l.actor === (isPlayer ? 'player' : 'ai')).slice(-5);
      let consecutiveAttacks = 0;
      for (let i = recentActions.length - 1; i >= 0; i--) {
        if (recentActions[i].action === 'ATTACK') {
          consecutiveAttacks++;
        } else {
          break;
        }
      }
      const comboBonus = consecutiveAttacks >= 3 ? 1.5 : 1.0;
      baseDamage *= comboBonus;

      // Difficulty scaling for AI attacks
      if (!isPlayerAction) {
        baseDamage *= DIFFICULTY_SCALE[battle.difficulty];
      }

      // Final damage
      let damage = Math.floor(baseDamage * defenseMultiplier);

      // Apply shield absorption
      let remainingDamage = damage;
      const targetShield = isPlayerAction ? battle.aiShield : battle.playerShield;
      if (targetShield > 0) {
        const absorbed = Math.min(targetShield, remainingDamage);
        remainingDamage -= absorbed;
        
        // Reduce shield
        setBattle(prev => prev ? {
          ...prev,
          [isPlayerAction ? 'aiShield' : 'playerShield']: targetShield - absorbed,
        } : null);
      }

      // Apply damage
      if (isPlayerAction) {
        const newAiHP = Math.max(0, battle.aiHP - remainingDamage);
        logEntry.description = `${card.japanese} attacks! ${elementalMult > 1 ? 'Super effective!' : elementalMult < 1 ? 'Not very effective...' : ''} ${comboBonus > 1 ? '(3+ COMBO!)' : ''} ${battle.aiDefending ? '(Blocked!)' : ''}`;
        logEntry.damage = remainingDamage;

        // Apply elemental debuff (30% chance)
        if (Math.random() < 0.3 && card.element !== 'NORMAL') {
          const debuff = getElementalDebuff(card.element);
          if (debuff) {
            setBattle(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                aiDebuffs: [...prev.aiDebuffs, debuff],
              };
            });
            logEntry.description += ` ${debuff.type} applied!`;
          }
        }

        // Check boss phase transition
        let newBossPhase = battle.bossPhase;
        const hpPercent = newAiHP / battle.aiMaxHP;
        if (battle.isBossBattle) {
          if (hpPercent <= 0.1 && battle.bossPhase !== 'ENRAGED') newBossPhase = 'ENRAGED';
          else if (hpPercent <= 0.25 && battle.bossPhase === 'PHASE_2') newBossPhase = 'PHASE_3';
          else if (hpPercent <= 0.5 && battle.bossPhase === 'PHASE_1') newBossPhase = 'PHASE_2';
        }

        const newLog = [...battle.battleLog, logEntry];
        
        setBattle(prev => prev ? {
          ...prev,
          aiHP: newAiHP,
          battleLog: newLog,
          bossPhase: newBossPhase,
          isPlayerTurn: !isPlayerAction,
          flawlessVictory: prev.flawlessVictory && remainingDamage === 0,
        } : null);

        // Check battle end
        if (newAiHP <= 0) {
          setTimeout(() => handleVictory(), 1000);
        } else {
          setTimeout(() => {
            drawCard(!isPlayerAction);
            setIsAnimating(false);
          }, 1000);
        }
      } else {
        const newPlayerHP = Math.max(0, battle.playerHP - remainingDamage);
        logEntry.description = `${battle.opponentName} attacks with ${card.japanese}! ${elementalMult > 1 ? 'Super effective!' : ''} ${comboBonus > 1 ? '(3+ COMBO!)' : ''} ${battle.playerDefending ? '(Blocked!)' : ''}`;
        logEntry.damage = remainingDamage;

        // Apply elemental debuff (30% chance)
        if (Math.random() < 0.3 && card.element !== 'NORMAL') {
          const debuff = getElementalDebuff(card.element);
          if (debuff) {
            setBattle(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                playerDebuffs: [...prev.playerDebuffs, debuff],
              };
            });
            logEntry.description += ` ${debuff.type} applied!`;
          }
        }

        const newLog = [...battle.battleLog, logEntry];

        // Check for screen shake on big hits
        if (remainingDamage > 40) {
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 300);
        }

        setBattle(prev => prev ? {
          ...prev,
          playerHP: newPlayerHP,
          battleLog: newLog,
          isPlayerTurn: !isPlayerAction,
          flawlessVictory: prev.flawlessVictory && remainingDamage === 0,
        } : null);

        // Check battle end
        if (newPlayerHP <= 0) {
          setTimeout(() => handleDefeat(), 1000);
        } else {
          setTimeout(() => {
            drawCard(!isPlayerAction);
            setIsAnimating(false);
          }, 1000);
        }
      }
      return;
    }

    if (action === 'DEFEND') {
      const shieldAmount = 20 + (isPlayer ? (battle.playerBuffs.some(b => b.type === 'SHIELD') ? 10 : 0) : (battle.aiBuffs.some(b => b.type === 'SHIELD') ? 10 : 0));
      logEntry.description = `${isPlayer ? 'Player' : battle.opponentName} defends! +${shieldAmount} Shield`;
      logEntry.damage = 0;

      const newLog = [...battle.battleLog, logEntry];

      if (isPlayer) {
        setBattle(prev => prev ? {
          ...prev,
          playerDefending: true,
          playerShield: prev.playerShield + shieldAmount,
          battleLog: newLog,
          isPlayerTurn: false,
        } : null);
      } else {
        setBattle(prev => prev ? {
          ...prev,
          aiDefending: true,
          aiShield: prev.aiShield + shieldAmount,
          battleLog: newLog,
          isPlayerTurn: true,
        } : null);
      }

      setTimeout(() => {
        if (!isPlayer) {
          drawCard(true);
        } else {
          drawCard(false);
        }
        setIsAnimating(false);
      }, 1000);
      return;
    }

    if (action === 'SPECIAL') {
      const shieldAmount = 25;
      logEntry.description = `${card?.japanese || 'Card'} uses Special Ability! +${shieldAmount} Shield`;
      
      const newLog = [...battle.battleLog, logEntry];

      if (isPlayer) {
        setBattle(prev => prev ? {
          ...prev,
          playerShield: prev.playerShield + shieldAmount,
          battleLog: newLog,
          isPlayerTurn: false,
        } : null);
      }

      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
    }
  };

  // Answer study question
  const answerStudy = (answer: string) => {
    if (!battle || !battle.studyQuestion) return;

    const correct = answer === battle.studyQuestion.correctAnswer;
    setStudyResult({ correct, correctAnswer: battle.studyQuestion.correctAnswer });
    setShowStudy(false);

    if (correct) {
      setMessage('✅ Benar! Kartu mendapat +30% ATK dan +20 HP!');
      // Apply FURY buff
      setBattle(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          playerBuffs: [...prev.playerBuffs, { type: 'FURY', turnsRemaining: 3, value: 30 }],
          studyQuestion: null,
        };
      });
    } else {
      setMessage(`❌ Salah! Jawaban: ${battle.studyQuestion.correctAnswer}`);
      setBattle(prev => prev ? { ...prev, studyQuestion: null } : null);
    }

    // Still end player turn after study
    setTimeout(() => {
      setStudyResult(null);
      setMessage('');
      
      // AI turn
      if (battle.isPlayerTurn) {
        setTimeout(() => handleAITurn(), 500);
      }
    }, 2000);
  };

  // AI Turn with smarter logic
  const handleAITurn = useCallback(() => {
    if (!battle || !battle.isPlayerTurn === false) return;
    setIsAnimating(true);

    const behavior = battle.aiBehavior;
    
    // If boss is charging, execute the charged move
    if (battle.isBossBattle && battle.bossChargingMove && battle.bossCurrentMove) {
      executeBossChargedMove();
      return;
    }

    // Smart AI decision making
    let action: BattleAction = 'ATTACK';
    const roll = Math.random();

    // Boss AI: More aggressive in later phases
    if (battle.isBossBattle) {
      if (battle.bossPhase === 'ENRAGED') {
        action = 'ATTACK';
      } else if (battle.bossPhase === 'PHASE_3') {
        action = roll < 0.8 ? 'ATTACK' : (roll < 0.9 ? 'DEFEND' : 'STUDY');
      } else if (battle.bossPhase === 'PHASE_2') {
        action = roll < 0.6 ? 'ATTACK' : (roll < 0.8 ? 'DEFEND' : 'STUDY');
      } else {
        action = roll < 0.4 ? 'ATTACK' : (roll < 0.7 ? 'DEFEND' : 'STUDY');
      }
    } else {
      // Regular AI with adaptive behavior
      // If player attacks a lot, defend more
      if (behavior.lastPlayerAction === 'ATTACK' && behavior.attackCount >= 2) {
        action = roll < 0.5 ? 'DEFEND' : 'ATTACK';
      }
      // If player defends a lot, punish with attack
      else if (behavior.defenseCount >= 2) {
        action = roll < 0.7 ? 'ATTACK' : 'DEFEND';
      }
      // If player studied, be ready
      else if (behavior.lastPlayerAction === 'STUDY') {
        action = roll < 0.4 ? 'DEFEND' : 'ATTACK';
      }
      // Default: mostly attack
      else {
        action = roll < 0.55 ? 'ATTACK' : (roll < 0.8 ? 'DEFEND' : 'STUDY');
      }
    }

    const aiCardId = battle.aiHand[0];
    executeBattleAction(action, aiCardId, false);
  }, [battle]);

  // Execute boss charged move
  const executeBossChargedMove = () => {
    if (!battle || !battle.bossCurrentMove) return;

    const BOSS_MOVES: Record<BossPhase, { name: string; damage: number; effect?: string; effectValue?: number }[]> = {
      PHASE_1: [],
      PHASE_2: [
        { name: 'Elemental Burst', damage: 40, effect: 'WEAKEN', effectValue: 20 },
        { name: 'Power Crush', damage: 50 },
      ],
      PHASE_3: [
        { name: 'Inferno Rush', damage: 60, effect: 'BURN', effectValue: 5 },
        { name: 'Tsunami Strike', damage: 55, effect: 'SLOW', effectValue: 20 },
        { name: 'Toxic Storm', damage: 45, effect: 'POISON', effectValue: 3 },
      ],
      ENRAGED: [
        { name: 'Ultimate Destruction', damage: 80, effect: 'WEAKEN', effectValue: 30 },
        { name: 'Rampage', damage: 70, effect: 'STUN', effectValue: 1 },
        { name: 'Despair Wave', damage: 60, effect: 'POISON', effectValue: 5 },
      ],
    };

    const phaseMoves = BOSS_MOVES[battle.bossPhase];
    const moveIndex = phaseMoves.findIndex(m => m.name === battle.bossCurrentMove);
    const move = moveIndex >= 0 ? phaseMoves[moveIndex] : null;

    if (!move) {
      setBattle(prev => prev ? { ...prev, bossChargingMove: false, bossCurrentMove: null } : null);
      return;
    }

    // Apply damage
    let damage = Math.floor(move.damage * (battle.bossPhase === 'ENRAGED' ? 1.3 : 1.0));
    
    let remainingDamage = damage;
    if (battle.playerShield > 0) {
      const absorbed = Math.min(battle.playerShield, remainingDamage);
      remainingDamage -= absorbed;
    }

    const newPlayerHP = Math.max(0, battle.playerHP - remainingDamage);

    // Apply effect
    let newPlayerDebuffs = [...battle.playerDebuffs];
    if (move.effect) {
      newPlayerDebuffs.push({
        type: move.effect as any,
        turnsRemaining: move.effectValue || 2,
        value: move.effectValue || 0,
      });
    }

    const logEntry: BattleLogEntry = {
      turn: battle.turn,
      actor: 'ai',
      action: 'ATTACK',
      description: `⚡ ${battle.opponentName} uses ${move.name}! ${remainingDamage} DMG${move.effect ? ` + ${move.effect}` : ''}!`,
      damage: remainingDamage,
    };

    // Screen shake for boss move
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);

    setBattle(prev => prev ? {
      ...prev,
      playerHP: newPlayerHP,
      playerDebuffs: newPlayerDebuffs,
      playerShield: Math.max(0, prev.playerShield - damage),
      bossChargingMove: false,
      bossCurrentMove: null,
      battleLog: [...prev.battleLog, logEntry],
      flawlessVictory: false,
    } : null);

    // Check battle end
    if (newPlayerHP <= 0) {
      setTimeout(() => handleDefeat(), 1000);
    } else {
      setTimeout(() => {
        // End turn
        processEndOfTurn();
      }, 1000);
    }
  };

  // Process end of turn - debuffs ticking and turn transition
  const processEndOfTurn = () => {
    if (!battle) return;

    let newPlayerBuffs = battle.playerBuffs.map(b => ({ ...b, turnsRemaining: b.turnsRemaining - 1 })).filter(b => b.turnsRemaining > 0);
    let newPlayerDebuffs = battle.playerDebuffs.map(d => ({ ...d, turnsRemaining: d.turnsRemaining - 1 })).filter(d => d.turnsRemaining > 0);
    let newAiBuffs = battle.aiBuffs.map(b => ({ ...b, turnsRemaining: b.turnsRemaining - 1 })).filter(b => b.turnsRemaining > 0);
    let newAiDebuffs = battle.aiDebuffs.map(d => ({ ...d, turnsRemaining: d.turnsRemaining - 1 })).filter(d => d.turnsRemaining > 0);

    // Process DoT (Damage over Time)
    let playerDotDamage = 0;
    let aiDotDamage = 0;

    const burnPlayer = battle.playerDebuffs.find(d => d.type === 'BURN');
    if (burnPlayer) playerDotDamage += burnPlayer.value;
    const poisonPlayer = battle.playerDebuffs.find(d => d.type === 'POISON');
    if (poisonPlayer) playerDotDamage += poisonPlayer.value;

    const burnAi = battle.aiDebuffs.find(d => d.type === 'BURN');
    if (burnAi) aiDotDamage += burnAi.value;
    const poisonAi = battle.aiDebuffs.find(d => d.type === 'POISON');
    if (poisonAi) aiDotDamage += poisonAi.value;

    const newPlayerHP = Math.max(0, battle.playerHP - playerDotDamage);
    const newAiHP = Math.max(0, battle.aiHP - aiDotDamage);

    // Build log entries for DoT
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

    // Check turn limit
    if (battle.turn >= battle.maxTurns) {
      setCurrentPhase('result');
      const xpEarned = Math.floor(15 * battle.battleRewardMultiplier);
      const cardsEarned: JapaneseCard[] = [];
      onBattleEnd(false, xpEarned, cardsEarned);
      return;
    }

    setBattle(prev => prev ? {
      ...prev,
      playerHP: newPlayerHP,
      aiHP: newAiHP,
      playerBuffs: newPlayerBuffs,
      playerDebuffs: newPlayerDebuffs,
      aiBuffs: newAiBuffs,
      aiDebuffs: newAiDebuffs,
      battleLog: newLog,
      turn: prev.turn + 1,
      isPlayerTurn: true,
      playerDefending: false,
      aiDefending: false,
    } : null);

    setIsAnimating(false);
  };

  // Victory handler
  const handleVictory = () => {
    if (!battle) return;
    
    // Calculate rewards
    const isBoss = battle.isBossBattle;
    const difficultyMultiplier = DIFFICULTY_SCALE[battle.difficulty];
    const flawlessBonus = battle.flawlessVictory ? 2.0 : 1.0;
    const winStreakBonus = 1 + (winStreak * 0.1);
    
    let baseXP = isBoss ? 100 : (difficultyMultiplier > 1 ? 40 : 20);
    baseXP = Math.floor(baseXP * flawlessBonus * winStreakBonus * battle.battleRewardMultiplier);
    
    // Card rewards based on difficulty
    let cardReward: JapaneseCard | null = null;
    if (isBoss || Math.random() < (difficultyMultiplier * 0.3)) {
      // Get a random rare card
      const rareCards = Array.from(CARDS_BY_ID.values()).filter(c => 
        c.rarity === 'RARE' || c.rarity === 'ULTRA_RARE' || c.rarity === 'LIMITED_EDITION'
      );
      if (rareCards.length > 0) {
        cardReward = rareCards[Math.floor(Math.random() * rareCards.length)];
      }
    }
    
    const cardsEarned = cardReward ? [cardReward] : [];
    
    // Update win streak
    const newWinStreak = winStreak + 1;
    setWinStreak(newWinStreak);
    
    setCurrentPhase('result');
    onBattleEnd(true, baseXP, cardsEarned);
  };

  // Defeat handler
  const handleDefeat = () => {
    if (!battle) return;
    
    const xpEarned = Math.floor(10 * battle.battleRewardMultiplier);
    setWinStreak(0); // Reset win streak
    
    setCurrentPhase('result');
    onBattleEnd(false, xpEarned, []);
  };

  // DIFFICULTY_SCALE for display
  const DIFFICULTY_SCALE = { EASY: 0.7, NORMAL: 1.0, HARD: 1.3, INSANE: 1.5 };

  // Intro screen
  if (currentPhase === 'intro') {
    return (
      <div className="fixed inset-0 bg-[#0F0F1A] flex items-center justify-center z-50 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.15) 0%, transparent 70%)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(225,112,85,0.1) 0%, transparent 70%)', animationDelay: '0.5s' }} />
        </div>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(108,92,231,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-8xl mb-6 relative"
          >
            {opponent.avatarUrl}
            {opponent.isBoss && (
              <div className="absolute inset-0 -z-10 animate-ping" style={{ borderRadius: '50%', border: '3px solid rgba(225,112,85,0.4)', opacity: 0.3 }} />
            )}
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-black text-white mb-2 bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] bg-clip-text text-transparent"
          >
            {opponent.name}
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[#636E72] mb-2"
          >
            {opponent.title}
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-[#B2BEC3] mb-4"
          >
            {opponent.isBoss ? (
              <>
                <span className="text-[#E17055]">🔥 BOSS BATTLE 🔥</span>
                {opponent.maxHP && <span> • HP: {opponent.maxHP}</span>}
                {opponent.phases && <span> • {opponent.phases.length} Phases</span>}
              </>
            ) : (
              <>Strategy: <span className="text-[#6c5ce7]">{opponent.strategy}</span> • Unlock: Level {opponent.unlockLevel}</>
            )}
          </motion.p>
          
          {/* Difficulty indicator */}
          {opponent.difficulty && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mb-4"
            >
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                opponent.difficulty === 'INSANE' ? 'bg-red-500/20 text-red-400' :
                opponent.difficulty === 'HARD' ? 'bg-orange-500/20 text-orange-400' :
                'bg-green-500/20 text-green-400'
              }`}>
                ⚔️ Difficulty: {DIFFICULTY_NAMES[opponent.difficulty as Difficulty]}
              </span>
            </motion.div>
          )}
          
          {/* Win streak indicator */}
          {winStreak > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-4"
            >
              <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-yellow-500/20 text-yellow-400">
                🔥 Win Streak: {winStreak}
              </span>
            </motion.div>
          )}
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4 justify-center"
          >
            <button
              onClick={initBattle}
              className="px-8 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl text-lg font-bold hover:opacity-90 transition-all hover:scale-105 active:scale-95 relative overflow-hidden group"
              style={{ boxShadow: '0 4px 20px rgba(108,92,231,0.4)' }}
            >
              <span className="relative z-10">⚔️ Start Battle</span>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
            </button>
            <button
              onClick={onExit}
              className="px-8 py-4 bg-[#1A1A2E] border border-[#2D2D44] rounded-xl text-lg font-medium hover:border-[#6C5CE7] transition-colors hover:scale-105 active:scale-95"
            >
              ← Back
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Result screen
  if (currentPhase === 'result') {
    return (
      <div className="fixed inset-0 bg-[#0F0F1A] flex items-center justify-center z-50 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="text-8xl mb-6"
          >
            {battle?.phase === 'VICTORY' ? '🏆' : '💀'}
          </motion.div>
          <h2 className="text-4xl font-black text-white mb-4">
            {battle?.phase === 'VICTORY' ? 'VICTORY!' : 'DEFEAT'}
          </h2>
          <p className="text-[#636E72] mb-6">
            {battle?.phase === 'VICTORY' 
              ? `Flawless: ${battle?.flawlessVictory ? 'YES! +Bonus' : 'No'} | Win Streak: ${winStreak}`
              : 'Better luck next time!'
            }
          </p>
          <button
            onClick={onExit}
            className="px-8 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl text-lg font-bold hover:opacity-90 transition-all"
          >
            Back to Battle Selection
          </button>
        </motion.div>
      </div>
    );
  }

  if (!battle) return null;

  const playerActiveCard = battle.playerActiveCard ? CARDS_BY_ID.get(battle.playerActiveCard) : null;
  const aiActiveCard = battle.aiActiveCard ? CARDS_BY_ID.get(battle.aiActiveCard) : null;

  // Calculate HP percentages for bars
  const playerHPPercent = (battle.playerHP / battle.playerMaxHP) * 100;
  const aiHPPercent = (battle.aiHP / battle.aiMaxHP) * 100;

  return (
    <div className={`fixed inset-0 bg-[#0F0F1A] flex flex-col z-50 relative overflow-hidden ${screenShake ? 'animate-pulse' : ''}`}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.1) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full animate-pulse" style={{ background: 'radial-gradient(circle, rgba(75,221,183,0.08) 0%, transparent 70%)', animationDelay: '0.5s' }} />
      </div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(108,92,231,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(108,92,231,0.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Battle Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-[#1A1A2E]/90 backdrop-blur-md border-b border-[#2D2D44] px-4 py-3 flex items-center justify-between relative z-10"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="text-[#636E72] hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
          >
            ← Exit
          </button>
          <div className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-xl">⚔️</span>
            <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Battle: {opponent.name}</span>
            {battle.isBossBattle && (
              <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400">
                BOSS
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Turn counter */}
          <div className="text-sm flex items-center gap-2">
            <span className="text-[#636E72]">Turn:</span>
            <motion.span
              key={battle.turn}
              initial={{ scale: 1.3, color: '#6c5ce7' }}
              animate={{ scale: 1, color: '#ffffff' }}
              className="text-white ml-1 font-bold"
            >
              {battle.turn}/{battle.maxTurns}
            </motion.span>
          </div>
          {/* Boss phase indicator */}
          {battle.isBossBattle && (
            <motion.div
              key={battle.bossPhase}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`px-3 py-1 rounded-full text-xs font-bold`}
              style={{ 
                backgroundColor: `${BOSS_PHASE_COLORS[battle.bossPhase]}20`,
                color: BOSS_PHASE_COLORS[battle.bossPhase],
              }}
            >
              {BOSS_PHASE_NAMES[battle.bossPhase]}
            </motion.div>
          )}
          {/* Turn indicator */}
          <motion.div
            key={battle.isPlayerTurn ? 'player-turn' : 'ai-turn'}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`px-4 py-1.5 rounded-full text-sm font-bold ${
              battle.isPlayerTurn
                ? 'bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] text-white shadow-lg shadow-[#6C5CE7]/30'
                : 'bg-gradient-to-r from-[#E17055] to-[#D63031] text-white shadow-lg shadow-[#E17055]/30'
            }`}
          >
            {battle.isPlayerTurn ? '✨ Giliranmu' : `🤖 ${opponent.name}`}
          </motion.div>
        </div>
      </motion.div>

      {/* Battle Arena */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* AI Section */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-b from-[#E17055]/10 to-transparent p-4"
        >
          <div className="text-xs text-[#636E72] mb-2 flex items-center gap-2">
            <span>🤖</span> Opponent: {opponent.name}
            {battle.isBossBattle && <span className="ml-2 text-[#E17055]">• Boss Battle</span>}
            <span className="ml-auto text-[#6c5ce7]">{opponent.strategy}</span>
          </div>
          
          {/* AI HP Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-white font-bold">HP</span>
              <span className="text-[#636E72]">{battle.aiHP}/{battle.aiMaxHP}</span>
            </div>
            {/* AI Buff/Debuff Icons */}
            <div className="flex gap-1 mb-1">
              {battle.aiDebuffs.map((debuff, i) => (
                <div key={`debuff-${i}`} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/30 border border-red-500/50 text-xs" title={`${debuff.type} - ${debuff.turnsRemaining} turns`}>
                  <span>{DEBUFF_ICONS[debuff.type] || '💀'}</span>
                  <span className="text-red-300 font-bold">{debuff.turnsRemaining}</span>
                </div>
              ))}
              {battle.aiBuffs.map((buff, i) => (
                <div key={`buff-${i}`} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/30 border border-green-500/50 text-xs" title={`${buff.type} - ${buff.turnsRemaining} turns`}>
                  <span>{BUFF_ICONS[buff.type] || '✨'}</span>
                  <span className="text-green-300 font-bold">{buff.turnsRemaining}</span>
                </div>
              ))}
            </div>
            <div className="h-3 bg-[#2D2D44] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${aiHPPercent}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-red-500 to-red-600"
              />
            </div>
            {/* Shield bar */}
            {battle.aiShield > 0 && (
              <div className="h-2 bg-[#2D2D44]/50 rounded-full mt-1 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(battle.aiShield / 50 * 100, 100)}%` }}
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* AI Hand (face down) */}
            <div className="flex gap-1">
              {battle.aiHand.map((id, i) => (
                <motion.div
                  key={id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring' }}
                  className="w-12 h-16 rounded-lg bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white/60 relative overflow-hidden"
                  style={{ boxShadow: '0 4px 15px rgba(108,92,231,0.3)' }}
                >
                  <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.1) 5px, rgba(255,255,255,0.1) 10px)'
                  }} />
                  <span className="relative z-10 font-bold">?</span>
                </motion.div>
              ))}
            </div>
            
            {/* AI Active Card */}
            {aiActiveCard && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' }}
              >
                <Card card={aiActiveCard} size="md" showStats />
              </motion.div>
            )}
            
            {/* AI Buffs/Debuffs */}
            <div className="flex flex-col gap-1">
              {battle.aiDebuffs.slice(0, 3).map((debuff, i) => (
                <div key={i} className="flex items-center gap-1 text-xs bg-red-500/20 px-2 py-1 rounded">
                  <span>{DEBUFF_ICONS[debuff.type] || '💀'}</span>
                  <span className="text-red-400">{debuff.type}</span>
                  <span className="text-red-300">{debuff.turnsRemaining}</span>
                </div>
              ))}
              {battle.aiBuffs.slice(0, 2).map((buff, i) => (
                <div key={i} className="flex items-center gap-1 text-xs bg-green-500/20 px-2 py-1 rounded">
                  <span>{BUFF_ICONS[buff.type] || '✨'}</span>
                  <span className="text-green-400">{buff.type}</span>
                  <span className="text-green-300">{buff.turnsRemaining}</span>
                </div>
              ))}
            </div>
            
            {/* AI Stats */}
            <div className="text-sm bg-[#1A1A2E]/50 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-[#636E72]">Deck:</span>
                <span className="text-white font-bold">{battle.aiDeck.length}</span>
              </div>
              <div className="flex items-center gap-2 text-[#636E72]">
                <span>Discard:</span>
                <span>{battle.aiDiscard.length}</span>
              </div>
            </div>
          </div>
          
          {/* Boss charging indicator */}
          {battle.bossChargingMove && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 px-4 py-2 bg-red-500/20 rounded-lg border border-red-500/30"
            >
              <span className="text-red-400 font-bold animate-pulse">⚡ {battle.opponentName} sedang mengisi {battle.bossCurrentMove}!</span>
            </motion.div>
          )}
        </motion.div>

        {/* Battle Log / Message */}
        <div className="flex-1 flex items-center justify-center p-4">
          {message ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className={`px-6 py-4 rounded-2xl text-center relative overflow-hidden ${
                message.includes('✅')
                  ? 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400'
                  : message.includes('❌')
                  ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400'
                  : 'bg-gradient-to-r from-[#6C5CE7]/20 to-[#A29BFE]/20 text-white'
              }`}
              style={{ backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {message.includes('✅') && <span className="mr-2">✨</span>}
              {message.includes('❌') && <span className="mr-2">💥</span>}
              {message}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-[#636E72]"
            >
              <motion.div
                animate={battle.isPlayerTurn ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: Infinity }}
                className="text-5xl mb-3"
              >
                {battle.isPlayerTurn ? '🎯' : '🤖'}
              </motion.div>
              <p className="text-lg">{battle.isPlayerTurn ? 'Pilih aksi mu!' : 'AI sedang berpikir...'}</p>
              
              {/* Show recent battle log */}
              {battle.battleLog.length > 0 && (
                <div className="mt-4 text-sm max-w-md mx-auto">
                  {battle.battleLog.slice(-2).map((entry, i) => (
                    <div key={i} className="text-left text-[#B2BEC3]">
                      {entry.description}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Player HP Bar */}
        <div className="px-4 mb-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-white font-bold">HP Player</span>
            <span className="text-[#636E72]">{battle.playerHP}/{battle.playerMaxHP}</span>
          </div>
          {/* Player Buff/Debuff Icons */}
          <div className="flex gap-1 mb-1">
            {battle.playerDebuffs.map((debuff, i) => (
              <div key={`pdebuff-${i}`} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/30 border border-red-500/50 text-xs" title={`${debuff.type} - ${debuff.turnsRemaining} turns`}>
                <span>{DEBUFF_ICONS[debuff.type] || '💀'}</span>
                <span className="text-red-300 font-bold">{debuff.turnsRemaining}</span>
              </div>
            ))}
            {battle.playerBuffs.map((buff, i) => (
              <div key={`pbuff-${i}`} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/30 border border-green-500/50 text-xs" title={`${buff.type} - ${buff.turnsRemaining} turns`}>
                <span>{BUFF_ICONS[buff.type] || '✨'}</span>
                <span className="text-green-300 font-bold">{buff.turnsRemaining}</span>
              </div>
            ))}
          </div>
          <div className="h-3 bg-[#2D2D44] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${playerHPPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-green-500 to-green-600"
            />
          </div>
          {/* Player Shield bar */}
          {battle.playerShield > 0 && (
            <div className="h-2 bg-[#2D2D44]/50 rounded-full mt-1 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(battle.playerShield / 50 * 100, 100)}%` }}
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500"
              />
            </div>
          )}
        </div>

        {/* Player Active Card */}
        {playerActiveCard && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center py-2 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#00B894]/10 to-transparent pointer-events-none" />
            <div className="text-sm text-[#636E72] mr-3">Active:</div>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              style={{
                boxShadow: '0 0 30px rgba(0,184,148,0.4), 0 8px 32px rgba(0,0,0,0.4)'
              }}
            >
              <Card card={playerActiveCard} size="md" showStats />
            </motion.div>
            
            {/* Player Buffs/Debuffs */}
            <div className="flex flex-col gap-1 ml-4">
              {battle.playerDebuffs.slice(0, 3).map((debuff, i) => (
                <div key={i} className="flex items-center gap-1 text-xs bg-red-500/20 px-2 py-1 rounded">
                  <span>{DEBUFF_ICONS[debuff.type] || '💀'}</span>
                  <span className="text-red-400">{debuff.type}</span>
                  <span className="text-red-300">{debuff.turnsRemaining}</span>
                </div>
              ))}
              {battle.playerBuffs.slice(0, 2).map((buff, i) => (
                <div key={i} className="flex items-center gap-1 text-xs bg-green-500/20 px-2 py-1 rounded">
                  <span>{BUFF_ICONS[buff.type] || '✨'}</span>
                  <span className="text-green-400">{buff.type}</span>
                  <span className="text-green-300">{buff.turnsRemaining}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Player Hand */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-t from-[#00B894]/10 to-transparent p-4"
        >
          <div className="text-xs text-[#636E72] mb-2 flex items-center gap-2">
            <span>🃏</span> Your Hand ({battle.playerHand.length})
            <span className="ml-auto text-[#00B894]">Klik untuk memilih</span>
          </div>
          <div className="flex gap-2 justify-center">
            {battle.playerHand.map((cardId, i) => {
              const card = CARDS_BY_ID.get(cardId);
              if (!card) return null;
              return (
                <motion.div
                  key={cardId}
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
                  whileHover={{ scale: 1.15, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !battle.isPlayerTurn || isAnimating ? null : playCard(cardId)}
                  className={`cursor-pointer ${!battle.isPlayerTurn || isAnimating ? 'opacity-50' : ''}`}
                >
                  <Card card={card} size="sm" interactive={battle.isPlayerTurn && !isAnimating} />
                </motion.div>
              );
            })}
          </div>
          {/* Player Stats */}
          <div className="flex justify-between mt-3 text-sm bg-[#1A1A2E]/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-[#636E72]">Deck:</span>
              <span className="text-white font-bold">{battle.playerDeck.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#636E72]">🛡️ Shield:</span>
              <span className="text-blue-400 font-bold">{battle.playerShield}</span>
            </div>
            <div className="flex items-center gap-2 text-[#636E72]">
              <span>Discard:</span>
              <span>{battle.playerDiscard.length}</span>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="bg-[#1A1A2E]/90 backdrop-blur-md border-t border-[#2D2D44] p-4 relative z-10">
          <div className="flex gap-3 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => performAction('ATTACK')}
              disabled={!battle.isPlayerTurn || !battle.playerActiveCard || isAnimating}
              className="px-8 py-4 bg-gradient-to-r from-[#E17055] to-[#D63031] rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{ boxShadow: '0 4px 20px rgba(225,112,85,0.3)' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl">⚔️</span> Attack
              </span>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => performAction('STUDY')}
              disabled={!battle.isPlayerTurn || isAnimating}
              className="px-8 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{ boxShadow: '0 4px 20px rgba(108,92,231,0.3)' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl">📚</span> Study
              </span>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => performAction('DEFEND')}
              disabled={!battle.isPlayerTurn || isAnimating}
              className="px-8 py-4 bg-gradient-to-r from-[#0984E3] to-[#00B894] rounded-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{ boxShadow: '0 4px 20px rgba(9,132,227,0.3)' }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-xl">🛡️</span> Defend
              </span>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Study Modal */}
      <AnimatePresence>
        {showStudy && battle.studyQuestion && (
          <StudyModal
            question={battle.studyQuestion}
            onAnswer={answerStudy}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Study Question Modal
function StudyModal({
  question,
  onAnswer,
}: {
  question: StudyQuestion;
  onAnswer: (answer: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="bg-[#1A1A2E] border border-[#2D2D44] rounded-2xl p-6 max-w-md w-full relative overflow-hidden"
        style={{ boxShadow: '0 0 60px rgba(108,92,231,0.3), 0 20px 40px rgba(0,0,0,0.5)' }}
      >
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(108,92,231,0.2) 0%, transparent 70%)' }} />

        <div className="text-center mb-6 relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="text-5xl mb-3"
          >
            📚
          </motion.div>
          <motion.h3
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-white mb-2 bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] bg-clip-text text-transparent"
          >
            Study Time!
          </motion.h3>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-lg text-white"
          >
            {question.question}
          </motion.p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {question.options.map((option, i) => (
            <motion.button
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onAnswer(option)}
              className="w-full p-4 bg-[#2D2D44] hover:bg-[#6C5CE7] rounded-xl text-white text-left transition-all relative overflow-hidden group"
              style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[#1A1A2E] flex items-center justify-center font-bold text-[#6c5ce7] group-hover:text-white">
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </span>
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%)' }} />
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center text-xs text-[#636E72]"
        >
          Jawab dengan benar untuk power up kartu! ✨
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Generate study question from card
function generateStudyQuestion(card: JapaneseCard): StudyQuestion {
  const types: Array<'meaning' | 'reading' | 'kanji'> = ['meaning', 'reading', 'kanji'];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === 'meaning') {
    const sameType = Array.from(CARDS_BY_ID.values())
      .filter(c => c.type === card.type && c.id !== card.id);
    const wrongOptions = sameType
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.meaning);

    const options = [...wrongOptions, card.meaning].sort(() => Math.random() - 0.5);

    return {
      question: `Apa arti dari "${card.japanese}" (${card.reading})?`,
      correctAnswer: card.meaning,
      options,
      cardId: card.id,
      type: 'meaning',
    };
  }

  if (type === 'reading') {
    const sameKanji = Array.from(CARDS_BY_ID.values())
      .filter(c => c.japanese === card.japanese && c.id !== card.id);
    const options = [card.reading];
    if (sameKanji.length > 0) {
      options.push(sameKanji[0].reading);
    } else {
      options.push(card.reading.split('')[0] + 'る');
    }
    while (options.length < 4) {
      options.push(`${Math.floor(Math.random() * 100)}`);
    }

    return {
      question: `Bagaimana cara membaca "${card.japanese}"?`,
      correctAnswer: card.reading,
      options: options.slice(0, 4).sort(() => Math.random() - 0.5),
      cardId: card.id,
      type: 'reading',
    };
  }

  const sameMeaning = Array.from(CARDS_BY_ID.values())
    .filter(c => c.meaning === card.meaning && c.id !== card.id);
  const options = [card.japanese, ...sameMeaning.map(c => c.japanese)].slice(0, 4);
  while (options.length < 4) {
    options.push(String.fromCharCode(0x3042 + Math.floor(Math.random() * 100)));
  }

  return {
    question: `Kanji mana yang berarti "${card.meaning}"?`,
    correctAnswer: card.japanese,
    options: options.sort(() => Math.random() - 0.5),
    cardId: card.id,
    type: 'kanji',
  };
}

// Helper function to get elemental debuff
function getElementalDebuff(element: string): Debuff | null {
  switch (element) {
    case 'FIRE':
      return { type: 'BURN', turnsRemaining: 3, value: 5 };
    case 'WATER':
      return { type: 'SLOW', turnsRemaining: 2, value: 20 };
    case 'GRASS':
      return { type: 'POISON', turnsRemaining: 2, value: 3 };
    case 'ELECTRIC':
      return { type: 'STUN', turnsRemaining: 1, value: 1 };
    default:
      return null;
  }
}