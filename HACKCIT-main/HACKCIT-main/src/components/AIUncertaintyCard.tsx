import React, { useState } from 'react';
import { Incident, AIUncertaintyState, InformationPriorityItem } from '../types';
import { ShieldAlert, HelpCircle, CheckCircle2, AlertTriangle, Sparkles, Send, ArrowRight, Activity, Search } from 'lucide-react';
import { ExplainableAIModal } from './ExplainableAIModal';

interface AIUncertaintyCardProps {
  incident: Incident;
  onUpdateIncident?: (updatedInc: Incident) => void;
}

export const AIUncertaintyCard: React.FC<AIUncertaintyCardProps> = ({
  incident,
  onUpdateIncident
}) => {
  const [confidence, setConfidence] = useState<number>(64);
  const [isConfirmed, setIsConfirmed] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [showExplain, setShowExplain] = useState<boolean>(false);

  const [missingInfoList, setMissingInfoList] = useState<InformationPriorityItem[]>([
    {
      id: 'info-1',
      title: 'Road accessibility & submerged underpass depth',
      impact: 'HIGH',
      whyItMatters: 'Road accessibility determines whether Heavy USAR Ambulance A12 can navigate to the collapse site without hydro-lock.',
      actionLabel: 'Verify Underpass Depth',
      resolved: false
    },
    {
      id: 'info-2',
      title: 'Exact count of citizens trapped on 2nd floor',
      impact: 'HIGH',
      whyItMatters: 'Trapped victim density determines triage doctor team sizing and oxygen supply requirements.',
      actionLabel: 'Confirm Trapped Count',
      resolved: false
    },
    {
      id: 'info-3',
      title: 'Nearest available trauma bed reserve',
      impact: 'MEDIUM',
      whyItMatters: 'Determines whether incoming patients should be diverted away from Victoria Hospital to Bowring Health Hub.',
      actionLabel: 'Query Trauma Grid',
      resolved: false
    }
  ]);

  const handleResolveInfo = (infoId: string) => {
    setMissingInfoList(prev => prev.map(item => item.id === infoId ? { ...item, resolved: true } : item));
    
    // Elevate confidence and update incident priority
    const newConf = Math.min(96, confidence + 12);
    setConfidence(newConf);

    if (onUpdateIncident) {
      onUpdateIncident({
        ...incident,
        confidence: newConf,
        verification_status: 'VERIFIED',
        verification_score: Math.min(99, incident.verification_score + 8),
        priority_score: Math.min(98, incident.priority_score + 5)
      });
    }
  };

  const handleConfirmTrappedVictims = () => {
    setIsConfirmed(true);
    setShowConfirmModal(false);
    const newConf = 89;
    setConfidence(newConf);

    if (onUpdateIncident) {
      onUpdateIncident({
        ...incident,
        severity: 'CRITICAL',
        confidence: newConf,
        priority_score: 98,
        verification_status: 'VERIFIED',
        verification_score: 97,
        reasoning: 'Confirmed 86 trapped citizens on 2nd floor via field responder thermal camera link. Priority escalated from HIGH to CRITICAL.'
      });
    }
  };

  const explainDetails = {
    title: `AI Uncertainty & Information Value Audit for ${incident.title}`,
    target: `AI Confidence Estimate: ${confidence}% | Priority Score: ${incident.priority_score}/100`,
    reasons: [
      `AI Bayesian reasoning model identified 3 confirmed facts from telemetry: building load fracture, road submergence, hospital capacity.`,
      `Uncertainty model flagged 3 missing telemetry inputs: exact trapped count, underpass water depth, victim injury severity.`,
      `Information Value Engine ranked "Road accessibility" as highest priority question to resolve.`,
      `Confidence escalated from 64% to ${confidence}% following human-in-the-loop verification.`
    ],
    data_considered: ['Citizen Audio Transcripts', 'Radar Doppler Flood Telemetry', 'Field Thermal Imager', 'Hospital Grid Telemetry'],
    confidence,
    timestamp: new Date().toLocaleTimeString()
  };

  return (
    <div className="eoc-card p-5 rounded-2xl border border-slate-200 space-y-4 font-sans bg-white shadow-sm">
      
      {/* Top AI Assessment Banner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm text-slate-800">AI CONFIDENCE & UNCERTAINTY ENGINE</span>
              <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono font-bold">
                BAYESIAN AUDIT
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">Differentiates verified telemetry from missing ground truth</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowExplain(true)}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-bold transition-colors flex items-center space-x-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>Why?</span>
          </button>

          <div className="text-right font-mono">
            <div className="text-xs text-slate-400">AI Confidence Estimate</div>
            <div className={`text-lg font-black ${confidence >= 85 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {confidence}%
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 1: Side-by-Side WHAT AI KNOWS vs WHAT AI DOES NOT KNOW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        
        {/* WHAT AI KNOWS */}
        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-2">
          <div className="font-bold text-emerald-800 font-mono text-[11px] flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>WHAT AI KNOWS</span>
          </div>
          <ul className="space-y-1.5 text-slate-700">
            <li className="flex items-start space-x-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span>4-story commercial structure exhibits 2 beam fractures.</span>
            </li>
            <li className="flex items-start space-x-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Residency Road bypass route is clear of flood water.</span>
            </li>
            <li className="flex items-start space-x-1.5">
              <span className="text-emerald-600 font-bold">•</span>
              <span>Victoria Level-1 Trauma Hospital has 78 available beds.</span>
            </li>
          </ul>
        </div>

        {/* WHAT AI DOES NOT KNOW */}
        <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 space-y-2">
          <div className="font-bold text-amber-800 font-mono text-[11px] flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>WHAT AI DOES NOT KNOW (AI UNCERTAINTY)</span>
          </div>
          <ul className="space-y-1.5 text-slate-700">
            <li className="flex items-start space-x-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span>Exact number of citizens trapped inside 2nd floor rubble.</span>
            </li>
            <li className="flex items-start space-x-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span>Underpass flood depth at MG Road Metro exit connector.</span>
            </li>
            <li className="flex items-start space-x-1.5">
              <span className="text-amber-600 font-bold">•</span>
              <span>Exact severity of critical injuries requiring immediate ICU.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* FEATURE 1: MOST IMPORTANT MISSING INFORMATION BANNER */}
      <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="space-y-0.5 text-xs">
          <div className="font-bold text-red-800 font-mono text-[11px]">MOST IMPORTANT MISSING INFORMATION:</div>
          <p className="text-slate-800 font-semibold">
            {isConfirmed ? "✅ Confirmed: 86 citizens trapped inside 2nd floor debris." : "Confirm whether people are trapped inside the building."}
          </p>
        </div>

        {!isConfirmed ? (
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer active:scale-95 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>CONFIRM INFORMATION</span>
          </button>
        ) : (
          <span className="px-3 py-1 bg-emerald-600 text-white font-mono text-xs font-bold rounded-lg shrink-0">
            CONFIRMED (89% CONF)
          </span>
        )}
      </div>

      {/* FEATURE 2: WHAT SHOULD WE FIND OUT NEXT? (INFORMATION VALUE ENGINE) */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 font-mono flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>WHAT SHOULD WE FIND OUT NEXT? (INFORMATION VALUE ENGINE)</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 font-bold">DECISION IMPACT RANKED</span>
        </div>

        <div className="space-y-2">
          {missingInfoList.map(item => (
            <div key={item.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 shadow-2xs text-xs">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-800 font-mono">{item.title}</div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    item.impact === 'HIGH' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600'
                  }`}>
                    IMPACT: {item.impact}
                  </span>

                  {!item.resolved ? (
                    <button
                      onClick={() => handleResolveInfo(item.id)}
                      className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer"
                    >
                      GET THIS INFORMATION
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-600 font-bold">✓ RESOLVED</span>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-600 font-medium">
                <strong className="text-teal-700">WHY DOES THIS MATTER?</strong> "{item.whyItMatters}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mandatory Disclaimer Label */}
      <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-800 font-mono text-center">
        ⚡ <strong>AI uncertainty estimate</strong> — Information value analysis guides field responder telemetry gathering.
      </div>

      {/* Confirm Information Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[3800] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-white max-w-md w-full rounded-2xl border-2 border-red-500 shadow-2xl p-6 m-auto space-y-4">
            <h3 className="font-black text-lg text-slate-900">Confirm Ground Truth Information</h3>
            <p className="text-xs text-slate-600">
              Provide ground truth telemetry for MG Road Metro Exit collapse site:
            </p>

            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs font-mono font-bold text-red-700">
              Field Responder Confirmation: "86 citizens trapped under fractured second floor beam."
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmTrappedVictims}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                CONFIRM & RE-RUN AI ANALYSIS
              </button>
            </div>
          </div>
        </div>
      )}

      <ExplainableAIModal
        details={explainDetails}
        isOpen={showExplain}
        onClose={() => setShowExplain(false)}
      />
    </div>
  );
};
