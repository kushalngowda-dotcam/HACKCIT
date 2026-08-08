import React, { useState } from 'react';
import { Incident, Resource, Hospital, Shelter } from '../types';
import { AlertTriangle, ShieldAlert, X, CheckCircle2, Sparkles, Navigation, ArrowRight, HelpCircle, Flame, Building2, Droplets, Compass } from 'lucide-react';
import { ExplainableAIModal } from './ExplainableAIModal';

interface CrisisModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  resources: Resource[];
  hospitals: Hospital[];
  shelters: Shelter[];
}

export const CrisisModeModal: React.FC<CrisisModeModalProps> = ({
  isOpen,
  onClose,
  incidents,
  resources,
  hospitals,
  shelters
}) => {
  const [showExplain, setShowExplain] = useState(false);

  if (!isOpen) return null;

  const sortedIncidents = [...incidents].sort((a, b) => b.priority_score - a.priority_score);
  const criticals = sortedIncidents.slice(0, 3);
  const availableRes = resources.filter(r => r.status === 'AVAILABLE');
  const primaryHospital = hospitals[0];
  const primaryShelter = shelters[0];

  const explainableData = {
    title: "Crisis Mode Master Emergency Response Directive #901",
    target: "Multi-Agency Simultaneous Dispatch & Sector Lock",
    reasons: [
      `Immediate life threat at ${criticals[0]?.title || 'Building Collapse'} with ${criticals[0]?.people_at_risk || 86} trapped citizens.`,
      `Optimal dispatch routing via North Evacuation Corridor avoiding 4.5ft flood zone on Outer Ring Road.`,
      `${primaryHospital?.name || 'Victoria Hospital'} designated primary trauma receiving unit due to 78 free beds & 12 available ICUs.`,
      `Shelter ${primaryShelter?.name || 'Kanteerava Hub'} prepared for 1,800 evacuee capacity.`
    ],
    data_considered: ['Doppler Radar 180mm Precipitation', 'Structural Sensor Shear', 'Real-time Fleet GPS', 'Trauma Bed Telemetry'],
    confidence: 97,
    timestamp: new Date().toLocaleTimeString()
  };

  return (
    <>
      <div className="fixed inset-0 z-[3200] bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
        <div className="bg-white max-w-3xl w-full rounded-2xl border-2 border-red-500 shadow-2xl p-6 relative m-auto space-y-5 animate-in zoom-in-95 duration-200">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Cinematic Crisis Mode Active Banner */}
          <div className="flex items-center justify-between border-b-2 border-red-100 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-200 animate-pulse">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded bg-red-600 text-white text-xs font-black tracking-widest uppercase animate-pulse">
                    CRISIS MODE ACTIVE
                  </span>
                  <span className="text-xs font-mono text-red-600 font-bold">DEFCON 1 PROTOCOL</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">AI Emergency Response Plan</h2>
              </div>
            </div>

            <button
              onClick={() => setShowExplain(true)}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 font-bold rounded-xl text-xs transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-red-600" />
              <span>Why these actions?</span>
            </button>
          </div>

          {/* Top Priorities Section */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 font-mono flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>TOP EMERGENCIES REQUIRING IMMEDIATE DISPATCH</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {criticals.map((inc, i) => (
                <div key={inc.id} className="p-3 bg-red-50/60 rounded-xl border border-red-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-red-700">#0{i + 1} PRIORITIZED</span>
                    <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-bold">
                      {inc.severity}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-800 line-clamp-1">{inc.title}</div>
                  <div className="text-[10px] text-slate-500">{inc.location.area} ({inc.people_at_risk} pax at risk)</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommended Response Plan */}
          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-teal-800 font-mono flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>AI RECOMMENDED RESPONSE ACTIONS</span>
              </div>
              <span className="text-[10px] font-mono text-teal-700 bg-teal-100 px-2 py-0.5 rounded font-bold">
                OPTIMIZED DIRECTIVE
              </span>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <li className="p-2.5 bg-white rounded-lg border border-teal-100 flex items-center space-x-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Deploy 2 Advanced Trauma ALS Ambulances to Metro Collapse</span>
              </li>
              <li className="p-2.5 bg-white rounded-lg border border-teal-100 flex items-center space-x-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Dispatch 4 Heavy USAR Hydraulic Breaching Personnel</span>
              </li>
              <li className="p-2.5 bg-white rounded-lg border border-teal-100 flex items-center space-x-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Open Shelter B (Kanteerava Hub) for 1,800 Evacuees</span>
              </li>
              <li className="p-2.5 bg-white rounded-lg border border-teal-100 flex items-center space-x-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Redirect Inbound Evacuation to North Bypass Route 1</span>
              </li>
              <li className="p-2.5 bg-white rounded-lg border border-teal-100 flex items-center space-x-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Notify Victoria Level-1 Trauma Center for Inflow</span>
              </li>
              <li className="p-2.5 bg-white rounded-lg border border-teal-100 flex items-center space-x-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Enforce 1.2km Isolation Zone at Peenya Chemical Plume</span>
              </li>
            </ul>
          </div>

          {/* Explicit Label & Execute CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="text-[11px] text-amber-700 font-mono bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
              ⚡ <strong>AI-assisted recommendations</strong> — Requires operator confirmation
            </div>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
            >
              <span>CONFIRM & EXECUTE CRISIS DIRECTIVE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      <ExplainableAIModal
        details={explainableData}
        isOpen={showExplain}
        onClose={() => setShowExplain(false)}
      />
    </>
  );
};
