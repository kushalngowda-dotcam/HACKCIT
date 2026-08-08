import React from 'react';
import { clsx } from 'clsx';
import { IncidentSeverity, ResourceStatus, UserRole } from '../../types/database';

interface BadgeProps {
  children: React.ReactNode;
  variant?: IncidentSeverity | ResourceStatus | UserRole | 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'CRITICAL':
      case 'danger':
        return 'bg-red-950/80 text-red-400 border-red-800/60 font-semibold shadow-sm shadow-red-950/50 animate-pulse';
      case 'HIGH':
      case 'warning':
      case 'ASSIGNED':
      case 'EN_ROUTE':
        return 'bg-orange-950/80 text-orange-400 border-orange-800/60 font-semibold';
      case 'MEDIUM':
      case 'info':
      case 'ON_SCENE':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/60 font-medium';
      case 'LOW':
      case 'AVAILABLE':
      case 'success':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60 font-medium';
      case 'COMMANDER':
      case 'ADMIN':
        return 'bg-purple-950/80 text-purple-400 border-purple-800/60 font-semibold';
      case 'RESPONDER':
      case 'HOSPITAL':
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60 font-medium';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs border transition-all duration-150',
        getVariantStyles(),
        className
      )}
    >
      {children}
    </span>
  );
};
