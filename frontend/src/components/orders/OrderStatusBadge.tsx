import React from 'react';

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: 'Pendiente',
    className:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-400',
  },
  preparing: {
    label: 'Preparando',
    className:
      'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
    dot: 'bg-violet-500',
  },
  transit: {
    label: 'En Tránsito',
    className:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500 animate-pulse',
  },
  delivered: {
    label: 'Entregado',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  cancelled: {
    label: 'Cancelado',
    className:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
    dot: 'bg-red-500',
  },
};

const DEFAULT_CONFIG = {
  label: 'Desconocido',
  className: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
  dot: 'bg-gray-400',
};

const OrderStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? DEFAULT_CONFIG;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
