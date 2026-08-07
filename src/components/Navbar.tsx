import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Radio, 
  Map, 
  Truck, 
  Navigation, 
  Clock, 
  Cpu, 
  Sliders, 
  UserCheck, 
  BarChart3, 
  Play, 
  Sparkles,
  Bot,
  AlertTriangle,
  HeartPulse,
  Award,
  Zap
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  onOpenReportModal: () => void;
  onToggleAssistant: () => void;
  onStartDemo: () => void;
  onOpenChallenge?: () => void;
  onOpenCrisisMode?: () => void;
  alertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeRole,
  setActiveRole,
  onOpenReportModal,
  onToggleAssistant,
  onStartDemo,
  onOpenChallenge,
  onOpenCrisisMode,
  alertCount
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'command-center', label: 'Command Map', icon: Map },
    { id: 'resources', label: 'Smart Resources', icon: Truck },
    { id: 'evacuation', label: 'Evacuation Routes', icon: Navigation },
    { id: 'timeline', label: 'Future Vision', icon: Clock },
    { id: 'multi-agent', label: 'Multi-Agent AI', icon: Cpu },
    { id: 'what-if', label: 'What-If Simulator', icon: Sliders },
    { id: 'hospital-stress', label: 'Hospital Stress', icon: HeartPulse },
    { id: 'admin', label: 'Analytics', icon: BarChart3 },
    { id: 'citizen', label: 'Citizen Portal', icon: UserCheck },
    { id: 'responder', label: 'Responder Portal', icon: Radio },
  ];

  return (
    <header className="bg-white/95 border-b border-slate-200 sticky top-0 z-[2000] backdrop-blur-md shadow-sm font-sans">
      {/* Top Banner Header */}
      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs font-mono bg-slate-50/80">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 text-red-600 font-semibold px-2 py-0.5 bg-red-50 border border-red-200 rounded">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-1"></span>
            DEFCON 2 — CRITICAL EMERGENCIES ACTIVE
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-teal-600">DISASTERX AI KERNEL v4.2.0</span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden lg:inline text-slate-600">GEO: BENGALURU EOC REGION</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-1 bg-white border border-slate-200 px-2.5 py-1 rounded text-teal-700 font-mono shadow-sm">
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            <span>{time}</span>
          </div>

          {/* FEATURE 10: 60-Second Challenge Quick Trigger */}
          {onOpenChallenge && (
            <button
              onClick={onOpenChallenge}
              className="flex items-center space-x-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white font-sans font-extrabold rounded shadow-md transition-all text-xs cursor-pointer border border-red-400 animate-pulse"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>⚡ 60-SEC CHALLENGE</span>
            </button>
          )}

          {/* Quick Hackathon Demo Trigger Button */}
          <button
            onClick={onStartDemo}
            className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-500 hover:to-blue-500 text-white font-sans font-bold rounded shadow-md transition-all text-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>3-MIN DEMO MODE</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => setCurrentTab('landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-blue-600 to-red-500 p-0.5 shadow-lg shadow-teal-200/40 group-hover:shadow-teal-300/50 transition-all">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-teal-600 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-800">
                DisasterX <span className="text-teal-600">AI</span>
              </span>
              <span className="bg-teal-50 text-teal-600 border border-teal-200 text-[10px] font-mono px-1.5 py-0.2 rounded">
                OS
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Emergency Response Operating System</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="hidden xl:flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-teal-700 border border-teal-200 shadow-sm font-bold' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          {/* Incident Report CTA */}
          <button
            onClick={onOpenReportModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-teal-200/40 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">REPORT INCIDENT</span>
          </button>

          {/* AI Assistant Drawer Toggle */}
          <button
            onClick={onToggleAssistant}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-teal-600 border border-teal-200 rounded-lg text-xs font-medium transition-all relative shadow-sm cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden md:inline">AI COPILOT</span>
            {alertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {alertCount}
              </span>
            )}
          </button>

          {/* Role Selector Dropdown */}
          <div className="relative">
            <select
              value={activeRole}
              onChange={(e) => {
                const role = e.target.value as UserRole;
                setActiveRole(role);
                if (role === 'COORDINATOR') setCurrentTab('command-center');
                else if (role === 'CITIZEN') setCurrentTab('citizen');
                else if (role === 'RESPONDER') setCurrentTab('responder');
                else if (role === 'ADMINISTRATOR') setCurrentTab('admin');
              }}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer shadow-sm font-semibold"
            >
              <option value="COORDINATOR">Role: EOC Coordinator</option>
              <option value="CITIZEN">Role: Citizen User</option>
              <option value="RESPONDER">Role: Field Responder</option>
              <option value="ADMINISTRATOR">Role: Administrator</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Tab Selector */}
      <div className="xl:hidden flex items-center space-x-1 overflow-x-auto px-4 py-2 bg-slate-50 border-t border-slate-200 text-xs no-scrollbar">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center space-x-1 px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
                isActive ? 'bg-white text-teal-700 border border-teal-200 shadow-sm font-bold' : 'text-slate-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
