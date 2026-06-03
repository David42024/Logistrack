export const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  preparing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  transit: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};

export const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  transit: 'En Tránsito',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

export const driverStatusColors: Record<string, string> = {
  available: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  busy: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
  offline: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export const driverStatusLabels: Record<string, string> = {
  available: 'Disponible',
  busy: 'Ocupado',
  offline: 'Fuera de línea',
};
