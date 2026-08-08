import React, { useState } from 'react';
import { Incident, Resource } from '../types';
import { AlertCircle, Clock, Users, ArrowUpRight, CheckCircle2, ShieldAlert, Sparkles, HelpCircle } from 'lucide-react';
import { ExplainableAIModal } from './ExplainableAIModal';

interface AIPriorityQueueProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onTriggerAllocation?: () => void;
}

export const AIPriorityQueue: React.FC<AIPriorityQueueProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onTriggerAllocation
}) => {
  const [explainInc, setExplainInc] = useState<Incident | null>(null);

  const sortedIncidents = [...incidents].sort((a, b) => b.priority_score - a.priority_score);

  const getExplainableData = (inc: Incident) => ({
    title: `AI Priority Score Calculation for ${inc.title}`,
    target: `Computed Priority Score: ${inc.priority_score}/100 | Severity: ${inc.severity}`,
    reasons: [
      `Population at risk factor: ${inc.people_at_risk} citizens exposed in ${inc.location.area}.`,
      `Multi-agency verification confidence rated at ${inc.verification_score}% via sensor correlation.`,
      `Primary hazard compound risk: ${inc.detected_hazards[0] || 'Life Threat Hazard'}.`,
      `Recommended resource response speed requirement: ETA ~${inc.eta_minutes || 6} min.`
    ],
    data_considered: ['Population Density Grid', 'Precipitation Depth Sensor', 'Hospital Distance Matrix', 'Citizen Voice Audit'],
    confidence: inc.confidence,
    timestamp: new Date().toLocaleTimeString()
  });

  return (
    <>
      <div className="eoc-card rounded-2xl p-4 flex flex-col h-full overflow-hidden font-sans">
        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 tracking-tight">AI Priority Queue</h3>
              <p className="text-[10px] text-slate-400 font-mono">Real-time Multi-Criteria Incident Ranking</p>
            </div>
          </div>

          <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-600 border border-teal-200 text-[10px] font-mono font-bold animate-pulse">
            {incidents.length} ACTIVE
          </span>
        </div>

        {/* Incident List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {sortedIncidents.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            const isCritical = inc.severity === 'CRITICAL';
            const isHigh = inc.severity === 'HIGH';

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-teal-50/80 border-teal-400 shadow-md shadow-teal-100'
                    : isCritical
                    ? 'bg-white border-red-200 hover:border-red-400 hover:shadow-sm'
                    : isHigh
                    ? 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Left Color Severity Stripe */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-teal-500'
                  }`}
                />

                {/* Header Badges */}
                <div className="flex items-center justify-between mb-1.5 pl-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wider ${
                      isCritical
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : isHigh
                        ? 'bg-amber-50 text-amber-600 border border-amber-200'
                        : 'bg-teal-50 text-teal-600 border border-teal-200'
                    }`}>
                      {inc.severity}
                    </span>
                    <span className="text-xs font-bold text-slate-700">{inc.incident_type}</span>
                  </div>

                  <div className="flex items-center space-x-1 font-mono">
                    <span className="text-[10px] text-slate-400">PRIORITY</span>
                    <span className={`text-xs font-black px-1.5 py-0.5 rounded ${
                      inc.priority_score >= 90 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {inc.priority_score}
                    </span>

                    {/* FEATURE 2: Explainability Why button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExplainInc(inc);
                      }}
                      className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-bold flex items-center space-x-0.5 cursor-pointer ml-1"
                    >
                      <HelpCircle className="w-2.5 h-2.5 text-teal-600" />
                      <span>Why?</span>
                    </button>
                  </div>
                </div>

                {/* Title & Description */}
                <h4 className="font-bold text-xs text-slate-800 leading-snug pl-2 mb-1">
                  {inc.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 pl-2 mb-2">
                  {inc.location.address}
                </p>

                {/* Telemetry Bar */}
                <div className="flex items-center justify-between text-[11px] font-mono pl-2 text-slate-500 border-t border-slate-100 pt-1.5">
                  <div className="flex items-center space-x-1">
                    <Users className="w-3 h-3 text-amber-500" />
                    <span>{inc.people_at_risk} pax</span>
                  </div>

                  <div className="flex items-center space-x-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>VERIFIED {inc.verification_score}%</span>
                  </div>
                </div>

                <div className="text-[9px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-1.5 border border-amber-200 text-center">
                  ⚡ AI-assisted priority ranking
                </div>
              </div>
            );
          })}
        </div>

        {/* Trigger Allocation CTA */}
        {onTriggerAllocation && (
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={onTriggerAllocation}
              className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>OPTIMIZE AI FLEET DISPATCH</span>
            </button>
          </div>
        )}
      </div>

      <ExplainableAIModal
        details={explainInc ? getExplainableData(explainInc) : null}
        isOpen={!!explainInc}
        onClose={() => setExplainInc(null)}
      />
    </>
  );
};
