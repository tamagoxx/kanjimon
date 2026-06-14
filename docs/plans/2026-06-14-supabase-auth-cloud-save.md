# Supabase Auth + Cloud Save Implementation Plan

> For Hermes: Use subagent-driven-development skill to implement task-by-task.

**Goal:** Replace localStorage-only auth with Supabase Auth + sync full Zustand state to Postgres so players can resume progress across devices.

**Architecture:**
- Supabase Auth (email/password + Google OAuth)
- Postgres `profiles` table (1:1 with auth.users) for username/level/xp
- Postgres `player_saves` table (1:1 with profile) for full Zustand state as JSONB
- Zustand stays as source of truth for instant UI; debounced (5s) auto-save to Supabase
- On login: pull state from DB → hydrate Zustand
- On signup: push current localStorage state to DB
- On logout: keep server data, clear client session

**Tech Stack:** Supabase JS v2, @tanstack/react-query (already installed), Zustand persist middleware

**TDD discipline:** Every task that produces code has RED → GREEN cycle. Mock Supabase client in tests. Real integration test deferred to after user creates project.

---

## Task 1: Install @supabase/supabase-js

**Files:** Modify `package.json`

**Step 1:** Install
```bash
cd /root/kanjimon && npm install @supabase/supabase-js
```

**Step 2:** Verify
```bash
node -e "console.log(require('@supabase/supabase-js/package.json').version)"
```
Expected: `^2.x.x`

**Step 3:** Commit
```bash
git add package.json package-lock.json
git commit -m "chore(deps): add @supabase/supabase-js"
```

---

## Task 2: Create .env.local.example

**Files:** Create `.env.local.example`

**Step 1:** Write
```env
# Supabase project credentials
# Get these from https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Step 2:** Commit
```bash
git add .env.local.example
git commit -m "chore(env): add Supabase env template"
```

---

## Task 3: Write SQL migration file

**Files:** Create `supabase/migrations/001_init.sql`

**Step 1:** Write the schema
```sql
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

-- Auto-update updated_at trigger
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
```

**Step 2:** Commit
```bash
git add supabase/migrations/001_init.sql
git commit -m "feat(supabase): add initial migration for profiles + player_saves"
```

**Step 3 (manual, by user):** User runs this in Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run)

---

## Task 4: Create Supabase client

**Files:** Create `src/lib/supabase.ts`

**Step 1:** Write
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Cloud save will be disabled. Set them in .env.local.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
```

**Step 2:** Verify it compiles
```bash
npx tsc --noEmit
```

**Step 3:** Commit
```bash
git add src/lib/supabase.ts
git commit -m "feat(supabase): add client init with env validation"
```

---

## Task 5: TDD — supabaseSync pure logic

**Files:**
- Create: `src/lib/supabaseSync.test.ts` (RED)
- Create: `src/lib/supabaseSync.ts` (GREEN)

**Step 1:** Write failing tests
```typescript
// src/lib/supabaseSync.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, serializeState, deserializeState } from './supabaseSync';

describe('supabaseSync utilities', () => {
  describe('serializeState', () => {
    it('strips out non-serializable values (functions, undefined, symbols)', () => {
      const state = { a: 1, fn: () => 'x', undef: undefined, sym: Symbol('s') };
      const result = serializeState(state);
      expect(result).toEqual({ a: 1 });
    });

    it('handles circular references gracefully', () => {
      const obj: any = { a: 1 };
      obj.self = obj;
      expect(() => serializeState(obj)).not.toThrow();
    });

    it('preserves Date objects as ISO strings', () => {
      const date = new Date('2026-01-01T00:00:00Z');
      const result = serializeState({ createdAt: date });
      expect(result.createdAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  describe('deserializeState', () => {
    it('returns null for null input', () => {
      expect(deserializeState(null)).toBeNull();
    });

    it('parses valid JSON', () => {
      const json = '{"coins":100,"level":5}';
      expect(deserializeState(json)).toEqual({ coins: 100, level: 5 });
    });

    it('returns null for invalid JSON', () => {
      expect(deserializeState('not json')).toBeNull();
    });
  });

  describe('debounce', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('calls function only once after delay', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced('a');
      debounced('b');
      debounced('c');
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith('c');
    });

    it('resets timer on each call', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledOnce();
    });
  });
});
```

**Step 2:** Run tests, expect RED
```bash
npx vitest run src/lib/supabaseSync.test.ts
```
Expected: FAIL (module not found)

**Step 3:** Implement
```typescript
// src/lib/supabaseSync.ts

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Strip non-serializable values from state.
 * JSON.stringify ignores functions and undefined, but we
 * also need to handle circular references and Date objects.
 */
export function serializeState<T extends Record<string, any>>(state: T): T {
  const seen = new WeakSet();
  return JSON.parse(
    JSON.stringify(state, (_key, value) => {
      if (typeof value === 'function' || typeof value === 'symbol') {
        return undefined;
      }
      if (value && typeof value === 'object') {
        if (value instanceof Date) return value.toISOString();
        if (seen.has(value)) return undefined; // break circular
        seen.add(value);
      }
      return value;
    })
  );
}

/**
 * Parse JSON string into state object.
 * Returns null on parse failure or null input.
 */
export function deserializeState(json: string | null | undefined): Record<string, any> | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
```

**Step 4:** Run tests, expect GREEN
```bash
npx vitest run src/lib/supabaseSync.test.ts
```
Expected: 8 passed

**Step 5:** Commit
```bash
git add src/lib/supabaseSync.ts src/lib/supabaseSync.test.ts
git commit -m "feat(supabase): add sync utilities (debounce, serialize, deserialize)"
```

---

## Task 6: TDD — Supabase CRUD functions

**Files:**
- Modify: `src/lib/supabaseSync.test.ts` (add tests)
- Modify: `src/lib/supabaseSync.ts` (add CRUD)

**Step 1:** Add tests
```typescript
// Append to supabaseSync.test.ts
import { loadPlayerSave, savePlayerSave, deletePlayerSave } from './supabaseSync';
import { supabase } from './supabase';

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('loadPlayerSave', () => {
  it('returns null when no row exists (PGRST116)', async () => {
    const single = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST116', message: 'not found' },
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    (supabase.from as any).mockReturnValue({ select });

    const result = await loadPlayerSave('user-1');
    expect(result).toBeNull();
  });

  it('returns parsed state on success', async () => {
    const single = vi.fn().mockResolvedValue({
      data: { state: { coins: 100 }, schema_version: 1 },
      error: null,
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    (supabase.from as any).mockReturnValue({ select });

    const result = await loadPlayerSave('user-1');
    expect(result).toEqual({ state: { coins: 100 }, schema_version: 1 });
  });

  it('throws on non-404 errors', async () => {
    const single = vi.fn().mockResolvedValue({
      data: null,
      error: { code: 'PGRST500', message: 'server error' },
    });
    const eq = vi.fn().mockReturnValue({ single });
    const select = vi.fn().mockReturnValue({ eq });
    (supabase.from as any).mockReturnValue({ select });

    await expect(loadPlayerSave('user-1')).rejects.toThrow();
  });
});

describe('savePlayerSave', () => {
  it('upserts save row with user_id, state, schema_version', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    (supabase.from as any).mockReturnValue({ upsert });

    await savePlayerSave('user-1', { coins: 50 });
    expect(upsert).toHaveBeenCalledWith({
      user_id: 'user-1',
      state: { coins: 50 },
      schema_version: 1,
    });
  });

  it('throws on error', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: { message: 'oops' } });
    (supabase.from as any).mockReturnValue({ upsert });

    await expect(savePlayerSave('user-1', {})).rejects.toThrow();
  });
});

describe('deletePlayerSave', () => {
  it('deletes row by user_id', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn().mockReturnValue({ eq });
    (supabase.from as any).mockReturnValue({ delete: del });

    await deletePlayerSave('user-1');
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
  });
});
```

**Step 2:** Run tests, expect RED
```bash
npx vitest run src/lib/supabaseSync.test.ts
```
Expected: FAIL (loadPlayerSave not defined)

**Step 3:** Add CRUD functions
```typescript
// Append to supabaseSync.ts
import { supabase } from './supabase';

export interface PlayerSave {
  state: Record<string, any>;
  schema_version: number;
}

export const CURRENT_SCHEMA_VERSION = 1;

export async function loadPlayerSave(userId: string): Promise<PlayerSave | null> {
  const { data, error } = await supabase
    .from('player_saves')
    .select('state, schema_version')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as PlayerSave;
}

export async function savePlayerSave(
  userId: string,
  state: Record<string, any>
): Promise<void> {
  const { error } = await supabase
    .from('player_saves')
    .upsert({
      user_id: userId,
      state,
      schema_version: CURRENT_SCHEMA_VERSION,
    });
  if (error) throw error;
}

export async function deletePlayerSave(userId: string): Promise<void> {
  const { error } = await supabase
    .from('player_saves')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}
```

**Step 4:** Run tests, expect GREEN
```bash
npx vitest run src/lib/supabaseSync.test.ts
```
Expected: 14 passed

**Step 5:** Commit
```bash
git add src/lib/supabaseSync.ts src/lib/supabaseSync.test.ts
git commit -m "feat(supabase): add CRUD for player_saves (load/save/delete)"
```

---

## Task 7: TDD — Update authStore with Supabase methods

**Files:**
- Modify: `src/store/authStore.ts`
- Modify: `src/store/authStore.test.ts` (if exists)

**Step 1:** Read current authStore to understand shape
```bash
cat /root/kanjimon/src/store/authStore.ts
```

**Step 2:** Add Supabase methods (signUp, signIn, signOut, loadSession)
```typescript
// Add to authStore.ts (or use existing pattern)
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { loadPlayerSave } from '@/lib/supabaseSync';

interface AuthState {
  // ... existing fields
  isCloudSynced: boolean;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadCloudSave: () => Promise<void>;
}
```

**Step 3:** Add tests (mock supabase)
**Step 4:** Verify RED → GREEN
**Step 5:** Commit

---

## Task 8: Create SyncProvider component

**Files:** Create `src/components/SyncProvider.tsx`

**Step 1:** Write component
```typescript
'use client';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCollectionStore } from '@/store/collectionStore';
import { debounce, serializeState, loadPlayerSave, savePlayerSave } from '@/lib/supabaseSync';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isCloudSynced = useAuthStore((s) => s.isCloudSynced);

  useEffect(() => {
    if (!user || !isCloudSynced) return;

    // Load cloud save on auth
    loadPlayerSave(user.id).then((save) => {
      if (save?.state) {
        useCollectionStore.setState(save.state as any);
      }
    });

    // Debounced auto-save
    const debouncedSave = debounce(async () => {
      const state = useCollectionStore.getState();
      await savePlayerSave(user.id, serializeState(state));
    }, 5000);

    const unsubscribe = useCollectionStore.subscribe(debouncedSave);
    return () => {
      unsubscribe();
    };
  }, [user, isCloudSynced]);

  return <>{children}</>;
}
```

**Step 2:** Wrap layout.tsx
```typescript
// src/app/layout.tsx
import { SyncProvider } from '@/components/SyncProvider';
// ...
<SyncProvider>{children}</SyncProvider>
```

**Step 3:** Commit

---

## Task 9: Create LoginForm UI

**Files:** Create `src/components/LoginForm.tsx`, modify `src/app/page.tsx` or `/login` page

**Step 1:** Build form with email/password/username
**Step 2:** Handle signUp vs signIn toggle
**Step 3:** Show errors from Supabase
**Step 4:** On success, redirect to home
**Step 5:** Commit

---

## Task 10: Browser-verify (after user has project + creds)

**Steps:**
1. User sets `.env.local` with URL + anon key
2. Restart dev server
3. Navigate to `/login` (or wherever form is)
4. Sign up with new email + username
5. Verify profile row in Supabase Table Editor
6. Get some cards via gacha
7. Verify `player_saves.state` row updated
8. Sign out
9. Sign in
10. Verify state restored

---

## Task 11: Commit + push

```bash
git add -A
git commit -m "feat(supabase): auth + cloud save end-to-end"
git push
```

---

## Pitfalls

- **TS errors:** Pre-existing `@/types` and `@/lib/cardSellPrice` errors. These are NOT from this work (verified via git stash in prior session).
- **localStorage → DB migration:** First signup uploads current localStorage state. On subsequent logins, DB overrides local. This means local-only progress after signup is lost unless we always pull from DB.
- **Schema evolution:** When Zustand shape changes, `schema_version` bump is required + migration logic in `loadPlayerSave`. For now, just use 1.
- **Real-time:** NOT in this scope. Each device is a snapshot.
- **Conflict resolution:** Last-write-wins (DB updated_at). If user has 2 devices open, they clobber each other.
- **Test mocking:** `vi.mock('./supabase')` must come BEFORE imports. The `supabase` import is at top of `supabaseSync.ts`.
- **Free tier limits:** 500MB DB, 50K MAU, 2GB storage. Way more than enough for Kanjimon.

---

## Verification Checklist

- [ ] All 14+ sync unit tests GREEN
- [ ] Auth store tests GREEN
- [ ] `npx tsc --noEmit` shows no NEW errors
- [ ] `npx vitest run` shows 262+ tests GREEN (no regression)
- [ ] Sign up → DB has profile + empty player_save
- [ ] Play game → DB state updates after 5s
- [ ] Sign in on new browser → state restored
- [ ] Sign out → session cleared, local state preserved
- [ ] `.env.local.example` documented
- [ ] All commits pushed
