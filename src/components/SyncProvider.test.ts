import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from '@testing-library/react';

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
    it('loads player save and hydrates collectionStore (NEW shape: state.collection)', async () => {
      (useAuthStore.getState as any).mockReturnValue({
        user: { id: 'user-1' },
        isCloudSynced: true,
      });
      (useCollectionStore.getState as any).mockReturnValue({ cards: [], coins: 0 });
      (loadPlayerSave as any).mockResolvedValue({
        state: { collection: { cards: [{ id: 'c1' }], coins: 999 } },
        schema_version: 1,
      });

      const ctrl = createSyncController();
      await act(async () => {
        await ctrl.start();
      });

      expect(loadPlayerSave).toHaveBeenCalledWith('user-1');
      expect(useCollectionStore.setState).toHaveBeenCalledWith({ cards: [{ id: 'c1' }], coins: 999 });
    });

    it('hydrates authStore progress (level/xp/badges/stats) from state.auth', async () => {
      (useAuthStore.getState as any).mockReturnValue({
        user: { id: 'user-1', level: 1, xp: 0, badges: [] },
        isCloudSynced: true,
      });
      (useCollectionStore.getState as any).mockReturnValue({});
      (loadPlayerSave as any).mockResolvedValue({
        state: {
          auth: {
            level: 7,
            xp: 1234,
            badges: [{ id: 'first-battle', name: 'First Blood' }],
            totalBattles: 42,
            totalWins: 30,
            totalCards: 50,
            studySessions: 12,
          },
          collection: { cards: [], coins: 100 },
        },
        schema_version: 1,
      });

      const ctrl = createSyncController();
      await act(async () => {
        await ctrl.start();
      });

      // authStore.setState called with progress fields (user.* + stats.*)
      expect(useAuthStore.setState).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            level: 7,
            xp: 1234,
            badges: [{ id: 'first-battle', name: 'First Blood' }],
          }),
          totalBattles: 42,
          totalWins: 30,
          totalCards: 50,
          studySessions: 12,
        })
      );
      // collectionStore also hydrated from state.collection
      expect(useCollectionStore.setState).toHaveBeenCalledWith({ cards: [], coins: 100 });
    });

    it('creates initial save when no cloud data exists (first signIn)', async () => {
      (useAuthStore.getState as any).mockReturnValue({
        user: { id: 'new-user', level: 1, xp: 0, badges: [] },
        isCloudSynced: true,
      });
      (useCollectionStore.getState as any).mockReturnValue({ cards: [], coins: 50 });
      (loadPlayerSave as any).mockResolvedValue(null);
      (savePlayerSave as any).mockResolvedValue(undefined);

      const ctrl = createSyncController();
      await act(async () => {
        await ctrl.start();
      });

      // No setState on collectionStore (no data to load)
      expect(useCollectionStore.setState).not.toHaveBeenCalled();
      // But initial save SHOULD be created
      expect(savePlayerSave).toHaveBeenCalledTimes(1);
      expect(savePlayerSave).toHaveBeenCalledWith('new-user', expect.objectContaining({
        auth: expect.objectContaining({ level: 1, xp: 0 }),
        collection: { cards: [], coins: 50 },
      }));
    });

    it('handles legacy flat save shape (backward compat)', async () => {
      (useAuthStore.getState as any).mockReturnValue({
        user: { id: 'user-1' },
        isCloudSynced: true,
      });
      (useCollectionStore.getState as any).mockReturnValue({});
      // OLD shape: state is the collection state directly (no nested keys)
      (loadPlayerSave as any).mockResolvedValue({
        state: { cards: [{ id: 'old-c1' }], coins: 50 },
        schema_version: 1,
      });

      const ctrl = createSyncController();
      await act(async () => {
        await ctrl.start();
      });

      // collectionStore still gets the legacy flat shape
      expect(useCollectionStore.setState).toHaveBeenCalledWith({ cards: [{ id: 'old-c1' }], coins: 50 });
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
      await act(async () => {
        await ctrl.start();
      });

      expect(useCollectionStore.setState).not.toHaveBeenCalled();
    });
  });

  describe('save', () => {
    it('persists BOTH auth progress and collection state to Supabase', async () => {
      (useAuthStore.getState as any).mockReturnValue({
        user: { id: 'user-1', level: 3, xp: 500, badges: [] },
        totalBattles: 10,
        totalWins: 7,
        totalCards: 20,
        studySessions: 5,
      });
      (useCollectionStore.getState as any).mockReturnValue({ cards: [{ id: 'c1' }], coins: 500 });
      (savePlayerSave as any).mockResolvedValue(undefined);

      const ctrl = createSyncController();
      await act(async () => {
        await ctrl.save();
      });

      // Save should include BOTH auth and collection
      expect(savePlayerSave).toHaveBeenCalledWith('user-1', expect.objectContaining({
        auth: expect.objectContaining({
          level: 3,
          xp: 500,
          totalBattles: 10,
          totalWins: 7,
          totalCards: 20,
          studySessions: 5,
        }),
        collection: { cards: [{ id: 'c1' }], coins: 500 },
      }));
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
