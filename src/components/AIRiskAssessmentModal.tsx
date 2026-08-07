import React, { useState } from 'react';
import { AIRiskZone } from '../types';
import { ShieldAlert, X, AlertTriangle, Users, Sparkles, HelpCircle, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';
import { ExplainableAIModal } from './ExplainableAIModal';

interface AIRiskAssessmentModalProps {
  zone: AIRiskZone | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AIRiskAssessmentModal: React.FC<AIRiskAssessmentModalProps> = ({
  zone,
  isOpen,
  onClose
}) => {
  const [showExplain, setShowExplain] = useState(false);

  if (!isOpen || !zone) return null;

  const explainDetails = {
    title: `AI Risk Assessment for ${zone.name}`,
    target: `Risk Category: ${zone.level} | Population Exposure: ${zone.population_exposure.toLocaleString()}`,
    reasons: [
      `Precipitation radar telemetry predicts compound water accumulation within ${zone.name}.`,
      `Exposure analysis flags ${zone.population_exposure.toLocaleString()} residents in immediate proximity to hazard source.`,
      `Vulnerability score computed from key factors: ${zone.vulnerabilities.join(', ')}.`,
      `Preemptive action recommendation: ${zone.recommended_precaution}`
    ],
    data_considered: ['Doppler Radar Inundation', 'Satellite Density Telemetry', 'Submergence Sensors', 'GIS Road Topography'],
    confidence: 94,
    timestamp: new Date().toLocaleTimeString()
  };

  return (
    <>
      <div className="fixed inset-0 z-[3400] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
        <div className="bg-white max-w-lg w-full rounded-2xl border-2 border-red-500 shadow-2xl p-6 relative my-8 space-y-4 animate-in zoom-in-95 duration-200">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-extrabold tracking-wider font-mono">
                  {zone.level} RISK
                </span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">PREDICTIVE GIS HEATMAP</span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 mt-0.5">{zone.name}</h3>
            </div>
          </div>

          {/* Main Risk Exposure Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>POPULATION EXPOSURE</span>
              </div>
              <div className="text-lg font-black text-slate-800">
                {zone.population_exposure.toLocaleString()} <span className="text-xs text-slate-500 font-normal">citizens</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center space-x-1">
                <Activity className="w-3.5 h-3.5 text-red-500" />
                <span>RISK LEVEL</span>
              </div>
              <div className="text-lg font-black text-red-600">
                {zone.level}
              </div>
            </div>
          </div>

          {/* Main Vulnerabilities */}
          <div className="space-y-1.5">
            <div className="text-xs font-bold text-slate-700 font-mono flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>MAIN VULNERABILITIES</span>
            </div>
            <ul className="space-y-1 text-xs text-slate-600">
              {zone.vulnerabilities.map((v, i) => (
                <li key={i} className="flex items-start space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Potential Escalation */}
          <div className="p-3 bg-red-50/70 rounded-xl border border-red-200 space-y-1 text-xs">
            <div className="font-bold text-red-800 font-mono text-[11px]">⚡ POTENTIAL ESCALATION</div>
            <p className="text-slate-700 leading-snug">{zone.potential_escalation}</p>
          </div>

          {/* Recommended Action / Precaution */}
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 space-y-1 text-xs">
            <div className="font-bold text-teal-800 font-mono text-[11px] flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>RECOMMENDED PRECAUTION</span>
            </div>
            <p className="text-slate-800 font-medium">{zone.recommended_precaution}</p>
          </div>

          {/* Actions & Explainability Button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={() => setShowExplain(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold font-mono transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
              <span>Why this assessment?</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              ACKNOWLEDGE RISK
            </button>
          </div>

          {/* Mandatory Explicit Disclaimer Label */}
          <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-800 font-mono text-center">
            ⚠️ <strong>AI-generated risk estimate</strong> — This layer provides predictive scenario estimates and is not an official emergency warning.
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
