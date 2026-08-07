import React from 'react';
import { AIAnalysisResult, VerificationStatus } from '../types';
import { Sparkles, AlertTriangle, ShieldCheck, Cpu, CheckCircle, ArrowRight } from 'lucide-react';

interface AIAnalysisCardProps {
  analysis: AIAnalysisResult;
  verificationStatus?: VerificationStatus;
  verificationScore?: number;
  onConfirmSubmit?: () => void;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  analysis,
  verificationStatus = 'VERIFIED',
  verificationScore = 94,
  onConfirmSubmit
}) => {
  const isCritical = analysis.severity === 'CRITICAL';
  const isHigh = analysis.severity === 'HIGH';

  return (
    <div className="eoc-card-glow-cyan p-5 rounded-2xl border border-cyan-500/40 space-y-4 font-sans relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">AI Multi-Modal Analysis Result</h3>
            <p className="text-xs text-slate-400 font-mono">Gemini Vision & Emergency Intelligence Parser</p>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wider ${
          isCritical
            ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
            : isHigh
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
        }`}>
          {analysis.severity} SEVERITY
        </span>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Incident Type</div>
          <div className="text-sm font-bold text-white mt-0.5">{analysis.incident_type}</div>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div className="text-[10px] text-slate-400 font-mono uppercase">AI Confidence</div>
          <div className="text-sm font-bold text-cyan-400 mt-0.5 font-mono">{analysis.confidence}%</div>
        </div>

        <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Est. Affected</div>
          <div className="text-sm font-bold text-amber-300 mt-0.5 font-mono">{analysis.estimated_people_affected} Citizens</div>
        </div>
      </div>

      {/* AI Verification Badge */}
      <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-xs font-bold text-emerald-300">
              AI Verification: {verificationStatus} ({verificationScore}%)
            </div>
            <div className="text-[10px] text-slate-400">Cross-referenced with regional Doppler radar & sensor logs</div>
          </div>
        </div>
        <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
          VERIFIED
        </span>
      </div>

      {/* Detected Hazards & Infrastructure Damage */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-300 flex items-center space-x-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Detected Hazards ({analysis.detected_hazards.length})</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {analysis.detected_hazards.map((hazard, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded-md bg-red-500/10 text-red-300 border border-red-500/30 text-xs font-medium">
              ⚠️ {hazard}
            </span>
          ))}
        </div>
      </div>

      {/* Recommended Resources & Actions */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="text-xs font-bold text-slate-300">Recommended Dispatch Strategy</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <div className="font-semibold text-cyan-300 mb-1">Required Units</div>
            <ul className="space-y-0.5 text-slate-300 font-mono text-[11px]">
              {analysis.recommended_resources.map((r, i) => (
                <li key={i}>• {r.count}x {r.type.replace('_', ' ')}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
            <div className="font-semibold text-cyan-300 mb-1">Immediate Actions</div>
            <ul className="space-y-0.5 text-slate-300 text-[11px]">
              {analysis.recommended_actions.slice(0, 2).map((a, i) => (
                <li key={i}>• {a}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
        <span className="text-cyan-400 font-bold">AI REASONING: </span>
        {analysis.reasoning}
      </div>

      {/* AI Assistance Disclaimer */}
      <div className="text-[10px] text-slate-500 text-center font-mono">
        * AI-assisted verification engine. Human operator review required before high-risk tactical decisions.
      </div>

      {onConfirmSubmit && (
        <button
          onClick={onConfirmSubmit}
          className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center space-x-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>CONFIRM & PUBLISH INCIDENT TO COMMAND CENTER</span>
        </button>
      )}
    </div>
  );
};
