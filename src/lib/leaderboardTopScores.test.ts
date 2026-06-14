import { describe, it, expect } from 'vitest';
import {
  mapTopScores,
  mergeNewRowIntoTopN,
  gameModeLabel,
  gameModeIcon,
  type TopScoreEntry,
} from './leaderboardTopScores';
import type { LeaderboardScoreRow, GameMode } from '@/lib/supabase/types';

const row = (overrides: Partial<LeaderboardScoreRow>): LeaderboardScoreRow => ({
  id: '00000000-0000-0000-0000-000000000000',
  user_id: '00000000-0000-0000-0000-000000000000',
  username: 'player',
  game_mode: 'kanji-drop',
  score: 0,
  wave: 0,
  kills: 0,
  max_combo: 0,
  duration_sec: null,
  played_at: '2026-01-01T00:00:00.000Z',
  created_at: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('mapTopScores', () => {
  it('returns empty array for empty input', () => {
    expect(mapTopScores([])).toEqual([]);
  });

  it('assigns rank 1..N in input order', () => {
    const out = mapTopScores([
      row({ username: 'alice', score: 1000 }),
      row({ username: 'bob', score: 800 }),
      row({ username: 'carol', score: 600 }),
    ]);
    expect(out.map((e) => e.rank)).toEqual([1, 2, 3]);
    expect(out.map((e) => e.username)).toEqual(['alice', 'bob', 'carol']);
    expect(out.map((e) => e.score)).toEqual([1000, 800, 600]);
  });

  it('gives gold/silver/bronze medals to top 3, no medal after', () => {
    const out = mapTopScores([
      row({ username: 'a' }),
      row({ username: 'b' }),
      row({ username: 'c' }),
      row({ username: 'd' }),
      row({ username: 'e' }),
    ]);
    expect(out.map((e) => e.medal)).toEqual(['🥇', '🥈', '🥉', null, null]);
  });

  it('preserves gameMode from each row', () => {
    const out = mapTopScores([
      row({ game_mode: 'kanji-drop' }),
      row({ game_mode: 'kanji-stack' }),
    ]);
    expect(out[0].gameMode).toBe<GameMode>('kanji-drop');
    expect(out[1].gameMode).toBe<GameMode>('kanji-stack');
  });

  it('returns exactly N entries for N rows', () => {
    const rows = Array.from({ length: 5 }, (_, i) => row({ username: `u${i}`, score: 100 - i }));
    const out = mapTopScores(rows);
    expect(out).toHaveLength(5);
    expect(out[0]).toEqual<TopScoreEntry>({
      id: '00000000-0000-0000-0000-000000000000',
      rank: 1,
      username: 'u0',
      score: 100,
      gameMode: 'kanji-drop',
      medal: '🥇',
      playedAt: '2026-01-01T00:00:00.000Z',
    });
  });

  it('propagates each row id so React keys stay stable across reorders', () => {
    const out = mapTopScores([
      row({ id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', username: 'a' }),
      row({ id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', username: 'b' }),
      row({ id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', username: 'c' }),
    ]);
    expect(out.map((e) => e.id)).toEqual([
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
    ]);
  });

  it('propagates each row playedAt for relative time display', () => {
    const out = mapTopScores([
      row({ played_at: '2026-06-14T10:00:00.000Z', username: 'a' }),
      row({ played_at: '2026-06-14T11:30:00.000Z', username: 'b' }),
    ]);
    expect(out[0].playedAt).toBe('2026-06-14T10:00:00.000Z');
    expect(out[1].playedAt).toBe('2026-06-14T11:30:00.000Z');
  });
});

describe('gameModeLabel', () => {
  const cases: Array<[GameMode, string]> = [
    ['kanji-drop', 'Kanji Drop'],
    ['kanji-stack', 'Kanji Stack'],
    ['battle', 'Battle'],
    ['memory-match', 'Memory Match'],
  ];
  for (const [mode, expected] of cases) {
    it(`labels ${mode} → "${expected}"`, () => {
      expect(gameModeLabel(mode)).toBe(expected);
    });
  }
});

describe('gameModeIcon', () => {
  const cases: Array<[GameMode, string]> = [
    ['kanji-drop', '🌧️'],
    ['kanji-stack', '🧱'],
    ['battle', '⚔️'],
    ['memory-match', '🧠'],
  ];
  for (const [mode, expected] of cases) {
    it(`icon for ${mode} → "${expected}"`, () => {
      expect(gameModeIcon(mode)).toBe(expected);
    });
  }
});

describe('mergeNewRowIntoTopN', () => {
  // Helper to build a TopScoreEntry with sensible defaults
  const e = (overrides: Partial<TopScoreEntry>): TopScoreEntry => ({
    id: 'id-default',
    rank: 1,
    username: 'player',
    score: 0,
    gameMode: 'kanji-drop',
    medal: null,
    playedAt: '2026-06-14T10:00:00.000Z',
    ...overrides,
  });

  it('returns [newRow] with rank=1 for empty input', () => {
    const out = mergeNewRowIntoTopN([], e({ id: 'new1', score: 100 }), 5);
    expect(out).toEqual([e({ id: 'new1', score: 100, rank: 1, medal: '🥇' })]);
  });

  it('inserts new row at top when score beats #1', () => {
    const out = mergeNewRowIntoTopN(
      [
        e({ id: 'a', score: 100, rank: 1, medal: '🥇' }),
        e({ id: 'b', score: 80, rank: 2, medal: '🥈' }),
        e({ id: 'c', score: 60, rank: 3, medal: '🥉' }),
      ],
      e({ id: 'NEW', score: 200 }),
      5,
    );
    expect(out.map((x) => x.id)).toEqual(['NEW', 'a', 'b', 'c']);
    expect(out[0].rank).toBe(1);
    expect(out[0].medal).toBe('🥇');
  });

  it('inserts new row at correct middle rank', () => {
    const out = mergeNewRowIntoTopN(
      [
        e({ id: 'a', score: 100, rank: 1 }),
        e({ id: 'b', score: 80, rank: 2 }),
        e({ id: 'c', score: 60, rank: 3 }),
      ],
      e({ id: 'NEW', score: 90 }),
      5,
    );
    expect(out.map((x) => x.id)).toEqual(['a', 'NEW', 'b', 'c']);
    expect(out.map((x) => x.rank)).toEqual([1, 2, 3, 4]);
  });

  it('appends new row at end when within cap and score is lowest', () => {
    const out = mergeNewRowIntoTopN(
      [e({ id: 'a', score: 100 }), e({ id: 'b', score: 80 })],
      e({ id: 'NEW', score: 50 }),
      5,
    );
    expect(out.map((x) => x.id)).toEqual(['a', 'b', 'NEW']);
    expect(out[2].rank).toBe(3);
  });

  it('drops the lowest entry when list is full and new row cracks the cap', () => {
    const out = mergeNewRowIntoTopN(
      [
        e({ id: 'a', score: 100, rank: 1, medal: '🥇' }),
        e({ id: 'b', score: 80, rank: 2, medal: '🥈' }),
        e({ id: 'c', score: 60, rank: 3, medal: '🥉' }),
        e({ id: 'd', score: 40, rank: 4, medal: null }),
        e({ id: 'e', score: 20, rank: 5, medal: null }),
      ],
      e({ id: 'NEW', score: 90 }),
      5,
    );
    expect(out.map((x) => x.id)).toEqual(['a', 'NEW', 'b', 'c', 'd']);
    expect(out.map((x) => x.rank)).toEqual([1, 2, 3, 4, 5]);
    // 'a'=rank1🥇, 'NEW'=rank2🥈, 'b'=rank3🥉, 'c'=rank4null, 'd'=rank5null
    expect(out.map((x) => x.medal)).toEqual(['🥇', '🥈', '🥉', null, null]);
    // 'e' (score 20) was the lowest, got dropped
    expect(out.find((x) => x.id === 'e')).toBeUndefined();
  });

  it('returns list unchanged when full and new row does not crack the cap', () => {
    const fullList = [
      e({ id: 'a', score: 100, rank: 1, medal: '🥇' }),
      e({ id: 'b', score: 80, rank: 2, medal: '🥈' }),
      e({ id: 'c', score: 60, rank: 3, medal: '🥉' }),
      e({ id: 'd', score: 40, rank: 4, medal: null }),
      e({ id: 'e', score: 20, rank: 5, medal: null }),
    ];
    const out = mergeNewRowIntoTopN(fullList, e({ id: 'NEW', score: 10 }), 5);
    expect(out).toBe(fullList); // same reference (no-op)
  });

  it('inserts new row AFTER existing tie (stable sort)', () => {
    const out = mergeNewRowIntoTopN(
      [e({ id: 'a', score: 100 }), e({ id: 'b', score: 80 })],
      e({ id: 'NEW', score: 80 }),
      5,
    );
    // 'b' came first, so 'NEW' goes after 'b' on tie
    expect(out.map((x) => x.id)).toEqual(['a', 'b', 'NEW']);
  });

  it('re-assigns medals to top 3 only', () => {
    const out = mergeNewRowIntoTopN(
      [
        e({ id: 'a', score: 100, rank: 99, medal: null }),
        e({ id: 'b', score: 80, rank: 99, medal: null }),
        e({ id: 'c', score: 60, rank: 99, medal: null }),
        e({ id: 'd', score: 40, rank: 99, medal: null }),
      ],
      e({ id: 'NEW', score: 200 }),
      5,
    );
    // 4 old + 1 new = 5 entries; top 3 get medals
    expect(out.map((x) => x.medal)).toEqual(['🥇', '🥈', '🥉', null, null]);
  });
});
