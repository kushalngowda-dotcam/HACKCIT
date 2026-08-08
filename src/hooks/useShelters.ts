import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Shelter } from '../types/database';

export function useShelters() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchShelters = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setShelters([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('shelters')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      setShelters(data || []);
    } catch (err) {
      console.error('[useShelters] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  return { shelters, loading, refetch: fetchShelters };
}
