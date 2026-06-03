import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { LoadingSpinner } from '../components/common/StatsCard';
import { DashboardKpiCards, KpiData } from '../components/dashboard/DashboardKpiCards';
import { DeliveryAreaChart } from '../components/dashboard/DeliveryAreaChart';
import RecentOrdersTable from '../components/dashboard/RecentOrdersTable';
import IncidentsPanel from '../components/dashboard/IncidentsPanel';
import { reportsApi } from '../api/reports.api';
import { ordersApi } from '../api/orders.api';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import { Order, OrderHistory } from '../types/order.types';

// ------------------------------------------------------------------
// Helper: extract incidents from order history
// ------------------------------------------------------------------
interface DashboardIncident {
  id: string;
  description: string;
  priority: 'alta' | 'media' | 'baja';
  orderNumber?: string;
}

function extractIncidents(orders: Order[]): DashboardIncident[] {
  const incidents: DashboardIncident[] = [];

  for (const order of orders) {
    if (!order.history) continue;
    for (const entry of order.history) {
      const hasIncident =
        entry.incidentImage ||
        (entry.notes && entry.notes.trim().length > 0 && entry.newStatus !== 'delivered');

      if (hasIncident) {
        const desc = entry.notes?.trim()
          ? `Pedido ${order.orderNumber} - ${entry.notes.trim()}`
          : `Pedido ${order.orderNumber} - Incidencia registrada`;

        // Rough priority heuristic
        const lowerDesc = desc.toLowerCase();
        let priority: DashboardIncident['priority'] = 'media';
        if (
          lowerDesc.includes('cancelad') ||
          lowerDesc.includes('accident') ||
          lowerDesc.includes('urgente') ||
          lowerDesc.includes('alta')
        ) {
          priority = 'alta';
        } else if (
          lowerDesc.includes('retraso') ||
          lowerDesc.includes('dirección') ||
          lowerDesc.includes('no encontrad')
        ) {
          priority = 'media';
        } else {
          priority = 'baja';
        }

        incidents.push({
          id: entry.id,
          description: desc,
          priority,
          orderNumber: order.orderNumber,
        });
      }
    }
  }

  return incidents;
}

// ------------------------------------------------------------------
// Main Dashboard Page
// ------------------------------------------------------------------
const DashboardPage: React.FC = () => {
  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [deliveries, setDeliveries] = useState<{ date: string; count: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [deliveryDays, setDeliveryDays] = useState(30);
  const { socket } = useSocket();

  const fetchData = useCallback(async (days = deliveryDays) => {
    try {
      const [kpiRes, delRes, ordersRes, allOrdersRes] = await Promise.all([
        reportsApi.getKPIs(),
        reportsApi.getDeliveriesByDay(days),
        ordersApi.getAll({ page: 1, limit: 5 }),
        ordersApi.getAll({ page: 1, limit: 50 }),
      ]);

      const kpiData = kpiRes.data;

      // Merge delivered count: use totalDelivered if available, fallback to deliveredToday
      setKpis({
        ...kpiData,
        delivered: kpiData.totalDelivered ?? kpiData.deliveredToday ?? 0,
      });

      setDeliveries(delRes.data || []);
      setRecentOrders(ordersRes.data?.data || []);
      setAllOrders(allOrdersRes.data?.data || []);
    } catch {
      toast.error('Error al cargar el dashboard');
    } finally {
      setLoading(false);
    }
  }, [deliveryDays]);

  useEffect(() => {
    fetchData(deliveryDays);
  }, []);

  // Socket real-time updates
  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchData(deliveryDays);
    socket.on('order-status-updated', refresh);
    socket.on('order-created', refresh);
    return () => {
      socket.off('order-status-updated', refresh);
      socket.off('order-created', refresh);
    };
  }, [socket, deliveryDays]);

  const handlePeriodChange = async (days: number) => {
    setDeliveryDays(days);
    try {
      const delRes = await reportsApi.getDeliveriesByDay(days);
      setDeliveries(delRes.data || []);
    } catch {
      toast.error('Error al cargar datos del gráfico');
    }
  };

  const incidents = extractIncidents(allOrders);

  if (loading) {
    return (
      <MainLayout title="Inicio" showFooter>
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Inicio" showFooter notificationCount={incidents.length > 0 ? incidents.length : undefined}>
      {/* KPI Cards Row */}
      {kpis && (
        <div className="mb-6">
          <DashboardKpiCards kpis={kpis} />
        </div>
      )}

      {/* Middle Section: Chart + Recent Orders */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Delivery Chart - 3/5 width */}
        <div className="lg:col-span-3">
          <DeliveryAreaChart data={deliveries} onPeriodChange={handlePeriodChange} />
        </div>

        {/* Recent Orders Table - 2/5 width */}
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={recentOrders} />
        </div>
      </div>

      {/* Incidents Panel - Full width */}
      <div>
        <IncidentsPanel incidents={incidents} total={incidents.length + 1} />
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
