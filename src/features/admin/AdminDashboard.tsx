import React, { useState, useEffect } from 'react';
import { Users, Shield, FileText, Settings, Activity, CheckCircle, Database, Radio, Send, MapPin, Layers, RefreshCw, FolderSearch, Trash2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Profile, AuditLog, UserRole, Incident } from '../../types/database';
import { useIncidents } from '../../hooks/useIncidents';
import { useResources } from '../../hooks/useResources';
import { useHospitals } from '../../hooks/useHospitals';
import { useMedicalRequests } from '../../hooks/useMedicalRequests';
import { clearOfflineStorage } from '../../lib/offlineQueue';
import { IncidentMap } from '../../components/map/IncidentMap';
import { DispatchIncidentModal } from '../commander/DispatchIncidentModal';
import { AdminRegistry } from './AdminRegistry';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminDashboard: React.FC = () => {
  const { incidents, reports, refetch, updateIncidentStatus } = useIncidents();
  const { resources, refetch: refetchResources } = useResources();
  const { hospitalCapacities, refetch: refetchHospitals } = useHospitals();
  const { ambulances, refetch: refetchMedical } = useMedicalRequests();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState<'INCIDENTS' | 'DIRECTORY' | 'USERS' | 'AUDIT'>('INCIDENTS');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | undefined>();
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setProfiles([]);
        setAuditLogs([]);
        setLoading(false);
        return;
      }

      const { data: profData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      const { data: logData } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);

      setProfiles(profData || []);
      setAuditLogs(logData || []);
    } catch (e) {
      console.error('[AdminDashboard] Error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRefreshAll = () => {
    fetchAdminData();
    refetch();
    refetchResources();
    refetchHospitals();
    refetchMedical();
  };

  const handleResetDatabaseData = async () => {
    if (!window.confirm('Are you sure you want to RESET ALL APPLICATION DATA? Schema, Auth policies, and Admin account will be preserved.')) return;

    await clearOfflineStorage();

    if (isSupabaseConfigured) {
      try {
        await supabase.from('incident_evidence').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('incident_status_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('incident_assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('medical_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('incidents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('incident_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('hospital_capacity').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('ambulances').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('hospitals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('resources').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (err) {
        console.warn('[AdminReset] Reset notice:', err);
      }
    }

    handleRefreshAll();
    alert('Application data reset cleanly! System is waiting for new real user registrations.');
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    if (!isSupabaseConfigured) return;
    try {
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      await supabase.from('audit_logs').insert({
        action: 'UPDATE_USER_ROLE',
        entity_type: 'PROFILES',
        entity_id: userId,
        metadata: { newRole },
      });
      fetchAdminData();
    } catch (e) {
      console.error('[AdminDashboard] Role update error:', e);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-100 uppercase">System Admin & Triage Console</h1>
            <p className="text-xs text-slate-400">Incident Triage, Master Registry Directory, Rescuer & Hospital Verification</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Buttons */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab('INCIDENTS')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'INCIDENTS' ? 'bg-red-600 text-white shadow-md shadow-red-950/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Emergency Triage ({incidents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('DIRECTORY')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'DIRECTORY' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderSearch className="w-3.5 h-3.5" />
              <span>🗂 REGISTRY ({resources.length + hospitalCapacities.length + ambulances.length + profiles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('USERS')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'USERS' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              User Roles ({profiles.length})
            </button>

            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'AUDIT' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Audit Log ({auditLogs.length})
            </button>
          </div>

          <button
            onClick={handleResetDatabaseData}
            title="Purge test records and reset data"
            className="p-2 bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 font-bold rounded-xl text-xs flex items-center gap-1 transition-all"
          >
            <Trash2 className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">RESET DATA</span>
          </button>
        </div>
      </div>

      {/* 1. MASTER REGISTRY DIRECTORY TAB */}
      {activeTab === 'DIRECTORY' && (
        <AdminRegistry
          profiles={profiles}
          resources={resources}
          hospitals={hospitalCapacities}
          ambulances={ambulances}
          onRefresh={handleRefreshAll}
        />
      )}

      {/* 2. EMERGENCY INCIDENTS & DISPATCH TRIAGE TAB */}
      {activeTab === 'INCIDENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" /> Emergency Reports ({incidents.length})
              </h2>
            </div>

            {incidents.length === 0 ? (
              <EmptyState title="No active incidents reported yet." message="Waiting for citizen emergency submissions." />
            ) : (
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {incidents.map((inc) => {
                  const isSelected = selectedIncidentId === inc.id || (!selectedIncidentId && inc.id === incidents[0]?.id);

                  return (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncidentId(inc.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-slate-800/90 border-cyan-500 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="font-bold text-sm text-slate-100 block">{inc.title}</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={inc.severity}>{inc.severity}</Badge>
                            <Badge variant="default">{inc.status}</Badge>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">{new Date(inc.created_at).toLocaleTimeString()}</span>
                      </div>

                      <p className="text-xs text-slate-300 flex items-center gap-1 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{inc.location_name || 'Emergency Target Location'}</span>
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                        <span className="text-slate-400 font-mono">Est. Affected: {inc.affected_count_est}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncidentId(inc.id);
                            setIsDispatchModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-[10px] flex items-center gap-1 shadow"
                        >
                          <Send className="w-3 h-3" /> Triage & Allocate
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            {selectedIncident && (
              <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-slate-100">{selectedIncident.title}</h2>
                      <Badge variant={selectedIncident.severity}>{selectedIncident.severity}</Badge>
                      <Badge variant="default">{selectedIncident.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-mono">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      <span>
                        Target Coordinates: {selectedIncident.latitude.toFixed(4)}, {selectedIncident.longitude.toFixed(4)} ({selectedIncident.location_name})
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => setIsDispatchModalOpen(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg shadow-purple-950/50"
                  >
                    <Send className="w-4 h-4" />
                    <span>ALLOCATE HOSPITAL & RESCUE</span>
                  </button>
                </div>
              </div>
            )}

            <div className="h-[440px]">
              <IncidentMap
                incidents={incidents}
                resources={resources}
                hospitals={hospitalCapacities}
                ambulances={ambulances}
                selectedIncidentId={selectedIncidentId}
                onSelectIncident={(inc) => setSelectedIncidentId(inc.id)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. USER ROLES TAB */}
      {activeTab === 'USERS' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" /> Authenticated System User Profiles ({profiles.length})
          </h2>

          {profiles.length === 0 ? (
            <EmptyState title="No registered users." message="Waiting for new user signups." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((p) => (
                <div key={p.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-100">{p.full_name || 'System User'}</span>
                    <Badge variant="default">{p.role}</Badge>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                    <div>Email: <b className="text-slate-200">{p.email}</b></div>
                    <div>Phone: <b className="text-slate-200">{p.phone_number || p.phone || 'N/A'}</b></div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-500 text-[10px]">Role Gating:</span>
                    <select
                      value={p.role}
                      onChange={(e) => updateUserRole(p.id, e.target.value as UserRole)}
                      className="bg-slate-950 border border-slate-700 text-purple-400 font-bold px-2 py-1 rounded-lg text-[11px]"
                    >
                      <option value="CITIZEN">CITIZEN</option>
                      <option value="RESPONDER">RESPONDER</option>
                      <option value="HOSPITAL">HOSPITAL</option>
                      <option value="COMMANDER">COMMANDER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. AUDIT LOG TAB */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" /> Operational Security Audit Stream ({auditLogs.length})
          </h2>

          {auditLogs.length === 0 ? (
            <EmptyState title="Audit stream is clean." message="No operational audit logs recorded yet." />
          ) : (
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono text-xs max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-purple-400 font-bold">[{log.action}]</span>{' '}
                    <span className="text-slate-300">{log.entity_type} ID: {log.entity_id}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">{new Date(log.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dispatch & Allocation Modal */}
      <DispatchIncidentModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        incident={selectedIncident}
        resources={resources}
        hospitals={hospitalCapacities}
        onDispatchSuccess={() => {
          refetch();
          fetchAdminData();
        }}
      />
    </div>
  );
};
