import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UserRole } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  role: UserRole;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  switchDemoRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('CITIZEN');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAuthenticated(true);
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsAuthenticated(true);
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setIsAuthenticated(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('[AuthHook] Profile fetch error:', error);
      }

      if (data) {
        setProfile(data as Profile);
        setRole(data.role as UserRole);
      } else {
        const fallbackProfile: Profile = {
          id: userId,
          full_name: user?.email?.split('@')[0] || 'DisasterX Citizen',
          role: 'CITIZEN',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(fallbackProfile);
      }
    } catch (e) {
      console.error('[AuthHook] Error in fetchUserProfile:', e);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    if (!isSupabaseConfigured) {
      setIsAuthenticated(true);
      setUser({ id: 'demo-user-id', email } as any);
      setProfile({
        id: 'demo-user-id',
        full_name: fullName || email.split('@')[0] || 'Authenticated User',
        role: role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return { error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone,
        },
      },
    });

    if (data.user && !error) {
      setIsAuthenticated(true);
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        role: 'CITIZEN',
        phone,
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setIsAuthenticated(true);
      setUser({ id: 'demo-user-id', email } as any);
      setProfile({
        id: 'demo-user-id',
        full_name: email.split('@')[0] || 'Authenticated User',
        role: role,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return { error: null };
    }

    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.session) {
      setIsAuthenticated(true);
    }
    return { error };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  const switchDemoRole = (newRole: UserRole) => {
    setRole(newRole);
    setIsAuthenticated(true);
    if (profile) {
      setProfile({ ...profile, role: newRole });
    } else {
      setProfile({
        id: 'demo-user-id',
        full_name: `Authenticated ${newRole}`,
        role: newRole,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        role,
        isAuthenticated,
        signUp,
        signIn,
        signOut,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
