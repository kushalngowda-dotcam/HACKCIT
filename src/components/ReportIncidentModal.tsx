import React, { useState } from 'react';
import { X, Upload, MapPin, Sparkles, AlertCircle, Image as ImageIcon, Camera } from 'lucide-react';
import { analyzeIncidentReport, verifyIncidentReport, calculatePriorityScore } from '../services/aiEngine';
import { AIAnalysisResult, Incident } from '../types';
import { AIAnalysisCard } from './AIAnalysisCard';
import { DISASTER_IMAGES } from '../utils/svgImages';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIncident: (newIncident: Incident) => void;
}

export const ReportIncidentModal: React.FC<ReportIncidentModalProps> = ({
  isOpen,
  onClose,
  onAddIncident
}) => {
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('MG Road Metro Station Exit 2, Bengaluru');
  const [incidentType, setIncidentType] = useState('Building Collapse');
  const [selectedImage, setSelectedImage] = useState<string | null>(
    DISASTER_IMAGES.buildingCollapse
  );
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAIAnalysis = async () => {
    if (!description) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeIncidentReport(description, selectedImage, address, incidentType);
      setAiAnalysis(result);
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmSubmit = async () => {
    if (!aiAnalysis) return;

    const verification = await verifyIncidentReport(description, aiAnalysis.incident_type);
    const priority = calculatePriorityScore({
      severity: aiAnalysis.severity,
      people_at_risk: aiAnalysis.estimated_people_affected,
      verification_status: verification.status,
      verification_score: verification.score
    });

    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      title: `${aiAnalysis.incident_type} Emergency at ${address.split(',')[0]}`,
      description,
      incident_type: aiAnalysis.incident_type,
      severity: aiAnalysis.severity,
      status: 'VERIFIED',
      priority_score: priority.score,
      confidence: aiAnalysis.confidence,
      verification_status: verification.status,
      verification_score: verification.score,
      people_at_risk: aiAnalysis.estimated_people_affected,
      location: {
        lat: 12.9716 + (Math.random() - 0.5) * 0.05,
        lng: 77.5946 + (Math.random() - 0.5) * 0.05,
        address,
        area: 'Central District'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      image_url: selectedImage || undefined,
      detected_hazards: aiAnalysis.detected_hazards,
      infrastructure_damage: aiAnalysis.infrastructure_damage,
      recommended_resources: aiAnalysis.recommended_resources,
      recommended_actions: aiAnalysis.recommended_actions,
      assigned_resources: [],
      eta_minutes: 8,
      reasoning: aiAnalysis.reasoning
    };

    onAddIncident(newIncident);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="eoc-card max-w-2xl w-full rounded-2xl border border-slate-700 shadow-2xl p-6 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">AI Incident Reporting Engine</h2>
            <p className="text-xs text-slate-400 font-mono">Upload multi-modal media & description for AI interpretation</p>
          </div>
        </div>

        {!aiAnalysis ? (
          <div className="space-y-4">
            {/* Incident Type & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">INCIDENT CATEGORY</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="Building Collapse">Building Collapse</option>
                  <option value="Urban Flooding">Urban Flooding</option>
                  <option value="Chemical Leak">Chemical Leak</option>
                  <option value="Fire Emergency">Fire Emergency</option>
                  <option value="Landslide">Landslide</option>
                  <option value="Power Grid Failure">Power Grid Failure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">LOCATION ADDRESS</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    placeholder="Enter street or area..."
                  />
                </div>
              </div>
            </div>

            {/* Description Area */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">DETAILED EMERGENCY DESCRIPTION</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened, estimated people trapped or affected, visible hazards..."
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-xl p-3 focus:ring-1 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            {/* Image / Video Media Upload Preview */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">UPLOAD VISUAL EVIDENCE (PHOTO / VIDEO)</label>
              <div className="flex items-center space-x-4">
                {selectedImage && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-slate-700 relative group shrink-0">
                    <img src={selectedImage} alt="Emergency preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}

                <label className="flex-1 border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/60">
                  <Upload className="w-6 h-6 text-cyan-400 mb-1" />
                  <span className="text-xs text-slate-300 font-medium">Click to select image or drag & drop</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">JPG, PNG, MP4 up to 50MB</span>
                  <input type="file" accept="image/*,video/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Submit AI Analysis Button */}
            <div className="pt-2">
              <button
                disabled={!description || isAnalyzing}
                onClick={handleRunAIAnalysis}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin mr-2"></span>
                    <span>RUNNING AI VISION & NLP ANALYSIS...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>ANALYZE REPORT WITH AI API</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AIAnalysisCard 
              analysis={aiAnalysis} 
              onConfirmSubmit={handleConfirmSubmit} 
            />
            
            <button
              onClick={() => setAiAnalysis(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs"
            >
              ← Edit Incident Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
