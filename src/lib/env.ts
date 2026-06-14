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

const MIN_JWT_LENGTH = 80; // Legacy anon JWTs are well over 100 chars

// Two valid key formats:
//   1. Legacy JWT anon key — starts with "eyJ", >= 80 chars total
//   2. New (2025+) publishable key — starts with "sb_publishable_", >= 25 chars total
// Either prefix passes; unknown prefixes (incl. "sb_secret_") are rejected
// because the secret key must NEVER be sent to the browser.
const KEY_RE = /^(eyJ[A-Za-z0-9_-]{20,}|sb_publishable_[A-Za-z0-9_-]{10,})$/;

/**
 * Pure validator. Pass any env-like record (process.env on server,
 * import.meta.env in tests, or a fixture).
 */
export function validateEnv(env: Record<string, string | undefined>): EnvValidationResult {
  const errors: string[] = [];
  const url = (env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
  // New SDK convention (2025+): NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  // Old convention: NEXT_PUBLIC_SUPABASE_ANON_KEY. Prefer the new name
  // when both are present.
  const keyRaw = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ?? '';
  const key = keyRaw.trim();
  const keySource = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ? 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
    : env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    : null;

  if (!url) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not set');
  } else if (!URL_RE.test(url)) {
    errors.push(
      `NEXT_PUBLIC_SUPABASE_URL is not a valid Supabase URL (got "${url}"). ` +
      `Expected format: https://<project-ref>.supabase.co`,
    );
  }

  if (!key) {
    errors.push(
      'Neither NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is set. ' +
      'Copy the "publishable" or "anon public" key from your Supabase project → Settings → API.',
    );
  } else if (!KEY_RE.test(key)) {
    errors.push(
      `Supabase key is not a recognized Supabase key format (got "${key.slice(0, 16)}..."). ` +
      'Valid prefixes: "eyJ" (legacy JWT anon) or "sb_publishable_" (2025+ publishable). ' +
      'NEVER use the "sb_secret_" key in the browser.',
    );
  } else if (key.startsWith('eyJ') && key.length < MIN_JWT_LENGTH) {
    errors.push(
      `Supabase JWT key is too short (${key.length} chars, expected >= ${MIN_JWT_LENGTH}). ` +
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
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
}

/**
 * True when both env vars are present and valid. Use to gate UI that
 * depends on Supabase (e.g. hide the "Cloud Sync" tab when not configured).
 */
export const isSupabaseConfigured: boolean = readEnv().ok;
