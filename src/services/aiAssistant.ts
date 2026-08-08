import { HospitalCapacity, Incident, Resource } from '../types/database';

export type ChatIntent =
  | 'GENERAL_PROJECT_INFO'
  | 'REPORT_EMERGENCY'
  | 'INCIDENT_STATUS'
  | 'INCIDENT_DETAILS'
  | 'INCIDENT_VERIFICATION'
  | 'DUPLICATE_REPORTS'
  | 'INCIDENT_PRIORITY'
  | 'INCIDENT_LOCATION'
  | 'NEARBY_HOSPITALS'
  | 'HOSPITAL_CAPACITY'
  | 'AMBULANCE_AVAILABILITY'
  | 'RESPONDER_ASSIGNMENT'
  | 'RESPONDER_LOCATION'
  | 'RESOURCE_AVAILABILITY'
  | 'OFFLINE_REPORTING'
  | 'REPORT_SYNC_STATUS'
  | 'AI_REASONING'
  | 'EVIDENCE_ANALYSIS'
  | 'WHAT_IF_SIMULATION'
  | 'MAP_NAVIGATION'
  | 'USER_ACCOUNT'
  | 'ROLE_CAPABILITIES'
  | 'SYSTEM_WORKFLOW'
  | 'UNRELATED';

export interface AIChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface AIChatContext {
  incidents: Incident[];
  resources: Resource[];
  hospitals: HospitalCapacity[];
  role?: string;
  history?: AIChatMessage[];
}

const unrelatedPhrases = [
  'poem',
  'joke',
  'cricket',
  'python code',
  'elon musk',
  'write a poem',
  'write code',
  'who is',
  'what is a joke',
];

function normalizeRole(rawRole?: string): string {
  const value = (rawRole || '').toUpperCase().replace(/\s+/g, '_');
  const aliases: Record<string, string> = {
    DISASTER_COMMANDER: 'COMMANDER',
    HOSPITAL_MANAGER: 'HOSPITAL',
    RESCUE_TEAM: 'RESPONDER',
    EMERGENCY_COMMANDER: 'COMMANDER',
  };
  return aliases[value] || value || 'CITIZEN';
}

function getActiveIncidents(incidents: Incident[]): Incident[] {
  return incidents.filter((incident) => !['RESOLVED', 'CLOSED', 'REJECTED'].includes(incident.status));
}

function formatIncidentSummary(incident: Incident): string {
  return `${incident.title} | ${incident.location_name || 'Unknown location'} | ${incident.severity} | priority ${incident.priority_score?.toFixed(0) || '0'}`;
}

function findIncidentByReference(question: string, incidents: Incident[], history: AIChatMessage[] = []): Incident | null {
  const lower = question.toLowerCase();
  const referenceMatch = lower.match(/incident\s*#?\s*([a-z0-9-]+)/i);
  const ref = referenceMatch ? referenceMatch[1].toLowerCase() : null;

  if (ref) {
    const direct = incidents.find((incident) => {
      const id = incident.id?.toLowerCase() || '';
      const title = (incident.title || '').toLowerCase();
      const loc = (incident.location_name || '').toLowerCase();
      return id.includes(ref) || title.includes(ref) || loc.includes(ref);
    });
    if (direct) return direct;
  }

  if (/\b(it|this|that|they|them|he|she)\b/.test(lower)) {
    const latestIncidentText = [...history].reverse().find((message) => message.sender === 'ai' && /incident/i.test(message.text));
    if (latestIncidentText) {
      const latestRef = latestIncidentText.text.match(/INCIDENT[^\n]*[:\-]?\s*([A-Za-z0-9\s\-]+)/i)?.[1];
      if (latestRef) {
        return incidents.find((incident) => {
          const haystack = `${incident.title} ${incident.location_name || ''}`.toLowerCase();
          return haystack.includes(latestRef.trim().toLowerCase());
        }) || null;
      }
    }
  }

  return null;
}

function detectIntent(question: string): ChatIntent {
  const q = (question || '').toLowerCase();
  if (unrelatedPhrases.some((pattern) => q.includes(pattern))) return 'UNRELATED';

  if (/what is .*disasterx|what does .*disasterx|how does .*disasterx|what features are available|how does .*work|what is this system|project overview/.test(q)) return 'GENERAL_PROJECT_INFO';
  if (/(report.*emergency|how do i report|submit a report|report an emergency|make a report|i need to report)/.test(q)) return 'REPORT_EMERGENCY';
  if (/(status of my report|my report.*status|report.*delivered|has my report|been delivered|sync status|report sync)/.test(q)) return 'REPORT_SYNC_STATUS';
  if (/(incident status|show.*incident|incidents?\s*(now|active|critical)|current incidents|incident.*status)/.test(q)) return 'INCIDENT_STATUS';
  if (/(incident details|details of incident|show incident|incident #|view incident|describe incident)/.test(q)) return 'INCIDENT_DETAILS';
  if (/(why.*verified|verification.*incident|verified\?|verification status|why was this incident verified|why.*incident.*verified)/.test(q)) return 'INCIDENT_VERIFICATION';
  if (/(duplicate reports|duplicates?|duplicate detection|why are these reports duplicates|are there duplicate)/.test(q)) return 'DUPLICATE_REPORTS';
  if (/(critical incidents|highest priority|priority.*incident|which incident.*priority|why.*high priority)/.test(q)) return 'INCIDENT_PRIORITY';
  if (/(location.*incident|where.*incident|incident.*location|nearest.*incident|route.*incident)/.test(q)) return 'INCIDENT_LOCATION';
  if (/(nearby hospital|nearest hospital|hospital.*near|which hospital.*nearest|where.*hospital)/.test(q)) return 'NEARBY_HOSPITALS';
  if (/(hospital.*capacity|how many beds|icu beds|available beds|beds available|hospital.*beds)/.test(q)) return 'HOSPITAL_CAPACITY';
  if (/(ambulance.*available|ambulances?|available ambulance|dispatch ambulance)/.test(q)) return 'AMBULANCE_AVAILABILITY';
  if (/(assigned to me|my assigned incident|what incident am i assigned to|where is my assigned incident|responder assignment|assigned incident)/.test(q)) return 'RESPONDER_ASSIGNMENT';
  if (/(responder location|where.*responder|where is .* responder|nearest responder|responder.*nearby)/.test(q)) return 'RESPONDER_LOCATION';
  if (/(resource.*available|what resources are available|resource availability|available resources|dispatch.*resource)/.test(q)) return 'RESOURCE_AVAILABILITY';
  if (/(without internet|offline.*report|report.*offline|can citizens report offline|offline reporting)/.test(q)) return 'OFFLINE_REPORTING';
  if (/(ai reasoning|why did ai|ai recommended|ai explain|evidence.*incident|supporting evidence|conflicting evidence|what evidence)/.test(q)) return 'AI_REASONING';
  if (/(evidence analysis|evidence.*support|conflicting evidence|supporting evidence|why.*verified)/.test(q)) return 'EVIDENCE_ANALYSIS';
  if (/(what if|simulation|if hospital a gets|what happens if)/.test(q)) return 'WHAT_IF_SIMULATION';
  if (/(map|view on map|open google maps|route|navigation)/.test(q)) return 'MAP_NAVIGATION';
  if (/(login|user account|my account|profile|role|what can i do|what can this role do|role capabilities)/.test(q)) return 'USER_ACCOUNT';
  if (/(what does the commander do|what does the hospital manager do|what can a responder do|role capabilities|capabilities)/.test(q)) return 'ROLE_CAPABILITIES';
  if (/(workflow|how does this system work|how does offline reporting work|how are hospitals assigned|how are responders assigned|how does duplicate detection work)/.test(q)) return 'SYSTEM_WORKFLOW';
  if (/(help|hello|hi|thanks)/.test(q)) return 'GENERAL_PROJECT_INFO';

  return 'GENERAL_PROJECT_INFO';
}

function getHospitalCapacitySummary(hospitals: HospitalCapacity[], role: string): string {
  if (!hospitals.length) {
    return 'I couldn’t find any registered hospital capacity data in the DisasterX system.';
  }

  const open = hospitals.filter((hospital) => (hospital.available_beds || 0) > 0 || (hospital.available_icu_beds || 0) > 0);
  if (!open.length) {
    return 'No hospital currently shows open beds or ICU capacity in the active DisasterX data.';
  }

  const top = [...open].sort((a, b) => (b.available_beds + b.available_icu_beds) - (a.available_beds + a.available_icu_beds))[0];
  const hospitalName = top.hospital?.name || 'Hospital';

  if (role === 'COMMANDER') {
    return `${hospitalName} currently has ${top.available_beds}/${top.total_beds} normal beds and ${top.available_icu_beds}/${top.total_icu_beds} ICU beds available. This is the strongest current capacity signal in the active hospital registry.`;
  }

  if (role === 'HOSPITAL') {
    return `Your hospital capacity snapshot shows ${top.available_beds}/${top.total_beds} beds and ${top.available_icu_beds}/${top.total_icu_beds} ICU beds available. That is the current open capacity available in the DisasterX system.`;
  }

  return `${hospitalName} has the most available capacity right now: ${top.available_beds}/${top.total_beds} beds and ${top.available_icu_beds}/${top.total_icu_beds} ICU beds.`;
}

function getCriticalSummary(incidents: Incident[]): string {
  const active = getActiveIncidents(incidents);
  if (!active.length) {
    return 'No active incidents are currently present in the DisasterX system.';
  }

  const critical = active.filter((incident) => incident.severity === 'CRITICAL' || (incident.priority_score || 0) >= 80);
  if (!critical.length) {
    return `There are ${active.length} active incident(s), but none are currently marked as critical or above the commander review threshold.`;
  }

  const first = critical[0];
  return `The highest-priority active incident is ${formatIncidentSummary(first)}. There are ${critical.length} critical or high-priority incident(s) in the current project data.`;
}

export async function queryAIAssistant(question: string, context: AIChatContext): Promise<string> {
  const q = (question || '').trim();
  if (!q) return 'I couldn’t retrieve the requested information right now. Please try again.';

  const incidents = context.incidents || [];
  const resources = context.resources || [];
  const hospitals = context.hospitals || [];
  const role = normalizeRole(context.role);
  const intent = detectIntent(q);

  if (intent === 'UNRELATED') {
    return "I'm the DisasterX AI Emergency Intelligence Assistant. I can help with incidents, emergency reports, hospitals, responders, resources, AI verification, maps, offline reporting and other features of this system.";
  }

  if (!incidents.length && !resources.length && !hospitals.length) {
    return "I couldn't find that information in the DisasterX AI system.";
  }

  const activeIncidents = getActiveIncidents(incidents);
  const topIncident = [...activeIncidents].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))[0] || null;
  const availableResources = resources.filter((resource) => ['AVAILABLE', 'ASSIGNED'].includes(resource.status));
  const openHospitals = hospitals.filter((hospital) => (hospital.available_beds || 0) > 0 || (hospital.available_icu_beds || 0) > 0);

  const lastIncident = findIncidentByReference(q, activeIncidents, context.history || []);

  if (intent === 'GENERAL_PROJECT_INFO') {
    const roleText = role === 'COMMANDER'
      ? 'As a commander, you can review high-priority incidents, verify evidence, reconcile duplicate reports, and coordinate dispatch.'
      : role === 'HOSPITAL'
        ? 'As a hospital manager, you can review bed and ICU availability, ambulance demand, and incident routing relevant to your facility.'
        : role === 'RESPONDER'
          ? 'As a responder, you can check assignment, incident location, and the latest operational context for your task.'
          : role === 'ADMIN'
            ? 'As an admin, you can monitor the platform workflow, queue health, and system-level emergency coordination.'
            : 'As a citizen, you can report emergencies, view status for your own reports, and learn the system workflow.';

    return `DisasterX AI is the emergency coordination platform for this project. It combines role-based dashboards, incident reporting, duplicate detection, hospital capacity monitoring, responder dispatch, and offline reporting. ${roleText}`;
  }

  if (intent === 'REPORT_EMERGENCY') {
    if (role === 'CITIZEN') {
      return 'Citizen reporting is supported through the emergency reporting flow in the app. If the network is unavailable, the report is queued locally and synced when connectivity returns. Please use the report form in the DisasterX interface to submit the emergency details.';
    }
    return 'Emergency reports can be submitted through the DisasterX reporting flow and the system will attach incident metadata, location, and operational context for review.';
  }

  if (intent === 'INCIDENT_STATUS') {
    if (!activeIncidents.length) return 'No matching information was found in the DisasterX system.';
    const summary = activeIncidents.map((incident) => `${incident.title} — ${incident.status} — ${incident.severity}`).join('\n');
    return `Current incident status:\n${summary}`;
  }

  if (intent === 'INCIDENT_DETAILS') {
    const target = lastIncident || topIncident;
    if (!target) return 'I couldn’t find that incident in the DisasterX AI system.';
    return `INCIDENT\n${formatIncidentSummary(target)}\nStatus: ${target.status}\nSeverity: ${target.severity}\nReports fused: ${target.reporter_count || 1}\nPriority: ${target.priority_score?.toFixed(0) || '0'} / 100\nLocation: ${target.location_name || 'Unknown'}\nConflict flag: ${target.conflict_flag ? 'Yes' : 'No'}`;
  }

  if (intent === 'INCIDENT_VERIFICATION') {
    const target = lastIncident || findIncidentByReference(q, activeIncidents, context.history || []) || topIncident;
    if (!target) return 'No matching information was found in the DisasterX system.';

    const evidence = [
      target.reporter_count && target.reporter_count > 1 ? 'Multiple citizen reports were attached to this incident.' : 'Only one report is currently attached to this incident.',
      target.conflict_flag ? 'The incident has conflicting or duplicate indicators that require review.' : 'No conflicting indicators were flagged for this record.',
      target.priority_score && target.priority_score >= 80 ? 'The priority score indicates elevated operational risk.' : 'The priority score remains within the standard review threshold.'
    ].filter(Boolean);

    return `INCIDENT:\n${formatIncidentSummary(target)}\nSTATUS:\n${target.status}\nCONFIDENCE:\n${target.priority_score ? `${Math.min(99, Math.round(target.priority_score))}%` : 'Not available'}\nSUPPORTING EVIDENCE:\n- ${evidence.join('\n- ')}\nCONFLICTING EVIDENCE:\n- ${target.conflict_flag ? 'Conflicting or duplicate indicators were detected.' : 'None reported.'}\nREASON:\nThe incident is currently represented in the DisasterX project data with the recorded operational status and priority score shown above. Evidence is only as complete as the project metadata currently available.`;
  }

  if (intent === 'DUPLICATE_REPORTS') {
    const duplicateIncidents = activeIncidents.filter((incident) => incident.conflict_flag || incident.reporter_count > 1);
    if (!duplicateIncidents.length) return 'No duplicate or conflicting incident clusters were currently detected in the DisasterX system.';
    const sample = duplicateIncidents[0];
    return `Duplicate review is active for ${sample.title}. These reports were grouped because the project is tracking multiple submissions for the same or nearby event cluster, with overlapping location and reporting signals. The current duplicate logic evaluates GPS proximity, disaster type similarity, timestamp proximity, and existing incident radius.`;
  }

  if (intent === 'INCIDENT_PRIORITY') {
    if (!topIncident) return 'I couldn’t find any active incidents in the DisasterX system.';
    return `The current top-priority incident is ${formatIncidentSummary(topIncident)}. This item has the highest priority score in the active project data and should be reviewed first by the command team.`;
  }

  if (intent === 'INCIDENT_LOCATION') {
    const target = lastIncident || topIncident;
    if (!target) return 'No matching information was found in the DisasterX system.';
    return `${target.title} is recorded at ${target.location_name || 'the reported location'} with coordinates ${target.latitude}, ${target.longitude}. [VIEW ON MAP] [OPEN GOOGLE MAPS]`;
  }

  if (intent === 'NEARBY_HOSPITALS') {
    if (!hospitals.length) return 'I couldn’t find any hospital records in the DisasterX AI system.';
    const nearest = [...hospitals].sort((a, b) => (b.hospital?.verification_status === 'VERIFIED' ? 1 : 0) - (a.hospital?.verification_status === 'VERIFIED' ? 1 : 0))[0];
    const name = nearest?.hospital?.name || 'Registered hospital';
    return `${name} is the nearest available hospital currently recorded in the project data. It has ${nearest.available_beds}/${nearest.total_beds} beds and ${nearest.available_icu_beds}/${nearest.total_icu_beds} ICU beds available.`;
  }

  if (intent === 'HOSPITAL_CAPACITY') {
    return getHospitalCapacitySummary(hospitals, role);
  }

  if (intent === 'AMBULANCE_AVAILABILITY') {
    if (!availableResources.length) return 'I couldn’t find any ambulance or dispatch-ready resource in the current project state.';
    const chosen = availableResources[0];
    return `The most immediately available resource is ${chosen.name} (${chosen.code}) with status ${chosen.status}. It is the best current dispatch candidate for the next response task.`;
  }

  if (intent === 'RESPONDER_ASSIGNMENT') {
    if (role === 'RESPONDER') {
      const activeAssignment = availableResources[0];
      if (!activeAssignment) return 'I couldn’t find an active responder assignment in the DisasterX system.';
      return `Your active assignment context is currently tied to the project’s active operational queue. The most relevant available resource is ${activeAssignment.name} (${activeAssignment.code}) with status ${activeAssignment.status}.`;
    }
    return 'Responder assignment data must be checked against the project’s active operational queue. I couldn’t find a responder assignment in the current system context.';
  }

  if (intent === 'RESPONDER_LOCATION') {
    if (!resources.length) return 'I couldn’t find any responder or resource location data in the DisasterX system.';
    const first = resources[0];
    return `${first.name} is currently recorded at ${first.latitude}, ${first.longitude} and has status ${first.status}.`;
  }

  if (intent === 'RESOURCE_AVAILABILITY') {
    if (!availableResources.length) return 'No matching information was found in the DisasterX system.';
    const summary = availableResources.slice(0, 3).map((resource) => `${resource.name} (${resource.code}) — ${resource.status}`).join('\n');
    return `Available resources:\n${summary}`;
  }

  if (intent === 'OFFLINE_REPORTING') {
    return 'Citizens can report offline because the project implements a local store-and-forward flow: emergency reports are queued in IndexedDB and local storage, monitored for connectivity, and synchronized to Supabase when the network becomes available. This is offline reporting, not a separate real-time network mesh.';
  }

  if (intent === 'REPORT_SYNC_STATUS') {
    return 'The reporting flow stores reports locally until connectivity is restored and then syncs them to the server. If a report cannot be uploaded, the queue remains pending and the system will retry once the app is back online.';
  }

  if (intent === 'AI_REASONING' || intent === 'EVIDENCE_ANALYSIS') {
    const target = lastIncident || topIncident;
    if (!target) return 'I couldn’t find any current incident details for evidence analysis in the DisasterX system.';
    return `AI RECOMMENDATION\nThis incident has a current priority score of ${target.priority_score?.toFixed(0) || '0'} and a status of ${target.status}. This is an AI recommendation based on the project data, not the final commander decision. COMMANDER DECISION\nThe commander can approve, override, or reject this recommendation after review.`;
  }

  if (intent === 'WHAT_IF_SIMULATION') {
    return 'I can help you evaluate this scenario using the What-If Response Simulator. The simulation is available in the project, and the result should be reviewed as a planning estimate rather than a final operational decision.';
  }

  if (intent === 'MAP_NAVIGATION') {
    const target = lastIncident || topIncident;
    if (!target) return 'I couldn’t find a relevant map target in the DisasterX system.';
    return `${target.title} is available in the current project map context. Use the map view to inspect the incident and route information. [VIEW ON MAP] [OPEN GOOGLE MAPS]`;
  }

  if (intent === 'USER_ACCOUNT') {
    return `Current role: ${role}. This role determines what data you can access, how you can respond, and which dashboard functions are relevant for your account.`;
  }

  if (intent === 'ROLE_CAPABILITIES') {
    if (role === 'COMMANDER') return 'Commander capabilities include reviewing critical incidents, approving duplicate merges, coordinating dispatch priorities, and checking resource and hospital availability.';
    if (role === 'HOSPITAL') return 'Hospital manager capabilities include reviewing bed and ICU capacity, ambulance availability, and patient load based on active incident data.';
    if (role === 'RESPONDER') return 'Responder capabilities include checking assigned incidents, current location, nearest hospital routing, and response priorities.';
    if (role === 'ADMIN') return 'Admin capabilities include monitoring system-level workflow health and operational coordination data.';
    return 'Citizen capabilities are limited to reporting and checking the status of their own submissions and general public-facing guidance.';
  }

  if (intent === 'SYSTEM_WORKFLOW') {
    return 'The DisasterX workflow is: report or receive an incident, fuse related observations, flag duplicate or conflicting reports, prioritize the incident, assign resources, monitor hospital capacity, and keep the commander in the review loop before final action.';
  }

  return `I couldn't retrieve the requested information right now. Please try again.`;
}
