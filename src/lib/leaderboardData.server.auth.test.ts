// ============================================================
// getCurrentUserFromServer tests
// ============================================================
// Verifies auth.getUser() response is mapped to {id, username}
// and that the function returns null on every failure path.
// ------------------------------------------------------------
import { describe, it, expect } from 'vitest';
import { getCurrentUserFromServer } from './leaderboardData.server';

// Minimal SupabaseClient shape needed by getCurrentUserFromServer.
type AuthMockResult =
  | { user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null; error: null }
  | { user: null; error: { message: string } }
  | { throws: true; message?: string };

function makeAuthClient(result: AuthMockResult): { auth: { getUser: () => Promise<any> } } {
  const client = {
    auth: {
      getUser: async () => {
        if ('throws' in result) {
          throw new Error(result.message ?? 'auth boom');
        }
        // After narrowing out `throws`, the result is the other
        // two variants which both have `.user` and `.error`.
        const r = result as Exclude<AuthMockResult, { throws: true }>;
        return { data: { user: r.user }, error: r.error };
      },
    },
  };
  return client as any;
}

describe('getCurrentUserFromServer', () => {
  it('returns { id, username } from user_metadata.username when present', async () => {
    const client = makeAuthClient({
      user: {
        id: 'user-123',
        email: 'alice@example.com',
        user_metadata: { username: 'Alice' },
      },
      error: null,
    });
    const result = await getCurrentUserFromServer(client as any);
    expect(result).toEqual({ id: 'user-123', username: 'Alice' });
  });

  it('falls back to email local-part when user_metadata.username is missing', async () => {
    const client = makeAuthClient({
      user: {
        id: 'user-456',
        email: 'bob@example.com',
        user_metadata: {},
      },
      error: null,
    });
    const result = await getCurrentUserFromServer(client as any);
    expect(result).toEqual({ id: 'user-456', username: 'bob' });
  });

  it('falls back to email local-part when user_metadata is null', async () => {
    const client = makeAuthClient({
      user: {
        id: 'user-789',
        email: 'charlie@example.com',
        user_metadata: null as any,
      },
      error: null,
    });
    const result = await getCurrentUserFromServer(client as any);
    expect(result).toEqual({ id: 'user-789', username: 'charlie' });
  });

  it('returns null when no user is signed in', async () => {
    const client = makeAuthClient({ user: null, error: null });
    const result = await getCurrentUserFromServer(client as any);
    expect(result).toBeNull();
  });

  it('returns null when auth.getUser returns an error', async () => {
    const client = makeAuthClient({
      user: null,
      error: { message: 'Invalid Refresh Token' },
    });
    const result = await getCurrentUserFromServer(client as any);
    expect(result).toBeNull();
  });

  it('returns null when auth.getUser throws (e.g. middleware not refreshing)', async () => {
    const client = makeAuthClient({ throws: true, message: 'Auth session missing!' });
    const result = await getCurrentUserFromServer(client as any);
    expect(result).toBeNull();
  });

  it('returns null when user.id is missing (corrupt session)', async () => {
    const client = makeAuthClient({
      user: { id: '', email: 'x@example.com', user_metadata: { username: 'X' } },
      error: null,
    });
    const result = await getCurrentUserFromServer(client as any);
    expect(result).toBeNull();
  });
});
