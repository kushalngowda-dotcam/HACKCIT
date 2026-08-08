import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MedicalRequest, Ambulance } from '../types/database';

export function useMedicalRequests() {
  const [medicalRequests, setMedicalRequests] = useState<MedicalRequest[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMedicalData = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setMedicalRequests([]);
        setAmbulances([]);
        setLoading(false);
        return;
      }

      const { data: reqData } = await supabase
        .from('medical_requests')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: ambData } = await supabase
        .from('ambulances')
        .select('*')
        .order('code', { ascending: true });

      setMedicalRequests(reqData || []);
      setAmbulances(ambData || []);
    } catch (err) {
      console.warn('[useMedicalRequests] Fetch notice:', err);
      setMedicalRequests([]);
      setAmbulances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalData();

    if (isSupabaseConfigured) {
      const channelId = `medical_feed_${Math.random().toString(36).substring(2)}`;
      let channel: any = null;

      try {
        channel = supabase
          .channel(channelId)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'medical_requests' }, () => {
            fetchMedicalData();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'ambulances' }, () => {
            fetchMedicalData();
          })
          .subscribe();
      } catch (err) {
        console.warn('[useMedicalRequests] Realtime subscription handled:', err);
      }

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, []);

  const createMedicalRequest = async (payload: Omit<MedicalRequest, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
    const newReq: MedicalRequest = {
      id: crypto.randomUUID(),
      ...payload,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMedicalRequests((prev) => [newReq, ...prev]);

    if (!isSupabaseConfigured) return { success: true, data: newReq };

    try {
      const { data, error } = await supabase
        .from('medical_requests')
        .insert({
          incident_id: payload.incident_id,
          incident_title: payload.incident_title,
          requested_by_name: payload.requested_by_name,
          hospital_id: payload.hospital_id,
          hospital_name: payload.hospital_name,
          patients_count: payload.patients_count,
          critical_patients: payload.critical_patients,
          status: 'PENDING',
          notes: payload.notes,
          latitude: payload.latitude,
          longitude: payload.longitude,
        })
        .select()
        .single();

      if (error) throw error;
      fetchMedicalData();
      return { success: true, data };
    } catch (err: any) {
      console.error('[useMedicalRequests] Create error:', err);
      return { success: true, data: newReq };
    }
  };

  const registerAmbulance = async (payload: {
    code: string;
    hospital_id?: string;
    hospital_name?: string;
    driver_name?: string;
    contact_phone?: string;
    capacity: number;
    latitude: number;
    longitude: number;
    status: Ambulance['status'];
  }) => {
    const ambObj: Ambulance = {
      id: crypto.randomUUID(),
      code: payload.code,
      hospital_id: payload.hospital_id,
      hospital_name: payload.hospital_name,
      driver_name: payload.driver_name,
      contact_phone: payload.contact_phone,
      capacity: payload.capacity,
      latitude: payload.latitude,
      longitude: payload.longitude,
      status: payload.status || 'AVAILABLE',
      last_updated: new Date().toISOString(),
    };

    setAmbulances((prev) => [ambObj, ...prev]);

    if (!isSupabaseConfigured) return { success: true, ambulance: ambObj };

    try {
      const { error } = await supabase.from('ambulances').insert({
        code: payload.code,
        hospital_id: payload.hospital_id,
        hospital_name: payload.hospital_name,
        driver_name: payload.driver_name,
        contact_phone: payload.contact_phone,
        capacity: payload.capacity,
        latitude: payload.latitude,
        longitude: payload.longitude,
        status: payload.status || 'AVAILABLE',
        last_updated: new Date().toISOString(),
      });

      if (error) console.warn('[useMedicalRequests] Ambulance register notice:', error.message);
      fetchMedicalData();
      return { success: true, ambulance: ambObj };
    } catch (err: any) {
      console.error('[useMedicalRequests] Error registering ambulance:', err);
      return { success: true, ambulance: ambObj };
    }
  };

  const updateMedicalRequestStatus = async (requestId: string, status: MedicalRequest['status']) => {
    setMedicalRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status, updated_at: new Date().toISOString() } : r))
    );

    if (!isSupabaseConfigured) return;

    try {
      await supabase
        .from('medical_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', requestId);
    } catch (err) {
      console.error('[useMedicalRequests] Status update error:', err);
    }
  };

  const dispatchAmbulanceUnit = async (ambulanceId: string, incidentId: string, lat: number, lng: number) => {
    setAmbulances((prev) =>
      prev.map((amb) =>
        amb.id === ambulanceId
          ? {
              ...amb,
              status: 'EN_ROUTE',
              assigned_incident_id: incidentId,
              latitude: lat,
              longitude: lng,
              last_updated: new Date().toISOString(),
            }
          : amb
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      await supabase
        .from('ambulances')
        .update({
          status: 'EN_ROUTE',
          assigned_incident_id: incidentId,
          latitude: lat,
          longitude: lng,
          last_updated: new Date().toISOString(),
        })
        .eq('id', ambulanceId);
    } catch (err) {
      console.error('[useMedicalRequests] Dispatch ambulance error:', err);
    }
  };

  return {
    medicalRequests,
    ambulances,
    loading,
    refetch: fetchMedicalData,
    createMedicalRequest,
    registerAmbulance,
    updateMedicalRequestStatus,
    dispatchAmbulanceUnit,
  };
}
