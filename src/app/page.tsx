'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

const ELEMENT_ICONS: Record<string, string> = {
  FIRE: '🔥',
  WATER: '💧',
  GRASS: '🌿',
  ELECTRIC: '⚡',
  PSYCHIC: '🔮',
  NORMAL: '⭐',
};

const FEATURED_CARDS = [
  { japanese: '食べる', reading: 'たべる', meaning: 'to eat', element: 'FIRE', rarity: 'RARE' },
  { japanese: '水', reading: 'みず', meaning: 'water', element: 'WATER', rarity: 'COMMON' },
  { japanese: '走る', reading: 'はしる', meaning: 'to run', element: 'FIRE', rarity: 'UNCOMMON' },
  { japanese: '猫', reading: 'ねこ', meaning: 'cat', element: 'NORMAL', rarity: 'COMMON' },
  { japanese: '雷', reading: 'かみなり', meaning: 'thunder', element: 'ELECTRIC', rarity: 'RARE' },
];

const NAV_ITEMS = [
  { href: '/collection', label: 'Collection', icon: '🃏' },
  { href: '/battle', label: 'Battle', icon: '⚔️' },
  { href: '/deck', label: 'Deck Builder', icon: '📚' },
  { href: '/learn', label: 'Learn', icon: '📖' },
  { href: '/quests', label: 'Quests', icon: '✨' },
  { href: '/leaderboard', label: 'Ranking', icon: '🏆' },
];

export default function HomePage() {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0F0F1A]/80 border-b border-[#2D2D44]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="text-3xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] bg-clip-text text-transparent">
              KanjiMon
            </div>
            <span className="text-xs text-[#636E72]">JLPT N5</span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[#B2BEC3] hover:text-white transition-colors"
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">{user.username}</div>
                  <div className="text-xs text-[#636E72]">Lv.{user.level}</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] flex items-center justify-center text-lg">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.username[0].toUpperCase()
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/auth"
                className="px-4 py-2 bg-[#6C5CE7] hover:bg-[#5B4BD5] rounded-lg text-sm font-medium transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#6C5CE7]/10 to-transparent" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#6C5CE7]/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-[#00B894]/10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white via-[#F5F5F5] to-[#B2BEC3] bg-clip-text text-transparent">
                  Belajar Bahasa Jepang
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#6C5CE7] via-[#A29BFE] to-[#00B894] bg-clip-text text-transparent">
                  Sambil Bertarung!
                </span>
              </h1>

              <p className="text-lg md:text-xl text-[#B2BEC3] mb-8 max-w-2xl mx-auto">
                Kumpulkan kartu kosakata, bangun deck terbaik, dan kalahkan lawan dengan kekuatan bahasa Jepang!
                Tingkatkan pemahaman N5mu melalui battle card game yang adiktif.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={isAuthenticated ? '/battle' : '/auth'}
                  className="px-8 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl text-lg font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#6C5CE7]/30"
                >
                  {isAuthenticated ? '⚔️ Mulai Bertarung' : '🚀 Mulai Perjalanan'}
                </Link>
                <Link
                  href="/learn"
                  className="px-8 py-4 bg-[#1A1A2E] border border-[#2D2D44] rounded-xl text-lg font-medium hover:border-[#6C5CE7] transition-colors"
                >
                  📖 Pelajari N5
                </Link>
              </div>
            </motion.div>

            {/* Featured Cards Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-20"
            >
              <h2 className="text-center text-sm uppercase tracking-widest text-[#636E72] mb-8">
                Kartu Pilihan
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {FEATURED_CARDS.map((card, index) => (
                  <motion.div
                    key={card.japanese}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="relative w-32 h-44 rounded-xl bg-gradient-to-br from-[#1A1A2E] to-[#2D2D44] border-2 rarity-common card-glow overflow-hidden"
                    style={{
                      borderColor:
                        card.rarity === 'ULTRA_RARE' ? '#FDCB6E' :
                        card.rarity === 'RARE' ? '#0984E3' :
                        card.rarity === 'UNCOMMON' ? '#00B894' : '#B2BEC3',
                    }}
                  >
                    {/* Element Badge */}
                    <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center text-lg element-${card.element.toLowerCase()}`}>
                      {ELEMENT_ICONS[card.element]}
                    </div>

                    {/* Card Content */}
                    <div className="h-full flex flex-col items-center justify-center p-3 text-center">
                      <div className="text-3xl font-bold text-white mb-1">{card.japanese}</div>
                      <div className="text-sm text-[#636E72] mb-2">{card.reading}</div>
                      <div className="text-xs text-[#B2BEC3]">{card.meaning}</div>
                    </div>

                    {/* Rarity indicator */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 ${
                      card.rarity === 'ULTRA_RARE' ? 'bg-gradient-to-r from-[#FDCB6E] to-[#E17055]' :
                      card.rarity === 'RARE' ? 'bg-[#0984E3]' :
                      card.rarity === 'UNCOMMON' ? 'bg-[#00B894]' : 'bg-[#B2BEC3]'
                    }`} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-[#1A1A2E]/50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: 'Total Kartu', value: '800+', icon: '🃏' },
                { label: 'Kanji N5', value: '103', icon: '漢' },
                { label: 'Kosakata', value: '800+', icon: '📝' },
                { label: 'AI Opponent', value: '4', icon: '🤖' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="p-6 rounded-xl bg-[#1A1A2E] border border-[#2D2D44]"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-[#636E72]">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-12">Fitur Utama</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: 'Battle Card Game', desc: 'Bertarung menggunakan kartu kosakata melawan AI dengan berbagai strategi.', icon: '⚔️', color: '#E17055' },
                { title: 'Koleksi Kartu', desc: 'Kumpulkan 800+ kartu N5 dengan berbagai elemen dan rarity.', icon: '🃏', color: '#0984E3' },
                { title: 'Deck Builder', desc: 'Susun deck terbaikmu dengan minimal 20 kartu.', icon: '📚', color: '#00B894' },
                { title: 'Modul Belajar', desc: 'Hiragana, Katakana, Kanji, Kosakata, dan Tata Bahasa N5.', icon: '📖', color: '#6C5CE7' },
                { title: 'Daily Quest', desc: 'Tugas harian dengan reward XP dan kartu untuk menjaga engagement.', icon: '✨', color: '#FDCB6E' },
                { title: 'Leaderboard', desc: 'Bersaing dengan pemain lain secara global dan mingguan.', icon: '🏆', color: '#A29BFE' },
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="p-6 rounded-xl bg-[#1A1A2E] border border-[#2D2D44] hover:border-opacity-100 transition-all group"
                  style={{ borderColor: `${feature.color}40` }}
                >
                  <div className="text-4xl mb-4" style={{ filter: `drop-shadow(0 0 8px ${feature.color}60)` }}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-[#636E72]">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-[#2D2D44]">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-[#636E72]">
          <p>KanjiMon — Platform Pembelajaran Interaktif Bahasa Jepang JLPT N5</p>
          <p className="mt-2">Build with Next.js + Supabase + ❤️</p>
        </div>
      </footer>
    </div>
  );
}
