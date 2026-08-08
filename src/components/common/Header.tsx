import React from 'react';
import { Shield, LogOut, User, Cpu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from './Badge';

export const Header: React.FC = () => {
  const { user, profile, role, signOut } = useAuth();

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 border border-red-500/40 shadow-lg shadow-red-950/60">
            <Shield className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 animate-ping"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                DISASTER<span className="text-red-500">X</span> <span className="text-cyan-400">AI</span>
              </span>
              <Badge variant={role}>{role}</Badge>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">
              National AI Disaster Intelligence Platform
            </p>
          </div>
        </div>

        {/* User Profile & Sign Out Button */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-200">{profile?.full_name || user?.email || `Authenticated ${role}`}</div>
            <div className="text-[10px] text-slate-400 font-mono">Role: {role}</div>
          </div>
          <button
            onClick={signOut}
            title="Sign Out to Role Selection Landing Page"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/80 hover:border-red-700 text-slate-300 hover:text-red-300 transition-colors border border-slate-700 text-xs font-bold flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
