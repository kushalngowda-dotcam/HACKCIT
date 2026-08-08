/**
 * DISASTERX AI - AI-Based Disaster Report Verification & Duplicate Detection Engine
 * Commander-in-the-Loop Decision Support System
 */

import { Incident, IncidentReport } from '../types/database';

export interface DuplicateAnalysisResult {
  isDuplicateCandidate: boolean;
  duplicateConfidence: number; // 0 - 100%
  matchedIncidentId?: string;
  matchedIncidentTitle?: string;
  similarityFactors: {
    gpsSimilarity: number;
    textSimilarity: number;
    typeSimilarity: number;
    timeProximity: number;
    imageSimilarity: number;
    clusterSimilarity: number;
  };
  evidenceMatrix: {
    citizenReports: 'SUPPORTED' | 'CONTRADICTED' | 'INCONCLUSIVE' | 'UNAVAILABLE';
    gpsConsistency: 'SUPPORTED' | 'CONTRADICTED' | 'INCONCLUSIVE' | 'UNAVAILABLE';
    weatherEnvironmental: 'SUPPORTED' | 'CONTRADICTED' | 'INCONCLUSIVE' | 'UNAVAILABLE';
    satelliteImagery: 'SUPPORTED' | 'CONTRADICTED' | 'INCONCLUSIVE' | 'UNAVAILABLE';
    governmentAlerts: 'SUPPORTED' | 'CONTRADICTED' | 'INCONCLUSIVE' | 'UNAVAILABLE';
    responderConfirmation: 'SUPPORTED' | 'CONTRADICTED' | 'INCONCLUSIVE' | 'UNAVAILABLE';
  };
  conflictingEvidence: string[];
  aiRecommendation: 'LIKELY_DUPLICATE' | 'NEW_INCIDENT_CANDIDATE' | 'LIKELY_VERIFIED' | 'REQUIRES_VERIFICATION';
  explanationText: string[];
  recommendedAction: 'MERGE' | 'KEEP_SEPARATE' | 'REQUEST_VERIFICATION';
  clusterSummary: {
    incidentCount: number;
    radiusKm: number;
    uniqueReporters: number;
  };
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateJaccardTextSimilarity(str1: string, str2: string): number {
  const words1 = new Set(str1.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 2));
  const words2 = new Set(str2.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 2));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  let intersection = 0;
  words1.forEach(w => {
    if (words2.has(w)) intersection++;
  });
  
  const union = new Set([...words1, ...words2]).size;
  return Math.round((intersection / union) * 100);
}

/**
 * Detect Duplicate Candidates and Generate Explainable AI Assessment
 */
export function analyzeDuplicateReport(
  newReport: {
    category_code: string;
    description: string;
    latitude: number;
    longitude: number;
    created_at?: string;
    image_available?: boolean;
  },
  existingIncidents: Incident[]
): DuplicateAnalysisResult {
  let highestMatch: Incident | null = null;
  let highestConfidence = 0;
  let bestFactors = {
    gpsSimilarity: 0,
    textSimilarity: 0,
    typeSimilarity: 0,
    timeProximity: 0,
    imageSimilarity: 0,
    clusterSimilarity: 0,
  };

  const reportTime = newReport.created_at ? new Date(newReport.created_at).getTime() : Date.now();

  for (const inc of existingIncidents) {
    const distKm = calculateHaversineDistance(newReport.latitude, newReport.longitude, inc.latitude, inc.longitude);
    const gpsSimilarity = distKm <= 0.5 ? 100 : distKm <= 2.0 ? 85 : distKm <= 5.0 ? 60 : Math.max(0, 100 - distKm * 15);

    const incCategory = (inc.title.split(' ')[0] || '').toLowerCase();
    const typeSimilarity = inc.title.toLowerCase().includes((newReport.category_code || '').toLowerCase()) ||
      (newReport.category_code || '').toLowerCase().includes(incCategory)
      ? 100
      : 30;

    const textSimilarity = calculateJaccardTextSimilarity(
      newReport.description,
      `${inc.title} ${inc.location_name || ''}`
    );

    const incTime = new Date(inc.created_at).getTime();
    const diffMin = Math.abs(reportTime - incTime) / (1000 * 60);
    const timeProximity = diffMin <= 30 ? 100 : diffMin <= 120 ? 80 : diffMin <= 360 ? 50 : 20;
    const clusterSimilarity = Math.min(100, Math.max(25, 100 - Math.max(distKm - 0.5, 0) * 12));
    const imageSimilarity = newReport.image_available ? 76 : 50;

    const weightedScore = Math.round(
      gpsSimilarity * 0.35 +
      typeSimilarity * 0.20 +
      textSimilarity * 0.20 +
      timeProximity * 0.15 +
      clusterSimilarity * 0.10 +
      imageSimilarity * 0.05
    );

    if (weightedScore > highestConfidence) {
      highestConfidence = weightedScore;
      highestMatch = inc;
      bestFactors = { gpsSimilarity, textSimilarity, typeSimilarity, timeProximity, imageSimilarity, clusterSimilarity };
    }
  }

  const isCandidate = highestConfidence >= 60;
  const conflicts: string[] = [];

  if (bestFactors.gpsSimilarity < 50) {
    conflicts.push('Geographic location is outside the standard cluster radius.');
  }
  if (bestFactors.typeSimilarity < 50) {
    conflicts.push('Disaster category mismatch detected.');
  }
  if (bestFactors.timeProximity < 60) {
    conflicts.push('Report timing is less consistent with the active event window.');
  }

  const explanations: string[] = [
    `GPS: ${bestFactors.gpsSimilarity}% spatial similarity with the nearest active incident cluster.`,
    `Text: Description overlap is ${bestFactors.textSimilarity}% between the new report and the existing incident.`,
    `Disaster Type: ${bestFactors.typeSimilarity === 100 ? 'Category match is strong.' : 'Category match is weaker than ideal.'}`,
    `Time Proximity: Reports are within a ${bestFactors.timeProximity}% temporal window relative to the cluster.`,
    `Image Similarity: ${bestFactors.imageSimilarity}% when media is available; otherwise this factor is treated as unavailable rather than negative evidence.`,
  ];

  const recommendation: DuplicateAnalysisResult['aiRecommendation'] = isCandidate ? 'LIKELY_DUPLICATE' : 'NEW_INCIDENT_CANDIDATE';

  return {
    isDuplicateCandidate: isCandidate,
    duplicateConfidence: highestConfidence,
    matchedIncidentId: highestMatch?.id,
    matchedIncidentTitle: highestMatch?.title,
    similarityFactors: bestFactors,
    evidenceMatrix: {
      citizenReports: isCandidate ? 'SUPPORTED' : 'INCONCLUSIVE',
      gpsConsistency: bestFactors.gpsSimilarity >= 70 ? 'SUPPORTED' : 'CONTRADICTED',
      weatherEnvironmental: 'UNAVAILABLE',
      satelliteImagery: 'UNAVAILABLE',
      governmentAlerts: 'UNAVAILABLE',
      responderConfirmation: 'UNAVAILABLE',
    },
    conflictingEvidence: conflicts,
    aiRecommendation: recommendation,
    explanationText: explanations,
    recommendedAction: isCandidate ? 'MERGE' : 'KEEP_SEPARATE',
    clusterSummary: {
      incidentCount: highestMatch ? 1 : 0,
      radiusKm: Number((bestFactors.gpsSimilarity > 0 ? Math.max(0.5, 5 - (bestFactors.gpsSimilarity / 20)) : 0).toFixed(2)),
      uniqueReporters: highestMatch ? Math.max(1, Math.round(bestFactors.gpsSimilarity / 25)) : 1,
    },
  };
}
