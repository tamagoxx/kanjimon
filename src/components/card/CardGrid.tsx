'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import type { JapaneseCard, Element, Rarity, CardType } from '@/types';

interface CardGridProps {
  cards: JapaneseCard[];
  selectedCards?: string[];
  onCardSelect?: (cardId: string) => void;
  emptyMessage?: string;
}

const ELEMENT_FILTERS: { value: Element | 'ALL'; label: string; icon: string }[] = [
  { value: 'ALL', label: 'All', icon: '🌐' },
  { value: 'FIRE', label: 'Fire', icon: '🔥' },
  { value: 'WATER', label: 'Water', icon: '💧' },
  { value: 'GRASS', label: 'Grass', icon: '🌿' },
  { value: 'ELECTRIC', label: 'Electric', icon: '⚡' },
  { value: 'PSYCHIC', label: 'Psychic', icon: '🔮' },
  { value: 'NORMAL', label: 'Normal', icon: '⭐' },
];

const RARITY_FILTERS: { value: Rarity | 'ALL'; label: string; color: string }[] = [
  { value: 'ALL', label: 'All', color: '#B2BEC3' },
  { value: 'COMMON', label: 'Common', color: '#B2BEC3' },
  { value: 'UNCOMMON', label: 'Uncommon', color: '#00B894' },
  { value: 'RARE', label: 'Rare', color: '#0984E3' },
  { value: 'ULTRA_RARE', label: 'Ultra', color: '#FDCB6E' },
];

const TYPE_FILTERS: { value: CardType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'VERB', label: 'Verb' },
  { value: 'NOUN', label: 'Noun' },
  { value: 'ADJECTIVE', label: 'Adjective' },
  { value: 'PARTICLE', label: 'Particle' },
];

const SORT_OPTIONS = [
  { value: 'element', label: 'Element' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'type', label: 'Type' },
  { value: 'hp', label: 'HP (High to Low)' },
  { value: 'attack', label: 'Attack (High to Low)' },
];

export function CardGrid({
  cards,
  selectedCards = [],
  onCardSelect,
  emptyMessage = 'No cards found',
}: CardGridProps) {
  const [elementFilter, setElementFilter] = useState<Element | 'ALL'>('ALL');
  const [rarityFilter, setRarityFilter] = useState<Rarity | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<CardType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<string>('element');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = useMemo(() => {
    let result = [...cards];

    // Element filter
    if (elementFilter !== 'ALL') {
      result = result.filter(c => c.element === elementFilter);
    }

    // Rarity filter
    if (rarityFilter !== 'ALL') {
      result = result.filter(c => c.rarity === rarityFilter);
    }

    // Type filter
    if (typeFilter !== 'ALL') {
      result = result.filter(c => c.type === typeFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.japanese.includes(q) ||
        c.reading.includes(q) ||
        c.romaji.toLowerCase().includes(q) ||
        c.meaning.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'hp': return b.hp - a.hp;
        case 'attack': return b.attackPower - a.attackPower;
        case 'element': return a.element.localeCompare(b.element);
        case 'rarity':
          const rarityOrder = ['ULTRA_RARE', 'RARE', 'UNCOMMON', 'COMMON'];
          return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        case 'type': return a.type.localeCompare(b.type);
        default: return 0;
      }
    });

    return result;
  }, [cards, elementFilter, rarityFilter, typeFilter, sortBy, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search cards by japanese, reading, romaji, or meaning..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2.5 bg-[#1A1A2E] border border-[#2D2D44] rounded-lg text-white placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636E72] hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-2">
        {/* Element Filter */}
        <div className="flex gap-1 flex-wrap">
          {ELEMENT_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setElementFilter(f.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                elementFilter === f.value
                  ? 'bg-[#6C5CE7] text-white'
                  : 'bg-[#1A1A2E] text-[#B2BEC3] border border-[#2D2D44] hover:border-[#6C5CE7]'
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Rarity */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#636E72]">Rarity:</span>
          <div className="flex gap-1">
            {RARITY_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setRarityFilter(f.value)}
                className={`px-2 py-0.5 rounded text-xs transition-all ${
                  rarityFilter === f.value
                    ? 'text-white'
                    : 'text-[#636E72] hover:text-white'
                }`}
                style={rarityFilter === f.value ? { backgroundColor: f.color } : {}}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#636E72]">Type:</span>
          <div className="flex gap-1">
            {TYPE_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`px-2 py-0.5 rounded text-xs transition-all ${
                  typeFilter === f.value
                    ? 'bg-[#6C5CE7] text-white'
                    : 'text-[#636E72] hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-[#636E72]">Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-[#1A1A2E] border border-[#2D2D44] rounded px-2 py-0.5 text-xs text-white focus:outline-none"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-[#636E72]">
        Showing {filteredCards.length} of {cards.length} cards
        {selectedCards.length > 0 && ` • ${selectedCards.length} selected`}
      </div>

      {/* Card Grid */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12 text-[#636E72]">
          <div className="text-4xl mb-4">🃏</div>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3"
        >
          {filteredCards.map(card => (
            <motion.div
              key={card.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Card
                card={card}
                size="sm"
                interactive={!!onCardSelect}
                isSelected={selectedCards.includes(card.id)}
                onClick={() => onCardSelect?.(card.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}