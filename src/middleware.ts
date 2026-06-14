// ============================================================
// Next.js Middleware — keeps Supabase sessions refreshed
// ============================================================
//
// Runs on every request (except static/image files). Forwards
// the request through `createClient` which:
//   - reads auth cookies from the request
//   - calls supabase.auth.getUser() (refreshes if expiring)
//   - writes refreshed cookies back to the response
//
// The matcher excludes static assets so we don't pay the auth
// cost on every image/css/js fetch.
// ============================================================

import { type NextRequest } from 'next/server';
import { createClient } from '@utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await createClient(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - any file with an extension (svg, png, jpg, jpeg, gif, webp, ico, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
