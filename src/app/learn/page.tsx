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

// Quiz Card Component (Center Battle Card in Figma)
function QuizCard({ question, index }: { question: Question; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="w-40 flex flex-col items-center justify-center p-4 rounded-2xl"
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="text-4xl font-bold text-white mb-2">{question.question.split('"')[1]}</div>
      <div className="text-xs text-[#c8c4d7] text-center">{index + 1}/5</div>
    </motion.div>
  );
}

// Answer Option Button
function AnswerOption({ text, index, isCorrect, isSelected, onClick }: {
  text: string; index: number; isCorrect: boolean; isSelected: boolean; onClick?: () => void;
}) {
  const letters = ['A', 'B', 'C', 'D'];
  
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full p-4 rounded-xl text-left flex items-center gap-3 transition-all ${
        isSelected
          ? isCorrect
            ? 'bg-[#4bddb7]/20 border-2 border-[#4bddb7]'
            : 'bg-[#ff4b4b]/20 border-2 border-[#ff4b4b]'
          : 'bg-[#212c30] hover:bg-[#2b363b]'
      }`}
      disabled={isSelected}
    >
      <span className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm" style={{
        backgroundColor: isSelected ? (isCorrect ? colors.teal : colors.coral) : colors.cardBg,
        color: isSelected ? 'white' : colors.darkText
      }}>
        {letters[index]}
      </span>
      <span className="flex-1 text-[#d8e4ea]">{text}</span>
      {isSelected && (
        <span className="text-xl">{isCorrect ? '✓' : '✗'}</span>
      )}
    </motion.button>
  );
}

// Progress Timer Bar (Red in Figma)
function TimerBar({ progress }: { progress: number }) {
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.darkGray }}>
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
        className="h-full rounded-full"
        style={{ backgroundColor: colors.coral }}
      />
    </div>
  );
}

// Study Card (Preview Card shown in modal)
function StudyCard({ card }: { card: any }) {
  const elementColors: Record<string, string> = {
    FIRE: '#ffb4ab',
    WATER: '#6c5ce7',
    GRASS: '#4bddb7',
    ELECTRIC: '#f0bf63',
    PSYCHIC: '#c6bfff',
    NORMAL: '#c8c4d7',
  };
  
  const elementIcons: Record<string, string> = {
    FIRE: '🔥',
    WATER: '💧',
    GRASS: '🌱',
    ELECTRIC: '⚡',
    PSYCHIC: '🔮',
    NORMAL: '📝',
  };
  
  const col = elementColors[card.element] || colors.darkText;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-40 rounded-2xl overflow-hidden"
      style={{ backgroundColor: colors.cardBg }}
    >
      <div className="h-32 flex items-center justify-center" style={{ backgroundColor: `${col}20` }}>
        <div className="text-center">
          <div className="text-5xl font-bold text-white">{card.char}</div>
          <div className="text-sm text-[#c8c4d7]">{card.romaji}</div>
        </div>
      </div>
      <div className="p-3">
        <div className="text-sm text-[#d8e4ea] font-medium text-center mb-1">{card.indonesian}</div>
        <div className="flex items-center justify-center gap-2 text-xs">
          <span style={{ color: col }}>{elementIcons[card.element]}</span>
          <span className="text-[#c8c4d7]">{card.type}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Modal Header
function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ backgroundColor: colors.brand, color: 'white' }}>
        LATIHAN
      </div>
      <button
        onClick={onClose}
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ backgroundColor: colors.inputBg }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#c8c4d7" strokeWidth="2">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </div>
  );
}

// Bottom Action Button
function BottomActionButton({ label, onClick, disabled }: {
  label: string; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-xl font-bold text-white text-base transition-opacity flex items-center justify-center gap-2 ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      style={{ backgroundColor: disabled ? colors.darkGray : colors.brand }}
    >
      {label}
      {!disabled && (
        <svg width="16" height="20" viewBox="0 0 16 20" fill="none" stroke="white" strokeWidth="2">
          <path d="M6 4L11 10.5L6 17" />
        </svg>
      )}
    </button>
  );
}

// Quiz Complete Overlay
function QuizComplete({ score, total, onContinue }: { score: number; total: number; onContinue: () => void }) {
  const percentage = (score / total) * 100;
  const isPass = percentage >= 80;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center bg-black/80 z-50"
    >
      <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
        <div className="text-5xl mb-3">{isPass ? '🏆' : '📚'}</div>
        <h2 className="text-2xl font-bold text-[#d8e4ea] mb-2">
          {isPass ? 'Luar Biasa!' : 'Tetap Semangat!'}
        </h2>
        <p className="text-4xl font-bold mb-2" style={{ color: isPass ? colors.teal : colors.brand }}>
          {score}/{total}
        </p>
        <p className="text-sm text-[#c8c4d7] mb-6">
          {isPass ? 'Kamu sudah menguasai materi ini!' : 'Coba lagi untuk meningkatkan.'}
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
  );
}

export default function LearnPage() {
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const router = useRouter();

  // Sample study cards for preview
  const studyCards = [
    { char: 'あ', romaji: 'a', indonesian: 'a (vokal)', element: 'NORMAL', type: 'Hiragana' },
    { char: 'い', romaji: 'i', indonesian: 'i (vokal)', element: 'NORMAL', type: 'Hiragana' },
    { char: 'う', romaji: 'u', indonesian: 'u (vokal)', element: 'NORMAL', type: 'Hiragana' },
  ];

  const handleStartQuiz = () => {
    setIsQuizModalOpen(true);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setTimeLeft(100);
    setIsQuizComplete(false);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    if (index === questions[currentQuestion].correct) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setTimeLeft(100);
    } else {
      setIsQuizComplete(true);
    }
  };

  const handleCloseQuiz = () => {
    setIsQuizModalOpen(false);
  };

  const handleContinue = () => {
    setIsQuizModalOpen(false);
    router.push('/');
  };

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
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#051013' }}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#212c30" strokeWidth="6" />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke="#4bddb7" strokeWidth="6"
                    strokeDasharray="160 214"
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-[#4bddb7]">Lv</span>
                  <span className="text-lg font-bold text-[#d8e4ea]">7</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommended Review Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-4 rounded-2xl cursor-pointer"
          style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.inputBg}` }}
          onClick={handleStartQuiz}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#c8c4d7]">Review Terakhir</span>
            <span className="text-xs px-2 py-1 rounded-full bg-[#4bddb7]/20 text-[#4bddb7]">Lihat Detail</span>
          </div>
          <p className="text-lg font-bold text-[#d8e4ea]">Hiragana - Dasar (46 karakter)</p>
          <p className="text-sm text-[#c8c4d7] mt-1">Selesai • Skor: 8/10</p>
        </motion.div>

        {/* Module List */}
        <div>
          <h2 className="text-sm font-bold text-[#c8c4d7] mb-3 tracking-wider">
            MODUL PEMBELAJARAN
          </h2>
          <div className="space-y-3">
            {[
              { id: 'hiragana', title: 'Hiragana', subtitle: 'Aksara dasar Jepang', icon: 'あ', status: 'completed', progress: 100 },
              { id: 'katakana', title: 'Katakana', subtitle: 'Aksara dasar Jepang', icon: 'ア', status: 'learning', progress: 65, badge: 'Sedang Belajar', badgeColor: colors.brand },
              { id: 'kanji', title: 'Kanji N5', subtitle: '103 Kanji JLPT N5', icon: '漢', status: 'locked', progress: 0 },
              { id: 'vocabulary', title: 'Kosakata', subtitle: '241 kata dasar N5', icon: '📝', status: 'locked', progress: 0 },
              { id: 'grammar', title: 'Tata Bahasa', subtitle: '20 pola kalimat N5', icon: '📖', status: 'locked', progress: 0 },
            ].map((mod, i) => (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="p-4 rounded-2xl flex items-center gap-4"
                style={{ backgroundColor: colors.cardBg }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    backgroundColor: mod.status === 'completed' ? `${colors.teal}20` : mod.status === 'learning' ? `${colors.brand}20` : colors.inputBg,
                  }}
                >
                  {mod.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-[#d8e4ea]">{mod.title}</span>
                    {mod.badge && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${mod.badgeColor}30`, color: mod.badgeColor }}>
                        {mod.badge}
                      </span>
                    )}
                    {mod.status === 'completed' && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.teal}30`, color: colors.teal }}>
                        ✓ Selesai
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#c8c4d7] mb-2">{mod.subtitle}</p>
                  <div className="h-2 rounded-full bg-[#212c30] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${mod.progress}%`,
                        backgroundColor: mod.status === 'completed' ? colors.teal : mod.status === 'learning' ? colors.brand : colors.darkGray,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />

      {/* Quiz Modal Overlay */}
      <AnimatePresence>
        {isQuizModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
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
                <TimerBar progress={timeLeft} />
              </div>

              {/* Header */}
              <ModalHeader onClose={handleCloseQuiz} />

              {/* Content */}
              <div className="px-4 pb-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {/* Question */}
                <div className="p-4 rounded-xl" style={{ backgroundColor: colors.inputBg }}>
                  <p className="text-lg font-bold text-[#d8e4ea] mb-2">
                    {questions[currentQuestion].question}
                  </p>
                  <p className="text-xs text-[#c8c4d7]">
                    💡 {questions[currentQuestion].hint}
                  </p>
                </div>

                {/* Study Card Preview */}
                <div className="flex justify-center">
                  <StudyCard card={studyCards[currentQuestion % studyCards.length]} />
                </div>

                {/* Answer Options */}
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, i) => (
                    <AnswerOption
                      key={i}
                      text={option}
                      index={i}
                      isCorrect={i === questions[currentQuestion].correct}
                      isSelected={selectedAnswer !== null}
                      onClick={() => handleAnswer(i)}
                    />
                  ))}
                </div>
              </div>

              {/* Bottom Action */}
              <div className="px-4 pb-6">
                <BottomActionButton
                  label={selectedAnswer !== null ? (currentQuestion < questions.length - 1 ? 'Soal Berikutnya →' : 'Lihat Hasil') : 'Pilih Jawaban'}
                  onClick={selectedAnswer !== null ? handleNextQuestion : undefined}
                  disabled={selectedAnswer === null}
                />
              </div>

              {/* Quiz Complete Overlay */}
              <AnimatePresence>
                {isQuizComplete && (
                  <QuizComplete
                    score={score}
                    total={questions.length}
                    onContinue={handleContinue}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Top App Bar
function TopAppBar() {
  const router = useRouter();
  
  return (
    <div className="sticky top-0 z-40 px-4 h-16 flex items-center justify-between" style={{ backgroundColor: '#162125' }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: colors.brand }}>
          T
        </div>
        <span className="text-[#c6bfff] font-medium">Belajar</span>
      </div>
      <button onClick={() => router.push('/')} className="text-sm text-[#c8c4d7]">
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
    { icon: '📚', label: 'Belajar', route: '/learn', active: true },
    { icon: '⚔️', label: 'Battle', route: '/battle' },
    { icon: '🃏', label: 'Kartu', route: '/collection' },
    { icon: '👤', label: 'Profile', route: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-30" style={{ backgroundColor: colors.darkGray }}>
      {navItems.map((item, i) => (
        <button
          key={i}
          onClick={() => router.push(item.route)}
          className={`flex flex-col items-center gap-1 ${item.active ? 'opacity-100' : 'opacity-60'} transition-opacity`}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs" style={{ color: item.active ? colors.teal : colors.darkText }}>{item.label}</span>
          {item.active && <div className="w-1 h-1 rounded-full mt-0.5" style={{ backgroundColor: colors.teal }} />}
        </button>
      ))}
    </div>
  );
}