import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { HospitalCapacity, Hospital, Ambulance } from '../types/database';

export function useHospitals() {
  const [hospitalCapacities, setHospitalCapacities] = useState<HospitalCapacity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setHospitalCapacities([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('hospital_capacity')
        .select(`
          *,
          hospital:hospitals (*)
        `);

      if (error) throw error;
      setHospitalCapacities(data || []);
    } catch (err) {
      console.error('[useHospitals] Error:', err);
      setHospitalCapacities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();

    if (isSupabaseConfigured) {
      const channelId = `hospitals_feed_${Math.random().toString(36).substring(2)}`;
      let channel: any = null;

      try {
        channel = supabase
          .channel(channelId)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'hospital_capacity' },
            () => {
              fetchHospitals();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'hospitals' },
            () => {
              fetchHospitals();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('[useHospitals] Realtime subscription handled:', err);
      }

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, []);

  const saveHospitalProfile = async (payload: {
    hospital_id?: string;
    name: string;
    registration_id?: string;
    type?: string;
    contact_person?: string;
    email?: string;
    contact_number: string;
    address?: string;
    area?: string;
    city?: string;
    district: string;
    state: string;
    pin_code?: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    location_source?: 'GPS' | 'MANUAL' | 'NETWORK' | 'ADDRESS';
    operating_status?: 'OPERATIONAL' | 'LIMITED' | 'FULL' | 'CLOSED';
    total_beds: number;
    available_beds: number;
    total_icu_beds: number;
    available_icu_beds: number;
    emergency_status?: 'OPEN' | 'LIMITED' | 'FULL' | 'CLOSED';
    emergency_load_pct: number;
    emergency_capacity?: number;
  }) => {
    const hospId = payload.hospital_id || crypto.randomUUID();

    const hospObj: Hospital = {
      id: hospId,
      name: payload.name,
      registration_id: payload.registration_id,
      type: payload.type,
      contact_person: payload.contact_person,
      email: payload.email,
      contact_number: payload.contact_number,
      address: payload.address,
      area: payload.area,
      city: payload.city,
      district: payload.district,
      state: payload.state,
      pin_code: payload.pin_code,
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracy: payload.accuracy,
      location_source: payload.location_source || 'GPS',
      verification_status: 'VERIFIED',
      operating_status: payload.operating_status || 'OPERATIONAL',
      created_at: new Date().toISOString(),
    };

    const capObj: HospitalCapacity = {
      id: crypto.randomUUID(),
      hospital_id: hospId,
      total_beds: payload.total_beds,
      available_beds: payload.available_beds,
      occupied_beds: Math.max(0, payload.total_beds - payload.available_beds),
      total_icu_beds: payload.total_icu_beds,
      available_icu_beds: payload.available_icu_beds,
      occupied_icu_beds: Math.max(0, payload.total_icu_beds - payload.available_icu_beds),
      emergency_status: payload.emergency_status || 'OPEN',
      emergency_load_pct: payload.emergency_load_pct,
      emergency_capacity: payload.emergency_capacity || payload.total_beds,
      incoming_patients: 0,
      last_updated: new Date().toISOString(),
      hospital: hospObj,
    };

    setHospitalCapacities((prev) => [capObj, ...prev.filter((h) => h.hospital_id !== hospId)]);

    if (!isSupabaseConfigured) return { success: true, hospital: hospObj, capacity: capObj };

    try {
      // 1. Upsert hospital record
      const { error: hospErr } = await supabase.from('hospitals').upsert({
        id: hospId,
        name: payload.name,
        latitude: payload.latitude,
        longitude: payload.longitude,
        district: payload.district,
        state: payload.state,
        contact_number: payload.contact_number,
      });

      if (hospErr) console.warn('[useHospitals] Hospital upsert notice:', hospErr.message);

      // 2. Upsert hospital capacity record
      const { error: capErr } = await supabase.from('hospital_capacity').upsert({
        hospital_id: hospId,
        total_beds: payload.total_beds,
        available_beds: payload.available_beds,
        total_icu_beds: payload.total_icu_beds,
        available_icu_beds: payload.available_icu_beds,
        emergency_load_pct: payload.emergency_load_pct,
        last_updated: new Date().toISOString(),
      });

      if (capErr) console.warn('[useHospitals] Capacity upsert notice:', capErr.message);

      await fetchHospitals();
      return { success: true, hospital: hospObj, capacity: capObj };
    } catch (err: any) {
      console.error('[useHospitals] Error saving hospital profile:', err);
      return { success: true, hospital: hospObj, capacity: capObj };
    }
  };

  const updateHospitalCapacity = async (
    hospitalId: string,
    updates: Partial<Omit<HospitalCapacity, 'id' | 'hospital_id' | 'last_updated'>>
  ) => {
    setHospitalCapacities((prev) =>
      prev.map((h) =>
        h.hospital_id === hospitalId
          ? {
              ...h,
              ...updates,
              last_updated: new Date().toISOString(),
            }
          : h
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase
        .from('hospital_capacity')
        .update({
          ...updates,
          last_updated: new Date().toISOString(),
        })
        .eq('hospital_id', hospitalId);

      if (error) throw error;
      fetchHospitals();
    } catch (err) {
      console.error('[useHospitals] Error updating capacity:', err);
    }
  };

  return {
    hospitalCapacities,
    loading,
    refetch: fetchHospitals,
    saveHospitalProfile,
    updateHospitalCapacity,
  };
}
