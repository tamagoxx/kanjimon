// ============================================================
// /kanji-stack/page.tsx — RSC entry for Kanji Stack
// ============================================================
// Server-rendered shell. The game logic + UI is a client island
// (KanjiStackGame). We pass the kanji pool as an initial prop so
// the client doesn't need to fetch it on first render.
// ============================================================

import KanjiStackGame from '@/components/games/KanjiStackGame';
import { KANJI_STACK_POOL, KANJI_STACK_POOL_SIZE } from '@/data/kanjiStackPool';

// RSC: always render fresh — no caching for game state page
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Kanji Stack — Kanjimon',
  description: 'Tetris-mechanic kanji puzzle. Stack falling kanji pieces, clear rows, learn N5 kanji visually.',
};

export default function KanjiStackPage() {
  return (
    <main className="min-h-screen bg-[#0a1519] text-white p-4 md:p-6">
      <header className="max-w-3xl mx-auto mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          <span className="text-[#4bddb7]">Kanji</span>{' '}
          <span className="text-[#6c5ce7]">Stack</span>
        </h1>
        <p className="text-sm md:text-base text-gray-400">
          Tetris-mechanic kanji puzzle. Susun kanji yang jatuh, hapus baris, belajar N5
          secara visual. Spasi = drop cepat, panah = gerak/putar.
        </p>
      </header>
      <KanjiStackGame
        initialPool={KANJI_STACK_POOL}
        poolSize={KANJI_STACK_POOL_SIZE}
      />
    </main>
  );
}
