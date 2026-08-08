import React, { useState, useEffect } from 'react';
import {
  Hospital as HospitalIcon,
  Activity,
  Bed,
  AlertCircle,
  Save,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  CheckCircle2,
  PhoneCall,
  ShieldAlert,
  ExternalLink,
  MapPin,
  Clock,
  Edit3,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useHospitals } from '../../hooks/useHospitals';
import { useIncidents } from '../../hooks/useIncidents';
import { useMedicalRequests } from '../../hooks/useMedicalRequests';
import { useGeolocation } from '../../hooks/useGeolocation';
import { Badge } from '../../components/common/Badge';
import { generateGoogleMapsNavigationUrl } from '../../services/mapPlacesService';

export const HospitalDashboard: React.FC = () => {
  const { hospitalCapacities, saveHospitalProfile, updateHospitalCapacity, loading: hospLoading } = useHospitals();
  const { incidents } = useIncidents();
  const { medicalRequests, ambulances, registerAmbulance, updateMedicalRequestStatus, dispatchAmbulanceUnit } = useMedicalRequests();
  const { location, requestGPS } = useGeolocation();

  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [showAddAmbulanceModal, setShowAddAmbulanceModal] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const activeRecord = hospitalCapacities.find((h) => h.hospital_id === selectedHospitalId) || hospitalCapacities[0];

  // Hospital Basic Info Form State
  const [name, setName] = useState<string>(activeRecord?.hospital?.name || '');
  const [registrationId, setRegistrationId] = useState<string>(activeRecord?.hospital?.registration_id || 'REG-HOSP-2026');
  const [type, setType] = useState<string>(activeRecord?.hospital?.type || 'Speciality Hospital');
  const [contactPerson, setContactPerson] = useState<string>(activeRecord?.hospital?.contact_person || 'Dr. Medical Director');
  const [email, setEmail] = useState<string>(activeRecord?.hospital?.email || 'hospital@disasterx.gov.in');
  const [contactNumber, setContactNumber] = useState<string>(activeRecord?.hospital?.contact_number || '+91-80-26701150');
  const [address, setAddress] = useState<string>(activeRecord?.hospital?.address || 'Victoria Hospital Campus, Fort Road');
  const [area, setArea] = useState<string>(activeRecord?.hospital?.area || 'Kalasipalyam');
  const [city, setCity] = useState<string>(activeRecord?.hospital?.city || 'Bengaluru');
  const [district, setDistrict] = useState<string>(activeRecord?.hospital?.district || 'Bengaluru Urban');
  const [state, setState] = useState<string>(activeRecord?.hospital?.state || 'Karnataka');
  const [pinCode, setPinCode] = useState<string>(activeRecord?.hospital?.pin_code || '560002');

  // GPS Location State
  const [lat, setLat] = useState<number>(activeRecord?.hospital?.latitude || 12.9634);
  const [lng, setLng] = useState<number>(activeRecord?.hospital?.longitude || 77.5741);
  const [locationAccuracy, setLocationAccuracy] = useState<number>(activeRecord?.hospital?.accuracy || 8);

  // Bed & Capacity Management State
  const [totalBeds, setTotalBeds] = useState<number>(activeRecord?.total_beds || 250);
  const [availableBeds, setAvailableBeds] = useState<number>(activeRecord?.available_beds || 42);

  // ICU Capacity State
  const [totalIcuBeds, setTotalIcuBeds] = useState<number>(activeRecord?.total_icu_beds || 40);
  const [availableIcuBeds, setAvailableIcuBeds] = useState<number>(activeRecord?.available_icu_beds || 6);

  // Emergency Department Status
  const [emergencyStatus, setEmergencyStatus] = useState<'OPEN' | 'LIMITED' | 'FULL' | 'CLOSED'>(
    activeRecord?.emergency_status || 'OPEN'
  );
  const [emergencyLoad, setEmergencyLoad] = useState<number>(activeRecord?.emergency_load_pct || 75);

  // Hospital Operating Status
  const [operatingStatus, setOperatingStatus] = useState<'OPERATIONAL' | 'LIMITED' | 'FULL' | 'CLOSED'>(
    activeRecord?.hospital?.operating_status || 'OPERATIONAL'
  );

  // New Ambulance Form State
  const [newAmbCode, setNewAmbCode] = useState<string>('AMB-ALS-301');
  const [newAmbDriver, setNewAmbDriver] = useState<string>('Rajesh Kumar');
  const [newAmbPhone, setNewAmbPhone] = useState<string>('+91-9876543299');
  const [newAmbCap, setNewAmbCap] = useState<number>(2);

  // Sync Form State when activeRecord changes
  useEffect(() => {
    if (activeRecord) {
      if (activeRecord.hospital) {
        setName(activeRecord.hospital.name || '');
        setRegistrationId(activeRecord.hospital.registration_id || 'REG-HOSP-2026');
        setType(activeRecord.hospital.type || 'Speciality Hospital');
        setContactPerson(activeRecord.hospital.contact_person || 'Dr. Medical Director');
        setEmail(activeRecord.hospital.email || 'hospital@disasterx.gov.in');
        setContactNumber(activeRecord.hospital.contact_number || '+91-80-26701150');
        setAddress(activeRecord.hospital.address || 'Central Campus');
        setArea(activeRecord.hospital.area || 'Central District');
        setCity(activeRecord.hospital.city || 'Bengaluru');
        setDistrict(activeRecord.hospital.district || 'Bengaluru Urban');
        setState(activeRecord.hospital.state || 'Karnataka');
        setPinCode(activeRecord.hospital.pin_code || '560002');
        setLat(activeRecord.hospital.latitude || 12.9634);
        setLng(activeRecord.hospital.longitude || 77.5741);
        setOperatingStatus(activeRecord.hospital.operating_status || 'OPERATIONAL');
      }
      setTotalBeds(activeRecord.total_beds || 250);
      setAvailableBeds(activeRecord.available_beds || 42);
      setTotalIcuBeds(activeRecord.total_icu_beds || 40);
      setAvailableIcuBeds(activeRecord.available_icu_beds || 6);
      setEmergencyStatus(activeRecord.emergency_status || 'OPEN');
      setEmergencyLoad(activeRecord.emergency_load_pct || 75);
    }
  }, [activeRecord?.hospital_id]);

  // Use Browser Geolocation for Hospital Location
  const handleUseCurrentLocation = () => {
    requestGPS();
    if (location.latitude && location.longitude) {
      setLat(location.latitude);
      setLng(location.longitude);
      if (location.accuracy) setLocationAccuracy(location.accuracy);
      setToastMsg('📍 Hospital GPS location captured cleanly!');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const result = await saveHospitalProfile({
      hospital_id: activeRecord?.hospital_id,
      name,
      registration_id: registrationId,
      type,
      contact_person: contactPerson,
      email,
      contact_number: contactNumber,
      address,
      area,
      city,
      district,
      state,
      pin_code: pinCode,
      latitude: lat,
      longitude: lng,
      accuracy: locationAccuracy,
      location_source: 'GPS',
      operating_status: operatingStatus,
      total_beds: totalBeds,
      available_beds: Math.min(availableBeds, totalBeds),
      total_icu_beds: totalIcuBeds,
      available_icu_beds: Math.min(availableIcuBeds, totalIcuBeds),
      emergency_status: emergencyStatus,
      emergency_load_pct: emergencyLoad,
    });

    setIsSaving(false);
    setIsEditingProfile(false);
    setToastMsg('✓ Hospital profile & capacity metrics persisted cleanly in Supabase!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddAmbulance = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerAmbulance({
      code: newAmbCode,
      hospital_id: activeRecord?.hospital_id,
      hospital_name: name || activeRecord?.hospital?.name || 'Hospital Facility',
      driver_name: newAmbDriver,
      contact_phone: newAmbPhone,
      capacity: newAmbCap,
      latitude: lat,
      longitude: lng,
      status: 'AVAILABLE',
    });

    setShowAddAmbulanceModal(false);
    setToastMsg(`🚑 Ambulance unit "${newAmbCode}" registered in database!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAcceptRequest = async (reqId: string, title: string, patients: number) => {
    await updateMedicalRequestStatus(reqId, 'ACCEPTED');
    setAvailableBeds((prev) => Math.max(0, prev - 1));
    setToastMsg(`Medical Request Accepted for "${title}"! ${patients} Trauma Beds Reserved.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleDispatchAmbulance = async (reqId: string, ambId: string, title: string, incLat: number, incLng: number) => {
    await updateMedicalRequestStatus(reqId, 'AMBULANCE_DISPATCHED');
    await dispatchAmbulanceUnit(ambId, reqId, incLat, incLng);
    setAvailableBeds((prev) => Math.max(0, prev - 1));
    setToastMsg(`ALS Ambulance Dispatched to "${title}"! En Route to target coordinates.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Filter ONLY incidents dispatched to hospitals
  const dispatchedIncidents = incidents.filter(
    (i) => i.status === 'DISPATCHED' || i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED' || i.status === 'RESPONDER_EN_ROUTE'
  );

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const occupiedBeds = Math.max(0, totalBeds - availableBeds);
  const occupiedIcuBeds = Math.max(0, totalIcuBeds - availableIcuBeds);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
            <HospitalIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-100 uppercase tracking-tight">
              Hospital Resource & Capacity Console
            </h1>
            <p className="text-xs text-slate-400">Realtime Bed, ICU & Emergency Triage Load Management</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hospitalCapacities.length > 0 && (
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition-all"
            >
              <Edit3 className="w-4 h-4 text-cyan-400" />
              <span>{isEditingProfile ? 'Cancel Editing' : 'EDIT HOSPITAL PROFILE'}</span>
            </button>
          )}

          {hospitalCapacities.length > 0 && (
            <div className="flex items-center gap-2 text-xs bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-mono font-semibold">FACILITY:</span>
              <select
                value={selectedHospitalId || activeRecord?.hospital_id || ''}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-emerald-400 font-bold px-3 py-1 rounded-lg focus:outline-none focus:border-emerald-500"
              >
                {hospitalCapacities.map((item) => (
                  <option key={item.id} value={item.hospital_id}>
                    {item.hospital?.name || 'Hospital Facility'}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-3 shadow-xl animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. FIRST LOGIN / UNCONFIGURED HOSPITAL PROFILE SETUP SCREEN */}
      {hospitalCapacities.length === 0 || isEditingProfile ? (
        <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-800/60 shadow-2xl space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="p-3 rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-950/80">
              <HospitalIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white uppercase tracking-tight">
                {hospitalCapacities.length === 0 ? 'COMPLETE YOUR HOSPITAL PROFILE' : 'EDIT HOSPITAL PROFILE & CAPACITY'}
              </h2>
              <p className="text-xs text-slate-400">
                Register official facility details, exact GPS coordinates, bed/ICU metrics, and emergency status.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
            {/* Basic Info Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-2">
                <HospitalIcon className="w-4 h-4" /> 1. Hospital Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Hospital Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. District Central Trauma & Emergency Hospital"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Registration / Organization ID *</label>
                  <input
                    type="text"
                    required
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                    placeholder="e.g. REG-HOSP-Karnataka-2026"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Hospital Category Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
                  >
                    {[
                      'Government Hospital',
                      'Private Hospital',
                      'District Hospital',
                      'Community Health Centre',
                      'Primary Health Centre',
                      'Medical College Hospital',
                      'Speciality Hospital',
                      'Emergency Care Centre',
                      'Other',
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Contact Person Name</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Dr. K. N. Gowda (Medical Superintendent)"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Official Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hospital@disasterx.gov.in"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Emergency Contact Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91-80-26701150"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono font-bold"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street Address *"
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Area / Locality"
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                  />
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="District *"
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold"
                  />
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State *"
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* 📍 Location Section */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" /> 2. 📍 Exact Hospital GPS Location
                </h3>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 font-bold rounded-lg flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" /> USE MY CURRENT LOCATION
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500">Latitude:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full bg-transparent text-emerald-400 font-bold focus:outline-none"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-slate-500">Longitude:</span>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full bg-transparent text-emerald-400 font-bold focus:outline-none"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-500">Google Maps:</span>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-cyan-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> OPEN MAPS
                  </a>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Hospital location will be used for emergency routing and nearest-hospital matching.
              </p>
            </div>

            {/* 🏥 Bed & ICU Capacity Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                  <Bed className="w-4 h-4" /> 3. 🏥 Bed Capacity
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 rounded bg-slate-900">
                    <span className="text-[10px] text-slate-500 block">TOTAL</span>
                    <input
                      type="number"
                      min="1"
                      value={totalBeds}
                      onChange={(e) => setTotalBeds(Number(e.target.value))}
                      className="w-full text-center bg-transparent text-base font-extrabold text-slate-100"
                    />
                  </div>
                  <div className="p-2 rounded bg-slate-900">
                    <span className="text-[10px] text-slate-500 block">AVAILABLE</span>
                    <input
                      type="number"
                      min="0"
                      max={totalBeds}
                      value={availableBeds}
                      onChange={(e) => setAvailableBeds(Math.min(totalBeds, Number(e.target.value)))}
                      className="w-full text-center bg-transparent text-base font-extrabold text-emerald-400"
                    />
                  </div>
                  <div className="p-2 rounded bg-slate-900">
                    <span className="text-[10px] text-slate-500 block">OCCUPIED</span>
                    <div className="text-base font-extrabold text-amber-400 pt-1">{occupiedBeds}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> 4. 🫀 ICU Capacity
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2 rounded bg-slate-900">
                    <span className="text-[10px] text-slate-500 block">TOTAL ICU</span>
                    <input
                      type="number"
                      min="0"
                      value={totalIcuBeds}
                      onChange={(e) => setTotalIcuBeds(Number(e.target.value))}
                      className="w-full text-center bg-transparent text-base font-extrabold text-slate-100"
                    />
                  </div>
                  <div className="p-2 rounded bg-slate-900">
                    <span className="text-[10px] text-slate-500 block">FREE ICU</span>
                    <input
                      type="number"
                      min="0"
                      max={totalIcuBeds}
                      value={availableIcuBeds}
                      onChange={(e) => setAvailableIcuBeds(Math.min(totalIcuBeds, Number(e.target.value)))}
                      className="w-full text-center bg-transparent text-base font-extrabold text-cyan-400"
                    />
                  </div>
                  <div className="p-2 rounded bg-slate-900">
                    <span className="text-[10px] text-slate-500 block">OCCUPIED</span>
                    <div className="text-base font-extrabold text-purple-400 pt-1">{occupiedIcuBeds}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 🚨 Emergency Dept & Operating Status Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> 5. 🚨 Emergency Department Status
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {(['OPEN', 'LIMITED', 'FULL', 'CLOSED'] as const).map((st) => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setEmergencyStatus(st)}
                      className={`py-2 rounded-lg font-bold text-[11px] transition-all border ${
                        emergencyStatus === st
                          ? 'bg-amber-600 border-amber-400 text-white shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h3 className="text-xs font-mono uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-4 h-4" /> 6. 🟢 Hospital Operating Status
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { code: 'OPERATIONAL', label: 'OPERATIONAL' },
                    { code: 'LIMITED', label: 'LIMITED' },
                    { code: 'FULL', label: 'FULL' },
                    { code: 'CLOSED', label: 'CLOSED' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.code}
                      onClick={() => setOperatingStatus(item.code as any)}
                      className={`py-2 rounded-lg font-bold text-[10px] transition-all border ${
                        operatingStatus === item.code
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Action */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2 uppercase tracking-wide transition-all"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'PERSISTING PROFILE TO SUPABASE...' : 'SAVE HOSPITAL PROFILE & CAPACITY'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* 2. CONFIGURED HOSPITAL MANAGER DASHBOARD CONSOLE */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Hospital Overview, Map & Capacity Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hospital Overview Card */}
            <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-100">{activeRecord?.hospital?.name}</h2>
                    <Badge variant={operatingStatus === 'OPERATIONAL' ? 'LOW' : 'CRITICAL'}>
                      {operatingStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    ID: {activeRecord?.hospital?.registration_id || 'REG-HOSP-2026'} | Type: {activeRecord?.hospital?.type || 'Speciality Hospital'}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    <span>{activeRecord?.hospital?.address || 'Victoria Campus'}, {activeRecord?.hospital?.district}, {activeRecord?.hospital?.state}</span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow"
                  >
                    <ExternalLink className="w-4 h-4" /> OPEN IN GOOGLE MAPS
                  </a>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Last updated: {new Date(activeRecord?.last_updated || Date.now()).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Readiness Progress Gauges */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase text-slate-300 font-bold flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> ⚡ Hospital Readiness Matrix
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Free Beds</span>
                    <div className="text-2xl font-extrabold text-emerald-400">{availableBeds} / {totalBeds}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Free ICU</span>
                    <div className="text-2xl font-extrabold text-cyan-400">{availableIcuBeds} / {totalIcuBeds}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Emergency Dept</span>
                    <div className="text-lg font-extrabold text-amber-400">{emergencyStatus}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-slate-500 text-[10px] uppercase font-bold">Ambulances</span>
                    <div className="text-2xl font-extrabold text-purple-400">{ambulances.length} Active</div>
                  </div>
                </div>
              </div>

              {/* Interactive Bed & ICU Steppers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-emerald-400" /> Available General Beds
                    </span>
                    <span className="font-mono text-slate-400">Total: {totalBeds}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setAvailableBeds(Math.max(0, availableBeds - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-lg"
                    >
                      -
                    </button>
                    <span className="text-3xl font-extrabold text-emerald-400 font-mono">{availableBeds}</span>
                    <button
                      onClick={() => setAvailableBeds(Math.min(totalBeds, availableBeds + 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-cyan-400" /> Available ICU Beds
                    </span>
                    <span className="font-mono text-slate-400">Total: {totalIcuBeds}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setAvailableIcuBeds(Math.max(0, availableIcuBeds - 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-lg"
                    >
                      -
                    </button>
                    <span className="text-3xl font-extrabold text-cyan-400 font-mono">{availableIcuBeds}</span>
                    <button
                      onClick={() => setAvailableIcuBeds(Math.min(totalIcuBeds, availableIcuBeds + 1))}
                      className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-lg"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Save & Broadcast Button */}
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2 transition-all uppercase tracking-wide"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Broadcasting Updates...' : 'BROADCAST CAPACITY TO COMMAND CENTER'}</span>
              </button>
            </div>

            {/* Ambulance Fleet Management (+ ADD AMBULANCE) */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-cyan-400" /> 🚑 Hospital Ambulance Fleet ({ambulances.length})
                </h3>
                <button
                  onClick={() => setShowAddAmbulanceModal(true)}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow"
                >
                  <Plus className="w-4 h-4" /> + ADD AMBULANCE
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {ambulances.map((amb) => {
                  const ambNavUrl = generateGoogleMapsNavigationUrl(lat, lng, amb.latitude || lat, amb.longitude || lng);
                  return (
                    <div key={amb.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-100 flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-cyan-400" /> {amb.code}
                        </span>
                        <Badge variant={amb.status === 'AVAILABLE' ? 'LOW' : 'HIGH'}>{amb.status}</Badge>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono space-y-0.5">
                        <div>Driver: <b className="text-slate-200">{amb.driver_name || 'Assigned Driver'}</b></div>
                        <div>GPS: <b className="text-cyan-400">{amb.latitude?.toFixed(4)}, {amb.longitude?.toFixed(4)}</b></div>
                      </div>
                      <a
                        href={ambNavUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-bold pt-1"
                      >
                        <ExternalLink className="w-3 h-3" /> OPEN AMBULANCE GPS IN MAPS
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Incoming Medical Assistance Requests */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-red-400 animate-pulse" /> Medical Assistance Requests ({medicalRequests.length + dispatchedIncidents.length})
            </h2>

            {medicalRequests.length === 0 && dispatchedIncidents.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
                No active medical requests dispatched to this facility.
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {medicalRequests.map((req) => {
                  const navUrl = generateGoogleMapsNavigationUrl(lat, lng, req.latitude, req.longitude);
                  return (
                    <div key={req.id} className="p-4 rounded-xl bg-slate-900 border border-red-900/60 space-y-3 shadow-xl">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-extrabold text-sm text-slate-100">🚑 {req.incident_title || 'Emergency Medical Call'}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Requested by: {req.requested_by_name || 'Field Rescue Unit'}
                          </div>
                        </div>
                        <Badge variant={req.status === 'ACCEPTED' ? 'LOW' : 'CRITICAL'}>{req.status}</Badge>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
                        <div>Patients Count: <b className="text-red-400">{req.patients_count}</b></div>
                        <div>Critical ICU Needed: <b className="text-amber-400">{req.critical_patients}</b></div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <button
                          onClick={() => handleAcceptRequest(req.id, req.incident_title || 'Incident', req.patients_count)}
                          disabled={req.status === 'ACCEPTED' || req.status === 'AMBULANCE_DISPATCHED'}
                          className="py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-1 shadow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept Request
                        </button>
                        <button
                          onClick={() => handleDispatchAmbulance(req.id, ambulances[0]?.id || 'amb-1', req.incident_title || 'Incident', req.latitude, req.longitude)}
                          disabled={req.status === 'AMBULANCE_DISPATCHED'}
                          className="py-2 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-1 shadow"
                        >
                          <Truck className="w-3.5 h-3.5" /> Dispatch Ambulance
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-800 text-[11px]">
                        <a
                          href={navUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-cyan-400 font-bold rounded-lg flex items-center justify-center gap-1 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> OPEN GOOGLE MAPS NAVIGATION TO INCIDENT
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Ambulance */}
      {showAddAmbulanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-400" /> Register Hospital Ambulance Unit
            </h3>
            <form onSubmit={handleAddAmbulance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Ambulance Code / ID *</label>
                <input
                  type="text"
                  required
                  value={newAmbCode}
                  onChange={(e) => setNewAmbCode(e.target.value)}
                  placeholder="e.g. AMB-ALS-301"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Driver / Response Team</label>
                <input
                  type="text"
                  value={newAmbDriver}
                  onChange={(e) => setNewAmbDriver(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Contact Phone Number</label>
                <input
                  type="text"
                  value={newAmbPhone}
                  onChange={(e) => setNewAmbPhone(e.target.value)}
                  placeholder="+91-9876543299"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAmbulanceModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow"
                >
                  Register Ambulance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
