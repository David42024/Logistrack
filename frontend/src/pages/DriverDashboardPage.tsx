import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import { LoadingSpinner } from '../components/common/StatsCard';
import { ordersApi } from '../api/orders.api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useOfflineQueue } from '../hooks/useOfflineQueue';
import { Order } from '../types/order.types';
import { formatDateTime } from '../utils/dateFormats';
import toast from 'react-hot-toast';

const statusTransitions: Record<string, { to: string; label: string; color: string }[]> = {
  preparing: [{ to: 'transit', label: '🚚 Iniciar Tránsito', color: 'bg-purple-600 hover:bg-purple-700' }],
  transit: [{ to: 'delivered', label: '✅ Marcar Entregado', color: 'bg-green-600 hover:bg-green-700' }],
};

const DriverDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const { socket } = useSocket();
  const { addToQueue, syncQueue, isSyncing, queue } = useOfflineQueue();
  const isOnline = navigator.onLine;

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await ordersApi.getAll({ driverId: user.id, limit: 50 });
      const active = res.data.data.filter((o: Order) =>
        ['preparing', 'transit'].includes(o.status)
      );
      setOrders(active);
    } catch {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handler = () => fetchOrders();
    socket.on('order-assigned', handler);
    return () => {
      socket.off('order-assigned', handler);
    };
  }, [socket]);

  const handleStatusChange = async (order: Order, newStatus: string) => {
    const data = { status: newStatus, notes: noteMap[order.id] };
    setUpdating(order.id);

    if (!isOnline) {
      await addToQueue(order.id, data);
      toast.success('Guardado offline — se sincronizará al conectarse');
      setUpdating(null);
      return;
    }

    try {
      await ordersApi.updateStatus(order.id, data);
      toast.success('Estado actualizado');
      fetchOrders();
    } catch {
      toast.error('Error al actualizar');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <MainLayout title="Mis Pedidos">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Mis Pedidos Activos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Hola, {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {queue.length > 0 && (
            <button
              onClick={syncQueue}
              disabled={isSyncing || !isOnline}
              className="rounded-lg border border-yellow-200 bg-yellow-100 px-3 py-1.5 text-xs text-yellow-700 hover:bg-yellow-200 disabled:opacity-50 dark:border-yellow-800/60 dark:bg-yellow-900/40 dark:text-yellow-200"
            >
              {isSyncing ? 'Sincronizando...' : `Sincronizar (${queue.length})`}
            </button>
          )}
          <div className={`flex items-center gap-1 text-xs ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
            {isOnline ? 'En línea' : 'Sin conexión'}
          </div>
        </div>
      </div>

      {loading ? <LoadingSpinner size="lg" /> : orders.length === 0 ? (
        <div className="py-16 text-center text-gray-400 dark:text-gray-500">
          <div className="text-5xl mb-3">📭</div>
          <p>No tienes pedidos activos asignados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const actions = statusTransitions[order.status] || [];
            return (
              <div key={order.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-lg font-bold font-mono text-blue-600 dark:text-sky-300">{order.orderNumber}</span>
                    <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">{order.customer?.name}</p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mb-4 grid grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Origen</p>
                    <p className="font-medium">{order.origin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Destino</p>
                    <p className="font-medium">{order.destination}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Mercancía</p>
                    <p className="font-medium">{order.merchandiseType} · {order.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Asignado</p>
                    <p className="font-medium">{formatDateTime(order.updatedAt)}</p>
                  </div>
                </div>

                {actions.length > 0 && (
                  <div>
                    <textarea
                      placeholder="Nota o incidencia (opcional)..."
                      value={noteMap[order.id] || ''}
                      onChange={(e) => setNoteMap({ ...noteMap, [order.id]: e.target.value })}
                      className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                      rows={2}
                    />
                    <div className="flex gap-2">
                      {actions.map((action) => (
                        <button
                          key={action.to}
                          onClick={() => handleStatusChange(order, action.to)}
                          disabled={updating === order.id}
                          className={`flex-1 py-3 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 ${action.color}`}
                        >
                          {updating === order.id ? 'Actualizando...' : action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
};

export default DriverDashboardPage;
