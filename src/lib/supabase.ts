import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured && typeof window !== 'undefined') {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
    'Cloud save will be disabled. Set them in .env.local.'
  );
}

// When not configured, export a stub so module imports don't crash.
// Calling auth methods on the stub will throw a clear error.
const stubError = (method: string) => () => {
  throw new Error(`[Supabase] ${method}() called but Supabase is not configured. Set .env.local first.`);
};

const stubClient: SupabaseClient = {
  auth: {
    signUp: stubError('signUp') as any,
    signInWithPassword: stubError('signInWithPassword') as any,
    signOut: stubError('signOut') as any,
    getSession: stubError('getSession') as any,
    onAuthStateChange: stubError('onAuthStateChange') as any,
  },
} as unknown as SupabaseClient;

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : stubClient;
