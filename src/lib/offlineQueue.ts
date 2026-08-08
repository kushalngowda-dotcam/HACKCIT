import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { supabase } from './supabase';

export interface QueuedReport {
  client_uuid: string;
  category_code: string;
  description: string;
  voice_transcript?: string;
  affected_people: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  location_source: 'GPS' | 'MANUAL' | 'NETWORK' | 'ADDRESS';
  village?: string;
  landmark?: string;
  district?: string;
  state?: string;
  created_at: string;
  status: 'QUEUED' | 'SYNCING' | 'SYNCED' | 'FAILED';
  retry_count: number;
  error_message?: string;
}

interface DisasterXDB extends DBSchema {
  queued_reports: {
    key: string;
    value: QueuedReport;
    indexes: { 'by-status': string };
  };
}

const DB_NAME = 'disasterx_offline_db';
const DB_VERSION = 1;
const LOCAL_STORAGE_KEY = 'disasterx_local_reports_v1';

let dbPromise: Promise<IDBPDatabase<DisasterXDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<DisasterXDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('queued_reports')) {
          const store = db.createObjectStore('queued_reports', { keyPath: 'client_uuid' });
          store.createIndex('by-status', 'status');
        }
      },
    });
  }
  return dbPromise;
}

// LocalStorage Helper for 100% reliable fallback
function getLocalStorageReports(): QueuedReport[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalStorageReport(report: QueuedReport) {
  try {
    const existing = getLocalStorageReports();
    const updated = [report, ...existing.filter((r) => r.client_uuid !== report.client_uuid)];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[OfflineQueue] LocalStorage save warning:', e);
  }
}

/**
 * Clear all offline queued reports from IndexedDB & LocalStorage
 */
export async function clearOfflineStorage() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    const db = await getDB();
    await db.clear('queued_reports');
  } catch (e) {
    console.warn('[OfflineQueue] Clear storage notice:', e);
  }
}

/**
 * Save an emergency report locally when offline or during low latency queueing
 */
export async function enqueueOfflineReport(report: Omit<QueuedReport, 'client_uuid' | 'created_at' | 'status' | 'retry_count'>): Promise<QueuedReport> {
  const newReport: QueuedReport = {
    ...report,
    client_uuid: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    status: 'QUEUED',
    retry_count: 0,
  };

  saveLocalStorageReport(newReport);

  try {
    const db = await getDB();
    await db.put('queued_reports', newReport);
  } catch (err) {
    console.warn('[OfflineQueue] IndexedDB put warning:', err);
  }

  if (navigator.onLine) {
    syncOfflineQueue();
  }

  return newReport;
}

/**
 * Get all queued offline reports (combining IndexedDB & localStorage)
 */
export async function getQueuedReports(): Promise<QueuedReport[]> {
  const localItems = getLocalStorageReports();
  try {
    const db = await getDB();
    const idbItems = await db.getAll('queued_reports');
    const merged = [...idbItems, ...localItems].filter(
      (v, i, a) => a.findIndex((t) => t.client_uuid === v.client_uuid) === i
    );
    return merged;
  } catch (e) {
    return localItems;
  }
}

/**
 * Get count of pending queued reports
 */
export async function getPendingReportCount(): Promise<number> {
  const reports = await getQueuedReports();
  return reports.filter(r => r.status === 'QUEUED' || r.status === 'SYNCING' || r.status === 'FAILED').length;
}

/**
 * Synchronize all pending offline reports to Supabase
 */
export async function syncOfflineQueue(onStatusChange?: (syncing: boolean, syncedCount: number) => void): Promise<{ success: number; failed: number }> {
  if (!navigator.onLine) {
    return { success: 0, failed: 0 };
  }

  const reports = await getQueuedReports();
  const pending = reports.filter(r => r.status === 'QUEUED' || r.status === 'FAILED');

  if (pending.length === 0) {
    return { success: 0, failed: 0 };
  }

  if (onStatusChange) onStatusChange(true, 0);

  let successCount = 0;
  let failCount = 0;

  for (const item of pending) {
    try {
      item.status = 'SYNCING';
      saveLocalStorageReport(item);

      const { data, error } = await supabase
        .from('incident_reports')
        .insert({
          client_uuid: item.client_uuid,
          category_code: item.category_code,
          description: item.description,
          voice_transcript: item.voice_transcript,
          affected_people: item.affected_people,
          latitude: item.latitude,
          longitude: item.longitude,
          accuracy: item.accuracy,
          location_source: item.location_source,
          village: item.village,
          landmark: item.landmark,
          district: item.district,
          state: item.state,
          created_at: item.created_at,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          item.status = 'SYNCED';
          saveLocalStorageReport(item);
          successCount++;
          continue;
        }
        throw error;
      }

      item.status = 'SYNCED';
      saveLocalStorageReport(item);
      successCount++;
    } catch (err: any) {
      failCount++;
      item.status = 'FAILED';
      item.retry_count = (item.retry_count || 0) + 1;
      item.error_message = err.message || 'Network sync failed';
      saveLocalStorageReport(item);
    }
  }

  if (onStatusChange) onStatusChange(false, successCount);

  return { success: successCount, failed: failCount };
}
