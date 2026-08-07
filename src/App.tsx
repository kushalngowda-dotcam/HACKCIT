import React, { useState, useEffect } from 'react';
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
import { 
  INITIAL_INCIDENTS, 
  INITIAL_RESOURCES, 
  INITIAL_HOSPITALS, 
  INITIAL_SHELTERS, 
  INITIAL_BLOCKAGES, 
  INITIAL_ROUTES, 
  INITIAL_ALERTS,
  INITIAL_RISK_ZONES
} from './data/mockData';
import { realtimeSync } from './lib/supabaseClient';
import { optimizeResourceAssignments } from './services/aiEngine';
import { DISASTER_IMAGES } from './utils/svgImages';

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
import { DemoController } from './components/DemoController';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [activeRole, setActiveRole] = useState<UserRole>('COORDINATOR');

  // Application Telemetry State
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [shelters, setShelters] = useState<Shelter[]>(INITIAL_SHELTERS);
  const [blockages, setBlockages] = useState<RoadBlockage[]>(INITIAL_BLOCKAGES);
  const [routes, setRoutes] = useState<EvacuationRoute[]>(INITIAL_ROUTES);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(INITIAL_INCIDENTS[0]);
  const [selectedRiskZone, setSelectedRiskZone] = useState<AIRiskZone | null>(null);
  const [selectedResourceTwin, setSelectedResourceTwin] = useState<Resource | null>(null);

  // Modal & Drawer States
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCrisisModeOpen, setIsCrisisModeOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isDemoOpen, setIsDemoOpen] = useState<boolean>(false);

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
    
    // Auto-broadcast emergency alert
    const newAlert: AlertNotification = {
      id: `alt-${Date.now()}`,
      title: `NEW REPORT: ${newIncident.title}`,
      message: `AI Confidence ${newIncident.confidence}%. ${newIncident.people_at_risk} citizens at risk in ${newIncident.location.area}.`,
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

  // Demo Disaster Simulator Trigger (Step 3 of Demo)
  const handleTriggerDemoDisaster = () => {
    const demoInc: Incident = {
      id: `inc-demo-${Date.now()}`,
      title: 'CRITICAL: Severe Metro Bridge Shear & Submerged Express Corridor',
      description: 'Torrential 180mm rain triggered catastrophic drainage overflow. Metro pillar 142 structural shear detected. 14 vehicles submerged, 95 citizens trapped.',
      incident_type: 'Building Collapse',
      severity: 'CRITICAL',
      status: 'VERIFIED',
      priority_score: 98,
      confidence: 96,
      verification_status: 'VERIFIED',
      verification_score: 97,
      people_at_risk: 145,
      location: {
        lat: 12.9780,
        lng: 77.6100,
        address: 'Old Airport Road Flyover Substructure',
        area: 'Central-East Corridor'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      image_url: DISASTER_IMAGES.buildingCollapse,
      detected_hazards: ['Structural Shear', 'Rapid Flood Inundation', 'Submerged High-Voltage Lines'],
      infrastructure_damage: ['Pillar Load Fracture', 'Arterial Highway Blocked'],
      recommended_resources: [
        { type: 'RESCUE_TEAM', count: 4 },
        { type: 'RESCUE_BOAT', count: 3 },
        { type: 'AMBULANCE', count: 4 }
      ],
      recommended_actions: [
        'Deploy heavy USAR hydraulic breaching team immediately',
        'Launch inflatable rescue craft convoy',
        'Divert all inbound traffic to Indiranagar bypass'
      ],
      assigned_resources: ['res-201', 'res-101'],
      eta_minutes: 4,
      reasoning: 'Critical high-density structural & flood surge compound disaster with high survivor density.'
    };

    setIncidents(prev => [demoInc, ...prev]);
    setSelectedIncident(demoInc);
    setIsDetailModalOpen(true);

    const demoAlert: AlertNotification = {
      id: `alt-demo-${Date.now()}`,
      title: '⚡ CRITICAL DEMO ESCALATION: Metro Pillar Shear & Flood Surge',
      message: 'Old Airport Road bridge shear detected. 145 citizens exposed. Priority Score 98/100.',
      severity: 'CRITICAL',
      timestamp: new Date().toLocaleTimeString(),
      read: false
    };
    setAlerts(prev => [demoAlert, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      
      {/* Navigation Header Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        onOpenReportModal={() => setIsReportModalOpen(true)}
        onToggleAssistant={() => setIsAssistantOpen(prev => !prev)}
        onStartDemo={() => setIsDemoOpen(true)}
        onOpenChallenge={() => setIsChallengeOpen(true)}
        onOpenCrisisMode={() => setIsCrisisModeOpen(true)}
        alertCount={alerts.filter(a => !a.read).length}
      />

      {/* Main Tab View Router */}
      <div className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onLaunchCommandCenter={() => setCurrentTab('command-center')}
            onStartDemo={() => setIsDemoOpen(true)}
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
          <MultiAgentView />
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

      {/* 3-Minute Hackathon Demo Interactive Controller */}
      <DemoController
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onJumpToTab={(t) => setCurrentTab(t)}
        onTriggerDisaster={handleTriggerDemoDisaster}
        onSimulateAllocation={handleTriggerSimulatedAllocation}
        onOpenCrisisMode={() => setIsCrisisModeOpen(true)}
        onOpenChallenge={() => setIsChallengeOpen(true)}
      />

    </div>
  );
}
