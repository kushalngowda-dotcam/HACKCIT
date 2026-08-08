import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';

export const supabaseEnabled = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null;

// Real-time Event Emitter for Local Fallback State Synchronization
type Listener = (payload: unknown) => void;
class RealtimeSyncEngine {
  private listeners: Map<string, Set<Listener>> = new Map();

  subscribe<T = unknown>(channel: string, callback: (payload: T) => void) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback as Listener);

    return () => {
      this.listeners.get(channel)?.delete(callback as Listener);
    };
  }

  broadcast<T = unknown>(channel: string, payload: T) {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.forEach(cb => cb(payload));
    }
  }
}

export const realtimeSync = new RealtimeSyncEngine();