import React from 'react';
import { OrderHistory } from '../../types/order.types';
import { statusLabels } from '../../utils/statusColors';
import { formatDateTime } from '../../utils/dateFormats';

const OrderTimeline: React.FC<{ history: OrderHistory[] }> = ({ history }) => {
  const sorted = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
      <ul className="space-y-4">
        {sorted.map((h, i) => (
          <li key={h.id} className="flex gap-4 relative">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold z-10 shrink-0">
              {i + 1}
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-800">
                  {statusLabels[h.newStatus] || h.newStatus}
                </span>
                <span className="text-xs text-gray-500">{formatDateTime(h.createdAt)}</span>
              </div>
              {h.previousStatus && (
                <p className="text-xs text-gray-500 mt-1">
                  Anterior: {statusLabels[h.previousStatus] || h.previousStatus}
                </p>
              )}
              {h.notes && <p className="text-sm text-gray-600 mt-1">{h.notes}</p>}
              {h.changedBy && <p className="text-xs text-gray-400 mt-1">Por: {h.changedBy}</p>}
              {h.incidentImage && (
                <img
                  src={h.incidentImage}
                  alt="Incidencia"
                  className="mt-2 rounded max-h-32 object-cover"
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderTimeline;
