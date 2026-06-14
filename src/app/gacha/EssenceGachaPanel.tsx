'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Gem, X } from 'lucide-react';
import { useCollectionStore } from '@/store/collectionStore';
import {
  ESSENCE_TYPES,
  type ElementEssence,
  type EssencePullResult,
  calculateEssencePullCost,
  simulateEssencePulls,
  aggregateEssenceResults,
} from '@/lib/essenceGacha';

// ============================================================
// Element-themed visuals
// ============================================================
const ELEMENT_COLORS: Record<ElementEssence, string> = {
  FIRE_ESSENCE: '#ff6b35',
  WATER_ESSENCE: '#4facfe',
  GRASS_ESSENCE: '#4bddb7',
  ELECTRIC_ESSENCE: '#ffd93d',
  PSYCHIC_ESSENCE: '#c77dff',
  NORMAL_ESSENCE: '#a8a8a8',
};

const ELEMENT_EMOJI: Record<ElementEssence, string> = {
  FIRE_ESSENCE: '🔥',
  WATER_ESSENCE: '💧',
  GRASS_ESSENCE: '🌿',
  ELECTRIC_ESSENCE: '⚡',
  PSYCHIC_ESSENCE: '🔮',
  NORMAL_ESSENCE: '⭐',
};

const ELEMENT_LABEL: Record<ElementEssence, string> = {
  FIRE_ESSENCE: 'Fire',
  WATER_ESSENCE: 'Water',
  GRASS_ESSENCE: 'Grass',
  ELECTRIC_ESSENCE: 'Electric',
  PSYCHIC_ESSENCE: 'Psychic',
  NORMAL_ESSENCE: 'Normal',
};

const PULL_OPTIONS = [1, 10, 30, 100] as const;
type PullOption = (typeof PULL_OPTIONS)[number];

// ============================================================
// Main panel
// ============================================================
export function EssenceGachaPanel() {
  const diamonds = useCollectionStore((s) => s.diamonds);
  const spendDiamonds = useCollectionStore((s) => s.spendDiamonds);
  const addElementEssence = useCollectionStore((s) => s.addElementEssence);
  const elementEssences = useCollectionStore((s) => s.elementEssences);

  const [pullCount, setPullCount] = useState<PullOption>(1);
  const [pulling, setPulling] = useState(false);
  const [results, setResults] = useState<EssencePullResult[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cost = calculateEssencePullCost(pullCount);
  const canAfford = diamonds >= cost;

  const handlePull = async () => {
    if (pulling || !canAfford) return;
    setErrorMsg(null);

    if (!spendDiamonds(cost)) {
      setErrorMsg('💎 Diamond tidak cukup!');
      return;
    }

    setPulling(true);

    // Simulate brief pull animation
    await new Promise((r) => setTimeout(r, 700));

    const newResults = simulateEssencePulls(pullCount);
    const aggregated = aggregateEssenceResults(newResults);
    for (const e of ESSENCE_TYPES) {
      if (aggregated[e] > 0) addElementEssence(e, aggregated[e]);
    }

    setResults(newResults);
    setPulling(false);
  };

  const closeResults = () => setResults(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e, #2d2d44)',
          border: '1px solid #6c5ce740',
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #6c5ce720' }}>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-bold text-white">🧬 Essence Gacha</h2>
            <span className="text-[10px] text-white/40">Material untuk Fusion</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ backgroundColor: '#0a1519' }}>
            <Gem className="w-3 h-3 text-cyan-400" />
            <span className="text-xs font-bold text-cyan-400">{diamonds.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Current essence balance */}
        <div className="px-4 py-2 flex flex-wrap gap-1.5" style={{ borderBottom: '1px solid #ffffff08' }}>
          {ESSENCE_TYPES.map((e) => (
            <div
              key={e}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
              style={{ backgroundColor: `${ELEMENT_COLORS[e]}20`, color: ELEMENT_COLORS[e] }}
              title={`${elementEssences[e] || 0} ${ELEMENT_LABEL[e]} essence`}
            >
              <span>{ELEMENT_EMOJI[e]}</span>
              <span>{elementEssences[e] || 0}</span>
            </div>
          ))}
        </div>

        {/* Pull multiplier selector */}
        <div className="p-4">
          <p className="text-[10px] text-white/40 mb-2 uppercase tracking-wider">Jumlah Pull</p>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {PULL_OPTIONS.map((n) => {
              const c = calculateEssencePullCost(n);
              const selected = pullCount === n;
              return (
                <button
                  key={n}
                  onClick={() => setPullCount(n)}
                  disabled={pulling}
                  className={`p-2 rounded-xl text-center transition-all ${selected ? 'ring-2 ring-purple-400' : ''}`}
                  style={{
                    backgroundColor: selected ? '#6c5ce720' : '#0a1519',
                    opacity: pulling ? 0.5 : 1,
                  }}
                >
                  <div className="text-base font-black text-white">{n}×</div>
                  <div className="text-[10px] text-cyan-400 font-bold">{c.toLocaleString('id-ID')} 💎</div>
                </button>
              );
            })}
          </div>

          {/* Pull button */}
          <button
            onClick={handlePull}
            disabled={!canAfford || pulling}
            className="w-full py-3 rounded-xl font-black text-white text-sm active:scale-95 transition-transform disabled:opacity-40"
            style={{
              background: canAfford
                ? 'linear-gradient(135deg, #6c5ce7, #a855f7)'
                : '#212c30',
            }}
          >
            {pulling ? '🌟 Mengocok Essence...' : `🌟 Tarik ${pullCount}× — ${cost.toLocaleString('id-ID')} 💎`}
          </button>

          {errorMsg && (
            <p className="mt-2 text-center text-xs text-red-400">{errorMsg}</p>
          )}

          {/* Drop info */}
          <p className="mt-3 text-center text-[10px] text-white/40">
            🎁 Setiap pull: 1-5 essence random (1-3 sering, 4-5 jackpot langka)
          </p>
        </div>
      </motion.div>

      {/* Results Modal */}
      <AnimatePresence>
        {results && (
          <EssenceResultsModal
            results={results}
            onClose={closeResults}
            onPullAgain={() => { closeResults(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// Results modal
// ============================================================
function EssenceResultsModal({
  results,
  onClose,
  onPullAgain,
}: {
  results: EssencePullResult[];
  onClose: () => void;
  onPullAgain: () => void;
}) {
  const aggregated = aggregateEssenceResults(results);
  const total = results.reduce((acc, r) => acc + r.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-md rounded-2xl overflow-hidden max-h-[80vh] flex flex-col"
        style={{ backgroundColor: '#1a1a2e' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #ffffff10' }}>
          <h3 className="font-black text-white text-sm">🧬 Hasil Pull</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aggregated summary */}
        <div className="px-4 py-3" style={{ borderBottom: '1px solid #ffffff10' }}>
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
            Total: {total} essence dari {results.length} pull
          </p>
          <div className="grid grid-cols-3 gap-2">
            {ESSENCE_TYPES.map((e) => {
              const amt = aggregated[e];
              if (amt === 0) return null;
              return (
                <div
                  key={e}
                  className="p-2 rounded-lg text-center"
                  style={{ backgroundColor: `${ELEMENT_COLORS[e]}20`, border: `1px solid ${ELEMENT_COLORS[e]}60` }}
                >
                  <div className="text-2xl">{ELEMENT_EMOJI[e]}</div>
                  <div className="text-[9px] text-white/60 mt-0.5">{ELEMENT_LABEL[e]}</div>
                  <div className="text-base font-black" style={{ color: ELEMENT_COLORS[e] }}>
                    +{amt}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Per-pull breakdown (scrollable) */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Detail per pull</p>
          <div className="grid grid-cols-10 gap-1">
            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.02, type: 'spring', stiffness: 200 }}
                className="aspect-square rounded-lg flex items-center justify-center text-lg font-black"
                style={{
                  backgroundColor: `${ELEMENT_COLORS[r.essence]}30`,
                  border: `1px solid ${ELEMENT_COLORS[r.essence]}`,
                  color: ELEMENT_COLORS[r.essence],
                }}
                title={`${ELEMENT_LABEL[r.essence]} +${r.amount}`}
              >
                {r.amount > 1 ? `+${r.amount}` : ELEMENT_EMOJI[r.essence]}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 flex gap-2" style={{ borderTop: '1px solid #ffffff10' }}>
          <button
            onClick={onPullAgain}
            className="flex-1 py-2 rounded-xl font-bold text-white text-xs"
            style={{ backgroundColor: '#6c5ce7' }}
          >
            Tutup
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
