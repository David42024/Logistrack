import React from 'react';
import { Order } from '../../types/order.types';
import { formatDate } from '../../utils/dateFormats';
import { Package } from 'lucide-react';

const statusConfig: Record<string, { label: string; className: string }> = {
  delivered: {
    label: 'Entregado',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  },
  transit: {
    label: 'En ruta',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
  },
  pending: {
    label: 'Pendiente',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  },
  preparing: {
    label: 'Preparando',
    className: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  },
};

interface RecentOrdersTableProps {
  orders: Order[];
}

const RecentOrdersTable: React.FC<RecentOrdersTableProps> = ({ orders }) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 h-full">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          Tabla de pedidos recientes
        </h3>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Package size={36} className="text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sin pedidos recientes</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Los pedidos aparecerán aquí cuando se creen
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="pb-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 pr-3">
                  ID Pedido
                </th>
                <th className="pb-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 pr-3">
                  Cliente
                </th>
                <th className="pb-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 pr-3">
                  Destino
                </th>
                <th className="pb-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 pr-3">
                  Estado
                </th>
                <th className="pb-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => {
                const cfg = statusConfig[order.status] || {
                  label: order.status,
                  className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
                };
                return (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-3 pr-3 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 pr-3 text-gray-700 dark:text-gray-200 text-xs font-medium truncate max-w-[90px]">
                      {order.customer?.name || '—'}
                    </td>
                    <td className="py-3 pr-3 text-gray-500 dark:text-gray-400 text-xs truncate max-w-[80px]">
                      {order.destination || '—'}
                    </td>
                    <td className="py-3 pr-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.className}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentOrdersTable;
