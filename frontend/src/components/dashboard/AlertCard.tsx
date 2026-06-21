import React from 'react';
import { Incident, IncidentSeverity } from '../../types/dashboard.types';

interface AlertCardProps {
  incident: Incident;
  onResolve?: (id: string) => void;
  onViewOrder?: (id: string) => void;
  onReassign?: (id: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({ 
  incident, 
  onResolve, 
  onViewOrder, 
  onReassign 
}) => {
  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.CRITICAL:
        return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case IncidentSeverity.MEDIUM:
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case IncidentSeverity.INFO:
        return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
    }
  };

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.CRITICAL:
        return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
      case IncidentSeverity.MEDIUM:
        return 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300';
      case IncidentSeverity.INFO:
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300';
    }
  };

  const getSeverityLabel = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.CRITICAL:
        return '🔴 Crítica';
      case IncidentSeverity.MEDIUM:
        return '🟠 Media';
      case IncidentSeverity.INFO:
        return '🟢 Informativa';
    }
  };

  return (
    <div className={`border-l-4 ${getSeverityColor(incident.severity)} rounded-r-lg p-4 mb-3 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(incident.severity)}`}>
            {getSeverityLabel(incident.severity)}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{incident.activeTime}</span>
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{incident.orderNumber}</span>
      </div>
      
      <p className="text-sm text-gray-800 dark:text-gray-200 mb-3">{incident.description}</p>
      
      <div className="flex gap-2">
        <button
          onClick={() => onResolve?.(incident.id)}
          className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          Resolver
        </button>
        <button
          onClick={() => onViewOrder?.(incident.orderId)}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          Ver pedido
        </button>
        <button
          onClick={() => onReassign?.(incident.orderId)}
          className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          Reasignar
        </button>
      </div>
    </div>
  );
};
