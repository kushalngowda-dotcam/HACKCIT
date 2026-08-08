import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Incident, 
  Resource, 
  Hospital, 
  Shelter, 
  RoadBlockage, 
  EvacuationRoute, 
  AlertNotification, 
  UserRole,
  ResourceStatus,
  AIRiskZone
} from './types';
import { realtimeSync, supabaseEnabled } from './lib/supabaseClient';
import {
  loadAllState,
  saveCollection,
  subscribeAll,
  resetAllState,
  AppCollectionKey
} from './lib/supabaseRepo';
import { optimizeResourceAssignments } from './services/aiEngine';

import { AIUncertaintyCard } from './components/AIUncertaintyCard';
import { CounterfactualSimulatorView } from './components/CounterfactualSimulatorView';
import { CascadingDisasterGraphView } from './components/CascadingDisasterGraphView';
import { SilentEmergencyBanner } from './components/SilentEmergencyBanner';
import { HumanAIDecisionCard } from './components/HumanAIDecisionCard';
import { ResponderPortalView } from './components/ResponderPortalView';

import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CommandCenterView } from './components/CommandCenterView';
import { ResourceAllocationView } from './components/ResourceAllocationView';
import { EvacuationView } from './components/EvacuationView';
import { TimelineView } from './components/TimelineView';
import { MultiAgentView } from './components/MultiAgentView';
import { WhatIfSimulatorView } from './components/WhatIfSimulatorView';
import { HospitalStressTestView } from './components/HospitalStressTestView';
import { AdminAnalyticsView } from './components/AdminAnalyticsView';
import { CitizenPortalView } from './components/CitizenPortalView';

// Modals
import { ReportIncidentModal } from './components/ReportIncidentModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { CrisisModeModal } from './components/CrisisModeModal';
import { VoiceReportModal } from './components/VoiceReportModal';
import { AIRiskAssessmentModal } from './components/AIRiskAssessmentModal';
import { ResourceDigitalTwinModal } from './components/ResourceDigitalTwinModal';
import { ResponseChallengeModal } from './components/ResponseChallengeModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [activeRole, setActiveRole] = useState<UserRole>('COORDINATOR');
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'connecting' | 'synced' | 'local'>('connecting');

  // Application Telemetry State (Starts empty, populated exclusively from Supabase DB)
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [blockages, setBlockages] = useState<RoadBlockage[]>([]);
  const [routes, setRoutes] = useState<EvacuationRoute[]>([]);
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [selectedRiskZone, setSelectedRiskZone] = useState<AIRiskZone | null>(null);
  const [selectedResourceTwin, setSelectedResourceTwin] = useState<Resource | null>(null);

  // Modal & Drawer States
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCrisisModeOpen, setIsCrisisModeOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  const isHydratedRef = useRef(false);
  const lastWrittenRef = useRef<Record<AppCollectionKey, string>>({} as Record<AppCollectionKey, string>);

  // Collection registry: key -> [current rows, setter]
  const collections: { key: AppCollectionKey; rows: unknown[]; set: (rows: unknown[]) => void }[] = [
    { key: 'incidents', rows: incidents, set: (v) => setIncidents(v as Incident[]) },
    { key: 'resources', rows: resources, set: (v) => setResources(v as Resource[]) },
    { key: 'hospitals', rows: hospitals, set: (v) => setHospitals(v as Hospital[]) },
    { key: 'shelters', rows: shelters, set: (v) => setShelters(v as Shelter[]) },
    { key: 'blockages', rows: blockages, set: (v) => setBlockages(v as RoadBlockage[]) },
    { key: 'routes', rows: routes, set: (v) => setRoutes(v as EvacuationRoute[]) },
    { key: 'alerts', rows: alerts, set: (v) => setAlerts(v as AlertNotification[]) }
  ];

  // Hydrate from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    const hydrateOnce = async (): Promise<'synced' | 'offline'> => {
      const res = await loadAllState();
      if (cancelled) return 'offline';
      if (!res) return 'offline';
      const { snapshot, reachable } = res;
      collections.forEach(({ key, set }) => {
        const remote = snapshot[key];
        if (Array.isArray(remote)) {
          set(remote);
        }
      });
      return reachable ? 'synced' : 'offline';
    };

    (async () => {
      let status = await hydrateOnce();
      let attempt = 0;
      while (status === 'offline' && attempt < 5) {
        await new Promise(r => setTimeout(r, 2000));
        if (cancelled) return;
        attempt += 1;
        status = await hydrateOnce();
      }
      if (cancelled) return;
      setSyncStatus(status === 'synced' ? 'synced' : 'local');
      isHydratedRef.current = true;
      setIsHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced persistence of every collection (only after hydration completes)
  useEffect(() => {
    if (!isHydrated || !supabaseEnabled) return;
    const timers = new Map<AppCollectionKey, ReturnType<typeof setTimeout>>();

    collections.forEach(({ key, rows }) => {
      const serialized = JSON.stringify(rows);
      if (lastWrittenRef.current[key] === serialized) return;
      const timer = setTimeout(() => {
        lastWrittenRef.current[key] = serialized;
        saveCollection(key, rows).then(ok => {
          if (ok) setSyncStatus('synced');
        });
      }, 400);
      timers.set(key, timer);
    });

    return () => {
      timers.forEach(t => clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidents, resources, hospitals, shelters, blockages, routes, alerts, isHydrated]);

  // Realtime subscription: merge remote rows into local state across browser tabs
  useEffect(() => {
    if (!supabaseEnabled) return;
    const unsubscribe = subscribeAll((key, rows) => {
      if (!isHydratedRef.current) return;
      if (lastWrittenRef.current[key] === JSON.stringify(rows)) return;
      const entry = collections.find(c => c.key === key);
      if (entry) entry.set(rows);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  const handleResetData = useCallback(async () => {
    await resetAllState();
    setIncidents([]);
    setResources([]);
    setHospitals([]);
    setShelters([]);
    setBlockages([]);
    setRoutes([]);
    setAlerts([]);
    setSelectedIncident(null);
    lastWrittenRef.current = {} as Record<AppCollectionKey, string>;
  }, []);

  // Subscribe to Realtime state updates
  useEffect(() => {
    const unsubscribeIncidents = realtimeSync.subscribe('incidents_update', (newIncident: Incident) => {
      setIncidents(prev => [newIncident, ...prev]);
    });

    const unsubscribeResourceAssign = realtimeSync.subscribe('resource_assigned', (data: { resourceId: string; incidentId: string }) => {
      setResources(prev => prev.map(r => r.id === data.resourceId ? { ...r, status: 'DISPATCHED', assigned_incident_id: data.incidentId } : r));
    });

    return () => {
      unsubscribeIncidents();
      unsubscribeResourceAssign();
    };
  }, []);

  const handleSelectIncident = (inc: Incident) => {
    setSelectedIncident(inc);
    setIsDetailModalOpen(true);
  };

  // Handlers
  const handleAddIncident = (newIncident: Incident) => {
    setIncidents(prev => [newIncident, ...prev]);
    setSelectedIncident(newIncident);
    setIsDetailModalOpen(true);
    realtimeSync.broadcast('incidents_update', newIncident);
    
    // Broadcast emergency alert
    const newAlert: AlertNotification = {
      id: `alt-${Date.now()}`,
      title: `NEW REPORT: ${newIncident.title}`,
      message: `Confidence ${newIncident.confidence}%. ${newIncident.people_at_risk} citizens at risk in ${newIncident.location.area}.`,
      severity: newIncident.severity,
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleUpdateResourceStatus = (resourceId: string, status: ResourceStatus) => {
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, status } : r));
  };

  const handleDispatchResource = (incidentId: string, resourceId: string) => {
    setResources(prev => prev.map(r => r.id === resourceId ? { ...r, status: 'DISPATCHED' as const, assigned_incident_id: incidentId } : r));
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId && !inc.assigned_resources.includes(resourceId)) {
        return { ...inc, assigned_resources: [...inc.assigned_resources, resourceId] };
      }
      return inc;
    }));
  };

  const handleTriggerSimulatedAllocation = () => {
    const result = optimizeResourceAssignments(incidents, resources);
    setResources(prev => prev.map(res => {
      const match = result.recommendations.find(r => r.resourceId === res.id);
      if (match) {
        return {
          ...res,
          status: 'DISPATCHED' as const,
          assigned_incident_id: match.incidentId,
          eta_minutes: match.etaMinutes
        };
      }
      return res;
    }));
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white overflow-hidden">
      
      {/* Sync Status Indicator */}
      {syncStatus !== 'connecting' && (
        <div className="fixed bottom-3 right-3 z-[3000] flex items-center space-x-2">
          <button
            onClick={handleResetData}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-white text-[10px] font-mono shadow-md hover:bg-slate-700 transition-colors cursor-pointer"
            title="Clear all Supabase database rows"
          >
            Clear DB data
          </button>
          <div className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 shadow-md text-[10px] font-mono flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className={syncStatus === 'synced' ? 'text-emerald-600' : 'text-amber-600'}>
              {syncStatus === 'synced' ? '● Synced (Supabase)' : 'Local-only'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Header Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onToggleAssistant={() => setIsAssistantOpen(prev => !prev)}
        onOpenChallenge={() => setIsChallengeOpen(true)}
        onOpenCrisisMode={() => setIsCrisisModeOpen(true)}
        alertCount={alerts.filter(a => !a.read).length}
      />

      {/* Main Tab View Router */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
        {currentTab === 'landing' && (
          <LandingPage
            onLaunchCommandCenter={() => setCurrentTab('command-center')}
            incidents={incidents}
            resources={resources}
          />
        )}

        {currentTab === 'command-center' && (
          <CommandCenterView
            incidents={incidents}
            resources={resources}
            hospitals={hospitals}
            shelters={shelters}
            blockages={blockages}
            routes={routes}
            alerts={alerts}
            selectedIncident={selectedIncident}
            onSelectIncident={handleSelectIncident}
            onTriggerAllocation={handleTriggerSimulatedAllocation}
            onDispatchResource={handleDispatchResource}
            onOpenCrisisMode={() => setIsCrisisModeOpen(true)}
            onSelectResource={(r) => setSelectedResourceTwin(r)}
            onSelectRiskZone={(z) => setSelectedRiskZone(z)}
          />
        )}

        {currentTab === 'resources' && (
          <ResourceAllocationView
            resources={resources}
            incidents={incidents}
            onUpdateResources={setResources}
          />
        )}

        {currentTab === 'evacuation' && (
          <EvacuationView
            incidents={incidents}
            hospitals={hospitals}
            shelters={shelters}
            routes={routes}
            blockages={blockages}
            onSelectIncident={handleSelectIncident}
          />
        )}

        {currentTab === 'timeline' && (
          <TimelineView incidents={incidents} />
        )}

        {currentTab === 'multi-agent' && (
          <MultiAgentView incidents={incidents} resources={resources} />
        )}

        {currentTab === 'what-if' && (
          <WhatIfSimulatorView />
        )}

        {currentTab === 'hospital-stress' && (
          <HospitalStressTestView hospitals={hospitals} />
        )}

        {currentTab === 'admin' && (
          <AdminAnalyticsView
            incidents={incidents}
            resources={resources}
            hospitals={hospitals}
          />
        )}

        {currentTab === 'citizen' && (
          <CitizenPortalView
            incidents={incidents}
            hospitals={hospitals}
            shelters={shelters}
            alerts={alerts}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onNavigateEvacuation={() => setCurrentTab('evacuation')}
          />
        )}

        {currentTab === 'responder' && (
          <ResponderPortalView
            resources={resources}
            incidents={incidents}
            onUpdateResourceStatus={handleUpdateResourceStatus}
            onSelectIncident={handleSelectIncident}
          />
        )}
      </div>

      {/* FEATURE 1: Crisis Mode Modal */}
      <CrisisModeModal
        isOpen={isCrisisModeOpen}
        onClose={() => setIsCrisisModeOpen(false)}
        incidents={incidents}
        resources={resources}
        hospitals={hospitals}
        shelters={shelters}
      />

      {/* FEATURE 5: Voice Emergency Reporting Modal */}
      <VoiceReportModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onAddIncident={handleAddIncident}
      />

      {/* FEATURE 4: AI Risk Assessment Modal */}
      <AIRiskAssessmentModal
        zone={selectedRiskZone}
        isOpen={!!selectedRiskZone}
        onClose={() => setSelectedRiskZone(null)}
      />

      {/* FEATURE 8: Live Resource Digital Twin Modal */}
      <ResourceDigitalTwinModal
        resource={selectedResourceTwin}
        isOpen={!!selectedResourceTwin}
        onClose={() => setSelectedResourceTwin(null)}
        incidents={incidents}
        onDispatchResource={handleDispatchResource}
      />

      {/* FEATURE 10: 60-Second Response Challenge Modal */}
      <ResponseChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        incidents={incidents}
        resources={resources}
        routes={routes}
      />

      {/* Incident Reporting Modal */}
      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onAddIncident={handleAddIncident}
      />

      {/* Incident Detail Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onNavigateEvacuation={() => setCurrentTab('evacuation')}
      />

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        incidents={incidents}
        resources={resources}
        hospitals={hospitals}
      />

    </div>
  );
}
