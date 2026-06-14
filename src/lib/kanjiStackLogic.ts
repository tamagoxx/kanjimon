// ============================================================
// kanjiStackLogic.ts — Pure game logic for Kanji Stack (Tetris)
// ============================================================
// Different mechanic from Kanji Drop (typing) and Memory Match
// (flipping). Pure spatial puzzle — pieces fall, rotate, lock,
// rows clear. Each cell of a tetromino displays a kanji glyph;
// learning is passive (visual exposure during play).
// ============================================================

// ---- Constants ----
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Standard Tetris scoring: 1=100, 2=300, 3=500, 4=800
const LINE_SCORES: Record<number, number> = { 1: 100, 2: 300, 3: 500, 4: 800 };

// Seven standard tetrominoes (1 = filled, 0 = empty)
const TETROMINOES: number[][][] = [
  // I
  [[1, 1, 1, 1]],
  // O
  [[1, 1], [1, 1]],
  // T
  [[1, 1, 1], [0, 1, 0]],
  // S
  [[0, 1, 1], [1, 1, 0]],
  // Z
  [[1, 1, 0], [0, 1, 1]],
  // J
  [[1, 0, 0], [1, 1, 1]],
  // L
  [[0, 0, 1], [1, 1, 1]],
];

// ---- Types ----
export interface KanjiStackPool {
  kanji: string;
  romaji: string;
  meaning: string;
}

export interface Cell {
  kanji: string;
}

export type Board = (Cell | null)[][];

export interface ActivePiece {
  /** 2D shape, 1 = filled, 0 = empty */
  shape: number[][];
  /** kanji to display in each filled cell. Same length as filled cells. */
  kanjis: string[];
  /** x position (left edge of shape) */
  x: number;
  /** y position (top edge of shape) */
  y: number;
}

export interface StepResult {
  board: Board;
  piece: ActivePiece;
  locked: boolean;
  /** Non-null when locked and the spawn position would overlap */
  gameOver: boolean;
}

// ---- Board ----
export function createBoard(width: number = BOARD_WIDTH, height: number = BOARD_HEIGHT): Board {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => null),
  );
}

// ---- Pieces ----
export function generatePiece(
  pool: KanjiStackPool[],
  rng: () => number = Math.random,
): ActivePiece {
  const shape = TETROMINOES[Math.floor(rng() * TETROMINOES.length)];
  const cellCount = shape.flat().filter((c) => c === 1).length;
  const kanjis: string[] = [];
  for (let i = 0; i < cellCount; i++) {
    if (pool.length === 0) {
      kanjis.push('?');
    } else {
      const idx = Math.floor(rng() * pool.length);
      kanjis.push(pool[idx].kanji);
    }
  }
  return { shape, kanjis, x: 0, y: 0 };
}

export function rotateShape(shape: number[][]): number[][] {
  // 90° CW: new[i][j] = old[H - 1 - j][i]
  const H = shape.length;
  const W = shape[0].length;
  const rotated: number[][] = [];
  for (let i = 0; i < W; i++) {
    const row: number[] = [];
    for (let j = 0; j < H; j++) {
      row.push(shape[H - 1 - j][i]);
    }
    rotated.push(row);
  }
  return rotated;
}

// ---- Placement ----
export function canPlaceShape(board: Board, shape: number[][], x: number, y: number): boolean {
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j] !== 1) continue;
      const bx = x + j;
      const by = y + i;
      if (bx < 0 || bx >= board[0].length) return false;
      if (by < 0 || by >= board.length) return false;
      if (board[by][bx] !== null) return false;
    }
  }
  return true;
}

export function placeShape(
  board: Board,
  shape: number[][],
  kanjis: string[],
  x: number,
  y: number,
): Board {
  // Immutable: shallow copy rows that change.
  const rowsToCopy = new Set<number>();
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j] === 1) {
        rowsToCopy.add(y + i);
      }
    }
  }
  const next = board.map((row, idx) => (rowsToCopy.has(idx) ? [...row] : row));

  let kanjiIdx = 0;
  for (let i = 0; i < shape.length; i++) {
    for (let j = 0; j < shape[i].length; j++) {
      if (shape[i][j] !== 1) continue;
      const k = kanjis[kanjiIdx++] ?? '?';
      next[y + i][x + j] = { kanji: k };
    }
  }
  return next;
}

// ---- Line clearing ----
export function clearFullRows(board: Board): { board: Board; rowsCleared: number } {
  const surviving: Board = [];
  let rowsCleared = 0;
  for (let y = 0; y < board.length; y++) {
    const isFull = board[y].every((cell) => cell !== null);
    if (isFull) {
      rowsCleared++;
    } else {
      surviving.push(board[y]);
    }
  }
  // Pad with empty rows at the top
  const emptyRows: Board = Array.from(
    { length: rowsCleared },
    () => Array.from({ length: board[0].length }, () => null),
  );
  return { board: [...emptyRows, ...surviving], rowsCleared };
}

// ---- Gravity ----
export function stepGravity(board: Board, piece: ActivePiece): StepResult {
  // Try to move down 1 row
  if (canPlaceShape(board, piece.shape, piece.x, piece.y + 1)) {
    return {
      board,
      piece: { ...piece, y: piece.y + 1 },
      locked: false,
      gameOver: false,
    };
  }
  // Can't move down → lock the piece
  const locked = placeShape(board, piece.shape, piece.kanjis, piece.x, piece.y);
  return {
    board: locked,
    piece, // returned unchanged; caller spawns new piece
    locked: true,
    gameOver: false,
  };
}

// ---- Game over ----
export function isGameOver(board: Board, shape: number[][]): boolean {
  // Game over when no spawn position (top of board) can fit the shape
  for (let x = 0; x <= board[0].length - shape[0].length; x++) {
    if (canPlaceShape(board, shape, x, 0)) return false;
  }
  return true;
}

// ---- Scoring ----
export function calcLineScore(rowsCleared: number, level: number): number {
  if (rowsCleared <= 0) return 0;
  const base = LINE_SCORES[rowsCleared] ?? 0;
  return base * level;
}
