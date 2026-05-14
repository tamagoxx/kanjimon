'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { HIRAGANA_BASIC, HIRAGANA_DAKUTEN, HIRAGANA_COMBINATIONS, KATAKANA_BASIC, N5_KANJI, N5_GRAMMAR } from '@/data/learning/characters';
import type { LearningModule } from '@/types';

const MODULES: LearningModule[] = [
  { id: 'hiragana', type: 'hiragana', title: 'Hiragana', description: 'Belajar aksara hiragana dasar', totalItems: 46, icon: 'あ' },
  { id: 'katakana', type: 'katakana', title: 'Katakana', description: 'Belajar aksara katakana dasar', totalItems: 46, icon: 'ア' },
  { id: 'kanji', type: 'kanji', title: 'Kanji N5', description: '103 kanji dasar JLPT N5', totalItems: 103, icon: '漢' },
  { id: 'vocabulary', type: 'vocabulary', title: 'Kosakata', description: 'Kosa kata dasar N5', totalItems: 241, icon: '📝' },
  { id: 'grammar', type: 'grammar', title: 'Tata Bahasa', description: 'Pola kalimat dasar N5', totalItems: 20, icon: '📖' },
];

type TabType = 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'grammar';

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<TabType>('hiragana');
  const [practiceMode, setPracticeMode] = useState(false);
  const [quizState, setQuizState] = useState<{
    question: string;
    options: string[];
    correctAnswer: string;
    answered: boolean;
    selectedAnswer: string | null;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);

  const subCategory = useMemo(() => {
    switch (activeTab) {
      case 'hiragana':
        return [
          { id: 'basic', label: 'Dasar (46)', count: 46 },
          { id: 'dakuten', label: 'Dakuten (25)', count: 25 },
          { id: 'combinations', label: 'Kombinasi (33)', count: 33 },
        ];
      case 'katakana':
        return [
          { id: 'basic', label: 'Dasar (46)', count: 46 },
        ];
      case 'kanji':
        return [
          { id: 'numbers', label: 'Angka (10)', count: 10 },
          { id: 'time', label: 'Waktu (8)', count: 8 },
          { id: 'nature', label: 'Alam (7)', count: 7 },
          { id: 'people', label: 'Orang (10)', count: 10 },
          { id: 'actions', label: 'Aksi (15)', count: 15 },
        ];
      case 'vocabulary':
        return [
          { id: 'verbs', label: 'Kata Kerja', count: 80 },
          { id: 'nouns', label: 'Kata Benda', count: 100 },
          { id: 'adjectives', label: 'Kata Sifat', count: 40 },
          { id: 'particles', label: 'Partikel', count: 21 },
        ];
      case 'grammar':
        return [
          { id: 'basic', label: 'Dasar (10)', count: 10 },
          { id: 'intermediate', label: 'Menengah (10)', count: 10 },
        ];
      default:
        return [];
    }
  }, [activeTab]);

  const [selectedSub, setSelectedSub] = useState('basic');

  const currentData = useMemo(() => {
    switch (activeTab) {
      case 'hiragana':
        if (selectedSub === 'basic') return Object.entries(HIRAGANA_BASIC);
        if (selectedSub === 'dakuten') return Object.entries(HIRAGANA_DAKUTEN);
        return Object.entries(HIRAGANA_COMBINATIONS);
      case 'katakana':
        return Object.entries(KATAKANA_BASIC);
      case 'kanji':
        return N5_KANJI.map(k => [k.kanji, k] as [string, typeof N5_KANJI[0]]);
      case 'grammar':
        return N5_GRAMMAR.map(g => [g.id, g] as [string, typeof N5_GRAMMAR[0]]);
      default:
        return [];
    }
  }, [activeTab, selectedSub]);

  const startPractice = () => {
    setPracticeMode(true);
    setScore(0);
    setQuestionIndex(0);
    generateQuestion();
  };

  const generateQuestion = () => {
    // Simple quiz for hiragana/katakana
    if (activeTab === 'hiragana' || activeTab === 'katakana') {
      const data = activeTab === 'hiragana'
        ? (selectedSub === 'basic' ? Object.entries(HIRAGANA_BASIC) : selectedSub === 'dakuten' ? Object.entries(HIRAGANA_DAKUTEN) : Object.entries(HIRAGANA_COMBINATIONS))
        : Object.entries(KATAKANA_BASIC);

      const randomIndex = Math.floor(Math.random() * data.length);
      const [char, info] = data[randomIndex] as [string, any];

      // Get 3 wrong answers
      const wrongOptions = data
        .filter((_, i) => i !== randomIndex)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(([, v]) => (v as { romaji: string }).romaji);

      const options = [...wrongOptions, info.romaji].sort(() => Math.random() - 0.5);

      setQuizState({
        question: `Apa romaji dari "${char}"?`,
        options,
        correctAnswer: info.romaji,
        answered: false,
        selectedAnswer: null,
      });
    } else if (activeTab === 'kanji') {
      const randomIndex = Math.floor(Math.random() * N5_KANJI.length);
      const kanji = N5_KANJI[randomIndex];

      const wrongOptions = N5_KANJI
        .filter((_, i) => i !== randomIndex)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(k => k.meaning);

      const options = [...wrongOptions, kanji.meaning].sort(() => Math.random() - 0.5);

      setQuizState({
        question: `Apa arti dari "${kanji.kanji}"?`,
        options,
        correctAnswer: kanji.meaning,
        answered: false,
        selectedAnswer: null,
      });
    } else if (activeTab === 'grammar') {
      const randomIndex = Math.floor(Math.random() * N5_GRAMMAR.length);
      const grammar = N5_GRAMMAR[randomIndex];

      const wrongOptions = N5_GRAMMAR
        .filter((_, i) => i !== randomIndex)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(g => g.meaning);

      const options = [...wrongOptions, grammar.meaning].sort(() => Math.random() - 0.5);

      setQuizState({
        question: `Apa arti pola "${grammar.pattern}"?`,
        options,
        correctAnswer: grammar.meaning,
        answered: false,
        selectedAnswer: null,
      });
    }
  };

  const handleAnswer = (answer: string) => {
    if (!quizState || quizState.answered) return;

    const isCorrect = answer === quizState.correctAnswer;
    if (isCorrect) setScore(s => s + 1);

    setQuizState(prev => prev ? { ...prev, answered: true, selectedAnswer: answer } : null);
  };

  const nextQuestion = () => {
    if (questionIndex < 9) {
      setQuestionIndex(i => i + 1);
      generateQuestion();
    } else {
      // Done
      setPracticeMode(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0F0F1A]/80 border-b border-[#2D2D44]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] bg-clip-text text-transparent">
              KanjiMon
            </Link>
            <span className="text-[#636E72]">/ Learn</span>
          </div>
          <Link href="/" className="text-sm text-[#B2BEC3] hover:text-white">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-white mb-2">📖 Learn Japanese</h1>
          <p className="text-[#636E72]">Pelajari hiragana, katakana, kanji, kosakata, dan tata bahasa N5</p>
        </motion.div>

        {/* Module Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {MODULES.map((mod, i) => (
            <motion.button
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              onClick={() => {
                setActiveTab(mod.type as TabType);
                setSelectedSub('basic');
                setPracticeMode(false);
              }}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                activeTab === mod.type
                  ? 'bg-[#6C5CE7]/20 border-[#6C5CE7]'
                  : 'bg-[#1A1A2E] border-[#2D2D44] hover:border-[#6C5CE7]'
              }`}
            >
              <div className="text-3xl mb-2">{mod.icon}</div>
              <h3 className="font-bold text-white text-sm">{mod.title}</h3>
              <p className="text-xs text-[#636E72]">{mod.totalItems} items</p>
            </motion.button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {!practiceMode ? (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Sub-categories */}
              {subCategory.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {subCategory.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSub(sub.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedSub === sub.id
                          ? 'bg-[#6C5CE7] text-white'
                          : 'bg-[#1A1A2E] text-[#B2BEC3] border border-[#2D2D44] hover:border-[#6C5CE7]'
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Practice Button */}
              <div className="flex justify-end">
                <button
                  onClick={startPractice}
                  className="px-6 py-3 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  🎯 Practice Quiz (10 questions)
                </button>
              </div>

              {/* Content Grid */}
              {activeTab === 'hiragana' || activeTab === 'katakana' ? (
                <CharacterGrid data={currentData} type={activeTab} />
              ) : activeTab === 'kanji' ? (
                <KanjiGrid data={currentData} />
              ) : activeTab === 'grammar' ? (
                <GrammarGrid data={currentData} />
              ) : (
                <VocabularyGrid />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="practice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto"
            >
              {/* Quiz Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setPracticeMode(false)}
                  className="text-sm text-[#B2BEC3] hover:text-white"
                >
                  ← Back to learning
                </button>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-[#636E72]">Question {questionIndex + 1}/10</span>
                  <span className="px-3 py-1 bg-[#00B894]/20 text-[#00B894] rounded-full text-sm font-bold">
                    Score: {score}
                  </span>
                </div>
              </div>

              {/* Quiz Card */}
              {quizState && (
                <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-8">
                  <div className="text-center mb-8">
                    <div className="text-6xl font-bold text-white mb-4">
                      {activeTab === 'kanji' ? quizState.question.match(/"[^"]+"/)?.[0]?.replace(/"/g, '') || '' : ''}
                    </div>
                    <p className="text-lg text-[#B2BEC3]">
                      {quizState.question.replace(/"/g, '')}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {quizState.options.map((option, i) => {
                      const isCorrect = option === quizState.correctAnswer;
                      const isSelected = option === quizState.selectedAnswer;

                      return (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => !quizState.answered && handleAnswer(option)}
                          disabled={quizState.answered}
                          className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                            quizState.answered
                              ? isCorrect
                                ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                                : isSelected
                                  ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                                  : 'bg-[#2D2D44] text-[#636E72]'
                              : 'bg-[#2D2D44] hover:bg-[#6C5CE7]/20 text-white hover:border border-[#6C5CE7]'
                          }`}
                        >
                          <span className="mr-3 font-bold">{String.fromCharCode(65 + i)}.</span>
                          {option}
                          {quizState.answered && isCorrect && <span className="ml-2">✓</span>}
                        </motion.button>
                      );
                    })}
                  </div>

                  {quizState.answered && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={nextQuestion}
                        className="px-8 py-3 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl font-bold hover:opacity-90 transition-opacity"
                      >
                        {questionIndex < 9 ? 'Next Question →' : 'See Results'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Results */}
              {questionIndex >= 9 && !practiceMode && (
                <div className="mt-8 text-center p-8 bg-[#1A1A2E] rounded-2xl border border-[#2D2D44]">
                  <div className="text-6xl mb-4">🏆</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
                  <p className="text-4xl font-bold text-[#6C5CE7] mb-2">{score}/10</p>
                  <p className="text-[#636E72]">
                    {score >= 8 ? 'Luar biasa! Kamu Master!' :
                     score >= 6 ? 'Bagus! Terus belajar!' :
                     score >= 4 ? 'Lumayan, coba lagi!' :
                     'Perlu lebih banyak latihan...'}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Character Grid (Hiragana/Katakana)
function CharacterGrid({ data, type }: { data: any[]; type: string }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
      {data.map(([char, info]: [string, any], i: number) => (
        <motion.div
          key={`${type}-${char}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.01 }}
          className="aspect-square bg-[#1A1A2E] rounded-xl border border-[#2D2D44] flex flex-col items-center justify-center p-2 hover:border-[#6C5CE7] transition-colors group"
        >
          <div className="text-3xl font-bold text-white mb-1">{char}</div>
          <div className="text-sm text-[#6C5CE7] font-medium">{info.romaji}</div>
          {info.example && (
            <div className="mt-2 text-xs text-[#636E72] text-center opacity-0 group-hover:opacity-100 transition-opacity">
              {info.example}
              {info.exampleMeaning && <span className="block">{info.exampleMeaning}</span>}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// Kanji Grid
function KanjiGrid({ data }: { data: any[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {data.map(([kanji, info]: [string, any], i: number) => (
        <motion.div
          key={kanji}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.01 }}
          className="p-4 bg-[#1A1A2E] rounded-xl border border-[#2D2D44] hover:border-[#6C5CE7] transition-colors"
        >
          <div className="text-5xl font-bold text-white text-center mb-2">{kanji}</div>
          <div className="text-xs text-[#636E72] text-center mb-2">
            <span className="text-[#00B894]">{info.strokeCount} stroke</span>
          </div>
          <div className="text-sm text-[#B2BEC3] text-center mb-1">{info.meaning}</div>
          <div className="flex justify-center gap-1 text-xs">
            {info.onYomi.slice(0, 2).map((y: string) => (
              <span key={y} className="px-2 py-0.5 bg-[#6C5CE7]/20 text-[#A29BFE] rounded">{y}</span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Grammar Grid
function GrammarGrid({ data }: { data: any[] }) {
  const [selectedGrammar, setSelectedGrammar] = useState<any>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map(([, grammar]: [string, any]) => (
        <motion.div
          key={grammar.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-[#1A1A2E] rounded-xl border border-[#2D2D44] hover:border-[#6C5CE7] transition-colors cursor-pointer"
          onClick={() => setSelectedGrammar(grammar)}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-white mb-1">{grammar.pattern}</h3>
              <p className="text-sm text-[#B2BEC3]">{grammar.meaning}</p>
            </div>
            <span className="text-xs text-[#636E72] bg-[#2D2D44] px-2 py-1 rounded">{grammar.id}</span>
          </div>
          <div className="mt-3 text-xs text-[#636E72]">
            Formation: <span className="text-[#6C5CE7]">{grammar.formation}</span>
          </div>
        </motion.div>
      ))}

      {/* Grammar Detail Modal */}
      {selectedGrammar && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-6 max-w-lg w-full"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedGrammar.pattern}</h2>
                <p className="text-[#B2BEC3]">{selectedGrammar.meaning}</p>
              </div>
              <button onClick={() => setSelectedGrammar(null)} className="text-[#636E72] hover:text-white">
                ✕
              </button>
            </div>
            <div className="mb-4">
              <h4 className="text-sm font-bold text-[#636E72] mb-2">Formation</h4>
              <p className="text-white bg-[#2D2D44] p-3 rounded-lg">{selectedGrammar.formation}</p>
            </div>
            {selectedGrammar.notes && (
              <div className="mb-4">
                <h4 className="text-sm font-bold text-[#636E72] mb-2">Notes</h4>
                <p className="text-sm text-[#B2BEC3]">{selectedGrammar.notes}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-bold text-[#636E72] mb-2">Examples</h4>
              <div className="space-y-2">
                {selectedGrammar.examples.map((ex: { japanese: string; translation: string }, i: number) => (
                  <div key={i} className="p-3 bg-[#2D2D44] rounded-lg">
                    <p className="text-white font-medium">{ex.japanese}</p>
                    <p className="text-xs text-[#636E72]">{ex.translation}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Placeholder for vocabulary (uses cards data)
function VocabularyGrid() {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">📝</div>
      <p className="text-[#636E72]">Vocabulary included in Card Collection</p>
      <a href="/collection" className="text-[#6C5CE7] hover:underline mt-2 inline-block">
        Browse Collection →
      </a>
    </div>
  );
}