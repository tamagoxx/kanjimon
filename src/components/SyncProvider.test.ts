import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock supabaseSync BEFORE importing SyncProvider
vi.mock('../lib/supabaseSync', () => ({
  loadPlayerSave: vi.fn(),
  savePlayerSave: vi.fn(),
  serializeState: vi.fn((s) => JSON.parse(JSON.stringify(s))),
  debounce: vi.fn((fn) => fn), // immediate execution in tests
}));

vi.mock('../store/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(),
    subscribe: vi.fn(() => () => {}),
    setState: vi.fn(),
  },
}));

vi.mock('../store/collectionStore', () => ({
  useCollectionStore: {
    getState: vi.fn(),
    subscribe: vi.fn(() => () => {}),
    setState: vi.fn(),
  },
}));

import { loadPlayerSave, savePlayerSave } from '../lib/supabaseSync';
import { useAuthStore } from '../store/authStore';
import { useCollectionStore } from '../store/collectionStore';
import { createSyncController } from '../components/SyncProvider';

describe('SyncProvider controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('start (login)', () => {
    it('loads player save and hydrates collectionStore on auth', async () => {
      (useAuthStore.getState as any).mockReturnValue({
        user: { id: 'user-1' },
        isCloudSynced: true,
      });
      (useCollectionStore.getState as any).mockReturnValue({ cards: [], coins: 0 });
      (loadPlayerSave as any).mockResolvedValue({
        state: { cards: [{ id: 'c1' }], coins: 999 },
        schema_version: 1,
      });

      const ctrl = createSyncController();
      await act(async () => {
        await ctrl.start();
      });

      expect(loadPlayerSave).toHaveBeenCalledWith('user-1');
      expect(useCollectionStore.setState).toHaveBeenCalledWith({ cards: [{ id: 'c1' }], coins: 999 });
    });

    it('does nothing if not cloud synced', async () => {
      (useAuthStore.getState as any).mockReturnValue({
        user: { id: 'user-1' },
        isCloudSynced: false,
      });

      const ctrl = createSyncController();
      await act(async () => {
        await ctrl.start();
      });

      expect(loadPlayerSave).not.toHaveBeenCalled();
      expect(useCollectionStore.setState).not.toHaveBeenCalled();
    });

    it('handles load error gracefully (keeps local state)', async () => {
      (useAuthStore.getState as any).mockReturnValue({
        user: { id: 'user-1' },
        isCloudSynced: true,
      });
      (loadPlayerSave as any).mockRejectedValue(new Error('network down'));

      const ctrl = createSyncController();
      // Should not throw
      await act(async () => {
        await ctrl.start();
      });

      expect(useCollectionStore.setState).not.toHaveBeenCalled();
    });
  });

  describe('save', () => {
    it('persists current collectionStore state to Supabase', async () => {
      (useAuthStore.getState as any).mockReturnValue({ user: { id: 'user-1' } });
      (useCollectionStore.getState as any).mockReturnValue({ cards: [{ id: 'c1' }], coins: 500 });
      (savePlayerSave as any).mockResolvedValue(undefined);

      const ctrl = createSyncController();
      await act(async () => {
        await ctrl.save();
      });

      expect(savePlayerSave).toHaveBeenCalledWith('user-1', { cards: [{ id: 'c1' }], coins: 500 });
    });
  });

  describe('stop (logout)', () => {
    it('cleans up subscription', () => {
      (useAuthStore.getState as any).mockReturnValue({ user: { id: 'user-1' }, isCloudSynced: true });
      const unsub = vi.fn();
      (useCollectionStore.subscribe as any).mockReturnValue(unsub);

      const ctrl = createSyncController();
      ctrl.start();
      ctrl.stop();

      expect(unsub).toHaveBeenCalled();
    });
  });
});
