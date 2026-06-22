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

const statusTransitions: Record<string, string[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['transit', 'cancelled'],
  transit: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const statusLabels: Record<string, string> = {
  preparing: 'Preparando',
  transit: 'En Tránsito',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAssign, setShowAssign] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
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
    const handler = (updated: any) => {
      if (updated.id === id) setOrder(updated);
    };
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
      toast.success('Estado actualizado');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!order || !cancelReason.trim()) { toast.error('El motivo es obligatorio'); return; }
    setUpdating(true);
    try {
      const res = await ordersApi.updateStatus(order.id, {
        status: 'cancelled',
        cancellationReason: cancelReason,
      });
      setOrder(res.data);
      setShowCancel(false);
      toast.success('Pedido cancelado');
    } catch {
      toast.error('Error al cancelar');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <MainLayout title="Detalle del Pedido"><LoadingSpinner size="lg" /></MainLayout>;
  if (!order) return null;

  const canChangeStatus = user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'driver';
  const canAssign = (user?.role === 'admin' || user?.role === 'coordinator') && !order.driverId && order.status === 'pending';
  const nextStatuses = statusTransitions[order.status] || [];

  return (
    <MainLayout title={`Pedido ${order.orderNumber}`}>
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 font-mono">{order.orderNumber}</h2>
                <p className="text-sm text-gray-500 mt-1">Creado: {formatDateTime(order.createdAt)}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Cliente</p>
                <p className="font-medium">{order.customer?.name}</p>
                <p className="text-gray-400">{order.customer?.email}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Transportista</p>
                {order.driver ? (
                  <p className="font-medium">{order.driver.name}</p>
                ) : (
                  <p className="text-gray-300 italic">Sin asignar</p>
                )}
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Origen</p>
                <p className="font-medium">{order.origin}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Destino</p>
                <p className="font-medium">{order.destination}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Mercancía</p>
                <p className="font-medium">{order.merchandiseType}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Peso</p>
                <p className="font-medium">{order.weight} kg</p>
              </div>
              {order.estimatedDate && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Fecha Estimada</p>
                  <p className="font-medium">{formatDateTime(order.estimatedDate)}</p>
                </div>
              )}
              {order.deliveredAt && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Entregado</p>
                  <p className="font-medium text-green-600">{formatDateTime(order.deliveredAt)}</p>
                </div>
              )}
            </div>

            {order.cancellationReason && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                <strong>Motivo cancelación:</strong> {order.cancellationReason}
              </div>
            )}
          </div>

          {/* Actions */}
          {canChangeStatus && nextStatuses.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-700 mb-3">Cambiar Estado</h3>
              <div>
                <textarea
                  placeholder="Nota (opcional)..."
                  value={incidentNote}
                  onChange={(e) => setIncidentNote(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={updating}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${
                        s === 'cancelled'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {updating ? '...' : `→ ${statusLabels[s] || s}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {canAssign && (
            <button
              onClick={() => setShowAssign(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              🚚 Asignar Transportista
            </button>
          )}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <OrderStatusTimeline currentStatus={order.status} history={order.history || []} />
        </div>
      </div>

      {showAssign && (
        <AssignDriverModal
          orderId={order.id}
          onClose={() => setShowAssign(false)}
          onAssigned={(updated) => { setOrder(updated); setShowAssign(false); toast.success('Asignado'); }}
        />
      )}

      {showCancel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-3">Cancelar Pedido</h3>
            <textarea
              placeholder="Motivo de cancelación (obligatorio)..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowCancel(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">Volver</button>
              <button onClick={handleCancel} disabled={updating} className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                {updating ? 'Cancelando...' : 'Confirmar Cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default OrderDetailPage;
