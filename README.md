# KanjiMon (たまごもん)

> Belajar Bahasa Jepang Sambil Bertarung! Platform pembelajaran interaktif
> JLPT N5 dengan mekanisme Trading Card Game ala Pokémon.

KanjiMon is a Next.js 15 + TypeScript + Tailwind learning game where you
collect Japanese kanji as trading cards, fuse them, battle AI, and play
minigames (Kanji Drop). All progress can sync to the cloud via Supabase.

---

## Quick Start (Local-Only Mode — Zero Setup)

```bash
npm install
npm run dev
# open http://localhost:3210
```

The app runs in **local mode** out of the box. Your collection, currency,
and Kanji Drop runs are saved to `localStorage`. **No account needed.**

---

## Enable Cloud Sync (Supabase — Free Tier)

Cloud sync adds:

- Cross-device progress
- Global leaderboard with realtime updates
- Sign up / sign in (email + password)

### Setup (~5 min)

1. **Create a Supabase project**
   → https://supabase.com/dashboard → New project (~2 min to provision)

2. **Copy env template**
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit `.env.local` and paste your **Project URL** and **anon public key**
   from Supabase → Settings → API.

3. **Run the SQL migration**
   In Supabase → SQL Editor → New query, paste the contents of
   `supabase/migrations/0001_leaderboard_scores.sql` and click **Run**.

4. **Restart the dev server**
   ```bash
   npm run dev
   ```

5. **Verify** (optional but recommended)
   ```bash
   node scripts/check-supabase.mjs --live
   ```
   Should print all green ✓.

6. **Visit** http://localhost:3210/leaderboard
   Banner should say "Mode global" instead of "Mode lokal".

### Verification
The script `scripts/check-supabase.mjs` validates env, file presence, and
(optionally) live-pings your Supabase URL.

---

## Features

- **Card Collection** — 6 banners (Common, Rare, Epic, Legendary, Mythic, **Essence**)
- **Fusion** — Combine 3 cards to evolve with a stat bonus curve (1.5x/tier)
- **Battle** — Turn-based combat vs AI, Boss unlock after 5 wins
- **Kanji Drop** — Tapping-game where kanji fall, you type the reading
  (uses JLPT N5 vocabulary)
- **Pity System** — 50/100 guaranteed rare/jackpot pulls in Essence Gacha
- **Leaderboard** — Per-mode rankings, real-time updates (when cloud enabled)
- **Cloud Save** — `useCollectionStore` syncs to Supabase (5s debounce)
- **PWA-ready** — Manifest + service worker via `next-pwa`

---

## Project Structure

```
src/
  app/              # Next.js App Router pages
    gacha/          # Gacha banners (Common, Rare, ..., Essence)
    kanji-drop/     # Kanji Drop game page
    leaderboard/    # Global ranking page
    settings/       # Settings
    auth/           # Login (Local + Cloud tabs)
  components/
    games/          # Game components (KanjiDropGame, Battle, etc.)
    BattleArena, QuickActions, etc.
  store/            # Zustand stores (collection, kanjiDrop, auth, ...)
  lib/              # Pure logic + Supabase client (NO React imports)
    kanjiDropLogic, cardStats, evolutionChain,
    essenceGacha, essenceGachaPity,
    leaderboardLogic, leaderboardData, supabase, ...
supabase/
  migrations/       # SQL migrations to run in Supabase dashboard
scripts/
  check-supabase.mjs # Validate env + live-ping Supabase
```

### Key design rule
`src/lib/` is **pure** (no React, no Supabase, no fetch). Pure decision logic
is in `lib/<feature>.ts` with a sibling `lib/<feature>.test.ts`. UI fetches
data via a thin data-layer wrapper (e.g. `lib/leaderboardData.ts`) that
imports from the pure logic + adds the cloud/local fallback.

---

## Scripts

| Command                       | What it does                              |
| ----------------------------- | ----------------------------------------- |
| `npm run dev`                 | Dev server (port 3210)                    |
| `npm run build`               | Production build                          |
| `npm run start`               | Start production server                   |
| `npm test`                    | Run vitest in watch mode                  |
| `npx vitest run`              | Run vitest once                           |
| `npx tsc --noEmit`            | Type-check                                |
| `node scripts/check-supabase.mjs`        | Validate Supabase env         |
| `node scripts/check-supabase.mjs --live` | Validate + live-ping Supabase |

---

## TDD Discipline

- **Pure logic** → write `lib/<feature>.test.ts` FIRST (RED), then impl (GREEN)
- **Components** → keep side-effects thin, push math to `lib/`
- Run `npx vitest run` before committing

---

## Known Issues / Tech Debt

- 8 npm audit vulns (transitive deps in `next/next-pwa` + `postcss` + `serialize-javascript`).
  `npm audit fix --force` requires downgrading Next 15 → 9 and `next-pwa` → 2.
  Deferred — not reachable from app code, ships in offline service worker.
- Pre-existing TS errors in `lib/evolutionChain.ts` (sacrificeL280/L330), vitest
  display config, and `@/types` path. Unrelated to active features.

---

## License

Personal project. All kanji readings sourced from JLPT N5 public data.
