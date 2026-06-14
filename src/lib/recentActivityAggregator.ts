import type { KanjiDropRunStats } from '@/store/kanjiDropStore';
import type { MemoryMatchRunStats } from '@/store/memoryMatchStore';
import type { KanjiStackRunStats } from '@/store/kanjiStackStore';

export type GameSource = 'kanji-drop' | 'memory-match' | 'kanji-stack';

export interface UnifiedRun {
  source: GameSource;
  score: number;
  maxCombo: number;
  durationSec: number;
  playedAt: string;
  extra?: {
    wave?: number;
    pairsMatched?: number;
    totalPairs?: number;
    level?: number;
    totalLines?: number;
  };
}

export interface RecentRunsInput {
  kanjiDrop: KanjiDropRunStats[];
  memoryMatch: MemoryMatchRunStats[];
  kanjiStack: KanjiStackRunStats[];
}

const DEFAULT_LIMIT = 5;

/**
 * Merge recent runs from all three game stores into a single time-sorted
 * list. Used by the home page to show "Aktivitas Terakhir" without
 * duplicating the same UI in each game mode's page.
 */
export function mergeRecentRuns(
  input: RecentRunsInput,
  limit: number = DEFAULT_LIMIT,
): UnifiedRun[] {
  const drop: UnifiedRun[] = input.kanjiDrop.map((r) => ({
    source: 'kanji-drop',
    score: r.score,
    maxCombo: r.maxCombo,
    durationSec: r.durationSec,
    playedAt: r.playedAt,
    extra: { wave: r.wave },
  }));

  const mem: UnifiedRun[] = input.memoryMatch.map((r) => ({
    source: 'memory-match',
    score: r.score,
    maxCombo: r.maxCombo,
    durationSec: r.durationSec,
    playedAt: r.playedAt,
    extra: { pairsMatched: r.pairsMatched, totalPairs: r.totalPairs },
  }));

  const stack: UnifiedRun[] = input.kanjiStack.map((r) => ({
    source: 'kanji-stack',
    score: r.score,
    maxCombo: r.maxCombo,
    durationSec: r.durationSec,
    playedAt: r.playedAt,
    extra: { level: r.level, totalLines: r.totalLines },
  }));

  return [...drop, ...mem, ...stack]
    .sort((a, b) => b.playedAt.localeCompare(a.playedAt))
    .slice(0, limit);
}

/**
 * Format an ISO timestamp as a short Indonesian relative time
 * string for the home page activity list. Pure: doesn't depend on
 * the Date.now() the user clicked reload at, so SSR/CSR mismatch is
 * avoided by computing the diff once on the client and never
 * hydrating it.
 */
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const then = new Date(iso).getTime();
  const diffSec = Math.max(0, Math.floor((now - then) / 1000));
  if (diffSec < 60) return 'baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} jam lalu`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} hari lalu`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth} bulan lalu`;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
