'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

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

type QuestType = 'BATTLE' | 'LEARN' | 'COLLECTION' | 'STUDY' | 'STREAK';

interface Quest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  coinReward: number;
  completed: boolean;
  claimed: boolean;
}

const INITIAL_QUESTS: Quest[] = [
  { id: '1', type: 'BATTLE', title: 'Battle Beginner', description: 'Menangkan 1 battle', target: 1, progress: 0, xpReward: 50, coinReward: 100, completed: false, claimed: false },
  { id: '2', type: 'LEARN', title: 'Hiragana Master', description: 'Pelajari 5 karakter hiragana', target: 5, progress: 0, xpReward: 30, coinReward: 60, completed: false, claimed: false },
  { id: '3', type: 'STUDY', title: 'Study Session', description: 'Selesaikan 1 modul belajar', target: 1, progress: 0, xpReward: 40, coinReward: 80, completed: false, claimed: false },
  { id: '4', type: 'BATTLE', title: 'Battle Champion', description: 'Menangkan 3 battles', target: 3, progress: 0, xpReward: 100, coinReward: 200, completed: false, claimed: false },
  { id: '5', type: 'COLLECTION', title: 'Card Collector', description: 'Kumpulkan 10 kartu baru', target: 10, progress: 0, xpReward: 60, coinReward: 120, completed: false, claimed: false },
];

const QUEST_ICONS: Record<QuestType, string> = {
  BATTLE: '⚔️',
  LEARN: '📚',
  COLLECTION: '🃏',
  STUDY: '🎯',
  STREAK: '🔥',
};

const QUEST_COLORS: Record<QuestType, string> = {
  BATTLE: '#ffb4ab',
  LEARN: '#6c5ce7',
  COLLECTION: '#f0bf63',
  STUDY: '#4bddb7',
  STREAK: '#c6bfff',
};

// Top App Bar
function TopAppBar() {
  const router = useRouter();
  
  return (
    <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: colors.navBg }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: colors.brand }}>
          T
        </div>
        <span className="text-base font-medium text-[#c6bfff]">Quests Harian</span>
      </div>
      <button onClick={() => router.push('/')} className="text-sm px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.inputBg, color: colors.darkText }}>
        ← Home
      </button>
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
    { icon: '👤', label: 'Profile', route: '/profile' },
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
function ProgressOverview({ quests }: { quests: Quest[] }) {
  const completed = quests.filter(q => q.completed).length;
  const total = quests.length;
  const totalXp = quests.reduce((sum, q) => sum + q.xpReward, 0);
  const earnedXp = quests.filter(q => q.completed).reduce((sum, q) => sum + q.xpReward, 0);
  const progressPercent = Math.round((completed / total) * 100);
  
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
          <p className="text-sm text-[#c8c4d7]">Selesaikan quest untuk dapat hadiah</p>
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
      
      {/* XP and Coins */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="text-lg">⭐</span>
          <span className="text-sm font-bold text-[#d8e4ea]">{earnedXp}/{totalXp} XP</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-lg">🪙</span>
          <span className="text-sm font-bold text-[#f0bf63]">
            {quests.filter(q => q.completed).reduce((sum, q) => sum + q.coinReward, 0)}
          </span>
        </div>
        <div className="flex-1" />
        <span className="text-xs text-[#c8c4d7]">⏰ Reset 12:00</span>
      </div>
    </motion.div>
  );
}

// Quest Card
function QuestCard({ quest, onProgress, onClaim, index }: {
  quest: Quest;
  onProgress: (id: string) => void;
  onClaim: (id: string) => void;
  index: number;
}) {
  const color = QUEST_COLORS[quest.type] || colors.brand;
  const icon = QUEST_ICONS[quest.type] || '📌';
  const canClaim = quest.completed && !quest.claimed;
  const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);
  
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
              {quest.completed && !quest.claimed && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${colors.teal}30`, color: colors.teal }}>
                  ✓ Selesai
                </span>
              )}
              {quest.claimed && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: `${colors.gold}30`, color: colors.gold }}>
                  🏆 Didapat
                </span>
              )}
            </div>
            <p className="text-sm text-[#c8c4d7] mb-3">{quest.description}</p>
            
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
            </div>
            
            {/* Rewards */}
            <div className="flex items-center gap-3">
              <span className="text-sm" style={{ color: colors.gold }}>⭐ {quest.xpReward} XP</span>
              <span className="text-sm" style={{ color: colors.gold }}>🪙 {quest.coinReward}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Button */}
      <div className="border-t" style={{ borderColor: colors.inputBg }}>
        {!quest.completed ? (
          <button
            onClick={() => onProgress(quest.id)}
            className="w-full py-3 text-center text-sm font-bold transition-colors"
            style={{ backgroundColor: `${color}15`, color }}
          >
            + Tingkatkan Progress
          </button>
        ) : !quest.claimed ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onClaim(quest.id)}
            className="w-full py-3 text-center text-sm font-bold text-white"
            style={{ backgroundColor: colors.gold }}
          >
            Klaim Hadiah 🎁
          </motion.button>
        ) : (
          <div className="w-full py-3 text-center text-sm font-medium" style={{ backgroundColor: `${colors.teal}10`, color: colors.teal }}>
            ✓ Hadiah Sudah Diclaim
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [lastClaimedQuest, setLastClaimedQuest] = useState<Quest | null>(null);
  const router = useRouter();

  const handleProgress = (questId: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId && q.progress < q.target) {
        const newProgress = q.progress + 1;
        return { ...q, progress: newProgress, completed: newProgress >= q.target };
      }
      return q;
    }));
  };

  const handleClaim = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return;
    
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, claimed: true } : q));
    setLastClaimedQuest(quest);
    setShowRewardModal(true);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Progress Overview */}
        <ProgressOverview quests={quests} />

        {/* Quest List */}
        <section>
          <h3 className="text-sm font-bold text-[#c8c4d7] mb-3 tracking-wider">QUEST aktif</h3>
          <div className="space-y-3">
            {quests.map((quest, i) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onProgress={handleProgress}
                onClaim={handleClaim}
                index={i}
              />
            ))}
          </div>
        </section>

        {/* Completed indicator */}
        {quests.filter(q => q.claimed).length === quests.length && (
          <div className="text-center p-6 rounded-2xl" style={{ backgroundColor: `${colors.teal}20` }}>
            <span className="text-4xl mb-2 block">🏆</span>
            <p className="text-lg font-bold text-[#d8e4ea]">Semua Quest Selesai!</p>
            <p className="text-sm text-[#c8c4d7]"> Sampai jumpa besok!</p>
          </div>
        )}
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
                <div className="text-center">
                  <span className="text-2xl">⭐</span>
                  <p className="text-lg font-bold text-[#d8e4ea]">+{lastClaimedQuest.xpReward}</p>
                  <p className="text-xs text-[#c8c4d7]">XP</p>
                </div>
                <div className="text-center">
                  <span className="text-2xl">🪙</span>
                  <p className="text-lg font-bold text-[#f0bf63]">+{lastClaimedQuest.coinReward}</p>
                  <p className="text-xs text-[#c8c4d7]">Coins</p>
                </div>
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