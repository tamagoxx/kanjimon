'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Color palette from Figma
const colors = {
  background: '#0a1519',
  cardBg: '#1a1a2e',
  darkText: '#c8c4d7',
  lightText: '#d8e4ea',
  brand: '#6c5ce7',
  teal: '#4bddb7',
  gold: '#f0bf63',
  coral: '#ffb4ab',
  lightPurple: '#c6bfff',
  darkGray: '#2b363b',
  cardBorder: '#212c30',
};

// Module definitions
type ModuleStatus = 'completed' | 'learning' | 'locked';

interface Module {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  status: ModuleStatus;
  progress: number;
  badge?: string;
  badgeColor?: string;
  route?: string;
}

const modules: Module[] = [
  {
    id: 'hiragana',
    title: 'Hiragana',
    subtitle: 'Aksara dasar Jepang',
    icon: 'あ',
    status: 'completed',
    progress: 100,
    route: '/learn?tab=hiragana',
  },
  {
    id: 'katakana',
    title: 'Katakana',
    subtitle: 'Aksara dasar Jepang',
    icon: 'ア',
    status: 'learning',
    progress: 65,
    badge: 'Sedang Belajar',
    badgeColor: colors.brand,
    route: '/learn?tab=katakana',
  },
  {
    id: 'kanji',
    title: 'Kanji N5',
    subtitle: '103 Kanji JLPT N5',
    icon: '漢',
    status: 'locked',
    progress: 0,
    route: '/learn?tab=kanji',
  },
  {
    id: 'vocabulary',
    title: 'Kosakata',
    subtitle: '241 kata dasar N5',
    icon: '📝',
    status: 'locked',
    progress: 0,
    route: '/learn?tab=vocabulary',
  },
  {
    id: 'grammar',
    title: 'Tata Bahasa',
    subtitle: '20 pola kalimat N5',
    icon: '📖',
    status: 'locked',
    progress: 0,
    route: '/learn?tab=grammar',
  },
];

const navItems = [
  { icon: '🏠', label: 'Home', route: '/' },
  { icon: '📚', label: 'Belajar', route: '/learn', active: true },
  { icon: '⚔️', label: 'Battle', route: '/battle' },
  { icon: '🃏', label: 'Kartu', route: '/collection' },
  { icon: '👤', label: 'Profile', route: '/profile' },
];

// Progress Ring Component
function ProgressRing({ progress, size = 80, strokeWidth = 6 }: { progress: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="relative">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colors.cardBorder}
        strokeWidth={strokeWidth}
      />
      {/* Progress ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={colors.teal}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

// Module Card Component
function ModuleCard({ module, index }: { module: Module; index: number }) {
  const router = useRouter();
  const isClickable = module.status !== 'locked';

  const statusColors = {
    completed: colors.teal,
    learning: colors.brand,
    locked: colors.darkGray,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      onClick={() => isClickable && module.route && router.push(module.route)}
      className={`bg-[${colors.cardBg}] rounded-2xl p-4 flex items-center gap-4 border border-[${colors.cardBorder}] ${
        isClickable ? 'cursor-pointer hover:border-[#4BDDB7]/50' : 'opacity-60'
      } transition-colors`}
      style={{ backgroundColor: colors.cardBg, borderColor: colors.cardBorder }}
    >
      {/* Icon Area */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{
          backgroundColor: module.status === 'completed' ? `${colors.teal}20` : module.status === 'learning' ? `${colors.brand}20` : colors.cardBorder,
        }}
      >
        {module.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg font-bold text-[#d8e4ea]">{module.title}</span>
          {module.badge && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: `${module.badgeColor}30`, color: module.badgeColor }}
            >
              {module.badge}
            </span>
          )}
          {module.status === 'completed' && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.teal}30`, color: colors.teal }}>
              ✓ Selesai
            </span>
          )}
        </div>
        <p className="text-sm text-[#c8c4d7] mb-2">{module.subtitle}</p>
        {/* Progress Bar */}
        <div className="h-2 rounded-full bg-[#212c30] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${module.progress}%`,
              backgroundColor: statusColors[module.status],
            }}
          />
        </div>
      </div>

      {/* Chevron */}
      {isClickable && (
        <svg width="16" height="21" viewBox="0 0 16 21" fill="none" className="flex-shrink-0">
          <path d="M6 4L11 10.5L6 17" stroke="#c8c4d7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </motion.div>
  );
}

// Bottom Navigation
function BottomNav() {
  const router = useRouter();
  
  return (
    <div
      className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-50"
      style={{ backgroundColor: colors.darkGray }}
    >
      {navItems.map((item, i) => (
        <button
          key={i}
          onClick={() => router.push(item.route)}
          className={`flex flex-col items-center gap-1 ${
            item.active ? 'opacity-100' : 'opacity-60'
          } transition-opacity`}
        >
          <span className="text-2xl">{item.icon}</span>
          <span
            className="text-xs"
            style={{ color: item.active ? colors.teal : colors.darkText }}
          >
            {item.label}
          </span>
          {item.active && (
            <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: colors.teal }} />
          )}
        </button>
      ))}
    </div>
  );
}

// Top App Bar
function TopAppBar() {
  return (
    <div
      className="sticky top-0 z-40 h-16 px-4 flex items-center justify-between"
      style={{ backgroundColor: '#162125' }}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: colors.brand }}
        >
          T
        </div>
        <span className="text-[#c6bfff] font-medium">Tamago</span>
      </div>
      {/* Settings Icon */}
      <button className="w-10 h-10 flex items-center justify-center">
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
          <path d="M8 12.5C9.38071 12.5 10.5 11.3807 10.5 10C10.5 8.61929 9.38071 7.5 8 7.5C6.61929 7.5 5.5 8.61929 5.5 10C5.5 11.3807 6.61929 12.5 8 12.5Z" stroke="#c6bfff" strokeWidth="1.5" />
          <path d="M13.5 10C13.5 9.3587 13.3683 8.73803 13.1188 8.15969L12.9429 7.7403C12.648 7.07452 12.2744 6.45289 11.8338 5.89314L11.6066 5.6066L10.895 6.31821C10.4649 6.74831 9.98895 7.12431 9.47892 7.4353L9.07322 7.65963V7.65963C8.90439 7.75374 8.71714 7.80286 8.52762 7.80286H7.47238C7.28286 7.80286 7.09561 7.75374 6.92678 7.65963V7.65963L6.52108 7.4353C6.01105 7.12431 5.53514 6.74831 5.105 6.31821L4.3934 5.6066L4.16621 5.89314C3.72563 6.45289 3.35203 7.07452 3.05706 7.7403L2.88121 8.15969C2.63171 8.73803 2.5 9.3587 2.5 10C2.5 10.6413 2.63171 11.262 2.88121 11.8403L3.05706 12.2597C3.35203 12.9255 3.72563 13.5471 4.16621 14.1069L4.3934 14.3934L5.105 13.6818C5.53514 13.2517 6.01105 12.8757 6.52108 12.5647L6.92678 12.3404V12.3404C7.09561 12.2463 7.28286 12.1971 7.47238 12.1971H8.52762C8.71714 12.1971 8.90439 12.2463 9.07322 12.3404V12.3404L9.47892 12.5647C9.98895 12.8757 10.4649 13.2517 10.895 13.6818L11.6066 14.3934L11.8338 14.1069C12.2744 13.5471 12.648 12.9255 12.9429 12.2597L13.1188 11.8403C13.3683 11.262 13.5 10.6413 13.5 10Z" stroke="#c6bfff" strokeWidth="1.5" />
        </svg>
      </button>
    </div>
  );
}

export default function LearnPage() {
  const [showReview, setShowReview] = useState(false);

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto px-4 pt-4">
        {/* Header Section with Progress Ring */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-2xl"
          style={{ backgroundColor: colors.cardBg }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#d8e4ea] mb-1">
                Halo, Tamago! 👋
              </h1>
              <p className="text-sm text-[#c8c4d7]">
                Lanjutkan perjalanan belajarmu hari ini
              </p>
            </div>

            {/* Progress Ring with Level */}
            <div className="relative">
              <ProgressRing progress={45} size={80} strokeWidth={6} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-[#4bddb7]">Lv</span>
                <span className="text-lg font-bold text-[#d8e4ea]">7</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommended Review Section */}
        {showReview ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 rounded-2xl flex items-center gap-4 cursor-pointer"
            style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}
            onClick={() => setShowReview(false)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                  <path d="M2 8L8 2L14 8L8 14L2 8Z" stroke="#6c5ce7" strokeWidth="2" strokeLinejoin="round" />
                </svg>
                <span className="text-sm font-bold text-[#d8e4ea]">Review Hiragana</span>
              </div>
              <p className="text-sm text-[#c8c4d7]">Pelajari ulang karakter yang sudah dipelajari</p>
              <div className="mt-2 h-2 rounded-full bg-[#212c30] overflow-hidden w-3/4">
                <div className="h-full w-3/4 rounded-full bg-[#4bddb7]" />
              </div>
            </div>
            <button className="px-4 py-3 rounded-xl font-bold text-white text-sm flex items-center gap-2" style={{ backgroundColor: colors.brand }}>
              Review
              <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                <path d="M6 4L11 10.5L6 17" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-4 rounded-2xl cursor-pointer"
            style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.cardBorder}` }}
            onClick={() => setShowReview(true)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#c8c4d7]">Review Terakhir</span>
              <span className="text-xs px-2 py-1 rounded-full bg-[#4bddb7]/20 text-[#4bddb7]">Lihat Detail</span>
            </div>
            <p className="text-lg font-bold text-[#d8e4ea]">Hiragana - Dasar (46 karakter)</p>
            <p className="text-sm text-[#c8c4d7] mt-1">Selesai • Skor: 8/10</p>
          </motion.div>
        )}

        {/* Module List */}
        <div>
          <h2 className="text-sm font-bold text-[#c8c4d7] mb-3 tracking-wider">
            MODUL PEMBELAJARAN
          </h2>
          <div className="space-y-3">
            {modules.map((mod, i) => (
              <ModuleCard key={mod.id} module={mod} index={i} />
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}