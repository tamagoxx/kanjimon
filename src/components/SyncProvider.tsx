'use client';

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCollectionStore } from '../store/collectionStore';
import {
  loadPlayerSave,
  savePlayerSave,
  serializeState,
  debounce,
  type PlayerSave,
} from '../lib/supabaseSync';

export interface SyncController {
  start: () => Promise<void>;
  save: () => Promise<void>;
  stop: () => void;
}

/**
 * Pure controller — testable without React.
 * On start: load cloud save and hydrate collectionStore. Subscribe to changes for debounced save.
 * On stop: unsubscribe.
 */
export function createSyncController(): SyncController {
  let unsubscribe: (() => void) | null = null;
  let activeUserId: string | null = null;
  let debouncedSave: (() => void) | null = null;

  return {
    start: async () => {
      const { user, isCloudSynced } = useAuthStore.getState();
      if (!user || !isCloudSynced) return;

      activeUserId = user.id;

      // 1. Debounced auto-save on changes (subscribe FIRST so we capture
      //    any mutations that happen during the initial load).
      debouncedSave = debounce(() => {
        if (!activeUserId) return;
        const state = useCollectionStore.getState();
        savePlayerSave(activeUserId, serializeState(state)).catch((err) => {
          // eslint-disable-next-line no-console
          console.warn('[SyncProvider] save failed:', err);
        });
      }, 5000);

      unsubscribe = useCollectionStore.subscribe(() => {
        debouncedSave?.();
      });

      // 2. Load remote state → hydrate (after subscribing so we don't miss
      //    mutations the user triggers during load).
      try {
        const save: PlayerSave | null = await loadPlayerSave(user.id);
        if (save?.state) {
          useCollectionStore.setState(save.state as Partial<ReturnType<typeof useCollectionStore.getState>>);
        }
      } catch (err) {
        // Network / DB error → keep local state, log only
        // eslint-disable-next-line no-console
        console.warn('[SyncProvider] load failed, keeping local state:', err);
      }
    },

    save: async () => {
      const { user } = useAuthStore.getState();
      if (!user) return;
      const state = useCollectionStore.getState();
      await savePlayerSave(user.id, serializeState(state));
    },

    stop: () => {
      unsubscribe?.();
      unsubscribe = null;
      debouncedSave = null;
      activeUserId = null;
    },
  };
}

/**
 * React component: wires the SyncController into the app lifecycle.
 * Mounts when user is cloud-synced, unmounts on logout.
 */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  const isCloudSynced = useAuthStore((s) => s.isCloudSynced);
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!isCloudSynced || !userId) return;
    const ctrl = createSyncController();
    ctrl.start();
    // Flush save on unmount (logout)
    return () => {
      ctrl.save().catch(() => {});
      ctrl.stop();
    };
  }, [isCloudSynced, userId]);

  return <>{children}</>;
}
