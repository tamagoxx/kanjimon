'use client';

import { useState } from 'react';
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
  lightPurple: '#c6bfff',
  darkGray: '#2b363b',
};

type TabType = 'login' | 'register';

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { login, register } = useAuthStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate auth delay
    setTimeout(() => {
      if (activeTab === 'login') {
        login({ username: email.split('@')[0], email });
      } else {
        register({ username: username || email.split('@')[0], email });
      }
      setIsLoading(false);
      router.push('/');
    }, 1500);
  };

  const handleGuest = () => {
    // Create a guest user with random name
    const guestName = `Guest_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    login({ username: guestName, email: 'guest@kanjimon.app' });
    router.push('/');
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: colors.background }}>
      {/* Background Blur Elements */}
      <div className="absolute top-10 left-4 w-28 h-28 rounded-3xl opacity-20 blur-sm" style={{ backgroundColor: colors.lightPurple }} />
      <div className="absolute top-20 right-8 w-36 h-36 rounded-3xl opacity-20 blur-sm" style={{ backgroundColor: colors.teal }} />
      <div className="absolute bottom-32 left-12 w-24 h-28 rounded-3xl opacity-15 blur-sm" style={{ backgroundColor: colors.gold }} />

      {/* Bottom Ornament Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: colors.brand }} />

      <main className="relative z-10 max-w-md mx-auto px-4 pt-12">
        {/* Logo Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ backgroundColor: colors.brand }}
            >
              漢
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#d8e4ea] mb-1">KanjiMon</h1>
          <p className="text-sm text-[#c8c4d7]">Belajar bahasa Jepang dengan cara seru</p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex rounded-xl p-1 mb-6"
          style={{ backgroundColor: colors.inputBg }}
        >
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'login'
                ? 'text-white shadow-lg'
                : 'text-[#c8c4d7]'
            }`}
            style={activeTab === 'login' ? { backgroundColor: colors.brand } : {}}
          >
            Masuk
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'register'
                ? 'text-white shadow-lg'
                : 'text-[#c8c4d7]'
            }`}
            style={activeTab === 'register' ? { backgroundColor: colors.brand } : {}}
          >
            Daftar
          </button>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl"
          style={{ backgroundColor: colors.cardBg }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username (Register only) */}
            {activeTab === 'register' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#c8c4d7]">Nama</label>
                <div
                  className="flex items-center gap-3 px-4 rounded-xl h-12"
                  style={{ backgroundColor: colors.inputBg }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8c4d7" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Nama kamu"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-[#d8e4ea] placeholder-[#c8c4d7]/50"
                    required={activeTab === 'register'}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#c8c4d7]">Email</label>
              <div
                className="flex items-center gap-3 px-4 rounded-xl h-12"
                style={{ backgroundColor: colors.inputBg }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8c4d7" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  type="email"
                  placeholder="email@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[#d8e4ea] placeholder-[#c8c4d7]/50"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#c8c4d7]">Kata Sandi</label>
              <div
                className="flex items-center gap-3 px-4 rounded-xl h-12"
                style={{ backgroundColor: colors.inputBg }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8c4d7" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[#d8e4ea] placeholder-[#c8c4d7]/50"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl font-bold text-white text-base transition-opacity flex items-center justify-center gap-2"
              style={{ backgroundColor: colors.brand }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memuat...
                </>
              ) : activeTab === 'login' ? 'Masuk' : 'Daftar'}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px" style={{ backgroundColor: colors.inputBg }} />
              <span className="text-xs text-[#c8c4d7]">atau</span>
              <div className="flex-1 h-px" style={{ backgroundColor: colors.inputBg }} />
            </div>

            {/* Guest Login */}
            <button
              type="button"
              onClick={handleGuest}
              className="w-full py-4 rounded-xl font-bold text-[#d8e4ea] text-base flex items-center justify-center gap-2"
              style={{ backgroundColor: colors.inputBg }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.teal} strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Lanjutkan sebagai Tamu
            </button>
          </form>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-[#c8c4d7]">
            {activeTab === 'login' ? (
              <>
                Belum punya akun?{' '}
                <button onClick={() => setActiveTab('register')} className="text-[#6c5ce7] font-medium">
                  Daftar dulu
                </button>
              </>
            ) : (
              <>
                Sudah punya akun?{' '}
                <button onClick={() => setActiveTab('login')} className="text-[#6c5ce7] font-medium">
                  Masuk di sini
                </button>
              </>
            )}
          </p>
        </motion.div>
      </main>
    </div>
  );
}