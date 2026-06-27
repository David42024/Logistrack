import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '../../types/order.types';
import CustomTable, { Column } from '../common/CustomTable';
import OrderStatusBadge from './OrderStatusBadge';
import { formatDate } from '../../utils/dateFormats';

interface OrderTableProps {
  orders: Order[];
  onAssign?: (order: Order) => void;
  onViewDetail?: (order: Order) => void;
  showAssign?: boolean;
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onAssign,
  onViewDetail,
  showAssign,
  loading = false,
  pagination,
}) => {
  const navigate = useNavigate();

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Pedido',
      render: (_, order) => (
        <span className="font-mono font-semibold text-blue-600 dark:text-sky-300">
          {order.orderNumber}
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Cliente',
      render: (_, order) => order.customer?.name || <span className="text-gray-400 italic">Desconocido</span>,
    },
    {
      key: 'origin',
      header: 'Ruta',
      render: (_, order) => (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-700 dark:text-gray-300">{order.origin}</span>
          <br />
          <span className="text-gray-400 dark:text-gray-500">→ {order.destination}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (_, order) => <OrderStatusBadge status={order.status} />,
    },
    {
      key: 'driver',
      header: 'Transportista',
      render: (_, order) => (
        <span className={order.driver?.name ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 italic'}>
          {order.driver?.name || 'Sin asignar'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (_, order) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {formatDate(order.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (_, order) => (
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onViewDetail) {
                onViewDetail(order);
              } else {
                navigate(`/orders/${order.id}`);
              }
            }}
            className="text-xs text-blue-600 hover:underline dark:text-sky-300 font-semibold"
          >
            Ver
          </button>
          {showAssign && !order.driverId && order.status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAssign?.(order);
              }}
              className="text-xs text-green-600 hover:underline dark:text-green-300 font-semibold"
            >
              Asignar
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <CustomTable
      columns={columns}
      data={orders}
      loading={loading}
      pagination={pagination}
      onRowClick={(order) => {
        if (onViewDetail) {
          onViewDetail(order);
        } else {
          navigate(`/orders/${order.id}`);
        }
      }}
      emptyMessage="No hay pedidos registrados en este momento."
    />
  );
};

export default OrderTable;
