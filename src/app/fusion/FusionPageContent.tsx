'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore } from '@/store/collectionStore';
import { useFusionStore } from '@/store/fusionStore';
import { ArrowLeft, Swords, Sparkles, Zap, Shield, Heart, X, Loader2, Check } from 'lucide-react';

const ELEMENT_COLORS: Record<string, string> = {
  FIRE: '#ff6b35', WATER: '#4facfe', GRASS: '#4bddb7',
  ELECTRIC: '#ffd93d', PSYCHIC: '#c77dff', NORMAL: '#a8a8a8',
};

const RARITY_COLORS: Record<string, string> = {
  COMMON: '#c8c4d7', UNCOMMON: '#4bddb7', RARE: '#6c5ce7', ULTRA_RARE: '#f0bf63',
};

const RARITY_ICONS: Record<string, string> = {
  COMMON: '⚪', UNCOMMON: '🟢', RARE: '🔵', ULTRA_RARE: '🟡',
};

export default function FusionPageContent() {
  const router = useRouter();
  const { ownedPokemon, diamonds } = useCollectionStore();
  const fusionStore = useFusionStore();
  
  const [ready, setReady] = useState(false);
  const [selectedA, setSelectedA] = useState<number | null>(null);
  const [selectedB, setSelectedB] = useState<number | null>(null);
  const [isFusing, setIsFusing] = useState(false);
  const [fuseSuccess, setFuseSuccess] = useState<string | null>(null);
  const [fuseError, setFuseError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => setReady(true), 50);
  }, []);

  // Only show Pokemon from REST API (pokemonId < 10000)
  const fuseablePokemon = ownedPokemon.filter(p => p.pokemonId < 10000);

  const handleSelect = (pokemonId: number) => {
    if (selectedA === pokemonId) {
      setSelectedA(null);
    } else if (selectedB === pokemonId) {
      setSelectedB(null);
    } else if (selectedA === null) {
      setSelectedA(pokemonId);
    } else if (selectedB === null) {
      setSelectedB(pokemonId);
    } else {
      setSelectedB(pokemonId);
    }
    setFuseError(null);
    setFuseSuccess(null);
  };

  const pokeA = fuseablePokemon.find(p => p.pokemonId === selectedA);
  const pokeB = fuseablePokemon.find(p => p.pokemonId === selectedB);

  const fusionCheck = (pokeA && pokeB)
    ? fusionStore.canFuse(pokeA.pokemonId, pokeB.pokemonId)
    : null;

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

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a1519' }}>
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a1519' }}>
      {/* Top Bar */}
      <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: '#0a1519' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#1a1a2e' }}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <span className="text-base font-bold text-white">🔀 Fusion</span>
            <p className="text-xs text-white/40">Gabungkan 2 Pokemon menjadi lebih kuat</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4facfe20] border border-[#4facfe40]">
          <span className="text-sm">💎</span>
          <span className="text-sm font-bold text-[#4facfe]">{diamonds.toLocaleString()}</span>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6 max-w-lg mx-auto">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #162125 100%)', border: '1px solid #6c5ce740' }}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div>
              <p className="text-sm font-bold text-white mb-1">Cara Fusion</p>
              <p className="text-xs text-white/50">Pilih 2 Pokemon untuk digabungkan. Hasil fusion memiliki stats lebih tinggi. Pokemon asli akan hilang dan digantikan oleh Pokemon fusion. Hanya Pokemon dari gacha (REST API) yang bisa di-fusion.</p>
            </div>
          </div>
        </motion.div>

        {/* Selected Slots */}
        <div className="flex items-center justify-center gap-4">
          {/* Slot A */}
          <div
            className="w-28 h-36 rounded-2xl flex flex-col items-center justify-center p-2 relative transition-all"
            style={pokeA ? {
              background: `linear-gradient(135deg, #1a1a2e 0%, ${ELEMENT_COLORS[pokeA.element]}20 100%)`,
              border: `2px solid ${ELEMENT_COLORS[pokeA.element]}60`
            } : { backgroundColor: '#1a1a2e', border: '2px dashed rgba(255,255,255,0.2)' }}
          >
            {pokeA ? (
              <>
                {pokeA.image && <img src={pokeA.image} alt={pokeA.name} className="w-14 h-14 object-contain" />}
                <span className="text-xs font-bold text-white mt-1 text-center">{pokeA.name}</span>
                <span className="text-[10px] text-white/40">{pokeA.element}</span>
                <button onClick={() => setSelectedA(null)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </button>
              </>
            ) : (
              <span className="text-white/30 text-xs">Pilih A</span>
            )}
          </div>

          {/* Fusion Symbol */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-[#6c5ce7] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xs text-white/40">+</span>
          </div>

          {/* Slot B */}
          <div
            className="w-28 h-36 rounded-2xl flex flex-col items-center justify-center p-2 relative transition-all"
            style={pokeB ? {
              background: `linear-gradient(135deg, #1a1a2e 0%, ${ELEMENT_COLORS[pokeB.element]}20 100%)`,
              border: `2px solid ${ELEMENT_COLORS[pokeB.element]}60`
            } : { backgroundColor: '#1a1a2e', border: '2px dashed rgba(255,255,255,0.2)' }}
          >
            {pokeB ? (
              <>
                {pokeB.image && <img src={pokeB.image} alt={pokeB.name} className="w-14 h-14 object-contain" />}
                <span className="text-xs font-bold text-white mt-1 text-center">{pokeB.name}</span>
                <span className="text-[10px] text-white/40">{pokeB.element}</span>
                <button onClick={() => setSelectedB(null)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                  <X className="w-3 h-3 text-white" />
                </button>
              </>
            ) : (
              <span className="text-white/30 text-xs">Pilih B</span>
            )}
          </div>
        </div>

        {/* Result Preview */}
        {pokeA && pokeB && fusionCheck && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl"
            style={{ backgroundColor: '#1a1a2e', border: `1px solid ${fusionCheck.possible ? '#4bddb740' : '#ff6b3540'}` }}
          >
            {fusionCheck.possible ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#4bddb7]" />
                  <span className="text-sm font-bold text-[#4bddb7]">Fusion Possible!</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-white/70">HP: <span className="text-white font-bold">{Math.min(pokeA.hp, pokeB.hp) + 20}~{Math.max(pokeA.hp, pokeB.hp) + 40}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-red-400" />
                    <span className="text-xs text-white/70">ATK: <span className="text-white font-bold">{Math.min(pokeA.attack, pokeB.attack) + 10}~{Math.max(pokeA.attack, pokeB.attack) + 25}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-white/70">DEF: <span className="text-white font-bold">{Math.min(pokeA.defense, pokeB.defense) + 5}~{Math.max(pokeA.defense, pokeB.defense) + 15}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-white/70">SPD: <span className="text-white font-bold">{Math.min(pokeA.speed, pokeB.speed) + 5}~{Math.max(pokeA.speed, pokeB.speed) + 15}</span></span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/50">Result Rarity:</span>
                  <span className="font-bold" style={{ color: RARITY_COLORS[fusionCheck.resultRarity!] }}>
                    {RARITY_ICONS[fusionCheck.resultRarity!]} {fusionCheck.resultRarity}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-white/50">Cost:</span>
                  <span className="font-bold text-[#4facfe]">💎 {fusionCheck.cost}</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-red-400">❌</span>
                <span className="text-sm text-red-400">{fusionCheck.reason}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Fuse Button */}
        {pokeA && pokeB && fusionCheck?.possible && (
          <button
            onClick={handleFuse}
            disabled={isFusing}
            className="w-full py-4 rounded-2xl font-bold text-lg bg-[#6c5ce7] hover:bg-[#5a4bd4] text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isFusing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Melakukan Fusion...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Fusion! 💎 {fusionCheck.cost}</span>
              </>
            )}
          </button>
        )}

        {fuseError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-red-500/20 border border-red-500/40">
            <p className="text-sm text-red-400 text-center">{fuseError}</p>
          </motion.div>
        )}

        {/* Success Modal */}
        <AnimatePresence>
          {fuseSuccess && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
              onClick={() => setFuseSuccess(null)}
            >
              <motion.div
                initial={{ scale: 0.7 }} animate={{ scale: 1 }}
                className="p-6 rounded-2xl text-center max-w-sm w-full"
                style={{ backgroundColor: '#1a1a2e', border: '1px solid #4bddb740' }}
                onClick={e => e.stopPropagation()}
              >
                <div className="text-5xl mb-3">🎉</div>
                <h3 className="text-xl font-black text-white mb-1">Fusion Berhasil!</h3>
                <p className="text-sm text-white/60 mb-4">Pokemon baru sudah ditambahkan ke koleksi fusionmu!</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setFuseSuccess(null); router.push('/collection?tab=fusion'); }}
                    className="flex-1 py-3 rounded-xl font-bold bg-[#6c5ce7] text-white"
                  >
                    Lihat Fusion
                  </button>
                  <button
                    onClick={() => setFuseSuccess(null)}
                    className="flex-1 py-3 rounded-xl font-bold bg-white/10 text-white/70"
                  >
                    Tutup
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pokemon List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-white">Pilih Pokemon ({fuseablePokemon.length})</h3>
            <span className="text-xs text-white/40">Hanya Pokemon gacha</span>
          </div>
          {fuseablePokemon.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <p className="text-sm">Tidak ada Pokemon untuk fusion.</p>
              <p className="text-xs mt-1">Kumpulkan Pokemon dari gacha terlebih dahulu!</p>
              <button
                onClick={() => router.push('/gacha')}
                className="mt-4 px-6 py-2 rounded-xl bg-[#6c5ce7] text-white font-bold text-sm"
              >
                Buka Gacha
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {fuseablePokemon.map(poke => {
                const isSelected = poke.pokemonId === selectedA || poke.pokemonId === selectedB;
                return (
                  <motion.button
                    key={poke.pokemonId}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelect(poke.pokemonId)}
                    className={`relative p-2 rounded-xl transition-all ${isSelected ? 'ring-2 ring-[#6c5ce7]' : 'hover:bg-white/5'}`}
                    style={{ backgroundColor: '#1a1a2e', border: `1px solid ${isSelected ? '#6c5ce7' : '#ffffff10'}` }}
                  >
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#6c5ce7] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {poke.image && <img src={poke.image} alt={poke.name} className="w-10 h-10 object-contain mx-auto" />}
                    <p className="text-[10px] font-bold text-white mt-1 truncate">{poke.name}</p>
                    <p className="text-[9px] text-white/40">{poke.element}</p>
                    <p className="text-[9px] font-bold mt-0.5" style={{ color: RARITY_COLORS[poke.rarity] }}>
                      {RARITY_ICONS[poke.rarity]} {poke.rarity.replace('_', ' ')}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}