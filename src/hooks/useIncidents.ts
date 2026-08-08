import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Incident, IncidentReport } from '../types/database';
import { enqueueOfflineReport, getQueuedReports } from '../lib/offlineQueue';
import { analyzeDuplicateReport } from '../services/aiDuplicateEngine';

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);

    let localIncidents: Incident[] = [];
    let localReports: IncidentReport[] = [];

    try {
      // 1. Fetch citizen reports saved in offline queue (IndexedDB + localStorage)
      const queued = await getQueuedReports();
      localReports = (queued || []).map((q, idx) => ({
        id: q.client_uuid || `report-${idx}`,
        client_uuid: q.client_uuid || `client-uuid-${idx}`,
        category_code: q.category_code || 'EMERGENCY',
        description: q.description || 'Emergency Alert',
        voice_transcript: q.voice_transcript,
        affected_people: q.affected_people || 1,
        latitude: Number(q.latitude) || 12.9716,
        longitude: Number(q.longitude) || 77.5946,
        accuracy: q.accuracy || 10,
        location_source: q.location_source || 'GPS',
        village: q.village || '',
        landmark: q.landmark || 'Emergency Location',
        district: q.district || 'Bengaluru Urban',
        state: q.state || 'Karnataka',
        created_at: q.created_at || new Date().toISOString(),
      }));

      // Transform submitted citizen reports directly into operational incidents
      localIncidents = (queued || []).map((q, idx) => ({
        id: q.client_uuid || `inc-${idx}`,
        title: `${q.category_code || 'EMERGENCY'} Incident near ${q.landmark || q.village || 'Reported Location'}`,
        severity: (q.affected_people || 1) > 5 ? 'HIGH' : 'MEDIUM',
        status: 'REPORTED',
        latitude: Number(q.latitude) || 12.9716,
        longitude: Number(q.longitude) || 77.5946,
        location_name: q.landmark || q.village || 'Emergency Location',
        district: q.district || 'Bengaluru Urban',
        state: q.state || 'Karnataka',
        affected_count_est: q.affected_people || 1,
        priority_score: (q.affected_people || 1) > 5 ? 78.0 : 55.0,
        conflict_flag: false,
        reporter_count: 1,
        created_at: q.created_at || new Date().toISOString(),
        updated_at: q.created_at || new Date().toISOString(),
      }));

      if (!isSupabaseConfigured) {
        setIncidents(localIncidents);
        setReports(localReports);
        setLoading(false);
        return;
      }

      // 2. Query Supabase database
      const { data: incidentData, error: incErr } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (incErr) throw incErr;

      const { data: reportData, error: repErr } = await supabase
        .from('incident_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (repErr) throw repErr;

      const mergedReports = [...localReports, ...(reportData || [])].filter(
        (v, i, a) => a.findIndex((t) => t.client_uuid === v.client_uuid || t.id === v.id) === i
      );

      const mergedServerIncidents = [...localIncidents, ...(incidentData || [])].filter(
        (v, i, a) => a.findIndex((t) => t.id === v.id) === i
      );

      setIncidents(mergedServerIncidents);
      setReports(mergedReports);
    } catch (err: any) {
      console.warn('[useIncidents] Supabase fetch notice (using local queue):', err?.message);
      setError(err?.message || 'Using local database queue');
      setIncidents(localIncidents);
      setReports(localReports);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();

    if (isSupabaseConfigured) {
      const channelId = `incidents_feed_${Math.random().toString(36).substring(2)}`;
      let channel: any = null;

      try {
        channel = supabase
          .channel(channelId)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'incidents' },
            () => {
              fetchIncidents();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'incident_reports' },
            () => {
              fetchIncidents();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('[useIncidents] Realtime subscription handled:', err);
      }

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, []);

  const createEmergencyReport = async (payload: {
    category_code: string;
    description: string;
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
    image_blob?: Blob;
  }) => {
    const clientUuid = crypto.randomUUID();

    if (!navigator.onLine || !isSupabaseConfigured) {
      const queued = await enqueueOfflineReport(payload);
      await fetchIncidents();
      return { success: true, offline: true, client_uuid: clientUuid, queued };
    }

    try {
      const { data: repData, error: repErr } = await supabase
        .from('incident_reports')
        .insert({
          client_uuid: clientUuid,
          category_code: payload.category_code,
          description: payload.description,
          voice_transcript: payload.voice_transcript,
          affected_people: payload.affected_people,
          latitude: payload.latitude,
          longitude: payload.longitude,
          accuracy: payload.accuracy,
          location_source: payload.location_source,
          village: payload.village,
          landmark: payload.landmark,
          district: payload.district || 'District',
          state: payload.state || 'State',
        })
        .select()
        .single();

      if (repErr) throw repErr;

      const { data: existingIncidents } = await supabase
        .from('incidents')
        .select('*')
        .neq('status', 'CLOSED')
        .neq('status', 'RESOLVED');

      let targetIncidentId = '';
      const aiDuplicateMatch = analyzeDuplicateReport(
        {
          category_code: payload.category_code,
          description: payload.description,
          latitude: payload.latitude,
          longitude: payload.longitude,
          created_at: new Date().toISOString(),
          image_available: !!payload.image_blob,
        },
        (existingIncidents || []) as Incident[]
      );

      if (aiDuplicateMatch.isDuplicateCandidate && aiDuplicateMatch.matchedIncidentId) {
        await supabase.from('audit_logs').insert({
          action: 'AI_DUPLICATE_CANDIDATE',
          entity_type: 'INCIDENT_REPORTS',
          entity_id: repData.id,
          metadata: {
            incident_id: aiDuplicateMatch.matchedIncidentId,
            matched_incident_title: aiDuplicateMatch.matchedIncidentTitle,
            ai_recommendation: aiDuplicateMatch.aiRecommendation,
            ai_confidence: aiDuplicateMatch.duplicateConfidence,
            recommendation: aiDuplicateMatch.recommendedAction,
            explanation: aiDuplicateMatch.explanationText,
            commander_review_required: true,
          },
        });
      }

      const { data: newInc, error: newIncErr } = await supabase
        .from('incidents')
        .insert({
          title: `${payload.category_code} Incident near ${payload.landmark || payload.village || 'Reported Location'}`,
          severity: payload.affected_people > 5 ? 'HIGH' : 'MEDIUM',
          status: 'REPORTED',
          latitude: payload.latitude,
          longitude: payload.longitude,
          location_name: payload.landmark || payload.village || 'Emergency Location',
          district: payload.district,
          state: payload.state,
          affected_count_est: payload.affected_people,
          priority_score: payload.affected_people > 5 ? 75.0 : 50.0,
          reporter_count: 1,
          conflict_flag: aiDuplicateMatch.isDuplicateCandidate,
          conflict_details: aiDuplicateMatch.isDuplicateCandidate
            ? {
                conflict: 'Possible duplicate cluster identified by AI. Human commander review required before merge.',
                sources: ['AI_DUPLICATE_ENGINE'],
              }
            : undefined,
        })
        .select()
        .single();

      if (!newIncErr && newInc) {
        targetIncidentId = newInc.id;
      }

      if (targetIncidentId) {
        await supabase
          .from('incident_reports')
          .update({ incident_id: targetIncidentId })
          .eq('id', repData.id);
      }

      if (payload.image_blob && repData) {
        const filePath = `evidence/${repData.id}/${Date.now()}.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from('incident-evidence')
          .upload(filePath, payload.image_blob, { contentType: 'image/jpeg' });

        if (!uploadErr) {
          await supabase.from('incident_evidence').insert({
            report_id: repData.id,
            incident_id: targetIncidentId || undefined,
            file_path: filePath,
            file_type: 'image/jpeg',
            file_size: payload.image_blob.size,
          });
        }
      }

      await fetchIncidents();
      return { success: true, offline: false, client_uuid: clientUuid, data: repData };
    } catch (err: any) {
      console.warn('[useIncidents] Online submission failed, saving to offline queue:', err);
      const queued = await enqueueOfflineReport(payload);
      await fetchIncidents();
      return { success: true, offline: true, client_uuid: clientUuid, queued, error: err.message };
    }
  };

  const updateIncidentStatus = async (incidentId: string, newStatus: Incident['status'], notes?: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: newStatus } : inc))
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase
        .from('incidents')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', incidentId);

      if (error) throw error;

      await supabase.from('incident_status_history').insert({
        incident_id: incidentId,
        new_status: newStatus,
        notes: notes || `Status changed to ${newStatus}`,
      });

      fetchIncidents();
    } catch (err) {
      console.error('[useIncidents] Error updating status:', err);
    }
  };

  return {
    incidents,
    reports,
    loading,
    error,
    refetch: fetchIncidents,
    createEmergencyReport,
    updateIncidentStatus,
  };
}
