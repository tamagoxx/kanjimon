import type { JapaneseCard, Element, Rarity, CardType } from '@/types';

// Helper to generate card ID
const genId = (prefix: string, idx: number) => `${prefix}-${idx.toString().padStart(3, '0')}`;

// HP/Attack ranges by complexity (rarity)
const RARITY_STATS: Record<Rarity, { hp: [number, number]; attack: [number, number] }> = {
  COMMON: { hp: [60, 90], attack: [10, 25] },
  UNCOMMON: { hp: [90, 130], attack: [25, 40] },
  RARE: { hp: [130, 170], attack: [40, 60] },
  ULTRA_RARE: { hp: [170, 200], attack: [60, 80] },
};

const DEFENSE_BY_TYPE: Record<CardType, number> = {
  VERB: 2,
  NOUN: 3,
  ADJECTIVE: 2,
  PARTICLE: 1,
};

function makeCard(params: {
  id: string;
  japanese: string;
  reading: string;
  romaji: string;
  meaning: string;
  meaningId: string;
  type: CardType;
  rarity: Rarity;
  element: Element;
  exampleSentence: string;
  exampleTranslation: string;
  tags: string[];
}): JapaneseCard {
  const hpRange = RARITY_STATS[params.rarity].hp;
  const atkRange = RARITY_STATS[params.rarity].attack;
  const hp = hpRange[0] + Math.floor(Math.random() * (hpRange[1] - hpRange[0]));
  const attackPower = atkRange[0] + Math.floor(Math.random() * (atkRange[1] - atkRange[0]));

  return {
    id: params.id,
    japanese: params.japanese,
    reading: params.reading,
    romaji: params.romaji,
    meaning: params.meaning,
    meaningId: params.meaningId,
    type: params.type,
    jlptLevel: 'N5',
    hp,
    attackPower,
    defenseRating: DEFENSE_BY_TYPE[params.type],
    rarity: params.rarity,
    element: params.element,
    cardArtUrl: '',
    exampleSentence: params.exampleSentence,
    exampleTranslation: params.exampleTranslation,
    tags: params.tags,
  };
}

// ============================================================
// VERBS (動詞) — FIRE 🔥
// ============================================================
const VERBS: Omit<JapaneseCard, 'hp' | 'attackPower' | 'defenseRating'>[] = [
  // COMMON - Daily action verbs
  { id: 'v-001', japanese: '食べる', reading: 'たべる', romaji: 'taberu', meaning: 'to eat', meaningId: 'makan', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '私は寿司を食べます。', exampleTranslation: 'Saya makan sushi.', tags: ['food', 'daily'] },
  { id: 'v-002', japanese: '飲む', reading: 'のむ', romaji: 'nomu', meaning: 'to drink', meaningId: 'minum', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '水を飲みます。', exampleTranslation: 'Saya minum air.', tags: ['daily', 'liquid'] },
  { id: 'v-003', japanese: '見る', reading: 'みる', romaji: 'miru', meaning: 'to see, watch', meaningId: 'melihat, menonton', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '映画を見ます。', exampleTranslation: 'Saya menonton film.', tags: ['media', 'daily'] },
  { id: 'v-004', japanese: '聞く', reading: 'きく', romaji: 'kiku', meaning: 'to listen, hear', meaningId: 'mendengar, mendengarkan', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '音楽を聞きます。', exampleTranslation: 'Saya mendengarkan musik.', tags: ['audio', 'daily'] },
  { id: 'v-005', japanese: '行く', reading: 'いく', romaji: 'iku', meaning: 'to go', meaningId: 'pergi', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '学校に行きます。', exampleTranslation: 'Saya pergi ke sekolah.', tags: ['movement', 'daily'] },
  { id: 'v-006', japanese: '来る', reading: 'くる', romaji: 'kuru', meaning: 'to come', meaningId: 'datang', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '友達が家に来ます。', exampleTranslation: 'Teman datang ke rumah.', tags: ['movement', 'social'] },
  { id: 'v-007', japanese: '帰る', reading: 'かえる', romaji: 'kaeru', meaning: 'to return, go home', meaningId: 'pulang, kembali', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '毎日7時に帰ります。', exampleTranslation: 'Saya pulang jam 7 setiap hari.', tags: ['movement', 'daily'] },
  { id: 'v-008', japanese: '書く', reading: 'かく', romaji: 'kaku', meaning: 'to write', meaningId: 'menulis', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '手紙を書きます。', exampleTranslation: 'Saya menulis surat.', tags: ['creative', 'daily'] },
  { id: 'v-009', japanese: '読む', reading: 'よむ', romaji: 'yomu', meaning: 'to read', meaningId: 'membaca', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '本を読みます。', exampleTranslation: 'Saya membaca buku.', tags: ['study', 'daily'] },
  { id: 'v-010', japanese: '話す', reading: 'はなす', romaji: 'hanasu', meaning: 'to speak', meaningId: 'berbicara', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '日本語を話します。', exampleTranslation: 'Saya berbicara bahasa Jepang.', tags: ['language', 'social'] },
  { id: 'v-011', japanese: '聞く', reading: 'きく', romaji: 'kiku', meaning: 'to ask', meaningId: 'bertanya', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '先生に触めます。', exampleTranslation: 'Saya bertanya ke guru.', tags: ['social', 'study'] },
  { id: 'v-012', japanese: '寝る', reading: 'ねる', romaji: 'neru', meaning: 'to sleep', meaningId: 'tidur', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '毎日11時に랍니다。', exampleTranslation: 'Saya tidur jam 11 setiap hari.', tags: ['daily', 'rest'] },
  { id: 'v-013', japanese: '起きる', reading: 'おきる', romaji: 'okiru', meaning: 'to wake up', meaningId: 'bangun (dari tidur)', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '朝6時に起ききます。', exampleTranslation: 'Saya bangun jam 6 pagi.', tags: ['daily', 'morning'] },
  { id: 'v-014', japanese: '入る', reading: 'はいる', romaji: 'hairu', meaning: 'to enter', meaningId: 'masuk', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '部屋にに入ります。', exampleTranslation: 'Saya masuk ke ruangan.', tags: ['movement'] },
  { id: 'v-015', japanese: '出る', reading: 'でる', romaji: 'deru', meaning: 'to leave, exit', meaningId: 'keluar', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '家を而出ます。', exampleTranslation: 'Saya keluar dari rumah.', tags: ['movement'] },
  { id: 'v-016', japanese: '買う', reading: 'かう', romaji: 'kau', meaning: 'to buy', meaningId: 'membeli', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '野菜を買います。', exampleTranslation: 'Saya membeli sayuran.', tags: ['shopping', 'daily'] },
  { id: 'v-017', japanese: '待つ', reading: 'まつ', romaji: 'matsu', meaning: 'to wait', meaningId: 'menunggu', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'バスを待ちます。', exampleTranslation: 'Saya menunggu bus.', tags: ['daily', 'transport'] },
  { id: 'v-018', japanese: '座る', reading: 'すわる', romaji: 'suwaru', meaning: 'to sit', meaningId: 'duduk', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '椅子に座ります。', exampleTranslation: 'Saya duduk di kursi.', tags: ['daily', 'posture'] },
  { id: 'v-019', japanese: '立つ', reading: 'たつ', romaji: 'tatsu', meaning: 'to stand', meaningId: 'berdiri', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '行列にstoryます。', exampleTranslation: 'Saya berdiri dalam antrian.', tags: ['daily', 'posture'] },
  { id: 'v-020', japanese: '使う', reading: 'つかう', romaji: 'tsukau', meaning: 'to use', meaningId: 'menggunakan', type: 'VERB', rarity: 'COMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'パソコンを使います。', exampleTranslation: 'Saya menggunakan komputer.', tags: ['tech', 'daily'] },

  // UNCOMMON - More specific verbs
  { id: 'v-021', japanese: '走る', reading: 'はしる', romaji: 'hashiru', meaning: 'to run', meaningId: 'berlari', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '毎日公園をstrokeます。', exampleTranslation: 'Saya berlari di taman setiap hari.', tags: ['exercise', 'health'] },
  { id: 'v-022', japanese: '泳ぐ', reading: 'およぐ', romaji: 'oyogu', meaning: 'to swim', meaningId: 'berenang', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '海で泳ぎます。', exampleTranslation: 'Saya berenang di laut.', tags: ['exercise', 'summer'] },
  { id: 'v-023', japanese: '遊ぶ', reading: 'あそぶ', romaji: 'asobu', meaning: 'to play', meaningId: 'bermain', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '子供たちが遊んでいます。', exampleTranslation: 'Anak-anak sedang bermain.', tags: ['fun', 'social'] },
  { id: 'v-024', japanese: '作る', reading: 'つくる', romaji: 'tsukuru', meaning: 'to make, create', meaningId: 'membuat', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'お母さんが料理を作ります。', exampleTranslation: 'Ibu membuat masakan.', tags: ['food', 'creative'] },
  { id: 'v-025', japanese: '送る', reading: 'おくる', romaji: 'okuru', meaning: 'to send', meaningId: 'mengirim', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'メールを送ります。', exampleTranslation: 'Saya mengirim email.', tags: ['tech', 'communication'] },
  { id: 'v-026', japanese: '取る', reading: 'とる', romaji: 'toru', meaning: 'to take', meaningId: 'mengambil', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '写真をstoryます。', exampleTranslation: 'Saya mengambil foto.', tags: ['daily', 'tech'] },
  { id: 'v-027', japanese: '考える', reading: 'かんがえる', romaji: 'kangaeru', meaning: 'to think', meaningId: 'memikirkan', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'この問題をを考えます。', exampleTranslation: 'Saya memikirkan masalah ini.', tags: ['mental', 'study'] },
  { id: 'v-028', japanese: '始める', reading: 'はじめる', romaji: 'hajimeru', meaning: 'to begin', meaningId: 'memulai', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '日本語を勉強始めます。', exampleTranslation: 'Saya mulai belajar bahasa Jepang.', tags: ['study', 'action'] },
  { id: 'v-029', japanese: '終わる', reading: 'おわる', romaji: 'owaru', meaning: 'to end', meaningId: 'selesai', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '授業が終わりました。', exampleTranslation: 'Pelajaran selesai.', tags: ['action', 'study'] },
  { id: 'v-030', japanese: '教える', reading: 'おしえる', romaji: 'oshieru', meaning: 'to teach', meaningId: 'mengajarkan', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '先生が数学を教員ます。', exampleTranslation: 'Guru mengajarkan matematika.', tags: ['social', 'study'] },
  { id: 'v-031', japanese: '分かる', reading: 'わかる', romaji: 'wakaru', meaning: 'to understand', meaningId: 'mengerti', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '日本語が少し分かます。', exampleTranslation: 'Saya sedikit mengerti bahasa Jepang.', tags: ['study', 'mental'] },
  { id: 'v-032', japanese: '思う', reading: 'おもう', romaji: 'omou', meaning: 'to think, feel', meaningId: 'berpikir, merasa', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '明日も暖かいだろうと思います。', exampleTranslation: 'Saya pikir besok juga akan hangat.', tags: ['mental', 'opinion'] },
  { id: 'v-033', japanese: '止める', reading: 'とめる', romaji: 'tomeru', meaning: 'to stop', meaningId: 'menghentikan', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '車を止めます。', exampleTranslation: 'Saya menghentikan mobil.', tags: ['action', 'transport'] },
  { id: 'v-034', japanese: '変える', reading: 'かえる', romaji: 'kaeru', meaning: 'to change', meaningId: 'mengganti', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '予定を変えます。', exampleTranslation: 'Saya mengubah rencana.', tags: ['action', 'planning'] },
  { id: 'v-035', japanese: '出す', reading: 'だす', romaji: 'dasu', meaning: 'to take out, submit', meaningId: 'mengeluarkan, menyerahkan', type: 'VERB', rarity: 'UNCOMMON', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'ゴミを出します。', exampleTranslation: 'Saya mengeluarkan sampah.', tags: ['daily', 'action'] },

  // RARE - Advanced/action verbs
  { id: 'v-036', japanese: '教える', reading: 'おしえる', romaji: 'oshieru', meaning: 'to teach', meaningId: 'mengajarkan', type: 'VERB', rarity: 'RARE', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '弟に游泳を教員ます。', exampleTranslation: 'Saya mengajarkan berenang ke adik laki-laki.', tags: ['social', 'skill'] },
  { id: 'v-037', japanese: '準備する', reading: 'じゅんびする', romaji: 'junbi suru', meaning: 'to prepare', meaningId: 'mempersiapkan', type: 'VERB', rarity: 'RARE', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '旅行の準備をします。', exampleTranslation: 'Saya mempersiapkan perjalanan.', tags: ['planning', 'travel'] },
  { id: 'v-038', japanese: '経験する', reading: 'けいけんする', romaji: 'keiken suru', meaning: 'to experience', meaningId: 'mengalami', type: 'VERB', rarity: 'RARE', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: ' 많은 것을 경험しました。', exampleTranslation: 'Saya banyak pengalaman.', tags: ['life', 'growth'] },
  { id: 'v-039', japanese: '生産する', reading: 'せいさんする', romaji: 'seisan suru', meaning: 'to produce', meaningId: 'memproduksi', type: 'VERB', rarity: 'RARE', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'この工場は野菜を生産します。', exampleTranslation: 'Pabrik ini memproduksi sayuran.', tags: ['work', 'industry'] },
  { id: 'v-040', japanese: '運動する', reading: 'うんどうする', romaji: 'undou suru', meaning: 'to exercise', meaningId: 'berolahraga', type: 'VERB', rarity: 'RARE', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '毎日運動します。', exampleTranslation: 'Saya berolahraga setiap hari.', tags: ['health', 'exercise'] },
  { id: 'v-041', japanese: '説明', reading: 'せつめいする', romaji: 'setsumei suru', meaning: 'to explain', meaningId: 'menjelaskan', type: 'VERB', rarity: 'RARE', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '社長が計画を説明します。', exampleTranslation: 'Direktur menjelaskan rencana.', tags: ['work', 'communication'] },
  { id: 'v-042', japanese: '調査', reading: 'ちょうさする', romaji: 'chousa suru', meaning: 'to investigate', meaningId: 'menyelidiki', type: 'VERB', rarity: 'RARE', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '原因を調査します。', exampleTranslation: 'Saya menyelidiki penyebabnya.', tags: ['work', 'research'] },
  { id: 'v-043', japanese: '参加', reading: 'さんかする', romaji: 'sanka suru', meaning: 'to participate', meaningId: 'berpartisipasi', type: 'VERB', rarity: 'RARE', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '会議に参加します。', exampleTranslation: 'Saya berpartisipasi dalam rapat.', tags: ['work', 'social'] },
  { id: 'v-044', japanese: '予約', reading: 'よやくする', romaji: 'yoyaku suru', meaning: 'to reserve', meaningId: 'memesan', type: 'VERB', rarity: 'RARE', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'ホテルを予約しました。', exampleTranslation: 'Saya memesan hotel.', tags: ['travel', 'planning'] },
  { id: 'v-045', japanese: '連絡', reading: 'れんらくする', romaji: 'renraku suru', meaning: 'to contact', meaningId: 'menghubungi', type: 'VERB', rarity: 'RARE', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '明日連絡します。', exampleTranslation: 'Saya akan menghubungi besok.', tags: ['communication', 'work'] },

  // ULTRA RARE - Most advanced verbs
  { id: 'v-046', japanese: '開発', reading: 'かいはつする', romaji: 'kaihatsu suru', meaning: 'to develop', meaningId: 'mengembangkan', type: 'VERB', rarity: 'ULTRA_RARE', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '新しいアプリを開発しています。', exampleTranslation: 'Saya sedang mengembangkan aplikasi baru.', tags: ['tech', 'work'] },
  { id: 'v-047', japanese: '実現', reading: 'じつげんする', romaji: 'jitsugen suru', meaning: 'to achieve, realize', meaningId: 'mewujudkan', type: 'VERB', rarity: 'ULTRA_RARE', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '夢を害現します。', exampleTranslation: 'Saya mewujudkan mimpi.', tags: ['goals', 'life'] },
  { id: 'v-048', japanese: '改革', reading: 'かいかくする', romaji: 'kaikaku suru', meaning: 'to reform', meaningId: 'mereformasi', type: 'VERB', rarity: 'ULTRA_RARE', element: 'FIRE', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '制度を改革します。', exampleTranslation: 'Saya mereformasi sistem.', tags: ['work', 'society'] },
];

// ============================================================
// NOUNS (名詞) — WATER 💧
// ============================================================
const NOUNS: Omit<JapaneseCard, 'hp' | 'attackPower' | 'defenseRating'>[] = [
  // COMMON - Basic nouns
  { id: 'n-001', japanese: '人', reading: 'ひと', romaji: 'hito', meaning: 'person', meaningId: 'orang', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'あの人は 先生です。', exampleTranslation: 'Orang itu adalah guru.', tags: ['social', 'basic'] },
  { id: 'n-002', japanese: '水', reading: 'みず', romaji: 'mizu', meaning: 'water', meaningId: 'air', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '水が飲いたいです。', exampleTranslation: 'Saya ingin minum air.', tags: ['drink', 'basic'] },
  { id: 'n-003', japanese: '火', reading: 'ひ', romaji: 'hi', meaning: 'fire', meaningId: 'api', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '火が 点灯しています。', exampleTranslation: 'Api menyala.', tags: ['nature', 'element'] },
  { id: 'n-004', japanese: '山', reading: 'やま', romaji: 'yama', meaning: 'mountain', meaningId: 'gunung', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '富士山大好き です。', exampleTranslation: 'Saya suka gunung Fuji.', tags: ['nature', 'travel'] },
  { id: 'n-005', japanese: '海', reading: 'うみ', romaji: 'umi', meaning: 'sea, ocean', meaningId: 'laut', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '海で泳ぎます。', exampleTranslation: 'Saya berenang di laut.', tags: ['nature', 'summer'] },
  { id: 'n-006', japanese: '川', reading: 'かわ', romaji: 'kawa', meaning: 'river', meaningId: 'sungai', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '川に魚がいます。', exampleTranslation: 'Ada ikan di sungai.', tags: ['nature'] },
  { id: 'n-007', japanese: '空', reading: 'そら', romaji: 'sora', meaning: 'sky', meaningId: 'langit', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '空が 青いです。', exampleTranslation: 'Langit berwarna biru.', tags: ['nature', 'weather'] },
  { id: 'n-008', japanese: '木', reading: 'き', romaji: 'ki', meaning: 'tree', meaningId: 'pohon', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '庭に大きい木があります。', exampleTranslation: 'Ada pohon besar di taman.', tags: ['nature'] },
  { id: 'n-009', japanese: '花', reading: 'はな', romaji: 'hana', meaning: 'flower', meaningId: 'bunga', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '桜の花が美しいです。', exampleTranslation: 'Bunga sakura indah.', tags: ['nature', 'spring'] },
  { id: 'n-010', japanese: '犬', reading: 'いぬ', romaji: 'inu', meaning: 'dog', meaningId: 'anjing', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '犬が 好物です。', exampleTranslation: 'Anjing adalah hewan kesayangan.', tags: ['animal', 'pet'] },
  { id: 'n-011', japanese: '猫', reading: 'ねこ', romaji: 'neko', meaning: 'cat', meaningId: 'kucing', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '猫が窓にいます。', exampleTranslation: 'Kucing ada di jendela.', tags: ['animal', 'pet'] },
  { id: 'n-012', japanese: '鳥', reading: 'とり', romaji: 'tori', meaning: 'bird', meaningId: 'burung', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '鳥が歌っています。', exampleTranslation: 'Burung berkicau.', tags: ['animal', 'nature'] },
  { id: 'n-013', japanese: '魚', reading: 'さかな', romaji: 'sakana', meaning: 'fish', meaningId: 'ikan', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '寿司に魚を使います。', exampleTranslation: 'Sushi menggunakan ikan.', tags: ['food', 'animal'] },
  { id: 'n-014', japanese: '本', reading: 'ほん', romaji: 'hon', meaning: 'book', meaningId: 'buku', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '本を読みます。', exampleTranslation: 'Saya membaca buku.', tags: ['study', 'reading'] },
  { id: 'n-015', japanese: '学校', reading: 'がっこう', romaji: 'gakkou', meaning: 'school', meaningId: 'sekolah', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '学校に行きます。', exampleTranslation: 'Saya pergi ke sekolah.', tags: ['education', 'daily'] },
  { id: 'n-016', japanese: '家', reading: 'いえ', romaji: 'ie', meaning: 'house, home', meaningId: 'rumah', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '家に帰ります。', exampleTranslation: 'Saya pulang ke rumah.', tags: ['place', 'daily'] },
  { id: 'n-017', japanese: '駅', reading: 'えき', romaji: 'eki', meaning: 'station', meaningId: 'stasiun', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '駅まで歩きます。', exampleTranslation: 'Saya berjalan ke stasiun.', tags: ['transport', 'travel'] },
  { id: 'n-018', japanese: '店', reading: 'みせ', romaji: 'mise', meaning: 'shop, store', meaningId: 'toko', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'コンピに 行きます。', exampleTranslation: 'Saya pergi ke toko.', tags: ['shopping', 'daily'] },
  { id: 'n-019', japanese: '車', reading: 'くるま', romaji: 'kuruma', meaning: 'car', meaningId: 'mobil', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '車で通勤します。', exampleTranslation: 'Saya berangkat kerja dengan mobil.', tags: ['transport', 'work'] },
  { id: 'n-020', japanese: '電車', reading: 'でんしゃ', romaji: 'densha', meaning: 'train', meaningId: 'kereta api', type: 'NOUN', rarity: 'COMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '電車で 行きます。', exampleTranslation: 'Saya pergi dengan kereta.', tags: ['transport', 'travel'] },

  // UNCOMMON - Nature and abstract nouns
  { id: 'n-021', japanese: '雨', reading: 'あめ', romaji: 'ame', meaning: 'rain', meaningId: 'hujan', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '雨が降っています。', exampleTranslation: 'Sedang hujan.', tags: ['weather', 'nature'] },
  { id: 'n-022', japanese: '雪', reading: 'ゆき', romaji: 'yuki', meaning: 'snow', meaningId: 'salju', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '雪が积もっています。', exampleTranslation: 'Salju menumpuk.', tags: ['weather', 'winter'] },
  { id: 'n-023', japanese: '風', reading: 'かぜ', romaji: 'kaze', meaning: 'wind', meaningId: 'angin', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '風が冷たいです。', exampleTranslation: 'Anginnya dingin.', tags: ['weather', 'nature'] },
  { id: 'n-024', japanese: '星', reading: 'ほし', romaji: 'hoshi', meaning: 'star', meaningId: 'bintang', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '星がきれいですね。', exampleTranslation: 'Bintang itu indah.', tags: ['nature', 'space'] },
  { id: 'n-025', japanese: '月', reading: 'つき', romaji: 'tsuki', meaning: 'moon', meaningId: 'bulan', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '今夜は月が丸いです。', exampleTranslation: 'Malam ini bulannya bulat.', tags: ['nature', 'space'] },
  { id: 'n-026', japanese: '太陽', reading: 'たいよう', romaji: 'taiyou', meaning: 'sun', meaningId: 'matahari', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '太陽が まぶしいです。', exampleTranslation: 'Matahari silau.', tags: ['nature', 'space'] },
  { id: 'n-027', japanese: '朝', reading: 'あさ', romaji: 'asa', meaning: 'morning', meaningId: 'pagi', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '朝早く 起きました。', exampleTranslation: 'Saya bangun pagi.', tags: ['time', 'daily'] },
  { id: 'n-028', japanese: '夜', reading: 'よる', romaji: 'yoru', meaning: 'night', meaningId: 'malam', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '夜になると凉しくなります。', exampleTranslation: 'Kalau malam menjadi sejuk.', tags: ['time', 'daily'] },
  { id: 'n-029', japanese: '春', reading: 'はる', romaji: 'haru', meaning: 'spring', meaningId: 'musim semi', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '春になると 花が咲きます。', exampleTranslation: 'Kalau musim semi bunga mekar.', tags: ['season', 'nature'] },
  { id: 'n-030', japanese: '夏', reading: 'なつ', romaji: 'natsu', meaning: 'summer', meaningId: 'musim panas', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '海に行くのは夏です。', exampleTranslation: 'Pergi ke laut saat musim panas.', tags: ['season', 'summer'] },
  { id: 'n-031', japanese: '秋', reading: 'あき', romaji: 'aki', meaning: 'autumn', meaningId: 'musim gugur', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '秋は凉しいです。', exampleTranslation: 'Musim gugur sejuk.', tags: ['season', 'nature'] },
  { id: 'n-032', japanese: '冬', reading: 'ふゆ', romaji: 'fuyu', meaning: 'winter', meaningId: 'musim dingin', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '冬は雪が降ります。', exampleTranslation: 'Musim dingin turun salju.', tags: ['season', 'winter'] },
  { id: 'n-033', japanese: '手紙', reading: 'てがみ', romaji: 'tegami', meaning: 'letter', meaningId: 'surat', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '友達に手紙を書きます。', exampleTranslation: 'Saya menulis surat ke teman.', tags: ['communication', 'writing'] },
  { id: 'n-034', japanese: '電話', reading: 'でんわ', romaji: 'denwa', meaning: 'telephone', meaningId: 'telepon', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '電話をかけます。', exampleTranslation: 'Saya menelepon.', tags: ['communication', 'tech'] },
  { id: 'n-035', japanese: '料理', reading: 'りょうり', romaji: 'ryouri', meaning: 'cooking, cuisine', meaningId: 'masakan', type: 'NOUN', rarity: 'UNCOMMON', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '日本料理が好きです。', exampleTranslation: 'Saya suka masakan Jepang.', tags: ['food', 'culture'] },

  // RARE - Abstract and specialized nouns
  { id: 'n-036', japanese: '環境', reading: 'かんきょう', romaji: 'kankyou', meaning: 'environment', meaningId: 'lingkungan', type: 'NOUN', rarity: 'RARE', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '環境を守ることが重要です。', exampleTranslation: 'Menjaga lingkungan penting.', tags: ['society', 'nature'] },
  { id: 'n-037', japanese: '社会', reading: 'しゃかい', romaji: 'shakai', meaning: 'society', meaningId: 'masyarakat', type: 'NOUN', rarity: 'RARE', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '社会の問題を考えます。', exampleTranslation: 'Saya memikirkan masalah masyarakat.', tags: ['society'] },
  { id: 'n-038', japanese: '経済', reading: 'けいざい', romaji: 'keizai', meaning: 'economy', meaningId: 'ekonomi', type: 'NOUN', rarity: 'RARE', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '日本の経済は大きいです。', exampleTranslation: 'Ekonomi Jepang besar.', tags: ['business', 'society'] },
  { id: 'n-039', japanese: '政治', reading: 'せいじ', romaji: 'seiji', meaning: 'politics', meaningId: 'politik', type: 'NOUN', rarity: 'RARE', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '政治に興味があります。', exampleTranslation: 'Saya tertarik dengan politik.', tags: ['society', 'government'] },
  { id: 'n-040', japanese: '文化', reading: 'ぶんか', romaji: 'bunka', meaning: 'culture', meaningId: 'budaya', type: 'NOUN', rarity: 'RARE', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '日本文化を学びたいです。', exampleTranslation: 'Saya ingin belajar budaya Jepang.', tags: ['culture', 'study'] },
  { id: 'n-041', japanese: '歴史', reading: 'れきし', romaji: 'rekishi', meaning: 'history', meaningId: 'sejarah', type: 'NOUN', rarity: 'RARE', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '日本の歴史は長いです。', exampleTranslation: 'Sejarah Jepang panjang.', tags: ['study', 'culture'] },
  { id: 'n-042', japanese: '科学', reading: 'かがく', romaji: 'kagaku', meaning: 'science', meaningId: 'ilmu sains', type: 'NOUN', rarity: 'RARE', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '科学が好きです。', exampleTranslation: 'Saya suka sains.', tags: ['study', 'tech'] },
  { id: 'n-043', japanese: '技術', reading: 'ぎじゅつ', romaji: 'gijutsu', meaning: 'technology, skill', meaningId: 'teknologi', type: 'NOUN', rarity: 'RARE', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '技術が進步しています。', exampleTranslation: 'Teknologi berkembang.', tags: ['tech', 'work'] },
  { id: 'n-044', japanese: '計画', reading: 'けいかく', romaji: 'keikaku', meaning: 'plan', meaningId: 'rencana', type: 'NOUN', rarity: 'RARE', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '旅行の計画を立てます。', exampleTranslation: 'Saya membuat rencana perjalanan.', tags: ['planning', 'action'] },
  { id: 'n-045', japanese: '経験', reading: 'けいけん', romaji: 'keiken', meaning: 'experience', meaningId: 'pengalaman', type: 'NOUN', rarity: 'RARE', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '多くの経験したいです。', exampleTranslation: 'Saya ingin banyak pengalaman.', tags: ['life', 'growth'] },

  // ULTRA RARE - Most abstract/specialized nouns
  { id: 'n-046', japanese: '意識', reading: 'いしき', romaji: 'ishiki', meaning: 'consciousness', meaningId: 'kesadaran', type: 'NOUN', rarity: 'ULTRA_RARE', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '環境意識が高まっています。', exampleTranslation: 'Kesadaran lingkungan meningkat.', tags: ['philosophy', 'society'] },
  { id: 'n-047', japanese: '本質', reading: 'ほんしつ', romaji: 'honshitsu', meaning: 'essence', meaningId: 'esensi', type: 'NOUN', rarity: 'ULTRA_RARE', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '物事の本質を見ましょう。', exampleTranslation: 'Mari lihat esensi事物.', tags: ['philosophy', 'thinking'] },
  { id: 'n-048', japanese: '観点', reading: 'かんてん', romaji: 'kanten', meaning: 'viewpoint', meaningId: 'sudut pandang', type: 'NOUN', rarity: 'ULTRA_RARE', element: 'WATER', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '別の観点から考えましょう。', exampleTranslation: 'Mari berpikir dari sudut pandang lain.', tags: ['thinking', 'communication'] },
];

// ============================================================
// ADJECTIVES (形容詞) — GRASS 🌿
// ============================================================
const ADJECTIVES: Omit<JapaneseCard, 'hp' | 'attackPower' | 'defenseRating'>[] = [
  // COMMON - Basic i-adjectives
  { id: 'a-001', japanese: '大きい', reading: 'おおきい', romaji: 'ookii', meaning: 'big, large', meaningId: 'besar', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'この家は大きいです。', exampleTranslation: 'Rumah ini besar.', tags: ['size', 'description'] },
  { id: 'a-002', japanese: '小さい', reading: 'ちいさい', romaji: 'chiisai', meaning: 'small', meaningId: 'kecil', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'この猫は小さいです。', exampleTranslation: 'Kucing ini kecil.', tags: ['size', 'description'] },
  { id: 'a-003', japanese: '新しい', reading: 'あたらしい', romaji: 'atarashii', meaning: 'new', meaningId: 'baru', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '新しい車を買いました。', exampleTranslation: 'Saya membeli mobil baru.', tags: ['time', 'description'] },
  { id: 'a-004', japanese: '古い', reading: 'ふるい', romaji: 'furui', meaning: 'old (thing)', meaningId: 'lama, tua (benda)', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'この家は古いです。', exampleTranslation: 'Rumah ini tua.', tags: ['time', 'description'] },
  { id: 'a-005', japanese: '高い', reading: 'たかい', romaji: 'takai', meaning: 'expensive, tall, high', meaningId: 'mahal, tinggi', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '富士山が高いです。', exampleTranslation: 'Gunung Fuji tinggi.', tags: ['description', 'nature'] },
  { id: 'a-006', japanese: '低い', reading: 'ひくい', romaji: 'hikui', meaning: 'low, short', meaningId: 'rendah, pendek', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'あの山は低いです。', exampleTranslation: 'Gunung itu rendah.', tags: ['description', 'nature'] },
  { id: 'a-007', japanese: '長い', reading: 'ながい', romaji: 'nagai', meaning: 'long', meaningId: 'panjang', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '髪が 長いです。', exampleTranslation: 'Rambutnya panjang.', tags: ['description', 'size'] },
  { id: 'a-008', japanese: '短い', reading: 'みじかい', romaji: 'mijikai', meaning: 'short', meaningId: 'pendek', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '髪が短いです。', exampleTranslation: 'Rambutnya pendek.', tags: ['description', 'size'] },
  { id: 'a-009', japanese: '白い', reading: 'しろい', romaji: 'shiroi', meaning: 'white', meaningId: 'putih', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '雪が白いです。', exampleTranslation: 'Salju berwarna putih.', tags: ['color', 'description'] },
  { id: 'a-010', japanese: '黒い', reading: 'くろい', romaji: 'kuroi', meaning: 'black', meaningId: 'hitam', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '猫が黒いです。', exampleTranslation: 'Kucingnya hitam.', tags: ['color', 'description'] },
  { id: 'a-011', japanese: '赤い', reading: 'あかい', romaji: 'akai', meaning: 'red', meaningId: 'merah', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '車が赤いです。', exampleTranslation: 'Mobilnya merah.', tags: ['color', 'description'] },
  { id: 'a-012', japanese: '青い', reading: 'あおい', romaji: 'aoi', meaning: 'blue', meaningId: 'biru', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '空が青いです。', exampleTranslation: 'Langitnya biru.', tags: ['color', 'nature'] },
  { id: 'a-013', japanese: '良い', reading: 'いい', romaji: 'ii', meaning: 'good', meaningId: 'bagus, baik', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '今日は天気が良い です。', exampleTranslation: 'Cuaca hari ini bagus.', tags: ['opinion', 'description'] },
  { id: 'a-014', japanese: '悪い', reading: 'わるい', romaji: 'warui', meaning: 'bad', meaningId: 'buruk, jelek', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '漢字を悪いを書きました。', exampleTranslation: 'Saya menulis kanji dengan buruk.', tags: ['opinion', 'description'] },
  { id: 'a-015', japanese: '寒い', reading: 'さむい', romaji: 'samui', meaning: 'cold (weather)', meaningId: 'dingin (cuaca)', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '冬は寒いです。', exampleTranslation: 'Musim dingin dingin.', tags: ['weather', 'temperature'] },
  { id: 'a-016', japanese: '暑い', reading: 'あつい', romaji: 'atsui', meaning: 'hot (weather)', meaningId: 'panas (cuaca)', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '今日は暑いです。', exampleTranslation: 'Hari ini panas.', tags: ['weather', 'temperature'] },
  { id: 'a-017', japanese: 'おいしい', reading: 'おいしい', romaji: 'oishii', meaning: 'delicious', meaningId: 'enak', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'この刺身はおいしいです。', exampleTranslation: 'Sashimi ini enak.', tags: ['food', 'opinion'] },
  { id: 'a-018', japanese: '可愛い', reading: 'かわいい', romaji: 'kawaii', meaning: 'cute', meaningId: 'imut, lucu', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'あの子は可愛です。', exampleTranslation: 'Anak itu imut.', tags: ['opinion', 'appearance'] },
  { id: 'a-019', japanese: '面白い', reading: 'おもしろい', romaji: 'omoshiroi', meaning: 'interesting, funny', meaningId: 'menarik, lucu', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'この映画は面白い です。', exampleTranslation: 'Film ini menarik.', tags: ['opinion', 'entertainment'] },
  { id: 'a-020', japanese: '速い', reading: 'はやい', romaji: 'hayai', meaning: 'fast', meaningId: 'cepat', type: 'ADJECTIVE', rarity: 'COMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'バスが速い です。', exampleTranslation: 'Busnya cepat.', tags: ['speed', 'description'] },

  // UNCOMMON - More descriptive adjectives
  { id: 'a-021', japanese: '忙い', reading: 'いそがしい', romaji: 'isogashii', meaning: 'busy', meaningId: 'sibuk', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '今週は忙です。', exampleTranslation: 'Minggu ini sibuk.', tags: ['work', 'daily'] },
  { id: 'a-022', japanese: '静かな', reading: 'しずかな', romaji: 'shizukana', meaning: 'quiet', meaningId: 'tenang', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '図書館は静かです。', exampleTranslation: 'Perpustakaan tenang.', tags: ['description', 'place'] },
  { id: 'a-023', japanese: '賑やかな', reading: 'にんぎやかな', romaji: 'nigiwau', meaning: 'lively, bustling', meaningId: 'ramai', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '東京は賑やかな街です。', exampleTranslation: 'Tokyo adalah kota yang ramai.', tags: ['description', 'place'] },
  { id: 'a-024', japanese: '難しい', reading: 'むずかしい', romaji: 'muzukashii', meaning: 'difficult', meaningId: 'sulit', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '数学は難しいです。', exampleTranslation: 'Matematika itu sulit.', tags: ['study', 'opinion'] },
  { id: 'a-025', japanese: '易しい', reading: 'やさしい', romaji: 'yasashii', meaning: 'easy, kind', meaningId: 'mudah, baik hati', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'この本は易しいです。', exampleTranslation: 'Buku ini mudah.', tags: ['study', 'opinion'] },
  { id: 'a-026', japanese: '強い', reading: 'つよい', romaji: 'tsuyoi', meaning: 'strong', meaningId: 'kuat', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '風が強いです。', exampleTranslation: 'Anginnya kuat.', tags: ['description', 'power'] },
  { id: 'a-027', japanese: '弱い', reading: 'よわい', romaji: 'yowai', meaning: 'weak', meaningId: 'lemah', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '体が弱いです。', exampleTranslation: 'Tubuh saya lemah.', tags: ['health', 'description'] },
  { id: 'a-028', japanese: '若い', reading: 'わかい', romaji: 'wakai', meaning: 'young', meaningId: 'muda', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'あの人は若いです。', exampleTranslation: 'Orang itu muda.', tags: ['age', 'description'] },
  { id: 'a-029', japanese: '正しい', reading: 'ただしい', romaji: 'tadashii', meaning: 'correct', meaningId: 'benar', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '答えが正しいです。', exampleTranslation: 'Jawabannya benar.', tags: ['study', 'opinion'] },
  { id: 'a-030', japanese: '甘い', reading: 'あまい', romaji: 'amai', meaning: 'sweet', meaningId: 'manis', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'この力は甘です。', exampleTranslation: 'Kue ini manis.', tags: ['food', 'taste'] },
  { id: 'a-031', japanese: '辛い', reading: 'からい', romaji: 'karai', meaning: 'spicy', meaningId: 'pedas', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'この料理は辛いです。', exampleTranslation: 'Makanan ini pedas.', tags: ['food', 'taste'] },
  { id: 'a-032', japanese: '苦い', reading: 'にがい', romaji: 'nigai', meaning: 'bitter', meaningId: 'pahit', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'コーヒーは苦いです。', exampleTranslation: 'Kopi itu pahit.', tags: ['food', 'taste'] },
  { id: 'a-033', japanese: '酸い', reading: 'すい', romaji: 'sui', meaning: 'sour', meaningId: 'asam', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: ' Lemonは酸です。', exampleTranslation: 'Lemon itu asam.', tags: ['food', 'taste'] },
  { id: 'a-034', japanese: '有名な', reading: 'ゆうめいな', romaji: 'yuumeina', meaning: 'famous', meaningId: 'terkenal', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '富士山は有名です。', exampleTranslation: 'Gunung Fuji terkenal.', tags: ['opinion', 'place'] },
  { id: 'a-035', japanese: '危険な', reading: 'きけんな', romaji: 'kikenna', meaning: 'dangerous', meaningId: 'berbahaya', type: 'ADJECTIVE', rarity: 'UNCOMMON', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'この道は危険です。', exampleTranslation: 'Jalan ini berbahaya.', tags: ['safety', 'description'] },

  // RARE - Advanced adjectives
  { id: 'a-036', japanese: '美しい', reading: 'うつくしい', romaji: 'utsukushii', meaning: 'beautiful', meaningId: 'indah', type: 'ADJECTIVE', rarity: 'RARE', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '花が美しいです。', exampleTranslation: 'Bunga itu indah.', tags: ['appearance', 'nature'] },
  { id: 'a-037', japanese: '懐かしい', reading: 'なつかしい', romaji: 'natsukashii', meaning: 'nostalgic', meaningId: 'kangen, terkenang', type: 'ADJECTIVE', rarity: 'RARE', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '故郷が懐かしいです。', exampleTranslation: 'Saya kangen kampung halaman.', tags: ['emotion', 'feelings'] },
  { id: 'a-038', japanese: '可惜', reading: 'あたらしい', romaji: 'atan', meaning: 'regrettable', meaningId: 'disayangkan', type: 'ADJECTIVE', rarity: 'RARE', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'それは可惜です。', exampleTranslation: 'Itu disayangkan.', tags: ['emotion', 'opinion'] },
  { id: 'a-039', japanese: '必要な', reading: 'ひつような', romaji: 'hitsuyouna', meaning: 'necessary', meaningId: 'diperlukan', type: 'ADJECTIVE', rarity: 'RARE', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '準備が必要です。', exampleTranslation: 'Persiapan diperlukan.', tags: ['importance', 'work'] },
  { id: 'a-040', japanese: '巨大な', reading: 'きょだいな', romaji: 'kyodaina', meaning: 'gigantic', meaningId: 'raksasa', type: 'ADJECTIVE', rarity: 'RARE', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '巨大なビルがあります。', exampleTranslation: 'Ada gedung raksasa.', tags: ['size', 'description'] },
  { id: 'a-041', japanese: '繊細な', reading: 'せんみな', romaji: 'senshina', meaning: 'delicate', meaningId: 'halus, rapuh', type: 'ADJECTIVE', rarity: 'RARE', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '繊細な作業です。', exampleTranslation: 'Itu pekerjaan yang halus.', tags: ['description', 'work'] },
  { id: 'a-042', japanese: '豪華な', reading: 'ごうかな', romaji: 'goukana', meaning: 'luxurious', meaningId: 'mewah', type: 'ADJECTIVE', rarity: 'RARE', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '豪華なホテルです。', exampleTranslation: 'Hotel yang mewah.', tags: ['luxury', 'description'] },
  { id: 'a-043', japanese: '平静な', reading: 'へいせいな', romaji: 'heiseina', meaning: 'calm', meaningId: 'tenang, damai', type: 'ADJECTIVE', rarity: 'RARE', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '平静な気持ちです。', exampleTranslation: 'Perasaan saya tenang.', tags: ['emotion', 'mental'] },
  { id: 'a-044', japanese: '深刻な', reading: 'しんこくな', romaji: 'shinkokuna', meaning: 'serious, severe', meaningId: 'serius, parah', type: 'ADJECTIVE', rarity: 'RARE', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '深刻な問題です。', exampleTranslation: 'Itu masalah serius.', tags: ['importance', 'problem'] },
  { id: 'a-045', japanese: '透明な', reading: 'とうめいな', romaji: 'toumeina', meaning: 'transparent', meaningId: 'transparan, jernih', type: 'ADJECTIVE', rarity: 'RARE', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '透明な水です。', exampleTranslation: 'Air yang jernih.', tags: ['description', 'nature'] },

  // ULTRA RARE - Most advanced/sophisticated adjectives
  { id: 'a-046', japanese: '壮大な', reading: 'そうだいな', romaji: 'soudaina', meaning: 'magnificent', meaningId: 'megah', type: 'ADJECTIVE', rarity: 'ULTRA_RARE', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '壮大な景色です。', exampleTranslation: 'Pemandangan yang megah.', tags: ['appearance', 'nature'] },
  { id: 'a-047', japanese: '繊細な', reading: 'せんさいな', romaji: 'sensaina', meaning: 'exquisite', meaningId: 'halus, rumit', type: 'ADJECTIVE', rarity: 'ULTRA_RARE', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '繊細な技術です。', exampleTranslation: 'Teknologi yang halus.', tags: ['skill', 'work'] },
  { id: 'a-048', japanese: '比類なき', reading: 'ひるいない', romaji: 'hiruinai', meaning: 'unparalleled', meaningId: 'tak tertandingi', type: 'ADJECTIVE', rarity: 'ULTRA_RARE', element: 'GRASS', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '比類なき美しさです。', exampleTranslation: 'Kecantikan yang tak tertandingi.', tags: ['quality', 'superlative'] },
];

// ============================================================
// PARTICLES & TIME/NUMBER (助詞/数字) — PSYCHIC 🔮 / ELECTRIC ⚡
// ============================================================
const PARTICLES: Omit<JapaneseCard, 'hp' | 'attackPower' | 'defenseRating'>[] = [
  // COMMON - Basic particles
  { id: 'p-001', japanese: 'は', reading: 'wa', romaji: 'wa', meaning: 'topic marker', meaningId: 'partikel topik', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '私は学生です。', exampleTranslation: 'Saya adalah pelajar.', tags: ['grammar', 'basic'] },
  { id: 'p-002', japanese: 'が', reading: 'ga', romaji: 'ga', meaning: 'subject marker', meaningId: 'partikel subjek', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '猫がいます。', exampleTranslation: 'Ada kucing.', tags: ['grammar', 'basic'] },
  { id: 'p-003', japanese: 'を', reading: 'wo', romaji: 'wo', meaning: 'direct object marker', meaningId: 'partikel objek', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '本を読みます。', exampleTranslation: 'Membaca buku.', tags: ['grammar', 'basic'] },
  { id: 'p-004', japanese: 'に', reading: 'ni', romaji: 'ni', meaning: 'location/time marker', meaningId: 'partikel tempat/waktu', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '学校に行きます。', exampleTranslation: 'Pergi ke sekolah.', tags: ['grammar', 'basic'] },
  { id: 'p-005', japanese: 'で', reading: 'de', romaji: 'de', meaning: 'location of action/tools', meaningId: 'tempat tindakan/alat', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '図書館で勉強します。', exampleTranslation: 'Belajar di perpustakaan.', tags: ['grammar', 'basic'] },
  { id: 'p-006', japanese: 'と', reading: 'to', romaji: 'to', meaning: 'and, with, quote', meaningId: 'dan, dengan, bahwa', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '友達と話します。', exampleTranslation: 'Berbicara dengan teman.', tags: ['grammar', 'basic'] },
  { id: 'p-007', japanese: 'の', reading: 'no', romaji: 'no', meaning: 'possessive/modifier', meaningId: 'milik, penghubung', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '私の本です。', exampleTranslation: 'Ini buku saya.', tags: ['grammar', 'basic'] },
  { id: 'p-008', japanese: 'へ', reading: 'e', romaji: 'e', meaning: 'direction marker', meaningId: 'arah', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '東京へ行きます。', exampleTranslation: 'Pergi ke Tokyo.', tags: ['grammar', 'direction'] },
  { id: 'p-009', japanese: 'から', reading: 'kara', romaji: 'kara', meaning: 'from, because', meaningId: 'dari, karena', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '国から来ました。', exampleTranslation: 'Saya datang dari negara saya.', tags: ['grammar', 'cause'] },
  { id: 'p-010', japanese: 'まで', reading: 'made', romaji: 'made', meaning: 'until, up to', meaningId: 'sampai', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '駅まで歩きます。', exampleTranslation: 'Berjalan sampai stasiun.', tags: ['grammar', 'time'] },
  { id: 'p-011', japanese: 'を', reading: 'wo', romaji: 'wo (motion)', meaning: 'departure point', meaningId: 'titik berangkat', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '国を出発します。', exampleTranslation: 'Berangkat dari negara.', tags: ['grammar', 'motion'] },
  { id: 'p-012', japanese: 'も', reading: 'mo', romaji: 'mo', meaning: 'also, too', meaningId: 'juga', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '私も行きます。', exampleTranslation: 'Saya juga pergi.', tags: ['grammar', 'emphasis'] },
  { id: 'p-013', japanese: 'か', reading: 'ka', romaji: 'ka', meaning: 'question marker', meaningId: 'partikel tanya', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '食べましたか。', exampleTranslation: 'Sudah makan?', tags: ['grammar', 'question'] },
  { id: 'p-014', japanese: 'ね', reading: 'ne', romaji: 'ne', meaning: 'tag question (seek agreement)', meaningId: 'kan, bukan', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '美味しいですね。', exampleTranslation: 'Enak kan.', tags: ['grammar', 'social'] },
  { id: 'p-015', japanese: 'よ', reading: 'yo', romaji: 'yo', meaning: 'assertion emphasis', meaningId: 'pasti, lho', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '絶対に来てくださいよ。', exampleTranslation: 'Tolong datang pasti ya.', tags: ['grammar', 'emphasis'] },
  { id: 'p-016', japanese: 'ね', reading: 'ne', romaji: 'ne (final)', meaning: 'emotive final particle', meaningId: ' lho, ya', type: 'PARTICLE', rarity: 'COMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '明日ね。', exampleTranslation: 'Sampai besok ya.', tags: ['grammar', 'social'] },

  // UNCOMMON - More complex particles
  { id: 'p-017', japanese: 'けど', reading: 'kedo', romaji: 'kedo', meaning: 'but, although', meaningId: 'tetapi, walaupun', type: 'PARTICLE', rarity: 'UNCOMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '食べたいけど、太い。', exampleTranslation: 'Mau makan tapi gemuk.', tags: ['grammar', 'contrast'] },
  { id: 'p-018', japanese: 'ば', reading: 'ba', romaji: 'ba', meaning: 'conditional (if)', meaningId: 'jika, kalau', type: 'PARTICLE', rarity: 'UNCOMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'が降れば、屋内です。', exampleTranslation: 'Kalau hujan, di dalam.', tags: ['grammar', 'condition'] },
  { id: 'p-019', japanese: 'ながら', reading: 'nagara', romaji: 'nagara', meaning: 'while (doing)', meaningId: 'sambil', type: 'PARTICLE', rarity: 'UNCOMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '音楽を聞きながら勉強します。', exampleTranslation: 'Belajar sambil dengar musik.', tags: ['grammar', 'simultaneous'] },
  { id: 'p-020', japanese: 'ために', reading: 'ために', romaji: 'tame ni', meaning: 'for the sake of, because', meaningId: 'untuk, karena', type: 'PARTICLE', rarity: 'UNCOMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '健康のために走ります。', exampleTranslation: 'Berlari untuk kesehatan.', tags: ['grammar', 'purpose'] },
  { id: 'p-021', japanese: 'ように', reading: 'ように', romaji: 'you ni', meaning: 'in order to, so that', meaningId: 'agar, supaya', type: 'PARTICLE', rarity: 'UNCOMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '合格するように勉強します。', exampleTranslation: 'Belajar agar lulus.', tags: ['grammar', 'purpose'] },
  { id: 'p-022', japanese: 'そうだ', reading: 'souda', romaji: 'souda', meaning: 'I heard that, seems like', meaningId: 'katanya, kayaknya', type: 'PARTICLE', rarity: 'UNCOMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '明日雨が降るそうです。', exampleTranslation: 'Katanya besok hujan.', tags: ['grammar', 'hearsay'] },
  { id: 'p-023', japanese: 'らしい', reading: 'rashii', romaji: 'rashii', meaning: 'seems like', meaningId: 'nampaknya', type: 'PARTICLE', rarity: 'UNCOMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '雨らしいですね。', exampleTranslation: 'Nampaknya hujan.', tags: ['grammar', 'guess'] },
  { id: 'p-024', japanese: 'そうだ', reading: 'sou da', romaji: 'sou da', meaning: 'it looks like (visual)', meaningId: 'kelihatannya', type: 'PARTICLE', rarity: 'UNCOMMON', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '雨が降りそうです。', exampleTranslation: 'Kelihatannya akan hujan.', tags: ['grammar', 'guess'] },

  // RARE - Advanced particles/grammar patterns
  { id: 'p-025', japanese: 'に関する', reading: 'にゅうする', romaji: 'ni kansuru', meaning: 'concerning, regarding', meaningId: 'mengenai, berkenaan', type: 'PARTICLE', rarity: 'RARE', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '環境に関することはです。', exampleTranslation: 'Ini tentang lingkungan.', tags: ['grammar', 'formal'] },
  { id: 'p-026', japanese: 'にとって', reading: 'にとって', romaji: 'ni totte', meaning: 'for, from the perspective of', meaningId: 'bagi, dari sudut pandang', type: 'PARTICLE', rarity: 'RARE', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '私にとって日本語は重要です。', exampleTranslation: 'Bahasa Jepang penting bagi saya.', tags: ['grammar', 'perspective'] },
  { id: 'p-027', japanese: 'に基づいて', reading: 'にもとづいて', romaji: 'ni motozuite', meaning: 'based on', meaningId: 'berdasarkan', type: 'PARTICLE', rarity: 'RARE', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '結果に基づいて決めます。', exampleTranslation: 'Ditentukan berdasarkan hasil.', tags: ['grammar', 'formal'] },
  { id: 'p-028', japanese: 'にもかかわらず', reading: 'にもかかわらず', romaji: 'ni mo kakawarazu', meaning: 'despite', meaningId: 'mengingat', type: 'PARTICLE', rarity: 'RARE', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '危険にもかかわらず、行きます。', exampleTranslation: 'Meskipun berbahaya, saya pergi.', tags: ['grammar', 'contrast'] },
  { id: 'p-029', japanese: 'に関する', reading: 'にかんする', romaji: 'ni kansuru', meaning: 'related to', meaningId: 'berkaitan dengan', type: 'PARTICLE', rarity: 'RARE', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '計画に関する情報です。', exampleTranslation: 'Ini informasi tentang rencana.', tags: ['grammar', 'formal'] },
  { id: 'p-030', japanese: 'にしては', reading: 'にしては', romaji: 'ni shite wa', meaning: 'for, considering that', meaningId: 'untuk, mengingat', type: 'PARTICLE', rarity: 'RARE', element: 'PSYCHIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '初心者にしては上手です。', exampleTranslation: 'Untuk pemula, pandai juga.', tags: ['grammar', 'evaluation'] },
];

// ============================================================
// NUMBERS/TIME (数字) — ELECTRIC ⚡
// ============================================================
const NUMBERS: Omit<JapaneseCard, 'hp' | 'attackPower' | 'defenseRating'>[] = [
  // COMMON - Numbers 1-10
  { id: 'num-001', japanese: '一', reading: 'いち', romaji: 'ichi', meaning: 'one (1)', meaningId: 'satu', type: 'NOUN', rarity: 'COMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'りんごを一つください。', exampleTranslation: 'Tolong give me one apple.', tags: ['number', 'basic'] },
  { id: 'num-002', japanese: '二', reading: 'に', romaji: 'ni', meaning: 'two (2)', meaningId: 'dua', type: 'NOUN', rarity: 'COMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '二郎ください。', exampleTranslation: 'Tolong give me two.', tags: ['number', 'basic'] },
  { id: 'num-003', japanese: '三', reading: 'さん', romaji: 'san', meaning: 'three (3)', meaningId: 'tiga', type: 'NOUN', rarity: 'COMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '三楼にあります。', exampleTranslation: 'Ada di lantai tiga.', tags: ['number', 'basic'] },
  { id: 'num-004', japanese: '四', reading: 'よん/し', romaji: 'yon/shi', meaning: 'four (4)', meaningId: 'empat', type: 'NOUN', rarity: 'COMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '四人は来ました。', exampleTranslation: 'Empat orang datang.', tags: ['number', 'basic'] },
  { id: 'num-005', japanese: '五', reading: 'ご', romaji: 'go', meaning: 'five (5)', meaningId: 'lima', type: 'NOUN', rarity: 'COMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '五月はMayです。', exampleTranslation: 'Bulan Mei adalah Go-gatsu.', tags: ['number', 'basic'] },
  { id: 'num-006', japanese: '六', reading: 'ろく', romaji: 'roku', meaning: 'six (6)', meaningId: 'enam', type: 'NOUN', rarity: 'COMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '六ヶ月研修しました。', exampleTranslation: 'Saya training 6 bulan.', tags: ['number', 'basic'] },
  { id: 'num-007', japanese: '七', reading: 'なな/しち', romaji: 'nana/shichi', meaning: 'seven (7)', meaningId: 'tujuh', type: 'NOUN', rarity: 'COMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '七月はJulyです。', exampleTranslation: 'Bulan Juli adalah Shichi-gatsu.', tags: ['number', 'basic'] },
  { id: 'num-008', japanese: '八', reading: 'はち', romaji: 'hachi', meaning: 'eight (8)', meaningId: 'delapan', type: 'NOUN', rarity: 'COMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '八時間寝ました。', exampleTranslation: 'Saya tidur 8 jam.', tags: ['number', 'basic'] },
  { id: 'num-009', japanese: '九', reading: 'きゅう/く', romaji: 'kyuu/ku', meaning: 'nine (9)', meaningId: 'sembilan', type: 'NOUN', rarity: 'COMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '九月はSeptemberです。', exampleTranslation: 'Bulan September adalah Ku-gatsu.', tags: ['number', 'basic'] },
  { id: 'num-010', japanese: '十', reading: 'じゅう', romaji: 'juu', meaning: 'ten (10)', meaningId: 'sepuluh', type: 'NOUN', rarity: 'COMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '十时才寝ました。', exampleTranslation: 'Saya tidur jam 10.', tags: ['number', 'basic'] },

  // Time words - UNCOMMON
  { id: 'num-011', japanese: '今日', reading: 'きょう', romaji: 'kyou', meaning: 'today', meaningId: 'hari ini', type: 'NOUN', rarity: 'UNCOMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '今日は晴れです。', exampleTranslation: 'Hari ini cerah.', tags: ['time', 'daily'] },
  { id: 'num-012', japanese: '明日', reading: 'あした', romaji: 'ashita', meaning: 'tomorrow', meaningId: 'besok', type: 'NOUN', rarity: 'UNCOMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '明日会いましょう。', exampleTranslation: 'Sampai jumpa besok.', tags: ['time', 'future'] },
  { id: 'num-013', japanese: '昨日', reading: 'きのう', romaji: 'kinou', meaning: 'yesterday', meaningId: 'kemarin', type: 'NOUN', rarity: 'UNCOMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '昨日寧でした。', exampleTranslation: 'Kemarin hujan.', tags: ['time', 'past'] },
  { id: 'num-014', japanese: '来年', reading: 'らいねん', romaji: 'rainen', meaning: 'next year', meaningId: 'tahun depan', type: 'NOUN', rarity: 'UNCOMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '来年大学毕业します。', exampleTranslation: 'Saya lulus universitas tahun depan.', tags: ['time', 'future'] },
  { id: 'num-015', japanese: '去年', reading: 'きょねん', romaji: 'kyonen', meaning: 'last year', meaningId: 'tahun lalu', type: 'NOUN', rarity: 'UNCOMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '去年日本に行きました。', exampleTranslation: 'Saya ke Jepang tahun lalu.', tags: ['time', 'past'] },
  { id: 'num-016', japanese: '毎朝', reading: 'まいあさ', romaji: 'maiasa', meaning: 'every morning', meaningId: 'setiap pagi', type: 'NOUN', rarity: 'UNCOMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '毎朝コーヒーを飲みます。', exampleTranslation: 'Setiap pagi minum kopi.', tags: ['time', 'routine'] },
  { id: 'num-017', japanese: '毎晚', reading: 'まいばん', romaji: 'maiban', meaning: 'every night', meaningId: 'setiap malam', type: 'NOUN', rarity: 'UNCOMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '毎晚勉強します。', exampleTranslation: 'Setiap malam belajar.', tags: ['time', 'routine'] },
  { id: 'num-018', japanese: '每周', reading: 'まいしゅう', romaji: 'maishuu', meaning: 'every week', meaningId: 'setiap minggu', type: 'NOUN', rarity: 'UNCOMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '毎週报告会があります。', exampleTranslation: 'Setiap minggu ada报告会.', tags: ['time', 'routine'] },
  { id: 'num-019', japanese: '毎月', reading: 'まいつき', romaji: 'maitsuki', meaning: 'every month', meaningId: 'setiap bulan', type: 'NOUN', rarity: 'UNCOMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '毎月貯金します。', exampleTranslation: 'Setiap bulan menabung.', tags: ['time', 'routine'] },
  { id: 'num-020', japanese: '毎年', reading: 'まいねん', romaji: 'mainnen', meaning: 'every year', meaningId: 'setiap tahun', type: 'NOUN', rarity: 'UNCOMMON', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '毎年旅行します。', exampleTranslation: 'Setiap tahun traveling.', tags: ['time', 'routine'] },

  // RARE - Time expressions
  { id: 'num-021', japanese: '一昨日', reading: 'おととい', romaji: 'ototoi', meaning: 'day before yesterday', meaningId: 'dua hari lalu', type: 'NOUN', rarity: 'RARE', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '一昨日寧でした。', exampleTranslation: 'Dua hari lalu hujan.', tags: ['time', 'past'] },
  { id: 'num-022', japanese: '明後日', reading: 'あさって', romaji: 'asatte', meaning: 'day after tomorrow', meaningId: 'lusa', type: 'NOUN', rarity: 'RARE', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '明後日會があります。', exampleTranslation: 'Ada pertemuan lusa.', tags: ['time', 'future'] },
  { id: 'num-023', japanese: '今朝', reading: 'けさ', romaji: 'kesa', meaning: 'this morning', meaningId: 'pagi ini', type: 'NOUN', rarity: 'RARE', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '今朝早く起きました。', exampleTranslation: 'Pagi ini saya bangun pagi.', tags: ['time', 'morning'] },
  { id: 'num-024', japanese: '今週', reading: 'こんしゅう', romaji: 'konshuu', meaning: 'this week', meaningId: 'minggu ini', type: 'NOUN', rarity: 'RARE', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '今週出張です。', exampleTranslation: 'Minggu ini出差.', tags: ['time', 'present'] },
  { id: 'num-025', japanese: '今月', reading: 'こんげつ', romaji: 'kongetsu', meaning: 'this month', meaningId: 'bulan ini', type: 'NOUN', rarity: 'RARE', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '今月は忙しいです。', exampleTranslation: 'Bulan ini sibuk.', tags: ['time', 'present'] },
  { id: 'num-026', japanese: '今夜', reading: 'こんや', romaji: 'koya', meaning: 'tonight', meaningId: 'malam ini', type: 'NOUN', rarity: 'RARE', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '今夜のパーティーが楽しみです。', exampleTranslation: 'Pesta malam ini seru.', tags: ['time', 'evening'] },
  { id: 'num-027', japanese: '目覚し', reading: 'めざめ', romaji: 'mezame', meaning: 'awakening', meaningId: 'bangun tidur', type: 'NOUN', rarity: 'RARE', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '目覚めの一杯のcoffee。', exampleTranslation: 'Kopi pertama setelah bangun.', tags: ['time', 'morning'] },
  { id: 'num-028', japanese: '一時', reading: 'いちじ', romaji: 'ichiji', meaning: 'one o\'clock', meaningId: 'jam satu', type: 'NOUN', rarity: 'RARE', element: 'ELECTRIC', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '一時にお会いしましょう。', exampleTranslation: 'Mari ketemu jam 1.', tags: ['time', 'clock'] },
];

// ============================================================
// NORMAL WORDS (Kata sehari-hari) — NORMAL ⭐
// ============================================================
const NORMAL: Omit<JapaneseCard, 'hp' | 'attackPower' | 'defenseRating'>[] = [
  // COMMON - Daily words
  { id: 'norm-001', japanese: '今日', reading: 'きょう', romaji: 'kyou', meaning: 'today', meaningId: 'hari ini', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '今日は寒いです。', exampleTranslation: 'Hari ini dingin.', tags: ['time', 'daily'] },
  { id: 'norm-002', japanese: '友達', reading: 'ともだち', romaji: 'tomodachi', meaning: 'friend', meaningId: 'teman', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '友達と映画を見ます。', exampleTranslation: 'Nonton film sama teman.', tags: ['social', 'daily'] },
  { id: 'norm-003', japanese: '仕事', reading: 'しごと', romaji: 'shigoto', meaning: 'work, job', meaningId: 'pekerjaan', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '仕事が忙しいです。', exampleTranslation: 'Kerjaannya sibuk.', tags: ['work', 'daily'] },
  { id: 'norm-004', japanese: '先生', reading: 'せんせい', romaji: 'sensei', meaning: 'teacher', meaningId: 'guru', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '先生が優しいです。', exampleTranslation: 'Gurunya baik.', tags: ['social', 'school'] },
  { id: 'norm-005', japanese: '学生', reading: 'がくせい', romaji: 'gakusei', meaning: 'student', meaningId: 'pelajar, mahasiswa', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '私は学生です。', exampleTranslation: 'Saya pelajar.', tags: ['social', 'school'] },
  { id: 'norm-006', japanese: '会社', reading: 'かいしゃ', romaji: 'kaisha', meaning: 'company', meaningId: 'perusahaan', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '会社で働いています。', exampleTranslation: 'Saya bekerja di perusahaan.', tags: ['work', 'place'] },
  { id: 'norm-007', japanese: '家族', reading: 'かぞく', romaji: 'kazoku', meaning: 'family', meaningId: 'keluarga', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '家族は5人です。', exampleTranslation: 'Keluarganya 5 orang.', tags: ['social', 'family'] },
  { id: 'norm-008', japanese: '父', reading: 'ちち', romaji: 'chichi', meaning: 'father (my)', meaningId: 'ayah', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '父は会社に勤めています。', exampleTranslation: 'Ayah bekerja di perusahaan.', tags: ['family', 'social'] },
  { id: 'norm-009', japanese: '母', reading: 'はは', romaji: 'haha', meaning: 'mother (my)', meaningId: 'ibu', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '母は料理を作ります。', exampleTranslation: 'Ibu membuat masakan.', tags: ['family', 'social'] },
  { id: 'norm-010', japanese: '兄', reading: 'あに', romaji: 'ani', meaning: 'older brother (my)', meaningId: 'kakak laki-laki', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '兄は大学生です。', exampleTranslation: 'Kakak laki-laki kuliah.', tags: ['family', 'social'] },
  { id: 'norm-011', japanese: '姉', reading: 'あね', romaji: 'ane', meaning: 'older sister (my)', meaningId: 'kakak perempuan', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '姉は先生です。', exampleTranslation: 'Kakak perempuan guru.', tags: ['family', 'social'] },
  { id: 'norm-012', japanese: '弟', reading: 'おとうと', romaji: 'otouto', meaning: 'younger brother', meaningId: 'adik laki-laki', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '弟は高校生です。', exampleTranslation: 'Adik laki-laki SMA.', tags: ['family', 'social'] },
  { id: 'norm-013', japanese: '妹', reading: 'いもうと', romaji: 'imouto', meaning: 'younger sister', meaningId: 'adik perempuan', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '妹は中学生です。', exampleTranslation: 'Adik perempuan SMP.', tags: ['family', 'social'] },
  { id: 'norm-014', japanese: '誕生日', reading: 'たんじょうび', romaji: 'tanjoubi', meaning: 'birthday', meaningId: 'ulang tahun', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '誕生日は来月です。', exampleTranslation: 'Ulang tahun bulan depan.', tags: ['celebration', 'event'] },
  { id: 'norm-015', japanese: '休み', reading: 'やすみ', romaji: 'yasumi', meaning: 'rest, holiday, vacation', meaningId: 'libur, istirahat', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '来週休みです。', exampleTranslation: 'Minggu depan libur.', tags: ['time', 'work'] },
  { id: 'norm-016', japanese: '電話', reading: 'でんわ', romaji: 'denwa', meaning: 'telephone call', meaningId: 'telepon', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '電話があります。', exampleTranslation: 'Ada telepon.', tags: ['communication', 'tech'] },
  { id: 'norm-017', japanese: 'ご飯', reading: 'ごはん', romaji: 'gohan', meaning: 'meal, rice', meaningId: 'makan, nasi', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'ご飯を食べましょう。', exampleTranslation: 'Mari makan.', tags: ['food', 'daily'] },
  { id: 'norm-018', japanese: '朝ご飯', reading: 'あさごはん', romaji: 'asagohan', meaning: 'breakfast', meaningId: 'sarapan', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '朝ご飯は何を食べましたか。', exampleTranslation: 'Makan apa untuk sarapan?', tags: ['food', 'morning'] },
  { id: 'norm-019', japanese: '昼ご飯', reading: 'ひるごはん', romaji: 'hirugohan', meaning: 'lunch', meaningId: 'makan siang', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '昼ご飯を一緒に食べましょう。', exampleTranslation: 'Mari makan siang bersama.', tags: ['food', 'noon'] },
  { id: 'norm-020', japanese: '晚ご飯', reading: 'ばんごはん', romaji: 'bangohan', meaning: 'dinner', meaningId: 'makan malam', type: 'NOUN', rarity: 'COMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '晚ご飯は何시에食べますか。', exampleTranslation: 'Jam berapa makan malam?', tags: ['food', 'evening'] },

  // UNCOMMON - More daily words
  { id: 'norm-021', japanese: '興味', reading: 'きょうみ', romaji: 'kyoumi', meaning: 'interest', meaningId: 'minat', type: 'NOUN', rarity: 'UNCOMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '日本文化に興味があります。', exampleTranslation: 'Saya tertarik budaya Jepang.', tags: ['interest', 'culture'] },
  { id: 'norm-022', japanese: '約束', reading: 'やくそく', romaji: 'yakusoku', meaning: 'promise, appointment', meaningId: 'janji', type: 'NOUN', rarity: 'UNCOMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '約束を守ってください。', exampleTranslation: 'Tolong tepati janji.', tags: ['social', 'promise'] },
  { id: 'norm-023', japanese: '連絡', reading: 'れんらく', romaji: 'renraku', meaning: 'contact,联系', meaningId: 'kontak, hubungi', type: 'NOUN', rarity: 'UNCOMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '連絡を待っています。', exampleTranslation: 'Saya menunggu kontak Anda.', tags: ['communication', 'social'] },
  { id: 'norm-024', japanese: '試合', reading: 'しあい', romaji: 'shiai', meaning: 'match, game', meaningId: 'pertandingan', type: 'NOUN', rarity: 'UNCOMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '今日の試合は面白かった。', exampleTranslation: 'Pertandingan hari ini seru.', tags: ['sports', 'event'] },
  { id: 'norm-025', japanese: '準備', reading: 'じゅんび', romaji: 'junbi', meaning: 'preparation', meaningId: 'persiapan', type: 'NOUN', rarity: 'UNCOMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '準備ができています。', exampleTranslation: 'Persiapannya sudah siap.', tags: ['action', 'planning'] },
  { id: 'norm-026', japanese: '気分', reading: 'きぶん', romaji: 'kibun', meaning: 'feeling, mood', meaningId: 'perasaan, suasana hati', type: 'NOUN', rarity: 'UNCOMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '今日は気分が悪いです。', exampleTranslation: 'Hari ini perasaan saya tidak enak.', tags: ['emotion', 'health'] },
  { id: 'norm-027', japanese: '目的', reading: 'もくてき', romaji: 'mokuteki', meaning: 'purpose, goal', meaningId: 'tujuan', type: 'NOUN', rarity: 'UNCOMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '旅行の目的は観光です。', exampleTranslation: 'Tujuan perjalanan adalah wisata.', tags: ['planning', 'goal'] },
  { id: 'norm-028', japanese: '結果', reading: 'けっか', romaji: 'kekka', meaning: 'result', meaningId: 'hasil', type: 'NOUN', rarity: 'UNCOMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '結果的に成功しました。', exampleTranslation: 'Akhirnya berhasil.', tags: ['outcome', 'work'] },
  { id: 'norm-029', japanese: '理由', reading: 'りゆう', romaji: 'riyuu', meaning: 'reason', meaningId: 'alasan', type: 'NOUN', rarity: 'UNCOMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '理由がありません。', exampleTranslation: 'Tidak ada alasan.', tags: ['explanation', 'communication'] },
  { id: 'norm-030', japanese: '関係', reading: 'かんけい', romaji: 'kankei', meaning: 'relationship', meaningId: 'hubungan', type: 'NOUN', rarity: 'UNCOMMON', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '和日本企業の関係が大きいです。', exampleTranslation: 'Hubungan dengan perusahaan Jepang besar.', tags: ['social', 'business'] },

  // RARE - Advanced daily words
  { id: 'norm-031', japanese: '傾向', reading: 'けいこう', romaji: 'keikou', meaning: 'trend, tendency', meaningId: 'tren, kecenderungan', type: 'NOUN', rarity: 'RARE', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '増加傾向があります。', exampleTranslation: 'Ada kecenderungan meningkat.', tags: ['analysis', 'business'] },
  { id: 'norm-032', japanese: '事情', reading: 'じじょう', romaji: 'jijou', meaning: 'circumstances', meaningId: 'keadaan, situasi', type: 'NOUN', rarity: 'RARE', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '部屋の事情によりも可能です。', exampleTranslation: 'Mungkin karena keadaan ruangan.', tags: ['situation', 'explanation'] },
  { id: 'norm-033', japanese: '意識', reading: 'いしき', romaji: 'ishiki', meaning: 'consciousness, awareness', meaningId: 'kesadaran', type: 'NOUN', rarity: 'RARE', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '環境意識が高まっています。', exampleTranslation: 'Kesadaran lingkungan meningkat.', tags: ['society', 'awareness'] },
  { id: 'norm-034', japanese: '自体', reading: 'じたい', romaji: 'jitai', meaning: 'itself', meaningId: 'sendiri', type: 'NOUN', rarity: 'RARE', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: 'システム自体に問題があります。', exampleTranslation: 'Sistemnya sendiri ada masalah.', tags: ['emphasis', 'grammar'] },
  { id: 'norm-035', japanese: '的眼光', reading: 'てってい', romaji: 'toutei', meaning: 'meticulous, thorough', meaningId: 'mendalam, seksama', type: 'NOUN', rarity: 'RARE', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '眼光に検討する必要があります。', exampleTranslation: 'Perlu dibahas secara mendalam.', tags: ['work', 'analysis'] },

  // ULTRA RARE - Most sophisticated daily words
  { id: 'norm-036', japanese: '仕組み', reading: 'しくみ', romaji: 'shikumi', meaning: 'mechanism, structure', meaningId: 'mekanisme, struktur', type: 'NOUN', rarity: 'ULTRA_RARE', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '社会の仕組みを勉强します。', exampleTranslation: 'Belajar struktur masyarakat.', tags: ['society', 'understanding'] },
  { id: 'norm-037', japanese: '立場', reading: 'たちば', romaji: ' tachiba', meaning: 'position, standpoint', meaningId: 'posisi, sudut pandang', type: 'NOUN', rarity: 'ULTRA_RARE', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '経営者の立場から考えましょう。', exampleTranslation: 'Mari berpikir dari sudut pandang经营者.', tags: ['perspective', 'work'] },
  { id: 'norm-038', japanese: '自体', reading: 'じたい', romaji: 'jitai', meaning: 'as a whole, in itself', meaningId: 'secara keseluruhan', type: 'NOUN', rarity: 'ULTRA_RARE', element: 'NORMAL', jlptLevel: 'N5', cardArtUrl: '', exampleSentence: '人生自体が旅です。', exampleTranslation: 'Hidup itu sendiri adalah perjalanan.', tags: ['philosophy', 'life'] },
];

// ============================================================
// ASSEMBLE ALL CARDS
// ============================================================
function buildCard(raw: Omit<JapaneseCard, 'hp' | 'attackPower' | 'defenseRating'>): JapaneseCard {
  const hpRange = RARITY_STATS[raw.rarity].hp;
  const atkRange = RARITY_STATS[raw.rarity].attack;
  const hp = hpRange[0] + Math.floor(Math.random() * (hpRange[1] - hpRange[0]));
  const attackPower = atkRange[0] + Math.floor(Math.random() * (atkRange[1] - atkRange[0]));

  return {
    ...raw,
    hp,
    attackPower,
    defenseRating: DEFENSE_BY_TYPE[raw.type],
  };
}

export const ALL_CARDS: JapaneseCard[] = [
  ...VERBS.map(buildCard),
  ...NOUNS.map(buildCard),
  ...ADJECTIVES.map(buildCard),
  ...PARTICLES.map(buildCard),
  ...NUMBERS.map(buildCard),
  ...NORMAL.map(buildCard),
];

// Quick lookup
export const CARDS_BY_ID = new Map(ALL_CARDS.map(c => [c.id, c]));

// Alias for JankenGame and other components
export const allJapaneseCards = ALL_CARDS;

// Filter helpers
export const getCardsByElement = (element: Element) => ALL_CARDS.filter(c => c.element === element);
export const getCardsByRarity = (rarity: Rarity) => ALL_CARDS.filter(c => c.rarity === rarity);
export const getCardsByType = (type: CardType) => ALL_CARDS.filter(c => c.type === type);
export const searchCards = (query: string) => {
  const q = query.toLowerCase();
  return ALL_CARDS.filter(c =>
    c.japanese.includes(q) ||
    c.reading.includes(q) ||
    c.romaji.toLowerCase().includes(q) ||
    c.meaning.toLowerCase().includes(q)
  );
};

console.log(`[KanjiMon] Loaded ${ALL_CARDS.length} cards`);
