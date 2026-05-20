'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Question {
  id: number;
  section: 'moji' | 'bunpou' | 'dokkai' | 'seisan' | 'hinshitsu' | 'genka' | 'anzen';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  // Optional bilingual fields for Karier CBT with furigana
  questionJa?: string;     // Japanese text with furigana
  questionId?: string;     // Indonesian translation
  optionsJa?: string[];    // Japanese options
  optionsId?: string[];    // Indonesian options
  explanationJa?: string;  // Japanese explanation
  explanationId?: string;  // Indonesian explanation
}

// Furigana mapping for common business terms
const FURIGANA_MAP: Record<string, string> = {
  "生産管理": "せいさんかんり",
  "作業管理": "さぎょうかんり",
  "工程分析": "こうていぶんせき",
  "稼働分析": "かどうぶんせき",
  "連合作業": "れんごうさぎょう",
  "動作経済": "どうさけいざい",
  "作業域": "さぎょういき",
  "5S活動": "ご・エスかつどう",
  "工程管理": "こうていかんり",
  "緩衝": "かんしょう",
  "見込生産": "みこみせいさん",
  "多種少量生産": "たしゅしょうりょうせいさん",
  "広義": "こうぎ",
  "品質管理": "ひんしつかんり",
  "現品管理": "げんぴんかんり",
  "設備管理": "せつびかんり",
  "設備保全": "せつびほぜん",
  "日常保全": "にちじょうほぜん",
  "重点設備": "じゅうてんせつび",
  "劣化": "れっか",
  "原価管理": "げんかかんり",
  "在庫管理": "ざいこかんり",
  "棚卸": "たなおろし",
  "物流": "ぶつりゅう",
  "物流コスト": "ぶつりゅうこすと",
  "包装": "ほうそう",
  "原価低減": "げんかていげん",
  "製造直接費": "せいぞうちょくせつひ",
  "製造間接費": "せいぞうかんせつひ",
  "安全衛生": "あんぜんえいせい",
  "納期遅延": "のうきちえん",
  "外注": "がいちゅう",
  "労働災害": "ろうどうさいがい",
  "不安全行為": "ふあんぜんこうい",
  "不安全状態": "ふあんぜんじょうたい",
  "四大公害": "よんだいこうがい",
  "水俣病": "みなみびょう",
  "大気汚染": "たいきおせん",
  "排出基準": "はいしゅつきじゅん",
};

// Apply furigana to Japanese text by replacing known terms with ruby markup
function applyFurigana(text: string): string {
  let result = text;
  // Sort by length descending to replace longer terms first
  const terms = Object.keys(FURIGANA_MAP).sort((a, b) => b.length - a.length);
  for (const term of terms) {
    const reading = FURIGANA_MAP[term];
    // Replace each kanji character with ruby markup
    const ruby = reading.split('').map((char, i) => {
      const kanji = term[i] || '';
      return kanji !== char ? `<ruby><rb>${kanji}</rb><rt>${char}</rt></ruby>` : kanji;
    }).join('');
    result = result.replace(new RegExp(term, 'g'), ruby);
  }
  return result;
}

// FuriganaQuestion component renders a question with furigana + Indonesian translation
function FuriganaQuestion({
  q,
  showExplanation,
  answers,
  onAnswer,
}: {
  q: Question;
  showExplanation: boolean;
  answers: Record<number, number>;
  onAnswer: (optionIndex: number) => void;
}) {
  const hasBilingual = !!(q.questionJa && q.questionId);

  if (!hasBilingual) {
    // Fallback: render original question format
    return (
      <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-6 mb-6">
        <p className="text-lg text-white whitespace-pre-line mb-6">{q.question}</p>
        <div className="space-y-3">
          {q.options.map((option, i) => {
            const isSelected = answers[q.id] === i;
            const isCorrect = i === q.correctIndex;
            return (
              <button
                key={i}
                onClick={() => !showExplanation && onAnswer(i)}
                disabled={showExplanation}
                className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                  showExplanation
                    ? isCorrect
                      ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                      : isSelected
                        ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                        : 'bg-[#2D2D44] text-[#636E72]'
                    : isSelected
                      ? 'bg-[#6C5CE7]/30 border-2 border-[#6C5CE7] text-white'
                      : 'bg-[#2D2D44] text-white hover:bg-[#3D3D54] border border-transparent'
                }`}
              >
                <span className="mr-3 font-bold">{String.fromCharCode(65 + i)}.</span>
                {option}
                {showExplanation && isCorrect && <span className="ml-2">✓</span>}
                {showExplanation && isSelected && !isCorrect && <span className="ml-2">✗</span>}
              </button>
            );
          })}
        </div>
        {showExplanation && (
          <div className="mt-6 p-4 bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 rounded-xl">
            <h4 className="text-sm font-bold text-[#6C5CE7] mb-2">💡 Explanation</h4>
            <p className="text-[#B2BEC3]">{q.explanation}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-6 mb-6">
      {/* Question with Furigana */}
      <div className="mb-6">
        <p className="text-lg text-white leading-relaxed mb-2">
          {q.questionJa}
        </p>
        <p className="text-sm text-[#74B9FF] italic" dangerouslySetInnerHTML={{ __html: applyFurigana(q.questionJa!) }} />
        <p className="text-xs text-[#636E72] mt-1">{q.questionId}</p>
      </div>

      {/* Options with furigana + translation */}
      <div className="space-y-3">
        {(q.optionsJa || q.options).map((optionJa, i) => {
          const optionId = q.optionsId?.[i] || '';
          const isSelected = answers[q.id] === i;
          const isCorrect = i === q.correctIndex;

          return (
            <button
              key={i}
              onClick={() => !showExplanation && onAnswer(i)}
              disabled={showExplanation}
              className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                showExplanation
                  ? isCorrect
                    ? 'bg-green-500/20 border-2 border-green-500 text-green-400'
                    : isSelected
                      ? 'bg-red-500/20 border-2 border-red-500 text-red-400'
                      : 'bg-[#2D2D44] text-[#636E72]'
                  : isSelected
                    ? 'bg-[#6C5CE7]/30 border-2 border-[#6C5CE7] text-white'
                    : 'bg-[#2D2D44] text-white hover:bg-[#3D3D54] border border-transparent'
              }`}
            >
              <span className="mr-3 font-bold">{String.fromCharCode(65 + i)}.</span>
              <span className="text-sm">{optionJa}</span>
              {optionId && <span className="text-xs text-[#636E72] block ml-8 mt-0.5">{optionId}</span>}
              {showExplanation && isCorrect && <span className="ml-2">✓</span>}
              {showExplanation && isSelected && !isCorrect && <span className="ml-2">✗</span>}
            </button>
          );
        })}
      </div>

      {/* Explanation with furigana + translation */}
      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 rounded-xl"
        >
          <h4 className="text-sm font-bold text-[#6C5CE7] mb-2">💡 解説 (Pembahasan)</h4>
          <p className="text-[#B2BEC3] text-sm mb-1" dangerouslySetInnerHTML={{ __html: applyFurigana(q.explanationJa || q.explanation) }} />
          {q.explanationId && <p className="text-[#636E72] text-xs mt-2">{q.explanationId}</p>}
        </motion.div>
      )}
    </div>
  );
}

// CBT Karier Bisnis Manufacturing - Source: Google Drive PDF (40 questions)
// Q1-10: 生産管理 | Q11-20: 品質管理 | Q21-30: 原価管理 | Q31-40: 安全衛生・物流
// Format: FULL BILINGUAL - Japanese + Indonesian with furigana
const KARIER_QUESTIONS: Question[] = [
  // Q1-10: 生産管理 (Seisan Kanri - Production Management)
  { 
    id: 1, section: 'seisan',
    question: '問題 1．広義の生産管理に関する管理活動として最も不適切なものは、次のうちどれか。',
    options: ['ア. Manajemen pembelian（こうばいかんり）', 'イ. Manajemen biaya（げんかかんり）', 'ウ. Manajemen sumber daya manusia（じんじかんり）', 'エ. Manajemen peralatan（せつびかんり）'],
    correctIndex: 2, 
    explanation: '広義の生産管理不包括人事管理（じんじかんり）。人事管理属于HR领域，不是直接的生产管理活动。生产管理包括：购买管理、原价管理、设备管理。正确答案：ウ.',
    questionJa: '問題 1．広義の生産管理（こうぎのせいさんかんり）に関する管理活動として最も不適切なものは、次のうちどれか。',
    questionId: 'Manajemen kegiatan terkait manajemen produksi dalam arti luas yang paling tidak tepat adalah?',
    optionsJa: ['ア. 管理購入（こうばいかんり）', 'イ. 管理原价（げんかかんり）', 'ウ. 管理人事（じんじかんり）', 'エ. 管理装備（せつびかんり）'],
    optionsId: ['Manajemen pembelian', 'Manajemen biaya', 'Manajemen SDM', 'Manajemen peralatan'],
    explanationJa: '広義の生産管理（せいさんかんり）は購入管理（こうばいかんり）、原价管理（げんかかんり）、設備管理（せつびかんり）を含みますが、人事管理（じんじかんり）は含みません。人事管理は人力资源管理の分野であり、直接的な生産管理活動ではありません。正确答案：ウ.',
    explanationId: 'Manajemen produksi dalam arti luas (広義の生産管理) mencakup manajemen pembelian (購入管理), manajemen biaya (原价管理), dan manajemen peralatan (設備管理). Tetapi TIDAK mencakup manajemen SDM (人事管理) yang termasuk dalam bidang HR. Jawaban benar: C.'
  },
  { 
    id: 2, section: 'seisan',
    question: '問題 2．作業管理の実施内容に関する記述として最も関連性の低いものは、次のうちどれか。',
    options: ['ア. Mengejar metode kerja yang rasional dan memiliki produktivitas tinggi', 'イ. Merencanakan produksi dan mengendalikan produksi', 'ウ. Menstandarkan metode kerja dan menetapkan waktu standar', 'エ. Menyusun prosedur operasi dan panduan kerja'],
    correctIndex: 0, 
    explanation: '作業管理の核心是追求合理、高效的作业方法（提高生产率）。而生产计划的制定属于生产管理（生産管理）的范畴，而非作业管理的核心内容。イ是正确的作业管理内容。正确答案：ア.',
    questionJa: '問題 2．作業管理（さぎょうかんり）の実施内容に関する記述として最も関連性の低いものは、次のうちどれか。',
    questionId: 'Berikut ini adalah pernyataan tentang konten implementasi manajemen作业 (作業管理) yang paling kurang relevan?',
    optionsJa: ['ア. 合理的で生産性の高い作業方法を追求する', 'イ. 生産を計画し、管理する', 'ウ. 作業方法を標準化し、标准時間を設定する', 'エ. 作業手順書と作業指南书を作成する'],
    optionsId: ['Mengejar metode kerja yang rasional dan produktif tinggi', 'Merencanakan dan mengendalikan produksi', 'Menstandarkan metode kerja dan menetapkan waktu standar', 'Menyusun prosedur operasi dan panduan kerja'],
    explanationJa: '作業管理（さぎょうかんり）の核心は合理的で効率的な作業方法（生産性向上）を追求することです。生産計画（せいさんけいかく）の策定は生産管理（せいさんかんり）の范畴であり、作業管理の核心内容ではありません。正确答案：ア.',
    explanationId: 'Inti dari manajemen作业 (作業管理) adalah mengejar metode kerja yang rasional dan efisien untuk meningkatkan produktivitas. Penyusunan rencana produksi (生産計画) termasuk dalam ranah manajemen produksi (生産管理), bukan konten inti dari manajemen作业. Jawaban benar: A.'
  },
  { 
    id: 3, section: 'seisan',
    question: '問題 3．改善を目的とした工程分析に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. Dalam analisis proses kerja operator, pemeriksaan permukaan yang kotor oleh pekerja dinilai sebagai pemeriksaan kualitas.', 'イ. Dalam analisis proses produk, dapat dilakukan perbaikan untuk mengurangi transportasi atau penumpukan, tetapi tidak dapat mengurangi proses pengerjaan atau pemeriksaan.', 'ウ. Dalam analisis proses produk, penggantian cetakan mesin press dinilai sebagai proses pengerjaan.', 'エ. Saat melakukan analisis proses transportasi, jika indeks aktivitas tinggi, ubah cara penempatan barang untuk menurunkan indeks tersebut.'],
    correctIndex: 0, 
    explanation: '在工序分析中，如果发现不必要的加工或检查工序，可以进行改善或消除。活性示数高表示效率好，降低它不是改善方向。金型交换是准备活动而非加工。正确答案：ア.',
    questionJa: '問題 3．改善を目的とした工程分析（かいぜんをも 목적으로にした こうていぶんせき）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang analisis proses (工程分析) yang bertujuan untuk perbaikan yang paling tepat adalah?',
    optionsJa: ['ア. 作業者の工程分析において、作業者が汚れた表面を検査することは品質検査とみなされる。', 'イ. 製品の工程分析では、运输や堆積の改善はできるが、加工作業や検査作業の削減はできない。', 'ウ. 製品の工程分析において、金型交換は加工作業とみなされる。', 'エ. 运输工程分析において、活性示数が高い場合、物の置き方を変えてそれだけを下げる。'],
    optionsId: ['Dalam analisis proses kerja operator, pemeriksaan permukaan yang kotor oleh pekerja dinilai sebagai pemeriksaan kualitas.', 'Dalam analisis proses produk, dapat dilakukan perbaikan untuk mengurangi transportasi/tumpukan, tetapi tidak dapat mengurangi proses pengerjaan/pemeriksaan.', 'Dalam analisis proses produk, penggantian cetakan mesin press dinilai sebagai proses pengerjaan.', 'Saat analisis proses transportasi, jika indeks aktivitas tinggi, ubah cara penempatan barang untuk menurunkannya.'],
    explanationJa: '工程分析（こうていぶんせき）において、不必要な加工作業や検査作業を発見した場合は、改善や解消ができます。活性示数が高い場合は効率がよいことを意味し、それを下げるのは改善の方向ではありません。金型交換は準備活動（準備作業）であり、加工作業ではありません。正确答案：ア.',
    explanationId: 'Dalam analisis proses (工程分析), jika menemukan proses pengerjaan atau pemeriksaan yang tidak perlu, dapat dilakukan perbaikan atau eliminasi. Indeks aktivitas yang tinggi menunjukkan efisiensi yang baik, dan menurunkannya bukan arah perbaikan. Penggantian cetakan (金型交換) adalah kegiatan persiapan (準備活動), bukan pekerjaan pemrosesan. Jawaban benar: A.'
  },
  { 
    id: 4, section: 'seisan',
    question: '問題 4．稼働分析に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. Analisis aktivitas bertujuan untuk menganalisis bahan baku, komponen, dan produk setengah jadi dalam proses, kemudian menganalisis isi dan waktu pemrosesan untuk merancang sistem kerja yang lebih efisien.', 'イ. Analisis aktivitas dengan metode observasi berkelanjutan tidak hanya digunakan untuk memperbaiki sistem kerja, tetapi juga untuk menentukan tingkat kelonggaran saat menetapkan waktu standar.', 'ウ. Metode pengambilan sampel kerja (work sampling) membantu mengurangi beban analisis dari metode observasi berkelanjutan, dan dapat dilakukan tanpa survei pendahuluan.', 'エ. Saat menganalisis pekerjaan yang bersifat siklik dengan metode work sampling, pengamatan harus dilakukan pada interval waktu yang sama dengan siklus kerja.'],
    correctIndex: 1, 
    explanation: '稼働分析的对象是操作员或机器的状态（作业中、待机中、休息中、故障中等）。连续观测法（連続観測法）不仅用于改善工作系统，还用于确定设定标准时间时的宽裕率。正确答案：イ.',
    questionJa: '問題 4．稼働分析（かどうぶんせき）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang analisis aktivitas (稼働分析) yang paling tepat adalah?',
    optionsJa: ['ア. 稼働分析は、工程内の原材料、部品、半製品を分析し、 содержимоеと加工時間を分析して、より効率的な作業システムを設計することを目的とする。', 'イ. 連続観測法による稼働分析は、作業システムの改善だけでなく、标准時間を設定する際の緩慢率を決定するためにも使用される。', 'ウ. ワークサンプリング法は、連続観測法の分析負担を軽減し事前の調査なしで行える。', 'エ. ワークサンプリング法で作業性の高い作業を分析する場合、観察は作業サイクルと同じ間隔で行わなければならない。'],
    optionsId: ['Analisis aktivitas bertujuan menganalisis bahan baku, komponen, dan produk setengah jadi dalam proses, kemudian menganalisis isi dan waktu pemrosesan untuk merancang sistem kerja yang lebih efisien.', 'Analisis aktivitas dengan metode observasi berkelanjutan tidak hanya untuk memperbaiki sistem kerja, tetapi juga untuk menentukan tingkat kelonggaran saat menetapkan waktu standar.', 'Metode work sampling membantu mengurangi beban analisis dari metode observasi berkelanjutan, dan dapat dilakukan tanpa survei pendahuluan.', 'Saat menganalisis pekerjaan siklik dengan work sampling, pengamatan harus dilakukan pada interval waktu yang sama dengan siklus kerja.'],
    explanationJa: '稼働分析（かどうぶんせき）の对象は Operator や機械の状態（作業中、待机中、休息中、故障中等）です。連続観測法（れんぞくかんそくほう）は作業システムの改善だけでなく、标准時間を設定する際の緩慢率（かんまんりつ）を決定するためにも使用されます。正确答案：イ.',
    explanationId: 'Objek analisis aktivitas (稼働分析) adalah status operator atau mesin (sedang bekerja, standby, istirahat, rusak, dll). Metode observasi berkelanjutan (連続観測法) digunakan tidak hanya untuk meningkatkan sistem kerja, tetapi juga untuk menentukan tingkat kelonggaran (緩慢率) saat menetapkan waktu standar. Jawaban benar: B.'
  },
  { 
    id: 5, section: 'seisan',
    question: '問題 5．連合作業分析に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. Ketika satu pekerja mengoperasikan satu mesin, untuk meningkatkan efisiensi kerja, sebaiknya menggunakan analisis aktivitas, bukan analisis kerja gabungan.', 'イ. Dalam diagram orang–mesin (man–machine chart) yang digunakan untuk analisis kerja gabungan, tidak perlu mencatat pekerjaan individu atau operasi otomatis mesin, hanya bagian pekerjaan yang dilakukan bersama.', 'ウ. Ketika beberapa pekerja bekerja secara paralel dan bersamaan pada satu objek yang sama, untuk memperbaiki pekerjaan sebaiknya menggunakan analisis kerja gabungan daripada metode PTS.', 'エ. Saat meninjau jumlah mesin yang dapat dioperasikan secara bersamaan oleh satu pekerja, dalam analisis kerja gabungan tidak perlu mencatat waktu mesin menganggur, hanya waktu kerja pekerja.'],
    correctIndex: 2, 
    explanation: '当多名作业人员并行同时在一个对象上工作时，应使用联合作业分析（連合作業分析）而非PTS法。PTS法适用于个别作业，联合作业分析可以掌握等待、协调、不同步的时间。正确答案：ウ.',
    questionJa: '問題 5．連合作業分析（れんごうさぎょうぶんせき）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang analisis kerja gabungan (連合作業分析) yang paling tepat adalah?',
    optionsJa: ['ア. 1人の作業者が1台の機械を操作する場合、効率を上げるために連合作業分析ではなく、稼働分析を使用するべきである。', 'イ. 連合作業分析に使用される人間関係機械図（マン・マシン・チャート）では、個人作業や機械の自動操作は記録せず、一緒に 수행される作業部分のみを記録する。', 'ウ. 複数の作業者が同一の对象に並行して同時に作業する場合、作業を改善するためにPTS法ではなく連合作業分析を使用するべきである。', 'エ. 1人の作業者が同時に操作できる機械数を検討する場合、連合作業分析では機械の游休時間は記録せず、作業者の作業時間のみを記録する。'],
    optionsId: ['Ketika satu pekerja mengoperasikan satu mesin, untuk meningkatkan efisiensi kerja, sebaiknya gunakan analisis aktivitas, bukan analisis kerja gabungan.', 'Dalam diagram orang-mesin (man-machine chart) yang digunakan untuk analisis kerja gabungan, tidak perlu mencatat pekerjaan individu atau operasi otomatis mesin, hanya bagian pekerjaan yang dilakukan bersama.', 'Ketika beberapa pekerja bekerja secara paralel dan bersamaan pada satu objek yang sama, untuk memperbaiki pekerjaan sebaiknya gunakan analisis kerja gabungan daripada metode PTS.', 'Saat meninjau jumlah mesin yang dapat dioperasikan secara bersamaan oleh satu pekerja, dalam analisis kerja gabungan tidak perlu mencatat waktu mesin menganggur, hanya waktu kerja pekerja.'],
    explanationJa: '複数の作業者が並行して同一の对象に同時に作業する場合、連合作業分析（れんごうさぎょうぶんせき）を使用すべきです。PTS法（ PTSほう）は個別作業に適用され、連合作業分析は待機時間、协调時間、同期はずれ時間を把握できます。正确答案：ウ.',
    explanationId: 'Ketika beberapa pekerja bekerja secara paralel dan bersamaan pada objek yang sama, sebaiknya gunakan analisis kerja gabungan (連合作業分析). Metode PTS适用于个别作业, analisis kerja gabungan dapat memahami waktu tunggu, koordinasi, dan waktu tidak sinkron. Jawaban benar: C.'
  },
  { 
    id: 6, section: 'seisan',
    question: '問題 6．動作経済の原則に関する分類項目として最も不適切なものは、次のうちどれか。',
    options: ['ア. Klasifikasi yang berkaitan dengan penggunaan tubuh', 'イ. Klasifikasi yang berkaitan dengan desain alat dan peralatan', 'ウ. Klasifikasi yang berkaitan dengan penanganan bahan', 'エ. Klasifikasi yang berkaitan dengan area kerja（さぎょういかんれんぶ）'],
    correctIndex: 2, 
    explanation: '動作経済的原则分为3大类：①身体的使用分类、②工具和设备的设计分类、③作業域的分类。材料处理（材料的取り扱い）不属于主要分类。正确答案：ウ.',
    questionJa: '問題 6．動作経済（どうさけいざい）の原則に関する分類項目として最も不適切なものは、次のうちどれか。',
    questionId: 'Kategori klasifikasi prinsip ekonomi gerakan (動作経済の原則) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 身体の使用に関する分類', 'イ. 工具や機器の設計に関する分類', 'ウ. 材料の取り扱いに関する分類', 'エ. 作業域（さぎょういき）に関する分類'],
    optionsId: ['Klasifikasi yang berkaitan dengan penggunaan tubuh', 'Klasifikasi yang berkaitan dengan desain alat dan peralatan', 'Klasifikasi yang berkaitan dengan penanganan bahan', 'Klasifikasi yang berkaitan dengan area kerja (作業域)'],
    explanationJa: '動作経済（どうさけいざい）の原則は3つの大きな分類に分けられます：①身体の使用に関する分類、②工具や機器の設計に関する分類、③作業域（さぎょういき）の分類。材料的取り扱い（ざいりょうてのhandling）は主な分類には属しません。正确答案：ウ.',
    explanationId: 'Prinsip ekonomi gerakan (動作経済の原則) dibagi menjadi 3 klasifikasi utama: (1) klasifikasi yang berkaitan dengan penggunaan tubuh, (2) klasifikasi yang berkaitan dengan desain alat dan peralatan, (3) klasifikasi yang berkaitan dengan area kerja (作業域). Penanganan bahan (材料的取り扱い) tidak termasuk dalam klasifikasi utama. Jawaban benar: C.'
  },
  { 
    id: 7, section: 'seisan',
    question: '問題 7．5S活動に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Barang-barang yang tidak diperlukan akan dibuang sesuai dengan peraturan yang telah ditetapkan.', 'イ. Menampilkan secara visual aturan yang harus dipatuhi dan menyebarkan informasi tersebut kepada semua orang.', 'ウ. Melakukan penyortiran, penataan, dan pembiasaan akan secara otomatis menciptakan tempat kerja yang bersih.', 'エ. Pada rak penyimpanan komponen harus ditulis dengan jelas nama barang yang disimpan dan penanggung jawabnya.'],
    correctIndex: 2, 
    explanation: '5S的顺序是：整理→整顿→清扫→清洁→躾。清洁（清掃）是5S中的第三步，是独立的步骤，而不是仅通过整理、整顿、躾就能自动实现。跳过清扫步骤是不正确的。正确答案：ウ.',
    questionJa: '問題 7．5S活動（ご・エスかつどう）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang aktivitas 5S (5S活動) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 不要なものは定められた規則に従って捨てる。', 'イ. 守るべき規則を視覚的に表示し所有人都に情報を伝える。', 'ウ. 整理、整顿、習慣化を行えば自動的にクリーンな職場が创设される。', 'エ. 部品保管棚には保管品名と責任者を明記する。'],
    optionsId: ['Barang-barang yang tidak diperlukan akan dibuang sesuai dengan peraturan yang telah ditetapkan.', 'Menampilkan secara visual aturan yang harus dipatuhi dan menyebarkan informasi tersebut kepada semua orang.', 'Melakukan penyortiran, penataan, dan pembiasaan akan secara otomatis menciptakan tempat kerja yang bersih.', 'Pada rak penyimpanan komponen harus ditulis dengan jelas nama barang yang disimpan dan penanggung jawabnya.'],
    explanationJa: '5Sの顺序は：整理（せいり）→整顿（せいとん）→清掃（せいそう）→清潔（せいけつ）→躾（しつけ）です。清掃（せいそう）は5Sの第三ステップであり、獨立したステップです。整理、整顿、躾だけでは自動的に実現されるものではありません。清掃ステップをスキップするのは不適切です。正确答案：ウ.',
    explanationId: 'Urutan 5S adalah: Seiri (整理) → Seiton (整顿) → Seiso (清掃) → Seiketsu (清潔) → Shitsuke (躾). Pembersihan (清掃/Seiso) adalah langkah ketiga dalam 5S dan merupakan langkah independen, bukan sesuatu yang akan terjadi secara otomatis hanya dengan Seiri, Seiton, dan Shitsuke. Melewati langkah pembersihan tidak tepat. Jawaban benar: C.'
  },
  { 
    id: 8, section: 'seisan',
    question: '問題 8．工程管理における緩衝に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Ketika ada proses bottleneck dalam lini produksi, menempatkan persediaan barang setengah jadi di semua tahap produksi dapat meningkatkan kapasitas produksi seluruh lini.', 'イ. Jenis langkah penyangga terdiri dari tiga bentuk: barang (persediaan), kapasitas (tenaga kerja/mesin), dan waktu.', 'ウ. Diperlukan persediaan pengaman untuk menjaga rencana produksi jika bahan baku terlambat dikirim.', 'エ. Untuk menghindari kerugian waktu produksi akibat faktor yang sulit diprediksi, digunakan persediaan barang dalam proses.'],
    correctIndex: 0, 
    explanation: '即使在生产线某处出现瓶颈工序，在所有工序间放置半成品库存也不能提高整个生产线的生产能力。缓冲应仅在瓶颈工序前放置，防止生产线停工，而非在所有工序放置。正确答案：ア.',
    questionJa: '問題 8．工程管理（こうていかんり）における緩衝（かんしょう）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang buffer (緩衝) dalam manajemen proses (工程管理) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 生産ラインのある工程にボトルネックがある場合、すべての工程間に半製品在庫を置くことでライン全体の生産能力を高めることができる。', 'イ. 緩衝の種類は、品目（在庫）、容量（作業者/機械）、時間の3つの形式がある。', 'ウ. 原材料の納期遅延があっても生産計画を維持するために安全在庫が必要である。', 'エ. 予測困難な要因による生産時間损失を避けるために、工程内在庫が使用される。'],
    optionsId: ['Ketika ada proses bottleneck dalam lini produksi, menempatkan persediaan barang setengah jadi di semua tahap produksi dapat meningkatkan kapasitas produksi seluruh lini.', 'Jenis langkah penyangga terdiri dari tiga bentuk: barang (persediaan), kapasitas (tenaga kerja/mesin), dan waktu.', 'Diperlukan persediaan pengaman untuk menjaga rencana produksi jika bahan baku terlambat dikirim.', 'Untuk menghindari kerugian waktu produksi akibat faktor yang sulit diprediksi, digunakan persediaan barang dalam proses.'],
    explanationJa: '生産ラインのある工程にボトルネックがあっても、すべての工程間に半製品在庫を置いてもライン全体の生産能力を高めることはできません。緩衝はボトルネック工程の前にのみ置き、ラインの停止を防ぐためのものであり、すべての工程に置く必要はありません。正确答案：ア.',
    explanationId: '即使在生产线某处出现瓶颈工序，在所有工序间放置半成品库存也不能提高整个生产线的生产能力。缓冲（緩衝）应仅在瓶颈工序前放置，防止生产线停工，而非在所有工序放置。正确答案：ア.'
  },
  { 
    id: 9, section: 'seisan',
    question: '問題 9．見込生産に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. Merupakan bentuk produksi yang didasarkan pada pesanan dari pelanggan tertentu.', 'イ. Karena pelanggan yang menentukan spesifikasi produk utama, maka spesifikasi belum ditetapkan sampai pesanan diterima.', 'ウ. Pihak produsen memperkirakan permintaan pasar sendiri dan mengirimkan produk ke pasar berdasarkan perkiraan tersebut.', 'エ. Untuk menanggapi fluktuasi pesanan, dilakukan penyesuaian melalui kapasitas produksi.'],
    correctIndex: 2, 
    explanation: '見込生産（見込生産）的特点是：厂商自行预测市场需求，并根据预测将产品投放市场。是订单生产的反面。正确答案：ウ.',
    questionJa: '問題 9．見込生産（みこみせいさん）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang produksi berdasarkan perkiraan (見込生産) yang paling tepat adalah?',
    optionsJa: ['ア. 特定の顧客からの注文に基づく生産形態である。', 'イ. 主要な製品の仕様は顧客が確定するため、受注を受けるまで仕様は確定しない。', 'ウ. 生産者が市場の需要を自ら予測し、その予測に基づいて製品を 시장에 출시한다。', 'エ. 注文の変動に対応するために、容量生産能力 통해調整が行われる。'],
    optionsId: ['Merupakan bentuk produksi yang didasarkan pada pesanan dari pelanggan tertentu.', 'Karena pelanggan yang menentukan spesifikasi produk utama, maka spesifikasi belum ditetapkan sampai pesanan diterima.', 'Pihak produsen memperkirakan permintaan pasar sendiri dan mengirimkan produk ke pasar berdasarkan perkiraan tersebut.', 'Untuk menanggapi fluktuasi pesanan, dilakukan penyesuaian melalui kapasitas produksi.'],
    explanationJa: '見込生産（みこみせいさん）の特徴は：生産者が市場の需要を自ら予測し、その予測に基づいて製品を市場に送り出すことです。注文生産の反対概念です。正确答案：ウ.',
    explanationId: 'Ciri-ciri produksi berdasarkan perkiraan (見込生産) adalah: produsen sendiri memprediksi permintaan pasar dan mengirimkan produk ke pasar berdasarkan prediksi tersebut. Merupakan kebalikan dari produksi berdasarkan pesanan. Jawaban benar: C.'
  },
  { 
    id: 10, section: 'seisan',
    question: '問題 10．多種少量生産に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. Cocok untuk produksi lini, dengan tujuan menghasilkan produk dengan produktivitas tinggi dan biaya rendah.', 'イ. Merupakan bentuk produksi satu kali setiap kali ada pesanan tertentu.', 'ウ. Bentuk produksi bergantian berbagai jenis produk, dengan total output dihitung per jenis produk.', 'エ. Karena proses produksi dari bahan dan komponen hingga produk jadi sangat beragam, maka setiap produk memiliki proses produksi yang berbeda, menyebabkan tahapan produksi saling tumpang tindih dan menjadi kompleks.'],
    correctIndex: 3, 
    explanation: '多种少量生産（多種少量生産）的特点：因产品种类多，每种产品的工序各不相同，工序间相互重叠变得复杂。与少种多量生产、个别生产不同。正确答案：エ.',
    questionJa: '問題 10．多種少量生産（たしゅしょうりょうせいさん）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang produksi multi-varietas volume kecil (多種少量生産) yang paling tepat adalah?',
    optionsJa: ['ア. 生产lineに向いており、生産性が高くコストの低い製品生産することを目的とする。', 'イ. 特定の注文があるたびに一度だけの生産形態である。', 'ウ. 様々な製品が交替しながら生産され、各製品の合計产出が計算される生産形態である。', 'エ. 原材料や部品から完成品までの生産プロセスが非常に多様で、製品ごとに生産プロセスが異なり、工程が相互に重なり合って複雑になる。'],
    optionsId: ['Cocok untuk produksi lini, dengan tujuan menghasilkan produk dengan produktivitas tinggi dan biaya rendah.', 'Merupakan bentuk produksi satu kali setiap kali ada pesanan tertentu.', 'Bentuk produksi bergantian berbagai jenis produk, dengan total output dihitung per jenis produk.', 'Karena proses produksi dari bahan dan komponen hingga produk jadi sangat beragam, maka setiap produk memiliki proses produksi yang berbeda, menyebabkan tahapan produksi saling tumpang tindih dan menjadi kompleks.'],
    explanationJa: '多種少量生産（たしゅしょうりょうせいさん）の特徴は：製品種類が多いため、各製品の工程が異なり、工程が相互に重なり合って複雑になります。少種多量生産や個別生産とは異なります。正确答案：エ.',
    explanationId: 'Ciri-ciri produksi multi-varietas volume kecil (多種少量生産) adalah: karena banyak jenis produk, setiap produk memiliki proses produksi yang berbeda, dan proses saling tumpang tindih sehingga menjadi kompleks. Berbeda dengan produksi sedikit varietas volume besar atau produksi个别. Jawaban benar: D.'
  },
  // Q11-20: 品質管理 (Hinshitsu Kanri - Quality Management)
  { 
    id: 11, section: 'hinshitsu',
    question: '問題 11．＜工数と日程に関する記述＞と＜語句＞の組合せとして最も適切なものは、次のうちどれか。',
    options: ['ア. A:1 B:4 C:5 D:7', 'イ. A:2 B:3 C:6 D:7', 'ウ. A:2 B:3 C:5 D:8', 'エ. A:1 B:4 C:6 D:8'],
    correctIndex: 0, 
    explanation: 'A=余力管理(1)→调整产能与负荷的管理; B=バックワード法(4)→基于交货期制定日程的方法; C=有限山積法(5)→基于作业时间表分配负荷的方法; D=ディスパッチング法(7)→单件生产中的排程方法. 正确答案：ア (A-1, B-4, C-5, D-7).',
    questionJa: '問題 11．＜工数と日程（こうすうと にちてい）に関する記述＞と＜語句＞の組合せとして最も適切なものは、次のうちどれか。',
    questionId: 'Kombinasi yang paling tepat antara＜statement tentang工数 dan日程＞dan＜istilah＞adalah?',
    optionsJa: ['ア. A:1 B:4 C:5 D:7', 'イ. A:2 B:3 C:6 D:7', 'ウ. A:2 B:3 C:5 D:8', 'エ. A:1 B:4 C:6 D:8'],
    optionsId: ['A:1 B:4 C:5 D:7', 'A:2 B:3 C:6 D:7', 'A:2 B:3 C:5 D:8', 'A:1 B:4 C:6 D:8'],
    explanationJa: 'A=余力管理（よりょくかんり）(1)→能力と負荷の調整管理; B=バックワード法（バックワードほう）(4)→納期に基づいて日程を立てる方法; C=有限山積法（ゆうげんやま積みほう）(5)→作業時間表に基づいて負荷を配分する方法; D=ディスパッチング法（ディスパッチングほう）(7)→单个生産におけるスケジューリング方法。正确答案：ア (A-1, B-4, C-5, D-7).',
    explanationId: 'A=Manajemen kapasitas cadangan (余力管理/よりょくかんり) (1) → manajemen penyesuaian kapasitas dan beban; B=Metode backward (バックワード法) (4) → metode penjadwalan berdasarkan tanggal pengiriman; C=Metode堆积 terbatas (有限山積法) (5) → metode distribusi beban berdasarkan jadwal kerja; D=Metode dispatching (ディスパッチング法) (7) → metode penjadwalan dalam produksi tunggal. Jawaban benar: A (A-1, B-4, C-5, D-7).'
  },
  { 
    id: 12, section: 'hinshitsu',
    question: '問題 12．生産統制の管理業務と生産計画との関係性に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. 现品管理与材料计划、运输管理相关。', 'イ. 进度管理涉及根据中等日程计划展开物资计划和外包计划。', 'ウ. 余力管理与小日程计划的作业开始日期控制相关。', 'エ. 作业分配与工数计划的修正相关。'],
    correctIndex: 0, 
    explanation: '現品管理是管理实际物品如材料、零部件及生产中运输和分配的活动。因此它与材料计划和运输管理密切相关。正确答案：ア.',
    questionJa: '問題 12．生産統制（せいさんとうせい）の管理業務と生産計画（せいさんけいかく）との関係性に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang hubungan antara kegiatan manajemen controle produksi (生産統制) dan rencana produksi (生産計画) yang paling tepat adalah?',
    optionsJa: ['ア. 現品管理（げんぴんかんり）は材料計画（ 材料けいかく）や輸送管理（ゆそうかんり）与相关。', 'イ. 進捗管理（しんちょくかんり）は中期日程計画に基づいて材料計画や外包計画を展開する。与相关。', 'ウ. 余力管理（よりょくかんり）は小日程計画の作業開始日制御与相关。', 'エ. 作業配分（さぎょうはいぶん）は工数計画の修正と相关。'],
    optionsId: ['現品管理与材料计划、运输管理相关。', '进度管理涉及根据中等日程计划展开物资计划和外包计划。', '余力管理与小日程计划的作业开始日期控制相关。', '作业分配与工数计划的修正相关。'],
    explanationJa: '現品管理（げんぴんかんり）は実際の品物、材料、部品及び生産过程中的輸送や分配的活動を管理することです。だから材料計画（ 材料けいかく）や輸送管理（ゆそうかんり）と密接に関連しています。正确答案：ア.',
    explanationId: 'Manajemen barang nyata (現品管理/げんぴんかんり) mengelola aktivitas seperti material, komponen, dan transportasi serta distribusi dalam proses produksi. Oleh karena itu, ini sangat berkaitan erat dengan perencanaan material (材料計画) dan manajemen transportasi (輸送管理). Jawaban benar: A.'
  },
  { 
    id: 13, section: 'hinshitsu',
    question: '問題 13．以下に示す作業分配に関する記述において、（）に当てはまる＜語句＞の組合せとして最も適切なものは？',
    options: ['ア. A:8 B:4 C:6 D:2', 'イ. A:2 B:3 C:5 D:8', 'ウ. A:8 B:4 C:6 D:2', 'エ. A:1 B:4 C:5 D:7'],
    correctIndex: 2, 
    explanation: '正确的组合是A-8(順序づけ法), B-4(バックワード法), C-6(無限山積法), D-2(工数計画)。这是关于作业分配与术语组合的匹配题。正确答案：ウ (A-8, B-4, C-6, D-2).',
    questionJa: '問題 13．以下に示す作業配分（さぎょうはいぶん）に関する記述において、（）に当てはまる＜語句＞の組合せとして最も適切なものは？',
    questionId: 'Dalam pernyataan tentang分配作業 (作業配分) berikut ini, kombinasi＜istilah＞yang paling tepat untuk mengisi（）adalah?',
    optionsJa: ['ア. A:8 B:4 C:6 D:2', 'イ. A:2 B:3 C:5 D:8', 'ウ. A:8 B:4 C:6 D:2', 'エ. A:1 B:4 C:5 D:7'],
    optionsId: ['A:8 B:4 C:6 D:2', 'A:2 B:3 C:5 D:8', 'A:8 B:4 C:6 D:2', 'A:1 B:4 C:5 D:7'],
    explanationJa: '正しい組合せはA-8（順序づけ法）、B-4（バックワード法）、C-6（無限山積法）、D-2（工数計画）です。これは作業配分と用語の組合せに関する匹配問題です。正确答案：ウ（A-8, B-4, C-6, D-2）。',
    explanationId: 'Kombinasi yang benar adalah A-8 (順序づけ法/metode pengurutan), B-4 (バックワード法/metode backward), C-6 (無限山積法/metode堆积 tak terbatas), D-2 (工数計画/rencana jam kerja). Ini adalah soal pencocokan tentang作业配분 dan terminologi. Jawaban benar: C (A-8, B-4, C-6, D-2).'
  },
  { 
    id: 14, section: 'hinshitsu',
    question: '問題 14．現品管理に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Dalam proses penanganan atau penyimpanan barang fisik, perlu berupaya mencegah kerusakan atau penurunan kualitas barang.', 'イ. Persiapan produksi dilakukan untuk memeriksa perbedaan jumlah antara barang fisik aktual dan jumlah yang tercatat dalam pembukuan.', 'ウ. Untuk memudahkan pemeriksaan jumlah barang, sebaiknya menggunakan wadah standar, menetapkan cara pengemasan standar, dan menyeragamkan cara penempatan saat penyimpanan sementara.', 'エ. Untuk bahan baku dan produk setengah jadi, perlu ditetapkan secara jelas lokasi dan metode penyimpanan.'],
    correctIndex: 1, 
    explanation: '現品管理活动中，制备准备（製作手配）是执行生产计划的活动。核查实际物品与账簿差异的活动是盘点（棚卸），而非制备准备。イ的描述混淆了两者。正确答案：イ.',
    questionJa: '問題 14．現品管理（げんぴんかんり）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang manajemen barang nyata (現品管理) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 実際の品物の取り扱いや保管において、物品の破損や品質低下を防止するように努める必要がある。', 'イ. 製作手配（せいさくてはい）は、実際の物品数量と帳簿記載数量との差異を核查するために行われる。', 'ウ. 物品数量の検査を容易にするため、標準コンテナを使用し、標準包装方式を設定し、一時保管時の配置方法を統一する。', 'エ. 原材料と半製品について、保管場所と保管方法を明確に定める必要がある。'],
    optionsId: ['Dalam proses penanganan atau penyimpanan barang fisik, perlu berupaya mencegah kerusakan atau penurunan kualitas barang.', 'Persiapan produksi dilakukan untuk memeriksa perbedaan jumlah antara barang fisik aktual dan jumlah yang tercatat dalam pembukuan.', 'Untuk memudahkan pemeriksaan jumlah barang, sebaiknya gunakan wadah standar, tetapkan cara pengemasan standar, dan seragamkan cara penempatan saat penyimpanan sementara.', 'Untuk bahan baku dan produk setengah jadi, perlu ditetapkan secara jelas lokasi dan metode penyimpanan.'],
    explanationJa: '現品管理（げんぴんかんり）の活動において、製作手配（せいさくてはい）は生産計画を実行する活動です。実際の物品と帳簿の差異を核查する活動は棚卸（たなおろし）であり、製作手配ではありません。イの記述は両者を混同しています。正确答案：イ.',
    explanationId: 'Dalam kegiatan manajemen barang nyata (現品管理), persiapan produksi (製作手配/せいさくてはい) adalah aktivitas untuk menjalankan rencana produksi. Aktivitas untuk memeriksa perbedaan antara barang nyata dan catatan buku adalah inventory count (棚卸/たなおろし), bukan persiapan produksi. Pernyataan B mencampuradukkan keduanya. Jawaban benar: B.'
  },
  { 
    id: 15, section: 'hinshitsu',
    question: '問題 15．設備管理の機能に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Pengelolaan jadwal proyek konstruksi membantu dalam pengendalian anggaran peralatan.', 'イ. Perancangan peralatan yang dilakukan berdasarkan rencana peralatan membantu dalam penyusunan anggaran peralatan.', 'ウ. Perencanaan pemeliharaan membantu dalam penyusunan anggaran pemeliharaan.', 'エ. Penetapan standar kerja membantu dalam penyusunan anggaran pemeliharaan.'],
    correctIndex: 3, 
    explanation: '设备管理功能包括：建设进度管理→设备预算管理；设备设计→设备预算编制；维护计划→维护预算编制。而作业标准制定主要用于质量管理和作业指导，与维护预算编制无直接关系。正确答案：エ.',
    questionJa: '問題 15．設備管理（せつびかんり）の機能に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang fungsi manajemen peralatan (設備管理) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 建設工事工程管理（けんせつこうじこうていかんり）は設備予算管理（せつびよさんかんり）に役立つ。', 'イ. 設備計画（せつびけいかく）に基づいて行われる設備設計（せつびせっけい）は設備予算算出（せつびよさんさんしゅつ）に役立つ。', 'ウ. 維持管理計画（じほかんりけいかく）は維持予算算出（じほよさんさんしゅつ）に役立つ。', 'エ. 作業標準設定（さぎょうひょうじゅんせってい）は維持予算算出（じほよさんさんしゅつ）に役立つ。'],
    optionsId: ['Pengelolaan jadwal proyek konstruksi membantu dalam pengendalian anggaran peralatan.', 'Perancangan peralatan yang dilakukan berdasarkan rencana peralatan membantu dalam penyusunan anggaran peralatan.', 'Perencanaan pemeliharaan membantu dalam penyusunan anggaran pemeliharaan.', 'Penetapan standar kerja membantu dalam penyusunan anggaran pemeliharaan.'],
    explanationJa: '設備管理（せつびかんり）の機能には：建設工程管理→設備予算管理；設備設計→設備予算編成；維持計画→維持予算編成が含まれます。作業標準設定（さぎょうひょうじゅんせってい）は主に品質管理和作業指導に使用され、維持予算編成とは直接の関係がありません。正确答案：エ.',
    explanationId: 'Fungsi manajemen peralatan (設備管理) termasuk: manajemen jadwal konstruksi → manajemen anggaran peralatan; desain peralatan → penyusunan anggaran peralatan; rencana pemeliharaan → penyusunan anggaran pemeliharaan. Penetapan standar kerja (作業標準設定) terutama digunakan untuk manajemen kualitas dan panduan kerja, tidak memiliki hubungan langsung dengan penyusunan anggaran pemeliharaan. Jawaban benar: D.'
  },
  { 
    id: 16, section: 'hinshitsu',
    question: '問題 16．設備保全の目的に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Tujuan pemeliharaan peralatan mencakup kesejahteraan karyawan.', 'イ. Tujuan pemeliharaan peralatan mencakup memastikan keselamatan.', 'ウ. Tujuan pemeliharaan peralatan mencakup menjaga kualitas produk.', 'エ. Tujuan pemeliharaan peralatan mencakup langkah-langkah penghematan energi.'],
    correctIndex: 0, 
    explanation: '设备维护的目的包括：确保安全、保证产品质量、节能降耗。员工福祉属于人力资源管理范畴，不是设备维护的直接目的。正确答案：ア.',
    questionJa: '問題 16．設備保全（せつびほぜん）の目的に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang tujuan pemeliharaan peralatan (設備保全) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 設備保全の目的には従業員福祉（じゅうろうねんふく）が含まれる。', 'イ. 設備保全の目的には安全確保（あんぜんかくほ）が含まれる。', 'ウ. 設備保全の目的には製品品質保証（せいひんひんしつほしょう）が含まれる。', 'エ. 設備保全の目的には省エネ对策（しょうえねたいさく）が含まれる。'],
    optionsId: ['Tujuan pemeliharaan peralatan mencakup kesejahteraan karyawan.', 'Tujuan pemeliharaan peralatan mencakup memastikan keselamatan.', 'Tujuan pemeliharaan peralatan mencakup menjaga kualitas produk.', 'Tujuan pemeliharaan peralatan mencakup langkah-langkah penghematan energi.'],
    explanationJa: '設備保全（せつびほぜん）の目的には：安全確保、产品品質保証、省エネルギー低減が含まれます。従業員福祉（じゅうろうねんふく）は人力资源管理（じんり資源かんり）の範畴に属し、設備保全の直接的な目的ではありません。正确答案：ア.',
    explanationId: 'Tujuan pemeliharaan peralatan (設備保全) meliputi: memastikan keselamatan, menjamin kualitas produk, dan penghematan energi. Kesejahteraan karyawan (従業員福祉) termasuk dalam ranah manajemen sumber daya manusia, bukan tujuan langsung dari pemeliharaan peralatan. Jawaban benar: A.'
  },
  { 
    id: 17, section: 'hinshitsu',
    question: '問題 17．日常保全に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Ketika ditemukan tanda-tanda abnormal pada peralatan, harus segera melaporkannya ke bagian pemeliharaan sesuai dengan peraturan dan standar operasi.', 'イ. Pemeriksaan menggunakan palu inspeksi untuk mendeteksi suara tidak normal merupakan salah satu kegiatan pemeriksaan harian.', 'ウ. Penggantian komponen dilakukan bila diperlukan, misalnya saat pergantian proses produksi atau ketika komponen mengalami keausan.', 'エ. Prinsipnya, pemeriksaan rinci dan perbaikan peralatan dilakukan oleh operator yang mengoperasikan mesin tersebut.'],
    correctIndex: 3, 
    explanation: '日常保全中，详细检查和设备修理原则上应由专职维修部门进行，而非由操作该机器的操作员进行。当发现设备异常时，应按规程向维修部门报告。エ的表述不正确。正确答案：エ.',
    questionJa: '問題 17．日常保全（にちじょうほぜん）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang pemeliharaan harian (日常保全) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 設備に異常の兆候が見つかった場合は、规程に従って速やかに維持部門に報告する必要がある。', 'イ. 检查用ハンマーを使用して異常な音を検出することは、日常検査活動の一つである。', 'ウ. 部品の交換は、必要に応じて行われる。例えば、生産工程の切り替え時やすりへり合った場合。', 'エ. 原則として、詳細な検査と設備修理は 해당機械を操作する作業者が行う。'],
    optionsId: ['Ketika ditemukan tanda-tanda abnormal pada peralatan, harus segera melaporkannya ke bagian pemeliharaan sesuai dengan peraturan dan standar operasi.', 'Pemeriksaan menggunakan palu inspeksi untuk mendeteksi suara tidak normal merupakan salah satu kegiatan pemeriksaan harian.', 'Penggantian komponen dilakukan bila diperlukan, misalnya saat pergantian proses produksi atau ketika komponen mengalami keausan.', 'Prinsipnya, pemeriksaan rinci dan perbaikan peralatan dilakukan oleh operator yang mengoperasikan mesin tersebut.'],
    explanationJa: '日常保全（にちじょうほぜん）では、詳細な検査と設備修理は原則的に專門の維持部門が行い該当機械を操作する作業者ではありません。設備に異常が見つかった場合は、规程に従って維持部門に報告する必要があります。エの記述は不適切です。正确答案：エ.',
    explanationId: 'Dalam pemeliharaan harian (日常保全), pemeriksaan rinci dan perbaikan peralatan pada prinsipnya dilakukan oleh departemen pemeliharaan khusus, bukan oleh operator yang mengoperasikan mesin tersebut. Ketika ditemukan abnormalitas pada peralatan, harus dilaporkan ke departemen pemeliharaan sesuai aturan. Pernyataan D tidak tepat. Jawaban benar: D.'
  },
  { 
    id: 18, section: 'hinshitsu',
    question: '問題 18．生産設備の劣化によって生じる損失に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. Biaya transportasi akan meningkat.', 'イ. Output produksi akan menurun.', 'ウ. Rasio konsumsi bahan baku menjadi lebih buruk (meningkat).', 'エ. Kualitas produk akan menurun.'],
    correctIndex: 0, 
    explanation: '生产设备劣化不会直接导致运输费用增加。运输费用与物流活动相关，与设备状态无直接关系。设备劣化会导致：产量下降、原材料消耗率恶化、产品质量下降。正确答案：ア.',
    questionJa: '問題 18．生産設備（せいさんせつび）の劣化（れっか）によって生じる損失（そんしつ）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang kerugian yang disebabkan oleh deteriorasi peralatan produksi (生産設備の劣化) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 輸送費（ゆそうひ）が増加する。', 'イ. 生産輸出（せいさんかすい）が低下する。', 'ウ. 原材料消費率（げんりょうしょうひりつ）が悪化する（増加する）。', 'エ. 製品品質（せいひんひんしつ）が低下する。'],
    optionsId: ['Biaya transportasi akan meningkat.', 'Output produksi akan menurun.', 'Rasio konsumsi bahan baku menjadi lebih buruk (meningkat).', 'Kualitas produk akan menurun.'],
    explanationJa: '生産設備（せいさんせつび）の劣化（れっか）は直接的に輸送費（ゆそうひ）の増加をもたらしません。輸送費は物流活動と関連しており、設備状態とは直接の関係がありません。設備劣化会导致：生産出力低下、原材料消費率悪化和製品品質低下。正确答案：ア.',
    explanationId: 'Deteriorasi peralatan produksi (生産設備の劣化) tidak secara langsung menyebabkan peningkatan biaya transportasi (輸送費). Biaya transportasi berkaitan dengan aktivitas logistik, tidak memiliki hubungan langsung dengan kondisi peralatan. Deteriorasi peralatan menyebabkan: penurunan output produksi, memburuknya rasio konsumsi bahan baku, dan penurunan kualitas produk. Jawaban benar: A.'
  },
  { 
    id: 19, section: 'hinshitsu',
    question: '問題 19．設備保全における重点設備（じゅうてんせつび）の選定対象となる設備として最も不適切なものは、次のうちどれか。',
    options: ['ア. 进入磨损故障期的设备（接近使用寿命末期）', 'イ. 用于生产重要产品的设备', 'ウ. 没有备用产能的设备', 'エ. 损坏时会导致成本大幅增加的设备'],
    correctIndex: 0, 
    explanation: '已进入磨损故障期的设备意味着接近使用寿命末期。此时应进行更换或大修，而非作为维护重点。维护对此类设备效果低且不经济。正确答案：ア.',
    questionJa: '問題 19．設備保全（せつびほぜん）における重点設備（じゅうてんせつび）の選定対象となる設備として最も不適切なものは、次のうちどれか。',
    questionId: 'Peralatan yang paling tidak tepat sebagai target seleksi重点設備 (重点設備) dalam pemeliharaan peralatan (設備保全) adalah?',
    optionsJa: ['ア. 摩耗故障期間（まもうこしょうきかん）已进入の設備（使用寿命末期に近づいている）', 'イ. 重要な 제품을生産するための設備', 'ウ. 予備容量（よびようりょう）のない設備', 'エ. 損傷時に生产成本が大幅に増加する設備'],
    optionsId: ['Peralatan yang已进入 masa kerusakan akibat keausan (dekat akhir umur pakai)', 'Peralatan yang digunakan untuk memproduksi produk penting', 'Peralatan yang tidak memiliki kapasitas cadangan produksi', 'Peralatan yang, jika rusak, akan menyebabkan peningkatan besar pada biaya produksi'],
    explanationJa: '已进入摩耗故障期間（まもうこしょうきかん）の設備は使用寿命末期に近づいています。此时应进行更换或大修，而非作为維持重点。維持对此类设备效果低且不経済。正确答案：ア.',
    explanationId: 'Peralatan yang已进入 masa kerusakan akibat keausan (摩耗故障期間) berarti mendekati akhir umur pakai. Pada saat ini harus dilakukan penggantian atau perbaikan besar, bukan dijadikan重点維持対象. Pemeliharaan terhadap peralatan jenis ini efeknya rendah dan tidak ekonomis. Jawaban benar: A.'
  },
  { 
    id: 20, section: 'hinshitsu',
    question: '問題 20．資材管理における＜分類＞と＜対象資材＞との組合せとして最も適切なものは？',
    options: ['ア. 常備材料・非常備材料 (管理面)', 'イ. 直接材料・間接材料 (使用目的)', 'ウ. 有材・無材 (形態)', 'エ. 原材料・完成品 (状態)'],
    correctIndex: 1, 
    explanation: '资材管理的分类：管理面分类→常备材料/非常备材料；使用目的分类→直接材料/间接材料；形态分类→有材/无材；状态分类→原材料/在制品/完成品。正确答案：イ (直接材料・間接材料 = 使用目的).',
    questionJa: '問題 20．資材管理（しつかんり）における＜分類（ぶんるい）＞と＜対象資材（たいしょうしざい）＞との組合せとして最も適切なものは？',
    questionId: 'Kombinasi yang paling tepat antara＜klasifikasi (分類)＞dan＜material target (対象資材)＞dalam manajemen material (資材管理)?',
    optionsJa: ['ア. 常備材料・非常備材料（じょうびざいりょう・ひじょうびざいりょう）(管理面）', 'イ. 直接材料・間接材料（ちょくせつざいりょう・かんせつざいりょう）(使用目的）', 'ウ. 有材・無材（ゆうざい・むざい）(形態）', 'エ. 原材料・完成品（げん材料・かんせいひん）(状態）'],
    optionsId: ['常備材料・非常備材料 (管理面)', '直接材料・間接材料 (使用目的)', '有材・無材 (形態)', '原材料・完成品 (状態)'],
    explanationJa: '資材管理（しつかんり）の分類：管理面分類→常備材料/非常備材料；使用目的分類→直接材料/間接材料；形態分類→有材/無材；状態分類→原材料/仕掛品/完成品。正确答案：イ（直接材料・間接材料＝使用目的）。',
    explanationId: 'Klasifikasi manajemen material (資材管理): berdasarkan aspek manajemen →常備材料/非常備材料; berdasarkan tujuan penggunaan →直接材料/間接材料; berdasarkan bentuk →有材/無材; berdasarkan kondisi →原材料/仕掛品/完成品. Jawaban benar: B (直接材料・間接材料 = 使用目的).'
  },
  // Q21-30: 原価管理 (Genka Kanri - Cost Management)
  { 
    id: 21, section: 'genka',
    question: '問題 21．在庫管理（ざいこかんり）に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. Tujuan dari manajemen persediaan adalah meningkatkan profitabilitas dengan mengurangi jumlah persediaan, meskipun hal itu dapat menyebabkan kekurangan stok atau keterlambatan pengiriman.', 'イ. Dalam metode pemesanan berkala, jumlah pesanan dihitung dengan:', 'ウ. Untuk barang penting bernilai tinggi seperti motor, metode pemesanan dengan jumlah tetap adalah yang paling sesuai.', 'エ. Dalam metode pemesanan dengan jumlah tetap, perlu dilakukan pemantauan jumlah persediaan serta penyesuaian terhadap stok pengaman dan titik pemesanan bila diperlukan.'],
    correctIndex: 3, 
    explanation: '定量订货方式（定量発注法）需要监控库存水平，必要时调整安全库存和订货点。定期订货法的公式是：订货量=最高库存-现有库存+订货间隔期间的平均需求量。正确答案：エ.',
    questionJa: '問題 21．在庫管理（ざいこかんり）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang manajemen persediaan (在庫管理) yang paling tepat adalah?',
    optionsJa: ['ア. 在庫管理の狙いは、在庫数量を減少させて収益性を向上させることであり、それにより在庫切れや納期遅延が発生する可能性がある。', 'イ. 定期発注法（ていきはっちゅうほう）では、発注数量を次のように計算する：', 'ウ. モーターのような重要な高价品に対して、定量発注法（ていたいはっちゅうほう）が最も 적합である。', 'エ. 定量発注法では、在庫数量の監視を行い、必要に応じて安全在庫や発注点の調整を行う必要がある。'],
    optionsId: ['Tujuan dari manajemen persediaan adalah meningkatkan profitabilitas dengan mengurangi jumlah persediaan, meskipun hal itu dapat menyebabkan kekurangan stok atau keterlambatan pengiriman.', 'Dalam metode pemesanan berkala, jumlah pesanan dihitung dengan:', 'Untuk barang penting bernilai tinggi seperti motor, metode pemesanan dengan jumlah tetap adalah yang paling sesuai.', 'Dalam metode pemesanan dengan jumlah tetap, perlu dilakukan pemantauan jumlah persediaan serta penyesuaian terhadap stok pengaman dan titik pemesanan bila diperlukan.'],
    explanationJa: '定量発注法（ていたいはっちゅうほう）では、在庫水準の監視を行い、必要に応じて安全在庫（あんぜんざいこ）や発注点（はっちゅうてん）の調整が必要です。定期発注法（ていきはっちゅうほう）の公式は：発注数量＝最高在庫－現在在庫＋発注間隔期間の平均需要量です。正确答案：エ.',
    explanationId: 'Dalam metode pemesanan dengan jumlah tetap (定量発注法), perlu dilakukan pemantauan tingkat persediaan dan penyesuaian terhadap安全在庫 (stok pengaman) dan発注点 (titik pemesanan) bila diperlukan. Rumus metode pemesanan berkala (定期発注法) adalah: jumlah pesanan =最高在庫 - 現在在庫 + rata-rata permintaan selama interval pemesanan. Jawaban benar: D.'
  },
  { 
    id: 22, section: 'genka',
    question: '問題 22．棚卸（たなおろし）に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. 定期盘点（定期棚卸）是为了年度或季度财务报表而进行的。', 'イ. 在实物上应贴上货架标签、物品标签和盘点卡。', 'ウ. 经常盘点（常時棚卸）需要停止仓库全部作业。', 'エ. 进行盘点时，需要标准化工作程序和管理方式以保证准确性。'],
    correctIndex: 2, 
    explanation: '定期盘点是为了年度或季度财务报表而进行的，需要停止仓库全部作业。而经常盘点是在日常工作中随时进行盘点，不需要停止全部活动。正确答案：ウ.',
    questionJa: '問題 22．棚卸（たなおろし）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang inventory count (棚卸) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 定期棚卸（ていきたなおろし）は年度または四半期財務報告のために行われる。', 'イ. 実際の物品には棚札（たなふだ）、現品札（げんぴんふだ）、棚卸カード（たなおろしかーど）を貼る必要がある。', 'ウ. 常時棚卸（じょうじたなおろし）は倉庫のすべての作業を停止して行われる。', 'エ. 棚卸を行う際、正確性を保証するために作業手順と管理方法を標準化する必要がある。'],
    optionsId: ['定期盘点是为了年度或季度财务报表而进行的。', '在实物上应贴上货架标签、物品标签和盘点卡。', '经常盘点需要停止仓库全部作业。', '进行盘点时，需要标准化工作程序和管理方式以保证准确性。'],
    explanationJa: '定期棚卸（ていきたなおろし）は年度または四半期財務報告のために行われるため、倉庫のすべての作業を停止する必要があります。常時棚卸（じょうじたなおろし）は日常業務の中で随時行われるものであり、すべての活動を停止する必要はありません。正确答案：ウ.',
    explanationId: 'Inventory count berkala (定期棚卸) dilakukan untuk laporan keuangan tahunan atau kuartalan, sehingga perlu menghentikan semua aktivitas gudang. Inventory count terus-menerus (常時棚卸) dilakukan kapan saja dalam pekerjaan sehari-hari, tidak perlu menghentikan semua aktivitas. Jawaban benar: C.'
  },
  { 
    id: 23, section: 'genka',
    question: '問題 23．物流コストにおける機能別分類に関する費用項目として最も不適切なものは、次のうちどれか。',
    options: ['ア. 运输费（ゆそうひ）', 'イ. 包装费（ほうそうひ）', 'ウ. 流通加工费（りゅうつうかこうひ）', 'エ. 销售运输费（うりあげうんちん）'],
    correctIndex: 3, 
    explanation: '物流成本的功能分类包括：运输费、保管费、包装费、流通加工费、装卸费、物流信息管理费。销售运输费属于销售费用，不属于物流成本的功能分类。正确答案：エ.',
    questionJa: '問題 23．物流コスト（ぶつりゅうこすと）における機能別分類（きのうべつぶんるい）に関する費用項目（ひようこうもく）として最も不適切なものは、次のうちどれか。',
    questionId: 'Item biaya yang paling tidak tepat untuk klasifikasi berdasarkan fungsi dalam biaya logistik (物流コスト) adalah?',
    optionsJa: ['ア. 輸送費（ゆそうひ）', 'イ. 包装費（ほうそうひ）', 'ウ. 流通加工費（りゅうつうかこうひ）', 'エ. 売上輸送費（うりあげゆそうひ）'],
    optionsId: ['Biaya transportasi (运输费)', 'Biaya pengemasan (包装费)', 'Biaya加工流通 (流通加工费)', 'Biaya transportasi penjualan (销售运输费)'],
    explanationJa: '物流コスト（ぶつりゅうこすと）の機能別分類には：輸送費、保管費、包装費、流通加工費、荷役費、物流情報管理費含まれます。売上輸送費（うりあげゆそうひ）は販売費用（はんばいひよう）に属し、物流コストの機能別分類には属しません。正确答案：エ.',
    explanationId: 'Klasifikasi berdasarkan fungsi dalam biaya logistik (物流コスト) meliputi: biaya transportasi (輸送費), biaya penyimpanan, biaya pengemasan (包装費), biaya加工流通 (流通加工費), biaya bongkar muat, dan biaya manajemen informasi logistik. Biaya transportasi penjualan (売上輸送費) termasuk dalam biaya penjualan (販売費用), tidak termasuk dalam klasifikasi fungsi biaya logistik. Jawaban benar: D.'
  },
  { 
    id: 24, section: 'genka',
    question: '問題 24．倉庫内のロケーション管理（ろけーしょんかんり）に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. 固定位置管理中，物品按顺序存放在空出的可用位置。', 'イ. 自由位置管理中，物品与位置没有固定关系，因此无法高效利用存储空间。', 'ウ. 为提高拣货工作效率而放置在拣货区域的库存称为主动型库存（アクティブ型）。', 'エ. 当存在主动型和备用型库存时，不需要区分它们的放置位置。'],
    correctIndex: 2, 
    explanation: '主动型库存（アクティブ型在庫）是放置在拣货区域的库存，用于提高拣货工作效率。正确答案：ウ.',
    questionJa: '問題 24．倉庫内（そうこなえ）のロケーション管理（ろけーしょんかんり）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang manajemen lokasi (ロケーション管理) di dalam gudang yang paling tepat adalah?',
    optionsJa: ['ア. 固定ロケーション管理では、品目を空いた使用可能な場所に順番に保管する。', 'イ. フリーロケーション管理では、品目と場所に固定された関係がないため、保管空間を効率的に利用できない。', 'ウ. 、ピッキング作業の効率を上げるためにピッキングエリアに配置された在庫をアクティブ型（アクティブがた）と呼ぶ。', 'エ. アクティブ型とバックアップ型の在庫が存在する場合，它们的配置位置を区別する必要はない。'],
    optionsId: ['Dalam固定位置管理 (固定ロケーション), barang disimpan secara berurutan di tempat kosong yang tersedia.', 'Dalam自由位置管理 (フリーロケーション), karena tidak ada hubungan tetap antara barang dan lokasi, ruang penyimpanan tidak dapat digunakan secara efisien.', 'Persediaan yang ditempatkan di area picking untuk meningkatkan efisiensi kerja picking называется актив型 (アクティブ型).', 'Ketika terdapat persediaan тип aktip dan cadangan, tidak perlu区分 tempat penempatannya.'],
    explanationJa: 'アクティブ型在庫（アクティブがたざいこ）は、ピッキングエリアに配置された在庫であり、ピッキング作業の効率を上げるために使用されます。正确答案：ウ.',
    explanationId: 'Persediaan tipe aktif (アクティブ型在庫/アクティブがたざいこ) adalah persediaan yang ditempatkan di area picking untuk meningkatkan efisiensi pekerjaan picking. Jawaban benar: C.'
  },
  { 
    id: 25, section: 'genka',
    question: '問題 25．包装（ほうそう）に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. 按形状分类，包装分为三种：个体包装、内包装、外包装。', 'イ. 内包装是位于商品外包装内部的包装。', 'ウ. 按目的分类，包装分为工业包装和商业包装。', 'エ. 用于运输货物的包装是以销售为目的的商业包装。'],
    correctIndex: 3, 
    explanation: '按目的分类，包装分为工业包装和商业包装。工业包装用于运输和保护产品，商业包装用于销售。发货运送用的包装属于工业包装，而非商业包装。正确答案：エ.',
    questionJa: '問題 25．包装（ほうそう）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang pengemasan (包装) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 形状による分類では、包装は個装（かくそう）、内装（ないそう）、外装（がいそう）の3種類に分類される。', 'イ. 内装（ないそう）は商品の外装内部に位置する包装である。', 'ウ. 目的による分類では、包装は工業包装（こうぎょうほうそう）と商業包装（しょうぎょうほうそう）に分類される。', 'エ. 貨物輸送用の包装は販売目的の商業包装（しょうぎょうほうそう）である。'],
    optionsId: ['Menurut klasifikasi berdasarkan bentuk, kemasan terbagi menjadi tiga: pengemasan individual (個装), pengemasan dalam (内装), dan pengemasan luar (外装).', 'Pengemasan dalam (内装) adalah kemasan yang berada di dalam kemasan luar barang.', 'Menurut klasifikasi berdasarkan tujuan, kemasan terbagi menjadi pengemasan industri (工業包装) dan pengemasan komersial (商業包装).', 'Kemasan untuk pengiriman barang adalah pengemasan komersial yang bertujuan untuk penjualan.'],
    explanationJa: '目的による分類では、包装は工業包装（こうぎょうほうそう）と商業包装（しょうぎょうほうそう）に分類されます。工業包装は輸送と製品の保護に使用され、商業包装は販売に使用されます。貨物輸送用包装は工業包装に属し、商業包装ではありません。正确答案：エ.',
    explanationId: 'Menurut klasifikasi berdasarkan tujuan, kemasan terbagi menjadi pengemasan industri (工業包装) dan pengemasan komersial (商業包装). Pengemasan industri digunakan untuk transportasi dan perlindungan produk, sedangkan pengemasan komersial digunakan untuk penjualan. Kemasan untuk pengiriman barang termasuk dalam pengemasan industri, bukan pengemasan komersial. Jawaban benar: D.'
  },
  { 
    id: 26, section: 'genka',
    question: '問題 26．品質と品質特性（ひんしつとくとくせい）に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. 品质特性应尽可能定量表示。', 'イ. 真正的特性是顾客想要的品质特性，代用特性是在无法直接测量真正特性时的替代特性。', 'ウ. 品质必须在整个产品生命周期中保持。', 'エ. 安全性是品质特性之一。'],
    correctIndex: 0, 
    explanation: '品质特性应尽可能定量（定量化）表示，而非仅定性表示。定性表示不符合品质管理原则。正确答案：ア.',
    questionJa: '問題 26．品質と品質特性（ひんしつとくとくせい）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang kualitas dan karakteristik kualitas (品質と品質特性) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 品質特性はできるだけ定性的に表す必要がある。', 'イ. 真の特性（しんのとくせい）は顧客が望む品質特性であり、代用特性（だいようとくせい）は真の特性を直接測定できない場合の代替特性である。', 'ウ. 品質は製品の全ライフサイクルを通じて維持されなければならない。', 'エ. 安全性（あんぜんせい）は品質特性の一つである。'],
    optionsId: ['Karakteristik kualitas sebaiknya dinyatakan secara kualitatif sebanyak mungkin.', '真の特性 adalah karakteristik kualitas yang diinginkan pelanggan, 代用特性 adalah karakteristik pengganti ketika真の特性 tidak dapat diukur langsung.', 'Kualitas harus dijaga sepanjang seluruh siklus hidup produk.', 'Keamanan adalah salah satu karakteristik kualitas.'],
    explanationJa: '品質特性（ひんしつとくせい）はできるだけ定量的に（ていりょうてきに）表す必要があり、定性的な表示だけでは品質管理原則に反します。真正的特性（しんのとくせい）は顧客が望む品質特性であり、代用特性（だいようとくせい）は真の特性を直接測定できない場合の代替特性です。正确答案：ア.',
    explanationId: 'Karakteristik kualitas sebaiknya dinyatakan secara kuantitatif (定量的に) sebanyak mungkin, bukan hanya secara kualitatif. Pernyataan kualitatif saja tidak sesuai dengan prinsip manajemen kualitas. 真の特性 (shin no tokusei) adalah karakteristik kualitas yang diinginkan pelanggan, sedangkan 代用特性 (daiyou tokusei) adalah karakteristik pengganti ketika 真の特性 tidak dapat diukur langsung. Jawaban benar: A.'
  },
  { 
    id: 27, section: 'genka',
    question: '問題 27．品質改善（ひんしつかいぜん）に関する記述において、（）に当てはまる語句の組合せとして最も適切なものは？',
    options: ['ア. ①:カタヨリ ②:16.0 ③:3.0 ④:A', 'イ. ①:バラツキ ②:16.0 ③:3.0 ④:A', 'ウ. ①:カタヨリ ②:16.0 ③:3.0 ④:B', 'エ. ①:バラツキ ②:16.0 ③:3.0 ④:B'],
    correctIndex: 3, 
    explanation: '①数据总是存在偏差（バラツキ）；②标准偏差4.0→方差16.0；③方差9.0→标准偏差3.0；④两个工程均值相同(50.0)，A的SD=4.0，B的SD=3.0，B更稳定。正确答案：エ (①:バラツキ, ②:16.0, ③:3.0, ④:B).',
    questionJa: '問題 27．品質改善（ひんしつかいぜん）に関する記述において、（）に当てはまる語句の組合せとして最も適切なものは？',
    questionId: 'Dalam pernyataan tentang perbaikan kualitas (品質改善), kombinasi istilah yang paling tepat untuk mengisi () adalah?',
    optionsJa: ['ア. ①:カタヨリ ②:16.0 ③:3.0 ④:A', 'イ. ①:バラツキ ②:16.0 ③:3.0 ④:A', 'ウ. ①:カタヨリ ②:16.0 ③:3.0 ④:B', 'エ. ①:バラツキ ②:16.0 ③:3.0 ④:B'],
    optionsId: ['①:カタヨリ ②:16.0 ③:3.0 ④:A', '①:バラツキ ②:16.0 ③:3.0 ④:A', '①:カタヨリ ②:16.0 ③:3.0 ④:B', '①:バラツキ ②:16.0 ③:3.0 ④:B'],
    explanationJa: '①データには常にバラツキがある；②標準偏差4.0→分散16.0；③分散9.0→標準偏差3.0；④二つの工程の平均値は同じ(50.0)で、AのSD=4.0、BのSD=3.0、Bの方が安定している。正确答案：エ (①:バラツキ, ②:16.0, ③:3.0, ④:B).',
    explanationId: '①数据 всегда существует отклонение (バラツキ); ② стандартное отклонение 4.0 → дисперсия 16.0; ③ дисперсия 9.0 → стандартное отклонение 3.0; ④ оба процесса имеют одинаковое среднее (50.0), но A SD=4.0, B SD=3.0, поэтому B более стабилен. Jawaban benar: E (①:バラツキ, ②:16.0, ③:3.0, ④:B).'
  },
  { 
    id: 28, section: 'hinshitsu',
    question: '問題 28．検査の考え方（けんさのかんがえかた）に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. 外包接受检查的原则是进行全数检查。', 'イ. 当产品价格低廉且允许一定比例的不良品混入时使用抽样检查。', 'ウ. 将实际合格的批次判定为不合格的错误是生产者危险。', 'エ. 全数检查并不能保证所有产品都是合格品。'],
    correctIndex: 0, 
    explanation: '外包接受检查并非原则上是全数检查。应根据物品的重要性和成本选择全数检查或抽样检查。全数检查并非基本原则。正确答案：ア.',
    questionJa: '問題 28．検査の考え方（けんさのかんがえかた）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang konsep inspeksi (検査の考え方) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 外注接受検査（がいいちうけinspection）の原則は全数検査（ぜんすうけんさ）である。', 'イ. 製品価格が安く一定割合の不良品混入が許される場合、抜取検査（ぬわりけんさ）が使用される。', 'ウ. 実際の合格ロットを不合格と判定する错误は生産者危険（せいさんしゃきけん）である。', 'エ. 全数検査を行ってもすべての製品が合格品である保证はない。'],
    optionsId: ['Prinsip pemeriksaan penerimaan外包 adalah pemeriksaan penuh (全数検査).', 'Pemeriksaan sampling (抜取検査) digunakan ketika harga produk rendah dan混入一定比例 defect diperbolehkan.', 'Kesalahan menilai batch yang sebenarnya合格 sebagai tidak合格 adalah生产者危険 (risiko produsen).', 'Pemeriksaan penuh tidak menjamin semua produk adalah produk qualified.'],
    explanationJa: '外注接受検査（がいいちうけinspection）は原則的に全数検査（ぜんすうけんさ）ではありません。物品の重要性とコストに応じて全数検査または抜取検査（ぬわりけんさ）を選択する必要があります。全数検査は基本原則ではありません。正确答案：ア.',
    explanationId: 'Pemeriksaan penerimaan外包 (いいちうけinspection) bukan prinsipnya pemeriksaan penuh (全数検査). Harus memilih pemeriksaan penuh atau pemeriksaan sampling (抜取検査) sesuai dengan kepentingan dan biaya item. Pemeriksaan penuh buka prinsip dasar. Jawaban benar: A.'
  },
  { 
    id: 29, section: 'hinshitsu',
    question: '問題 29．品質保証（ひんしつほしょう）に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. ISO9001是国际标准，JIS没有对应标准。', 'イ. 根据PL法，即使没有过失也可以要求损害赔偿（无过失责任）。', 'ウ. 品质保证活动中，品质管理可以全部委托给生产部门。', 'エ. 可追溯性是指产品有问题时，公布并回收、修理产品的活动。'],
    correctIndex: 1, 
    explanation: 'ISO 9001是国际标准，日本发布了同等版本JIS Q 9001。根据PL法（制造物责任法），消费者无需证明过失即可要求损害赔偿（无过失责任）。正确答案：イ.',
    questionJa: '問題 29．品質保証（ひんしつほしょう）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang penjaminan kualitas (品質保証) yang paling tepat adalah?',
    optionsJa: ['ア. ISO9001は国際標準であり、JISには対応規格がない。', 'イ. PL法（PLほう）では、過失がなくても損害賠償を請求できる（無過失責任）。', 'ウ. 品質保証活動では、品質管理をすべて生産部門に委託できる。', 'エ. トレーサビリティ（トレーサビリティ）は產品に問題があった場合、公布して回収、修理する活動である。'],
    optionsId: ['ISO9001 adalah standar internasional, JIS tidak memiliki standar yang sesuai.', 'Menurut PL法 (Hukum Tanggung Jawab Produk), bahkan tanpa kesalahan dapat meminta ganti rugi (tanggung jawab tanpa kesalahan).', 'Dalam kegiatan penjaminan kualitas, manajemen kualitas dapat sepenuhnya dipercayakan kepada departemen produksi.', 'Tracerabilidade adalah aktivitas mempublikasikan, mengumpulkan, dan memperbaiki produk ketika ada masalah.'],
    explanationJa: 'ISO 9001は国際標準であり、日本は同等バージョンJIS Q 9001发布了。根据PL法（製造物責任法），消費者は過失を証明なくても損害賠償を請求できます（無過失責任）。正确答案：イ.',
    explanationId: 'ISO 9001 adalah standar internasional, Jepang telah menerbitkan versi yang setara JIS Q 9001. Menurut PL法 (Hukum Tanggung Jawab Produk/製造物責任法), konsumen dapat meminta ganti rugi tanpa membuktikan kesalahan (tanggung jawab tanpa kesalahan/無過失責任). Jawaban benar: B.'
  },
  { 
    id: 30, section: 'genka',
    question: '問題 30．コストコントロールの内容（こすとコントロールのないよう）に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. 成本控制是降低目标成本的活动。', 'イ. 成本降低是降低标准成本的活动。', 'ウ. 成本控制是将实际成本降至标准成本的活动。', 'エ. 成本控制是在设计阶段将估算成本降至目标成本的活动。'],
    correctIndex: 2, 
    explanation: '成本控制（コストコントロール）是将实际成本降至标准成本的活动。成本降低（原価低減）是在设计阶段降低目标成本的活动，两者概念不同。正确答案：ウ.',
    questionJa: '問題 30．コストコントロールの内容（こすとコントロールのないよう）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang konten kontrol biaya (コストコントロールの内容) yang paling tepat adalah?',
    optionsJa: ['ア. コストコントロールは目標原価を引き下げる活動である。', 'イ. 原価低減（げんかていげん）は標準原価を引き下げる活動である。', 'ウ. コストコントロールは実際原価を標準原価に一致させる活動である。', 'エ. コストコントロールは設計段階で見積原価を目標原価に引き下げる活動である。'],
    optionsId: ['Kontrol biaya adalah aktivitas menurunkan biaya target.', 'Penurunan biaya adalah aktivitas menurunkan biaya standar.', 'Kontrol biaya adalah aktivitas menyesuaikan biaya aktual dengan biaya standar.', 'Kontrol biaya adalah aktivitas menurunkan biaya estimasi ke biaya target pada tahap desain.'],
    explanationJa: 'コストコントロールは実際原価を標準原価に一致させる活動です。原価低減（げんかていげん）は設計段階で目標原価を下げる活動であり、两者の概念は異なります。正确答案：ウ.',
    explanationId: 'Kontrol biaya (コストコントロール) adalah aktivitas menyesuaikan biaya aktual dengan biaya standar. Penurunan biaya (原価低減/げんかていげん) adalah aktivitas menurunkan biaya target pada tahap desain, keduanya adalah konsep yang berbeda. Jawaban benar: C.'
  },
  // Q31-40: 安全衛生・物流 (Anzen Eisei / Safety & Logistics)
  { 
    id: 31, section: 'anzen',
    question: '問題 31．原価（げんか）に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. 现行成本是基于现有技术估算的成本。', 'イ. 沉没成本被认为是选择替代方案时，被抛弃的替代方案所丧失的最大利益。', 'ウ. 标准成本是在标准操业度下，使用标准方法、标准能率和标准成本率计算的成本。', 'エ. 部分成本是根据计算目的，仅汇总特定成本要素的成本。'],
    correctIndex: 1, 
    explanation: '选项I描述的是机会费用的定义（选择替代方案时丧失的最大利益），而非沉没成本的定义。沉没成本是已发生且无法收回的费用。正确答案：イ.',
    questionJa: '問題 31．原価（げんか）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang biaya (原価) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 现行原価（げんこうげんか）は現在の技術に基づいて估算された成本である。', 'イ. 埋没原価（まいぼつげんか）は、代替案を選択する際に、捨てられた代替案が失った最大利益であるとされている。', 'ウ. 標準原価（ひょうじゅんげんか）は、標準操業度下で、標準方法、標準能率、標準原価率を使用して計算された成本である。', 'エ. 部分原価（ぶぶんげんか）は、計算目的のために、特定の原価要素のみを集計した成本である。'],
    optionsId: ['Biaya saat ini adalah biaya yang diestimasi berdasarkan teknologi yang ada.', 'Biaya tersembunyi (埋没原価) dianggap sebagai manfaat maksimum yang hilang dari alternatif yang ditinggalkan ketika memilih alternatif lain.', 'Biaya standar adalah biaya yang dihitung menggunakan metode standar, tingkat efisiensi standar, dan tarif biaya standar dalam kondisi operasi standar.', 'Biaya parsial adalah biaya yang hanya mengumpulkan elemen biaya tertentu sesuai dengan tujuan perhitungan.'],
    explanationJa: '選択肢イは機会費用（けいかひよう）の定義（代替案を選択する際に失う最大利益）を描述しており、埋没原価（まいぼつげんか）の定義ではありません。埋没原価は既に発生し取り戻せない費用です。正确答案：イ.',
    explanationId: 'Pilihan B menjelaskan definisi biaya peluang (機会費用/けいかひよう) - yaitu manfaat maksimum yang hilang ketika memilih alternatif lain, bukan definisi biaya tersembunyi (埋没原価/まいぼつげんか). Biaya tersembunyi adalah biaya yang sudah terjadi dan tidak dapat dipulihkan. Jawaban benar: B.'
  },
  { 
    id: 32, section: 'genka',
    question: '問題 32．製造直接費（せいぞうちょくせつひ）及び製造間接費（せいぞうかんせつひ）に関する記述として最も不適切なものは、次のうちどれか。',
    options: ['ア. 制造直接费和制造间接费是根据操业度分类的。', 'イ. 将制造直接费按产品汇总叫做直课。', 'ウ. 将制造间接费按一定标准分配到产品叫做配赋。', 'エ. 与机器维护相关的劳务费是制造间接费。'],
    correctIndex: 0, 
    explanation: '制造直接费和制造间接费是根据与产品的关系分类的，而非根据作业度分类。按作业度分类的是变动费和固定费。正确答案：ア.',
    questionJa: '問題 32．製造直接費（せいぞうちょくせつひ）及び製造間接費（せいぞうかんせつひ）に関する記述として最も不適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang biaya langsung manufaktur (製造直接費) dan biaya tidak langsung manufaktur (製造間接費) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 製造直接費と製造間接費は操業度（そうぎょうど）による分類である。', 'イ. 製造直接費を作順に集計することを直課（ちょっか）という。', 'ウ. 製造間接費を一種の基準で製品に分配することを配賦（はいふ）という。', 'エ. 機械維持に関連する labor cost は製造間接費である。'],
    optionsId: ['Biaya langsung manufaktur dan biaya tidak langsung manufaktur diklasifikasikan berdasarkan tingkat operasi (操業度).', 'Mengakumulasikan biaya langsung manufaktur per produk disebut 直接課 (直課/ちょっか).', 'Mendistribusikan biaya tidak langsung manufaktur ke produk sesuai standar tertentu disebut 配賦 (配賦/はいふ).', 'Biaya tenaga kerja yang terkait dengan pemeliharaan mesin adalah biaya tidak langsung manufaktur.'],
    explanationJa: '製造直接費と製造間接費は产品との関係による分類であり、操業度による分類ではありません。操業度による分類は変動費（へんどうひ）と固定費（こていひ）です。直課（ちょっか）は製造直接費を作順に集計することであり、配賦（はいふ）は製造間接費を一種の基準で製品に分配することです。正确答案：ア.',
    explanationId: 'Biaya langsung manufaktur dan biaya tidak langsung manufaktur diklasifikasikan berdasarkan hubungan dengan produk, bukan berdasarkan tingkat operasi (操業度). Klasifikasi berdasarkan tingkat operasi adalah biaya variabel (変動費) dan biaya tetap (固定費). 直課 (ちょっか) adalah mengalokasikan biaya langsung manufaktur per produk, dan 配賦 (はいふ) adalah mendistribusikan biaya tidak langsung manufaktur ke produk sesuai standar tertentu. Jawaban benar: A.'
  },
  { 
    id: 33, section: 'genka',
    question: '問題 33．原価低減（げんかていげん）に関する記述として最も適切なものは、次のうちどれか。',
    options: ['ア. 成本降低效果最大的是在制造阶段。', 'イ. 成本降低包括原价策划阶段的成本降低和制造阶段的成本改善。', 'ウ. IE直接有助于设计阶段的成本改善。', 'エ. 为了降低直接材料费，需要缩短消费时间。'],
    correctIndex: 1, 
    explanation: '原价降低效果约70-80%在设计阶段（原价策划阶段）就已决定，而非制造阶段。IE在制造阶段对原价改善有直接贡献。正确答案：イ.',
    questionJa: '問題 33．原価低減（げんかていげん）に関する記述として最も適切なものは、次のうちどれか。',
    questionId: 'Pernyataan tentang pengurangan biaya (原価低減) yang paling tepat adalah?',
    optionsJa: ['ア. 原価低減の効果は製造段階（せいぞうだんかい）で最大である。', 'イ. 原価低減には原价企画段階（げんかけいかくだんかい）の原価低減と製造段階の改善が含まれる。', 'ウ. IEは設計段階（せっけいだんかい）の原価改善に直接貢献する。', 'エ. 直接材料費（ちょくせつざいりょうひ）を低減するためには、消費時間（しょうひじかん）を短縮する必要がある。'],
    optionsId: ['Efek pengurangan biaya paling besar pada tahap manufaktur.', 'Pengurangan biaya mencakup pengurangan biaya pada tahap perencanaan biaya (原价企画段階) dan perbaikan pada tahap manufaktur.', 'IE berkontribusi langsung pada perbaikan biaya pada tahap desain.', 'Untuk mengurangi biaya material langsung, perlu memperpendek waktu konsumsi.'],
    explanationJa: '原价低減効果は約70〜80%が設計段階（げんかけいかくだんかい）(原价企画段階）で既に決定されます，而非製造段階。IEは製造段階での原価改善に直接貢献します。正确答案：イ.',
    explanationId: 'Efek pengurangan biaya sekitar 70-80% sudah ditentukan pada tahap desain (原价企画段階), bukan pada tahap manufaktur. IE berkontribusi langsung pada perbaikan biaya pada tahap manufaktur. Jawaban benar: B.'
  },
  { 
    id: 34, section: 'anzen',
    question: '問題 34．日常的に 발생하는納期遅延（のうきちえん）に対処するための調査方法として最も不適切なものは？',
    options: ['ア. 生产能力与现有工作量的平衡调查（是否能力不足）', 'イ. 日程管理的实施情况调查', 'ウ. 调查是否轻易投入紧急订单或计划外工作', 'エ. 调查所有工序是否确保了增加库存的空间'],
    correctIndex: 3, 
    explanation: '在所有工序增加库存并不是解决交货延迟的根本方法，反而会造成空间和成本的浪费。需要的是供需平衡的改善。正确答案：エ.',
    questionJa: '問題 34．日常的に 발생하는納期遅延（のうきちえん）に対処するための調査方法として最も不適切なものは？',
    questionId: 'Metode investigasi yang paling tidak tepat untuk menangani keterlambatan pengiriman (納期遅延) yang terjadi sehari-hari adalah?',
    optionsJa: ['ア. 生産能力と现有工作量（げんざい工作量）のバランス調査（能力不足かどうか）', 'イ. 日程管理（にちていかんり）の実施状況調査', 'ウ. 特急品（とっきゅうひん）や計画外作業（けいかくがいさく）の安易な投入調査', 'エ. すべての工程が在庫増加スペースを確保しているかの調査'],
    optionsId: ['Investigasi keseimbangan kapasitas produksi dan workload yang ada (apakah kapasitas tidak mencukupi)', 'Investigasi situasi implementasi manajemen jadwal (日程管理)', 'Investigasi apakah ada投机 투입 pesanan urgent atau pekerjaan di luar rencana', 'Investigasi apakah semua proses telah memastikan ruang untuk menambah persediaan'],
    explanationJa: 'すべての工程に在庫を増やすことは納期遅延を解決する根本的な方法ではなく、むしろ空間とコストの無駄になります。需要と供給のバランス改善が必要です。正确答案：エ.',
    explanationId: 'Menambah persediaan di semua proses bukanlah metode fundamental untuk menyelesaikan keterlambatan pengiriman, justru akan membuang ruang dan biaya. Yang dibutuhkan adalah perbaikan keseimbangan supply dan demand. Jawaban benar: D.'
  },
  { 
    id: 35, section: 'anzen',
    question: '問題 35．資材部門（しつぶぶもん）の外注品納期遅延（がいいちゅうなぬきちえん）対策として最も不適切なものは？',
    options: ['ア. 与供应商定期召开会议并确认进度情况', 'イ. 用图表分析交付实绩把握延迟模式', 'ウ. 要求供应商在最终交付日期一次性交付全部数量', 'エ. 对可能延迟的采购品活用カムアップ系统'],
    correctIndex: 2, 
    explanation: '要求供应商一次性全部交付大批量货物会导致库存积压和资金占用问题，不是有效的交货延迟对策。正确答案：ウ.',
    questionJa: '問題 35．資材部門（しつぶぶもん）の外注品納期遅延（がいいちゅうなぬきちえん）対策として最も不適切なものは？',
    questionId: 'Langkah countermeasures yang paling tidak tepat untuk mengatasi keterlambatan pengiriman barang subcontract (外注品納期遅延) dari departemen material adalah?',
    optionsJa: ['ア. 納入業者（のうにゅうぎょうしゃ）との定例ミーティング（ていれいミーティング）を開き進捗状況を确认する', 'イ. 納入実績グラフ（のうにゅうじっせきグラフ）で遅延パターン（ちえんパターン）を分析する', 'ウ. 納入業者に対して最終交付日（さいしゅうこうふび）に全量一回納入させる', 'エ. 遅延可能性がある購入品（こうにゅうひん）にカムアップシステムを活用する'],
    optionsId: ['Mengadakan pertemuan rutin dengan supplier dan mengkonfirmasi status kemajuan', 'Menganalisis pola keterlambatan dengan grafik kinerja pengiriman', 'Meminta supplier untuk pengiriman seluruh jumlah sekaligus pada tanggal pengiriman akhir', 'Memanfaatkan sistem comeback untuk pembelian yang mungkin terlambat'],
    explanationJa: '納入業者に対して全量一回納入させることは、在庫積み上げと資金占有の問題を引き起こし、納期遅延对策として有効ではありません。正确答案：ウ.',
    explanationId: 'Meminta supplier untuk entregar seluruh jumlah sekaligus akan menyebabkan masalah penumpukan persediaan dan penggunaan dana, bukan对策 yang efektif untuk keterlambatan pengiriman. Jawaban benar: C.'
  },
  { 
    id: 36, section: 'anzen',
    question: '問題 36．目で見る管理（めみるかんり）が適切に行われている職場の状態として最も適切なものは？',
    options: ['ア. 使用流动数曲线显示工序间的物料数量和停留时间', 'イ. 作业人员离开岗位去取零部件', 'ウ. 将生产所需油脂类大量堆积在保管库深处', 'エ. 接到库存询问时员工反复确认才回答'],
    correctIndex: 0, 
    explanation: '流动数曲线（流動数曲線）可以可视化显示工序间的物料流动和停滞情况，便于发现问题。是目视管理的有效工具。正确答案：ア.',
    questionJa: '問題 36．目で見る管理（めみるかんり）が適切に行われている職場（しょくば）の状態として最も適切なものは？',
    questionId: 'Kondisi tempat kerja di mana manajemen visual (目で見る管理) dilakukan dengan tepat yang paling tepat adalah?',
    optionsJa: ['ア. 流動数曲線（りゅうどうすうきょくせん）を使用して工程間の物の流れと滞留を表示する', 'イ. 作業員が自分の 자리를離れて部品を取りに行っている', 'ウ. 生産に必要な油脂類を保管庫の奥に大量堆积している', 'エ. 在庫問い合わされると従業員が繰り返し確認して答える'],
    optionsId: ['Menggunakan kurva jumlah aliran (流動数曲線) untuk menampilkan aliran dan stagnasi material antar proses', 'Pekerja meninggalkan pos mereka untuk mengambil komponen', 'Menumpuk大量的 minyak dan lemak yang diperlukan untuk produksi di belakang gudang penyimpanan', 'Ketika ada pertanyaan tentang persediaan, karyawan berulang kali mengkonfirmasi sebelum menjawab'],
    explanationJa: '流動数曲線（りゅうどうすうきょくせん）は工程間の物料の流れと停滞状況を可視化して、問題を発見しやすくするものであり、目視管理（しかんかんり）の有効なツールです。正确答案：ア.',
    explanationId: 'Kurva jumlah aliran (流動数曲線/りゅうどうすうきょくせん) dapat memvisualisasikan aliran dan stagnasi material antar proses, membuatnya mudah untuk menemukan masalah, dan merupakan alat yang efektif untuk manajemen visual (目視管理). Jawaban benar: A.'
  },
  { 
    id: 37, section: 'anzen',
    question: '問題 37．安全衛生活動（あんぜんえいせいかつどう）の推進に関する記述として最も不適切なものは？',
    options: ['ア. 依据劳动安全卫生法，雇主有确保安全工作环境的义务', 'イ. 劳动灾害只因不安全行为而产生', 'ウ. 积极活用ヒヤリ・ハット活动', 'エ. 推进机械和设备本身的本质安全化'],
    correctIndex: 1, 
    explanation: '劳动灾害是不安全行为和不安全状态的组合造成的，仅强调人为因素而忽视设备、环境、制度等系统因素是不全面的。正确答案：イ.',
    questionJa: '問題 37．安全衛生活動（あんぜんえいせいかつどう）の推進に関する記述として最も不適切なものは？',
    questionId: 'Pernyataan tentang promosi aktivitas kesehatan dan keselamatan (安全衛生活動) yang paling tidak tepat adalah?',
    optionsJa: ['ア. 労働安全衛生法（ろうどうあんせんえいせいほう）に基づき、事業者は安全な職場環境（あんぜんなしょくばかんきょう）を確保する義務がある', 'イ. 労働災害（ろうどうさいがい）は不安全行為（ふあんぜんこうい）ののみによって発生する', 'ウ. ヒヤリ・ハット活動（ヒヤリ・ハットかつどう）を積極的に活用する', 'エ. 機械や設備本身的本質安全化（ほんしつあんぜんか）を進める'],
    optionsId: ['Berdasarkan Undang-Undang Keselamatan dan Kesehatan Kerja (労働安全衛生法), pemberi kerja memiliki kewajiban untuk memastikan lingkungan kerja yang aman', 'Kecelakaan kerja hanya disebabkan oleh perilaku tidak aman (不安全行為)', 'Mengaktifkan kegiatan Hiyari-Hat (ヒヤリ・ハット活動)', 'Mendorong keamanan intrinsik mesin dan peralatan itu sendiri'],
    explanationJa: '労働災害は不安全行為（ふあんぜんこうい）と不安全状態（ふあんぜんじょうたい）の組合せによって発生します。人の要因のみを強調して、设备、環境、制度などのシステム要因を見落とすのは不完全です。正确答案：イ.',
    explanationId: 'Kecelakaan kerja disebabkan oleh kombinasi perilaku tidak aman (不安全行為) dan kondisi tidak aman (不安全状態). Hanya menekankan faktor manusia dan mengabaikan faktor sistem seperti peralatan, lingkungan, dan sistem adalah tidak lengkap. Jawaban benar: B.'
  },
  { 
    id: 38, section: 'anzen',
    question: '問題 38．特別教育（とくべつきょういく）を受けなくても従事できる業務は？',
    options: ['ア. 1吨以上起重机的挂钩作业', 'イ. 小型锅炉以外锅炉的操作业务', 'ウ. 5吨以上起重机的操作业务', 'エ. 最大载重1吨未满的叉车操作业务'],
    correctIndex: 3, 
    explanation: '根据安卫则，最大荷载1吨以下的叉车只需特殊教育即可从事，不需要执照。而1吨以上起重机挂钩、锅炉操作、5吨以上起重机操作都需要国家资格证书。正确答案：エ.',
    questionJa: '問題 38．特別教育（とくべつきょういく）を受けなくても従事できる業務（じゅうじかのうむ）は？',
    questionId: 'Pekerjaan yang dapat dilakukan tanpa接受特別教育 (特別教育) adalah?',
    optionsJa: ['ア. つり上げ1トン以上のクレーン玉掛け（く레ーンたまかけ）', 'イ. 小型ボコラー（しょうがたボコラー）以外のボカラーの操作業務（そうさぎょうむ）', 'ウ. 5トン以上のクレーン（く레ーン）の操作業務', 'エ. 最大載重（さいだいさいじゅう）1トン未満のフォークリフト（フォークリフト）操作業務'],
    optionsId: ['Pekerjaan pengaitan crane dengan angkat 1 ton atau lebih', 'Pekerjaan pengoperasian boiler selain boiler kecil', 'Pekerjaan pengoperasian crane 5 ton atau lebih', 'Pekerjaan pengoperasian forklift dengan muatan maksimal kurang dari 1 ton'],
    explanationJa: '安衛則（あんえいそく）によると、最大載重1トン未満のフォークライトは特別教育だけで従事でき、資格書は不要です。1トン以上のクレーン玉掛け、ボカラー操作、5トン以上のクレーン操作には国家資格が必要です。正确答案：エ.',
    explanationId: 'Menurut aturan keselamatan (安衛則), forklift dengan muatan maksimal kurang dari 1 ton dapat dilakukan hanya dengan pendidikan khusus, tanpa perlu sertifikat. Pekerjaan pengaitan crane 1 ton atau lebih, pengoperasian boiler, dan pengoperasian crane 5 ton atau lebih memerlukan sertifikat nasional. Jawaban benar: D.'
  },
  { 
    id: 39, section: 'anzen',
    question: '問題 39．四大公害病（よんだいこうがいびょう）と原因物質（げんいんぶっしつ）の組合せとして最も適切なものは？',
    options: ['ア. 水俣病-砒素', 'イ. イタイイタイ病-カドミウム', 'ウ. 新潟水俣病-六価クロム', 'エ. 四日市喘息-硫黄化合物'],
    correctIndex: 3, 
    explanation: '四大公害：水俣病（有机水银/甲基汞）、イタイイタイ病（镉/Cd）、新潟水俣病（有机水银）、四日市哮喘（硫氧化物/SOx）。エ的正确：水俣病对应有机水银，四日市哮喘对应硫化物。正确答案：エ.',
    questionJa: '問題 39．四大公害病（よんだいこうがいびょう）と原因物質（げんいんぶっしつ）の組合せとして最も適切なものは？',
    questionId: 'Kombinasi penyakit empat besar bencana polusi (四大公害病) dan zat penyebab (原因物質) yang paling tepat adalah?',
    optionsJa: ['ア. 水俣病（みなみびょう）－ヒ素（ひそ）', 'イ. イタイイタイ病－カドミウム（カドミウム）', 'ウ. 新潟水俣病（にいがたみなみびょう）－六価クロム（ろっかクロム）', 'エ. 四日市喘息（よっかいちあかくせい）－硫黄化合物（いおうかごうぶつ）'],
    optionsId: ['Penyakit Minamata - Arsen', 'Penyakit Itai-Itai - Kadmium', 'Penyakit Minamata Niigata - Krom heksavalen', 'Asma Yokkaichi - Senyawa sulfur'],
    explanationJa: '四大公害：水俣病（有機水銀/甲基Hg）、イタイイタイ病（カドミウム/Cd）、新潟水俣病（有機水銀）、四日市喘息（硫氧化物/SOx）。エの正确的是：水俣病は有機水銀に対応し、四日市喘息は硫化物に対応します。正确答案：エ.',
    explanationId: 'Empat penyakit besar polusi: Penyakit Minamata (水俣病) - merkuri organik (有機水銀), Penyakit Itai-Itai (イタイイタイ病) - kadmium (Cd), Penyakit Minamata Niigata (新潟水俣病) - merkuri organik, Asma Yokkaichi (四日市喘息) - oksida sulfur (SOx). Opsi D tepat: penyakit Minamata correspond to merkuri organik, dan asma Yokkaichi correspond to sulfida. Jawaban benar: D.'
  },
  { 
    id: 40, section: 'anzen',
    question: '問題 40．大気汚染防止法（たいきおせんぼうしかほう）に関する記述として最も適切なものは？',
    options: ['ア. 煤烟浓度的测量结果须保存10年', 'イ. 设施变更时也需要申报', 'ウ. 排放标准根据污染物质种类和设施种类、规模设定', 'エ. 记录有永久保存的义务'],
    correctIndex: 2, 
    explanation: '排放标准的设定依据是污染物质种类和设施种类（规模）。浓度测量结果需保存3年。设施变更时需申报。正确答案：ウ.',
    questionJa: '問題 40．大気汚染防止法（たいきおせんぼうしかほう）に関する記述として最も適切なものは？',
    questionId: 'Pernyataan tentang Undang-Undang Pencegahan Polusi Udara (大気汚染防止法) yang paling tepat adalah?',
    optionsJa: ['ア. 煤煙濃度（ばいえんのうど）の測定結果（そくてい結果）は10年間保存する必要がある', 'イ. 施設変更（しせつへんこう）の際も申告（しんこく）が必要である', 'ウ. 排出基準（はいしゅつきじゅん）は污染物質種類（おうせんぶっしつしゅるい）と施設種類（しせつしゅるい）、規模（きぼ）によって設定される', 'エ. 記録（きろく）は永久保存（えいきゅうほぞん）の義務がある'],
    optionsId: ['Hasil pengukuran konsentrasi jelaga (煤煙濃度) harus disimpan selama 10 tahun', 'Perlu declare saat ada perubahan fasilitas', 'Standar emisi ditetapkan berdasarkan jenis zat pencemar dan jenis serta skala fasilitas', 'Rekor memiliki kewajiban untuk disimpan permanen'],
    explanationJa: '排出基準（はいしゅつきじゅん）の設定根拠は污染物質種類と施設種類（規模）です。濃度測定結果（のうどそくてい結果）は3年間保存する必要があります。施設変更時は申告が必要です。正确答案：ウ.',
    explanationId: 'Dasar penetapan standar emisi (排出基準) adalah jenis zat pencemar dan jenis serta skala fasilitas. Hasil pengukuran konsentrasi harus disimpan selama 3 tahun. Perlu declaration saat ada perubahan fasilitas. Jawaban benar: C.'
  },
];

const SSW_QUESTIONS: Question[] = [
  { id: 1, section: 'moji', question: 'SSW(ii) の正式名称は？', options: ['Standard Software Workshop ii', 'Specialized Sheet Worker ii', 'Steel Structure Welding ii', 'Standard Specification Writing ii'], correctIndex: 2, explanation: 'SSW(ii) = Steel Structure Welding (ii級) = Kompetensi las struktur baja tingkat ii' },
  { id: 2, section: 'moji', question: '「熔接」の読み方は？', options: ['ようせつ', 'ゆうせつ', 'ようせつ', 'ゆせつ'], correctIndex: 0, explanation: '熔接（ようせつ）= welding. 「熔」= mencairkan, 「接」= menyambung' },
  { id: 3, section: 'moji', question: '「構造用鋼材」の読み方は？', options: ['こうぞうようこうざい', 'こうちくようはがね', 'けんぞうようはまだ', 'こうそうよう钢材'], correctIndex: 0, explanation: '構造用鋼材 = こうぞうようこうざい = structural steel material' },
  { id: 4, section: 'moji', question: '「板」の読み方は？', options: ['いた', 'ことは', 'かん', 'ぶつ'], correctIndex: 0, explanation: '板 = いた = plate / sheet (baja plat) digunakan dalam manufacturing' },
  { id: 5, section: 'moji', question: '「開先」の読み方は？', options: ['かいせん', 'ひらきさき', 'かいさき', ' 开始'], correctIndex: 0, explanation: '開先（かいせん）= grooving (groove untuk las). 開先加工 = groove machining' },
  { id: 6, section: 'moji', question: '「不下」の意味は？', options: ['降らない', '现场不使用', '现场 Super', '不下（ふげ）= tidak turun/material'], correctIndex: 3, explanation: '不下 = ふげ = material yang tidak diturunkan/digunakan (synonym: 不使用材)' },
  { id: 7, section: 'moji', question: '「仮付け」の読み方は？', options: ['かりつけ', 'かみつけ', 'かりどこ', 'たとえつけ'], correctIndex: 0, explanation: '仮付け（かりつけ）= tack welding = pengelasan sementara untuk holding' },
  { id: 8, section: 'moji', question: '「通り止め」の読み方は？', options: ['とおりどめ', 'かようどめ', 'つうurd', 'とめない'], correctIndex: 0, explanation: '通り止め = とおりどめ = welding stopper / stop welding at specific point' },
  { id: 9, section: 'bunpou', question: '「 steel plate ___ 切断 ___ 加工 ___ 行い ___ ます」\n正しい助詞は？', options: ['を / を / を / を', 'が / に / を / に', 'の / で / を / に', 'を / で / を / に'], correctIndex: 3, explanation: '钢板を切断で加工を行う = memotong dan memproses plat baja.「を」object,「で」 alat/purpose,「を」object,「に」direction' },
  { id: 10, section: 'bunpou', question: '「開先 ___ 加工 ___ 行い ___ ます」\n正しい助詞は？', options: ['を / を / を', 'に / で / に', 'の / の / を', 'を / で / を'], correctIndex: 3, explanation: '開先を加工を行う = melakukan groove machining.「を」(objek),「で」= menggunakan,「を」(objek)' },
  { id: 11, section: 'bunpou', question: '「この钢材 ___ 使用 ___ 済み ___ です」\n正しいのは？', options: ['は / が / を', 'は / に / だ', 'が / は / だ', 'は / だ / に'], correctIndex: 1, explanation: 'この钢材は使用済みだ = Material ini sudah dipakai. 使用済み = しようずみ = already used' },
  { id: 12, section: 'bunpou', question: '「仮付け ___ 行い ___ ます ___ 」\n正しい敬語は？', options: ['を / を / ます', 'に / を / します', 'を / を / します', 'は / が / です'], correctIndex: 2, explanation: '仮付けを行う → 仮付け为您做します (keigo). いたします = humble form of します' },
  { id: 13, section: 'bunpou', question: '「不通」の反対は？', options: ['不通（ふつう）', '痛通（つうつう）', '通了（とおり）', '通線（つうせん）'], correctIndex: 2, explanation: '不通（ふつう）= blocked/not passable. 通了（とおり）= can pass through / 完了した' },
  { id: 14, section: 'bunpou', question: '「検査 ___ 合格 ___ しました」\n正しい助詞は？', options: ['は / が', 'が / に', 'を / に', 'の / を'], correctIndex: 1, explanation: '検査が合格しました = inspection passed.「が」subject,「に」direction (result)' },
  { id: 15, section: 'dokkai', question: '「 SSW(ii) 試験では、構造用鋼材に対する熔接技術と安全管理が出題範囲です。実技試験では、板熔接と-tube熔接が表示されます。」\n\n質問：実技試験の内容は？', options: [' только 学科試験', '板熔接と-tube熔接', '安全管理の面接', '材料の切断'], correctIndex: 1, explanation: '板熔接 = plat welding. tube熔接 = pipa welding. 实技 = じつぎ = practical test' },
  { id: 16, section: 'dokkai', question: '「不开 ERP 系统，你们就无法进行工程管理。」\n\n質問：この文の意図は？', options: ['ERP系统很难使用', '不开ERP就无法管理工程', '他们没有电脑', '需要先买机器'], correctIndex: 1, explanation: '不开 = tidak membuka. 无法 = tidak bisa. 工程管理 = 工程管理 (engineering management). 隐含：必须使用系统才能管理' },
  { id: 17, section: 'dokkai', question: '「熔接施工 hier werden 检查后，后续加工に進みます。」\n\n質問：熔接施工後の工程は？', options: ['検査してから次工程', 'そのまま終了', 'やり直し', '在庫保管'], correctIndex: 0, explanation: '検査して = after inspection. 后续加工 = こうずいかこう = subsequent processing. 進みます = proceeds to' },
  { id: 18, section: 'dokkai', question: '「 nosso factory 采用了严格的品质管理系统，所有钢材均经过来料檢驗后才入庫。」\n\n質問：品質管理在哪裡做？', options: ['入库前（来料检验）', '出厂前', '生产中', '随机抽查'], correctIndex: 0, explanation: '来料检验 = らいりけんせき = incoming material inspection. 入庫前 = sebelum storage. 严格的 = ketat' },
  { id: 19, section: 'dokkai', question: '「安全第一が 우리 工場の 基本方針です。作業员は защитный снаряжение 를 필수로 착용해야 합니다。」\n\n質問：作業員に必要なことは？', options: ['英語能力', ' защитный снаряжение 필수 착용', '資格所持', '中国語堪能'], correctIndex: 1, explanation: '保護具 = ほごぐ = protective equipment. 着用 = ちゃくよう = to wear. 必须 = ひつぜん = wajib/mandatory' },
  { id: 20, section: 'dokkai', question: '「この钢材は 不通 のため、使用できません。」\n\n質問：钢材的问题是什么？', options: ['型号不对', '已不通（使用済み）', '太贵了', '刚到货'], correctIndex: 1, explanation: '不通 = ふつう = blocked / 不使用. 已经完成焊接且检查不合格的材料不能再次使用' },
];

// Demo questions - real N5 style
const DEMO_QUESTIONS: Question[] = [
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
  { id: 11, section: 'bunpou', question: '「わたし ___ がくせい です」\n正しい助詞は？', options: ['の', 'は', 'を', 'に'], correctIndex: 1, explanation: '「は」は主題を示す助詞 (topic marker) = I am a student.' },
  { id: 12, section: 'bunpou', question: '「ねこ ___ みず ___ のみます」', options: ['が / を', 'を / が', 'は / を', 'に / が'], correctIndex: 1, explanation: '「を」は直接目的語、「が」は主語を示す。= The cat drinks water.' },
  { id: 13, section: 'bunpou', question: '「これから ___ いきます」\n正しいのは？', options: ['に', 'へ', 'で', 'を'], correctIndex: 1, explanation: '「へ」は方向を示す。= I will go from now on.' },
  { id: 14, section: 'bunpou', question: 'Which sentence is correct?', options: ['私 は 走る.', '私 は 走ります.', '私 走る.', 'は私 走ります.'], correctIndex: 1, explanation: '「ます」は動詞の丁寧形。= I run (polite).' },
  { id: 15, section: 'bunpou', question: '「 tome ___ 」\nWhat comes after 止め?', options: ['ます', 'って', 'て', 'た'], correctIndex: 2, explanation: '「止めて」(te-form) = stop (command/polite request)' },
  { id: 16, section: 'bunpou', question: '「 ___ 図書館 ___ 本 ___ 読みます」', options: ['で / を', 'に / が', 'へ / を', 'で / が'], correctIndex: 0, explanation: '「で」は場所、「を」は目的語。= I read books at the library.' },
  { id: 17, section: 'bunpou', question: 'Which is the te-form of 食べる?', options: ['食べます', '食べて', '食べた', '食べって'], correctIndex: 1, explanation: '「て」form of 食べる → 食べて (tabete)' },
  { id: 18, section: 'bunpou', question: '「 ___ 、雨です ___ 」\nComplete with contrast', options: ['しかし / です', 'でも / だ', 'けれど / です', 'それでは /'], correctIndex: 2, explanation: '「けれど」= but/however (contrasting sentence)' },
  { id: 19, section: 'bunpou', question: '「 university ___ 行きます ___ 」\n正しい助詞は？', options: ['に / が', 'へ / を', 'に / を', 'で / に'], correctIndex: 2, explanation: '「に」= destination, 「を」= object (go to university).' },
  { id: 20, section: 'bunpou', question: 'Which is the past tense of 飲む?', options: ['飲んでいます', '飲みます', '飲みました', '飲むでしょう'], correctIndex: 2, explanation: '「ました」= past tense polite. 飲みました = drank.' },
  { id: 21, section: 'dokkai', question: '私の名前は田中です。京都に住んでいます。学生です。\n\n質問：田中さんの職業は？', options: ['先生', '学生', '医者', '社員'], correctIndex: 1, explanation: '「学生です」= I am a student.' },
  { id: 22, section: 'dokkai', question: '今日は晴です。午前中は図書館で勉強します。午後は友達と映画を見ます。\n\n質問：午前に何をする？', options: ['映画を見る', '勉強する', '買い物をする', '寝る'], correctIndex: 1, explanation: '「午前中は図書館で勉強します」= Study at library in the morning.' },
  { id: 23, section: 'dokkai', question: '小林さんは毎朝パンを食べます。牛奶喝了咖啡。\n\n質問：小林さんは何を食べますか？', options: ['お寿司', 'パン', 'カレー', 'ラーメン'], correctIndex: 1, explanation: '「パンを食べます」= eats bread' },
  { id: 24, section: 'dokkai', question: '（A:）すみません、駅はどこですか？\n（B:）あの银行的左です。\n\n質問：駅はどこ？', options: ['右', '左', '前', '後ろ'], correctIndex: 1, explanation: '「左です」= It is on the left.' },
  { id: 25, section: 'dokkai', question: '私は日本の音楽が好きです。周末常常听日本歌曲。\n\n質問：話者は何が好き？', options: ['映画', '食べ物', '日本の音楽', '読書'], correctIndex: 2, explanation: '「日本の音楽が好きです」= I like Japanese music.' },
];

const SECTION_INFO = {
  moji: { name: '文字 (Moji)', description: 'Kanji & Vocabulary', icon: '漢', duration: '10 questions' },
  bunpou: { name: '文法 (Bunpou)', description: 'Grammar', icon: '📖', duration: '10 questions' },
  dokkai: { name: '読解 (Dokkai)', description: 'Reading Comprehension', icon: '📚', duration: '5 questions' },
  seisan: { name: '生産管理', description: 'Production Management', icon: '🏭', duration: '10 questions' },
  hinshitsu: { name: '品質管理', description: 'Quality Management', icon: '✅', duration: '10 questions' },
  genka: { name: '原価管理', description: 'Cost Management', icon: '💴', duration: '10 questions' },
  anzen: { name: '安全衛生・物流', description: 'Safety & Logistics', icon: '⚠️', duration: '10 questions' },
};

export default function SimulasiPage() {
  return (
    <Suspense fallback={<SimulasiLoading />}>
      <SimulasiContent />
    </Suspense>
  );
}

function SimulasiLoading() {
  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>
  );
}

function SimulasiContent() {
  const searchParams = useSearchParams();
  const examType = searchParams.get('type') || 'n5';

  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const timerDuration = examType === 'karier' ? 90 * 60 : examType === 'ssw' ? 90 * 60 : 30 * 60;
  const [timeLeft, setTimeLeft] = useState(timerDuration);

  const filteredQuestions = useMemo(() => {
    if (examType === 'karier') return KARIER_QUESTIONS;
    if (examType === 'ssw') return SSW_QUESTIONS;
    return DEMO_QUESTIONS;
  }, [examType]);

  const currentQ = filteredQuestions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
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
  }, [examStarted, examFinished]);

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

  const startExam = () => {
    setExamStarted(true);
    setExamFinished(false);
    setCurrentQuestion(0);
    setAnswers({});
    setShowExplanation(false);
    const startTimerDuration = examType === 'karier' ? 90 * 60 : examType === 'ssw' ? 90 * 60 : 30 * 60;
    setTimeLeft(startTimerDuration);
  };

  const resetExam = () => {
    setExamStarted(false);
    setExamFinished(false);
    setCurrentQuestion(0);
    setAnswers({});
    setShowExplanation(false);
  };

  const scores = useMemo(() => {
    const total = filteredQuestions.length;
    const sectionKeys = examType === 'karier'
      ? ['seisan', 'hinshitsu', 'genka', 'anzen'] as const
      : ['moji', 'bunpou', 'dokkai'] as const;

    let correctCount: Record<string, number> = {};
    let totalSection: Record<string, number> = {};
    sectionKeys.forEach(k => { correctCount[k] = 0; totalSection[k] = 0; });

    filteredQuestions.forEach(q => {
      totalSection[q.section] = (totalSection[q.section] || 0) + 1;
      if (answers[q.id] === q.correctIndex) {
        correctCount[q.section] = (correctCount[q.section] || 0) + 1;
      }
    });

    const totalCorrect = Object.values(correctCount).reduce((a, b) => a + b, 0);
    const passed = total > 0 && (totalCorrect / total) >= 0.8;

    return {
      total,
      correct: totalCorrect,
      sectionScores: sectionKeys.map(k => ({
        key: k,
        correct: correctCount[k] || 0,
        total: totalSection[k] || 0,
        ...SECTION_INFO[k],
      })),
      percentage: total > 0 ? Math.round((totalCorrect / total) * 100) : 0,
      passed,
    };
  }, [filteredQuestions, answers]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0F0F1A]/80 border-b border-[#2D2D44]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] bg-clip-text text-transparent">
              KanjiMon
            </Link>
            <span className="text-[#636E72]">
              {examType === 'karier' ? '/ CBT Karier Bisnis' : examType === 'ssw' ? '/ SSW(ii) Industrial' : '/ JLPT N5 Simulation'}
            </span>
          </div>
          <Link href="/" className="text-sm text-[#B2BEC3] hover:text-white">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {!examStarted && !examFinished && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-center"
            >
              <h1 className="text-2xl font-bold text-white mb-2">
                {examType === 'karier' ? '💼 CBT Karier Bisnis Manufacturing' : examType === 'ssw' ? '📋 CBT SSW(ii) Industrial Product' : '📝 JLPT N5 Simulation'}
              </h1>
              <p className="text-[#636E72]">
                {examType === 'karier' ? 'Simulasi CBT Karier Bisnis Manufaktur — 40 soal, 90 menit' : examType === 'ssw' ? 'Simulasi SSW(ii) Steel Structure Welding — 20 soal, 90 menit' : 'Simulasi ujian N5 dengan 25 soal'}
              </p>
            </motion.div>

            {examType === 'n5' && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {Object.entries(SECTION_INFO).filter(([k]) => ['moji', 'bunpou', 'dokkai'].includes(k)).map(([key, info]) => (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => startExam()}
                      className="p-6 bg-[#1A1A2E] rounded-xl border border-[#2D2D44] hover:border-[#6C5CE7] transition-all text-center group"
                    >
                      <div className="text-4xl mb-3">{info.icon}</div>
                      <h3 className="font-bold text-white mb-1">{info.name}</h3>
                      <p className="text-sm text-[#636E72] mb-2">{info.description}</p>
                      <p className="text-xs text-[#6C5CE7]">{info.duration}</p>
                    </motion.button>
                  ))}
                </div>
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

            {examType === 'karier' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <button
                  onClick={() => startExam()}
                  className="px-8 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl text-lg font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#6C5CE7]/30"
                >
                  💼 Start CBT Karier Bisnis (40 soal, 90 menit)
                </button>
                <p className="text-xs text-[#636E72] mt-3">Waktu: 90 menit • Skor kelulusan: 80%</p>
              </motion.div>
            )}

            {examType === 'ssw' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <button
                  onClick={() => startExam()}
                  className="px-8 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-xl text-lg font-bold hover:opacity-90 transition-opacity shadow-lg shadow-[#6C5CE7]/30"
                >
                  📋 Start CBT SSW(ii) (20 soal, 90 menit)
                </button>
                <p className="text-xs text-[#636E72] mt-3">Waktu: 90 menit • Skor kelulusan: 80%</p>
              </motion.div>
            )}
          </>
        )}

        <AnimatePresence>
          {examStarted && !examFinished && currentQ && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6 p-4 bg-[#1A1A2E] rounded-xl border border-[#2D2D44]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-bold">Q{currentQuestion + 1}/{filteredQuestions.length}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      currentQ.section === 'moji' ? 'bg-[#E17055]/20 text-[#E17055]' :
                      currentQ.section === 'bunpou' ? 'bg-[#6C5CE7]/20 text-[#6C5CE7]' :
                      currentQ.section === 'dokkai' ? 'bg-[#00B894]/20 text-[#00B894]' :
                      currentQ.section === 'seisan' ? 'bg-[#FDCB6E]/20 text-[#FDCB6E]' :
                      currentQ.section === 'hinshitsu' ? 'bg-[#74B9FF]/20 text-[#74B9FF]' :
                      currentQ.section === 'genka' ? 'bg-[#A29BFE]/20 text-[#A29BFE]' :
                      'bg-[#55EFC4]/20 text-[#55EFC4]'
                    }`}>
                      {SECTION_INFO[currentQ.section].name}
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

              {examType === 'karier' ? (
                <FuriganaQuestion q={currentQ} showExplanation={showExplanation} answers={answers} onAnswer={handleAnswer} />
              ) : (
                <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-6 mb-6">
                  <p className="text-lg text-white whitespace-pre-line mb-6">{currentQ.question}</p>
                  <div className="space-y-3">
                    {currentQ.options.map((option, i) => {
                      const isSelected = answers[currentQ.id] === i;
                      const isCorrect = i === currentQ.correctIndex;
                      return (
                        <button
                          key={i}
                          onClick={() => !showExplanation && handleAnswer(i)}
                          disabled={showExplanation}
                          className={`w-full p-4 rounded-xl text-left font-medium transition-all ${
                            showExplanation
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
                          {showExplanation && isCorrect && <span className="ml-2">✓</span>}
                          {showExplanation && isSelected && !isCorrect && <span className="ml-2">✗</span>}
                        </button>
                      );
                    })}
                  </div>
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
              )}

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

        <AnimatePresence>
          {examFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-[#1A1A2E] rounded-2xl border border-[#2D2D44] p-8 mb-6">
                <div className="text-6xl mb-4">{scores.passed ? '🎉' : '📚'}</div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {scores.passed ? 'LULUS! Congratulations!' : 'Belum Lulus'}
                </h2>
                <p className="text-5xl font-bold text-[#6C5CE7] mb-4">{scores.percentage}%</p>
                <p className="text-[#636E72] mb-6">
                  {scores.correct}/{scores.total} questions correct
                </p>

                <div className={`grid gap-4 mb-6 ${examType === 'karier' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {scores.sectionScores.map(s => (
                    <div key={s.key} className="p-3 bg-[#2D2D44] rounded-xl">
                      <div className="text-xl mb-1">{s.icon}</div>
                      <div className="text-lg font-bold text-white">
                        {s.correct}/{s.total}
                      </div>
                      <div className="text-xs text-[#636E72]">{s.name}</div>
                    </div>
                  ))}
                </div>

                <div className={`p-4 rounded-xl ${scores.passed ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <p className={scores.passed ? 'text-green-400' : 'text-red-400'}>
                    {scores.passed
                      ? '✨ Skor kamu di atas 80%! Kamu siap untuk CBT!'
                      : '📖 Kamu perlu skor 80% untuk lulus. Terus belajar!'}
                  </p>
                </div>
              </div>

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
