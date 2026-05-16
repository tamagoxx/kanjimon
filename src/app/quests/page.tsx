'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCollectionStore } from '@/store/collectionStore';

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
  navBg: '#162125',
};

const QUEST_ICONS: Record<string, string> = {
  BATTLE: '⚔️',
  MODULE: '📚',
  REVIEW: '🔁',
  STREAK: '🔥',
  COLLECT: '🎰',
};

const QUEST_COLORS: Record<string, string> = {
  BATTLE: '#ff6b35',
  MODULE: '#6c5ce7',
  REVIEW: '#4bddb7',
  STREAK: '#f0bf63',
  COLLECT: '#4facfe',
};

// Top App Bar
function TopAppBar() {
  const router = useRouter();
  const diamonds = useCollectionStore(s => s.diamonds);
  const streakDays = useCollectionStore(s => s.streakDays);

  return (
    <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: colors.navBg }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: colors.brand }}>
          T
        </div>
        <div>
          <span className="text-base font-medium text-[#c6bfff]">Quest Harian</span>
          {streakDays > 0 && (
            <div className="flex items-center gap-1 text-xs">
              <span>🔥</span>
              <span style={{ color: colors.gold }}>{streakDays} hari streak</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full" style={{ backgroundColor: `${colors.gold}20` }}>
          <span className="text-sm">💎</span>
          <span className="text-xs font-bold text-[#f0bf63]">{diamonds}</span>
        </div>
        <button onClick={() => router.push('/')} className="text-sm px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.inputBg, color: colors.darkText }}>
          ← Home
        </button>
      </div>
    </div>
  );
}

// Bottom Navigation
function BottomNav() {
  const router = useRouter();

  const navItems = [
    { icon: '🏠', label: 'Home', route: '/' },
    { icon: '📚', label: 'Belajar', route: '/learn' },
    { icon: '⚔️', label: 'Battle', route: '/battle' },
    { icon: '🃏', label: 'Kartu', route: '/collection' },
    { icon: '🛒', label: 'Toko', route: '/shop' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-30" style={{ backgroundColor: colors.navBg }}>
      {navItems.map((item, i) => (
        <button
          key={i}
          onClick={() => router.push(item.route)}
          className="flex flex-col items-center gap-1 transition-opacity opacity-60"
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs" style={{ color: colors.darkText }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// Progress Overview Card
function ProgressOverview({ quests }: { quests: any[] }) {
  const completed = quests.filter(q => q.claimed).length;
  const total = quests.length;
  const totalDiamonds = quests.reduce((sum: number, q: any) => sum + (q.diamondReward || 0), 0);
  const earnedDiamonds = quests.filter((q: any) => q.claimed).reduce((sum: number, q: any) => sum + (q.diamondReward || 0), 0);
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl"
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-[#d8e4ea]">Quest Harian</h2>
          <p className="text-sm text-[#c8c4d7]">Selesaikan quest untuk hadiah 💎</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold" style={{ color: colors.brand }}>{completed}/{total}</span>
          <p className="text-xs text-[#c8c4d7]">quest selesai</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-3 rounded-full overflow-hidden mb-3" style={{ backgroundColor: colors.inputBg }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{ backgroundColor: colors.teal }}
        />
      </div>

      {/* Diamond rewards summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="text-lg">💎</span>
          <span className="text-sm font-bold text-[#c6bfff]">{earnedDiamonds}/{totalDiamonds} Diamond</span>
        </div>
        <div className="flex-1" />
        <span className="text-xs text-[#c8c4d7]">⏰ Reset 00:00</span>
      </div>
    </motion.div>
  );
}

// Quest Card
function QuestCard({ quest, onClaim, index }: {
  quest: any;
  onClaim: (quest: any) => void;
  index: number;
}) {
  const color = QUEST_COLORS[quest.type] || colors.brand;
  const icon = QUEST_ICONS[quest.type] || '📌';
  const canClaim = quest.completed && !quest.claimed;
  const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);

  // Hint text based on quest type
  const hintText: Record<string, string> = {
    BATTLE: 'Menangkan battle',
    MODULE: 'Selesaikan kuis belajar',
    REVIEW: 'Review kartu',
    STREAK: 'Login dan belajar',
    COLLECT: 'Tangkap Pokemon baru',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-2xl overflow-hidden"
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            {icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-[#d8e4ea]">{quest.title}</span>
              {quest.claimed && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${colors.gold}30`, color: colors.gold }}>
                  🏆 Didapat
                </span>
              )}
              {quest.completed && !quest.claimed && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${colors.teal}30`, color: colors.teal }}>
                  ✓ Siap Klaim
                </span>
              )}
            </div>
            <p className="text-sm text-[#c8c4d7] mb-1">{quest.description}</p>
            <p className="text-xs text-[#c8c4d7]/60 mb-3">💡 {hintText[quest.type] || 'Aktivitas terkait'}</p>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#c8c4d7]">Progress</span>
                <span className="font-bold text-[#d8e4ea]">{quest.progress}/{quest.target}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.inputBg }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${progressPercent}%`, backgroundColor: color }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-[#c8c4d7]/60">State: {quest.completed ? (quest.claimed ? 'claimed' : 'ready-to-claim') : 'in-progress'}</span>
              </div>
            </div>

            {/* Rewards */}
            <div className="flex items-center gap-3">
              {quest.xpReward > 0 && (
                <span className="text-sm" style={{ color: colors.gold }}>⭐ {quest.xpReward} XP</span>
              )}
              {quest.diamondReward > 0 && (
                <span className="text-sm" style={{ color: colors.lightPurple }}>💎 {quest.diamondReward}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="border-t" style={{ borderColor: colors.inputBg }}>
        {quest.claimed ? (
          <div className="w-full py-3 text-center text-sm font-medium" style={{ backgroundColor: `${colors.teal}10`, color: colors.teal }}>
            ✓ Hadiah Sudah Diclaim
          </div>
        ) : quest.completed ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onClaim(quest)}
            className="w-full py-3 text-center text-sm font-bold text-white"
            style={{ backgroundColor: colors.gold }}
          >
            Klaim Hadiah 🎁
          </motion.button>
        ) : (
          <div className="w-full py-3 text-center text-sm" style={{ backgroundColor: `${color}10`, color }}>
            🔄 Sedang Progress...
          </div>
        )}
      </div>
    </motion.div>
  );
}

// How to earn progress section
function HowToEarn() {
  const router = useRouter();

  const ways = [
    { icon: '⚔️', label: 'Battle', desc: 'Menangkan battle untuk progress', route: '/battle', color: '#ff6b35' },
    { icon: '📚', label: 'Belajar', desc: 'Selesaikan kuis dengan skor ≥6', route: '/learn', color: '#6c5ce7' },
    { icon: '🎰', label: 'Gacha', desc: 'Tangkap Pokemon baru', route: '/gacha', color: '#4bddb7' },
    { icon: '🃏', label: 'Collection', desc: 'Lihat kartu yang dimiliki', route: '/collection', color: '#f0bf63' },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-[#c8c4d7] tracking-wider">CARA MENDAPATKAN PROGRESS</h3>
      <div className="grid grid-cols-2 gap-2">
        {ways.map((way, i) => (
          <button
            key={i}
            onClick={() => router.push(way.route)}
            className="p-3 rounded-xl text-left transition-transform active:scale-95"
            style={{ backgroundColor: colors.cardBg }}
          >
            <span className="text-2xl">{way.icon}</span>
            <p className="text-sm font-bold text-[#d8e4ea] mt-1">{way.label}</p>
            <p className="text-xs text-[#c8c4d7]">{way.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function QuestsPage() {
  const dailyQuests = useCollectionStore(s => s.dailyQuests);
  const checkAndResetDailyQuests = useCollectionStore(s => s.checkAndResetDailyQuests);
  const completeQuest = useCollectionStore(s => s.completeQuest);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [lastClaimedQuest, setLastClaimedQuest] = useState<any>(null);
  const router = useRouter();

  // Check and reset quests on page load
  useEffect(() => {
    checkAndResetDailyQuests();
  }, [checkAndResetDailyQuests]);

  // Also check on visibility change (app coming to foreground)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndResetDailyQuests();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [checkAndResetDailyQuests]);

  const handleClaim = (quest: any) => {
    console.log(`[Quest] handleClaim called for: ${quest.id}, completed: ${quest.completed}, claimed: ${quest.claimed}`);
    if (!quest.completed || quest.claimed) {
      console.log(`[Quest] handleClaim blocked - already completed or claimed`);
      return;
    }

    completeQuest(quest.id);

    // Force a re-render by toggling a state key
    setLastClaimedQuest(null);
    // Use setTimeout to ensure store update completes first
    setTimeout(() => {
      const latestQuests = useCollectionStore.getState().dailyQuests;
      const updatedQuest = latestQuests.find(q => q.id === quest.id);
      console.log(`[Quest] After claim - quest state:`, updatedQuest);
      setLastClaimedQuest(updatedQuest || quest);
      setShowRewardModal(true);
    }, 100);
  };

  const completedCount = dailyQuests.filter(q => q.claimed).length;
  const totalCount = dailyQuests.length;
  const allClaimed = completedCount === totalCount && totalCount > 0;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Progress Overview */}
        <ProgressOverview quests={dailyQuests} />

        {/* How to earn */}
        <HowToEarn />

        {/* Quest List */}
        <section>
          <h3 className="text-sm font-bold text-[#c8c4d7] mb-3 tracking-wider">QUEST HARIAN</h3>
          <div className="space-y-3">
            {dailyQuests.length === 0 ? (
              <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
                <div className="text-4xl mb-2">⏳</div>
                <p className="text-[#c8c4d7]">Memuat quest...</p>
              </div>
            ) : (
              dailyQuests.map((quest, i) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onClaim={handleClaim}
                  index={i}
                />
              ))
            )}
          </div>
        </section>

        {/* All done indicator */}
        {allClaimed && (
          <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: `${colors.teal}20` }}>
            <span className="text-4xl mb-2 block">🏆</span>
            <p className="text-lg font-bold text-[#d8e4ea]">Semua Quest Selesai!</p>
            <p className="text-sm text-[#c8c4d7]">Sampai jumpa besok! 💎</p>
          </div>
        )}

        {/* Info box */}
        <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.brand}15` }}>
          <p className="text-xs text-[#c8c4d7] text-center">
            💡 Quest di-reset setiap hari jam 00:00. Klaim hadiah sebelum reset!
          </p>
        </div>
      </main>

      <BottomNav />

      {/* Reward Claimed Modal */}
      <AnimatePresence>
        {showRewardModal && lastClaimedQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowRewardModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-72 rounded-2xl p-6 text-center"
              style={{ backgroundColor: colors.cardBg }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-xl font-bold text-[#d8e4ea] mb-2">Hadiah Diclaim!</h3>
              <p className="text-sm text-[#c8c4d7] mb-4">{lastClaimedQuest.title}</p>

              <div className="flex justify-center gap-4 mb-4">
                {lastClaimedQuest.xpReward > 0 && (
                  <div className="text-center">
                    <span className="text-2xl">⭐</span>
                    <p className="text-lg font-bold text-[#d8e4ea]">+{lastClaimedQuest.xpReward}</p>
                    <p className="text-xs text-[#c8c4d7]">XP</p>
                  </div>
                )}
                {lastClaimedQuest.diamondReward > 0 && (
                  <div className="text-center">
                    <span className="text-2xl">💎</span>
                    <p className="text-lg font-bold text-[#c6bfff]">+{lastClaimedQuest.diamondReward}</p>
                    <p className="text-xs text-[#c8c4d7]">Diamond</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowRewardModal(false)}
                className="w-full py-3 rounded-xl font-bold text-white"
                style={{ backgroundColor: colors.brand }}
              >
                Terima kasih!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}