import React from 'react';
import { SystemHealth, SystemStatus } from '../../types/dashboard.types';

interface SystemHealthIndicatorProps {
  health: SystemHealth | null;
  loading?: boolean;
}

export const SystemHealthIndicator: React.FC<SystemHealthIndicatorProps> = ({ 
  health, 
  loading 
}) => {
  if (loading) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  const getStatusColor = (status: SystemStatus) => {
    switch (status) {
      case SystemStatus.OPERATIONAL:
        return 'bg-green-500';
      case SystemStatus.MODERATE:
        return 'bg-yellow-500';
      case SystemStatus.CRITICAL:
        return 'bg-red-500';
    }
  };

  const getStatusLabel = (status: SystemStatus) => {
    switch (status) {
      case SystemStatus.OPERATIONAL:
        return '🟢 Sistema operativo';
      case SystemStatus.MODERATE:
        return '🟡 Congestión moderada';
      case SystemStatus.CRITICAL:
        return '🔴 Retrasos críticos';
    }
  };

  const getConnectionStatus = (status: 'connected' | 'disconnected' | 'connecting') => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-red-600';
      case 'connecting':
        return 'text-yellow-600';
    }
  };

  const getConnectionLabel = (status: 'connected' | 'disconnected' | 'connecting') => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'disconnected':
        return 'Desconectado';
      case 'connecting':
        return 'Conectando...';
    }
  };

  const formatLastUpdate = (date: string) => {
    const now = new Date();
    const lastUpdate = new Date(date);
    const diff = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    
    if (diff < 60) return `hace ${diff} seg`;
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    return `hace ${Math.floor(diff / 3600)} h`;
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(health.status)} animate-pulse`}></div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getStatusLabel(health.status)}
        </span>
      </div>
      
      <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-500">Última actualización:</span>
        <span className="text-sm text-gray-700 dark:text-gray-300">{formatLastUpdate(health.lastUpdate)}</span>
      </div>
      
      <div className="h-4 w-px bg-gray-300 dark:bg-gray-600"></div>
      
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${getConnectionStatus(health.connectionStatus)}`}></div>
        <span className={`text-xs font-medium ${getConnectionStatus(health.connectionStatus)}`}>
          {getConnectionLabel(health.connectionStatus)}
        </span>
      </div>
    </div>
  );
};
