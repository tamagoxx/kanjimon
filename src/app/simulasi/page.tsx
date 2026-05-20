'use client';

import { useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Question {
  id: number;
  section: 'moji' | 'bunpou' | 'dokkai';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// CBT Questions for Karier Bisnis Manufacturing
const KARIER_QUESTIONS: Question[] = [
  // Karier section
  { id: 1, section: 'moji', question: '製造業の「業」の読み方は？', options: ['ぎょう', 'わざ', 'ため', 'わざと'], correctIndex: 0, explanation: '製造業 = せいぞうぎょう (seizou-gyou). 業 = ぎょう' },
  { id: 2, section: 'moji', question: '「進捗状況」の読み方は？', options: ['しんちょく', 'しんちく', 'しんしょく', 'しんたく'], correctIndex: 0, explanation: '進捗 = しんちょく = progress' },
  { id: 3, section: 'moji', question: '「品質管理」の目的是？', options: ['コスト削減', '製品の規格を守る', '納期を守る', '社員教育'], correctIndex: 1, explanation: '品質管理 = ひんしつかんり = QC (Quality Control) adalah memastikan produk memenuhi standar/specification' },
  { id: 4, section: 'moji', question: '「発注」の意味は？', options: ['注文する', '届ける', '検査する', '包装する'], correctIndex: 0, explanation: '発注 = はっちゅう = to place an order (pemesanan)' },
  { id: 5, section: 'moji', question: '「不良品」の反対は？', options: ['良品', '新品', '中古品', '完成品'], correctIndex: 0, explanation: '不良品 = ふりょうひん = defective product. 良品 = りょうひん = good product' },
  { id: 6, section: 'moji', question: '「-lead time-」日本語로는？', options: ['納期', '不良率', 'コスト', '計画'], correctIndex: 0, explanation: 'Lead Time = 納期 (のうき) = waktu pengiriman / lead time dari order sampai delivery' },
  { id: 7, section: 'moji', question: '「出勤」の読み方は？', options: ['しゅっきん', 'しゅつきん', 'しゅうきん', 'しゅくきん'], correctIndex: 0, explanation: '出勤 = しゅっきん = datang ke kantor / masuk kerja' },
  { id: 8, section: 'moji', question: '「工場」の読み方は？', options: ['こうじょう', 'こうば', '_factory', 'てん'], correctIndex: 0, explanation: '工場 = こうじょう = factory / manufacturing plant' },
  // Bunpou
  { id: 9, section: 'bunpou', question: '「製造 ___ する ___ 、機械 ___ 動き ___ ます」\n正しい助詞は？', options: ['を / が / て', 'が / を / で', 'に / を / が', 'で / が / を'], correctIndex: 0, explanation: '製造する = manufactures. 機械が動く = the machine moves.「を」は объекта,「が」subject,「て」te-form' },
  { id: 10, section: 'bunpou', question: '「明日、納品 ___ ます」\n正しいのは？', options: ['にいらっしゃい', '给您送去', 'をお届け', 'を出荷'], correctIndex: 2, explanation: 'をお届けする = to deliver (mer送货). 納品 = のうひん = delivery of goods' },
  { id: 11, section: 'bunpou', question: '「機械が壊れ ___ 」\n正しい補助動詞は？', options: ['ている', 'てある', 'てみる', 'てしまう'], correctIndex: 0, explanation: '壊れている = is broken (status). ～ている = ongoing state/completion' },
  { id: 12, section: 'bunpou', question: '「原料が ___ 。次は製造工程 ___ 」\n正しい語は？', options: ['够了 / 進む', '不足だ / 止める', 'ある / 終わる', '間に合う / 開始する'], correctIndex: 0, explanation: '原料が够用了 = raw materials are sufficient. 進む = to proceed. 工程 = こうてい = process' },
  { id: 13, section: 'bunpou', question: '「品質が ___ 、再做 ___ 」\n正しいのは？', options: ['問題だ / 品的', '大丈夫だ / 没问题', '不合格だ / 品质的', '良好だ / 品質'], correctIndex: 2, explanation: '品質が不合格だ = quality failed. 再做 = やり直す = to redo' },
  { id: 14, section: 'bunpou', question: '「納入先 ___ 製品 ___ 出荷 ___ ます」\n正しい助詞は？', options: ['に / を / を', 'へ / が / に', 'まで / を / で', 'に / が / を'], correctIndex: 0, explanation: '納入先（のうにゅうさき）= delivery destination. を出荷する = to ship. "納入先へ製品を出荷します"' },
  { id: 15, section: 'bunpou', question: '「不良品的 Because ___ 」\n正しい文は？', options: ['品質管理が甘いからだ', 'デザインが綺麗だから', '價格が安いから', '納期が早いから'], correctIndex: 0, explanation: '～からだ = karena. 品質管理が甘い = QC is loose/lax.  потому что качественный контроль слабый' },
  // Dokkai
  { id: 16, section: 'dokkai', question: '「 우리의工場에서는 엄격한品質관리를実施하고 있습니다。すべての工程에서 검사를 진행하고, 불량률은0.1% 이하로 관리되고 있습니다。」\n\n質問：この工場の管理方針は？', options: ['コスト削減を優先', '品質管理を厳格に実施', '納期短縮だけ', '自動化推進'], correctIndex: 1, explanation: '엄격한品質관리 = strict quality control. 불량률 0.1% 이하 = defect rate below 0.1%. 관리되고 있습니다 = being managed.' },
  { id: 17, section: 'dokkai', question: '「発注的增加を受けて、今後我们需要 машина一台增设生产线。」\n\n質問：工場は今後どうする？', options: ['機械を売る', '新しい機械を導入する', '社員を解雇する', '納期を延ばす'], correctIndex: 1, explanation: '增设生产线 = menambah lini produksi. 機械一台 = satu mesin. 導入する = to introduce/adopt' },
  { id: 18, section: 'dokkai', question: '「先月、納期 atur 到着了。今月から量产 开始 되다。」\n\n質問：結果は？', options: ['遅延した', '予定通り着岸、量産開始', 'まだ到着していない', '中止した'], correctIndex: 1, explanation: '予定通り = as scheduled. 着岸 = arrive. 量产開始 = mass production started. 今月から = from this month' },
  { id: 19, section: 'dokkai', question: '「我们的产品不符合规格，所以需要进行 品质改善。」\n\n質問：問題の原因は？', options: ['コスト太高', '製品が規格不符', '納期が延びた', '機械が古い'], correctIndex: 1, explanation: '不符合规格 = does not meet specifications. 品質改善 = quality improvement diperlukan' },
  { id: 20, section: 'dokkai', question: '「来週、工場 audit のため、海外から客户が来社します。」\n\n質問：何が来る？', options: ['機械の納品', '監査（audit）のため客户', '新しい注文', '社員研修'], correctIndex: 1, explanation: '監査 = かんさ = audit/inspection. 来社 = らいしゃ = visit the company. 客户 = きゃくさま = customer/client' },
];

// CBT Questions for SSW(ii) Industrial Product Manufacturing
const SSW_QUESTIONS: Question[] = [
  { id: 1, section: 'moji', question: 'SSW(ii) の正式名称は？', options: ['Standard Software Workshop ii', 'Specialized Sheet Worker ii', 'Steel Structure Welding ii', 'Standard Specification Writing ii'], correctIndex: 2, explanation: 'SSW(ii) = Steel Structure Welding (ii級) = Kompetensi las struktur baja tingkat ii' },
  { id: 2, section: 'moji', question: '「熔接」の読み方は？', options: ['ようせつ', 'ゆうせつ', 'ようせつ', 'ゆせつ'], correctIndex: 0, explanation: '熔接（ようせつ）= welding. 「熔」= mencairkan, 「接」= menyambung' },
  { id: 3, section: 'moji', question: '「構造用鋼材」の読み方は？', options: ['こうぞうようこうざい', 'こうちくようはがね', 'けんぞうようはまだ', 'こうそうよう钢材'], correctIndex: 0, explanation: '構造用鋼材 = こうぞうようこうざい = structural steel material' },
  { id: 4, section: 'moji', question: '「板」の読み方は？', options: ['いた', 'ことは', 'かん', 'ぶつ'], correctIndex: 0, explanation: '板 = いた = plate / sheet (baja plat) digunakan dalam manufacturing' },
  { id: 5, section: 'moji', question: '「開先」の読み方は？', options: ['かいせん', 'ひらきさき', 'かいさき', ' начинать'], correctIndex: 0, explanation: '開先（かいせん）= grooving (groove untuk las). 開先加工 = groove machining' },
  { id: 6, section: 'moji', question: '「不下」の意味は？', options: ['降らない', '现场不使用', '现场 Super', '不下（ふげ）= tidak turun/material'], correctIndex: 3, explanation: '不下 = ふげ = material yang tidak diturunkan/digunakan (synonym: 不使用材)' },
  { id: 7, section: 'moji', question: '「仮付け」の読み方は？', options: ['かりつけ', 'かみつけ', 'かりどこ', 'たとえつけ'], correctIndex: 0, explanation: '仮付け（かりつけ）= tack welding = pengelasan sementara untuk holding' },
  { id: 8, section: 'moji', question: '「通り止め」の読み方は？', options: ['とおりどめ', 'かようどめ', 'つうurd', 'とめない'], correctIndex: 0, explanation: '通り止め = とおりどめ = welding stopper / stop welding at specific point' },
  // Bunpou
  { id: 9, section: 'bunpou', question: '「 steel plate ___ 切断 ___ 加工 ___ 行い ___ ます」\n正しい助詞は？', options: ['を / を / を / を', 'が / に / を / に', 'の / で / を / に', 'を / で / を / に'], correctIndex: 3, explanation: '钢板を切断で加工を行う = memotong dan memproses plat baja.「を」object,「で」 alat/purpose,「を」object,「に」direction' },
  { id: 10, section: 'bunpou', question: '「開先 ___ 加工 ___ 行い ___ ます」\n正しい助詞は？', options: ['を / を / を', 'に / で / に', 'の / の / を', 'を / で / を'], correctIndex: 3, explanation: '開先を加工を行う = melakukan groove machining.「を」(objek),「で」= menggunakan,「を」(objek)' },
  { id: 11, section: 'bunpou', question: '「この钢材 ___ 使用 ___ 済み ___ です」\n正しいのは？', options: ['は / が / を', 'は / に / だ', 'が / は / だ', 'は / だ / に'], correctIndex: 1, explanation: 'この钢材は使用済みだ = Material ini sudah dipakai. 使用済み = しようずみ = already used' },
  { id: 12, section: 'bunpou', question: '「仮付け ___ 行い ___ ます ___ 」\n正しい敬語は？', options: ['を / を / ます', 'に / を / します', 'を / を / します', 'は / が / です'], correctIndex: 2, explanation: '仮付けを行う → 仮付けを为您做します (keigo). いたします = humble form of します' },
  { id: 13, section: 'bunpou', question: '「不通」の反対は？', options: ['不通（ふつう）', '痛通（つうつう）', '通了（とおり）', '通線（つうせん）'], correctIndex: 2, explanation: '不通（ふつう）= blocked/not passable. 通了（とおり）= can pass through / 完了した' },
  { id: 14, section: 'bunpou', question: '「検査 ___ 合格 ___ しました」\n正しい助詞は？', options: ['は / が', 'が / に', 'を / に', 'の / を'], correctIndex: 1, explanation: '検査が合格しました = inspection passed.「が」subject,「に」direction (result)' },
  // Dokkai
  { id: 15, section: 'dokkai', question: '「 SSW(ii) 試験では、構造用鋼材に対する熔接技術と安全管理が出題範囲です。実技試験では、板熔接と-tube熔接が表示されます。」\n\n質問：実技試験の内容は？', options: [' только 学科試験', '板熔接と-tube熔接', '安全管理の面接', '材料の切断'], correctIndex: 1, explanation: '板熔接 = plat welding. tube熔接 = pipa welding. 实技 = じつぎ = practical test' },
  { id: 16, section: 'dokkai', question: '「不开 ERP 系统，你们就无法进行工程管理。」\n\n質問：この文の意図は？', options: ['ERP系统很难使用', '不开ERP就无法管理工程', '他们没有电脑', '需要先买机器'], correctIndex: 1, explanation: '不开 = tidak membuka. 无法 = tidak bisa. 工程管理 = 工程管理 (engineering management). 隐含：必须使用系统才能管理' },
  { id: 17, section: 'dokkai', question: '「熔接施工 hier werden 检查后，后续加工に進みます。」\n\n質問：熔接施工後の工程は？', options: ['検査してから次工程', 'そのまま終了', 'やり直し', '在庫保管'], correctIndex: 0, explanation: '検査して = after inspection. 后续加工 = こうずいかこう = subsequent processing. 進みます = proceeds to' },
  { id: 18, section: 'dokkai', question: '「 nosso factory 采用了严格的品质管理系统，所有钢材均经过来料檢驗后才入庫。」\n\n質問：品質管理在哪裡做？', options: ['入库前（来料检验）', '出厂前', '生产中', '随机抽查'], correctIndex: 0, explanation: '来料检验 = らいりけんせき = incoming material inspection. 入庫前 = sebelum storage. 严格的 = ketat' },
  { id: 19, section: 'dokkai', question: '「安全第一が 우리 工場の 基本方針です。作業员は защитный снаряжение 를 필수로 착용해야 합니다。」\n\n質問：作業員に必要なことは？', options: ['英語能力', ' защитный снаряжение 필수 착용', '資格所持', '中国語堪能'], correctIndex: 1, explanation: '保護具 = ほごぐ = protective equipment. 着用 = ちゃくよう = to wear. 必须 = ひつぜん = wajib/mandatory' },
  { id: 20, section: 'dokkai', question: '「この钢材は 不通 のため、使用できません。」\n\n質問：钢材的问题是什么？', options: ['型号不对', '已不通（使用済み）', '太贵了', '刚到货'], correctIndex: 1, explanation: '不通 = ふつう = blocked / 不使用. 已经完成焊接且检查不合格的材料不能再次使用' },
];

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
  const examType = searchParams.get('type') || 'n5'; // 'n5' | 'karier' | 'ssw'

  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  const filteredQuestions = useMemo(() => {
    if (examType === 'karier') return KARIER_QUESTIONS;
    if (examType === 'ssw') return SSW_QUESTIONS;
    return DEMO_QUESTIONS;
  }, [examType]);

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

  const startExam = () => {
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
            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 text-center"
            >
              <h1 className="text-2xl font-bold text-white mb-2">
                {examType === 'karier' ? '💼 CBT Karier Bisnis Manufacturing' : examType === 'ssw' ? '📋 CBT SSW(ii) Industrial Product' : '📝 JLPT N5 Simulation'}
              </h1>
              <p className="text-[#636E72]">
                {examType === 'karier' ? 'Simulasi ujian CBT karier bisnis manufaktur — 20 soal' : examType === 'ssw' ? 'Simulasi SSW(ii) Steel Structure Welding — 20 soal' : 'Simulasi ujian N5 dengan 25 soal'}
              </p>
            </motion.div>

            {/* Section Cards - N5 only */}
            {examType === 'n5' && (
              <>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {Object.entries(SECTION_INFO).map(([key, info]) => (
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

            {/* Karier CBT */}
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
                  💼 Start CBT Karier Bisnis (20 soal)
                </button>
                <p className="text-xs text-[#636E72] mt-3">Waktu: 30 menit • Skor kelulusan: 80%</p>
              </motion.div>
            )}

            {/* SSW CBT */}
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
                  📋 Start CBT SSW(ii) (20 soal)
                </button>
                <p className="text-xs text-[#636E72] mt-3">Waktu: 30 menit • Skor kelulusan: 80%</p>
              </motion.div>
            )}
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