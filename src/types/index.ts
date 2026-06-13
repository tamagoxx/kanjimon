// ============================================================
// KanjiMon — Core Type Definitions
// ============================================================

// --- Card Types ---
export type CardType = 'VERB' | 'NOUN' | 'ADJECTIVE' | 'PARTICLE';
export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'ULTRA_RARE' | 'LIMITED_EDITION' | 'LEGENDARY' | 'MYTHICAL' | 'TRANSCENDENT' | 'CELESTIAL' | 'DIVINE' | 'ULTIMATE' | 'ETERNAL' | 'NIHIL' | 'PRIMORDIAL' | 'OMNIPOTENT';
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

// --- Battle --
export type BattlePhase = 'SETUP' | 'DRAW' | 'ACTION' | 'END' | 'VICTORY' | 'DEFEAT';
export type BattleAction = 'ATTACK' | 'STUDY' | 'DEFEND' | 'SPECIAL';
export type BossPhase = 'PHASE_1' | 'PHASE_2' | 'PHASE_3' | 'ENRAGED';
export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'INSANE';
export type BuffType = 'SHIELD' | 'BARRIER' | 'FURY' | 'FOCUS' | 'REGENERATION';
export type DebuffType = 'BURN' | 'SLOW' | 'POISON' | 'STUN' | 'WEAKEN';

// Status effect interface
export interface StatusEffect {
  type: BuffType | DebuffType;
  duration: number;      // turns remaining
  value: number;         // effect potency (damage, % boost, etc.)
  source: string;         // cardId that applied the effect
}

// Buff applied to a combatant
export interface Buff {
  type: BuffType;
  turnsRemaining: number;
  value: number;
}

// Debuff applied to a combatant
export interface Debuff {
  type: DebuffType;
  turnsRemaining: number;
  value: number;
}

// AI pattern tracking
export interface AIBehaviorPattern {
  lastActions: BattleAction[];
  defenseCount: number;
  attackCount: number;
  studyCount: number;
  lastPlayerAction: BattleAction | null;
}

export interface BattleState {
  id: string;
  playerId: string;
  opponentId: string;
  opponentName: string;
  phase: BattlePhase;
  // Boss battle system
  bossPhase: BossPhase;
  isBossBattle: boolean;
  bossChargingMove: boolean;       // Boss is telegraphing a special move
  bossCurrentMove: string | null; // Name of the charged move
  difficulty: Difficulty;
  // Decks and hands
  playerDeck: string[];          // card IDs
  playerHand: string[];
  playerActiveCard: string | null;
  playerDiscard: string[];
  aiDeck: string[];
  aiHand: string[];
  aiActiveCard: string | null;
  aiDiscard: string[];
  // Turn management
  turn: number;
  maxTurns: number;              // Turn limit (default 15)
  isPlayerTurn: boolean;
  // HP system with shields
  playerHP: number;
  playerMaxHP: number;
  playerShield: number;          // Shield absorbs damage
  aiHP: number;
  aiMaxHP: number;
  aiShield: number;
  // Buffs and debuffs
  playerBuffs: Buff[];
  playerDebuffs: Debuff[];
  aiBuffs: Buff[];
  aiDebuffs: Debuff[];
  // Status effects tracking
  playerStatusEffects: StatusEffect[];
  aiStatusEffects: StatusEffect[];
  // Battle state
  battleLog: BattleLogEntry[];
  studyQuestion: StudyQuestion | null;
  playerDefending: boolean;
  aiDefending: boolean;
  // AI behavior tracking
  aiBehavior: AIBehaviorPattern;
  // Rewards tracking
  battleRewardMultiplier: number; // Increases with win streak
  flawlessVictory: boolean;       // True if player never took damage
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

// --- AI Opponents --
export interface AIOpponent {
  id: string;
  name: string;
  title: string;
  strategy: 'random' | 'aggressive' | 'defensive' | 'balanced' | 'boss_adaptive';
  deckTheme: Element[];
  unlockLevel: number;
  avatarUrl: string;
  // Boss-specific properties
  isBoss?: boolean;
  maxHP?: number;
  phases?: BossPhase[];
  specialMoves?: string[];
  difficulty?: Difficulty;
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
  TRANSCENDENT: {
    resultRarity: 'TRANSCENDENT',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0 },
  },
  CELESTIAL: {
    resultRarity: 'CELESTIAL',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0 },
  },
  DIVINE: {
    resultRarity: 'DIVINE',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0 },
  },
  ULTIMATE: {
    resultRarity: 'ULTIMATE',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0 },
  },
  ETERNAL: {
    resultRarity: 'ETERNAL',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0 },
  },
  NIHIL: {
    resultRarity: 'NIHIL',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0 },
  },
  PRIMORDIAL: {
    resultRarity: 'PRIMORDIAL',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0 },
  },
  OMNIPOTENT: {
    resultRarity: 'OMNIPOTENT',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0 },
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
  TRANSCENDENT: {
    resultRarity: 'TRANSCENDENT',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0, speed: 0 },
  },
  CELESTIAL: {
    resultRarity: 'CELESTIAL',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0, speed: 0 },
  },
  DIVINE: {
    resultRarity: 'DIVINE',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0, speed: 0 },
  },
  ULTIMATE: {
    resultRarity: 'ULTIMATE',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0, speed: 0 },
  },
  ETERNAL: {
    resultRarity: 'ETERNAL',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0, speed: 0 },
  },
  NIHIL: {
    resultRarity: 'NIHIL',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0, speed: 0 },
  },
  PRIMORDIAL: {
    resultRarity: 'PRIMORDIAL',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0, speed: 0 },
  },
  OMNIPOTENT: {
    resultRarity: 'OMNIPOTENT',
    cost: 0,
    statBonus: { hp: 0, attack: 0, defense: 0, speed: 0 },
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

export const RARITY_ORDER: Rarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'ULTRA_RARE', 'LIMITED_EDITION', 'LEGENDARY', 'MYTHICAL', 'TRANSCENDENT', 'CELESTIAL', 'DIVINE', 'ULTIMATE', 'ETERNAL', 'NIHIL', 'PRIMORDIAL', 'OMNIPOTENT'];

export const RARITY_COLORS: Record<Rarity, string> = {
  COMMON: '#c8c4d7',
  UNCOMMON: '#4bddb7',
  RARE: '#6c5ce7',
  ULTRA_RARE: '#f0bf63',
  LIMITED_EDITION: '#ff8c00',
  LEGENDARY: '#ff6b35',
  MYTHICAL: '#ff2d55',
  TRANSCENDENT: '#00ffff',
  CELESTIAL: '#ffd700',
  DIVINE: '#ff00ff',
  ULTIMATE: '#ff4500',
  ETERNAL: '#ffffff',
  NIHIL: '#2d1b4e',        // void black with violet undertone
  PRIMORDIAL: '#001f3f',   // deep cosmic navy
  OMNIPOTENT: '#ffaa00',   // supercharged gold (distinct from ULTIMATE orange)
};

export const RARITY_BORDER_COLORS: Record<Rarity, string> = {
  COMMON: '#888888',
  UNCOMMON: '#3cb371',
  RARE: '#9b59b6',
  ULTRA_RARE: '#f39c12',
  LIMITED_EDITION: '#ff6600',
  LEGENDARY: '#e74c3c',
  MYTHICAL: '#ff1493',
  TRANSCENDENT: '#00cccc',
  CELESTIAL: '#cc9900',
  DIVINE: '#cc00cc',
  ULTIMATE: '#cc3300',
  ETERNAL: '#cccccc',
  NIHIL: '#6a0dad',        // indigo glow
  PRIMORDIAL: '#00ced1',   // dark turquoise glow
  OMNIPOTENT: '#ffd700',   // gold border
};

// ============================================================
// Card Evolution System (tiers above MYTHICAL)
// ============================================================

// Evolution materials - special items consumed during evolution
export type EvolutionMaterial =
  | 'COSMIC_DUST'      // Basic evolution material
  | 'CELESTIAL_SHARD'   // Mid-tier evolution material
  | 'DIVINE_ESSENCE'   // High-tier evolution material
  | 'ULTIMATE_CORE'    // Top-tier evolution material
  | 'ETERNAL_FRAGMENT' // Max-tier evolution material
  | 'VOID_SHARD'           // Beyond-eternity: ETERNAL → NIHIL
  | 'PRIMORDIAL_CRYSTAL'   // NIHIL → PRIMORDIAL
  | 'OMNIPOTENT_RUNE';     // PRIMORDIAL → OMNIPOTENT (final tier)

export const EVOLUTION_MATERIALS: Record<EvolutionMaterial, {
  name: string;
  description: string;
  icon: string;
  tierRequired: Rarity;
}> = {
  COSMIC_DUST: {
    name: 'Cosmic Dust',
    description: 'Stardust infused with cosmic energy. Used to evolve MYTHICAL cards.',
    icon: '✨',
    tierRequired: 'MYTHICAL',
  },
  CELESTIAL_SHARD: {
    name: 'Celestial Shard',
    description: 'A shard from a fallen star. Used to evolve TRANSCENDENT cards.',
    icon: '💎',
    tierRequired: 'TRANSCENDENT',
  },
  DIVINE_ESSENCE: {
    name: 'Divine Essence',
    description: 'Essence of divine power. Used to evolve CELESTIAL cards.',
    icon: '🌟',
    tierRequired: 'CELESTIAL',
  },
  ULTIMATE_CORE: {
    name: 'Ultimate Core',
    description: 'Core of ultimate power. Used to evolve DIVINE cards.',
    icon: '🔮',
    tierRequired: 'DIVINE',
  },
  ETERNAL_FRAGMENT: {
    name: 'Eternal Fragment',
    description: 'Fragment of eternity itself. Used to evolve ULTIMATE cards.',
    icon: '💫',
    tierRequired: 'ULTIMATE',
  },
  VOID_SHARD: {
    name: 'Void Shard',
    description: 'A fragment of the void between realities. Used to evolve ETERNAL cards.',
    icon: '🕳️',
    tierRequired: 'ETERNAL',
  },
  PRIMORDIAL_CRYSTAL: {
    name: 'Primordial Crystal',
    description: 'Crystal formed before time itself. Used to evolve NIHIL cards.',
    icon: '🌌',
    tierRequired: 'NIHIL',
  },
  OMNIPOTENT_RUNE: {
    name: 'Omnipotent Rune',
    description: 'A rune of absolute power. Used to evolve PRIMORDIAL cards. The final evolution material.',
    icon: '👁️',
    tierRequired: 'PRIMORDIAL',
  },
};

// Evolution tiers above MYTHICAL
export type EvoTier = 'TRANSCENDENT' | 'CELESTIAL' | 'DIVINE' | 'ULTIMATE' | 'ETERNAL' | 'NIHIL' | 'PRIMORDIAL' | 'OMNIPOTENT';

// Full evolution tier chain
export const EVO_TIER_ORDER: EvoTier[] = ['TRANSCENDENT', 'CELESTIAL', 'DIVINE', 'ULTIMATE', 'ETERNAL', 'NIHIL', 'PRIMORDIAL', 'OMNIPOTENT'];

// Stat boost percentage per evolution tier above base MYTHICAL
export const STAT_BOOST_PER_TIER: Record<EvoTier, number> = {
  TRANSCENDENT: 0.15,   // +15%
  CELESTIAL: 0.30,      // +30%
  DIVINE: 0.50,         // +50%
  ULTIMATE: 0.75,       // +75%
  ETERNAL: 1.00,        // +100%
  NIHIL: 1.50,          // +150% (beyond eternity)
  PRIMORDIAL: 2.00,     // +200% (before time)
  OMNIPOTENT: 2.50,     // +250% (absolute power, max tier)
};

// Evolution requirements for each tier
export interface EvoRequirement {
  gold: number;
  materials: Partial<Record<EvolutionMaterial, number>>;
  fusionCount?: number; // minimum fusion count required
  description: string;
}

export const EVO_REQUIREMENTS: Record<EvoTier, EvoRequirement> = {
  TRANSCENDENT: {
    gold: 10000,
    materials: { COSMIC_DUST: 3 },
    fusionCount: 0,
    description: 'Requires MYTHICAL card + Cosmic Dust',
  },
  CELESTIAL: {
    gold: 25000,
    materials: { COSMIC_DUST: 5, CELESTIAL_SHARD: 2 },
    fusionCount: 2,
    description: 'Requires TRANSCENDENT card + materials',
  },
  DIVINE: {
    gold: 50000,
    materials: { CELESTIAL_SHARD: 5, DIVINE_ESSENCE: 3 },
    fusionCount: 4,
    description: 'Requires CELESTIAL card + materials',
  },
  ULTIMATE: {
    gold: 100000,
    materials: { DIVINE_ESSENCE: 5, ULTIMATE_CORE: 3 },
    fusionCount: 6,
    description: 'Requires DIVINE card + materials',
  },
  ETERNAL: {
    gold: 250000,
    materials: { ULTIMATE_CORE: 5, ETERNAL_FRAGMENT: 3 },
    fusionCount: 8,
    description: 'Requires ULTIMATE card + materials',
  },
  NIHIL: {
    gold: 500000,
    materials: { ETERNAL_FRAGMENT: 5, VOID_SHARD: 3 },
    fusionCount: 10,
    description: 'Requires ETERNAL card + Void Shards. Pierce the veil of eternity.',
  },
  PRIMORDIAL: {
    gold: 1000000,
    materials: { VOID_SHARD: 5, PRIMORDIAL_CRYSTAL: 3 },
    fusionCount: 12,
    description: 'Requires NIHIL card + Primordial Crystal. Touch the time before time.',
  },
  OMNIPOTENT: {
    gold: 2000000,
    materials: { PRIMORDIAL_CRYSTAL: 5, OMNIPOTENT_RUNE: 3 },
    fusionCount: 15,
    description: 'Requires PRIMORDIAL card + Omnipotent Rune. The final evolution. Absolute power.',
  },
};

// Check if a card can be evolved to a specific tier
export function canEvolveToTier(
  currentRarity: Rarity,
  fusionCount: number = 0
): { canEvolve: boolean; nextTier: EvoTier | null } {
  const tierOrder: Rarity[] = ['COMMON', 'UNCOMMON', 'RARE', 'ULTRA_RARE', 'LIMITED_EDITION', 'LEGENDARY', 'MYTHICAL', 'TRANSCENDENT', 'CELESTIAL', 'DIVINE', 'ULTIMATE', 'ETERNAL', 'NIHIL', 'PRIMORDIAL', 'OMNIPOTENT'];

  const currentIndex = tierOrder.indexOf(currentRarity);

  // Can only evolve from MYTHICAL and above (except OMNIPOTENT which is max)
  if (currentRarity === 'OMNIPOTENT') {
    return { canEvolve: false, nextTier: null };
  }

  if (currentRarity === 'MYTHICAL') {
    return { canEvolve: true, nextTier: 'TRANSCENDENT' };
  }

  // For already evolved tiers, check if can go further
  if (currentRarity === 'TRANSCENDENT') return { canEvolve: true, nextTier: 'CELESTIAL' };
  if (currentRarity === 'CELESTIAL') return { canEvolve: true, nextTier: 'DIVINE' };
  if (currentRarity === 'DIVINE') return { canEvolve: true, nextTier: 'ULTIMATE' };
  if (currentRarity === 'ULTIMATE') return { canEvolve: true, nextTier: 'ETERNAL' };
  if (currentRarity === 'ETERNAL') return { canEvolve: true, nextTier: 'NIHIL' };
  if (currentRarity === 'NIHIL') return { canEvolve: true, nextTier: 'PRIMORDIAL' };
  if (currentRarity === 'PRIMORDIAL') return { canEvolve: true, nextTier: 'OMNIPOTENT' };

  return { canEvolve: false, nextTier: null };
}

// Get stat boost multiplier for evolved cards
export function getEvoStatMultiplier(currentRarity: Rarity): number {
  if (currentRarity === 'TRANSCENDENT') return 1 + STAT_BOOST_PER_TIER.TRANSCENDENT;
  if (currentRarity === 'CELESTIAL') return 1 + STAT_BOOST_PER_TIER.CELESTIAL;
  if (currentRarity === 'DIVINE') return 1 + STAT_BOOST_PER_TIER.DIVINE;
  if (currentRarity === 'ULTIMATE') return 1 + STAT_BOOST_PER_TIER.ULTIMATE;
  if (currentRarity === 'ETERNAL') return 1 + STAT_BOOST_PER_TIER.ETERNAL;
  if (currentRarity === 'NIHIL') return 1 + STAT_BOOST_PER_TIER.NIHIL;
  if (currentRarity === 'PRIMORDIAL') return 1 + STAT_BOOST_PER_TIER.PRIMORDIAL;
  if (currentRarity === 'OMNIPOTENT') return 1 + STAT_BOOST_PER_TIER.OMNIPOTENT;
  return 1;
}

// Extended OwnedCard to support evolution info
export interface EvolvedCard {
  cardId: string;
  evolutionTier: EvoTier;
  originalRarity: Rarity;
  boostedStats: {
    hp: number;
    attack: number;
    defense: number;
  };
  evolvedAt: string;
}
