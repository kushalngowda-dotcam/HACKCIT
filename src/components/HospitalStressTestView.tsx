import React, { useState } from 'react';
import { Hospital } from '../types';
import { Building2, Sliders, Sparkles, AlertTriangle, ShieldCheck, RefreshCw, HelpCircle, ArrowRight, HeartPulse } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ExplainableAIModal } from './ExplainableAIModal';

interface HospitalStressTestViewProps {
  hospitals: Hospital[];
}

export const HospitalStressTestView: React.FC<HospitalStressTestViewProps> = ({ hospitals }) => {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(hospitals[0]?.id || 'hosp-1');
  const [additionalPatients, setAdditionalPatients] = useState<number>(350);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [showExplain, setShowExplain] = useState<boolean>(false);

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];

  // Simulation calculations
  const baselineOccupancy = selectedHospital.total_beds - selectedHospital.available_beds;
  const projectedLoad = baselineOccupancy + additionalPatients;
  const projectedCapacityPercent = Math.min(180, Math.round((projectedLoad / selectedHospital.total_beds) * 100));
  
  const overflowPatients = Math.max(0, projectedLoad - selectedHospital.total_beds);
  const icuPressure = Math.min(100, Math.round(70 + (additionalPatients / 10)));
  const ambulanceDemand = Math.ceil(additionalPatients / 25);

  const otherHospitals = hospitals.filter(h => h.id !== selectedHospital.id);
  const redirectTarget1 = otherHospitals[0];
  const redirectTarget2 = otherHospitals[1];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 500);
  };

  const chartData = [
    {
      metric: 'Occupied Beds',
      Baseline: baselineOccupancy,
      Projected: projectedLoad,
      TotalCapacity: selectedHospital.total_beds
    },
    {
      metric: 'ICU Demand',
      Baseline: selectedHospital.total_beds - selectedHospital.icu_available * 10,
      Projected: Math.round(selectedHospital.total_beds * (icuPressure / 100)),
      TotalCapacity: selectedHospital.total_beds
    }
  ];

  const explainDetails = {
    title: `Hospital Stress Test Simulation Analysis for ${selectedHospital.name}`,
    target: `Simulated Patient Surge: +${additionalPatients} arrivals | Projected Overload: ${projectedCapacityPercent}%`,
    reasons: [
      `Selected trauma center has ${selectedHospital.available_beds} free beds out of ${selectedHospital.total_beds} total beds.`,
      `Simulated influx of ${additionalPatients} patients creates a deficit of ${overflowPatients} emergency beds.`,
      `ICU pressure index projected to rise to ${icuPressure}%, exceeding safety margins.`,
      `AI recommendation: Reroute approximately ${Math.round(overflowPatients * 0.7)} incoming patients to ${redirectTarget1?.name || 'Secondary Hospital'} and ${Math.round(overflowPatients * 0.3)} to ${redirectTarget2?.name || 'Tertiary Center'}.`
    ],
    data_considered: ['Real-time Bed Sensors', 'Triage Category Ratios', 'Ambulance Convoy Vectors', 'Trauma Surgeon On-Call Logs'],
    confidence: 95,
    timestamp: new Date().toLocaleTimeString()
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-[#070a10] p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="eoc-card p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs">
          <HeartPulse className="w-4 h-4 text-red-500 animate-pulse" />
          <span>TRAUMA NETWORK CAPACITY SIMULATOR</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white">Hospital Stress Test Simulator</h1>
        <p className="text-xs text-slate-400 max-w-3xl">
          Simulate massive mass-casualty surge events to stress test regional trauma hospital bed capacity, ICU pressure, and ambulance diversion routing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Parameters Panel (5 cols) */}
        <div className="lg:col-span-5 eoc-card p-6 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span>Stress Test Controls</span>
            <span className="text-xs text-cyan-400 font-mono">PARAMETERS</span>
          </h3>

          {/* Hospital Selector */}
          <div className="space-y-1.5 font-mono text-xs">
            <label className="text-slate-300 font-bold block">TARGET RECEIVING HOSPITAL:</label>
            <select
              value={selectedHospitalId}
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-cyan-200 rounded-xl p-3 focus:ring-1 focus:ring-cyan-500 focus:outline-none font-sans font-semibold"
            >
              {hospitals.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.available_beds} beds free)
                </option>
              ))}
            </select>
          </div>

          {/* Additional Patient Slider */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-bold">Simulated Patient Arrivals:</span>
              <span className="text-red-400 font-black text-base">+{additionalPatients} Patients</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="25"
              value={additionalPatients}
              onChange={(e) => setAdditionalPatients(parseInt(e.target.value))}
              className="w-full accent-red-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>+50 (Minor Influx)</span>
              <span>+500 (Mass Casualty)</span>
              <span>+1000 (Catastrophic)</span>
            </div>
          </div>

          {/* Current Hospital Stats Card */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="text-cyan-400 font-bold">CURRENT HOSPITAL BASELINE</div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>Total Beds: <span className="font-bold text-white">{selectedHospital.total_beds}</span></div>
              <div>Available Beds: <span className="font-bold text-emerald-400">{selectedHospital.available_beds}</span></div>
              <div>ICU Beds Free: <span className="font-bold text-cyan-300">{selectedHospital.icu_available}</span></div>
              <div>Status: <span className="font-bold text-amber-400">{selectedHospital.status}</span></div>
            </div>
          </div>

          {/* Run Simulation CTA */}
          <button
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold rounded-xl text-sm transition-all shadow-xl shadow-red-500/20 flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>COMPUTING STRESS TEST SCENARIO...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>RUN HOSPITAL STRESS TEST</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Top Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="eoc-card p-3.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Current Capacity</div>
              <div className="text-lg font-black text-emerald-400 font-mono mt-0.5">
                {selectedHospital.available_beds} Beds
              </div>
            </div>

            <div className="eoc-card p-3.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Projected Load</div>
              <div className="text-lg font-black text-red-400 font-mono mt-0.5">
                {projectedCapacityPercent}%
              </div>
            </div>

            <div className="eoc-card p-3.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">ICU Pressure</div>
              <div className="text-lg font-black text-amber-400 font-mono mt-0.5">
                {icuPressure}%
              </div>
            </div>

            <div className="eoc-card p-3.5 rounded-xl border border-slate-800">
              <div className="text-[10px] text-slate-400 font-mono">Ambulances Needed</div>
              <div className="text-lg font-black text-cyan-400 font-mono mt-0.5">
                +{ambulanceDemand} Units
              </div>
            </div>
          </div>

          {/* Before / After Comparison Chart */}
          <div className="eoc-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-sm text-white font-mono flex items-center justify-between">
              <span>Before / After Patient Influx Comparison</span>
              <span className="text-xs text-cyan-400">Recharts Visualizer</span>
            </h4>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="metric" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0e1524', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Bar dataKey="Baseline" fill="#10b981" name="Baseline Occupancy" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Projected" fill="#ef4444" name="Projected Load (+Surge)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Recommendation Card */}
          <div className="eoc-card p-5 rounded-2xl border border-teal-500/40 space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-teal-400 font-mono flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span>AI REROUTING DIRECTIVE</span>
              </div>
              <button
                onClick={() => setShowExplain(true)}
                className="px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why?</span>
              </button>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-sm font-semibold text-white leading-relaxed">
              "Redirect approximately <span className="text-red-400 font-bold">{Math.round(overflowPatients * 0.7)} incoming patients</span> toward {redirectTarget1?.name || 'Hospital B'} and <span className="text-amber-400 font-bold">{Math.round(overflowPatients * 0.3)} patients</span> toward {redirectTarget2?.name || 'Hospital C'}."
            </div>

            <div className="text-xs font-mono text-slate-400 flex flex-wrap gap-2">
              <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                Fallback 1: {redirectTarget1?.name || 'Bowring Hub'} ({redirectTarget1?.available_beds || 42} free beds)
              </span>
              <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800">
                Fallback 2: {redirectTarget2?.name || 'Columbia Asia'} ({redirectTarget2?.available_beds || 24} free beds)
              </span>
            </div>
          </div>

          {/* Explicit AI Simulation Estimate Label */}
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs text-amber-200 font-mono text-center">
            ⚡ <strong>AI simulation estimate</strong> — Decision support for emergency health coordinators.
          </div>

        </div>

      </div>

      <ExplainableAIModal
        details={explainDetails}
        isOpen={showExplain}
        onClose={() => setShowExplain(false)}
      />
    </div>
  );
};
