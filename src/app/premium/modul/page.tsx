'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Crown, ArrowLeft, Check, X, ChevronRight, BookOpen, Mic, FileText, Users, Briefcase } from 'lucide-react';
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

function TopAppBar({ title = 'Premium Modul', showBack = false, onBack }: { title?: string; showBack?: boolean; onBack?: () => void }) {
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
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: colors.gold }}>
            👑
          </div>
        )}
        <span className="text-base font-medium text-[#c6bfff]">{title}</span>
      </div>
      <button onClick={() => router.push('/premium')} className="text-sm px-3 py-1.5 rounded-lg flex items-center gap-1" style={{ backgroundColor: colors.inputBg, color: colors.darkText }}>
        ← Premium
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
        <button key={i} onClick={() => router.push(item.route)} className="flex flex-col items-center gap-1 transition-opacity" style={{ opacity: 0.6 }}>
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs" style={{ color: colors.darkText }}>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── TG2 Modules ──────────────────────────────────────────────

type Lesson = { id: string; title: string; desc: string; icon: string; premium: boolean; };

interface Modul {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  badge: string;
  lessons: Lesson[];
}

const MODULES: Modul[] = [
  {
    id: 'karier-bisnis',
    title: 'キャリア・ビスネス製造業',
    subtitle: 'Karier Bisnis Manufacturing',
    icon: '💼',
    color: colors.brand,
    badge: 'Karier',
    lessons: [
      { id: 'k1', title: 'Factory Greeting & Etiquette', desc: 'Salam, perkenalan, etiket di lantai produksi', icon: '🏭', premium: false },
      { id: 'k2', title: 'Surat Permintaan & Penawaran', desc: 'Format surat perdagangan, quotation, purchase order', icon: '📄', premium: false },
      { id: 'k3', title: '電話 производства (Produksi)', desc: 'Ungkapan telephone manufacturing, confer dengan supplier', icon: '📞', premium: false },
      { id: 'k4', title: 'Quality Control Discussion', desc: 'Pembahasan QC, defect, 検品, standar kualitas', icon: '✅', premium: false },
      { id: 'k5', title: 'Supply Chain & Supplier', desc: 'Ungkapan procurement, Lead Time, поставка', icon: '🚚', premium: false },
      { id: 'k6', title: 'Maintenance & Breakdown', desc: '報告・保全・故障・修理 dalam konteks pabrik', icon: '🔧', premium: false },
      { id: 'k7', title: 'Safety & Compliance', desc: 'keselamatan kerja, 5S, ISO standard, audit工場', icon: '🦺', premium: false },
      { id: 'k8', title: 'CBT Simulasi Karier Bisnis', desc: 'Simulasi ujian CBT karier bisnis manufaktur', icon: '💻', premium: false },
    ],
  },
  {
    id: 'ssw',
    title: 'SSW(ii) Exam',
    subtitle: 'Industrial Product Manufacturing',
    icon: '📋',
    color: colors.teal,
    badge: 'SSW(ii)',
    lessons: [
      { id: 's1', title: 'Vocabulary Manufaktur N5', desc: 'Tes kosakata 製造業 (manufacturing) level N5', icon: '🏭', premium: false },
      { id: 's2', title: 'Reading: 品質仕様書', desc: 'Membaca dokumen quality specification sheets', icon: '📖', premium: false },
      { id: 's3', title: 'Listening: 作業指示', desc: 'Memahami instructions工場 (factory instructions)', icon: '🎧', premium: false },
      { id: 's4', title: 'Keigo Manufaktur', desc: '敬語 dalam konteks lingkungan produksi & QC', icon: '🙇', premium: false },
      { id: 's5', title: 'JLPT N5 Manufaktur', desc: 'Simulasi JLPT N5 dengan tema manufaktur', icon: '📝', premium: false },
      { id: 's6', title: 'Kanji Produksi N5', desc: 'Kanji khusus industri: 製造・品質・検査・設備', icon: '漢', premium: false },
      { id: 's7', title: 'Kanji Produksi N4', desc: 'Kanji lanjutan manufaktur: 計画・工程・改善・安全管理', icon: '漢', premium: false },
      { id: 's8', title: 'CBT Simulasi SSW(ii)', desc: 'Simulasi ujian SSW(ii) Industrial Product', icon: '💻', premium: false },
    ],
  },
];

// ── Premium Lock Banner ───────────────────────────────────────

function PremiumBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl mb-4"
      style={{ background: `linear-gradient(135deg, ${colors.gold}25 0%, ${colors.brand}20 100%)`, border: `1px solid ${colors.gold}40` }}
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">👑</span>
        <div className="flex-1">
          <h3 className="text-base font-black text-[#d8e4ea]">Premium Module</h3>
          <p className="text-sm text-[#c8c4d7]">Buka semua materi manufaktur dengan langganan premium</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button className="flex-1 py-2.5 rounded-xl font-bold text-white" style={{ backgroundColor: colors.gold }}>
          Berlangganan
        </button>
        <button className="px-4 py-2.5 rounded-xl font-bold" style={{ backgroundColor: colors.inputBg, color: colors.darkText }}>
          Demo Gratis
        </button>
      </div>
    </motion.div>
  );
}

// ── Lesson Card ──────────────────────────────────────────────

function LessonCard({ lesson, index, locked, onClick }: { lesson: Lesson; index: number; locked: boolean; onClick?: () => void }) {
  const handleClick = () => {
    if (locked) return;
    onClick?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={handleClick}
      className={`p-4 rounded-xl flex items-center gap-3 transition-all ${locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-90'}`}
      style={{ backgroundColor: colors.cardBg }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ backgroundColor: lesson.premium ? `${colors.gold}20` : `${colors.brand}20` }}
      >
        {lesson.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="text-sm font-bold text-[#d8e4ea]">{lesson.title}</h3>
          {lesson.premium && (
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${colors.gold}30`, color: colors.gold }}>👑</span>
          )}
        </div>
        <p className="text-xs text-[#c8c4d7]">{lesson.desc}</p>
      </div>
      <div className="shrink-0">
        {locked ? (
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.inputBg }}>
            <span className="text-sm">🔒</span>
          </div>
        ) : lesson.premium ? (
          <button className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ backgroundColor: `${colors.gold}30`, color: colors.gold }}>
            👑
          </button>
        ) : (
          <button className="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: colors.brand }}>
            Mulai
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Module Detail View ───────────────────────────────────────

function ModuleDetail({ modul, onBack, isPremium }: { modul: Modul; onBack: () => void; isPremium: boolean }) {
  const router = useRouter();

  const handleLessonClick = (lessonId: string) => {
    // Map lesson IDs to simulation types
    if (modul.id === 'karier-bisnis' && lessonId === 'k8') {
      router.push('/simulasi?type=karier');
    } else if (modul.id === 'ssw' && lessonId === 's8') {
      router.push('/simulasi?type=ssw');
    }
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar title={modul.title} showBack onBack={onBack} />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Module Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl text-center"
          style={{ backgroundColor: colors.cardBg }}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-2" style={{ backgroundColor: `${modul.color}20` }}>
            {modul.icon}
          </div>
          <h2 className="text-xl font-black text-[#d8e4ea]">{modul.title}</h2>
          <p className="text-sm text-[#c8c4d7]">{modul.subtitle}</p>
          <div className="mt-2">
            <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: `${modul.color}20`, color: modul.color }}>
              {modul.badge}
            </span>
          </div>
          <div className="mt-3 flex gap-2 justify-center">
            <button className="px-4 py-2 rounded-xl font-bold text-white" style={{ backgroundColor: modul.color }}>
              📝 Mulai Modul
            </button>
            {!isPremium && (
              <button className="px-4 py-2 rounded-xl font-bold" style={{ backgroundColor: `${colors.gold}30`, color: colors.gold }}>
                👑 Premium
              </button>
            )}
          </div>
        </motion.div>

        {!isPremium && <PremiumBanner />}

        {/* Lessons */}
        <div className="space-y-2">
          {modul.lessons.map((lesson, i) => (
            <LessonCard key={lesson.id} lesson={lesson} index={i} locked={false} onClick={() => handleLessonClick(lesson.id)} />
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function PremiumModulPage() {
  const router = useRouter();
  const [selectedModul, setSelectedModul] = useState<Modul | null>(null);
  const isPremium = useCollectionStore(s => s.isPremium);

  if (!isPremium) {
    return (
      <div className="min-h-screen pb-24 flex flex-col items-center justify-center px-4" style={{ backgroundColor: colors.background }}>
        <div className="text-center p-8 rounded-2xl max-w-sm" style={{ backgroundColor: colors.cardBg }}>
          <span className="text-5xl mb-4 block">👑</span>
          <h2 className="text-xl font-black text-[#d8e4ea] mb-2">Premium Diperlukan</h2>
<p className="text-sm text-[#c8c4d7]">Unlock Modul Premium dengan 5000 💎 untuk akses キャリア・ビスネス製造業 & SSW(ii) Exam</p>
          <button
            onClick={() => router.push('/learn')}
            className="px-6 py-3 rounded-xl font-bold text-white w-full"
            style={{ backgroundColor: colors.brand }}
          >
            Kembali ke Belajar
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (selectedModul) {
    return <ModuleDetail modul={selectedModul} onBack={() => setSelectedModul(null)} isPremium={isPremium} />;
  }

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-2xl text-center"
          style={{ background: `linear-gradient(135deg, ${colors.gold}20 0%, ${colors.brand}15 100%)` }}
        >
          <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-3" style={{ backgroundColor: `${colors.gold}20` }}>
            📚
          </div>
          <h1 className="text-xl font-black text-[#d8e4ea]">Premium Modul</h1>
<p className="text-sm text-[#c8c4d7]">Materi TG2 — キャリア・ビスネス製造業 & SSW(ii) Exam</p>
          {!isPremium && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: `${colors.gold}20` }}>
              <span className="text-sm">👑</span>
              <span className="text-xs font-bold" style={{ color: colors.gold }}>Premium Required — Buka semua materi</span>
            </div>
          )}
        </motion.div>

        {/* Module List */}
        {MODULES.map((modul, i) => (
          <motion.div
            key={modul.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{modul.icon}</span>
                <div>
                  <h2 className="text-sm font-bold text-[#c8c4d7] tracking-wider">{modul.title}</h2>
                  <p className="text-xs text-[#c8c4d7]/60">{modul.subtitle}</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${modul.color}20`, color: modul.color }}>
                {modul.badge}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              {modul.lessons.map((lesson, j) => (
                <LessonCard key={lesson.id} lesson={lesson} index={j} locked={!isPremium && lesson.premium} onClick={() => {
                  if (lesson.id === 'k8' || lesson.id === 's8') {
                    router.push('/simulasi?type=' + (lesson.id === 'k8' ? 'karier' : 'ssw'));
                  }
                }} />
              ))}
            </div>

            <button
              onClick={() => setSelectedModul(modul)}
              className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: modul.color }}
            >
              <span>Lihat Modul</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ))}

        {/* Stats */}
        <div className="p-4 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
          <h3 className="text-sm font-bold text-[#c8c4d7] mb-3">📊 Progress</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl" style={{ backgroundColor: colors.inputBg }}>
              <p className="text-xl font-black text-[#d8e4ea]">0</p>
              <p className="text-xs text-[#c8c4d7]">Lessons</p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: colors.inputBg }}>
              <p className="text-xl font-black text-[#d8e4ea]">0%</p>
              <p className="text-xs text-[#c8c4d7]">Progress</p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: colors.inputBg }}>
              <p className="text-xl font-black text-[#d8e4ea]">16</p>
              <p className="text-xs text-[#c8c4d7]">Total</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}