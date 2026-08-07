import React, { useState, useEffect } from 'react';
import { Incident, Resource, EvacuationRoute } from '../types';
import { Play, CheckCircle2, Clock, ShieldAlert, Sparkles, X, ArrowRight, Award, AlertTriangle, Truck, Navigation, Activity } from 'lucide-react';

interface ResponseChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: Incident[];
  resources: Resource[];
  routes: EvacuationRoute[];
}

export const ResponseChallengeModal: React.FC<ResponseChallengeModalProps> = ({
  isOpen,
  onClose,
  incidents,
  resources,
  routes
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [completedTime, setCompletedTime] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Selected challenge choices
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setActiveStep(1);
      setTimeLeft(60);
      setIsTimerRunning(true);
      setIsCompleted(false);
      setCompletedTime(0);
      setSelectedIncidentId(incidents[0]?.id || '');
      setSelectedResourceId(resources[0]?.id || '');
      setSelectedRouteId(routes[0]?.id || '');
    }
  }, [isOpen, incidents, resources, routes]);

  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning && timeLeft > 0 && !isCompleted) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isCompleted) {
      setIsTimerRunning(false);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTimerRunning, timeLeft, isCompleted]);

  if (!isOpen) return null;

  const challengeSteps = [
    { step: 1, label: '01 Identify', name: 'Identify Critical Incident' },
    { step: 2, label: '02 Prioritize', name: 'Review AI Recommendation' },
    { step: 3, label: '03 Deploy', name: 'Assign Emergency Unit' },
    { step: 4, label: '04 Evacuate', name: 'Select Evacuation Corridor' },
    { step: 5, label: '05 Simulate', name: 'Run What-If Forecast' },
    { step: 6, label: '06 Respond', name: 'Confirm Master Plan' },
  ];

  const handleNextStep = () => {
    if (activeStep < 6) {
      setActiveStep(prev => prev + 1);
    } else {
      setIsCompleted(true);
      setIsTimerRunning(false);
      setCompletedTime(60 - timeLeft);
    }
  };

  return (
    <div className="fixed inset-0 z-[3600] bg-red-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-slate-950 max-w-2xl w-full rounded-2xl border-2 border-red-500 shadow-2xl p-6 relative my-8 text-white space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Challenge Header & Live Timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black tracking-widest uppercase">
                  HACKATHON DEMO MODE
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold">DEFCON 1 BENCHMARK</span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">60-SECOND RESPONSE CHALLENGE</h2>
            </div>
          </div>

          {!isCompleted && (
            <div className="flex items-center space-x-2 bg-slate-900 border border-red-500/50 px-4 py-2 rounded-xl text-red-400 font-mono font-black text-xl shadow-lg self-start sm:self-auto">
              <Clock className="w-5 h-5 animate-spin" />
              <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </div>
          )}
        </div>

        {/* Step Stepper Progress Bar */}
        <div className="grid grid-cols-6 gap-1.5 font-mono text-[10px] text-center">
          {challengeSteps.map(s => {
            const isActive = activeStep === s.step;
            const isDone = activeStep > s.step || isCompleted;

            return (
              <div
                key={s.step}
                className={`py-2 px-1 rounded-lg border font-bold transition-all ${
                  isDone
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : isActive
                    ? 'bg-red-600 text-white border-red-400 shadow-md scale-105'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {s.label}
              </div>
            );
          })}
        </div>

        {!isCompleted ? (
          <div className="space-y-4 pt-2">
            
            {/* Step 1: Identify */}
            {activeStep === 1 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-cyan-300 font-mono flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>STEP 1: IDENTIFY THE MOST CRITICAL EMERGENCY INCIDENT</span>
                </div>
                <div className="space-y-2">
                  {incidents.slice(0, 3).map(inc => (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncidentId(inc.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedIncidentId === inc.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-sm text-white">{inc.title}</div>
                        <div className="text-xs text-slate-400">{inc.location.address} ({inc.people_at_risk} pax at risk)</div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-red-600 text-white font-mono text-xs font-bold">
                        PRIORITY {inc.priority_score}/100
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Prioritize */}
            {activeStep === 2 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-cyan-300 font-mono flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>STEP 2: REVIEW AI MULTI-FACTOR PRIORITY RECOMMENDATION</span>
                </div>
                <div className="p-4 bg-slate-900 rounded-xl border border-cyan-500/40 space-y-2 text-xs font-mono">
                  <div className="text-emerald-400 font-bold">AI Priority Engine Output:</div>
                  <p className="text-slate-200 text-sm font-sans font-semibold">
                    "Building Collapse identified as top priority threat (Score 96/100) due to 86 trapped citizens and structural beam instability."
                  </p>
                  <div className="text-[11px] text-slate-400">Confidence Score: 94% | Verification Status: VERIFIED (98%)</div>
                </div>
              </div>
            )}

            {/* Step 3: Deploy */}
            {activeStep === 3 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-cyan-300 font-mono flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-cyan-400" />
                  <span>STEP 3: ASSIGN EMERGENCY FIELD RESPONSE UNITS</span>
                </div>
                <div className="space-y-2">
                  {resources.slice(0, 3).map(res => (
                    <div
                      key={res.id}
                      onClick={() => setSelectedResourceId(res.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedResourceId === res.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-sm text-white">{res.unit_code} — {res.name}</div>
                        <div className="text-xs text-slate-400">{res.current_location.address}</div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded font-mono text-xs font-bold">
                        {res.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Evacuate */}
            {activeStep === 4 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-cyan-300 font-mono flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <span>STEP 4: SELECT OPTIMAL NON-FLOODED EVACUATION CORRIDOR</span>
                </div>
                <div className="space-y-2">
                  {routes.slice(0, 3).map(rt => (
                    <div
                      key={rt.id}
                      onClick={() => setSelectedRouteId(rt.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedRouteId === rt.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-sm text-white">{rt.name}</div>
                        <div className="text-xs text-slate-400">Origin: {rt.origin} → Dest: {rt.destination}</div>
                      </div>
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded font-mono text-xs font-bold">
                        SAFETY: {rt.safety_score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Simulate */}
            {activeStep === 5 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-cyan-300 font-mono flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>STEP 5: RUN WHAT-IF SIMULATION & HOSPITAL STRESS TEST</span>
                </div>
                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                  <div className="text-cyan-400 font-bold">Monte Carlo Scenario Projection:</div>
                  <div className="text-slate-300">Hospital Pressure: 68% | Evacuation Demand: 1,240 pax | Deficit: BALANCED</div>
                  <div className="text-emerald-400 font-bold pt-1">• All receiving hospitals prepared for inflow</div>
                </div>
              </div>
            )}

            {/* Step 6: Respond */}
            {activeStep === 6 && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-cyan-300 font-mono flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>STEP 6: CONFIRM & EXECUTE MASTER EMERGENCY DIRECTIVE</span>
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-xl space-y-2 text-xs font-mono text-emerald-200">
                  <div className="font-bold text-sm text-white">READY FOR DISPATCH DIRECTIVE #601</div>
                  <div>• Priority Node: Building Collapse near MG Road Metro</div>
                  <div>• Responders: USAR-BRAVO-1 & ALS Ambulance Unit</div>
                  <div>• Evacuation: North Bypass Corridor</div>
                </div>
              </div>
            )}

            {/* Next Step CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs font-mono text-slate-400">
                STEP {activeStep} OF 6
              </span>

              <button
                onClick={handleNextStep}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-extrabold rounded-xl text-xs transition-all shadow-lg flex items-center space-x-2 cursor-pointer active:scale-95"
              >
                <span>{activeStep === 6 ? 'CONFIRM & EXECUTE RESPONSE PLAN' : 'CONFIRM & NEXT STEP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        ) : (
          /* Completion Screen */
          <div className="space-y-5 py-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 mx-auto flex items-center justify-center shadow-xl">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-emerald-400 font-mono">RESPONSE PLAN GENERATED</h3>
              <p className="text-xs text-slate-400">Hackathon Challenge Successfully Completed!</p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto font-mono text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-[10px]">RESPONSE TIME</div>
                <div className="text-xl font-black text-cyan-400 mt-0.5">{completedTime}s</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-[10px]">UNITS DEPLOYED</div>
                <div className="text-xl font-black text-amber-400 mt-0.5">6 Units</div>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="text-slate-500 text-[10px]">INCIDENTS SOLVED</div>
                <div className="text-xl font-black text-emerald-400 mt-0.5">3 Critical</div>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 text-xs text-amber-300 font-mono max-w-md mx-auto">
              ⚡ <strong>Hackathon Simulation</strong> — Demonstrates rapid multi-agency emergency decision workflow.
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-xl cursor-pointer"
            >
              CLOSE CHALLENGE
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
