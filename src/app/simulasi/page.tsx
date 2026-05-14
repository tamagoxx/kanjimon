'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Question {
  id: number;
  section: 'moji' | 'bunpou' | 'dokkai';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Demo questions - real N5 style
const DEMO_QUESTIONS: Question[] = [
  // Moji (Kanji/Vocabulary) - Questions 1-10
  { id: 1, section: 'moji', question: 'あの人は 先生です。\n「あの」の意味は？', options: ['this', 'that', 'which', 'who'], correctIndex: 1, explanation: '「あの」は離れている人或いものを指す。= That (over there)' },
  { id: 2, section: 'moji', question: '「あした」の漢字は？', options: ['今日', '昨日', '明日', '毎日'], correctIndex: 2, explanation: '「明日」= tomorrow (あした)' },
  { id: 3, section: 'moji', question: '「いぬ」の漢字は？', options: ['猫', '鳥', '犬', '魚'], correctIndex: 2, explanation: '「犬」= dog (いぬ)' },
  { id: 4, section: 'moji', question: '「みず」の漢字は？', options: ['火', '水', '木', '土'], correctIndex: 1, explanation: '「水」= water (みず)' },
  { id: 5, section: 'moji', question: '「大きい」の反対は？', options: ['長い', '短い', '小さい', '高い'], correctIndex: 2, explanation: '「小さい」= small (ちいさい) / 「大きい」= big (おおきい)' },
  { id: 6, section: 'moji', question: '「さんぽ」の漢字は？', options: ['散歩', '参加', '産業', '残念'], correctIndex: 0, explanation: '「散歩」= walk/stroll (さんぽする)' },
  { id: 7, section: 'moji', question: '「あける」の漢字は？', options: ['開ける', '閉める', '見る', '買う'], correctIndex: 0, explanation: '「開ける」= to open (あける)' },
  { id: 8, section: 'moji', question: 'Which kanji means "mountain"?', options: ['川', '山', '田', '火'], correctIndex: 1, explanation: '「山」= mountain (やま)' },
  { id: 9, section: 'moji', question: '「わかる」の意味は？', options: ['to ask', 'to know', 'to understand', 'to think'], correctIndex: 2, explanation: '「分かるる」= to understand (わかります)' },
  { id: 10, section: 'moji', question: '「ともだち」の漢字は？', options: ['同士', '友達', '社会', '家族'], correctIndex: 1, explanation: '「友達」= friend (ともだち)' },
  // Bunpou (Grammar) - Questions 11-20
  { id: 11, section: 'bunpou', question: '「わたし ___ がくせい 입니다」\n正しい助詞は？', options: ['の', 'は', 'を', 'に'], correctIndex: 1, explanation: '「は」は主題を示す助詞 (topic marker) = I am a student.' },
  { id: 12, section: 'bunpou', question: '「ねこ ___ みず ___ のみます」', options: ['が / を', 'を / が', 'は / を', 'に / が'], correctIndex: 1, explanation: '「を」は直接目的語、「が」は主語を示す。= The cat drinks water.' },
  { id: 13, section: 'bunpou', question: '「これから ___ いきます」\n正しいのは？', options: ['に', 'へ', 'で', 'を'], correctIndex: 1, explanation: '「へ」は方向を示す。= I will go from now on.' },
  { id: 14, section: 'bunpou', question: 'Which sentence is correct?', options: ['私 は 走る.', '私 は 走ります.', '私 走る.', 'は私 走ります.'], correctIndex: 1, explanation: '「ます」は動詞の丁寧形。= I run (polite).' },
  { id: 15, section: 'bunpou', question: '「 tome ___ 」\nWhat comes after 止め?', options: ['ます', 'って', 'て', 'た'], correctIndex: 2, explanation: '「止めて」(te-form) = stop (command/polite request)' },
  { id: 16, section: 'bunpou', question: '「 ___ 图书馆 ___ 本 ___ 読みます」', options: ['で / を', 'に / が', 'へ / を', 'で / が'], correctIndex: 0, explanation: '「で」は場所、「を」は目的語。= I read books at the library.' },
  { id: 17, section: 'bunpou', question: 'Which is the te-form of 食べる?', options: ['食べます', '食べて', '食べた', '食べって'], correctIndex: 1, explanation: '「て」form of 食べる → 食べて (tabete)' },
  { id: 18, section: 'bunpou', question: '「 ___ 、雨です ___ 」\nComplete with contrast', options: ['しかし / です', 'でも / だ', 'けれど / です', 'それでは /'], correctIndex: 2, explanation: '「けれど」= but/however (contrasting sentence)' },
  { id: 19, section: 'bunpou', question: '「 university ___ 行きます ___ 」\n正しい助詞は？', options: ['に / が', 'へ / を', 'に / を', 'で / に'], correctIndex: 2, explanation: '「に」= destination, 「を」= object (go to university).' },
  { id: 20, section: 'bunpou', question: 'Which is the past tense of 飲む?', options: ['飲んでいます', '飲みます', '飲みました', '飲むでしょう'], correctIndex: 2, explanation: '「ました」= past tense polite. 飲みました = drank.' },
  // Dokkai (Reading Comprehension) - Questions 21-25
  { id: 21, section: 'dokkai', question: '私の名前は田中です。京都に住んでいます。学生です。\n\n質問：田中さんの職業は？', options: ['先生', '学生', '医者', '社員'], correctIndex: 1, explanation: '「学生です」= I am a student.' },
  { id: 22, section: 'dokkai', question: '今日は晴です。午前中は図書館で勉強します。午後は友達と映画を見ます。\n\n質問：午前に何をする？', options: ['映画を見る', '勉強する', '買い物をする', '寝る'], correctIndex: 1, explanation: '「午前中は図書館で勉強します」= Study at library in the morning.' },
  { id: 23, section: 'dokkai', question: '小林さんは毎朝パンを食べます。牛奶喝了咖啡。\n\n質問：小林さんは何を食べますか？', options: ['お寿司', 'パン', 'カレー', 'ラーメン'], correctIndex: 1, explanation: '「パンを食べます」= eats bread' },
  { id: 24, section: 'dokkai', question: '（A:）すみません、駅はどこですか？\n（B:）あの银行的左です。\n\n質問：駅はどこ？', options: ['右', '左', '前', '後ろ'], correctIndex: 1, explanation: '「左です」= It is on the left.' },
  { id: 25, section: 'dokkai', question: '私は日本の音楽が好きです。周末常常听日本歌曲。\n\n質問：話者は何が好き？', options: ['映画', '食べ物', '日本の音楽', '読書'], correctIndex: 2, explanation: '「日本の音楽が好きです」= I like Japanese music.' },
];

const SECTION_INFO = {
  moji: { name: '文字 (Moji)', description: 'Kanji & Vocabulary', icon: '漢', duration: '25 questions' },
  bunpou: { name: '文法 (Bunpou)', description: 'Grammar', icon: '📖', duration: '25 questions' },
  dokkai: { name: '読解 (Dokkai)', description: 'Reading Comprehension', icon: '📚', duration: '25 questions' },
};

export default function SimulasiPage() {
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes
  const [sectionFilter, setSectionFilter] = useState<string>('all');

  const filteredQuestions = useMemo(() => {
    if (sectionFilter === 'all') return DEMO_QUESTIONS;
    return DEMO_QUESTIONS.filter(q => q.section === sectionFilter);
  }, [sectionFilter]);

  const currentQ = filteredQuestions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  // Timer
  useState(() => {
    if (!examStarted || examFinished) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          setExamFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  });

  const handleAnswer = (optionIndex: number) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionIndex }));
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setExamFinished(true);
    }
  };

  const startExam = (section?: string) => {
    if (section) setSectionFilter(section);
    setExamStarted(true);
    setExamFinished(false);
    setCurrentQuestion(0);
    setAnswers({});
    setShowExplanation(false);
    setTimeLeft(30 * 60);
  };

  const resetExam = () => {
    setExamStarted(false);
    setExamFinished(false);
    setCurrentQuestion(0);
    setAnswers({});
    setShowExplanation(false);
    setSectionFilter('all');
  };

  // Calculate scores
  const scores = useMemo(() => {
    const total = filteredQuestions.length;
    let correct = { moji: 0, bunpou: 0, dokkai: 0 };
    let totalSection = { moji: 0, bunpou: 0, dokkai: 0 };

    filteredQuestions.forEach(q => {
      totalSection[q.section as keyof typeof totalSection]++;
      if (answers[q.id] === q.correctIndex) {
        correct[q.section as keyof typeof correct]++;
      }
    });

    return {
      total,
      correct: correct.moji + correct.bunpou + correct.dokkai,
      moji: { correct: correct.moji, total: totalSection.moji },
      bunpou: { correct: correct.bunpou, total: totalSection.bunpou },
      dokkai: { correct: correct.dokkai, total: totalSection.dokkai },
      percentage: total > 0 ? Math.round(((correct.moji + correct.bunpou + correct.dokkai) / total) * 100) : 0,
      passed: total > 0 && ((correct.moji + correct.bunpou + correct.dokkai) / total) >= 0.8,
    };
  }, [filteredQuestions, answers]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0F0F1A]/80 border-b border-[#2D2D44]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] bg-clip-text text-transparent">
              KanjiMon
            </Link>
            <span className="text-[#636E72]">/ JLPT N5 Simulation</span>
          </div>
          <Link href="/" className="text-sm text-[#B2BEC3] hover:text-white">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {!examStarted && !examFinished && (
          <>
            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-center"
            >
              <h1 className="text-2xl font-bold text-white mb-2">📝 JLPT N5 Simulation</h1>
              <p className="text-[#636E72]">Simulasi ujian N5 dengan 25 soal</p>
            </motion.div>

            {/* Section Cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {Object.entries(SECTION_INFO).map(([key, info]) => (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => startExam(key)}
                  className="p-6 bg-[#1A1A2E] rounded-xl border border-[#2D2D44] hover:border-[#6C5CE7] transition-all text-center group"
                >
                  <div className="text-4xl mb-3">{info.icon}</div>
                  <h3 className="font-bold text-white mb-1">{info.name}</h3>
                  <p className="text-sm text-[#636E72] mb-2">{info.description}</p>
                  <p className="text-xs text-[#6C5CE7]">{info.duration}</p>
                </motion.button>
              ))}
            </div>

            {/* Full Test */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <button
                onClick={() => startExam()}
                className="px-8 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl text-lg font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#6C5CE7]/30"
              >
                🎯 Start Full N5 Test (25 soal)
              </button>
              <p className="text-xs text-[#636E72] mt-3">Waktu: 30 menit • Skor kelulusan: 80%</p>
            </motion.div>
          </>
        )}

        {/* In Exam */}
        <AnimatePresence>
          {examStarted && !examFinished && currentQ && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Progress Bar */}
              <div className="mb-6 p-4 bg-[#1A1A2E] rounded-xl border border-[#2D2D44]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-bold">Q{currentQuestion + 1}/{filteredQuestions.length}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      currentQ.section === 'moji' ? 'bg-[#E17055]/20 text-[#E17055]' :
                      currentQ.section === 'bunpou' ? 'bg-[#6C5CE7]/20 text-[#6C5CE7]' :
                      'bg-[#00B894]/20 text-[#00B894]'
                    }`}>
                      {SECTION_INFO[currentQ.section as keyof typeof SECTION_INFO].name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-[#636E72]">Answered: {Object.keys(answers).length}/{filteredQuestions.length}</span>
                    <div className={`px-3 py-1 rounded-full font-bold ${timeLeft <= 60 ? 'bg-red-500/20 text-red-400' : 'bg-[#6C5CE7]/20 text-[#6C5CE7]'}`}>
                      ⏱ {formatTime(timeLeft)}
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-[#2D2D44] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#00B894] transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / filteredQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-6 mb-6">
                <p className="text-lg text-white whitespace-pre-line mb-6">{currentQ.question}</p>

                {/* Options */}
                <div className="space-y-3">
                  {currentQ.options.map((option, i) => {
                    const isSelected = answers[currentQ.id] === i;
                    const isCorrect = i === currentQ.correctIndex;
                    const showResult = showExplanation;

                    return (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => !showExplanation && handleAnswer(i)}
                        disabled={showExplanation}
                        className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                          showResult
                            ? isCorrect
                              ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                              : isSelected
                                ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                                : 'bg-[#2D2D44] text-[#636E72]'
                            : isSelected
                              ? 'bg-[#6C5CE7]/30 border-2 border-[#6C5CE7] text-white'
                              : 'bg-[#2D2D44] text-white hover:bg-[#3D3D54] hover:border border-[#3D3D54]'
                        }`}
                      >
                        <span className="mr-3 font-bold">{String.fromCharCode(65 + i)}.</span>
                        {option}
                        {showResult && isCorrect && <span className="ml-2">✓</span>}
                        {showResult && isSelected && !isCorrect && <span className="ml-2">✗</span>}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 rounded-xl"
                  >
                    <h4 className="text-sm font-bold text-[#6C5CE7] mb-2">💡 Explanation</h4>
                    <p className="text-[#B2BEC3]">{currentQ.explanation}</p>
                  </motion.div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowExplanation(false);
                    if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
                  }}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 bg-[#2D2D44] rounded-xl font-medium text-[#B2BEC3] hover:bg-[#3D3D54] transition-colors disabled:opacity-50"
                >
                  ← Previous
                </button>
                <button
                  onClick={nextQuestion}
                  disabled={!showExplanation}
                  className="px-6 py-3 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {currentQuestion < filteredQuestions.length - 1 ? 'Next →' : 'Finish'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {examFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {/* Result Card */}
              <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-8 mb-6">
                <div className="text-6xl mb-4">{scores.passed ? '🎉' : '📚'}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {scores.passed ? 'LULUS! Congratulations!' : 'Belum Lulus'}
                </h2>
                <p className="text-5xl font-bold text-[#6C5CE7] mb-4">{scores.percentage}%</p>
                <p className="text-[#636E72] mb-6">
                  {scores.correct}/{scores.total} questions correct
                </p>

                {/* Section Breakdown */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { key: 'moji' as const, label: 'Moji', icon: '漢' },
                    { key: 'bunpou' as const, label: 'Bunpou', icon: '📖' },
                    { key: 'dokkai' as const, label: 'Dokkai', icon: '📚' },
                  ].map(s => {
                    const sectionScore = scores[s.key];
                    return (
                      <div key={s.key} className="p-3 bg-[#2D2D44] rounded-xl">
                        <div className="text-xl mb-1">{s.icon}</div>
                        <div className="text-lg font-bold text-white">
                          {'correct' in sectionScore ? `${sectionScore.correct}/${sectionScore.total}` : sectionScore}
                        </div>
                        <div className="text-xs text-[#636E72]">{s.label}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Pass/Fail indicator */}
                <div className={`p-4 rounded-xl ${scores.passed ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <p className={scores.passed ? 'text-green-400' : 'text-red-400'}>
                    {scores.passed
                      ? '✨ Skor kamu di atas 80%! Kamu siap untuk N5!'
                      : '📖 Kamu perlu skor 80% untuk lulus. Terus belajar!'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 justify-center">
                <button
                  onClick={resetExam}
                  className="px-6 py-3 bg-[#2D2D44] rounded-xl font-medium text-[#B2BEC3] hover:bg-[#3D3D54] transition-colors"
                >
                  ← Back to Menu
                </button>
                <button
                  onClick={() => startExam()}
                  className="px-6 py-3 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl font-bold text-white hover:opacity-90 transition-opacity"
                >
                  🔄 Try Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}