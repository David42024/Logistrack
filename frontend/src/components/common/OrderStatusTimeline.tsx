import React from 'react';
import { OrderStatus, OrderHistory } from '../../types/order.types';
import { statusLabels } from '../../utils/statusColors';

export interface StatusStep {
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
}

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  history?: OrderHistory[];
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ currentStatus, history = [] }) => {
  const statusOrder: OrderStatus[] = ['pending', 'preparing', 'transit', 'delivered'];
  
  const statusIcons: Record<OrderStatus, React.ReactNode> = {
    pending: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    preparing: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    transit: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    delivered: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    cancelled: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const getStatusIndex = (status: OrderStatus): number => {
    if (status === 'cancelled') return -1;
    return statusOrder.indexOf(status);
  };

  const currentIndex = getStatusIndex(currentStatus);
  const isCancelled = currentStatus === 'cancelled';

  const steps: StatusStep[] = statusOrder.map((status) => ({
    status,
    label: statusLabels[status] || status,
    icon: statusIcons[status],
  }));

  const getStepStatus = (stepStatus: OrderStatus, stepIndex: number): 'completed' | 'current' | 'pending' => {
    if (isCancelled) return 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="w-full">
      {/* Timeline Progress */}
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
          {!isCancelled && (
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${((currentIndex + 1) / steps.length) * 100}%`,
              }}
            />
          )}
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const stepStatus = getStepStatus(step.status, index);
            const isCompleted = stepStatus === 'completed';
            const isCurrent = stepStatus === 'current';

            return (
              <div key={step.status} className="flex flex-col items-center gap-2">
                {/* Icon Circle */}
                <div
                  className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : isCurrent
                      ? 'bg-white dark:bg-gray-900 border-blue-500 text-blue-500'
                      : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-medium transition-colors ${
                    isCompleted || isCurrent
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancelled Status Alert */}
      {isCancelled && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            {statusIcons.cancelled}
            <span className="font-medium">Pedido Cancelado</span>
          </div>
        </div>
      )}

      {/* History List */}
      {sortedHistory.length > 0 && (
        <div className="mt-8 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Historial de Cambios</h4>
          <div className="space-y-3">
            {sortedHistory.map((entry) => {
              const statusKey = entry.newStatus as OrderStatus;
              return (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 text-sm"
                >
                  <div className="flex-shrink-0 mt-0.5 text-blue-500">
                    {statusIcons[statusKey] || statusIcons.pending}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {statusLabels[statusKey] || statusKey}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(entry.createdAt).toLocaleString('es-ES', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="mt-1.5 text-gray-600 dark:text-gray-400">{entry.notes}</p>
                    )}
                    {entry.changedBy && (
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Modificado por: {entry.changedBy}</p>
                    )}
                    {entry.incidentImage && (
                      <img
                        src={entry.incidentImage}
                        alt="Evidencia"
                        className="mt-3 rounded-lg max-h-40 object-cover border border-gray-200 dark:border-gray-700"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTimeline;
