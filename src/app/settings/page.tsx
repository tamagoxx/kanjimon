'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore, type Theme, type Language } from '@/store/settingsStore';
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
};

// --- Back Button ---
function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.inputBg }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c6bfff" strokeWidth="2">
        <path d="M10 12L6 8l4-4" />
      </svg>
    </button>
  );
}

// --- Section Header ---
function SectionHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: colors.cardBg }}>
      <BackButton onBack={onBack} />
      <span className="text-base font-medium" style={{ color: colors.lightPurple }}>{title}</span>
      <div className="w-10" />
    </div>
  );
}

// --- Toggle Item ---
function ToggleItem({ icon, label, description, checked, onChange }: {
  icon: string; label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full px-4 py-4 flex items-center gap-3 rounded-2xl"
      style={{ backgroundColor: colors.cardBg }}
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex-1 text-left">
        <span className="text-base font-medium block" style={{ color: colors.lightText }}>{label}</span>
        <span className="text-sm" style={{ color: colors.darkText }}>{description}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="w-12 h-7 rounded-full flex items-center p-1 transition-colors"
        style={{ backgroundColor: checked ? colors.teal : colors.inputBg }}
      >
        <motion.div
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="w-5 h-5 rounded-full"
          style={{ backgroundColor: checked ? 'white' : colors.darkText }}
        />
      </button>
    </motion.div>
  );
}

// --- Sub Pages ---

function NotificationSettings({ onBack }: { onBack: () => void }) {
  const { notifications, setNotification } = useSettingsStore();

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <SectionHeader title="Notifikasi" onBack={onBack} />
      <main className="max-w-md mx-auto px-4 py-6 space-y-3">
        <ToggleItem
          icon="🔔"
          label="Notifikasi Push"
          description="Terima notifikasi push"
          checked={notifications.pushEnabled}
          onChange={(v) => setNotification('pushEnabled', v)}
        />
        <ToggleItem
          icon="🔊"
          label="Suara"
          description="Suara saat event"
          checked={notifications.soundEnabled}
          onChange={(v) => setNotification('soundEnabled', v)}
        />
        <ToggleItem
          icon="📅"
          label="Pengingat Harian"
          description=" напоминание belajar harian"
          checked={notifications.dailyReminder}
          onChange={(v) => setNotification('dailyReminder', v)}
        />
        <ToggleItem
          icon="⚔️"
          label="Battle Reminder"
          description=" напоминание untuk battle"
          checked={notifications.battleReminder}
          onChange={(v) => setNotification('battleReminder', v)}
        />
      </main>
    </div>
  );
}

function LanguageSettings({ onBack }: { onBack: () => void }) {
  const { language, setLanguage } = useSettingsStore();
  const languages: { id: Language; label: string; flag: string }[] = [
    { id: 'id', label: 'Indonesia', flag: '🇮🇩' },
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'jp', label: '日本語', flag: '🇯🇵' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <SectionHeader title="Bahasa" onBack={onBack} />
      <main className="max-w-md mx-auto px-4 py-6 space-y-3">
        {languages.map((lang, i) => (
          <motion.button
            key={lang.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full px-4 py-4 flex items-center gap-4 rounded-2xl transition-colors active:scale-95"
            style={{ backgroundColor: colors.cardBg }}
            onClick={() => setLanguage(lang.id)}
          >
            <span className="text-3xl">{lang.flag}</span>
            <div className="flex-1 text-left">
              <span className="text-base font-medium" style={{ color: colors.lightText }}>{lang.label}</span>
            </div>
            {language === lang.id && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.teal }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                  <path d="M2 6l3 3 5-5" />
                </svg>
              </div>
            )}
          </motion.button>
        ))}
      </main>
    </div>
  );
}

function ThemeSettings({ onBack }: { onBack: () => void }) {
  const { theme, setTheme } = useSettingsStore();
  const themes: { id: Theme; label: string; description: string; icon: string }[] = [
    { id: 'dark', label: 'Gelap', description: 'Tema default', icon: '🌙' },
    { id: 'light', label: 'Terang', description: 'Tema terang', icon: '☀️' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <SectionHeader title="Tema" onBack={onBack} />
      <main className="max-w-md mx-auto px-4 py-6 space-y-3">
        {themes.map((t, i) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full px-4 py-4 flex items-center gap-4 rounded-2xl transition-colors active:scale-95"
            style={{ backgroundColor: colors.cardBg }}
            onClick={() => setTheme(t.id)}
          >
            <span className="text-3xl">{t.icon}</span>
            <div className="flex-1 text-left">
              <span className="text-base font-medium block" style={{ color: colors.lightText }}>{t.label}</span>
              <span className="text-sm" style={{ color: colors.darkText }}>{t.description}</span>
            </div>
            {theme === t.id && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.teal }}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2">
                  <path d="M2 6l3 3 5-5" />
                </svg>
              </div>
            )}
          </motion.button>
        ))}
      </main>
    </div>
  );
}

function PrivacySettings({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <SectionHeader title="Privasi" onBack={onBack} />
      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="rounded-2xl p-4" style={{ backgroundColor: colors.cardBg }}>
          <h3 className="text-base font-bold mb-3" style={{ color: colors.lightText }}>Data Pribadi</h3>
          <div className="space-y-2 text-sm" style={{ color: colors.darkText }}>
            <p>Data kamu disimpan secara lokal di perangkat kamu.</p>
            <p>KanjiMon tidak mengumpulkan data pribadi ke server manapun.</p>
          </div>
        </div>
        <div className="rounded-2xl p-4" style={{ backgroundColor: colors.cardBg }}>
          <h3 className="text-base font-bold mb-3" style={{ color: colors.lightText }}>Hapus Data</h3>
          <p className="text-sm mb-3" style={{ color: colors.darkText }}>Hapus semua data lokal termasuk progress dan koleksi.</p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="w-full py-3 rounded-xl font-bold text-white"
            style={{ backgroundColor: `${colors.coral}40` }}
            onClick={() => {
              if (confirm('Yakin hapus semua data? Tindakan ini tidak bisa di-undo.')) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            🗑️ Hapus Semua Data
          </motion.button>
        </div>
      </main>
    </div>
  );
}

function HelpSettings({ onBack }: { onBack: () => void }) {
  const { language } = useSettingsStore();

  const faqs = language === 'id' ? [
    { q: 'Bagaimana cara menangkap Pokemon?', a: 'Buka Gacha dari menu utama untuk kesempatan menangkap Pokemon baru.' },
    { q: 'Apa itu fusion?', a: 'Fusion menggabungkan 2 Pokemon menjadi 1 dengan stats lebih tinggi dan rarity lebih baik.' },
    { q: 'Bagaimana cara mendapat kartu Jepang?', a: 'Kartu Jepang hanya bisa diperoleh dari menang Battle Janken mode.' },
    { q: 'Apa bedanya Battle Card dan Battle Janken?', a: 'Card battle adalah strategi kartu, Janken adalah game suit dengan quiz bahasa.' },
    { q: 'Bagaimana cara mendapat diamond?', a: 'Selesaikan daily quests dan menang battle untuk mendapatkan diamond.' },
  ] : language === 'en' ? [
    { q: 'How to catch Pokemon?', a: 'Open Gacha from the main menu to get a chance at catching new Pokemon.' },
    { q: 'What is fusion?', a: 'Fusion combines 2 Pokemon into 1 with higher stats and better rarity.' },
    { q: 'How to get Japanese cards?', a: 'Japanese cards can only be obtained by winning Battle Janken mode.' },
    { q: 'Difference between Card Battle and Janken?', a: 'Card battle is card strategy, Janken is a rock-paper-scissors game with language quiz.' },
    { q: 'How to earn diamonds?', a: 'Complete daily quests and win battles to earn diamonds.' },
  ] : [
    { q: 'Pokemonの捕まえ方は？', a: 'メインメニューからガシャを開いて新しいPokemonを捕まえる機会を得ましょう。' },
    { q: 'Fusionとは？', a: 'Fusionは2体のPokemonを1体にまとめ、より高いステータスとより良いレアリティにします。' },
    { q: '日本語卡的入手方法は？', a: '日本語 карт はBattle Jankenモードで勝利することでのみ入手できます。' },
    { q: 'カードバトルとじゃんけんの違いは？', a: 'カードバトルはカードの戦略、じゃんけんは言語クイズ付きグッパーゲームです。' },
    { q: 'ダイヤモンドの入手方法は？', a: 'デイリークエストを完了し、バトルに勝利してダイヤモンドを獲得しましょう。' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <SectionHeader title="Bantuan" onBack={onBack} />
      <main className="max-w-md mx-auto px-4 py-6 space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl p-4"
            style={{ backgroundColor: colors.cardBg }}
          >
            <p className="text-sm font-bold mb-2" style={{ color: colors.lightText }}>Q: {faq.q}</p>
            <p className="text-sm" style={{ color: colors.darkText }}>A: {faq.a}</p>
          </motion.div>
        ))}
      </main>
    </div>
  );
}

function AboutSettings({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <SectionHeader title="Tentang" onBack={onBack} />
      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <div className="rounded-2xl p-6 flex flex-col items-center gap-3" style={{ backgroundColor: colors.cardBg }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl" style={{ backgroundColor: colors.brand }}>
            📚
          </div>
          <h2 className="text-xl font-bold" style={{ color: colors.lightText }}>KanjiMon</h2>
          <p className="text-sm" style={{ color: colors.darkText }}>Versi 1.0.0</p>
          <p className="text-center text-sm" style={{ color: colors.darkText }}>
            Belajar bahasa Jepang melalui Pokemon card battle dengan metode belajar aktif.
          </p>
          <div className="w-full pt-4 border-t" style={{ borderColor: colors.inputBg }}>
            <p className="text-center text-xs" style={{ color: colors.darkText }}>
              Dibuat dengan ❤️ menggunakan Next.js + React
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Main Page ---
type SubPage = 'notification' | 'language' | 'theme' | 'privacy' | 'help' | 'about' | null;

export default function SettingsPage() {
  const router = useRouter();
  const [subPage, setSubPage] = useState<SubPage>(null);
  const { getLanguageLabel, getThemeLabel } = useSettingsStore();

  const settingsItems = [
    { icon: '🔔', label: 'Notifikasi', description: 'Atur notifikasi push', action: 'notification' as SubPage },
    { icon: '🌐', label: 'Bahasa', description: getLanguageLabel(), action: 'language' as SubPage },
    { icon: '🎨', label: 'Tema', description: getThemeLabel(), action: 'theme' as SubPage },
    { icon: '🔐', label: 'Privasi', description: 'Kelola data pribadi', action: 'privacy' as SubPage },
    { icon: '❓', label: 'Bantuan', description: 'FAQ & support', action: 'help' as SubPage },
    { icon: 'ℹ️', label: 'Tentang', description: 'Versi 1.0.0', action: 'about' as SubPage },
  ];

  if (subPage === 'notification') return <NotificationSettings onBack={() => { setSubPage(null); }} />;
  if (subPage === 'language') return <LanguageSettings onBack={() => { setSubPage(null); }} />;
  if (subPage === 'theme') return <ThemeSettings onBack={() => { setSubPage(null); }} />;
  if (subPage === 'privacy') return <PrivacySettings onBack={() => { setSubPage(null); }} />;
  if (subPage === 'help') return <HelpSettings onBack={() => { setSubPage(null); }} />;
  if (subPage === 'about') return <AboutSettings onBack={() => { setSubPage(null); }} />;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: colors.cardBg }}>
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.inputBg }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c6bfff" strokeWidth="2">
            <path d="M10 12L6 8l4-4" />
          </svg>
        </button>
        <span className="text-base font-medium" style={{ color: colors.lightPurple }}>Pengaturan</span>
        <div className="w-10" />
      </div>

      <main className="max-w-md mx-auto px-4 py-6 space-y-3">
        {settingsItems.map((item, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full px-4 py-4 flex items-center justify-between rounded-2xl transition-colors active:scale-95"
            style={{ backgroundColor: colors.cardBg }}
            onClick={() => setSubPage(item.action)}
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
            // Clear auth store
            useAuthStore.getState().logout();
            // Clear localStorage for both stores to fully reset state
            localStorage.removeItem('kanjimon-auth');
            localStorage.removeItem('kanjimon-collection');
            localStorage.removeItem('kanjimon-settings');
            // Force hard redirect to /auth to reinitialize stores
            window.location.href = '/auth';
          }}
        >
          <span className="text-2xl">🚪</span>
          <span className="text-base font-bold" style={{ color: colors.coral }}>Keluar</span>
        </motion.button>
      </main>
    </div>
  );
}