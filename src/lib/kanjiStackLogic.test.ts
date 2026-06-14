// ============================================================
// kanjiStackLogic.test.ts — TDD tests for Kanji Stack pure logic
// ============================================================
// Tetris-style falling-kanji game. Each cell of a tetromino piece
// displays a kanji glyph; learning is passive (visual exposure
// during play). Different mechanic from Kanji Drop (typing) and
// Memory Match (flipping).
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  createBoard,
  generatePiece,
  rotateShape,
  canPlaceShape,
  placeShape,
  clearFullRows,
  stepGravity,
  isGameOver,
  calcLineScore,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  type KanjiStackPool,
  type ActivePiece,
} from './kanjiStackLogic';

// ---- Test pool (4-kanji piece: I, O, T, S) ----
const pool: KanjiStackPool[] = [
  { kanji: '\u4eba', romaji: 'hito', meaning: 'person' },     // 人
  { kanji: '\u65e5', romaji: 'hi', meaning: 'sun/day' },      // 日
  { kanji: '\u6708', romaji: 'tsuki', meaning: 'moon' },      // 月
  { kanji: '\u6c34', romaji: 'mizu', meaning: 'water' },      // 水
  { kanji: '\u706b', romaji: 'hi', meaning: 'fire' },        // 火
  { kanji: '\u6728', romaji: 'ki', meaning: 'tree' },        // 木
];

// Tetromino I (1x4): straight line
const I_SHAPE: number[][] = [
  [1],
  [1],
  [1],
  [1],
];

// Tetromino O (2x2): square
const O_SHAPE: number[][] = [
  [1, 1],
  [1, 1],
];

// Tetromino T (3x2): T-shape
const T_SHAPE: number[][] = [
  [1, 1, 1],
  [0, 1, 0],
];

// Tetromino S (3x2): S-shape
const S_SHAPE: number[][] = [
  [0, 1, 1],
  [1, 1, 0],
];

// ============================================================
// createBoard
// ============================================================
describe('createBoard', () => {
  it('returns a 10-wide x 20-tall grid of nulls by default', () => {
    const board = createBoard();
    expect(board.length).toBe(BOARD_HEIGHT);
    expect(board[0].length).toBe(BOARD_WIDTH);
    expect(board.every((row) => row.every((cell) => cell === null))).toBe(true);
  });

  it('respects custom width/height', () => {
    const board = createBoard(4, 6);
    expect(board.length).toBe(6);
    expect(board[0].length).toBe(4);
  });
});

// ============================================================
// generatePiece
// ============================================================
describe('generatePiece', () => {
  it('returns a piece with a shape (1s/0s) and same-length kanjis array', () => {
    const piece = generatePiece(pool, () => 0); // deterministic rng → I shape
    expect(piece.shape.length).toBeGreaterThan(0);
    const cellCount = piece.shape.flat().filter((c) => c === 1).length;
    expect(piece.kanjis.length).toBe(cellCount);
  });

  it('all kanjis come from the pool (or fallback "?" if pool smaller)', () => {
    const piece = generatePiece(pool, () => 0);
    const poolKanjis = new Set(pool.map((p) => p.kanji));
    for (const k of piece.kanjis) {
      expect(k === '?' || poolKanjis.has(k)).toBe(true);
    }
  });

  it('uses "?" when pool is empty', () => {
    const piece = generatePiece([], () => 0);
    expect(piece.kanjis.every((k) => k === '?')).toBe(true);
  });
});

// ============================================================
// rotateShape
// ============================================================
describe('rotateShape', () => {
  it('I-shape (4x1) becomes 1x4', () => {
    const rotated = rotateShape([[1], [1], [1], [1]]);
    expect(rotated).toEqual([[1, 1, 1, 1]]);
  });

  it('O-shape (2x2) stays 2x2', () => {
    const rotated = rotateShape([[1, 1], [1, 1]]);
    expect(rotated).toEqual([[1, 1], [1, 1]]);
  });

  it('T-shape (3x2) becomes 2x3 (90° CW: bar top→right, stem bottom→left)', () => {
    const rotated = rotateShape([[1, 1, 1], [0, 1, 0]]);
    // 90° CW: input (H=2 rows, W=3 cols) → output (3 rows, 2 cols)
    // new[i][j] = old[H-1-j][i] = old[1-j][i]
    //   i=0: j=0 → old[1][0]=0, j=1 → old[0][0]=1 → row [0, 1]
    //   i=1: j=0 → old[1][1]=1, j=1 → old[0][1]=1 → row [1, 1]
    //   i=2: j=0 → old[1][2]=0, j=1 → old[0][2]=1 → row [0, 1]
    expect(rotated).toEqual([[0, 1], [1, 1], [0, 1]]);
  });
});

// ============================================================
// canPlaceShape
// ============================================================
describe('canPlaceShape', () => {
  it('returns true on empty board, in-bounds', () => {
    const board = createBoard();
    expect(canPlaceShape(board, O_SHAPE, 0, 0)).toBe(true);
  });

  it('returns false if any cell is out of bounds (left)', () => {
    const board = createBoard();
    expect(canPlaceShape(board, O_SHAPE, -1, 0)).toBe(false);
  });

  it('returns false if any cell is out of bounds (right)', () => {
    const board = createBoard();
    // O is 2 wide, board is 10 wide → max x = 8
    expect(canPlaceShape(board, O_SHAPE, 9, 0)).toBe(false);
  });

  it('returns false if any cell is out of bounds (bottom)', () => {
    const board = createBoard();
    // O is 2 tall, board is 20 tall → max y = 18
    expect(canPlaceShape(board, O_SHAPE, 0, 19)).toBe(false);
  });

  it('returns false if any cell collides with existing block', () => {
    const board = createBoard();
    board[5][3] = { kanji: 'X' };
    expect(canPlaceShape(board, O_SHAPE, 3, 4)).toBe(false);
  });

  it('returns true if shape has 0 cells (empty shape)', () => {
    const board = createBoard();
    expect(canPlaceShape(board, [[]], 0, 0)).toBe(true);
  });
});

// ============================================================
// placeShape
// ============================================================
describe('placeShape', () => {
  it('writes kanjis into board at the given position (immutable)', () => {
    const board = createBoard();
    const kanjis = ['A', 'B', 'C', 'D'];
    const next = placeShape(board, O_SHAPE, kanjis, 0, 0);
    // O at (0,0): cells (0,0), (0,1), (1,0), (1,1) get A, B, C, D
    expect(next[0][0]).toEqual({ kanji: 'A' });
    expect(next[0][1]).toEqual({ kanji: 'B' });
    expect(next[1][0]).toEqual({ kanji: 'C' });
    expect(next[1][1]).toEqual({ kanji: 'D' });
    // Original board untouched
    expect(board[0][0]).toBeNull();
  });

  it('skips cells where shape has 0 (empty cells)', () => {
    const board = createBoard();
    // T has 4 filled cells; pass 3 kanjis → 4th cell gets "?" fallback
    const kanjis = ['A', 'B', 'C'];
    const next = placeShape(board, T_SHAPE, kanjis, 0, 0);
    expect(next[0][0]).toEqual({ kanji: 'A' });
    expect(next[0][1]).toEqual({ kanji: 'B' });
    expect(next[0][2]).toEqual({ kanji: 'C' });
    expect(next[1][0]).toBeNull();
    expect(next[1][1]).toEqual({ kanji: '?' }); // 4th cell, no kanji left
    expect(next[1][2]).toBeNull();
  });
});

// ============================================================
// clearFullRows
// ============================================================
describe('clearFullRows', () => {
  it('returns same board + 0 cleared when no row is full', () => {
    const board = createBoard();
    board[19][0] = { kanji: 'A' };
    const { board: next, rowsCleared } = clearFullRows(board);
    expect(rowsCleared).toBe(0);
    expect(next[19][0]).toEqual({ kanji: 'A' });
  });

  it('clears a full row, shifts everything above down by 1', () => {
    const board = createBoard();
    // Fill row 19
    for (let x = 0; x < BOARD_WIDTH; x++) board[19][x] = { kanji: 'X' };
    // Put one cell at row 18
    board[18][0] = { kanji: 'A' };
    const { board: next, rowsCleared } = clearFullRows(board);
    expect(rowsCleared).toBe(1);
    // A should now be at row 19
    expect(next[19][0]).toEqual({ kanji: 'A' });
    // Row 18 should be all null (empty)
    expect(next[18].every((c) => c === null)).toBe(true);
  });

  it('clears multiple full rows (Tetris = 4)', () => {
    const board = createBoard();
    for (let y = 16; y < 20; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) board[y][x] = { kanji: 'X' };
    }
    const { rowsCleared } = clearFullRows(board);
    expect(rowsCleared).toBe(4);
  });
});

// ============================================================
// stepGravity
// ============================================================
describe('stepGravity', () => {
  const pieceAtTop: ActivePiece = {
    shape: O_SHAPE,
    kanjis: ['A', 'B', 'C', 'D'],
    x: 4,
    y: 0,
  };

  it('moves piece down by 1 if can place at (x, y+1)', () => {
    const board = createBoard();
    const result = stepGravity(board, pieceAtTop);
    expect(result.piece.y).toBe(1);
    expect(result.locked).toBe(false);
    // Board should not have the piece yet
    expect(result.board[0][4]).toBeNull();
  });

  it('locks piece and returns updated board when blocked', () => {
    const board = createBoard();
    // Block at row 2 — O at (4, 1) tries to move to (4, 2), collides
    board[2][4] = { kanji: 'BLOCK' };
    board[2][5] = { kanji: 'BLOCK' };
    const result = stepGravity(board, { ...pieceAtTop, y: 1 });
    expect(result.locked).toBe(true);
    // Board at row 1 should have the piece
    expect(result.board[1][4]).toEqual({ kanji: 'A' });
    expect(result.board[1][5]).toEqual({ kanji: 'B' });
  });

  it('locks piece at bottom of board', () => {
    const board = createBoard();
    const result = stepGravity(board, { ...pieceAtTop, y: 18 });
    expect(result.locked).toBe(true);
    expect(result.board[18][4]).toEqual({ kanji: 'A' });
  });
});

// ============================================================
// isGameOver
// ============================================================
describe('isGameOver', () => {
  it('returns false on empty board (piece can spawn)', () => {
    const board = createBoard();
    expect(isGameOver(board, O_SHAPE)).toBe(false);
  });

  it('returns true when shape cannot be placed at any spawn position', () => {
    const board = createBoard();
    // Fill the top 2 rows completely (O is 2 tall)
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) board[y][x] = { kanji: 'X' };
    }
    expect(isGameOver(board, O_SHAPE)).toBe(true);
  });
});

// ============================================================
// calcLineScore
// ============================================================
describe('calcLineScore', () => {
  it('1 line = 100', () => {
    expect(calcLineScore(1, 1)).toBe(100);
  });

  it('2 lines = 300', () => {
    expect(calcLineScore(2, 1)).toBe(300);
  });

  it('3 lines = 500', () => {
    expect(calcLineScore(3, 1)).toBe(500);
  });

  it('4 lines (Tetris) = 800', () => {
    expect(calcLineScore(4, 1)).toBe(800);
  });

  it('level 2 doubles the score', () => {
    expect(calcLineScore(1, 2)).toBe(200);
    expect(calcLineScore(4, 3)).toBe(2400);
  });

  it('0 lines = 0 score', () => {
    expect(calcLineScore(0, 1)).toBe(0);
  });
});
