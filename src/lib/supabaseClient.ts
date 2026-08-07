import { createClient } from '@supabase/supabase-js';

// Read optional Supabase URL and ANON Key from env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo-disasterx.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-anon-key-disasterx-ai-2026';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
});

// Real-time Event Emitter for Local Fallback State Synchronization
type Listener = (data: any) => void;
class RealtimeSyncEngine {
  private listeners: Map<string, Set<Listener>> = new Map();

  subscribe(channel: string, callback: Listener) {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, new Set());
    }
    this.listeners.get(channel)!.add(callback);

    return () => {
      this.listeners.get(channel)?.delete(callback);
    };
  }

  broadcast(channel: string, payload: any) {
    const channelListeners = this.listeners.get(channel);
    if (channelListeners) {
      channelListeners.forEach(cb => cb(payload));
    }
  }
}

export const realtimeSync = new RealtimeSyncEngine();
