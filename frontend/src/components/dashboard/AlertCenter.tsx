import React from 'react';
import { Incident } from '../../types/dashboard.types';
import { AlertCard } from './AlertCard';

interface AlertCenterProps {
  incidents: Incident[];
  loading?: boolean;
  onResolve?: (id: string) => void;
  onViewOrder?: (id: string) => void;
  onReassign?: (id: string) => void;
}

export const AlertCenter: React.FC<AlertCenterProps> = ({ 
  incidents, 
  loading, 
  onResolve, 
  onViewOrder, 
  onReassign 
}) => {

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Centro de Alertas</h3>
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const criticalIncidents = incidents.filter(i => i.severity === 'critical');
  const mediumIncidents = incidents.filter(i => i.severity === 'medium');
  const infoIncidents = incidents.filter(i => i.severity === 'info');

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Centro de Alertas</h3>
        <div className="flex gap-2">
          {criticalIncidents.length > 0 && (
            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
              {criticalIncidents.length} Críticas
            </span>
          )}
          {mediumIncidents.length > 0 && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
              {mediumIncidents.length} Medias
            </span>
          )}
          {infoIncidents.length > 0 && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              {infoIncidents.length} Info
            </span>
          )}
        </div>
      </div>

      {incidents.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">No hay incidencias activas</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {incidents.map((incident) => (
            <AlertCard
              key={incident.id}
              incident={incident}
              onResolve={onResolve}
              onViewOrder={onViewOrder}
              onReassign={onReassign}
            />
          ))}
        </div>
      )}
    </div>
  );
};
