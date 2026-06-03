import React, { useRef } from 'react';
import { OrderHistory } from '../../types/order.types';
import { AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Incident {
  id: string;
  description: string;
  priority: 'alta' | 'media' | 'baja';
  orderNumber?: string;
}

interface IncidentsPanelProps {
  incidents: Incident[];
  total?: number;
}

const priorityConfig = {
  alta: {
    label: 'Alta',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    dot: 'bg-red-500',
  },
  media: {
    label: 'Media',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  baja: {
    label: 'Baja',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    dot: 'bg-green-500',
  },
};

const IncidentCard: React.FC<{ incident: Incident }> = ({ incident }) => {
  const cfg = priorityConfig[incident.priority] || priorityConfig.media;
  return (
    <div className="flex-shrink-0 w-72 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-snug line-clamp-2">
          {incident.description}
        </p>
        <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.className}`}>
          {cfg.label}
        </span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Prioridad</p>
    </div>
  );
};

const IncidentsPanel: React.FC<IncidentsPanelProps> = ({ incidents, total }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
          Panel de incidencias activas
        </h3>
        <div className="flex items-center gap-2">
          {typeof total === 'number' && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300">
              {incidents.length} - {total}
            </span>
          )}
          {incidents.length > 2 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scroll('left')}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scroll('right')}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Incidents */}
      {incidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <AlertTriangle size={36} className="text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sin incidencias activas</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            Todas las operaciones están funcionando correctamente
          </p>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          {incidents.map((inc) => (
            <IncidentCard key={inc.id} incident={inc} />
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentsPanel;
