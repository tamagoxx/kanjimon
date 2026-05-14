'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/card/Card';
import type { BattleState, JapaneseCard, AIOpponent, BattleAction, BattleLogEntry, StudyQuestion } from '@/types';
import { CARDS_BY_ID } from '@/data/cards';

const AI_OPPONENTS: AIOpponent[] = [
  { id: 'sensei', name: 'Sensei Bot', title: 'The Guide', strategy: 'random', deckTheme: ['NORMAL', 'PSYCHIC'], unlockLevel: 1, avatarUrl: '👨‍🏫' },
  { id: 'ninja', name: 'Ninja Bot', title: 'The Shadow', strategy: 'aggressive', deckTheme: ['FIRE', 'ELECTRIC'], unlockLevel: 5, avatarUrl: '🥷' },
  { id: 'samurai', name: 'Samurai Bot', title: 'The Guardian', strategy: 'defensive', deckTheme: ['WATER', 'GRASS'], unlockLevel: 10, avatarUrl: '⚔️' },
  { id: 'shogun', name: 'Shogun Bot', title: 'The Warlord', strategy: 'balanced', deckTheme: ['FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'PSYCHIC', 'NORMAL'], unlockLevel: 20, avatarUrl: '🛡️' },
];

interface BattleArenaProps {
  playerDeck: JapaneseCard[];
  opponentId?: string;
  onBattleEnd: (won: boolean, xpEarned: number, cardsEarned: JapaneseCard[]) => void;
  onExit: () => void;
}

export function BattleArena({ playerDeck, opponentId = 'sensei', onBattleEnd, onExit }: BattleArenaProps) {
  const opponent = AI_OPPONENTS.find(o => o.id === opponentId) || AI_OPPONENTS[0];
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [currentPhase, setCurrentPhase] = useState<'intro' | 'battle' | 'result'>('intro');
  const [message, setMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showStudy, setShowStudy] = useState(false);
  const [studyResult, setStudyResult] = useState<{ correct: boolean; correctAnswer: string } | null>(null);

  // Initialize battle
  const initBattle = useCallback(() => {
    // Extract card IDs from deck (deck comes as JapaneseCard[])
    const allPlayerIds = playerDeck.map(c => c.id);
    const shuffledPlayerIds = [...allPlayerIds].sort(() => Math.random() - 0.5);
    const playerHand = shuffledPlayerIds.slice(0, 5);
    const remainingDeck = shuffledPlayerIds.slice(5);

    // AI deck - use player cards to build AI deck
    const aiDeckIds = [...allPlayerIds].sort(() => Math.random() - 0.5).slice(0, 20);
    const aiHand = aiDeckIds.slice(0, 5);
    const aiRemainingDeck = aiDeckIds.slice(5);

    const newBattle: BattleState = {
      id: crypto.randomUUID(),
      playerId: 'player',
      opponentId: opponent.id,
      opponentName: opponent.name,
      phase: 'SETUP',
      playerDeck: remainingDeck,
      playerHand,
      playerActiveCard: null,
      playerDiscard: [],
      aiDeck: aiRemainingDeck,
      aiHand,
      aiActiveCard: null,
      aiDiscard: [],
      turn: 1,
      isPlayerTurn: true,
      battleLog: [],
      studyQuestion: null,
      playerDefending: false,
      aiDefending: false,
    };

    setBattle(newBattle);
    setCurrentPhase('battle');
  }, [playerDeck, opponent]);

  // Draw card
  const drawCard = (isPlayer: boolean) => {
    if (!battle) return;
    const deckKey = isPlayer ? 'playerDeck' : 'aiDeck';
    const handKey = isPlayer ? 'playerHand' : 'aiHand';
    const deck = [...battle[deckKey as keyof BattleState] as string[]];
    if (deck.length === 0) return null;
    const drawnCardId = deck.pop()!;
    const hand = [...battle[handKey as keyof BattleState] as string[], drawnCardId];
    setBattle(prev => prev ? {
      ...prev,
      [deckKey]: deck,
      [handKey]: hand,
    } : null);
    return CARDS_BY_ID.get(drawnCardId);
  };

  // Play card from hand
  const playCard = (cardId: string) => {
    if (!battle || !battle.isPlayerTurn) return;
    setIsAnimating(true);

    const hand = battle.playerHand.filter(id => id !== cardId);
    const card = CARDS_BY_ID.get(cardId);

    setBattle(prev => prev ? {
      ...prev,
      playerHand: hand,
      playerActiveCard: cardId,
    } : null);

    setTimeout(() => setIsAnimating(false), 500);
  };

  // Perform battle action
  const performAction = (action: BattleAction) => {
    if (!battle || !battle.isPlayerTurn || isAnimating) return;

    if (action === 'STUDY') {
      // Generate study question for active card
      if (battle.playerActiveCard) {
        const card = CARDS_BY_ID.get(battle.playerActiveCard);
        if (card) {
          const question = generateStudyQuestion(card);
          setBattle(prev => prev ? { ...prev, studyQuestion: question } : null);
          setShowStudy(true);
        }
      }
      return;
    }

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

    if (action === 'ATTACK' && card) {
      const defense = battle.aiDefending ? 2 : 1;
      const damage = Math.max(1, card.attackPower - defense * card.defenseRating);
      logEntry.description = `${isPlayer ? 'Player' : opponent.name} attacks with ${card.japanese}!`;
      logEntry.damage = damage;
    } else if (action === 'DEFEND') {
      logEntry.description = `${isPlayer ? 'Player' : opponent.name} defends!`;
      if (isPlayer) {
        setBattle(prev => prev ? { ...prev, playerDefending: true } : null);
      } else {
        setBattle(prev => prev ? { ...prev, aiDefending: true } : null);
      }
    }

    const newLog = [...battle.battleLog, logEntry];

    setTimeout(() => {
      setBattle(prev => prev ? {
        ...prev,
        battleLog: newLog,
        isPlayerTurn: !prev.isPlayerTurn,
      } : null);
      setIsAnimating(false);

      // Draw for next turn
      drawCard(!isPlayer);
    }, 1000);
  };

  // Answer study question
  const answerStudy = (answer: string) => {
    if (!battle || !battle.studyQuestion) return;

    const correct = answer === battle.studyQuestion.correctAnswer;
    setStudyResult({ correct, correctAnswer: battle.studyQuestion.correctAnswer });
    setShowStudy(false);

    if (correct) {
      // Power boost
      setMessage('✅ Correct! Card gets +30% ATK and +20 HP!');
    } else {
      setMessage(`❌ Wrong! The correct answer is: ${battle.studyQuestion.correctAnswer}`);
    }

    setBattle(prev => prev ? { ...prev, studyQuestion: null } : null);

    setTimeout(() => {
      setStudyResult(null);
      setMessage('');
    }, 2000);
  };

  // AI turn
  useEffect(() => {
    if (!battle || battle.isPlayerTurn || currentPhase !== 'battle' || isAnimating) return;

    const timer = setTimeout(() => {
      // AI logic based on strategy
      let action: BattleAction;
      const actions: BattleAction[] = ['ATTACK', 'DEFEND'];

      if (opponent.strategy === 'aggressive') {
        action = 'ATTACK';
      } else if (opponent.strategy === 'defensive') {
        action = Math.random() > 0.3 ? 'DEFEND' : 'ATTACK';
      } else if (opponent.strategy === 'balanced') {
        action = actions[Math.floor(Math.random() * actions.length)];
      } else {
        action = actions[Math.floor(Math.random() * actions.length)];
      }

      const aiCardId = battle.aiHand[0];
      executeBattleAction(action, aiCardId, false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [battle, opponent, currentPhase, isAnimating]);

  // End battle check
  const checkBattleEnd = useCallback(() => {
    if (!battle) return;

    if (battle.playerDeck.length === 0 && battle.playerHand.length === 0) {
      return 'DEFEAT';
    }
    if (battle.aiDeck.length === 0 && battle.aiHand.length === 0) {
      return 'VICTORY';
    }
    return null;
  }, [battle]);

  // Intro screen
  if (currentPhase === 'intro') {
    return (
      <div className="fixed inset-0 bg-[#0F0F1A] flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="text-8xl mb-6">{opponent.avatarUrl}</div>
          <h2 className="text-3xl font-bold text-white mb-2">{opponent.name}</h2>
          <p className="text-[#636E72] mb-2">{opponent.title}</p>
          <p className="text-sm text-[#B2BEC3] mb-8">
            Strategy: {opponent.strategy} • Unlock: Level {opponent.unlockLevel}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={initBattle}
              className="px-8 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl text-lg font-bold hover:opacity-90 transition-opacity"
            >
              ⚔️ Start Battle
            </button>
            <button
              onClick={onExit}
              className="px-8 py-4 bg-[#1A1A2E] border border-[#2D2D44] rounded-xl text-lg font-medium hover:border-[#6C5CE7] transition-colors"
            >
              ← Back
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!battle) return null;

  const playerActiveCard = battle.playerActiveCard ? CARDS_BY_ID.get(battle.playerActiveCard) : null;
  const aiActiveCard = battle.aiActiveCard ? CARDS_BY_ID.get(battle.aiActiveCard) : null;

  return (
    <div className="fixed inset-0 bg-[#0F0F1A] flex flex-col z-50">
      {/* Battle Header */}
      <div className="bg-[#1A1A2E] border-b border-[#2D2D44] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onExit} className="text-[#636E72] hover:text-white">
            ← Exit
          </button>
          <div className="text-lg font-bold text-white">⚔️ Battle: {opponent.name}</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-[#636E72]">Turn:</span>
            <span className="text-white ml-1 font-bold">{battle.turn}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            battle.isPlayerTurn ? 'bg-[#6C5CE7] text-white' : 'bg-[#E17055] text-white'
          }`}>
            {battle.isPlayerTurn ? 'Your Turn' : opponent.name}
          </div>
        </div>
      </div>

      {/* Battle Arena */}
      <div className="flex-1 flex flex-col">
        {/* AI Section */}
        <div className="bg-gradient-to-b from-[#E17055]/20 to-transparent p-4">
          <div className="text-xs text-[#636E72] mb-2">Opponent: {opponent.name}</div>
          <div className="flex items-center gap-4">
            {/* AI Hand (face down) */}
            <div className="flex gap-1">
              {battle.aiHand.map((id, i) => (
                <div key={id} className="w-12 h-16 rounded-lg bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-white/60">
                  ?
                </div>
              ))}
            </div>
            {/* AI Active Card */}
            {aiActiveCard && (
              <Card card={aiActiveCard} size="md" showStats />
            )}
            {/* AI Stats */}
            <div className="text-sm">
              <div>Deck: {battle.aiDeck.length}</div>
              <div className="text-[#636E72]">Discard: {battle.aiDiscard.length}</div>
            </div>
          </div>
        </div>

        {/* Battle Log / Message */}
        <div className="flex-1 flex items-center justify-center p-4">
          {message ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`px-6 py-4 rounded-xl text-center ${
                message.includes('✅') ? 'bg-green-500/20 text-green-400' :
                message.includes('❌') ? 'bg-red-500/20 text-red-400' :
                'bg-[#6C5CE7]/20 text-white'
              }`}
            >
              {message}
            </motion.div>
          ) : (
            <div className="text-center text-[#636E72]">
              <div className="text-4xl mb-2">
                {battle.isPlayerTurn ? '🎯' : '🤖'}
              </div>
              <p>{battle.isPlayerTurn ? 'Choose your action' : 'AI is thinking...'}</p>
            </div>
          )}
        </div>

        {/* Player Active Card */}
        {playerActiveCard && (
          <div className="flex items-center justify-center py-2">
            <div className="text-sm text-[#636E72] mr-2">Active:</div>
            <Card card={playerActiveCard} size="md" showStats />
          </div>
        )}

        {/* Player Hand */}
        <div className="bg-gradient-to-t from-[#00B894]/20 to-transparent p-4">
          <div className="text-xs text-[#636E72] mb-2">Your Hand ({battle.playerHand.length})</div>
          <div className="flex gap-2 justify-center">
            {battle.playerHand.map((cardId, i) => {
              const card = CARDS_BY_ID.get(cardId);
              if (!card) return null;
              return (
                <motion.div
                  key={cardId}
                  whileHover={{ scale: 1.1, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !battle.isPlayerTurn ? null : playCard(cardId)}
                  className={`cursor-pointer ${!battle.isPlayerTurn ? 'opacity-50' : ''}`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <Card card={card} size="sm" interactive={battle.isPlayerTurn} />
                </motion.div>
              );
            })}
          </div>
          {/* Player Stats */}
          <div className="flex justify-between mt-2 text-sm">
            <div>Deck: {battle.playerDeck.length}</div>
            <div className="text-[#636E72]">Discard: {battle.playerDiscard.length}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-[#1A1A2E] border-t border-[#2D2D44] p-4">
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => performAction('ATTACK')}
              disabled={!battle.isPlayerTurn || !battle.playerActiveCard || isAnimating}
              className="px-6 py-3 bg-gradient-to-r from-[#E17055] to-[#D63031] rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              ⚔️ Attack
            </button>
            <button
              onClick={() => performAction('STUDY')}
              disabled={!battle.isPlayerTurn || isAnimating}
              className="px-6 py-3 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              📚 Study
            </button>
            <button
              onClick={() => performAction('DEFEND')}
              disabled={!battle.isPlayerTurn || isAnimating}
              className="px-6 py-3 bg-gradient-to-r from-[#0984E3] to-[#00B894] rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              🛡️ Defend
            </button>
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
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-[#1A1A2E] border border-[#2D2D44] rounded-2xl p-6 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📚</div>
          <h3 className="text-xl font-bold text-white mb-2">Study Time!</h3>
          <p className="text-lg text-white">{question.question}</p>
        </div>

        <div className="space-y-3">
          {question.options.map((option, i) => (
            <button
              key={i}
              onClick={() => onAnswer(option)}
              className="w-full p-4 bg-[#2D2D44] hover:bg-[#6C5CE7] rounded-xl text-white text-left transition-colors"
            >
              <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
              {option}
            </button>
          ))}
        </div>

        <div className="mt-4 text-center text-xs text-[#636E72]">
          Answer correctly to power up your card!
        </div>
      </motion.div>
    </motion.div>
  );
}

// Generate study question from card
function generateStudyQuestion(card: JapaneseCard): StudyQuestion {
  const types: Array<'meaning' | 'reading' | 'kanji'> = ['meaning', 'reading', 'kanji'];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === 'meaning') {
    // Pick 3 wrong meanings from same type
    const sameType = Array.from(CARDS_BY_ID.values())
      .filter(c => c.type === card.type && c.id !== card.id);
    const wrongOptions = sameType
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(c => c.meaning);

    const options = [...wrongOptions, card.meaning].sort(() => Math.random() - 0.5);

    return {
      question: `What does "${card.japanese}" (${card.reading}) mean?`,
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
      options.push(card.reading.split('')[0] + 'る'); // simple fallback
    }
    while (options.length < 4) {
      options.push(`${Math.floor(Math.random() * 100)}`);
    }

    return {
      question: `How do you read "${card.japanese}"?`,
      correctAnswer: card.reading,
      options: options.slice(0, 4).sort(() => Math.random() - 0.5),
      cardId: card.id,
      type: 'reading',
    };
  }

  // kanji type
  const sameMeaning = Array.from(CARDS_BY_ID.values())
    .filter(c => c.meaning === card.meaning && c.id !== card.id);
  const options = [card.japanese, ...sameMeaning.map(c => c.japanese)].slice(0, 4);
  while (options.length < 4) {
    options.push(String.fromCharCode(0x3042 + Math.floor(Math.random() * 100)));
  }

  return {
    question: `Which kanji means "${card.meaning}"?`,
    correctAnswer: card.japanese,
    options: options.sort(() => Math.random() - 0.5),
    cardId: card.id,
    type: 'kanji',
  };
}