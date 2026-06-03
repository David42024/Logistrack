import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import OrderTable from '../components/orders/OrderTable';
import OrderFilters from '../components/orders/OrderFilters';
import { AssignDriverModal } from '../components/drivers/DriverCard';
import { LoadingSpinner } from '../components/common/StatsCard';
import { ordersApi } from '../api/orders.api';
import { Order, PaginatedOrders } from '../types/order.types';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const OrdersPage: React.FC = () => {
  const [data, setData] = useState<PaginatedOrders | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [assignOrder, setAssignOrder] = useState<Order | null>(null);
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const canAssign = user?.role === 'admin' || user?.role === 'coordinator';

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

  return (
    <MainLayout title="Pedidos">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gestión de Pedidos</h2>
        {canAssign && (
          <button
            onClick={() => navigate('/orders/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            + Nuevo Pedido
          </button>
        )}
      </div>

      <OrderFilters
        status={status}
        search={search}
        onStatusChange={(v) => { setStatus(v); setPage(1); }}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
      />

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <>
          <OrderTable
            orders={data?.data || []}
            showAssign={canAssign}
            onAssign={(order) => setAssignOrder(order)}
          />
          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {data.total} pedidos · página {data.page} de {data.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  ← Anterior
                </button>
                <button
                  disabled={page === data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {assignOrder && (
        <AssignDriverModal
          orderId={assignOrder.id}
          onClose={() => setAssignOrder(null)}
          onAssigned={() => { setAssignOrder(null); fetchOrders(); toast.success('Transportista asignado'); }}
        />
      )}
    </MainLayout>
  );
};

export default OrdersPage;
