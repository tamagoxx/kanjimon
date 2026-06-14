import { supabase } from './supabase';

export const CURRENT_SCHEMA_VERSION = 1;

export interface PlayerSave {
  state: Record<string, any>;
  schema_version: number;
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Strip non-serializable values from state.
 * JSON.stringify ignores functions and undefined, but we
 * also need to handle circular references and Date objects.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeState<T extends Record<string, any>>(state: T): T {
  const seen = new WeakSet();
  return JSON.parse(
    JSON.stringify(state, (_key, value) => {
      if (typeof value === 'function' || typeof value === 'symbol') {
        return undefined;
      }
      if (value && typeof value === 'object') {
        if (value instanceof Date) return value.toISOString();
        if (seen.has(value)) return undefined; // break circular
        seen.add(value);
      }
      return value;
    })
  );
}

/**
 * Parse JSON string into state object.
 * Returns null on parse failure or null/undefined input.
 */
export function deserializeState(json: string | null | undefined): Record<string, any> | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Load player save from Supabase.
 * Returns null if no row exists.
 */
export async function loadPlayerSave(userId: string): Promise<PlayerSave | null> {
  const { data, error } = await supabase
    .from('player_saves')
    .select('state, schema_version')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as PlayerSave;
}

/**
 * Upsert player save to Supabase.
 */
export async function savePlayerSave(
  userId: string,
  state: Record<string, any>
): Promise<void> {
  const { error } = await supabase
    .from('player_saves')
    .upsert({
      user_id: userId,
      state,
      schema_version: CURRENT_SCHEMA_VERSION,
    });
  if (error) throw error;
}

/**
 * Delete player save from Supabase.
 */
export async function deletePlayerSave(userId: string): Promise<void> {
  const { error } = await supabase
    .from('player_saves')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
}
