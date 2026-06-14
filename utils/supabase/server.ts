// ============================================================
// utils/supabase/server.ts — Server-side Supabase client (RSC + Route Handlers)
// ============================================================
//
// Canonical Supabase SSR convention. Use this in:
//   - Server Components
//   - Route Handlers (app/api/...)
//   - Server Actions
//
// It reads/writes auth cookies via next/headers.cookies(), so the
// SSR middleware can keep the session refreshed.
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { readEnv } from '../../src/lib/env';
import type { Database } from '../../src/lib/supabase/types';

export async function createServerSupabaseClient() {
  const env = readEnv();
  if (!env.ok || !env.config) {
    throw new Error(
      '[supabase/server] ' + env.errors.join('; ') +
      '\nCopy .env.local.example to .env.local and fill in your Supabase URL + anon key.',
    );
  }
  const cookieStore = await cookies();
  return createServerClient<Database>(env.config.url, env.config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `set` was called from a Server Component — this is a no-op
          // because Server Components cannot write cookies. The middleware
          // is responsible for refreshing sessions.
        }
      },
    },
  });
}
