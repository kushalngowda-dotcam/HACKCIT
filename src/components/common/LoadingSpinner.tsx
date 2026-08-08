import React from 'react';

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading operational intelligence...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px]">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-red-950 border-t-red-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-slate-800 border-b-cyan-400 animate-spin animate-reverse"></div>
      </div>
      <span className="mt-4 text-xs font-mono text-slate-400 tracking-wider uppercase">{label}</span>
    </div>
  );
};
