import { Incident, IncidentReport } from '../types/database';

export interface IncidentClusterMetrics {
  centroid: { latitude: number; longitude: number } | null;
  radiusKm: number;
  reportCount: number;
  uniqueReporters: number;
  outliers: IncidentReport[];
}

function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

export function computeClusterMetrics(reports: IncidentReport[], fallbackIncident?: Incident): IncidentClusterMetrics {
  if (!reports.length) {
    return {
      centroid: fallbackIncident ? { latitude: fallbackIncident.latitude, longitude: fallbackIncident.longitude } : null,
      radiusKm: 0,
      reportCount: 0,
      uniqueReporters: 0,
      outliers: [],
    };
  }

  const avgLat = reports.reduce((sum, r) => sum + r.latitude, 0) / reports.length;
  const avgLon = reports.reduce((sum, r) => sum + r.longitude, 0) / reports.length;

  const distances = reports.map((r) => haversineDistanceKm(avgLat, avgLon, r.latitude, r.longitude));
  const radiusKm = distances.length ? Math.max(...distances, 0) : 0;

  const outlierThresholdKm = Math.max(1.5, radiusKm * 0.6 || 1.5);
  const outliers = reports.filter((r) => haversineDistanceKm(avgLat, avgLon, r.latitude, r.longitude) > outlierThresholdKm);

  return {
    centroid: { latitude: avgLat, longitude: avgLon },
    radiusKm: Number(radiusKm.toFixed(2)),
    reportCount: reports.length,
    uniqueReporters: new Set(reports.map((r) => r.user_id || r.client_uuid || r.id)).size,
    outliers,
  };
}

export function getReviewPriorityScore({
  reportCount,
  confidence,
  conflictCount,
  severity,
}: {
  reportCount: number;
  confidence?: number;
  conflictCount?: number;
  severity?: string;
}): number {
  const base = Math.min(reportCount * 12, 70) + (confidence ? confidence * 0.4 : 0) + (conflictCount ? conflictCount * 18 : 0);
  if (severity === 'CRITICAL') return base + 20;
  if (severity === 'HIGH') return base + 12;
  return base;
}
