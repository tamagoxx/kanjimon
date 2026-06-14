import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

// Mock next/server to provide controllable NextResponse
vi.mock('next/server', () => {
  class MockNextResponse {
    cookies = {
      _set: [] as Array<{ name: string; value: string; options?: any }>,
      set(name: string, value: string, options?: any) {
        this._set.push({ name, value, options });
      },
    };
    constructor(public init?: any) {}
    static next(arg?: any) {
      return new MockNextResponse(arg);
    }
  }
  return { NextResponse: MockNextResponse };
});

// Mock @supabase/ssr — capture cookie get/set behaviour
const mockCookieGet = vi.fn();
const mockCookieSet = vi.fn();
const mockGetUser = vi.fn();
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    _cookies: { getAll: mockCookieGet, setAll: mockCookieSet },
  })),
}));

// Mock the env so it's "configured" by default; individual tests override
let mockEnvOk = true;
vi.mock('../env', () => ({
  readEnv: () =>
    mockEnvOk
      ? { ok: true, config: { url: 'https://abc.supabase.co', anonKey: 'eyJ' + 'a'.repeat(150) }, errors: [] }
      : { ok: false, errors: ['NEXT_PUBLIC_SUPABASE_URL is not set'] },
}));

import { updateSession } from './middleware';

function makeRequest(cookieValue: string | null = null): NextRequest {
  const req: any = {
    cookies: {
      getAll: () => (cookieValue ? [{ name: 'sb-token', value: cookieValue }] : []),
      set: vi.fn(),
    },
  };
  return req as NextRequest;
}

describe('updateSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnvOk = true;
    mockGetUser.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null });
  });

  it('returns NextResponse.next() when env is not configured (no-op)', async () => {
    mockEnvOk = false;
    const req = makeRequest();
    const res = await updateSession(req);
    expect(res).toBeDefined();
    // No call to createServerClient
    const { createServerClient } = await import('@supabase/ssr');
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it('creates a server client and calls getUser() to refresh session', async () => {
    const req = makeRequest('old-token');
    await updateSession(req);
    expect(mockGetUser).toHaveBeenCalledOnce();
  });

  it('passes request cookies to the server client', async () => {
    const req = makeRequest('token-123');
    await updateSession(req);
    // createServerClient is called with config + cookies
    const { createServerClient } = await import('@supabase/ssr');
    const call = (createServerClient as any).mock.calls[0];
    expect(call[0]).toBe('https://abc.supabase.co');
    expect(call[1]).toMatch(/^eyJ/);
    // cookies param exposes getAll that reads request
    const cookies = call[2].cookies;
    const all = cookies.getAll();
    expect(all).toEqual([{ name: 'sb-token', value: 'token-123' }]);
  });

  it('forwards refreshed cookies from supabase to the response', async () => {
    // Simulate Supabase rotating the auth cookie DURING getUser() —
    // this matches the real @supabase/ssr behaviour.
    let capturedSetAll: any;
    const { createServerClient } = await import('@supabase/ssr');
    (createServerClient as any).mockImplementation((_u: any, _k: any, cfg: any) => {
      capturedSetAll = cfg.cookies.setAll;
      mockGetUser.mockImplementation(async () => {
        // Supabase writes refreshed cookies during the auth call
        capturedSetAll([{ name: 'sb-token', value: 'new-refreshed', options: { path: '/' } }]);
        return { data: { user: { id: 'u1' } }, error: null };
      });
      return { auth: { getUser: mockGetUser } };
    });

    const req = makeRequest('old');
    const res = await updateSession(req);

    expect((res as any).cookies._set).toEqual([
      { name: 'sb-token', value: 'new-refreshed', options: { path: '/' } },
    ]);
  });

  it('does not throw if getUser() rejects — passes request through', async () => {
    mockGetUser.mockRejectedValueOnce(new Error('network down'));
    const req = makeRequest('token');
    const res = await updateSession(req);
    expect(res).toBeDefined();
  });
});
