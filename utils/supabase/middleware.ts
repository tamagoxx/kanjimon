// ============================================================
// supabase/middleware.ts — session-refresh helper
// ============================================================
//
// This module is the heart of the SSR auth pattern. It runs on
// every Next.js request (via src/middleware.ts) and:
//   1. Reads auth cookies from the incoming request
//   2. Creates a server-side Supabase client
//   3. Calls supabase.auth.getUser() — this forces Supabase to
//      validate + refresh the access token if it's near expiry
//   4. Writes the refreshed cookies back to the response
//
// This means:
//   - The user never has to re-login until the refresh token itself
//     expires (default 1 hour, configurable in Supabase dashboard).
//   - Server components see the SAME auth state as the browser.
//   - If env is not configured, this is a no-op (request passes
//     through unchanged — local-only mode still works).
// ============================================================

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { readEnv } from '@/lib/env';

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const env = readEnv();

  // No env → no-op, let the request pass through (local-only mode)
  if (!env.ok || !env.config) return NextResponse.next({ request });

  let response = NextResponse.next({ request });

  const supabase = createServerClient(env.config.url, env.config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Mirror to request (in case downstream code reads it)
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        // Mirror to response (so the browser gets the refreshed cookie)
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // CRITICAL: this call refreshes the session token if it's expired.
  // Do NOT remove it — without it, server components and middleware
  // will see stale auth state.
  try {
    await supabase.auth.getUser();
  } catch (err) {
    // Network or transient error — still let the request through.
    // Worst case, the user has to re-login on next protected route.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[supabase/middleware] getUser() failed, continuing without refresh:', err);
    }
  }

  return response;
}
