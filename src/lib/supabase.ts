// ============================================================
// supabase.ts — Main app Supabase client (Browser singleton)
// ============================================================
//
// Uses @supabase/ssr's createBrowserClient so the auth state
// lives in cookies (NOT localStorage). This is the same
// storage the middleware reads/writes, so session refresh
// via middleware actually works end-to-end.
//
// When env is missing, exports a stub client that throws
// helpful errors on every auth method (instead of crashing
// the module graph at import time).
// ============================================================

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { readEnv, isSupabaseConfigured } from './env';
import type { Database } from './supabase/types';

// Re-export for backward compat
export { isSupabaseConfigured };

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Cloud save + leaderboard will be disabled. Copy .env.local.example to .env.local.',
  );
}

// Stub for unconfigured env. Throws helpful errors on every auth call.
const stubError = (method: string) => () => {
  throw new Error(
    `[Supabase] ${method}() called but Supabase is not configured. ` +
    'Set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local first.',
  );
};
const stubClient = {
  auth: {
    signUp: stubError('signUp') as any,
    signInWithPassword: stubError('signInWithPassword') as any,
    signOut: stubError('signOut') as any,
    getSession: stubError('getSession') as any,
    getUser: stubError('getUser') as any,
    onAuthStateChange: stubError('onAuthStateChange') as any,
  },
  from: stubError('from') as any,
} as unknown as SupabaseClient<Database>;

let _realClient: SupabaseClient<Database> | null = null;

function makeClient(): SupabaseClient<Database> {
  const env = readEnv();
  if (!env.ok || !env.config) return stubClient;
  return createBrowserClient<Database>(env.config.url, env.config.anonKey);
}

/**
 * Lazy singleton — created on first call. Reused for the rest of the tab.
 *
 * Why lazy: in test environment, env vars are usually absent, and creating
 * a real client at module-load time would throw.
 */
export function getSupabase(): SupabaseClient<Database> {
  return (_realClient ??= makeClient());
}

// Default export for `import { supabase } from '@/lib/supabase'` style.
// NOTE: this calls getSupabase() once at import time. In test env, returns stub.
export const supabase: SupabaseClient<Database> = getSupabase();
