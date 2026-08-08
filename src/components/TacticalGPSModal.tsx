import React, { useState, useEffect } from 'react';
import { Incident, Resource } from '../types';
import { X, Navigation, MapPin, ShieldCheck, Compass, AlertTriangle, CheckCircle2, Volume2 } from 'lucide-react';
import { DisasterMap } from './DisasterMap';
import { getCurrentGPSPosition, DEFAULT_COORDINATES } from '../utils/geolocation';

interface TacticalGPSModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: Resource | null;
  incident: Incident | null;
  onMarkArrived?: () => void;
  onSelectIncident?: (incident: Incident) => void;
}

export const TacticalGPSModal: React.FC<TacticalGPSModalProps> = ({
  isOpen,
  onClose,
  resource,
  incident,
  onMarkArrived,
  onSelectIncident
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [speed, setSpeed] = useState(45);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number }>({
    lat: DEFAULT_COORDINATES.lat,
    lng: DEFAULT_COORDINATES.lng
  });

  useEffect(() => {
    if (!isOpen) return;

    getCurrentGPSPosition().then(pos => {
      setUserPos(pos);
    }).catch(() => {
      // Keep default
    });

    const interval = setInterval(() => {
      setSpeed(prev => Math.floor(40 + Math.random() * 15));
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !incident) return null;

  // Calculate approximate distance in KM between userPos and incident
  const R = 6371; // Earth radius in KM
  const dLat = (incident.location.lat - userPos.lat) * Math.PI / 180;
  const dLng = (incident.location.lng - userPos.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(userPos.lat * Math.PI / 180) * Math.cos(incident.location.lat * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = (R * c).toFixed(1);

  const navigationSteps = [
    { instruction: `Proceed towards ${incident.location.address || incident.location.area}`, distance: `${distanceKm} km` },
    { instruction: `Follow emergency vehicle corridor`, distance: `${(parseFloat(distanceKm) * 0.6).toFixed(1)} km` },
    { instruction: `Merge onto response route near ${incident.location.area}`, distance: "300m" },
    { instruction: `ARRIVING: ${incident.title} site on left`, distance: "50m" },
  ];

  const handleSelect = (inc: Incident) => {
    if (onSelectIncident) {
      onSelectIncident(inc);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="eoc-card max-w-4xl w-full rounded-2xl border border-cyan-500/60 shadow-2xl p-6 relative m-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Tactical Field GPS Turn-By-Turn Navigation</h2>
              <p className="text-xs text-slate-400 font-mono">Live Dispatch Telemetry & Position Tracking</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400">TARGET INCIDENT</div>
            <div className="font-bold text-white mt-0.5 line-clamp-1">{incident.title}</div>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400">EST. DISTANCE</div>
            <div className="font-bold text-amber-400 text-sm mt-0.5">{distanceKm} KM</div>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400">VEHICLE SPEED</div>
            <div className="font-bold text-cyan-400 text-sm mt-0.5">{speed} KM/H</div>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400">ESTIMATED ETA</div>
            <div className="font-bold text-emerald-400 text-sm mt-0.5">
              {Math.max(1, Math.round((parseFloat(distanceKm) / speed) * 60))} MINS
            </div>
          </div>
        </div>

        {/* Turn Step Banner */}
        <div className="eoc-card-glow-cyan p-4 rounded-xl border border-cyan-500/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Compass className="w-8 h-8 text-cyan-400 animate-spin" />
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">NEXT MANEUVER</div>
              <div className="text-sm font-bold text-white">{navigationSteps[currentStepIndex].instruction}</div>
            </div>
          </div>
          <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold">
            {navigationSteps[currentStepIndex].distance}
          </span>
        </div>

        {/* Map Visualizer Container */}
        <div className="h-64 rounded-xl overflow-hidden border border-slate-800 relative">
          <DisasterMap
            incidents={[incident]}
            resources={resource ? [resource] : []}
            hospitals={[]}
            shelters={[]}
            blockages={[]}
            routes={[]}
            selectedIncident={incident}
            onSelectIncident={handleSelect}
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={() => setCurrentStepIndex(prev => (prev + 1) % navigationSteps.length)}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
          >
            Advance Next Turn Maneuver →
          </button>

          {onMarkArrived && (
            <button
              onClick={() => {
                onMarkArrived();
                onClose();
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>MARK ARRIVED ON SITE</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
