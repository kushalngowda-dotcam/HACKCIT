import React, { useState } from 'react';
import { Play, ChevronRight, X, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface DemoControllerProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToTab: (tab: string) => void;
  onTriggerDisaster: () => void;
  onSimulateAllocation: () => void;
  onOpenCrisisMode?: () => void;
  onOpenChallenge?: () => void;
}

export const DemoController: React.FC<DemoControllerProps> = ({
  isOpen,
  onClose,
  onJumpToTab,
  onTriggerDisaster,
  onSimulateAllocation,
  onOpenCrisisMode,
  onOpenChallenge
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: "Launch Command Center & GIS Map",
      tab: "command-center",
      desc: "Overview of DisasterX AI real-time EOC operating system with Leaflet dark GIS map.",
      action: () => onJumpToTab('command-center')
    },
    {
      step: 2,
      title: "Activate AI Crisis Command Mode",
      tab: "command-center",
      desc: "Trigger prominent Crisis Mode button to generate immediate top priorities and AI response plan.",
      action: () => {
        onJumpToTab('command-center');
        if (onOpenCrisisMode) onOpenCrisisMode();
      }
    },
    {
      step: 3,
      title: "Trigger Demo Disaster Escalation",
      tab: "command-center",
      desc: "Simulate a severe flash flood and structural collapse emergency in Bengaluru.",
      action: () => {
        onJumpToTab('command-center');
        onTriggerDisaster();
      }
    },
    {
      step: 4,
      title: "AI Risk Heatmap & Layer Assessment",
      tab: "command-center",
      desc: "Toggle AI Risk Layer on map to view predicted critical/high risk zones and exposure popups.",
      action: () => onJumpToTab('command-center')
    },
    {
      step: 5,
      title: "Smart Resource Allocation AI",
      tab: "resources",
      desc: "Run Hungarian linear matching optimizer to pair rescue teams with critical incidents.",
      action: () => {
        onJumpToTab('resources');
        onSimulateAllocation();
      }
    },
    {
      step: 6,
      title: "AI Future Vision Timeline (+3 Hours)",
      tab: "timeline",
      desc: "Drag temporal slider to project affected population, hospital pressure, and resource demand.",
      action: () => onJumpToTab('timeline')
    },
    {
      step: 7,
      title: "Hospital Stress Test Simulator",
      tab: "hospital-stress",
      desc: "Simulate +500 patient mass-casualty surge to test hospital ICU load and patient rerouting.",
      action: () => onJumpToTab('hospital-stress')
    },
    {
      step: 8,
      title: "Multi-Agent AI & Conflict Resolution",
      tab: "multi-agent",
      desc: "5 AI agents (Medical, Rescue, Logistics, Evacuation) resolve resource allocation conflicts.",
      action: () => onJumpToTab('multi-agent')
    },
    {
      step: 9,
      title: "Citizen Portal & Voice Emergency Reporting",
      tab: "citizen",
      desc: "Citizen speaks emergency description; AI parses incident, severity, and risk.",
      action: () => onJumpToTab('citizen')
    },
    {
      step: 10,
      title: "60-Second Response Challenge",
      tab: "command-center",
      desc: "Run the interactive hackathon 60-second timer challenge mode.",
      action: () => {
        onJumpToTab('command-center');
        if (onOpenChallenge) onOpenChallenge();
      }
    },
    {
      step: 11,
      title: "Final Hackathon Presentation Summary",
      tab: "landing",
      desc: "Platform summary message: Helping emergency teams understand, decide, act faster, and prepare.",
      action: () => onJumpToTab('landing')
    }
  ];

  const activeStep = steps[currentStep - 1];

  const handleNext = () => {
    if (currentStep < steps.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      steps[next - 1].action();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      steps[prev - 1].action();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2500] max-w-xl w-[92%] bg-[#090e17]/95 border-2 border-cyan-500 backdrop-blur-md rounded-2xl shadow-2xl p-4 text-white font-sans">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="font-extrabold text-sm tracking-wide">3-MIN HACKATHON DEMO WALKTHROUGH</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-cyan-300 font-bold">
            STEP {currentStep} / {steps.length}
          </span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-bold text-base text-cyan-300">{activeStep.title}</h4>
        <p className="text-xs text-slate-300 leading-snug">{activeStep.desc}</p>
      </div>

      {currentStep === 11 && (
        <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-xs font-mono text-cyan-200">
          "DisasterX AI helps emergency teams understand what is happening, decide what matters most, act faster, and prepare for what could happen next."
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800">
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg disabled:opacity-40 cursor-pointer"
        >
          ← Previous Step
        </button>

        <button
          onClick={handleNext}
          disabled={currentStep === steps.length}
          className="px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 font-extrabold text-xs rounded-lg shadow-lg flex items-center space-x-1 cursor-pointer active:scale-95"
        >
          <span>Next Step</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
