import React, { useState, useEffect } from 'react';
import { AlertCircle, ShieldAlert, PhoneCall, Hospital, Home, Bell, MapPin, CheckCircle2, Clock, Radio, RadioTower, ExternalLink } from 'lucide-react';
import { ReportEmergencyModal } from './ReportEmergencyModal';
import { useIncidents } from '../../hooks/useIncidents';
import { useAlerts } from '../../hooks/useAlerts';
import { useHospitals } from '../../hooks/useHospitals';
import { useShelters } from '../../hooks/useShelters';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { EmergencyTransportManager } from '../../services/transport/EmergencyTransportManager';
import { MeshEmergencyReport } from '../../types/emergencyNetwork';

export const CitizenDashboard: React.FC = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { reports, incidents, loading } = useIncidents();
  const { alerts } = useAlerts();
  const { hospitalCapacities } = useHospitals();
  const { shelters } = useShelters();
  const [meshReports, setMeshReports] = useState<MeshEmergencyReport[]>([]);

  useEffect(() => {
    const fetchMesh = async () => {
      const stored = await EmergencyTransportManager.getInstance().getStoredMeshReports();
      setMeshReports(stored);
    };

    fetchMesh();
    const interval = setInterval(fetchMesh, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Urgent Emergency Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950 via-slate-900 to-slate-950 border border-red-800/60 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/30 border border-red-500/50 text-red-400 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 animate-bounce" /> Citizen Emergency SOS Portal
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Need Immediate Emergency Rescue or Assistance?
          </h1>
          <p className="text-sm text-slate-300">
            Submit a 1-tap emergency report. Works offline with store-and-forward mesh queueing. Your GPS location and situation will be transmitted directly to the State Command Center.
          </p>

          <div className="pt-2 flex flex-wrap gap-4">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-6 py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-base shadow-xl shadow-red-950/90 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95"
            >
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              <span>REPORT EMERGENCY NOW</span>
            </button>

            <a
              href="tel:112"
              className="px-5 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm flex items-center gap-2 transition-all"
            >
              <PhoneCall className="w-5 h-5 text-emerald-400" />
              <span>Dial 112 National Helpline</span>
            </a>
          </div>
        </div>
      </div>

      {/* Active Emergency Public Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" /> Active Public Safety Alerts ({alerts.length})
          </h2>
          <div className="space-y-2">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3 shadow-lg"
              >
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-amber-200">{alt.title}</span>
                    <Badge variant="warning">{alt.severity}</Badge>
                  </div>
                  <p className="text-xs text-slate-300">{alt.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: My Reports + Store-and-Forward Mesh Network Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Incident Reports & Store-and-Forward Mesh Status */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" /> Resilient Store-and-Forward Mesh Reports ({meshReports.length})
            </h2>
          </div>

          {meshReports.length === 0 ? (
            <EmptyState
              title="No emergency mesh reports active."
              message="You have not submitted any emergency reports from this browser session."
              actionLabel="Report Emergency"
              onAction={() => setIsReportModalOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {meshReports.map((mesh) => {
                const isDelivered = mesh.status === 'DELIVERED' || mesh.status === 'SERVER_RECEIVED';
                return (
                  <div
                    key={mesh.report_id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-100 uppercase">
                            🚨 {mesh.disaster_type} EMERGENCY
                          </span>
                          <Badge variant={isDelivered ? 'LOW' : 'CRITICAL'}>{mesh.status}</Badge>
                          <Badge variant="default">Priority: {mesh.priority}</Badge>
                        </div>
                        <p className="text-xs text-slate-300">{mesh.description}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        {new Date(mesh.client_created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Transmission Relay Path:</span>
                        <span className="text-purple-400 font-bold">{mesh.relay_path.join(' → ')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Hop Count & TTL:</span>
                        <span className="text-cyan-400 font-bold">Hops: {mesh.hop_count} / {mesh.max_hops} | TTL: {mesh.ttl_seconds}s</span>
                      </div>
                      {mesh.transmission_delay_ms && (
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>Transmission Delay:</span>
                          <span className="font-bold">{(mesh.transmission_delay_ms / 1000).toFixed(2)} seconds</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 font-mono text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        {mesh.landmark || mesh.village || `${mesh.latitude.toFixed(4)}, ${mesh.longitude.toFixed(4)}`}
                      </span>
                      {isDelivered ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Emergency report successfully delivered to emergency server.
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                          <RadioTower className="w-4 h-4 text-amber-400" /> Store-and-Forward Multi-Hop Relay Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Nearby Facilities (Hospitals & Shelters) */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Hospital className="w-4 h-4 text-emerald-400" /> Nearby Emergency Hospitals
            </h2>
            {hospitalCapacities.length === 0 ? (
              <EmptyState title="No hospital capacity data available." message="No dynamic hospital status found." />
            ) : (
              <div className="space-y-2">
                {hospitalCapacities.map((item) => (
                  <div key={item.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{item.hospital?.name || 'Emergency Hospital'}</span>
                      <span className="text-emerald-400 font-mono">
                        {item.available_beds} beds free
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                      <div>ICU Beds: <b className="text-cyan-400 font-mono">{item.available_icu_beds}</b></div>
                      <div>ER Load: <b className="text-amber-400 font-mono">{item.emergency_load_pct}%</b></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Home className="w-4 h-4 text-purple-400" /> Relief Shelters & Camps
            </h2>
            {shelters.length === 0 ? (
              <EmptyState title="No active shelters reported yet." message="No active relief camps found." />
            ) : (
              <div className="space-y-2">
                {shelters.map((sh) => (
                  <div key={sh.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{sh.name}</span>
                      <span className="text-purple-400 font-mono">
                        {sh.capacity - sh.current_occupancy} spots left
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{sh.address}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ReportEmergencyModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
};
