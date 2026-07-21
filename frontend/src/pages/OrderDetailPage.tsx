import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import OrderStatusTimeline from '../components/common/OrderStatusTimeline';
import { AssignDriverModal } from '../components/drivers/DriverCard';
import { LoadingSpinner } from '../components/common/StatsCard';
import { ordersApi } from '../api/orders.api';
import { Order } from '../types/order.types';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { formatDateTime } from '../utils/dateFormats';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  User,
  Truck,
  MapPin,
  Package,
  Weight,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Clock,
} from 'lucide-react';

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['transit', 'cancelled'],
  transit: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  transit: 'En Tránsito',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

/* ─────────── Info row ─────────── */
const InfoRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent?: string;
}> = ({ icon, label, value, accent }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <div className={`mt-0.5 flex-shrink-0 ${accent || 'text-gray-400 dark:text-gray-500'}`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <div className="text-sm font-medium text-gray-800 dark:text-gray-100">{value}</div>
    </div>
  </div>
);

/* ─────────── Cancel modal ─────────── */
const CancelModal: React.FC<{
  onConfirm: (reason: string) => void;
  onClose: () => void;
  loading: boolean;
}> = ({ onConfirm, onClose, loading }) => {
  const [reason, setReason] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
            <XCircle size={18} className="text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">Cancelar Pedido</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Esta acción no se puede deshacer</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Motivo de cancelación *
            </label>
            <textarea
              rows={3}
              placeholder="Describe el motivo de la cancelación..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Volver
            </button>
            <button
              onClick={() => { if (reason.trim()) onConfirm(reason); else toast.error('El motivo es obligatorio'); }}
              disabled={loading || !reason.trim()}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              {loading ? 'Cancelando...' : 'Confirmar Cancelación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────── Main component ─────────── */
const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [incidentNote, setIncidentNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const fetchOrder = async () => {
    if (!id) return;
    try {
      const res = await ordersApi.getOne(id);
      setOrder(res.data);
    } catch {
      toast.error('Pedido no encontrado');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  useEffect(() => {
    if (!socket) return;
    const handler = (updated: any) => { if (updated.id === id) setOrder(updated); };
    socket.on('order-status-updated', handler);
    socket.on('order-assigned', handler);
    return () => {
      socket.off('order-status-updated', handler);
      socket.off('order-assigned', handler);
    };
  }, [socket, id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    if (newStatus === 'cancelled') { setShowCancel(true); return; }
    setUpdating(true);
    try {
      const res = await ordersApi.updateStatus(order.id, {
        status: newStatus,
        notes: incidentNote || undefined,
      });
      setOrder(res.data);
      setIncidentNote('');
      toast.success(`Estado actualizado a "${STATUS_LABELS[newStatus]}"`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al actualizar estado');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async (reason: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await ordersApi.updateStatus(order.id, {
        status: 'cancelled',
        cancellationReason: reason,
      });
      setOrder(res.data);
      setShowCancel(false);
      toast.success('Pedido cancelado');
    } catch {
      toast.error('Error al cancelar el pedido');
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <MainLayout title="Detalle del Pedido">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    );
  if (!order) return null;

  const canChangeStatus =
    user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'driver';
  const canAssign =
    (user?.role === 'admin' || user?.role === 'coordinator') &&
    !order.driverId &&
    order.status === 'pending';
  const nextStatuses = STATUS_TRANSITIONS[order.status] || [];

  return (
    <MainLayout title={`Pedido ${order.orderNumber}`}>
      <div className="max-w-5xl mx-auto">
        {/* ── Breadcrumb / back ── */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
              onClick={() => navigate('/orders')}
            >
              Pedidos
            </span>
            <ChevronRight size={12} />
            <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{order.orderNumber}</span>
          </div>
          <div className="ml-auto">
            <OrderStatusBadge status={order.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ── Left column: main info ── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header card */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <h1 className="text-2xl font-black font-mono text-gray-900 dark:text-gray-100 tracking-tight">
                    {order.orderNumber}
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
                    <Clock size={11} />
                    Creado el {formatDateTime(order.createdAt)}
                  </p>
                </div>
              </div>

              {/* Info rows */}
              <div className="px-6 divide-y divide-gray-100 dark:divide-gray-800">
                <InfoRow
                  icon={<User size={15} />}
                  label="Cliente"
                  value={
                    <div>
                      <p className="font-semibold">{order.customer?.name || 'Desconocido'}</p>
                      {order.customer?.email && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{order.customer.email}</p>
                      )}
                    </div>
                  }
                  accent="text-blue-500"
                />
                <InfoRow
                  icon={<Truck size={15} />}
                  label="Transportista"
                  value={
                    order.driver ? (
                      <span className="font-semibold">{order.driver.name}</span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic text-sm">Sin asignar</span>
                    )
                  }
                  accent="text-indigo-500"
                />
                <InfoRow
                  icon={<MapPin size={15} />}
                  label="Ruta"
                  value={
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{order.origin}</span>
                      <ChevronRight size={13} className="text-gray-400" />
                      <span className="font-semibold">{order.destination}</span>
                    </div>
                  }
                  accent="text-emerald-500"
                />
                <InfoRow
                  icon={<Package size={15} />}
                  label="Tipo de Mercancía"
                  value={<span className="font-semibold">{order.merchandiseType}</span>}
                  accent="text-amber-500"
                />
                <InfoRow
                  icon={<Weight size={15} />}
                  label="Peso"
                  value={<span className="font-semibold">{order.weight} kg</span>}
                  accent="text-orange-500"
                />
                {order.estimatedDate && (
                  <InfoRow
                    icon={<Calendar size={15} />}
                    label="Fecha Estimada de Entrega"
                    value={<span className="font-semibold">{formatDateTime(order.estimatedDate)}</span>}
                    accent="text-purple-500"
                  />
                )}
                {order.deliveredAt && (
                  <InfoRow
                    icon={<CheckCircle2 size={15} />}
                    label="Entregado el"
                    value={<span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatDateTime(order.deliveredAt)}</span>}
                    accent="text-emerald-500"
                  />
                )}
              </div>
            </div>

            {/* Cancellation reason */}
            {order.cancellationReason && (
              <div className="rounded-2xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 p-4 flex items-start gap-3">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">
                    Motivo de cancelación
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300">{order.cancellationReason}</p>
                </div>
              </div>
            )}

            {/* Status actions */}
            {canChangeStatus && nextStatuses.length > 0 && (
              <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  Cambiar Estado del Pedido
                </h3>
                <textarea
                  placeholder="Nota o incidencia (opcional)..."
                  value={incidentNote}
                  onChange={(e) => setIncidentNote(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none mb-3"
                  rows={2}
                />
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={updating}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-sm ${
                        s === 'cancelled'
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-950/60 shadow-none'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                      }`}
                    >
                      {updating ? (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-current/30 border-t-current animate-spin" />
                      ) : s === 'cancelled' ? (
                        <XCircle size={15} />
                      ) : (
                        <ChevronRight size={15} />
                      )}
                      {STATUS_LABELS[s] || s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Assign driver */}
            {canAssign && (
              <button
                onClick={() => setShowAssign(true)}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-600/20"
              >
                <Truck size={18} />
                Asignar Transportista
              </button>
            )}
          </div>

          {/* ── Right column: timeline ── */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 h-fit">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-5">
              Línea de Tiempo
            </h3>
            <OrderStatusTimeline
              currentStatus={order.status}
              history={order.history || []}
            />
          </div>
        </div>
      </div>

      {/* ── Assign driver modal ── */}
      {showAssign && (
        <AssignDriverModal
          orderId={order.id}
          onClose={() => setShowAssign(false)}
          onAssigned={(updated) => {
            setOrder(updated);
            setShowAssign(false);
            toast.success('Transportista asignado');
          }}
        />
      )}

      {/* ── Cancel modal ── */}
      {showCancel && (
        <CancelModal
          onConfirm={handleCancel}
          onClose={() => setShowCancel(false)}
          loading={updating}
        />
      )}
    </MainLayout>
  );
};

export default OrderDetailPage;
