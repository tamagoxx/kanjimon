// ============================================================
// Memory Match — Pure Game Logic
// ============================================================
// Minimal implementation. See memoryMatchLogic.test.ts for
// the behavioral contract.
//
// Rules:
// - A board has N pairs. Each pair = one kanji card + one romaji
//   card sharing the same kanji.
// - Player flips 2 cards. If they match (same kanji), both stay
//   face-up and score increments. Otherwise UI flips them back
//   after a short delay (UI responsibility, not ours).
// - Wave complete when all pairs matched.
// ============================================================

export type CardSide = 'kanji' | 'romaji';

export interface MemoryCard {
  id: string;            // unique per card
  kanji: string;         // the shared kanji (the pair key)
  romaji: string;        // the romaji/reading — shown on the romaji-side card
  side: CardSide;        // which side of the pair this card is
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryMatchState {
  board: MemoryCard[];
  score: number;
  combo: number;
}

// Base score per match (combo-multiplied at the UI layer if desired)
const BASE_MATCH_SCORE = 100;

// ---- Fisher-Yates shuffle (in-place, returns same array) ----
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---- Public API ----

export function generateMemoryMatchBoard(
  pairs: number,
  pool: { kanji: string; romaji: string }[],
): MemoryCard[] {
  if (pairs < 1) throw new Error(`pairs must be >= 1 (got ${pairs})`);
  if (pairs > pool.length) {
    throw new Error(`Not enough pool kanji: need ${pairs}, have ${pool.length}`);
  }

  // Pick the first N entries from a shuffled copy of the pool.
  // (Shuffled so different calls pick different kanji.)
  const shuffled = shuffle([...pool]).slice(0, pairs);

  const cards: MemoryCard[] = [];
  for (const entry of shuffled) {
    cards.push({
      id: `${entry.kanji}-kanji-${cards.length}`,
      kanji: entry.kanji,
      romaji: entry.romaji,
      side: 'kanji',
      isFlipped: false,
      isMatched: false,
    });
    cards.push({
      id: `${entry.kanji}-romaji-${cards.length}`,
      kanji: entry.kanji,
      romaji: entry.romaji,
      side: 'romaji',
      isFlipped: false,
      isMatched: false,
    });
  }
  return shuffle(cards);
}

export function flipCard(
  state: MemoryMatchState,
  cardId: string,
): MemoryMatchState {
  const card = state.board.find(c => c.id === cardId);
  if (!card) return state;

  // Cannot flip: matched card, or already flipped (still waiting for pair)
  if (card.isMatched || card.isFlipped) return state;

  // Flip the target card
  const boardAfterFlip = state.board.map(c =>
    c.id === cardId ? { ...c, isFlipped: true } : c,
  );

  // Check if exactly 2 cards are now flipped
  const flipped = boardAfterFlip.filter(c => c.isFlipped && !c.isMatched);
  if (flipped.length < 2) {
    return { ...state, board: boardAfterFlip };
  }

  // Exactly 2 flipped. Resolve.
  const [a, b] = flipped;
  const isMatch = a.kanji === b.kanji;

  if (isMatch) {
    const matchedBoard = boardAfterFlip.map(c =>
      c.id === a.id || c.id === b.id
        ? { ...c, isMatched: true } // keep isFlipped true
        : c,
    );
    return {
      board: matchedBoard,
      score: state.score + BASE_MATCH_SCORE,
      combo: state.combo + 1,
    };
  }

  // Mismatch: leave both flipped. UI is responsible for unflipping
  // them after a short delay (and resetting combo on next flip).
  return { ...state, board: boardAfterFlip };
}

export function isBoardComplete(state: MemoryMatchState): boolean {
  return state.board.every(c => c.isMatched);
}
