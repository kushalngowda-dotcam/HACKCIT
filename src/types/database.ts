export type UserRole = 'CITIZEN' | 'RESPONDER' | 'HOSPITAL' | 'COMMANDER' | 'ADMIN';
export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus =
  | 'NEW'
  | 'REPORTED'
  | 'VERIFIED'
  | 'PRIORITIZED'
  | 'ASSIGNED'
  | 'DISPATCHED'
  | 'IN_PROGRESS'
  | 'RESPONDER_EN_ROUTE'
  | 'RESPONDER_ON_SCENE'
  | 'ASSISTANCE_REQUIRED'
  | 'HOSPITAL_COORDINATION'
  | 'RESOLVED'
  | 'CLOSED'
  | 'REJECTED';

export type ResourceStatus = 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'ON_SCENE' | 'UNAVAILABLE' | 'MAINTENANCE';
export type AssignmentStatus = 'ASSIGNED' | 'ACCEPTED' | 'DECLINED' | 'EN_ROUTE' | 'ON_SCENE' | 'ASSISTING' | 'COMPLETED' | 'CANCELLED';
export type AlertSeverity = 'ADVISORY' | 'WARNING' | 'EMERGENCY' | 'EXTREME';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  phone_number?: string;
  organization_id?: string;
  badge_number?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  contact_number?: string;
  email?: string;
  district: string;
  state: string;
  created_at: string;
}

export interface IncidentCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon_name?: string;
  default_urgency: IncidentSeverity;
}

export interface Incident {
  id: string;
  title: string;
  category_id?: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  location_name?: string;
  district?: string;
  state?: string;
  affected_count_est: number;
  priority_score: number;
  conflict_flag: boolean;
  conflict_details?: {
    conflict?: string;
    sources?: string[];
  };
  reporter_count: number;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentReport {
  id: string;
  client_uuid: string;
  incident_id?: string;
  user_id?: string;
  category_code: string;
  description?: string;
  voice_transcript?: string;
  affected_people: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  location_source: 'GPS' | 'MANUAL' | 'NETWORK' | 'ADDRESS';
  village?: string;
  landmark?: string;
  district?: string;
  state?: string;
  created_at: string;
}

export interface IncidentEvidence {
  id: string;
  report_id?: string;
  incident_id?: string;
  file_path: string;
  file_type: string;
  file_size?: number;
  uploaded_by?: string;
  created_at: string;
  public_url?: string;
}

export interface Resource {
  id: string;
  code: string;
  name: string;
  type_id?: string;
  organization_id?: string;
  status: ResourceStatus;
  latitude?: number;
  longitude?: number;
  capacity: number;
  contact_phone?: string;
  last_updated: string;
}

export interface IncidentAssignment {
  id: string;
  incident_id: string;
  resource_id?: string;
  responder_name?: string;
  assigned_by?: string;
  status: AssignmentStatus;
  eta_minutes?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentStatusHistory {
  id: string;
  incident_id: string;
  old_status?: IncidentStatus;
  new_status: IncidentStatus;
  changed_by?: string;
  changed_by_name?: string;
  notes?: string;
  created_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  registration_id?: string;
  type?: string;
  contact_person?: string;
  email?: string;
  organization_id?: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  location_source?: 'GPS' | 'MANUAL' | 'NETWORK' | 'ADDRESS';
  address?: string;
  area?: string;
  city?: string;
  district: string;
  state: string;
  pin_code?: string;
  contact_number: string;
  verification_status?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  operating_status?: 'OPERATIONAL' | 'LIMITED' | 'FULL' | 'CLOSED';
  created_at: string;
}

export interface HospitalCapacity {
  id: string;
  hospital_id: string;
  total_beds: number;
  available_beds: number;
  occupied_beds?: number;
  total_icu_beds: number;
  available_icu_beds: number;
  occupied_icu_beds?: number;
  emergency_status?: 'OPEN' | 'LIMITED' | 'FULL' | 'CLOSED';
  emergency_load_pct: number;
  emergency_capacity?: number;
  incoming_patients: number;
  last_updated_by?: string;
  last_updated: string;
  hospital?: Hospital;
}

export interface Ambulance {
  id: string;
  code: string;
  hospital_id?: string;
  hospital_name?: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'EN_ROUTE' | 'ON_SCENE' | 'PATIENT_PICKUP' | 'RETURNING' | 'UNAVAILABLE';
  latitude: number;
  longitude: number;
  assigned_incident_id?: string;
  driver_name?: string;
  contact_phone?: string;
  capacity: number;
  last_updated: string;
}

export interface MedicalRequest {
  id: string;
  incident_id: string;
  incident_title?: string;
  requested_by?: string;
  requested_by_name?: string;
  hospital_id?: string;
  hospital_name?: string;
  patients_count: number;
  critical_patients: number;
  status: 'PENDING' | 'ACCEPTED' | 'AMBULANCE_DISPATCHED' | 'REJECTED' | 'COMPLETED';
  notes?: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface Shelter {
  id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  contact_person?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  affected_district?: string;
  affected_state?: string;
  issued_by?: string;
  active: boolean;
  created_at: string;
}

export interface AIAssessment {
  id: string;
  incident_id: string;
  summary: string;
  severity_recommended: IncidentSeverity;
  priority_score: number;
  hazards: string[];
  affected_estimate: number;
  uncertainty: string;
  missing_info: string;
  confidence_score: number;
  created_at: string;
}

export interface AIRecommendation {
  id: string;
  incident_id: string;
  action_type: string;
  description: string;
  recommended_resources?: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by?: string;
  created_at: string;
  explanation?: AIExplanation;
}

export interface AIExplanation {
  id: string;
  recommendation_id: string;
  factors_json: {
    factor: string;
    weight: string;
    impact: string;
  }[];
  evidence_used_json: {
    source: string;
    content: string;
  }[];
  disclaimer: string;
  confidence_score?: number;
  created_at: string;
}

export interface SimulationResult {
  id: string;
  simulation_id: string;
  timeframe_hours: number;
  affected_pop_est: number;
  resource_demand: {
    ambulances_needed: number;
    rescue_teams_needed: number;
    shelter_beds_needed: number;
  };
  hospital_pressure_index: number;
  evacuation_demand: number;
  escalation_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  actor_name?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: any;
  ip_address?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  role_target?: UserRole;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  read: boolean;
  created_at: string;
}
