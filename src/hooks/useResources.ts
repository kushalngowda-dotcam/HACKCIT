import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Resource, ResourceStatus } from '../types/database';

export function useResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchResources = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setResources([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setResources(data || []);
    } catch (err) {
      console.error('[useResources] Error:', err);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();

    if (isSupabaseConfigured) {
      const channelId = `resources_feed_${Math.random().toString(36).substring(2)}`;
      let channel: any = null;

      try {
        channel = supabase
          .channel(channelId)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'resources' },
            () => {
              fetchResources();
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('[useResources] Realtime subscription handled:', err);
      }

      return () => {
        if (channel) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, []);

  const updateResourceStatus = async (resourceId: string, status: ResourceStatus, lat?: number, lng?: number) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === resourceId
          ? {
              ...r,
              status,
              latitude: lat ?? r.latitude,
              longitude: lng ?? r.longitude,
              last_updated: new Date().toISOString(),
            }
          : r
      )
    );

    if (!isSupabaseConfigured) return;

    try {
      const updatePayload: any = {
        status,
        last_updated: new Date().toISOString(),
      };
      if (lat !== undefined) updatePayload.latitude = lat;
      if (lng !== undefined) updatePayload.longitude = lng;

      const { error } = await supabase.from('resources').update(updatePayload).eq('id', resourceId);

      if (error) throw error;

      await supabase.from('resource_status_history').insert({
        resource_id: resourceId,
        status,
        latitude: lat,
        longitude: lng,
      });

      fetchResources();
    } catch (err) {
      console.error('[useResources] Error updating status:', err);
    }
  };

  return {
    resources,
    loading,
    refetch: fetchResources,
    updateResourceStatus,
  };
}
