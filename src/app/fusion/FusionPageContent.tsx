'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore } from '@/store/collectionStore';
import { useFusionStore } from '@/store/fusionStore';
import {
  ArrowLeft, Swords, Zap, Shield, Heart, X, Loader2, Check,
  Flame, Droplets, Leaf, Zap as Lightning, Brain, Circle, Sparkles,
  Star, ChevronRight, Info, Lock
} from 'lucide-react';
import type { FusedPokemon, ElementEssence } from '@/types';
import { RARITY_COLORS, RARITY_BORDER_COLORS, EVOLUTION_REQUIREMENTS } from '@/types';

const ELEMENT_COLORS: Record<string, string> = {
  FIRE: '#ff6b35', WATER: '#4facfe', GRASS: '#4bddb7',
  ELECTRIC: '#ffd93d', PSYCHIC: '#c77dff', NORMAL: '#a8a8a8',
};

const ELEMENT_ICONS: Record<string, string> = {
  FIRE: '🔥', WATER: '💧', GRASS: '🌿',
  ELECTRIC: '⚡', PSYCHIC: '🔮', NORMAL: '⚪',
};

const ESSENCE_LABELS: Record<ElementEssence, string> = {
  FIRE_ESSENCE: 'Fire', WATER_ESSENCE: 'Water', GRASS_ESSENCE: 'Grass',
  ELECTRIC_ESSENCE: 'Electric', PSYCHIC_ESSENCE: 'Psychic', NORMAL_ESSENCE: 'Normal',
};

const NEXT_TIER: Record<string, string> = {
  NONE: 'LIMITED_EDITION',
  LIMITED_EDITION: 'LEGENDARY',
  LEGENDARY: 'MYTHICAL',
  MYTHICAL: 'MYTHICAL',
};

const TIER_LABELS: Record<string, string> = {
  NONE: 'Standard', LIMITED_EDITION: 'Limited', LEGENDARY: 'Legendary', MYTHICAL: 'Mythical',
};

const TIER_ICONS: Record<string, string> = {
  NONE: '⚡', LIMITED_EDITION: '🌟', LEGENDARY: '🏆', MYTHICAL: '💎',
};

const TIER_COLORS_HEX: Record<string, string> = {
  NONE: '#f0bf63', LIMITED_EDITION: '#ff8c00', LEGENDARY: '#c0392b', MYTHICAL: '#e91e8c',
};

// Fused Pokemon card with glow + animation
function FusedCard({ fp, selected, onClick, disabled, showNextTier }: {
  fp: FusedPokemon; selected?: boolean; onClick?: () => void; disabled?: boolean; showNextTier?: boolean;
}) {
  const tier = fp.evolutionTier;
  const nextTier = showNextTier ? NEXT_TIER[tier] : null;
  const color = RARITY_COLORS[fp.rarity as keyof typeof RARITY_COLORS] || '#f0bf63';
  const borderColor = RARITY_BORDER_COLORS[fp.rarity as keyof typeof RARITY_BORDER_COLORS] || '#f0bf6380';

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`relative rounded-2xl overflow-hidden transition-all ${selected ? 'ring-2 ring-yellow-400 scale-95' : ''}`}
      style={{
        backgroundColor: '#1a1a2e',
        border: `2px solid ${borderColor}`,
        boxShadow: selected ? `0 0 20px ${color}60` : `0 0 8px ${borderColor}30`,
      }}
    >
      {/* Tier glow */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}, transparent 70%)` }}
      />
      <div className="relative p-3">
        <div className="relative">
          <img src={fp.image} alt={fp.name} className="w-full aspect-square object-contain" />
          {/* Tier badge */}
          <div
            className="absolute top-1 left-1 px-1.5 py-0.5 rounded-full text-[9px] font-black flex items-center gap-0.5"
            style={{ backgroundColor: color, color: '#000' }}
          >
            {TIER_ICONS[tier]}
          </div>
          {/* Next tier arrow */}
          {nextTier && nextTier !== fp.evolutionTier && (
            <div
              className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ backgroundColor: TIER_COLORS_HEX[nextTier] }}
            >
              <ChevronRight className="w-3 h-3 text-black" />
            </div>
          )}
          {selected && (
            <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
              <Check className="w-3 h-3 text-black" />
            </div>
          )}
        </div>
        <p className="text-[10px] font-bold text-white mt-1.5 text-center truncate">{fp.name}</p>
        <p className="text-[9px] text-white/40 text-center">
          HP{toK(fp.baseHp)} ATK{toK(fp.baseAttack)} DEF{toK(fp.baseDefense)}
        </p>
      </div>
    </motion.button>
  );
}

function toK(n: number) { return n >= 100 ? Math.round(n / 100) + '00' : n; }

// Animating particle burst
function ParticleBurst({ show }: { show: boolean }) {
  if (!show) return null;
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const r = 60 + Math.random() * 40;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    return (
      <motion.div
        key={i}
        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
        animate={{ x, y, opacity: 0, scale: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute w-2 h-2 rounded-full"
        style={{ backgroundColor: ['#f0bf63', '#6c5ce7', '#4bddb7', '#ff8c00', '#e91e8c'][i % 5] }}
      />
    );
  });
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {particles}
    </div>
  );
}

// Step indicator for evolution
function StepIndicator({ step, total, label }: { step: number; total: number; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-1">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < step ? 'text-black' : 'text-white/40 border border-white/20'}`}
            style={{ backgroundColor: i < step ? '#4bddb7' : 'transparent' }}
          >
            {i < step ? <Check className="w-3 h-3" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-8 h-0.5 ${i < step ? 'bg-green-400' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
      <span className="text-xs text-white/50 ml-2">{label}</span>
    </div>
  );
}

// Stat bar
function StatBar({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-black/30">
      <div style={{ color }}>{icon}</div>
      <div className="flex-1">
        <div className="flex justify-between">
          <span className="text-[10px] text-white/50">{label}</span>
          <span className="text-xs font-bold text-white">{value}</span>
        </div>
        <div className="h-1 rounded-full mt-1" style={{ backgroundColor: '#1a1a2e' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (value / 500) * 100)}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}

export default function FusionPageContent() {
  const router = useRouter();
  const {
    ownedPokemon, fusedPokemon, ownedCards, diamonds, stardust, elementEssences,
    spendStardust, spendDiamonds, addStardust
  } = useCollectionStore();
  const fusionStore = useFusionStore();

  const [tab, setTab] = useState<'fuse' | 'evolve'>('fuse');
  const [ready, setReady] = useState(false);

  // Fuse state
  const [selectedA, setSelectedA] = useState<number | null>(null);
  const [selectedB, setSelectedB] = useState<number | null>(null);
  const [isFusing, setIsFusing] = useState(false);
  const [fuseSuccess, setFuseSuccess] = useState<FusedPokemon | null>(null);
  const [fuseError, setFuseError] = useState<string | null>(null);
  const [showFuseParticles, setShowFuseParticles] = useState(false);

  // Evolve state
  const [evolveStep, setEvolveStep] = useState(0); // 0=select, 1=materials, 2=confirm
  const [evolveTarget, setEvolveTarget] = useState<FusedPokemon | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [selectedSacrificePokemon, setSelectedSacrificePokemon] = useState<number | null>(null);
  const [selectedEssence, setSelectedEssence] = useState<ElementEssence | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolveSuccess, setEvolveSuccess] = useState(false);

  useEffect(() => { setTimeout(() => setReady(true), 50); }, []);

  // Only REST API Pokemon for fusion
  const fuseablePokemon = ownedPokemon.filter(p => p.pokemonId < 10000);

  // Fused Pokemon eligible for evolution (tier < MYTHICAL)
  const evolvableFused = fusedPokemon.filter(fp =>
    fp.evolutionTier !== 'MYTHICAL' && fp.rarity !== 'COMMON' && fp.rarity !== 'UNCOMMON'
  );

  // ===== FUSION =====
  const handleSelect = (pokemonId: number) => {
    if (selectedA === pokemonId) { setSelectedA(null); }
    else if (selectedB === pokemonId) { setSelectedB(null); }
    else if (selectedA === null) { setSelectedA(pokemonId); }
    else if (selectedB === null) { setSelectedB(pokemonId); }
    else { setSelectedB(pokemonId); }
    setFuseError(null);
    setFuseSuccess(null);
  };

  const pokeA = fuseablePokemon.find(p => p.pokemonId === selectedA);
  const pokeB = fuseablePokemon.find(p => p.pokemonId === selectedB);
  const fusionCheck = (pokeA && pokeB) ? fusionStore.canFuse(pokeA.pokemonId, pokeB.pokemonId) : null;

  const handleFuse = async () => {
    if (!pokeA || !pokeB || !fusionCheck?.possible) return;
    setIsFusing(true);
    setFuseError(null);

    // Deduct diamonds via fusionStore (already done in fusePokemon)
    await new Promise(r => setTimeout(r, 1500));
    setShowFuseParticles(true);
    await new Promise(r => setTimeout(r, 800));
    setShowFuseParticles(false);

    const result = fusionStore.fusePokemon(pokeA.pokemonId, pokeB.pokemonId);
    if (result.success && result.fusedPokemon) {
      setFuseSuccess(result.fusedPokemon);
      setSelectedA(null);
      setSelectedB(null);
    } else {
      setFuseError(result.error || 'Fusion failed');
    }
    setIsFusing(false);
  };

  // ===== EVOLUTION =====
  const nextTier = evolveTarget ? (NEXT_TIER[evolveTarget.evolutionTier || 'NONE'] || null) : null;
  const requirements = nextTier ? EVOLUTION_REQUIREMENTS[nextTier as keyof typeof EVOLUTION_REQUIREMENTS] : null;

  const canEvolve = () => {
    if (!evolveTarget || !nextTier || !requirements) return { possible: false, reason: '' };
    if (stardust < requirements.stardust) return { possible: false, reason: `Butuh ${requirements.stardust}✨ (kamu: ${stardust})` };
    if (selectedCards.length < requirements.japaneseCardCount) return { possible: false, reason: `Pilih ${requirements.japaneseCardCount} 🀄` };
    if (requirements.additionalPokemon) {
      if (!selectedSacrificePokemon) return { possible: false, reason: 'Pilih 1 Pokemon untuk dikorbankan' };
    }
    if (nextTier === 'MYTHICAL') {
      if (!selectedEssence) return { possible: false, reason: 'Pilih Elemental Essence untuk MYTHICAL' };
      const essAmount = elementEssences[selectedEssence];
      if (essAmount < 1) return { possible: false, reason: `Butuh 1 ${ESSENCE_LABELS[selectedEssence]} Essence` };
    }
    return { possible: true, reason: '' };
  };

  const handleEvolve = async () => {
    if (!evolveTarget || !nextTier || !requirements) return;
    const check = canEvolve();
    if (!check.possible) return;

    setIsEvolving(true);

    // Spend stardust
    if (!spendStardust(requirements.stardust)) {
      setIsEvolving(false);
      return;
    }

    // Spend element essence for MYTHICAL
    if (nextTier === 'MYTHICAL' && selectedEssence) {
      const { spendElementEssence } = useCollectionStore.getState();
      spendElementEssence(selectedEssence, 1);
    }

    await new Promise(r => setTimeout(r, 2000));

    // Use collectionStore directly for evolution
    const { evolveFusedPokemon } = useCollectionStore.getState();
    const success = evolveFusedPokemon(
      evolveTarget.id,
      nextTier as 'LIMITED_EDITION' | 'LEGENDARY' | 'MYTHICAL',
      selectedCards,
      selectedSacrificePokemon || undefined
    );

    if (success) {
      setEvolveSuccess(true);
      setShowFuseParticles(true);
      setTimeout(() => setShowFuseParticles(false), 1500);
    }

    setEvolveTarget(null);
    setSelectedCards([]);
    setSelectedSacrificePokemon(null);
    setSelectedEssence(null);
    setEvolveStep(0);
    setIsEvolving(false);
  };

  const handleCardToggle = (cardId: string) => {
    setSelectedCards(prev =>
      prev.includes(cardId) ? prev.filter(c => c !== cardId) : [...prev, cardId]
    );
  };

  const sacrificeOptions = ownedPokemon.filter(p =>
    p.pokemonId < 10000 &&
    p.rarity === 'ULTRA_RARE' &&
    p.pokemonId !== evolveTarget?.parentPokemonIds[0] &&
    p.pokemonId !== evolveTarget?.parentPokemonIds[1]
  );

  const availableEssences = (Object.keys(elementEssences) as ElementEssence[]).filter(
    e => elementEssences[e] > 0
  );

  if (!ready) return null;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0a1519' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 h-[72px] flex items-center justify-between" style={{ backgroundColor: '#162125' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/collection')} className="p-2 rounded-xl hover:bg-white/10 active:scale-95 transition-transform">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <span className="text-white font-bold text-base">Fusion</span>
            <p className="text-[10px] text-white/40">Gabungkan & Evoluasi Pokemon</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ backgroundColor: '#ff8c0015' }}>
            <span className="text-sm">✨</span>
            <span className="text-xs font-bold" style={{ color: '#ff8c00' }}>{stardust.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ backgroundColor: '#06b6d415' }}>
            <span className="text-sm">💎</span>
            <span className="text-xs font-bold text-cyan-400">{diamonds.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-3">
        <div className="flex rounded-2xl overflow-hidden" style={{ backgroundColor: '#1a1a2e' }}>
          <button
            onClick={() => setTab('fuse')}
            className="flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={tab === 'fuse' ? { backgroundColor: '#6c5ce7', color: '#fff' } : { color: 'rgba(255,255,255,0.4)' }}
          >
            <Sparkles className="w-4 h-4" /> Fuse
          </button>
          <button
            onClick={() => setTab('evolve')}
            className="flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={tab === 'evolve' ? { backgroundColor: '#ff8c00', color: '#fff' } : { color: 'rgba(255,255,255,0.4)' }}
          >
            <Star className="w-4 h-4" /> Evolution
          </button>
        </div>
      </div>

      {/* ============== FUSION TAB ============== */}
      <AnimatePresence mode="wait">
        {tab === 'fuse' && (
          <motion.div
            key="fuse"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-4 pt-4 space-y-4"
          >
            {/* Fusion Slots */}
            <div className="rounded-2xl p-4" style={{ backgroundColor: '#1a1a2e', border: '1px solid #6c5ce730' }}>
              <div className="flex items-center justify-center gap-4">
                {/* Slot A */}
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-white/30 mb-2">Pokemon A</p>
                  <div
                    className={`aspect-square rounded-2xl flex items-center justify-center overflow-hidden transition-all ${pokeA ? 'ring-2 ring-green-400' : 'border border-dashed border-white/20'}`}
                    style={{ backgroundColor: '#0a1519' }}
                  >
                    {pokeA ? (
                      <button onClick={() => setSelectedA(null)} className="w-full h-full relative">
                        <img src={pokeA.image} alt={pokeA.name} className="w-full h-full object-contain p-2" />
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center" style={{ opacity: 0.8 }}>
                          <X className="w-3 h-3 text-white" />
                        </div>
                        <div
                          className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white py-1 truncate"
                          style={{ backgroundColor: RARITY_COLORS[pokeA.rarity as keyof typeof RARITY_COLORS] }}
                        >
                          {pokeA.name.slice(0, 10)}
                        </div>
                      </button>
                    ) : (
                      <span className="text-white/20 text-3xl">?</span>
                    )}
                  </div>
                </div>

                {/* Fusion Symbol */}
                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    animate={selectedA && selectedB ? { scale: [1, 1.3, 1], rotate: [0, 180, 360] } : {}}
                    transition={{ duration: 0.8, repeat: selectedA && selectedB ? Infinity : 0 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#6c5ce7' }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                  </motion.div>
                  {selectedA && selectedB && fusionCheck?.possible && fusionCheck.cost && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-xs font-bold text-yellow-400"
                    >
                      💎{fusionCheck.cost}
                    </motion.span>
                  )}
                </div>

                {/* Slot B */}
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-white/30 mb-2">Pokemon B</p>
                  <div
                    className={`aspect-square rounded-2xl flex items-center justify-center overflow-hidden transition-all ${pokeB ? 'ring-2 ring-green-400' : 'border border-dashed border-white/20'}`}
                    style={{ backgroundColor: '#0a1519' }}
                  >
                    {pokeB ? (
                      <button onClick={() => setSelectedB(null)} className="w-full h-full relative">
                        <img src={pokeB.image} alt={pokeB.name} className="w-full h-full object-contain p-2" />
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center" style={{ opacity: 0.8 }}>
                          <X className="w-3 h-3 text-white" />
                        </div>
                        <div
                          className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white py-1 truncate"
                          style={{ backgroundColor: RARITY_COLORS[pokeB.rarity as keyof typeof RARITY_COLORS] }}
                        >
                          {pokeB.name.slice(0, 10)}
                        </div>
                      </button>
                    ) : (
                      <span className="text-white/20 text-3xl">?</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Result Preview */}
              {pokeA && pokeB && fusionCheck && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 rounded-xl text-center"
                  style={{ backgroundColor: '#0a1519' }}
                >
                  {fusionCheck.possible ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs text-white/60">Hasil:</span>
                        <span
                          className="px-3 py-1 rounded-full text-sm font-black"
                          style={{ backgroundColor: RARITY_COLORS[fusionCheck.resultRarity as keyof typeof RARITY_COLORS], color: '#000' }}
                        >
                          {TIER_ICONS['LIMITED_EDITION']} {fusionCheck.resultRarity}
                        </span>
                      </div>
                      <div className="flex items-center justify-center gap-3 text-xs">
                        <span className="text-red-400">❤️ +{fusionCheck.resultRarity === 'LIMITED_EDITION' ? 15 : fusionCheck.resultRarity === 'LEGENDARY' ? 20 : 30} HP</span>
                        <span className="text-orange-400">⚔️ +{fusionCheck.resultRarity === 'LIMITED_EDITION' ? 10 : fusionCheck.resultRarity === 'LEGENDARY' ? 15 : 20} ATK</span>
                        <span className="text-blue-400">🛡️ +5 DEF</span>
                      </div>
                      {diamonds < (fusionCheck.cost ?? 0) && (
                        <p className="text-xs text-red-400">💎 Diamond tidak cukup ({diamonds}/{fusionCheck.cost ?? 0})</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-red-400">{fusionCheck.reason}</p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Error */}
            {fuseError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-xl text-center text-sm text-red-400 flex items-center justify-center gap-2"
                style={{ backgroundColor: '#ff2d5515' }}
              >
                <X className="w-4 h-4" /> {fuseError}
              </motion.div>
            )}

            {/* Success */}
            {fuseSuccess && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl p-6 text-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #4bddb720, #6c5ce720)', border: '1px solid #4bddb740' }}
              >
                <ParticleBurst show={showFuseParticles} />
                <div className="relative">
                  <motion.img
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    src={fuseSuccess.image}
                    alt={fuseSuccess.name}
                    className="w-28 h-28 object-contain mx-auto mb-3"
                  />
                  <div
                    className="absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-black"
                    style={{ backgroundColor: RARITY_COLORS[fuseSuccess.rarity as keyof typeof RARITY_COLORS], color: '#000' }}
                  >
                    {TIER_ICONS[fuseSuccess.evolutionTier]} {fuseSuccess.rarity}
                  </div>
                </div>
                <p className="text-lg font-bold text-white mb-1">🎉 Fusion Berhasil!</p>
                <p className="text-sm text-white/60">{fuseSuccess.name}</p>
                <div className="flex items-center justify-center gap-3 mt-3 text-xs text-white/40">
                  <span>❤️ {fuseSuccess.baseHp}</span>
                  <span>⚔️ {fuseSuccess.baseAttack}</span>
                  <span>🛡️ {fuseSuccess.baseDefense}</span>
                </div>
                <button
                  onClick={() => setFuseSuccess(null)}
                  className="mt-4 px-6 py-2 rounded-xl font-bold text-sm text-black"
                  style={{ backgroundColor: '#4bddb7' }}
                >
                  Lihat di Koleksi
                </button>
              </motion.div>
            )}

            {/* Fuse Button */}
            {pokeA && pokeB && fusionCheck?.possible && !fuseSuccess && (
              <button
                onClick={handleFuse}
                disabled={isFusing || diamonds < (fusionCheck?.cost || 0)}
                className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' }}
              >
                {isFusing ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Memfusion...</>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Fuse Sekarang (💎{fusionCheck.cost})</>
                )}
              </button>
            )}

            {/* Pokemon Grid */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-3.5 h-3.5 text-white/30" />
                <p className="text-xs text-white/40">Pilih 2 Pokemon untuk di-fusion</p>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {fuseablePokemon.map(p => {
                  const isSelected = selectedA === p.pokemonId || selectedB === p.pokemonId;
                  return (
                    <button
                      key={p.pokemonId}
                      onClick={() => handleSelect(p.pokemonId)}
                      className={`relative rounded-xl overflow-hidden transition-all ${isSelected ? 'ring-2 ring-yellow-400 scale-95' : 'hover:scale-105'}`}
                      style={{ backgroundColor: '#1a1a2e' }}
                    >
                      <img src={p.image} alt={p.name} className="w-full aspect-square object-contain p-1.5" />
                      <div
                        className="text-[8px] font-bold text-white text-center py-0.5 truncate"
                        style={{ backgroundColor: RARITY_COLORS[p.rarity as keyof typeof RARITY_COLORS] }}
                      >
                        {p.name.slice(0, 8)}
                      </div>
                      {isSelected && (
                        <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-black" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {fuseablePokemon.length === 0 && (
                <div className="text-center p-8 rounded-xl" style={{ backgroundColor: '#1a1a2e' }}>
                  <span className="text-4xl mb-2 block">🎰</span>
                  <p className="text-white/40 text-sm">Tangkap Pokemon dari Gacha dulu!</p>
                  <button onClick={() => router.push('/gacha')} className="mt-3 px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ backgroundColor: '#6c5ce7' }}>
                    Buka Gacha
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ============== EVOLUTION TAB ============== */}
        {tab === 'evolve' && (
          <motion.div
            key="evolve"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4 pt-4 space-y-4"
          >
            {/* Success */}
            {evolveSuccess && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl p-6 text-center relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #ff8c0020, #e91e8c20)', border: '1px solid #ff8c050' }}
              >
                <ParticleBurst show={showFuseParticles} />
                <div className="text-5xl mb-3">💎</div>
                <p className="text-lg font-bold text-white mb-1">Evolution Sukses!</p>
                <p className="text-sm text-white/60">Pokemon naik tier ke {nextTier}!</p>
                <button
                  onClick={() => setEvolveSuccess(false)}
                  className="mt-4 px-6 py-2 rounded-xl font-bold text-sm text-black"
                  style={{ backgroundColor: '#ff8c00' }}
                >
                  Oke
                </button>
              </motion.div>
            )}

            {/* Step 0: Select Pokemon to evolve */}
            {!evolveTarget && !evolveSuccess && (
              <div>
                <StepIndicator step={0} total={3} label="Pilih Pokemon" />
                <div className="rounded-2xl p-4" style={{ backgroundColor: '#1a1a2e' }}>
                  <p className="text-xs text-white/40 mb-3 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400" /> Pilih Fused Pokemon untuk di-evolusi
                  </p>
                  {evolvableFused.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="text-4xl block mb-2">🏆</span>
                      <p className="text-white/40 text-sm">Belum ada Fused Pokemon untuk di-evolusi</p>
                      <p className="text-white/20 text-xs mt-1">Fuse 2 Pokemon UR+ terlebih dahulu</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {evolvableFused.map(fp => {
                        const next = NEXT_TIER[fp.evolutionTier];
                        return (
                          <div
                            key={fp.id}
                            className="rounded-xl overflow-hidden"
                            style={{ backgroundColor: '#0a1519', border: `2px solid ${RARITY_BORDER_COLORS[fp.rarity as keyof typeof RARITY_BORDER_COLORS]}40` }}
                          >
                            <button onClick={() => { setEvolveTarget(fp); setEvolveStep(1); setSelectedCards([]); setSelectedSacrificePokemon(null); setSelectedEssence(null); }} className="w-full">
                              <div className="relative p-2">
                                <img src={fp.image} alt={fp.name} className="w-full aspect-square object-contain" />
                                <div
                                  className="absolute top-1 left-1 px-1 py-0.5 rounded-full text-[8px] font-black flex items-center gap-0.5"
                                  style={{ backgroundColor: RARITY_COLORS[fp.rarity as keyof typeof RARITY_COLORS], color: '#000' }}
                                >
                                  {TIER_ICONS[fp.evolutionTier]}
                                </div>
                              </div>
                              <div className="p-2 text-center">
                                <p className="text-[10px] font-bold text-white truncate">{fp.name}</p>
                                <p className="text-[9px] text-white/40 mt-0.5">
                                  ❤️{fp.baseHp} ⚔️{fp.baseAttack}
                                </p>
                                <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-bold" style={{ color: TIER_COLORS_HEX[next] }}>
                                  {TIER_ICONS[next]} {TIER_LABELS[next]}
                                  <ChevronRight className="w-2.5 h-2.5" />
                                </div>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 1: Material selection */}
            {evolveTarget && nextTier && requirements && evolveStep === 1 && (
              <div className="space-y-4">
                <StepIndicator step={1} total={3} label="Pilih Material" />

                {/* Target Card */}
                <div className="rounded-2xl p-4" style={{ backgroundColor: '#1a1a2e', border: `2px solid ${RARITY_BORDER_COLORS[evolveTarget.rarity as keyof typeof RARITY_BORDER_COLORS]}` }}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={evolveTarget.image} alt={evolveTarget.name} className="w-20 h-20 object-contain rounded-xl" style={{ backgroundColor: ELEMENT_COLORS[evolveTarget.element] + '20' }} />
                      <div
                        className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-[9px] font-black"
                        style={{ backgroundColor: RARITY_COLORS[evolveTarget.rarity as keyof typeof RARITY_COLORS], color: '#000' }}
                      >
                        {TIER_ICONS[evolveTarget.evolutionTier]}
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{evolveTarget.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold text-black" style={{ backgroundColor: RARITY_COLORS[evolveTarget.rarity as keyof typeof RARITY_COLORS] }}>
                          {TIER_LABELS[evolveTarget.evolutionTier]}
                        </span>
                        <ChevronRight className="w-4 h-4 text-white/30" />
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold text-black" style={{ backgroundColor: TIER_COLORS_HEX[nextTier] }}>
                          {TIER_ICONS[nextTier]} {TIER_LABELS[nextTier]}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => { setEvolveTarget(null); setEvolveStep(0); }} className="p-2 rounded-xl hover:bg-white/10">
                      <X className="w-4 h-4 text-white/40" />
                    </button>
                  </div>
                </div>

                {/* Material checklist */}
                <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: '#1a1a2e' }}>
                  <p className="text-xs font-bold text-white/60 mb-3">📋 Material</p>

                  {/* Stardust */}
                  <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: '#0a1519' }}>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">✨</span>
                      <div>
                        <p className="text-sm font-bold text-white">Stardust</p>
                        <p className="text-[10px] text-white/40">Biaya evolution</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${stardust >= requirements.stardust ? 'text-green-400' : 'text-red-400'}`}>
                        {stardust} / {requirements.stardust}
                      </span>
                      <p className="text-[9px] text-white/30">✨</p>
                    </div>
                  </div>

                  {/* Japanese Cards */}
                  <div className="p-3 rounded-xl" style={{ backgroundColor: '#0a1519' }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🀄</span>
                        <div>
                          <p className="text-sm font-bold text-white">Kartu Jepang</p>
                          <p className="text-[10px] text-white/40"> akan di-burn</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${selectedCards.length >= requirements.japaneseCardCount ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedCards.length} / {requirements.japaneseCardCount}
                      </span>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                      {ownedCards.slice(0, 12).map(oc => {
                        const isSelected = selectedCards.includes(oc.cardId);
                        return (
                          <button
                            key={oc.cardId}
                            onClick={() => handleCardToggle(oc.cardId)}
                            className={`relative rounded-lg overflow-hidden transition-all ${isSelected ? 'ring-2 ring-yellow-400 scale-110' : 'hover:scale-105'}`}
                            style={{ backgroundColor: '#1a1a2e' }}
                          >
                            <div className="aspect-square flex items-center justify-center text-base sm:text-xl" style={{ backgroundColor: ELEMENT_COLORS[oc.card.element] + '20' }}>
                              {oc.card.japanese}
                            </div>
                            {isSelected && (
                              <div className="absolute inset-0 bg-yellow-400/30 flex items-center justify-center">
                                <Check className="w-4 h-4 text-black" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {ownedCards.length === 0 && (
                      <p className="text-xs text-white/30 text-center py-2">Tidak punya kartu Jepang</p>
                    )}
                  </div>

                  {/* Sacrifice Pokemon */}
                  {requirements.additionalPokemon && (
                    <div className="p-3 rounded-xl" style={{ backgroundColor: '#0a1519' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">⚔️</span>
                          <div>
                            <p className="text-sm font-bold text-white">Pokemon Sacrificial</p>
                            <p className="text-[10px] text-red-400/60"> akan di-hapus</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${selectedSacrificePokemon ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedSacrificePokemon ? '1 selected' : '0 / 1'}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {sacrificeOptions.map(p => {
                          const isSelected = selectedSacrificePokemon === p.pokemonId;
                          return (
                            <button
                              key={p.pokemonId}
                              onClick={() => setSelectedSacrificePokemon(isSelected ? null : p.pokemonId)}
                              className={`relative rounded-lg overflow-hidden transition-all ${isSelected ? 'ring-2 ring-red-400 scale-110' : 'hover:scale-105'}`}
                              style={{ backgroundColor: '#1a1a2e' }}
                            >
                              <img src={p.image} alt={p.name} className="w-full aspect-square object-contain p-1" />
                              {isSelected && (
                                <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center">
                                  <span className="text-lg">✕</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {sacrificeOptions.length === 0 && (
                        <p className="text-xs text-white/30 text-center py-2">Tidak ada Pokemon UR untuk dikorbankan</p>
                      )}
                    </div>
                  )}

                  {/* Elemental Essence - MYTHICAL only */}
                  {nextTier === 'MYTHICAL' && (
                    <div className="p-3 rounded-xl" style={{ backgroundColor: '#0a1519' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🌟</span>
                          <div>
                            <p className="text-sm font-bold text-white">Elemental Essence</p>
                            <p className="text-[10px] text-pink-400/60">Wajib untuk MYTHICAL</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${selectedEssence && elementEssences[selectedEssence] >= 1 ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedEssence ? `1 ${ESSENCE_LABELS[selectedEssence]}` : '0 / 1'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {(Object.keys(elementEssences) as ElementEssence[]).map(ess => (
                          <button
                            key={ess}
                            onClick={() => setSelectedEssence(selectedEssence === ess ? null : ess)}
                            disabled={elementEssences[ess] < 1}
                            className={`p-2 rounded-xl flex items-center gap-2 transition-all ${selectedEssence === ess ? 'ring-2 ring-pink-400' : ''} ${elementEssences[ess] < 1 ? 'opacity-30' : ''}`}
                            style={{ backgroundColor: '#1a1a2e', border: `1px solid ${elementEssences[ess] > 0 ? ELEMENT_COLORS[ess.split('_')[0]] + '40' : '#ffffff10'}` }}
                          >
                            <span>{ELEMENT_ICONS[ess.split('_')[0]] || '⚪'}</span>
                            <div>
                              <p className="text-[10px] font-bold text-white">{ESSENCE_LABELS[ess]}</p>
                              <p className="text-[9px] text-white/40">{elementEssences[ess]} owned</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status check */}
                {(() => {
                  const check = canEvolve();
                  return (
                    <div
                      className="p-3 rounded-xl text-center text-sm flex items-center justify-center gap-2"
                      style={{ backgroundColor: check.possible ? '#4bddb710' : '#ff2d5510' }}
                    >
                      {!check.possible ? (
                        <>
                          <Lock className="w-4 h-4 text-red-400" />
                          <span className="text-red-400">{check.reason}</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400">Semua material terpenuhi!</span>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* Next button */}
                <button
                  onClick={() => setEvolveStep(2)}
                  disabled={!canEvolve().possible}
                  className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${TIER_COLORS_HEX[nextTier]}, ${RARITY_COLORS[nextTier as keyof typeof RARITY_COLORS]})` }}
                >
                  Lanjut ke Konfirmasi <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step 2: Confirm */}
            {evolveTarget && nextTier && requirements && evolveStep === 2 && (
              <div className="space-y-4">
                <StepIndicator step={2} total={3} label="Konfirmasi" />

                <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: '#1a1a2e', border: `1px solid ${TIER_COLORS_HEX[nextTier]}40` }}>
                  {/* Before/After */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden" style={{ backgroundColor: '#0a1519', border: `2px solid ${RARITY_BORDER_COLORS[evolveTarget.rarity as keyof typeof RARITY_BORDER_COLORS]}` }}>
                        <img src={evolveTarget.image} alt={evolveTarget.name} className="w-full h-full object-contain p-2" />
                      </div>
                      <p className="text-xs font-bold text-white mt-1">{evolveTarget.name}</p>
                      <p className="text-[10px] text-white/40">{TIER_LABELS[evolveTarget.evolutionTier]}</p>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-3xl"
                    >
                      →
                    </motion.div>
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden relative" style={{ backgroundColor: '#0a1519', border: `2px solid ${TIER_COLORS_HEX[nextTier]}` }}>
                        <img src={evolveTarget.image} alt={evolveTarget.name} className="w-full h-full object-contain p-2" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <span className="text-3xl">{TIER_ICONS[nextTier]}</span>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-white mt-1">{evolveTarget.name}</p>
                      <p className="text-[10px] font-bold" style={{ color: TIER_COLORS_HEX[nextTier] }}>{TIER_LABELS[nextTier]}</p>
                    </div>
                  </div>

                  {/* Stat Preview */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <StatBar icon={<Heart className="w-3 h-3" />} label="HP" value={evolveTarget.baseHp + requirements.statBonus.hp} color="#ff6b6b" />
                    <StatBar icon={<Swords className="w-3 h-3" />} label="ATK" value={evolveTarget.baseAttack + requirements.statBonus.attack} color="#ff8c35" />
                    <StatBar icon={<Shield className="w-3 h-3" />} label="DEF" value={evolveTarget.baseDefense + requirements.statBonus.defense} color="#4facfe" />
                    <StatBar icon={<Zap className="w-3 h-3" />} label="SPD" value={evolveTarget.baseSpeed + requirements.statBonus.speed} color="#ffd93d" />
                  </div>

                  {/* Cost breakdown */}
                  <div className="rounded-xl p-3 text-left mb-4" style={{ backgroundColor: '#0a1519' }}>
                    <p className="text-xs font-bold text-white/60 mb-2">💸 Biaya:</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">✨ Stardust</span>
                        <span className="text-red-400">-{requirements.stardust}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">🀄 Kartu Jepang</span>
                        <span className="text-red-400">-{selectedCards.length} (burn)</span>
                      </div>
                      {selectedSacrificePokemon && (
                        <div className="flex justify-between">
                          <span className="text-white/60">⚔️ Pokemon Sacrificial</span>
                          <span className="text-red-400">-1 (delete)</span>
                        </div>
                      )}
                      {selectedEssence && (
                        <div className="flex justify-between">
                          <span className="text-white/60">🌟 Elemental Essence</span>
                          <span className="text-red-400">-1 {ESSENCE_LABELS[selectedEssence]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Warning */}
                  <div className="flex items-center gap-2 p-3 rounded-xl mb-4" style={{ backgroundColor: '#ff8c0015' }}>
                    <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <p className="text-xs text-white/60 text-left">
                      Material yang dipilih akan di-consume dan tidak bisa dikembalikan.
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setEvolveStep(1)}
                    className="flex-1 py-4 rounded-2xl font-bold text-white transition-all hover:opacity-80 active:scale-95"
                    style={{ backgroundColor: '#2b363b' }}
                  >
                    ← Kembali
                  </button>
                  <button
                    onClick={handleEvolve}
                    disabled={isEvolving}
                    className="flex-1 py-4 rounded-2xl font-bold text-white text-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${TIER_COLORS_HEX[nextTier]}, ${RARITY_COLORS[nextTier as keyof typeof RARITY_COLORS]})` }}
                  >
                    {isEvolving ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Mengevolusi...</>
                    ) : (
                      <>{TIER_ICONS[nextTier]} Evoluasi Sekarang!</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}