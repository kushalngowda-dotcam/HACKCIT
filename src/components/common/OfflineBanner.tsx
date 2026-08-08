import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload, Database, Radio, RadioTower, AlertTriangle } from 'lucide-react';
import { EmergencyTransportManager } from '../../services/transport/EmergencyTransportManager';
import { NetworkConnectionStatus, MeshEmergencyReport } from '../../types/emergencyNetwork';

export const OfflineBanner: React.FC = () => {
  const [status, setStatus] = useState<NetworkConnectionStatus>('ONLINE');
  const [activePacket, setActivePacket] = useState<MeshEmergencyReport | undefined>();
  const [queuedReportsCount, setQueuedReportsCount] = useState<number>(0);

  useEffect(() => {
    const manager = EmergencyTransportManager.getInstance();

    manager.onStatusChange((newStatus, packet) => {
      setStatus(newStatus);
      if (packet) setActivePacket(packet);
    });

    const updateCount = async () => {
      const reports = await manager.getStoredMeshReports();
      const pending = reports.filter((r) => r.status !== 'DELIVERED');
      setQueuedReportsCount(pending.length);
    };

    updateCount();
    const interval = setInterval(updateCount, 3000);

    return () => clearInterval(interval);
  }, []);

  if (status === 'ONLINE' && queuedReportsCount === 0) {
    return null; // Clean state when fully online with zero pending items
  }

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg z-[999]">
      <div className="flex items-center gap-2 font-mono">
        {status === 'ONLINE' && (
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>🟢 ONLINE — Connected to emergency server</span>
          </div>
        )}

        {status === 'OFFLINE' && (
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span>🔴 OFFLINE — Internet unavailable. Your report is stored safely in IndexedDB ({queuedReportsCount} queued).</span>
          </div>
        )}

        {status === 'SEARCHING_RELAY' && (
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <RadioTower className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>🟠 SEARCHING FOR RELAY — Searching for nearby emergency devices...</span>
          </div>
        )}

        {status === 'FORWARDING' && (
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <Radio className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span>
              🔵 FORWARDING — Forwarding emergency report through {activePacket?.relay_path.slice(-1)[0] || 'nearby relay'}...
            </span>
          </div>
        )}

        {status === 'DELIVERED' && (
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>🟢 DELIVERED — Emergency report successfully delivered to emergency server.</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
        <span>Store-and-Forward Mesh Queue: <b>{queuedReportsCount} pending</b></span>
      </div>
    </div>
  );
};
