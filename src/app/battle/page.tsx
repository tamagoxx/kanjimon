'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCollectionStore, PokemonCard } from '@/store/collectionStore';
import { useAuthStore } from '@/store/authStore';
import type { ElementEssence, JapaneseCard } from '@/types';
import { Swords, Shield, ArrowLeft, Zap, Flame, Droplets, Leaf, Eye, Sparkles, CircleDot } from 'lucide-react';
import JankenGame from '@/components/battle/JankenGame';
import { fetchMove, MOVE_TYPE_COLORS, MOVE_CATEGORY_ICONS, getMockMovesForTypes } from '@/data/pokemon-moves';

// ============================================================
// Types
// ============================================================
type CardStatus = 'normal' | 'burning' | 'paralyzed' | 'boosted' | 'defending';

interface BattleCard {
  id: string;
  name: string;
  element: 'FIRE' | 'WATER' | 'GRASS' | 'ELECTRIC' | 'PSYCHIC' | 'NORMAL';
  attack: number;
  defense: number;
  hp: number;
  maxHp: number;
  cost: number;
  status: CardStatus;
  image?: string;
  ability?: string; // e.g. "Battle Armor", "Overgrow", "Swift Swim"
  moves?: BattleMove[]; // PokeAPI moves for Pokemon cards
}

// Battle-optimized move (subset of PokemonMove)
export interface BattleMove {
  id: number;
  name: string;
  power: number;      // 0 if status move
  accuracy: number;   // 0-100
  pp: number;
  type: string;        // elemental type
  category: 'physical' | 'special' | 'status';
  description: string;
  drain: number;       // HP drain %
  recoil: number;     // user damage %
  priority: number;
  minHits?: number;
  maxHits?: number;
  critRate: number;   // crit chance boost (0-100)
}

// Ability badge color mapping based on effect type
const ABILITY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  // Defense/Armor
  armor: { bg: '#4facfe30', text: '#4facfe', icon: '🛡️' },
  shield: { bg: '#4facfe30', text: '#4facfe', icon: '🛡️' },
  guard: { bg: '#4facfe30', text: '#4facfe', icon: '🛡️' },
  'battle-armor': { bg: '#4facfe30', text: '#4facfe', icon: '🛡️' },
  'shell-armor': { bg: '#4facfe30', text: '#4facfe', icon: '🛡️' },
  // Attack/Power
  'overgrow': { bg: '#ff6b3530', text: '#ff6b35', icon: '⚔️' },
  blaze: { bg: '#ff6b3530', text: '#ff6b35', icon: '🔥' },
  'flash-fire': { bg: '#ff6b3530', text: '#ff6b35', icon: '🔥' },
  // Speed
  'swift-swim': { bg: '#4facfe30', text: '#4facfe', icon: '💨' },
  speed: { bg: '#ffd93d30', text: '#ffd93d', icon: '💨' },
  // Special
  'levitate': { bg: '#c77dff30', text: '#c77dff', icon: '👻' },
  'floating': { bg: '#c77dff30', text: '#c77dff', icon: '✨' },
  // Heal/Recovery
  'regenerator': { bg: '#4bddb730', text: '#4bddb7', icon: '💚' },
  'healer': { bg: '#4bddb730', text: '#4bddb7', icon: '💚' },
  // Default
  default: { bg: '#c8c4d730', text: '#c8c4d7', icon: '⭐' },
};

function getAbilityStyle(abilityName: string): { bg: string; text: string; icon: string } {
  if (!abilityName) return ABILITY_COLORS.default;
  const key = abilityName.toLowerCase().replace(/\s+/g, '-');
  for (const [pattern, style] of Object.entries(ABILITY_COLORS)) {
    if (key.includes(pattern)) return style;
  }
  return ABILITY_COLORS.default;
}

function formatAbilityName(name: string): string {
  if (!name) return '';
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

type Phase = 'select-deck' | 'select-opponent' | 'intro' | 'battle' | 'result' | 'boss-select' | 'boss-intro' | 'boss-battle' | 'boss-result';

// ============================================================
// Constants
// ============================================================
const ELEMENT_COLORS: Record<string, string> = {
  FIRE: '#ff6b35', WATER: '#4facfe', GRASS: '#4bddb7',
  ELECTRIC: '#ffd93d', PSYCHIC: '#c77dff', NORMAL: '#a8a8a8',
};

const ELEMENT_ICONS: Record<string, any> = {
  FIRE: Flame, WATER: Droplets, GRASS: Leaf,
  ELECTRIC: CircleDot, PSYCHIC: Eye, NORMAL: Sparkles,
};

const EFFECTIVENESS: Record<string, string[]> = {
  FIRE: ['GRASS'], GRASS: ['WATER'], WATER: ['FIRE'],
  ELECTRIC: ['WATER'], PSYCHIC: ['NORMAL'], NORMAL: [],
};

// Full type chart for PokeAPI move types (attacking type → defending types that are weak)
const TYPE_CHART: Record<string, string[]> = {
  fire: ['grass', 'bug', 'ice', 'steel'],
  water: ['fire', 'ground', 'rock'],
  grass: ['water', 'ground', 'rock'],
  electric: ['water', 'flying'],
  psychic: ['fighting', 'poison'],
  normal: [],
  fighting: ['normal', 'rock', 'steel', 'ice', 'dark'],
  flying: ['grass', 'fighting', 'bug'],
  poison: ['grass', 'fairy'],
  ground: ['fire', 'electric', 'poison', 'rock', 'steel'],
  rock: ['fire', 'ice', 'flying', 'bug'],
  bug: ['grass', 'psychic', 'dark'],
  ghost: ['psychic', 'ghost'],
  steel: ['fire', 'water', 'electric', 'steel', 'ice', 'rock', 'fairy'],
  dragon: ['dragon'],
  dark: ['psychic', 'ghost'],
  ice: ['grass', 'ground', 'flying', 'dragon'],
  fairy: ['fighting', 'dragon', 'dark'],
};

// Get effectiveness multiplier for a move type vs defender element
function getMoveEffectiveness(moveType: string, defenderElement: string): number {
  const lowerMove = moveType.toLowerCase();
  const lowerDef = defenderElement.toLowerCase();
  const strongAgainst = TYPE_CHART[lowerMove] || [];
  if (strongAgainst.includes(lowerDef)) return 2;
  const weakAgainst: Record<string, string[]> = {
    fire: ['fire', 'water', 'rock', 'dragon'],
    water: ['water', 'grass', 'dragon'],
    grass: ['grass', 'fire', 'bug', 'dragon', 'steel'],
    electric: ['electric', 'grass', 'dragon'],
    psychic: ['psychic', 'steel'],
    fighting: ['poison', 'flying', 'psychic', 'fairy'],
    flying: ['electric', 'rock', 'steel'],
    poison: ['poison', 'ground', 'rock', 'ghost'],
    ground: ['grass', 'bug', 'flying'],
    rock: ['fighting', 'ground', 'steel'],
    bug: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'],
    ghost: ['dark'],
    steel: ['fire', 'water', 'electric', 'steel', 'ice', 'rock', 'fairy'],
    dragon: ['steel'],
    dark: ['fighting', 'dark', 'fairy'],
    ice: ['fire', 'water', 'steel'],
    fairy: ['fire', 'poison', 'steel'],
  };
  if (weakAgainst[lowerMove]?.includes(lowerDef)) return 0.5;
  return 1;
}

const OPPONENTS = [
  { id: 'sensei', name: 'Sensei Bot', emoji: '👨‍🏫', atk: 45, def: 30, hp: 120, level: 1, strategy: 'balanced' },
  { id: 'ninja', name: 'Ninja Bot', emoji: '🥷', atk: 65, def: 20, hp: 100, level: 5, strategy: 'aggressive' },
  { id: 'samurai', name: 'Samurai Bot', emoji: '⚔️', atk: 40, def: 50, hp: 150, level: 10, strategy: 'defensive' },
  { id: 'shogun', name: 'Shogun Bot', emoji: '🛡️', atk: 60, def: 40, hp: 130, level: 20, strategy: 'smart' },
  { id: 'dragon', name: 'Dragon Bot', emoji: '🐉', atk: 85, def: 30, hp: 160, level: 35, strategy: 'boss' },
];

// ============================================================
// Boss Battle Data
// ============================================================
interface BossPhase {
  name: string;
  hpThreshold: number; // % of max HP to trigger this phase
  attackMultiplier: number;
  defenseMultiplier: number;
  specialAbility: 'AOE' | 'CHARGE' | 'ENRAGE' | 'HEAL' | 'DEBUFF' | 'BERSERK' | 'BURN' | 'FREEZE' | null;
  specialDesc: string;
}

interface Boss {
  id: string;
  name: string;
  emoji: string;
  level: number;
  maxHp: number;
  baseAtk: number;
  baseDef: number;
  phases: BossPhase[];
  rewardStardust: number;
  rewardDiamonds: number;
  guaranteedJpCard: boolean;
  description: string;
  element: 'FIRE' | 'WATER' | 'GRASS' | 'ELECTRIC' | 'PSYCHIC' | 'NORMAL';
}

const BOSSES: Boss[] = [
  {
    id: 'onyx',
    name: 'Onyx Guardian',
    emoji: '🪨',
    level: 40,
    maxHp: 400,
    baseAtk: 55,
    baseDef: 70,
    description: 'Stoneshield Guardian - blocks and counters',
    rewardStardust: 30,
    rewardDiamonds: 20,
    guaranteedJpCard: true,
    element: 'NORMAL',
    phases: [
      { name: 'Guard', hpThreshold: 100, attackMultiplier: 1.0, defenseMultiplier: 1.5, specialAbility: 'DEBUFF', specialDesc: 'Reduce ATK -20% for 2 turns' },
      { name: 'Rage', hpThreshold: 50, attackMultiplier: 1.3, defenseMultiplier: 1.0, specialAbility: 'CHARGE', specialDesc: 'Charging heavy strike...' },
      { name: 'Final', hpThreshold: 20, attackMultiplier: 1.8, defenseMultiplier: 0.8, specialAbility: 'ENRAGE', specialDesc: 'ENRAGE! ATK +80%, DEF -40%' },
    ],
  },
  {
    id: 'blaze',
    name: 'Blaze Wyrm',
    emoji: '🔥',
    level: 50,
    maxHp: 500,
    baseAtk: 80,
    baseDef: 40,
    description: 'Fire Dragon - burns and AoE attacks',
    rewardStardust: 50,
    rewardDiamonds: 35,
    guaranteedJpCard: true,
    element: 'FIRE',
    phases: [
      { name: 'Inferno', hpThreshold: 100, attackMultiplier: 1.0, defenseMultiplier: 1.0, specialAbility: 'BURN', specialDesc: 'Burn: 15 dmg/turn for 3 turns' },
      { name: 'Blast', hpThreshold: 60, attackMultiplier: 1.2, defenseMultiplier: 1.0, specialAbility: 'AOE', specialDesc: 'AoE: Deal 25 to player HP directly' },
      { name: 'Wyrm', hpThreshold: 30, attackMultiplier: 1.5, defenseMultiplier: 1.0, specialAbility: 'BERSERK', specialDesc: 'BERSERK! Next 3 attacks deal +50%' },
    ],
  },
  {
    id: 'arctic',
    name: 'Arctic Leviathan',
    emoji: '❄️',
    level: 60,
    maxHp: 650,
    baseAtk: 70,
    baseDef: 60,
    description: 'Ice Colossus - freezes and heals',
    rewardStardust: 80,
    rewardDiamonds: 50,
    guaranteedJpCard: true,
    element: 'WATER',
    phases: [
      { name: 'Freeze', hpThreshold: 100, attackMultiplier: 1.0, defenseMultiplier: 1.0, specialAbility: 'DEBUFF', specialDesc: 'Freeze: Skip 1 turn' },
      { name: 'Frost', hpThreshold: 60, attackMultiplier: 1.3, defenseMultiplier: 1.2, specialAbility: 'HEAL', specialDesc: 'Heal 15% max HP' },
      { name: 'Avalanche', hpThreshold: 25, attackMultiplier: 1.6, defenseMultiplier: 1.0, specialAbility: 'AOE', specialDesc: 'AoE: 40 dmg + freeze chance' },
    ],
  },
  {
    id: 'void',
    name: 'Void Emperor',
    emoji: '👁️',
    level: 75,
    maxHp: 800,
    baseAtk: 90,
    baseDef: 50,
    description: 'Cosmic Overlord - psychic destroys',
    rewardStardust: 120,
    rewardDiamonds: 80,
    guaranteedJpCard: true,
    element: 'PSYCHIC',
    phases: [
      { name: 'Dark', hpThreshold: 100, attackMultiplier: 1.0, defenseMultiplier: 1.0, specialAbility: 'DEBUFF', specialDesc: 'Curse: 20% more damage taken' },
      { name: 'Void', hpThreshold: 65, attackMultiplier: 1.4, defenseMultiplier: 1.0, specialAbility: 'CHARGE', specialDesc: 'Charge: 200% damage next hit' },
      { name: 'Collapse', hpThreshold: 30, attackMultiplier: 1.8, defenseMultiplier: 0.8, specialAbility: 'AOE', specialDesc: 'Collapse: 60 dmg + clear all buffs' },
    ],
  },
];

// Boss-only damage types (for phase transition text)
const BOSS_SPECIAL_DAMAGE_TYPES = ['AOE', 'CHARGE', 'ENRAGE', 'HEAL', 'DEBUFF', 'BURN', 'BERSERK', 'FREEZE'] as const;
type BossSpecialType = typeof BOSS_SPECIAL_DAMAGE_TYPES[number];

// ============================================================
// Utilities
// ============================================================
function getElementAdvantage(attacker: string, defender: string): number {
  if (EFFECTIVENESS[attacker]?.includes(defender)) return 2;
  if (EFFECTIVENESS[defender]?.includes(attacker)) return 0.5;
  return 1;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function useDemoDeck(setHand: (cards: BattleCard[]) => void) {
  const demo = [
    { id: 'd1', name: 'Mizu', element: 'WATER', attack: 55, defense: 20, hp: 85 },
    { id: 'd2', name: 'Hi', element: 'FIRE', attack: 70, defense: 15, hp: 75 },
    { id: 'd3', name: 'Ki', element: 'GRASS', attack: 50, defense: 25, hp: 90 },
    { id: 'd4', name: 'Kaze', element: 'ELECTRIC', attack: 60, defense: 18, hp: 80 },
    { id: 'd5', name: 'Hikari', element: 'PSYCHIC', attack: 65, defense: 22, hp: 85 },
  ];
  setHand(demo.map(d => createBattleCard(d, true)));
}

function createBattleCard(card: any, isPlayer: boolean): BattleCard {
  return {
    id: card.id || `${isPlayer ? 'p' : 'e'}-${Date.now()}-${Math.random()}`,
    name: card.name || card.japanese || 'Card',
    element: card.element || card.types?.[0]?.toUpperCase() || 'NORMAL',
    attack: card.attack || card.attackPower || 40,
    defense: card.defense || card.defenseRating || 10,
    hp: card.hp || 80,
    maxHp: card.maxHp || card.hp || 80,
    cost: 1,
    status: 'normal',
    image: card.image || undefined,
    ability: card.ability || undefined,
  };
}

// ============================================================
// Components
// ============================================================
function DamageText({ value, type }: { value: number; type: 'dmg' | 'heal' | 'combo' }) {
  const color = type === 'heal' ? '#4bddb7' : type === 'combo' ? '#ffd93d' : '#ff6b35';
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.5 }}
      animate={{ opacity: 1, y: -50, scale: 1.2 }}
      exit={{ opacity: 0, y: -80 }}
      transition={{ duration: 0.8 }}
      className="absolute font-black text-3xl pointer-events-none"
      style={{ left: '50%', top: '40%', transform: 'translate(-50%, -50%)', color, textShadow: `0 0 12px ${color}` }}
    >
      {type === 'heal' ? `+${value}` : `-${value}`}
    </motion.div>
  );
}

function StatusBadge({ status }: { status: CardStatus }) {
  if (status === 'normal') return null;
  const colors: Record<string, string> = { burning: '#ff6b35', paralyzed: '#ffd93d', boosted: '#c77dff', defending: '#4facfe' };
  return (
    <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
      style={{ backgroundColor: colors[status] || '#aaa' }}>
      {status[0].toUpperCase()}
    </div>
  );
}

function DeckSelectionScreen({ onSelectDeck, onEditDeck, onNewDeck, onClose }: { onSelectDeck: (deckId: string) => void; onEditDeck: (deckId: string) => void; onNewDeck: () => void; onClose: () => void }) {
  const { decks, activeDeckId, ownedCards, ownedPokemon, fusedPokemon } = useCollectionStore();

  // Filter decks that have at least 3 cards
  const validDecks = decks.filter(d => d.cardIds.length >= 3);

  // Build card preview for a deck
  const getDeckPreview = (deck: typeof decks[0]) => {
    return deck.cardIds.slice(0, 5).map(id => {
      if (id.startsWith('poke-')) {
        const pokemonId = parseInt(id.replace('poke-', ''));
        const p = ownedPokemon.find(p => p.pokemonId === pokemonId);
        return p ? { name: p.name, element: p.types?.[0] || 'NORMAL', image: p.image } : null;
      } else if (id.startsWith('fused-')) {
        const fusedId = parseInt(id.replace('fused-', ''));
        const f = fusedPokemon.find(f => f.pokemonId === fusedId);
        return f ? { name: f.name, element: f.element, image: f.image } : null;
      } else if (id.startsWith('jp-')) {
        const cardIdOnly = id.replace('jp-', '');
        const oc = ownedCards.find(o => o.cardId === cardIdOnly);
        return oc ? { name: oc.card.japanese, element: oc.card.element } : null;
      }
      return null;
    }).filter(Boolean);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#0d0d1a' }}>
      <div className="flex items-center gap-4 p-4 border-b border-white/10">
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h2 className="text-lg font-black text-white flex-1">📋 Pilih Deck</h2>
        <button onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1a1a2e' }}>
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {validDecks.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🃏</div>
            <p className="text-white/40 text-sm mb-2">Belum punya deck</p>
            <p className="text-white/20 text-xs mb-6">Buat deck baru dengan minimal 3 kartu</p>
            <button onClick={onNewDeck}
              className="px-6 py-3 rounded-xl bg-[#6c5ce7] text-white font-bold text-sm">
              + Buat Deck Pertama
            </button>
          </div>
        )}

        {validDecks.map(deck => {
          const preview = getDeckPreview(deck);
          const isActive = deck.id === activeDeckId;
          return (
            <div key={deck.id} className="rounded-2xl p-4" style={{ backgroundColor: '#1a1a2e', border: isActive ? '2px solid #6c5ce7' : '2px solid transparent' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-white">{deck.name}</p>
                  <p className="text-xs text-white/40">{deck.cardIds.length} kartu{isActive ? ' • ACTIVE' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onEditDeck(deck.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/60 border border-white/20">
                    ✏️ Edit
                  </button>
                  <button onClick={() => onSelectDeck(deck.id)}
                    className="px-4 py-1.5 rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: '#6c5ce7' }}>
                    Pilih
                  </button>
                </div>
              </div>
              {preview.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {preview.map((card: any, i: number) => (
                    <div key={i} className="flex-shrink-0 w-10 h-12 rounded-lg flex items-center justify-center overflow-hidden" style={{ backgroundColor: (ELEMENT_COLORS[card.element] || '#aaa') + '30' }}>
                      {card.image ? (
                        <img src={card.image} alt={card.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-lg" style={{ color: ELEMENT_COLORS[card.element] || '#aaa' }}>⬡</span>
                      )}
                    </div>
                  ))}
                  {deck.cardIds.length > 5 && <span className="text-xs text-white/30 self-center">+{deck.cardIds.length - 5}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {validDecks.length > 0 && (
        <div className="p-4 border-t border-white/10">
          <button onClick={onNewDeck}
            className="w-full py-3 rounded-xl text-sm font-bold text-white/60 border border-dashed border-white/20">
            + Buat Deck Baru
          </button>
        </div>
      )}
    </div>
  );
}

function DeckEditScreen({ deckId, onBack }: { deckId: string; onBack: () => void }) {
  const router = useRouter();
  const { decks, ownedCards, ownedPokemon, fusedPokemon, updateDeck } = useCollectionStore();
  const deck = decks.find(d => d.id === deckId);

  const [name, setName] = useState(deck?.name || '');
  const [selectedIds, setSelectedIds] = useState<string[]>(deck?.cardIds || []);

  if (!deck) return null;

  // Collect all available cards
  const availableCards: { id: string; name: string; element: string; image?: string; type: 'poke' | 'fused' | 'jp' }[] = [];

  ownedPokemon.forEach(p => {
    availableCards.push({
      id: `poke-${p.pokemonId}`,
      name: p.name,
      element: p.types?.[0] || 'NORMAL',
      image: p.image,
      type: 'poke',
    });
  });

  fusedPokemon.forEach(f => {
    availableCards.push({
      id: `fused-${f.pokemonId}`,
      name: f.name,
      element: f.element,
      image: f.image,
      type: 'fused',
    });
  });

  ownedCards.forEach(oc => {
    availableCards.push({
      id: `jp-${oc.cardId}`,
      name: oc.card.japanese,
      element: oc.card.element,
      type: 'jp',
    });
  });

  const toggleCard = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = () => {
    if (!name.trim() || selectedIds.length < 3) return;
    updateDeck(deckId, selectedIds);
    onBack();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#0d0d1a' }}>
      <div className="flex items-center gap-4 p-4 border-b border-white/10">
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nama deck..."
          className="flex-1 bg-transparent text-lg font-bold text-white outline-none placeholder:text-white/30"
        />
        <button onClick={handleSave} disabled={!name.trim() || selectedIds.length < 3}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
          style={{ backgroundColor: '#6c5ce7' }}>
          Simpan
        </button>
        <button onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1a1a2e' }}>
          ✕
        </button>
      </div>

      <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: '#1a1a2e' }}>
        <span className="text-xs text-white/40">{selectedIds.length} kartu dipilih</span>
        {selectedIds.length < 3 && <span className="text-xs text-red-400">(min. 3)</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-4 gap-2">
          {availableCards.map(card => {
            const sel = selectedIds.includes(card.id);
            return (
              <button key={card.id} onClick={() => toggleCard(card.id)}
                className={`relative rounded-xl p-2 flex flex-col items-center transition-all ${sel ? 'ring-2 ring-white' : ''}`}
                style={{ backgroundColor: (ELEMENT_COLORS[card.element] || '#aaa') + '20', border: `2px solid ${sel ? '#fff' : 'transparent'}` }}>
                {card.image ? (
                  <img src={card.image} alt={card.name} className="w-10 h-10 object-contain" />
                ) : (
                  <span className="text-2xl" style={{ color: ELEMENT_COLORS[card.element] || '#aaa' }}>⬡</span>
                )}
                <span className="text-[9px] text-white/60 mt-1 truncate w-full text-center">{card.name}</span>
                {sel && <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center"><span className="text-[8px] text-black font-bold">✓</span></div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NewDeckScreen({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { ownedCards, ownedPokemon, fusedPokemon, createDeck } = useCollectionStore();
  const [name, setName] = useState('');

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const availableCards: { id: string; name: string; element: string; image?: string }[] = [];

  ownedPokemon.forEach(p => {
    availableCards.push({
      id: `poke-${p.pokemonId}`,
      name: p.name,
      element: p.types?.[0] || 'NORMAL',
      image: p.image,
    });
  });

  fusedPokemon.forEach(f => {
    availableCards.push({
      id: `fused-${f.pokemonId}`,
      name: f.name,
      element: f.element,
      image: f.image,
    });
  });

  ownedCards.forEach(oc => {
    availableCards.push({
      id: `jp-${oc.cardId}`,
      name: oc.card.japanese,
      element: oc.card.element,
    });
  });

  const toggleCard = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleCreate = () => {
    if (!name.trim() || selectedIds.length < 3) return;
    createDeck(name.trim(), selectedIds);
    onBack();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: '#0d0d1a' }}>
      <div className="flex items-center gap-4 p-4 border-b border-white/10">
        <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nama deck baru..."
          className="flex-1 bg-transparent text-lg font-bold text-white outline-none placeholder:text-white/30"
        />
        <button onClick={handleCreate} disabled={!name.trim() || selectedIds.length < 3}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
          style={{ backgroundColor: '#6c5ce7' }}>
          Buat
        </button>
        <button onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#1a1a2e' }}>
          ✕
        </button>
      </div>

      <div className="px-4 py-2 flex items-center gap-2" style={{ backgroundColor: '#1a1a2e' }}>
        <span className="text-xs text-white/40">{selectedIds.length} kartu dipilih</span>
        {selectedIds.length < 3 && <span className="text-xs text-red-400">(min. 3)</span>}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {availableCards.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🃏</div>
            <p className="text-white/40 text-sm">Belum punya kartu</p>
            <p className="text-white/20 text-xs mt-1">Kumpulkan kartu dari battle atau toko</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {availableCards.map(card => {
              const sel = selectedIds.includes(card.id);
              return (
                <button key={card.id} onClick={() => toggleCard(card.id)}
                  className={`relative rounded-xl p-2 flex flex-col items-center transition-all ${sel ? 'ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: (ELEMENT_COLORS[card.element] || '#aaa') + '20', border: `2px solid ${sel ? '#fff' : 'transparent'}` }}>
                  {card.image ? (
                    <img src={card.image} alt={card.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <span className="text-2xl" style={{ color: ELEMENT_COLORS[card.element] || '#aaa' }}>⬡</span>
                  )}
                  <span className="text-[9px] text-white/60 mt-1 truncate w-full text-center">{card.name}</span>
                  {sel && <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center"><span className="text-[8px] text-black font-bold">✓</span></div>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function OpponentSelectModal({ onSelect, onClose, onBossBattle }: { onSelect: any; onClose: () => void; onBossBattle: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm mx-4 rounded-3xl overflow-hidden" style={{ background: '#0f1923', borderTop: '3px solid #6c5ce7' }}
        onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-xl font-black text-white text-center mb-1">🎯 Pilih Lawan</h2>
          <p className="text-xs text-white/40 text-center mb-4">Pilih opponent untuk battle</p>
          <div className="space-y-3">
            {OPPONENTS.map((opp, i) => (
              <button key={i} onClick={() => onSelect(opp)}
                className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
                style={{ backgroundColor: '#1a1a2e' }}>
                <span className="text-4xl">{opp.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-bold text-white">{opp.name}</p>
                  <p className="text-xs text-white/40">Level {opp.level} • HP {opp.hp} • ATK {opp.atk}</p>
                </div>
                <span style={{ color: '#6c5ce7' }}>›</span>
              </button>
            ))}
          </div>
          <button onClick={onBossBattle}
            className="w-full mt-4 p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
            style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1a1a 100%)', border: '2px solid #ff6b3560' }}>
            <span className="text-4xl">🐉</span>
            <div className="flex-1 text-left">
              <p className="font-bold text-white">Boss Battle</p>
              <p className="text-xs text-white/40">Kalahkan boss, dapat Japanese card!</p>
            </div>
            <span style={{ color: '#ff6b35' }}>›</span>
          </button>
        </div>
        <button onClick={onClose} className="w-full py-4 border-t border-white/10 text-white/40 text-sm font-bold">Batal</button>
      </motion.div>
    </motion.div>
  );
}

function BossSelectModal({ onSelect, onClose, battleWins, defeatedBosses }: { onSelect: (boss: Boss) => void; onClose: () => void; battleWins: number; defeatedBosses: string[] }) {
  const BOSS_UNLOCK_REQUIREMENT = 5; // need 5 wins to access boss battle
  const canFight = battleWins >= BOSS_UNLOCK_REQUIREMENT;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[55] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-md mx-4 rounded-3xl overflow-hidden" style={{ background: '#0f1923', borderTop: '3px solid #ff6b35' }}
        onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="text-center mb-1">
            <h2 className="text-xl font-black text-white">🐉 Boss Battle</h2>
            <p className="text-xs text-white/40 mt-1">Kalahkan boss dan dapatkan Japanese Card!</p>
            {!canFight && (
              <div className="mt-3 px-4 py-2 rounded-xl" style={{ backgroundColor: '#ff6b3520' }}>
                <p className="text-sm text-orange-400 font-bold">🔒 Perlu {BOSS_UNLOCK_REQUIREMENT} wins untuk akses Boss Battle</p>
                <p className="text-xs text-white/40 mt-1">Kamu baru punya {battleWins} win</p>
              </div>
            )}
            {canFight && (
              <p className="text-xs text-green-400 mt-2">✅ Kamu punya akses Boss Battle! ({battleWins} wins)</p>
            )}
          </div>

          {canFight ? (
            <div className="mt-4 space-y-3">
              {BOSSES.map((boss) => {
                const isDefeated = defeatedBosses.includes(boss.id);
                return (
                  <button key={boss.id} onClick={() => onSelect(boss)}
                    className="w-full p-4 rounded-2xl flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-95"
                    style={{ backgroundColor: isDefeated ? '#1a1a2e80' : '#1a1a2e', border: isDefeated ? '2px solid #4bddb740' : '2px solid #ff6b3540' }}>
                    <span className="text-4xl">{boss.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white">{boss.name}</p>
                        {isDefeated && <span className="text-xs px-2 py-0.5 rounded-full bg-green-600/30 text-green-400 font-bold">DEFEATED</span>}
                      </div>
                      <p className="text-xs text-white/40">{boss.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-orange-400">⚔️ Lv.{boss.level}</span>
                        <span className="text-xs text-red-400">❤️ {boss.maxHp} HP</span>
                        <span className="text-xs text-amber-400">✨ {boss.rewardStardust} Stardust</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        {boss.phases.map((p, i) => (
                          <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/50">{p.name}</span>
                        ))}
                      </div>
                    </div>
                    {isDefeated ? (
                      <span className="text-green-400 text-xl">✓</span>
                    ) : (
                      <span style={{ color: '#ff6b35' }}>›</span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {BOSSES.map((boss) => (
                <div key={boss.id} className="rounded-xl p-2 flex flex-col items-center" style={{ backgroundColor: '#1a1a2e60' }}>
                  <span className="text-2xl opacity-30">{boss.emoji}</span>
                  <span className="text-[8px] text-white/30 mt-1">{boss.name.split(' ')[0]}</span>
                  <span className="text-[8px] text-orange-400/30">🔒</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <button onClick={onClose} className="w-full py-4 border-t border-white/10 text-white/40 text-sm font-bold">Kembali</button>
      </motion.div>
    </motion.div>
  );
}

function BossResultModal({ boss, win, xp, diamonds, stardust, onClose }: { boss: Boss; win: boolean; xp: number; diamonds: number; stardust: number; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.6, y: 30 }} animate={{ scale: 1, y: 0 }} className="text-center max-w-sm w-full mx-4">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: win ? 1.5 : 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-8xl mb-4">{win ? '🏆' : '💀'}</motion.div>

        <h2 className="text-3xl font-black text-white mb-1">{win ? 'VICTORY!' : 'DEFEAT'}</h2>
        <p className="text-white/60 text-sm mb-4">vs {boss.name}</p>

        {win ? (
          <>
            <div className="rounded-2xl p-4 mb-4" style={{ backgroundColor: '#1a1a2e', border: '2px solid #ff6b3560' }}>
              <p className="text-sm text-white/40 mb-2">🏆 Boss Rewards</p>
              <div className="space-y-1">
                <p className="text-white font-bold">+{xp} XP</p>
                <p className="text-amber-400 font-bold">+{diamonds} 💎</p>
                <p className="text-orange-400 font-bold">+{stardust} ✨ Stardust</p>
              </div>
            </div>

            <div className="rounded-2xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1a3e 100%)', border: '2px solid #c77dff60' }}>
              <p className="text-2xl mb-1">🎁</p>
              <p className="text-purple-400 font-black text-sm">Japanese Card obtained!</p>
              <p className="text-white/40 text-xs mt-1">Check your collection to see the card</p>
            </div>

            <p className="text-xs text-green-400 font-bold">✅ Boss defeated! Badge earned.</p>
          </>
        ) : (
          <p className="text-white/60 mb-4">Coba lagi! Study boss patterns and build a stronger deck.</p>
        )}

        <button onClick={onClose}
          className="mt-4 px-8 py-3 rounded-2xl bg-[#ff6b35] text-white font-bold active:scale-95 hover:bg-[#ff5722] transition-colors">
          {win ? 'Claim Rewards!' : 'Try Again'}
        </button>
      </motion.div>
    </motion.div>
  );
}

function ResultModal({ win, xpGained, diamondsGained, stardustGained, onClose }: { win: boolean; xpGained: number; diamondsGained?: number; stardustGained?: number; onClose: () => void }) {
  const ELEMENT_ICONS: Record<string, string> = {
    FIRE_ESSENCE: '🔥', WATER_ESSENCE: '💧', GRASS_ESSENCE: '🌿',
    ELECTRIC_ESSENCE: '⚡', PSYCHIC_ESSENCE: '🔮', NORMAL_ESSENCE: '⚪',
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center p-8 max-w-sm w-full">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-7xl mb-4">{win ? '🏆' : '💀'}</motion.div>
        <h2 className="text-3xl font-black text-white mb-2">{win ? 'VICTORY!' : 'DEFEAT'}</h2>
        {win ? (
          <div className="space-y-2 mb-4">
            <p className="text-white/60">+{xpGained} XP earned!</p>
            {diamondsGained && diamondsGained > 0 && (
              <p className="text-cyan-400 font-bold">+{diamondsGained} 💎</p>
            )}
            {stardustGained && stardustGained > 0 && (
              <p className="text-amber-400 font-bold">+{stardustGained} ✨ Stardust</p>
            )}
          </div>
        ) : <p className="text-white/60 mb-4">Coba lagi!</p>}
        <button onClick={onClose} className="mt-4 px-8 py-3 rounded-2xl bg-[#6c5ce7] text-white font-bold active:scale-95">Lanjutkan</button>
      </motion.div>
    </motion.div>
  );
}

function HealModal({ card, onHeal, onSkip }: { card: BattleCard; onHeal: () => void; onSkip: () => void }) {
  const healAmount = Math.floor(card.maxHp * 0.25);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 max-w-md w-full">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">💚</div>
          <h3 className="text-xl font-bold text-white mb-1">Heal HP</h3>
          <p className="text-sm text-white/60">Kartu aktifmu: {card.name}</p>
          <p className="text-lg text-white mt-2">HP: {card.hp}/{card.maxHp}</p>
          <p className="text-green-400 font-bold mt-1">+{healAmount} HP</p>
        </div>
        <div className="space-y-3">
          <button onClick={onHeal}
            className="w-full p-4 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold text-lg transition-colors flex items-center justify-center gap-2">
            💚 Heal (+{healAmount} HP)
          </button>
          <button onClick={onSkip}
            className="w-full p-4 bg-[#2d2d44] hover:bg-[#3d3d54] rounded-xl text-white/70 font-bold transition-colors">
            Lewati
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Move Selection Modal - Choose a move from PokeAPI
// ============================================================
function MoveSelectionModal({
  card,
  isBossBattle,
  onSelect,
  onCancel,
}: {
  card: BattleCard;
  isBossBattle: boolean;
  onSelect: (move: BattleMove | null, isStatus: boolean) => void;
  onCancel: () => void;
}) {
  const [selectedMove, setSelectedMove] = useState<BattleMove | null>(null);

  // When card has PokeAPI moves, show them; otherwise show placeholder slots
  const availableMoves: BattleMove[] = card.moves && card.moves.length > 0
    ? card.moves.slice(0, 4)
    : getMockMovesForTypes([card.element.toLowerCase()]).map((m, i) => ({
        ...m,
        name: `Move ${i + 1}`,
        power: Math.floor(card.attack * (0.8 + i * 0.15)),
        accuracy: 90,
        pp: 15,
        category: i < 2 ? 'physical' : 'special',
        description: 'A reliable move.',
        drain: 0,
        recoil: 0,
        priority: 0,
      }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 backdrop-blur-sm p-4 pb-8"
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#0f0f1a', border: '1px solid #ffffff20' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-black text-white text-base">🎯 Pilih Move</h3>
            <p className="text-white/40 text-xs">{card.name} — {card.moves?.length ? `${card.moves.length} moves from PokeAPI` : 'default moves'}</p>
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1a1a2e' }}>
            <span className="text-white/60 text-sm">✕</span>
          </button>
        </div>

{/* Moves list */}
        <div className="p-3 space-y-2 max-h-[55vh] overflow-y-auto">
          {availableMoves.map((move, i) => {
            const typeColor = MOVE_TYPE_COLORS[move.type] || '#a8a8a8';
            const catIcon = MOVE_CATEGORY_ICONS[move.category] || '💥';
            const isStatus = move.category === 'status' || move.power === 0;
            const effectiveness = isBossBattle
              ? getMoveEffectiveness(move.type, 'NORMAL')
              : getMoveEffectiveness(move.type, card.element);
            const effLabel = effectiveness > 1 ? '🟥 Super Effective!' : effectiveness < 1 ? '🟦 Not Effective' : null;
            // Normalize power for visual bar (0-150 range)
            const powerPct = Math.min(100, (move.power / 120) * 100);

            return (
              <motion.button
                key={`${move.id}-${i}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07, type: 'spring', stiffness: 300 }}
                onClick={() => setSelectedMove(move)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all relative overflow-hidden ${
                  selectedMove?.id === move.id ? 'ring-2 ring-white' : ''
                }`}
                style={{ background: `linear-gradient(135deg, ${typeColor}15 0%, ${typeColor}05 100%)`, border: `1px solid ${selectedMove?.id === move.id ? '#ffffff80' : typeColor + '50'}`, backdropFilter: 'blur(8px)' }}
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: typeColor }} />

                {/* Type badge */}
                <motion.div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 relative"
                  style={{ backgroundColor: typeColor }}
                  whileHover={{ scale: 1.08 }}
                >
                  <span className="text-[9px] font-bold text-white/80 uppercase">{move.type.slice(0, 3)}</span>
                  <span className="text-xs font-black text-white">{catIcon}</span>
                </motion.div>

                <div className="flex-1 min-w-0 pl-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{move.name}</span>
                    {isStatus && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/30 text-blue-300 font-bold">STATUS</span>}
                    {move.priority > 0 && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-500/30 text-yellow-300 font-bold">PRIORITY</span>}
                    {effLabel && <span className="text-[9px] text-orange-400 font-bold">{effLabel}</span>}
                  </div>

                  {/* Power bar */}
                  {move.power > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] text-red-400 font-bold w-8">💥 {move.power}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-black/40 overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${powerPct}%` }}
                          transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                          style={{ background: `linear-gradient(90deg, ${typeColor}, ${typeColor}aa)` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-3 mt-0.5">
                    {move.accuracy > 0 && (
                      <span className="text-[10px] text-white/40 flex items-center gap-0.5">
                        <span className={move.accuracy < 70 ? 'text-orange-400' : 'text-white/40'}>⚖️ {move.accuracy}%</span>
                      </span>
                    )}
                    <span className="text-[10px] text-white/30">PP {move.pp}</span>
                    {move.critRate > 0 && (
                      <span className="text-[10px] text-pink-400">💥 {move.critRate}% crit</span>
                    )}
                    {move.recoil > 0 && (
                      <span className="text-[10px] text-orange-400/70">⚡ {move.recoil}% recoil</span>
                    )}
                    {move.drain > 0 && (
                      <span className="text-[10px] text-green-400/70">💚 {move.drain}% drain</span>
                    )}
                  </div>

                  {move.description && (
                    <p className="text-[9px] text-white/25 mt-0.5 italic leading-tight line-clamp-1">{move.description}</p>
                  )}
                </div>

                {/* Selection indicator */}
                {selectedMove?.id === move.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: typeColor }}
                  >
                    <span className="text-sm">✅</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Confirm/Cancel buttons */}
        <div className="p-3 border-t border-white/10 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white/60 border border-white/20"
          >
            Batal
          </button>
          <button
            onClick={() => onSelect(selectedMove, selectedMove ? selectedMove.category === 'status' || selectedMove.power === 0 : false)}
            disabled={!selectedMove}
            className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#ff6b35] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {selectedMove ? `Gunakan ${selectedMove.name}!` : 'Pilih Move'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Card in hand (mini)
function HandCard({ card, idx, sel, onClick, disabled }: { card: BattleCard; idx: number; sel: boolean; onClick: () => void; disabled: boolean }) {
  const col = ELEMENT_COLORS[card.element];
  const hpPct = card.hp / card.maxHp;
  const abilityStyle = getAbilityStyle(card.ability || '');
  const moveCount = card.moves?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: idx * 0.06, type: 'spring', stiffness: 350, damping: 25 }}
      whileHover={disabled ? {} : { y: -14, scale: 1.08 }}
      whileTap={disabled ? {} : { scale: 0.94 }}
      onClick={disabled ? undefined : onClick}
      className={`relative w-[70px] h-[96px] rounded-xl p-1.5 flex flex-col items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
        sel ? 'ring-2 ring-white shadow-2xl z-10' : ''
      } ${disabled ? 'opacity-35' : ''}`}
      style={{
        background: sel
          ? `linear-gradient(135deg, ${col}30 0%, #1a1a2e 100%)`
          : `linear-gradient(135deg, #1a1a2e 0%, ${col}15 100%)`,
        border: `2px solid ${sel ? '#ffffff90' : col + '50'}`,
        boxShadow: sel
          ? `0 0 20px ${col}60, 0 0 40px ${col}30, inset 0 0 15px ${col}15`
          : `0 4px 12px ${col}20`,
      }}
    >
      {/* Element glow ring behind card */}
      {sel && (
        <motion.div
          className="absolute inset-0 rounded-xl -z-10"
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ background: `radial-gradient(circle, ${col}25 0%, transparent 70%)` }}
        />
      )}

      {/* Cost badge */}
      <div
        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-lg font-black text-[9px]"
        style={{ backgroundColor: col, color: '#fff' }}
      >
        {card.cost}
      </div>

      {/* Move count badge */}
      <div
        className="absolute top-1 left-1 px-1 py-0.5 rounded-full text-[7px] font-bold flex items-center gap-0.5"
        style={{ backgroundColor: '#0f0f1aee', color: moveCount > 0 ? '#4bddb7' : '#666' }}
        title={moveCount > 0 ? `${moveCount} PokeAPI moves` : 'No moves loaded'}
      >
        {moveCount > 0 ? `⚡${moveCount}` : '—'}
      </div>

      {/* Card image */}
      <motion.div className="relative mt-1" whileHover={{ scale: 1.1 }} transition={{ type: 'spring', stiffness: 400 }}>
        {card.image ? (
          <img src={card.image} alt={card.name} className="w-11 h-11 object-contain drop-shadow-lg" />
        ) : (
          <span className="text-3xl" style={{ color: col, filter: `drop-shadow(0 0 6px ${col}80)` }}>⬡</span>
        )}
        {/* Element dot indicator */}
        <div
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full border border-black/40"
          style={{ backgroundColor: col, boxShadow: `0 0 4px ${col}` }}
        />
      </motion.div>

      {/* Name */}
      <span className="text-[8px] text-white/70 capitalize mt-1 truncate w-full text-center font-semibold leading-tight">
        {card.name.split(' ')[0]}
      </span>

      {/* HP bar */}
      <div className="w-full mt-1 h-1.5 rounded-full bg-black/50 overflow-hidden ring-1 ring-white/10">
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${hpPct * 100}%` }}
          transition={{ type: 'spring', stiffness: 300 }}
          style={{
            backgroundColor: hpPct > 0.5 ? '#4bddb7' : hpPct > 0.25 ? '#ffd93d' : '#ff6b35',
            boxShadow: `0 0 4px ${hpPct > 0.5 ? '#4bddb7' : hpPct > 0.25 ? '#ffd93d' : '#ff6b35'}60`,
          }}
        />
      </div>

      {/* ATK/DEF row */}
      <div className="flex items-center gap-1 text-[8px] mt-0.5">
        <span className="text-red-400 font-bold">⚔️{card.attack}</span>
        <span className="text-blue-400 font-bold">🛡️{card.defense}</span>
      </div>

      {/* Ability badge */}
      {card.ability && (
        <div
          className="absolute bottom-1 left-1 right-1 px-1 py-0.5 rounded text-[6px] font-bold flex items-center justify-center gap-0.5 truncate"
          style={{ backgroundColor: abilityStyle.bg, color: abilityStyle.text }}
          title={formatAbilityName(card.ability)}
        >
          <span>{abilityStyle.icon}</span>
          <span className="truncate">{abilityStyle.icon === '⭐' ? 'AB' : ''}</span>
        </div>
      )}

      <StatusBadge status={card.status} />
    </motion.div>
  );
}

// Animated Battle Background - Pokemon fighting scene
function BattleBackground({ phase, opponent, boss, attackingCard }: { phase: string; opponent?: any; boss?: Boss | null; attackingCard?: 'player' | 'opponent' | null }) {
  const isBoss = phase === 'boss-battle' || phase === 'boss-intro';
  const isBattle = phase === 'battle' || phase === 'boss-battle';
  const isIntro = phase === 'intro' || phase === 'boss-intro';

  // Pick background theme based on opponent/boss element
  const bgTheme = isBoss && boss ? boss.element.toLowerCase() : opponent?.element?.toLowerCase() || 'normal';
  const themes: Record<string, { primary: string; secondary: string; accent: string; particle: string }> = {
    fire: { primary: '#1a0505', secondary: '#2d0a0a', accent: '#ff6b35', particle: '🔥' },
    water: { primary: '#050a1a', secondary: '#0a1a2d', accent: '#4bddb7', particle: '💧' },
    grass: { primary: '#050a05', secondary: '#0a1a0a', accent: '#4bddb7', particle: '🍃' },
    electric: { primary: '#0a0a05', secondary: '#1a1a05', accent: '#ffd93d', particle: '⚡' },
    psychic: { primary: '#0a051a', secondary: '#150a2d', accent: '#c77dff', particle: '🔮' },
    normal: { primary: '#0d0d1a', secondary: '#1a1a2e', accent: '#6c5ce7', particle: '✨' },
  };
  const theme = themes[bgTheme] || themes.normal;

  return (
    <>
      {/* Base gradient background */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${theme.secondary} 0%, ${theme.primary} 60%, #0a0a12 100%)`,
        }}
      />

      {/* Animated particles - floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl opacity-20"
            initial={{
              x: `${10 + (i * 73) % 80}%`,
              y: '110%',
              rotate: Math.random() * 360,
            }}
            animate={{
              y: ['110%', '-10%'],
              x: [`${10 + (i * 73) % 80}%`, `${10 + ((i * 73 + 40) % 80)}%`],
              rotate: [Math.random() * 360, Math.random() * 360 + 360],
            }}
            transition={{
              duration: 8 + (i % 4) * 2,
              repeat: Infinity,
              delay: i * 0.7,
              ease: 'linear',
            }}
          >
            {theme.particle}
          </motion.div>
        ))}
      </div>

      {/* Ground/platform effect */}
      {isBattle && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'linear-gradient(to top, rgba(108,92,231,0.15) 0%, transparent 100%)',
          }}
        >
          {/* Floating platform lights */}
          <div className="absolute bottom-8 left-1/4 w-32 h-1 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}50, transparent)` }} />
          <div className="absolute bottom-16 right-1/3 w-24 h-1 rounded-full" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}30, transparent)` }} />
        </motion.div>
      )}

      {/* Energy ripple effect during battle */}
      {isBattle && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border"
              style={{
                borderColor: `${theme.accent}20`,
                width: 200,
                height: 200,
                left: '50%',
                top: '50%',
                x: '-50%',
                y: '-50%',
              }}
              animate={{
                scale: [1, 2.5],
                opacity: [0.3, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                delay: i * 1.3,
              }}
            />
          ))}
        </div>
      )}

      {/* Large background Pokemon - visible behind battle area, positioned higher */}
      {isBattle && (opponent || boss) && (
        <motion.div
          className="absolute pointer-events-none"
          style={{
            top: '15%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '8rem',
            filter: 'blur(1px) brightness(0.08)',
            opacity: 0.08,
            zIndex: 1,
          }}
          animate={{
            y: [0, -15, 0],
            scale: [1, 1.03, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {boss?.emoji || opponent?.emoji}
        </motion.div>
      )}

      {/* Element glow ring behind background Pokemon */}
      {isBattle && (opponent || boss) && (
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            top: '15%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 100,
            height: 100,
            background: `radial-gradient(circle, ${theme.accent}12 0%, transparent 70%)`,
            zIndex: 1,
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Energy crackling lines during boss battle */}
      {isBoss && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-20"
              style={{
                background: 'linear-gradient(to bottom, transparent, #c77dff60, transparent)',
                left: `${15 + i * 18}%`,
                top: '0%',
              }}
              animate={{
                height: [0, 80, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      )}

      {/* Pulsing glow behind active battle area */}
      {isBattle && (
        <motion.div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 80,
            height: 80,
            left: '50%',
            top: '15%',
            x: '-50%',
            y: '-50%',
            background: `radial-gradient(circle, ${theme.accent}15 0%, transparent 70%)`,
          }}
          animate={{
            scale: [0.9, 1.1, 0.9],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />
      )}

      {/* Flash effect on attack */}
      <AnimatePresence>
        {(phase === 'battle' || phase === 'boss-battle') && attackingCard && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            style={{ backgroundColor: theme.accent }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Active card display
function ActiveCard({ card, isPlayer, attacking, hit }: { card: BattleCard; isPlayer: boolean; attacking?: boolean; hit?: boolean }) {
  const col = ELEMENT_COLORS[card.element];
  const hpPct = card.hp / card.maxHp;
  const abilityStyle = getAbilityStyle(card.ability || '');
  const moveCount = card.moves?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: attacking ? (isPlayer ? 20 : -20) : hit ? [0, -15, 15, -10, 10, 0] : 0,
      }}
      transition={attacking ? { duration: 0.15, ease: 'easeOut' } : hit ? { duration: 0.4 } : {}}
      className={`rounded-xl overflow-hidden relative ${isPlayer ? 'border-t-2' : 'border-b-2'}`}
      style={{
        borderColor: col,
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%)',
        boxShadow: `0 0 24px ${col}30, inset 0 0 30px ${col}08`,
      }}
    >
      {/* Elemental top/bottom glow line */}
      <div
        className="absolute left-0 right-0 h-0.5"
        style={{
          top: isPlayer ? 0 : 'auto',
          bottom: isPlayer ? 'auto' : 0,
          background: `linear-gradient(90deg, transparent, ${col}, transparent)`,
          boxShadow: `0 0 12px ${col}`,
        }}
      />

      <div className="p-2 flex items-center gap-2">
        {/* Card sprite area with glow */}
        <div className="relative">
          <motion.div
            className="w-14 h-16 rounded-lg flex items-center justify-center overflow-hidden relative"
            style={{ backgroundColor: col + '18' }}
            animate={attacking ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.2 }}
          >
            {card.image ? (
              <img src={card.image} alt={card.name} className="w-12 h-12 object-contain" style={{ filter: `drop-shadow(0 0 8px ${col}60)` }} />
            ) : (
              <span className="text-4xl" style={{ color: col, filter: `drop-shadow(0 0 8px ${col}80)` }}>⬡</span>
            )}
            {/* Pulsing element aura behind sprite */}
            <motion.div
              className="absolute inset-0 rounded-lg -z-10"
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ background: `radial-gradient(circle, ${col}30 0%, transparent 70%)` }}
            />
          </motion.div>

          {/* Move count badge */}
          <div
            className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[8px] font-black flex items-center gap-0.5 shadow-lg"
            style={{ backgroundColor: col, color: '#fff' }}
            title={moveCount > 0 ? `${moveCount} PokeAPI moves available` : 'No PokeAPI moves'}
          >
            {moveCount > 0 ? `⚡${moveCount}` : '—'}
          </div>

          <StatusBadge status={card.status} />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-0.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-white capitalize">{card.name}</span>
              {card.ability && (
                <motion.div
                  className="px-1.5 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-0.5"
                  style={{ backgroundColor: abilityStyle.bg, color: abilityStyle.text }}
                  title={formatAbilityName(card.ability)}
                  whileHover={{ scale: 1.1 }}
                >
                  <span>{abilityStyle.icon}</span>
                  <span>{abilityStyle.icon !== '⭐' ? formatAbilityName(card.ability).split(' ')[0] : 'AB'}</span>
                </motion.div>
              )}
            </div>
            {/* Element badge */}
            <span
              className="text-[9px] px-2 py-0.5 rounded-full font-bold"
              style={{ backgroundColor: col + '25', color: col, border: `1px solid ${col}50` }}
            >
              {card.element}
            </span>
          </div>

          {/* ATK/DEF + Move count row */}
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-red-400 font-bold">⚔️ {card.attack}</span>
            <span className="text-blue-400 font-bold">🛡️ {card.defense}</span>
            {moveCount > 0 && (
              <span className="text-green-400/80 font-bold text-[9px]">✨ {moveCount} moves</span>
            )}
          </div>

          {/* HP bar with glow */}
          <div className="mt-1.5 h-2 rounded-full overflow-hidden bg-black/50 ring-1 ring-white/10">
            <motion.div
              className="h-full rounded-full relative"
              animate={{ width: `${hpPct * 100}%` }}
              transition={{ type: 'spring', stiffness: 300 }}
              style={{
                backgroundColor: hpPct > 0.5 ? '#4bddb7' : hpPct > 0.25 ? '#ffd93d' : '#ff6b35',
                boxShadow: `0 0 8px ${hpPct > 0.5 ? '#4bddb7' : hpPct > 0.25 ? '#ffd93d' : '#ff6b35'}80`,
              }}
            >
              {/* Shimmer on HP bar */}
              {hpPct > 0.3 && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }}
                />
              )}
            </motion.div>
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-[9px] text-white/50">{card.hp}/{card.maxHp} HP</span>
            {card.status && <span className="text-[9px] text-yellow-400">{card.status}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Main Component
// ============================================================
function BattlePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ownedPokemon, addCoins, addDiamonds, addStardust, addElementEssence, trackQuestEvent, addBattleWin, recordBossDefeat, addJapaneseCardFromBoss, battleWins, defeatedBosses } = useCollectionStore();
  const { addXP, incrementStat, totalWins, user } = useAuthStore();

  // Zustand ready check — prevent reading stale persisted state
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Battle mode: derive from URL search params
  const modeParam = searchParams.get('mode');
  const battleMode: 'card' | 'janken' | null = modeParam === 'janken' ? 'janken' : modeParam === 'card' ? 'card' : null;

  // Core state
  const [phase, setPhase] = useState<Phase>('select-deck');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [editDeckId, setEditDeckId] = useState<string | null>(null);
  const [showNewDeck, setShowNewDeck] = useState(false);
  const [opponent, setOpponent] = useState<any>(null);
  const [log, setLog] = useState<string[]>([]);

  // Boss battle state
  const [boss, setBoss] = useState<Boss | null>(null);
  const [bossHp, setBossHp] = useState(0);
  const [bossMaxHp, setBossMaxHp] = useState(0);
  const [bossPhase, setBossPhase] = useState(0);
  const [bossAtkMultiplier, setBossAtkMultiplier] = useState(1.0);
  const [bossDefMultiplier, setBossDefMultiplier] = useState(1.0);
  const [bossStatusEffects, setBossStatusEffects] = useState<Record<string, number>>({});
  const [burnStacks, setBurnStacks] = useState(0);
  const [playerBuffed, setPlayerBuffed] = useState(false);
  const [bossCharging, setBossCharging] = useState(false);
  const [bossBerserkCount, setBossBerserkCount] = useState(0);
  const [bossDeaths, setBossDeaths] = useState(0);
  
  // Player state
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);
  const [playerHand, setPlayerHand] = useState<BattleCard[]>([]);
  const [playerActive, setPlayerActive] = useState<BattleCard | null>(null);
  const [playerEnergy, setPlayerEnergy] = useState(3);
  
  // Opponent state
  const [oppHp, setOppHp] = useState(0);
  const [oppMaxHp, setOppMaxHp] = useState(0);
  const [oppActive, setOppActive] = useState<BattleCard | null>(null);
  const [oppEnergy, setOppEnergy] = useState(3);
  
  // Turn state
  const [turn, setTurn] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [combo, setCombo] = useState(0);
  const [lastElem, setLastElem] = useState<string | null>(null);
  
  // Timers
  const [battleTimeLeft, setBattleTimeLeft] = useState(120); // 2 min max battle
  const [cardSelectTimer, setCardSelectTimer] = useState(0);  // 5 sec card selection
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const battleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // UI state
  const [showDmg, setShowDmg] = useState(false);
  const [dmgVal, setDmgVal] = useState(0);
  const [attackingCard, setAttackingCard] = useState<'player' | 'opponent' | null>(null); // attack animation
  const [hitCard, setHitCard] = useState<'player' | 'opponent' | null>(null); // hit shake animation
  const [showStudy, setShowStudy] = useState(false); // ...
  const [studyQ, setStudyQ] = useState<{ q: string; opts: string[]; ans: string } | null>(null);
  const [result, setResult] = useState<{ win: boolean; xp: number; diamonds: number; stardust?: number } | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const [processing, setProcessing] = useState(false);
  // Move selection state — when a card is selected, player picks a move from PokeAPI
  const [moveCard, setMoveCard] = useState<BattleCard | null>(null);

  const logRef = useRef(0);
  const addLog = (txt: string) => setLog(prev => [...prev.slice(-5), `[${logRef.current++}] ${txt}`]);

// Refs for functions that need current values in callbacks
  const stateRef = useRef({
    phase, opponent, turn, isPlayerTurn, oppActive, oppHp, playerActive, playerHp, playerMaxHp, playerEnergy, combo, lastElem,
    processing, boss, bossHp, bossMaxHp, bossAtkMultiplier, bossDefMultiplier, bossPhase, bossDeaths,
    bossCharging, bossBerserkCount, burnStacks, playerBuffed, autoMode, playerHand,
  });
  useEffect(() => { stateRef.current = { phase, opponent, turn, isPlayerTurn, oppActive, oppHp, playerActive, playerHp, playerMaxHp, playerEnergy, combo, lastElem, processing, boss, bossHp, bossMaxHp, bossAtkMultiplier, bossDefMultiplier, bossPhase, bossDeaths, bossCharging, bossBerserkCount, burnStacks, playerBuffed, autoMode, playerHand }; }, [phase, opponent, turn, isPlayerTurn, oppActive, oppHp, playerActive, playerHp, playerMaxHp, playerEnergy, combo, lastElem, processing, boss, bossHp, bossMaxHp, bossAtkMultiplier, bossDefMultiplier, bossPhase, bossDeaths, bossCharging, bossBerserkCount, burnStacks, playerBuffed, autoMode, playerHand]);

  // Initialize hand — only after Zustand is ready (prevents stale persisted state)
  // and only when a deck has been selected
  useEffect(() => {
    if (!ready) return;
    if (!selectedDeckId) return; // Wait for deck selection

    const { ownedCards, ownedPokemon, fusedPokemon, decks } = useCollectionStore.getState();
    const selectedDeck = decks.find(d => d.id === selectedDeckId);

    if (selectedDeck && selectedDeck.cardIds.length > 0) {
      // Use deck cards for battle
      const battleCards: BattleCard[] = [];
      for (const cardId of selectedDeck.cardIds) {
        if (cardId.startsWith('poke-')) {
          const pokemonId = parseInt(cardId.replace('poke-', ''));
          // Check owned Pokemon first (REST API Pokemon)
          const poke = ownedPokemon.find(p => p.pokemonId === pokemonId);
          if (poke) battleCards.push(createBattleCard(poke, true));
        } else if (cardId.startsWith('fused-')) {
          // Handle fused Pokemon cards (fused-{pokemonId} e.g. fused-10001)
          const fusedId = parseInt(cardId.replace('fused-', ''));
          const fused = fusedPokemon.find(f => f.pokemonId === fusedId);
          if (fused) {
            battleCards.push(createBattleCard({
              id: `fused-${fused.pokemonId}`,
              pokemonId: fused.pokemonId,
              name: fused.name,
              types: fused.types,
              element: fused.element,
              image: fused.image,
              rarity: fused.rarity,
              // Map base stats to battle card fields
              hp: fused.baseHp,
              attack: fused.baseAttack,
              defense: fused.baseDefense,
              speed: fused.baseSpeed,
            }, true));
          }
        } else if (cardId.startsWith('jp-')) {
          // Handle Japanese starter cards (jp-{cardId} e.g. jp-jp_starter_1)
          const cardIdOnly = cardId.replace('jp-', '');
          const owned = ownedCards.find(oc => oc.cardId === cardIdOnly);
          if (owned) {
            battleCards.push(createBattleCard({
              id: cardId,
              name: owned.card.japanese,
              element: owned.card.element,
              hp: owned.card.hp,
              attack: owned.card.attackPower,
              defense: owned.card.defenseRating,
            }, true));
          }
        }
      }
      if (battleCards.length >= 3) {
        setPlayerHand(shuffle(battleCards));
        return;
      }
      // Not enough from deck — fallback to active deck or owned Pokemon
      const activeDeck = useCollectionStore.getState().getActiveDeck();
      if (activeDeck && activeDeck.cardIds.length >= 3) {
        // Fallback to active deck
        const fallbackCards: BattleCard[] = [];
        for (const cardId of activeDeck.cardIds) {
          if (cardId.startsWith('poke-')) {
            const pokemonId = parseInt(cardId.replace('poke-', ''));
            const poke = ownedPokemon.find(p => p.pokemonId === pokemonId);
            if (poke) fallbackCards.push(createBattleCard(poke, true));
          } else if (cardId.startsWith('jp-')) {
            const cardIdOnly = cardId.replace('jp-', '');
            const owned = ownedCards.find(oc => oc.cardId === cardIdOnly);
            if (owned) fallbackCards.push(createBattleCard({
              id: cardId,
              name: owned.card.japanese,
              element: owned.card.element,
              hp: owned.card.hp,
              attack: owned.card.attackPower,
              defense: owned.card.defenseRating,
            }, true));
          }
        }
        if (fallbackCards.length >= 3) {
          setPlayerHand(shuffle(fallbackCards));
          return;
        }
      }
      // Final fallback: use owned Pokemon
      if (ownedPokemon.length >= 3) {
        setPlayerHand(shuffle(ownedPokemon.slice(0, 5)).map(p => createBattleCard(p, true)));
        return;
      }
      // Fallback to demo
      useDemoDeck(setPlayerHand);
    } else {
      // No deck selected or empty deck
      useDemoDeck(setPlayerHand);
    }
  }, [ready, selectedDeckId]);

  // ============================================================
  // Battle Logic Functions
  // ============================================================

  // Reset card selection timer (call when turn changes or card selected)
  const resetCardTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCardSelectTimer(5);
    timerRef.current = setTimeout(() => {
      // Time's up — skip attack automatically
      const s = stateRef.current;
      const isBattle = s.phase === 'battle' || s.phase === 'boss-battle';
      if (s.isPlayerTurn && isBattle && !s.processing) {
        addLog(`⏰ Waktu habis! Skip attack...`);
        // Auto-select best card if in auto mode
        if (s.autoMode && s.playerHand.length > 0) {
          // Find best card by attack
          const sorted = [...s.playerHand].filter(c => c.hp > 0).sort((a, b) => b.attack - a.attack);
          const best = sorted[0];
          if (best && s.playerEnergy >= best.cost) {
            addLog(`🤖 Auto: pilih ${best.name}`);
            setTimeout(() => selectCard(s.playerHand.indexOf(best)), 100);
            return;
          }
        }
        // Otherwise defend
        setPlayerEnergy(0);
        setPlayerActive(null);
        if (s.phase === 'boss-battle') {
          doEndBossPlayerTurn();
        } else {
          doEndPlayerTurn();
        }
      }
    }, 5000);
  };
  const genQuestion = (card: BattleCard) => {
    const meanings = ['makan', 'minum', 'pergi', 'lihat', 'dengar', 'belajar', 'bekerja', 'bermain', 'tidur', 'bangun', 'duduk', 'berdiri', 'jatuh', 'naik', 'turun'];
    const name = card.name.toLowerCase();
    const wrong = shuffle(meanings.filter(m => m !== name)).slice(0, 3);
    const opts = shuffle([...wrong, name]);
    return { q: `Apa arti "${card.name}"?`, opts, ans: name };
  };

  // Start battle
  const startBattle = (opp: any) => {
    setOpponent(opp);
    setOppHp(opp.hp);
    setOppMaxHp(opp.hp);
    const level = user?.level || 1;
    const baseHp = 100 + (level - 1) * 10;
    setPlayerHp(baseHp);
    setPlayerMaxHp(baseHp);
    setPlayerEnergy(3);
    setOppEnergy(3);
    setTurn(1);
    setIsPlayerTurn(true);
    setCombo(0);
    setLastElem(null);
    setLog([]);
    setPlayerActive(null);
    setOppActive(null);
    setResult(null);
    setProcessing(false);
    setAutoMode(false);
    setBattleTimeLeft(120);
    setCardSelectTimer(0);
    
    addLog(`⚔️ Battle dimulai vs ${opp.name}!`);
    addLog('🎯 Pilih kartu dari tanganmu');
    setPhase('intro');
    
    // Start card selection timer
    resetCardTimer();
    
    setTimeout(() => setPhase('battle'), 1500);
  };

  const startBossBattle = (selectedBoss: Boss) => {
    resetBossState(); // Reset first (clears previous boss)
    setBoss(selectedBoss);
    setBossHp(selectedBoss.maxHp);
    setBossMaxHp(selectedBoss.maxHp);
    setBossPhase(0);
    setBossAtkMultiplier(1.0);
    setBossDefMultiplier(1.0);
    setBossStatusEffects({});
    setBurnStacks(0);
    setPlayerBuffed(false);
    setBossCharging(false);
    setBossBerserkCount(0);
    const level = user?.level || 1;
    const baseHp = 100 + (level - 1) * 10;
    setPlayerHp(baseHp);
    setPlayerMaxHp(baseHp);
    setPlayerEnergy(3);
    setOppEnergy(3);
    setTurn(1);
    setIsPlayerTurn(true);
    setCombo(0);
    setLastElem(null);
    setLog([]);
    setPlayerActive(null);
    setOppActive(null);
    setResult(null);
    setProcessing(false);
    setAutoMode(false);
    setBattleTimeLeft(180); // Boss battle = 3 min
    setCardSelectTimer(0);

    // addLog(`🐉 BOSS BATTLE vs ${selectedBoss.name}!`);
    addLog(`💀 ${selectedBoss.description}`);
    addLog('🎯 Pilih kartu dari tanganmu');
    setPhase('boss-intro');

    setTimeout(() => {
      setPhase('boss-battle');
      resetCardTimer();
    }, 2000);
  };

  // Select card from hand — now shows move selection modal
  const selectCard = (idx: number) => {
    if (!isPlayerTurn || processing) return;
    const card = playerHand[idx];
    if (!card || card.hp <= 0) return;

    if (playerActive?.id === card.id) {
      setPlayerActive(null);
      addLog(`❌ Batal memilih ${card.name}`);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    if (playerEnergy < card.cost) {
      addLog(`⚡ Tidak cukup energy! Butuh ${card.cost}, punya ${playerEnergy}`);
      return;
    }

    setPlayerEnergy(prev => prev - card.cost);
    setPlayerActive(card);
    addLog(`🃏 Pilih ${card.name} (${card.element}) ⚔️ ATK:${card.attack} 🛡️ DEF:${card.defense}`);

    // Clear card selection timer once card is chosen
    if (timerRef.current) clearTimeout(timerRef.current);
    setCardSelectTimer(0);

    // Show move selection modal (player picks which PokeAPI move to use)
    setMoveCard(card);
  };

  // Handle move selection from modal — then execute attack
  const handleMoveSelected = (move: BattleMove | null, isStatus: boolean) => {
    const s = stateRef.current;
    setMoveCard(null);

    if (!move || !s.playerActive) {
      // Cancelled or no move — deselect and end turn
      setPlayerActive(null);
      if (s.phase === 'boss-battle') {
        doEndBossPlayerTurn();
      } else {
        doEndPlayerTurn();
      }
      return;
    }

    // Store selected move in a ref for use in executePlayerAttack/executeBossPlayerAttack
    selectedMoveRef.current = move;
    addLog(`⚡ ${s.playerActive.name} gunakan ${move.name}!`);

    // Continue with attack execution (auto-triggered after modal closes via useEffect)
  };

  // Ref to hold selected move between selection and execution
  const selectedMoveRef = useRef<BattleMove | null>(null);

  // Answer heal (player) — heal action triggered instead of study
  const answerHeal = (chosen: 'heal' | 'skip') => {
    setShowStudy(false);
    if (!playerActive) {
      setTimeout(() => doEndPlayerTurn(), 300);
      return;
    }
    
    if (chosen === 'heal') {
      const healAmount = Math.floor(playerActive.maxHp * 0.25);
      const newHp = Math.min(playerActive.maxHp, playerActive.hp + healAmount);
      const healed: BattleCard = { ...playerActive, hp: newHp, status: 'normal' };
      setPlayerActive(healed);
      setPlayerHand(prev => prev.map(c => c.id === playerActive.id ? healed : c));
      addLog(`💚 ${playerActive.name} heal +${healAmount} HP!`);
    } else {
      addLog(`💨 Skip heal`);
    }
    setTimeout(() => doEndPlayerTurn(), 400);
  };

  // Player Defend action
  const handleDefend = () => {
    if (!isPlayerTurn || processing) return;
    setPlayerEnergy(0);
    addLog(`🛡️ Kamu bertahan! Defense +50%`);

    if (playerActive) {
      const def: BattleCard = { ...playerActive, status: 'defending' };
      setPlayerActive(def);
      setPlayerHand(prev => prev.map(c => c.id === playerActive.id ? def : c));
    }

    setTimeout(() => doEndPlayerTurn(), 500);
  };

  // Handle Heal — replace study action
  const handleHeal = () => {
    if (!playerActive || !isPlayerTurn || processing) return;
    if (playerEnergy < 1) {
      addLog(`⚡ Tidak cukup energy! Butuh 1, punya ${playerEnergy}`);
      return;
    }
    setPlayerEnergy(prev => prev - 1);
    setShowStudy(true); // reuse the modal pattern for heal confirmation
  };

  // ============================================================
  // BOSS BATTLE LOGIC
  // ============================================================

  // Check and apply burn damage at end of player turn
  const applyBurnDamage = () => {
    const s = stateRef.current;
    if (s.burnStacks > 0 && s.phase === 'boss-battle') {
      const burnDamage = s.burnStacks * 15;
      const actualBurn = Math.min(burnDamage, s.playerHp);
      if (actualBurn > 0) {
        const newHp = Math.max(0, s.playerHp - actualBurn);
        setPlayerHp(newHp);
        addLog(`🔥 Burn damage: -${actualBurn} HP`);
        if (newHp <= 0) {
          addLog(`💀 BURN KILL! DEFEAT!`);
          setResult({ win: false, xp: 0, diamonds: 0 });
          setPhase('boss-result');
          return true; // battle ended
        }
      }
    }
    return false; // battle continues
  };

  // Update boss phase based on HP %
  const checkBossPhaseTransition = () => {
    const s = stateRef.current;
    if (!s.boss) return;
    const hpPct = (s.bossHp / s.boss.maxHp) * 100;
    // Find current phase index
    let newPhaseIdx = 0;
    for (let i = s.boss.phases.length - 1; i >= 0; i--) {
      if (hpPct <= s.boss.phases[i].hpThreshold) {
        newPhaseIdx = i;
      }
    }
    if (newPhaseIdx !== s.bossPhase) {
      const newPhaseData = s.boss.phases[newPhaseIdx];
      setBossPhase(newPhaseIdx);
      setBossAtkMultiplier(newPhaseData.attackMultiplier);
      setBossDefMultiplier(newPhaseData.defenseMultiplier);
      addLog(`⚠️ BOSS ENTERS ${newPhaseData.name} PHASE!`);
      addLog(`💀 ${newPhaseData.specialDesc}`);
    }
  };

  // Boss turn execution
  const doBossTurn = () => {
    const s = stateRef.current;
    if (s.phase !== 'boss-battle') return;
    addLog(`🐉 ${s.boss?.name} giliran...`);

    setOppEnergy(3);

    const currentPhaseData = s.boss!.phases[s.bossPhase]!;
    const special = currentPhaseData.specialAbility;

    // If charging, release the charged attack
    if (s.bossCharging) {
      setBossCharging(false);
      // Charged attack = 200% damage
      const chargedDamage = Math.floor((s.boss?.baseAtk || 0) * 2 * s.bossAtkMultiplier);
      const actualDmg = Math.max(5, chargedDamage - (s.playerActive?.defense || 0));
      setDmgVal(actualDmg);
      setShowDmg(true);
      setAttackingCard('opponent');
      setTimeout(() => { setAttackingCard(null); setHitCard('player'); }, 300);
      setTimeout(() => {
        setShowDmg(false);
        const newHp = Math.max(0, s.playerHp - actualDmg);
        setPlayerHp(newHp);
        addLog(`💥 ${s.boss?.name} CHARGED ATTACK! -${actualDmg} damage!`);
        setTimeout(() => setHitCard(null), 400);
        if (newHp <= 0) {
          addLog(`💀 DEFEAT!`);
          setResult({ win: false, xp: 0, diamonds: 0 });
          setPhase('boss-result');
        } else {
          setTimeout(() => doEndBossTurn(), 500);
        }
      }, 700);
      return;
    }

    // Berserk: extra attack for next 3 turns
    if (special === 'BERSERK' && s.bossBerserkCount < 3) {
      // Do extra attack
      const baseDamage = Math.floor((s.boss?.baseAtk || 0) * 1.5 * s.bossAtkMultiplier);
      const actualDmg = Math.max(5, baseDamage - (s.playerActive?.defense || 0));
      setDmgVal(actualDmg);
      setShowDmg(true);
      setAttackingCard('opponent');
      setTimeout(() => { setAttackingCard(null); setHitCard('player'); }, 300);
      setTimeout(() => {
        setShowDmg(false);
        const newHp = Math.max(0, s.playerHp - actualDmg);
        setPlayerHp(newHp);
        addLog(`🔥 ${s.boss?.name} BERSERK! -${actualDmg} damage!`);
        setBossBerserkCount(c => c + 1);
        setTimeout(() => setHitCard(null), 400);
        if (newHp <= 0) {
          addLog(`💀 DEFEAT!`);
          setResult({ win: false, xp: 0, diamonds: 0 });
          setPhase('boss-result');
        } else {
          setTimeout(() => {
            // AI turn ends, berserk count is maintained
            setOppActive(null);
            setIsPlayerTurn(true);
            addLog(`🎯 Giliran ${stateRef.current.turn + 1} - pilih kartu!`);
            resetCardTimer();
          }, 500);
        }
      }, 700);
      return;
    }

    // Execute the special ability for this phase
    if (special === 'AOE') {
      const aoeDamage = currentPhaseData.name === 'Avalanche' ? 40 : currentPhaseData.name === 'Collapse' ? 60 : 25;
      const actualDmg = Math.floor(aoeDamage * s.bossAtkMultiplier);
      setDmgVal(actualDmg);
      setShowDmg(true);
      setAttackingCard('opponent');
      setTimeout(() => { setAttackingCard(null); setHitCard('player'); }, 300);
      setTimeout(() => {
        setShowDmg(false);
        const newHp = Math.max(0, s.playerHp - actualDmg);
        setPlayerHp(newHp);
        addLog(`💥 ${s.boss?.name} AoE ATTACK! -${actualDmg} damage!`);
        setTimeout(() => setHitCard(null), 400);
        if (newHp <= 0) {
          addLog(`💀 DEFEAT!`);
          setResult({ win: false, xp: 0, diamonds: 0 });
          setPhase('boss-result');
        } else {
          setTimeout(() => doEndBossTurn(), 500);
        }
      }, 700);
      return;
    }

    if (special === 'CHARGE') {
      setBossCharging(true);
      addLog(`⚡ ${s.boss?.name} charging...`);
      setTimeout(() => {
        addLog(`⚡ ${s.boss?.name} releases CHARGED ATTACK next turn!`);
        setTimeout(() => doEndBossTurn(), 500);
      }, 500);
      return;
    }

    if (special === 'HEAL') {
      const healAmount = Math.floor((s.boss?.maxHp || 0) * 0.15);
      const newBossHp = Math.min(s.boss?.maxHp || 0, s.bossHp + healAmount);
      setBossHp(newBossHp);
      addLog(`💚 ${s.boss?.name} heals +${healAmount} HP!`);
      checkBossPhaseTransition();
      setTimeout(() => doEndBossTurn(), 600);
      return;
    }

    if (special === 'DEBUFF') {
      // Reduce player defense by 20%
      addLog(`😈 ${s.boss?.name} debuffs you! ATK -20% for 2 turns`);
      setPlayerBuffed(true);
      setTimeout(() => doEndBossTurn(), 500);
      return;
    }

    if (special === 'BURN') {
      // Apply burn stacks
      setBurnStacks(3);
      addLog(`🔥 ${s.boss?.name} inflicts BURN! 15 dmg/turn for 3 turns`);
      setTimeout(() => doEndBossTurn(), 500);
      return;
    }

    // Default: normal attack
    const normalDamage = Math.floor((s.boss?.baseAtk || 50) * s.bossAtkMultiplier);
    const actualDmg = Math.max(5, normalDamage - (s.playerActive?.defense || 0));
    setDmgVal(actualDmg);
    setShowDmg(true);
    setAttackingCard('opponent');
    setTimeout(() => { setAttackingCard(null); setHitCard('player'); }, 300);
    setTimeout(() => {
      setShowDmg(false);
      const newHp = Math.max(0, s.playerHp - actualDmg);
      setPlayerHp(newHp);
      addLog(`💥 ${s.boss?.name} attacks! -${actualDmg} damage!`);
      setTimeout(() => setHitCard(null), 400);
      if (newHp <= 0) {
        addLog(`💀 DEFEAT!`);
        setResult({ win: false, xp: 0, diamonds: 0 });
        setPhase('boss-result');
      } else {
        setTimeout(() => doEndBossTurn(), 500);
      }
    }, 700);
  };

  // End boss turn
  const doEndBossTurn = () => {
    setOppActive(null);
    setIsPlayerTurn(true);
    addLog(`🎯 Giliran ${stateRef.current.turn + 1} - pilih kartu!`);
    resetCardTimer();
  };

  // End player turn (BOSS version)
  const doEndBossPlayerTurn = () => {
    const s = stateRef.current;
    console.log('[Boss Battle] endPlayerTurn');

    // Apply burn first
    if (s.burnStacks > 0) {
      const burnDmg = s.burnStacks * 15;
      const newHp = Math.max(0, s.playerHp - burnDmg);
      setPlayerHp(newHp);
      setBurnStacks(Math.max(0, s.burnStacks - 1));
      addLog(`🔥 Burn tick: -${burnDmg} HP (${s.burnStacks - 1} turns left)`);
      if (newHp <= 0) {
        addLog(`💀 DEFEAT!`);
        setResult({ win: false, xp: 0, diamonds: 0 });
        setPhase('boss-result');
        return;
      }
    }

    setPlayerActive(null);
    setIsPlayerTurn(false);
    setTurn(t => t + 1);

    setTimeout(() => {
      setPlayerEnergy(3);
      setTimeout(() => doBossTurn(), 600);
    }, 400);
  };

  // Boss player attack
  const executeBossPlayerAttack = () => {
    const s = stateRef.current;
    if (!s.playerActive || !s.isPlayerTurn || s.processing || s.phase !== 'boss-battle') return;
    setProcessing(true);

    // Use move power from PokeAPI if available, else fallback to card attack stat
    const move = selectedMoveRef.current;
    let basePower = move?.power || s.playerActive.attack;

    // Check move accuracy — miss chance
    const moveAccuracy = move?.accuracy ?? 100;
    const missed = moveAccuracy > 0 && Math.random() * 100 > moveAccuracy;
    let damage = missed ? 0 : basePower;

    // Apply player buff (debuff from boss)
    if (s.playerBuffed) {
      damage = Math.floor(damage * 0.8);
      addLog(`😈 Weakend: -20% damage`);
    }

    // Apply PokeAPI move type effectiveness
    if (move) {
      const eff = getMoveEffectiveness(move.type, 'NORMAL');
      if (eff > 1) damage = Math.floor(damage * eff);
      else if (eff < 1) damage = Math.floor(damage * eff);
      if (missed) addLog(`❌ ${s.playerActive!.name} attack missed!`);
      else if (eff > 1) addLog(`✨ SUPER EFFECTIVE vs BOSS! -${damage}`);
      else if (eff < 1) addLog(`💧 Not very effective vs BOSS... -${damage}`);
      else addLog(`⚔️ ${s.playerActive!.name} attacks! -${damage} to ${s.boss?.name}!`);
    } else {
      addLog(`⚔️ ${s.playerActive!.name} attacks! -${damage} to ${s.boss?.name}!`);
    }

    // Apply boss defense multiplier
    const defReduction = Math.floor((s.boss?.baseDef || 0) * s.bossDefMultiplier);
    damage = Math.max(5, damage - defReduction);

    // Berserk bonus from player
    const berserkBonus = s.bossBerserkCount > 0 ? Math.floor(damage * 0.5) : 0;
    if (berserkBonus > 0) {
      damage += berserkBonus;
      addLog(`🔥 BERSERK BONUS! +${berserkBonus} damage!`);
    }

    setDmgVal(damage);
    setShowDmg(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    setCardSelectTimer(0);
    setAttackingCard('player');
    setTimeout(() => { setAttackingCard(null); setHitCard('opponent'); }, 300);

    setTimeout(() => {
      setShowDmg(false);
      setProcessing(false);

      // Apply recoil damage to player
      if (move && move.recoil > 0 && !missed) {
        const recoilDmg = Math.floor(damage * move.recoil / 100);
        if (recoilDmg > 0) {
          setPlayerHp(prev => Math.max(0, prev - recoilDmg));
          addLog(`⚡ ${s.playerActive!.name} took ${recoilDmg} recoil damage!`);
        }
      }

      // Apply drain healing
      if (move && move.drain > 0 && !missed && s.playerActive) {
        const drainAmt = Math.floor(damage * move.drain / 100);
        if (drainAmt > 0) {
          const newHp = Math.min(s.playerActive.maxHp, s.playerActive.hp + drainAmt);
          setPlayerActive({ ...s.playerActive, hp: newHp });
          setPlayerHand(prev => prev.map(c => c.id === s.playerActive!.id ? { ...s.playerActive!, hp: newHp } : c));
          addLog(`💚 ${s.playerActive!.name} drained ${drainAmt} HP!`);
        }
      }

      // Clear selected move after use
      selectedMoveRef.current = null;

      const newBossHp = Math.max(0, s.bossHp - damage);
      setBossHp(newBossHp);

      // Check boss defeated
      if (newBossHp <= 0) {
        const bossReward = s.boss!;
        const xp = bossReward.level * 15;
        const stardust = bossReward.rewardStardust;
        const diamonds = bossReward.rewardDiamonds;

        addXP(xp);
        addCoins(xp);
        addDiamonds(diamonds);
        addStardust(stardust);
        addBattleWin();
        recordBossDefeat(bossReward.id);
        trackQuestEvent('BATTLE');
        incrementStat('battles');
        incrementStat('wins');

        addLog(`🏆 BOSS DEFEATED! +${xp} XP +${diamonds} 💎 +${stardust} ✨`);
        addLog(`🎁 Boss dropped: Japanese Card!`);

        // Award a random Japanese card
        const BONUS_CARDS: JapaneseCard[] = [
          { id: 'boss_card_fire', japanese: '炎', reading: 'ほのお', romaji: 'honoo', meaning: 'api', meaningId: 'api', type: 'NOUN', jlptLevel: 'N5', hp: 120, attackPower: 45, defenseRating: 25, specialAbility: 'Blaze', rarity: 'RARE', element: 'FIRE', cardArtUrl: '', exampleSentence: '炎は熱い', exampleTranslation: 'Api itu panas', tags: ['fire', 'element'] },
          { id: 'boss_card_water', japanese: '水', reading: 'みず', romaji: 'mizu', meaning: 'air', meaningId: 'air', type: 'NOUN', jlptLevel: 'N5', hp: 110, attackPower: 40, defenseRating: 30, specialAbility: 'Aqua', rarity: 'RARE', element: 'WATER', cardArtUrl: '', exampleSentence: '水を飲む', exampleTranslation: 'Minum air', tags: ['water', 'element'] },
          { id: 'boss_card_grass', japanese: '木', reading: 'き', romaji: 'ki', meaning: 'pohon', meaningId: 'pohon', type: 'NOUN', jlptLevel: 'N5', hp: 115, attackPower: 38, defenseRating: 35, specialAbility: 'Overgrow', rarity: 'RARE', element: 'GRASS', cardArtUrl: '', exampleSentence: '木が大きい', exampleTranslation: 'Pohonnya besar', tags: ['grass', 'element'] },
          { id: 'boss_card_electric', japanese: '電', reading: 'でん', romaji: 'den', meaning: 'listrik', meaningId: 'listrik', type: 'NOUN', jlptLevel: 'N5', hp: 105, attackPower: 50, defenseRating: 20, specialAbility: 'Voltaic', rarity: 'RARE', element: 'ELECTRIC', cardArtUrl: '', exampleSentence: '電気がない', exampleTranslation: 'Tidak ada listrik', tags: ['electric', 'element'] },
          { id: 'boss_card_psychic', japanese: '心', reading: 'こころ', romaji: 'kokoro', meaning: 'hati', meaningId: 'hati', type: 'NOUN', jlptLevel: 'N5', hp: 120, attackPower: 42, defenseRating: 28, specialAbility: 'Psychic', rarity: 'RARE', element: 'PSYCHIC', cardArtUrl: '', exampleSentence: '心を込めて', exampleTranslation: 'Dengan sepenuh hati', tags: ['psychic', 'soul'] },
        ];
        const randomCard = BONUS_CARDS[Math.floor(Math.random() * BONUS_CARDS.length)]!
        addJapaneseCardFromBoss(randomCard);

        setResult({ win: true, xp, diamonds, stardust });
        setPhase('boss-result');
        return;
      }

      // Check phase transition after damage
      checkBossPhaseTransition();

      setTimeout(() => doEndBossPlayerTurn(), 400);
    }, 700);
  };

  // ============================================================
  // REGULAR BATTLE AI LOGIC
  // ============================================================

  // AI Turn logic (called directly, not as callback)
  const doAITurn = () => {
    const s = stateRef.current;
    console.log('[AI] doAITurn called', { phase: s.phase, turn: s.turn, isPlayerTurn: s.isPlayerTurn, oppActive: s.oppActive?.id, oppHp: s.oppHp });

    // Handle boss battle - redirect to boss turn
    if (s.phase === 'boss-battle' && !s.isPlayerTurn) {
      doBossTurn();
      return;
    }

    if (s.phase !== 'battle') { console.log('[AI] Early return - phase not battle'); return; }
    addLog(`🤖 ${s.opponent?.name} giliran...`);
    
    setOppEnergy(3);

    // Pick opponent active card if none
    if (!s.oppActive) {
      const card: BattleCard = {
        id: `opp-${Date.now()}`, name: s.opponent.name, element: 'NORMAL',
        attack: s.opponent.atk, defense: s.opponent.def, hp: s.opponent.hp, maxHp: s.opponent.hp,
        cost: 1, status: 'normal',
      };
      setOppActive(card);
      addLog(`🤖 ${s.opponent.name} kirim ${card.name}!`);
      // Need to wait for state update, then call doAITurn again
      setTimeout(() => doAITurnInner(), 1000);
      return;
    }

    // Call inner AI logic (after card is set)
    doAITurnInner();
  };

  // AI decision and action
  const doAITurnInner = () => {
    const s = stateRef.current;
    if (!s.oppActive || !s.opponent) return;

    const strat = s.opponent.strategy;
    const rand = Math.random();
    let action: 'attack' | 'defend' | 'study' = 'attack';

    if (strat === 'aggressive') {
      action = rand < 0.8 ? 'attack' : rand < 0.9 ? 'study' : 'defend';
    } else if (strat === 'defensive') {
      action = rand < 0.3 ? 'attack' : rand < 0.7 ? 'defend' : 'study';
    } else if (strat === 'smart') {
      action = !s.playerActive ? 'attack' : rand < 0.4 ? 'defend' : rand < 0.7 ? 'attack' : 'study';
    } else {
      action = rand < 0.55 ? 'attack' : rand < 0.75 ? 'defend' : 'study';
    }

    if (action === 'attack') {
      doAIAttack();
    } else if (action === 'defend') {
      addLog(`🛡️ ${s.opponent.name} bertahan!`);
      const def: BattleCard = { ...s.oppActive, status: 'defending' };
      setOppActive(def);
      setTimeout(() => doEndAITurn(), 800);
    } else if (action === 'study') {
      // AI heal action — heal 25% of max HP
      const healAmount = Math.floor((s.oppActive?.maxHp || 100) * 0.25);
      const newHp = Math.min(s.oppActive?.maxHp || 100, (s.oppActive?.hp || 0) + healAmount);
      if (s.oppActive) {
        const healed: BattleCard = { ...s.oppActive, hp: newHp, status: 'normal' };
        setOppActive(healed);
        addLog(`💚 ${s.opponent.name} heal +${healAmount} HP!`);
      }
      setTimeout(() => doEndAITurn(), 800);
    }
  };

  // AI Attack
  const doAIAttack = () => {
    const s = stateRef.current;
    if (!s.oppActive) return;

    let damage = s.oppActive.attack;
    const eff = getElementAdvantage(s.oppActive.element, s.playerActive?.element || 'NORMAL');
    if (eff > 1) damage = Math.floor(damage * eff);
    else if (eff < 1) damage = Math.floor(damage * eff);

    if (s.playerActive) {
      const defReduction = s.playerActive.status === 'defending' ? Math.floor(s.playerActive.defense * 1.5) : s.playerActive.defense;
      damage = Math.max(5, damage - defReduction);
    }

    setDmgVal(damage);
    setShowDmg(true);
    // Animate opponent card attacking forward, then player card shake on hit
    setAttackingCard('opponent');
    setTimeout(() => {
      setAttackingCard(null);
      setHitCard('player');
      setTimeout(() => setHitCard(null), 400);
    }, 300);

    setTimeout(() => {
      setShowDmg(false);

      if (eff > 1) addLog(`✨ SUPER EFFECTIVE! -${damage}`);
      else addLog(`💥 ${s.opponent?.name} menyerang! -${damage} damage!`);

      // Damage to player active card
      if (s.playerActive) {
        const newHp = Math.max(0, s.playerActive.hp - damage);
        if (newHp <= 0) {
          addLog(`💀 ${s.playerActive.name} sudah fainted!`);
          setPlayerHand(prev => prev.filter(c => c.id !== s.playerActive!.id));
          setPlayerActive(null);
        } else {
          setPlayerActive({ ...s.playerActive, hp: newHp });
          setPlayerHand(prev => prev.map(c => c.id === s.playerActive!.id ? { ...s.playerActive!, hp: newHp } : c));
        }
      }

      // Damage to player overall HP — use functional update to get current state
      setPlayerHp(current => {
        const newPlayerHp = Math.max(0, current - Math.floor(damage * 0.3));
        if (newPlayerHp <= 0) {
          setTimeout(() => {
            setResult({ win: false, xp: 0, diamonds: 0 });
            addLog(`💀 DEFEAT!`);
            incrementStat('battles');
            setPhase('result');
          }, 50);
          return newPlayerHp;
        }
        setTimeout(() => doEndAITurn(), 500);
        return newPlayerHp;
      });
    }, 700);
  };

  // End AI turn
  const doEndAITurn = () => {
    console.log('[AI] endAITurn');
    setOppActive(null);
    setIsPlayerTurn(true);
    addLog(`🎯 Giliran ${stateRef.current.turn + 1} - pilih kartu!`);
    
    // Start card selection timer for new turn
    resetCardTimer();
  };

  // End player turn → AI turn
  const doEndPlayerTurn = () => {
    const s = stateRef.current;
    console.log('[Battle] endPlayerTurn');
    setPlayerActive(null);
    setIsPlayerTurn(false);
    setTurn(t => t + 1);

    // Redirect to boss turn handler if in boss battle
    if (s.phase === 'boss-battle') {
      // Apply burn at end of player turn
      if (s.burnStacks > 0) {
        const burnDmg = s.burnStacks * 15;
        const newHp = Math.max(0, s.playerHp - burnDmg);
        setPlayerHp(newHp);
        setBurnStacks(Math.max(0, s.burnStacks - 1));
        addLog(`🔥 Burn tick: -${burnDmg} HP (${s.burnStacks - 1} turns left)`);
        if (newHp <= 0) {
          addLog(`💀 DEFEAT!`);
          setResult({ win: false, xp: 0, diamonds: 0 });
          setPhase('boss-result');
          return;
        }
      }
      setTimeout(() => {
        setPlayerEnergy(3);
        setTimeout(() => doBossTurn(), 600);
      }, 400);
      return;
    }

    setTimeout(() => {
      setPlayerEnergy(3);
      setTimeout(() => doAITurn(), 600);
    }, 400);
  };

  // Execute player attack
  const executePlayerAttack = () => {
    const s = stateRef.current;
    console.log('[Battle] executePlayerAttack', { playerActive: s.playerActive?.id, isPlayerTurn: s.isPlayerTurn, processing: s.processing, oppActive: s.oppActive?.id, oppHp: s.oppHp });
    if (!s.playerActive || !s.isPlayerTurn || s.processing) return;
    setProcessing(true);

    // Use move power from PokeAPI if available, else fallback to card attack stat
    const move = selectedMoveRef.current;
    let basePower = move?.power || s.playerActive.attack;

    // Check move accuracy — miss chance
    const moveAccuracy = move?.accuracy ?? 100;
    const missed = moveAccuracy > 0 && Math.random() * 100 > moveAccuracy;
    const baseDamage = missed ? 0 : basePower;

    let damage = baseDamage;
    let effectiveness: 'super' | 'weak' | 'normal' = 'normal';

    // Apply PokeAPI move type effectiveness (full type chart)
    if (move && s.oppActive) {
      const eff = getMoveEffectiveness(move.type, s.oppActive.element);
      if (eff > 1) { effectiveness = 'super'; damage = Math.floor(damage * eff); }
      else if (eff < 1) { effectiveness = 'weak'; damage = Math.floor(damage * eff); }
    } else {
      const eff = getElementAdvantage(s.playerActive.element, s.oppActive?.element || 'NORMAL');
      if (eff > 1) { effectiveness = 'super'; damage = Math.floor(damage * eff); }
      else if (eff < 1) { effectiveness = 'weak'; damage = Math.floor(damage * eff); }
    }

    // Combo bonus
    if (s.lastElem === s.playerActive.element && s.lastElem !== null) {
      const bonus = Math.floor(damage * 0.25 * s.combo);
      damage += bonus;
      addLog(`🔥 Combo ${s.combo + 1}x! +${bonus} damage!`);
    }

    // Crit bonus from move
    const critBonus = move?.critRate ? (move.critRate > 0 && Math.random() * 100 < move.critRate ? Math.floor(damage * 0.5) : 0) : 0;
    if (critBonus > 0) {
      damage += critBonus;
      addLog(`💥 CRIT! +${critBonus} bonus damage!`);
    }

    if (s.oppActive) {
      const defReduction = s.oppActive.status === 'defending' ? Math.floor(s.oppActive.defense * 1.5) : s.oppActive.defense;
      damage = Math.max(5, damage - defReduction);
    }

    setDmgVal(damage);
    setShowDmg(true);
    // Clear card selection timer
    if (timerRef.current) clearTimeout(timerRef.current);
    setCardSelectTimer(0);
    // Animate player card attacking forward, then opponent card shake on hit
    setAttackingCard('player');
    setTimeout(() => {
      setAttackingCard(null);
      setHitCard('opponent');
      setTimeout(() => setHitCard(null), 400);
    }, 300);

    setTimeout(() => {
      setShowDmg(false);
      setProcessing(false);

      if (missed) addLog(`❌ ${s.playerActive!.name} attack missed!`);
      else if (effectiveness === 'super') addLog(`✨ SUPER EFFECTIVE! -${damage}`);
      else if (effectiveness === 'weak') addLog(`💧 Not very effective... -${damage}`);
      else addLog(`⚔️ ${s.playerActive!.name} menyerang! -${damage} damage!`);

      if (s.lastElem === s.playerActive!.element) setCombo(c => c + 1);
      else { setCombo(1); setLastElem(s.playerActive!.element); }

      const newOppHp = Math.max(0, s.oppHp - damage);
      setOppHp(newOppHp);

      // Apply recoil damage to player (move.recoil is % of damage taken by user)
      if (move && move.recoil > 0 && !missed) {
        const recoilDmg = Math.floor(damage * move.recoil / 100);
        if (recoilDmg > 0) {
          setPlayerHp(prev => Math.max(0, prev - recoilDmg));
          addLog(`⚡ ${s.playerActive!.name} took ${recoilDmg} recoil damage!`);
        }
      }

      // Apply drain healing to player
      if (move && move.drain > 0 && !missed) {
        const drainAmt = Math.floor(damage * move.drain / 100);
        if (drainAmt > 0 && s.playerActive) {
          const newHp = Math.min(s.playerActive.maxHp, s.playerActive.hp + drainAmt);
          setPlayerActive({ ...s.playerActive, hp: newHp });
          setPlayerHand(prev => prev.map(c => c.id === s.playerActive!.id ? { ...s.playerActive!, hp: newHp } : c));
          addLog(`💚 ${s.playerActive!.name} drained ${drainAmt} HP!`);
        }
      }

      // Clear selected move after use
      selectedMoveRef.current = null;

      if (newOppHp <= 0) {
        const xp = 10 + (s.opponent?.level || 1) * 5;
        const diamonds = 5 + (s.opponent?.level || 1) * 2;
        const stardustReward = 5 + (s.opponent?.level || 1) * 2;
        addCoins(xp);
        addDiamonds(diamonds);
        addStardust(stardustReward);

        // Award random element essence on victory (higher chance for higher level)
        const essenceTypes: ElementEssence[] = ['FIRE_ESSENCE', 'WATER_ESSENCE', 'GRASS_ESSENCE', 'ELECTRIC_ESSENCE', 'PSYCHIC_ESSENCE', 'NORMAL_ESSENCE'];
        if (Math.random() < 0.3 + (s.opponent?.level || 1) * 0.1) {
          const randomEssence = essenceTypes[Math.floor(Math.random() * essenceTypes.length)];
          addElementEssence(randomEssence, 1);
          addLog(`🏆 VICTORY! +${xp} XP +${diamonds} 💎 +${stardustReward} ✨ +1 ${randomEssence.replace('_ESSENCE', '')} 🌟`);
        } else {
          addLog(`🏆 VICTORY! +${xp} XP +${diamonds} 💎 +${stardustReward} ✨`);
        }

        addXP(xp);
        incrementStat('battles');
        incrementStat('wins');
        addBattleWin();
        setResult({ win: true, xp, diamonds, stardust: stardustReward });
        trackQuestEvent('BATTLE');
        return;
      }

      setTimeout(() => doEndPlayerTurn(), 400);
    }, 700);
  };

  // Back handler
  const handleBack = () => {
    if (phase === 'boss-battle' || phase === 'boss-intro') {
      setPhase('select-opponent');
      setBoss(null);
      resetBossState();
    } else if (phase === 'battle' || phase === 'intro') {
      setPhase('select-opponent');
      setOpponent(null);
    } else if (phase === 'select-opponent') {
      setPhase('select-deck');
      setOpponent(null);
    } else if (phase === 'boss-select') {
      setPhase('select-opponent');
    } else {
      router.push('/');
    }
  };

  const resetBossState = () => {
    setBoss(null);
    setBossHp(0);
    setBossMaxHp(0);
    setBossPhase(0);
    setBossAtkMultiplier(1.0);
    setBossDefMultiplier(1.0);
    setBossStatusEffects({});
    setBurnStacks(0);
    setPlayerBuffed(false);
    setBossCharging(false);
    setBossBerserkCount(0);
  };

  // Handle deck selection
  const handleSelectDeck = (deckId: string) => {
    setSelectedDeckId(deckId);
    setEditDeckId(null);
    setShowNewDeck(false);
    setPhase('select-opponent');
  };

  const handleEditDeck = (deckId: string) => {
    setEditDeckId(deckId);
    setShowNewDeck(false);
  };

  const handleNewDeck = () => {
    setEditDeckId(null);
    setShowNewDeck(true);
  };

  const handleDeckEditBack = () => {
    setEditDeckId(null);
    setShowNewDeck(false);
  };

  // Auto attack
  useEffect(() => {
    if (!autoMode || !isPlayerTurn || (phase !== 'battle' && phase !== 'boss-battle') || processing) return;
    if (!playerActive) {
      // Auto-select best card if none selected
      const best = [...playerHand].filter(c => c.hp > 0).sort((a, b) => (b.attack + b.defense) - (a.attack + a.defense))[0];
      const idx = playerHand.findIndex(c => c.id === best?.id);
      if (idx >= 0) {
        selectCard(idx);
      }
      return;
    }
    const timer = setTimeout(() => {
      if (phase === 'boss-battle') {
        executeBossPlayerAttack();
      } else {
        executePlayerAttack();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [autoMode, isPlayerTurn, phase, processing, playerActive, turn]);

  // Battle max 2 minutes timer
  useEffect(() => {
    if (phase !== 'battle' && phase !== 'boss-battle') return;
    battleTimerRef.current = setInterval(() => {
      setBattleTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up — battle ends in draw
          addLog(`⏰ Waktu battle habis!`);
          setResult({ win: false, xp: Math.floor(prev / 2), diamonds: 0 });
          incrementStat('battles');
          setPhase('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (battleTimerRef.current) clearInterval(battleTimerRef.current); };
  }, [phase]);

  // Card select countdown display (visual only — actual timeout in resetCardTimer)
  useEffect(() => {
    if (!isPlayerTurn || (phase !== 'battle' && phase !== 'boss-battle') || cardSelectTimer <= 0) return;
    const t = setInterval(() => setCardSelectTimer(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(t);
  }, [isPlayerTurn, phase, cardSelectTimer]);

  // Render Janken mode
  if (battleMode === 'janken') {
    return <JankenGame onBack={() => router.push('/battle')} />;
  }

  // Render mode selector when no mode is set
  if (!battleMode || (searchParams.get('mode') === null && phase === 'select-opponent' && !opponent)) {
    return (
      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0d0d1a' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-orange-900/10" />
        <button onClick={() => router.push('/')} className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <main className="relative z-10 flex flex-col items-center justify-center h-screen px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">⚔️ Battle</h1>
            <p className="text-white/40 text-sm">Pilih mode battle yang kamu mau!</p>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <button
              onClick={() => router.push('/battle?mode=card')}
              className="w-full p-6 rounded-2xl flex items-center gap-4 transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #162125 100%)', border: '2px solid #6c5ce760' }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: '#6c5ce730' }}>🃏</div>
              <div className="text-left">
                <p className="font-bold text-white text-lg">Battle Card</p>
                <p className="text-sm text-white/40">Kumpulkan deck, kalahkan lawan dengan kartu Pokemon!</p>
              </div>
              <span style={{ color: '#6c5ce7' }}>›</span>
            </button>

            <button
              onClick={() => router.push('/battle?mode=janken')}
              className="w-full p-6 rounded-2xl flex items-center gap-4 transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #162125 100%)', border: '2px solid #ff6b3560' }}
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: '#ff6b3530' }}>✌️</div>
              <div className="text-left">
                <p className="font-bold text-white text-lg">Janken</p>
                <p className="text-sm text-white/40">Batu Gunting Kertas — kalahkan bot dan dapat streak reward!</p>
              </div>
              <span style={{ color: '#ff6b35' }}>›</span>
            </button>
          </div>

          <p className="text-white/20 text-xs mt-8">Pilih salah satu mode untuk mulai</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0d0d1a' }}>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-orange-900/10" />

      {/* Animated Battle Background */}
      <BattleBackground phase={phase} opponent={opponent} boss={boss} attackingCard={attackingCard} />

      <button onClick={handleBack} className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>

      <AnimatePresence>
        {phase === 'select-deck' && !editDeckId && !showNewDeck && (
          <DeckSelectionScreen
            onSelectDeck={handleSelectDeck}
            onEditDeck={handleEditDeck}
            onNewDeck={handleNewDeck}
            onClose={() => router.push('/')}
          />
        )}
        {editDeckId && (
          <DeckEditScreen deckId={editDeckId} onBack={handleDeckEditBack} />
        )}
        {showNewDeck && (
          <NewDeckScreen onBack={handleDeckEditBack} />
        )}
        {phase === 'select-opponent' && <OpponentSelectModal onSelect={startBattle} onClose={() => setPhase('select-deck')} onBossBattle={() => setPhase('boss-select')} />}
        {phase === 'boss-select' && <BossSelectModal onSelect={(selectedBoss) => { startBossBattle(selectedBoss); }} onClose={() => setPhase('select-opponent')} battleWins={battleWins} defeatedBosses={defeatedBosses} />}
      </AnimatePresence>
      <AnimatePresence>{result && <ResultModal win={result.win} xpGained={result.xp} diamondsGained={result.diamonds} stardustGained={result.stardust} onClose={() => { setResult(null); setPhase('select-deck'); setSelectedDeckId(null); }} />}</AnimatePresence>
      <AnimatePresence>{showStudy && playerActive && <HealModal card={playerActive} onHeal={() => answerHeal('heal')} onSkip={() => answerHeal('skip')} />}</AnimatePresence>
      <AnimatePresence>{moveCard && <MoveSelectionModal card={moveCard} isBossBattle={phase === 'boss-battle'} onSelect={handleMoveSelected} onCancel={() => { setMoveCard(null); setPlayerActive(null); setPlayerEnergy(prev => prev + (moveCard?.cost || 1)); }} />}</AnimatePresence>

      {phase === 'intro' && opponent && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: '#0d0d1a' }}>
          <div className="text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5 }} transition={{ type: 'spring' }} className="text-7xl mb-4">{opponent.emoji}</motion.div>
            <h2 className="text-2xl font-black text-white mb-1">{opponent.name}</h2>
            <p className="text-white/40 mb-6">Level {opponent.level} • HP {opponent.hp} • ATK {opponent.atk}</p>
            <p className="text-white/60 animate-pulse">Battle starting...</p>
          </div>
        </motion.div>
      )}

      {phase === 'boss-intro' && boss && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-40 flex items-center justify-center" style={{ backgroundColor: '#0d0d1a' }}>
          <div className="text-center">
            <motion.div initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1.5, rotate: 0 }} transition={{ type: 'spring', stiffness: 200 }} className="text-8xl mb-4">{boss.emoji}</motion.div>
            <h2 className="text-2xl font-black text-white mb-1">{boss.name}</h2>
            <p className="text-red-400 font-bold mb-1">🐉 BOSS BATTLE</p>
            <p className="text-white/40 mb-2">Level {boss.level} • HP {boss.maxHp} • ATK {boss.baseAtk}</p>
            <p className="text-xs text-white/30 mb-4">{boss.description}</p>
            <div className="flex items-center justify-center gap-2 mb-4">
              {boss.phases.map((p, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">{p.name}</span>
              ))}
            </div>
            <p className="text-orange-400 text-sm animate-pulse">⚠️ Boss has special abilities!</p>
          </div>
        </motion.div>
      )}

      <main className="relative z-10 flex flex-col h-screen overflow-hidden">
        <div className="px-4 py-2 flex items-center justify-between" style={{ backgroundColor: '#162125' }}>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white">⚔️ Battle</span>
            {opponent && <span className="text-xs text-white/40">vs {opponent.name}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Turn: <span className="text-white font-bold">{turn}</span></span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isPlayerTurn ? 'bg-[#4bddb7] text-black' : 'bg-[#ff6b35] text-white'}`}>
              {isPlayerTurn ? 'Your Turn' : opponent?.name}
            </span>
          </div>
        </div>

        <div className="px-4 py-1.5 flex items-center gap-3" style={{ backgroundColor: '#1a1a2e' }}>
          <Zap className="w-4 h-4 text-yellow-400" />
          <div className="flex-1 flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-2 flex-1 rounded-full transition-all" style={{ backgroundColor: i < playerEnergy ? '#ffd93d' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
          <span className="text-xs font-bold" style={{ color: '#ffd93d' }}>{playerEnergy}/3</span>
          {combo > 1 && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#ff6b35] text-white">🔥 {combo}x</span>}
          
          {/* Card selection timer */}
          {isPlayerTurn && cardSelectTimer > 0 && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cardSelectTimer <= 2 ? 'bg-red-500 text-white animate-pulse' : 'bg-yellow-500/20 text-yellow-400'}`}>
              ⏱️ {cardSelectTimer}s
            </span>
          )}
          
          {/* Battle timer */}
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60">
            ⏰ {Math.floor(battleTimeLeft / 60)}:{(battleTimeLeft % 60).toString().padStart(2, '0')}
          </span>
          
          <button
            onClick={() => setAutoMode(prev => !prev)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${autoMode ? 'bg-[#4bddb7] text-black' : 'bg-white/10 text-white/60'}`}
          >
            AUTO {autoMode ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="flex-1 px-4 py-1 space-y-2 overflow-hidden">
          {/* BOSS BATTLE AREA - boss top, player/boss cards center, player HP left edge, boss HP right edge */}
          {phase === 'boss-battle' && boss && (
            <>
              {/* Boss HP - top bar */}
              <div className="px-3 py-1 rounded-xl" style={{ background: 'linear-gradient(135deg, #1a1a2e80 0%, #2d1a1a80 100%)', borderTop: '2px solid #ff6b3560' }}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-2">
                    <motion.span className="text-xl" animate={bossCharging ? { scale: [1, 1.15, 1] } : {}}>{boss.emoji}</motion.span>
                    <span className="font-bold text-white text-xs">{boss.name}</span>
                    <div className="flex items-center gap-1">
                      {boss.phases.map((p, i) => (
                        <span key={i} className={`text-[7px] px-1 py-0.5 rounded-full font-bold ${bossPhase === i ? 'bg-red-600 text-white' : 'bg-white/10 text-white/40'}`}>{p.name}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {bossCharging && <span className="text-orange-400 animate-pulse text-[9px]">⚡</span>}
                    {burnStacks > 0 && <span className="text-orange-500 text-[9px]">🔥{burnStacks}</span>}
                    {bossBerserkCount > 0 && <span className="text-red-500 text-[9px]">👊{bossBerserkCount}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
                    <motion.div className="h-full rounded-full" animate={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                      style={{ backgroundColor: bossHp / bossMaxHp > 0.5 ? '#ff6b35' : bossHp / bossMaxHp > 0.25 ? '#ffd93d' : '#ff3333' }} />
                  </div>
                  <span className="text-[8px] text-white/40">{bossHp}/{bossMaxHp}</span>
                </div>
              </div>

              {/* Player HP - Left edge, horizontal bar - below header */}
              <div className="absolute left-0 top-20 flex items-center gap-1 px-1 z-20" style={{ pointerEvents: 'none', height: '24px' }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-[7px]" style={{ backgroundColor: '#6c5ce7' }}>T</div>
                <div className="w-8 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
                  <motion.div className="h-full rounded-full" animate={{ width: `${Math.min(100, (playerHp / playerMaxHp) * 100)}%` }}
                    style={{ backgroundColor: playerHp / playerMaxHp > 0.5 ? '#4bddb7' : playerHp / playerMaxHp > 0.25 ? '#ffd93d' : '#ff6b35' }} />
                </div>
                <span className="text-[7px] text-white/40">{playerHp}</span>
              </div>

              {/* Boss HP - Right edge, horizontal bar - below header */}
              <div className="absolute right-0 top-20 flex items-center gap-1 px-1 z-20" style={{ pointerEvents: 'none', height: '24px' }}>
                <span className="text-[10px]">{boss.emoji}</span>
                <div className="w-8 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
                  <motion.div className="h-full rounded-full" animate={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                    style={{ backgroundColor: bossHp / bossMaxHp > 0.5 ? '#ff6b35' : bossHp / bossMaxHp > 0.25 ? '#ffd93d' : '#ff3333' }} />
                </div>
                <span className="text-[7px] text-white/40">{bossHp}</span>
              </div>

              {/* Cards center */}
              <div className="flex items-center justify-center gap-4 h-full">
                {playerActive && (
                  <div className="flex flex-col items-center">
                    <ActiveCard card={playerActive} isPlayer={true} attacking={attackingCard === 'player'} hit={hitCard === 'player'} />
                    {playerActive && <AnimatePresence>{showDmg && dmgVal > 0 && <DamageText value={dmgVal} type="dmg" />}</AnimatePresence>}
                  </div>
                )}
                <div className="text-white/15 text-xl font-black">🐉⚔</div>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl" style={{ backgroundColor: '#1a1a2e80', border: '2px solid #ff6b3540' }}>{boss.emoji}</div>
              </div>

              {/* Status effects */}
              {burnStacks > 0 && (
                <div className="mx-4 py-1 rounded-lg text-center" style={{ backgroundColor: '#ff6b3520' }}>
                  <span className="text-[10px] text-orange-400 font-bold animate-pulse">🔥 Burn: -{burnStacks * 15}/turn</span>
                </div>
              )}

              {/* Boss Notifications - above hand cards */}
              {log.length > 0 && (
                <div className="mx-4 py-1.5 rounded-lg" style={{ backgroundColor: '#1a1a2e60' }}>
                  <div className="flex gap-2 overflow-x-auto px-1">
                    {log.slice(-4).map((l, i) => (
                      <span key={i} className="text-[10px] text-white/50 whitespace-nowrap">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* REGULAR BATTLE AREA - cards center, HP bars at left/right edges */}
          {phase === 'battle' && (
            <>
              {/* Player HP - Left edge, horizontal bar - below header */}
              {opponent && (
                <div className="absolute left-0 top-20 flex items-center gap-1 px-1 z-20" style={{ pointerEvents: 'none', height: '24px' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-white text-[7px]" style={{ backgroundColor: '#6c5ce7' }}>T</div>
                  <div className="w-8 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
                    <motion.div className="h-full rounded-full" animate={{ width: `${Math.min(100, (playerHp / playerMaxHp) * 100)}%` }} style={{ backgroundColor: '#4bddb7' }} />
                  </div>
                  <span className="text-[7px] text-white/40">{playerHp}</span>
                </div>
              )}

              {/* Opponent HP - Right edge, horizontal bar - below header */}
              {opponent && (
                <div className="absolute right-0 top-20 flex items-center gap-1 px-1 z-20" style={{ pointerEvents: 'none', height: '24px' }}>
                  <span className="text-[10px]">{opponent.emoji}</span>
                  <div className="w-8 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: '#051013' }}>
                    <motion.div className="h-full rounded-full" animate={{ width: `${(oppHp / oppMaxHp) * 100}%` }}
                      style={{ backgroundColor: oppHp / oppMaxHp > 0.5 ? '#4bddb7' : oppHp / oppMaxHp > 0.25 ? '#ffd93d' : '#ff6b35' }} />
                  </div>
                  <span className="text-[7px] text-white/40">{oppHp}</span>
                </div>
              )}

              {/* Cards center */}
              <div className="flex items-center justify-center gap-4 h-full">
                {oppActive && (
                  <div className="flex flex-col items-center">
                    <ActiveCard card={oppActive} isPlayer={false} attacking={attackingCard === 'opponent'} hit={hitCard === 'opponent'} />
                    {oppActive && <AnimatePresence>{showDmg && dmgVal > 0 && <DamageText value={dmgVal} type="dmg" />}</AnimatePresence>}
                  </div>
                )}
                <div className="text-white/15 text-2xl font-black">⚔</div>
                {playerActive && (
                  <div className="flex flex-col items-center">
                    <ActiveCard card={playerActive} isPlayer={true} attacking={attackingCard === 'player'} hit={hitCard === 'player'} />
                    {playerActive && <AnimatePresence>{showDmg && dmgVal > 0 && <DamageText value={dmgVal} type="dmg" />}</AnimatePresence>}
                  </div>
                )}
              </div>

              {/* Battle Notifications - above hand cards */}
              {log.length > 0 && (
                <div className="mx-4 py-1.5 rounded-lg" style={{ backgroundColor: '#1a1a2e60' }}>
                  <div className="flex gap-2 overflow-x-auto px-1">
                    {log.slice(-4).map((l, i) => (
                      <span key={i} className="text-[10px] text-white/50 whitespace-nowrap">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {(phase === 'battle' || phase === 'boss-battle') && (
          <div className="px-4 pb-2 pt-1 flex-shrink-0" style={{ backgroundColor: '#0f1923' }}>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {playerHand.map((card, i) => (
                <HandCard key={card.id} card={card} idx={i} sel={playerActive?.id === card.id}
                  disabled={!isPlayerTurn || processing}
                  onClick={() => selectCard(i)} />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <button onClick={phase === 'boss-battle' ? executeBossPlayerAttack : executePlayerAttack}
                disabled={!playerActive || !isPlayerTurn || processing}
                className="h-11 rounded-xl flex items-center justify-center gap-1.5 font-bold text-white text-sm bg-[#ff6b35] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                <Swords className="w-4 h-4" /> Attack
              </button>
              <button onClick={handleHeal}
                disabled={!isPlayerTurn || processing}
                className="h-11 rounded-xl flex items-center justify-center gap-1.5 font-bold text-white text-sm bg-[#4bddb7] text-black active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                💚 Heal
              </button>
              <button onClick={handleDefend}
                disabled={!isPlayerTurn || processing}
                className="h-11 rounded-xl flex items-center justify-center gap-1.5 font-bold text-white text-sm bg-[#4facfe] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed">
                <Shield className="w-4 h-4" /> Defend
              </button>
            </div>

            {!playerActive && isPlayerTurn && !processing && (
              <p className="text-xs text-center text-white/40 mt-2">💡 Klik kartu di tanganmu untuk memilih!</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function BattlePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: '#0d0d1a' }}>
        <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
        <p className="text-white/40 text-sm">Loading...</p>
      </div>
    }>
      <BattlePageContent />
    </Suspense>
  );
}