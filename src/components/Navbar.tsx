import React, { useState, useEffect, useRef } from 'react';
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
  Zap,
  Layers,
  Check
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  onOpenReportModal: () => void;
  onToggleAssistant: () => void;
  onStartDemo?: () => void;
  onOpenChallenge?: () => void;
  onOpenCrisisMode?: () => void;
  alertCount: number;
}

const NAV_ITEMS = [
  { id: 'command-center', label: 'Command Map', icon: Map },
  { id: 'resources', label: 'Smart Resources', icon: Truck },
  { id: 'evacuation', label: 'Evacuation Routes', icon: Navigation },
];

const MORE_ITEMS = [
  { id: 'timeline', label: 'Future Vision', icon: Clock },
  { id: 'multi-agent', label: 'Multi-Agent AI', icon: Cpu },
  { id: 'what-if', label: 'What-If Simulator', icon: Sliders },
  { id: 'hospital-stress', label: 'Hospital Stress', icon: HeartPulse },
  { id: 'admin', label: 'Analytics', icon: BarChart3 },
  { id: 'citizen', label: 'Citizen Portal', icon: UserCheck },
  { id: 'responder', label: 'Responder Portal', icon: Radio },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeRole,
  setActiveRole,
  onOpenReportModal,
  onToggleAssistant,
  onOpenChallenge,
  onOpenCrisisMode,
  alertCount
}) => {
  const [time, setTime] = useState<string>('');
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const desktopMoreRef = useRef<HTMLDivElement>(null);
  const mobileMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toISOString().substring(11, 19) + ' UTC');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close the More dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideDesktop = desktopMoreRef.current && desktopMoreRef.current.contains(target);
      const insideMobile = mobileMoreRef.current && mobileMoreRef.current.contains(target);
      if (!insideDesktop && !insideMobile) {
        setIsMoreOpen(false);
      }
    };
    if (isMoreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMoreOpen]);

  const handleSelect = (id: string) => {
    setCurrentTab(id);
    setIsMoreOpen(false);
  };

  const isInMore = MORE_ITEMS.some(item => item.id === currentTab);

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
          <span className="hidden lg:inline text-slate-600">GEO: LIVE OPERATIONAL CENTER</span>
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
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Brand Logo & Tagline */}
        <div 
          onClick={() => setCurrentTab('landing')}
          className="flex items-center space-x-2 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-blue-600 to-red-500 p-0.5 shadow-lg shadow-teal-200/40 group-hover:shadow-teal-300/50 transition-all">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-800">
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
          {NAV_ITEMS.map(item => {
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

          {/* More Dropdown */}
          <div className="relative" ref={desktopMoreRef}>
            <button
              onClick={() => setIsMoreOpen(prev => !prev)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                isInMore
                  ? 'bg-white text-teal-700 border border-teal-200 shadow-sm font-bold'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${isInMore ? 'text-teal-600' : ''}`} />
              <span>More</span>
            </button>

            {isMoreOpen && (
              <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-[2100] animate-in fade-in zoom-in-95 duration-150">
                {MORE_ITEMS.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-teal-50 text-teal-700 font-bold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                      }`}
                    >
                      <span className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center justify-end space-x-2 min-w-0">

          {/* Incident Report CTA */}
          <button
            onClick={onOpenReportModal}
            title="Report incident"
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white font-bold rounded-lg text-xs transition-all shadow-md shadow-teal-200/40 cursor-pointer shrink-0"
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">REPORT INCIDENT</span>
          </button>

          {/* AI Assistant Drawer Toggle */}
          <button
            onClick={onToggleAssistant}
            title="AI Copilot"
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-slate-50 text-teal-600 border border-teal-200 rounded-lg text-xs font-medium transition-all relative shadow-sm cursor-pointer shrink-0"
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
          <div className="relative min-w-0 pr-1.5 sm:pr-0">
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
              aria-label="Select role"
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-lg pl-3 pr-2.5 py-1.5 focus:ring-1 focus:ring-teal-500 focus:outline-none cursor-pointer shadow-sm font-semibold max-w-[128px] sm:max-w-[190px] truncate"
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
        {NAV_ITEMS.map(item => {
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

        {/* Mobile More Dropdown */}
        <div className="relative shrink-0" ref={mobileMoreRef}>
          <button
            onClick={() => setIsMoreOpen(prev => !prev)}
            className={`flex items-center space-x-1 px-3 py-1 rounded whitespace-nowrap cursor-pointer ${
              isInMore ? 'bg-white text-teal-700 border border-teal-200 shadow-sm font-bold' : 'text-slate-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>More</span>
          </button>

          {isMoreOpen && (
            <div className="fixed top-[104px] right-4 left-4 sm:left-auto sm:w-64 z-[2100] bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
              {MORE_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <span className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </span>
                    {isActive && <Check className="w-3.5 h-3.5 text-teal-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
