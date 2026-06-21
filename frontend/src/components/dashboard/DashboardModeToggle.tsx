import React from 'react';
import { DashboardMode } from '../../types/dashboard.types';

interface DashboardModeToggleProps {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
}

export const DashboardModeToggle: React.FC<DashboardModeToggleProps> = ({ 
  mode, 
  onModeChange 
}) => {
  return (
    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => onModeChange(DashboardMode.ANALYTICS)}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === DashboardMode.ANALYTICS
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Modo Analítico
      </button>
      <button
        onClick={() => onModeChange(DashboardMode.OPERATIONS)}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === DashboardMode.OPERATIONS
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Modo Operación en Vivo
      </button>
    </div>
  );
};
