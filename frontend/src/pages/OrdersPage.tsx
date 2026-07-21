import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import OrderTable from '../components/orders/OrderTable';
import { AssignDriverModal } from '../components/drivers/DriverCard';
import { ordersApi } from '../api/orders.api';
import { Order, PaginatedOrders } from '../types/order.types';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Package,
  Search,
  SlidersHorizontal,
  Plus,
  RefreshCw,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from 'lucide-react';

/* ─────────── Metric Card ─────────── */
interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  active?: boolean;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon, color, active, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative flex flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
      active
        ? `${color} border-transparent shadow-lg scale-[1.02]`
        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md'
    }`}
  >
    <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${active ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
      <span className={active ? 'text-white/90' : 'text-current'}>{icon}</span>
      {label}
    </div>
    <span className={`text-2xl font-black tabular-nums ${active ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
      {value}
    </span>
  </button>
);

/* ─────────── Status pill filter ─────────── */
const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'transit', label: 'En Tránsito' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const STATUS_PILL_COLORS: Record<string, string> = {
  '': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700',
  pending: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  preparing: 'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  transit: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  delivered: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  cancelled: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
};

const STATUS_PILL_ACTIVE: Record<string, string> = {
  '': 'bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 border-gray-700 dark:border-gray-200',
  pending: 'bg-amber-500 text-white border-amber-500',
  preparing: 'bg-violet-600 text-white border-violet-600',
  transit: 'bg-blue-600 text-white border-blue-600',
  delivered: 'bg-emerald-600 text-white border-emerald-600',
  cancelled: 'bg-red-600 text-white border-red-600',
};

/* ─────────── Main Component ─────────── */
const OrdersPage: React.FC = () => {
  const [data, setData] = useState<PaginatedOrders | null>(null);
  const [allData, setAllData] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [assignOrder, setAssignOrder] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const canAssign = user?.role === 'admin' || user?.role === 'coordinator';

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [pagedRes, allRes] = await Promise.all([
        ordersApi.getAll({ page, limit: 10, status, search }),
        ordersApi.getAll({ page: 1, limit: 9999 }),
      ]);
      setData(pagedRes.data);
      setAllData(allRes.data?.data || []);
    } catch {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, status, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchOrders(true);
    socket.on('order-created', handler);
    socket.on('order-status-updated', handler);
    socket.on('order-assigned', handler);
    return () => {
      socket.off('order-created', handler);
      socket.off('order-status-updated', handler);
      socket.off('order-assigned', handler);
    };
  }, [socket, fetchOrders]);

  // Compute counts from allData
  const counts = {
    total: allData.length,
    pending: allData.filter(o => o.status === 'pending').length,
    transit: allData.filter(o => o.status === 'transit').length,
    delivered: allData.filter(o => o.status === 'delivered').length,
    cancelled: allData.filter(o => o.status === 'cancelled').length,
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const handleManualRefresh = () => {
    fetchOrders(true);
  };

  return (
    <MainLayout title="Gestión de Pedidos">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Package size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              Gestión de Pedidos
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {data?.total ?? 0} pedidos en total · actualización en tiempo real
            </p>
          </div>
          {/* Live pulse indicator */}
          <div className="flex items-center gap-1.5 ml-2">
            <span className={`w-2 h-2 rounded-full ${refreshing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
              {refreshing ? 'Actualizando...' : 'En vivo'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
          {canAssign && (
            <button
              onClick={() => navigate('/orders/create')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm shadow-blue-600/20"
            >
              <Plus size={16} />
              <span>Nuevo Pedido</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Metrics row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <MetricCard
          label="Pendientes"
          value={counts.pending}
          icon={<Clock size={13} />}
          color="bg-gradient-to-br from-amber-500 to-orange-500"
          active={status === 'pending'}
          onClick={() => handleStatusChange(status === 'pending' ? '' : 'pending')}
        />
        <MetricCard
          label="En Tránsito"
          value={counts.transit}
          icon={<Truck size={13} />}
          color="bg-gradient-to-br from-blue-600 to-indigo-600"
          active={status === 'transit'}
          onClick={() => handleStatusChange(status === 'transit' ? '' : 'transit')}
        />
        <MetricCard
          label="Entregados"
          value={counts.delivered}
          icon={<CheckCircle2 size={13} />}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
          active={status === 'delivered'}
          onClick={() => handleStatusChange(status === 'delivered' ? '' : 'delivered')}
        />
        <MetricCard
          label="Cancelados"
          value={counts.cancelled}
          icon={<XCircle size={13} />}
          color="bg-gradient-to-br from-red-500 to-rose-600"
          active={status === 'cancelled'}
          onClick={() => handleStatusChange(status === 'cancelled' ? '' : 'cancelled')}
        />
      </div>

      {/* ── Filter bar ── */}
      <div className="mb-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por N° pedido, cliente o ruta..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onBlur={() => { setSearch(searchInput); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </form>

        {/* Status pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                status === s.value ? STATUS_PILL_ACTIVE[s.value] : STATUS_PILL_COLORS[s.value]
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <OrderTable
          orders={data?.data || []}
          showAssign={canAssign}
          onAssign={(order) => setAssignOrder(order)}
          loading={loading}
          pagination={
            data && data.totalPages > 1
              ? {
                  currentPage: page,
                  totalPages: data.totalPages,
                  onPageChange: (p) => setPage(p),
                }
              : undefined
          }
        />
      </div>

      {/* ── Assign modal ── */}
      {assignOrder && (
        <AssignDriverModal
          orderId={assignOrder.id}
          onClose={() => setAssignOrder(null)}
          onAssigned={() => {
            setAssignOrder(null);
            fetchOrders(true);
            toast.success('Transportista asignado correctamente');
          }}
        />
      )}
    </MainLayout>
  );
};

export default OrdersPage;
