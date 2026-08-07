export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type VerificationStatus = 'VERIFIED' | 'LIKELY' | 'UNCERTAIN' | 'POTENTIALLY_FALSE';

export type ResourceType = 
  | 'AMBULANCE' 
  | 'FIRE_ENGINE' 
  | 'RESCUE_TEAM' 
  | 'POLICE_UNIT' 
  | 'RESCUE_BOAT' 
  | 'MEDICAL_TEAM' 
  | 'RELIEF_SUPPLIES';

export type ResourceStatus = 'AVAILABLE' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SITE' | 'MAINTENANCE';

export type IncidentStatus = 'REPORTED' | 'VERIFIED' | 'DISPATCHED' | 'IN_PROGRESS' | 'CONTAINED' | 'RESOLVED';

export type UserRole = 'CITIZEN' | 'RESPONDER' | 'COORDINATOR' | 'ADMINISTRATOR';

export interface Location {
  lat: number;
  lng: number;
  address: string;
  area: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  incident_type: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  priority_score: number;
  confidence: number;
  verification_status: VerificationStatus;
  verification_score: number;
  people_at_risk: number;
  location: Location;
  created_at: string;
  updated_at: string;
  image_url?: string;
  video_url?: string;
  detected_hazards: string[];
  infrastructure_damage: string[];
  recommended_resources: { type: ResourceType; count: number }[];
  recommended_actions: string[];
  assigned_resources: string[]; // resource IDs
  eta_minutes?: number;
  reasoning?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  capacity: number;
  unit_code: string;
  current_location: Location;
  assigned_incident_id?: string;
  eta_minutes?: number;
  contact_number: string;
}

export interface Hospital {
  id: string;
  name: string;
  location: Location;
  total_beds: number;
  available_beds: number;
  icu_available: number;
  trauma_center: boolean;
  status: 'OPERATIONAL' | 'HIGH_CAPACITY' | 'CRITICAL_OVERLOAD';
  contact: string;
}

export interface Shelter {
  id: string;
  name: string;
  location: Location;
  capacity: number;
  current_occupancy: number;
  supplies_status: 'ADEQUATE' | 'MODERATE' | 'CRITICAL';
  medical_staff_present: boolean;
  contact: string;
}

export interface RoadBlockage {
  id: string;
  road_name: string;
  cause: string;
  severity: 'PARTIAL' | 'TOTAL';
  coordinates: [number, number][];
}

export interface EvacuationRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  safety_score: number;
  travel_time_minutes: number;
  path: [number, number][];
  is_blocked: boolean;
  recommended_for: string[];
}

export interface AIAnalysisResult {
  incident_type: string;
  severity: SeverityLevel;
  confidence: number;
  estimated_people_affected: number;
  detected_hazards: string[];
  infrastructure_damage: string[];
  recommended_resources: { type: ResourceType; count: number }[];
  recommended_actions: string[];
  reasoning: string;
}

export interface AgentState {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'IDLE' | 'ANALYZING' | 'COMPLETED' | 'RECOMMENDATION_READY';
  thinking_log: string[];
  recommendation: string;
  confidence: number;
  has_conflict?: boolean;
  conflicting_agent_id?: string;
}

export interface WhatIfParams {
  rainfall_mm: number;
  population_affected: number;
  road_accessibility_percent: number;
  hospital_capacity_percent: number;
  emergency_resources_percent: number;
}

export interface WhatIfResult {
  expected_affected: number;
  casualties_predicted: number;
  hospital_pressure_index: number; // 0-100
  evacuation_demand: number;
  resource_deficit_score: number;
  critical_areas: string[];
  recommended_preemptions: string[];
  ai_summary: string;
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  severity: SeverityLevel;
  timestamp: string;
  read: boolean;
}

export interface AIRiskZone {
  id: string;
  name: string;
  level: SeverityLevel;
  population_exposure: number;
  vulnerabilities: string[];
  potential_escalation: string;
  recommended_precaution: string;
  center: [number, number];
  radius: number;
}

export interface ExplainableDetails {
  title: string;
  target: string;
  reasons: string[];
  data_considered: string[];
  confidence: number;
  timestamp: string;
}

export interface AIUncertaintyState {
  incidentId: string;
  confidenceScore: number; // 0-100%
  knowns: string[];
  unknowns: string[];
  topMissingInfo: string;
  requiredActionLabel: string;
}

export interface InformationPriorityItem {
  id: string;
  title: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  whyItMatters: string;
  actionLabel: string;
  resolved: boolean;
}

export interface CounterfactualOption {
  id: string;
  title: string;
  description: string;
  estimatedArrivalMin: number;
  hospitalPressurePercent: number;
  resourceUtilizationPercent: number;
  evacuationDemand: number;
  secondaryImpact: string;
  isRecommended?: boolean;
}

export interface CascadeNode {
  id: string;
  title: string;
  category: 'WEATHER' | 'HYDROLOGY' | 'INFRASTRUCTURE' | 'TRANSPORT' | 'MEDICAL' | 'EVACUATION';
  status: 'ACTIVE' | 'WARNING' | 'CRITICAL';
  impactDescription: string;
  downstreamEffects: string[];
  recommendedPrecaution: string;
  connectedNodeIds: string[];
}

export interface SilentAnomalyState {
  id: string;
  detected: boolean;
  type: string;
  citizenReportDropPercent: number;
  trafficDropPercent: number;
  powerDropPercent: number;
  potentialExplanation: string;
  recommendedAction: string;
  timestamp: string;
}

export interface EmergencyLesson {
  id: string;
  incidentId: string;
  incidentTitle: string;
  timestamp: string;
  whatHappened: string;
  whatWorked: string[];
  whatDidntWork: string[];
  missingInformation: string[];
  lessonForFuture: string;
  appliedToFutureCount: number;
}

export interface NationalRegionData {
  id: string;
  name: string;
  state: string;
  activeIncidents: number;
  peopleAtRisk: number;
  resourceAvailabilityPercent: number;
  hospitalPressurePercent: number;
  riskLevel: SeverityLevel;
  districts: {
    name: string;
    incidentsCount: number;
    status: string;
  }[];
}

