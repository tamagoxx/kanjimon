// Set env BEFORE any test file loads.
// The new middleware reads process.env at module load time (module-level const).
// vi.mock calls and ES imports are hoisted above process.env assignments in test files,
// so the env must be set globally via a vitest setup file.
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://abc.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'eyJ' + 'a'.repeat(150);
