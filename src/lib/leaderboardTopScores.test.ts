import { describe, it, expect } from 'vitest';
import { mapTopScores, gameModeLabel, gameModeIcon, type TopScoreEntry } from './leaderboardTopScores';
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
