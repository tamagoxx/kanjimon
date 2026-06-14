-- ============================================================
-- KanjiMon — Fix signup trigger to default username
-- ============================================================
-- Bug: handle_new_user() inserts NULL into profiles.username
-- when signup doesn't pass user_metadata.username, violating
-- the NOT NULL constraint and returning "Database error saving
-- new user" to the client.
--
-- Fix: default username to 'user_<short-id>' if not provided.
-- Users can update their profile later to a real username.
--
-- Run via:  supabase db push
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'username',
      'user_' || replace(new.id::text, '-', '')
    )
  );
  return new;
end;
$$ language plpgsql security definer;

-- trigger already exists (on_auth_user_created after insert on auth.users)
-- no need to recreate — it references this function by name.
