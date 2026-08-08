import React, { useState, useEffect } from 'react';
import {
  Shield,
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  Radio,
  Send,
  ExternalLink,
  AlertTriangle,
  Hospital as HospitalIcon,
  PhoneCall,
  Flame,
  Activity,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useIncidents } from '../../hooks/useIncidents';
import { useResources } from '../../hooks/useResources';
import { useHospitals } from '../../hooks/useHospitals';
import { IncidentMap } from '../../components/map/IncidentMap';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ResourceStatus, Incident } from '../../types/database';
import {
  discoverNearbyExternalHospitals,
  ExternalEmergencyFacility,
  generateGoogleMapsNavigationUrl,
} from '../../services/mapPlacesService';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const ResponderDashboard: React.FC = () => {
  const { incidents, updateIncidentStatus } = useIncidents();
  const { resources, updateResourceStatus } = useResources();
  const { hospitalCapacities, updateHospitalCapacity } = useHospitals();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | undefined>();
  const [activeUnitCode, setActiveUnitCode] = useState<string>('');
  const [tabFilter, setTabFilter] = useState<'DISPATCHED' | 'ALL'>('DISPATCHED');
  const [liveGps, setLiveGps] = useState<{ lat: number; lng: number }>({ lat: 12.9716, lng: 77.5946 });
  const [statusLog, setStatusLog] = useState<Array<{ id: string; time: string; text: string; tag?: string }>>([]);
  const [logText, setLogText] = useState<string>('');
  const [hospitalTransferAlert, setHospitalTransferAlert] = useState<string | null>(null);
  const [externalHospitals, setExternalHospitals] = useState<ExternalEmergencyFacility[]>([]);

  // Filtered Lists
  const dispatchedIncidents = incidents.filter(
    (i) => i.status === 'DISPATCHED' || i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED'
  );
  const activeIncidents = tabFilter === 'DISPATCHED' ? dispatchedIncidents : incidents;

  const currentResource = resources.find((r) => r.code === activeUnitCode) || resources[0];
  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || activeIncidents[0] || incidents[0];

  // Watch Live GPS location
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLiveGps(coords);
        if (currentResource && (currentResource.status === 'EN_ROUTE' || currentResource.status === 'ON_SCENE')) {
          updateResourceStatus(currentResource.id, currentResource.status, coords.lat, coords.lng);
        }
      },
      (err) => console.warn('[ResponderLiveGPS] GPS notice:', err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [currentResource?.id, currentResource?.status]);

  // Discover external fallback hospitals if verified DB hospitals are empty
  useEffect(() => {
    if (selectedIncident) {
      discoverNearbyExternalHospitals(selectedIncident.latitude, selectedIncident.longitude).then(setExternalHospitals);
    }
  }, [selectedIncident?.id]);

  const handleUnitStatusChange = async (newStatus: ResourceStatus) => {
    if (currentResource) {
      await updateResourceStatus(currentResource.id, newStatus, liveGps.lat, liveGps.lng);
      setStatusLog((prev) => [
        {
          id: `log-${Date.now()}`,
          time: new Date().toLocaleTimeString(),
          text: `Unit ${currentResource.code} (${currentResource.name}) updated status to ${newStatus}`,
          tag: 'STATUS',
        },
        ...prev,
      ]);
    }
  };

  const handleClaimIncident = async (inc: Incident) => {
    await updateIncidentStatus(inc.id, 'IN_PROGRESS', `Self-dispatched & claimed by rescue unit ${currentResource?.code || 'Responder'}`);
    if (currentResource) {
      await updateResourceStatus(currentResource.id, 'EN_ROUTE', liveGps.lat, liveGps.lng);
    }
    setSelectedIncidentId(inc.id);
    setStatusLog((prev) => [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        text: `Unit ${currentResource?.code || 'Responder'} accepted dispatch for "${inc.title}"`,
        tag: 'ACCEPTED',
      },
      ...prev,
    ]);
  };

  const handleAddLog = (e: React.FormEvent, quickTag?: string) => {
    if (e) e.preventDefault();
    const message = quickTag ? `${quickTag}: ${logText || 'Ground update logged'}` : logText;
    if (!message.trim()) return;

    setStatusLog((prev) => [
      {
        id: `log-${Date.now()}`,
        time: new Date().toLocaleTimeString(),
        text: `${currentResource?.code || 'Unit'}: ${message}`,
        tag: quickTag || 'LOG',
      },
      ...prev,
    ]);
    setLogText('');
  };

  const distanceKm = selectedIncident
    ? calculateDistanceKm(liveGps.lat, liveGps.lng, selectedIncident.latitude, selectedIncident.longitude)
    : 0;
  const etaMinutes = Math.max(1, Math.round((distanceKm / 35) * 60));

  const handleLaunchNavigation = (inc: Incident) => {
    const url = generateGoogleMapsNavigationUrl(liveGps.lat, liveGps.lng, inc.latitude, inc.longitude);
    window.open(url, '_blank');
  };

  const handleNotifyHospital = async (hospitalId: string, hospitalName: string) => {
    const targetHosp = hospitalCapacities.find((h) => h.hospital_id === hospitalId);
    if (targetHosp) {
      const casualtyCount = selectedIncident?.affected_count_est || 2;
      await updateHospitalCapacity(hospitalId, {
        incoming_patients: (targetHosp.incoming_patients || 0) + casualtyCount,
      });
      setHospitalTransferAlert(`Transmitted ${casualtyCount} incoming victim alert to ${hospitalName}! Emergency beds reserved.`);
      setTimeout(() => setHospitalTransferAlert(null), 4000);
    } else {
      setHospitalTransferAlert(`Allocated victim routing to External Facility "${hospitalName}". Destination stored.`);
      setTimeout(() => setHospitalTransferAlert(null), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-800 border border-cyan-500/40 text-white shadow-lg">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-100 uppercase tracking-tight">
                First Responder Tactical Command & Dispatch
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 rounded font-bold uppercase">
                Field Active
              </span>
            </div>
            <p className="text-xs text-slate-400">Continuous GPS tracking, target ETA, ground log updates & hospital casualty routing</p>
          </div>
        </div>

        {resources.length > 0 && (
          <div className="flex items-center gap-2.5 text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-slate-400 font-mono font-semibold">UNIT:</span>
            <select
              value={activeUnitCode || currentResource?.code || ''}
              onChange={(e) => setActiveUnitCode(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-cyan-400 font-bold px-3 py-1 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              {resources.map((r) => (
                <option key={r.id} value={r.code}>
                  {r.name} ({r.code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {hospitalTransferAlert && (
        <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs flex items-center justify-between shadow-xl animate-bounce">
          <div className="flex items-center gap-2 font-bold">
            <HospitalIcon className="w-4 h-4 text-emerald-400" />
            <span>{hospitalTransferAlert}</span>
          </div>
        </div>
      )}

      {currentResource && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <span>ACTIVE UNIT: <span className="text-cyan-400 font-mono">{currentResource.name}</span></span>
              <Badge variant={currentResource.status}>{currentResource.status}</Badge>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono">
              <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold">GPS BROADCAST:</span>
              <span className="text-slate-300">
                {liveGps.lat.toFixed(4)}, {liveGps.lng.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {(['AVAILABLE', 'EN_ROUTE', 'ON_SCENE', 'UNAVAILABLE'] as ResourceStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => handleUnitStatusChange(st)}
                className={`py-2 rounded-xl font-bold transition-all border ${
                  currentResource.status === st
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-950/60'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Set {st}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex gap-2">
              <button
                onClick={() => setTabFilter('DISPATCHED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  tabFilter === 'DISPATCHED'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" /> Dispatched ({dispatchedIncidents.length})
              </button>
              <button
                onClick={() => setTabFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  tabFilter === 'ALL'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> All Incidents ({incidents.length})
              </button>
            </div>
          </div>

          {activeIncidents.length === 0 ? (
            <EmptyState
              title={tabFilter === 'DISPATCHED' ? 'No dispatched incidents assigned.' : 'No incidents reported.'}
              message={
                tabFilter === 'DISPATCHED'
                  ? 'Command Center has not dispatched any incidents to your unit yet.'
                  : 'The operational incident database is clear.'
              }
            />
          ) : (
            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {activeIncidents.map((inc) => {
                const isSelected = selectedIncidentId === inc.id || (!selectedIncidentId && inc.id === activeIncidents[0]?.id);
                const incDist = calculateDistanceKm(liveGps.lat, liveGps.lng, inc.latitude, inc.longitude);

                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-500 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-slate-100 block">{inc.title}</span>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={inc.severity}>{inc.severity}</Badge>
                          <Badge variant="default">{inc.status}</Badge>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400 font-bold shrink-0">
                        {incDist.toFixed(1)} km away
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{inc.location_name || 'Target Location'}</span>
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-400 font-mono">Est. Affected: {inc.affected_count_est}</span>
                      {inc.status === 'REPORTED' || inc.status === 'VERIFIED' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClaimIncident(inc);
                          }}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-[10px] flex items-center gap-1"
                        >
                          <ArrowRight className="w-3 h-3" /> Respond & Claim
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateIncidentStatus(inc.id, 'IN_PROGRESS', `Responder ${currentResource?.code} on site.`);
                            handleUnitStatusChange('ON_SCENE');
                          }}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-[10px]"
                        >
                          Mark On Scene
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedIncident && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-100">{selectedIncident.title}</h2>
                    <Badge variant={selectedIncident.severity}>{selectedIncident.severity}</Badge>
                    <Badge variant="default">{selectedIncident.status}</Badge>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>Coordinates: {selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)} ({selectedIncident.location_name || 'Target Area'})</span>
                  </p>
                </div>

                <button
                  onClick={() => handleLaunchNavigation(selectedIncident)}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-cyan-950/50 transition-all transform hover:scale-105"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>OPEN GOOGLE MAPS</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Distance to Target</span>
                  <div className="text-base font-extrabold text-cyan-400">{distanceKm.toFixed(2)} km</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Est. Response ETA</span>
                  <div className="text-base font-extrabold text-emerald-400">~{etaMinutes} min</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Estimated Casualties</span>
                  <div className="text-base font-extrabold text-red-400">{selectedIncident.affected_count_est} victims</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Priority Score</span>
                  <div className="text-base font-extrabold text-purple-400">{selectedIncident.priority_score?.toFixed(0) || 0} / 100</div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    updateIncidentStatus(selectedIncident.id, 'IN_PROGRESS', `Unit ${currentResource?.code} arrived on site.`);
                    handleUnitStatusChange('ON_SCENE');
                  }}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-4 h-4" /> Mark On Scene & Operating
                </button>

                <button
                  onClick={() => {
                    updateIncidentStatus(selectedIncident.id, 'RESOLVED', `Unit ${currentResource?.code} resolved incident.`);
                    handleUnitStatusChange('AVAILABLE');
                  }}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                >
                  <Activity className="w-4 h-4" /> Mark Threat Resolved
                </button>
              </div>
            </div>
          )}

          <div className="h-[380px]">
            <IncidentMap
              incidents={activeIncidents}
              resources={resources}
              hospitals={hospitalCapacities}
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={(inc) => setSelectedIncidentId(inc.id)}
            />
          </div>

          {/* Section 70 Hospital Allocation & Fallback Triage Module */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <HospitalIcon className="w-4 h-4 text-emerald-400" /> Emergency Hospital Allocation & Navigation
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Section 70 Multi-Level Discovery</span>
            </h3>

            {/* Priority 1: Verified DB Hospitals */}
            {hospitalCapacities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {hospitalCapacities.slice(0, 2).map((h) => {
                  const hospNavUrl = generateGoogleMapsNavigationUrl(
                    selectedIncident?.latitude || liveGps.lat,
                    selectedIncident?.longitude || liveGps.lng,
                    h.hospital?.latitude || 12.9634,
                    h.hospital?.longitude || 77.5741
                  );

                  return (
                    <div key={h.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 truncate">{h.hospital?.name}</span>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> VERIFIED
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between">
                        <span>Free Beds: <b className="text-emerald-400">{h.available_beds}</b></span>
                        <span>Free ICU: <b className="text-purple-400">{h.available_icu_beds}</b></span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => handleNotifyHospital(h.hospital_id, h.hospital?.name || 'Hospital')}
                          className="py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-bold rounded text-[10px] flex items-center justify-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3" /> Allocate Hospital
                        </button>
                        <a
                          href={hospNavUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 font-bold rounded text-[10px] flex items-center justify-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" /> Google Maps
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Priority 2: Fallback External Map Discovered Hospitals */
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/60 text-amber-300 text-[11px] font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>⚠️ FALLBACK MODE: No registered DisasterX hospitals available. External places discovery active.</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {externalHospitals.slice(0, 2).map((ext) => {
                    const extNavUrl = generateGoogleMapsNavigationUrl(
                      selectedIncident?.latitude || liveGps.lat,
                      selectedIncident?.longitude || liveGps.lng,
                      ext.latitude,
                      ext.longitude
                    );

                    return (
                      <div key={ext.id} className="p-3 rounded-xl bg-slate-950 border border-amber-900/60 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-200 truncate">{ext.name}</span>
                          <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-800 px-1.5 py-0.5 rounded font-bold">
                            EXTERNAL / UNVERIFIED
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Distance: <b className="text-cyan-400">{ext.distanceKm} km</b> | ETA: <b className="text-emerald-400">~{ext.estimatedTravelTimeMin} min</b>
                        </div>
                        <div className="text-[10px] text-slate-400 italic">
                          Capacity info: <b>Capacity information unavailable</b>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => handleNotifyHospital(ext.id, ext.name)}
                            className="py-1.5 bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 font-bold rounded text-[10px] flex items-center justify-center gap-1"
                          >
                            <PhoneCall className="w-3 h-3" /> Allocate External
                          </button>
                          <a
                            href={extNavUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="py-1.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 font-bold rounded text-[10px] flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Google Maps
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Field Operational Log & Tactical Ground Updates
            </h3>

            <div className="flex flex-wrap gap-2 text-[11px]">
              {['[CASUALTIES RESCUED]', '[TRIAGE COMPLETE]', '[PERIMETER SECURED]', '[HAZMAT CONTAINED]'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => handleAddLog(e, tag)}
                  className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-mono rounded-lg transition-all"
                >
                  + {tag}
                </button>
              ))}
            </div>

            <form onSubmit={(e) => handleAddLog(e)} className="flex gap-2">
              <input
                type="text"
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                placeholder="Enter tactical ground update (e.g. Arrived at red pin coordinates. Deployed extraction unit)..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post Update</span>
              </button>
            </form>

            {statusLog.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 max-h-[180px] overflow-y-auto font-mono text-[11px]">
                {statusLog.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 border-b border-slate-900 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-slate-500 text-[10px]">{log.time}</span>
                    {log.tag && (
                      <span className="px-1.5 py-0.2 bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold rounded text-[9px]">
                        {log.tag}
                      </span>
                    )}
                    <span className="text-slate-200">{log.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
