import React from 'react';

export type OrderStatus = 'creado' | 'preparando' | 'asignado' | 'en_ruta' | 'entregado' | 'cancelado';

export interface StatusStep {
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
}

interface OrderStatusTimelineProps {
  currentStatus: OrderStatus;
  history?: Array<{ status: OrderStatus; timestamp: string; note?: string }>;
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ currentStatus, history = [] }) => {
  const statusOrder: OrderStatus[] = ['creado', 'preparando', 'asignado', 'en_ruta', 'entregado'];
  
  const statusIcons: Record<OrderStatus, React.ReactNode> = {
    creado: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    preparando: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    asignado: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    en_ruta: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    entregado: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    cancelado: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const statusLabels: Record<OrderStatus, string> = {
    creado: 'Creado',
    preparando: 'Preparando',
    asignado: 'Asignado',
    en_ruta: 'En Ruta',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };

  const getStatusIndex = (status: OrderStatus): number => {
    if (status === 'cancelado') return -1;
    return statusOrder.indexOf(status);
  };

  const currentIndex = getStatusIndex(currentStatus);
  const isCancelled = currentStatus === 'cancelado';

  const steps: StatusStep[] = statusOrder.map((status) => ({
    status,
    label: statusLabels[status],
    icon: statusIcons[status],
  }));

  const getStepStatus = (stepStatus: OrderStatus, stepIndex: number): 'completed' | 'current' | 'pending' => {
    if (isCancelled) return 'pending';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="w-full">
      {/* Timeline */}
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

      {/* Cancelled Status */}
      {isCancelled && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            {statusIcons.cancelado}
            <span className="font-medium">Pedido Cancelado</span>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Historial de Cambios</h4>
          <div className="space-y-2">
            {history.map((entry, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {statusIcons[entry.status]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {statusLabels[entry.status]}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.timestamp).toLocaleString('es-ES', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                  {entry.note && (
                    <p className="mt-1 text-gray-600 dark:text-gray-400">{entry.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderStatusTimeline;
