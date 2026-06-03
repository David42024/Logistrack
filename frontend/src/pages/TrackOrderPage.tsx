import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import OrderTimeline from '../components/orders/OrderTimeline';
import { ordersApi } from '../api/orders.api';
import { Order } from '../types/order.types';
import { formatDateTime } from '../utils/dateFormats';
import toast from 'react-hot-toast';

const TrackOrderPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setOrder(null);
    try {
      const res = await ordersApi.trackByNumber(orderNumber.trim().toUpperCase());
      setOrder(res.data);
    } catch {
      toast.error('Pedido no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">🔍 Rastrear Pedido</h2>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="ORD-20250101-0001"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? '...' : 'Buscar'}
          </button>
        </form>
      </div>

      {order && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold font-mono text-blue-600 dark:text-sky-300">{order.orderNumber}</h3>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
                <p className="text-xs text-gray-400 dark:text-gray-500">Creado</p>
                <p className="font-medium">{formatDateTime(order.createdAt)}</p>
              </div>
              {order.driver && (
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Transportista</p>
                  <p className="font-medium">🚚 {order.driver.name}</p>
                </div>
              )}
              {order.estimatedDate && (
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Entrega Estimada</p>
                  <p className="font-medium">{formatDateTime(order.estimatedDate)}</p>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 font-semibold text-gray-700 dark:text-gray-200">Historial del Pedido</h3>
            <OrderTimeline history={order.history || []} />
          </div>
        </div>
      )}
    </div>
  );

  if (isAuthenticated) return <MainLayout title="Rastrear Pedido">{content}</MainLayout>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">🚛 Sistema de Transporte</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Seguimiento de pedidos</p>
        </div>
        {content}
      </div>
    </div>
  );
};

export default TrackOrderPage;
