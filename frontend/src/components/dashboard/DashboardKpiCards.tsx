import React from 'react';
import { Package, ClipboardList, Truck, CheckSquare, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KpiData {
  totalOrders?: number;
  pending?: number;
  inTransit?: number;
  delivered?: number;
  deliveredToday?: number;
  ordersToday?: number;
  avgDeliveryHours?: number;
}

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  bgColor?: string;
  iconBg?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trend = 'up', trendValue, bgColor, iconBg }) => {
  const trendIcon =
    trend === 'up' ? (
      <TrendingUp size={14} className="text-green-500" />
    ) : trend === 'down' ? (
      <TrendingDown size={14} className="text-red-500" />
    ) : (
      <Minus size={14} className="text-blue-400" />
    );

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-gray-700 dark:bg-gray-800">
      {/* Icon */}
      <div className={`flex-shrink-0 rounded-xl p-3 ${iconBg || 'bg-blue-50 dark:bg-blue-900/30'}`}>
        <div className="text-blue-500 dark:text-blue-400">{icon}</div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{title}</p>
        <div className="flex items-end gap-2 mt-0.5">
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
            {value.toLocaleString('es-ES')}
          </p>
          <div className="flex items-center gap-0.5 mb-0.5">
            {trendIcon}
          </div>
        </div>
        {trendValue && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{trendValue}</p>
        )}
      </div>
    </div>
  );
};

export const DashboardKpiCards: React.FC<{ kpis: KpiData }> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Pedidos registrados"
        value={kpis.totalOrders ?? 0}
        icon={<Package size={24} strokeWidth={1.5} />}
        trend="up"
        trendValue={`Hoy: ${kpis.ordersToday ?? 0}`}
        iconBg="bg-blue-50 dark:bg-blue-900/30"
      />
      <KpiCard
        title="Pedidos pendientes"
        value={kpis.pending ?? 0}
        icon={<ClipboardList size={24} strokeWidth={1.5} />}
        trend="down"
        trendValue={`En preparación`}
        iconBg="bg-amber-50 dark:bg-amber-900/30"
      />
      <KpiCard
        title="Pedidos en ruta"
        value={kpis.inTransit ?? 0}
        icon={<Truck size={24} strokeWidth={1.5} />}
        trend="neutral"
        trendValue={`Prom. ${kpis.avgDeliveryHours ?? 0}h entrega`}
        iconBg="bg-purple-50 dark:bg-purple-900/30"
      />
      <KpiCard
        title="Pedidos entregados"
        value={kpis.delivered ?? kpis.deliveredToday ?? 0}
        icon={<CheckSquare size={24} strokeWidth={1.5} />}
        trend="up"
        trendValue={`Hoy: ${kpis.deliveredToday ?? 0}`}
        iconBg="bg-green-50 dark:bg-green-900/30"
      />
    </div>
  );
};

export default DashboardKpiCards;
