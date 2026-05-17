'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
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

// XP needed per level
const XP_PER_LEVEL = 500;

function getXPForLevel(level: number): number {
  return level * XP_PER_LEVEL;
}

function getLevelFromXP(xp: number): { level: number; currentXP: number; xpForNextLevel: number; progress: number } {
  let level = 1;
  let remainingXP = xp;

  while (remainingXP >= getXPForLevel(level)) {
    remainingXP -= getXPForLevel(level);
    level++;
  }

  const xpForNext = getXPForLevel(level);
  const progress = (remainingXP / xpForNext) * 100;

  return { level, currentXP: remainingXP, xpForNextLevel: xpForNext, progress };
}

// Top App Bar
function TopAppBar() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  return (
    <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: colors.navBg }}>
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer"
          style={{ borderColor: colors.brand }}
          onClick={() => router.push('/')}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: colors.lightPurple }}>
            {user?.username?.charAt(0).toUpperCase() || 'T'}
          </div>
        </div>
        <span className="text-xl font-bold" style={{ color: colors.lightPurple }}>Profil</span>
      </div>
      
<button
        onClick={() => router.back()}
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: colors.inputBg }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={colors.darkText} strokeWidth="2">
          <path d="M2 2l10 10M12 2L2 12" />
        </svg>
      </button>
    </div>
  );
}

// Stat Card
function StatCard({ icon, label, value, color, onClick }: {
  icon: string; label: string; value: string | number; color: string; onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="p-4 rounded-2xl flex flex-col items-center justify-center cursor-pointer"
      style={{ backgroundColor: colors.cardBg }}
    >
      <span className="text-2xl mb-1">{icon}</span>
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      <span className="text-xs" style={{ color: colors.darkText }}>{label}</span>
    </motion.div>
  );
}

// Achievement Badge
function AchievementBadge({ name, icon, earned, description }: {
  name: string; icon: string; earned: boolean; description?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  return (
    <div 
      className="relative flex flex-col items-center gap-2 p-3 rounded-xl cursor-pointer"
      style={{ backgroundColor: colors.cardBg, opacity: earned ? 1 : 0.4 }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div 
        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
        style={{ backgroundColor: earned ? `${colors.gold}30` : colors.inputBg }}
      >
        {icon}
      </div>
      <span className="text-xs text-center" style={{ color: colors.darkText }}>{name}</span>
      {earned && (
        <span className="absolute top-2 right-2 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${colors.teal}30`, color: colors.teal }}>
          ✓
        </span>
      )}
      
      <AnimatePresence>
        {showTooltip && description && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs whitespace-nowrap z-10"
            style={{ backgroundColor: colors.inputBg, color: colors.lightText }}
          >
            {description}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Deck Preview Card
function DeckPreviewCard({ name, cards, element, cardCount, onClick }: {
  name: string; cards: number; element: string; cardCount?: number; onClick?: () => void;
}) {
  const elementColors: Record<string, string> = {
    FIRE: colors.coral,
    WATER: colors.brand,
    GRASS: colors.teal,
    ELECTRIC: colors.gold,
    PSYCHIC: colors.lightPurple,
    NORMAL: colors.darkText,
  };
  
  const elementIcons: Record<string, string> = {
    FIRE: '🔥',
    WATER: '💧',
    GRASS: '🌿',
    ELECTRIC: '⚡',
    PSYCHIC: '🔮',
    NORMAL: '⚪',
  };
  
  const col = elementColors[element] || colors.darkText;
  
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="p-3 rounded-xl flex items-center gap-3 cursor-pointer"
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="w-12 h-16 rounded-lg flex items-center justify-center text-2xl" style={{ backgroundColor: `${col}20` }}>
        {elementIcons[element] || '⚪'}
      </div>
      <div className="flex-1">
        <span className="text-sm font-bold" style={{ color: colors.lightText }}>{name}</span>
        <p className="text-xs" style={{ color: colors.darkText }}>
          {cardCount !== undefined ? `${cardCount} kartu` : `${cards} kartu`}
        </p>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={colors.darkText} strokeWidth="2">
        <path d="M6 4l4 4-4 4" />
      </svg>
    </motion.div>
  );
}

// Recent Battle Card
function RecentBattleCard({ opponent, result, score, time }: {
  opponent: string; result: 'WIN' | 'LOSE'; score: string; time: string;
}) {
  const isWin = result === 'WIN';
  
  return (
    <div className="p-3 rounded-xl flex items-center gap-3" style={{ backgroundColor: colors.cardBg }}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${isWin ? '' : 'grayscale'}`}
        style={{ backgroundColor: isWin ? `${colors.teal}20` : `${colors.coral}20` }}>
        {isWin ? '🏆' : '💀'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold" style={{ color: colors.lightText }}>vs {opponent}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            isWin ? '' : ''
          }`} style={{ 
            backgroundColor: isWin ? `${colors.teal}20` : `${colors.coral}20`, 
            color: isWin ? colors.teal : colors.coral 
          }}>
            {result}
          </span>
        </div>
        <p className="text-xs" style={{ color: colors.darkText }}>{score} • {time}</p>
      </div>
    </div>
  );
}

// Learning Progress Item
function LearningProgressItem({ module, progress, status, onClick }: {
  module: string; progress: number; status: 'completed' | 'learning' | 'locked'; onClick?: () => void;
}) {
  const statusConfig = {
    completed: { color: colors.teal, label: '✓ Selesai', bg: `${colors.teal}20` },
    learning: { color: colors.brand, label: '● Belajar', bg: `${colors.brand}20` },
    locked: { color: colors.darkGray, label: '🔒 Terkunci', bg: `${colors.darkGray}20` },
  };
  
  const config = statusConfig[status];
  
  return (
    <motion.div
      whileHover={{ scale: status !== 'locked' ? 1.01 : 1 }}
      whileTap={{ scale: status !== 'locked' ? 0.99 : 1 }}
      onClick={status !== 'locked' ? onClick : undefined}
      className={`p-3 rounded-xl ${status !== 'locked' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold" style={{ color: colors.lightText }}>{module}</span>
        <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: config.bg, color: config.color }}>
          {config.label}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.inputBg }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: config.color }} />
      </div>
      <span className="text-xs mt-1 block" style={{ color: colors.darkText }}>{progress}%</span>
    </motion.div>
  );
}

// Settings Modal
function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  
  if (!isOpen) return null;
  
  const settingsItems = [
    { icon: '🔔', label: 'Notifikasi', description: 'Atur notifikasi push', hasToggle: true },
    { icon: '🌐', label: 'Bahasa', description: 'Indonesia', hasArrow: true },
    { icon: '🎨', label: 'Tema', description: 'Gelap', hasArrow: true },
    { icon: '🔐', label: 'Privasi', description: 'Kelola data pribadi', hasArrow: true },
    { icon: '❓', label: 'Bantuan', description: 'FAQ & support', hasArrow: true },
    { icon: 'ℹ️', label: 'Tentang', description: 'Versi 1.0.0', hasArrow: true },
  ];
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ backgroundColor: colors.cardBg }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b" style={{ borderColor: colors.inputBg }}>
          <span className="text-lg font-bold" style={{ color: colors.lightText }}>Pengaturan</span>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.inputBg }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={colors.darkText} strokeWidth="2">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 space-y-2">
          {settingsItems.map((item, i) => (
            <button
              key={i}
              className="w-full px-4 py-3 flex items-center justify-between rounded-xl transition-colors"
              style={{ backgroundColor: i % 2 === 0 ? colors.inputBg : 'transparent' }}
              onClick={() => {
                if (item.label === 'Keluar') {
                  useAuthStore.getState().logout();
                  router.push('/');
                }
                onClose();
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <div className="text-left">
                  <span className="text-sm font-medium block" style={{ color: colors.lightText }}>{item.label}</span>
                  <span className="text-xs" style={{ color: colors.darkText }}>{item.description}</span>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={colors.darkText} strokeWidth="2">
                <path d="M6 4l4 4-4 4" />
              </svg>
            </button>
          ))}
          
          <button
            className="w-full px-4 py-3 flex items-center justify-center gap-2 rounded-xl mt-4"
            style={{ backgroundColor: `${colors.coral}20` }}
            onClick={() => {
              useAuthStore.getState().logout();
              router.push('/');
            }}
          >
            <span className="text-xl">🚪</span>
            <span className="text-sm font-bold" style={{ color: colors.coral }}>Keluar</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Edit Profile Modal
function EditProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user, setUser } = useAuthStore();
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState('Ninja Pemula');
  
  const handleSave = () => {
    if (user && username.trim()) {
      setUser({ ...user, username: username.trim() });
    }
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ backgroundColor: colors.cardBg }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center mb-6" style={{ color: colors.lightText }}>Edit Profil</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: colors.darkText }}>Nama</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white outline-none"
              style={{ backgroundColor: colors.inputBg }}
              placeholder="Nama pengguna"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: colors.darkText }}>Bio</label>
            <input
              type="text"
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-white outline-none"
              style={{ backgroundColor: colors.inputBg }}
              placeholder="Bio singkat"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-bold"
            style={{ backgroundColor: colors.inputBg, color: colors.darkText }}
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-bold text-white"
            style={{ backgroundColor: colors.brand }}
          >
            Simpan
          </button>
        </div>
      </motion.div>
    </motion.div>
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
    { icon: '👤', label: 'Profile', route: '/profile', active: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-40" style={{ backgroundColor: colors.navBg }}>
      {navItems.map((item, i) => (
        <button
          key={i}
          onClick={() => router.push(item.route)}
          className="flex flex-col items-center gap-1 transition-opacity"
          style={{ opacity: item.active ? 1 : 0.6 }}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs" style={{ color: item.active ? colors.teal : colors.darkText }}>{item.label}</span>
          {item.active && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.teal }} />}
        </button>
      ))}
    </div>
  );
}

// All possible badges (earned = from user.badges, unearned = not yet)
function getAllBadges(badges: { id: string; name: string; icon: string; description: string; earnedAt?: string }[]) {
  const badgeMap: Record<string, { id: string; name: string; icon: string; description: string; earned: boolean; earnedAt?: string }> = {
    first_win: { id: 'first_win', name: 'First Win', icon: '🏆', description: 'Menang battle pertama', earned: false },
    collector: { id: 'collector', name: 'Collector', icon: '🃏', description: 'Kumpulkan 50 kartu', earned: false },
    scholar: { id: 'scholar', name: 'Scholar', icon: '📚', description: 'Selesaikan semua modul', earned: false },
    master: { id: 'master', name: 'Master', icon: '👑', description: 'Capai Level 20', earned: false },
    streak_7: { id: 'streak_7', name: 'Streak 7', icon: '🔥', description: 'Belajar 7 hari berturut-turut', earned: false },
    battle_50: { id: 'battle_50', name: 'Battle 50', icon: '⚔️', description: 'Selesaikan 50 battle', earned: false },
    perfect: { id: 'perfect', name: 'Perfect', icon: '⭐', description: 'Skor sempurna di kuis', earned: false },
    legend: { id: 'legend', name: 'Legend', icon: '🌟', description: 'Masuk Top 10 leaderboard', earned: false },
  };
  // Mark earned badges
  badges.forEach(b => {
    if (badgeMap[b.id]) badgeMap[b.id].earned = true;
  });
  return Object.values(badgeMap);
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, totalBattles, totalWins, studySessions } = useAuthStore();
  const { coins, diamonds, streakDays, ownedCards, ownedPokemon, fusedPokemon, decks, activeDeckId,
    hiraganaProgress, katakanaProgress, kanjiProgress, vocabularyProgress, grammarProgress } = useCollectionStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) router.replace('/auth');
  }, [isAuthenticated, router]);

  // Real data
  const levelInfo = getLevelFromXP(user?.xp || 0);
  const totalCardsOwned = ownedCards.length + ownedPokemon.length + fusedPokemon.length;
  const earnedBadges = getAllBadges(user?.badges || []);

  // Active deck preview
  const myDecks = decks.slice(0, 3);

  // Learning progress items (real from collectionStore)
  const learningProgress = [
    { module: 'Hiragana', progress: hiraganaProgress, status: hiraganaProgress >= 100 ? 'completed' as const : hiraganaProgress > 0 ? 'learning' as const : 'locked' as const },
    { module: 'Katakana', progress: katakanaProgress, status: katakanaProgress >= 100 ? 'completed' as const : katakanaProgress > 0 ? 'learning' as const : 'locked' as const },
    { module: 'Kanji N5', progress: kanjiProgress, status: kanjiProgress >= 100 ? 'completed' as const : kanjiProgress > 0 ? 'learning' as const : 'locked' as const },
    { module: 'Kosakata', progress: vocabularyProgress, status: vocabularyProgress >= 100 ? 'completed' as const : vocabularyProgress > 0 ? 'learning' as const : 'locked' as const },
    { module: 'Tata Bahasa', progress: grammarProgress, status: grammarProgress >= 100 ? 'completed' as const : grammarProgress > 0 ? 'learning' as const : 'locked' as const },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl text-center"
          style={{ backgroundColor: colors.cardBg }}
        >
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3 cursor-pointer"
            style={{ backgroundColor: colors.lightPurple }}
            onClick={() => router.push('/settings')}
          >
            {(user?.username || 'T').charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ color: colors.lightText }}>
            {user?.username || 'Tamago'}
          </h2>
          <p className="text-sm mb-3" style={{ color: colors.darkText }}>Level {levelInfo.level}</p>

          {/* Level & XP */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full" style={{ backgroundColor: colors.inputBg }}>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: colors.brand }}>
              Lv {levelInfo.level}
            </span>
            <div className="h-2 w-28 rounded-full overflow-hidden" style={{ backgroundColor: colors.darkGray }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress}%` }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="h-full rounded-full"
                style={{ backgroundColor: colors.teal }}
              />
            </div>
            <span className="text-xs" style={{ color: colors.darkText }}>
              {levelInfo.currentXP}/{levelInfo.xpForNextLevel} XP
            </span>
          </div>

          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <span className="text-lg">💎</span>
              <span className="text-sm font-bold" style={{ color: colors.gold }}>{diamonds}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-bold" style={{ color: colors.coral }}>{streakDays}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg">⭐</span>
              <span className="text-sm font-bold" style={{ color: colors.teal }}>{coins}</span>
            </div>
          </div>

          <p className="text-xs mt-3" style={{ color: colors.darkText }}>
            Anggota sejak {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : '-'}
          </p>
        </motion.div>

        {/* Quick Stats */}
        <section>
          <h3 className="text-sm font-bold mb-3 tracking-wider" style={{ color: colors.darkText }}>STATISTIK</h3>
          <div className="grid grid-cols-4 gap-2">
            <StatCard icon="⚔️" label="Battle" value={totalBattles} color={colors.coral} />
            <StatCard icon="🃏" label="Kartu" value={totalCardsOwned} color={colors.brand} />
            <StatCard icon="🏆" label="Menang" value={totalWins} color={colors.gold} />
            <StatCard icon="📚" label="Belajar" value={studySessions} color={colors.teal} />
          </div>
        </section>

        {/* My Decks */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold tracking-wider" style={{ color: colors.darkText }}>DECK SAYA</h3>
            <button
              className="text-xs font-medium"
              style={{ color: colors.teal }}
              onClick={() => router.push('/deck')}
            >
              + Buat Baru
            </button>
          </div>
          <div className="space-y-2">
            {myDecks.length === 0 ? (
              <div className="p-4 rounded-xl text-center" style={{ backgroundColor: colors.cardBg }}>
                <p className="text-sm" style={{ color: colors.darkText }}>Belum punya deck</p>
                <button onClick={() => router.push('/deck')} className="text-xs mt-1 font-medium" style={{ color: colors.teal }}>Buat deck pertama</button>
              </div>
            ) : myDecks.map((deck, i) => (
              <DeckPreviewCard
                key={deck.id}
                name={deck.name}
                cards={deck.cardIds.length}
                element="NORMAL"
                cardCount={deck.cardIds.length}
                onClick={() => router.push('/deck')}
              />
            ))}
          </div>
        </section>

        {/* Battle Stats */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold tracking-wider" style={{ color: colors.darkText }}>BATTLE STATS</h3>
            <button
              className="text-xs font-medium"
              style={{ color: colors.brand }}
              onClick={() => router.push('/battle')}
            >
              Lihat Semua
            </button>
          </div>
          <div className="p-4 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold" style={{ color: colors.teal }}>{totalBattles}</div>
                <div className="text-xs" style={{ color: colors.darkText }}>Total Battle</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: colors.gold }}>{totalWins}</div>
                <div className="text-xs" style={{ color: colors.darkText }}>Menang</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: colors.coral }}>
                  {totalBattles > 0 ? Math.round((totalWins / totalBattles) * 100) : 0}%
                </div>
                <div className="text-xs" style={{ color: colors.darkText }}>Win Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Learning Progress */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold tracking-wider" style={{ color: colors.darkText }}>PROGRESS BELAJAR</h3>
            <button
              className="text-xs font-medium"
              style={{ color: colors.brand }}
              onClick={() => router.push('/learn')}
            >
              Lihat Detail
            </button>
          </div>
          <div className="space-y-2">
            {learningProgress.map((item, i) => (
              <LearningProgressItem
                key={i}
                module={item.module}
                progress={item.progress}
                status={item.status}
                onClick={() => router.push('/learn')}
              />
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold tracking-wider" style={{ color: colors.darkText }}>PENCAPAIAN</h3>
            <span className="text-xs" style={{ color: colors.darkText }}>{earnedBadges.filter(b => b.earned).length}/{earnedBadges.length}</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {earnedBadges.map((ach, i) => (
              <AchievementBadge
                key={ach.id}
                name={ach.name}
                icon={ach.icon}
                earned={ach.earned}
                description={ach.description}
              />
            ))}
          </div>
        </section>
      </main>

      </div>
  );
}