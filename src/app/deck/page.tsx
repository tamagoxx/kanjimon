'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCollectionStore } from '@/store/collectionStore';
import { Card } from '@/components/card/Card';
import type { JapaneseCard } from '@/types';

const MIN_DECK_SIZE = 20;
const MAX_DECK_SIZE = 30;
const MAX_SAME_CARD = 2;

export default function DeckBuilderPage() {
  const { ownedCards, decks, createDeck, updateDeck, deleteDeck } = useCollectionStore();
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [deckName, setDeckName] = useState('');
  const [deckCardIds, setDeckCardIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Full card objects
  const ownedCardObjects = useMemo(() => {
    return ownedCards.map(oc => oc.card).filter(Boolean) as JapaneseCard[];
  }, [ownedCards]);

  // Get current deck
  const currentDeck = useMemo(() => {
    if (selectedDeckId) {
      return decks.find(d => d.id === selectedDeckId);
    }
    return null;
  }, [selectedDeckId, decks]);

  // Load deck into editor
  useMemo(() => {
    if (currentDeck) {
      setDeckName(currentDeck.name);
      setDeckCardIds(currentDeck.cardIds);
    } else if (!isCreating) {
      setDeckCardIds([]);
      setDeckName('');
    }
  }, [currentDeck, isCreating]);

  const addCard = useCallback((cardId: string) => {
    if (deckCardIds.length >= MAX_DECK_SIZE) return;
    const count = deckCardIds.filter(id => id === cardId).length;
    if (count >= MAX_SAME_CARD) return;
    setDeckCardIds(prev => [...prev, cardId]);
  }, [deckCardIds]);

  const removeCard = useCallback((index: number) => {
    setDeckCardIds(prev => prev.filter((_, i) => i !== index));
  }, []);

  const deckCards = useMemo(() => {
    return deckCardIds
      .map(id => ownedCardObjects.find(c => c.id === id))
      .filter(Boolean) as JapaneseCard[];
  }, [deckCardIds, ownedCardObjects]);

  // Deck stats
  const deckStats = useMemo(() => ({
    total: deckCards.length,
    hp: deckCards.reduce((s, c) => s + c.hp, 0),
    attack: deckCards.reduce((s, c) => s + c.attackPower, 0),
    defense: deckCards.reduce((s, c) => s + c.defenseRating, 0),
    byElement: {
      FIRE: deckCards.filter(c => c.element === 'FIRE').length,
      WATER: deckCards.filter(c => c.element === 'WATER').length,
      GRASS: deckCards.filter(c => c.element === 'GRASS').length,
      ELECTRIC: deckCards.filter(c => c.element === 'ELECTRIC').length,
      PSYCHIC: deckCards.filter(c => c.element === 'PSYCHIC').length,
      NORMAL: deckCards.filter(c => c.element === 'NORMAL').length,
    },
    byType: {
      VERB: deckCards.filter(c => c.type === 'VERB').length,
      NOUN: deckCards.filter(c => c.type === 'NOUN').length,
      ADJECTIVE: deckCards.filter(c => c.type === 'ADJECTIVE').length,
      PARTICLE: deckCards.filter(c => c.type === 'PARTICLE').length,
    },
  }), [deckCards]);

  const handleSaveDeck = () => {
    if (deckCardIds.length < MIN_DECK_SIZE) return;

    if (currentDeck) {
      updateDeck(currentDeck.id, deckCardIds);
    } else if (deckName.trim()) {
      createDeck(deckName.trim(), deckCardIds);
    }

    setIsCreating(false);
    setSelectedDeckId(null);
    setDeckCardIds([]);
    setDeckName('');
  };

  const handleDeleteDeck = (deckId: string) => {
    deleteDeck(deckId);
    if (selectedDeckId === deckId) {
      setSelectedDeckId(null);
      setDeckCardIds([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0F0F1A]/80 border-b border-[#2D2D44]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] bg-clip-text text-transparent">
              KanjiMon
            </Link>
            <span className="text-[#636E72]">/ Deck Builder</span>
          </div>
          <Link href="/" className="text-sm text-[#B2BEC3] hover:text-white">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-white mb-2">📚 Deck Builder</h1>
          <p className="text-[#636E72]">Build your battle deck with 20-30 cards</p>
        </motion.div>

        {/* Saved Decks */}
        {decks.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-[#1A1A2E] border border-[#2D2D44]">
            <h2 className="text-lg font-bold text-white mb-3">Your Decks</h2>
            <div className="flex flex-wrap gap-3">
              {decks.map(deck => (
                <div
                  key={deck.id}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition-all ${
                    selectedDeckId === deck.id
                      ? 'bg-[#6C5CE7] text-white'
                      : 'bg-[#2D2D44] text-[#B2BEC3] hover:bg-[#3D3D54]'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedDeckId(deck.id);
                      setIsCreating(false);
                    }}
                    className="font-medium"
                  >
                    {deck.name} ({deck.cardIds.length})
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDeck(deck.id);
                    }}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  setSelectedDeckId(null);
                  setIsCreating(true);
                  setDeckCardIds([]);
                  setDeckName('New Deck');
                }}
                className="px-4 py-2 bg-[#6C5CE7]/20 text-[#6C5CE7] rounded-lg hover:bg-[#6C5CE7]/30 transition-colors"
              >
                + New Deck
              </button>
            </div>
          </div>
        )}

        {/* Deck Editor */}
        {(isCreating || currentDeck || selectedDeckId) && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card Selection */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Select Cards</h2>
                <div className="text-sm text-[#636E72]">
                  {deckCardIds.length}/{MAX_DECK_SIZE} cards
                </div>
              </div>

              {/* Available cards */}
              <div className="bg-[#1A1A2E] rounded-xl border border-[#2D2D44] p-4">
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[500px] overflow-y-auto">
                  {ownedCardObjects.map(card => {
                    const countInDeck = deckCardIds.filter(id => id === card.id).length;
                    const isMaxed = countInDeck >= MAX_SAME_CARD;

                    return (
                      <motion.div
                        key={card.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => !isMaxed && addCard(card.id)}
                        className={`
                          relative cursor-pointer rounded-lg overflow-hidden
                          ${isMaxed ? 'opacity-40 cursor-not-allowed' : 'hover:ring-2 hover:ring-[#6C5CE7]'}
                        `}
                      >
                        <div className={`aspect-[3/4] bg-gradient-to-br from-[#1A1A2E] to-[#2D2D44] flex flex-col items-center justify-center p-1 text-center`}>
                          <div className="text-sm font-bold text-white">{card.japanese}</div>
                          <div className="text-[8px] text-[#636E72]">{card.reading}</div>
                        </div>
                        {countInDeck > 0 && (
                          <div className="absolute top-0 right-0 bg-[#6C5CE7] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                            {countInDeck}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {ownedCardObjects.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-[#636E72]">No cards in collection!</p>
                    <Link href="/collection" className="text-sm text-[#6C5CE7] hover:underline">
                      Go to Collection
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Current Deck */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <div className="bg-[#1A1A2E] rounded-xl border border-[#2D2D44] p-4">
                  <input
                    type="text"
                    value={deckName}
                    onChange={e => setDeckName(e.target.value)}
                    placeholder="Deck Name"
                    className="w-full px-3 py-2 mb-4 bg-[#2D2D44] border border-[#3D3D54] rounded-lg text-white placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7]"
                  />

                  {/* Deck Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="text-center p-2 bg-[#2D2D44] rounded-lg">
                      <div className="text-lg font-bold text-red-400">{deckStats.total}</div>
                      <div className="text-xs text-[#636E72]">Cards</div>
                    </div>
                    <div className="text-center p-2 bg-[#2D2D44] rounded-lg">
                      <div className="text-lg font-bold text-green-400">{deckStats.hp}</div>
                      <div className="text-xs text-[#636E72]">Total HP</div>
                    </div>
                    <div className="text-center p-2 bg-[#2D2D44] rounded-lg">
                      <div className="text-lg font-bold text-orange-400">{deckStats.attack}</div>
                      <div className="text-xs text-[#636E72]">Total ATK</div>
                    </div>
                    <div className="text-center p-2 bg-[#2D2D44] rounded-lg">
                      <div className="text-lg font-bold text-blue-400">{deckStats.defense}</div>
                      <div className="text-xs text-[#636E72]">Total DEF</div>
                    </div>
                  </div>

                  {/* Element Distribution */}
                  <div className="mb-4">
                    <div className="text-xs text-[#636E72] mb-2">Elements</div>
                    <div className="flex gap-1">
                      {Object.entries(deckStats.byElement).map(([el, count]) => (
                        <div
                          key={el}
                          className="flex-1 text-center py-1 bg-[#2D2D44] rounded text-xs"
                          title={`${el}: ${count}`}
                        >
                          {count}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card List */}
                  <div className="mb-4">
                    <div className="text-xs text-[#636E72] mb-2">
                      {deckCardIds.length < MIN_DECK_SIZE
                        ? `Need ${MIN_DECK_SIZE - deckCardIds.length} more cards`
                        : 'Deck ready!'}
                    </div>
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {deckCards.map((card, i) => (
                        <motion.div
                          key={`${card.id}-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 p-2 bg-[#2D2D44] rounded-lg group"
                        >
                          <div className="w-8 text-center font-bold text-white text-sm">{i + 1}</div>
                          <div className="flex-1">
                            <div className="text-sm font-bold text-white">{card.japanese}</div>
                            <div className="text-xs text-[#636E72]">{card.reading}</div>
                          </div>
                          <div className="text-xs text-[#636E72]">
                            <span className="text-red-400">{card.hp}</span>
                            <span className="mx-1">/</span>
                            <span className="text-orange-400">{card.attackPower}</span>
                          </div>
                          <button
                            onClick={() => removeCard(i)}
                            className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ✕
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDeck}
                      disabled={deckCardIds.length < MIN_DECK_SIZE || !deckName.trim()}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    >
                      {currentDeck ? 'Update Deck' : 'Save Deck'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedDeckId(null);
                        setIsCreating(false);
                        setDeckCardIds([]);
                        setDeckName('');
                      }}
                      className="px-4 py-2 bg-[#2D2D44] rounded-lg text-[#B2BEC3] hover:bg-[#3D3D54] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isCreating && !currentDeck && decks.length === 0 && (
          <div className="text-center py-16 bg-[#1A1A2E] rounded-xl border border-[#2D2D44]">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-bold text-white mb-2">No Decks Yet</h2>
            <p className="text-[#636E72] mb-6">Create your first battle deck!</p>
            <button
              onClick={() => {
                setIsCreating(true);
                setDeckName('New Deck');
              }}
              className="px-8 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl text-lg font-bold hover:opacity-90 transition-opacity"
            >
              + Create New Deck
            </button>
          </div>
        )}
      </main>
    </div>
  );
}