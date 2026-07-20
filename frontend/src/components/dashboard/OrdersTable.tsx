import React from 'react';
import { Order } from '../../types/dashboard.types';

interface OrdersTableProps {
  orders: Order[];
  loading?: boolean;
  onViewOrder?: (id: string) => void;
  onUpdateStatus?: (id: string) => void;
  onAssignDriver?: (id: string) => void;
  onCreateOrder?: () => void;
  showCreate?: boolean;
  showUpdateStatus?: boolean;
  showAssignDriver?: boolean;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ 
  orders, 
  loading, 
  onViewOrder, 
  onUpdateStatus, 
  onAssignDriver,
  onCreateOrder,
  showCreate = true,
  showUpdateStatus = true,
  showAssignDriver = true,
}) => {
  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; label: string } } = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
      preparing: { color: 'bg-blue-100 text-blue-800', label: 'Preparando' },
      transit: { color: 'bg-purple-100 text-purple-800', label: 'En tránsito' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Entregado' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelado' },
    };
    
    const config = statusMap[status.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap: { [key: string]: { color: string; label: string } } = {
      high: { color: 'bg-red-100 text-red-800', label: 'Alta' },
      medium: { color: 'bg-yellow-100 text-yellow-800', label: 'Media' },
      low: { color: 'bg-green-100 text-green-800', label: 'Baja' },
    };
    
    const config = priorityMap[priority.toLowerCase()] || { color: 'bg-gray-100 text-gray-800', label: priority };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No hay pedidos</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Comienza creando tu primer pedido</p>
        {showCreate && (
          <button
            onClick={() => onCreateOrder?.()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            Crear primer pedido
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID Pedido
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Driver
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ETA
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Prioridad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {order.orderNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {order.customer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {order.driver}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {order.eta}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(order.priority)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onViewOrder?.(order.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver detalle
                    </button>
                    {showUpdateStatus && (
                      <button
                        onClick={() => onUpdateStatus?.(order.id)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Cambiar estado
                      </button>
                    )}
                    {showAssignDriver && (
                      <button
                        onClick={() => onAssignDriver?.(order.id)}
                        className="text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Asignar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
