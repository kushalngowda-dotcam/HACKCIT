import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { EmergencyAlert } from '../types/database';

export function useAlerts() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setAlerts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('emergency_alerts')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (err) {
      console.error('[useAlerts] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();

    if (isSupabaseConfigured) {
      const channelId = `alerts_feed_${Math.random().toString(36).substring(2)}`;
      let channel: any = null;

      try {
        channel = supabase
          .channel(channelId)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'emergency_alerts' },
            () => {
              fetchAlerts();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('[useAlerts] Realtime subscription handled:', err);
      }

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, []);

  const createAlert = async (title: string, message: string, severity: EmergencyAlert['severity'], district?: string) => {
    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase.from('emergency_alerts').insert({
        title,
        message,
        severity,
        affected_district: district,
        active: true,
      });

      if (error) throw error;
      fetchAlerts();
    } catch (err) {
      console.error('[useAlerts] Create alert error:', err);
    }
  };

  return { alerts, loading, refetch: fetchAlerts, createAlert };
}
