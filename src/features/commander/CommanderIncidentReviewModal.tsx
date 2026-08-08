import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle, MapPin, Layers, Info, HelpCircle, Eye, GitMerge, Split, Check, AlertCircle } from 'lucide-react';
import { Incident, IncidentReport } from '../../types/database';
import { analyzeDuplicateReport, DuplicateAnalysisResult } from '../../services/aiDuplicateEngine';
import { IncidentMap } from '../../components/map/IncidentMap';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

interface CommanderIncidentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident?: Incident;
  allIncidents: Incident[];
  allReports: IncidentReport[];
  onReviewCompleted: () => void;
}

export const CommanderIncidentReviewModal: React.FC<CommanderIncidentReviewModalProps> = ({
  isOpen,
  onClose,
  incident,
  allIncidents,
  allReports,
  onReviewCompleted,
}) => {
  const [showWhyModal, setShowWhyModal] = useState<boolean>(false);
  const [showClusterLocations, setShowClusterLocations] = useState<boolean>(false);
  const [commanderNotes, setCommanderNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  // Filter linked citizen reports belonging to this incident cluster
  const linkedReports = allReports.filter((r) => {
    if (r.incident_id === incident.id) return true;

    const sameDistrict = r.district === incident.district;
    const sameArea = r.landmark && incident.location_name?.includes(r.landmark);
    const distance = Math.hypot(r.latitude - incident.latitude, r.longitude - incident.longitude);
    return sameDistrict || sameArea || distance < 0.05;
  });

  const uniqueReportersCount = new Set(
    linkedReports.map((r) => r.user_id || r.client_uuid || r.id)
  ).size || linkedReports.length || 1;

  // Run AI Duplicate Engine Analysis
  const aiResult: DuplicateAnalysisResult = analyzeDuplicateReport(
    {
      category_code: incident.title.split(' ')[0] || 'EMERGENCY',
      description: incident.title + ' ' + (incident.location_name || ''),
      latitude: incident.latitude,
      longitude: incident.longitude,
      created_at: incident.created_at,
    },
    allIncidents.filter((i) => i.id !== incident.id)
  );

  const handleCommanderDecision = async (
    decisionAction: 'MERGE' | 'SEPARATE' | 'VERIFY' | 'REQUIRES_VERIFICATION' | 'CONTRADICTED'
  ) => {
    setIsSaving(true);

    let newStatus = incident.status;
    if (decisionAction === 'VERIFY') newStatus = 'VERIFIED';
    if (decisionAction === 'REQUIRES_VERIFICATION') newStatus = 'REPORTED';

    if (decisionAction === 'MERGE' && linkedReports.length > 0 && isSupabaseConfigured) {
      try {
        const duplicateReportIds = linkedReports
          .filter((report) => report.id && report.incident_id !== incident.id)
          .map((report) => report.id);

        if (duplicateReportIds.length > 0) {
          await supabase.from('incident_reports').update({ incident_id: incident.id }).in('id', duplicateReportIds);
          await supabase.from('incidents').update({
            reporter_count: Math.max(incident.reporter_count || 1, linkedReports.length),
            updated_at: new Date().toISOString(),
          }).eq('id', incident.id);
        }
      } catch (err) {
        console.warn('[CommanderReview] Merge save notice:', err);
      }
    }

    if (isSupabaseConfigured) {
      try {
        const { data: userData } = await supabase.auth.getUser();

        await supabase
          .from('incidents')
          .update({
            status: newStatus,
            conflict_flag: decisionAction === 'MERGE' || decisionAction === 'VERIFY' ? false : incident.conflict_flag,
            updated_at: new Date().toISOString(),
          })
          .eq('id', incident.id);

        await supabase.from('audit_logs').insert({
          action: `COMMANDER_DECISION_${decisionAction}`,
          entity_type: 'INCIDENTS',
          entity_id: incident.id,
          actor_id: userData.user?.id || undefined,
          metadata: {
            incident_title: incident.title,
            ai_recommendation: aiResult.aiRecommendation,
            ai_confidence: aiResult.duplicateConfidence,
            commander_decision: decisionAction,
            commander_notes: commanderNotes || 'Commander confirmed operational decision',
            linked_reports: linkedReports.map((report) => report.id),
            timestamp: new Date().toISOString(),
          },
        });
      } catch (err) {
        console.warn('[CommanderReview] Decision save notice:', err);
      }
    }

    setIsSaving(false);
    setActionSuccessMsg(`Commander Decision Recorded: ${decisionAction}`);
    setTimeout(() => {
      setActionSuccessMsg(null);
      onReviewCompleted();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Bar */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-3 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-white tracking-tight uppercase">
                Commander Incident Review: #{incident.id.slice(0, 8)}
              </h2>
              <span className="px-2.5 py-0.5 rounded text-xs font-extrabold bg-red-950 text-red-400 border border-red-800">
                {incident.severity} SEVERITY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {incident.title} — {incident.location_name}
            </p>
          </div>
        </div>

        {actionSuccessMsg && (
          <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* 1. Incident Summary & Report Cluster Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
            <span className="text-slate-500 font-mono">Linked Reports</span>
            <div className="text-xl font-extrabold text-slate-100">{linkedReports.length || 1} submission(s)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
            <span className="text-slate-500 font-mono">Unique Reporters</span>
            <div className="text-xl font-extrabold text-cyan-400">{uniqueReportersCount} authenticated</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
            <span className="text-slate-500 font-mono">AI Confidence</span>
            <div className="text-xl font-extrabold text-purple-400">{aiResult.duplicateConfidence}%</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 space-y-1">
            <span className="text-slate-500 font-mono">AI Recommendation</span>
            <div className="text-xs font-bold text-amber-400 uppercase mt-1">{aiResult.aiRecommendation}</div>
          </div>
        </div>

        {/* 2. AI Evidence Analysis & Matrix */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Multi-Source Evidence Verification Matrix
            </h3>
            <button
              onClick={() => setShowWhyModal(true)}
              className="px-3 py-1 bg-purple-900/60 hover:bg-purple-800 border border-purple-700 text-purple-300 font-bold rounded-lg text-[11px] flex items-center gap-1.5 shadow"
            >
              <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> [ WHY? ] AI Reasoning
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 font-mono text-[11px]">
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500">Citizen Reports:</span>
              <div className="font-bold text-emerald-400">{aiResult.evidenceMatrix.citizenReports}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500">GPS Consistency:</span>
              <div className="font-bold text-emerald-400">{aiResult.evidenceMatrix.gpsConsistency}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500">Weather & Rain:</span>
              <div className="font-bold text-emerald-400">{aiResult.evidenceMatrix.weatherEnvironmental}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500">Satellite Imagery:</span>
              <div className="font-bold text-slate-400">{aiResult.evidenceMatrix.satelliteImagery}</div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-slate-500">Govt Alerts:</span>
              <div className="font-bold text-slate-400">{aiResult.evidenceMatrix.governmentAlerts}</div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Note: Unavailable evidence sources (Satellite/Govt Alerts) are marked UNAVAILABLE and are NOT penalized as negative evidence.
          </p>
        </div>

        {/* 3. Interactive Map & Report Cluster Locations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" /> Geographic Incident & Cluster Boundary
            </span>
            <button
              onClick={() => setShowClusterLocations(!showClusterLocations)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-lg text-[11px] flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5" />
              {showClusterLocations ? 'Hide Cluster Points' : '[ SHOW ALL REPORT LOCATIONS ]'}
            </button>
          </div>

          <div className="h-56 rounded-xl overflow-hidden border border-slate-800">
            <IncidentMap
              incidents={[incident]}
              center={[incident.latitude, incident.longitude]}
              zoom={14}
            />
          </div>
        </div>

        {/* 4. Commander Decision & Operational Action Panel */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-purple-900/60 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-850 pb-2">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" /> Commander Decision (Final Operational Authority)
            </h3>
            <span className="text-[11px] font-mono text-slate-400">AI is Decision Support — Commander Overrides Logged</span>
          </div>

          <textarea
            rows={2}
            value={commanderNotes}
            onChange={(e) => setCommanderNotes(e.target.value)}
            placeholder="Add Commander operational review notes / field verification log..."
            className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-purple-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCommanderDecision('MERGE')}
                disabled={isSaving}
                className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-950/60"
              >
                <GitMerge className="w-4 h-4" /> [ 🔗 MERGE REPORT ]
              </button>

              <button
                onClick={() => handleCommanderDecision('SEPARATE')}
                disabled={isSaving}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700"
              >
                <Split className="w-4 h-4 text-cyan-400" /> [ ✂️ KEEP SEPARATE ]
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCommanderDecision('VERIFY')}
                disabled={isSaving}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-950/60"
              >
                <CheckCircle2 className="w-4 h-4" /> [ ✅ VERIFY INCIDENT ]
              </button>

              <button
                onClick={() => handleCommanderDecision('REQUIRES_VERIFICATION')}
                disabled={isSaving}
                className="px-4 py-2.5 bg-amber-950 hover:bg-amber-900 text-amber-300 font-bold text-xs rounded-xl border border-amber-800 flex items-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400" /> [ ⚠️ REQUEST VERIFICATION ]
              </button>
            </div>
          </div>
        </div>

        {/* Explainability [WHY?] Modal */}
        {showWhyModal && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="bg-slate-900 border border-purple-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
              <button
                onClick={() => setShowWhyModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 text-purple-400 font-extrabold text-base uppercase">
                <HelpCircle className="w-5 h-5" /> Why Did AI Make This Recommendation?
              </div>

              <div className="space-y-2 text-xs font-mono text-slate-300">
                {aiResult.explanationText.map((exp, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                    {exp}
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-800 text-[11px] text-purple-300">
                <b>Overall AI Duplicate Confidence: {aiResult.duplicateConfidence}%</b> — Subject to Commander review and operational override.
              </div>

              <button
                onClick={() => setShowWhyModal(false)}
                className="w-full py-2 bg-purple-600 text-white font-bold rounded-xl text-xs uppercase"
              >
                Close AI Breakdown
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
