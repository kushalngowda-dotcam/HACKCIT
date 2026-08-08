import React, { useState } from 'react';
import { Incident } from '../types';
import { generateTimelineForecast } from '../services/aiEngine';
import { Clock, Sparkles, AlertTriangle, TrendingUp, Users, Building2, ShieldCheck, Play, HelpCircle, Activity, Navigation, Truck } from 'lucide-react';
import { ExplainableAIModal } from './ExplainableAIModal';

interface TimelineViewProps {
  incidents: Incident[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ incidents }) => {
  const [selectedHours, setSelectedHours] = useState<number>(3); // +3 hours default
  const [showExplain, setShowExplain] = useState<boolean>(false);

  const forecast = generateTimelineForecast(incidents, selectedHours);

  const timeOptions = [
    { hours: 0, label: 'NOW' },
    { hours: 1, label: '+1 HOUR' },
    { hours: 3, label: '+3 HOURS' },
    { hours: 6, label: '+6 HOURS' },
    { hours: 12, label: '+12 HOURS' },
  ];

  // Calculations for all 6 required Future Vision parameters
  const baseImpact = incidents.reduce((sum, i) => sum + i.people_at_risk, 0);
  const roadAccessPercent = Math.max(20, Math.round(90 - selectedHours * 5.5));
  const evacuationDemand = Math.round(forecast.predicted_affected * 0.62);

  const whatChangedMap: Record<number, string> = {
    0: 'Baseline state: Active emergency response initiated across 5 emergency sectors.',
    1: 'Precipitation surge +15mm: Drainage channels overflowing, road accessibility down by 5%. Initial traffic gridlock forming near Whitefield.',
    3: 'Peak storm surge & chemical dispersion: Hospital bed pressure increased to 72.5%. Road accessibility down to 73%. High evacuation demand.',
    6: 'Max inundation depth: Severe infrastructure stress. Hospital bed pressure at 80%. Evacuation demand surging to 1,800+ citizens.',
    12: 'subsiding surge: Weather clearing, relief logistics teams opening secondary supply bypass corridors.'
  };

  const explainDetails = {
    title: `Future Vision Timeline Projection: T+${selectedHours} Hours`,
    target: `Predicted Affected Population: ${forecast.predicted_affected.toLocaleString()} | Hospital Pressure: ${forecast.hospital_occupancy_percent}%`,
    reasons: [
      `Hydrodynamic flood propagation model predicts rainfall depth and drainage overflow over ${selectedHours} hours.`,
      `Hospital bed capacity consumption computed from triage arrival rate (~28 trauma admissions/hour).`,
      `Road accessibility degradation factor computed at ${roadAccessPercent}% due to submergence & structural debris.`,
      `Evacuation demand estimated at ${evacuationDemand.toLocaleString()} citizens requiring transport routing.`
    ],
    data_considered: ['Doppler Radar Storm Vectors', 'Municipal Drainage Flow Telemetry', 'Hospital ICU Reserves', 'Transit Bus Fleet GPS'],
    confidence: 91,
    timestamp: new Date().toLocaleTimeString()
  };

  return (
    <div className="min-h-full bg-[#070a10] p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">

      {/* Header Banner */}
      <div className="eoc-card p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs">
          <Clock className="w-4 h-4" />
          <span>FUTURE VISION TIMELINE FORECASTER</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800">AI Future Vision Timeline</h1>
        <p className="text-xs text-slate-400 max-w-3xl">
          Drag or click the temporal slider to project environmental escalation, affected population, hospital pressure, and resource demand over a 12-hour operational horizon.
        </p>

        {/* FEATURE 3: Interactive Draggable / Clickable Timeline Stepper */}
        <div className="pt-4 space-y-2">
          <div className="flex justify-between items-center text-xs font-mono font-bold text-cyan-300">
            <span>TIMELINE HORIZON:</span>
            <span className="text-cyan-400 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/40 font-black text-sm">
              T+{selectedHours} HOURS
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 overflow-x-auto">
            {timeOptions.map(opt => (
              <button
                key={opt.hours}
                onClick={() => setSelectedHours(opt.hours)}
                className={`flex-1 min-w-[100px] py-3 rounded-xl font-mono text-xs font-bold transition-all border cursor-pointer ${selectedHours === opt.hours
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Range Slider for smooth dragging */}
          <input
            type="range"
            min="0"
            max="12"
            step="1"
            value={selectedHours}
            onChange={(e) => setSelectedHours(parseInt(e.target.value))}
            style={{ ['--fill' as string]: `${(selectedHours / 12) * 100}%` }}
            className="range-slider-cyan cursor-pointer"
          />
        </div>
      </div>

      {/* AI Scenario Forecast Output Dashboard */}
      <div className="eoc-card-glow-cyan p-6 rounded-2xl border border-cyan-500/40 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                Scenario Forecast: T+{selectedHours} Hours
              </h3>
              <p className="text-xs text-slate-400 font-mono">DisasterX Temporal Projection Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowExplain(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-1 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Why?</span>
            </button>

            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-xs font-bold self-start sm:self-auto">
              RISK: {forecast.riskLevel}
            </span>
          </div>
        </div>

        {/* Metric Projections Grid (All 6 required metrics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono">

          {/* 1. Affected Population */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Users className="w-4 h-4 text-amber-400" />
              <span>POTENTIAL AFFECTED POP</span>
            </div>
            <div className="text-2xl font-black text-white">
              {forecast.predicted_affected.toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-300">
              +{Math.round(((forecast.predicted_affected - baseImpact) / baseImpact) * 100)}% surge
            </div>
          </div>

          {/* 2. Hospital Pressure */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Building2 className="w-4 h-4 text-red-400" />
              <span>HOSPITAL PRESSURE</span>
            </div>
            <div className="text-2xl font-black text-white">
              {forecast.hospital_occupancy_percent}%
            </div>
            <div className="text-[11px] text-red-400">
              Trauma bed availability: {100 - forecast.hospital_occupancy_percent}% remaining
            </div>
          </div>

          {/* 3. Resource Demand */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>RESOURCE DEMAND</span>
            </div>
            <div className="text-base font-bold text-cyan-300 mt-1 line-clamp-1">
              {forecast.resource_deficit}
            </div>
            <div className="text-[11px] text-slate-400">
              Units dispatched: {forecast.hoursAhead >= 3 ? '+6 units needed' : 'Fleet balanced'}
            </div>
          </div>

          {/* 4. Road Accessibility */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>ROAD ACCESSIBILITY</span>
            </div>
            <div className="text-2xl font-black text-white">
              {roadAccessPercent}%
            </div>
            <div className="text-[11px] text-emerald-400">
              Primary bypass routes open
            </div>
          </div>

          {/* 5. Evacuation Demand */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <Navigation className="w-4 h-4 text-blue-400" />
              <span>EVACUATION DEMAND</span>
            </div>
            <div className="text-2xl font-black text-white">
              {evacuationDemand.toLocaleString()} <span className="text-xs text-slate-400 font-normal">citizens</span>
            </div>
            <div className="text-[11px] text-blue-300">
              Buses required: {Math.ceil(evacuationDemand / 50)} units
            </div>
          </div>

          {/* 6. Potential Escalation */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
            <div className="flex items-center space-x-2 text-slate-400 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>POTENTIAL ESCALATION</span>
            </div>
            <div className="text-sm font-bold text-amber-300 mt-1 line-clamp-2">
              {selectedHours >= 6 ? 'Secondary power grid failure risk downwind' : 'Moderate rainwater runoff accumulation'}
            </div>
          </div>

        </div>

        {/* Narrative Box: What Changed */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs leading-relaxed font-mono">
          <div className="text-cyan-400 font-bold flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>WHAT CHANGED AT T+{selectedHours} HOURS?</span>
          </div>
          <p className="text-slate-300">{whatChangedMap[selectedHours] || forecast.summary}</p>
        </div>

        {/* FEATURE 3 Mandatory Explicit Disclaimer Label */}
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs text-amber-200 flex items-center space-x-2 font-mono">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            ⚡ <strong>AI-generated scenario estimate</strong> — Scenario predictions are model estimates based on weather telemetry & disaster dynamics. Never presented as guaranteed real-world facts.
          </span>
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
