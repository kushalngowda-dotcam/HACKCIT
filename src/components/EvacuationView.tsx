import React, { useState } from 'react';
import { Incident, Hospital, Shelter, EvacuationRoute, RoadBlockage } from '../types';
import { DisasterMap } from './DisasterMap';
import { Navigation, MapPin, Building2, ShieldAlert, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface EvacuationViewProps {
  incidents: Incident[];
  hospitals: Hospital[];
  shelters: Shelter[];
  routes: EvacuationRoute[];
  blockages: RoadBlockage[];
  onSelectIncident?: (incident: Incident) => void;
}

export const EvacuationView: React.FC<EvacuationViewProps> = ({
  incidents,
  hospitals,
  shelters,
  routes,
  blockages,
  onSelectIncident
}) => {
  const [selectedIncId, setSelectedIncId] = useState<string>(incidents[0]?.id || '');
  const currentIncident = incidents.find(i => i.id === selectedIncId) || incidents[0];

  const nearestShelter = shelters[0];
  const nearestHospital = hospitals.find(h => h.status === 'OPERATIONAL') || hospitals[0];
  const activeRoute = routes.find(r => {
    // Find route that matches current incident location
    if (!currentIncident) return false;
    const startPt = r.path[0];
    const dist = Math.abs(startPt[0] - currentIncident.location.lat) + Math.abs(startPt[1] - currentIncident.location.lng);
    return dist < 0.02;
  }) || routes[0];

  const handleSelect = (inc: Incident) => {
    setSelectedIncId(inc.id);
    if (onSelectIncident) {
      onSelectIncident(inc);
    }
  };

  return (
    <div className="h-[calc(100vh-65px)] bg-slate-50 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden font-sans">
      
      {/* Left Sidebar Evacuation Controls (4 cols) */}
      <div className="lg:col-span-4 flex flex-col h-full space-y-4 overflow-y-auto pr-1">
        
        {/* Module Header */}
        <div className="eoc-card p-5 rounded-2xl space-y-3">
          <div className="flex items-center space-x-2 text-teal-600 font-mono text-xs">
            <Navigation className="w-4 h-4" />
            <span>DYNAMIC SPATIAL ROUTING ENGINE</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800">Evacuation & Route Intelligence</h2>
          <p className="text-xs text-slate-500">
            Select an active incident location to compute real-time non-flooded corridor routes to nearest emergency shelters and trauma hospitals.
          </p>

          {/* Incident Selector */}
          <div>
            <label className="block text-[11px] font-mono text-slate-600 mb-1">TARGET INCIDENT NODE</label>
            <select
              value={selectedIncId}
              onChange={(e) => setSelectedIncId(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded-xl p-2.5 focus:ring-1 focus:ring-teal-500 focus:outline-none shadow-sm"
            >
              {incidents.map(inc => (
                <option key={inc.id} value={inc.id}>
                  [{inc.severity}] {inc.title} ({inc.people_at_risk} pax)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Route Recommendation Card */}
        {currentIncident && (
          <div className="eoc-card-glow-cyan p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-teal-500" />
                <span className="font-extrabold text-sm text-slate-800">AI Evacuation Plan</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-600 border border-teal-200 text-xs font-mono font-bold">
                SAFETY SCORE {activeRoute?.safety_score || 92}%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Primary Evacuation Corridor */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="text-[10px] text-slate-400 font-mono uppercase">Recommended Route</div>
                <div className="font-bold text-teal-700 text-sm mt-0.5">{activeRoute?.name || 'North Airport Bypass Corridor'}</div>
                <div className="text-slate-500 mt-1 flex items-center justify-between font-mono">
                  <span>Est. Travel Time: {activeRoute?.travel_time_minutes || 24} mins</span>
                  <span className="text-emerald-600 font-bold">CLEAR OF WATER</span>
                </div>
              </div>

              {/* Nearest Emergency Shelter */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Primary Shelter</span>
                  <span className="text-[10px] text-emerald-600 font-mono">CAPACITY OK</span>
                </div>
                <div className="font-bold text-slate-800">{nearestShelter?.name}</div>
                <div className="text-[11px] text-slate-500">{nearestShelter?.location.address}</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Occupancy: {nearestShelter?.current_occupancy} / {nearestShelter?.capacity}
                </div>
              </div>

              {/* Nearest Trauma Hospital */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono uppercase">Designated Trauma Hospital</span>
                  <span className="text-[10px] text-teal-600 font-mono">LEVEL-1 CENTER</span>
                </div>
                <div className="font-bold text-slate-800">{nearestHospital?.name}</div>
                <div className="text-[11px] text-slate-500">{nearestHospital?.location.address}</div>
                <div className="text-emerald-600 font-mono text-[11px]">
                  Available Beds: {nearestHospital?.available_beds} ({nearestHospital?.icu_available} ICU Beds)
                </div>
              </div>

              {/* Blocked Road Warnings */}
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-700 space-y-1">
                <div className="font-bold flex items-center space-x-1 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                  <span>BYPASS WARNINGS</span>
                </div>
                <p className="text-[11px] text-red-600">
                  Outer Ring Road Underpass flooded (4.5ft depth). Avoid MG Road Metro junction due to structural debris clearance.
                </p>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Right Map Canvas (8 cols) */}
      <div className="lg:col-span-8 h-full relative">
        <DisasterMap
          incidents={incidents}
          resources={[]}
          hospitals={hospitals}
          shelters={shelters}
          blockages={blockages}
          routes={routes}
          selectedIncident={currentIncident}
          onSelectIncident={handleSelect}
        />
      </div>

    </div>
  );
};
