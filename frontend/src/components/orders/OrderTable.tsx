import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../types/order.types';
import OrderStatusBadge from './OrderStatusBadge';
import { formatDate } from '../../utils/dateFormats';

interface OrderTableProps {
  orders: Order[];
  onAssign?: (order: Order) => void;
  showAssign?: boolean;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, onAssign, showAssign }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Pedido</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Cliente</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Ruta</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Estado</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Transportista</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Fecha</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-8 text-center text-gray-400 dark:text-gray-500">
                No hay pedidos
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-sky-300">
                  {order.orderNumber}
                </td>
                <td className="px-4 py-3">{order.customer?.name}</td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                  {order.origin}<br /><span className="text-gray-400">→ {order.destination}</span>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                  {order.driver?.name || <span className="text-gray-300 italic dark:text-gray-500">Sin asignar</span>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="text-xs text-blue-600 hover:underline dark:text-sky-300"
                    >
                      Ver
                    </button>
                    {showAssign && !order.driverId && order.status === 'pending' && (
                      <button
                        onClick={() => onAssign?.(order)}
                        className="text-xs text-green-600 hover:underline dark:text-green-300"
                      >
                        Asignar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;
