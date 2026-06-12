'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Dynamic import with SSR off — the game uses requestAnimationFrame and window
const KanjiDropGame = dynamic(
  () => import('@/components/games/KanjiDropGame'),
  { ssr: false, loading: () => <Loading /> }
);

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a1519' }}>
      <div className="text-center">
        <div className="text-4xl mb-2 animate-bounce">⏬</div>
        <div className="text-sm" style={{ color: '#c8c4d7' }}>Loading Kanji Drop…</div>
      </div>
    </div>
  );
}

export default function KanjiDropPage() {
  const router = useRouter();
  return <KanjiDropGame onExit={() => router.push('/')} />;
}
