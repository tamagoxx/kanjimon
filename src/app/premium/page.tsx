'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Crown, Gem, Zap, Star, Shield, Sparkles, ArrowLeft, Check, X } from 'lucide-react';

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

function TopAppBar({ title = 'Premium', showBack = false, onBack }: { title?: string; showBack?: boolean; onBack?: () => void }) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: colors.navBg }}>
      <div className="flex items-center gap-3">
        {showBack ? (
          <button onClick={onBack} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.inputBg }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c8c4d7" strokeWidth="2">
              <path d="M10 4L6 8l4 4" />
            </svg>
          </button>
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: colors.brand }}>
            P
          </div>
        )}
        <span className="text-base font-medium text-[#c6bfff]">{title}</span>
      </div>
      <button onClick={() => router.push('/')} className="text-sm px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.inputBg, color: colors.darkText }}>
        ← Home
      </button>
    </div>
  );
}

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
          className="flex flex-col items-center gap-1 transition-opacity"
          style={{ opacity: 0.6 }}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs" style={{ color: colors.darkText }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

const PREMIUM_FEATURES = [
  { icon: '👑', title: 'Battle Premium', desc: 'Unlimited battle tanpa cooldown, auto-revive once per battle', highlight: true },
  { icon: '⚡', title: 'Speed Boost', desc: 'Animasi 2x lebih cepat, skip intro animations', highlight: false },
  { icon: '💎', title: 'Stardust x2', desc: 'Dapatkan 2x stardust dari setiap battle', highlight: false },
  { icon: '🎁', title: 'Daily Gift', desc: 'Gratis 1 random Japanese card setiap hari', highlight: false },
  { icon: '📚', title: 'Modul Lengkap', desc: 'Akses semua modul N4 & N3 saat sudah release', highlight: false },
  { icon: '💰', title: 'No Ads', desc: 'Tanpa iklan sama sekali', highlight: false },
  { icon: '🏆', title: 'Priority Support', desc: 'Prioritas客服 & feature request', highlight: false },
  { icon: '🌟', title: 'Premium Badge', desc: 'Badge eksklusif di leaderboard profile', highlight: false },
];

const PLANS = [
  {
    id: 'monthly',
    name: 'Premium',
    duration: '1 Bulan',
    price: 'Rp 19.900',
    priceNum: 19900,
    emoji: '👑',
    color: colors.gold,
    features: [
      '✅ Unlimited battle',
      '✅ Speed boost 2x',
      '✅ Stardust x2',
      '✅ Daily gift card',
      '✅ No ads',
      '✅ Premium badge',
      '❌ Priority support',
    ],
    notIncluded: ['Priority support'],
    cta: 'Berlangganan',
    highlighted: false,
  },
  {
    id: 'yearly',
    name: 'Premium Yearly',
    duration: '12 Bulan',
    price: 'Rp 149.900',
    priceNum: 149900,
    emoji: '👑👑',
    color: colors.brand,
    features: [
      '✅ Unlimited battle',
      '✅ Speed boost 2x',
      '✅ Stardust x2',
      '✅ Daily gift card',
      '✅ No ads',
      '✅ Premium badge',
      '✅ Priority support',
      '💰 Hemat 38%',
    ],
    notIncluded: [],
    cta: 'Berlangganan',
    highlighted: true,
  },
];

export default function PremiumPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-6 rounded-2xl"
          style={{ background: `linear-gradient(135deg, ${colors.brand}30 0%, ${colors.gold}20 100%)` }}
        >
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-3" style={{ backgroundColor: `${colors.gold}20` }}>
            👑
          </div>
          <h1 className="text-2xl font-black text-[#d8e4ea] mb-1">KanjiMon Premium</h1>
          <p className="text-sm text-[#c8c4d7]">Unlock all premium features & accelerate your Japanese learning journey!</p>
        </motion.div>

        {/* Features */}
        <section>
          <h2 className="text-sm font-bold text-[#c8c4d7] mb-3 tracking-wider">PREMIUM FEATURES</h2>
          <div className="grid grid-cols-2 gap-3">
            {PREMIUM_FEATURES.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl"
                style={{ backgroundColor: feature.highlight ? `${colors.gold}15` : colors.cardBg }}
              >
                <span className="text-2xl mb-2 block">{feature.icon}</span>
                <h3 className="text-sm font-bold text-[#d8e4ea] mb-1">{feature.title}</h3>
                <p className="text-xs text-[#c8c4d7]">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Plans */}
        <section>
          <h2 className="text-sm font-bold text-[#c8c4d7] mb-3 tracking-wider">PILIH PAKET</h2>
          <div className="space-y-3">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-2xl"
                style={{
                  backgroundColor: plan.highlighted ? `${colors.brand}20` : colors.cardBg,
                  border: plan.highlighted ? `2px solid ${colors.brand}` : `1px solid ${colors.inputBg}`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{plan.emoji}</span>
                      <h3 className="text-lg font-black text-[#d8e4ea]">{plan.name}</h3>
                    </div>
                    <p className="text-sm text-[#c8c4d7]">{plan.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black" style={{ color: plan.color }}>{plan.price}</p>
                    {plan.id === 'yearly' && (
                      <p className="text-xs text-[#4bddb7]">~Rp 12.5k/bulan</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span className="text-sm">{feature.startsWith('✅') ? '✅' : feature.startsWith('❌') ? '❌' : '💰'}</span>
                      <span className={`text-sm ${feature.startsWith('❌') ? 'text-[#c8c4d7]/40' : 'text-[#c8c4d7]'}`}>{feature.replace(/^[✅❌💰]\s/, '')}</span>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full py-3 rounded-xl font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    backgroundColor: plan.highlighted ? colors.brand : colors.darkGray,
                    color: plan.highlighted ? 'white' : colors.darkText,
                  }}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ teaser */}
        <section>
          <h2 className="text-sm font-bold text-[#c8c4d7] mb-3 tracking-wider">FAQ</h2>
          <div className="space-y-2">
            {[
              { q: 'Berlangganan di mana?', a: 'Buka menu Toko > Premium Plan' },
              { q: 'Cancel kapan saja?', a: 'Ya, bisa cancel kapan saja tanpa biaya tambahan' },
              { q: 'Ada garansi?', a: '7 hari money-back guarantee jika tidak puas' },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: colors.cardBg }}>
                <h3 className="text-sm font-bold text-[#d8e4ea] mb-1">❓ {item.q}</h3>
                <p className="text-xs text-[#c8c4d7]">💡 {item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}