import React, { useState } from 'react';
import { Clock, TrendingUp, AlertTriangle, Activity, X, Zap } from 'lucide-react';
import { Incident } from '../../types/database';
import { runFutureVisionSimulation } from '../../services/aiService';

interface SimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({
  isOpen,
  onClose,
  incidents,
}) => {
  const [timeframe, setTimeframe] = useState<number>(3); // Default +3 Hours

  if (!isOpen) return null;

  const result = runFutureVisionSimulation(timeframe, incidents);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">Predictive Future Vision & What-If Simulation</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-bold">
                  AI ESTIMATE
                </span>
              </div>
              <p className="text-xs text-slate-400">Simulate incident escalation, hospital pressure, and resource load</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeframe Selector Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-slate-400">Select Forecast Horizon:</label>
          <div className="grid grid-cols-4 gap-3">
            {[1, 3, 6, 12].map((hours) => (
              <button
                key={hours}
                onClick={() => setTimeframe(hours)}
                className={`py-2.5 rounded-xl font-mono text-xs font-bold transition-all border ${
                  timeframe === hours
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-950/60'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                +{hours} Hour{hours > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Est. Affected Population</span>
            <div className="text-2xl font-extrabold text-amber-400 font-mono">
              ~{result.affected_pop_est.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500">Based on +{timeframe}h water & fire spread model</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Hospital Pressure Index</span>
            <div className="text-2xl font-extrabold text-red-400 font-mono">
              {result.hospital_pressure_index}%
            </div>
            <p className="text-[10px] text-slate-500">Trauma bed surge probability</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-mono">Escalation Risk Level</span>
            <div className="text-xl font-extrabold text-purple-400 font-mono">
              {result.escalation_risk}
            </div>
            <p className="text-[10px] text-slate-500">Composite multi-factor rating</p>
          </div>
        </div>

        {/* Resource Demand Projections */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <h4 className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" /> Projected Resource Requirements (+{timeframe}h)
          </h4>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[10px]">Ambulances Needed</div>
              <div className="text-base font-bold text-cyan-400 font-mono">{result.resource_demand.ambulances_needed} units</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[10px]">NDRF Teams Needed</div>
              <div className="text-base font-bold text-red-400 font-mono">{result.resource_demand.rescue_teams_needed} teams</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-slate-400 text-[10px]">Relief Shelter Beds</div>
              <div className="text-base font-bold text-purple-400 font-mono">{result.resource_demand.shelter_beds_needed} beds</div>
            </div>
          </div>
        </div>

        {/* AI Disclaimer Banner */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <b>Notice:</b> AI-generated scenario estimate based on live database state. Does not guarantee exact real-world outcomes.
          </span>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-800 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
          >
            Close Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
