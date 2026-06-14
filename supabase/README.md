# Supabase Setup — Kanjimon

Project: **hclncfbmfsovlfmsjnsg** (live, `sb_publishable_` 2025+ key format)

## One-time setup (apply migrations in order)

The migrations in this folder are SQL files. They have NEVER been applied
to the live database — the smoke test (`scripts/smoke-supabase.mjs`) fails
on every table check until you run them.

### Apply via Supabase Dashboard (easiest, no CLI)

1. Open <https://supabase.com/dashboard/project/hclncfbmfsovlfmsjnsg/sql>
2. Click **New query**
3. Open `001_init.sql` from this folder, copy contents, paste into the editor
4. Click **Run** (or Ctrl+Enter) — wait for "Success"
5. Click **New query** again
6. Open `0001_leaderboard_scores.sql`, copy contents, paste, **Run**
7. Verify with the smoke test (see below)

### Apply via Supabase CLI (if you have it linked)

```bash
# from project root
supabase db push
# or apply individually
supabase db execute --file supabase/migrations/001_init.sql
supabase db execute --file supabase/migrations/0001_leaderboard_scores.sql
```

## What each migration does

| File | Tables / features | Order |
|---|---|---|
| `001_init.sql` | `profiles`, `player_saves` (cloud save), `handle_updated_at()` trigger | 1st |
| `0001_leaderboard_scores.sql` | `leaderboard_scores` (cloud leaderboard), RLS policies, Realtime publication | 2nd |

Apply `001_init.sql` first — `leaderboard_scores` references `auth.users`
which exists by default, but if you later add FKs to `profiles`, order
matters.

## Verify

```bash
node scripts/smoke-supabase.mjs
```

Expected output:

```
URL: https://hclncfbmfsovlfmsjnsg.supabase.co
Key: sb_publishable_VhjJ5wwbP... (46 chars)

OK    leaderboard_scores   250ms  rows=?
Top 3 leaderboard_scores rows:
  (empty on first run)

2 passed, 0 failed
```

If `0 passed`, you haven't applied the migrations yet.
If `1 passed, 1 failed`, only one migration was applied.

## Schema highlights

**`profiles`** — 1:1 with `auth.users`. Holds username, level, XP. Used
to display leaderboard usernames without joining auth.users.

**`player_saves`** — 1 row per user, stores the full Zustand state as
JSONB. Has `schema_version` for future migrations of the state shape.

**`leaderboard_scores`** — append-only. One row per finished game run.
No UPDATE / DELETE (immutable history). RLS:
- `SELECT` — anyone (anon + authenticated) can read top scores
- `INSERT` — only authenticated, only their own `user_id`
- No update / delete

The `game_mode` column has a CHECK constraint matching the TypeScript
`GameMode` union:
```sql
check (game_mode in ('kanji-drop', 'battle', 'kanji-stack', 'memory-match'))
```

If you add a new game mode, BOTH:
1. Extend the union in `src/lib/leaderboardLogic.ts` AND `src/lib/supabase/types.ts`
2. Update the CHECK constraint here + apply a new migration
3. Extend `public/manifest.json` `shortcuts[]`

## Smoke test in CI

Add to your deploy pipeline:
```bash
node scripts/smoke-supabase.mjs || exit 1
```

Catches: env var missing, URL wrong, key revoked, table dropped, RLS
locking out the anon key.
