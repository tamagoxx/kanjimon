'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { HIRAGANA_BASIC, HIRAGANA_DAKUTEN, HIRAGANA_COMBINATIONS } from '@/data/learning/characters';
import { KATAKANA_BASIC } from '@/data/learning/characters';
import { KANJI_N5, KANJI_N5_LIST, type KanjiData } from '@/data/learning/kanji-n5';
import { useCollectionStore } from '@/store/collectionStore';
import { useLearningProgressStore } from '@/store/learningProgressStore';
import type { JapaneseCard } from '@/types';

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

// Pool kartu Japanese reward untuk quiz (80% chance upon passing)
const QUIZ_REWARD_CARDS: JapaneseCard[] = [
  { id: 'quiz_fire_1', japanese: '火', reading: 'ひ', romaji: 'hi', meaning: 'api', meaningId: 'api', type: 'NOUN', jlptLevel: 'N5', hp: 110, attackPower: 42, defenseRating: 25, specialAbility: 'Flame', rarity: 'UNCOMMON', element: 'FIRE', cardArtUrl: '', exampleSentence: '火が明るい', exampleTranslation: 'Api itu cerah', tags: ['fire', 'nature'] },
  { id: 'quiz_water_1', japanese: '水', reading: 'みず', romaji: 'mizu', meaning: 'air', meaningId: 'air', type: 'NOUN', jlptLevel: 'N5', hp: 105, attackPower: 38, defenseRating: 30, specialAbility: 'Aqua', rarity: 'UNCOMMON', element: 'WATER', cardArtUrl: '', exampleSentence: '水を飲む', exampleTranslation: 'Minum air', tags: ['water', 'nature'] },
  { id: 'quiz_grass_1', japanese: '木', reading: 'き', romaji: 'ki', meaning: 'pohon', meaningId: 'pohon', type: 'NOUN', jlptLevel: 'N5', hp: 115, attackPower: 35, defenseRating: 35, specialAbility: 'Overgrow', rarity: 'UNCOMMON', element: 'GRASS', cardArtUrl: '', exampleSentence: '木が大きい', exampleTranslation: 'Pohonnya besar', tags: ['grass', 'nature'] },
  { id: 'quiz_electric_1', japanese: '電', reading: 'でん', romaji: 'den', meaning: 'listrik', meaningId: 'listrik', type: 'NOUN', jlptLevel: 'N5', hp: 100, attackPower: 48, defenseRating: 20, specialAbility: 'Voltaic', rarity: 'UNCOMMON', element: 'ELECTRIC', cardArtUrl: '', exampleSentence: '電車が来る', exampleTranslation: 'Kereta listrik datang', tags: ['electric', 'tech'] },
  { id: 'quiz_love_1', japanese: '愛', reading: 'あい', romaji: 'ai', meaning: 'cinta', meaningId: 'cinta', type: 'NOUN', jlptLevel: 'N5', hp: 120, attackPower: 30, defenseRating: 40, specialAbility: 'Love', rarity: 'RARE', element: 'PSYCHIC', cardArtUrl: '', exampleSentence: '愛は強い', exampleTranslation: 'Cinta itu kuat', tags: ['love', 'emotion'] },
  { id: 'quiz_food_1', japanese: '食', reading: 'たべ', romaji: 'tabe', meaning: 'makan', meaningId: 'makan', type: 'NOUN', jlptLevel: 'N5', hp: 100, attackPower: 40, defenseRating: 30, specialAbility: 'Feast', rarity: 'UNCOMMON', element: 'NORMAL', cardArtUrl: '', exampleSentence: '食べ物が美味しい', exampleTranslation: 'Makanannya enak', tags: ['food', 'action'] },
  { id: 'quiz_sun_1', japanese: '日', reading: 'ひ', romaji: 'hi', meaning: 'hari/matahari', meaningId: 'hari', type: 'NOUN', jlptLevel: 'N5', hp: 110, attackPower: 40, defenseRating: 30, specialAbility: 'Solar', rarity: 'UNCOMMON', element: 'FIRE', cardArtUrl: '', exampleSentence: '日が明るい', exampleTranslation: 'Hari itu cerah', tags: ['time', 'nature'] },
  { id: 'quiz_moon_1', japanese: '月', reading: 'つき', romaji: 'tsuki', meaning: 'bulan', meaningId: 'bulan', type: 'NOUN', jlptLevel: 'N5', hp: 105, attackPower: 38, defenseRating: 32, specialAbility: 'Lunar', rarity: 'UNCOMMON', element: 'PSYCHIC', cardArtUrl: '', exampleSentence: '月が綺麗', exampleTranslation: 'Bulan itu indah', tags: ['time', 'nature'] },
  { id: 'quiz_star_1', japanese: '星', reading: 'ほし', romaji: 'hoshi', meaning: 'bintang', meaningId: 'bintang', type: 'NOUN', jlptLevel: 'N5', hp: 100, attackPower: 35, defenseRating: 35, specialAbility: 'Stardust', rarity: 'UNCOMMON', element: 'PSYCHIC', cardArtUrl: '', exampleSentence: '星が多い', exampleTranslation: 'Banyak bintang', tags: ['nature', 'space'] },
  { id: 'quiz_heart_1', japanese: '心', reading: 'こころ', romaji: 'kokoro', meaning: 'hati', meaningId: 'hati', type: 'NOUN', jlptLevel: 'N5', hp: 115, attackPower: 35, defenseRating: 38, specialAbility: 'Psychic', rarity: 'RARE', element: 'PSYCHIC', cardArtUrl: '', exampleSentence: '心を込める', exampleTranslation: 'Dengan sepenuh hati', tags: ['emotion', 'soul'] },
  { id: 'quiz_wind_1', japanese: '風', reading: 'かぜ', romaji: 'kaze', meaning: 'angin', meaningId: 'angin', type: 'NOUN', jlptLevel: 'N5', hp: 100, attackPower: 42, defenseRating: 28, specialAbility: 'Gale', rarity: 'UNCOMMON', element: 'ELECTRIC', cardArtUrl: '', exampleSentence: '風が強い', exampleTranslation: 'Anginnya kuat', tags: ['nature', 'weather'] },
  { id: 'quiz_mountain_1', japanese: '山', reading: 'やま', romaji: 'yama', meaning: 'gunung', meaningId: 'gunung', type: 'NOUN', jlptLevel: 'N5', hp: 120, attackPower: 32, defenseRating: 42, specialAbility: 'Fortress', rarity: 'RARE', element: 'NORMAL', cardArtUrl: '', exampleSentence: '山が高い', exampleTranslation: 'Gunungnya tinggi', tags: ['nature', 'place'] },
];

// Pick a random reward card from the pool
function pickRandomRewardCard(): JapaneseCard {
  return QUIZ_REWARD_CARDS[Math.floor(Math.random() * QUIZ_REWARD_CARDS.length)]!;
}

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
    { icon: '📚', label: 'Belajar', route: '/learn' },
    { icon: '⚔️', label: 'Battle', route: '/battle' },
    { icon: '🃏', label: 'Kartu', route: '/collection' },
    { icon: '🛒', label: 'Toko', route: '/shop' },
  ];

  const currentPath = usePathname();
  const isActive = (route: string) => currentPath === route;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 flex items-center justify-around px-4 z-30" style={{ backgroundColor: colors.navBg }}>
      {navItems.map((item, i) => (
        <button
          key={i}
          onClick={() => router.push(item.route)}
          className="flex flex-col items-center gap-1 transition-opacity"
          style={{ opacity: isActive(item.route) ? 1 : 0.6 }}
        >
          <span className="text-2xl">{item.icon}</span>
          <span className="text-xs" style={{ color: isActive(item.route) ? colors.teal : colors.darkText }}>{item.label}</span>
          {isActive(item.route) && <div className="w-1 h-1 rounded-full" style={{ backgroundColor: colors.teal }} />}
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
  
  // Determine status dynamically
  const computedStatus = progress >= 100 ? 'completed' : progress > 0 ? 'learning' : 'locked';
  
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
          backgroundColor: computedStatus === 'completed' ? `${colors.teal}20` : 
                           computedStatus === 'learning' ? `${colors.brand}20` : colors.inputBg,
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-lg font-bold text-[#d8e4ea]">{title}</span>
          {computedStatus === 'completed' && (
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${colors.teal}30`, color: colors.teal }}>
              ✓ Selesai
            </span>
          )}
          {computedStatus === 'learning' && badge && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${badgeColor || colors.brand}30`, color: badgeColor || colors.brand }}>
              {badge}
            </span>
          )}
          {computedStatus === 'locked' && (
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
                backgroundColor: computedStatus === 'completed' ? colors.teal : 
                                computedStatus === 'learning' ? colors.brand : colors.darkGray,
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

// Quiz for Hiragana/Katakana (supports basic, dakuten, combinations)
function QuizModal({ isOpen, onClose, moduleType, quizSubset = 'basic' }: {
  isOpen: boolean; onClose: () => void; moduleType: 'hiragana' | 'katakana';
  quizSubset?: 'basic' | 'dakuten' | 'combinations';
}) {
  const addDiamonds = useCollectionStore(s => s.addDiamonds);
  const addJapaneseCard = useCollectionStore(s => s.addJapaneseCard);
  const trackQuestEvent = useCollectionStore(s => s.trackQuestEvent);
  const markCharLearned = useLearningProgressStore(s => s.markCharLearned);
  const markBatchLearned = useLearningProgressStore(s => s.markBatchLearned);
  const getModuleProgress = useLearningProgressStore(s => s.getModuleProgress);

  // Controlled state - no refs, no stale closures
  const [questions, setQuestions] = useState<Array<{
    char: string; romaji: string; options: string[]; correct: number;
    example?: string; exampleMeaning?: string;
  }>>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [quizKey, setQuizKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [awardedCard, setAwardedCard] = useState<JapaneseCard | null>(null);
  const [subsetLabel, setSubsetLabel] = useState(
    quizSubset === 'dakuten' ? 'DAKUTEN' : quizSubset === 'combinations' ? 'KOMBINASI' : moduleType.toUpperCase()
  );

  // Reset state when modal reopens (isOpen changes from false to true)
  useEffect(() => {
    if (isOpen) {
      setAwardedCard(null);
      setIsComplete(false);
      setIsClosing(false);
      setShowResult(false);
    }
  }, [isOpen]);

  // Update label when subset changes
  useEffect(() => {
    setSubsetLabel(
      quizSubset === 'dakuten' ? 'DAKUTEN' : quizSubset === 'combinations' ? 'KOMBINASI' : moduleType.toUpperCase()
    );
  }, [quizSubset, moduleType]);

  // Generate questions when moduleType or quizKey changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const isHiragana = moduleType === 'hiragana';
      const basic = isHiragana ? HIRAGANA_BASIC : KATAKANA_BASIC;
      const dakuten = isHiragana ? HIRAGANA_DAKUTEN : null;
      const combos = isHiragana ? HIRAGANA_COMBINATIONS : null;

      let allChars: { char: string; romaji: string; example?: string; exampleMeaning?: string }[];

      switch (quizSubset) {
        case 'dakuten':
          allChars = dakuten
            ? Object.entries(dakuten).map(([char, data]) => ({
                char,
                romaji: data.romaji,
                example: `base: ${data.base}`,
                exampleMeaning: data.base,
              }))
            : [];
          break;
        case 'combinations':
          allChars = combos
            ? Object.entries(combos).map(([char, data]) => ({
                char,
                romaji: data.romaji,
                example: data.combo,
                exampleMeaning: data.combo,
              }))
            : [];
          break;
        default: // 'basic'
          allChars = Object.entries(basic).map(([char, data]) => ({
            char,
            romaji: data.romaji,
            example: data.example,
            exampleMeaning: data.exampleMeaning,
          }));
      }

      if (allChars.length === 0) {
        throw new Error('No characters found for module');
      }

      const shuffled = [...allChars].sort(() => Math.random() - 0.5).slice(0, 10);

      const newQuestions = shuffled.map(char => {
        const correctAnswer = char.romaji;
        const wrongAnswers = allChars
          .filter(c => c.romaji !== correctAnswer)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(c => c.romaji);

        const options = wrongAnswers.length >= 3
          ? [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5)
          : [correctAnswer];

        return {
          char: char.char,
          romaji: char.romaji,
          options,
          correct: options.indexOf(correctAnswer),
          example: char.example,
          exampleMeaning: char.exampleMeaning,
        };
      });

      setQuestions(newQuestions);
      setCurrentQuestion(0);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to generate questions:', err);
      setError('Gagal menghasilkan soal');
      setIsLoading(false);
    }
  }, [moduleType, quizKey, quizSubset]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAnswer(null);
      setScore(0);
      setIsComplete(false);
      setShowResult(false);
      setError(null);
      setIsClosing(false);
      setAwardedCard(null);
    }
  }, [isOpen]);

  // Sync currentQuestion to valid range when questions change
  useEffect(() => {
    if (questions.length > 0 && currentQuestion >= questions.length) {
      setCurrentQuestion(Math.min(currentQuestion, questions.length - 1));
    }
  }, [questions.length]);

  if (!isOpen) return null;

  // Loading state
  if (isLoading || questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      >
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-3">📚</div>
          <p className="text-white/60">Menyiapkan kuis...</p>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      >
        <div className="text-center p-6">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-white/80 mb-4">{error}</p>
          <button
            onClick={() => setQuizKey(k => k + 1)}
            className="px-6 py-3 rounded-xl font-bold text-white"
            style={{ backgroundColor: colors.brand }}
          >
            🔄 Coba Lagi
          </button>
          <button
            onClick={onClose}
            className="block w-full mt-3 px-6 py-2 rounded-xl text-white/60"
          >
            Tutup
          </button>
        </div>
      </motion.div>
    );
  }

  const q = questions[currentQuestion];
  if (!q) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      >
        <div className="text-center">
          <p className="text-white/60">Terjadi kesalahan pada kuis.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 rounded-xl font-bold text-white" style={{ backgroundColor: colors.brand }}>
            Tutup
          </button>
        </div>
      </motion.div>
    );
  }

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null || isClosing) return;
    setSelectedAnswer(index);
    if (index === q.correct) {
      setScore(s => s + 1);
    }
    setTimeout(() => {
      if (!isClosing) setShowResult(true);
    }, 500);
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
    setQuizKey(k => k + 1);
  };

  // Stable handleComplete - no refs, no closures issues
  const handleComplete = () => {
    if (isClosing) return;
    setIsClosing(true);

    const finalScore = score;
    const finalQuestions = questions;

    try {
      // Calculate reward
      const reward = finalScore >= 8 ? 15 : finalScore >= 6 ? 8 : 0;
      const passed = finalScore >= 6;

      // Add diamonds if earned
      if (reward > 0) {
        addDiamonds(reward);
      }

      // 80% chance to get a Japanese card on passing (score >= 6)
      if (passed) {
        const roll = Math.random() * 100;
        if (roll < 80) {
          const rewardCard = pickRandomRewardCard();
          addJapaneseCard(rewardCard);
          setAwardedCard(rewardCard);
          console.log(`[Quiz] Awarded Japanese card: ${rewardCard.japanese} (${rewardCard.romaji})`);
        } else {
          console.log(`[Quiz] Card roll failed (${roll.toFixed(1)}%), no card awarded`);
        }
      }

      // Mark characters as learned if passed - use batch for efficiency
      if (passed && finalQuestions.length > 0) {
        const charsToMark = finalQuestions.map(q => ({ char: q.char, romaji: q.romaji }));
        const addedCount = markBatchLearned(moduleType, charsToMark);
        console.log(`[Quiz] Marked ${addedCount} chars as learned for ${moduleType}`);

        // Refresh module progress to update UI
        const updated = getModuleProgress(moduleType);
        console.log(`[Quiz] ${moduleType} progress: ${updated.learned}/${updated.total} (${updated.percentage}%)`);

        // Update MODULE quest progress
        trackQuestEvent('MODULE');
      }
    } catch (err) {
      console.error('handleComplete error:', err);
    }

    // Always close after a short delay
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 100);
  };

  // Complete screen
  if (isComplete) {
    const passed = score >= 6;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      >
        <div className="text-center p-6 rounded-2xl w-full max-w-sm" style={{ backgroundColor: colors.cardBg }}>
          <div className="text-5xl mb-3">{score >= 8 ? '🏆' : score >= 6 ? '👍' : '📚'}</div>
          <h2 className="text-2xl font-bold text-[#d8e4ea] mb-2">
            {score >= 8 ? 'Luar Biasa!' : score >= 6 ? 'Bagus!' : 'Tetap Semangat!'}
          </h2>
          <p className="text-4xl font-bold mb-2" style={{ color: score >= 6 ? colors.teal : colors.brand }}>
            {score}/{questions.length}
          </p>
          {score >= 6 && (
            <div className="mb-4 px-4 py-2 rounded-lg inline-block" style={{ backgroundColor: '#6c5ce720' }}>
              <p className="text-sm font-bold" style={{ color: '#c6bfff' }}>
                💎 +{score >= 8 ? 15 : 8} Diamond
              </p>
            </div>
          )}

          {/* Card reward reveal */}
          <AnimatePresence>
            {awardedCard && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mb-4 mx-auto"
              >
                <p className="text-xs text-white/50 mb-2">🎁 Kartu Japanese Baru!</p>
                <div
                  className="w-20 h-28 mx-auto rounded-xl flex flex-col items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, #1a1a2e 0%, ${
                      awardedCard.element === 'FIRE' ? '#ff6b3530' :
                      awardedCard.element === 'WATER' ? '#4facfe30' :
                      awardedCard.element === 'GRASS' ? '#4bddb730' :
                      awardedCard.element === 'ELECTRIC' ? '#ffd93d30' :
                      '#c77dff30'
                    } 100%)`,
                    border: `2px solid ${
                      awardedCard.element === 'FIRE' ? '#ff6b35' :
                      awardedCard.element === 'WATER' ? '#4facfe' :
                      awardedCard.element === 'GRASS' ? '#4bddb7' :
                      awardedCard.element === 'ELECTRIC' ? '#ffd93d' :
                      '#c77dff'
                    }`,
                    boxShadow: `0 0 20px ${
                      awardedCard.element === 'FIRE' ? '#ff6b3560' :
                      awardedCard.element === 'WATER' ? '#4facfe60' :
                      awardedCard.element === 'GRASS' ? '#4bddb760' :
                      awardedCard.element === 'ELECTRIC' ? '#ffd93d60' :
                      '#c77dff60'
                    }`,
                  }}
                >
                  <span className="text-4xl font-black text-white">{awardedCard.japanese}</span>
                  <span className="text-[9px] text-white/70 mt-0.5">{awardedCard.reading}</span>
                  <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/30" />
                  <div className="absolute bottom-0 inset-x-0 h-1.5" style={{
                    backgroundColor: awardedCard.rarity === 'RARE' ? '#ffd93d' : '#6c5ce7',
                  }} />
                  <div
                    className="absolute top-0.5 right-0.5 text-[6px] font-black px-1 py-0.5 rounded-full"
                    style={{
                      backgroundColor: awardedCard.rarity === 'RARE' ? '#ffd93d' : '#6c5ce7',
                      color: '#fff',
                    }}
                  >
                    {awardedCard.rarity}
                  </div>
                </div>
                <p className="text-xs text-white/60 mt-1">「{awardedCard.romaji}」 — {awardedCard.meaning}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!awardedCard && score >= 6 && (
            <p className="text-xs text-white/30 mb-4">🎁 Berpeluang mendapat kartu Japanese!</p>
          )}

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
              onClick={handleComplete}
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
            KUIS {subsetLabel}
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

// Kanji Detail Modal
function KanjiDetailModal({ kanji, onClose }: {
  kanji: KanjiData; onClose: () => void;
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
        className="w-72 rounded-2xl p-6 text-center"
        style={{ backgroundColor: colors.cardBg }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-24 h-24 mx-auto rounded-2xl flex items-center justify-center text-5xl font-bold mb-4" style={{ backgroundColor: `${colors.brand}20` }}>
          {kanji.japanese}
        </div>
        <h3 className="text-2xl font-bold text-[#d8e4ea] mb-1">{kanji.romaji}</h3>
        <p className="text-sm text-[#4bddb7] mb-3">{kanji.meaning}</p>
        <div className="text-xs text-[#c8c4d7] space-y-1 mb-4">
          <p>Onyomi: {kanji.onyomi.join('、') || '-'}</p>
          <p>Kunyomi: {kanji.kunyomi.join('、') || '-'}</p>
          <p>Strokes: {kanji.strokes}</p>
        </div>
        <div className="p-3 rounded-xl mb-4" style={{ backgroundColor: colors.inputBg }}>
          <p className="text-lg font-bold text-white">{kanji.exampleWord}</p>
          <p className="text-sm text-[#c8c4d7]">{kanji.exampleReading}</p>
          <p className="text-xs text-[#4bddb7]">{kanji.exampleMeaning}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-2 w-full py-2 rounded-xl font-bold text-white"
          style={{ backgroundColor: colors.brand }}
        >
          Tutup
        </button>
      </motion.div>
    </motion.div>
  );
}

// Kanji Quiz Modal
function KanjiQuizModal({ isOpen, onClose }: {
  isOpen: boolean; onClose: () => void;
}) {
  const addDiamonds = useCollectionStore(s => s.addDiamonds);
  const addJapaneseCard = useCollectionStore(s => s.addJapaneseCard);
  const trackQuestEvent = useCollectionStore(s => s.trackQuestEvent);
  const markBatchLearned = useLearningProgressStore(s => s.markBatchLearned);
  const getModuleProgress = useLearningProgressStore(s => s.getModuleProgress);

  const [questions, setQuestions] = useState<Array<{
    kanji: KanjiData; options: string[]; correct: number;
  }>>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [quizKey, setQuizKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [awardedCard, setAwardedCard] = useState<JapaneseCard | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAwardedCard(null);
      setIsComplete(false);
      setIsClosing(false);
      setShowResult(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const shuffled = [...KANJI_N5_LIST].sort(() => Math.random() - 0.5).slice(0, 10);

      const newQuestions = shuffled.map(kanji => {
        const correctAnswer = kanji.meaning;
        const wrongAnswers = KANJI_N5_LIST
          .filter(k => k.meaning !== correctAnswer)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(k => k.meaning);

        const options = wrongAnswers.length >= 3
          ? [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5)
          : [correctAnswer];

        return {
          kanji,
          options,
          correct: options.indexOf(correctAnswer),
        };
      });

      setQuestions(newQuestions);
      setCurrentQuestion(0);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to generate kanji questions:', err);
      setError('Gagal menghasilkan soal kanji');
      setIsLoading(false);
    }
  }, [quizKey]);

  useEffect(() => {
    if (isOpen) {
      setSelectedAnswer(null);
      setScore(0);
      setIsComplete(false);
      setShowResult(false);
      setError(null);
      setIsClosing(false);
      setAwardedCard(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestion >= questions.length) {
      setCurrentQuestion(Math.min(currentQuestion, questions.length - 1));
    }
  }, [questions.length]);

  if (!isOpen) return null;

  if (isLoading || questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      >
        <div className="text-center">
          <div className="text-4xl animate-pulse mb-3">漢</div>
          <p className="text-white/60">Menyiapkan kuis kanji...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      >
        <div className="text-center p-6">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-white/80 mb-4">{error}</p>
          <button
            onClick={() => setQuizKey(k => k + 1)}
            className="px-6 py-3 rounded-xl font-bold text-white"
            style={{ backgroundColor: colors.brand }}
          >
            🔄 Coba Lagi
          </button>
          <button onClick={onClose} className="block w-full mt-3 px-6 py-2 rounded-xl text-white/60">
            Tutup
          </button>
        </div>
      </motion.div>
    );
  }

  const q = questions[currentQuestion];
  if (!q) return null;

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null || isClosing) return;
    setSelectedAnswer(index);
    if (index === q.correct) {
      setScore(s => s + 1);
    }
    setTimeout(() => {
      if (!isClosing) setShowResult(true);
    }, 500);
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

  const handleRetry = () => setQuizKey(k => k + 1);

  const handleComplete = () => {
    if (isClosing) return;
    setIsClosing(true);

    const finalScore = score;

    try {
      const reward = finalScore >= 8 ? 15 : finalScore >= 6 ? 8 : 0;
      const passed = finalScore >= 6;

      if (reward > 0) addDiamonds(reward);

      if (passed) {
        const roll = Math.random() * 100;
        if (roll < 80) {
          const rewardCard = pickRandomRewardCard();
          addJapaneseCard(rewardCard);
          setAwardedCard(rewardCard);
        }

        const charsToMark = questions.map(ques => ({
          char: ques.kanji.japanese,
          romaji: ques.kanji.romaji
        }));
        markBatchLearned('kanji', charsToMark);
        trackQuestEvent('MODULE');
      }
    } catch (err) {
      console.error('handleComplete error:', err);
    }

    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 100);
  };

  if (isComplete) {
    const passed = score >= 6;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}
      >
        <div className="text-center p-6 rounded-2xl w-full max-w-sm" style={{ backgroundColor: colors.cardBg }}>
          <div className="text-5xl mb-3">{score >= 8 ? '🏆' : score >= 6 ? '👍' : '📚'}</div>
          <h2 className="text-2xl font-bold text-[#d8e4ea] mb-2">
            {score >= 8 ? 'Luar Biasa!' : score >= 6 ? 'Bagus!' : 'Tetap Semangat!'}
          </h2>
          <p className="text-4xl font-bold mb-2" style={{ color: score >= 6 ? colors.teal : colors.brand }}>
            {score}/{questions.length}
          </p>
          {score >= 6 && (
            <div className="mb-4 px-4 py-2 rounded-lg inline-block" style={{ backgroundColor: '#6c5ce720' }}>
              <p className="text-sm font-bold" style={{ color: '#c6bfff' }}>
                💎 +{score >= 8 ? 15 : 8} Diamond
              </p>
            </div>
          )}

          <AnimatePresence>
            {awardedCard && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="mb-4 mx-auto"
              >
                <p className="text-xs text-white/50 mb-2">🎁 Kartu Japanese Baru!</p>
                <div
                  className="w-20 h-28 mx-auto rounded-xl flex flex-col items-center justify-center relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, #1a1a2e 0%, ${
                      awardedCard.element === 'FIRE' ? '#ff6b3530' :
                      awardedCard.element === 'WATER' ? '#4facfe30' :
                      awardedCard.element === 'GRASS' ? '#4bddb730' :
                      awardedCard.element === 'ELECTRIC' ? '#ffd93d30' :
                      '#c77dff30'
                    } 100%)`,
                    border: `2px solid ${
                      awardedCard.element === 'FIRE' ? '#ff6b35' :
                      awardedCard.element === 'WATER' ? '#4facfe' :
                      awardedCard.element === 'GRASS' ? '#4bddb7' :
                      awardedCard.element === 'ELECTRIC' ? '#ffd93d' :
                      '#c77dff'
                    }`,
                  }}
                >
                  <span className="text-4xl font-black text-white">{awardedCard.japanese}</span>
                  <span className="text-[9px] text-white/70 mt-0.5">{awardedCard.reading}</span>
                </div>
                <p className="text-xs text-white/60 mt-1">「{awardedCard.romaji}」 — {awardedCard.meaning}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-sm text-[#c8c4d7] mb-6">
            {score >= 8 ? 'Kamu sudah menguasai kanji ini!' : 'Terus latihan untuk meningkatkan.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={handleRetry} className="px-6 py-3 rounded-xl font-bold text-white" style={{ backgroundColor: colors.inputBg }}>
              🔄 Ulangi
            </button>
            <button onClick={handleComplete} className="px-6 py-3 rounded-xl font-bold text-white" style={{ backgroundColor: colors.brand }}>
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
        <div className="px-4 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#c8c4d7]">{currentQuestion + 1}/{questions.length}</span>
            <span className="text-sm font-bold" style={{ color: colors.teal }}>Skor: {score}</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: colors.darkGray }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%`, backgroundColor: colors.brand }} />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: colors.brand, color: 'white' }}>
            KUIS KANJI N5
          </span>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.inputBg }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#c8c4d7" strokeWidth="2">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        </div>

        <div className="px-4 pb-6 space-y-4">
          <div className="p-6 rounded-xl text-center" style={{ backgroundColor: colors.inputBg }}>
            <div className="text-6xl font-bold text-white mb-2">{q.kanji.japanese}</div>
            <p className="text-sm text-[#c8c4d7]">Onyomi: {q.kanji.onyomi.join('、')}</p>
            <p className="text-sm text-[#c8c4d7]">Kunyomi: {q.kanji.kunyomi.join('、')}</p>
          </div>

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

// Module Detail View (Hiragana/Katakana/Kanji)
function ModuleDetailView({
  moduleId, onBack
}: {
  moduleId: string; onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'basic' | 'dakuten' | 'combinations'>('basic');
  const [quizOpen, setQuizOpen] = useState<{ open: boolean; subset: 'basic' | 'dakuten' | 'combinations' }>({ open: false, subset: 'basic' });
  const [selectedChar, setSelectedChar] = useState<{char: string; romaji: string; example?: string; exampleMeaning?: string} | null>(null);
  const [kanjiQuizOpen, setKanjiQuizOpen] = useState(false);
  const [selectedKanji, setSelectedKanji] = useState<KanjiData | null>(null);

  const isHiragana = moduleId === 'hiragana';
  const isKatakana = moduleId === 'katakana';
  const isKanji = moduleId === 'kanji';

  // Hiragana/Katakana data
  const basicData = isHiragana ? HIRAGANA_BASIC : isKatakana ? KATAKANA_BASIC : null;
  const dakutenData = isHiragana ? HIRAGANA_DAKUTEN : null;
  const comboData = isHiragana ? HIRAGANA_COMBINATIONS : null;

  const basicChars = basicData
    ? Object.entries(basicData).map(([char, data]) => ({
        char,
        romaji: data.romaji,
        example: data.example,
        exampleMeaning: data.exampleMeaning,
      }))
    : [];

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

  const moduleName = isHiragana ? 'Hiragana' : isKatakana ? 'Katakana' : 'Kanji N5';
  const moduleIcon = isHiragana ? 'あ' : isKatakana ? 'ア' : '漢';
  const totalChars = isKanji ? KANJI_N5_LIST.length : basicChars.length + dakutenChars.length + comboChars.length;

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
            {totalChars} karakter
          </p>
          <button
            onClick={() => isKanji ? setKanjiQuizOpen(true) : setQuizOpen({ open: true, subset: activeTab })}
            className="mt-3 px-6 py-2 rounded-xl font-bold text-white"
            style={{ backgroundColor: colors.brand }}
          >
            📝 Mulai Kuis
          </button>
        </motion.div>

        {/* Tabs - only for hiragana/katakana */}
        {!isKanji && (
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
        )}

        {/* Character Grid */}
        {isKanji ? (
          <div className="grid grid-cols-5 gap-2">
            {KANJI_N5_LIST.map((kanji, i) => (
              <motion.button
                key={kanji.japanese}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.005 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedKanji(kanji)}
                className="aspect-square rounded-xl flex flex-col items-center justify-center transition-all hover:opacity-80"
                style={{ backgroundColor: colors.cardBg }}
              >
                <span className="text-2xl font-bold text-white">{kanji.japanese}</span>
                <span className="text-xs text-[#c8c4d7]">{kanji.romaji.split('/')[0]}</span>
              </motion.button>
            ))}
          </div>
        ) : (
          <CharacterGrid characters={currentChars} onCharClick={(char) => {
            const item = currentChars.find(c => c.char === char);
            if (item) setSelectedChar(item);
          }} />
        )}

        {/* Stats */}
        <div className="text-center text-xs text-[#c8c4d7]">
          {isKanji ? 'Tap kanji untuk melihat detail' : 'Tap karakter untuk melihat detail'}
        </div>
      </main>

      <BottomNav />

      {/* Quiz Modal - Hiragana/Katakana */}
      {!isKanji && (
        <QuizModal
          isOpen={quizOpen.open}
          onClose={() => setQuizOpen(prev => ({ ...prev, open: false }))}
          moduleType={isHiragana ? 'hiragana' : 'katakana'}
          quizSubset={quizOpen.subset}
        />
      )}

      {/* Kanji Quiz Modal */}
      {isKanji && (
        <KanjiQuizModal
          isOpen={kanjiQuizOpen}
          onClose={() => setKanjiQuizOpen(false)}
        />
      )}

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

      {/* Kanji Detail Modal */}
      <AnimatePresence>
        {selectedKanji && (
          <KanjiDetailModal
            kanji={selectedKanji}
            onClose={() => setSelectedKanji(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Main Learn Page
export default function LearnPage() {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const hiraganaProgress = useLearningProgressStore(s => s.getModuleProgress)('hiragana');
  const katakanaProgress = useLearningProgressStore(s => s.getModuleProgress)('katakana');
  const kanjiProgress = useLearningProgressStore(s => s.getModuleProgress)('kanji');

  const modules = [
    {
      id: 'hiragana',
      title: 'Hiragana',
      subtitle: 'Aksara dasar Jepang',
      icon: 'あ',
      status: hiraganaProgress.percentage >= 100 ? 'completed' as const : 'learning' as const,
      progress: hiraganaProgress.percentage,
      learned: hiraganaProgress.learned,
      total: hiraganaProgress.total,
      badge: hiraganaProgress.percentage >= 100 ? '✓ Selesai' : hiraganaProgress.percentage >= 85 ? '🔓 Bisa Lanjut!' : 'Sedang Belajar',
      badgeColor: hiraganaProgress.percentage >= 100 ? colors.teal : hiraganaProgress.percentage >= 85 ? colors.gold : colors.brand,
    },
    {
      id: 'katakana',
      title: 'Katakana',
      subtitle: 'Aksara dasar Jepang',
      icon: 'ア',
      status: katakanaProgress.percentage >= 100 ? 'completed' as const : hiraganaProgress.percentage >= 85 ? 'learning' as const : 'locked' as const,
      progress: katakanaProgress.percentage,
      learned: katakanaProgress.learned,
      total: katakanaProgress.total,
      badge: katakanaProgress.percentage >= 100 ? '✓ Selesai' : katakanaProgress.percentage >= 85 ? '🔓 Bisa Lanjut!' : katakanaProgress.learned > 0 ? 'Sedang Belajar' : '🔒 85% Hiragana',
      badgeColor: katakanaProgress.percentage >= 100 ? colors.teal : katakanaProgress.percentage >= 85 ? colors.gold : colors.darkGray,
    },
    {
      id: 'kanji',
      title: 'Kanji N5',
      subtitle: '103 Kanji JLPT N5',
      icon: '漢',
      status: katakanaProgress.percentage >= 85 ? (kanjiProgress.percentage >= 100 ? 'completed' as const : 'learning' as const) : 'locked' as const,
      progress: kanjiProgress.percentage,
      learned: kanjiProgress.learned,
      total: kanjiProgress.total,
      badge: katakanaProgress.percentage >= 85
        ? (kanjiProgress.percentage >= 100 ? '✓ Selesai' : kanjiProgress.learned > 0 ? `${kanjiProgress.learned}/${kanjiProgress.total}` : 'Sedang Belajar')
        : '🔒 85% Katakana',
      badgeColor: katakanaProgress.percentage >= 85 ? (kanjiProgress.percentage >= 100 ? colors.teal : colors.brand) : colors.darkGray,
    },
    {
      id: 'vocabulary',
      title: 'Kosakata',
      subtitle: '241 kata dasar N5',
      icon: '📝',
      status: katakanaProgress.percentage >= 100 ? 'learning' as const : 'locked' as const,
      progress: 0,
      learned: 0,
      total: 241,
      badge: katakanaProgress.percentage >= 100 ? 'Sedang Belajar' : '🔒 85% Kanji',
      badgeColor: colors.darkGray,
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
      badge: '🔒 85% Kosakata',
      badgeColor: colors.darkGray,
    },
  ];

  const handleModuleClick = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod || mod.status === 'locked') return;
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
          <p className="text-sm text-[#c8c4d7] mt-1">
            {hiraganaProgress.learned > 0 
              ? `● Sedang Belajar • ${hiraganaProgress.learned}/${hiraganaProgress.total} karakter` 
              : '● Tap untuk mulai belajar'}
          </p>
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