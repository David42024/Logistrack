import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData { date: string; count: number }

export const DeliveryChart: React.FC<{ data: ChartData[] }> = ({ data }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Entregas por día</h3>
      <span className="text-xs text-gray-500 dark:text-gray-400">Últimos 7 días</span>
    </div>
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="var(--chart-axis)" />
        <YAxis tick={{ fontSize: 12 }} stroke="var(--chart-axis)" allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--tooltip-bg)',
            borderColor: 'var(--tooltip-border)',
            color: 'var(--tooltip-text)',
          }}
          labelStyle={{ color: 'var(--tooltip-text)' }}
        />
        <Bar dataKey="count" name="Entregas" fill="var(--chart-bar)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

interface DriverReport { driverName: string; deliveries: number }

export const ReportTable: React.FC<{ data: DriverReport[] }> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.deliveries), 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Top transportistas</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">Ranking</span>
      </div>
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i} className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {i + 1}. {d.driverName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{d.deliveries} entregas</p>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-sky-300">
                {max ? Math.round((d.deliveries / max) * 100) : 0}%
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-blue-500 dark:bg-sky-400"
                style={{ width: `${max ? (d.deliveries / max) * 100 : 0}%` }}
              />
            </div>
          </div>
        ))}
        {data.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400 dark:border-gray-700">
            Sin datos de transportistas
          </div>
        )}
      </div>
    </div>
  );
};
