import React from 'react';
import { statusColors, statusLabels } from '../../utils/statusColors';

const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}`}>
    {statusLabels[status] || status}
  </span>
);

export default OrderStatusBadge;
