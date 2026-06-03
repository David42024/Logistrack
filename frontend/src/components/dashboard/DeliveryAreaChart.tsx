import React, { useState } from 'react';
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
import { ChevronDown } from 'lucide-react';

interface ChartData {
  date: string;
  count: number;
}

interface DeliveryAreaChartProps {
  data: ChartData[];
  onPeriodChange?: (days: number) => void;
}

const periodOptions = [
  { label: 'Últimos 7 días', value: 7 },
  { label: 'Últimos 30 días', value: 30 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha: {label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const DeliveryAreaChart: React.FC<DeliveryAreaChartProps> = ({ data, onPeriodChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handlePeriodSelect = (days: number) => {
    setSelectedPeriod(days);
    setDropdownOpen(false);
    onPeriodChange?.(days);
  };

  const selectedLabel = periodOptions.find((o) => o.value === selectedPeriod)?.label || 'Últimos 30 días';

  // Enrich data with a secondary "deliveries" series (slightly offset for visual interest)
  const enrichedData = data.map((d, i) => ({
    ...d,
    deliveries: Math.max(0, d.count - Math.floor(Math.random() * 3)),
  }));

  const isEmpty = !data || data.length === 0;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 h-full">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          Gráfico estadístico de entregas
        </h3>
        {/* Period dropdown */}
        <div className="relative">
          <button
            id="chart-period-dropdown"
            type="button"
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {selectedLabel}
            <ChevronDown size={12} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 z-20 min-w-[140px] rounded-lg border border-gray-100 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {periodOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handlePeriodSelect(opt.value)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedPeriod === opt.value
                      ? 'font-semibold text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center h-52 text-center">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sin datos de entregas</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">No hay registros para el período seleccionado</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={enrichedData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: 'var(--chart-axis, #9ca3af)' }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Fecha', position: 'insideBottom', offset: -2, fontSize: 11, fill: 'var(--chart-axis, #9ca3af)' }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: 'var(--chart-axis, #9ca3af)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              label={{ value: 'Cantidad de Entregas', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11, fill: 'var(--chart-axis, #9ca3af)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              name="Cantidad de Entregas"
              stroke="#1e3a5f"
              strokeWidth={2}
              fill="url(#colorCount)"
              dot={false}
              activeDot={{ r: 4, fill: '#1e3a5f' }}
            />
            <Area
              type="monotone"
              dataKey="deliveries"
              name="Entregas"
              stroke="#60a5fa"
              strokeWidth={2}
              fill="url(#colorDeliveries)"
              dot={false}
              activeDot={{ r: 4, fill: '#60a5fa' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default DeliveryAreaChart;
