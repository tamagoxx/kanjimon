// ============================================================
// KanjiMon — Core Type Definitions
// ============================================================

// --- Card Types ---
export type CardType = 'VERB' | 'NOUN' | 'ADJECTIVE' | 'PARTICLE';
export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'ULTRA_RARE';
export type Element = 'FIRE' | 'WATER' | 'GRASS' | 'ELECTRIC' | 'PSYCHIC' | 'NORMAL';

export interface JapaneseCard {
  id: string;
  japanese: string;         // 食べる
  reading: string;          // たべる
  romaji: string;           // taberu
  meaning: string;          // to eat (Indonesian: makan)
  meaningId: string;        // makan
  type: CardType;
  jlptLevel: 'N5';
  // Battle Stats
  hp: number;               // 60-200
  attackPower: number;      // 10-80
  defenseRating: number;    // 1-5
  specialAbility?: string;  // grammar pattern
  // Metadata
  rarity: Rarity;
  element: Element;
  cardArtUrl: string;
  // Learning Data
  exampleSentence: string;
  exampleTranslation: string;
  strokeOrderUrl?: string;   // kanji stroke animation
  tags: string[];
}

// --- User & Progression ---
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  badges: Badge[];
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export interface UserProgress {
  hiraganaProgress: number;   // 0-100
  katakanaProgress: number;
  kanjiProgress: number;
  vocabularyProgress: number;
  grammarProgress: number;
  streakDays: number;
  lastActiveDate: string;
}

// --- Collection ---
export interface OwnedCard {
  cardId: string;
  obtainedAt: string;
  isNew: boolean;
  card: JapaneseCard;
}

// --- Deck ---
export interface Deck {
  id: string;
  name: string;
  cardIds: string[];
  createdAt: string;
  updatedAt: string;
}

// --- Battle ---
export type BattlePhase = 'SETUP' | 'DRAW' | 'ACTION' | 'END' | 'VICTORY' | 'DEFEAT';
export type BattleAction = 'ATTACK' | 'STUDY' | 'DEFEND' | 'SPECIAL';

export interface BattleState {
  id: string;
  playerId: string;
  opponentId: string;
  opponentName: string;
  phase: BattlePhase;
  playerDeck: string[];          // card IDs
  playerHand: string[];
  playerActiveCard: string | null;
  playerDiscard: string[];
  aiDeck: string[];
  aiHand: string[];
  aiActiveCard: string | null;
  aiDiscard: string[];
  turn: number;
  isPlayerTurn: boolean;
  battleLog: BattleLogEntry[];
  studyQuestion: StudyQuestion | null;
  playerDefending: boolean;
  aiDefending: boolean;
}

export interface BattleLogEntry {
  turn: number;
  actor: 'player' | 'ai';
  action: BattleAction | 'DAMAGE' | 'DESTROY' | 'DRAW';
  description: string;
  damage?: number;
}

export interface StudyQuestion {
  question: string;         // "Apa arti dari 食べる?"
  correctAnswer: string;
  options: string[];        // 4 pilihan
  cardId: string;
  type: 'meaning' | 'reading' | 'kanji';
}

// --- AI Opponents ---
export interface AIOpponent {
  id: string;
  name: string;
  title: string;
  strategy: 'random' | 'aggressive' | 'defensive' | 'balanced';
  deckTheme: Element[];
  unlockLevel: number;
  avatarUrl: string;
}

// --- Daily Quests ---
export type QuestType = 'LEARN' | 'BATTLE' | 'MODULE' | 'REVIEW' | 'STREAK';

export interface DailyQuest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  cardReward?: number;
  completed: boolean;
}

// --- JLPT Simulation ---
export interface JLPTQuestion {
  id: string;
  section: 'moji' | 'bunpou' | 'dokkai';
  question: string;
  options: string[];
  correctAnswer: number;    // index
  explanation: string;
}

export interface JLPTResult {
  date: string;
  scores: {
    moji: number;
    bunpou: number;
    dokkai: number;
  };
  totalScore: number;
  passed: boolean;
}

// --- Leaderboard ---
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  battleWins: number;
}

// --- Module Content ---
export interface LearningModule {
  id: string;
  type: 'hiragana' | 'katakana' | 'kanji' | 'vocabulary' | 'grammar';
  title: string;
  description: string;
  totalItems: number;
  icon: string;
}

export interface VocabularyItem {
  japanese: string;
  reading: string;
  romaji: string;
  meaning: string;
  exampleSentence: string;
  exampleTranslation: string;
}

export interface KanjiItem {
  kanji: string;
  onYomi: string[];    // オン讀み
  kunYomi: string[];  // くん讀み
  meaning: string;
  strokeCount: number;
  radicals: string[];
  examples: VocabularyItem[];
}

export interface GrammarPattern {
  id: string;
  pattern: string;      // ~は~です
  meaning: string;
  formation: string;
  examples: VocabularyItem[];
  notes: string;
}
