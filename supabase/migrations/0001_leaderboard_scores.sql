-- ============================================================
-- KanjiMon — Leaderboard
-- ============================================================
-- Run this in the Supabase SQL editor (or via supabase CLI) BEFORE
-- enabling cloud leaderboard in the app.
--
-- Updated 2026-06-14: game_mode constraint now includes 'kanji-stack' and
-- 'memory-match' to match the TypeScript GameMode union.
--
-- Schema:
--   - One row per finished run.
--   - (user_id, played_at) is the natural key for fetching "my runs".
--   - We index (game_mode, score DESC) so the top-N query is fast
--     even with 100k+ rows.
--
-- RLS:
--   - Anyone (incl. anon) can READ top scores — it's a public board.
--   - Only authenticated users can INSERT their own rows.
--   - No UPDATE / DELETE — scores are immutable.

create table if not exists public.leaderboard_scores (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  username    text not null,
  game_mode   text not null check (game_mode in ('kanji-drop', 'battle', 'kanji-stack', 'memory-match')),
  score       integer not null check (score >= 0),
  wave        integer not null default 0 check (wave >= 0),
  kills       integer not null default 0 check (kills >= 0),
  max_combo   integer not null default 0 check (max_combo >= 0),
  played_at   timestamptz not null default now()
);

create index if not exists leaderboard_scores_mode_score_idx
  on public.leaderboard_scores (game_mode, score desc, played_at desc);

create index if not exists leaderboard_scores_user_idx
  on public.leaderboard_scores (user_id, played_at desc);

-- ===== Row Level Security =====
alter table public.leaderboard_scores enable row level security;

-- Public read (anyone can see the board)
drop policy if exists "leaderboard read public" on public.leaderboard_scores;
create policy "leaderboard read public"
  on public.leaderboard_scores
  for select
  to anon, authenticated
  using (true);

-- Authenticated users can insert their own rows
drop policy if exists "leaderboard insert own" on public.leaderboard_scores;
create policy "leaderboard insert own"
  on public.leaderboard_scores
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- No update / delete — scores are immutable.
-- If you ever need to add a "delete my scores" feature, gate it behind
-- a service-role call from a server function, not a user policy.

-- ===== Realtime =====
-- Enable Realtime for the table so subscribeToNewScores() works.
alter publication supabase_realtime add table public.leaderboard_scores;
