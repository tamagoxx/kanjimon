'use client';

import { useEffect, useRef } from 'react';
import {
  loadPlayerSave,
  savePlayerSave,
  serializeState,
  debounce,
  CURRENT_SCHEMA_VERSION,
  type PlayerSave,
  type PlayerSaveState,
} from '../lib/supabaseSync';
import { useAuthStore } from '../store/authStore';
import { useCollectionStore } from '../store/collectionStore';

// === Hydration ===
// Saved state uses a nested shape: { auth, collection }.
// New fields can be added to PlayerSaveState (in supabaseSync.ts) and the
// `hydrateFromCloud` function will pick them up automatically.
// Legacy flat saves (state is the collection directly) are still supported.

const isNestedShape = (state: unknown): state is PlayerSaveState => {
  if (!state || typeof state !== 'object') return false;
  const s = state as Record<string, unknown>;
  return 'auth' in s || 'collection' in s;
};

function buildSavePayload(): PlayerSaveState {
  const auth = useAuthStore.getState();
  const collection = useCollectionStore.getState();
  return {
    auth: {
      level: auth.user?.level ?? 1,
      xp: auth.user?.xp ?? 0,
      badges: auth.user?.badges ?? [],
      totalBattles: auth.totalBattles ?? 0,
      totalWins: auth.totalWins ?? 0,
      totalCards: auth.totalCards ?? 0,
      studySessions: auth.studySessions ?? 0,
    },
    collection: serializeState(collection),
  };
}

function hydrateFromCloud(loaded: PlayerSave): void {
  const state = loaded.state;
  if (!state) return;

  if (isNestedShape(state)) {
    if (state.collection && typeof state.collection === 'object') {
      useCollectionStore.setState(state.collection as Partial<ReturnType<typeof useCollectionStore.getState>>);
    }
    if (state.auth && typeof state.auth === 'object') {
      const a = state.auth;
      const currentUser = useAuthStore.getState().user;
      useAuthStore.setState({
        user: currentUser
          ? { ...currentUser, level: a.level ?? 1, xp: a.xp ?? 0, badges: a.badges ?? [] }
          : null,
        totalBattles: a.totalBattles ?? 0,
        totalWins: a.totalWins ?? 0,
        totalCards: a.totalCards ?? 0,
        studySessions: a.studySessions ?? 0,
      });
    }
    return;
  }

  // Legacy: state IS the collection (flat shape)
  if (state && typeof state === 'object') {
    useCollectionStore.setState(state as Partial<ReturnType<typeof useCollectionStore.getState>>);
  }
}

export interface SyncController {
  start: () => Promise<void>;
  save: () => Promise<void>;
  stop: () => void;
}

export function createSyncController(): SyncController {
  const unsubs: Array<() => void> = [];
  let currentUserId: string | null = null;

  return {
    async start() {
      const auth = useAuthStore.getState();
      const activeUserId = auth.user?.id;
      if (!activeUserId || !auth.isCloudSynced) return;
      currentUserId = activeUserId;

      // Subscribe FIRST so any mutations during load are captured.
      const debouncedSave = debounce(async (uid: string) => {
        await savePlayerSave(uid, buildSavePayload());
      }, 5000);

      const onCollectionChange = () => {
        if (!currentUserId) return;
        debouncedSave(currentUserId);
      };
      const onAuthChange = () => {
        if (!currentUserId) return;
        // Guard: only save if this is a progress change, not a user-identity change
        const newUser = useAuthStore.getState().user;
        if (newUser?.id !== currentUserId) return;
        debouncedSave(currentUserId);
      };

      unsubs.push(useCollectionStore.subscribe(onCollectionChange));
      unsubs.push(useAuthStore.subscribe(onAuthChange));

      // Load cloud state
      try {
        const loaded = await loadPlayerSave(activeUserId);
        if (loaded) {
          hydrateFromCloud(loaded);
        } else {
          // First signIn: create initial save row so subsequent logins can load it
          await savePlayerSave(activeUserId, buildSavePayload());
        }
      } catch (err) {
        console.warn('[Sync] failed to load player save:', err);
      }
    },

    async save() {
      const uid = useAuthStore.getState().user?.id ?? currentUserId;
      if (!uid) return;
      await savePlayerSave(uid, buildSavePayload());
    },

    stop() {
      unsubs.forEach((u) => u());
      unsubs.length = 0;
      currentUserId = null;
    },
  };
}

// === React component (mounts one controller in the app tree) ===
export function SyncProvider({ children }: { children: React.ReactNode }) {
  const controllerRef = useRef<SyncController | null>(null);
  const startedForUserId = useRef<string | null>(null);

  useEffect(() => {
    const unsub = useAuthStore.subscribe(async (state, prev) => {
      const userId = state.user?.id ?? null;
      const prevUserId = prev.user?.id ?? null;
      const wasCloud = prev.isCloudSynced;
      const isCloud = state.isCloudSynced;

      // Start sync on first signIn
      if (userId && isCloud && userId !== startedForUserId.current) {
        // Stop any previous controller (e.g. user changed)
        if (controllerRef.current) {
          await controllerRef.current.save().catch(() => {});
          controllerRef.current.stop();
        }
        const ctrl = createSyncController();
        controllerRef.current = ctrl;
        startedForUserId.current = userId;
        await ctrl.start();
      }

      // Stop on signOut
      if ((!userId || !isCloud) && wasCloud && controllerRef.current) {
        await controllerRef.current.save().catch(() => {});
        controllerRef.current.stop();
        controllerRef.current = null;
        startedForUserId.current = null;
      }

      // Stop on user change (different user signed in)
      if (userId && prevUserId && userId !== prevUserId && controllerRef.current) {
        await controllerRef.current.save().catch(() => {});
        controllerRef.current.stop();
        controllerRef.current = null;
        startedForUserId.current = null;
        // Will restart on next render's state update
      }
    });
    return unsub;
  }, []);

  return <>{children}</>;
}

// Re-export for tests
export { CURRENT_SCHEMA_VERSION };
