import React, { useState } from 'react';
import { Incident, Resource, Hospital, Shelter, RoadBlockage, EvacuationRoute, AlertNotification, AIRiskZone } from '../types';
import { DisasterMap } from './DisasterMap';
import { AIPriorityQueue } from './AIPriorityQueue';
import { 
  ShieldAlert, 
  Sparkles, 
  MapPin, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Truck, 
  Building2, 
  Navigation, 
  Layers,
  Search,
  Radio,
  HelpCircle
} from 'lucide-react';
import { ExplainableAIModal } from './ExplainableAIModal';

interface CommandCenterViewProps {
  incidents: Incident[];
  resources: Resource[];
  hospitals: Hospital[];
  shelters: Shelter[];
  blockages: RoadBlockage[];
  routes: EvacuationRoute[];
  alerts: AlertNotification[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onTriggerAllocation: () => void;
  onDispatchResource: (incidentId: string, resourceId: string) => void;
  onOpenCrisisMode: () => void;
  onSelectResource: (resource: Resource) => void;
  onSelectRiskZone: (zone: AIRiskZone) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  incidents,
  resources,
  hospitals,
  shelters,
  blockages,
  routes,
  alerts,
  selectedIncident,
  onSelectIncident,
  onTriggerAllocation,
  onDispatchResource,
  onOpenCrisisMode,
  onSelectResource,
  onSelectRiskZone
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [showExplain, setShowExplain] = useState<boolean>(false);

  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'ALL' || i.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const selectedIncidentExplain = selectedIncident ? {
    title: `AI Priority Audit: ${selectedIncident.title}`,
    target: `Incident #${selectedIncident.id} | Priority Score: ${selectedIncident.priority_score}/100`,
    reasons: [
      `Population at risk count (${selectedIncident.people_at_risk} citizens) computed from location density & census mapping.`,
      `Multi-agency verification score established at ${selectedIncident.verification_score}% via radar sensors & correlated citizen reports.`,
      `Hazard compounding index flags: ${selectedIncident.detected_hazards.join(', ')}.`,
      `Recommended resource response plan: ${selectedIncident.recommended_actions[0] || 'Deploy emergency squad'}.`
    ],
    data_considered: ['Doppler Radar Inundation', 'Citizen Voice Transcripts', 'Fleet Proximity Sensors', 'Hospital Capacity Grid'],
    confidence: selectedIncident.confidence,
    timestamp: new Date().toLocaleTimeString()
  } : null;

  return (
    <div className="h-[calc(100vh-65px)] bg-slate-50 p-3 gap-3 grid grid-cols-1 lg:grid-cols-12 overflow-hidden font-sans">
      
      {/* Left Main Map & Detail Section (8 cols) */}
      <div className="lg:col-span-8 flex flex-col h-full space-y-3">
        
        {/* Top Control Bar with PROMINENT ACTIVATE CRISIS MODE BUTTON */}
        <div className="eoc-card p-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search emergency location, incident title, or hazard..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2 text-slate-700 focus:ring-1 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2.5 py-2 text-slate-700 focus:ring-1 focus:ring-teal-500 focus:outline-none"
            >
              <option value="ALL">Severity: All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            {/* FEATURE 1: PROMINENT ACTIVATE CRISIS MODE BUTTON */}
            <button
              onClick={onOpenCrisisMode}
              className="px-4 py-2 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-500/30 transition-all flex items-center space-x-1.5 animate-pulse cursor-pointer border border-red-300 active:scale-95 shrink-0"
            >
              <ShieldAlert className="w-4 h-4 fill-current" />
              <span>ACTIVATE CRISIS MODE</span>
            </button>

            <div className="hidden sm:flex items-center space-x-3 text-xs font-mono">
              <div className="flex items-center space-x-1 text-slate-600">
                <Building2 className="w-3.5 h-3.5 text-teal-500" />
                <span>{hospitals.length} Hosp</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-600">
                <Truck className="w-3.5 h-3.5 text-amber-500" />
                <span>{resources.length} Fleet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive GIS Map */}
        <div className="flex-1 relative">
          <DisasterMap
            incidents={filteredIncidents}
            resources={resources}
            hospitals={hospitals}
            shelters={shelters}
            blockages={blockages}
            routes={routes}
            selectedIncident={selectedIncident}
            onSelectIncident={onSelectIncident}
            onSelectResource={onSelectResource}
            onSelectRiskZone={onSelectRiskZone}
            onDispatchResource={onDispatchResource}
          />
        </div>

        {/* Selected Incident AI Detail Panel with FEATURE 2 Explainability Button */}
        {selectedIncident && (
          <div className="eoc-card p-4 rounded-xl border border-teal-200 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedIncident.severity === 'CRITICAL' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {selectedIncident.severity}
                  </span>
                  <span className="text-xs font-bold text-teal-600 font-mono">
                    PRIORITY {selectedIncident.priority_score}/100
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    CONFIDENCE {selectedIncident.confidence}%
                  </span>

                  {/* FEATURE 2: Why? Explainability Trigger Button */}
                  <button
                    onClick={() => setShowExplain(true)}
                    className="px-2 py-0.5 bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 rounded text-[10px] font-mono font-bold flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <HelpCircle className="w-3 h-3 text-teal-600" />
                    <span>Why?</span>
                  </button>
                </div>

                <h3 className="font-extrabold text-base text-slate-800 mt-1">{selectedIncident.title}</h3>
                <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-500" />
                  <span>{selectedIncident.location.address}</span>
                </p>
              </div>

              <div className="text-right font-mono">
                <div className="text-xs font-bold text-emerald-600">
                  VERIFICATION: {selectedIncident.verification_status}
                </div>
                <div className="text-[10px] text-slate-400">
                  Score: {selectedIncident.verification_score}%
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
              {selectedIncident.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono pt-1 text-slate-600">
              <div className="flex flex-wrap items-center gap-4">
                <div>👥 At Risk: <span className="text-amber-600 font-bold">{selectedIncident.people_at_risk}</span></div>
                <div>🚑 Assigned Units: <span className="text-teal-600 font-bold">{selectedIncident.assigned_resources.length}</span></div>
                <div>⏱️ ETA: <span className="text-emerald-600 font-bold">{selectedIncident.eta_minutes || 8} min</span></div>
              </div>

              <span className="text-[10px] text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ⚡ AI-assisted recommendation
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right AI Priority Queue & Emergency Alerts (4 cols) */}
      <div className="lg:col-span-4 flex flex-col h-full space-y-3">
        {/* Priority Queue Component */}
        <div className="flex-1 overflow-hidden">
          <AIPriorityQueue
            incidents={filteredIncidents}
            selectedIncident={selectedIncident}
            onSelectIncident={onSelectIncident}
            onTriggerAllocation={onTriggerAllocation}
          />
        </div>

        {/* Bottom Alert Notifications Feed */}
        <div className="eoc-card p-3 rounded-xl max-h-[160px] overflow-y-auto space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-600 border-b border-slate-100 pb-1">
            <span className="flex items-center space-x-1.5 text-amber-600">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE BROADCAST ALERTS</span>
            </span>
            <span className="text-[10px] text-slate-400">{alerts.length} MESSAGES</span>
          </div>

          <div className="space-y-1.5 text-xs">
            {alerts.map(alt => (
              <div key={alt.id} className="p-2 rounded bg-slate-50 border border-slate-100 flex items-start space-x-2">
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                  alt.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'
                }`} />
                <div className="flex-1">
                  <div className="font-bold text-slate-700 leading-snug">{alt.title}</div>
                  <div className="text-[11px] text-slate-500">{alt.message}</div>
                </div>
                <span className="text-[9px] font-mono text-slate-400">{alt.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ExplainableAIModal
        details={selectedIncidentExplain}
        isOpen={showExplain}
        onClose={() => setShowExplain(false)}
      />

    </div>
  );
};
