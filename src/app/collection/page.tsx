'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CardGrid } from '@/components/card/CardGrid';
import { ALL_CARDS } from '@/data/cards';
import { useCollectionStore } from '@/store/collectionStore';
import type { JapaneseCard, Element, Rarity } from '@/types';

export default function CollectionPage() {
  const { ownedCards } = useCollectionStore();
  const [viewMode, setViewMode] = useState<'all' | 'owned' | 'new'>('all');

  const displayCards = useMemo(() => {
    switch (viewMode) {
      case 'owned':
        return ownedCards.map(oc => oc.card).filter(Boolean) as JapaneseCard[];
      case 'new':
        return ownedCards.filter(oc => oc.isNew).map(oc => oc.card).filter(Boolean) as JapaneseCard[];
      default:
        return ALL_CARDS;
    }
  }, [viewMode, ownedCards]);

  const stats = useMemo(() => ({
    total: ALL_CARDS.length,
    owned: ownedCards.length,
    new: ownedCards.filter(oc => oc.isNew).length,
    byElement: {
      FIRE: ALL_CARDS.filter(c => c.element === 'FIRE').length,
      WATER: ALL_CARDS.filter(c => c.element === 'WATER').length,
      GRASS: ALL_CARDS.filter(c => c.element === 'GRASS').length,
      ELECTRIC: ALL_CARDS.filter(c => c.element === 'ELECTRIC').length,
      PSYCHIC: ALL_CARDS.filter(c => c.element === 'PSYCHIC').length,
      NORMAL: ALL_CARDS.filter(c => c.element === 'NORMAL').length,
    },
    byRarity: {
      COMMON: ALL_CARDS.filter(c => c.rarity === 'COMMON').length,
      UNCOMMON: ALL_CARDS.filter(c => c.rarity === 'UNCOMMON').length,
      RARE: ALL_CARDS.filter(c => c.rarity === 'RARE').length,
      ULTRA_RARE: ALL_CARDS.filter(c => c.rarity === 'ULTRA_RARE').length,
    },
  }), [ownedCards]);

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0F0F1A]/80 border-b border-[#2D2D44]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="text-2xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] bg-clip-text text-transparent">
              KanjiMon
            </a>
            <span className="text-[#636E72]">/ Collection</span>
          </div>
          <a href="/" className="text-sm text-[#B2BEC3] hover:text-white">
            ← Home
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-white mb-2">🃏 Card Collection</h1>
          <p className="text-[#636E72]">Browse and manage your Japanese vocabulary cards</p>
        </motion.div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Cards', value: stats.total, icon: '🃏', color: '#6C5CE7' },
            { label: 'Owned', value: stats.owned, icon: '✅', color: '#00B894' },
            { label: 'New', value: stats.new, icon: '⭐', color: '#FDCB6E' },
            { label: 'Progress', value: `${Math.round((stats.owned / stats.total) * 100)}%`, icon: '📊', color: '#0984E3' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="p-4 rounded-xl bg-[#1A1A2E] border border-[#2D2D44] text-center"
            >
              <div className="text-2xl mb-1" style={{ filter: `drop-shadow(0 0 6px ${stat.color}60)` }}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-[#636E72]">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Element Breakdown */}
        <div className="mb-6 p-4 rounded-xl bg-[#1A1A2E] border border-[#2D2D44]">
          <h3 className="text-sm font-bold text-white mb-3">Cards by Element</h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { element: 'FIRE', icon: '🔥', count: stats.byElement.FIRE },
              { element: 'WATER', icon: '💧', count: stats.byElement.WATER },
              { element: 'GRASS', icon: '🌿', count: stats.byElement.GRASS },
              { element: 'ELECTRIC', icon: '⚡', count: stats.byElement.ELECTRIC },
              { element: 'PSYCHIC', icon: '🔮', count: stats.byElement.PSYCHIC },
              { element: 'NORMAL', icon: '⭐', count: stats.byElement.NORMAL },
            ].map(({ element, icon, count }) => (
              <div key={element} className="text-center p-2 rounded-lg bg-[#2D2D44]/50">
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-lg font-bold text-white">{count}</div>
                <div className="text-xs text-[#636E72]">{element}</div>
              </div>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          {[
            { value: 'all', label: 'All Cards', count: stats.total },
            { value: 'owned', label: 'Owned', count: stats.owned },
            { value: 'new', label: 'New', count: stats.new },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setViewMode(tab.value as typeof viewMode)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                viewMode === tab.value
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-[#1A1A2E] text-[#B2BEC3] border border-[#2D2D44] hover:border-[#6C5CE7]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Add All Cards Button (for demo) */}
        {ownedCards.length === 0 && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#6C5CE7]/20 to-[#A29BFE]/20 border border-[#6C5CE7]/40 text-center">
            <p className="text-[#B2BEC3] mb-3">Start with all cards for demo!</p>
            <button
              onClick={() => {
                const store = useCollectionStore.getState();
                ALL_CARDS.forEach(card => {
                  store.addCard({
                    cardId: card.id,
                    card,
                    obtainedAt: new Date().toISOString(),
                    isNew: true,
                  });
                });
                window.location.reload();
              }}
              className="px-6 py-3 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              + Add All Cards to Collection
            </button>
          </div>
        )}

        {/* Card Grid */}
        <CardGrid
          cards={displayCards}
          onCardSelect={(id) => console.log('Selected card:', id)}
        />
      </main>
    </div>
  );
}