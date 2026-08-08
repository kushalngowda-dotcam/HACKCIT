import { supabase, supabaseEnabled } from './supabaseClient';

const TABLE = 'app_state';

export type AppCollectionKey =
  | 'incidents'
  | 'resources'
  | 'hospitals'
  | 'shelters'
  | 'blockages'
  | 'routes'
  | 'alerts';

export type AppSnapshot = {
  [K in AppCollectionKey]: unknown[] | null;
};

export const COLLECTION_KEYS: AppCollectionKey[] = [
  'incidents',
  'resources',
  'hospitals',
  'shelters',
  'blockages',
  'routes',
  'alerts'
];

function isCollectionKey(id: string): id is AppCollectionKey {
  return (COLLECTION_KEYS as string[]).includes(id);
}

type RowResult = { rows: unknown[] | null; errored: boolean };

async function fetchRow(key: AppCollectionKey): Promise<RowResult> {
  if (!supabase) return { rows: null, errored: true };
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('data')
      .eq('id', key)
      .limit(1);
    if (error) throw error;
    if (!data || data.length === 0) return { rows: null, errored: false };
    return { rows: data[0]?.data ?? null, errored: false };
  } catch (err) {
    console.warn(`Supabase: failed to load "${key}", using local fallback.`, err);
    return { rows: null, errored: true };
  }
}

export type LoadResult = {
  snapshot: AppSnapshot;
  reachable: boolean;
};

export async function loadAllState(): Promise<LoadResult | null> {
  if (!supabaseEnabled) return null;
  const results = await Promise.all(COLLECTION_KEYS.map(k => fetchRow(k)));

  const snapshot = {} as AppSnapshot;
  let reachable = false;
  COLLECTION_KEYS.forEach((key, i) => {
    snapshot[key] = results[i].rows;
    if (!results[i].errored) reachable = true;
  });
  return { snapshot, reachable };
}

export async function saveCollection(
  key: AppCollectionKey,
  rows: unknown[]
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from(TABLE).upsert(
      {
        id: key,
        data: rows,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    );
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn(`[Supabase] failed to save "${key}".`, err);
    return false;
  }
}

export async function resetAllState(): Promise<void> {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .in('id', COLLECTION_KEYS);
    if (error) throw error;
  } catch (err) {
    console.warn('[supabase] failed to reset app_state.', err);
  }
}

export type CollectionChangeHandler = (
  key: AppCollectionKey,
  rows: unknown[]
) => void;

export function subscribeAll(onChange: CollectionChangeHandler): () => void {
  if (!supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel('app_state_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: TABLE },
      payload => {
        const id = (payload.new as { id?: unknown } | undefined)?.id ??
          (payload.old as { id?: unknown } | undefined)?.id;
        if (typeof id !== 'string' || !isCollectionKey(id)) return;
        if (payload.eventType === 'DELETE') return;
        const data = (payload.new as { data?: unknown } | undefined)?.data;
        if (Array.isArray(data)) {
          onChange(id, data);
        }
      }
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
}