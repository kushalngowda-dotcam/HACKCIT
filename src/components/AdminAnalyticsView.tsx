import React from 'react';
import { Incident, Resource, Hospital } from '../types';
import { BarChart3, TrendingUp, ShieldCheck, Clock, Users, Activity, Building2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface AdminAnalyticsViewProps {
  incidents: Incident[];
  resources: Resource[];
  hospitals: Hospital[];
}

export const AdminAnalyticsView: React.FC<AdminAnalyticsViewProps> = ({
  incidents,
  resources,
  hospitals
}) => {
  const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
  const highCount = incidents.filter(i => i.severity === 'HIGH').length;
  const mediumCount = incidents.filter(i => i.severity === 'MEDIUM').length;

  const severityPieData = [
    { name: 'Critical', value: criticalCount, color: '#ff3838' },
    { name: 'High', value: highCount, color: '#ff9f43' },
    { name: 'Medium', value: mediumCount, color: '#00f2fe' },
  ];

  const responseTimeTrend = [
    { time: '08:00', avgMinutes: 12.4 },
    { time: '10:00', avgMinutes: 9.8 },
    { time: '12:00', avgMinutes: 7.2 },
    { time: '14:00', avgMinutes: 6.4 },
    { time: '16:00', avgMinutes: 5.9 },
  ];

  const resourceUtilData = [
    { type: 'Ambulance', Deployed: 3, Available: 2 },
    { type: 'Rescue Team', Deployed: 4, Available: 1 },
    { type: 'Fire Engine', Deployed: 2, Available: 3 },
    { type: 'Rescue Boat', Deployed: 2, Available: 0 },
  ];

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070a10] p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="eoc-card p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs">
          <BarChart3 className="w-4 h-4" />
          <span>GOVERNMENT EXECUTIVE DIRECTIVE DASHBOARD</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Disaster Intelligence Analytics</h1>
        <p className="text-xs text-slate-400">
          Executive reporting on response performance, hospital bed pressure, fleet utilization, and regional risk indices.
        </p>
      </div>

      {/* Top Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="eoc-card p-5 rounded-2xl border border-red-500/30">
          <div className="text-xs font-mono text-slate-400 uppercase">Critical Threats</div>
          <div className="text-3xl font-black font-mono text-red-400 mt-1">{criticalCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Requiring USAR Response</div>
        </div>

        <div className="eoc-card p-5 rounded-2xl border border-amber-500/30">
          <div className="text-xs font-mono text-slate-400 uppercase">Total Citizens at Risk</div>
          <div className="text-3xl font-black font-mono text-amber-300 mt-1">
            {incidents.reduce((s, i) => s + i.people_at_risk, 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Targeted for evacuation</div>
        </div>

        <div className="eoc-card p-5 rounded-2xl border border-cyan-500/30">
          <div className="text-xs font-mono text-slate-400 uppercase">Avg Fleet Response Time</div>
          <div className="text-3xl font-black font-mono text-cyan-400 mt-1">6.4 MIN</div>
          <div className="text-[11px] text-emerald-400 mt-1">↓ 32% faster with AI routing</div>
        </div>

        <div className="eoc-card p-5 rounded-2xl border border-emerald-500/30">
          <div className="text-xs font-mono text-slate-400 uppercase">Trauma Bed Capacity</div>
          <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
            {hospitals.reduce((s, h) => s + h.available_beds, 0)} Beds
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Across 4 regional hubs</div>
        </div>
      </div>

      {/* Recharts Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Response Time Trend AreaChart (8 cols) */}
        <div className="lg:col-span-8 eoc-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-bold text-sm text-white font-mono flex items-center justify-between">
            <span>Response Time Trend (Minutes)</span>
            <span className="text-xs text-cyan-400">AI Routing Active</span>
          </h3>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={responseTimeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0e1524', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="avgMinutes" stroke="#00f2fe" fill="#00f2fe20" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity PieChart (4 cols) */}
        <div className="lg:col-span-4 eoc-card p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <h3 className="font-bold text-sm text-white font-mono">Incidents by Severity</h3>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={severityPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={5}>
                  {severityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0e1524', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-1 text-center font-mono text-xs border-t border-slate-800 pt-3">
            <div>
              <div className="text-red-400 font-bold">{criticalCount}</div>
              <div className="text-[10px] text-slate-400">Critical</div>
            </div>
            <div>
              <div className="text-amber-400 font-bold">{highCount}</div>
              <div className="text-[10px] text-slate-400">High</div>
            </div>
            <div>
              <div className="text-cyan-400 font-bold">{mediumCount}</div>
              <div className="text-[10px] text-slate-400">Medium</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
