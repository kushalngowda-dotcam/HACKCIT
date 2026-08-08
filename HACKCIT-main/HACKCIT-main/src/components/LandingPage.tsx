import React from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  Users, 
  Truck, 
  Clock, 
  Map, 
  Cpu, 
  Play, 
  Radio, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Globe,
  Sliders
} from 'lucide-react';
import { Incident, Resource } from '../types';

interface LandingPageProps {
  onLaunchCommandCenter: () => void;
  onStartDemo?: () => void;
  incidents: Incident[];
  resources: Resource[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchCommandCenter,
  incidents,
  resources
}) => {
  const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const totalPeopleAtRisk = incidents.reduce((acc, i) => acc + i.people_at_risk, 0);
  const resourcesDeployed = resources.filter(r => r.status === 'DISPATCHED' || r.status === 'EN_ROUTE' || r.status === 'ON_SITE').length;

  return (
    <div className="relative min-h-full bg-gradient-to-br from-slate-50 via-white to-teal-50/30 text-slate-900 overflow-x-hidden flex flex-col justify-between">
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 radar-grid opacity-40 pointer-events-none"></div>

      {/* Subtle Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-200/20 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-200/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Content Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        
        {/* Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-mono mb-8">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>AI-Powered Emergency Response Operating System</span>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Disaster<span className="text-teal-600">X</span> AI
          </h1>
          <p className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-teal-600 bg-clip-text text-transparent mb-6">
            "Turning Disaster Data into Life-Saving Decisions."
          </p>
          <p className="text-base sm:text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed mb-10">
            DisasterX AI is an intelligent emergency response operating system that aggregates live disaster telemetry, utilizes multi-modal AI APIs to verify and prioritize incidents, calculates real-time evacuation routes, and coordinates multi-agent responder deployments.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={onLaunchCommandCenter}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-extrabold rounded-xl text-base transition-all shadow-xl shadow-teal-200/40 flex items-center justify-center space-x-3 group cursor-pointer"
            >
              <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>LAUNCH LIVE COMMAND CENTER</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Live Operational Metrics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto mb-20">
          <div className="bg-white p-5 rounded-2xl border border-red-200 flex items-center space-x-4 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-slate-800">{activeIncidentsCount}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Incidents</div>
            </div>
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-slate-800">{totalPeopleAtRisk.toLocaleString()}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">People at Risk</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-teal-200 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-slate-800">{resourcesDeployed} / {resources.length}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resources Deployed</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 flex items-center space-x-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black font-mono text-slate-800">6.4 MIN</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Response Time</div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all group shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Multi-Agent AI Engine</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Medical, Rescue, Logistics, and Evacuation AI specialists continuously analyze hospital loads and road damage to deliver unified Joint Action Plans.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all group shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Spatial Threat & Route Intelligence</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Interactive Leaflet GIS map displaying live disaster hotspots, safe zones, hospital capacity gauges, and real-time evacuation polyline routes.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all group shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">What-If Disaster Simulator</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Test custom rainfall, population density, road accessibility, and hospital load parameters to project resource deficits and preemptive evacuation strategies.
            </p>
          </div>
        </div>

      </main>

      {/* Footer Banner */}
      <footer className="relative z-10 border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        DisasterX AI OS &copy; 2026 — Built for Hackathon Challenge "Disaster Intelligence & Emergency Response Coordination".
      </footer>
    </div>
  );
};
