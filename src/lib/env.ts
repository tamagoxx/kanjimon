// ============================================================
// env.ts — Pure env validation (TDD-able, no React, no I/O)
// ============================================================
//
// Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// from any source (process.env on the server, manual injection
// in tests). Validates format and returns a typed result.
// ============================================================

export interface EnvConfig {
  url: string;
  anonKey: string;
}

export interface EnvValidationResult {
  ok: boolean;
  config?: EnvConfig;
  errors: string[];
}

// Supabase project URLs: https://<project-ref>.supabase.co
// project-ref is lowercase alphanumeric + hyphens
const URL_RE = /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i;

const MIN_KEY_LENGTH = 80; // Supabase anon JWTs are well over 100 chars

/**
 * Pure validator. Pass any env-like record (process.env on server,
 * import.meta.env in tests, or a fixture).
 */
export function validateEnv(env: Record<string, string | undefined>): EnvValidationResult {
  const errors: string[] = [];
  const url = (env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  const key = (env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();

  if (!url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set');
  } else if (!URL_RE.test(url)) {
    errors.push(
      `NEXT_PUBLIC_SUPABASE_URL is not a valid Supabase URL (got "${url}"). ` +
      `Expected format: https://<project-ref>.supabase.co`,
    );
  }

  if (!key) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  } else if (!key.startsWith('eyJ')) {
    errors.push(
      'NEXT_PUBLIC_SUPABASE_ANON_KEY does not start with "eyJ" (not a JWT). ' +
      'Make sure you copied the "anon public" key, not the service_role key.',
    );
  } else if (key.length < MIN_KEY_LENGTH) {
    errors.push(
      `NEXT_PUBLIC_SUPABASE_ANON_KEY is too short (${key.length} chars, expected >= ${MIN_KEY_LENGTH}). ` +
      'Did you copy the full key?',
    );
  }

  if (errors.length > 0) return { ok: false, errors };

  return { ok: true, config: { url, anonKey: key }, errors: [] };
}

/**
 * Reads process.env (server-side) and runs validation.
 * Safe to call anywhere — returns ok=false with errors if env is missing.
 */
export function readEnv(): EnvValidationResult {
  return validateEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

/**
 * True when both env vars are present and valid. Use to gate UI that
 * depends on Supabase (e.g. hide the "Cloud Sync" tab when not configured).
 */
export const isSupabaseConfigured: boolean = readEnv().ok;
