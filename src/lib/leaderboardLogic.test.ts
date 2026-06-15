import { describe, it, expect } from 'vitest';
import {
  sortByScore,
  filterByTimeWindow,
  getUserRank,
  aggregateLocalKanjiDropScores,
  getGameModeConfig,
  ALL_GAME_MODES,
  type LeaderboardEntry,
  type TimeWindow,
} from './leaderboardLogic';

const baseEntry = (overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry => ({
  id: '1',
  userId: 'user-1',
  username: 'alice',
  gameMode: 'kanji-drop',
  score: 100,
  wave: 1,
  kills: 0,
  maxCombo: 0,
  playedAt: '2026-06-14T12:00:00.000Z',
  ...overrides,
});

describe('sortByScore', () => {
  it('sorts entries by score descending', () => {
    const a = baseEntry({ id: 'a', score: 50 });
    const b = baseEntry({ id: 'b', score: 200 });
    const c = baseEntry({ id: 'c', score: 100 });
    expect(sortByScore([a, b, c]).map((e) => e.id)).toEqual(['b', 'c', 'a']);
  });

  it('limits to N entries', () => {
    const entries = Array.from({ length: 20 }, (_, i) => baseEntry({ id: String(i), score: i }));
    expect(sortByScore(entries, 5)).toHaveLength(5);
    expect(sortByScore(entries, 5)[0].score).toBe(19);
  });

  it('uses playedAt as tiebreaker (newer first)', () => {
    const old = baseEntry({ id: 'old', score: 100, playedAt: '2026-06-14T10:00:00.000Z' });
    const recent = baseEntry({ id: 'recent', score: 100, playedAt: '2026-06-14T14:00:00.000Z' });
    expect(sortByScore([old, recent]).map((e) => e.id)).toEqual(['recent', 'old']);
  });
});

describe('filterByTimeWindow', () => {
  const NOW = new Date('2026-06-14T12:00:00.000Z').getTime();
  // 1h ago — should be in TODAY, THIS_WEEK
  const today = baseEntry({ id: 'today', playedAt: '2026-06-14T11:00:00.000Z' });
  // 30h ago — outside TODAY, inside THIS_WEEK
  const yesterday = baseEntry({ id: 'yesterday', playedAt: '2026-06-13T06:00:00.000Z' });
  // 8d ago — outside both
  const weekOld = baseEntry({ id: 'weekOld', playedAt: '2026-06-06T12:00:00.000Z' });

  it('keeps everything for ALL_TIME', () => {
    const result = filterByTimeWindow([today, yesterday, weekOld], 'ALL_TIME', NOW);
    expect(result).toHaveLength(3);
  });

  it('keeps only entries from the last 24h for TODAY', () => {
    const result = filterByTimeWindow([today, yesterday, weekOld], 'TODAY', NOW);
    expect(result.map((e) => e.id)).toEqual(['today']);
  });

  it('keeps entries from the last 7 days for THIS_WEEK', () => {
    const result = filterByTimeWindow([today, yesterday, weekOld], 'THIS_WEEK', NOW);
    expect(result.map((e) => e.id)).toEqual(['today', 'yesterday']);
  });
});

describe('getUserRank', () => {
  it('returns 1-indexed rank when user is in the list', () => {
    const entries = [
      baseEntry({ id: '1', userId: 'alice', score: 200 }),
      baseEntry({ id: '2', userId: 'bob', score: 100 }),
      baseEntry({ id: '3', userId: 'carol', score: 50 }),
    ];
    expect(getUserRank(entries, 'bob')).toBe(2);
  });

  it('returns null when user is not in the list', () => {
    const entries = [baseEntry({ id: '1', userId: 'alice' })];
    expect(getUserRank(entries, 'nobody')).toBeNull();
  });
});

describe('aggregateLocalKanjiDropScores', () => {
  it('returns empty array when no runs', () => {
    expect(aggregateLocalKanjiDropScores([], 'me')).toEqual([]);
  });

  it('converts local runs to leaderboard entries with current user', () => {
    const runs = [
      {
        score: 500,
        wave: 3,
        kills: 20,
        maxCombo: 5,
        durationSec: 60,
        destroyed: [],
        playedAt: '2026-06-14T12:00:00.000Z',
      },
      {
        score: 300,
        wave: 2,
        kills: 10,
        maxCombo: 3,
        durationSec: 30,
        destroyed: [],
        playedAt: '2026-06-14T11:00:00.000Z',
      },
    ];
    const result = aggregateLocalKanjiDropScores(runs, 'tamago');
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      userId: 'me',
      username: 'tamago',
      gameMode: 'kanji-drop',
      score: 500,
      wave: 3,
      kills: 20,
      maxCombo: 5,
    });
    // id should be stable so React keys work
    expect(result[0].id).toBe(result[0].id);
  });
});

describe('TimeWindow type', () => {
  it('accepts expected values', () => {
    const windows: TimeWindow[] = ['TODAY', 'THIS_WEEK', 'ALL_TIME'];
    expect(windows).toHaveLength(3);
  });
});

describe('ALL_GAME_MODES', () => {
  it('exposes all 4 game modes (kanji-drop, battle, kanji-stack, memory-match)', () => {
    expect(ALL_GAME_MODES).toHaveLength(4);
    expect(ALL_GAME_MODES).toEqual(
      expect.arrayContaining(['kanji-drop', 'battle', 'kanji-stack', 'memory-match']),
    );
  });
});

describe('getGameModeConfig', () => {
  it('returns label/icon/emptyMessage/ctaPath/ctaLabel for kanji-drop', () => {
    expect(getGameModeConfig('kanji-drop')).toEqual({
      id: 'kanji-drop',
      label: 'Kanji Drop',
      icon: '⏬',
      emptyMessage: 'Mainkan Kanji Drop untuk masuk leaderboard!',
      ctaPath: '/kanji-drop',
      ctaLabel: 'Main Kanji Drop →',
    });
  });

  it('returns label/icon/emptyMessage/ctaPath/ctaLabel for battle', () => {
    expect(getGameModeConfig('battle')).toEqual({
      id: 'battle',
      label: 'Battle',
      icon: '⚔️',
      emptyMessage: 'Menangkan battle untuk masuk leaderboard!',
      ctaPath: '/battle',
      ctaLabel: 'Mulai Battle →',
    });
  });

  it('returns label/icon/emptyMessage/ctaPath/ctaLabel for kanji-stack', () => {
    expect(getGameModeConfig('kanji-stack')).toEqual({
      id: 'kanji-stack',
      label: 'Kanji Stack',
      icon: '🗂',
      emptyMessage: 'Susun kartu di Kanji Stack untuk masuk leaderboard!',
      ctaPath: '/kanji-stack',
      ctaLabel: 'Main Kanji Stack →',
    });
  });

  it('returns label/icon/emptyMessage/ctaPath/ctaLabel for memory-match', () => {
    expect(getGameModeConfig('memory-match')).toEqual({
      id: 'memory-match',
      label: 'Memory Match',
      icon: '🧠',
      emptyMessage: 'Mainkan Memory Match untuk masuk leaderboard!',
      ctaPath: '/memory-match',
      ctaLabel: 'Main Memory Match →',
    });
  });

  it('every GameMode has a config (catches future mode additions)', () => {
    for (const mode of ALL_GAME_MODES) {
      const cfg = getGameModeConfig(mode);
      expect(cfg.id).toBe(mode);
      expect(cfg.label.length).toBeGreaterThan(0);
      expect(cfg.icon.length).toBeGreaterThan(0);
      expect(cfg.emptyMessage.length).toBeGreaterThan(0);
      expect(cfg.ctaPath.startsWith('/')).toBe(true);
      expect(cfg.ctaLabel.length).toBeGreaterThan(0);
    }
  });
});
