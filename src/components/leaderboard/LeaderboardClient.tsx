// ============================================================
// LeaderboardClient.tsx — Client island for the leaderboard
// ============================================================
//
// All interactive bits (mode tabs, window selector, live flash,
// realtime subscription, local-entry merge) live here. The parent
// page is a Server Component that fetches the initial cloud data
// and hands it down via `initialEntries`. This keeps the page
// RSC (better SSR/SEO) while the realtime + local data overlay
// stays where browser APIs are available.
// ============================================================

'use client';

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import {
  fetchTopScores,
  subscribeToNewScores,
  getLocalEntries,
  mergeWithLocal,
  type FetchOptions,
} from '@/lib/leaderboardData';
import {
  sortByScore,
  filterByTimeWindow,
  getUserRank,
  type GameMode,
  type TimeWindow,
  type LeaderboardEntry,
} from '@/lib/leaderboardLogic';

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

const MODES: { id: GameMode; label: string; icon: string; color: string }[] = [
  { id: 'kanji-drop', label: 'Kanji Drop', icon: '⏬', color: colors.teal },
  { id: 'battle', label: 'Battle', icon: '⚔️', color: colors.coral },
];

const WINDOWS: { id: TimeWindow; label: string }[] = [
  { id: 'TODAY', label: 'Hari Ini' },
  { id: 'THIS_WEEK', label: 'Minggu Ini' },
  { id: 'ALL_TIME', label: 'Semua' },
];

function formatScore(n: number): string {
  return n.toLocaleString('id-ID');
}

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return 'baru saja';
  if (min < 60) return `${min}m lalu`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}j lalu`;
  const d = Math.floor(h / 24);
  return `${d}h lalu`;
}

export interface LeaderboardClientProps {
  initialEntries: LeaderboardEntry[];
  initialCurrentUser?: { id: string; username: string } | null;
  isSupabaseConfigured: boolean;
  initialMode?: GameMode;
  initialWindow?: TimeWindow;
}

export function LeaderboardClient({
  initialEntries,
  initialCurrentUser = null,
  isSupabaseConfigured,
  initialMode = 'kanji-drop',
  initialWindow = 'ALL_TIME',
}: LeaderboardClientProps) {
  // authUser = zustand state (used for local-entry merge — needs
  //   browser-only localStorage).
  // currentUser = server-detected (from cookies), with zustand
  //   fallback. Used for rank/row-highlight personalization.
  const authUser = useAuthStore((s) => s.user);
  const currentUser = initialCurrentUser ?? (authUser ? { id: authUser.id, username: authUser.username } : null);
  // Backward-compat alias — many code paths below use `user`.
  const user = authUser;
  const [mode, setMode] = useState<GameMode>(initialMode);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(initialWindow);
  const [entries, setEntries] = useState<LeaderboardEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(false);
  const [liveFlash, setLiveFlash] = useState<string | null>(null);

  // Stable fetch function — used when user changes tabs/windows.
  // Skips when initialEntries already covers this mode (avoids a
  // duplicate flash of "Memuat..." on first mount).
  const load = useCallback(async () => {
    setIsLoading(true);
    const opts: FetchOptions = { mode, window: timeWindow };
    // Safety net: if the fetch takes >4s, force isLoading=false so the
    // page is never stuck on "Memuat..." regardless of internal errors.
    const safetyTimer = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.warn('[leaderboard] load() safety timeout 4s — forcing isLoading=false');
      setIsLoading(false);
    }, 4000);
    try {
      const cloud = await fetchTopScores(opts);
      const local = getLocalEntries(mode, user?.username || 'Tamago');
      const merged = sortByScore(
        mergeWithLocal(cloud, local),
        100,
      );
      setEntries(merged);
    } catch (err) {
      // Belt + suspenders: fetchTopScores already catches network
      // errors internally, but any future regression (e.g. merge or
      // sort throws) must not leave the page stuck on "Memuat...".
      // eslint-disable-next-line no-console
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[leaderboard] load() error:', message);
      // Still show whatever local data we can find.
      try {
        const local = getLocalEntries(mode, user?.username || 'Tamago');
        setEntries(local);
      } catch {
        setEntries([]);
      }
    } finally {
      clearTimeout(safetyTimer);
      setIsLoading(false);
    }
  }, [mode, timeWindow, user?.username]);

  // Only refetch on mode/window/user change — initial mount is
  // covered by the server's initialEntries.
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    void load();
  }, [load]);

  // Realtime subscription — only re-subscribes when mode changes.
  useEffect(() => {
    const unsubscribe = subscribeToNewScores(mode, (entry) => {
      // Optimistic merge: prepend, sort, flash badge
      setEntries((prev) => sortByScore([entry, ...prev], 100));
      setLiveFlash(entry.username);
      window.setTimeout(() => setLiveFlash(null), 2500);
    });
    return unsubscribe;
  }, [mode]);

  const filtered = useMemo(
    () => filterByTimeWindow(entries, timeWindow),
    [entries, timeWindow],
  );

  const userRank = useMemo(
    () => (currentUser ? getUserRank(filtered, currentUser.id) : null),
    [filtered, currentUser],
  );

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div
        className="sticky top-0 z-30 px-4 h-16 flex items-center gap-3"
        style={{ backgroundColor: colors.background }}
      >
        <Link
          href="/"
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: colors.inputBg }}
        >
          <span className="text-[#c6bfff] text-lg">←</span>
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-[#d8e4ea]">🏆 Leaderboard</h1>
          <p className="text-xs text-[#c8c4d7]">
            {isSupabaseConfigured ? 'Live global ranking' : 'Mode lokal (Supabase belum dikonfigurasi)'}
          </p>
        </div>
      </div>

      <main className="max-w-md mx-auto px-4 pt-2">
        {/* Live flash banner */}
        <AnimatePresence>
          {liveFlash && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-3 p-2 rounded-lg text-center text-sm font-medium"
              style={{ backgroundColor: `${colors.teal}20`, color: colors.teal }}
            >
              ⚡ Skor baru dari {liveFlash}!
            </motion.div>
          )}
        </AnimatePresence>

        {/* User's own rank — sticky if logged in. Uses server-detected
            currentUser (from cookies) so it shows on first render without
            waiting for zustand authStore to hydrate. */}
        {currentUser && userRank && (
          <div
            className="mb-3 p-3 rounded-xl flex items-center justify-between"
            style={{ backgroundColor: `${colors.gold}15`, border: `1px solid ${colors.gold}40` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                style={{ backgroundColor: colors.gold, color: '#0a1519' }}
              >
                #{userRank}
              </div>
              <div>
                <div className="text-sm font-medium text-[#d8e4ea]">Peringkatmu</div>
                <div className="text-xs text-[#c8c4d7]">{currentUser.username}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#f0bf63]">skormu di bawah</div>
            </div>
          </div>
        )}

        {/* Mode tabs */}
        <div className="mb-3 grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ backgroundColor: colors.inputBg }}>
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className="py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: mode === m.id ? m.color : 'transparent',
                color: mode === m.id ? '#0a1519' : colors.darkText,
              }}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Window selector */}
        <div className="mb-4 flex gap-2">
          {WINDOWS.map((w) => (
            <button
              key={w.id}
              onClick={() => setTimeWindow(w.id)}
              className="flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: timeWindow === w.id ? colors.brand : colors.cardBg,
                color: timeWindow === w.id ? '#fff' : colors.darkText,
              }}
            >
              {w.label}
            </button>
          ))}
        </div>

        {/* List */}
        {isLoading ? (
          <div className="text-center py-12 text-[#c8c4d7]">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-12 px-4 rounded-2xl"
            style={{ backgroundColor: colors.cardBg }}
          >
            <div className="text-5xl mb-2">🎮</div>
            <div className="text-sm font-medium text-[#d8e4ea] mb-1">
              Belum ada skor
            </div>
            <div className="text-xs text-[#c8c4d7] mb-4">
              {mode === 'kanji-drop'
                ? 'Mainkan Kanji Drop untuk masuk leaderboard!'
                : 'Menangkan battle untuk masuk leaderboard!'}
            </div>
            <Link
              href={mode === 'kanji-drop' ? '/kanji-drop' : '/battle'}
              className="inline-block py-2 px-4 rounded-lg text-sm font-bold"
              style={{ backgroundColor: colors.teal, color: '#0a1519' }}
            >
              Main Sekarang →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((entry, idx) => {
              // Match by canonical userId (server-detected) first, then
              // fall back to username match for legacy/local-only entries
              // that don't have a userId field.
              const isMe =
                (currentUser && entry.userId === currentUser.id) ||
                (user && entry.username === user.username);
              const isTop3 = idx < 3;
              const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : null;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="p-3 rounded-xl flex items-center gap-3"
                  style={{
                    backgroundColor: isMe ? `${colors.brand}25` : colors.cardBg,
                    border: isMe ? `1px solid ${colors.brand}60` : '1px solid transparent',
                  }}
                >
                  {/* Rank */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                    style={{
                      backgroundColor: isTop3 ? colors.gold : colors.inputBg,
                      color: isTop3 ? '#0a1519' : colors.darkText,
                    }}
                  >
                    {medal || `#${idx + 1}`}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#d8e4ea] truncate">
                      {entry.username}
                      {isMe && <span className="ml-2 text-xs text-[#c6bfff]">(kamu)</span>}
                    </div>
                    <div className="text-xs text-[#c8c4d7] flex items-center gap-2">
                      <span>Wave {entry.wave}</span>
                      <span>•</span>
                      <span>{entry.kills} kills</span>
                      {entry.maxCombo > 0 && (
                        <>
                          <span>•</span>
                          <span>🔥 {entry.maxCombo}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {/* Score */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-base font-bold text-[#f0bf63]">
                      {formatScore(entry.score)}
                    </div>
                    <div className="text-[10px] text-[#c8c4d7]">
                      {formatRelative(entry.playedAt)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {!isSupabaseConfigured && (
          <div
            className="mt-4 p-3 rounded-xl text-xs"
            style={{ backgroundColor: `${colors.coral}15`, color: colors.coral }}
          >
            ℹ️ Mode lokal. Untuk live global leaderboard, set{' '}
            <code className="px-1 rounded" style={{ backgroundColor: colors.inputBg }}>
              NEXT_PUBLIC_SUPABASE_URL
            </code>{' '}
            dan{' '}
            <code className="px-1 rounded" style={{ backgroundColor: colors.inputBg }}>
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>{' '}
            di .env.local lalu jalankan SQL di{' '}
            <code style={{ backgroundColor: colors.inputBg }}>supabase/migrations/0001_leaderboard_scores.sql</code>.
          </div>
        )}
      </main>
    </div>
  );
}

