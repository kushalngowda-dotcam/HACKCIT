import React, { useState } from 'react';
import { Incident } from '../types';
import { ShieldCheck, CheckCircle2, Sliders, Sparkles, X, UserCheck, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';

interface HumanAIDecisionCardProps {
  incident: Incident;
  onNavigateCounterfactual?: () => void;
}

export const HumanAIDecisionCard: React.FC<HumanAIDecisionCardProps> = ({
  incident,
  onNavigateCounterfactual
}) => {
  const [decisionState, setDecisionState] = useState<'PENDING' | 'ACCEPTED' | 'OVERRIDDEN'>('PENDING');
  const [overrideChoice, setOverrideChoice] = useState<string>('Keep Ambulance A12 available for Zone B flood surge.');

  const handleAccept = () => {
    setDecisionState('ACCEPTED');
  };

  const handleOverride = () => {
    setDecisionState('OVERRIDDEN');
  };

  return (
    <div className="eoc-card p-5 rounded-2xl border border-slate-200 space-y-4 font-sans bg-white shadow-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center shadow-sm">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-slate-800">HUMAN + AI DECISION MODE</span>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-mono font-bold">
                HUMAN-IN-THE-LOOP
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">AI proposes directives; human commander holds final operational authority</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
          COMMAND AUTHORITY ACTIVE
        </span>
      </div>

      {/* AI Recommendation Display */}
      <div className="p-4 bg-teal-50/80 rounded-xl border border-teal-200 space-y-2">
        <div className="text-xs font-bold text-teal-800 font-mono flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>AI RECOMMENDATION</span>
        </div>
        <p className="text-sm font-extrabold text-slate-900 leading-snug">
          "Deploy Heavy Urban Search & Rescue Team USAR-BRAVO-1 and 2 Trauma ALS Ambulances to {incident.title}."
        </p>
        <div className="text-[10px] text-slate-500 font-mono">AI Confidence Score: {incident.confidence}% | Verification Score: {incident.verification_score}%</div>
      </div>

      {/* Interactive Decision Actions */}
      {decisionState === 'PENDING' && (
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            onClick={handleAccept}
            className="w-full sm:flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>ACCEPT AI RECOMMENDATION</span>
          </button>

          <button
            onClick={handleOverride}
            className="w-full sm:flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>OVERRIDE AI RECOMMENDATION</span>
          </button>
        </div>
      )}

      {/* Accepted State */}
      {decisionState === 'ACCEPTED' && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 text-xs font-mono text-emerald-900">
          <div className="font-bold text-sm flex items-center space-x-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>HUMAN DECISION RECORDED: ACCEPTED</span>
          </div>
          <p className="font-sans font-semibold text-slate-800">
            Commander confirmed AI directive. Dispatch order transmitted to field units.
          </p>
        </div>
      )}

      {/* Overridden State */}
      {decisionState === 'OVERRIDDEN' && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-3 text-xs">
          <div className="font-bold text-amber-900 font-mono text-sm flex items-center space-x-1.5">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span>HUMAN DECISION RECORDED: OVERRIDDEN</span>
          </div>

          <div className="space-y-1 font-mono">
            <label className="text-[10px] text-slate-500 uppercase font-bold">Commander Alternative Choice:</label>
            <select
              value={overrideChoice}
              onChange={(e) => setOverrideChoice(e.target.value)}
              className="w-full bg-white border border-amber-300 text-slate-800 text-xs rounded-lg p-2 font-semibold"
            >
              <option value="Keep Ambulance A12 available for Zone B flood surge.">Keep Ambulance A12 available for Zone B flood surge.</option>
              <option value="Reroute Ambulance A15 from Yeshwanthpur instead.">Reroute Ambulance A15 from Yeshwanthpur instead.</option>
              <option value="Request Inter-District Mutual Aid Assistance.">Request Inter-District Mutual Aid Assistance.</option>
            </select>
          </div>

          <div className="p-3 bg-white rounded-lg border border-amber-200 space-y-2">
            <p className="font-bold text-slate-800">
              Would you like to simulate the consequences of this decision?
            </p>
            {onNavigateCounterfactual && (
              <button
                onClick={onNavigateCounterfactual}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-red-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-1.5 cursor-pointer active:scale-95"
              >
                <Sliders className="w-4 h-4" />
                <span>RUN COUNTERFACTUAL SIMULATION</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Disclaimer Label */}
      <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500 font-mono text-center">
        ⚡ <strong>Human-in-the-loop control</strong> — AI provides decision support while human commanders retain full execution responsibility.
      </div>
    </div>
  );
};
