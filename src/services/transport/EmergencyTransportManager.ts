import {
  EmergencyPriority,
  EmergencyTransport,
  MeshEmergencyReport,
  NearbyRelayDevice,
  NetworkConnectionStatus,
} from '../../types/emergencyNetwork';
import { IndexedDBTransport } from './IndexedDBTransport';
import { WebSimulatedMeshTransport } from './WebSimulatedMeshTransport';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const MAX_HOPS = 10;
const DEFAULT_TTL_SECONDS = 7200; // 2 hours

export class EmergencyTransportManager {
  private static instance: EmergencyTransportManager;
  private indexedDBTransport: IndexedDBTransport;
  private simulatedMeshTransport: WebSimulatedMeshTransport;
  private statusChangeCallbacks: ((status: NetworkConnectionStatus, activePacket?: MeshEmergencyReport) => void)[] = [];
  private currentStatus: NetworkConnectionStatus = 'ONLINE';
  private activePacket: MeshEmergencyReport | undefined;

  private constructor() {
    this.indexedDBTransport = new IndexedDBTransport();
    this.simulatedMeshTransport = new WebSimulatedMeshTransport();

    this.checkCurrentNetworkStatus();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }

    // Subscribe to incoming simulated mesh relays
    this.simulatedMeshTransport.receiveReport((incomingReport) => {
      this.handleIncomingRelayReport(incomingReport);
    });

    // Auto sync timer loop
    setInterval(() => {
      this.syncPendingReports();
    }, 12000);
  }

  public static getInstance(): EmergencyTransportManager {
    if (!EmergencyTransportManager.instance) {
      EmergencyTransportManager.instance = new EmergencyTransportManager();
    }
    return EmergencyTransportManager.instance;
  }

  public onStatusChange(callback: (status: NetworkConnectionStatus, activePacket?: MeshEmergencyReport) => void) {
    this.statusChangeCallbacks.push(callback);
    callback(this.currentStatus, this.activePacket);
  }

  private notifyStatus(status: NetworkConnectionStatus, packet?: MeshEmergencyReport) {
    this.currentStatus = status;
    this.activePacket = packet;
    this.statusChangeCallbacks.forEach((cb) => cb(status, packet));
  }

  public async checkCurrentNetworkStatus(): Promise<NetworkConnectionStatus> {
    const isOnline = navigator.onLine;
    if (isOnline) {
      this.notifyStatus('ONLINE');
      return 'ONLINE';
    } else {
      this.notifyStatus('OFFLINE');
      return 'OFFLINE';
    }
  }

  private async handleNetworkChange(online: boolean) {
    if (online) {
      this.notifyStatus('ONLINE');
      await this.syncPendingReports();
    } else {
      this.notifyStatus('OFFLINE');
    }
  }

  /**
   * Helper function to generate simple packet hash for idempotency and duplicate checking
   */
  private generatePacketHash(reportId: string, lat: number, lng: number, timestamp: string): string {
    return `hash-${reportId.slice(0, 8)}-${lat.toFixed(3)}-${lng.toFixed(3)}-${Date.parse(timestamp)}`;
  }

  /**
   * Create and Submit Emergency Report (Handles both Online & Offline Store-and-Forward)
   */
  public async submitEmergencyReport(payload: {
    categoryCode: string;
    description: string;
    voiceTranscript?: string;
    affectedPeople: number;
    latitude: number;
    longitude: number;
    accuracy?: number;
    locationSource?: 'GPS' | 'MANUAL' | 'NETWORK' | 'ADDRESS';
    landmark?: string;
    village?: string;
    district?: string;
    state?: string;
    priority?: EmergencyPriority;
  }): Promise<{ success: boolean; report: MeshEmergencyReport }> {
    const reportId = crypto.randomUUID();
    const deviceStatus = await this.indexedDBTransport.getDeviceStatus();
    const timestamp = new Date().toISOString();

    const priorityScore: EmergencyPriority =
      payload.priority || (payload.affectedPeople > 5 ? 'CRITICAL' : payload.affectedPeople > 2 ? 'HIGH' : 'MEDIUM');

    const meshReport: MeshEmergencyReport = {
      report_id: reportId,
      disaster_type: payload.categoryCode,
      description: payload.description,
      voice_transcript: payload.voiceTranscript,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy || 10,
      location_source: payload.locationSource || 'GPS',
      landmark: payload.landmark || 'Emergency Location',
      village: payload.village || '',
      district: payload.district || 'District',
      state: payload.state || 'State',
      affected_people: payload.affectedPeople,
      priority: priorityScore,
      sender_device_id: deviceStatus.deviceId,
      hop_count: 0,
      max_hops: MAX_HOPS,
      ttl_seconds: DEFAULT_TTL_SECONDS,
      packet_hash: this.generatePacketHash(reportId, payload.latitude, payload.longitude, timestamp),
      status: navigator.onLine ? 'SYNCING' : 'QUEUED',
      sync_status: 'PENDING',
      relay_path: [deviceStatus.deviceId],
      client_created_at: timestamp,
      source: 'DEVICE_GPS',
    };

    // 1. Always store locally in IndexedDB Transport first (Zero Data Loss guarantee)
    await this.indexedDBTransport.sendReport(meshReport);

    // 2. If Internet is available, transmit directly to Supabase server
    if (navigator.onLine) {
      this.notifyStatus('ONLINE', meshReport);
      const synced = await this.transmitReportToServer(meshReport);

      if (synced) {
        meshReport.status = 'DELIVERED';
        meshReport.relay_path.push('Emergency-Server');
        await this.indexedDBTransport.updateReportStatus(reportId, 'DELIVERED');
        this.notifyStatus('DELIVERED', meshReport);
        return { success: true, report: meshReport };
      }
    }

    // 3. If Offline: Trigger Device-to-Device Relay Discovery & Store-and-Forward
    this.notifyStatus('OFFLINE', meshReport);
    this.triggerRelayForwarding(meshReport);

    return { success: true, report: meshReport };
  }

  /**
   * Device-to-Device Relay Forwarding
   */
  private async triggerRelayForwarding(report: MeshEmergencyReport) {
    this.notifyStatus('SEARCHING_RELAY', report);

    const nearbyDevices = await this.simulatedMeshTransport.discoverNearbyDevices();

    if (nearbyDevices.length > 0) {
      const bestRelay = nearbyDevices[0]; // Top scored smart relay candidate
      this.notifyStatus('FORWARDING', {
        ...report,
        status: 'FORWARDING',
      });

      const forwardRes = await this.simulatedMeshTransport.sendReport(report, bestRelay.device_id);

      if (forwardRes.success) {
        const updatedPath = [...report.relay_path, bestRelay.device_id];
        report.relay_path = updatedPath;
        report.status = 'FORWARDING';
        await this.indexedDBTransport.sendReport(report);

        // If the best relay node has internet, it uploads immediately
        if (bestRelay.has_internet) {
          setTimeout(async () => {
            const uploaded = await this.transmitReportToServer(report);
            if (uploaded) {
              await this.indexedDBTransport.updateReportStatus(report.report_id, 'DELIVERED');
              this.notifyStatus('DELIVERED', report);
            }
          }, 1500);
        }
      }
    }
  }

  /**
   * Handle incoming store-and-forward report from a peer relay device
   */
  private async handleIncomingRelayReport(report: MeshEmergencyReport) {
    // 1. Check duplicate idempotency
    const existing = await this.indexedDBTransport.getAllReports();
    if (existing.some((r) => r.report_id === report.report_id || r.packet_hash === report.packet_hash)) {
      return; // Already processed packet
    }

    // 2. Check Hop limit & TTL expiration
    const createdTime = new Date(report.client_created_at).getTime();
    const isExpired = Date.now() - createdTime > report.ttl_seconds * 1000;
    if (report.hop_count >= report.max_hops || isExpired) {
      report.status = 'EXPIRED';
      await this.indexedDBTransport.sendReport(report);
      return;
    }

    // 3. Store locally
    await this.indexedDBTransport.sendReport(report);

    // 4. If this device has Internet, deliver to Emergency Server
    if (navigator.onLine) {
      const uploaded = await this.transmitReportToServer(report);
      if (uploaded) {
        await this.indexedDBTransport.updateReportStatus(report.report_id, 'DELIVERED');
      }
    } else {
      // Forward to next peer node
      this.triggerRelayForwarding(report);
    }
  }

  /**
   * Transmit report to Supabase PostgreSQL Database (Idempotent Server Ingestion)
   */
  private async transmitReportToServer(report: MeshEmergencyReport): Promise<boolean> {
    if (!isSupabaseConfigured) return true;

    try {
      // 1. Insert Citizen Report into incident_reports table
      const { error: repErr } = await supabase.from('incident_reports').upsert({
        client_uuid: report.report_id,
        category_code: report.disaster_type,
        description: `${report.description} [Relay Path: ${report.relay_path.join(' → ')}]`,
        voice_transcript: report.voice_transcript,
        affected_people: report.affected_people,
        latitude: report.latitude,
        longitude: report.longitude,
        accuracy: report.accuracy,
        location_source: report.location_source,
        landmark: report.landmark,
        village: report.village,
        district: report.district,
        state: report.state,
        created_at: report.client_created_at,
      });

      if (repErr && repErr.code !== '23505') {
        console.warn('[EmergencyTransportManager] Report upsert notice:', repErr.message);
      }

      // 2. Upsert into operational incidents table
      const { error: incErr } = await supabase.from('incidents').upsert({
        id: report.report_id,
        title: `${report.disaster_type} near ${report.landmark || report.village || 'Location'} (Mesh Transmitted)`,
        severity: report.priority === 'CRITICAL' ? 'CRITICAL' : report.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
        status: 'REPORTED',
        latitude: report.latitude,
        longitude: report.longitude,
        location_name: report.landmark || report.village || 'Emergency Location',
        district: report.district,
        state: report.state,
        affected_count_est: report.affected_people,
        priority_score: report.priority === 'CRITICAL' ? 95 : 75,
        created_at: report.client_created_at,
        updated_at: new Date().toISOString(),
      });

      if (incErr && incErr.code !== '23505') {
        console.warn('[EmergencyTransportManager] Incident upsert notice:', incErr.message);
      }

      return true;
    } catch (err) {
      console.error('[EmergencyTransportManager] Server transmission error:', err);
      return false;
    }
  }

  /**
   * Sync all pending queued reports stored locally
   */
  public async syncPendingReports(): Promise<number> {
    if (!navigator.onLine) return 0;

    const reports = await this.indexedDBTransport.getAllReports();
    const pending = reports.filter((r) => r.status === 'QUEUED' || r.status === 'FORWARDING' || r.status === 'SYNCING');

    if (pending.length === 0) return 0;

    let synced = 0;
    for (const report of pending) {
      const ok = await this.transmitReportToServer(report);
      if (ok) {
        synced++;
        await this.indexedDBTransport.updateReportStatus(report.report_id, 'DELIVERED');
      }
    }

    if (synced > 0) {
      this.notifyStatus('DELIVERED');
    }

    return synced;
  }

  public async getStoredMeshReports(): Promise<MeshEmergencyReport[]> {
    return this.indexedDBTransport.getAllReports();
  }
}
