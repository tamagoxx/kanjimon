'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore } from '@/store/collectionStore';
import { useFusionStore } from '@/store/fusionStore';
import {
  ArrowLeft, Swords, Sparkles, Zap, Shield, Heart, X, Loader2, Check,
  Flame, Droplets, Leaf, Zap as Lightning, Brain, Circle,
  Star, Trophy, ChevronRight
} from 'lucide-react';
import type { FusedPokemon, ElementEssence, EvolutionTier } from '@/types';
import { RARITY_COLORS, RARITY_BORDER_COLORS, EVOLUTION_REQUIREMENTS } from '@/types';

const ELEMENT_COLORS: Record<string, string> = {
  FIRE: '#ff6b35', WATER: '#4facfe', GRASS: '#4bddb7',
  ELECTRIC: '#ffd93d', PSYCHIC: '#c77dff', NORMAL: '#a8a8a8',
};

const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  FIRE: <Flame className="w-4 h-4" />,
  WATER: <Droplets className="w-4 h-4" />,
  GRASS: <Leaf className="w-4 h-4" />,
  ELECTRIC: <Lightning className="w-4 h-4" />,
  PSYCHIC: <Brain className="w-4 h-4" />,
  NORMAL: <Circle className="w-4 h-4" />,
};

const ESSENCE_ICONS: Record<string, string> = {
  FIRE_ESSENCE: '🔥',
  WATER_ESSENCE: '💧',
  GRASS_ESSENCE: '🌿',
  ELECTRIC_ESSENCE: '⚡',
  PSYCHIC_ESSENCE: '🔮',
  NORMAL_ESSENCE: '⚪',
};

const NEXT_TIER: Record<string, EvolutionTier> = {
  NONE: 'LIMITED_EDITION',
  LIMITED_EDITION: 'LEGENDARY',
  LEGENDARY: 'MYTHICAL',
  MYTHICAL: 'MYTHICAL',
} as const;

const TIER_ORDER: EvolutionTier[] = ['NONE', 'LIMITED_EDITION', 'LEGENDARY', 'MYTHICAL'];
const TIER_LABELS: Record<string, string> = {
  NONE: 'Standard',
  LIMITED_EDITION: 'Limited Edition',
  LEGENDARY: 'Legendary',
  MYTHICAL: 'Mythical',
};

const TIER_ICONS: Record<string, string> = {
  NONE: '⚡',
  LIMITED_EDITION: '🌟',
  LEGENDARY: '🏆',
  MYTHICAL: '💎',
};

export default function FusionPageContent() {
  const router = useRouter();
  const {
    ownedPokemon, fusedPokemon, ownedCards, diamonds, stardust, elementEssences,
    addFusedPokemon, evolveFusedPokemon
  } = useCollectionStore();
  const fusionStore = useFusionStore();

  const [tab, setTab] = useState<'fuse' | 'evolve'>('fuse');
  const [ready, setReady] = useState(false);

  // Fuse state
  const [selectedA, setSelectedA] = useState<number | null>(null);
  const [selectedB, setSelectedB] = useState<number | null>(null);
  const [isFusing, setIsFusing] = useState(false);
  const [fuseSuccess, setFuseSuccess] = useState<string | null>(null);
  const [fuseError, setFuseError] = useState<string | null>(null);

  // Evolve state
  const [evolveTarget, setEvolveTarget] = useState<FusedPokemon | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [selectedSacrificePokemon, setSelectedSacrificePokemon] = useState<number | null>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolveSuccess, setEvolveSuccess] = useState(false);

  useEffect(() => {
    setTimeout(() => setReady(true), 50);
  }, []);

  // Only show Pokemon from REST API (pokemonId < 10000) for fusion
  const fuseablePokemon = ownedPokemon.filter(p => p.pokemonId < 10000);
  // Fused Pokemon that can evolve (UR tier or below, not yet Mythical)
  const evolvableFused = fusedPokemon.filter(fp =>
    fp.rarity === 'ULTRA_RARE' ||
    fp.rarity === 'LIMITED_EDITION' ||
    fp.rarity === 'LEGENDARY'
  );

  // ========== FUSION LOGIC ==========
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
    await new Promise(r => setTimeout(r, 1500));
    const result = fusionStore.fusePokemon(pokeA.pokemonId, pokeB.pokemonId);
    if (result.success) {
      setFuseSuccess(result.fusedPokemonId || 'success');
      setSelectedA(null);
      setSelectedB(null);
    } else {
      setFuseError(result.error || 'Fusion failed');
    }
    setIsFusing(false);
  };

  // ========== EVOLUTION LOGIC ==========
const nextTier = evolveTarget ? NEXT_TIER[evolveTarget.evolutionTier] : null;
  const requirements = nextTier ? EVOLUTION_REQUIREMENTS[nextTier] : null;

  const canEvolve = () => {
    if (!evolveTarget || !nextTier || !requirements) return { possible: false, reason: '' };
    if (nextTier === 'MYTHICAL') {
      if (stardust < requirements.stardust) return { possible: false, reason: `Butuh ${requirements.stardust} Stardust` };
      if (selectedCards.length < requirements.japaneseCardCount) return { possible: false, reason: `Pilih ${requirements.japaneseCardCount} kartu Jepang` };
      if (selectedSacrificePokemon === null) return { possible: false, reason: 'Pilih 1 Pokemon UR/LE untuk dikorbankan' };
      return { possible: true, reason: '' };
    }
    if (nextTier === 'LEGENDARY') {
      if (stardust < requirements.stardust) return { possible: false, reason: `Butuh ${requirements.stardust} Stardust` };
      if (selectedCards.length < requirements.japaneseCardCount) return { possible: false, reason: `Pilih ${requirements.japaneseCardCount} kartu Jepang` };
      if (selectedSacrificePokemon === null) return { possible: false, reason: 'Pilih 1 Pokemon UR untuk dikorbankan' };
      return { possible: true, reason: '' };
    }
    // LIMITED_EDITION
    if (stardust < requirements.stardust) return { possible: false, reason: `Butuh ${requirements.stardust} Stardust` };
    if (selectedCards.length < requirements.japaneseCardCount) return { possible: false, reason: `Pilih ${requirements.japaneseCardCount} kartu Jepang` };
    return { possible: true, reason: '' };
  };

  const handleEvolve = async () => {
    if (!evolveTarget || !nextTier) return;
    const check = canEvolve();
    if (!check.possible) return;
    setIsEvolving(true);
    await new Promise(r => setTimeout(r, 2000));
    const success = evolveFusedPokemon(evolveTarget.id, nextTier as any, selectedCards, selectedSacrificePokemon || undefined);
    if (success) {
      setEvolveSuccess(true);
      setEvolveTarget(null);
      setSelectedCards([]);
      setSelectedSacrificePokemon(null);
    }
    setIsEvolving(false);
  };

  const handleCardToggle = (cardId: string) => {
    setSelectedCards(prev =>
      prev.includes(cardId) ? prev.filter(c => c !== cardId) : [...prev, cardId]
    );
  };

  // Sacrifice Pokemon: URs that aren't the target and aren't already used in a fused Pokemon
  const sacrificeOptions = ownedPokemon.filter(p =>
    p.pokemonId < 10000 &&
    p.rarity === 'ULTRA_RARE' &&
    p.pokemonId !== evolveTarget?.parentPokemonIds[0] &&
    p.pokemonId !== evolveTarget?.parentPokemonIds[1]
  );

  if (!ready) return null;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#0a1519' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: '#162125' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/collection')} className="p-2 rounded-lg hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <span className="text-white font-bold">Fusion & Evolution</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: '#ff8c0020' }}>
            <span>✨</span>
            <span className="text-xs font-bold" style={{ color: '#ff8c00' }}>{stardust}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: '#f0bf6320' }}>
            <span>💎</span>
            <span className="text-xs font-bold" style={{ color: '#f0bf63' }}>{diamonds}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className="flex rounded-xl overflow-hidden" style={{ backgroundColor: '#1a1a2e' }}>
          <button
            onClick={() => setTab('fuse')}
            className={`flex-1 py-3 text-sm font-bold transition-all ${tab === 'fuse' ? 'text-white' : 'text-white/40'}`}
            style={tab === 'fuse' ? { backgroundColor: '#6c5ce7' } : {}}
          >
            ⚔️ Fusion
          </button>
          <button
            onClick={() => setTab('evolve')}
            className={`flex-1 py-3 text-sm font-bold transition-all ${tab === 'evolve' ? 'text-white' : 'text-white/40'}`}
            style={tab === 'evolve' ? { backgroundColor: '#6c5ce7' } : {}}
          >
            ⬆️ Evolution
          </button>
        </div>
      </div>

      {/* FUSION TAB */}
      <AnimatePresence>
        {tab === 'fuse' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pt-4 space-y-4">
            {/* Pokemon Selection */}
            <div>
              <p className="text-xs text-white/40 mb-2">Pilih 2 Pokemon untuk di-fusion:</p>
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
                      <img src={p.image} alt={p.name} className="w-full aspect-square object-contain p-2" />
                      <div
                        className="absolute bottom-0 left-0 right-0 text-center text-[9px] font-bold text-white py-0.5 truncate"
                        style={{ backgroundColor: RARITY_COLORS[p.rarity as keyof typeof RARITY_COLORS] }}
                      >
                        {p.name.slice(0, 8)}
                      </div>
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                          <Check className="w-3 h-3 text-black" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {fuseablePokemon.length === 0 && (
                <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#1a1a2e' }}>
                  <p className="text-white/40 text-sm">Tangkap Pokemon dari gacha dulu!</p>
                </div>
              )}
            </div>

            {/* Selection Preview */}
            {pokeA && pokeB && (
              <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a2e' }}>
                <div className="flex items-center justify-center gap-4 mb-3">
                  <div className="text-center">
                    <img src={pokeA.image} alt={pokeA.name} className="w-16 h-16 object-contain mx-auto" />
                    <p className="text-xs text-white mt-1">{pokeA.name}</p>
                  </div>
                  <div className="text-2xl">⚡</div>
                  <div className="text-center">
                    <img src={pokeB.image} alt={pokeB.name} className="w-16 h-16 object-contain mx-auto" />
                    <p className="text-xs text-white mt-1">{pokeB.name}</p>
                  </div>
                </div>
                {fusionCheck && (
                  <div className="text-center">
                    <div className="text-lg mb-1">
                      {fusionCheck.possible ? `✨ → ${fusionCheck.resultRarity}` : '❌'}
                    </div>
                    {fusionCheck.possible ? (
                      <p className="text-xs text-white/60">
                        💎 {fusionCheck.cost} | HP+{fusionCheck.resultRarity === 'LIMITED_EDITION' ? 15 : fusionCheck.resultRarity === 'LEGENDARY' ? 20 : 30} | ATK+{fusionCheck.resultRarity === 'LIMITED_EDITION' ? 10 : fusionCheck.resultRarity === 'LEGENDARY' ? 15 : 20}
                      </p>
                    ) : (
                      <p className="text-xs text-red-400">{fusionCheck.reason}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {fuseError && (
              <div className="p-3 rounded-xl text-center text-sm text-red-400" style={{ backgroundColor: '#ff2d5520' }}>
                ❌ {fuseError}
              </div>
            )}

            {/* Success */}
            {fuseSuccess && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 rounded-xl text-center"
                style={{ backgroundColor: '#4bddb720' }}
              >
                <div className="text-5xl mb-3">🎉</div>
                <p className="text-lg font-bold text-white mb-1">Fusion Berhasil!</p>
                <p className="text-sm text-white/60">Pokemon baru sudah masuk ke koleksi!</p>
                <button onClick={() => setFuseSuccess(null)} className="mt-3 px-4 py-2 rounded-lg text-sm font-bold text-black" style={{ backgroundColor: '#4bddb7' }}>
                  Oke
                </button>
              </motion.div>
            )}

            {/* Fuse Button */}
            {pokeA && pokeB && fusionCheck?.possible && !fuseSuccess && (
              <button
                onClick={handleFuse}
                disabled={isFusing}
                className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' }}
              >
                {isFusing ? (
                  <><Loader2 className="w-5 h-5 animate-spin inline" /> Memfusion...</>
                ) : (
                  <>⚡ Fusion Sekarang (💎{fusionCheck.cost})</>
                )}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* EVOLUTION TAB */}
      <AnimatePresence>
        {tab === 'evolve' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-4 pt-4 space-y-4">

            {/* Success */}
            {evolveSuccess && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 rounded-xl text-center"
                style={{ backgroundColor: '#ff2d5520' }}
              >
                <div className="text-5xl mb-3">💎</div>
                <p className="text-lg font-bold text-white mb-1">Evolution Sukses!</p>
                <p className="text-sm text-white/60">Pokemon naik tier!</p>
                <button onClick={() => setEvolveSuccess(false)} className="mt-3 px-4 py-2 rounded-lg text-sm font-bold text-black" style={{ backgroundColor: '#ff2d55' }}>
                  Oke
                </button>
              </motion.div>
            )}

            {/* Step 1: Select Fused Pokemon to evolve */}
            {!evolveTarget && !evolveSuccess && (
              <div>
                <p className="text-xs text-white/40 mb-2">Pilih Fused Pokemon untuk di-evolusi:</p>
                <div className="space-y-2">
                  {evolvableFused.length === 0 && (
                    <div className="text-center p-6 rounded-xl" style={{ backgroundColor: '#1a1a2e' }}>
                      <p className="text-white/40 text-sm">Belum ada Fused Pokemon (UR+) untuk di-evolusi</p>
                    </div>
                  )}
                  {evolvableFused.map(fp => {
                    const next = NEXT_TIER[fp.evolutionTier];
                    return (
                      <button
                        key={fp.id}
                        onClick={() => { setEvolveTarget(fp); setSelectedCards([]); setSelectedSacrificePokemon(null); }}
                        className="w-full p-3 rounded-xl flex items-center gap-3 transition-all hover:scale-[1.01]"
                        style={{ backgroundColor: '#1a1a2e', border: `1px solid ${RARITY_BORDER_COLORS[fp.rarity as keyof typeof RARITY_BORDER_COLORS]}40` }}
                      >
                        <img src={fp.image} alt={fp.name} className="w-14 h-14 object-contain rounded-lg" style={{ backgroundColor: ELEMENT_COLORS[fp.element] + '20' }} />
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{fp.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: RARITY_COLORS[fp.rarity as keyof typeof RARITY_COLORS], color: '#000' }}>
                              {TIER_ICONS[fp.evolutionTier]} {TIER_LABELS[fp.evolutionTier]}
                            </span>
                          </div>
                          <p className="text-xs text-white/40 mt-0.5">
                            HP {fp.baseHp} | ATK {fp.baseAttack} | DEF {fp.baseDefense} | SPD {fp.baseSpeed}
                          </p>
                        </div>
                        {next !== fp.evolutionTier && (
                          <div className="flex items-center gap-1 text-xs" style={{ color: RARITY_COLORS[next as keyof typeof RARITY_COLORS] }}>
                            <span>{TIER_ICONS[next]}</span>
                            <span>{TIER_LABELS[next]}</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 2: Material selection */}
            {evolveTarget && nextTier && requirements && (
              <div className="space-y-4">
                {/* Target Pokemon */}
                <div className="rounded-xl p-4" style={{ backgroundColor: '#1a1a2e', border: `2px solid ${RARITY_BORDER_COLORS[evolveTarget.rarity as keyof typeof RARITY_BORDER_COLORS]}` }}>
                  <div className="flex items-center gap-3">
                    <img src={evolveTarget.image} alt={evolveTarget.name} className="w-16 h-16 object-contain rounded-lg" style={{ backgroundColor: ELEMENT_COLORS[evolveTarget.element] + '20' }} />
                    <div className="flex-1">
                      <p className="font-bold text-white">{evolveTarget.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: RARITY_COLORS[evolveTarget.rarity as keyof typeof RARITY_COLORS], color: '#000' }}>
                          {TIER_LABELS[evolveTarget.evolutionTier]}
                        </span>
                        <span className="text-white/40">→</span>
                        <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: RARITY_COLORS[nextTier as keyof typeof RARITY_COLORS], color: '#000' }}>
                          {TIER_ICONS[nextTier]} {TIER_LABELS[nextTier]}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => { setEvolveTarget(null); setSelectedCards([]); setSelectedSacrificePokemon(null); }} className="p-2 rounded-lg hover:bg-white/10">
                      <X className="w-4 h-4 text-white/40" />
                    </button>
                  </div>

                  {/* Required materials */}
                  <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: '#0a1519' }}>
                    <p className="text-xs font-bold text-white/60 mb-3">📋 Material yang dibutuhkan:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>✨</span><span className="text-sm text-white">Stardust</span>
                        </div>
                        <span className={`text-sm font-bold ${stardust >= requirements.stardust ? 'text-green-400' : 'text-red-400'}`}>
                          {stardust} / {requirements.stardust}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>🀄</span><span className="text-sm text-white">Kartu Jepang</span>
                        </div>
                        <span className={`text-sm font-bold ${selectedCards.length >= requirements.japaneseCardCount ? 'text-green-400' : 'text-red-400'}`}>
                          {selectedCards.length} / {requirements.japaneseCardCount}
                        </span>
                      </div>
                      {requirements.additionalPokemon && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span>⚔️</span><span className="text-sm text-white">Pokemon Sacrificial</span>
                          </div>
                          <span className={`text-sm font-bold ${selectedSacrificePokemon !== null ? 'text-green-400' : 'text-red-400'}`}>
                            {selectedSacrificePokemon !== null ? '1 selected' : '0 / 1'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Japanese Card Selection */}
                <div>
                  <p className="text-xs text-white/40 mb-2">🀄 Pilih {requirements.japaneseCardCount} Kartu Jepang:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {ownedCards.map(oc => {
                      const isSelected = selectedCards.includes(oc.cardId);
                      return (
                        <button
                          key={oc.cardId}
                          onClick={() => handleCardToggle(oc.cardId)}
                          className={`relative rounded-lg overflow-hidden transition-all ${isSelected ? 'ring-2 ring-yellow-400 scale-105' : 'hover:scale-105'}`}
                          style={{ backgroundColor: '#1a1a2e' }}
                        >
                          <div className="aspect-square flex items-center justify-center text-2xl" style={{ backgroundColor: ELEMENT_COLORS[oc.card.element] + '30' }}>
                            {oc.card.japanese}
                          </div>
                          {isSelected && (
                            <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-black" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {ownedCards.length === 0 && (
                    <p className="text-center text-white/30 text-sm p-4">Tidak punya kartu Jepang</p>
                  )}
                </div>

                {/* Sacrifice Pokemon Selection (LEGENDARY/MYTHICAL) */}
                {requirements.additionalPokemon && (
                  <div>
                    <p className="text-xs text-white/40 mb-2">⚔️ Pilih 1 Pokemon UR untuk dikorbankan:</p>
                    <div className="grid grid-cols-4 gap-2">
                      {sacrificeOptions.map(p => {
                        const isSelected = selectedSacrificePokemon === p.pokemonId;
                        return (
                          <button
                            key={p.pokemonId}
                            onClick={() => setSelectedSacrificePokemon(isSelected ? null : p.pokemonId)}
                            className={`relative rounded-xl overflow-hidden transition-all ${isSelected ? 'ring-2 ring-red-400 scale-95' : 'hover:scale-105'}`}
                            style={{ backgroundColor: '#1a1a2e' }}
                          >
                            <img src={p.image} alt={p.name} className="w-full aspect-square object-contain p-1" />
                            <div className="text-[9px] text-center text-white font-bold truncate px-1 py-0.5" style={{ backgroundColor: RARITY_COLORS[p.rarity as keyof typeof RARITY_COLORS] }}>
                              {p.name.slice(0, 8)}
                            </div>
                            {isSelected && (
                              <div className="absolute inset-0 bg-red-500/30 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">✕</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {sacrificeOptions.length === 0 && (
                      <p className="text-center text-white/30 text-sm p-4">Tidak ada Pokemon UR untuk dikorbankan</p>
                    )}
                  </div>
                )}

                {/* Stat Preview */}
                <div className="rounded-xl p-3" style={{ backgroundColor: '#1a1a2e' }}>
                  <p className="text-xs text-white/40 mb-2">📈 Bonus Stats:</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-black/20">
                      <Heart className="w-3 h-3 text-red-400 mx-auto mb-0.5" />
                      <span className="text-xs font-bold text-green-400">+{requirements.statBonus.hp}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/20">
                      <Swords className="w-3 h-3 text-orange-400 mx-auto mb-0.5" />
                      <span className="text-xs font-bold text-green-400">+{requirements.statBonus.attack}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/20">
                      <Shield className="w-3 h-3 text-blue-400 mx-auto mb-0.5" />
                      <span className="text-xs font-bold text-green-400">+{requirements.statBonus.defense}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/20">
                      <Zap className="w-3 h-3 text-yellow-400 mx-auto mb-0.5" />
                      <span className="text-xs font-bold text-green-400">+{requirements.statBonus.speed}</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                {(() => {
                  const check = canEvolve();
                  return (
                    <div className={`p-3 rounded-xl text-center text-sm ${check.possible ? 'text-green-400' : 'text-red-400'}`} style={{ backgroundColor: check.possible ? '#4bddb710' : '#ff2d5510' }}>
                      {!check.possible && check.reason}
                    </div>
                  );
                })()}

                {/* Evolve Button */}
                {(() => {
                  const check = canEvolve();
                  return (
                    <button
                      onClick={handleEvolve}
                      disabled={!check.possible || isEvolving}
                      className="w-full py-4 rounded-xl font-bold text-white text-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                      style={{ background: `linear-gradient(135deg, ${RARITY_COLORS[nextTier as keyof typeof RARITY_COLORS]}, ${RARITY_BORDER_COLORS[nextTier as keyof typeof RARITY_BORDER_COLORS]})` }}
                    >
                      {isEvolving ? (
                        <><Loader2 className="w-5 h-5 animate-spin inline" /> Mengevolusi...</>
                      ) : (
                        <>{TIER_ICONS[nextTier]} Evoluasi ke {TIER_LABELS[nextTier]}</>
                      )}
                    </button>
                  );
                })()}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}