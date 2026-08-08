import React from 'react';
import { HelpCircle, AlertOctagon, CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { AIRecommendation, AIExplanation } from '../../types/database';

interface ExplainableAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: AIRecommendation | null;
  explanation?: AIExplanation | null;
}

export const ExplainableAIModal: React.FC<ExplainableAIModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  explanation,
}) => {
  if (!isOpen || !recommendation) return null;

  const factors = explanation?.factors_json || [];
  const evidence = explanation?.evidence_used_json || [];
  const confidenceScore = explanation?.confidence_score ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-800/60 text-purple-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-100">Explainable AI Reasoning [WHY?]</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 rounded">
                  TRANSPARENCY
                </span>
              </div>
              <p className="text-xs text-slate-400">Audit trail of factors, evidence, and risk analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recommendation Overview */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="text-xs font-mono text-cyan-400 uppercase font-semibold">
            RECOMMENDED ACTION: {recommendation.action_type}
          </div>
          <div className="text-sm font-semibold text-slate-200">{recommendation.description}</div>
        </div>

        {/* Factors Considered */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Factors Considered:</h4>
          {factors.length === 0 ? (
            <div className="p-3 text-xs text-slate-400 italic bg-slate-950 rounded-lg border border-slate-800">
              No specific AI factors logged for this recommendation.
            </div>
          ) : (
            <div className="space-y-2">
              {factors.map((f, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">{f.factor}</span>
                    <div className="text-slate-400 text-[11px] mt-0.5">{f.impact}</div>
                  </div>
                  <span className="px-2 py-1 bg-slate-800 text-purple-300 rounded font-mono text-[10px] font-bold">
                    Weight: {f.weight}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Evidence Used */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Evidence Grounding:</h4>
          {evidence.length === 0 ? (
            <div className="p-3 text-xs text-slate-400 italic bg-slate-950 rounded-lg border border-slate-800">
              No ground evidence logs attached.
            </div>
          ) : (
            <div className="space-y-2">
              {evidence.map((e, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                  <span className="text-cyan-400 font-semibold">{e.source}:</span>
                  <p className="text-slate-300 italic">"{e.content}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Confidence & Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <AlertOctagon className="w-4 h-4 text-amber-400" />
            <span>Human Commander Approval Required</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {explanation?.disclaimer ||
              'AI decision support recommendation. System calculates priority score and factors from real database inputs. Requires human commander approval before resource dispatch.'}
          </p>
          {confidenceScore !== null && (
            <div className="text-[11px] font-mono text-purple-400 font-bold pt-1">
              Engine Model Confidence: {(confidenceScore * 100).toFixed(0)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
