import React, { useState, useEffect } from 'react';
import { Send, MapPin, Hospital as HospitalIcon, Navigation, ShieldCheck, AlertTriangle, X, CheckCircle2, Check, Ban, HelpCircle, ExternalLink, Activity } from 'lucide-react';
import { Incident, Resource, HospitalCapacity, IncidentStatus } from '../../types/database';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Badge } from '../../components/common/Badge';
import {
  discoverNearbyExternalHospitals,
  discoverNearbyExternalRescueServices,
  ExternalEmergencyFacility,
  generateGoogleMapsNavigationUrl,
} from '../../services/mapPlacesService';

interface DispatchIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: Incident | null;
  resources: Resource[];
  hospitals: HospitalCapacity[];
  onDispatchSuccess: (incidentId: string) => void;
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  return Math.round(R * c * 10) / 10;
}

export const DispatchIncidentModal: React.FC<DispatchIncidentModalProps> = ({
  isOpen,
  onClose,
  incident,
  resources,
  hospitals,
  onDispatchSuccess,
}) => {
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('');
  const [useExternalHospital, setUseExternalHospital] = useState<boolean>(false);
  const [useExternalRescue, setUseExternalRescue] = useState<boolean>(false);
  const [externalHospitals, setExternalHospitals] = useState<ExternalEmergencyFacility[]>([]);
  const [externalRescue, setExternalRescue] = useState<ExternalEmergencyFacility[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchDone, setDispatchDone] = useState(false);
  const [actionDoneMsg, setActionDoneMsg] = useState<string | null>(null);

  // Discover nearby external fallback places whenever incident changes or registered items are empty
  useEffect(() => {
    if (incident) {
      discoverNearbyExternalHospitals(incident.latitude, incident.longitude).then((facilities) => {
        setExternalHospitals(facilities);
        if (hospitals.length === 0 && facilities.length > 0) {
          setUseExternalHospital(true);
        }
      });

      discoverNearbyExternalRescueServices(incident.latitude, incident.longitude).then((rescue) => {
        setExternalRescue(rescue);
        if (resources.length === 0 && rescue.length > 0) {
          setUseExternalRescue(true);
        }
      });
    }
  }, [incident?.id, hospitals.length, resources.length]);

  if (!isOpen || !incident) return null;

  // Rank verified DB hospitals using Haversine Distance
  const rankedVerifiedHospitals = hospitals.map((h) => {
    const lat = h.hospital?.latitude || 12.9716;
    const lng = h.hospital?.longitude || 77.5946;
    const distanceKm = calculateHaversineDistance(incident.latitude, incident.longitude, lat, lng);
    return { ...h, distanceKm };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  // Rank verified DB responders
  const rankedVerifiedResources = resources.map((r) => {
    const rLat = r.latitude || 12.9716;
    const rLng = r.longitude || 77.5946;
    const distanceKm = calculateHaversineDistance(incident.latitude, incident.longitude, rLat, rLng);
    return { ...r, distanceKm };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  const activeVerifiedHospital = rankedVerifiedHospitals.find((h) => h.hospital_id === selectedHospitalId) || rankedVerifiedHospitals[0];
  const activeExternalHospital = externalHospitals.find((e) => e.id === selectedHospitalId) || externalHospitals[0];

  const activeVerifiedResource = rankedVerifiedResources.find((r) => r.id === selectedResourceId) || rankedVerifiedResources[0];
  const activeExternalResource = externalRescue.find((e) => e.id === selectedResourceId) || externalRescue[0];

  // Target coordinates for Google Maps navigation
  const targetHospitalLat = useExternalHospital
    ? activeExternalHospital?.latitude || 12.9716
    : activeVerifiedHospital?.hospital?.latitude || 12.9716;
  const targetHospitalLng = useExternalHospital
    ? activeExternalHospital?.longitude || 77.5946
    : activeVerifiedHospital?.hospital?.longitude || 77.5946;

  const targetHospitalName = useExternalHospital
    ? activeExternalHospital?.name || 'External Emergency Facility'
    : activeVerifiedHospital?.hospital?.name || 'Verified Hospital';

  const googleMapsUrl = generateGoogleMapsNavigationUrl(
    incident.latitude,
    incident.longitude,
    targetHospitalLat,
    targetHospitalLng
  );

  const handleUpdateStatus = async (newStatus: IncidentStatus, statusNotes: string) => {
    setIsSubmitting(true);
    try {
      if (isSupabaseConfigured) {
        await supabase
          .from('incidents')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', incident.id);

        await supabase.from('incident_status_history').insert({
          incident_id: incident.id,
          new_status: newStatus,
          notes: statusNotes,
        });

        await supabase.from('audit_logs').insert({
          action: `INCIDENT_STATUS_CHANGE_${newStatus}`,
          entity_type: 'INCIDENTS',
          entity_id: incident.id,
          metadata: { notes: statusNotes },
        });
      }

      setActionDoneMsg(`Incident status updated to ${newStatus}`);
      onDispatchSuccess(incident.id);
      setTimeout(() => {
        setActionDoneMsg(null);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('[DispatchModal] Status update error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const resourceSource = useExternalHospital ? 'EXTERNAL_MAP_SERVICE' : 'REGISTERED_DISASTERX';

      if (isSupabaseConfigured) {
        // 1. Insert incident assignment record
        await supabase.from('incident_assignments').insert({
          incident_id: incident.id,
          resource_id: !useExternalRescue ? activeVerifiedResource?.id : undefined,
          status: 'ASSIGNED',
          notes: notes || `Allocated to ${useExternalRescue ? activeExternalResource?.name : activeVerifiedResource?.name} & Hospital ${targetHospitalName}`,
        });

        // 2. Create Medical Request
        await supabase.from('medical_requests').insert({
          incident_id: incident.id,
          incident_title: incident.title,
          hospital_id: !useExternalHospital ? activeVerifiedHospital?.hospital_id : undefined,
          hospital_name: targetHospitalName,
          patients_count: incident.affected_count_est || 1,
          critical_patients: incident.severity === 'CRITICAL' ? 2 : 0,
          status: 'PENDING',
          latitude: incident.latitude,
          longitude: incident.longitude,
          notes: `${notes || 'Medical dispatch'} (Source: ${resourceSource})`,
        });

        // 3. Store Audit Log with Resource Source
        await supabase.from('audit_logs').insert({
          action: 'ALLOCATE_EMERGENCY_HOSPITAL_AND_RESCUE',
          entity_type: 'INCIDENTS',
          entity_id: incident.id,
          metadata: {
            hospital_name: targetHospitalName,
            resource_source: resourceSource,
            latitude: targetHospitalLat,
            longitude: targetHospitalLng,
          },
        });

        // 4. Update Incident status to DISPATCHED
        await supabase
          .from('incidents')
          .update({ status: 'DISPATCHED', updated_at: new Date().toISOString() })
          .eq('id', incident.id);
      }

      setDispatchDone(true);
      onDispatchSuccess(incident.id);

      setTimeout(() => {
        setDispatchDone(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.error('[DispatchModal] Error executing dispatch:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-xl bg-purple-600 text-white shadow-lg shadow-purple-950/80">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              Admin & Commander Incident Review & Hospital Allocation
            </h3>
            <p className="text-xs text-slate-400">
              Verified DisasterX resources & external map discovery fallback
            </p>
          </div>
        </div>

        {actionDoneMsg ? (
          <div className="p-4 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300 text-center font-bold text-sm">
            {actionDoneMsg}
          </div>
        ) : dispatchDone ? (
          <div className="p-6 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <div className="font-extrabold text-base">HOSPITAL & RESCUE ALLOCATED SUCCESSFULLY!</div>
            <p className="text-xs opacity-90">
              Allocated to <b className="text-white">{targetHospitalName}</b> ({useExternalHospital ? 'External Map Facility' : 'Verified DisasterX Facility'}). Destination stored in database history.
            </p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg"
            >
              <ExternalLink className="w-4 h-4" /> Open Google Maps Route Directions
            </a>
          </div>
        ) : (
          <form onSubmit={handleExecuteDispatch} className="space-y-4 text-xs">
            {/* Incident Summary Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-100 text-sm">{incident.title}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={incident.severity}>{incident.severity}</Badge>
                  <Badge variant="default">{incident.status}</Badge>
                </div>
              </div>
              <div className="text-slate-300 text-xs flex items-center justify-between gap-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  {incident.location_name || `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`}
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${incident.latitude},${incident.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-bold text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> View Incident GPS
                </a>
              </div>
            </div>

            {/* Verification Triage Action Buttons */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] block">
                Human Verification Actions:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('VERIFIED', 'Admin verified incident')}
                  className="py-2 bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold rounded-lg flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Verify Incident
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('ASSISTANCE_REQUIRED', 'Info requested')}
                  className="py-2 bg-amber-950 border border-amber-800 text-amber-300 font-bold rounded-lg flex items-center justify-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Request Info
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus('REJECTED', 'Marked invalid')}
                  className="py-2 bg-red-950 border border-red-800 text-red-300 font-bold rounded-lg flex items-center justify-center gap-1"
                >
                  <Ban className="w-3.5 h-3.5" /> Reject / Invalid
                </button>
              </div>
            </div>

            {/* 1. Rescue Team Selection (Verified vs External Fallback) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-cyan-400" /> 1. Select Rescue Unit / First Responder *
                </label>
                <button
                  type="button"
                  onClick={() => setUseExternalRescue(!useExternalRescue)}
                  className="text-[11px] text-cyan-400 hover:underline font-semibold"
                >
                  {useExternalRescue ? 'Switch to Registered Units' : 'Search External Emergency Services'}
                </button>
              </div>

              {!useExternalRescue && rankedVerifiedResources.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> ✅ VERIFIED DISASTERX RESOURCE
                  </div>
                  <select
                    value={selectedResourceId}
                    onChange={(e) => setSelectedResourceId(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-cyan-500"
                  >
                    {rankedVerifiedResources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code}) — {r.distanceKm} km away | Status: {r.status}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> ⚠️ EXTERNAL / UNVERIFIED EMERGENCY RESOURCE
                  </div>
                  <select
                    value={selectedResourceId}
                    onChange={(e) => setSelectedResourceId(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-amber-200 font-bold focus:outline-none focus:border-amber-500"
                  >
                    {externalRescue.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} — {r.distanceKm} km away (~{r.estimatedTravelTimeMin} min ETA)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 2. Hospital Selection (Verified vs External Map Discovery Fallback) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <HospitalIcon className="w-4 h-4 text-emerald-400" /> 2. Select Destination Hospital *
                </label>
                <button
                  type="button"
                  onClick={() => setUseExternalHospital(!useExternalHospital)}
                  className="text-[11px] text-cyan-400 hover:underline font-semibold"
                >
                  {useExternalHospital ? 'Switch to Registered Hospitals' : 'Search External Map Service'}
                </button>
              </div>

              {!useExternalHospital && rankedVerifiedHospitals.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> ✅ VERIFIED DISASTERX RESOURCE
                  </div>
                  <select
                    value={selectedHospitalId}
                    onChange={(e) => setSelectedHospitalId(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {rankedVerifiedHospitals.map((h) => (
                      <option key={h.id} value={h.hospital_id}>
                        🏥 {h.hospital?.name || 'Emergency Hospital'} — {h.distanceKm} km away | Free Beds: {h.available_beds} | Free ICU: {h.available_icu_beds}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> ⚠️ EXTERNAL / UNVERIFIED RESOURCE
                  </div>
                  <div className="text-[10px] text-slate-400 italic">
                    Hospital discovered via map service. DisasterX has not independently verified capacity. Capacity info: <b>Capacity information unavailable</b>.
                  </div>
                  <select
                    value={selectedHospitalId}
                    onChange={(e) => setSelectedHospitalId(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-amber-900/60 rounded-xl text-amber-200 font-bold focus:outline-none focus:border-amber-500"
                  >
                    {externalHospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        🏥 {h.name} — {h.distanceKm} km away (~{h.estimatedTravelTimeMin} min travel)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Dynamic Navigation Link */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-bold">Google Maps Navigation:</span>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow"
              >
                <ExternalLink className="w-3.5 h-3.5" /> OPEN GOOGLE MAPS
              </a>
            </div>

            {/* Dispatch Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-extrabold text-xs shadow-xl shadow-purple-950/80 uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Allocating...' : 'ALLOCATE HOSPITAL & TRANSMIT DISPATCH'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
