import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { EmergencyTransport, MeshEmergencyReport, NearbyRelayDevice } from '../../types/emergencyNetwork';

interface DisasterXMeshDB extends DBSchema {
  mesh_reports: {
    key: string;
    value: MeshEmergencyReport;
    indexes: { 'by-status': string; 'by-priority': string };
  };
}

const DB_NAME = 'disasterx_mesh_db';
const DB_VERSION = 1;
const MESH_LOCAL_STORAGE_KEY = 'disasterx_mesh_reports_v2';

let dbPromise: Promise<IDBPDatabase<DisasterXMeshDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<DisasterXMeshDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('mesh_reports')) {
          const store = db.createObjectStore('mesh_reports', { keyPath: 'report_id' });
          store.createIndex('by-status', 'status');
          store.createIndex('by-priority', 'priority');
        }
      },
    });
  }
  return dbPromise;
}

function getLocalStorageMeshReports(): MeshEmergencyReport[] {
  try {
    const raw = localStorage.getItem(MESH_LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalStorageMeshReport(report: MeshEmergencyReport) {
  try {
    const existing = getLocalStorageMeshReports();
    const updated = [report, ...existing.filter((r) => r.report_id !== report.report_id)];
    localStorage.setItem(MESH_LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[IndexedDBTransport] LocalStorage save warning:', e);
  }
}

export class IndexedDBTransport implements EmergencyTransport {
  name = 'IndexedDBLocalTransport';
  private deviceId: string;

  constructor() {
    let storedId = localStorage.getItem('disasterx_device_id');
    if (!storedId) {
      storedId = `Device-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      localStorage.setItem('disasterx_device_id', storedId);
    }
    this.deviceId = storedId;
  }

  async isAvailable(): Promise<boolean> {
    return typeof window !== 'undefined' && ('indexedDB' in window || 'localStorage' in window);
  }

  async checkInternet(): Promise<boolean> {
    return navigator.onLine;
  }

  async discoverNearbyDevices(): Promise<NearbyRelayDevice[]> {
    return [];
  }

  async sendReport(report: MeshEmergencyReport): Promise<{ success: boolean; ackReceived: boolean }> {
    const reportToStore: MeshEmergencyReport = {
      ...report,
      sync_status: 'PENDING',
    };

    saveLocalStorageMeshReport(reportToStore);

    try {
      const db = await getDB();
      await db.put('mesh_reports', reportToStore);
    } catch (e) {
      console.warn('[IndexedDBTransport] DB save notice:', e);
    }

    return { success: true, ackReceived: false };
  }

  receiveReport(callback: (report: MeshEmergencyReport) => void): void {
    // Local persistence layer
  }

  async getDeviceStatus() {
    return {
      deviceId: this.deviceId,
      batteryLevel: 92,
      internetAvailable: navigator.onLine,
    };
  }

  // Helper methods to query and update local reports
  async getAllReports(): Promise<MeshEmergencyReport[]> {
    const local = getLocalStorageMeshReports();
    try {
      const db = await getDB();
      const idbItems = await db.getAll('mesh_reports');
      const merged = [...idbItems, ...local].filter(
        (v, i, a) => a.findIndex((t) => t.report_id === v.report_id) === i
      );
      return merged.sort((a, b) => {
        // Priority ordering: CRITICAL -> HIGH -> MEDIUM -> LOW
        const priorityWeight = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
      });
    } catch (e) {
      return local;
    }
  }

  async updateReportStatus(reportId: string, status: MeshEmergencyReport['status'], ackTime?: string): Promise<void> {
    const reports = await this.getAllReports();
    const target = reports.find((r) => r.report_id === reportId);

    if (target) {
      target.status = status;
      if (status === 'DELIVERED' || status === 'SERVER_RECEIVED') {
        target.sync_status = 'SYNCED';
        target.server_received_at = ackTime || new Date().toISOString();
        if (target.client_created_at) {
          target.transmission_delay_ms = new Date(target.server_received_at).getTime() - new Date(target.client_created_at).getTime();
        }
      }
      saveLocalStorageMeshReport(target);

      try {
        const db = await getDB();
        await db.put('mesh_reports', target);
      } catch (e) {}
    }
  }
}
