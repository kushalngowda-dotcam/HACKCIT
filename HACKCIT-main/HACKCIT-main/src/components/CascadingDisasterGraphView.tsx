import React, { useState } from 'react';
import { CascadeNode } from '../types';
import { Network, Sparkles, X, ArrowRight, ShieldCheck, HelpCircle, Activity, AlertTriangle, Layers } from 'lucide-react';
import { ExplainableAIModal } from './ExplainableAIModal';

export const CascadingDisasterGraphView: React.FC = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-3'); // Default Road Flooding
  const [showExplain, setShowExplain] = useState<boolean>(false);

  const nodes: CascadeNode[] = [
    {
      id: 'node-1',
      title: '180mm Torrential Heavy Rain',
      category: 'WEATHER',
      status: 'CRITICAL',
      impactDescription: 'Severe monsoonal cloudburst delivering 180mm rainfall in 3 hours.',
      downstreamEffects: ['River & Canal Overflow', 'Drainage Silt Clogging'],
      recommendedPrecaution: 'Issue early weather warning broadcast and activate municipal floodgates.',
      connectedNodeIds: ['node-2']
    },
    {
      id: 'node-2',
      title: 'Vrishabhavathi River Surge',
      category: 'HYDROLOGY',
      status: 'CRITICAL',
      impactDescription: 'River water level exceeded safety embankment threshold by +1.8 meters.',
      downstreamEffects: ['Low-Lying Road Flooding', 'Substation Submersion'],
      recommendedPrecaution: 'Deploy mobile water pumps near Indiranagar drainage basin.',
      connectedNodeIds: ['node-3']
    },
    {
      id: 'node-3',
      title: 'Outer Ring Road Submergence',
      category: 'INFRASTRUCTURE',
      status: 'CRITICAL',
      impactDescription: 'Arterial transit highway flooded under 4.5ft water depth.',
      downstreamEffects: ['Ambulance & Fire Dispatch Delays', 'Evacuation Corridor Bottleneck', 'Supply Delivery Disruption'],
      recommendedPrecaution: 'Pre-position emergency rescue motorboats and activate Indiranagar bypass.',
      connectedNodeIds: ['node-4']
    },
    {
      id: 'node-4',
      title: 'Ambulance Dispatch Delays (+11m)',
      category: 'TRANSPORT',
      status: 'WARNING',
      impactDescription: 'Rescue vehicles experienced severe transit slowdowns due to submerged underpass.',
      downstreamEffects: ['Elevated Triage Latency', 'Surge in Hospital Trauma Pressure'],
      recommendedPrecaution: 'Reroute all ALS ambulances via Residency Road elevated bypass.',
      connectedNodeIds: ['node-5']
    },
    {
      id: 'node-5',
      title: 'Victoria Hospital Bed Pressure (82%)',
      category: 'MEDICAL',
      status: 'WARNING',
      impactDescription: 'Trauma receiving unit approaching critical capacity threshold.',
      downstreamEffects: ['Delayed Emergency Surgery Admissions', 'Regional Evacuation Demand Surge'],
      recommendedPrecaution: 'Activate patient redistribution protocol to Bowring Health Hub.',
      connectedNodeIds: ['node-6']
    },
    {
      id: 'node-6',
      title: 'Regional Evacuation Surge (1,800 pax)',
      category: 'EVACUATION',
      status: 'ACTIVE',
      impactDescription: 'Mass population evacuation required from flooded tech corridor.',
      downstreamEffects: ['Shelter Occupancy Limit Reached'],
      recommendedPrecaution: 'Open Shelter B (Kanteerava Hub) for 2,500 evacuee capacity.',
      connectedNodeIds: []
    }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[2];

  const explainDetails = {
    title: `Cascading Disaster Graph Analysis: ${selectedNode.title}`,
    target: `Node Category: ${selectedNode.category} | Status: ${selectedNode.status}`,
    reasons: [
      `Hydrodynamic dependency model connected ${nodes.length} sequential vulnerability nodes.`,
      `Node impact: ${selectedNode.impactDescription}`,
      `Potential downstream cascade risks: ${selectedNode.downstreamEffects.join(' → ')}.`,
      `Preemptive mitigation directive: ${selectedNode.recommendedPrecaution}`
    ],
    data_considered: ['Topographic GIS Elevation Map', 'Submergence Sensors', 'Transit Velocity Telemetry', 'Hospital Bed Feed'],
    confidence: 96,
    timestamp: new Date().toLocaleTimeString()
  };

  return (
    <div className="min-h-full bg-[#070a10] p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="eoc-card p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs">
          <Network className="w-4 h-4" />
          <span>CASCADING DISASTER INTELLIGENCE GRAPH</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800">Cascading Disaster Dependency Graph</h1>
        <p className="text-xs text-slate-400 max-w-3xl">
          Visualizes how primary weather events trigger multi-tier systemic failures across hydrology, transit, hospital load, and evacuation surge. Click any node to inspect downstream impacts.
        </p>
      </div>

      {/* FEATURE 4: Visual Dependency Graph Flowchart */}
      <div className="eoc-card-glow-cyan p-6 rounded-2xl border border-cyan-500/40 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-white font-extrabold text-base">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>CASCADE PROPAGATION MAP (6 CONNECTED NODES)</span>
          </div>

          <button
            onClick={() => setShowExplain(true)}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-mono font-bold transition-all flex items-center space-x-1 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>Why?</span>
          </button>
        </div>

        {/* Visual Graph Stepper Nodes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 font-mono text-xs">
          {nodes.map((node, index) => {
            const isSelected = node.id === selectedNodeId;
            const isCritical = node.status === 'CRITICAL';

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20 scale-105'
                    : isCritical
                    ? 'bg-slate-900 border-red-500/50 text-slate-300 hover:border-red-400'
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-cyan-400 font-bold">NODE #0{index + 1}</span>
                    <span className={`px-1.5 py-0.2 rounded font-bold ${
                      isCritical ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {node.category}
                    </span>
                  </div>
                  <div className="font-bold text-xs leading-snug line-clamp-2 text-white">{node.title}</div>
                </div>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                  <span>Status: <strong className={isCritical ? 'text-red-400' : 'text-amber-400'}>{node.status}</strong></span>
                  {index < nodes.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-cyan-400 hidden lg:block" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Deep-Dive Panel (What is happening, Why it matters, Downstream effects, Precautions) */}
        <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold">
                NODE DEEP-DIVE INSPECTION
              </span>
              <h3 className="text-lg font-extrabold text-white mt-1">{selectedNode.title}</h3>
            </div>
            <span className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full font-mono text-xs font-bold">
              {selectedNode.status} STATUS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
            
            {/* WHAT IS HAPPENING & WHY DOES IT MATTER */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-cyan-300 font-mono text-xs flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>WHAT IS HAPPENING?</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{selectedNode.impactDescription}</p>

              <div className="pt-2 border-t border-slate-800">
                <div className="font-bold text-amber-300 font-mono text-xs">WHY DOES IT MATTER?</div>
                <p className="text-slate-400 mt-0.5">
                  Directly impedes field emergency response and triggers secondary domino effects across municipal health sectors.
                </p>
              </div>
            </div>

            {/* WHAT COULD IT AFFECT & WHAT CAN WE DO */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="font-bold text-red-400 font-mono text-xs flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span>WHAT COULD IT AFFECT? (DOWNSTREAM EFFECTS)</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                {selectedNode.downstreamEffects.map((eff, i) => (
                  <li key={i} className="flex items-center space-x-1.5">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{eff}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2 border-t border-slate-800">
                <div className="font-bold text-emerald-400 font-mono text-xs flex items-center space-x-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>WHAT CAN WE DO? (RECOMMENDED PRECAUTION)</span>
                </div>
                <p className="text-slate-200 font-semibold mt-0.5">{selectedNode.recommendedPrecaution}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Mandatory Explicit Disclaimer Label */}
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs text-amber-200 font-mono text-center">
          ⚡ <strong>AI cascade estimate</strong> — Graph dependency relationships model complex multi-tier disaster propagation.
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
