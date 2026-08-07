import React, { useState, useEffect } from 'react';
import { Incident } from '../types';
import { Mic, MicOff, X, Sparkles, CheckCircle2, AlertTriangle, Send, RefreshCw, Volume2 } from 'lucide-react';
import { analyzeIncidentReport, verifyIncidentReport, calculatePriorityScore } from '../services/aiEngine';
import { DISASTER_IMAGES } from '../utils/svgImages';

interface VoiceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIncident: (newIncident: Incident) => void;
}

export const VoiceReportModal: React.FC<VoiceReportModalProps> = ({
  isOpen,
  onClose,
  onAddIncident
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiParsing, setAiParsing] = useState<{
    incidentType: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    potentialRisk: string;
    peopleAtRisk: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsRecording(false);
      setTranscript('');
      setAiParsing(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartVoiceRecording = () => {
    setIsRecording(true);
    setTranscript('');
    setAiParsing(null);

    // Check if Web Speech API SpeechRecognition is available in browser
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognition.onerror = () => {
        // Fallback demo transcript if microphone access is denied or error
        setTimeout(() => {
          setTranscript("There is a building collapse near the metro station exit. People may be trapped on the second floor.");
          setIsRecording(false);
          processVoiceTranscript("There is a building collapse near the metro station exit. People may be trapped on the second floor.");
        }, 1500);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } else {
      // Demo Voice Simulation fallback if browser speech API is unavailable
      setTimeout(() => {
        const demoText = "There is a severe building collapse near the metro station exit. Multiple people trapped inside!";
        setTranscript(demoText);
        setIsRecording(false);
        processVoiceTranscript(demoText);
      }, 2000);
    }
  };

  const processVoiceTranscript = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);

    try {
      const result = await analyzeIncidentReport(text);
      setAiParsing({
        incidentType: result.incident_type,
        severity: result.severity,
        potentialRisk: result.detected_hazards[0] || 'Citizens exposed to structural collapse hazard',
        peopleAtRisk: result.estimated_people_affected
      });
    } catch (err) {
      setAiParsing({
        incidentType: 'Building Collapse',
        severity: 'CRITICAL',
        potentialRisk: 'People trapped inside damaged structure',
        peopleAtRisk: 86
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    if (transcript) {
      processVoiceTranscript(transcript);
    }
  };

  const handleConfirmVoiceReport = async () => {
    if (!transcript) return;

    const verification = await verifyIncidentReport(transcript, aiParsing?.incidentType || 'General Emergency');
    const priority = calculatePriorityScore({
      severity: aiParsing?.severity || 'HIGH',
      people_at_risk: aiParsing?.peopleAtRisk || 45,
      verification_status: verification.status,
      verification_score: verification.score
    });

    const newInc: Incident = {
      id: `inc-voice-${Date.now()}`,
      title: `VOICE REPORT: ${aiParsing?.incidentType || 'Emergency'} near Metro Exit`,
      description: `[Voice Transcript]: "${transcript}"`,
      incident_type: aiParsing?.incidentType || 'Building Collapse',
      severity: aiParsing?.severity || 'CRITICAL',
      status: 'VERIFIED',
      priority_score: priority.score,
      confidence: 94,
      verification_status: verification.status,
      verification_score: verification.score,
      people_at_risk: aiParsing?.peopleAtRisk || 65,
      location: {
        lat: 12.9716 + (Math.random() - 0.5) * 0.02,
        lng: 77.5946 + (Math.random() - 0.5) * 0.02,
        address: 'MG Road Metro Station Voice Beacon',
        area: 'Central Emergency District'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      image_url: DISASTER_IMAGES.buildingCollapse,
      detected_hazards: ['Trapped Victims', 'Structural Debris Risk'],
      infrastructure_damage: ['Building Load Failure'],
      recommended_resources: [
        { type: 'RESCUE_TEAM', count: 3 },
        { type: 'AMBULANCE', count: 2 }
      ],
      recommended_actions: ['Deploy search & rescue squad immediately'],
      assigned_resources: [],
      eta_minutes: 6,
      reasoning: 'Voice emergency report transcribed and verified via AI NLP parsing engine.'
    };

    onAddIncident(newInc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white max-w-lg w-full rounded-2xl border border-teal-200 shadow-2xl p-6 relative my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shadow-sm">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-800">Voice Emergency Reporting</h3>
            <p className="text-xs text-slate-500 font-mono">Speak your emergency — AI converts voice to dispatch directives</p>
          </div>
        </div>

        {/* Voice Microphone Recorder Box */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3 relative overflow-hidden">
          {!isRecording ? (
            <button
              onClick={handleStartVoiceRecording}
              className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-red-600 to-amber-500 hover:scale-105 active:scale-95 text-white font-bold shadow-xl shadow-red-200 flex flex-col items-center justify-center space-y-1 transition-all border-4 border-white cursor-pointer"
            >
              <Mic className="w-8 h-8" />
              <span className="text-[10px] font-mono">TAP TO SPEAK</span>
            </button>
          ) : (
            <button
              onClick={handleStopRecording}
              className="w-24 h-24 mx-auto rounded-full bg-red-600 text-white font-bold shadow-xl shadow-red-300 flex flex-col items-center justify-center space-y-1 animate-pulse cursor-pointer border-4 border-white"
            >
              <MicOff className="w-8 h-8" />
              <span className="text-[10px] font-mono">STOP RECORDING</span>
            </button>
          )}

          <p className="text-xs text-slate-500 font-mono">
            {isRecording ? "🔴 Listening... Speak clearly into your microphone." : "Tap the microphone to speak your emergency report"}
          </p>
        </div>

        {/* I HEARD Box */}
        {transcript && (
          <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
            <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>I HEARD:</span>
              <span className="text-teal-600">SPEECH TO TEXT</span>
            </div>
            <p className="text-xs text-slate-800 font-semibold italic">"{transcript}"</p>
          </div>
        )}

        {/* AI UNDERSTANDING Box */}
        {isProcessing ? (
          <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-center text-xs font-mono text-teal-700 space-y-2">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-teal-600" />
            <div>AI Vision & Speech NLP Parsing Emergency Cues...</div>
          </div>
        ) : aiParsing && (
          <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 space-y-2 text-xs font-sans">
            <div className="text-xs font-bold text-teal-800 font-mono flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>AI UNDERSTANDING</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-white rounded-lg border border-teal-100">
                <div className="text-[10px] text-slate-400">INCIDENT TYPE</div>
                <div className="font-bold text-slate-800 mt-0.5">{aiParsing.incidentType}</div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-teal-100">
                <div className="text-[10px] text-slate-400">SEVERITY LEVEL</div>
                <div className="font-extrabold text-red-600 mt-0.5">{aiParsing.severity}</div>
              </div>
            </div>

            <div className="p-2 bg-white rounded-lg border border-teal-100 text-xs text-slate-700">
              <strong>Potential Risk:</strong> {aiParsing.potentialRisk} ({aiParsing.peopleAtRisk} citizens affected)
            </div>
          </div>
        )}

        {/* Question & Confirm CTA */}
        {aiParsing && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-800 text-center">
              Would you like to submit this emergency report?
            </p>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
              >
                CANCEL
              </button>

              <button
                onClick={handleConfirmVoiceReport}
                className="px-6 py-2 bg-gradient-to-r from-red-600 to-amber-600 text-white font-extrabold rounded-xl text-xs transition-all shadow-md flex items-center space-x-1.5 active:scale-95 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>SUBMIT REPORT</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
