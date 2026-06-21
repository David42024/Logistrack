import React from 'react';
import { KPIMetric } from '../../types/dashboard.types';

interface KPICardProps {
  metric: KPIMetric;
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({ metric, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: 'good' | 'warning' | 'critical') => {
    switch (status) {
      case 'good':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30';
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
    }
  };

  const getVariationColor = (variation: number) => {
    return variation >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getVariationIcon = (variation: number) => {
    return variation >= 0 ? '↑' : '↓';
  };

  const renderSparkline = (trend: number[]) => {
    const max = Math.max(...trend);
    const min = Math.min(...trend);
    const range = max - min || 1;
    
    const points = trend.map((value, index) => {
      const x = (index / (trend.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg
        viewBox="0 0 100 100"
        className="w-full h-12"
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          stroke={metric.status === 'good' ? '#10B981' : metric.status === 'warning' ? '#F59E0B' : '#EF4444'}
          strokeWidth="2"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.label}</span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
          {metric.status === 'good' ? 'Normal' : metric.status === 'warning' ? 'Atención' : 'Crítico'}
        </span>
      </div>
      
      <div className="mb-2">
        <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{metric.value}</span>
        <span className={`ml-2 text-sm font-medium ${getVariationColor(metric.variation)}`}>
          {getVariationIcon(metric.variation)} {Math.abs(metric.variation)}%
        </span>
      </div>

      <div className="mt-4">
        {renderSparkline(metric.trend)}
      </div>
    </div>
  );
};
