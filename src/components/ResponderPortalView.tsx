import React, { useState } from 'react';
import { Incident, Resource, ResourceStatus } from '../types';
import { Radio, ShieldCheck, MapPin, Clock, CheckCircle2, ArrowRight, Truck, Navigation, Phone } from 'lucide-react';
import { TacticalGPSModal } from './TacticalGPSModal';

interface ResponderPortalViewProps {
  resources: Resource[];
  incidents: Incident[];
  onUpdateResourceStatus: (resourceId: string, status: ResourceStatus) => void;
  onSelectIncident?: (incident: Incident) => void;
}

export const ResponderPortalView: React.FC<ResponderPortalViewProps> = ({
  resources,
  incidents,
  onUpdateResourceStatus,
  onSelectIncident
}) => {
  const [selectedResId, setSelectedResId] = useState<string>(resources[0]?.id || '');
  const [isGPSOpen, setIsGPSOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeResource = resources.find(r => r.id === selectedResId) || resources[0];
  const assignedIncident = incidents.find(i => i.id === activeResource?.assigned_incident_id) || incidents[0];

  const statuses: ResourceStatus[] = ['DISPATCHED', 'EN_ROUTE', 'ON_SITE', 'AVAILABLE'];

  const handleStatusClick = (st: ResourceStatus) => {
    if (!activeResource) return;
    onUpdateResourceStatus(activeResource.id, st);
    setStatusMessage(`Status updated: ${activeResource.unit_code} set to ${st.replace('_', ' ')}`);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-slate-50 p-4 max-w-2xl mx-auto space-y-5 font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between eoc-card p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 border border-amber-500/40 flex items-center justify-center">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">Responder Tactical Terminal</h1>
            <p className="text-xs text-slate-500 font-mono">Field Crew Operational Sync</p>
          </div>
        </div>

        {/* Unit Switcher */}
        <select
          value={selectedResId}
          onChange={(e) => setSelectedResId(e.target.value)}
          className="bg-white border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-700 focus:ring-1 focus:ring-teal-500 focus:outline-none"
        >
          {resources.map(r => (
            <option key={r.id} value={r.id}>
              {r.unit_code} ({r.name})
            </option>
          ))}
        </select>
      </div>

      {/* Status Update Success Banner */}
      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-700 text-xs font-mono flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Active Tactical Mission Card */}
      {assignedIncident && (
        <div className="eoc-card-glow-amber p-6 rounded-2xl border border-amber-400/40 space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="px-3 py-1 rounded-md bg-red-50 text-red-600 border border-red-300 text-xs font-black tracking-wider">
              MISSION ASSIGNED: {assignedIncident.severity}
            </span>
            <span className="text-xs font-mono text-teal-600 font-bold">
              ETA {activeResource?.eta_minutes || 5} MINS
            </span>
          </div>

          <div>
            <h2 className="text-lg font-extrabold text-slate-900">{assignedIncident.title}</h2>
            <p className="text-xs text-slate-600 flex items-center space-x-1 mt-1">
              <MapPin className="w-4 h-4 text-teal-500" />
              <span>{assignedIncident.location.address} ({assignedIncident.location.area})</span>
            </p>
          </div>

          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1 font-mono">
            <div className="text-[10px] text-slate-500 uppercase">Tactical Orders</div>
            <p className="leading-snug">{assignedIncident.recommended_actions[0] || 'Deploy search & triage immediately.'}</p>
          </div>

          {/* Status Pipeline Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="block text-xs font-mono text-slate-500">UPDATE FIELD OPERATIONAL STATUS</label>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {statuses.map(st => {
                const isActive = activeResource?.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => handleStatusClick(st)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-mono font-bold transition-all border ${
                      isActive
                        ? 'bg-amber-100 text-amber-700 border-amber-400 shadow-md shadow-amber-200/50 scale-105'
                        : 'bg-white text-slate-500 border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start GPS Navigation Button */}
          <div className="pt-2">
            <button
              onClick={() => setIsGPSOpen(true)}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center space-x-2 active:scale-98 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>START GPS TURNS NAVIGATION TO INCIDENT</span>
            </button>
          </div>

        </div>
      )}

      {/* Tactical GPS Modal */}
      <TacticalGPSModal
        isOpen={isGPSOpen}
        onClose={() => setIsGPSOpen(false)}
        resource={activeResource}
        incident={assignedIncident}
        onMarkArrived={() => handleStatusClick('ON_SITE')}
        onSelectIncident={(inc) => {
          setIsGPSOpen(false);
          if (onSelectIncident) onSelectIncident(inc);
        }}
      />

    </div>
  );
};
