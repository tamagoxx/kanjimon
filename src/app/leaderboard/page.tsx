// ============================================================
// /leaderboard — React Server Component
// ============================================================
//
// Fetches the initial cloud top scores server-side using the
// cookie-aware Supabase server client, then hands the data to
// the <LeaderboardClient> island for interactivity (mode tabs,
// window filter, realtime subscription, local-entry merge).
//
// RSC gives us:
//   - Better SEO: the initial leaderboard HTML is rendered on
//     the server, not the client (good for crawlers / link
//     previews).
//   - Faster first paint: no "Memuat..." flash on initial load —
//     the page renders with the server-fetched entries.
//   - No more 4s safety timer for the initial load — the server
//     either returns data or the catch block returns [].
//
// Trade-offs:
//   - We can't read the user's auth state on the server (it
//     lives in zustand/localStorage in the browser). The "your
//     rank" banner and local-entry merge still happen client-
//     side. The server just gives us a head start with the
//     global top-N.
//   - We still need the client component for the realtime
//     subscription, mode/window toggles, and live flash.
// ============================================================

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { fetchTopScoresFromServer } from '@/lib/leaderboardData.server';
import { readEnv } from '@/lib/env';
import { LeaderboardClient } from '@/components/leaderboard/LeaderboardClient';
import type { LeaderboardEntry } from '@/lib/leaderboardLogic';

export const dynamic = 'force-dynamic'; // always read fresh cookies

export default async function LeaderboardPage() {
  // 1. Determine if Supabase is configured. readEnv() never throws —
  //    it returns { ok, config?, errors } so we can render the local
  //    fallback message even when env is missing.
  const env = readEnv();
  const isSupabaseConfigured = env.ok;

  // 2. Try to fetch the initial cloud data. Any failure (env missing,
  //    server client throws, table missing, network down) → [].
  //    The client island still merges local runs on mount.
  let initialEntries: LeaderboardEntry[] = [];
  if (isSupabaseConfigured) {
    try {
      const supabase = await createServerSupabaseClient();
      initialEntries = await fetchTopScoresFromServer(supabase, {
        mode: 'kanji-drop',
        window: 'ALL_TIME',
        limit: 50,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      const message = err instanceof Error ? err.message : String(err);
      console.warn('[leaderboard:rsc] initial fetch failed:', message);
      initialEntries = [];
    }
  }

  return (
    <LeaderboardClient
      initialEntries={initialEntries}
      isSupabaseConfigured={isSupabaseConfigured}
      initialMode="kanji-drop"
      initialWindow="ALL_TIME"
    />
  );
}
