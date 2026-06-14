// src/lib/authSubmit.ts
// ============================================================
// Pure auth submit logic — extracted from src/app/auth/page.tsx
// so it can be tested without React. Decides whether to call
// Supabase signIn/signUp or fall back to local initNewUser,
// based on whether Supabase is configured and which tab is active.
// ============================================================

export type AuthTab = 'login' | 'register' | 'cloud';

export interface AuthSubmitDeps {
  signIn: (email: string, password: string) => Promise<{ error: string | null; isCloudSynced?: boolean }>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null; isCloudSynced?: boolean }>;
  initNewUser: (userData: { username: string; email: string }, initCollection: () => void) => void;
  initNewUserCards: () => void;
  setError: (msg: string | null) => void;
  setIsLoading: (b: boolean) => void;
  onSuccess: () => void;          // typically router.push('/')
  isSupabaseConfigured: boolean;
}

export interface AuthSubmitInput {
  activeTab: AuthTab;
  email: string;
  password: string;
  username: string;
}

/**
 * Run the auth submit logic for the given tab + inputs.
 * Returns when finished (success or error). Does NOT throw.
 * Caller is responsible for not awaiting in React render path.
 */
export async function authSubmit(
  input: AuthSubmitInput,
  deps: AuthSubmitDeps,
): Promise<void> {
  const { activeTab, email, password, username } = input;
  const {
    signIn, signUp, initNewUser, initNewUserCards,
    setError, setIsLoading, onSuccess, isSupabaseConfigured,
  } = deps;

  setError(null);
  setIsLoading(true);

  try {
    // ===== Cloud path (Supabase configured) =====
    if (isSupabaseConfigured) {
      if (activeTab === 'login') {
        const result = await signIn(email, password);
        if (result.error) { setError(result.error); setIsLoading(false); return; }
        onSuccess();
        return;
      }

      if (activeTab === 'register') {
        const finalUsername = username.trim() || email.split('@')[0];
        const result = await signUp(email, password, finalUsername);
        if (result.error) { setError(result.error); setIsLoading(false); return; }
        // Cloud signup → seed local collection (SyncProvider takes over from here)
        initNewUserCards();
        onSuccess();
        return;
      }

      // 'cloud' tab — smart: try signIn, fallback to signUp if username provided
      const signInResult = await signIn(email, password);
      if (!signInResult.error) { onSuccess(); return; }
      // signIn failed → try signUp if username provided
      if (username.trim()) {
        const signUpResult = await signUp(email, password, username.trim());
        if (signUpResult.error) { setError(signUpResult.error); setIsLoading(false); return; }
        initNewUserCards();
        onSuccess();
        return;
      }
      setError(signInResult.error + ' — atau daftar dengan mengisi nama');
      setIsLoading(false);
      return;
    }

    // ===== Local fallback (no Supabase) =====
    // Slight delay to mimic the original UX (loading spinner)
    await new Promise<void>((r) => setTimeout(r, 1500));
    const localUsername =
      activeTab === 'register' ? (username || email.split('@')[0]) : email.split('@')[0];
    initNewUser({ username: localUsername, email }, initNewUserCards);
    setIsLoading(false);
    onSuccess();
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    setError(msg);
    setIsLoading(false);
  }
}
