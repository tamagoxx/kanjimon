// src/lib/authSubmit.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authSubmit, type AuthSubmitDeps, type AuthSubmitInput } from './authSubmit';
// call() helper below handles the cast

type MockedDeps = {
  [K in keyof AuthSubmitDeps]: ReturnType<typeof vi.fn> | (AuthSubmitDeps[K] extends boolean ? boolean : never);
};

function makeDeps(overrides: Partial<AuthSubmitDeps> = {}): MockedDeps {
  return {
    signIn: vi.fn(),
    signUp: vi.fn(),
    initNewUser: vi.fn(),
    initNewUserCards: vi.fn(),
    setError: vi.fn(),
    setIsLoading: vi.fn(),
    onSuccess: vi.fn(),
    isSupabaseConfigured: false,
    ...overrides,
  } as unknown as MockedDeps;
}

// Each call to authSubmit needs a cast (TS doesn't know vi.fn() conforms).
function call(input: AuthSubmitInput, deps: MockedDeps) {
  return authSubmit(input, deps as unknown as AuthSubmitDeps);
}

const validInput: AuthSubmitInput = {
  activeTab: 'register',
  email: 'baru@contoh.com',
  password: 'password123',
  username: 'Pemain Baru',
};

describe('authSubmit — cloud path (Supabase configured)', () => {
  let deps: ReturnType<typeof makeDeps>;
  beforeEach(() => {
    deps = makeDeps({ isSupabaseConfigured: true });
  });

  it('register tab → calls signUp with the supplied username', async () => {
    deps.signUp.mockResolvedValue({ error: null, isCloudSynced: true });

    await call({ ...validInput, activeTab: 'register' }, deps);

    expect(deps.signUp).toHaveBeenCalledWith('baru@contoh.com', 'password123', 'Pemain Baru');
    expect(deps.signIn).not.toHaveBeenCalled();
    expect(deps.initNewUser).not.toHaveBeenCalled();   // cloud signup does NOT use local init
    expect(deps.initNewUserCards).toHaveBeenCalledOnce();
    expect(deps.onSuccess).toHaveBeenCalledOnce();
    expect(deps.setError).not.toHaveBeenCalledWith(expect.stringMatching(/./));
  });

  it('register tab → falls back to email local-part when username blank', async () => {
    deps.signUp.mockResolvedValue({ error: null, isCloudSynced: true });

    await call({ ...validInput, activeTab: 'register', username: '' }, deps);

    expect(deps.signUp).toHaveBeenCalledWith('baru@contoh.com', 'password123', 'baru');
  });

  it('register tab → propagates signUp error', async () => {
    deps.signUp.mockResolvedValue({ error: 'Email already registered' });

    await call({ ...validInput, activeTab: 'register' }, deps);

    expect(deps.signUp).toHaveBeenCalled();
    expect(deps.setError).toHaveBeenCalledWith('Email already registered');
    expect(deps.setIsLoading).toHaveBeenCalledWith(false);
    expect(deps.initNewUserCards).not.toHaveBeenCalled();
    expect(deps.onSuccess).not.toHaveBeenCalled();
  });

  it('login tab → calls signIn, not signUp', async () => {
    deps.signIn.mockResolvedValue({ error: null, isCloudSynced: true });

    await call({ ...validInput, activeTab: 'login' }, deps);

    expect(deps.signIn).toHaveBeenCalledWith('baru@contoh.com', 'password123');
    expect(deps.signUp).not.toHaveBeenCalled();
    expect(deps.onSuccess).toHaveBeenCalledOnce();
  });

  it('login tab → propagates signIn error', async () => {
    deps.signIn.mockResolvedValue({ error: 'Invalid login credentials' });

    await call({ ...validInput, activeTab: 'login' }, deps);

    expect(deps.setError).toHaveBeenCalledWith('Invalid login credentials');
    expect(deps.onSuccess).not.toHaveBeenCalled();
  });

  it('cloud tab → signIn success goes straight to onSuccess', async () => {
    deps.signIn.mockResolvedValue({ error: null, isCloudSynced: true });

    await call({ ...validInput, activeTab: 'cloud' }, deps);

    expect(deps.signIn).toHaveBeenCalledWith('baru@contoh.com', 'password123');
    expect(deps.signUp).not.toHaveBeenCalled();
    expect(deps.onSuccess).toHaveBeenCalledOnce();
  });

  it('cloud tab → signIn fails + username → falls back to signUp', async () => {
    deps.signIn.mockResolvedValue({ error: 'Invalid login credentials' });
    deps.signUp.mockResolvedValue({ error: null, isCloudSynced: true });

    await call({ ...validInput, activeTab: 'cloud' }, deps);

    expect(deps.signIn).toHaveBeenCalled();
    expect(deps.signUp).toHaveBeenCalledWith('baru@contoh.com', 'password123', 'Pemain Baru');
    expect(deps.initNewUserCards).toHaveBeenCalledOnce();
    expect(deps.onSuccess).toHaveBeenCalledOnce();
  });

  it('cloud tab → signIn fails + no username → shows helpful error', async () => {
    deps.signIn.mockResolvedValue({ error: 'Invalid login credentials' });

    await call({ ...validInput, activeTab: 'cloud', username: '' }, deps);

    expect(deps.signUp).not.toHaveBeenCalled();
    expect(deps.setError).toHaveBeenCalledWith('Invalid login credentials — atau daftar dengan mengisi nama');
    expect(deps.onSuccess).not.toHaveBeenCalled();
  });
});

describe('authSubmit — local fallback (no Supabase)', () => {
  let deps: ReturnType<typeof makeDeps>;
  beforeEach(() => {
    deps = makeDeps({ isSupabaseConfigured: false });
  });

  it('register tab → uses initNewUser with email-local-part when username blank', async () => {
    vi.useFakeTimers();
    const p = call({ ...validInput, activeTab: 'register', username: '' }, deps);
    await vi.runAllTimersAsync();
    await p;

    expect(deps.initNewUser).toHaveBeenCalledWith(
      { username: 'baru', email: 'baru@contoh.com' },
      deps.initNewUserCards,
    );
    expect(deps.signUp).not.toHaveBeenCalled();
    expect(deps.onSuccess).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it('login tab → uses initNewUser with email-local-part', async () => {
    vi.useFakeTimers();
    const p = call({ ...validInput, activeTab: 'login' }, deps);
    await vi.runAllTimersAsync();
    await p;

    expect(deps.initNewUser).toHaveBeenCalledWith(
      { username: 'baru', email: 'baru@contoh.com' },
      deps.initNewUserCards,
    );
    vi.useRealTimers();
  });
});

describe('authSubmit — exception safety', () => {
  it('catches thrown errors and surfaces them via setError', async () => {
    const deps = makeDeps({ isSupabaseConfigured: true });
    deps.signIn.mockRejectedValue(new Error('Network down'));

    await call({ ...validInput, activeTab: 'login' }, deps);

    expect(deps.setError).toHaveBeenCalledWith('Network down');
    expect(deps.setIsLoading).toHaveBeenCalledWith(false);
    expect(deps.onSuccess).not.toHaveBeenCalled();
  });
});
