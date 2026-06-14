import { describe, it, expect } from 'vitest';
import { validateEnv } from './env';

const validUrl = 'https://abcdefghij.supabase.co';
const validKey = 'eyJ' + 'a'.repeat(150); // 153 chars, starts with eyJ

describe('validateEnv', () => {
  it('returns ok=false when both vars are missing', () => {
    const r = validateEnv({});
    expect(r.ok).toBe(false);
    expect(r.errors).toContain('NEXT_PUBLIC_SUPABASE_URL is not set');
    expect(r.errors[1]).toMatch(/Neither NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY nor NEXT_PUBLIC_SUPABASE_ANON_KEY is set/);
  });

  it('treats empty string as missing', () => {
    const r = validateEnv({ NEXT_PUBLIC_SUPABASE_URL: '', NEXT_PUBLIC_SUPABASE_ANON_KEY: '   ' });
    expect(r.ok).toBe(false);
    expect(r.errors.length).toBe(2);
  });

  it('rejects URL that is not https://*.supabase.co', () => {
    const r = validateEnv({ NEXT_PUBLIC_SUPABASE_URL: 'http://example.com', NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey });
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toMatch(/not a valid Supabase URL/);
  });

  it('accepts URL with trailing slash', () => {
    const r = validateEnv({ NEXT_PUBLIC_SUPABASE_URL: validUrl + '/', NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey });
    expect(r.ok).toBe(true);
  });

  it('rejects key that does not start with eyJ or sb_publishable_', () => {
    const r = validateEnv({ NEXT_PUBLIC_SUPABASE_URL: validUrl, NEXT_PUBLIC_SUPABASE_ANON_KEY: 'pk_live_abc' });
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toMatch(/not a recognized Supabase key format/);
  });

  it('rejects key that is too short', () => {
    const r = validateEnv({ NEXT_PUBLIC_SUPABASE_URL: validUrl, NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJ' + 'a'.repeat(40) });
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toMatch(/too short/);
  });

  // ============================================================
  // New Supabase API key format (sb_publishable_..., released 2025+)
  // ============================================================
  // Supabase introduced publishable/secret key pairs in 2025 to replace
  // the legacy JWT anon key. Browser-safe key starts with "sb_publishable_"
  // and is ~50-60 chars. See https://supabase.com/docs/guides/api/api-keys

  const newFormatKey = 'sb_publishable_VhjJ5wwbPvtJs33xRBM3lg_jyRD6et5';

  it('accepts new-format sb_publishable_ key in NEXT_PUBLIC_SUPABASE_ANON_KEY (backward compat)', () => {
    const r = validateEnv({ NEXT_PUBLIC_SUPABASE_URL: validUrl, NEXT_PUBLIC_SUPABASE_ANON_KEY: newFormatKey });
    expect(r.ok).toBe(true);
    expect(r.config?.anonKey).toBe(newFormatKey);
  });

  it('accepts new-format key in NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (new SDK env var)', () => {
    const r = validateEnv({ NEXT_PUBLIC_SUPABASE_URL: validUrl, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: newFormatKey });
    expect(r.ok).toBe(true);
    expect(r.config?.anonKey).toBe(newFormatKey);
  });

  it('prefers NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY when both are set', () => {
    const r = validateEnv({
      NEXT_PUBLIC_SUPABASE_URL: validUrl,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'sb_publishable_legacy',
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: newFormatKey,
    });
    expect(r.ok).toBe(true);
    expect(r.config?.anonKey).toBe(newFormatKey);
  });

  it('rejects unknown key prefixes (not eyJ, not sb_publishable_, not sb_secret_)', () => {
    const r = validateEnv({ NEXT_PUBLIC_SUPABASE_URL: validUrl, NEXT_PUBLIC_SUPABASE_ANON_KEY: 'pk_live_abc' });
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toMatch(/not a recognized Supabase key format/);
  });

  it('returns ok=true with config when both are valid', () => {
    const r = validateEnv({ NEXT_PUBLIC_SUPABASE_URL: validUrl, NEXT_PUBLIC_SUPABASE_ANON_KEY: validKey });
    expect(r.ok).toBe(true);
    expect(r.errors).toHaveLength(0);
    expect(r.config).toEqual({ url: validUrl, anonKey: validKey });
  });

  it('trims whitespace from values', () => {
    const r = validateEnv({
      NEXT_PUBLIC_SUPABASE_URL: '  ' + validUrl + '  ',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: '\t' + validKey + '\n',
    });
    expect(r.ok).toBe(true);
    expect(r.config?.url).toBe(validUrl);
    expect(r.config?.anonKey).toBe(validKey);
  });

  it('returns multiple errors at once (does not stop at first)', () => {
    const r = validateEnv({ NEXT_PUBLIC_SUPABASE_URL: 'not-a-url', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'bad' });
    expect(r.ok).toBe(false);
    expect(r.errors.length).toBe(2);
  });
});
