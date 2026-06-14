import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NextRequest } from 'next/server';

// Set up env BEFORE module load (new middleware reads process.env directly)
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abc.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'eyJ' + 'a'.repeat(150);

// Mock next/server
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
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({})),
}));

import { createClient } from './middleware';

function makeRequest(cookieValue: string | null = null): NextRequest {
  const req: any = {
    cookies: {
      getAll: () => (cookieValue ? [{ name: 'sb-token', value: cookieValue }] : []),
      set: vi.fn(),
    },
  };
  return req as NextRequest;
}

describe('createClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes request cookies to the server client', async () => {
    const req = makeRequest('token-123');
    await createClient(req);
    const { createServerClient } = await import('@supabase/ssr');
    const call = (createServerClient as any).mock.calls[0];
    expect(call[0]).toBe('https://abc.supabase.co');
    expect(call[1]).toMatch(/^eyJ/);
    const cookies = call[2].cookies;
    const all = cookies.getAll();
    expect(all).toEqual([{ name: 'sb-token', value: 'token-123' }]);
  });

  it('forwards refreshed cookies from supabase to the response', async () => {
    let capturedSetAll: any;
    const { createServerClient } = await import('@supabase/ssr');
    (createServerClient as any).mockImplementation((_u: any, _k: any, cfg: any) => {
      capturedSetAll = cfg.cookies.setAll;
      // Simulate Supabase writing refreshed cookies during session validation
      capturedSetAll([
        { name: 'sb-token', value: 'new-refreshed', options: { path: '/' } },
      ]);
      return {};
    });

    const req = makeRequest('old');
    const res = await createClient(req);

    expect((res as any).cookies._set).toEqual([
      { name: 'sb-token', value: 'new-refreshed', options: { path: '/' } },
    ]);
  });

  it('returns a NextResponse', async () => {
    const req = makeRequest();
    const res = await createClient(req);
    expect(res).toBeDefined();
  });
});
