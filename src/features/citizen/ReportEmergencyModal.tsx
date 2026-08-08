import React, { useState } from 'react';
import { AlertCircle, Mic, MicOff, Camera, MapPin, Send, CheckCircle2, ShieldAlert, X, AlertTriangle, ExternalLink, Radio } from 'lucide-react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useIncidents } from '../../hooks/useIncidents';
import { IncidentMap } from '../../components/map/IncidentMap';
import { EmergencyTransportManager } from '../../services/transport/EmergencyTransportManager';
import { MeshEmergencyReport } from '../../types/emergencyNetwork';

interface ReportEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportEmergencyModal: React.FC<ReportEmergencyModalProps> = ({ isOpen, onClose }) => {
  const { location, requestGPS, setManualCoords, updateAddressDetails } = useGeolocation();
  const { isListening, transcript, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const { createEmergencyReport } = useIncidents();

  const [categoryCode, setCategoryCode] = useState<string>('FLOOD');
  const [description, setDescription] = useState<string>('');
  const [affectedPeople, setAffectedPeople] = useState<number>(1);
  const [confirmedVoice, setConfirmedVoice] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showMapPicker, setShowMapPicker] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedMeshReport, setSubmittedMeshReport] = useState<MeshEmergencyReport | null>(null);
  const [submitResult, setSubmitResult] = useState<{ offline?: boolean; success?: boolean } | null>(null);

  if (!isOpen) return null;

  const categories = [
    { code: 'FLOOD', label: 'Flash Flood / Waterlogging', icon: '🌊' },
    { code: 'EARTHQUAKE', label: 'Earthquake / Collapse', icon: '🏗️' },
    { code: 'FIRE', label: 'Industrial / Chemical Fire', icon: '🔥' },
    { code: 'LANDSLIDE', label: 'Landslide / Mudslide', icon: '⛰️' },
    { code: 'MEDICAL', label: 'Mass Casualty Medical', icon: '🚑' },
    { code: 'CYCLONE', label: 'Severe Storm / Cyclone', icon: '🌪️' },
  ];

  const handleVoiceConfirm = () => {
    stopListening();
    setConfirmedVoice(transcript);
    if (!description) {
      setDescription(transcript);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const currentLat = location.latitude || 12.9716;
  const currentLng = location.longitude || 77.5946;
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${currentLat},${currentLng}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    // 1. Submit through store-and-forward mesh network manager
    const manager = EmergencyTransportManager.getInstance();
    const meshRes = await manager.submitEmergencyReport({
      categoryCode,
      description: description || confirmedVoice || `${categoryCode} Emergency reported`,
      voiceTranscript: confirmedVoice || undefined,
      affectedPeople,
      latitude: currentLat,
      longitude: currentLng,
      accuracy: location.accuracy || undefined,
      locationSource: location.location_source,
      landmark: location.landmark,
      village: location.village,
      district: location.district || 'District',
      state: location.state || 'State',
    });

    setSubmittedMeshReport(meshRes.report);

    // 2. Also pass payload to incident queue hook
    const result = await createEmergencyReport({
      category_code: categoryCode,
      description: description || confirmedVoice || `${categoryCode} Emergency reported`,
      voice_transcript: confirmedVoice || undefined,
      affected_people: affectedPeople,
      latitude: currentLat,
      longitude: currentLng,
      accuracy: location.accuracy || undefined,
      location_source: location.location_source,
      village: location.village,
      landmark: location.landmark,
      district: location.district || 'District',
      state: location.state || 'State',
      image_blob: imageFile || undefined,
    });

    setIsSubmitting(false);
    setSubmitResult(result);

    setTimeout(() => {
      onClose();
      setSubmitResult(null);
      setSubmittedMeshReport(null);
      setDescription('');
      setConfirmedVoice('');
      resetTranscript();
      setImageFile(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-red-900/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-600 border border-red-500 text-white shadow-lg shadow-red-950/80 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white uppercase tracking-tight">Report Emergency</h3>
            <p className="text-xs text-slate-400">Store-and-forward mesh network active. Never loses a pending report.</p>
          </div>
        </div>

        {submittedMeshReport && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" /> MESH PACKET CREATED
              </span>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-bold">
                {submittedMeshReport.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div>Packet ID: <b>{submittedMeshReport.report_id.slice(0, 12)}...</b></div>
              <div>Relay Path: <b className="text-purple-400">{submittedMeshReport.relay_path.join(' → ')}</b></div>
              <div>Forward Priority: <b className="text-red-400">{submittedMeshReport.priority}</b></div>
            </div>
          </div>
        )}

        {submitResult && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-3 ${
              submitResult.offline
                ? 'bg-amber-950 border border-amber-800 text-amber-300'
                : 'bg-emerald-950 border border-emerald-800 text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <div className="font-bold text-sm">
                {submitResult.offline ? 'REPORT SAVED IN LOCAL MESH QUEUE' : 'EMERGENCY REPORT TRANSMITTED'}
              </div>
              <p className="text-[11px] font-normal opacity-90">
                {submitResult.offline
                  ? 'Saved safely in IndexedDB. Multi-hop peer relay active.'
                  : 'Incident logged & dispatched to Command Center.'}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Category Selection */}
          <div>
            <label className="block text-slate-300 mb-1.5 font-bold uppercase tracking-wider text-[11px]">
              1. Incident Type *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  type="button"
                  key={cat.code}
                  onClick={() => setCategoryCode(cat.code)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    categoryCode === cat.code
                      ? 'bg-red-950/80 border-red-600 text-white font-bold shadow-md shadow-red-950/50'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[11px] leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 📍 GPS Location Engine */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" /> GPS Emergency Location:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={requestGPS}
                  className="text-[11px] text-cyan-400 hover:underline font-semibold"
                >
                  Re-scan GPS
                </button>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className="text-[11px] text-purple-400 hover:underline font-semibold"
                >
                  {showMapPicker ? 'Hide Map Picker' : 'Select on Map'}
                </button>
              </div>
            </div>

            {location.error && (
              <div className="text-[11px] text-amber-400 italic bg-amber-950/40 p-2 rounded border border-amber-900/60 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{location.error}</span>
              </div>
            )}

            <div className="text-[11px] font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span>Lat: <b>{currentLat.toFixed(5)}</b>, Lng: <b>{currentLng.toFixed(5)}</b></span>
                {location.accuracy && (
                  <span className="ml-2 text-cyan-400 font-bold">
                    (±{Math.round(location.accuracy)} m {location.accuracy > 100 ? '⚠️ Low Accuracy' : '✓ High Precision'})
                  </span>
                )}
              </div>
              <a
                href={gmapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline font-bold flex items-center gap-1 text-[10px]"
              >
                <ExternalLink className="w-3.5 h-3.5" /> VIEW ON GOOGLE MAPS
              </a>
            </div>

            {showMapPicker && (
              <div className="h-48 rounded-xl overflow-hidden border border-slate-800">
                <IncidentMap
                  center={[currentLat, currentLng]}
                  zoom={14}
                  interactiveSelectMode={true}
                  onLocationSelect={(coords) => setManualCoords(coords.latitude, coords.longitude)}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <input
                type="text"
                value={location.landmark}
                onChange={(e) => updateAddressDetails({ landmark: e.target.value })}
                placeholder="Landmark / Street Address *"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200"
              />
              <input
                type="text"
                value={location.village}
                onChange={(e) => updateAddressDetails({ village: e.target.value })}
                placeholder="Village / Ward / City"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-slate-200"
              />
            </div>
          </div>

          {/* 2. Details & Voice Report */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                2. Details & Voice Report (Optional)
              </label>
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition-all ${
                  isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-cyan-400" />}
                {isListening ? 'Stop Recording' : 'Speak Voice Report'}
              </button>
            </div>

            {isListening && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-red-300 text-xs animate-pulse">
                Listening... "{transcript || 'Say details aloud...'}"
              </div>
            )}

            {transcript && !isListening && (
              <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
                <span>Transcript: "{transcript}"</span>
                <button
                  type="button"
                  onClick={handleVoiceConfirm}
                  className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded text-[10px]"
                >
                  Use Transcript
                </button>
              </div>
            )}

            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe emergency situation, trapped victims, fire intensity..."
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* 3. Affected People & Photos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 mb-1 font-bold uppercase tracking-wider text-[10px]">
                Estimated Affected People *
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={affectedPeople}
                onChange={(e) => setAffectedPeople(Number(e.target.value))}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-bold uppercase tracking-wider text-[10px]">
                Upload Photo Evidence
              </label>
              <label className="flex items-center gap-1.5 p-2 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800 text-slate-300 text-[11px] truncate">
                <Camera className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">{imageFile ? imageFile.name : 'Choose Photo'}</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-red-950/80 flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Transmitting Emergency...' : 'TRANSMIT SOS REPORT NOW'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
