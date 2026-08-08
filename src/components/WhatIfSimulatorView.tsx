import React, { useState } from 'react';
import { WhatIfParams, WhatIfResult } from '../types';
import { runWhatIfDisasterSimulation } from '../services/aiEngine';
import { Sliders, Sparkles, AlertTriangle, Activity, BarChart3, ShieldCheck, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const WhatIfSimulatorView: React.FC = () => {
  const [params, setParams] = useState<WhatIfParams>({
    rainfall_mm: 280,
    population_affected: 45000,
    road_accessibility_percent: 60,
    hospital_capacity_percent: 45,
    emergency_resources_percent: 70
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<WhatIfResult>(runWhatIfDisasterSimulation(params));

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setResult(runWhatIfDisasterSimulation(params));
      setIsSimulating(false);
    }, 600);
  };

  const chartData = [
    { metric: 'Affected Pop (x1k)', Baseline: 25, Projected: Math.round(result.expected_affected / 1000) },
    { metric: 'Hospital Load %', Baseline: 40, Projected: result.hospital_pressure_index },
    { metric: 'Evacuation Demand (x1k)', Baseline: 12, Projected: Math.round(result.evacuation_demand / 1000) },
    { metric: 'Resource Deficit %', Baseline: 20, Projected: result.resource_deficit_score },
  ];

  const radarData = [
    { subject: 'Rainfall', A: Math.round((params.rainfall_mm / 500) * 100) },
    { subject: 'Exposure', A: Math.round((params.population_affected / 100000) * 100) },
    { subject: 'Road Access', A: params.road_accessibility_percent },
    { subject: 'Hosp Cap', A: params.hospital_capacity_percent },
    { subject: 'Units Cap', A: params.emergency_resources_percent },
  ];

  return (
    <div className="min-h-full bg-[#070a10] p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="eoc-card p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs">
          <Sliders className="w-4 h-4" />
          <span>PREEMPTIVE MONTE CARLO STRESS TEST</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800">What-If Disaster Simulator</h1>
        <p className="text-xs text-slate-400 max-w-3xl">
          Adjust environmental parameters, weather extremes, road infrastructure damage, and hospital loads to trigger AI scenario simulations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Parameter Controls (5 cols) */}
        <div className="lg:col-span-5 eoc-card p-6 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Simulation Parameters</span>
            <span className="text-xs text-cyan-400 font-mono">5 VARIABLES</span>
          </h3>

          {/* Rainfall Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Rainfall Depth</span>
              <span className="text-cyan-400 font-bold">{params.rainfall_mm} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              value={params.rainfall_mm}
              onChange={(e) => setParams({ ...params, rainfall_mm: parseInt(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0mm (Dry)</span>
              <span>500mm (Extreme Flood)</span>
            </div>
          </div>

          {/* Population Affected Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Population Exposed</span>
              <span className="text-amber-400 font-bold">{params.population_affected.toLocaleString()} pax</span>
            </div>
            <input
              type="range"
              min="0"
              max="100000"
              step="1000"
              value={params.population_affected}
              onChange={(e) => setParams({ ...params, population_affected: parseInt(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Road Accessibility Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Road Accessibility</span>
              <span className="text-emerald-400 font-bold">{params.road_accessibility_percent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.road_accessibility_percent}
              onChange={(e) => setParams({ ...params, road_accessibility_percent: parseInt(e.target.value) })}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          {/* Hospital Capacity Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Hospital Bed Capacity</span>
              <span className="text-red-400 font-bold">{params.hospital_capacity_percent}% Available</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.hospital_capacity_percent}
              onChange={(e) => setParams({ ...params, hospital_capacity_percent: parseInt(e.target.value) })}
              className="w-full accent-red-400 cursor-pointer"
            />
          </div>

          {/* Emergency Resources Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300">Emergency Unit Readiness</span>
              <span className="text-cyan-300 font-bold">{params.emergency_resources_percent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={params.emergency_resources_percent}
              onChange={(e) => setParams({ ...params, emergency_resources_percent: parseInt(e.target.value) })}
              className="w-full accent-cyan-300 cursor-pointer"
            />
          </div>

          {/* Run CTA Button */}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center space-x-2"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>COMPUTING DISASTER SCENARIO...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>RUN AI SIMULATION</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Results & Charts (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="eoc-card p-4 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Est. Affected</div>
              <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
                {result.expected_affected.toLocaleString()}
              </div>
            </div>

            <div className="eoc-card p-4 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Hospital Pressure</div>
              <div className="text-xl font-black text-red-400 font-mono mt-0.5">
                {result.hospital_pressure_index}/100
              </div>
            </div>

            <div className="eoc-card p-4 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400 font-mono">Resource Deficit</div>
              <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">
                {result.resource_deficit_score}/100
              </div>
            </div>
          </div>

          {/* Recharts Bar Chart Comparison */}
          <div className="eoc-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-sm text-white font-mono flex items-center justify-between">
              <span>Baseline vs AI Projected Impact</span>
              <span className="text-xs text-slate-400">Recharts Visualization</span>
            </h4>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0e1524', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Bar dataKey="Baseline" fill="#334155" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Projected" fill="#00f2fe" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="eoc-card p-5 rounded-2xl border border-cyan-500/30 space-y-3 font-mono text-xs">
            <div className="font-bold text-cyan-300 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>RECOMMENDED PREEMPTIVE STRATEGY</span>
            </div>
            <ul className="space-y-1 text-slate-300">
              {result.recommended_preemptions.map((act, i) => (
                <li key={i}>• {act}</li>
              ))}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
