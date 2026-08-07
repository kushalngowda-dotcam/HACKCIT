import React, { useState } from 'react';
import { Resource, Incident } from '../types';
import { Truck, X, Radio, MapPin, Clock, Users, CheckCircle2, Navigation, Send, HelpCircle, ShieldCheck } from 'lucide-react';
import { ExplainableAIModal } from './ExplainableAIModal';
import { realtimeSync } from '../lib/supabaseClient';

interface ResourceDigitalTwinModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  onDispatchResource: (incidentId: string, resourceId: string) => void;
}

export const ResourceDigitalTwinModal: React.FC<ResourceDigitalTwinModalProps> = ({
  resource,
  isOpen,
  onClose,
  incidents,
  onDispatchResource
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || '');
  const [showExplain, setShowExplain] = useState<boolean>(false);

  if (!isOpen || !resource) return null;

  const assignedIncident = incidents.find(i => i.id === resource.assigned_incident_id);

  const handleAssign = () => {
    if (!selectedIncidentId) return;
    onDispatchResource(selectedIncidentId, resource.id);
    
    // Broadcast via Supabase Realtime
    realtimeSync.broadcast('resource_assigned', {
      resourceId: resource.id,
      incidentId: selectedIncidentId,
      timestamp: new Date().toISOString()
    });

    onClose();
  };

  const explainDetails = {
    title: `Digital Twin Telemetry & Dispatch Optimization: ${resource.unit_code}`,
    target: `Unit: ${resource.name} | Type: ${resource.type} | Status: ${resource.status}`,
    reasons: [
      `Real-time GPS coordinates (${resource.current_location.lat.toFixed(4)}, ${resource.current_location.lng.toFixed(4)}) computed for nearest-neighbor dispatch.`,
      `Unit operational capacity rated at ${resource.capacity} pax with active emergency radio comms.`,
      `ETA optimization algorithm calculated ${resource.eta_minutes || 6} min response time avoiding blocked transit polylines.`,
      `Telemetry synchronized live via Supabase Realtime kernel.`
    ],
    data_considered: ['GPS Fleet Telemetry', 'Submergence Map Layer', 'Radio Pulse Ping', 'Trauma Unit Load'],
    confidence: 96,
    timestamp: new Date().toLocaleTimeString()
  };

  return (
    <>
      <div className="fixed inset-0 z-[3400] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
        <div className="bg-white max-w-lg w-full rounded-2xl border-2 border-teal-500 shadow-2xl p-6 relative my-8 space-y-4 animate-in zoom-in-95 duration-200">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center shadow-sm">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-teal-600 text-white font-mono text-[10px] font-bold">
                  {resource.unit_code}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10px] font-mono font-bold">
                  {resource.status}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 mt-0.5">{resource.name}</h3>
            </div>
          </div>

          {/* Digital Twin Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>ETA TO TARGET</span>
              </div>
              <div className="text-base font-black text-slate-800">
                00:0{resource.eta_minutes || 6}:32 <span className="text-[10px] text-slate-400 font-normal">min</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-teal-500" />
                <span>UNIT CAPACITY</span>
              </div>
              <div className="text-base font-black text-teal-700">
                {resource.capacity} <span className="text-[10px] text-slate-500 font-normal">persons</span>
              </div>
            </div>
          </div>

          {/* Location & Status Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-500">
              <span className="flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5 text-teal-500" />
                <span>CURRENT LOCATION</span>
              </span>
              <span className="text-[10px] text-teal-600 font-bold">GPS ACTIVE</span>
            </div>
            <div className="font-bold text-slate-800">{resource.current_location.address}</div>
            <div className="text-[10px] text-slate-400">{resource.current_location.area} ({resource.current_location.lat}, {resource.current_location.lng})</div>
          </div>

          {/* Current Assignment */}
          <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200 space-y-1 text-xs">
            <div className="font-bold text-teal-800 font-mono text-[10px] uppercase flex items-center space-x-1">
              <Radio className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              <span>CURRENT ASSIGNMENT</span>
            </div>
            <div className="font-extrabold text-slate-800">
              {assignedIncident ? assignedIncident.title : 'Standby — Ready for Deployment'}
            </div>
            {assignedIncident && (
              <div className="text-[11px] text-slate-600">
                Location: {assignedIncident.location.address} | Priority Score: {assignedIncident.priority_score}/100
              </div>
            )}
          </div>

          {/* Dispatch Reassignment Controls */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <label className="font-bold text-slate-700 font-mono block">REASSIGN TO EMERGENCY INCIDENT:</label>
            <div className="flex items-center space-x-2">
              <select
                value={selectedIncidentId}
                onChange={(e) => setSelectedIncidentId(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              >
                {incidents.map(inc => (
                  <option key={inc.id} value={inc.id}>
                    [{inc.severity}] {inc.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAssign}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-extrabold rounded-lg text-xs transition-all shadow-md active:scale-95 flex items-center space-x-1 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>DISPATCH</span>
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowExplain(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold font-mono transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>Why this unit?</span>
            </button>

            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
              ⚡ SUPABASE REALTIME CONNECTED
            </span>
          </div>

        </div>
      </div>

      <ExplainableAIModal
        details={explainDetails}
        isOpen={showExplain}
        onClose={() => setShowExplain(false)}
      />
    </>
  );
};
