import { describe, it, expect } from 'vitest';
import { validateEnv } from './env';

const validUrl = 'https://abcdefghij.supabase.co';
const validKey = 'eyJ' + 'a'.repeat(150); // 153 chars, starts with eyJ

describe('validateEnv', () => {
  it('returns ok=false when both vars are missing', () => {
    const r = validateEnv({});
    expect(r.ok).toBe(false);
    expect(r.errors).toContain('NEXT_PUBLIC_SUPABASE_URL is not set');
    expect(r.errors).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
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

  it('rejects key that does not start with eyJ', () => {
    const r = validateEnv({ NEXT_PUBLIC_SUPABASE_URL: validUrl, NEXT_PUBLIC_SUPABASE_ANON_KEY: 'pk_live_abc' });
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toMatch(/does not start with "eyJ"/);
  });

  it('rejects key that is too short', () => {
    const r = validateEnv({ NEXT_PUBLIC_SUPABASE_URL: validUrl, NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJshort' });
    expect(r.ok).toBe(false);
    expect(r.errors[0]).toMatch(/too short/);
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
