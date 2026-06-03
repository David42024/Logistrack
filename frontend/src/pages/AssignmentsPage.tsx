import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import OrderTable from '../components/orders/OrderTable';
import { AssignDriverModal } from '../components/drivers/DriverCard';
import { LoadingSpinner } from '../components/common/StatsCard';
import { ordersApi } from '../api/orders.api';
import { Order } from '../types/order.types';
import toast from 'react-hot-toast';

const AssignmentsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignOrder, setAssignOrder] = useState<Order | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.getAll({ status: 'pending', limit: 50 });
      setOrders(res.data.data);
    } catch {
      toast.error('Error al cargar asignaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPending(); }, []);

  return (
    <MainLayout title="Asignaciones">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">Pedidos Pendientes de Asignar</h2>
        <p className="text-sm text-gray-500 mt-1">{orders.length} pedido(s) sin transportista</p>
      </div>
      {loading ? <LoadingSpinner size="lg" /> : (
        <OrderTable
          orders={orders}
          showAssign
          onAssign={(o) => setAssignOrder(o)}
        />
      )}
      {assignOrder && (
        <AssignDriverModal
          orderId={assignOrder.id}
          onClose={() => setAssignOrder(null)}
          onAssigned={() => {
            setAssignOrder(null);
            fetchPending();
            toast.success('Transportista asignado exitosamente');
          }}
        />
      )}
    </MainLayout>
  );
};

export default AssignmentsPage;
