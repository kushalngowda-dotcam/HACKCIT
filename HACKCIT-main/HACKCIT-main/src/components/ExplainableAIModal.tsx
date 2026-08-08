import React from 'react';
import { ExplainableDetails } from '../types';
import { HelpCircle, X, CheckCircle2, ShieldCheck, Sparkles, Database, Clock, Brain } from 'lucide-react';

interface ExplainableAIModalProps {
  details: ExplainableDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExplainableAIModal: React.FC<ExplainableAIModalProps> = ({
  details,
  isOpen,
  onClose
}) => {
  if (!isOpen || !details) return null;

  return (
    <div className="fixed inset-0 z-[3500] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white max-w-lg w-full rounded-2xl border border-teal-200 shadow-2xl p-6 relative m-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center shadow-sm">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base text-slate-800">Explainable AI Decision Audit</h3>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-600 border border-teal-200 text-[10px] font-mono font-bold">
                EXPLAINABILITY NODE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">Transparent Multi-Factor AI Reasoning Engine</p>
          </div>
        </div>

        {/* Target Recommendation Box */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
          <div className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider">AI RECOMMENDATION</div>
          <div className="font-bold text-sm text-teal-800">{details.title}</div>
          <div className="text-xs text-slate-600 font-medium">{details.target}</div>
        </div>

        {/* WHY Breakdown Bullet Points */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-700 font-mono flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>WHY THIS RECOMMENDATION?</span>
          </div>

          <ul className="space-y-1.5 text-xs text-slate-600">
            {details.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start space-x-2 bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Data Considered */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono text-xs">
          <div className="text-slate-500 font-bold flex items-center space-x-1 text-[11px]">
            <Database className="w-3.5 h-3.5 text-teal-600" />
            <span>DATA Telemetry CONSIDERED</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {details.data_considered.map((d, i) => (
              <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-600 shadow-2xs">
                • {d}
              </span>
            ))}
          </div>
        </div>

        {/* Metadata Footer (AI Confidence & Disclaimer) */}
        <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-100 text-slate-500">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>AI Confidence: <strong className="text-emerald-600">{details.confidence}%</strong></span>
          </div>
          <div className="flex items-center space-x-1 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{details.timestamp}</span>
          </div>
        </div>

        {/* Mandatory Explicit Disclaimer Label */}
        <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-700 font-mono text-center">
          ⚡ <strong>AI-assisted recommendation</strong> — Intended to support, not replace, human emergency commander judgment.
        </div>

      </div>
    </div>
  );
};
