import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ChartData, MetricType } from '../../types/dashboard.types';

interface AnalyticsChartProps {
  data: ChartData | null;
  loading?: boolean;
  selectedMetric: MetricType;
  onMetricChange?: (metric: MetricType) => void;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ 
  data, 
  loading, 
  selectedMetric,
  onMetricChange 
}) => {
  const metrics = [
    { value: MetricType.DELIVERIES, label: 'Entregas', icon: '📦' },
    { value: MetricType.INCIDENTS, label: 'Incidencias', icon: '⚠️' },
    { value: MetricType.AVG_TIME, label: 'Tiempo promedio', icon: '⏱️' },
    { value: MetricType.ACTIVE_ORDERS, label: 'Pedidos activos', icon: '📋' },
  ];

  const handleMetricChange = (metric: MetricType) => {
    onMetricChange?.(metric);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data || !data.datasets[0] || data.datasets[0].data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay datos disponibles</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Selecciona una métrica para visualizar los datos</p>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = data.labels.map((label, index) => ({
    fecha: label,
    valor: data.datasets[0].data[index] || 0,
  }));

  const getMetricColor = () => {
    switch (selectedMetric) {
      case MetricType.DELIVERIES:
        return '#3B82F6';
      case MetricType.INCIDENTS:
        return '#EF4444';
      case MetricType.AVG_TIME:
        return '#F59E0B';
      case MetricType.ACTIVE_ORDERS:
        return '#10B981';
      default:
        return '#3B82F6';
    }
  };

  const metricColor = getMetricColor();

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Análisis de métricas</h3>
        <div className="flex gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.value}
              onClick={() => handleMetricChange(metric.value)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                selectedMetric === metric.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span>{metric.icon}</span>
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={metricColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={metricColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
          <XAxis 
            dataKey="fecha" 
            stroke="#94A3B8"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#94A3B8"
            domain={[0, 'dataMax']}
            style={{ fontSize: '12px' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1E293B',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#F8FAFC',
            }}
            itemStyle={{ color: '#F8FAFC' }}
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke={metricColor}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        {data.datasets.map((dataset, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: metricColor }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">{dataset.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
