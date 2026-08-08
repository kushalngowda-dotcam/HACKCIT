import React, { useState, useEffect } from 'react';
import {
  Users,
  Hospital as HospitalIcon,
  Shield,
  Truck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  MapPin,
  ExternalLink,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Layers,
  RefreshCw,
  UserCheck,
  UserX,
  X
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Profile, Resource, HospitalCapacity, Ambulance, Incident } from '../../types/database';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { generateGoogleMapsNavigationUrl } from '../../services/mapPlacesService';

interface AdminRegistryProps {
  profiles: Profile[];
  resources: Resource[];
  hospitals: HospitalCapacity[];
  ambulances: Ambulance[];
  onRefresh: () => void;
}

export interface RegistryItem {
  id: string;
  category: 'CITIZEN' | 'HOSPITAL' | 'RESPONDER' | 'RESCUE_TEAM' | 'AMBULANCE';
  name: string;
  codeOrId: string;
  email?: string;
  phone?: string;
  address?: string;
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  locationSource?: string;
  lastLocationUpdate?: string;
  status: string;
  verificationStatus: 'VERIFIED' | 'PENDING' | 'REJECTED' | 'SUSPENDED';
  capacityInfo?: string;
  icuInfo?: string;
  detailsObj?: any;
}

export const AdminRegistry: React.FC<AdminRegistryProps> = ({
  profiles,
  resources,
  hospitals,
  ambulances,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'CITIZENS' | 'HOSPITALS' | 'RESPONDERS' | 'RESCUE_TEAMS' | 'AMBULANCES' | 'PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [verificationFilter, setVerificationFilter] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<RegistryItem | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Compile Unified Master Registry Array
  const citizenItems: RegistryItem[] = profiles
    .filter((p) => p.role === 'CITIZEN' || !p.role)
    .map((p) => ({
      id: p.id,
      category: 'CITIZEN',
      name: p.full_name || 'Registered Citizen',
      codeOrId: p.phone_number || p.id.slice(0, 8),
      email: p.email,
      phone: p.phone_number,
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      detailsObj: p,
    }));

  const hospitalItems: RegistryItem[] = hospitals.map((h) => ({
    id: h.hospital_id,
    category: 'HOSPITAL',
    name: h.hospital?.name || 'Emergency Hospital Facility',
    codeOrId: h.hospital?.registration_id || h.hospital_id.slice(0, 8),
    email: h.hospital?.email || 'hospital@disasterx.gov.in',
    phone: h.hospital?.contact_number,
    address: h.hospital?.address || `${h.hospital?.district}, ${h.hospital?.state}`,
    district: h.hospital?.district,
    state: h.hospital?.state,
    latitude: h.hospital?.latitude,
    longitude: h.hospital?.longitude,
    accuracy: h.hospital?.accuracy || 10,
    locationSource: h.hospital?.location_source || 'GPS',
    lastLocationUpdate: h.last_updated,
    status: h.hospital?.operating_status || 'OPERATIONAL',
    verificationStatus: (h.hospital?.verification_status as any) || 'VERIFIED',
    capacityInfo: `Beds: ${h.available_beds} / ${h.total_beds}`,
    icuInfo: `ICU: ${h.available_icu_beds} / ${h.total_icu_beds}`,
    detailsObj: h,
  }));

  const responderItems: RegistryItem[] = resources
    .filter((r) => r.code?.includes('UNIT') || r.code?.includes('RESP') || r.capacity <= 5)
    .map((r) => ({
      id: r.id,
      category: 'RESPONDER',
      name: r.name,
      codeOrId: r.code,
      phone: r.contact_phone,
      latitude: r.latitude,
      longitude: r.longitude,
      accuracy: 8,
      locationSource: 'GPS',
      lastLocationUpdate: r.last_updated,
      status: r.status,
      verificationStatus: 'VERIFIED',
      capacityInfo: `Capacity: ${r.capacity} pax`,
      detailsObj: r,
    }));

  const rescueTeamItems: RegistryItem[] = resources
    .filter((r) => r.code?.includes('FORCE') || r.code?.includes('TEAM') || r.capacity > 5)
    .map((r) => ({
      id: r.id,
      category: 'RESCUE_TEAM',
      name: r.name,
      codeOrId: r.code,
      phone: r.contact_phone,
      latitude: r.latitude,
      longitude: r.longitude,
      accuracy: 12,
      locationSource: 'GPS',
      lastLocationUpdate: r.last_updated,
      status: r.status,
      verificationStatus: 'VERIFIED',
      capacityInfo: `Team Size: ${r.capacity} personnel`,
      detailsObj: r,
    }));

  const ambulanceItems: RegistryItem[] = ambulances.map((a) => ({
    id: a.id,
    category: 'AMBULANCE',
    name: `Ambulance ${a.code}`,
    codeOrId: a.code,
    phone: a.contact_phone,
    address: a.hospital_name || 'Hospital Fleet Base',
    latitude: a.latitude,
    longitude: a.longitude,
    accuracy: 5,
    locationSource: 'GPS',
    lastLocationUpdate: a.last_updated,
    status: a.status,
    verificationStatus: 'VERIFIED',
    capacityInfo: `Cap: ${a.capacity} patients`,
    detailsObj: a,
  }));

  const allRegistryItems = [
    ...hospitalItems,
    ...responderItems,
    ...rescueTeamItems,
    ...ambulanceItems,
    ...citizenItems,
  ];

  const pendingItems = allRegistryItems.filter((i) => i.verificationStatus === 'PENDING');

  // Filter Registry Items
  const filteredItems = allRegistryItems.filter((item) => {
    // 1. Tab filter
    if (activeTab === 'CITIZENS' && item.category !== 'CITIZEN') return false;
    if (activeTab === 'HOSPITALS' && item.category !== 'HOSPITAL') return false;
    if (activeTab === 'RESPONDERS' && item.category !== 'RESPONDER') return false;
    if (activeTab === 'RESCUE_TEAMS' && item.category !== 'RESCUE_TEAM') return false;
    if (activeTab === 'AMBULANCES' && item.category !== 'AMBULANCE') return false;
    if (activeTab === 'PENDING' && item.verificationStatus !== 'PENDING') return false;

    // 2. Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCode = item.codeOrId.toLowerCase().includes(q);
      const matchEmail = item.email?.toLowerCase().includes(q) || false;
      const matchAddress = item.address?.toLowerCase().includes(q) || false;
      if (!matchName && !matchCode && !matchEmail && !matchAddress) return false;
    }

    // 3. Verification status filter
    if (verificationFilter !== 'ALL' && item.verificationStatus !== verificationFilter) return false;

    // 4. Operational status filter
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;

    return true;
  });

  // Admin Verification Actions
  const handleUpdateVerification = async (
    item: RegistryItem,
    newStatus: 'VERIFIED' | 'REJECTED' | 'SUSPENDED'
  ) => {
    if (isSupabaseConfigured) {
      const table = item.category === 'HOSPITAL' ? 'hospitals' : item.category === 'AMBULANCE' ? 'ambulances' : 'resources';

      await supabase
        .from(table)
        .update({ verification_status: newStatus })
        .eq('id', item.id);

      const { data: userData } = await supabase.auth.getUser();
      await supabase.from('audit_logs').insert({
        action: `RESOURCE_VERIFICATION_${newStatus}`,
        entity_type: table.toUpperCase(),
        entity_id: item.id,
        user_id: userData.user?.id || undefined,
        metadata: {
          resource_name: item.name,
          verification_status: newStatus,
          verified_at: new Date().toISOString(),
        },
      });
    }

    setActionSuccessMsg(`Updated ${item.name} status to ${newStatus}`);
    setSelectedItem(null);
    onRefresh();
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Resource Directory Counter Matrix */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-100 uppercase tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" /> Admin Resource & User Registry Directory
            </h2>
            <p className="text-xs text-slate-400">
              Authorized live overview of all registered citizens, hospitals, rescuers, rescue teams, and ambulances
            </p>
          </div>
          <button
            onClick={onRefresh}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" /> Refresh Registry Data
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Citizens</span>
            <div className="text-xl font-extrabold text-slate-200">{citizenItems.length}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Hospitals</span>
            <div className="text-xl font-extrabold text-emerald-400">{hospitalItems.length}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 text-[10px] uppercase font-bold font-bold">Responders</span>
            <div className="text-xl font-extrabold text-cyan-400">{responderItems.length}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Rescue Teams</span>
            <div className="text-xl font-extrabold text-purple-400">{rescueTeamItems.length}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
            <span className="text-slate-500 text-[10px] uppercase font-bold">Ambulances</span>
            <div className="text-xl font-extrabold text-blue-400">{ambulanceItems.length}</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/60 space-y-0.5">
            <span className="text-amber-400 text-[10px] uppercase font-bold">Pending Review</span>
            <div className="text-xl font-extrabold text-amber-400">{pendingItems.length}</div>
          </div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2 shadow-xl animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Category Tabs & Global Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 text-xs font-bold">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'ALL' ? 'bg-cyan-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              ALL ({allRegistryItems.length})
            </button>
            <button
              onClick={() => setActiveTab('CITIZENS')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'CITIZENS' ? 'bg-slate-700 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              CITIZENS ({citizenItems.length})
            </button>
            <button
              onClick={() => setActiveTab('HOSPITALS')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'HOSPITALS' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              HOSPITALS ({hospitalItems.length})
            </button>
            <button
              onClick={() => setActiveTab('RESPONDERS')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'RESPONDERS' ? 'bg-cyan-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              RESPONDERS ({responderItems.length})
            </button>
            <button
              onClick={() => setActiveTab('RESCUE_TEAMS')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'RESCUE_TEAMS' ? 'bg-purple-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              RESCUE TEAMS ({rescueTeamItems.length})
            </button>
            <button
              onClick={() => setActiveTab('AMBULANCES')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'AMBULANCES' ? 'bg-blue-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              AMBULANCES ({ambulanceItems.length})
            </button>
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                activeTab === 'PENDING' ? 'bg-amber-600 text-white shadow' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              PENDING ({pendingItems.length})
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users, hospitals, responders, rescue teams..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-slate-400 font-mono">Verification:</span>
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 font-bold px-2 py-1 rounded-lg focus:outline-none w-full"
            >
              <option value="ALL">ALL VERIFICATION</option>
              <option value="VERIFIED">VERIFIED ONLY</option>
              <option value="PENDING">PENDING REVIEW</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Activity className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-slate-400 font-mono">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 font-bold px-2 py-1 rounded-lg focus:outline-none w-full"
            >
              <option value="ALL">ALL STATUSES</option>
              <option value="OPERATIONAL">OPERATIONAL</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="EN_ROUTE">EN_ROUTE</option>
              <option value="UNAVAILABLE">UNAVAILABLE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registry Table List */}
      {filteredItems.length === 0 ? (
        <EmptyState
          title="No registered resources found."
          message="No records match your selected registry filters or search query."
        />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isHospital = item.category === 'HOSPITAL';
              const isAmbulance = item.category === 'AMBULANCE';
              const isResponder = item.category === 'RESPONDER' || item.category === 'RESCUE_TEAM';
              const isCitizen = item.category === 'CITIZEN';

              const itemGmapsUrl = item.latitude && item.longitude ? generateGoogleMapsNavigationUrl(item.latitude, item.longitude, item.latitude, item.longitude) : undefined;

              return (
                <div
                  key={`${item.category}-${item.id}`}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {isHospital ? '🏥' : isAmbulance ? '🚑' : isResponder ? '🚒' : '👤'}
                        </span>
                        <div>
                          <div className="font-extrabold text-sm text-slate-100 truncate">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {item.codeOrId}</div>
                        </div>
                      </div>
                      <Badge variant={item.verificationStatus === 'VERIFIED' ? 'LOW' : 'CRITICAL'}>
                        {item.verificationStatus}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-slate-300 font-mono space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      {item.phone && <div>Phone: <b className="text-slate-200">{item.phone}</b></div>}
                      {item.email && <div className="truncate">Email: <b className="text-slate-200">{item.email}</b></div>}
                      {item.address && <div className="truncate">Address: <b className="text-slate-400">{item.address}</b></div>}
                      {item.capacityInfo && <div className="text-emerald-400 font-bold">{item.capacityInfo}</div>}
                      {item.icuInfo && <div className="text-cyan-400 font-bold">{item.icuInfo}</div>}
                      {item.latitude && item.longitude && (
                        <div>GPS: <b className="text-cyan-400">{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</b></div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold rounded-lg"
                    >
                      View Full Profile Details
                    </button>

                    {itemGmapsUrl && (
                      <a
                        href={itemGmapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline font-bold flex items-center gap-1 text-[10px]"
                      >
                        <ExternalLink className="w-3 h-3" /> MAPS
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Item Profile Detail View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <span className="text-3xl">
                {selectedItem.category === 'HOSPITAL' ? '🏥' : selectedItem.category === 'AMBULANCE' ? '🚑' : '🚒'}
              </span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-100">{selectedItem.name}</h3>
                <p className="text-xs text-slate-400 font-mono">Category: {selectedItem.category} | Code: {selectedItem.codeOrId}</p>
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-slate-400 uppercase font-bold text-[10px]">Contact & Base Information</div>
                {selectedItem.email && <div>Email: <b className="text-slate-100">{selectedItem.email}</b></div>}
                {selectedItem.phone && <div>Contact Phone: <b className="text-slate-100">{selectedItem.phone}</b></div>}
                {selectedItem.address && <div>Base Address: <b className="text-slate-100">{selectedItem.address}</b></div>}
                <div>Operational Status: <b className="text-cyan-400">{selectedItem.status}</b></div>
              </div>

              {selectedItem.latitude && selectedItem.longitude && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 uppercase font-bold text-[10px]">📍 GPS Location Details</span>
                    <span className="text-emerald-400 font-bold">Source: {selectedItem.locationSource || 'GPS'}</span>
                  </div>
                  <div>Coordinates: <b className="text-cyan-400">{selectedItem.latitude.toFixed(5)}, {selectedItem.longitude.toFixed(5)}</b></div>
                  <div>Accuracy: <b>±{selectedItem.accuracy || 10} m</b></div>
                  <div className="pt-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedItem.latitude},${selectedItem.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> OPEN GOOGLE MAPS LOCATION
                    </a>
                  </div>
                </div>
              )}

              {/* Admin Verification Decision Buttons */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-slate-300 font-bold uppercase text-[10px] block">Admin Authorization Decision:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateVerification(selectedItem, 'VERIFIED')}
                    className="py-2 bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold rounded-lg flex items-center justify-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Verify
                  </button>
                  <button
                    onClick={() => handleUpdateVerification(selectedItem, 'REJECTED')}
                    className="py-2 bg-amber-950 border border-amber-800 text-amber-300 font-bold rounded-lg flex items-center justify-center gap-1"
                  >
                    <UserX className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button
                    onClick={() => handleUpdateVerification(selectedItem, 'SUSPENDED')}
                    className="py-2 bg-red-950 border border-red-800 text-red-300 font-bold rounded-lg flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Suspend
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
