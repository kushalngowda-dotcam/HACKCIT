import React, { useState } from 'react';
import { AlertTriangle, Radio, Send, X, ShieldAlert, Sparkles, Activity } from 'lucide-react';

interface SilentEmergencyBannerProps {
  onDispatchVerification?: () => void;
}

export const SilentEmergencyBanner: React.FC<SilentEmergencyBannerProps> = ({
  onDispatchVerification
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);

  if (isDismissed) return null;

  const handleDispatch = () => {
    setIsDispatched(true);
    if (onDispatchVerification) onDispatchVerification();
  };

  return (
    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 border-b-2 border-red-500/80 px-4 py-2.5 text-white font-sans shadow-lg animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        
        {/* Warning Icon & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-black tracking-widest uppercase">
                ⚠ POSSIBLE SILENT EMERGENCY
              </span>
              <span className="text-[10px] text-amber-300 font-mono font-bold">
                SIMULATED ANOMALY DETECTION
              </span>
            </div>
            <div className="font-bold text-sm text-white mt-0.5">
              Abnormal Telemetry Drop: Citizen Reports (-90%) & Traffic Activity (-80%) in Peenya Sector B
            </div>
          </div>
        </div>

        {/* Telemetry Drops & Action */}
        <div className="flex items-center space-x-4 shrink-0 font-mono">
          <div className="hidden lg:flex items-center space-x-3 text-[11px] text-slate-300">
            <span>Reports: <strong className="text-red-400">↓ 90%</strong></span>
            <span>Traffic: <strong className="text-amber-400">↓ 80%</strong></span>
            <span>Power: <strong className="text-red-400">OFFLINE</strong></span>
          </div>

          {!isDispatched ? (
            <button
              onClick={handleDispatch}
              className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-sans font-extrabold rounded-xl shadow-md transition-all text-xs flex items-center space-x-1.5 cursor-pointer active:scale-95 border border-red-300"
            >
              <Send className="w-3.5 h-3.5" />
              <span>DEPLOY VERIFICATION TEAM TO ZONE B</span>
            </button>
          ) : (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold">
              ✓ VERIFICATION TEAM DISPATCHED
            </span>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 text-slate-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
