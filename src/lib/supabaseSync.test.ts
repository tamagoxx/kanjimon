import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the supabase client BEFORE importing the module under test
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { debounce, serializeState, deserializeState } from './supabaseSync';
import { loadPlayerSave, savePlayerSave, deletePlayerSave } from './supabaseSync';
import { supabase } from './supabase';

describe('supabaseSync utilities', () => {
  describe('serializeState', () => {
    it('strips out non-serializable values (functions, undefined, symbols)', () => {
      const state = { a: 1, fn: () => 'x', undef: undefined, sym: Symbol('s') };
      const result = serializeState(state);
      expect(result).toEqual({ a: 1 });
    });

    it('handles circular references gracefully', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj: any = { a: 1 };
      obj.self = obj;
      expect(() => serializeState(obj)).not.toThrow();
    });

    it('preserves Date objects as ISO strings', () => {
      const date = new Date('2026-01-01T00:00:00Z');
      const result = serializeState({ createdAt: date });
      expect(result.createdAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  describe('deserializeState', () => {
    it('returns null for null input', () => {
      expect(deserializeState(null)).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(deserializeState(undefined)).toBeNull();
    });

    it('parses valid JSON', () => {
      const json = '{"coins":100,"level":5}';
      expect(deserializeState(json)).toEqual({ coins: 100, level: 5 });
    });

    it('returns null for invalid JSON', () => {
      expect(deserializeState('not json')).toBeNull();
    });
  });

  describe('debounce', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('calls function only once after delay', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced('a');
      debounced('b');
      debounced('c');
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledOnce();
      expect(fn).toHaveBeenCalledWith('c');
    });

    it('resets timer on each call', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);
      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledOnce();
    });
  });

  describe('loadPlayerSave', () => {
    it('returns null when no row exists (PGRST116)', async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      (supabase.from as any).mockReturnValue({ select });

      const result = await loadPlayerSave('user-1');
      expect(result).toBeNull();
    });

    it('returns parsed state on success', async () => {
      const single = vi.fn().mockResolvedValue({
        data: { state: { coins: 100 }, schema_version: 1 },
        error: null,
      });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      (supabase.from as any).mockReturnValue({ select });

      const result = await loadPlayerSave('user-1');
      expect(result).toEqual({ state: { coins: 100 }, schema_version: 1 });
    });

    it('throws on non-404 errors', async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST500', message: 'server error' },
      });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      (supabase.from as any).mockReturnValue({ select });

      await expect(loadPlayerSave('user-1')).rejects.toThrow();
    });
  });

  describe('savePlayerSave', () => {
    it('upserts save row with user_id, state, schema_version', async () => {
      const upsert = vi.fn().mockResolvedValue({ error: null });
      (supabase.from as any).mockReturnValue({ upsert });

      await savePlayerSave('user-1', { coins: 50 });
      expect(upsert).toHaveBeenCalledWith({
        user_id: 'user-1',
        state: { coins: 50 },
        schema_version: 1,
      });
    });

    it('throws on error', async () => {
      const upsert = vi.fn().mockResolvedValue({ error: { message: 'oops' } });
      (supabase.from as any).mockReturnValue({ upsert });

      await expect(savePlayerSave('user-1', {})).rejects.toThrow();
    });
  });

  describe('deletePlayerSave', () => {
    it('deletes row by user_id', async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const del = vi.fn().mockReturnValue({ eq });
      (supabase.from as any).mockReturnValue({ delete: del });

      await deletePlayerSave('user-1');
      expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
    });
  });
});
