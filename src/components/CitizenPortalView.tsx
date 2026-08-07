import React, { useState } from 'react';
import { Incident, Hospital, Shelter, AlertNotification } from '../types';
import { AlertOctagon, MapPin, PhoneCall, ShieldCheck, Navigation, Camera, Sparkles, Send, CheckCircle2, Mic } from 'lucide-react';

interface CitizenPortalViewProps {
  incidents: Incident[];
  hospitals: Hospital[];
  shelters: Shelter[];
  alerts: AlertNotification[];
  onOpenReportModal: () => void;
  onOpenVoiceModal: () => void;
  onNavigateEvacuation?: () => void;
}

export const CitizenPortalView: React.FC<CitizenPortalViewProps> = ({
  incidents,
  hospitals,
  shelters,
  alerts,
  onOpenReportModal,
  onOpenVoiceModal,
  onNavigateEvacuation
}) => {
  const [sosSent, setSosSent] = useState(false);

  const handleTriggerSOS = () => {
    setSosSent(true);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070a10] p-4 max-w-md mx-auto space-y-5 font-sans">
      
      {/* Citizen Mobile Header */}
      <div className="text-center space-y-1 pt-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>CITIZEN EMERGENCY ASSIST PORTAL</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">DisasterX SOS & Safety</h1>
        <p className="text-xs text-slate-400">One-tap emergency beacon & verified shelter locator</p>
      </div>

      {/* ONE-TAP SOS BUTTON */}
      <div className="eoc-card p-6 rounded-3xl border border-red-500/40 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none"></div>

        {!sosSent ? (
          <button
            onClick={handleTriggerSOS}
            className="w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-red-600 via-red-500 to-amber-500 hover:scale-105 active:scale-95 text-white font-black text-2xl tracking-wider shadow-2xl shadow-red-600/50 flex flex-col items-center justify-center space-y-1 transition-all border-4 border-red-400/50 cursor-pointer"
          >
            <AlertOctagon className="w-10 h-10 animate-bounce" />
            <span>SOS</span>
            <span className="text-[9px] font-mono opacity-80">CLICK TO BROADCAST</span>
          </button>
        ) : (
          <div className="p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-emerald-300 space-y-2 font-mono text-xs animate-in fade-in">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <div className="font-bold text-sm">GPS SOS BEACON BROADCASTING</div>
            <div>Emergency units notified. Stay in a safe position!</div>
            <button
              onClick={() => setSosSent(false)}
              className="mt-2 px-3 py-1 bg-slate-800 text-slate-300 text-[10px] rounded-lg border border-slate-700 cursor-pointer"
            >
              Reset Beacon
            </button>
          </div>
        )}

        <p className="text-[11px] text-slate-400">
          Transmits your exact GPS coordinates directly to nearest emergency dispatch team.
        </p>
      </div>

      {/* FEATURE 5: Report by Voice & Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onOpenVoiceModal}
          className="eoc-card p-4 rounded-2xl border-2 border-red-500/50 hover:border-red-400 text-left space-y-2 transition-all group cursor-pointer bg-red-950/30"
        >
          <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md animate-pulse">
            <Mic className="w-4 h-4" />
          </div>
          <div className="font-bold text-xs text-white">Report by Voice</div>
          <div className="text-[10px] text-red-300 font-mono font-semibold">Speak & AI auto-parses</div>
        </button>

        <button
          onClick={onOpenReportModal}
          className="eoc-card p-4 rounded-2xl border border-slate-800 hover:border-cyan-500/40 text-left space-y-2 transition-all group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </div>
          <div className="font-bold text-xs text-white">Report Incident</div>
          <div className="text-[10px] text-slate-400">Upload photo/video evidence</div>
        </button>
      </div>

      {/* Nearest Shelters List */}
      <div className="eoc-card p-4 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="font-bold text-xs text-white flex items-center justify-between font-mono">
          <span>NEAREST SAFE SHELTERS</span>
          <span className="text-cyan-400">{shelters.length} OPEN</span>
        </h3>

        <div className="space-y-2 text-xs">
          {shelters.map(s => (
            <div key={s.id} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">{s.name}</div>
                <div className="text-[11px] text-slate-400">{s.location.address}</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                  Occupancy: {s.current_occupancy} / {s.capacity}
                </div>
              </div>
              <button
                onClick={onNavigateEvacuation}
                className="px-2.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
              >
                Navigate
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Safety Alerts */}
      <div className="eoc-card p-4 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="font-bold text-xs text-white font-mono">VERIFIED EMERGENCY ALERTS</h3>
        <div className="space-y-2 text-xs">
          {alerts.slice(0, 2).map(a => (
            <div key={a.id} className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 space-y-1">
              <div className="font-bold text-white text-[11px]">{a.title}</div>
              <div className="text-[10px] text-slate-300">{a.message}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
