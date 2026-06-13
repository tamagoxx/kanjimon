'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBossBattleStore } from '@/store/bossBattleStore';
import { useCollectionStore } from '@/store/collectionStore';
import { useBattleStore } from '@/store/battleStore';
import {
  getScaledBoss,
  BOSS_LEVEL_MIN,
  BOSS_LEVEL_MAX,
} from '@/lib/bossScaling';
import { calculateRewards } from '@/lib/bossRewards';
import type { BossElement } from '@/data/bosses';

const ELEMENT_COLORS: Record<BossElement, { bg: string; border: string; text: string }> = {
  FIRE: { bg: 'rgba(255,80,40,0.15)', border: '#ff5028', text: '#ff8050' },
  WATER: { bg: 'rgba(40,140,255,0.15)', border: '#288cff', text: '#60a8ff' },
  GRASS: { bg: 'rgba(80,200,80,0.15)', border: '#50c850', text: '#80e070' },
  ELECTRIC: { bg: 'rgba(255,220,40,0.15)', border: '#ffdc28', text: '#ffe060' },
  PSYCHIC: { bg: 'rgba(180,80,220,0.15)', border: '#b450dc', text: '#c880e8' },
  NORMAL: { bg: 'rgba(160,160,160,0.15)', border: '#a0a0a0', text: '#c0c0c0' },
};

const TIER_COLORS: Record<string, string> = {
  NORMAL: '#a0a0a0',
  ELITE: '#c084fc',
  LEGENDARY: '#fbbf24',
  MYTHIC: '#ef4444',
};

const TIER_LABELS: Record<string, string> = {
  NORMAL: 'Biasa',
  ELITE: 'Elite',
  LEGENDARY: 'Legendaris',
  MYTHIC: 'Mithikal',
};

const QUICK_JUMPS = [1, 25, 50, 100, 150, 200, 250, 300];

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}M`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}jt`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}rb`;
  return n.toString();
}

export default function BossBattlePage() {
  const router = useRouter();
  const [level, setLevel] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { highestCleared, lastCleared, totalVictories, totalDefeats, recordVictory, recordDefeat } =
    useBossBattleStore();
  const ownedPokemon = useCollectionStore((s) => s.ownedPokemon);
  const startBattle = useBattleStore((s) => s.startBattle);

  const scaled = useMemo(() => getScaledBoss(level), [level]);
  const rewards = useMemo(() => calculateRewards(level), [level]);
  const elementStyle = ELEMENT_COLORS[scaled.boss.element];
  const tierColor = TIER_COLORS[scaled.boss.tier] || '#a0a0a0';
  const tierLabel = TIER_LABELS[scaled.boss.tier] || scaled.boss.tier;

  const isLevelCleared = level <= highestCleared;
  const isNewHigh = level > highestCleared;

  const handleStart = () => {
    setError(null);

    if (ownedPokemon.length === 0) {
      setError('Kamu belum punya Pokemon! Tarik dari gacha dulu.');
      return;
    }

    // Build a deck from the first 5 owned Pokemon
    const deckIds = ownedPokemon.slice(0, 5).map((p) => p.id);

    const battle = {
      id: `boss-${level}-${Date.now()}`,
      playerId: 'player',
      opponentId: scaled.boss.id,
      opponentName: `${scaled.boss.sprite} ${scaled.boss.name}`,
      phase: 'SETUP' as const,
      bossPhase: 'PHASE_1' as const,
      isBossBattle: true,
      bossChargingMove: false,
      bossCurrentMove: null,
      difficulty: 'HARD' as const,
      // Decks
      playerDeck: deckIds,
      playerHand: deckIds,
      playerActiveCard: null,
      playerDiscard: [],
      aiDeck: [scaled.boss.id],
      aiHand: [scaled.boss.id],
      aiActiveCard: scaled.boss.id,
      aiDiscard: [],
      // Turn
      turn: 1,
      maxTurns: 30,
      isPlayerTurn: true,
      // HP
      playerHP: 100,
      playerMaxHP: 100,
      playerShield: 0,
      aiHP: scaled.hp,
      aiMaxHP: scaled.hp,
      aiShield: 0,
      // Buffs/debuffs
      playerBuffs: [],
      playerDebuffs: [],
      aiBuffs: [],
      aiDebuffs: [],
      playerStatusEffects: [],
      aiStatusEffects: [],
      // State
      battleLog: [
        {
          turn: 1,
          actor: 'ai' as const,
          action: 'DAMAGE' as const,
          description: `🐉 Boss ${scaled.boss.name} (${scaled.boss.japaneseName}) muncul di level ${level}!`,
          damage: 0,
        },
      ],
      studyQuestion: null,
      playerDefending: false,
      aiDefending: false,
      aiBehavior: {
        lastActions: [],
        defenseCount: 0,
        attackCount: 0,
        studyCount: 0,
        lastPlayerAction: null,
      },
      battleRewardMultiplier: 1 + Math.floor(level / 50),
      flawlessVictory: false,
    };

    startBattle(battle);
    // For MVP, record victory/death optimistically; full integration
    // with the battle page result screen comes in a follow-up commit.
    recordVictory(level);
    router.push('/simulasi?from=boss-battle');
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: '#0a1519', color: '#e8f0f2' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="text-sm hover:underline"
            style={{ color: '#4bddb7' }}
          >
            ← Beranda
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#4bddb7' }}>
            🐉 Boss Battle
          </h1>
          <div className="text-xs text-right" style={{ color: '#8aa8b0' }}>
            <div>Progress</div>
            <div style={{ color: '#fbbf24' }}>Lv {highestCleared}</div>
          </div>
        </div>

        {/* Stats bar */}
        <div
          className="grid grid-cols-4 gap-2 mb-6 p-3 rounded-xl text-center text-xs md:text-sm"
          style={{ backgroundColor: 'rgba(75,221,183,0.05)', border: '1px solid rgba(75,221,183,0.2)' }}
        >
          <div>
            <div style={{ color: '#8aa8b0' }}>Tertinggi</div>
            <div className="font-bold" style={{ color: '#fbbf24' }}>
              Lv {highestCleared}
            </div>
          </div>
          <div>
            <div style={{ color: '#8aa8b0' }}>Terakhir</div>
            <div className="font-bold" style={{ color: '#4bddb7' }}>
              Lv {lastCleared}
            </div>
          </div>
          <div>
            <div style={{ color: '#8aa8b0' }}>Menang</div>
            <div className="font-bold" style={{ color: '#50c878' }}>
              {totalVictories}
            </div>
          </div>
          <div>
            <div style={{ color: '#8aa8b0' }}>Kalah</div>
            <div className="font-bold" style={{ color: '#ef4444' }}>
              {totalDefeats}
            </div>
          </div>
        </div>

        {/* Boss preview card */}
        <div
          className="rounded-2xl p-6 mb-6 text-center"
          style={{
            backgroundColor: elementStyle.bg,
            border: `2px solid ${elementStyle.border}`,
          }}
        >
          <div className="text-7xl md:text-9xl mb-2">{scaled.boss.sprite}</div>
          <div
            className="text-xs uppercase tracking-widest mb-1"
            style={{ color: tierColor }}
          >
            ★ {tierLabel} • Level {scaled.level} • {scaled.boss.element}
          </div>
          <h2 className="text-2xl md:text-4xl font-bold mb-1" style={{ color: elementStyle.text }}>
            {scaled.boss.name}
          </h2>
          <div className="text-lg md:text-xl mb-4" style={{ color: '#8aa8b0' }}>
            {scaled.boss.japaneseName}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              <div style={{ color: '#8aa8b0' }}>HP</div>
              <div className="font-bold" style={{ color: '#ef4444' }}>
                {formatNumber(scaled.hp)}
              </div>
            </div>
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              <div style={{ color: '#8aa8b0' }}>ATK</div>
              <div className="font-bold" style={{ color: '#fb923c' }}>
                {formatNumber(scaled.attack)}
              </div>
            </div>
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              <div style={{ color: '#8aa8b0' }}>DEF</div>
              <div className="font-bold" style={{ color: '#60a5fa' }}>
                {formatNumber(scaled.defense)}
              </div>
            </div>
          </div>

          <p className="text-sm italic" style={{ color: '#8aa8b0' }}>
            {scaled.boss.lore}
          </p>
        </div>

        {/* Level selector */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: 'rgba(75,221,183,0.05)', border: '1px solid rgba(75,221,183,0.2)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold" style={{ color: '#4bddb7' }}>
              Pilih Level
            </label>
            <div className="text-2xl font-bold" style={{ color: '#fbbf24' }}>
              Lv {level}
            </div>
          </div>

          <input
            type="range"
            min={BOSS_LEVEL_MIN}
            max={BOSS_LEVEL_MAX}
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value, 10))}
            className="w-full mb-3"
            style={{ accentColor: '#4bddb7' }}
          />

          <input
            type="number"
            min={BOSS_LEVEL_MIN}
            max={BOSS_LEVEL_MAX}
            value={level}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!Number.isNaN(v)) {
                setLevel(Math.max(BOSS_LEVEL_MIN, Math.min(BOSS_LEVEL_MAX, v)));
              }
            }}
            className="w-full p-2 rounded-lg text-center mb-3"
            style={{
              backgroundColor: '#0a1519',
              border: '1px solid #4bddb7',
              color: '#e8f0f2',
            }}
          />

          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_JUMPS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className="px-3 py-1 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: lvl === level ? '#4bddb7' : 'rgba(75,221,183,0.1)',
                  color: lvl === level ? '#0a1519' : '#4bddb7',
                  border: '1px solid #4bddb7',
                }}
              >
                Lv {lvl}
              </button>
            ))}
          </div>

          {isNewHigh && level > 0 && (
            <div
              className="mt-3 p-2 rounded-lg text-center text-xs font-semibold"
              style={{
                backgroundColor: 'rgba(251,191,36,0.15)',
                border: '1px solid #fbbf24',
                color: '#fbbf24',
              }}
            >
              ⚠️ LEVEL BARU — belum pernah diselesaikan
            </div>
          )}
          {isLevelCleared && (
            <div
              className="mt-3 p-2 rounded-lg text-center text-xs"
              style={{
                backgroundColor: 'rgba(80,200,120,0.15)',
                border: '1px solid #50c878',
                color: '#50c878',
              }}
            >
              ✓ Level ini sudah pernah kamu selesaikan
            </div>
          )}
        </div>

        {/* Rewards preview */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ backgroundColor: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.3)' }}
        >
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#fbbf24' }}>
            🎁 Hadiah Jika Menang
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div>
              <div style={{ color: '#8aa8b0' }}>Stardust</div>
              <div className="font-bold" style={{ color: '#fbbf24' }}>
                +{rewards.stardust}
              </div>
            </div>
            <div>
              <div style={{ color: '#8aa8b0' }}>Essence</div>
              <div className="font-bold" style={{ color: '#c084fc' }}>
                +{rewards.essence}
              </div>
            </div>
            <div>
              <div style={{ color: '#8aa8b0' }}>Diamonds</div>
              <div className="font-bold" style={{ color: '#60a5fa' }}>
                +{rewards.diamonds}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div
            className="p-3 rounded-xl mb-4 text-sm text-center"
            style={{
              backgroundColor: 'rgba(239,68,68,0.15)',
              border: '1px solid #ef4444',
              color: '#ef4444',
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          className="w-full py-4 rounded-2xl text-lg font-bold transition-transform hover:scale-105"
          style={{
            backgroundColor: '#4bddb7',
            color: '#0a1519',
            boxShadow: '0 0 24px rgba(75,221,183,0.4)',
          }}
        >
          ⚔️ Mulai Battle
        </button>

        <p className="text-xs text-center mt-3" style={{ color: '#8aa8b0' }}>
          * MVP: battle di-handle oleh simulator. Hasil di-record sebagai kemenangan.
        </p>
      </div>
    </div>
  );
}
