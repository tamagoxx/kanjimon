'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore, PokemonCard } from '@/store/collectionStore';
import { CARDS_BY_ID } from '@/data/cards';
import { Check, X, ChevronDown, Plus, Trash2, GripVertical } from 'lucide-react';

const colors = {
  background: '#0a1519',
  cardBg: '#1a1a2e',
  inputBg: '#212c30',
  darkText: '#c8c4d7',
  lightText: '#d8e4ea',
  brand: '#6c5ce7',
  teal: '#4bddb7',
  gold: '#f0bf63',
  coral: '#ffb4ab',
  lightPurple: '#c6bfff',
  darkGray: '#2b363b',
};

const ELEMENT_COLORS: Record<string, string> = {
  FIRE: '#ffb4ab', WATER: '#6c5ce7', GRASS: '#4bddb7',
  ELECTRIC: '#f0bf63', PSYCHIC: '#c6bfff', NORMAL: '#c8c4d7',
};

const TYPE_COLORS: Record<string, string> = {
  fire: '#ff6b35', water: '#4facfe', grass: '#4bddb7', electric: '#ffd93d',
  psychic: '#c77dff', normal: '#a8a8a8', bug: '#7cb342', poison: '#ba68c8',
  ground: '#c69c6d', rock: '#8d6e63', flying: '#81d4fa', fighting: '#ef5350',
  ghost: '#7c4dff', ice: '#4dd0e1', dragon: '#ff7043', dark: '#5c6bc0',
  steel: '#90a4ae', fairy: '#f48fb1',
};

const RARITY_COLORS: Record<string, string> = {
  COMMON: '#c8c4d7', UNCOMMON: '#4bddb7', RARE: '#6c5ce7', ULTRA_RARE: '#f0bf63',
};

type DeckCardType = 'japanese' | 'pokemon';
interface DeckCard {
  id: string;
  type: DeckCardType;
  name: string;
  element: string;
  rarity: string;
  attack: number;
  defense: number;
  hp: number;
  image?: string;
  symbol?: string;
}

function TopAppBar({ onSave }: { onSave: () => void }) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-40 px-4 h-[89px] flex items-center justify-between" style={{ backgroundColor: '#0a1519' }}>
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/')} className="w-10 h-10 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c6bfff" strokeWidth="2">
            <path d="M10 12L6 8l4-4" />
          </svg>
        </button>
        <span className="text-base font-medium text-[#c6bfff]">Deck Builder</span>
      </div>
      <button onClick={onSave} className="px-4 py-2 rounded-xl font-bold text-white text-sm" style={{ backgroundColor: colors.brand }}>
        Simpan Deck
      </button>
    </div>
  );
}

function ValidationBar({ cardCount, elementCount }: { cardCount: number; elementCount: number }) {
  const isValid = cardCount >= 5 && cardCount <= 30;
  return (
    <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: isValid ? '#02b894' : '#ff4b4b' }}>
      <Check className="w-3 h-3" style={{ color: isValid ? '#004233' : '#fff' }} />
      <span className="text-sm font-medium" style={{ color: isValid ? '#004233' : '#fff' }}>
        {isValid ? `Deck valid • ${cardCount} kartu • ${elementCount} element` : `${cardCount}/30 kartu (min 5)`}
      </span>
    </div>
  );
}

function MiniDeckCard({ card, index, onRemove }: { card: DeckCard; index: number; onRemove: () => void }) {
  const col = card.type === 'pokemon' ? TYPE_COLORS[card.element] || '#a8a8a8' : (ELEMENT_COLORS[card.element] || colors.darkText);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="w-16 h-[90px] rounded-lg p-1.5 flex flex-col items-center justify-between relative"
      style={{ backgroundColor: colors.cardBg, borderLeft: `3px solid ${col}` }}
    >
      {card.type === 'pokemon' ? (
        <img src={card.image} alt={card.name} className="w-10 h-10 object-contain" />
      ) : (
        <span className="text-xl font-bold text-white">{card.symbol || card.name[0]}</span>
      )}
      <span className="text-[9px] text-white/60 truncate w-full text-center capitalize">{card.name}</span>
      <div className="flex items-center gap-1 text-[9px]">
        <span className="text-red-400">{card.attack}</span>
        <span className="text-blue-400">{card.defense}</span>
      </div>
      <button
        onClick={onRemove}
        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center"
      >
        <X className="w-2 h-2 text-white" />
      </button>
    </motion.div>
  );
}

function CollectionCard({ card, index, inDeck, onAdd, onRemove }: {
  card: DeckCard; index: number; inDeck: boolean; onAdd: () => void; onRemove: () => void;
}) {
  const col = card.type === 'pokemon' ? TYPE_COLORS[card.element] || '#a8a8a8' : (ELEMENT_COLORS[card.element] || colors.darkText);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: inDeck ? 0.4 : 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileTap={!inDeck ? { scale: 0.95 } : {}}
      className={`rounded-xl overflow-hidden cursor-pointer ${inDeck ? '' : 'hover:ring-2 hover:ring-white/30'}`}
      style={{ backgroundColor: colors.cardBg }}
      onClick={inDeck ? onRemove : onAdd}
    >
      <div className="h-20 flex items-center justify-center relative" style={{ backgroundColor: `${col}15` }}>
        {card.type === 'pokemon' ? (
          <img src={card.image} alt={card.name} className="w-14 h-14 object-contain" />
        ) : (
          <span className="text-2xl font-bold text-white">{card.symbol || card.name[0]}</span>
        )}
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: `${RARITY_COLORS[card.rarity]}30`, color: RARITY_COLORS[card.rarity] }}>
          {card.rarity.replace('_', ' ')}
        </div>
        {inDeck && (
          <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-[#4bddb7] flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-white" />
          </div>
        )}
      </div>
      <div className="p-1.5">
        <p className="text-[10px] text-white/70 truncate capitalize">{card.name}</p>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[9px] text-white/40">{card.hp}HP</span>
          <span className="text-[9px] text-red-400">{card.attack}⚔️</span>
        </div>
      </div>
    </motion.div>
  );
}

function DeckInfoBar({ deckCards, deckName, setDeckName }: {
  deckCards: DeckCard[];
  deckName: string;
  setDeckName: (n: string) => void;
}) {
  const elementCounts = deckCards.reduce((acc, c) => {
    acc[c.element] = (acc[c.element] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const elements = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="p-4 rounded-xl" style={{ backgroundColor: colors.cardBg }}>
      <div className="flex items-center gap-3 mb-3">
        <input
          type="text"
          value={deckName}
          onChange={(e) => setDeckName(e.target.value)}
          placeholder="Nama Deck..."
          className="flex-1 bg-transparent outline-none text-white font-bold text-lg placeholder:text-white/20"
        />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="px-3 py-2 rounded-xl text-center" style={{ backgroundColor: '#162125' }}>
          <span className="text-lg font-bold text-white">{deckCards.length}</span>
          <span className="text-xs text-white/40 block">Kartu</span>
        </div>
        {elements.map(([el, count]) => (
          <div key={el} className="px-3 py-2 rounded-xl text-center" style={{ backgroundColor: '#162125' }}>
            <span className="text-lg font-bold" style={{ color: el === 'FIRE' ? '#ffb4ab' : el === 'WATER' ? '#4facfe' : el === 'GRASS' ? '#4bddb7' : '#c8c4d7' }}>{count}</span>
            <span className="text-xs text-white/40 block capitalize">{el}</span>
          </div>
        ))}
        {elements.length === 0 && (
          <div className="px-3 py-2 rounded-xl text-center" style={{ backgroundColor: '#162125' }}>
            <span className="text-xs text-white/40">Pilih kartu...</span>
          </div>
        )}
      </div>
      {deckCards.length > 0 && (
        <div className="h-2 rounded-full overflow-hidden flex" style={{ backgroundColor: '#162125' }}>
          {elements.map(([el]) => {
            const pct = (elementCounts[el] / deckCards.length) * 100;
            const col = el === 'FIRE' ? '#ffb4ab' : el === 'WATER' ? '#4facfe' : el === 'GRASS' ? '#4bddb7' : el === 'ELECTRIC' ? '#ffd93d' : el === 'PSYCHIC' ? '#c77dff' : '#a8a8a8';
            return <div key={el} className="h-full" style={{ width: `${pct}%`, backgroundColor: col }} />;
          })}
        </div>
      )}
    </div>
  );
}

function TabSelector({ active, onChange }: { active: 'all' | 'japanese' | 'pokemon'; onChange: (t: 'all' | 'japanese' | 'pokemon') => void }) {
  return (
    <div className="flex gap-2 p-1 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
      {[
        { id: 'all' as const, label: 'Semua', icon: '📦' },
        { id: 'japanese' as const, label: 'Jepang', icon: '📜' },
        { id: 'pokemon' as const, label: 'Pokemon', icon: '🎮' },
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
          style={active === tab.id ? { backgroundColor: colors.brand, color: 'white' } : { color: colors.darkText }}
        >
          <span>{tab.icon}</span>
          <span className="hidden sm:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

function BottomNav() {
  const router = useRouter();
const navItems = [
    { icon: '🏠', label: 'Home', route: '/' },
    { icon: '📚', label: 'Belajar', route: '/learn' },
    { icon: '⚔️', label: 'Battle', route: '/battle' },
    { icon: '🃏', label: 'Kartu', route: '/collection' },
    { icon: '🛒', label: 'Toko', route: '/shop' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-50" style={{ backgroundColor: '#162125' }}>
      {navItems.map((item, i) => (
        <button key={i} onClick={() => router.push(item.route)} className="flex flex-col items-center gap-1 opacity-60 transition-opacity">
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function DeckBuilderPage() {
  const router = useRouter();
  const { ownedPokemon, fusedPokemon, createDeck } = useCollectionStore();

  const [deckName, setDeckName] = useState('Deck Baru');
  const [deckCards, setDeckCards] = useState<DeckCard[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'japanese' | 'pokemon'>('all');
  const [sortBy, setSortBy] = useState<'rarity' | 'element' | 'hp'>('rarity');

  // Get Japanese cards from data
  const allJapaneseCards = Object.values(CARDS_BY_ID);

  // Build collection list
  const collectionCards: DeckCard[] = useMemo(() => {
    const cards: DeckCard[] = [];

    // Add Japanese cards
    if (activeTab === 'all' || activeTab === 'japanese') {
      allJapaneseCards.forEach(card => {
        cards.push({
          id: `jp-${card.id}`,
          type: 'japanese',
          name: card.romaji,
          element: card.element,
          rarity: card.rarity,
          attack: card.attackPower,
          defense: card.defenseRating,
          hp: card.hp,
          symbol: card.japanese,
        });
      });
    }

    // Add Pokemon cards
    if (activeTab === 'all' || activeTab === 'pokemon') {
      ownedPokemon.forEach(poke => {
        cards.push({
          id: `poke-${poke.pokemonId}`,
          type: 'pokemon',
          name: poke.name,
          element: poke.types[0],
          rarity: poke.rarity,
          attack: poke.attack,
          defense: poke.defense,
          hp: poke.hp,
          image: poke.image,
        });
      });

      // Add fused Pokemon (pokemonId >= 10001) to deck builder
      fusedPokemon.forEach(fused => {
        cards.push({
          id: `fused-${fused.pokemonId}`,
          type: 'pokemon',
          name: fused.name,
          element: fused.element,
          rarity: fused.rarity,
          attack: fused.baseAttack,
          defense: fused.baseDefense,
          hp: fused.baseHp,
          image: fused.image,
        });
      });
    }

    // Sort
    if (sortBy === 'rarity') {
      const order = { ULTRA_RARE: 0, RARE: 1, UNCOMMON: 2, COMMON: 3 };
      cards.sort((a, b) => order[a.rarity as keyof typeof order] - order[b.rarity as keyof typeof order]);
    } else if (sortBy === 'hp') {
      cards.sort((a, b) => b.hp - a.hp);
    }

    return cards;
  }, [activeTab, sortBy, allJapaneseCards, ownedPokemon, fusedPokemon]);

  const addToDeck = (card: DeckCard) => {
    if (deckCards.length >= 30) return;
    // Check max 2 copies
    const existing = deckCards.filter(c => c.id === card.id).length;
    if (existing >= 2) return;
    setDeckCards([...deckCards, card]);
  };

  const removeFromDeck = (index: number) => {
    setDeckCards(deckCards.filter((_, i) => i !== index));
  };

  const onSave = () => {
    if (deckCards.length < 5) {
      alert('Deck minimal 5 kartu!');
      return;
    }
    const cardIds = deckCards.map(c => c.id);
    createDeck(deckName, cardIds);
    alert(`Deck "${deckName}" berhasil disimpan! (${deckCards.length} kartu)`);
    setDeckCards([]);
    setDeckName('Deck Baru');
  };

  const elementSet = new Set(deckCards.map(c => c.element));

  return (
    <div className="min-h-screen pb-32" style={{ backgroundColor: colors.background }}>
      <TopAppBar onSave={onSave} />
      <ValidationBar cardCount={deckCards.length} elementCount={elementSet.size} />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        <DeckInfoBar deckCards={deckCards} deckName={deckName} setDeckName={setDeckName} />

        {/* Current Deck */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white/60">DECK SAAT INI ({deckCards.length}/30)</h3>
            {deckCards.length > 0 && (
              <button onClick={() => setDeckCards([])} className="text-xs text-red-400 font-bold">
                Clear All
              </button>
            )}
          </div>
          <div className="p-3 rounded-xl overflow-x-auto" style={{ backgroundColor: colors.cardBg }}>
            {deckCards.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-white/30 text-sm">
                Belum ada kartu di deck
              </div>
            ) : (
              <div className="flex gap-2">
                {deckCards.map((card, i) => (
                  <MiniDeckCard key={`${card.id}-${i}`} card={card} index={i} onRemove={() => removeFromDeck(i)} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Collection Picker */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white/60">PILIH KARTU</h3>
            <div className="flex items-center gap-2">
              <TabSelector active={activeTab} onChange={setActiveTab} />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-3 text-xs">
            <span className="text-white/40">Sort:</span>
            {[
              { id: 'rarity' as const, label: 'Rarity' },
              { id: 'hp' as const, label: 'HP' },
            ].map(s => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id)}
                className="px-2 py-1 rounded-full"
                style={sortBy === s.id ? { backgroundColor: colors.brand, color: 'white' } : { backgroundColor: '#162125', color: colors.darkText }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="p-3 rounded-xl" style={{ backgroundColor: '#121d21' }}>
            <div className="grid grid-cols-3 gap-2">
              {collectionCards.slice(0, 30).map((card, i) => {
                const inDeck = deckCards.some(d => d.id === card.id);
                return (
                  <CollectionCard
                    key={`${card.type}-${card.id}`}
                    card={card}
                    index={i}
                    inDeck={inDeck}
                    onAdd={() => addToDeck(card)}
                    onRemove={() => {
                      const idx = deckCards.findIndex(d => d.id === card.id);
                      if (idx !== -1) removeFromDeck(idx);
                    }}
                  />
                );
              })}
            </div>
            {collectionCards.length > 30 && (
              <p className="text-center text-xs text-white/30 mt-2">+{collectionCards.length - 30} kartu lainnya</p>
            )}
            {collectionCards.length === 0 && (
              <div className="text-center py-8 text-white/40">
                {activeTab === 'pokemon' ? 'Belum ada Pokemon ditangkap' : 'Tidak ada kartu'}
              </div>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}