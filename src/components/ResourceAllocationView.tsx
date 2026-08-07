import React, { useState } from 'react';
import { Resource, Incident } from '../types';
import { Truck, Sparkles, CheckCircle2, Clock, MapPin, Phone, RefreshCw, ShieldCheck, ArrowRight } from 'lucide-react';
import { optimizeResourceAssignments } from '../services/aiEngine';

interface ResourceAllocationViewProps {
  resources: Resource[];
  incidents: Incident[];
  onUpdateResources: (updatedResources: Resource[]) => void;
}

export const ResourceAllocationView: React.FC<ResourceAllocationViewProps> = ({
  resources,
  incidents,
  onUpdateResources
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const handleSimulateAllocation = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const result = optimizeResourceAssignments(incidents, resources);
      
      const updated = resources.map(res => {
        const match = result.recommendations.find(r => r.resourceId === res.id);
        if (match) {
          return {
            ...res,
            status: 'DISPATCHED' as const,
            assigned_incident_id: match.incidentId,
            eta_minutes: match.etaMinutes
          };
        }
        return res;
      });

      onUpdateResources(updated);
      setAiSummary(result.aiSummary);
      setIsOptimizing(false);
    }, 800);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'DISPATCHED':
      case 'EN_ROUTE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'ON_SITE':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070a10] p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header & Simulator CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 eoc-card p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
            <Truck className="w-4 h-4" />
            <span>TACTICAL FLEET MANAGEMENT & MATCHING ENGINE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Smart Resource Allocation</h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            DisasterX AI optimizes response unit matching based on travel distance, incident severity, road blockage bypass routes, and equipment capability.
          </p>
        </div>

        <button
          onClick={handleSimulateAllocation}
          disabled={isOptimizing}
          className="px-6 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 shrink-0"
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>OPTIMIZING MATCHING...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 fill-current" />
              <span>SIMULATE AI ALLOCATION</span>
            </>
          )}
        </button>
      </div>

      {/* AI Summary Banner */}
      {aiSummary && (
        <div className="eoc-card-glow-cyan p-4 rounded-xl border border-cyan-500/40 flex items-start space-x-3 text-xs text-cyan-200 font-mono">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-white mb-0.5">AI MATCHING COMPLETE</div>
            <div>{aiSummary}</div>
          </div>
        </div>
      )}

      {/* Fleet Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map(res => {
          const assignedIncident = incidents.find(i => i.id === res.assigned_incident_id);

          return (
            <div key={res.id} className="eoc-card p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30">
                    {res.unit_code}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(res.status)}`}>
                    {res.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white">{res.name}</h3>
                <div className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{res.current_location.address}</span>
                </div>
              </div>

              {/* Assignment Box */}
              <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs space-y-1.5 font-mono">
                <div className="text-[10px] text-slate-500 uppercase">Assignment Status</div>
                {assignedIncident ? (
                  <div className="space-y-1">
                    <div className="font-bold text-amber-300 flex items-center justify-between">
                      <span className="line-clamp-1">{assignedIncident.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-1" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Location: {assignedIncident.location.area}</span>
                      <span className="text-emerald-400 font-bold">ETA {res.eta_minutes || 6}m</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 italic">Unassigned (Ready on Standby)</div>
                )}
              </div>

              {/* Contact & Capacity */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{res.contact_number}</span>
                </div>
                <div>Capacity: {res.capacity} pax</div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
