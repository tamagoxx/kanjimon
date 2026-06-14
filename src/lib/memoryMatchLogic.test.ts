// ============================================================
// Memory Match — Pure Game Logic — TDD test file
// ============================================================
//
// Memory Match concept:
// - Grid of N pairs (kanji + romaji cards)
// - Player flips 2 at a time; if they match (same kanji),
//   both stay face-up; otherwise they flip back.
// - Wave progression: more pairs per wave.
//
// These tests are written FIRST. Implementation comes after we
// watch each test fail. See the iron law in the TDD skill.
//
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  generateMemoryMatchBoard,
  flipCard,
  isBoardComplete,
  type MemoryCard,
  type MemoryMatchState,
} from './memoryMatchLogic';

const POOL: { kanji: string; romaji: string }[] = [
  { kanji: '水', romaji: 'mizu' },
  { kanji: '火', romaji: 'hi' },
  { kanji: '風', romaji: 'kaze' },
  { kanji: '山', romaji: 'yama' },
  { kanji: '人', romaji: 'hito' },
  { kanji: '日', romaji: 'hi' }, // note: romaji collision with 火
  { kanji: '月', romaji: 'tsuki' },
  { kanji: '木', romaji: 'ki' },
];

describe('MemoryMatchLogic — generateMemoryMatchBoard', () => {
  it('returns exactly pairs * 2 cards', () => {
    const board = generateMemoryMatchBoard(3, POOL);
    expect(board).toHaveLength(6);
  });

  it('contains exactly pairs unique kanji, each appearing exactly twice', () => {
    const board = generateMemoryMatchBoard(4, POOL);
    const counts = new Map<string, number>();
    for (const c of board) {
      counts.set(c.kanji, (counts.get(c.kanji) ?? 0) + 1);
    }
    expect(counts.size).toBe(4);
    for (const n of counts.values()) expect(n).toBe(2);
  });

  it('every card has a unique id', () => {
    const board = generateMemoryMatchBoard(4, POOL);
    const ids = new Set(board.map(c => c.id));
    expect(ids.size).toBe(board.length);
  });

  it('each pair has one kanji-side and one romaji-side card', () => {
    const board = generateMemoryMatchBoard(3, POOL);
    const byKanji = new Map<string, MemoryCard[]>();
    for (const c of board) {
      const arr = byKanji.get(c.kanji) ?? [];
      arr.push(c);
      byKanji.set(c.kanji, arr);
    }
    for (const pair of byKanji.values()) {
      const sides = pair.map(c => c.side).sort();
      expect(sides).toEqual(['kanji', 'romaji']);
    }
  });

  it('shuffles (different order across two calls)', () => {
    // For 8 cards the probability of identical shuffle twice in a row
    // is 1/(8!) ≈ 1/40320, so this is statistically safe.
    const a = generateMemoryMatchBoard(4, POOL).map(c => c.id).join(',');
    const b = generateMemoryMatchBoard(4, POOL).map(c => c.id).join(',');
    expect(a).not.toBe(b);
  });

  it('throws if pairs > pool size', () => {
    expect(() => generateMemoryMatchBoard(100, POOL)).toThrow();
  });

  it('all cards start isFlipped=false and isMatched=false', () => {
    const board = generateMemoryMatchBoard(3, POOL);
    for (const c of board) {
      expect(c.isFlipped).toBe(false);
      expect(c.isMatched).toBe(false);
    }
  });
});

describe('MemoryMatchLogic — flipCard', () => {
  it('flips a single face-down card to face-up', () => {
    const board = generateMemoryMatchBoard(2, POOL);
    const state: MemoryMatchState = { board, score: 0, combo: 0 };
    const target = board[0];
    const next = flipCard(state, target.id);
    const after = next.board.find(c => c.id === target.id)!;
    expect(after.isFlipped).toBe(true);
    expect(after.isMatched).toBe(false);
  });

  it('does not flip an already-matched card', () => {
    const board = generateMemoryMatchBoard(2, POOL);
    const state: MemoryMatchState = { board, score: 0, combo: 0 };
    const target = board[0];
    // Mark matched manually
    const matchedBoard = board.map(c =>
      c.id === target.id ? { ...c, isMatched: true, isFlipped: true } : c,
    );
    const next = flipCard({ ...state, board: matchedBoard }, target.id);
    // Should be no-op (or at least not change match status)
    const after = next.board.find(c => c.id === target.id)!;
    expect(after.isMatched).toBe(true);
  });

  it('on matching pair: marks both as matched, increments score, combo becomes 1', () => {
    const board = generateMemoryMatchBoard(2, POOL);
    // Find any kanji that has both sides in the board
    const kanjiInBoard = new Set(board.map(c => c.kanji));
    const [firstKanji] = kanjiInBoard;
    const pair = board.filter(c => c.kanji === firstKanji);
    expect(pair).toHaveLength(2);
    const state: MemoryMatchState = { board, score: 0, combo: 0 };
    const next1 = flipCard(state, pair[0].id);
    const next2 = flipCard(next1, pair[1].id);
    const after0 = next2.board.find(c => c.id === pair[0].id)!;
    const after1 = next2.board.find(c => c.id === pair[1].id)!;
    expect(after0.isMatched).toBe(true);
    expect(after1.isMatched).toBe(true);
    // Score should be > 0 and combo should be 1
    expect(next2.score).toBeGreaterThan(0);
    expect(next2.combo).toBe(1);
  });

  it('on mismatched pair: leaves both flipped (UI flips them back after timeout)', () => {
    const board = generateMemoryMatchBoard(2, POOL);
    const cardA = board[0];
    const cardB = board[board.findIndex(c => c.id === cardA.id) + 1];
    // Find two cards from different kanji
    const kanjiA = cardA.kanji;
    const cardFromOtherKanji = board.find(c => c.kanji !== kanjiA)!;
    const state: MemoryMatchState = { board, score: 0, combo: 0 };
    const next1 = flipCard(state, cardA.id);
    const next2 = flipCard(next1, cardFromOtherKanji.id);
    const aAfter = next2.board.find(c => c.id === cardA.id)!;
    const bAfter = next2.board.find(c => c.id === cardFromOtherKanji.id)!;
    expect(aAfter.isFlipped).toBe(true);
    expect(bAfter.isFlipped).toBe(true);
    expect(aAfter.isMatched).toBe(false);
    expect(bAfter.isMatched).toBe(false);
  });
});

describe('MemoryMatchLogic — isBoardComplete', () => {
  it('returns false when no cards are matched', () => {
    const board = generateMemoryMatchBoard(2, POOL);
    const state: MemoryMatchState = { board, score: 0, combo: 0 };
    expect(isBoardComplete(state)).toBe(false);
  });

  it('returns true when all cards are matched', () => {
    const board = generateMemoryMatchBoard(2, POOL);
    const matchedBoard = board.map(c => ({ ...c, isMatched: true, isFlipped: true }));
    const state: MemoryMatchState = { board: matchedBoard, score: 100, combo: 2 };
    expect(isBoardComplete(state)).toBe(true);
  });

  it('returns false when exactly one pair remains unmatched', () => {
    const board = generateMemoryMatchBoard(2, POOL);
    const kanjiGroups = new Map<string, MemoryCard[]>();
    for (const c of board) {
      const arr = kanjiGroups.get(c.kanji) ?? [];
      arr.push(c);
      kanjiGroups.set(c.kanji, arr);
    }
    const [k1, k2] = [...kanjiGroups.keys()];
    const partial = board.map(c =>
      c.kanji === k1 ? { ...c, isMatched: true, isFlipped: true } : c,
    );
    const state: MemoryMatchState = { board: partial, score: 50, combo: 1 };
    expect(isBoardComplete(state)).toBe(false);
  });
});
