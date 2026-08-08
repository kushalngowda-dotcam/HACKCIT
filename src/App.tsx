import React, { Component, ReactNode, useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Header } from './components/common/Header';
import { OfflineBanner } from './components/common/OfflineBanner';
import { AuthPage } from './features/auth/AuthPage';
import { CitizenDashboard } from './features/citizen/CitizenDashboard';
import { ResponderDashboard } from './features/responder/ResponderDashboard';
import { HospitalDashboard } from './features/hospital/HospitalDashboard';
import { CommanderDashboard } from './features/commander/CommanderDashboard';
import { AdminDashboard } from './features/admin/AdminDashboard';
import { Shield, Info, Radio, Database, AlertTriangle, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured } from './lib/supabase';
import { useIncidents } from './hooks/useIncidents';
import { useResources } from './hooks/useResources';
import { useHospitals } from './hooks/useHospitals';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[DisasterX ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-4 rounded-2xl bg-red-950/80 border border-red-800 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-center gap-2 text-red-400 font-extrabold text-lg uppercase">
              <AlertTriangle className="w-6 h-6 animate-pulse" /> Emergency App Recovery Mode
            </div>
            <p className="text-xs text-slate-300">
              An unexpected runtime error was caught safely. No data was lost.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-red-300 text-left overflow-x-auto">
              {this.state.error?.message || 'Runtime exception occurred'}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" /> Reload System Portal
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  const { incidents } = useIncidents();
  const { resources } = useResources();
  const { hospitalCapacities } = useHospitals();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // If user is not authenticated, show the Auth / Role selection landing page!
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderRoleDashboard = () => {
    switch (role) {
      case 'CITIZEN':
        return <CitizenDashboard />;
      case 'RESPONDER':
        return <ResponderDashboard />;
      case 'HOSPITAL':
        return <HospitalDashboard />;
      case 'COMMANDER':
        return <CommanderDashboard />;
      case 'ADMIN':
        return <AdminDashboard />;
      default:
        return <CitizenDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* Offline Status & Queue Banner */}
      <OfflineBanner />

      {/* Primary Top Header with User Info & Sign Out */}
      <Header onOpenAssistant={() => setIsAssistantOpen(true)} />

      {/* Supabase Environment Warning Banner if unconfigured */}
      {!isSupabaseConfigured && (
        <div className="bg-amber-950/80 border-b border-amber-800 text-amber-300 text-xs px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-5xl">
            <Info className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              <b>Development Mode Notice:</b> Running in network-aware mode. Reports are submitted to Supabase when connected, or to IndexedDB offline queue when disconnected.
            </span>
          </div>
        </div>
      )}

      {/* Main Role-Based Dashboard View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        <ErrorBoundary>
          {renderRoleDashboard()}
        </ErrorBoundary>
      </main>

      <AIAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        incidents={incidents}
        resources={resources}
        hospitals={hospitalCapacities}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 p-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span className="font-bold text-slate-200">DISASTERX AI</span>
            <span>— National AI Disaster Intelligence & Emergency Response Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> Zero Hardcoded Operational Data
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-emerald-400" /> Authenticated Role: {role}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
