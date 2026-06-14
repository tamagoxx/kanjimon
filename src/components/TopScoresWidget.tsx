'use client';

// ============================================================
// TopScoresWidget — Cloud top-5 leaderboard preview
// ============================================================
//
// Pulls the top 5 scores from Supabase `leaderboard_scores` and
// renders them as a compact list with gold/silver/bronze medals
// for the top 3. Fails silently to a "belum ada skor" empty
// state if the table isn't migrated yet or the user is offline.
//
// The hint that birthed this file:
//
//   const { data: todos } = await supabase.from('todos').select()
//   {todos?.map((todo) => ( ... ))}
//
// i.e. SELECT from cloud → optional-chain → .map() in JSX.
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getBrowserSupabase } from '@/lib/supabase/client';
import type { LeaderboardScoreRow } from '@/lib/supabase/types';
import {
  mapTopScores,
  mergeNewRowIntoTopN,
  gameModeLabel,
  gameModeIcon,
  type TopScoreEntry,
} from '@/lib/leaderboardTopScores';
import { formatRelativeTime } from '@/lib/recentActivityAggregator';

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

type Status = 'loading' | 'ready' | 'empty' | 'error';

export function TopScoresWidget() {
  const [status, setStatus] = useState<Status>('loading');
  // Store the MAPPED entries (not raw rows) so realtime INSERT events
  // can splice a new entry in via `mergeNewRowIntoTopN` without a
  // re-fetch round-trip. The fetch effect below populates this with
  // the initial top-5.
  const [entries, setEntries] = useState<TopScoreEntry[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // `now` ticks every minute so the "X menit lalu" labels stay fresh
  // without re-fetching from Supabase.
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(tick);
  }, []);

  // Initial fetch — pulls top 5 from Supabase on mount.
  const loadTopScores = useCallback(async () => {
    try {
      const supabase = getBrowserSupabase();
      const { data, error } = await supabase
        .from('leaderboard_scores')
        .select('id, user_id, username, game_mode, score, wave, kills, max_combo, played_at, created_at, duration_sec')
        .order('score', { ascending: false })
        .order('played_at', { ascending: false })
        .limit(5);
      if (error) {
        // Most common: table not yet migrated, or anon read denied.
        // Either way, fail silent — the rest of the home page still works.
        setErrorMsg(error.message);
        setStatus('empty');
        return;
      }
      if (!data || data.length === 0) {
        setStatus('empty');
        return;
      }
      setEntries(mapTopScores(data));
      setStatus('ready');
    } catch (e) {
      setErrorMsg((e as Error).message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Guard against state updates after unmount.
      if (cancelled) return;
      await loadTopScores();
    })();
    return () => {
      cancelled = true;
    };
  }, [loadTopScores]);

  // Realtime subscription — when ANY client inserts a new row into
  // `leaderboard_scores`, optimistically splice it into our list.
  // No network round-trip; if the row doesn't crack the top 5, the
  // merge helper returns the same list (no re-render).
  useEffect(() => {
    if (status !== 'ready') return; // no list to merge into yet
    const supabase = getBrowserSupabase();
    const channel = supabase
      .channel('top-scores-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leaderboard_scores' },
        (payload) => {
          const newRow = payload.new as LeaderboardScoreRow;
          // Build a minimal TopScoreEntry — rank+medal are re-assigned
          // by mergeNewRowIntoTopN based on actual position.
          const incoming: TopScoreEntry = {
            id: newRow.id,
            rank: 0,
            username: newRow.username,
            score: newRow.score,
            gameMode: newRow.game_mode,
            medal: null,
            playedAt: newRow.played_at,
          };
          setEntries((prev) => mergeNewRowIntoTopN(prev, incoming, 5));
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [status]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-4 p-4 rounded-2xl"
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-[#c8c4d7] tracking-wider">
          🏆 TOP GLOBAL
        </h2>
        <Link
          href="/leaderboard"
          className="text-xs font-medium"
          style={{ color: colors.gold }}
        >
          Lihat semua →
        </Link>
      </div>

      {status === 'loading' && <TopScoresSkeleton />}
      {status === 'ready' && (
        <ul className="space-y-2 list-none p-0 m-0">
          {entries?.map((entry) => (
            <TopScoreRow
              key={entry.id}
              id={entry.id}
              rank={entry.rank}
              username={entry.username}
              score={entry.score}
              playedAt={entry.playedAt}
              modeLabel={gameModeLabel(entry.gameMode)}
              modeIcon={gameModeIcon(entry.gameMode)}
              medal={entry.medal}
              now={now}
            />
          ))}
        </ul>
      )}
      {status === 'empty' && (
        <div className="text-center py-4">
          <div className="text-3xl mb-1">🏆</div>
          <p className="text-sm text-[#d8e4ea] font-medium">
            Belum ada skor di leaderboard
          </p>
          <p className="text-xs text-[#c8c4d7] mt-1">
            Mainkan game mode dan submit skor untuk masuk papan atas!
          </p>
          {errorMsg && process.env.NODE_ENV !== 'production' && (
            <p className="text-[10px] text-[#ffb4ab] mt-2 font-mono break-all">
              [dev] {errorMsg}
            </p>
          )}
        </div>
      )}
      {status === 'error' && (
        <div className="text-center py-4">
          <p className="text-sm text-[#ffb4ab]">
            Gagal memuat leaderboard
          </p>
          {errorMsg && process.env.NODE_ENV !== 'production' && (
            <p className="text-[10px] text-[#c8c4d7] mt-1 font-mono break-all">
              [dev] {errorMsg}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}

function TopScoreRow({
  id,
  rank,
  username,
  score,
  playedAt,
  modeLabel,
  modeIcon,
  medal,
  now,
}: {
  id: string;
  rank: number;
  username: string;
  score: number;
  playedAt: string;
  modeLabel: string;
  modeIcon: string;
  medal: '🥇' | '🥈' | '🥉' | null;
  now: number;
}) {
  return (
    <li
      data-todo-id={id}
      className="flex items-center gap-3 p-2 rounded-xl"
      style={{ backgroundColor: colors.inputBg }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
        style={{
          backgroundColor: medal ? `${colors.gold}20` : colors.darkGray,
          color: medal ? colors.gold : colors.darkText,
        }}
      >
        {medal ?? `#${rank}`}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[#d8e4ea] truncate font-medium">
          {username}
        </div>
        <div className="text-xs text-[#c8c4d7] flex items-center gap-1">
          <span>{modeIcon}</span>
          <span>{modeLabel}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-[#d8e4ea]">
          {score.toLocaleString()}
        </div>
        <div className="text-[10px] text-[#c8c4d7]">
          {formatRelativeTime(playedAt, now)}
        </div>
      </div>
    </li>
  );
}

function TopScoresSkeleton() {
  return (
    <ul className="space-y-2 list-none p-0 m-0" aria-busy="true" aria-label="Memuat leaderboard">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="h-14 rounded-xl animate-pulse"
          style={{ backgroundColor: colors.inputBg }}
        />
      ))}
    </ul>
  );
}
