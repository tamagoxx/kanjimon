// ============================================================
// KanjiMon — Core Type Definitions
// ============================================================

// --- Card Types ---
export type CardType = 'VERB' | 'NOUN' | 'ADJECTIVE' | 'PARTICLE';
export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'ULTRA_RARE' | 'LIMITED_EDITION' | 'LEGENDARY' | 'MYTHICAL';
export type Element = 'FIRE' | 'WATER' | 'GRASS' | 'ELECTRIC' | 'PSYCHIC' | 'NORMAL';
export type ElementEssence = 'FIRE_ESSENCE' | 'WATER_ESSENCE' | 'GRASS_ESSENCE' | 'ELECTRIC_ESSENCE' | 'PSYCHIC_ESSENCE' | 'NORMAL_ESSENCE';

// --- Pokemon Moves ---
export interface PokemonMove {
  id: number;
  name: string;
  accuracy: number;       // 0-100 percentage
  power: number;          // base damage (0 if status)
  pp: number;             // uses per battle
  type: string;           // elemental type e.g. "fire", "water"
  category: 'physical' | 'special' | 'status';
  description: string;
  drain: number;           // HP drain % (leech seed type)
  recoil: number;          // damage taken by user %
  critRate: number;        // additional crit chance %
  priority: number;        // turn order priority
  minHits?: number;        // for multi-hit moves
  maxHits?: number;
}

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
export type QuestType = 'LEARN' | 'BATTLE' | 'MODULE' | 'REVIEW' | 'STREAK' | 'COLLECT';

export interface DailyQuest {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  target: number;
  progress: number;
  xpReward: number;
  diamondReward?: number;
  cardReward?: number;
  completed: boolean;
  claimed?: boolean;
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

// --- Card Fusion ---
export interface FusedCard {
  id: string;                  // original fused card ID (unique per fusion)
  parentCards: [string, string]; // card IDs that were fused
  // Base stats from the higher-rarity parent
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  level: number;                // starts at 1, can be leveled
  exp: number;                  // current exp toward next level
  fusionCount: number;         // how many times this card has been fused
  learnedAt: string;            // when this fusion result was created
}

export type FusionRarityBoost = {
  COMMON: 'UNCOMMON';
  UNCOMMON: 'RARE';
  RARE: 'ULTRA_RARE';
  ULTRA_RARE: 'ULTRA_RARE'; // max level
};

export interface FusionRecipe {
  resultRarity: Rarity;
  cost: number; // diamonds to fuse
  statBonus: {
    hp: number;
    attack: number;
    defense: number;
  };
}

export const FUSION_RECIPES: Record<Rarity, FusionRecipe> = {
  COMMON: {
    resultRarity: 'UNCOMMON',
    cost: 10,
    statBonus: { hp: 15, attack: 8, defense: 1 },
  },
  UNCOMMON: {
    resultRarity: 'RARE',
    cost: 25,
    statBonus: { hp: 25, attack: 15, defense: 2 },
  },
  RARE: {
    resultRarity: 'ULTRA_RARE',
    cost: 50,
    statBonus: { hp: 35, attack: 20, defense: 3 },
  },
  ULTRA_RARE: {
    resultRarity: 'LIMITED_EDITION',
    cost: 100,
    statBonus: { hp: 15, attack: 10, defense: 2 },
  },
  LIMITED_EDITION: {
    resultRarity: 'LEGENDARY',
    cost: 200,
    statBonus: { hp: 20, attack: 15, defense: 3 },
  },
  LEGENDARY: {
    resultRarity: 'MYTHICAL',
    cost: 500,
    statBonus: { hp: 30, attack: 20, defense: 5 },
  },
  MYTHICAL: {
    resultRarity: 'MYTHICAL',
    cost: 1000,
    statBonus: { hp: 5, attack: 5, defense: 1 },
  },
};

// --- Pokemon Fusion ---
export interface FusedPokemon {
  id: string;
  pokemonId: number;              // numeric ID for deck integration (e.g. 10001)
  parentPokemonIds: [number, number];
  name: string;             // combined or evolved name
  types: string[];
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  level: number;
  exp: number;
  fusionCount: number;
  learnedAt: string;
  element: string;
  image: string;
  rarity: Rarity;
  // Evolution tier (only for UR+ fusions)
  evolutionTier: 'NONE' | 'LIMITED_EDITION' | 'LEGENDARY' | 'MYTHICAL';
  elementEssence?: string; // the elemental essence bound to this fused Pokemon
}

export interface PokemonFusionRecipe {
  resultRarity: Rarity;
  cost: number;
  statBonus: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

export const POKEMON_FUSION_RECIPES: Record<Rarity, PokemonFusionRecipe> = {
  COMMON: {
    resultRarity: 'UNCOMMON',
    cost: 10,
    statBonus: { hp: 20, attack: 12, defense: 2, speed: 5 },
  },
  UNCOMMON: {
    resultRarity: 'RARE',
    cost: 25,
    statBonus: { hp: 35, attack: 20, defense: 3, speed: 8 },
  },
  RARE: {
    resultRarity: 'ULTRA_RARE',
    cost: 50,
    statBonus: { hp: 50, attack: 30, defense: 5, speed: 12 },
  },
  ULTRA_RARE: {
    resultRarity: 'LIMITED_EDITION',
    cost: 100,
    statBonus: { hp: 15, attack: 10, defense: 2, speed: 5 },
  },
  LIMITED_EDITION: {
    resultRarity: 'LEGENDARY',
    cost: 200,
    statBonus: { hp: 20, attack: 15, defense: 3, speed: 8 },
  },
  LEGENDARY: {
    resultRarity: 'MYTHICAL',
    cost: 500,
    statBonus: { hp: 30, attack: 20, defense: 5, speed: 12 },
  },
  MYTHICAL: {
    resultRarity: 'MYTHICAL',
    cost: 1000,
    statBonus: { hp: 5, attack: 5, defense: 1, speed: 2 },
  },
};

// Evolution tier requirements
export type EvolutionTier = 'NONE' | 'LIMITED_EDITION' | 'LEGENDARY' | 'MYTHICAL';

export interface EvolutionRequirement {
  stardust: number;
  japaneseCardCount: number;
  elementEssence?: string;
  additionalPokemon?: boolean; // need 1 extra UR
  resultTier: EvolutionTier;
  statBonus: { hp: number; attack: number; defense: number; speed: number };
}

export const EVOLUTION_REQUIREMENTS: Record<EvolutionTier, EvolutionRequirement> = {
  NONE: { stardust: 0, japaneseCardCount: 0, resultTier: 'NONE', statBonus: { hp: 0, attack: 0, defense: 0, speed: 0 } },
  LIMITED_EDITION: {
    stardust: 50,
    japaneseCardCount: 1,
    resultTier: 'LIMITED_EDITION',
    statBonus: { hp: 15, attack: 10, defense: 2, speed: 5 },
  },
  LEGENDARY: {
    stardust: 200,
    japaneseCardCount: 2,
    elementEssence: undefined, // must match one of the parent's elements
    additionalPokemon: true,   // needs 1 extra UR as sacrifice
    resultTier: 'LEGENDARY',
    statBonus: { hp: 25, attack: 18, defense: 4, speed: 10 },
  },
  MYTHICAL: {
    stardust: 500,
    japaneseCardCount: 3,
    elementEssence: undefined, // must match one of the parent's elements
    additionalPokemon: true,  // needs 1 LE + 1 UR as sacrifice
    resultTier: 'MYTHICAL',
    statBonus: { hp: 40, attack: 30, defense: 8, speed: 15 },
  },
};

export const RARITY_ORDER: Rarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'ULTRA_RARE', 'LIMITED_EDITION', 'LEGENDARY', 'MYTHICAL'];

export const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: '#c8c4d7',
  UNCOMMON: '#4bddb7',
  RARE: '#6c5ce7',
  ULTRA_RARE: '#f0bf63',
  LIMITED_EDITION: '#ff8c00',
  LEGENDARY: '#ff6b35',
  MYTHICAL: '#ff2d55',
};

export const RARITY_BORDER_COLORS: Record<Rarity, string> = {
  COMMON: '#888888',
  UNCOMMON: '#3cb371',
  RARE: '#9b59b6',
  ULTRA_RARE: '#f39c12',
  LIMITED_EDITION: '#ff6600',
  LEGENDARY: '#e74c3c',
  MYTHICAL: '#ff1493',
};
