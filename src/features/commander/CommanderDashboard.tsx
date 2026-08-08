import React, { useMemo, useState } from 'react';
import { Radio, ShieldAlert, Cpu, Layers, HelpCircle, AlertTriangle, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useIncidents } from '../../hooks/useIncidents';
import { useResources } from '../../hooks/useResources';
import { useHospitals } from '../../hooks/useHospitals';
import { IncidentMap } from '../../components/map/IncidentMap';
import { ExplainableAIModal } from '../../components/ai/ExplainableAIModal';
import { MultiAgentPanel } from '../../components/ai/MultiAgentPanel';
import { SimulatorModal } from '../../components/ai/SimulatorModal';
import { DispatchIncidentModal } from './DispatchIncidentModal';
import { CommanderIncidentReviewModal } from './CommanderIncidentReviewModal';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { analyzeIncidentAI, AIAnalysisResult } from '../../services/aiService';
import { analyzeDuplicateReport } from '../../services/aiDuplicateEngine';
import { Incident, AIRecommendation } from '../../types/database';

export const CommanderDashboard: React.FC = () => {
  const { incidents, reports, loading, refetch, updateIncidentStatus } = useIncidents();
  const { resources, updateResourceStatus } = useResources();
  const { hospitalCapacities } = useHospitals();

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | undefined>();
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isExplainModalOpen, setIsExplainModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewIncidentId, setReviewIncidentId] = useState<string | null>(null);

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const aiReviewQueue = useMemo(() => {
    return incidents
      .map((inc) => {
        const linkedReports = reports.filter(
          (report) =>
            report.incident_id === inc.id ||
            (report.district === inc.district && Math.hypot(report.latitude - inc.latitude, report.longitude - inc.longitude) < 0.05)
        );

        const duplicateScore = analyzeDuplicateReport(
          {
            category_code: inc.title.split(' ')[0] || 'EMERGENCY',
            description: inc.title,
            latitude: inc.latitude,
            longitude: inc.longitude,
            created_at: inc.created_at,
          },
          incidents.filter((entry) => entry.id !== inc.id)
        );

        const confidence = duplicateScore.isDuplicateCandidate ? duplicateScore.duplicateConfidence : Math.max(0, 52 + linkedReports.length * 8);
        const shouldReview = duplicateScore.isDuplicateCandidate || inc.conflict_flag || linkedReports.length > 1 || inc.reporter_count > 1;

        return {
          incident: inc,
          linkedReports,
          confidence,
          shouldReview,
        };
      })
      .filter((item) => item.shouldReview)
      .sort((a, b) => b.confidence - a.confidence || b.linkedReports.length - a.linkedReports.length);
  }, [incidents, reports]);

  // Run AI Incident Analysis on selected incident
  const handleTriggerAI = async (inc: Incident) => {
    setIsAiLoading(true);
    const result = await analyzeIncidentAI({
      incident_id: inc.id,
      category_code: inc.title.split(' ')[0],
      description: inc.title,
      affected_people: inc.affected_count_est,
      latitude: inc.latitude,
      longitude: inc.longitude,
      landmark: inc.location_name || undefined,
    });
    setAiAnalysis(result);
    setIsAiLoading(false);
  };

  // Sort incidents by Priority Score (CRITICAL high score first)
  const priorityQueue = [...incidents].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0));

  return (
    <div className="space-y-6 pb-12">
      {/* Command Center Title Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-600 to-purple-800 border border-red-500/40 text-white">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-slate-100 uppercase tracking-tight">
                Disaster Command Center & Intelligence Platform
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 rounded font-bold">
                REALTIME FUSION
              </span>
            </div>
            <p className="text-xs text-slate-400">Multi-source incident fusion, priority scoring, explainable AI & resource coordination</p>
          </div>
        </div>

        {/* Future Vision Simulator Launch Button */}
        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-purple-950/60 flex items-center gap-2 transition-all transform hover:scale-105"
        >
          <Clock className="w-4 h-4" />
          <span>Launch Predictive Simulator (+1h..+12h)</span>
        </button>
      </div>

      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" /> AI Incident Review Queue ({aiReviewQueue.length})
          </h2>
          <span className="text-[10px] font-mono text-slate-400">Commander review required before merge</span>
        </div>

        {aiReviewQueue.length === 0 ? (
          <EmptyState title="No duplicate or review candidates detected." message="Current incidents are consistent with a single event cluster. Manual review is not required right now." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {aiReviewQueue.map(({ incident, linkedReports, confidence }) => (
              <div key={incident.id} className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-slate-100">{incident.title}</span>
                  <Badge variant={incident.severity}>{incident.severity}</Badge>
                </div>
                <div className="text-[11px] text-slate-400">
                  {linkedReports.length} reports | {Math.round(confidence)}% confidence
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{incident.location_name || 'Unknown location'}</span>
                  <span>{incident.status}</span>
                </div>
                <button
                  onClick={() => {
                    setReviewIncidentId(incident.id);
                    setIsReviewModalOpen(true);
                  }}
                  className="w-full mt-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold rounded-lg"
                >
                  REVIEW
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Command Grid: Priority Queue + Map + AI Reasoning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Priority Queue & Fusion Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500" /> Incident Priority Queue ({priorityQueue.length})
            </h2>
            <button
              onClick={refetch}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {priorityQueue.length === 0 ? (
            <EmptyState
              title="No incidents reported yet."
              message="The operational incident database is completely empty. No active disasters in Supabase."
            />
          ) : (
            <div className="space-y-3 max-h-[650px] overflow-y-auto pr-1">
              {priorityQueue.map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => {
                    setSelectedIncidentId(inc.id);
                    handleTriggerAI(inc);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    selectedIncidentId === inc.id
                      ? 'bg-slate-800/90 border-red-500 shadow-xl shadow-red-950/40'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100">{inc.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={inc.severity}>{inc.severity}</Badge>
                        <Badge variant="default">{inc.status}</Badge>
                        {inc.conflict_flag && (
                          <span className="px-1.5 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 text-[10px] font-bold rounded">
                            CONFLICTING INFO
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-extrabold font-mono text-cyan-400">
                      {inc.priority_score?.toFixed(0) || 50} pts
                    </span>
                  </div>

                  {/* Incident Fusion Counter */}
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                    <span className="text-purple-400 font-semibold flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> {inc.reporter_count || 1} report(s) fused into 1 canonical incident
                    </span>
                    <span className="text-slate-500 font-mono">Est: {inc.affected_count_est} affected</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Incident Map + AI Decision Engine */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leaflet Map */}
          <div className="h-[420px]">
            <IncidentMap
              incidents={incidents}
              resources={resources}
              hospitals={hospitalCapacities}
              selectedIncidentId={selectedIncidentId}
              onSelectIncident={(inc) => {
                setSelectedIncidentId(inc.id);
                handleTriggerAI(inc);
              }}
            />
          </div>

          {/* AI Decision Support & Explainability Banner */}
          {selectedIncident && (
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-purple-950 border border-purple-800 text-purple-400">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">AI Incident Analysis & Decision Support</h3>
                    <p className="text-[11px] text-slate-400">Multimodal reasoning for {selectedIncident.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsDispatchModalOpen(true)}
                    className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/50"
                  >
                    <Radio className="w-4 h-4 animate-pulse" /> Dispatch to Rescuers & Hospitals
                  </button>
                  <button
                    onClick={() => setIsExplainModalOpen(true)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <HelpCircle className="w-4 h-4" /> [ WHY? ] Explain AI
                  </button>
                </div>
              </div>

              {/* AI Output Summary */}
              {isAiLoading ? (
                <div className="text-xs font-mono text-cyan-400 animate-pulse p-4 text-center">
                  Running multimodal AI incident reasoning & risk synthesis...
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                    <b>AI Assessment Summary:</b> {aiAnalysis.assessment.summary}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500">Rec. Severity:</span>
                      <div className="font-bold text-red-400">{aiAnalysis.assessment.severity_recommended}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500">Hazards:</span>
                      <div className="font-bold text-amber-400">{aiAnalysis.assessment.hazards.join(', ')}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500">Confidence:</span>
                      <div className="font-bold text-emerald-400">
                        {aiAnalysis.assessment.confidence_score ? `${(aiAnalysis.assessment.confidence_score * 100).toFixed(0)}%` : 'Confidence not available.'}
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800">
                      <span className="text-slate-500">Uncertainty:</span>
                      <div className="font-bold text-slate-400 truncate">{aiAnalysis.assessment.uncertainty}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleTriggerAI(selectedIncident)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold"
                >
                  Run AI Analysis on Selected Incident
                </button>
              )}
            </div>
          )}

          {/* Multi-Agent Autonomous Coordination Matrix */}
          <MultiAgentPanel
            selectedIncident={selectedIncident}
            onApproveAction={(action) => {
              if (selectedIncident) {
                updateIncidentStatus(selectedIncident.id, 'DISPATCHED', action);
              }
            }}
          />
        </div>
      </div>

      {/* Explainable AI Modal */}
      <ExplainableAIModal
        isOpen={isExplainModalOpen}
        onClose={() => setIsExplainModalOpen(false)}
        recommendation={
          aiAnalysis?.recommendations[0]
            ? {
                id: 'rec-1',
                incident_id: selectedIncident?.id || '',
                action_type: aiAnalysis.recommendations[0].action_type,
                description: aiAnalysis.recommendations[0].description,
                status: 'PENDING',
                created_at: new Date().toISOString(),
              }
            : null
        }
        explanation={
          aiAnalysis?.recommendations[0]
            ? {
                id: 'exp-1',
                recommendation_id: 'rec-1',
                factors_json: aiAnalysis.recommendations[0].explanation.factors,
                evidence_used_json: aiAnalysis.recommendations[0].explanation.evidence,
                disclaimer: 'AI decision support recommendation. Requires human commander approval before dispatch.',
                confidence_score: aiAnalysis.assessment.confidence_score,
                created_at: new Date().toISOString(),
              }
            : null
        }
      />

      {/* Dispatch Incident Modal */}
      <DispatchIncidentModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        incident={selectedIncident}
        resources={resources}
        hospitals={hospitalCapacities}
        onDispatchSuccess={(incId) => {
          updateIncidentStatus(incId, 'DISPATCHED', 'Dispatched to Rescuers & Hospitals');
        }}
      />

      {reviewIncidentId && (
        <CommanderIncidentReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setReviewIncidentId(null);
          }}
          incident={incidents.find((item) => item.id === reviewIncidentId) || selectedIncident}
          allIncidents={incidents}
          allReports={reports}
          onReviewCompleted={() => {
            setIsReviewModalOpen(false);
            setReviewIncidentId(null);
          }}
        />
      )}
    </div>
  );
};
