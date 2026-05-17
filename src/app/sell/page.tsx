'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore } from '@/store/collectionStore';
import { useAuthStore } from '@/store/authStore';
import { Flame, Coins, Zap, ArrowLeft, X, Info, Star, Shield, Sword, Heart } from 'lucide-react';

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

const RARITY_COLORS: Record<string, string> = {
  COMMON: '#cd7f32',
  UNCOMMON: '#c0c0c0',
  RARE: '#ffd700',
  ULTRA_RARE: '#ff6b35',
};

const RARITY_DOLLAR: Record<string, number> = {
  COMMON: 5,
  UNCOMMON: 15,
  RARE: 50,
  ULTRA_RARE: 200,
};

const RARITY_ENERGY: Record<string, number> = {
  COMMON: 2,
  UNCOMMON: 4,
  RARE: 8,
  ULTRA_RARE: 20,
};

type TabType = 'all' | 'japanese' | 'pokemon' | 'fusion';

interface SellItem {
  id: string;
  type: 'japanese' | 'pokemon' | 'fusion';
  name: string;
  japanese?: string;
  reading?: string;
  emoji: string;
  image?: string;
  rarity: string;
  dollarValue: number;
  energyValue: number;
  stats?: { attack: number; defense: number; hp: number };
  element?: string;
  types?: string[];
}

// ============================================================
// Card Art Display
// ============================================================
function CardArt({ item }: { item: SellItem }) {
  return (
    <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden flex items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${RARITY_COLORS[item.rarity]}20, ${colors.cardBg})` }}>
      {item.type === 'japanese' && item.japanese ? (
        <div className="text-center">
          <div className="text-4xl font-black text-white drop-shadow-lg">{item.japanese}</div>
          {item.reading && <div className="text-[10px] text-white/60 mt-1">{item.reading}</div>}
        </div>
      ) : item.image ? (
        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
      ) : (
        <span className="text-4xl">{item.emoji}</span>
      )}
      {/* Rarity glow */}
      <div className="absolute inset-0 rounded-xl opacity-20"
        style={{ boxShadow: `inset 0 0 20px ${RARITY_COLORS[item.rarity]}` }} />
    </div>
  );
}

// ============================================================
// Sell Card Item
// ============================================================
function SellCardItem({ item, onSell }: { item: SellItem; onSell: (item: SellItem) => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="rounded-2xl overflow-hidden cursor-pointer"
      style={{ backgroundColor: colors.cardBg, border: `1px solid ${RARITY_COLORS[item.rarity]}40` }}
      onClick={() => onSell(item)}
    >
      <CardArt item={item} />
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${RARITY_COLORS[item.rarity]}30`, color: RARITY_COLORS[item.rarity] }}>
            {item.rarity}
          </span>
          <span className="text-xs" style={{ color: '#4ade80' }}>💵{item.dollarValue}</span>
        </div>
        <div className="text-xs font-bold text-white truncate">{item.name}</div>
        {item.stats && (
          <div className="flex items-center justify-between text-[9px] text-white/40">
            <span>⚔️{item.stats.attack}</span>
            <span>🛡️{item.stats.defense}</span>
            <span>❤️{item.stats.hp}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[9px] text-yellow-400 flex items-center gap-0.5">
            <Zap className="w-3 h-3" />+{item.energyValue}
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: colors.brand + '40', color: colors.brand }}>
            JUAL
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// Confirm Modal
// ============================================================
function ConfirmModal({ item, onConfirm, onClose }: {
  item: SellItem | null; onConfirm: () => void; onClose: () => void;
}) {
  if (!item) return null;
  const [burning, setBurning] = useState(false);

  const handleConfirm = () => {
    setBurning(true);
    setTimeout(() => {
      onConfirm();
      setBurning(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="w-80 rounded-3xl overflow-hidden"
        style={{ backgroundColor: colors.cardBg }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 text-center"
          style={{ background: `linear-gradient(135deg, ${RARITY_COLORS[item.rarity]}15, transparent)` }}>
          <div className="w-20 h-28 mx-auto mb-3 rounded-xl overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, ${RARITY_COLORS[item.rarity]}20, ${colors.cardBg})`, border: `2px solid ${RARITY_COLORS[item.rarity]}60` }}>
            {item.type === 'japanese' && item.japanese ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-3xl font-black text-white">{item.japanese}</span>
              </div>
            ) : item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
            ) : (
              <div className="flex items-center justify-center h-full text-3xl">{item.emoji}</div>
            )}
          </div>
          <div className="text-sm font-bold text-white">{item.name}</div>
          <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${RARITY_COLORS[item.rarity]}30`, color: RARITY_COLORS[item.rarity] }}>
            {item.rarity}
          </span>
        </div>

        {/* Rewards */}
        <div className="px-6 py-4 space-y-3">
          <div className="text-center mb-4">
            <div className="text-xs text-white/40 mb-2">Hasil Pembakaran</div>
            <div className="flex items-center justify-center gap-6">
              {/* Dollars */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#4ade8020' }}>
                  <span className="text-xl">💵</span>
                </div>
                <span className="text-sm font-black" style={{ color: '#4ade80' }}>+{item.dollarValue}</span>
                <span className="text-[10px] text-white/40">Dollars</span>
              </motion.div>

              {/* Energy */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#fbbf2420' }}>
                  <Zap className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-sm font-black text-yellow-400">+{item.energyValue}</span>
                <span className="text-[10px] text-white/40">Energy</span>
              </motion.div>
            </div>
          </div>

          {/* Stats */}
          {item.stats && (
            <div className="flex items-center justify-center gap-4 p-2 rounded-xl bg-black/20">
              <div className="flex items-center gap-1">
                <Sword className="w-3 h-3 text-red-400" />
                <span className="text-xs text-white/60">{item.stats.attack}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-white/60">{item.stats.defense}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-pink-400" />
                <span className="text-xs text-white/60">{item.stats.hp}</span>
              </div>
            </div>
          )}

          <p className="text-center text-[10px] text-white/30">
            🔥 Kartu akan dibakar dan dihapus dari koleksi
          </p>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white"
            style={{ backgroundColor: colors.inputBg }}
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={burning}
            className="flex-1 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: burning ? '#666' : `linear-gradient(135deg, #ff6b35, #ff3d00)` }}
          >
            {burning ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
              />
            ) : (
              <>
                <Flame className="w-4 h-4" /> Burn!
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Currency Bar
// ============================================================
function CurrencyBar() {
  const { dollars, energy, scrolls, coins, diamonds } = useCollectionStore();

  return (
    <div className="flex items-center justify-between px-4 py-2 rounded-xl"
      style={{ backgroundColor: colors.cardBg }}>
      <div className="flex items-center gap-1">
        <span className="text-xs text-white/40">Saldo:</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: '#4ade8020' }}>
          <span className="text-sm">💵</span>
          <span className="text-xs font-bold" style={{ color: '#4ade80' }}>{dollars.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: '#fbbf2420' }}>
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">{energy}/20</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: colors.inputBg }}>
          <span className="text-sm">📜</span>
          <span className="text-xs font-bold" style={{ color: colors.lightPurple }}>{scrolls}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab Bar
// ============================================================
function TabBar({ active, onChange }: { active: TabType; onChange: (t: TabType) => void }) {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'all', label: 'Semua', icon: '📦' },
    { id: 'japanese', label: 'Kartu JP', icon: '🈂️' },
    { id: 'pokemon', label: 'Pokemon', icon: '⚡' },
    { id: 'fusion', label: 'Fusion', icon: '🔀' },
  ];

  return (
    <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: colors.cardBg }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
          style={{
            backgroundColor: active === tab.id ? colors.brand : 'transparent',
            color: active === tab.id ? 'white' : colors.darkText,
          }}
        >
          <span className="mr-1">{tab.icon}</span>{tab.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Main Page
// ============================================================
export default function SellPage() {
  const router = useRouter();
  const { ownedCards, ownedPokemon, fusedPokemon, sellCard, sellPokemon, sellFusedPokemon, dollars, energy, addDollars, addEnergy } = useCollectionStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [selectedItem, setSelectedItem] = useState<SellItem | null>(null);
  const [soldCount, setSoldCount] = useState(0);

  // Build sellable items list
  const allItems = useMemo<SellItem[]>(() => {
    const items: SellItem[] = [];

    // Japanese cards
    ownedCards.forEach(oc => {
      items.push({
        id: oc.cardId,
        type: 'japanese',
        name: oc.card.meaningId,
        japanese: oc.card.japanese,
        reading: oc.card.reading,
        emoji: oc.card.japanese,
        rarity: oc.card.rarity,
        dollarValue: RARITY_DOLLAR[oc.card.rarity] || 5,
        energyValue: RARITY_ENERGY[oc.card.rarity] || 2,
        stats: { attack: oc.card.attackPower, defense: oc.card.defenseRating, hp: oc.card.hp },
        element: oc.card.element,
      });
    });

    // Pokemon
    ownedPokemon.forEach(p => {
      items.push({
        id: String(p.pokemonId),
        type: 'pokemon',
        name: p.name,
        emoji: '⚡',
        image: p.image,
        rarity: p.rarity,
        dollarValue: RARITY_DOLLAR[p.rarity] || 5,
        energyValue: RARITY_ENERGY[p.rarity] || 2,
        stats: { attack: p.attack, defense: p.defense, hp: p.hp },
        types: p.types,
      });
    });

    // Fused Pokemon
    fusedPokemon.forEach(f => {
      items.push({
        id: f.id,
        type: 'fusion',
        name: f.name,
        emoji: '🔀',
        image: f.image,
        rarity: f.rarity,
        dollarValue: RARITY_DOLLAR[f.rarity] || 5,
        energyValue: RARITY_ENERGY[f.rarity] || 2,
        stats: { attack: f.baseAttack, defense: f.baseDefense, hp: f.baseHp },
        types: f.types,
      });
    });

    return items;
  }, [ownedCards, ownedPokemon, fusedPokemon, soldCount]);

  const filteredItems = useMemo(() => {
    switch (activeTab) {
      case 'japanese': return allItems.filter(i => i.type === 'japanese');
      case 'pokemon': return allItems.filter(i => i.type === 'pokemon');
      case 'fusion': return allItems.filter(i => i.type === 'fusion');
      default: return allItems;
    }
  }, [allItems, activeTab]);

  const handleSell = (item: SellItem) => setSelectedItem(item);

  const confirmSell = () => {
    if (!selectedItem) return;
    let success = false;
    const dollarGain = selectedItem.dollarValue;
    const energyGain = selectedItem.energyValue;

    if (selectedItem.type === 'japanese') {
      success = sellCard(selectedItem.id);
    } else if (selectedItem.type === 'pokemon') {
      success = sellPokemon(Number(selectedItem.id));
    } else {
      success = sellFusedPokemon(selectedItem.id);
    }

    if (success) {
      addDollars(dollarGain);
      addEnergy(Math.min(energyGain, 20 - energy)); // cap energy at 20
      setSoldCount(c => c + 1);
    }
    setSelectedItem(null);
  };

  const totalValue = filteredItems.reduce((sum, i) => sum + i.dollarValue, 0);
  const totalEnergy = filteredItems.reduce((sum, i) => sum + i.energyValue, 0);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 h-[72px] flex items-center justify-between"
        style={{ backgroundColor: colors.background }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.cardBg }}
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              <span className="font-bold text-white">Burn Kartu</span>
            </div>
            <p className="text-[10px] text-white/40">Jual atau bakar kartu untuk dapat 💵 & ⚡</p>
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 pt-2 space-y-4">
        {/* Currency Bar */}
        <CurrencyBar />

        {/* Tab Filter */}
        <TabBar active={activeTab} onChange={setActiveTab} />

        {/* Summary Stats */}
        <div className="flex items-center justify-between p-3 rounded-xl"
          style={{ backgroundColor: colors.cardBg }}>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <Info className="w-4 h-4" />
            <span>{filteredItems.length} kartu tersedia</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-sm">💵</span>
              <span className="text-xs font-bold" style={{ color: '#4ade80' }}>{totalValue}</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-400">+{totalEnergy}</span>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ backgroundColor: colors.cardBg }}>
            <div className="text-4xl mb-3">🔥</div>
            <p className="text-sm text-white/50 mb-1">Tidak ada kartu untuk dijual</p>
            <p className="text-xs text-white/30">Kumpulkan kartu dari Battle atau Gacha</p>
            <button
              onClick={() => router.push('/gacha')}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white"
              style={{ backgroundColor: colors.brand }}
            >
              Buka Gacha
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filteredItems.map(item => (
              <SellCardItem key={item.id} item={item} onSell={handleSell} />
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: colors.cardBg }}>
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold text-white">Tentang Burn</span>
          </div>
          <div className="space-y-1.5 text-xs text-white/50">
            <div className="flex items-center justify-between">
              <span>🔵 COMMON</span>
              <div className="flex items-center gap-3">
                <span style={{ color: '#4ade80' }}>💵 5</span>
                <span className="text-yellow-400">⚡ +2</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>⚪ UNCOMMON</span>
              <div className="flex items-center gap-3">
                <span style={{ color: '#4ade80' }}>💵 15</span>
                <span className="text-yellow-400">⚡ +4</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>🟡 RARE</span>
              <div className="flex items-center gap-3">
                <span style={{ color: '#4ade80' }}>💵 50</span>
                <span className="text-yellow-400">⚡ +8</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>🟠 ULTRA RARE</span>
              <div className="flex items-center gap-3">
                <span style={{ color: '#4ade80' }}>💵 200</span>
                <span className="text-yellow-400">⚡ +20</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-white/20 pt-2 text-center">
            Burn kartu = hapus dari koleksi + dapat dollars + energi
          </p>
        </div>
      </main>

      {/* Confirm Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ConfirmModal
            item={selectedItem}
            onConfirm={confirmSell}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}