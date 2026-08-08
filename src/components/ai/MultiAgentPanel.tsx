import React, { useState } from 'react';
import { Cpu, Stethoscope, ShieldAlert, Truck, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { Incident } from '../../types/database';
import { generateMultiAgentAnalysis, AgentProposal } from '../../services/aiService';

interface MultiAgentPanelProps {
  selectedIncident: Incident | null;
  onApproveAction?: (actionText: string) => void;
}

export const MultiAgentPanel: React.FC<MultiAgentPanelProps> = ({
  selectedIncident,
  onApproveAction,
}) => {
  const [approved, setApproved] = useState(false);

  if (!selectedIncident) {
    return (
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
        Select an incident on the map or priority queue to initialize Multi-Agent Reasoning.
      </div>
    );
  }

  const agents: AgentProposal[] = generateMultiAgentAnalysis(selectedIncident);
  const conflictDetected = agents.some((a) => a.conflict);
  const coordinator = agents.find((a) => a.agent_name === 'Coordinator');

  const getAgentIcon = (name: string) => {
    switch (name) {
      case 'Medical':
        return <Stethoscope className="w-4 h-4 text-cyan-400" />;
      case 'Rescue':
        return <ShieldAlert className="w-4 h-4 text-red-400" />;
      case 'Evacuation':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'Logistics':
        return <Truck className="w-4 h-4 text-amber-400" />;
      default:
        return <Cpu className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Multi-Agent Autonomous Reasoning Matrix</h3>
            <p className="text-[11px] text-slate-400">5 Domain Sub-Agents evaluating {selectedIncident.title}</p>
          </div>
        </div>

        {conflictDetected && (
          <span className="px-2.5 py-1 rounded-md bg-amber-950 text-amber-400 border border-amber-800 text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <AlertTriangle className="w-4 h-4" /> AGENT CONFLICT DETECTED
          </span>
        )}
      </div>

      {/* Agent Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {agents
          .filter((a) => a.agent_name !== 'Coordinator')
          .map((agent, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                agent.conflict
                  ? 'bg-amber-950/20 border-amber-800/60 shadow-md shadow-amber-950/30'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-200">
                  {getAgentIcon(agent.agent_name)}
                  <span>{agent.agent_name} Agent</span>
                </div>
                {agent.conflict && (
                  <span className="text-[10px] bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                    Conflict
                  </span>
                )}
              </div>
              <p className="text-slate-300 font-medium">{agent.proposal}</p>
              <p className="text-[11px] text-slate-400 italic">"{agent.reasoning}"</p>
            </div>
          ))}
      </div>

      {/* Coordinator Consolidated Recommendation */}
      {coordinator && (
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              COORDINATOR SYNTHESIS RECOMMENDATION
            </span>
            <span className="text-[10px] font-mono bg-purple-900/60 text-purple-200 px-2 py-0.5 rounded">
              Human Approval Required
            </span>
          </div>

          <p className="text-xs text-slate-200 font-semibold">{coordinator.proposal}</p>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-purple-900/50">
            {approved ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> APPROVED BY COMMANDER
              </span>
            ) : (
              <button
                onClick={() => {
                  setApproved(true);
                  if (onApproveAction) onApproveAction(coordinator.proposal);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-950/50 flex items-center gap-1.5 transition-all"
              >
                <CheckCircle className="w-4 h-4" /> Approve & Execute Coordinator Action
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
