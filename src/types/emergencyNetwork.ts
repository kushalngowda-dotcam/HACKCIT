/**
 * DISASTERX AI - Resilient Offline Emergency Communication Network
 * Mesh Packet Schemas, Transport Interfaces & Delivery Statuses
 */

export type NetworkConnectionStatus = 'ONLINE' | 'OFFLINE' | 'SEARCHING_RELAY' | 'FORWARDING' | 'DELIVERED';

export type ReportDeliveryStatus =
  | 'LOCAL_ONLY'
  | 'QUEUED'
  | 'SEARCHING_RELAY'
  | 'FORWARDING'
  | 'SYNCING'
  | 'SERVER_RECEIVED'
  | 'DELIVERED'
  | 'FAILED'
  | 'EXPIRED';

export type EmergencyPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface MeshEmergencyReport {
  report_id: string; // Idempotency UUID
  incident_id?: string;
  disaster_type: string;
  description: string;
  voice_transcript?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  location_source: 'GPS' | 'MANUAL' | 'NETWORK' | 'ADDRESS';
  landmark?: string;
  village?: string;
  district?: string;
  state?: string;
  affected_people: number;
  image_url?: string;
  priority: EmergencyPriority;
  sender_device_id: string; // Unique originating client device ID
  hop_count: number; // Current relay hop distance
  max_hops: number; // Defaults to 10
  ttl_seconds: number; // Defaults to 7200 (2 hours)
  packet_hash: string; // SHA-256 / Checksum string for integrity & duplicate prevention
  status: ReportDeliveryStatus;
  sync_status: 'PENDING' | 'SYNCED' | 'FAILED';
  relay_path: string[]; // e.g. ["Device-A", "Device-B", "Device-C", "Emergency-Server"]
  client_created_at: string;
  server_received_at?: string;
  transmission_delay_ms?: number;
  source: 'DEVICE_GPS' | 'RELAY_FORWARD' | 'STORE_AND_FORWARD';
}

export interface NearbyRelayDevice {
  device_id: string;
  device_name: string;
  has_internet: boolean;
  battery_level: number; // 0 - 100%
  signal_strength: number; // dBm / percentage
  reliability_score: number; // 0 - 1.0 score
  current_relay_load: number; // count of active packets
  last_seen: string;
  connection_type: 'WEB_BROADCAST_CHANNEL' | 'BLUETOOTH_LE' | 'WIFI_DIRECT' | 'NATIVE_BRIDGE';
}

export interface EmergencyTransport {
  name: string;
  isAvailable(): Promise<boolean>;
  checkInternet(): Promise<boolean>;
  discoverNearbyDevices(): Promise<NearbyRelayDevice[]>;
  sendReport(report: MeshEmergencyReport, targetDeviceId?: string): Promise<{ success: boolean; ackReceived: boolean; nextHopDevice?: string }>;
  receiveReport(callback: (report: MeshEmergencyReport) => void): void;
  getDeviceStatus(): Promise<{ deviceId: string; batteryLevel: number; internetAvailable: boolean }>;
}
