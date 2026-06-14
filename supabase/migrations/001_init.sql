-- 001_init.sql
-- Kanjimon cloud save schema

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  level integer not null default 1,
  xp integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Player saves (full Zustand state as JSONB)
create table public.player_saves (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  state jsonb not null,
  schema_version integer not null default 1,
  updated_at timestamptz not null default now()
);

-- Auto-update updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_player_save_updated
  before update on public.player_saves
  for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.player_saves enable row level security;

create policy "users read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "users read own save"
  on public.player_saves for select
  using (auth.uid() = user_id);

create policy "users insert own save"
  on public.player_saves for insert
  with check (auth.uid() = user_id);

create policy "users update own save"
  on public.player_saves for update
  using (auth.uid() = user_id);
