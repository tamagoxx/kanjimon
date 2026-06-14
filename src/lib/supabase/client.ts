// ============================================================
// supabase/client.ts — Browser-side Supabase client
// ============================================================
//
// Use this in Client Components (`'use client'`). It manages
// auth state via cookies (NOT localStorage), so the SSR
// middleware can read the same auth state on the server side.
// ============================================================

'use client';

import { createBrowserClient } from '@supabase/ssr';
import { readEnv } from '../env';
import type { Database } from './types';

export function createBrowserSupabaseClient() {
  const env = readEnv();
  if (!env.ok || !env.config) {
    throw new Error(
      '[supabase/client] ' + env.errors.join('; ') +
      '\nCopy .env.local.example to .env.local and fill in your Supabase URL + anon key.',
    );
  }
  return createBrowserClient<Database>(env.config.url, env.config.anonKey);
}

/**
 * Lazy singleton — only create the client when first called.
 * Reuse the same instance for the lifetime of the browser tab.
 */
let _client: ReturnType<typeof createBrowserSupabaseClient> | null = null;
export function getBrowserSupabase() {
  return (_client ??= createBrowserSupabaseClient());
}
