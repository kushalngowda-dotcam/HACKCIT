import React, { useState } from 'react';
import { getAgentSimulations } from '../services/aiEngine';
import { Incident, Resource, AgentState } from '../types';
import { Cpu, Sparkles, CheckCircle2, RefreshCw, ShieldCheck, Play, ArrowDown, HelpCircle, AlertTriangle } from 'lucide-react';
import { ExplainableAIModal } from './ExplainableAIModal';

interface MultiAgentViewProps {
  incidents?: Incident[];
  resources?: Resource[];
}

export const MultiAgentView: React.FC<MultiAgentViewProps> = ({ incidents = [], resources = [] }) => {
  const [agents, setAgents] = useState<AgentState[]>(getAgentSimulations(incidents, resources));
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isConflictDemoActive, setIsConflictDemoActive] = useState<boolean>(false);
  const [showExplain, setShowExplain] = useState<boolean>(false);

  const handleRunAgentSimulation = () => {
    setIsRunning(true);

    const reset = agents.map(a => ({
      ...a,
      status: 'ANALYZING' as const,
      thinking_log: ['Querying real-time DB telemetry stream...']
    }));
    setAgents(reset);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= agents.length) {
        clearInterval(interval);
        setAgents(getAgentSimulations(incidents, resources));
        setIsRunning(false);
      } else {
        setAgents(prev => prev.map((ag, idx) => {
          if (idx <= step) {
            return { ...ag, status: 'RECOMMENDATION_READY' };
          }
          return ag;
        }));
      }
    }, 600);
  };

  const handleTriggerConflictDemo = () => {
    setIsConflictDemoActive(true);
    setAgents([
      {
        id: 'agent-med',
        name: 'Medical Operations Agent',
        role: 'Hospital Capacity & Triage Analysis',
        avatar: '🏥',
        status: 'RECOMMENDATION_READY',
        thinking_log: [
          'Critical victim trauma detected at Zone A (MG Road)...',
          'Evaluating nearest trauma unit (Ambulance A12)...',
          'Issuing priority medical dispatch directive...'
        ],
        recommendation: 'Deploy Ambulance A12 to Zone A immediately for mass casualty triage.',
        confidence: 96,
        has_conflict: true,
        conflicting_agent_id: 'agent-log'
      },
      {
        id: 'agent-res',
        name: 'Search & Rescue Agent',
        role: 'Heavy Machinery & Unit Deployment',
        avatar: '🚒',
        status: 'RECOMMENDATION_READY',
        thinking_log: [
          'Analyzing concrete structural load limits at Zone A...',
          'Deploying USAR-BRAVO-1 heavy hydraulic breaching squad...',
          'Checking standby boat readiness...'
        ],
        recommendation: 'Deploy heavy hydraulic breaching team immediately to Zone A East Wall.',
        confidence: 94
      },
      {
        id: 'agent-log',
        name: 'Logistics & Supply Agent',
        role: 'Rations, Power & Fleet Allocation',
        avatar: '📦',
        status: 'RECOMMENDATION_READY',
        thinking_log: [
          'Evaluating regional unit reserves for Zone B (Whitefield)...',
          'Attempting to hold fleet units on standby...',
          'Issuing resource reservation directive...'
        ],
        recommendation: 'Keep Ambulance A12 available for Zone B flood evacuation surge.',
        confidence: 91,
        has_conflict: true,
        conflicting_agent_id: 'agent-med'
      },
      {
        id: 'agent-eva',
        name: 'Evacuation & Traffic Agent',
        role: 'Route Safety & Perimeter Control',
        avatar: '🚗',
        status: 'RECOMMENDATION_READY',
        thinking_log: [
          'Checking ORR flood submergence sensors...',
          'Routing bypass buses along North Evacuation Corridor...',
          'Enforcing traffic isolation boundary...'
        ],
        recommendation: 'Activate North Evacuation Bypass Route 1. Enforce total traffic blockade on ORR.',
        confidence: 95
      },
      {
        id: 'agent-coo',
        name: 'Chief AI Coordinator Agent',
        role: 'Conflict Resolution & Joint Response Plan',
        avatar: '🎖️',
        status: 'RECOMMENDATION_READY',
        thinking_log: [
          'CONFLICT DETECTED: Medical Agent vs Logistics Agent regarding Ambulance A12.',
          'Analyzing priority trade-offs: Zone A immediate life risk vs Zone B reserve allocation...',
          'Resolving conflict: Directing Ambulance A12 to Zone A; assigning standby Ambulance B4 to Zone B.'
        ],
        recommendation: 'Deploy Ambulance A12 to Zone A because immediate medical demand is higher and Zone B has an alternative resource.',
        confidence: 98
      }
    ]);
  };

  const coordinatorAgent = agents.find(a => a.id === 'agent-coo') || agents[4];
  const medAgent = agents.find(a => a.id === 'agent-med');
  const resAgent = agents.find(a => a.id === 'agent-res');
  const logAgent = agents.find(a => a.id === 'agent-log');
  const evaAgent = agents.find(a => a.id === 'agent-eva');

  const explainDetails = {
    title: `Multi-Agent Conflict Resolution Audit: Directive #402`,
    target: `Resolved Conflict: Medical Agent (Zone A Dispatch) vs Logistics Agent (Zone B Reservation)`,
    reasons: [
      `Medical Agent prioritized Zone A due to 86 citizens trapped under collapsed structural beam.`,
      `Logistics Agent proposed holding Ambulance A12 for potential flood surge in Zone B.`,
      `Chief Coordinator Agent analyzed priority metrics (Zone A Priority 96/100 vs Zone B Priority 84/100).`,
      `Resolution Directive: Deployed Ambulance A12 to Zone A while assigning secondary reserve Ambulance B4 to Zone B, achieving 100% incident coverage.`
    ],
    data_considered: ['Agent Conflict Vector Matrix', 'Triage Inflow Rate', 'Zone Priority Scores', 'Secondary Fleet Proximity'],
    confidence: 98,
    timestamp: new Date().toLocaleTimeString()
  };

  return (
    <div className="min-h-full bg-[#070a10] p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 eoc-card p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs mb-1">
            <Cpu className="w-4 h-4" />
            <span>AUTONOMOUS MULTI-AGENT SWARM COORD</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800">AI Agent Conflict Resolution</h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Specialized logical AI agents (Medical, Search & Rescue, Logistics, Evacuation) operate in parallel. When recommendations collide, the Chief Coordinator Agent analyzes trade-offs and resolves resource conflicts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* FEATURE 9: Trigger Conflicting Recommendation Demo Button */}
          <button
            onClick={handleTriggerConflictDemo}
            className="px-4 py-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/50 font-bold rounded-xl text-xs font-mono transition-all flex items-center space-x-1.5 cursor-pointer shadow-lg active:scale-95"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            <span>DEMO CONFLICT SCENARIO</span>
          </button>

          <button
            onClick={handleRunAgentSimulation}
            disabled={isRunning}
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-xs font-mono transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer active:scale-95"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>RUNNING AGENT SWARM...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>RUN SWARM SIMULATION</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* FEATURE 9: Visually Demonstrating Multi-Agent Coordination Flowchart */}
      <div className="eoc-card p-5 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-cyan-300 font-mono border-b border-slate-800 pb-2">
          AGENT DISCUSSION & AGGREGATION FLOWCHART
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center font-mono text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xl">🏥</div>
            <div className="font-bold text-white">Medical Agent</div>
            <div className="text-[10px] text-slate-400">Zone A Priority</div>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xl">🚒</div>
            <div className="font-bold text-white">Rescue Agent</div>
            <div className="text-[10px] text-slate-400">Breaching USAR</div>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xl">📦</div>
            <div className="font-bold text-white">Logistics Agent</div>
            <div className="text-[10px] text-slate-400">Zone B Reserve</div>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <div className="text-xl">🚗</div>
            <div className="font-bold text-white">Evacuation Agent</div>
            <div className="text-[10px] text-slate-400">North Bypass</div>
          </div>
        </div>

        <div className="flex justify-center text-cyan-400 py-1">
          <ArrowDown className="w-6 h-6 animate-bounce" />
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/40 text-center font-mono text-xs text-cyan-300">
          CHIEF COORDINATOR AGENT CONFLICT RESOLUTION SYNTHESIS PROTOCOL
        </div>
      </div>

      {/* Specialist Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.filter(a => a.id !== 'agent-coo').map((agent) => {
          const isReady = agent.status === 'RECOMMENDATION_READY';
          const isConflicted = agent.has_conflict && isConflictDemoActive;

          return (
            <div
              key={agent.id}
              className={`eoc-card p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isConflicted
                  ? 'border-red-500/80 bg-red-950/20 shadow-lg shadow-red-500/20'
                  : isReady
                  ? 'border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'border-slate-800 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{agent.avatar}</span>
                  {isConflicted ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/30 text-red-300 border border-red-500/50 animate-pulse">
                      CONFLICT DETECTED
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isReady ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-cyan-500/20 text-cyan-300 animate-pulse'
                    }`}>
                      {agent.status}
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-sm text-white">{agent.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{agent.role}</p>
              </div>

              {/* Thinking Log */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="text-[10px] text-cyan-400 font-bold uppercase">Reasoning Process</div>
                {agent.thinking_log.map((log, i) => (
                  <div key={i} className="text-slate-400 line-clamp-1">› {log}</div>
                ))}
              </div>

              {/* Recommendation */}
              <div className={`p-3 rounded-xl border text-xs ${
                isConflicted ? 'bg-red-950/50 border-red-500/40 text-red-200' : 'bg-slate-900/90 border-slate-800 text-cyan-200'
              }`}>
                <div className="font-bold text-white mb-1 flex items-center justify-between">
                  <span>Recommendation</span>
                  <span className="font-mono text-[10px] text-cyan-400">{agent.confidence}% Conf</span>
                </div>
                <p className="leading-snug">{agent.recommendation}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chief Coordinator Master Action Plan Output Card with FEATURE 2 Explainability */}
      <div className="eoc-card-glow-cyan p-6 rounded-2xl border border-cyan-500/50 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{coordinatorAgent.avatar}</span>
            <div>
              <h3 className="font-extrabold text-lg text-white">{coordinatorAgent.name}</h3>
              <p className="text-xs text-slate-400 font-mono">Synthesizes Specialist Agents into Joint Response Directive</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowExplain(true)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold rounded-xl text-xs font-mono transition-all flex items-center space-x-1 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Why?</span>
            </button>

            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold">
              CONFIDENCE 98%
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-950/90 rounded-xl border border-cyan-500/30 space-y-2 text-xs font-mono text-cyan-200">
          <div className="text-cyan-400 font-bold text-sm flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>FINAL RESOLVED MASTER RESPONSE DIRECTIVE #402</span>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed font-sans font-extrabold">
            "{coordinatorAgent.recommendation}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-mono text-[10px]">Medical Dispatch</div>
            <div className="font-bold text-white mt-0.5">Ambulance A12 Dispatched to Zone A</div>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-mono text-[10px]">Logistics Balance</div>
            <div className="font-bold text-white mt-0.5">Ambulance B4 Assigned as Zone B Standby</div>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-mono text-[10px]">Evacuation Priority</div>
            <div className="font-bold text-white mt-0.5">North Evacuation Bypass Active</div>
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
