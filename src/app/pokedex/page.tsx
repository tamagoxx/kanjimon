'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronLeft, ChevronRight, Zap, Droplets, Flame, Leaf, Sparkles, Shield, Swords, Heart, Star } from 'lucide-react';

// ============================================================
// Types
// ============================================================
type PokemonType = 'fire' | 'water' | 'grass' | 'electric' | 'psychic' | 'normal' | 'bug' | 'poison' | 'ground' | 'rock' | 'flying' | 'fighting' | 'ghost' | 'ice' | 'dragon' | 'dark' | 'steel' | 'fairy';
type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'ULTRA_RARE';

interface PokemonData {
  id: number;
  name: string;
  types: string[];
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      'official-artwork': { front_default: string };
      home: { front_default: string };
    };
  };
  stats: {
    base_stat: number;
    stat: { name: string };
  }[];
  height: number;
  weight: number;
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  species: { url: string };
  flavor_text_entries: { flavor_text: string; language: { name: string }; version: { name: string } }[];
  color: { name: string };
}

interface PokemonCard {
  id: string;
  pokemonId: number;
  name: string;
  types: string[];
  image: string;
  shinyImage: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  height: number;
  weight: number;
  ability: string;
  hiddenAbility?: string;
  rarity: Rarity;
  element: string;
  flavorText: string;
  color: string;
}

// ============================================================
// Element Mapping (Pokemon type → KanjiMon element)
// ============================================================
const TYPE_TO_ELEMENT: Record<string, string> = {
  fire: 'FIRE',
  water: 'WATER',
  grass: 'GRASS',
  electric: 'ELECTRIC',
  psychic: 'PSYCHIC',
  normal: 'NORMAL',
  bug: 'GRASS',
  poison: 'PSYCHIC',
  ground: 'WATER',
  rock: 'NORMAL',
  flying: 'ELECTRIC',
  fighting: 'FIRE',
  ghost: 'PSYCHIC',
  ice: 'WATER',
  dragon: 'FIRE',
  dark: 'PSYCHIC',
  steel: 'NORMAL',
  fairy: 'PSYCHIC',
};

const ELEMENT_COLORS: Record<string, { bg: string; border: string; glow: string; accent: string }> = {
  FIRE: { bg: '#1a0a0a', border: '#ff6b35', glow: '#ff6b3540', accent: '#ff8c5a' },
  WATER: { bg: '#0a0f1a', border: '#4facfe', glow: '#4facfe40', accent: '#7cc4fe' },
  GRASS: { bg: '#0a1a0f', border: '#4bddb7', glow: '#4bddb740', accent: '#6ce8c8' },
  ELECTRIC: { bg: '#1a1a0a', border: '#ffd93d', glow: '#ffd93d40', accent: '#ffe566' },
  PSYCHIC: { bg: '#1a0f1a', border: '#c77dff', glow: '#c77dff40', accent: '#d4a3ff' },
  NORMAL: { bg: '#1a1a1a', border: '#8b8b8b', glow: '#8b8b8b40', accent: '#a8a8a8' },
};

const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  FIRE: <Flame className="w-3 h-3" />,
  WATER: <Droplets className="w-3 h-3" />,
  GRASS: <Leaf className="w-3 h-3" />,
  ELECTRIC: <Zap className="w-3 h-3" />,
  PSYCHIC: <Sparkles className="w-3 h-3" />,
  NORMAL: <Star className="w-3 h-3" />,
};

// ============================================================
// Stat calculation from Pokemon base stats
// ============================================================
function calculateHP(base: number): number {
  return Math.floor(base * 0.9) + 50; // 50-200 range
}
function calculateAttack(base: number): number {
  return Math.floor(base * 0.5) + 10; // 10-80 range
}
function calculateDefense(base: number): number {
  return Math.floor(base * 0.1) + 1; // 1-10 range
}
function calculateSpeed(base: number): number {
  return Math.floor(base * 0.5) + 5; // 5-65 range
}

function getRarity(baseTotal: number): Rarity {
  if (baseTotal >= 600) return 'ULTRA_RARE';
  if (baseTotal >= 450) return 'RARE';
  if (baseTotal >= 300) return 'UNCOMMON';
  return 'COMMON';
}

function getTypeColor(type: string): string {
  const colors: Record<string, string> = {
    fire: '#ff6b35', water: '#4facfe', grass: '#4bddb7', electric: '#ffd93d',
    psychic: '#c77dff', normal: '#a8a8a8', bug: '#7cb342', poison: '#ba68c8',
    ground: '#c69c6d', rock: '#8d6e63', flying: '#81d4fa', fighting: '#ef5350',
    ghost: '#7c4dff', ice: '#4dd0e1', dragon: '#ff7043', dark: '#5c6bc0',
    steel: '#90a4ae', fairy: '#f48fb1',
  };
  return colors[type] || '#a8a8a8';
}

// ============================================================
// Top Navigation Bar
// ============================================================
function TopNav({ onFilter, search, setSearch }: { onFilter: () => void; search: string; setSearch: (s: string) => void }) {
  return (
    <div className="sticky top-0 z-50 bg-[#0a1519] border-b border-white/10 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3">
        <button onClick={onFilter} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all">
          <Filter className="w-5 h-5 text-white/70" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Pokemon..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#6c5ce7]/50"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-white/30" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Pokemon Card Component
// ============================================================
function PokemonCardComponent({ card, onClick }: { card: PokemonCard; onClick: () => void }) {
  const colors = ELEMENT_COLORS[card.element] || ELEMENT_COLORS.NORMAL;
  const typeColor = getTypeColor(card.types[0]);

  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative cursor-pointer"
    >
      {/* Card */}
      <div
        className="relative rounded-2xl overflow-hidden border-2"
        style={{
          background: colors.bg,
          borderColor: colors.border,
          boxShadow: `0 4px 20px ${colors.glow}`,
        }}
      >
        {/* Rarity badge */}
        <div className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider
          ${card.rarity === 'ULTRA_RARE' ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black' : ''}
          ${card.rarity === 'RARE' ? 'bg-[#c77dff] text-white' : ''}
          ${card.rarity === 'UNCOMMON' ? 'bg-[#4facfe] text-white' : ''}
          ${card.rarity === 'COMMON' ? 'bg-white/20 text-white' : ''}
        `}>
          {card.rarity.replace('_', ' ')}
        </div>

        {/* Element badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {card.types.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white"
              style={{ backgroundColor: getTypeColor(t) + 'cc' }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Pokemon Image */}
        <div className="relative pt-6 pb-2 px-3 flex items-center justify-center" style={{ background: `linear-gradient(180deg, transparent 0%, ${colors.bg} 100%)` }}>
          <img
            src={card.image}
            alt={card.name}
            className="w-28 h-28 object-contain drop-shadow-lg"
            loading="lazy"
          />
        </div>

        {/* Card Info */}
        <div className="px-3 pb-3">
          <p className="text-[10px] text-white/40 font-medium tracking-wider mb-0.5">#{card.pokemonId.toString().padStart(3, '0')}</p>
          <h3 className="text-sm font-bold text-white capitalize leading-tight mb-2">{card.name}</h3>

          {/* Stats Bar */}
          <div className="flex items-center gap-2 text-[10px]">
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-400" />
              <span className="text-white/70">{card.hp}</span>
            </div>
            <div className="flex items-center gap-1">
              <Swords className="w-3 h-3 text-orange-400" />
              <span className="text-white/70">{card.attack}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-400" />
              <span className="text-white/70">{card.defense}</span>
            </div>
          </div>
        </div>

        {/* Element glow effect */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-20"
          style={{ boxShadow: `inset 0 0 30px ${colors.border}` }}
        />
      </div>
    </motion.div>
  );
}

// ============================================================
// Pokemon Detail Modal
// ============================================================
function PokemonDetailModal({ card, onClose }: { card: PokemonCard; onClose: () => void }) {
  const colors = ELEMENT_COLORS[card.element] || ELEMENT_COLORS.NORMAL;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ background: '#0f1923', borderTop: `3px solid ${colors.border}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image */}
        <div
          className="relative pt-8 pb-4 px-6 flex flex-col items-center"
          style={{ background: `linear-gradient(180deg, ${colors.bg} 0%, #0f1923 100%)` }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Pokemon number & name */}
          <p className="text-xs text-white/40 font-medium tracking-widest mb-1">
            #{card.pokemonId.toString().padStart(3, '0')} • {card.color}
          </p>
          <h2 className="text-2xl font-black text-white capitalize mb-3">{card.name}</h2>

          {/* Element badges */}
          <div className="flex gap-2 mb-4">
            {card.types.map((t) => (
              <span
                key={t}
                className="px-3 py-1 rounded-full text-xs font-bold uppercase text-white"
                style={{ backgroundColor: getTypeColor(t) }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Main image */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-30"
              style={{ background: colors.border }}
            />
            <img
              src={card.image}
              alt={card.name}
              className="relative w-44 h-44 object-contain"
            />
            {/* Shiny toggle */}
            <img
              src={card.shinyImage}
              alt={`${card.name} shiny`}
              className="absolute top-0 right-0 w-10 h-10 object-contain border border-white/20 rounded-full bg-black/30"
            />
          </div>

          {/* Rarity */}
          <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider
            ${card.rarity === 'ULTRA_RARE' ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black' : ''}
            ${card.rarity === 'RARE' ? 'bg-[#c77dff] text-white' : ''}
            ${card.rarity === 'UNCOMMON' ? 'bg-[#4facfe] text-white' : ''}
            ${card.rarity === 'COMMON' ? 'bg-white/20 text-white' : ''}
          `}>
            ⚈ {card.rarity.replace('_', ' ')}
          </span>
        </div>

        {/* Stats & Info */}
        <div className="px-6 pb-8 space-y-4">
          {/* Flavor text */}
          {card.flavorText && (
            <p className="text-xs text-white/50 italic text-center leading-relaxed px-2">
              "{card.flavorText}"
            </p>
          )}

          {/* Stats */}
          <div className="bg-white/5 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Base Stats</h4>
            <div className="space-y-2">
              {[
                { label: 'HP', value: card.hp, color: '#ff6b6b', icon: <Heart className="w-3 h-3" /> },
                { label: 'Attack', value: card.attack, color: '#ffa502', icon: <Swords className="w-3 h-3" /> },
                { label: 'Defense', value: card.defense, color: '#4facfe', icon: <Shield className="w-3 h-3" /> },
                { label: 'Speed', value: card.speed, color: '#a55eea', icon: <Zap className="w-3 h-3" /> },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16 text-xs text-white/50">
                    {stat.icon}
                    <span>{stat.label}</span>
                  </div>
                  <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min((stat.value / 200) * 100, 100)}%`,
                        background: stat.color,
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-white w-8 text-right">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Physical info */}
          <div className="flex gap-3">
            <div className="flex-1 bg-white/5 rounded-2xl p-4 text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Height</p>
              <p className="text-lg font-black text-white">{card.height / 10}m</p>
            </div>
            <div className="flex-1 bg-white/5 rounded-2xl p-4 text-center">
              <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Weight</p>
              <p className="text-lg font-black text-white">{card.weight / 10}kg</p>
            </div>
          </div>

          {/* Abilities */}
          <div className="bg-white/5 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Abilities</h4>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-bold text-white">
                {card.ability}
              </span>
              {card.hiddenAbility && (
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white/60">
                  {card.hiddenAbility} (Hidden)
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Filter Modal
// ============================================================
function FilterModal({ selectedTypes, setSelectedTypes, selectedRarity, setSelectedRarity, onClose }: {
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  selectedRarity: string;
  setSelectedRarity: (r: string) => void;
  onClose: () => void;
}) {
  const allTypes = ['fire', 'water', 'grass', 'electric', 'psychic', 'normal', 'bug', 'poison', 'ground', 'rock', 'flying', 'fighting', 'ghost', 'ice', 'dragon', 'dark', 'steel', 'fairy'];
  const rarities = ['COMMON', 'UNCOMMON', 'RARE', 'ULTRA_RARE'];

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ background: '#0f1923', borderTop: '3px solid #6c5ce7' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-black text-white">Filter Pokemon</h3>
            <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Type filter */}
          <div className="mb-5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Tipe</p>
            <div className="flex flex-wrap gap-2">
              {allTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                    selectedTypes.includes(type) ? 'text-white scale-105' : 'text-white/40 bg-white/5'
                  }`}
                  style={selectedTypes.includes(type) ? { backgroundColor: getTypeColor(type), transform: 'scale(1.05)' } : {}}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Rarity filter */}
          <div className="mb-6">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2">Rarity</p>
            <div className="flex flex-wrap gap-2">
              {rarities.map((r) => (
                <button
                  key={r}
                  onClick={() => setSelectedRarity(r === selectedRarity ? '' : r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedRarity === r
                      ? 'bg-[#6c5ce7] text-white'
                      : 'bg-white/5 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {r.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Apply button */}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-[#6c5ce7] text-white font-bold text-sm active:scale-[0.98]"
          >
            Tampilkan Hasil
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Bottom Navigation
// ============================================================
function BottomNav({ active = 'pokedex' }: { active?: string }) {
  const items = [
    { id: 'home', label: 'Home', href: '/', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: 'learn', label: 'Belajar', href: '/learn', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
    { id: 'pokedex', label: 'Pokedex', href: '/pokedex', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg> },
    { id: 'collection', label: 'Kartu', href: '/collection', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
    { id: 'profile', label: 'Profile', href: '/profile', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a1519]/95 backdrop-blur-lg border-t border-white/10">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              active === item.id
                ? 'text-[#6c5ce7]'
                : 'text-white/30 hover:text-white/60'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-semibold">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// Main Pokedex Page
// ============================================================
export default function PokedexPage() {
  const [pokemonList, setPokemonList] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRarity, setSelectedRarity] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 30;

  // Fetch Pokemon data
  const fetchPokemon = useCallback(async (offset: number, limit: number, searchQuery: string = '') => {
    try {
      // First get the list of Pokemon
      const listRes = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      const listData = await listRes.json();

      // Fetch details for each Pokemon in parallel (batched)
      const pokemonDetails = await Promise.all(
        listData.results.map(async (p: { url: string }, i: number) => {
          const detailRes = await fetch(p.url);
          const detail = await detailRes.json();

          // Fetch species for flavor text and color
          const speciesRes = await fetch(detail.species.url);
          const species = await speciesRes.json();

          const flavorText = species.flavor_text_entries
            .filter((e: { language: { name: string } }) => e.language.name === 'en')
            .slice(-1)[0]?.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ') || '';

          const primaryType = detail.types[0].type.name;
          const element = TYPE_TO_ELEMENT[primaryType] || 'NORMAL';

          // Calculate base stats total for rarity
          const stats = detail.stats;
          const baseTotal = stats.reduce((acc: number, s: { base_stat: number }) => acc + s.base_stat, 0);
          const hpStat = stats.find((s: { stat: { name: string } }) => s.stat.name === 'hp')?.base_stat || 50;
          const atkStat = stats.find((s: { stat: { name: string } }) => s.stat.name === 'attack')?.base_stat || 50;
          const defStat = stats.find((s: { stat: { name: string } }) => s.stat.name === 'defense')?.base_stat || 50;
          const speedStat = stats.find((s: { stat: { name: string } }) => s.stat.name === 'speed')?.base_stat || 50;

          const card: PokemonCard = {
            id: `poke-${detail.id}`,
            pokemonId: detail.id,
            name: detail.name,
            types: detail.types.map((t: { type: { name: string } }) => t.type.name),
            image: detail.sprites.other?.['official-artwork']?.front_default || detail.sprites.front_default,
            shinyImage: detail.sprites.front_shiny,
            hp: calculateHP(hpStat),
            attack: calculateAttack(atkStat),
            defense: calculateDefense(defStat),
            speed: calculateSpeed(speedStat),
            height: detail.height,
            weight: detail.weight,
            ability: detail.abilities.find((a: { is_hidden: boolean }) => !a.is_hidden)?.ability.name.replace('-', ' ') || '',
            hiddenAbility: detail.abilities.find((a: { is_hidden: boolean }) => a.is_hidden)?.ability.name.replace('-', ' '),
            rarity: getRarity(baseTotal),
            element,
            flavorText,
            color: species.color?.name || 'gray',
          };

          return card;
        })
      );

      return pokemonDetails;
    } catch (error) {
      console.error('Failed to fetch Pokemon:', error);
      return [];
    }
  }, []);

  // Initial load
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      const data = await fetchPokemon(0, LIMIT);
      setPokemonList(data);
      setOffset(LIMIT);
      setHasMore(data.length === LIMIT);
      setLoading(false);
    };
    loadInitial();
  }, [fetchPokemon]);

  // Load more
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const data = await fetchPokemon(offset, LIMIT);
    if (data.length > 0) {
      setPokemonList((prev) => [...prev, ...data]);
      setOffset((prev) => prev + LIMIT);
    } else {
      setHasMore(false);
    }
    setLoadingMore(false);
  }, [fetchPokemon, loadingMore, hasMore, offset]);

  // Filter logic
  const filteredPokemon = pokemonList.filter((p) => {
    const matchesSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedTypes.length === 0 || p.types.some((t) => selectedTypes.includes(t));
    const matchesRarity = selectedRarity === '' || p.rarity === selectedRarity;
    return matchesSearch && matchesType && matchesRarity;
  });

  return (
    <div className="min-h-screen bg-[#0a1519] pb-20">
      <TopNav onFilter={() => setShowFilter(true)} search={search} setSearch={setSearch} />

      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-[#6c5ce7]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Pokedex
            </h1>
            <p className="text-xs text-white/40 mt-0.5">{pokemonList.length} Pokemon ditemukan</p>
          </div>
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
            <span className="text-lg">⚈</span>
            <span className="text-xs font-bold text-white/60">{filteredPokemon.length}</span>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#6c5ce7]/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-[#6c5ce7] rounded-full animate-spin" />
          </div>
          <p className="text-sm text-white/40 animate-pulse">Memuat Pokemon...</p>
        </div>
      )}

      {/* Pokemon Grid */}
      {!loading && (
        <div className="px-3 pb-6">
          <div className="grid grid-cols-2 gap-3">
            {filteredPokemon.map((card) => (
              <PokemonCardComponent key={card.id} card={card} onClick={() => setSelectedCard(card)} />
            ))}
          </div>

          {/* Load more / End */}
          {filteredPokemon.length > 0 && (
            <div className="mt-6 text-center">
              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-[#6c5ce7] text-white font-bold text-sm rounded-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak'}
                </button>
              )}
              {!hasMore && (
                <p className="text-xs text-white/30 py-4">Semua Pokemon sudah dimuat</p>
              )}
            </div>
          )}

          {/* Empty state */}
          {filteredPokemon.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-4xl">🔍</span>
              <p className="text-sm text-white/40">Pokemon tidak ditemukan</p>
              <button
                onClick={() => { setSearch(''); setSelectedTypes([]); setSelectedRarity(''); }}
                className="text-xs text-[#6c5ce7] font-bold"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilter && (
          <FilterModal
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            selectedRarity={selectedRarity}
            setSelectedRarity={setSelectedRarity}
            onClose={() => setShowFilter(false)}
          />
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <PokemonDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
        )}
      </AnimatePresence>

      <BottomNav active="pokedex" />
    </div>
  );
}
