'use client';

import { useState } from 'react';
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

type Question = {
  question: string;
  options: string[];
  correct: number;
  hint: string;
};

const questions: Question[] = [
  { question: 'Apa romaji dari "あ"?', options: ['a', 'i', 'u', 'e'], correct: 0, hint: 'Huruf pertama di hiragana' },
  { question: 'Apa romaji dari "い"?', options: ['a', 'i', 'u', 'e'], correct: 1, hint: 'Huruf kedua di hiragana' },
  { question: 'Apa romaji dari "う"?', options: ['a', 'i', 'u', 'e'], correct: 2, hint: 'Huruf ketiga di hiragana' },
  { question: 'Apa romaji dari "え"?', options: ['a', 'i', 'u', 'e'], correct: 3, hint: 'Huruf keempat di hiragana' },
  { question: 'Apa romaji dari "お"?', options: ['a', 'i', 'u', 'o'], correct: 3, hint: 'Huruf kelima di hiragana' },
];

const studyCards = [
  { char: 'あ', romaji: 'a', indonesian: 'a (vokal)', element: 'NORMAL', type: 'Hiragana' },
  { char: 'い', romaji: 'i', indonesian: 'i (vokal)', element: 'NORMAL', type: 'Hiragana' },
  { char: 'う', romaji: 'u', indonesian: 'u (vokal)', element: 'NORMAL', type: 'Hiragana' },
  { char: 'え', romaji: 'e', indonesian: 'e (vokal)', element: 'NORMAL', type: 'Hiragana' },
  { char: 'お', romaji: 'o', indonesian: 'o (vokal)', element: 'NORMAL', type: 'Hiragana' },
];

// TopAppBar
function TopAppBar() {
  const router = useRouter();
  
  return (
    <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: colors.navBg }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: colors.brand }}>
          T
        </div>
        <span className="text-base font-medium text-[#c6bfff]">Belajar</span>
      </div>
      <button onClick={() => router.push('/')} className="text-sm px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.inputBg, color: colors.darkText }}>
        ← Home
      </button>
    </div>
  );
}

// BottomNav
function BottomNav() {
  const router = useRouter();
  
  const navItems = [
    { icon: '🏠', label: 'Home', route: '/' },
    { icon: '📚', label: 'Belajar', route: '/learn', active: true },
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

// Module Card
function ModuleCard({ 
  title, subtitle, icon, status, progress, badge, badgeColor, onClick, index 
}: { 
  title: string; subtitle: string; icon: string; status: 'completed' | 'learning' | 'locked';
  progress: number; badge?: string; badgeColor?: string; onClick?: () => void; index: number;
}) {
  const isClickable = status !== 'locked';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={isClickable ? onClick : undefined}
      className={`p-4 rounded-2xl flex items-center gap-4 transition-all ${
        isClickable ? 'cursor-pointer hover:opacity-90 active:scale-[0.98]' : 'opacity-50 cursor-not-allowed'
      }`}
      style={{ 
        backgroundColor: colors.cardBg,
      }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{
          backgroundColor: status === 'completed' ? `${colors.teal}20` : 
                           status === 'learning' ? `${colors.brand}20` : colors.inputBg,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-lg font-bold text-[#d8e4ea]">{title}</span>
          {status === 'completed' && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.teal}30`, color: colors.teal }}>
              ✓ Selesai
            </span>
          )}
          {status === 'learning' && badge && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${badgeColor || colors.brand}30`, color: badgeColor || colors.brand }}>
              {badge}
            </span>
          )}
          {status === 'locked' && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.darkGray}30`, color: colors.darkText }}>
              🔒 Terkunci
            </span>
          )}
        </div>
        <p className="text-sm text-[#c8c4d7] mb-2">{subtitle}</p>
        <div className="h-2 rounded-full bg-[#212c30] overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              backgroundColor: status === 'completed' ? colors.teal : 
                              status === 'learning' ? colors.brand : colors.darkGray,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Quiz Modal
function QuizModal({ 
  isOpen, onClose, currentQuestion, selectedAnswer, onAnswer, onNext, score, total, isComplete, onContinue 
}: {
  isOpen: boolean;
  onClose: () => void;
  currentQuestion: number;
  selectedAnswer: number | null;
  onAnswer: (index: number) => void;
  onNext: () => void;
  score: number;
  total: number;
  isComplete: boolean;
  onContinue: () => void;
}) {
  if (!isOpen) return null;
  
  const q = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / total) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ backgroundColor: colors.cardBg }}
      >
        {/* Timer Bar */}
        <div className="px-4 pt-4">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.darkGray }}>
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${100 - progress}%` }}
              className="h-full rounded-full"
              style={{ backgroundColor: colors.coral }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: colors.brand, color: 'white' }}>
            LATIHAN
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#c8c4d7]">{currentQuestion + 1}/{total}</span>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.inputBg }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#c8c4d7" strokeWidth="2">
                <path d="M2 2l8 8M10 2l-8 8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Question */}
        <div className="px-4 pb-4 space-y-4">
          <div className="p-4 rounded-xl" style={{ backgroundColor: colors.inputBg }}>
            <p className="text-lg font-bold text-[#d8e4ea] mb-2">{q.question}</p>
            <p className="text-xs text-[#c8c4d7]">💡 {q.hint}</p>
          </div>

          {/* Study Card Preview */}
          <div className="flex justify-center">
            <div className="w-36 rounded-2xl overflow-hidden" style={{ backgroundColor: colors.cardBg }}>
              <div className="h-24 flex items-center justify-center" style={{ backgroundColor: `${colors.brand}20` }}>
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">{studyCards[currentQuestion].char}</div>
                  <div className="text-xs text-[#c8c4d7]">{studyCards[currentQuestion].romaji}</div>
                </div>
              </div>
              <div className="p-2 text-center">
                <span className="text-xs text-[#d8e4ea]">{studyCards[currentQuestion].indonesian}</span>
              </div>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-2">
            {q.options.map((option, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrect = i === q.correct;
              const showResult = selectedAnswer !== null;
              
              let bgColor = colors.inputBg;
              let borderColor = 'transparent';
              let textColor = colors.lightText;
              
              if (showResult) {
                if (isCorrect) {
                  bgColor = `${colors.teal}20`;
                  borderColor = colors.teal;
                  textColor = colors.teal;
                } else if (isSelected && !isCorrect) {
                  bgColor = `${colors.coral}20`;
                  borderColor = colors.coral;
                  textColor = colors.coral;
                }
              }
              
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => showResult ? null : onAnswer(i)}
                  disabled={showResult}
                  className="w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all"
                  style={{
                    backgroundColor: bgColor,
                    borderWidth: '2px',
                    borderColor: borderColor,
                    opacity: showResult && !isSelected && !isCorrect ? 0.5 : 1,
                  }}
                >
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: showResult ? (isCorrect ? colors.teal : isSelected ? colors.coral : colors.darkGray) : colors.cardBg,
                      color: showResult ? 'white' : colors.darkText,
                    }}
                  >
                    {['A', 'B', 'C', 'D'][i]}
                  </span>
                  <span className="flex-1" style={{ color: textColor }}>{option}</span>
                  {showResult && isCorrect && <span className="text-lg">✓</span>}
                  {showResult && isSelected && !isCorrect && <span className="text-lg">✗</span>}
                </motion.button>
              );
            })}
          </div>

          {/* Next Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            disabled={selectedAnswer === null}
            className="w-full py-4 rounded-xl font-bold text-white text-base transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: selectedAnswer === null ? colors.darkGray : colors.brand,
              opacity: selectedAnswer === null ? 0.5 : 1,
            }}
          >
            {selectedAnswer === null ? (
              'Pilih Jawaban'
            ) : currentQuestion < total - 1 ? (
              <>Soal Berikutnya <span>→</span></>
            ) : (
              'Lihat Hasil'
            )}
          </motion.button>
        </div>

        {/* Quiz Complete */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
            >
              <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
                <div className="text-5xl mb-3">{score >= 4 ? '🏆' : '📚'}</div>
                <h2 className="text-2xl font-bold text-[#d8e4ea] mb-2">
                  {score >= 4 ? 'Luar Biasa!' : 'Tetap Semangat!'}
                </h2>
                <p className="text-4xl font-bold mb-2" style={{ color: score >= 4 ? colors.teal : colors.brand }}>
                  {score}/{total}
                </p>
                <p className="text-sm text-[#c8c4d7] mb-6">
                  {score >= 4 ? 'Kamu sudah menguasai materi ini!' : 'Coba lagi untuk meningkatkan.'}
                </p>
                <button
                  onClick={onContinue}
                  className="px-8 py-3 rounded-xl font-bold text-white"
                  style={{ backgroundColor: colors.brand }}
                >
                  Lanjutkan
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function LearnPage() {
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const router = useRouter();

  const modules = [
    { id: 'hiragana', title: 'Hiragana', subtitle: 'Aksara dasar Jepang', icon: 'あ', status: 'completed' as const, progress: 100 },
    { id: 'katakana', title: 'Katakana', subtitle: 'Aksara dasar Jepang', icon: 'ア', status: 'learning' as const, progress: 65, badge: 'Sedang Belajar', badgeColor: colors.brand },
    { id: 'kanji', title: 'Kanji N5', subtitle: '103 Kanji JLPT N5', icon: '漢', status: 'locked' as const, progress: 0 },
    { id: 'vocabulary', title: 'Kosakata', subtitle: '241 kata dasar N5', icon: '📝', status: 'locked' as const, progress: 0 },
    { id: 'grammar', title: 'Tata Bahasa', subtitle: '20 pola kalimat N5', icon: '📖', status: 'locked' as const, progress: 0 },
  ];

  const handleStartQuiz = () => {
    setIsQuizOpen(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsComplete(false);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === questions[currentQuestion].correct) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
    } else {
      setIsComplete(true);
    }
  };

  const handleContinue = () => {
    setIsQuizOpen(false);
    setIsComplete(false);
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar />

      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">
        {/* Header with Progress */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl"
          style={{ backgroundColor: colors.cardBg }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#d8e4ea] mb-1">
                Halo, Tamago! 👋
              </h1>
              <p className="text-sm text-[#c8c4d7]">
                Lanjutkan perjalanan belajarmu
              </p>
            </div>
            <div className="relative">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#051013' }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#212c30" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke="#4bddb7" strokeWidth="6"
                    strokeDasharray="213 214"
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-[#4bddb7]">Lv</span>
                  <span className="text-lg font-bold text-white">7</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Review Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={handleStartQuiz}
          className="p-4 rounded-2xl cursor-pointer"
          style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.inputBg}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#c8c4d7]">Review Terakhir</span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${colors.teal}20`, color: colors.teal }}>Lihat Detail</span>
          </div>
          <p className="text-lg font-bold text-[#d8e4ea]">Hiragana - Dasar (46 karakter)</p>
          <p className="text-sm text-[#c8c4d7] mt-1">✓ Selesai • Skor: 8/10</p>
        </motion.div>

        {/* Modules */}
        <section>
          <h2 className="text-sm font-bold text-[#c8c4d7] mb-3 tracking-wider">
            MODUL PEMBELAJARAN
          </h2>
          <div className="space-y-3">
            {modules.map((mod, i) => (
              <ModuleCard
                key={mod.id}
                title={mod.title}
                subtitle={mod.subtitle}
                icon={mod.icon}
                status={mod.status}
                progress={mod.progress}
                badge={mod.badge}
                badgeColor={mod.badgeColor}
                onClick={mod.status === 'learning' ? handleStartQuiz : undefined}
                index={i}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />

      {/* Quiz Modal */}
      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        currentQuestion={currentQuestion}
        selectedAnswer={selectedAnswer}
        onAnswer={handleAnswer}
        onNext={handleNext}
        score={score}
        total={questions.length}
        isComplete={isComplete}
        onContinue={handleContinue}
      />
    </div>
  );
}