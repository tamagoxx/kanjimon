'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Sparkles, Loader2, Check, AlertCircle } from 'lucide-react';
import { useEvolutionStore } from '@/store/evolutionStore';
import { useCollectionStore } from '@/store/collectionStore';
import { EVO_REQUIREMENTS, EVOLUTION_MATERIALS, EVO_TIER_ORDER, STAT_BOOST_PER_TIER, type EvoTier, type EvolutionMaterial } from '@/types';

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: {
    id: string;
    name: string;
    image?: string;
    rarity: string;
    hp: number;
    attack: number;
    defense: number;
    element?: string;
    fusionCount?: number;
  };
  cardType: 'japanese' | 'pokemon' | 'fused';
}

// Evolution tier colors
const TIER_COLORS: Record<EvoTier, { primary: string; secondary: string; glow: string }> = {
  TRANSCENDENT: { primary: '#00ffff', secondary: '#00cccc', glow: 'rgba(0, 255, 255, 0.3)' },
  CELESTIAL: { primary: '#ffd700', secondary: '#cc9900', glow: 'rgba(255, 215, 0, 0.3)' },
  DIVINE: { primary: '#ff00ff', secondary: '#cc00cc', glow: 'rgba(255, 0, 255, 0.3)' },
  ULTIMATE: { primary: '#ff4500', secondary: '#cc3300', glow: 'rgba(255, 69, 0, 0.3)' },
  ETERNAL: { primary: '#ffffff', secondary: '#cccccc', glow: 'rgba(255, 255, 255, 0.4)' },
};

const TIER_ICONS: Record<EvoTier, string> = {
  TRANSCENDENT: '✨',
  CELESTIAL: '💎',
  DIVINE: '🌟',
  ULTIMATE: '🔮',
  ETERNAL: '💫',
};

const MATERIAL_ICONS: Record<EvolutionMaterial, string> = {
  COSMIC_DUST: '✨',
  CELESTIAL_SHARD: '💎',
  DIVINE_ESSENCE: '🌟',
  ULTIMATE_CORE: '🔮',
  ETERNAL_FRAGMENT: '💫',
};

export function EvolutionModal({ isOpen, onClose, card }: EvolutionModalProps) {
  const { canEvolveCard, getMaterialCost, hasEnoughMaterials, evolveCard, getMaterialCount, getEligibleFusionCards, calculateSacrificeContribution } = useEvolutionStore();
  const { coins, spendCoins } = useCollectionStore();

  const [isEvolving, setIsEvolving] = useState(false);
  const [sacrificedCardIds, setSacrificedCardIds] = useState<string[]>([]);
  const [evolutionResult, setEvolutionResult] = useState<{
    success: boolean;
    newTier?: EvoTier;
    boostedStats?: { hp: number; attack: number; defense: number };
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

  // Eligible fusion cards (UR+) that can be sacrificed
  const eligibleFusionCards = getEligibleFusionCards();
  // Live contribution from currently-selected sacrifices
  const sacrificeContribution = sacrificedCardIds.length > 0
    ? calculateSacrificeContribution(sacrificedCardIds)
    : undefined;
  // Eligibility check accounts for sacrifice
  const check = canEvolveCard(card.id, sacrificeContribution);
  const nextTier = check.nextTier;

  const toggleSacrifice = (id: string) => {
    setSacrificedCardIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleEvolve = async () => {
    if (!nextTier || !check.canEvolve) return;

    setIsEvolving(true);

    // Simulate evolution animation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = evolveCard(
      card.id,
      card.rarity as any,
      {
        hp: card.hp,
        attack: card.attack,
        defense: card.defense,
      },
      sacrificedCardIds
    );

    setEvolutionResult(result);
    setIsEvolving(false);
  };

  const handleClose = () => {
    setSacrificedCardIds([]);
    setEvolutionResult(null);
    onClose();
  };

  // No evolution possible
  if (!check.canEvolve || !nextTier) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="w-full max-w-sm rounded-3xl overflow-hidden"
          style={{ backgroundColor: '#1a1a2e' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Evolution</h2>
              <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#162125' }}>
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#162125' }}>
                <AlertCircle className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-white/60 text-sm">{check.reason || 'This card cannot evolve'}</p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl font-bold text-white"
              style={{ backgroundColor: '#6c5ce7' }}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const tierColors = TIER_COLORS[nextTier];
  const requirements = EVO_REQUIREMENTS[nextTier];
  const cost = getMaterialCost(nextTier);
  const enoughMaterials = hasEnoughMaterials(nextTier, sacrificeContribution);
  const boostMultiplier = 1 + STAT_BOOST_PER_TIER[nextTier];

  // Success state
  if (evolutionResult?.success) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          className="w-full max-w-sm rounded-3xl overflow-hidden"
          style={{ backgroundColor: '#1a1a2e' }}
        >
          <div className="p-6">
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${tierColors.primary}20`, boxShadow: `0 0 40px ${tierColors.glow}` }}
              >
                <span className="text-5xl">{TIER_ICONS[nextTier]}</span>
              </motion.div>

              <h2 className="text-2xl font-black text-white mb-2">Evolution Complete!</h2>
              <p className="text-lg" style={{ color: tierColors.primary }}>
                {nextTier.charAt(0) + nextTier.slice(1).toLowerCase()}
              </p>

              <div className="mt-6 p-4 rounded-2xl" style={{ backgroundColor: '#162125' }}>
                <p className="text-xs text-white/40 mb-2">Stat Boost</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-red-400">❤️ {evolutionResult.boostedStats?.hp}</p>
                    <p className="text-xs text-white/40">HP</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-orange-400">⚔️ {evolutionResult.boostedStats?.attack}</p>
                    <p className="text-xs text-white/40">ATK</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-400">🛡️ {evolutionResult.boostedStats?.defense}</p>
                    <p className="text-xs text-white/40">DEF</p>
                  </div>
                </div>
                <p className="text-xs text-white/30 mt-2">+{Math.round((boostMultiplier - 1) * 100)}% from base</p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl font-bold text-white"
              style={{ backgroundColor: tierColors.primary }}
            >
              Awesome!
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ backgroundColor: '#1a1a2e' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Tier header with glow effect */}
        <div
          className="p-6 text-center"
          style={{ background: `linear-gradient(180deg, ${tierColors.glow} 0%, #1a1a2e 100%)` }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: `${tierColors.primary}20`, boxShadow: `0 0 30px ${tierColors.glow}` }}
          >
            <span className="text-3xl">{TIER_ICONS[nextTier]}</span>
          </div>
          <h2 className="text-xl font-black text-white mb-1">Evolve to {nextTier}</h2>
          <p className="text-sm" style={{ color: tierColors.primary }}>
            {nextTier.charAt(0) + nextTier.slice(1).toLowerCase()} Tier
          </p>
        </div>

        <div className="p-5 space-y-5">
          {/* Card preview */}
          <div className="p-3 rounded-2xl flex items-center gap-4" style={{ backgroundColor: '#162125' }}>
            {card.image && (
              <img src={card.image} alt={card.name} className="w-14 h-14 object-contain rounded-xl" />
            )}
            <div className="flex-1">
              <p className="font-bold text-white">{card.name}</p>
              <p className="text-xs text-white/40">{card.rarity}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold" style={{ color: tierColors.primary }}>+{Math.round((boostMultiplier - 1) * 100)}% Stats</p>
            </div>
          </div>

          {/* Cost breakdown */}
          <div>
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">Evolution Cost</h3>

            {/* Gold cost */}
            <div className="flex items-center justify-between p-3 rounded-xl mb-2" style={{ backgroundColor: '#162125' }}>
              <div className="flex items-center gap-2">
                <span className="text-lg">🪙</span>
                <span className="text-sm text-white">Gold</span>
              </div>
              <span className={`font-bold ${coins >= cost.gold ? 'text-green-400' : 'text-red-400'}`}>
                {cost.gold.toLocaleString()}
              </span>
            </div>

            {/* Material costs */}
            <div className="space-y-2">
              {Object.entries(cost.materials).map(([mat, count]) => {
                const material = mat as EvolutionMaterial;
                const owned = getMaterialCount(material);
                const needed = count as number;
                // For COSMIC_DUST / CELESTIAL_SHARD the sacrifice contribution can cover part of the cost
                const sacrificeCover =
                  material === 'COSMIC_DUST' ? (sacrificeContribution?.cosmicDust || 0) :
                  material === 'CELESTIAL_SHARD' ? (sacrificeContribution?.celestialShard || 0) : 0;
                const hasEnough = (owned + sacrificeCover) >= needed;

                return (
                  <div key={mat} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#162125' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{MATERIAL_ICONS[material]}</span>
                      <span className="text-sm text-white">{EVOLUTION_MATERIALS[material].name}</span>
                    </div>
                    <span className={`font-bold ${hasEnough ? 'text-green-400' : 'text-red-400'}`}>
                      {owned + sacrificeCover} / {needed}
                      {sacrificeCover > 0 && (
                        <span className="ml-1 text-xs text-white/50">(-{sacrificeCover})</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fusion card sacrifice picker (UR+ cards from collection) */}
          {eligibleFusionCards.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-3">
                Kartu Korban (Sacrifice)
              </h3>
              <p className="text-xs text-yellow-400/80 mb-3 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Kartu yang dipilih akan hilang permanen dari koleksi
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {eligibleFusionCards.map(fp => {
                  const isSelected = sacrificedCardIds.includes(fp.id);
                  const value = useEvolutionStore.getState().getFusionSacrificeValue(fp);
                  return (
                    <button
                      key={fp.id}
                      type="button"
                      onClick={() => toggleSacrifice(fp.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor: isSelected ? 'rgba(108, 92, 231, 0.25)' : '#162125',
                        border: isSelected ? '1px solid #6c5ce7' : '1px solid transparent',
                      }}
                    >
                      {fp.image && (
                        <img src={fp.image} alt={fp.name} className="w-10 h-10 object-contain rounded-lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{fp.name}</p>
                        <p className="text-xs text-white/50">{fp.rarity}</p>
                      </div>
                      <div className="text-right text-xs">
                        {value.cosmicDust > 0 && (
                          <p className="text-white/70">+{value.cosmicDust} ✨</p>
                        )}
                        {value.celestialShard > 0 && (
                          <p className="text-white/70">+{value.celestialShard} 💎</p>
                        )}
                      </div>
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isSelected ? '#6c5ce7' : '#0a1519',
                          border: '1px solid #6c5ce7',
                        }}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {sacrificedCardIds.length > 0 && (
                <div
                  className="mt-3 p-2.5 rounded-xl text-xs flex items-center justify-between"
                  style={{ backgroundColor: 'rgba(75, 221, 183, 0.1)', border: '1px solid #4bddb7' }}
                >
                  <span className="text-white/70">Total kontribusi:</span>
                  <span className="font-bold text-white">
                    {sacrificeContribution && sacrificeContribution.cosmicDust > 0 && (
                      <span className="mr-2">+{sacrificeContribution.cosmicDust} ✨</span>
                    )}
                    {sacrificeContribution && sacrificeContribution.celestialShard > 0 && (
                      <span>+{sacrificeContribution.celestialShard} 💎</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Stat preview */}
          <div className="p-4 rounded-2xl" style={{ backgroundColor: '#162125' }}>
            <h3 className="text-xs font-bold text-white/40 uppercase mb-3">After Evolution</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-red-400">❤️ {Math.round(card.hp * boostMultiplier)}</p>
                <p className="text-xs text-white/40">HP</p>
              </div>
              <div>
                <p className="text-lg font-bold text-orange-400">⚔️ {Math.round(card.attack * boostMultiplier)}</p>
                <p className="text-xs text-white/40">ATK</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-400">🛡️ {Math.round(card.defense * boostMultiplier)}</p>
                <p className="text-xs text-white/40">DEF</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 rounded-xl font-bold text-white/60"
              style={{ backgroundColor: '#162125' }}
            >
              Cancel
            </button>
            <button
              onClick={handleEvolve}
              disabled={isEvolving || !enoughMaterials}
              className="flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: enoughMaterials ? tierColors.primary : '#333' }}
            >
              {isEvolving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Evolving...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Evolve
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Evolution button component (to be placed on card detail views)
interface EvolveButtonProps {
  cardId: string;
  onClick: () => void;
}

export function EvolveButton({ cardId, onClick }: EvolveButtonProps) {
  const { canEvolveCard } = useEvolutionStore();
  const check = canEvolveCard(cardId);

  if (!check.canEvolve || !check.nextTier) return null;

  const tierColors = TIER_COLORS[check.nextTier];

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm text-white"
      style={{
        backgroundColor: tierColors.primary,
        boxShadow: `0 0 20px ${tierColors.glow}`,
      }}
    >
      <Sparkles className="w-4 h-4" />
      Evolve to {check.nextTier}
    </motion.button>
  );
}

// Evolution materials display component (for profile/inventory)
interface EvolutionMaterialsDisplayProps {
  compact?: boolean;
}

export function EvolutionMaterialsDisplay({ compact = false }: EvolutionMaterialsDisplayProps) {
  const { materials } = useEvolutionStore();

  const materialList = Object.entries(materials) as [EvolutionMaterial, number][];
  const hasAny = materialList.some(([, count]) => count > 0);

  if (!hasAny && compact) return null;

  return (
    <div className={compact ? 'flex items-center gap-2' : 'grid grid-cols-2 gap-2'}>
      {materialList.map(([material, count]) => (
        <div
          key={material}
          className="flex items-center gap-2 p-2 rounded-xl"
          style={{ backgroundColor: '#162125' }}
        >
          <span className="text-lg">{MATERIAL_ICONS[material]}</span>
          <div className="flex-1">
            <p className="text-xs font-medium text-white">{EVOLUTION_MATERIALS[material].name}</p>
            <p className="text-xs" style={{ color: count > 0 ? '#4bddb7' : '#666' }}>{count}</p>
          </div>
        </div>
      ))}
    </div>
  );
}