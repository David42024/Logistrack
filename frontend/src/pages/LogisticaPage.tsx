import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import OrderTable from '../components/orders/OrderTable';
import OrderFilters from '../components/orders/OrderFilters';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import OrderStatusTimeline from '../components/common/OrderStatusTimeline';
import { AssignDriverModal } from '../components/drivers/DriverCard';
import { LoadingSpinner } from '../components/common/StatsCard';
import { ordersApi } from '../api/orders.api';
import { routesApi, Route, RouteStop } from '../api/routes.api';
import { driversApi } from '../api/drivers.api';
import { Order, PaginatedOrders } from '../types/order.types';
import { Driver } from '../types/driver.types';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { formatDateTime } from '../utils/dateFormats';
import toast from 'react-hot-toast';
import {
  Package, Route as RouteIcon, MapPin, Truck, Calendar, Clock, Navigation,
  Plus, Check, Play, Trash2, Sliders, ChevronRight, X, ArrowRight,
  UserCheck, Weight, AlertTriangle
} from 'lucide-react';

type TabKey = 'orders' | 'routes' | 'assignments';

const statusTransitions: Record<string, string[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['transit', 'cancelled'],
  transit: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const transitionLabels: Record<string, string> = {
  preparing: 'Preparando',
  transit: 'En Tránsito',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const LogisticaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('orders');
  const { socket } = useSocket();
  const { user } = useAuth();

  /* ── Shared Tabs component ── */
  const TabHeader = () => (
    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
      {([
        { key: 'orders' as TabKey, label: 'Pedidos y Entregas', icon: <Package size={16} /> },
        { key: 'routes' as TabKey, label: 'Planificación de Rutas', icon: <RouteIcon size={16} /> },
        { key: 'assignments' as TabKey, label: 'Centro de Asignación', icon: <UserCheck size={16} /> },
      ]).map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === tab.key
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <MainLayout title="Pedidos y Entregas">
      <TabHeader />
      {activeTab === 'orders' && <OrdersTab />}
      {activeTab === 'routes' && <RoutesTab />}
      {activeTab === 'assignments' && <AssignmentsTab />}
    </MainLayout>
  );
};

/* ════════════════════════ TAB 1: PEDIDOS Y ENTREGAS ════════════════════════ */
const OrdersTab: React.FC = () => {
  const [data, setData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [incidentNote, setIncidentNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();
  const { can: hasPerm } = usePermissions(user?.role);

  const canCreateOrder = hasPerm('orders.create');
  const canAssignOrder = hasPerm('orders.assign');
  const canUpdateOrder = hasPerm('orders.update');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getAll({ page, limit: 10, status, search });
      setData(res.data);
    } catch {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchOrders();
    socket.on('order-created', handler);
    socket.on('order-status-updated', handler);
    socket.on('order-assigned', handler);
    return () => {
      socket.off('order-created', handler);
      socket.off('order-status-updated', handler);
      socket.off('order-assigned', handler);
    };
  }, [socket, fetchOrders]);

  useEffect(() => {
    if (!socket || !selectedOrder) return;
    const handler = (updated: any) => {
      if (updated.id === selectedOrder.id) setSelectedOrder(updated);
    };
    socket.on('order-status-updated', handler);
    socket.on('order-assigned', handler);
    return () => {
      socket.off('order-status-updated', handler);
      socket.off('order-assigned', handler);
    };
  }, [socket, selectedOrder]);

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder) return;
    if (newStatus === 'cancelled') { setShowCancel(true); return; }
    setUpdating(true);
    try {
      const res = await ordersApi.updateStatus(selectedOrder.id, {
        status: newStatus,
        notes: incidentNote || undefined,
      });
      setSelectedOrder(res.data);
      toast.success('Estado actualizado');
      fetchOrders();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedOrder || !cancelReason.trim()) { toast.error('El motivo es obligatorio'); return; }
    setUpdating(true);
    try {
      const res = await ordersApi.updateStatus(selectedOrder.id, {
        status: 'cancelled',
        cancellationReason: cancelReason,
      });
      setSelectedOrder(res.data);
      setShowCancel(false);
      toast.success('Pedido cancelado');
      fetchOrders();
    } catch {
      toast.error('Error al cancelar');
    } finally {
      setUpdating(false);
    }
  };

  const handleOrderClick = async (order: Order) => {
    try {
      const res = await ordersApi.getOne(order.id);
      setSelectedOrder(res.data);
    } catch {
      setSelectedOrder(order);
    }
  };

  const renderSVGMap = (order: Order) => {
    const width = 300, height = 140;
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-slate-900 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <circle cx={50} cy={height / 2} r="8" fill="#3b82f6" stroke="#60a5fa" strokeWidth="2" />
          <circle cx={width - 50} cy={height / 2} r="8" fill="#22c55e" stroke="#4ade80" strokeWidth="2" />
          <line x1="58" y1={height / 2} x2={width - 58} y2={height / 2} stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 4" />
          <text x="50" y={height / 2 + 25} fill="#94a3b8" fontSize="9" textAnchor="middle">{order.origin}</text>
          <text x={width - 50} y={height / 2 + 25} fill="#94a3b8" fontSize="9" textAnchor="middle">{order.destination}</text>
        </svg>
      </div>
    );
  };

  return (
    <div className="flex gap-6">
      {/* Orders List */}
      <div className={`flex-1 ${selectedOrder ? 'hidden lg:block' : ''}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gestión de Pedidos</h2>
          <div className="flex gap-2">
            {canCreateOrder && (
              <button
                onClick={() => window.location.href = '/logistica?action=new'}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                + Nuevo Pedido
              </button>
            )}
          </div>
        </div>
        <OrderFilters
          status={status}
          search={search}
          onStatusChange={(v) => { setStatus(v); setPage(1); }}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
        />
        <OrderTable
          orders={data?.data || []}
          showAssign={canAssignOrder}
          onAssign={(order) => handleOrderClick(order)}
          loading={loading}
          pagination={
            data && data.totalPages > 1
              ? { currentPage: page, totalPages: data.totalPages, onPageChange: (p) => setPage(p) }
              : undefined
          }
        />
      </div>

      {/* Drawer - Order Detail */}
      {selectedOrder && (
        <div className="w-full lg:w-[420px] xl:w-[480px] shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden sticky top-24">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div>
                <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  {selectedOrder.orderNumber}
                  <OrderStatusBadge status={selectedOrder.status} />
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Cliente</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{selectedOrder.customer?.name}</p>
                  <p className="text-xs text-gray-400">{selectedOrder.customer?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Transportista</p>
                  {selectedOrder.driver ? (
                    <p className="font-medium text-gray-800 dark:text-gray-100">{selectedOrder.driver.name}</p>
                  ) : (
                    <p className="text-gray-400 italic text-xs">Sin asignar</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Origen</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{selectedOrder.origin}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Destino</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{selectedOrder.destination}</p>
                </div>
              </div>

              <div className="flex gap-4 text-sm border-t border-gray-100 dark:border-gray-800 pt-4">
                <div>
                  <p className="text-xs text-gray-500">Mercancía</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{selectedOrder.merchandiseType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Peso</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{selectedOrder.weight} kg</p>
                </div>
              </div>

              {selectedOrder.cancellationReason && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
                  <strong>Motivo cancelación:</strong> {selectedOrder.cancellationReason}
                </div>
              )}

              {/* Mini Route Map */}
              {renderSVGMap(selectedOrder)}

              {/* Status Change */}
              {(() => {
                const nextStatuses = statusTransitions[selectedOrder.status] || [];
                if (nextStatuses.length === 0) return null;
                return (
                  <div>
                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Cambiar Estado</h4>
                    <textarea
                      placeholder="Nota (opcional)..."
                      value={incidentNote}
                      onChange={(e) => setIncidentNote(e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
                      rows={2}
                    />
                    <div className="flex flex-wrap gap-2">
                      {nextStatuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(s)}
                          disabled={updating}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                            s === 'cancelled'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {updating ? '...' : `→ ${transitionLabels[s] || s}`}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Assign Driver */}
          {canAssignOrder && !selectedOrder.driverId && selectedOrder.status === 'pending' && (
                <button
                  onClick={() => setShowAssign(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  Asignar Transportista
                </button>
              )}

              {/* Timeline */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                <OrderStatusTimeline currentStatus={selectedOrder.status} history={selectedOrder.history || []} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showAssign && selectedOrder && (
        <AssignDriverModal
          orderId={selectedOrder.id}
          onClose={() => setShowAssign(false)}
          onAssigned={(updated) => { setSelectedOrder(updated); setShowAssign(false); toast.success('Asignado'); fetchOrders(); }}
        />
      )}

      {showCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">Cancelar Pedido</h3>
            <textarea
              placeholder="Motivo de cancelación (obligatorio)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 bg-transparent"
              rows={3}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} className="flex-1 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">Volver</button>
              <button onClick={handleCancel} disabled={updating} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                {updating ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════ TAB 2: PLANIFICACIÓN DE RUTAS ════════════════════════ */
const RoutesTab: React.FC = () => {
  const { user } = useAuth();
  const { can: hasRoutePerm } = usePermissions(user?.role);
  const canCreateRoute = hasRoutePerm('routes.create');
  const canUpdateRoute = hasRoutePerm('routes.update');
  const canDeleteRoute = hasRoutePerm('routes.delete');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRouteForm, setNewRouteForm] = useState({
    name: '', description: '', scheduledDate: new Date().toISOString().split('T')[0], driverId: '',
  });
  const [showAddStopForm, setShowAddStopForm] = useState(false);
  const [selectedOrderForStop, setSelectedOrderForStop] = useState('');
  const [optimizing, setOptimizing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [routesRes, driversRes, ordersRes] = await Promise.all([
        routesApi.getAll(),
        driversApi.getAll(),
        ordersApi.getAll({ status: 'pending', limit: 100 }),
      ]);
      setRoutes(routesRes.data);
      setDrivers(driversRes.data);
      setPendingOrders(ordersRes.data.data || []);
      if (selectedRoute) {
        const refreshed = routesRes.data.find((r: Route) => r.id === selectedRoute.id);
        if (refreshed) setSelectedRoute(refreshed);
      }
    } catch { toast.error('Error al cargar datos de rutas'); }
    finally { setLoading(false); }
  }, [selectedRoute]);

  useEffect(() => { fetchData(); }, []);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteForm.name || !newRouteForm.scheduledDate) { toast.error('Nombre y Fecha son obligatorios'); return; }
    try {
      const res = await routesApi.create(newRouteForm);
      toast.success('Ruta creada con éxito');
      setShowCreateForm(false);
      setNewRouteForm({ name: '', description: '', scheduledDate: new Date().toISOString().split('T')[0], driverId: '' });
      fetchData();
      setSelectedRoute(res.data);
    } catch { toast.error('Error al crear ruta'); }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute || !selectedOrderForStop) return;
    const order = pendingOrders.find((o) => o.id === selectedOrderForStop);
    if (!order) return;
    const latBase = -8.11, lngBase = -79.03;
    try {
      await routesApi.addStop(selectedRoute.id, {
        address: order.destination,
        latitude: latBase + (Math.random() - 0.5) * 0.05,
        longitude: lngBase + (Math.random() - 0.5) * 0.05,
        orderId: order.id,
        notes: `Mercadería: ${order.merchandiseType}`,
      });
      toast.success('Parada agregada a la ruta');
      setShowAddStopForm(false);
      setSelectedOrderForStop('');
      fetchData();
    } catch { toast.error('Error al agregar parada'); }
  };

  const handleOptimizeRoute = async (routeId: string) => {
    setOptimizing(true);
    try { await routesApi.optimize(routeId); toast.success('Optimización completada'); fetchData(); }
    catch { toast.error('Error al optimizar ruta'); }
    finally { setOptimizing(false); }
  };

  const handleDeleteRoute = async (routeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Seguro que deseas eliminar esta ruta?')) return;
    try {
      await routesApi.delete(routeId);
      toast.success('Ruta eliminada');
      if (selectedRoute?.id === routeId) setSelectedRoute(null);
      fetchData();
    } catch { toast.error('Error al eliminar ruta'); }
  };

  const handleStartRoute = async (routeId: string) => {
    try { await routesApi.updateStatus(routeId, 'in_progress'); toast.success('Ruta iniciada'); fetchData(); }
    catch { toast.error('Error al iniciar ruta'); }
  };

  const handleCompleteRoute = async (routeId: string) => {
    try { await routesApi.updateStatus(routeId, 'completed'); toast.success('Ruta completada'); fetchData(); }
    catch { toast.error('Error al completar ruta'); }
  };

  const getStatusBadge = (status: string) => {
    const maps: Record<string, { label: string; style: string }> = {
      planned: { label: 'Planificada', style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300' },
      in_progress: { label: 'En Ruta', style: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
      completed: { label: 'Completada', style: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' },
      cancelled: { label: 'Cancelada', style: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
    };
    const c = maps[status] || { label: status, style: 'bg-gray-100 text-gray-800 dark:bg-gray-800' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.style}`}>{c.label}</span>;
  };

  const getStopStatusBadge = (status: string) => {
    const maps: Record<string, { label: string; style: string }> = {
      pending: { label: 'Pendiente', style: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
      in_progress: { label: 'En Proceso', style: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
      completed: { label: 'Visitada', style: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' },
      skipped: { label: 'Omitida', style: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
    };
    const c = maps[status] || { label: status, style: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.style}`}>{c.label}</span>;
  };

  const renderSVGMap = (stops: RouteStop[]) => {
    if (stops.length === 0) return (
      <div className="h-48 flex items-center justify-center border border-dashed border-gray-300 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-400">
        <MapPin size={24} className="mr-2 text-gray-300" />
        <span className="text-xs">Agrega paradas para ver el mapa</span>
      </div>
    );
    const padding = 40, width = 450, height = 220;
    const lats = stops.map((s) => Number(s.latitude));
    const lngs = stops.map((s) => Number(s.longitude));
    const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 1, lngRange = maxLng - minLng || 1;
    const getX = (lng: number) => padding + ((lng - minLng) / lngRange) * (width - 2 * padding);
    const getY = (lat: number) => height - (padding + ((lat - minLat) / latRange) * (height - 2 * padding));
    const points = stops.map((s) => ({ x: getX(Number(s.longitude)), y: getY(Number(s.latitude)), seq: s.sequence, status: s.status, address: s.address }));
    let pathD = '';
    if (points.length > 1) pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
    return (
      <div className="border border-gray-200 dark:border-gray-800 rounded-xl bg-slate-900 overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {points.length > 1 && <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6 6" />}
          {points.map((p, i) => {
            let color = '#94a3b8';
            if (p.status === 'completed') color = '#22c55e';
            if (p.status === 'in_progress') color = '#3b82f6';
            return (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="12" fill="#1e293b" stroke={color} strokeWidth="2" />
                <circle cx={p.x} cy={p.y} r="3.5" fill={color} />
                <text x={p.x} y={p.y + 3.5} fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle">{p.seq}</text>
                <title>{`Parada ${p.seq}: ${p.address} (${p.status})`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

  if (loading && !routes.length && !selectedRoute) return <LoadingSpinner size="lg" />;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-4">
        <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100">Rutas Disponibles</h3>
            <p className="text-xs text-gray-500">{routes.length} creadas</p>
          </div>
          {canCreateRoute && (
            <button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-1.5 transition-colors" title="Crear Nueva Ruta">
              <Plus size={18} />
            </button>
          )}
        </div>

        {showCreateForm && (
          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3">Programar Ruta</h4>
            <form onSubmit={handleCreateRoute} className="space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500">Nombre *</label>
                <input required type="text" placeholder="Ej. Zona Centro" value={newRouteForm.name} onChange={(e) => setNewRouteForm({ ...newRouteForm, name: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500">Descripción</label>
                <input type="text" placeholder="Distribución mañana" value={newRouteForm.description} onChange={(e) => setNewRouteForm({ ...newRouteForm, description: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500">Fecha *</label>
                <input required type="date" value={newRouteForm.scheduledDate} onChange={(e) => setNewRouteForm({ ...newRouteForm, scheduledDate: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-gray-500">Conductor</label>
                <select value={newRouteForm.driverId} onChange={(e) => setNewRouteForm({ ...newRouteForm, driverId: e.target.value })} className={inputClass}>
                  <option value="">Sin asignar</option>
                  {drivers.map((d) => <option key={d.id} value={d.id}>{d.name} ({d.vehicleType || 'Sin vehículo'})</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 border border-gray-300 py-1.5 text-xs rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 text-xs rounded-lg font-semibold">Crear Ruta</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {routes.map((r) => (
            <div key={r.id} onClick={() => setSelectedRoute(r)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedRoute?.id === r.id ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 shadow-md' : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-850'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                    <RouteIcon size={16} className="text-blue-500" />
                    {r.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{r.description || 'Sin descripción'}</p>
                </div>
                {getStatusBadge(r.status)}
              </div>
              <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500">
                <span className="flex items-center gap-1"><Calendar size={12} />{r.scheduledDate}</span>
                <span className="font-semibold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{r.stops?.length || 0} paradas</span>
              </div>
            </div>
          ))}
          {routes.length === 0 && <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">No hay rutas programadas</div>}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        {selectedRoute ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{selectedRoute.name}</h3>
                  {getStatusBadge(selectedRoute.status)}
                </div>
                <p className="text-sm text-gray-500 mt-1">{selectedRoute.description}</p>
              </div>
              <div className="flex gap-2">
                {canUpdateRoute && selectedRoute.status === 'planned' && (
                  <button onClick={() => handleStartRoute(selectedRoute.id)} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <Play size={14} /> Iniciar Ruta
                  </button>
                )}
                {canUpdateRoute && selectedRoute.status === 'in_progress' && (
                  <button onClick={() => handleCompleteRoute(selectedRoute.id)} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <Check size={14} /> Completar Ruta
                  </button>
                )}
                {canUpdateRoute && (
                  <button onClick={() => handleOptimizeRoute(selectedRoute.id)} disabled={optimizing || (selectedRoute.stops?.length || 0) < 2} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50">
                    <Sliders size={14} /> {optimizing ? 'Optimizando...' : 'Optimizar'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200/50">
                <span className="text-[10px] uppercase font-bold text-gray-400">Total Paradas</span>
                <span className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-1 block">{selectedRoute.stops?.length || 0}</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200/50">
                <span className="text-[10px] uppercase font-bold text-gray-400">Distancia Est</span>
                <span className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-1 block flex items-center gap-1"><Navigation size={14} />{(selectedRoute.stops?.length || 0) * 4.2} km</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200/50">
                <span className="text-[10px] uppercase font-bold text-gray-400">Duración Est</span>
                <span className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-1 block flex items-center gap-1"><Clock size={14} />{(selectedRoute.stops?.length || 0) * 20} min</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200/50">
                <span className="text-[10px] uppercase font-bold text-gray-400">Conductor</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2 block flex items-center gap-1"><Truck size={14} />{drivers.find((d) => d.id === selectedRoute.driverId)?.name || 'Sin conductor'}</span>
              </div>
            </div>

            {renderSVGMap(selectedRoute.stops || [])}

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-gray-800 dark:text-gray-200">Paradas</h4>
                {canUpdateRoute && selectedRoute.status === 'planned' && (
                  <button onClick={() => setShowAddStopForm(!showAddStopForm)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-bold">
                    <Plus size={14} /> Agregar Parada
                  </button>
                )}
              </div>

              {showAddStopForm && (
                <form onSubmit={handleAddStop} className="flex gap-3 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  <select required value={selectedOrderForStop} onChange={(e) => setSelectedOrderForStop(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                    <option value="">Seleccionar pedido...</option>
                    {pendingOrders.map((o) => <option key={o.id} value={o.id}>{o.orderNumber} - {o.destination}</option>)}
                  </select>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold">Agregar</button>
                  <button type="button" onClick={() => setShowAddStopForm(false)} className="border border-gray-300 dark:border-gray-700 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">Cerrar</button>
                </form>
              )}

              <div className="space-y-2">
                {(selectedRoute.stops || []).sort((a, b) => a.sequence - b.sequence).map((stop) => (
                  <div key={stop.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">{stop.sequence}</div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{stop.address}</p>
                        {stop.notes && <p className="text-[10px] text-gray-400 mt-0.5">{stop.notes}</p>}
                      </div>
                    </div>
                    {getStopStatusBadge(stop.status)}
                  </div>
                ))}
                {(selectedRoute.stops?.length || 0) === 0 && (
                  <div className="py-6 text-center text-xs text-gray-400 italic">No hay paradas. Haz clic en "Agregar Parada".</div>
                )}
              </div>
            </div>

            {canDeleteRoute && (
              <button onClick={(e) => handleDeleteRoute(selectedRoute.id, e)} className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1">
                <Trash2 size={14} /> Eliminar Ruta
              </button>
            )}
          </div>
        ) : (
          <div className="h-full min-h-[50vh] flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 p-8 text-center text-gray-400">
            <RouteIcon size={48} className="text-blue-400/40 mb-3" />
            <h3 className="font-bold text-gray-700 dark:text-gray-200 text-lg">Panel de Planificación</h3>
            <p className="text-sm text-gray-400 mt-2 max-w-sm">Selecciona una ruta de la lista lateral para gestionarla.</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ════════════════════════ TAB 3: CENTRO DE ASIGNACIÓN ════════════════════════ */
const AssignmentsTab: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, driversRes] = await Promise.all([
        ordersApi.getAll({ status: 'pending', limit: 50 }),
        driversApi.getAvailable(),
      ]);
      const fetchedOrders = ordersRes.data.data || ordersRes.data;
      const fetchedDrivers = driversRes.data.data || driversRes.data;
      setOrders(fetchedOrders);
      setDrivers(fetchedDrivers);
      if (selectedOrder) {
        const stillExists = fetchedOrders.find((o: Order) => o.id === selectedOrder.id);
        if (!stillExists) setSelectedOrder(null);
      }
    } catch { toast.error('Error al cargar datos de asignación'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAssign = async (driverId: string) => {
    if (!selectedOrder) return;
    setAssigning(driverId);
    try {
      await ordersApi.assignDriver(selectedOrder.id, driverId);
      toast.success('Transportista asignado exitosamente');
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      setSelectedOrder(null);
      setTimeout(fetchData, 500);
    } catch { toast.error('Error al asignar el transportista'); }
    finally { setAssigning(null); }
  };

  if (loading && !orders.length && !drivers.length) return <LoadingSpinner size="lg" />;

  return (
    <div className="mb-6">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Selecciona un pedido pendiente y asígnalo al transportista más adecuado.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-16rem)] min-h-[500px]">
        {/* Left: Pending Orders */}
        <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Pedidos Pendientes
              <span className="ml-auto bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 py-0.5 px-2.5 rounded-full text-xs font-bold">{orders.length}</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/20">
            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><Package className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No hay pedidos pendientes</p></div>
            ) : orders.map((order) => {
              const isSelected = selectedOrder?.id === order.id;
              return (
                <div key={order.id} onClick={() => setSelectedOrder(isSelected ? null : order)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-md' : 'border-transparent bg-white dark:bg-gray-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300">{order.orderNumber}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(order.createdAt)}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div><p className="text-gray-600 dark:text-gray-400 text-xs">Origen</p><p className="font-medium text-gray-900 dark:text-gray-100">{order.origin}</p></div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <div><p className="text-gray-600 dark:text-gray-400 text-xs">Destino</p><p className="font-medium text-gray-900 dark:text-gray-100">{order.destination}</p></div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                    <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium"><Package className="w-4 h-4 text-gray-400" />{order.merchandiseType}</span>
                    <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium"><Weight className="w-4 h-4 text-gray-400" />{order.weight} kg</span>
                  </div>
                  {isSelected && <div className="absolute inset-y-0 right-0 w-1 bg-blue-500 rounded-r-xl" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Available Drivers */}
        <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-opacity duration-300 ${!selectedOrder ? 'opacity-60' : 'opacity-100'}`}>
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-green-500" />
              Transportistas Disponibles
              <span className="ml-auto bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 py-0.5 px-2.5 rounded-full text-xs font-bold">{drivers.length}</span>
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/20 relative">
            {!selectedOrder && orders.length > 0 && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 dark:bg-gray-800/60 backdrop-blur-[1px]">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
                  <ArrowRight className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="font-medium text-gray-800 dark:text-gray-200">Selecciona un pedido primero</p>
                </div>
              </div>
            )}
            {drivers.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><Truck className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No hay transportistas disponibles</p></div>
            ) : drivers.map((driver) => (
              <div key={driver.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg">
                    {driver.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{driver.name}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" />{driver.vehicleType || 'Furgoneta'}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Disponible</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleAssign(driver.id)} disabled={!selectedOrder || assigning === driver.id}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${selectedOrder ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'}`}>
                  {assigning === driver.id ? <LoadingSpinner size="sm" /> : <><UserCheck className="w-4 h-4" /> Asignar</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticaPage;
