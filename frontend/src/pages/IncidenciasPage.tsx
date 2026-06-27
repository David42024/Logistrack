import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { dashboardService } from '../services/api.dashboard.service';
import { Incident, IncidentSeverity } from '../types/dashboard.types';
import { LoadingSpinner } from '../components/common/StatsCard';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, RefreshCw, Eye, Truck, X } from 'lucide-react';

const severityConfig: Record<IncidentSeverity, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  [IncidentSeverity.CRITICAL]: {
    label: 'Crítica',
    color: 'text-red-800 dark:text-red-300',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-l-red-500',
    icon: <AlertTriangle size={20} className="text-red-500" />,
  },
  [IncidentSeverity.MEDIUM]: {
    label: 'Media',
    color: 'text-orange-800 dark:text-orange-300',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-l-orange-500',
    icon: <AlertTriangle size={20} className="text-orange-500" />,
  },
  [IncidentSeverity.INFO]: {
    label: 'Informativa',
    color: 'text-green-800 dark:text-green-300',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-l-green-500',
    icon: <AlertTriangle size={20} className="text-green-500" />,
  },
};

const severityOrder: IncidentSeverity[] = [
  IncidentSeverity.CRITICAL,
  IncidentSeverity.MEDIUM,
  IncidentSeverity.INFO,
];

const IncidenciasPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<string | null>(null);
  const [filter, setFilter] = useState<IncidentSeverity | 'all'>('all');
  const { socket } = useSocket();
  const { user } = useAuth();
  const { can: canInc } = usePermissions(user?.role);
  const canResolveIncident = canInc('incidents.update');
  const canReassignIncident = canInc('incidents.assign');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getActiveIncidents();
      setIncidents(data);
    } catch {
      toast.error('Error al cargar incidencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncidents(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('incident-created', fetchIncidents);
    socket.on('incident-resolved', fetchIncidents);
    return () => {
      socket.off('incident-created', fetchIncidents);
      socket.off('incident-resolved', fetchIncidents);
    };
  }, [socket]);

  const handleResolve = async (incidentId: string) => {
    setResolving(incidentId);
    try {
      await dashboardService['resolveIncident'](incidentId);
      toast.success('Incidencia resuelta');
      setIncidents(prev => prev.filter(i => i.id !== incidentId));
    } catch {
      toast.error('Error al resolver incidencia');
    } finally {
      setResolving(null);
    }
  };

  const handleViewOrder = (orderId: string) => {
    window.location.href = `/logistica?order=${orderId}`;
  };

  const handleReassign = async (orderId: string) => {
    try {
      await dashboardService['reassignOrder'](orderId);
      toast.success('Pedido liberado para reasignación');
      fetchIncidents();
    } catch {
      toast.error('Error al reasignar');
    }
  };

  const filteredIncidents = filter === 'all'
    ? incidents
    : incidents.filter(i => i.severity === filter);

  const sortedIncidents = [...filteredIncidents].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );

  const counts = {
    critical: incidents.filter(i => i.severity === IncidentSeverity.CRITICAL).length,
    medium: incidents.filter(i => i.severity === IncidentSeverity.MEDIUM).length,
    info: incidents.filter(i => i.severity === IncidentSeverity.INFO).length,
    total: incidents.length,
  };

  return (
    <MainLayout title="Incidencias">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={24} />
              Panel de Incidencias
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Incidencias activas ordenadas por gravedad. Resuélvelas o reasigna pedidos afectados.
            </p>
          </div>
          <button
            onClick={fetchIncidents}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={16} />
            Refrescar
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center cursor-pointer hover:shadow-md transition-all"
            onClick={() => setFilter('all')}>
            <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{counts.total}</span>
            <p className="text-xs text-gray-500 mt-1">Totales</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4 text-center cursor-pointer hover:shadow-md transition-all"
            onClick={() => setFilter(IncidentSeverity.CRITICAL)}>
            <span className="text-2xl font-bold text-red-700 dark:text-red-300">{counts.critical}</span>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">Críticas</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800 p-4 text-center cursor-pointer hover:shadow-md transition-all"
            onClick={() => setFilter(IncidentSeverity.MEDIUM)}>
            <span className="text-2xl font-bold text-orange-700 dark:text-orange-300">{counts.medium}</span>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Medias</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4 text-center cursor-pointer hover:shadow-md transition-all"
            onClick={() => setFilter(IncidentSeverity.INFO)}>
            <span className="text-2xl font-bold text-green-700 dark:text-green-300">{counts.info}</span>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">Informativas</p>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      {loading ? (
        <LoadingSpinner size="lg" />
      ) : sortedIncidents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900">
          <CheckCircle size={48} className="text-green-400 mb-4" />
          <h3 className="font-bold text-gray-700 dark:text-gray-200 text-lg">Sin Incidencias Activas</h3>
          <p className="text-sm text-gray-400 mt-2">Todas las operaciones funcionan con normalidad.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedIncidents.map((incident) => {
            const cfg = severityConfig[incident.severity] || severityConfig[IncidentSeverity.MEDIUM];
            const isResolving = resolving === incident.id;
            return (
              <div
                key={incident.id}
                className={`border-l-4 ${cfg.border} ${cfg.bg} rounded-xl p-5 hover:shadow-md transition-shadow bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
                          {cfg.label}
                        </span>
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 font-mono">
                          {incident.orderNumber}
                        </span>
                        <span className="text-xs text-gray-400">{incident.activeTime}</span>
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{incident.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canResolveIncident && (
                      <button
                        onClick={() => handleResolve(incident.id)}
                        disabled={isResolving}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {isResolving ? <LoadingSpinner size="sm" /> : <CheckCircle size={14} />}
                        Resolver
                      </button>
                    )}
                    <button
                      onClick={() => handleViewOrder(incident.orderId)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Eye size={14} />
                      Ver
                    </button>
                    {canReassignIncident && (
                      <button
                        onClick={() => handleReassign(incident.orderId)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Truck size={14} />
                        Reasignar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MainLayout>
  );
};

export default IncidenciasPage;
