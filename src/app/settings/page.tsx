'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

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

const settingsItems = [
  { icon: '🔔', label: 'Notifikasi', description: 'Atur notifikasi push', hasToggle: true },
  { icon: '🌐', label: 'Bahasa', description: 'Indonesia', hasArrow: true },
  { icon: '🎨', label: 'Tema', description: 'Gelap', hasArrow: true },
  { icon: '🔐', label: 'Privasi', description: 'Kelola data pribadi', hasArrow: true },
  { icon: '❓', label: 'Bantuan', description: 'FAQ & support', hasArrow: true },
  { icon: 'ℹ️', label: 'Tentang', description: 'Versi 1.0.0', hasArrow: true },
];

function TopAppBar({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: colors.cardBg }}>
      <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.inputBg }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c6bfff" strokeWidth="2">
          <path d="M10 12L6 8l4-4" />
        </svg>
      </button>
      <span className="text-base font-medium" style={{ color: colors.lightPurple }}>Pengaturan</span>
      <div className="w-10" />
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <TopAppBar onBack={() => router.back()} />

      <main className="max-w-md mx-auto px-4 py-6 space-y-3">
        {settingsItems.map((item, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full px-4 py-4 flex items-center justify-between rounded-2xl transition-colors"
            style={{ backgroundColor: colors.cardBg }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div className="text-left">
                <span className="text-base font-medium block" style={{ color: colors.lightText }}>{item.label}</span>
                <span className="text-sm" style={{ color: colors.darkText }}>{item.description}</span>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={colors.darkText} strokeWidth="2">
              <path d="M6 4l4 4-4 4" />
            </svg>
          </motion.button>
        ))}

        {/* Logout button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: settingsItems.length * 0.05 }}
          className="w-full px-4 py-4 flex items-center justify-center gap-2 rounded-2xl mt-4"
          style={{ backgroundColor: `${colors.coral}20` }}
          onClick={() => {
            useAuthStore.getState().logout();
            router.push('/');
          }}
        >
          <span className="text-2xl">🚪</span>
          <span className="text-base font-bold" style={{ color: colors.coral }}>Keluar</span>
        </motion.button>
      </main>
    </div>
  );
}