// ============================================================
// leaderboardData.server.test.ts — tests for the server-side
// leaderboard data layer used by the RSC /leaderboard page.
// ============================================================
//
// `fetchTopScoresFromServer(supabase, opts)` is the RSC equivalent
// of the browser-only `fetchTopScores`. It takes a Supabase
// client (created by `createServerSupabaseClient()`) and runs
// the same top-N query, returning `[]` on any failure (table
// missing, network down, RLS denied) so the page can fall back
// to local data.
// ============================================================

import { describe, it, expect, vi } from 'vitest';
import { fetchTopScoresFromServer } from './leaderboardData.server';
import type { LeaderboardEntry } from './leaderboardLogic';

// Minimal mock of the parts of SupabaseClient we actually use.
// We only need .from() → .select() → .eq() → .order() (x2) → .limit()
// to be chainable, then awaitable.
function makeMockClient(
  response: { data?: any[] | null; error?: { message: string } | null },
) {
  const queryChain: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn(() => Promise.resolve(response)),
  };
  const from = vi.fn(() => queryChain);
  return { client: { from } as any, queryChain };
}

const SAMPLE_ROW = {
  id: 'row-1',
  user_id: 'user-1',
  username: 'tama',
  game_mode: 'kanji-drop',
  score: 1500,
  wave: 5,
  kills: 42,
  max_combo: 7,
  played_at: '2026-06-14T12:00:00.000Z',
};

describe('fetchTopScoresFromServer', () => {
  it('returns entries mapped from CloudRow on success', async () => {
    const { client } = makeMockClient({ data: [SAMPLE_ROW], error: null });
    const result = await fetchTopScoresFromServer(client, {
      mode: 'kanji-drop',
      window: 'ALL_TIME',
    });
    expect(result).toHaveLength(1);
    const entry = result[0]!;
    expect(entry).toMatchObject({
      id: 'row-1',
      userId: 'user-1',
      username: 'tama',
      gameMode: 'kanji-drop',
      score: 1500,
      wave: 5,
      kills: 42,
      maxCombo: 7,
      playedAt: '2026-06-14T12:00:00.000Z',
    } satisfies Partial<LeaderboardEntry>);
  });

  it('queries the leaderboard_scores table for the requested mode', async () => {
    const { client, queryChain } = makeMockClient({ data: [], error: null });
    await fetchTopScoresFromServer(client, {
      mode: 'battle',
      window: 'TODAY',
      limit: 25,
    });
    expect(client.from).toHaveBeenCalledWith('leaderboard_scores');
    expect(queryChain.select).toHaveBeenCalledWith('*');
    expect(queryChain.eq).toHaveBeenCalledWith('game_mode', 'battle');
    expect(queryChain.order).toHaveBeenCalledWith('score', { ascending: false });
    expect(queryChain.order).toHaveBeenCalledWith('played_at', { ascending: false });
    expect(queryChain.limit).toHaveBeenCalledWith(100); // fetches more than limit
  });

  it('returns [] when Supabase returns an error (e.g. table missing)', async () => {
    const { client } = makeMockClient({
      data: null,
      error: { message: 'relation "leaderboard_scores" does not exist' },
    });
    const result = await fetchTopScoresFromServer(client, {
      mode: 'kanji-drop',
      window: 'ALL_TIME',
    });
    expect(result).toEqual([]);
  });

  it('returns [] on network error (TypeError from fetch)', async () => {
    const queryChain: any = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    };
    const client = { from: vi.fn(() => queryChain) } as any;
    const result = await fetchTopScoresFromServer(client, {
      mode: 'kanji-drop',
      window: 'ALL_TIME',
    });
    expect(result).toEqual([]);
  });

  it('returns [] when data is null (no rows)', async () => {
    const { client } = makeMockClient({ data: null, error: null });
    const result = await fetchTopScoresFromServer(client, {
      mode: 'kanji-drop',
      window: 'ALL_TIME',
    });
    expect(result).toEqual([]);
  });

  it('applies the requested time window filter to results', async () => {
    const now = Date.now();
    const rows = [
      { ...SAMPLE_ROW, id: 'r1', played_at: new Date(now - 1000).toISOString() },
      { ...SAMPLE_ROW, id: 'r2', played_at: new Date(now - 25 * 60 * 60 * 1000).toISOString() },
    ];
    const { client } = makeMockClient({ data: rows, error: null });
    const today = await fetchTopScoresFromServer(client, {
      mode: 'kanji-drop',
      window: 'TODAY',
    });
    // 25h ago is outside TODAY (24h)
    expect(today.map((e) => e.id)).toEqual(['r1']);
  });

  it('sorts results by score desc with played_at desc tiebreaker', async () => {
    const rows = [
      { ...SAMPLE_ROW, id: 'low', score: 100, played_at: '2026-06-14T12:00:00.000Z' },
      { ...SAMPLE_ROW, id: 'high', score: 500, played_at: '2026-06-14T10:00:00.000Z' },
      { ...SAMPLE_ROW, id: 'mid', score: 300, played_at: '2026-06-14T11:00:00.000Z' },
    ];
    const { client } = makeMockClient({ data: rows, error: null });
    const result = await fetchTopScoresFromServer(client, {
      mode: 'kanji-drop',
      window: 'ALL_TIME',
    });
    expect(result.map((e) => e.id)).toEqual(['high', 'mid', 'low']);
  });

  it('respects the optional limit parameter (default 50)', async () => {
    const rows = Array.from({ length: 5 }, (_, i) => ({
      ...SAMPLE_ROW,
      id: `r${i}`,
      score: 1000 - i * 10,
    }));
    const { client } = makeMockClient({ data: rows, error: null });
    const result = await fetchTopScoresFromServer(client, {
      mode: 'kanji-drop',
      window: 'ALL_TIME',
      limit: 3,
    });
    expect(result).toHaveLength(3);
  });
});
