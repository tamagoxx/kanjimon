import { describe, it, expect } from 'vitest';
import { mergeRecentRuns } from './recentActivityAggregator';
import type { KanjiDropRunStats } from '@/store/kanjiDropStore';
import type { MemoryMatchRunStats } from '@/store/memoryMatchStore';
import type { KanjiStackRunStats } from '@/store/kanjiStackStore';

const kd = (overrides: Partial<KanjiDropRunStats> = {}): KanjiDropRunStats => ({
  score: 0,
  wave: 1,
  kills: 0,
  maxCombo: 0,
  durationSec: 0,
  destroyed: [],
  playedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const mm = (overrides: Partial<MemoryMatchRunStats> = {}): MemoryMatchRunStats => ({
  score: 0,
  pairsMatched: 0,
  totalPairs: 6,
  maxCombo: 0,
  durationSec: 0,
  playedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const ks = (overrides: Partial<KanjiStackRunStats> = {}): KanjiStackRunStats => ({
  score: 0,
  level: 1,
  totalLines: 0,
  maxCombo: 0,
  durationSec: 0,
  playedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

describe('mergeRecentRuns', () => {
  it('returns empty array when all sources empty', () => {
    expect(mergeRecentRuns({ kanjiDrop: [], memoryMatch: [], kanjiStack: [] })).toEqual([]);
  });

  it('tags each run with correct source', () => {
    const runs = mergeRecentRuns({
      kanjiDrop: [kd({ score: 100, playedAt: '2026-01-01T00:00:00.000Z' })],
      memoryMatch: [],
      kanjiStack: [ks({ score: 200, playedAt: '2026-01-02T00:00:00.000Z' })],
    });
    expect(runs[0].source).toBe('kanji-stack');
    expect(runs[1].source).toBe('kanji-drop');
  });

  it('sorts DESC by playedAt across all sources', () => {
    const runs = mergeRecentRuns({
      kanjiDrop: [kd({ playedAt: '2026-01-02T00:00:00.000Z', score: 100 })],
      memoryMatch: [mm({ playedAt: '2026-01-05T00:00:00.000Z', score: 200 })],
      kanjiStack: [ks({ playedAt: '2026-01-03T00:00:00.000Z', score: 300 })],
    });
    expect(runs.map((r) => r.score)).toEqual([200, 300, 100]);
    expect(runs.map((r) => r.playedAt)).toEqual([
      '2026-01-05T00:00:00.000Z',
      '2026-01-03T00:00:00.000Z',
      '2026-01-02T00:00:00.000Z',
    ]);
  });

  it('respects limit parameter', () => {
    const runs = mergeRecentRuns(
      {
        kanjiDrop: [
          kd({ playedAt: '2026-01-01T00:00:00.000Z' }),
          kd({ playedAt: '2026-01-02T00:00:00.000Z' }),
        ],
        memoryMatch: [mm({ playedAt: '2026-01-03T00:00:00.000Z' })],
        kanjiStack: [ks({ playedAt: '2026-01-04T00:00:00.000Z' })],
      },
      2,
    );
    expect(runs).toHaveLength(2);
    expect(runs[0].playedAt).toBe('2026-01-04T00:00:00.000Z');
    expect(runs[1].playedAt).toBe('2026-01-03T00:00:00.000Z');
  });

  it('populates extra with source-specific fields', () => {
    const runs = mergeRecentRuns({
      kanjiDrop: [kd({ wave: 7, score: 500 })],
      memoryMatch: [mm({ pairsMatched: 6, totalPairs: 6, score: 300 })],
      kanjiStack: [ks({ level: 5, totalLines: 12, score: 1000 })],
    });
    const kdRun = runs.find((r) => r.source === 'kanji-drop');
    const mmRun = runs.find((r) => r.source === 'memory-match');
    const ksRun = runs.find((r) => r.source === 'kanji-stack');
    expect(kdRun?.extra?.wave).toBe(7);
    expect(mmRun?.extra?.pairsMatched).toBe(6);
    expect(ksRun?.extra?.level).toBe(5);
    expect(ksRun?.extra?.totalLines).toBe(12);
  });

  it('handles multiple runs from same source', () => {
    const runs = mergeRecentRuns({
      kanjiDrop: [
        kd({ playedAt: '2026-01-03T00:00:00.000Z', score: 100 }),
        kd({ playedAt: '2026-01-01T00:00:00.000Z', score: 50 }),
      ],
      memoryMatch: [],
      kanjiStack: [],
    });
    expect(runs).toHaveLength(2);
    expect(runs[0].score).toBe(100);
    expect(runs[1].score).toBe(50);
  });
});
