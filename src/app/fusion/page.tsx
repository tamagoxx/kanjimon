'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore } from '@/store/collectionStore';
import { useFusionStore } from '@/store/fusionStore';
import { FUSION_RECIPES } from '@/types';
import type { Rarity, OwnedCard } from '@/types';
import { Sparkles, X, ChevronRight, Info, Zap, ArrowLeft } from 'lucide-react';

// ── Color map ──────────────────────────────────────────────────
const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: '#c8c4d7',
  UNCOMMON: '#4bddb7',
  RARE: '#6c5ce7',
  ULTRA_RARE: '#f0bf63',
};

const RARITY_BG: Record<Rarity, string> = {
  COMMON: '#2a2a3a',
  UNCOMMON: '#1a3a30',
  RARE: '#2a2060',
  ULTRA_RARE: '#3a2a00',
};

const ELEMENT_ICON: Record<string, string> = {
  FIRE: '🔥', WATER: '💧', GRASS: '🌿',
  ELECTRIC: '⚡', PSYCHIC: '🔮', NORMAL: '⚪',
};

// ── Rarity tier labels ─────────────────────────────────────────
const RARITY_TIER: Record<Rarity, string> = {
  COMMON: 'I', UNCOMMON: 'II', RARE: 'III', ULTRA_RARE: 'IV',
};

// ── MiniCard: displayed in the selection grid ──────────────────
function MiniCard({ card, selected, onSelect }: {
  card: OwnedCard;
  selected: boolean;
  onSelect: () => void;
}) {
  const col = RARITY_COLORS[card.card.rarity] || '#c8c4d7';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className="relative w-full aspect-[2/3] rounded-xl overflow-hidden flex flex-col items-center justify-center text-white cursor-pointer"
      style={{
        backgroundColor: RARITY_BG[card.card.rarity],
        border: `2px solid ${selected ? col : 'transparent'}`,
        boxShadow: selected ? `0 0 16px ${col}66` : 'none',
      }}
    >
      {/* Rarity badge */}
      <div
        className="absolute top-1 right-1 text-[8px] font-bold px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: `${col}33`, color: col }}
      >
        {RARITY_TIER[card.card.rarity]}
      </div>

      {/* Japanese char */}
      <span className="text-2xl font-bold mb-0.5" style={{ color: col }}>
        {card.card.japanese}
      </span>

      {/* Reading */}
      <span className="text-[9px] opacity-60">{card.card.reading}</span>

      {/* Element */}
      <span className="absolute bottom-1 left-1 text-xs">
        {ELEMENT_ICON[card.card.element] || '⚪'}
      </span>

      {/* Selected overlay */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(108,92,231,0.4)' }}
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: col }}>
            <span className="text-black font-bold text-sm">✓</span>
          </div>
        </motion.div>
      )}
    </motion.button>
  );
}

// ── FusedCardPreview: the result card preview ───────────────────
function FusedCardPreview({ cardA, cardB, resultRarity }: {
  cardA: OwnedCard; cardB: OwnedCard; resultRarity: Rarity;
}) {
  const col = RARITY_COLORS[resultRarity];
  const recipe = FUSION_RECIPES[cardA.card.rarity === cardB.card.rarity ? cardA.card.rarity : (
    ['COMMON','UNCOMMON','RARE','ULTRA_RARE'].indexOf(cardA.card.rarity) >=
    ['COMMON','UNCOMMON','RARE','ULTRA_RARE'].indexOf(cardB.card.rarity)
      ? cardA.card.rarity : cardB.card.rarity
  )];

  const higherCard = ['COMMON','UNCOMMON','RARE','ULTRA_RARE'].indexOf(cardA.card.rarity) >=
    ['COMMON','UNCOMMON','RARE','ULTRA_RARE'].indexOf(cardB.card.rarity) ? cardA : cardB;

  const finalHp = higherCard.card.hp + recipe.statBonus.hp;
  const finalAtk = higherCard.card.attackPower + recipe.statBonus.attack;
  const finalDef = higherCard.card.defenseRating + recipe.statBonus.defense;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl p-5 flex flex-col items-center gap-3 w-full max-w-[240px] mx-auto"
      style={{ backgroundColor: RARITY_BG[resultRarity], border: `2px solid ${col}` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles size={16} style={{ color: col }} />
        <span className="text-xs font-bold" style={{ color: col }}>FUSION RESULT</span>
        <Sparkles size={16} style={{ color: col }} />
      </div>

      {/* Card visual */}
      <div
        className="w-32 h-44 rounded-xl flex flex-col items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: `${col}22`, border: `1px solid ${col}55` }}
      >
        <div
          className="absolute top-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
          style={{ backgroundColor: `${col}33`, color: col }}
        >
          {RARITY_TIER[resultRarity]}
        </div>

        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-xl"
          style={{ boxShadow: `inset 0 0 30px ${col}44` }}
        />

        <span className="text-4xl font-bold mb-1" style={{ color: col }}>
          {higherCard.card.japanese}
        </span>
        <span className="text-xs opacity-60">{higherCard.card.reading}</span>

        <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] opacity-70">
          <span>HP {finalHp}</span>
          <span>ATK {finalAtk}</span>
        </div>
      </div>

      {/* Stats breakdown */}
      <div className="w-full space-y-1">
        <div className="flex items-center justify-between text-xs px-2">
          <span className="text-gray-400">HP</span>
          <div className="flex items-center gap-1">
            <span className="text-gray-500 line-through">{higherCard.card.hp}</span>
            <ChevronRight size={10} className="text-gray-500" />
            <span style={{ color: col }}>+{recipe.statBonus.hp} → {finalHp}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs px-2">
          <span className="text-gray-400">ATK</span>
          <div className="flex items-center gap-1">
            <span className="text-gray-500 line-through">{higherCard.card.attackPower}</span>
            <ChevronRight size={10} className="text-gray-500" />
            <span style={{ color: col }}>+{recipe.statBonus.attack} → {finalAtk}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs px-2">
          <span className="text-gray-400">DEF</span>
          <div className="flex items-center gap-1">
            <span className="text-gray-500 line-through">{higherCard.card.defenseRating}</span>
            <ChevronRight size={10} className="text-gray-500" />
            <span style={{ color: col }}>+{recipe.statBonus.defense} → {finalDef}</span>
          </div>
        </div>
      </div>

      {/* Cost */}
      <div className="flex items-center gap-1.5 text-sm">
        <Zap size={14} className="text-yellow-400" />
        <span className="font-bold" style={{ color: col }}>{recipe.cost} diamonds</span>
      </div>
    </motion.div>
  );
}

// ── Fusion Success Modal ────────────────────────────────────────
function FusionSuccessModal({ fusedCard, resultRarity, onClose }: {
  fusedCard: any;
  resultRarity: Rarity;
  onClose: () => void;
}) {
  const col = RARITY_COLORS[resultRarity];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, rotateZ: -10 }}
        animate={{ scale: 1, rotateZ: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col items-center gap-4"
        style={{ backgroundColor: '#1a1a2e', border: `2px solid ${col}` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Particle burst */}
        <div className="relative w-20 h-20">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 1, scale: 0 }}
              animate={{
                opacity: 0,
                scale: 2,
                x: Math.cos(i * Math.PI / 4) * 60,
                y: Math.sin(i * Math.PI / 4) * 60,
              }}
              transition={{ duration: 0.8, delay: i * 0.05 }}
              className="absolute inset-0 rounded-full"
              style={{ backgroundColor: col }}
            />
          ))}
          <div className="absolute inset-0 rounded-full flex items-center justify-center" style={{ backgroundColor: `${col}33` }}>
            <Sparkles size={32} style={{ color: col }} />
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-1">Fusion Berhasil!</h2>
          <p className="text-sm text-gray-400">Dua kartu berhasil digabungkan</p>
        </div>

        {/* Result card */}
        <div
          className="w-36 h-48 rounded-xl flex flex-col items-center justify-center"
          style={{ backgroundColor: `${col}22`, border: `1px solid ${col}66` }}
        >
          <span className="text-4xl font-bold" style={{ color: col }}>🔥</span>
          <span className="text-xs text-gray-400 mt-1">Tier {RARITY_TIER[resultRarity]} Card</span>
        </div>

        <p className="text-xs text-gray-500 text-center">
          Kartu hasil fusion tersimpan di koleksi fusion.<br />Stats baru: HP {fusedCard.baseHp} / ATK {fusedCard.baseAttack}
        </p>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-bold text-white"
          style={{ backgroundColor: col }}
        >
          Lihat di Koleksi
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Info Tooltip ────────────────────────────────────────────────
function InfoSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg"
        style={{ backgroundColor: open ? '#212c30' : 'transparent' }}
      >
        <Info size={12} />
        Cara Fusion
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 mt-2 w-72 p-4 rounded-xl z-30"
            style={{ backgroundColor: '#1a1a2e', border: '1px solid #2b363b' }}
          >
            <h4 className="text-sm font-bold text-white mb-3">✨ Cara Fusion Kartu</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>• Pilih <span className="text-white">2 kartu</span> dari koleksi kamu</li>
              <li>• Kedua kartu akan <span className="text-red-400">dihapus</span> dari koleksi</li>
              <li>• Kartu dengan rarity lebih tinggi jadi <span className="text-white">base stats</span></li>
              <li>• Hasil fusion punya <span className="text-yellow-400">rarity lebih tinggi</span> + stat bonus</li>
              <li className="pt-2 border-t border-gray-700">
                <span className="text-gray-300">Biaya:</span><br />
                C+C → UC: <span className="text-teal-400">10💎</span><br />
                UC+UC → R: <span className="text-purple-400">25💎</span><br />
                R+R → UR: <span className="text-yellow-400">50💎</span><br />
                UR+UR refine: <span className="text-yellow-400">100💎</span>
              </li>
              <li className="pt-2 border-t border-gray-700 text-gray-300">
                ⚠️ Fusion tidak bisa dibatalkan!
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function FusionPage() {
  const router = useRouter();
  const { ownedCards, diamonds } = useCollectionStore();
  const { fusedCards, fuseCards, canFuse } = useFusionStore();

  const [selectedIds, setSelectedIds] = useState<[string | null, string | null]>([null, null]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastFusedCard, setLastFusedCard] = useState<any>(null);
  const [lastRarity, setLastRarity] = useState<Rarity>('COMMON');

  const cardA = useMemo(() =>
    ownedCards.find(c => c.cardId === selectedIds[0]),
    [ownedCards, selectedIds]
  );
  const cardB = useMemo(() =>
    ownedCards.find(c => c.cardId === selectedIds[1]),
    [ownedCards, selectedIds]
  );

  const fusionCheck = useMemo(() => {
    if (!selectedIds[0] || !selectedIds[1]) return null;
    return canFuse(selectedIds[0], selectedIds[1]);
  }, [selectedIds, canFuse]);

  const resultRarity: Rarity = fusionCheck?.resultRarity || 'COMMON';

  const toggleCard = (cardId: string) => {
    setSelectedIds(prev => {
      if (prev[0] === cardId) return [null, prev[1]];
      if (prev[1] === cardId) return [prev[0], null];
      if (prev[0] === null) return [cardId, prev[1]];
      if (prev[1] === null) return [prev[0], cardId];
      // Both filled — replace the oldest selection
      return [cardId, null];
    });
  };

  const handleFuse = () => {
    if (!selectedIds[0] || !selectedIds[1]) return;
    const result = fuseCards(selectedIds[0], selectedIds[1]);
    if (result.success && result.fusedCard) {
      setLastFusedCard(result.fusedCard);
      setLastRarity(resultRarity);
      setShowSuccess(true);
      setSelectedIds([null, null]);
    }
  };

  const clearSelection = () => setSelectedIds([null, null]);

  // Sort owned cards by rarity (highest first) for the grid
  const sortedCards = useMemo(() => {
    const order: Rarity[] = ['ULTRA_RARE', 'RARE', 'UNCOMMON', 'COMMON'];
    return [...ownedCards].sort((a, b) =>
      order.indexOf(a.card.rarity) - order.indexOf(b.card.rarity)
    );
  }, [ownedCards]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a1519' }}>
      {/* Top App Bar */}
      <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: '#0a1519' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/')} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <span className="text-lg font-bold text-white">🔀 Fusion</span>
        </div>
        <div className="flex items-center gap-2">
          <InfoSection />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: '#212c30', color: '#f0bf63' }}>
            <span>💎</span> {diamonds}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="flex-1 px-4 pb-24 flex flex-col gap-5">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white mb-1">Fusion Kartu</h1>
          <p className="text-sm text-gray-400">Gabungkan 2 kartu jadi 1 yang lebih kuat!</p>
        </motion.div>

        {/* Result Preview (when 2 cards selected) */}
        <AnimatePresence mode="wait">
          {cardA && cardB && fusionCheck?.possible && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-3"
            >
              <FusedCardPreview cardA={cardA} cardB={cardB} resultRarity={resultRarity} />
            </motion.div>
          )}

          {!cardA && !cardB && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8 text-center"
            >
              <div className="text-5xl mb-3">🔀</div>
              <p className="text-gray-400 text-sm">Pilih 2 kartu untuk melihat hasil fusion</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection slots */}
        <div className="flex items-center gap-3 justify-center">
          {[0, 1].map(slot => {
            const selected = slot === 0 ? cardA : cardB;
            return (
              <div key={slot} className="flex flex-col items-center gap-1">
                <div
                  className="w-16 h-20 rounded-xl flex items-center justify-center text-xs"
                  style={{
                    backgroundColor: selected ? RARITY_BG[selected.card.rarity] : '#1a1a2e',
                    border: `2px ${selected ? 'solid' : 'dashed'} ${selected ? RARITY_COLORS[selected.card.rarity] : '#2b363b'}`,
                  }}
                >
                  {selected ? (
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold" style={{ color: RARITY_COLORS[selected.card.rarity] }}>
                        {selected.card.japanese}
                      </span>
                      <span className="text-[8px] text-gray-400">{selected.card.reading}</span>
                    </div>
                  ) : (
                    <span className="text-gray-600">{slot + 1}#</span>
                  )}
                </div>
                {selected && (
                  <button
                    onClick={() => toggleCard(selected.cardId)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}

          {/* VS divider */}
          {cardA && cardB && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-gray-500">+</motion.div>
          )}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {fusionCheck && !fusionCheck.possible && fusionCheck.reason && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-sm text-red-400"
            >
              {fusionCheck.reason}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fuse Button */}
        <AnimatePresence>
          {cardA && cardB && fusionCheck?.possible && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <button
                onClick={handleFuse}
                className="w-full max-w-xs py-4 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, #6c5ce7, #a29bfe)`, boxShadow: '0 4px 20px #6c5ce755' }}
              >
                <Sparkles size={20} />
                FUSION SEKARANG
              </button>
              <p className="text-xs text-gray-500">Kartu asli akan dihapus dari koleksi</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: '#2b363b' }} />
          <span className="text-xs text-gray-500">Koleksi ({ownedCards.length} kartu)</span>
          <div className="flex-1 h-px" style={{ backgroundColor: '#2b363b' }} />
        </div>

        {/* Card Grid */}
        {ownedCards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-gray-400 text-sm">Koleksi kosong!</p>
            <p className="text-gray-600 text-xs mt-1">Capture Pokemon di Gacha untuk dapat kartu</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {sortedCards.map(card => (
              <MiniCard
                key={card.cardId}
                card={card}
                selected={selectedIds[0] === card.cardId || selectedIds[1] === card.cardId}
                onSelect={() => toggleCard(card.cardId)}
              />
            ))}
          </div>
        )}

        {/* Fusion History */}
        {fusedCards.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-yellow-400" />
              <span className="text-sm font-bold text-white">Fusion Berhasil ({fusedCards.length})</span>
            </div>
            <div className="space-y-2">
              {fusedCards.slice(-3).reverse().map(fc => (
                <div key={fc.id} className="p-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: '#1a1a2e' }}>
                  <div className="w-10 h-14 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: '#212c30' }}>
                    🔀
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">Fusion #{fc.fusionCount}</p>
                    <p className="text-[10px] text-gray-500">
                      HP {fc.baseHp} / ATK {fc.baseAttack} / DEF {fc.baseDefense}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {new Date(fc.learnedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && lastFusedCard && (
          <FusionSuccessModal
            fusedCard={lastFusedCard}
            resultRarity={lastRarity}
            onClose={() => setShowSuccess(false)}
          />
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-50"
        style={{ backgroundColor: '#162125' }}
      >
        {[
          { icon: '🏠', label: 'Home', route: '/' },
          { icon: '📚', label: 'Belajar', route: '/learn' },
          { icon: '⚔️', label: 'Battle', route: '/battle' },
          { icon: '🃏', label: 'Kartu', route: '/collection' },
          { icon: '🎰', label: 'Gacha', route: '/gacha' },
          { icon: '🔀', label: 'Fusion', route: '/fusion' },
          { icon: '🛒', label: 'Toko', route: '/shop' },
        ].map((item, i) => {
          const active = item.route === '/fusion';
          return (
            <button
              key={i}
              onClick={() => router.push(item.route)}
              className={`flex flex-col items-center gap-1 ${active ? 'opacity-100' : 'opacity-60'} transition-opacity`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs" style={{ color: active ? '#4bddb7' : '#c8c4d7' }}>
                {item.label}
              </span>
              {active && <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: '#4bddb7' }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}