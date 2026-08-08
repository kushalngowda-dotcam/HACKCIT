import { EmergencyTransport, MeshEmergencyReport, NearbyRelayDevice } from '../../types/emergencyNetwork';

export class WebSimulatedMeshTransport implements EmergencyTransport {
  name = 'WebSimulatedMeshTransport';
  private deviceId: string;
  private channel: BroadcastChannel | null = null;
  private receiveCallbacks: ((report: MeshEmergencyReport) => void)[] = [];
  private knownNearbyDevices: Map<string, NearbyRelayDevice> = new Map();

  constructor() {
    let storedId = localStorage.getItem('disasterx_device_id');
    if (!storedId) {
      storedId = `Device-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      localStorage.setItem('disasterx_device_id', storedId);
    }
    this.deviceId = storedId;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('disasterx_p2p_mesh_network');
        this.channel.onmessage = (event) => this.handleIncomingBroadcast(event.data);
        this.broadcastPresence();
      } catch (e) {
        console.warn('[WebSimulatedMesh] BroadcastChannel setup notice:', e);
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async checkInternet(): Promise<boolean> {
    return navigator.onLine;
  }

  private broadcastPresence() {
    if (this.channel) {
      this.channel.postMessage({
        type: 'PEER_PRESENCE',
        device: {
          device_id: this.deviceId,
          device_name: `Nearby Device (${this.deviceId})`,
          has_internet: navigator.onLine,
          battery_level: 88,
          signal_strength: -65,
          reliability_score: 0.95,
          current_relay_load: 0,
          last_seen: new Date().toISOString(),
          connection_type: 'WEB_BROADCAST_CHANNEL',
        } as NearbyRelayDevice,
      });
    }
  }

  private handleIncomingBroadcast(data: any) {
    if (!data || !data.type) return;

    if (data.type === 'PEER_PRESENCE' && data.device && data.device.device_id !== this.deviceId) {
      this.knownNearbyDevices.set(data.device.device_id, data.device);
    }

    if (data.type === 'MESH_REPORT_FORWARD' && data.report) {
      const report: MeshEmergencyReport = data.report;
      // Do not process packets that have exceeded max_hops or TTL
      if (report.hop_count >= (report.max_hops || 10)) return;

      this.receiveCallbacks.forEach((cb) => cb(report));
    }
  }

  /**
   * Smart Relay Selection Algorithm: Scores candidate devices
   * Prefer devices with Internet connectivity, higher battery level, and high reliability
   */
  public calculateSmartRelayScore(device: NearbyRelayDevice): number {
    let score = 0;
    if (device.has_internet) score += 50; // High bonus for internet connection
    score += (device.battery_level / 100) * 20; // Up to 20 pts for battery
    score += device.reliability_score * 20; // Up to 20 pts for reliability
    score -= device.current_relay_load * 5; // Penalty for current relay load
    return Math.max(0, score);
  }

  async discoverNearbyDevices(): Promise<NearbyRelayDevice[]> {
    this.broadcastPresence();

    // Fallback simulated nearby relay nodes if running on single browser window
    if (this.knownNearbyDevices.size === 0) {
      const simulatedRelays: NearbyRelayDevice[] = [
        {
          device_id: 'Device-B-Relay',
          device_name: 'Nearby Device B (Relay Node)',
          has_internet: false,
          battery_level: 90,
          signal_strength: -55,
          reliability_score: 0.92,
          current_relay_load: 1,
          last_seen: new Date().toISOString(),
          connection_type: 'WEB_BROADCAST_CHANNEL',
        },
        {
          device_id: 'Device-C-Gateway',
          device_name: 'Device C (Internet Gateway)',
          has_internet: true,
          battery_level: 85,
          signal_strength: -45,
          reliability_score: 0.98,
          current_relay_load: 0,
          last_seen: new Date().toISOString(),
          connection_type: 'WEB_BROADCAST_CHANNEL',
        },
      ];

      simulatedRelays.forEach((r) => this.knownNearbyDevices.set(r.device_id, r));
    }

    const devices = Array.from(this.knownNearbyDevices.values());
    return devices.sort((a, b) => this.calculateSmartRelayScore(b) - this.calculateSmartRelayScore(a));
  }

  async sendReport(report: MeshEmergencyReport, targetDeviceId?: string): Promise<{ success: boolean; ackReceived: boolean; nextHopDevice?: string }> {
    const updatedPath = [...(report.relay_path || []), this.deviceId];
    const forwardedPacket: MeshEmergencyReport = {
      ...report,
      hop_count: report.hop_count + 1,
      status: 'FORWARDING',
      relay_path: updatedPath,
    };

    if (this.channel) {
      this.channel.postMessage({
        type: 'MESH_REPORT_FORWARD',
        targetDeviceId,
        report: forwardedPacket,
      });
    }

    return {
      success: true,
      ackReceived: false,
      nextHopDevice: targetDeviceId || 'Device-B-Relay',
    };
  }

  receiveReport(callback: (report: MeshEmergencyReport) => void): void {
    this.receiveCallbacks.push(callback);
  }

  async getDeviceStatus() {
    return {
      deviceId: this.deviceId,
      batteryLevel: 88,
      internetAvailable: navigator.onLine,
    };
  }
}
