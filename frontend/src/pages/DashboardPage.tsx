import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { KPICard } from '../components/dashboard/KPICard';
import { AlertCenter } from '../components/dashboard/AlertCenter';
import { OrdersTable } from '../components/dashboard/OrdersTable';
import { AnalyticsChart } from '../components/dashboard/AnalyticsChart';
import { SystemHealthIndicator } from '../components/dashboard/SystemHealthIndicator';
import { DashboardModeToggle } from '../components/dashboard/DashboardModeToggle';
import { DashboardMode, MetricType } from '../types/dashboard.types';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import {
  useOperationalKPIs,
  usePerformanceKPIs,
  useIncidents,
  useOrders,
  useSystemHealth,
  useChartData,
} from '../hooks/useDashboardData';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<DashboardMode>(DashboardMode.ANALYTICS);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>(MetricType.DELIVERIES);
  const { socket } = useSocket();
  const { user } = useAuth();
  const { can } = usePermissions(user?.role);
  const canCreateOrder = can('orders.create');
  const canUpdateOrder = can('orders.update');
  const canAssignOrder = can('orders.assign');
  const canResolveIncident = can('incidents.update');
  const canReassignIncident = can('incidents.assign');

  // Data hooks
  const operationalKPIs = useOperationalKPIs();
  const performanceKPIs = usePerformanceKPIs();
  const incidents = useIncidents();
  const orders = useOrders();
  const systemHealth = useSystemHealth();
  const chartData = useChartData(selectedMetric);

  // WebSocket real-time updates
  useEffect(() => {
    if (!socket) return;

    const refreshAll = () => {
      operationalKPIs.refetch();
      performanceKPIs.refetch();
      incidents.refetch();
      orders.refetch();
      systemHealth.refetch();
      chartData.refetch();
    };

    socket.on('order-status-updated', refreshAll);
    socket.on('order-created', refreshAll);
    socket.on('incident-created', refreshAll);
    socket.on('incident-resolved', refreshAll);

    return () => {
      socket.off('order-status-updated', refreshAll);
      socket.off('order-created', refreshAll);
      socket.off('incident-created', refreshAll);
      socket.off('incident-resolved', refreshAll);
    };
  }, [socket, operationalKPIs, performanceKPIs, incidents, orders, systemHealth, chartData]);

  const handleResolveIncident = (incidentId: string) => {
    const order = incidents.data?.find(i => i.id === incidentId);
    if (order?.orderId) navigate(`/orders/${order.orderId}`);
  };

  const handleViewOrder = (id: string) => {
    navigate(`/orders/${id}`);
  };

  const handleReassignOrder = (id: string) => {
    navigate(`/orders/${id}`);
  };

  const handleUpdateOrderStatus = (id: string) => {
    navigate(`/orders/${id}`);
  };

  const handleAssignDriver = (id: string) => {
    navigate(`/orders/${id}`);
  };

  const handleMetricChange = (metric: MetricType) => {
    setSelectedMetric(metric);
  };

  const isAnyLoading = 
    operationalKPIs.loading || 
    performanceKPIs.loading || 
    incidents.loading || 
    orders.loading || 
    systemHealth.loading;

  return (
    <MainLayout title="Inicio" showFooter>
      {/* Header with system health and mode toggle */}
      <div className="flex items-center justify-between mb-6">
        <SystemHealthIndicator health={systemHealth.data} loading={systemHealth.loading} />
        <DashboardModeToggle mode={mode} onModeChange={setMode} />
      </div>

      {/* Operational KPIs */}
      {operationalKPIs.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <KPICard metric={operationalKPIs.data.ordersInRoute} loading={operationalKPIs.loading} />
          <KPICard metric={operationalKPIs.data.pendingOrders} loading={operationalKPIs.loading} />
          <KPICard metric={operationalKPIs.data.activeVehicles} loading={operationalKPIs.loading} />
          <KPICard metric={operationalKPIs.data.activeIncidents} loading={operationalKPIs.loading} />
          <KPICard metric={operationalKPIs.data.delayedOrders} loading={operationalKPIs.loading} />
        </div>
      )}

      {/* Performance KPIs */}
      {performanceKPIs.data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <KPICard metric={performanceKPIs.data.deliveredToday} loading={performanceKPIs.loading} />
          <KPICard metric={performanceKPIs.data.slaCompliance} loading={performanceKPIs.loading} />
          <KPICard metric={performanceKPIs.data.avgDeliveryTime} loading={performanceKPIs.loading} />
          <KPICard metric={performanceKPIs.data.successRate} loading={performanceKPIs.loading} />
          <KPICard metric={performanceKPIs.data.avgDelay} loading={performanceKPIs.loading} />
        </div>
      )}

      {mode === DashboardMode.ANALYTICS ? (
        /* Analytics Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Chart - 2/3 width */}
          <div className="lg:col-span-2">
            <AnalyticsChart 
              data={chartData.data} 
              loading={chartData.loading}
              selectedMetric={selectedMetric}
              onMetricChange={handleMetricChange}
            />
          </div>

          {/* Alert Center - 1/3 width */}
          <div className="lg:col-span-1">
            <AlertCenter
              incidents={incidents.data}
              loading={incidents.loading}
              onResolve={handleResolveIncident}
              onViewOrder={handleViewOrder}
              onReassign={handleReassignOrder}
              canResolve={canResolveIncident}
              canReassign={canReassignIncident}
            />
          </div>
        </div>
      ) : (
        /* Operations Mode - Dispatch Board */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Alert Center - 1/3 width */}
          <div className="lg:col-span-1">
            <AlertCenter
              incidents={incidents.data}
              loading={incidents.loading}
              onResolve={handleResolveIncident}
              onViewOrder={handleViewOrder}
              onReassign={handleReassignOrder}
              canResolve={canResolveIncident}
              canReassign={canReassignIncident}
            />
          </div>

          {/* Orders Table - 2/3 width */}
          <div className="lg:col-span-2">
            <OrdersTable
              orders={orders.data}
              loading={orders.loading}
              onViewOrder={handleViewOrder}
              onUpdateStatus={handleUpdateOrderStatus}
              onAssignDriver={handleAssignDriver}
              onCreateOrder={() => navigate('/orders/create')}
              showCreate={canCreateOrder}
              showUpdateStatus={canUpdateOrder}
              showAssignDriver={canAssignOrder}
            />
          </div>
        </div>
      )}

      {/* Orders Table - Full width (always shown in analytics mode) */}
      {mode === DashboardMode.ANALYTICS && (
        <div>
          <OrdersTable
            orders={orders.data}
            loading={orders.loading}
            onViewOrder={handleViewOrder}
            onUpdateStatus={handleUpdateOrderStatus}
            onAssignDriver={handleAssignDriver}
            onCreateOrder={() => navigate('/orders/create')}
          />
        </div>
      )}
    </MainLayout>
  );
};

export default DashboardPage;
