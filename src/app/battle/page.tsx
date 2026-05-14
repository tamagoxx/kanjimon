'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/card/Card';
import { BattleArena } from '@/components/battle/BattleArena';
import { useCollectionStore } from '@/store/collectionStore';
import { useAuthStore } from '@/store/authStore';
import type { JapaneseCard, AIOpponent } from '@/types';

const AI_OPPONENTS: AIOpponent[] = [
  { id: 'sensei', name: 'Sensei Bot', title: 'The Guide', strategy: 'random', deckTheme: ['NORMAL', 'PSYCHIC'], unlockLevel: 1, avatarUrl: '👨‍🏫' },
  { id: 'ninja', name: 'Ninja Bot', title: 'The Shadow', strategy: 'aggressive', deckTheme: ['FIRE', 'ELECTRIC'], unlockLevel: 5, avatarUrl: '🥷' },
  { id: 'samurai', name: 'Samurai Bot', title: 'The Guardian', strategy: 'defensive', deckTheme: ['WATER', 'GRASS'], unlockLevel: 10, avatarUrl: '⚔️' },
  { id: 'shogun', name: 'Shogun Bot', title: 'The Warlord', strategy: 'balanced', deckTheme: ['FIRE', 'WATER', 'GRASS', 'ELECTRIC', 'PSYCHIC', 'NORMAL'], unlockLevel: 20, avatarUrl: '🛡️' },
];

export default function BattlePage() {
  const { ownedCards, decks } = useCollectionStore();
  const { user } = useAuthStore();
  const [selectedOpponent, setSelectedOpponent] = useState<AIOpponent | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<JapaneseCard[]>([]);
  const [isInBattle, setIsInBattle] = useState(false);

  const userLevel = user?.level || 1;

  const availableOpponents = useMemo(() => {
    return AI_OPPONENTS.filter(o => o.unlockLevel <= userLevel);
  }, [userLevel]);

  // Convert owned cards to full card objects
  const ownedCardObjects = useMemo(() => {
    return ownedCards.map(oc => oc.card).filter(Boolean) as JapaneseCard[];
  }, [ownedCards]);

  // Get deck cards
  const deckCards = useMemo(() => {
    if (decks.length > 0 && ownedCardObjects.length > 0) {
      return decks[0].cardIds
        .map(id => ownedCardObjects.find(c => c.id === id))
        .filter(Boolean) as JapaneseCard[];
    }
    // Fallback: use owned cards
    return ownedCardObjects.slice(0, 20);
  }, [decks, ownedCardObjects]);

  const handleStartBattle = () => {
    if (selectedOpponent && deckCards.length >= 5) {
      setIsInBattle(true);
    }
  };

  const handleBattleEnd = (won: boolean, xpEarned: number, cardsEarned: JapaneseCard[]) => {
    setIsInBattle(false);
    setSelectedOpponent(null);
    // TODO: Store battle result, add XP, add cards
  };

  // If in battle, show battle arena
  if (isInBattle && selectedOpponent) {
    return (
      <BattleArena
        playerDeck={deckCards.length >= 5 ? deckCards : ownedCardObjects.slice(0, 20)}
        opponentId={selectedOpponent.id}
        onBattleEnd={handleBattleEnd}
        onExit={() => setIsInBattle(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0F0F1A]/80 border-b border-[#2D2D44]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] bg-clip-text text-transparent">
              KanjiMon
            </Link>
            <span className="text-[#636E72]">/ Battle</span>
          </div>
          <Link href="/" className="text-sm text-[#B2BEC3] hover:text-white">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-2">⚔️ Battle Arena</h1>
          <p className="text-[#636E72]">Choose your opponent and deck to begin!</p>
        </motion.div>

        {/* Opponent Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">🎯 Select Opponent</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AI_OPPONENTS.map(opponent => {
              const isLocked = opponent.unlockLevel > userLevel;
              const isSelected = selectedOpponent?.id === opponent.id;

              return (
                <motion.div
                  key={opponent.id}
                  whileHover={!isLocked ? { scale: 1.02 } : undefined}
                  onClick={() => !isLocked && setSelectedOpponent(opponent)}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all text-center
                    ${isLocked
                      ? 'bg-[#1A1A2E]/50 border-[#2D2D44] opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'bg-[#6C5CE7]/20 border-[#6C5CE7]'
                        : 'bg-[#1A1A2E] border-[#2D2D44] hover:border-[#6C5CE7]'
                    }
                  `}
                >
                  <div className="text-5xl mb-2">{opponent.avatarUrl}</div>
                  <h3 className="font-bold text-white mb-1">{opponent.name}</h3>
                  <p className="text-xs text-[#636E72] mb-2">{opponent.title}</p>
                  {isLocked ? (
                    <div className="flex items-center justify-center gap-1 text-xs text-[#636E72]">
                      <span>🔒</span> Unlock at Lv.{opponent.unlockLevel}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 text-xs text-[#00B894]">
                      <span>✅</span> Available
                    </div>
                  )}
                  <div className="mt-2 text-xs text-[#636E72]">
                    Strategy: {opponent.strategy}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Deck Preview */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">📚 Your Deck ({deckCards.length} cards)</h2>
          {deckCards.length === 0 ? (
            <div className="text-center py-8 bg-[#1A1A2E] rounded-xl border border-[#2D2D44]">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-[#636E72] mb-4">No cards in your deck yet!</p>
              <Link
                href="/collection"
                className="px-4 py-2 bg-[#6C5CE7] rounded-lg text-sm font-medium hover:bg-[#5B4BD5] transition-colors"
              >
                Go to Collection
              </Link>
            </div>
          ) : (
            <div className="bg-[#1A1A2E] rounded-xl border border-[#2D2D44] p-4">
              {/* Deck Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-red-400">❤️ {deckCards.reduce((s, c) => s + c.hp, 0)}</div>
                  <div className="text-xs text-[#636E72]">Total HP</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-400">⚔️ {deckCards.reduce((s, c) => s + c.attackPower, 0)}</div>
                  <div className="text-xs text-[#636E72]">Total ATK</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">🛡️ {deckCards.reduce((s, c) => s + c.defenseRating, 0)}</div>
                  <div className="text-xs text-[#636E72]">Total DEF</div>
                </div>
              </div>

              {/* Card Preview */}
              <div className="flex flex-wrap gap-2 justify-center">
                {deckCards.slice(0, 10).map(card => (
                  <div key={card.id} className="w-16 h-24 rounded-lg overflow-hidden border border-[#2D2D44]">
                    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1A1A2E] to-[#2D2D44] p-1 text-center">
                      <div className="text-sm font-bold text-white">{card.japanese}</div>
                      <div className="text-[8px] text-[#636E72]">{card.reading}</div>
                    </div>
                  </div>
                ))}
                {deckCards.length > 10 && (
                  <div className="w-16 h-24 rounded-lg border border-[#2D2D44] bg-[#2D2D44]/50 flex items-center justify-center text-[#636E72] text-xs">
                    +{deckCards.length - 10} more
                  </div>
                )}
              </div>

              <div className="mt-4 text-center text-sm text-[#636E72]">
                {deckCards.length < 20
                  ? `Need ${20 - deckCards.length} more cards for battle (min 20)`
                  : 'Deck ready for battle!'}
              </div>
            </div>
          )}
        </div>

        {/* Start Battle Button */}
        <div className="text-center">
          <button
            onClick={handleStartBattle}
            disabled={!selectedOpponent || deckCards.length < 20}
            className="px-8 py-4 bg-gradient-to-r from-[#E17055] to-[#D63031] rounded-xl text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-lg shadow-red-500/30"
          >
            {!selectedOpponent
              ? '⚔️ Select an opponent first'
              : deckCards.length < 20
                ? `📚 Build a deck with 20+ cards (currently ${deckCards.length})`
                : `⚔️ Battle ${selectedOpponent.name}!`
            }
          </button>
        </div>
      </main>
    </div>
  );
}