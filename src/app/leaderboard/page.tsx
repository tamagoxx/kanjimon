'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  battleWins: number;
  winRate: number;
}

// Demo leaderboard data
const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, username: 'JapaneseSensei', avatar: '🎌', level: 25, xp: 15420, battleWins: 342, winRate: 78 },
  { rank: 2, username: 'NinjaMaster99', avatar: '🥷', level: 23, xp: 13280, battleWins: 298, winRate: 75 },
  { rank: 3, username: 'KanjiKing', avatar: '👑', level: 22, xp: 12150, battleWins: 275, winRate: 72 },
  { rank: 4, username: 'TokyoWarrior', avatar: '⚔️', level: 21, xp: 11400, battleWins: 258, winRate: 71 },
  { rank: 5, username: 'SakuraPlayer', avatar: '🌸', level: 20, xp: 10890, battleWins: 240, winRate: 70 },
  { rank: 6, username: 'OsakaGamer', avatar: '🏯', level: 19, xp: 9870, battleWins: 220, winRate: 68 },
  { rank: 7, username: 'AnimeFan2024', avatar: '🎭', level: 18, xp: 8950, battleWins: 195, winRate: 65 },
  { rank: 8, username: 'HiraganaHero', avatar: '📚', level: 17, xp: 8230, battleWins: 178, winRate: 63 },
  { rank: 9, username: 'KatakanaKing', avatar: '✍️', level: 16, xp: 7650, battleWins: 162, winRate: 61 },
  { rank: 10, username: 'JLPTWarrior', avatar: '🏆', level: 15, xp: 6980, battleWins: 145, winRate: 58 },
  { rank: 11, username: 'YukiSnow', avatar: '❄️', level: 14, xp: 6340, battleWins: 130, winRate: 56 },
  { rank: 12, username: 'SamuraiSpirit', avatar: '🛡️', level: 13, xp: 5780, battleWins: 118, winRate: 54 },
  { rank: 13, username: 'RamenLover', avatar: '🍜', level: 12, xp: 5120, battleWins: 102, winRate: 51 },
  { rank: 14, username: 'OnigiriHunter', avatar: '🌙', level: 11, xp: 4650, battleWins: 89, winRate: 48 },
  { rank: 15, username: 'WasabiBoss', avatar: '🔥', level: 10, xp: 4100, battleWins: 78, winRate: 45 },
];

const TIME_FILTERS = ['Daily', 'Weekly', 'Monthly', 'All Time'];
const STAT_FILTERS = ['XP', 'Battle Wins', 'Win Rate', 'Level'];

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [statFilter, setStatFilter] = useState('XP');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeaderboard = useMemo(() => {
    let result = [...DEMO_LEADERBOARD];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => e.username.toLowerCase().includes(q));
    }

    // Sort by selected stat
    switch (statFilter) {
      case 'Battle Wins':
        return result.sort((a, b) => b.battleWins - a.battleWins);
      case 'Win Rate':
        return result.sort((a, b) => b.winRate - a.winRate);
      case 'Level':
        return result.sort((a, b) => b.level - a.level);
      default:
        return result.sort((a, b) => b.xp - a.xp);
    }
  }, [timeFilter, statFilter, searchQuery]);

  // Re-rank after sorting
  const rankedLeaderboard = filteredLeaderboard.map((entry, i) => ({
    ...entry,
    rank: i + 1,
  }));

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#FDCB6E'; // Gold
      case 2: return '#B2BEC3'; // Silver
      case 3: return '#E17055'; // Bronze
      default: return '#636E72';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0F0F1A]/80 border-b border-[#2D2D44]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] bg-clip-text text-transparent">
              KanjiMon
            </Link>
            <span className="text-[#636E72]">/ Leaderboard</span>
          </div>
          <Link href="/" className="text-sm text-[#B2BEC3] hover:text-white">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h1 className="text-2xl font-bold text-white mb-2">🏆 Leaderboard</h1>
          <p className="text-[#636E72]">Rival pemain terbaik dari seluruh dunia!</p>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search player..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1A1A2E] border border-[#2D2D44] rounded-xl text-white placeholder-[#636E72] focus:outline-none focus:border-[#6C5CE7]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636E72] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-4">
            {/* Time Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#636E72]">Period:</span>
              <div className="flex gap-1">
                {TIME_FILTERS.map(filter => (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      timeFilter === filter
                        ? 'bg-[#6C5CE7] text-white'
                        : 'bg-[#1A1A2E] text-[#B2BEC3] border border-[#2D2D44] hover:border-[#6C5CE7]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Stat Filter */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-[#636E72]">Sort by:</span>
              <div className="flex gap-1">
                {STAT_FILTERS.map(filter => (
                  <button
                    key={filter}
                    onClick={() => setStatFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      statFilter === filter
                        ? 'bg-[#00B894] text-white'
                        : 'bg-[#1A1A2E] text-[#B2BEC3] border border-[#2D2D44] hover:border-[#6C5CE7]'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        {searchQuery === '' && (
          <div className="mb-8">
            <div className="flex items-end justify-center gap-4">
              {/* 2nd Place */}
              {rankedLeaderboard[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex-1 max-w-[180px] text-center"
                >
                  <div className="text-4xl mb-2">{rankedLeaderboard[1].avatar}</div>
                  <div className="w-full h-28 bg-gradient-to-t from-[#B2BEC3]/30 to-transparent rounded-t-xl pt-4 pb-2">
                    <div className="bg-[#1A1A2E] rounded-xl p-3 border border-[#B2BEC3]/40">
                      <div className="text-2xl mb-1">🥈</div>
                      <div className="text-sm font-bold text-white truncate">{rankedLeaderboard[1].username}</div>
                      <div className="text-xs text-[#B2BEC3]">Lv.{rankedLeaderboard[1].level}</div>
                      <div className="text-xs text-yellow-400 mt-1">{rankedLeaderboard[1].xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 1st Place */}
              {rankedLeaderboard[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 max-w-[200px] text-center"
                >
                  <div className="text-5xl mb-2 animate-pulse">{rankedLeaderboard[0].avatar}</div>
                  <div className="w-full h-36 bg-gradient-to-t from-[#FDCB6E]/30 to-transparent rounded-t-xl pt-4 pb-2">
                    <div className="bg-[#1A1A2E] rounded-xl p-4 border border-[#FDCB6E]/60 shadow-lg shadow-[#FDCB6E]/20">
                      <div className="text-3xl mb-1">🥇</div>
                      <div className="text-sm font-bold text-white truncate">{rankedLeaderboard[0].username}</div>
                      <div className="text-xs text-[#B2BEC3]">Lv.{rankedLeaderboard[0].level}</div>
                      <div className="text-sm text-yellow-400 mt-1 font-bold">{rankedLeaderboard[0].xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {rankedLeaderboard[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex-1 max-w-[180px] text-center"
                >
                  <div className="text-4xl mb-2">{rankedLeaderboard[2].avatar}</div>
                  <div className="w-full h-20 bg-gradient-to-t from-[#E17055]/30 to-transparent rounded-t-xl pt-4 pb-2">
                    <div className="bg-[#1A1A2E] rounded-xl p-3 border border-[#E17055]/40">
                      <div className="text-2xl mb-1">🥉</div>
                      <div className="text-sm font-bold text-white truncate">{rankedLeaderboard[2].username}</div>
                      <div className="text-xs text-[#B2BEC3]">Lv.{rankedLeaderboard[2].level}</div>
                      <div className="text-xs text-yellow-400 mt-1">{rankedLeaderboard[2].xp.toLocaleString()} XP</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Full Leaderboard List */}
        <div className="space-y-2">
          {rankedLeaderboard.map((entry, i) => {
            const rankColor = getRankColor(entry.rank);

            return (
              <motion.div
                key={entry.username}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                  entry.rank <= 3
                    ? 'bg-[#1A1A2E]/50 border border-[#2D2D44]'
                    : 'bg-[#1A1A2E] border border-transparent hover:border-[#2D2D44]'
                }`}
              >
                {/* Rank */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
                  style={{
                    backgroundColor: `${rankColor}20`,
                    color: rankColor,
                  }}
                >
                  {entry.rank <= 3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#2D2D44] flex items-center justify-center text-xl">
                  {entry.avatar}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="font-bold text-white">{entry.username}</div>
                  <div className="text-xs text-[#636E72]">Level {entry.level}</div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="text-yellow-400 font-bold">{entry.xp.toLocaleString()}</div>
                    <div className="text-[10px] text-[#636E72]">XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold">{entry.battleWins}</div>
                    <div className="text-[10px] text-[#636E72]">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[#00B894] font-bold">{entry.winRate}%</div>
                    <div className="text-[10px] text-[#636E72]">Win Rate</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Your Rank (demo) */}
        <div className="mt-6 p-4 bg-gradient-to-r from-[#6C5CE7]/20 to-[#A29BFE]/20 rounded-xl border border-[#6C5CE7]/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6C5CE7] flex items-center justify-center font-bold text-white">
                #
              </div>
              <div>
                <div className="font-bold text-white">Your Position</div>
                <div className="text-xs text-[#636E72]">GuestPlayer</div>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-yellow-400 font-bold">0</div>
                <div className="text-[10px] text-[#636E72]">XP</div>
              </div>
              <div className="text-center">
                <div className="text-white font-bold">0</div>
                <div className="text-[10px] text-[#636E72]">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-[#636E72] font-bold">--</div>
                <div className="text-[10px] text-[#636E72]">Win Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-xs text-[#636E72] mt-6">
          Rankings update every hour • Win battles to climb the ladder!
        </p>
      </main>
    </div>
  );
}