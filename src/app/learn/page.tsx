'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { HIRAGANA_BASIC, HIRAGANA_DAKUTEN, HIRAGANA_COMBINATIONS } from '@/data/learning/characters';
import { KATAKANA_BASIC } from '@/data/learning/characters';

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

// TopAppBar
function TopAppBar({ title = 'Belajar', showBack = false, onBack }: { title?: string; showBack?: boolean; onBack?: () => void }) {
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
            T
          </div>
        )}
        <span className="text-base font-medium text-[#c6bfff]">{title}</span>
      </div>
      {!showBack && (
        <button onClick={() => router.push('/')} className="text-sm px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.inputBg, color: colors.darkText }}>
          ← Home
        </button>
      )}
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

// Progress Ring
function ProgressRing({ level, progress }: { level: number; progress: number }) {
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#051013' }}>
        <svg width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#212c30" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="34" fill="none"
            stroke="#4bddb7" strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 40 40)"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-[#4bddb7]">Lv</span>
          <span className="text-lg font-bold text-white">{level}</span>
        </div>
      </div>
    </div>
  );
}

// Module Card
function ModuleCard({ 
  title, subtitle, icon, status, progress, learned, total, badge, badgeColor, onClick, index 
}: { 
  title: string; subtitle: string; icon: string; status: 'completed' | 'learning' | 'locked';
  progress: number; learned: number; total: number; badge?: string; badgeColor?: string; onClick?: () => void; index: number;
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
      style={{ backgroundColor: colors.cardBg }}
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
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-[#212c30] overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                backgroundColor: status === 'completed' ? colors.teal : 
                                status === 'learning' ? colors.brand : colors.darkGray,
              }}
            />
          </div>
          <span className="text-xs text-[#c8c4d7]">{learned}/{total}</span>
        </div>
      </div>
    </motion.div>
  );
}

// Character Grid (for Hiragana/Katakana learning)
function CharacterGrid({ characters, onCharClick }: { 
  characters: Array<{ char: string; romaji: string; example?: string; exampleMeaning?: string }>;
  onCharClick?: (char: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {characters.map((item, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.01 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCharClick?.(item.char)}
          className="aspect-square rounded-xl flex flex-col items-center justify-center transition-all hover:opacity-80"
          style={{ backgroundColor: colors.cardBg }}
        >
          <span className="text-2xl font-bold text-white">{item.char}</span>
          <span className="text-xs text-[#c8c4d7]">{item.romaji}</span>
        </motion.button>
      ))}
    </div>
  );
}

// Character Detail Modal
function CharDetailModal({ char, romaji, example, exampleMeaning, onClose }: {
  char: string; romaji: string; example?: string; exampleMeaning?: string; onClose: () => void;
}) {
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
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        className="w-64 rounded-2xl p-6 text-center"
        style={{ backgroundColor: colors.cardBg }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl font-bold mb-4" style={{ backgroundColor: `${colors.brand}20` }}>
          {char}
        </div>
        <h3 className="text-2xl font-bold text-[#d8e4ea] mb-2">{romaji}</h3>
        {example && (
          <p className="text-sm text-[#c8c4d7] mb-1">Contoh: {example}</p>
        )}
        {exampleMeaning && (
          <p className="text-sm text-[#4bddb7]">Arti: {exampleMeaning}</p>
        )}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 rounded-xl font-bold text-white"
          style={{ backgroundColor: colors.brand }}
        >
          Tutup
        </button>
      </motion.div>
    </motion.div>
  );
}

// Quiz for Hiragana
function QuizModal({ isOpen, onClose, moduleType }: {
  isOpen: boolean; onClose: () => void; moduleType: 'hiragana' | 'katakana';
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);

  // Generate questions from actual character data
  const allChars = moduleType === 'hiragana' 
    ? Object.entries(HIRAGANA_BASIC).map(([char, data]) => ({ char, romaji: data.romaji, example: data.example, exampleMeaning: data.exampleMeaning }))
    : Object.entries(KATAKANA_BASIC).map(([char, data]) => ({ char, romaji: data.romaji, example: data.example, exampleMeaning: data.exampleMeaning }));

  // Shuffle and pick 10 questions
  const questions = allChars
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)
    .map(char => {
      const correctAnswer = char.romaji;
      // Generate wrong answers from other romaji
      const wrongAnswers = allChars
        .filter(c => c.romaji !== correctAnswer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(c => c.romaji);
      
      const options = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
      
      return {
        char: char.char,
        question: `Apa romaji dari "${char.char}"?`,
        options,
        correct: options.indexOf(correctAnswer),
        example: char.example,
        exampleMeaning: char.exampleMeaning,
      };
    });

  if (!isOpen) return null;

  const q = questions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);
    if (index === q.correct) {
      setScore(s => s + 1);
    }
    setTimeout(() => setShowResult(true), 500);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRetry = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsComplete(false);
    setShowResult(false);
  };

  // Complete screen
  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      >
        <div className="text-center p-8 rounded-2xl" style={{ backgroundColor: colors.cardBg }}>
          <div className="text-5xl mb-3">{score >= 8 ? '🏆' : score >= 6 ? '👍' : '📚'}</div>
          <h2 className="text-2xl font-bold text-[#d8e4ea] mb-2">
            {score >= 8 ? 'Luar Biasa!' : score >= 6 ? 'Bagus!' : 'Tetap Semangat!'}
          </h2>
          <p className="text-4xl font-bold mb-2" style={{ color: score >= 6 ? colors.teal : colors.brand }}>
            {score}/{questions.length}
          </p>
          <p className="text-sm text-[#c8c4d7] mb-6">
            {score >= 8 ? 'Kamu sudah menguasai modul ini!' : 'Terus latihan untuk meningkatkan.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 rounded-xl font-bold text-white"
              style={{ backgroundColor: colors.inputBg }}
            >
              🔄 Ulangi
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-white"
              style={{ backgroundColor: colors.brand }}
            >
              ✓ Selesai
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

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
        {/* Progress */}
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#c8c4d7]">{currentQuestion + 1}/{questions.length}</span>
            <span className="text-sm font-bold" style={{ color: colors.teal }}>Skor: {score}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.darkGray }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%`, backgroundColor: colors.brand }}
            />
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: colors.brand, color: 'white' }}>
            KUIS {moduleType === 'hiragana' ? 'HIRAGANA' : 'KATAKANA'}
          </span>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.inputBg }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#c8c4d7" strokeWidth="2">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-6 space-y-4">
          {/* Character Display */}
          <div className="p-6 rounded-xl text-center" style={{ backgroundColor: colors.inputBg }}>
            <div className="text-6xl font-bold text-white mb-2">{q.char}</div>
            {q.example && (
              <p className="text-sm text-[#c8c4d7]">Contoh: {q.example} ({q.exampleMeaning})</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2">
            {q.options.map((option, i) => {
              const isSelected = selectedAnswer === i;
              const isCorrect = i === q.correct;
              
              let bgColor = colors.inputBg;
              let borderColor = 'transparent';
              let textColor = colors.lightText;
              
              if (showResult) {
                if (isCorrect) {
                  bgColor = `${colors.teal}20`;
                  borderColor = colors.teal;
                  textColor = colors.teal;
                } else if (isSelected) {
                  bgColor = `${colors.coral}20`;
                  borderColor = colors.coral;
                  textColor = colors.coral;
                }
              }
              
              return (
                <motion.button
                  key={i}
                  whileTap={!showResult ? { scale: 0.98 } : {}}
                  onClick={() => !showResult && handleAnswer(i)}
                  disabled={showResult}
                  className="w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all"
                  style={{
                    backgroundColor: bgColor,
                    borderWidth: '2px',
                    borderColor: borderColor,
                    opacity: showResult && !isSelected && !isCorrect ? 0.4 : 1,
                  }}
                >
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: showResult 
                        ? (isCorrect ? colors.teal : isSelected ? colors.coral : colors.darkGray)
                        : colors.cardBg,
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
          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="w-full py-4 rounded-xl font-bold text-white transition-all"
            style={{
              backgroundColor: selectedAnswer === null ? colors.darkGray : colors.brand,
              opacity: selectedAnswer === null ? 0.5 : 1,
            }}
          >
            {selectedAnswer === null 
              ? 'Pilih Jawaban' 
              : currentQuestion < questions.length - 1 
                ? 'Soal Berikutnya →' 
                : 'Lihat Hasil'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Module Detail View (Hiragana/Katakana)
function ModuleDetailView({ 
  moduleId, onBack 
}: { 
  moduleId: string; onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'basic' | 'dakuten' | 'combinations'>('basic');
  const [quizOpen, setQuizOpen] = useState(false);
  const [selectedChar, setSelectedChar] = useState<{char: string; romaji: string; example?: string; exampleMeaning?: string} | null>(null);

  const isHiragana = moduleId === 'hiragana';
  
  // Get data based on module type
  const basicData = isHiragana ? HIRAGANA_BASIC : KATAKANA_BASIC;
  const dakutenData = isHiragana ? HIRAGANA_DAKUTEN : null;
  const comboData = isHiragana ? HIRAGANA_COMBINATIONS : null;

  const basicChars = Object.entries(basicData).map(([char, data]) => ({
    char,
    romaji: data.romaji,
    example: data.example,
    exampleMeaning: data.exampleMeaning,
  }));

  const dakutenChars = dakutenData 
    ? Object.entries(dakutenData).map(([char, data]) => ({
        char,
        romaji: data.romaji,
        example: undefined as string | undefined,
        exampleMeaning: undefined as string | undefined,
      }))
    : [];

  const comboChars = comboData
    ? Object.entries(comboData).map(([char, data]) => ({
        char,
        romaji: data.romaji,
        example: undefined as string | undefined,
        exampleMeaning: undefined as string | undefined,
      }))
    : [];

  const tabs = [
    { id: 'basic' as const, label: 'Dasar', count: basicChars.length },
    ...(dakutenChars.length > 0 ? [{ id: 'dakuten' as const, label: 'Dakuten', count: dakutenChars.length }] : []),
    ...(comboChars.length > 0 ? [{ id: 'combinations' as const, label: 'Kombinasi', count: comboChars.length }] : []),
  ];

  const currentChars = activeTab === 'basic' ? basicChars 
    : activeTab === 'dakuten' ? dakutenChars 
    : comboChars;

  const moduleName = isHiragana ? 'Hiragana' : 'Katakana';
  const moduleIcon = isHiragana ? 'あ' : 'ア';

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: colors.background }}>
      <TopAppBar title={moduleName} showBack onBack={onBack} />
      
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Module Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl text-center"
          style={{ backgroundColor: colors.cardBg }}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-2" style={{ backgroundColor: `${colors.brand}20` }}>
            {moduleIcon}
          </div>
          <h2 className="text-xl font-bold text-[#d8e4ea]">{moduleName}</h2>
          <p className="text-sm text-[#c8c4d7]">
            {basicChars.length + dakutenChars.length + comboChars.length} karakter
          </p>
          <button
            onClick={() => setQuizOpen(true)}
            className="mt-3 px-6 py-2 rounded-xl font-bold text-white"
            style={{ backgroundColor: colors.brand }}
          >
            📝 Mulai Kuis
          </button>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? colors.brand : colors.cardBg,
                color: activeTab === tab.id ? 'white' : colors.darkText,
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Character Grid */}
        <CharacterGrid characters={currentChars} onCharClick={(char) => {
          const item = currentChars.find(c => c.char === char);
          if (item) setSelectedChar(item);
        }} />

        {/* Stats */}
        <div className="text-center text-xs text-[#c8c4d7]">
          Tap karakter untuk melihat detail
        </div>
      </main>

      <BottomNav />

      {/* Quiz Modal */}
      <QuizModal 
        isOpen={quizOpen} 
        onClose={() => setQuizOpen(false)} 
        moduleType={isHiragana ? 'hiragana' : 'katakana'} 
      />

      {/* Character Detail Modal */}
      <AnimatePresence>
        {selectedChar && (
          <CharDetailModal
            char={selectedChar.char}
            romaji={selectedChar.romaji}
            example={selectedChar.example}
            exampleMeaning={selectedChar.exampleMeaning}
            onClose={() => setSelectedChar(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Main Learn Page
export default function LearnPage() {
  const [activeModule, setActiveModule] = useState<string | null>(null);

  const modules = [
    { 
      id: 'hiragana', 
      title: 'Hiragana', 
      subtitle: 'Aksara dasar Jepang', 
      icon: 'あ', 
      status: 'learning' as const, 
      progress: 65, 
      learned: 30, 
      total: 104,
      badge: 'Sedang Belajar', 
      badgeColor: colors.brand 
    },
    { 
      id: 'katakana', 
      title: 'Katakana', 
      subtitle: 'Aksara dasar Jepang', 
      icon: 'ア', 
      status: 'locked' as const, 
      progress: 0, 
      learned: 0, 
      total: 104,
    },
    { 
      id: 'kanji', 
      title: 'Kanji N5', 
      subtitle: '103 Kanji JLPT N5', 
      icon: '漢', 
      status: 'locked' as const, 
      progress: 0, 
      learned: 0, 
      total: 103,
    },
    { 
      id: 'vocabulary', 
      title: 'Kosakata', 
      subtitle: '241 kata dasar N5', 
      icon: '📝', 
      status: 'locked' as const, 
      progress: 0, 
      learned: 0, 
      total: 241,
    },
    { 
      id: 'grammar', 
      title: 'Tata Bahasa', 
      subtitle: '20 pola kalimat N5', 
      icon: '📖', 
      status: 'locked' as const, 
      progress: 0, 
      learned: 0, 
      total: 20,
    },
  ];

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
  };

  if (activeModule) {
    return (
      <ModuleDetailView 
        moduleId={activeModule} 
        onBack={() => setActiveModule(null)} 
      />
    );
  }

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
            <ProgressRing level={7} progress={65} />
          </div>
        </motion.div>

        {/* Review Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => setActiveModule('hiragana')}
          className="p-4 rounded-2xl cursor-pointer"
          style={{ backgroundColor: colors.cardBg, border: `1px solid ${colors.inputBg}` }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[#c8c4d7]">Lanjutkan Belajar</span>
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${colors.brand}20`, color: colors.brand }}>Lanjutkan</span>
          </div>
          <p className="text-lg font-bold text-[#d8e4ea]">Hiragana - Dasar ({Object.keys(HIRAGANA_BASIC).length} karakter)</p>
          <p className="text-sm text-[#c8c4d7] mt-1">● Sedang Belajar • 30/46 karakter</p>
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
                learned={mod.learned}
                total={mod.total}
                badge={mod.badge}
                badgeColor={mod.badgeColor}
                onClick={() => handleModuleClick(mod.id)}
                index={i}
              />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}