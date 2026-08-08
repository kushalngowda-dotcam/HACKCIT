import React, { useState } from 'react';
import { CounterfactualOption } from '../types';
import { Sliders, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, HelpCircle, ArrowRight, Activity, Clock, Building2, Truck, Navigation } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ExplainableAIModal } from './ExplainableAIModal';

export const CounterfactualSimulatorView: React.FC = () => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('option-a');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [showExplain, setShowExplain] = useState<boolean>(false);

  const options: CounterfactualOption[] = [
    {
      id: 'option-a',
      title: 'OPTION A: Deploy Ambulance A12 Immediately to Incident #104',
      description: 'Dispatch nearest ALS unit A12 directly via Residency Road bypass.',
      estimatedArrivalMin: 6,
      hospitalPressurePercent: 64,
      resourceUtilizationPercent: 78,
      evacuationDemand: 240,
      secondaryImpact: 'Minimal delay to secondary non-critical callers.',
      isRecommended: true
    },
    {
      id: 'option-b',
      title: 'OPTION B: Keep Ambulance A12 Available on Standby for Zone B',
      description: 'Hold A12 at Koramangala base in anticipation of Outer Ring Road flood surge.',
      estimatedArrivalMin: 17,
      hospitalPressurePercent: 81,
      resourceUtilizationPercent: 42,
      evacuationDemand: 520,
      secondaryImpact: 'Delayed triage at Incident #104 causing +25% ICU pressure surge.',
      isRecommended: false
    },
    {
      id: 'option-c',
      title: 'OPTION C: Deploy Secondary Ambulance A15 from Yeshwanthpur',
      description: 'Route backup unit A15 via ORR bypass while maintaining A12 in central zone.',
      estimatedArrivalMin: 12,
      hospitalPressurePercent: 72,
      resourceUtilizationPercent: 88,
      evacuationDemand: 310,
      secondaryImpact: 'Moderate transit delay due to 12km transit distance.',
      isRecommended: false
    }
  ];

  const handleRunComparison = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 500);
  };

  const selectedOption = options.find(o => o.id === selectedOptionId) || options[0];

  const chartData = options.map(opt => ({
    name: opt.id === 'option-a' ? 'Option A (Deploy A12)' : opt.id === 'option-b' ? 'Option B (Hold Standby)' : 'Option C (Deploy A15)',
    'ETA (min)': opt.estimatedArrivalMin,
    'Hospital Load %': opt.hospitalPressurePercent,
    'Resource Util %': opt.resourceUtilizationPercent
  }));

  const explainDetails = {
    title: `Counterfactual Decision Analysis: What If We Chose Differently?`,
    target: `Comparing 3 Response Options for Emergency Directive #104`,
    reasons: [
      `Option A (Deploy A12) yields fastest arrival (6 min vs 17 min for Option B).`,
      `Option B (Hold Standby) increases hospital pressure from 64% to 81% due to delayed triage.`,
      `Option C (Deploy A15) adds +6 min transit latency due to distance.`,
      `AI-Assisted Conclusion: Option A balances immediate survivor rescue with manageable hospital load.`
    ],
    data_considered: ['GPS Routing Latency', 'Trauma Triage Inflow', 'District Bed Capacity', 'Flood Submergence Map'],
    confidence: 94,
    timestamp: new Date().toLocaleTimeString()
  };

  return (
    <div className="min-h-full bg-[#070a10] p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="eoc-card p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs">
          <Sliders className="w-4 h-4" />
          <span>COUNTERFACTUAL RESCUE SIMULATOR</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800">What If We Chose Differently?</h1>
        <p className="text-xs text-slate-400 max-w-3xl">
          Evaluate alternative tactical decisions side-by-side to compare arrival times, hospital pressure, and resource burnout before committing response forces.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Options Selector (5 cols) */}
        <div className="lg:col-span-5 eoc-card p-6 rounded-2xl border border-slate-800 space-y-5">
          <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3 flex items-center justify-between font-mono">
            <span>Tactical Decision Options</span>
            <span className="text-xs text-cyan-400">3 SCENARIOS</span>
          </h3>

          <div className="space-y-3">
            {options.map(opt => (
              <div
                key={opt.id}
                onClick={() => setSelectedOptionId(opt.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  selectedOptionId === opt.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs font-mono">{opt.title}</span>
                  {opt.isRecommended && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                      AI RECOMMENDED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-snug">{opt.description}</p>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1 text-slate-400 border-t border-slate-800/80">
                  <div>ETA: <strong className="text-cyan-300">{opt.estimatedArrivalMin}m</strong></div>
                  <div>Hosp: <strong className="text-amber-300">{opt.hospitalPressurePercent}%</strong></div>
                  <div>Util: <strong className="text-emerald-300">{opt.resourceUtilizationPercent}%</strong></div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleRunComparison}
            disabled={isSimulating}
            className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-xs font-mono transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>SIMULATING COUNTERFACTUAL OPTIONS...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-current" />
                <span>COMPARE COUNTERFACTUAL SCENARIOS</span>
              </>
            )}
          </button>
        </div>

        {/* Right Comparison Visualizer & Output (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Recharts Bar Comparison */}
          <div className="eoc-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-sm text-white font-mono flex items-center justify-between">
              <span>Counterfactual Metrics Comparison</span>
              <span className="text-xs text-cyan-400">Recharts Visualizer</span>
            </h4>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#0e1524', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  <Bar dataKey="ETA (min)" fill="#00f2fe" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Hospital Load %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Resource Util %" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI-ASSISTED COMPARISON SUMMARY CARD */}
          <div className="eoc-card p-5 rounded-2xl border border-cyan-500/40 space-y-3 font-sans">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-cyan-300 font-mono flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI-ASSISTED COMPARISON EVALUATION</span>
              </div>
              <button
                onClick={() => setShowExplain(true)}
                className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why?</span>
              </button>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm font-semibold text-white leading-relaxed font-sans">
              "Option A provides the fastest estimated medical response (6 min arrival) while maintaining acceptable resource coverage elsewhere. Option B risks elevating hospital pressure to 81%."
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
              <strong>Secondary Impact:</strong> {selectedOption.secondaryImpact}
            </div>
          </div>

          {/* Mandatory Disclaimer Label */}
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs text-amber-200 font-mono text-center">
            ⚡ <strong>AI-generated simulation estimate</strong> — Counterfactual scenario estimates predict hypothetical outcomes to aid decision-makers.
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
