import { HospitalCapacity, Incident, Resource } from '../types/database';

export interface AIChatContext {
  incidents: Incident[];
  resources: Resource[];
  hospitals: HospitalCapacity[];
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

function formatIncidentSummary(incident: Incident): string {
  return `${incident.title} (${incident.status}) — ${incident.location_name || 'reported location'} — ${incident.severity} — priority ${incident.priority_score?.toFixed(0) || '0'} / 100`;
}

export async function queryAIAssistant(question: string, context: AIChatContext): Promise<string> {
  const q = (question || '').toLowerCase();
  const incidents = context.incidents || [];
  const resources = context.resources || [];
  const hospitals = context.hospitals || [];

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;

  if (apiKey) {
    try {
      const prompt = [
        'You are a DisasterX AI assistant for an emergency operations system.',
        'Use the current live project data only and answer plainly in 2-4 sentences.',
        'State uncertainty when evidence is limited.',
        '',
        'Current incident data:',
        incidents.length
          ? incidents.map((incident) => `- ${formatIncidentSummary(incident)}`).join('\n')
          : '- No active incidents in the current project state.',
        '',
        'Current resource data:',
        resources.length
          ? resources.map((resource) => `- ${resource.name} (${resource.code}): ${resource.status}`).join('\n')
          : '- No active resources in the current project state.',
        '',
        'Current hospital data:',
        hospitals.length
          ? hospitals.map((h) => `- ${h.hospital?.name || 'Hospital'}: ${h.available_beds}/${h.total_beds} beds, ${h.available_icu_beds}/${h.total_icu_beds} ICU.`).join('\n')
          : '- No hospital capacity records in the current project state.',
        '',
        `Question: ${question}`,
      ].join('\n');

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }],
          }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiText && aiText.trim()) {
          return aiText.trim();
        }
      }
    } catch (error) {
      console.warn('[AI Chat] Live API unavailable; falling back to project-aware local reasoning.', error);
    }
  }

  if (!incidents.length && !resources.length && !hospitals.length) {
    return 'The current DisasterX project has no active incidents, no resource assignments, and no hospital capacity data loaded yet. I can help as soon as reports or operational data are available.';
  }

  const topIncident = [...incidents].sort((a, b) => (b.priority_score || 0) - (a.priority_score || 0))[0];
  const availableResources = resources.filter((resource) => resource.status === 'AVAILABLE' || resource.status === 'ASSIGNED');
  const bestHospital = [...hospitals]
    .filter((entry) => entry.hospital && (entry.available_beds > 0 || entry.available_icu_beds > 0))
    .sort((a, b) => (b.available_beds + b.available_icu_beds) - (a.available_beds + a.available_icu_beds))[0];

  if (q.includes('priority') || q.includes('immediate') || q.includes('attention') || q.includes('urgent')) {
    if (!topIncident) {
      return 'There is no active high-priority incident in the current DisasterX state right now.';
    }
    return `The current top-priority incident is ${formatIncidentSummary(topIncident)}. This is the most urgent operational item in the active project state, so it should be reviewed first by the commander.`;
  }

  if (q.includes('hospital') || q.includes('capacity') || q.includes('bed')) {
    if (!bestHospital) {
      return 'There is no hospital currently reporting open beds or ICU capacity in the current project state.';
    }
    const hospitalName = bestHospital.hospital?.name || 'Hospital';
    return `${hospitalName} currently has the strongest available capacity: ${bestHospital.available_beds}/${bestHospital.total_beds} beds and ${bestHospital.available_icu_beds}/${bestHospital.total_icu_beds} ICU beds. This is the best current hospital match for additional patient load.`;
  }

  if (q.includes('resource') || q.includes('ambulance') || q.includes('dispatch') || q.includes('team')) {
    if (!availableResources.length) {
      return 'No available rescue or operational resources are currently marked as AVAILABLE in the project data.';
    }
    const chosen = availableResources[0];
    return `The most readily available unit is ${chosen.name} (${chosen.code}) with status ${chosen.status}. It is the best current dispatch candidate for the next response task in the DisasterX workflow.`;
  }

  if (q.includes('risk') || q.includes('summary') || q.includes('status')) {
    const highPriorityCount = incidents.filter((incident) => incident.severity === 'HIGH' || incident.severity === 'CRITICAL').length;
    const avgPriority = incidents.length ? incidents.reduce((sum, incident) => sum + (incident.priority_score || 0), 0) / incidents.length : 0;
    return `Current DisasterX operational status: ${incidents.length} active incident(s), ${highPriorityCount} high-priority incident(s), ${availableResources.length} available resource(s), and ${hospitals.filter((entry) => (entry.available_beds || 0) > 0 || (entry.available_icu_beds || 0) > 0).length} hospital(s) with open capacity. The average incident priority score is ${clampPercent(avgPriority).toFixed(0)}%.`;
  }

  if (q.includes('incident') || q.includes('report')) {
    if (!topIncident) {
      return 'There are no incident reports in the current project state to analyze.';
    }
    return `The current project state includes ${incidents.length} incident record(s). The most relevant active report is ${formatIncidentSummary(topIncident)}.`;
  }

  return `Based on the current DisasterX project data, there are ${incidents.length} incident(s), ${resources.length} resource(s), and ${hospitals.length} hospital capacity record(s). The current highest-priority item is ${topIncident ? `${topIncident.title} (${topIncident.priority_score?.toFixed(0) || '0'} priority)` : 'not available yet'}, and the most available hospital capacity is ${bestHospital ? `${bestHospital.hospital?.name || 'the leading hospital'}` : 'not currently available'}.`;
}
