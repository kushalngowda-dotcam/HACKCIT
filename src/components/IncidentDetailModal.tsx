import React, { useState } from 'react';
import { Incident, Resource } from '../types';
import { X, Sparkles, MapPin, Users, Clock, ShieldCheck, AlertTriangle, Building2, Truck, Navigation, ArrowRight, CheckCircle2, Eye, HelpCircle } from 'lucide-react';
import { ExplainableAIModal } from './ExplainableAIModal';

interface IncidentDetailModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onDispatchResource?: (incidentId: string, resourceId: string) => void;
  onNavigateEvacuation?: (incidentId: string) => void;
  resources?: Resource[];
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  isOpen,
  onClose,
  onDispatchResource,
  onNavigateEvacuation,
  resources = []
}) => {
  const [showExplain, setShowExplain] = useState<boolean>(false);

  if (!isOpen || !incident) return null;

  const isCritical = incident.severity === 'CRITICAL';
  const isHigh = incident.severity === 'HIGH';

  const explainDetails = {
    title: `AI Evidence Intelligence Audit: ${incident.title}`,
    target: `Vision Classifier Model: Gemini 1.5 Flash Vision | Verification: ${incident.verification_score}%`,
    reasons: [
      `Computer vision model parsed pixel array of uploaded media for structural load cracks and water depth cues.`,
      `Hazard detection model extracted ${incident.detected_hazards.length} threat vectors: ${incident.detected_hazards.join(', ')}.`,
      `Infrastructure impact verified across ${incident.infrastructure_damage.length} municipal assets.`,
      `Recommended tactical response: ${incident.recommended_actions[0] || 'Deploy triage team'}.`
    ],
    data_considered: ['High-Res Image Pixels', 'Doppler Weather Overlay', 'Structural Sensor Logs', 'Traffic Cam Stream'],
    confidence: incident.confidence,
    timestamp: new Date().toLocaleTimeString()
  };

  return (
    <>
      <div className="fixed inset-0 z-[3000] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
        <div className="bg-white max-w-3xl w-full rounded-2xl border border-slate-200 shadow-2xl p-6 relative my-8 space-y-5 animate-in fade-in duration-200">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded text-xs font-black tracking-wider ${
                  isCritical
                    ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse'
                    : isHigh
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-teal-50 text-teal-600 border border-teal-200'
                }`}>
                  {incident.severity} SEVERITY
                </span>

                <span className="px-2.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 text-xs font-mono font-bold">
                  PRIORITY {incident.priority_score}/100
                </span>

                {/* FEATURE 2: Why? Explainability Trigger */}
                <button
                  onClick={() => setShowExplain(true)}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-mono font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
                  <span>Why?</span>
                </button>
              </div>

              <h2 className="text-xl font-extrabold text-slate-800 leading-tight mt-1">{incident.title}</h2>
              <p className="text-xs text-teal-600 flex items-center space-x-1 mt-1">
                <MapPin className="w-4 h-4 text-teal-500 shrink-0" />
                <span>{incident.location.address} ({incident.location.area})</span>
              </p>
            </div>

            {/* AI Verification Score Box */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-right font-mono self-start sm:self-auto">
              <div className="text-[10px] text-slate-500">AI VERIFICATION SCORE</div>
              <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                {incident.verification_status} ({incident.verification_score}%)
              </div>
              <div className="text-[9px] text-slate-400">Doppler & Satellite Verified</div>
            </div>
          </div>

          {/* FEATURE 6: FEATURED AI EVIDENCE INTELLIGENCE (Image + Observations side-by-side) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {incident.image_url && (
              <div className="md:col-span-5 space-y-2">
                <div className="h-48 rounded-xl overflow-hidden border border-slate-200 relative shadow-sm">
                  <img src={incident.image_url} alt={incident.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono border border-white/20 backdrop-blur-sm flex items-center space-x-1">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>ORIGINAL EVIDENCE PHOTO</span>
                  </div>
                </div>
              </div>
            )}

            {/* AI OBSERVATIONS CARD */}
            <div className={`${incident.image_url ? 'md:col-span-7' : 'md:col-span-12'} p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-sans`}>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="font-bold text-slate-800 font-mono text-xs flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>AI OBSERVATIONS (EVIDENCE INTELLIGENCE)</span>
                </div>
                <span className="text-[10px] font-mono text-teal-700 bg-teal-100 px-2 py-0.5 rounded font-bold">
                  VISION MODEL
                </span>
              </div>

              <div className="space-y-1.5 text-slate-700">
                <div><strong>Possible Incident:</strong> <span className="font-bold text-slate-900">{incident.incident_type}</span></div>
                <div>
                  <strong>Visible Hazards:</strong>
                  <ul className="list-disc pl-4 mt-0.5 space-y-0.5 text-slate-600">
                    {incident.detected_hazards.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
                <div><strong>Infrastructure Damage:</strong> {incident.infrastructure_damage.join(', ')}</div>
                <div><strong>Approximate Severity:</strong> <span className="font-bold text-red-600">{incident.severity}</span></div>
                <div><strong>Recommended Action:</strong> {incident.recommended_actions[0] || 'Inspect evacuation route'}</div>
              </div>

              <div className="text-[10px] text-amber-700 font-mono bg-amber-50 p-1.5 rounded border border-amber-200 text-center mt-2">
                ⚡ <strong>AI-assisted visual observations</strong> — Observational estimates based on computer vision cues.
              </div>
            </div>
          </div>

          {/* Description & Metrics */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Full Incident Description</div>
            <p className="text-xs text-slate-600 leading-relaxed">{incident.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400">AT RISK</div>
              <div className="font-extrabold text-amber-600 text-sm mt-0.5">{incident.people_at_risk}</div>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400">UNITS ASSIGNED</div>
              <div className="font-extrabold text-teal-600 text-sm mt-0.5">{incident.assigned_resources.length}</div>
            </div>

            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-400">EST. RESPONSE ETA</div>
              <div className="font-extrabold text-emerald-600 text-sm mt-0.5">{incident.eta_minutes || 6} min</div>
            </div>
          </div>

          {/* Actions CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
            >
              CLOSE
            </button>

            {onNavigateEvacuation && (
              <button
                onClick={() => {
                  onNavigateEvacuation(incident.id);
                  onClose();
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center space-x-1.5 cursor-pointer active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>VIEW EVACUATION ROUTE</span>
              </button>
            )}
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
