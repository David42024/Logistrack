import React from 'react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export interface CustomTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    perPage?: number;
    perPageOptions?: number[];
    onPerPageChange?: (perPage: number) => void;
  };
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

const CustomTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
}: CustomTableProps<T>) => {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; bg: string }> = {
      entregado: { color: 'text-green-700 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
      'en ruta': { color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      pendiente: { color: 'text-yellow-700 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
      cancelado: { color: 'text-red-700 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
      preparando: { color: 'text-purple-700 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' },
      asignado: { color: 'text-indigo-700 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    };

    const normalizedStatus = status.toLowerCase();
    const style = statusMap[normalizedStatus] || { color: 'text-gray-700 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-900/30' };

    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${style.color} ${style.bg}`}>
        {status}
      </span>
    );
  };

  const renderSkeleton = () => (
    <tbody>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="border-b border-gray-200 dark:border-gray-800">
          {columns.map((_, j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={String(column.key)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          {loading ? (
            renderSkeleton()
          ) : data.length === 0 ? (
            <tbody>
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            </tbody>
          ) : (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`transition-colors ${
                    onRowClick ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' : ''
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                    >
                      {column.render ? (
                        column.render(row[column.key as keyof T], row, rowIndex)
                      ) : (
                        <span className="lowercase">
                          {typeof row[column.key as keyof T] === 'string' &&
                          ['pendiente', 'en ruta', 'entregado', 'cancelado', 'preparando', 'asignado'].includes(
                            String(row[column.key as keyof T]).toLowerCase()
                          )
                            ? getStatusBadge(String(row[column.key as keyof T]))
                            : row[column.key as keyof T]}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {pagination && !loading && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            {pagination.onPerPageChange && pagination.perPageOptions && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                <span>Mostrar</span>
                <select
                  value={pagination.perPage}
                  onChange={(e) => pagination.onPerPageChange?.(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {pagination.perPageOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTable;
