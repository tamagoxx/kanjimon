// ============================================================
// kanjiStackPool.ts — N5 single-kanji pool for Kanji Stack
// ============================================================
// Each piece in Kanji Stack (Tetris-style) is a tetromino where
// each filled cell holds a kanji glyph. We use a curated pool
// of ~40 single-kanji N5 characters grouped by theme for visual
// coherence during play. The "?" fallback is built into the
// logic layer — the pool just needs to be non-empty for the
// game to feel kanji-rich.
// ============================================================

import type { KanjiStackPool } from '@/lib/kanjiStackLogic';

/** Pool for Kanji Stack — 40 N5 single kanji, themed. */
export const KANJI_STACK_POOL: KanjiStackPool[] = [
  // ---- Nature (10) ----
  { kanji: '\u65e5', romaji: 'hi/nichi', meaning: 'sun/day' },        // 日
  { kanji: '\u6708', romaji: 'tsuki/getsu', meaning: 'moon/month' },  // 月
  { kanji: '\u6c34', romaji: 'mizu/sui', meaning: 'water' },          // 水
  { kanji: '\u706b', romaji: 'hi/ka', meaning: 'fire' },              // 火
  { kanji: '\u6728', romaji: 'ki/moku', meaning: 'tree' },            // 木
  { kanji: '\u91d1', romaji: 'kane/kin', meaning: 'gold/money' },     // 金
  { kanji: '\u571f', romaji: 'tsuchi/do', meaning: 'earth' },         // 土
  { kanji: '\u5c71', romaji: 'yama/san', meaning: 'mountain' },       // 山
  { kanji: '\u5ddd', romaji: 'kawa/sen', meaning: 'river' },          // 川
  { kanji: '\u96e8', romaji: 'ame/u', meaning: 'rain' },              // 雨

  // ---- Body (5) ----
  { kanji: '\u4eba', romaji: 'hito/jin', meaning: 'person' },         // 人
  { kanji: '\u76ee', romaji: 'me/moku', meaning: 'eye' },             // 目
  { kanji: '\u8033', romaji: 'mimi/ji', meaning: 'ear' },             // 耳
  { kanji: '\u53e3', romaji: 'kuchi/kou', meaning: 'mouth' },         // 口
  { kanji: '\u624b', romaji: 'te/shu', meaning: 'hand' },             // 手

  // ---- Numbers (10) ----
  { kanji: '\u4e00', romaji: 'hitori/ichi', meaning: 'one' },         // 一
  { kanji: '\u4e8c', romaji: 'futari/ni', meaning: 'two' },           // 二
  { kanji: '\u4e09', romaji: 'san', meaning: 'three' },               // 三
  { kanji: '\u56db', romaji: 'shi/yon', meaning: 'four' },            // 四
  { kanji: '\u4e94', romaji: 'go', meaning: 'five' },                 // 五
  { kanji: '\u516d', romaji: 'roku', meaning: 'six' },                // 六
  { kanji: '\u4e03', romaji: 'shichi/nana', meaning: 'seven' },       // 七
  { kanji: '\u516b', romaji: 'hachi', meaning: 'eight' },             // 八
  { kanji: '\u4e5d', romaji: 'kyuu/ku', meaning: 'nine' },            // 九
  { kanji: '\u5341', romaji: 'juu', meaning: 'ten' },                 // 十

  // ---- Directions (4) ----
  { kanji: '\u4e0a', romaji: 'ue/jou', meaning: 'up/above' },         // 上
  { kanji: '\u4e0b', romaji: 'shita/ka', meaning: 'down/below' },     // 下
  { kanji: '\u5de6', romaji: 'hidari/sa', meaning: 'left' },          // 左
  { kanji: '\u53f3', romaji: 'migi/u', meaning: 'right' },            // 右

  // ---- Adjectives (4) ----
  { kanji: '\u5927', romaji: 'ooki/dai', meaning: 'big' },            // 大
  { kanji: '\u5c0f', romaji: 'chiisai/shou', meaning: 'small' },      // 小
  { kanji: '\u65b0', romaji: 'atarashii/shin', meaning: 'new' },      // 新
  { kanji: '\u53e4', romaji: 'furui/ko', meaning: 'old' },            // 古

  // ---- Time (4) ----
  { kanji: '\u4eca', romaji: 'ima/kon', meaning: 'now' },             // 今
  { kanji: '\u5e74', romaji: 'toshi/nen', meaning: 'year' },          // 年
  { kanji: '\u6642', romaji: 'toki/ji', meaning: 'time/hour' },       // 時
  { kanji: '\u5206', romaji: 'fun/pun', meaning: 'minute' },          // 分

  // ---- Verbs (3) ----
  { kanji: '\u884c', romaji: 'iku/kou', meaning: 'go' },              // 行
  { kanji: '\u6765', romaji: 'kuru/rai', meaning: 'come' },           // 来
  { kanji: '\u898b', romaji: 'miru/ken', meaning: 'see' },            // 見
];

/** Number of pieces the kanji pool can fill (40 × 4 cells = 160 cells). */
export const KANJI_STACK_POOL_SIZE = KANJI_STACK_POOL.length;
