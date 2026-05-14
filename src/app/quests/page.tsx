'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { DailyQuest } from '@/types';

// Demo quests
const DEMO_QUESTS: DailyQuest[] = [
  { id: '1', type: 'BATTLE', title: 'Battle Beginner', description: 'Win 1 battle', target: 1, progress: 0, xpReward: 50, cardReward: 3, completed: false },
  { id: '2', type: 'LEARN', title: 'Hiragana Master', description: 'Practice hiragana for 5 minutes', target: 5, progress: 0, xpReward: 30, cardReward: 1, completed: false },
  { id: '3', type: 'MODULE', title: 'Study Session', description: 'Complete 1 learning module', target: 1, progress: 0, xpReward: 40, cardReward: 2, completed: false },
  { id: '4', type: 'BATTLE', title: 'Battle Champion', description: 'Win 3 battles', target: 3, progress: 0, xpReward: 100, cardReward: 5, completed: false },
  { id: '5', type: 'REVIEW', title: 'Card Review', description: 'Review 20 cards in collection', target: 20, progress: 0, xpReward: 60, cardReward: 3, completed: false },
  { id: '6', type: 'STREAK', title: 'Daily Login', description: 'Login and play KanjiMon', target: 1, progress: 0, xpReward: 20, cardReward: 1, completed: false },
];

const QUEST_ICONS: Record<string, string> = {
  BATTLE: '⚔️',
  LEARN: '📚',
  MODULE: '🎯',
  REVIEW: '🔄',
  STREAK: '🔥',
};

const QUEST_COLORS: Record<string, string> = {
  BATTLE: '#E17055',
  LEARN: '#6C5CE7',
  MODULE: '#00B894',
  REVIEW: '#0984E3',
  STREAK: '#FDCB6E',
};

export default function QuestsPage() {
  const [quests, setQuests] = useState<DailyQuest[]>(DEMO_QUESTS);
  const [claimedRewards, setClaimedRewards] = useState<Set<string>>(new Set());

  // Calculate progress
  const stats = useMemo(() => {
    const completed = quests.filter(q => q.completed).length;
    const total = quests.length;
    const totalXp = quests.reduce((sum, q) => sum + q.xpReward, 0);
    const earnedXp = quests.filter(q => q.completed).reduce((sum, q) => sum + q.xpReward, 0);

    return {
      completed,
      total,
      totalXp,
      earnedXp,
      remaining: total - completed,
      progressPercent: Math.round((completed / total) * 100),
    };
  }, [quests]);

  const claimReward = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.completed || claimedRewards.has(questId)) return;

    setClaimedRewards(prev => new Set([...prev, questId]));
    // In real app: update user XP and add cards
  };

  const simulateProgress = (questId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId && q.progress < q.target) {
        const newProgress = q.progress + 1;
        return {
          ...q,
          progress: newProgress,
          completed: newProgress >= q.target,
        };
      }
      return q;
    }));
  };

  const resetAllQuests = () => {
    setQuests(DEMO_QUESTS.map(q => ({ ...q, progress: 0, completed: false })));
    setClaimedRewards(new Set());
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
            <span className="text-[#636E72]">/ Daily Quests</span>
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
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-white mb-2">✨ Daily Quests</h1>
          <p className="text-[#636E72]">Complete quests to earn XP and cards!</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8 p-4 bg-[#1A1A2E] rounded-xl border border-[#2D2D44]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Daily Progress</span>
            <span className="text-sm text-[#636E72]">{stats.completed}/{stats.total} quests</span>
          </div>
          <div className="h-3 bg-[#2D2D44] rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#00B894]"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">⭐</span>
                <span className="text-white font-bold">{stats.earnedXp}/{stats.totalXp} XP</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#636E72]">Cards:</span>
                <span className="text-white font-bold">{quests.filter(q => q.completed && claimedRewards.has(q.id)).reduce((sum, q) => sum + (q.cardReward || 0), 0)}</span>
              </div>
            </div>
            <button
              onClick={resetAllQuests}
              className="text-xs text-[#636E72] hover:text-white"
            >
              Reset Demo
            </button>
          </div>
        </div>

        {/* Quest List */}
        <div className="space-y-4">
          {quests.map((quest, i) => {
            const canClaim = quest.completed && !claimedRewards.has(quest.id);
            const color = QUEST_COLORS[quest.type] || '#6C5CE7';
            const icon = QUEST_ICONS[quest.type] || '📌';

            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  quest.completed
                    ? 'bg-[#00B894]/10 border-[#00B894]/40'
                    : 'bg-[#1A1A2E] border-[#2D2D44] hover:border-[#6C5CE7]'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{quest.title}</h3>
                      {quest.completed && (
                        <span className="px-2 py-0.5 bg-[#00B894]/20 text-[#00B894] rounded-full text-xs">
                          ✓ Complete
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#636E72] mb-3">{quest.description}</p>

                    {/* Progress */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#636E72]">Progress</span>
                          <span className="text-white font-medium">{quest.progress}/{quest.target}</span>
                        </div>
                        <div className="h-2 bg-[#2D2D44] rounded-full overflow-hidden">
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, (quest.progress / quest.target) * 100)}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-yellow-400">⭐ {quest.xpReward} XP</span>
                        {quest.cardReward && (
                          <span className="text-[#6C5CE7]">🃏 ×{quest.cardReward}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {!quest.completed ? (
                      <button
                        onClick={() => simulateProgress(quest.id)}
                        className="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5B4BD5] rounded-lg text-sm font-medium text-white transition-colors"
                      >
                        + Progress
                      </button>
                    ) : !claimedRewards.has(quest.id) ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => claimReward(quest.id)}
                        className="px-4 py-2 bg-gradient-to-r from-[#FDCB6E] to-[#E17055] rounded-lg text-sm font-bold text-white shadow-lg"
                        style={{ boxShadow: `0 4px 12px ${color}40` }}
                      >
                        Claim! 🎁
                      </motion.button>
                    ) : (
                      <div className="px-4 py-2 bg-[#00B894]/20 text-[#00B894] rounded-lg text-sm font-medium text-center">
                        Claimed ✓
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-[#1A1A2E]/50 rounded-xl border border-[#2D2D44]">
          <p className="text-center text-sm text-[#636E72]">
            🎮 Demo mode — click "Progress" to simulate completing quests
            <br />
            <span className="text-xs">Quests reset daily at midnight</span>
          </p>
        </div>
      </main>
    </div>
  );
}