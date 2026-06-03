import React from 'react';

interface OrderFiltersProps {
  status: string;
  search: string;
  onStatusChange: (v: string) => void;
  onSearchChange: (v: string) => void;
}

const statuses = [
  { value: '', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'preparing', label: 'Preparando' },
  { value: 'transit', label: 'En Tránsito' },
  { value: 'delivered', label: 'Entregado' },
  { value: 'cancelled', label: 'Cancelado' },
];

const OrderFilters: React.FC<OrderFiltersProps> = ({
  status, search, onStatusChange, onSearchChange,
}) => (
  <div className="mb-4 flex flex-wrap gap-3">
    <input
      type="text"
      placeholder="Buscar pedido..."
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
    />
    <select
      value={status}
      onChange={(e) => onStatusChange(e.target.value)}
      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  </div>
);

export default OrderFilters;
