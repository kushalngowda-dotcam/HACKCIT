import React from 'react';
import { AlertCircle, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No incidents reported yet.',
  message = 'Operational database contains no active records for this criteria.',
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-slate-900/50 border border-slate-800 text-center my-4">
      <div className="p-3 bg-slate-800/80 rounded-full text-slate-400 mb-3 border border-slate-700/60 shadow-inner">
        {icon || <FolderOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-4">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium text-sm rounded-lg shadow-lg shadow-red-900/30 transition-all flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};
