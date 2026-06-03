import React from 'react';
import { Order } from '../../types/order.types';
import OrderStatusBadge from './OrderStatusBadge';
import { formatDate } from '../../utils/dateFormats';
import { useNavigate } from 'react-router-dom';

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const navigate = useNavigate();
  return (
    <div
      className="cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
      onClick={() => navigate(`/orders/${order.id}`)}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-sm font-bold text-blue-600 dark:text-sky-300">{order.orderNumber}</span>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{order.customer?.name}</p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {order.origin} → {order.destination}
      </p>
      <div className="mt-2 flex justify-between items-center">
        <span className="text-xs text-gray-400 dark:text-gray-500">{order.merchandiseType} · {order.weight} kg</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(order.createdAt)}</span>
      </div>
      {order.driver && (
        <p className="mt-1 text-xs text-blue-500 dark:text-sky-300">🚚 {order.driver.name}</p>
      )}
    </div>
  );
};

export default OrderCard;
