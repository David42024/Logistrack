import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import CustomTable, { Column } from '../components/common/CustomTable';
import { routesApi, Route, RouteStop } from '../api/routes.api';
import { driversApi } from '../api/drivers.api';
import { ordersApi } from '../api/orders.api';
import { Driver } from '../types/driver.types';
import { Order } from '../types/order.types';
import toast from 'react-hot-toast';
import { Route as RouteIcon, MapPin, Truck, Calendar, Clock, Navigation, Plus, Check, Play, Trash2, Sliders, ChevronRight } from 'lucide-react';

const RoutesPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  // Modals / forms
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRouteForm, setNewRouteForm] = useState({
    name: '',
    description: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    driverId: '',
  });

  const [showAddStopForm, setShowAddStopForm] = useState(false);
  const [selectedOrderForStop, setSelectedOrderForStop] = useState('');

  const [optimizing, setOptimizing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [routesRes, driversRes, ordersRes] = await Promise.all([
        routesApi.getAll(),
        driversApi.getAll(),
        ordersApi.getAll({ status: 'pending', limit: 100 }),
      ]);
      setRoutes(routesRes.data);
      setDrivers(driversRes.data);
      setPendingOrders(ordersRes.data.data || []);

      // If a route was already selected, refresh it
      if (selectedRoute) {
        const refreshed = routesRes.data.find((r: Route) => r.id === selectedRoute.id);
        if (refreshed) {
          setSelectedRoute(refreshed);
        }
      }
    } catch {
      toast.error('Error al cargar datos de rutas');
    } finally {
      setLoading(false);
    }
  }, [selectedRoute]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRouteForm.name || !newRouteForm.scheduledDate) {
      toast.error('Nombre y Fecha son obligatorios');
      return;
    }
    try {
      const res = await routesApi.create(newRouteForm);
      toast.success('Ruta creada con éxito');
      setShowCreateForm(false);
      setNewRouteForm({
        name: '',
        description: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        driverId: '',
      });
      fetchData();
      setSelectedRoute(res.data);
    } catch {
      toast.error('Error al crear ruta');
    }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute || !selectedOrderForStop) return;

    const order = pendingOrders.find((o) => o.id === selectedOrderForStop);
    if (!order) return;

    // Generate mock coordinate points in Trujillo region for map visual
    const latBase = -8.11;
    const lngBase = -79.03;
    const latOffset = (Math.random() - 0.5) * 0.05;
    const lngOffset = (Math.random() - 0.5) * 0.05;

    try {
      await routesApi.addStop(selectedRoute.id, {
        address: order.destination,
        latitude: latBase + latOffset,
        longitude: lngBase + lngOffset,
        orderId: order.id,
        notes: `Mercadería: ${order.merchandiseType}`,
      });
      toast.success('Parada agregada a la ruta');
      setShowAddStopForm(false);
      setSelectedOrderForStop('');
      fetchData();
    } catch {
      toast.error('Error al agregar parada');
    }
  };

  const handleOptimizeRoute = async (routeId: string) => {
    setOptimizing(true);
    try {
      await routesApi.optimize(routeId);
      toast.success('Lógica de optimización de ruta completada');
      fetchData();
    } catch {
      toast.error('Error al optimizar ruta');
    } finally {
      setOptimizing(false);
    }
  };

  const handleDeleteRoute = async (routeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('¿Seguro que deseas eliminar esta ruta?')) return;
    try {
      await routesApi.delete(routeId);
      toast.success('Ruta eliminada');
      if (selectedRoute?.id === routeId) setSelectedRoute(null);
      fetchData();
    } catch {
      toast.error('Error al eliminar ruta');
    }
  };

  const handleStartRoute = async (routeId: string) => {
    try {
      await routesApi.updateStatus(routeId, 'in_progress');
      toast.success('Ruta iniciada (En tránsito)');
      fetchData();
    } catch {
      toast.error('Error al iniciar ruta');
    }
  };

  const handleCompleteRoute = async (routeId: string) => {
    try {
      await routesApi.updateStatus(routeId, 'completed');
      toast.success('Ruta marcada como completada');
      fetchData();
    } catch {
      toast.error('Error al completar ruta');
    }
  };

  const getStatusBadge = (status: string) => {
    const maps: Record<string, { label: string; style: string }> = {
      planned: { label: 'Planificada', style: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300' },
      in_progress: { label: 'En Ruta', style: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
      completed: { label: 'Completada', style: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' },
      cancelled: { label: 'Cancelada', style: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' },
    };
    const c = maps[status] || { label: status, style: 'bg-gray-100 text-gray-800 dark:bg-gray-800' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.style}`}>{c.label}</span>;
  };

  const getStopStatusBadge = (status: string) => {
    const maps: Record<string, { label: string; style: string }> = {
      pending: { label: 'Pendiente', style: 'bg-gray-100 text-gray-650 dark:bg-gray-800 dark:text-gray-400' },
      in_progress: { label: 'En Proceso', style: 'bg-blue-100 text-blue-850 dark:bg-blue-950 dark:text-blue-305' },
      completed: { label: 'Visitada', style: 'bg-green-100 text-green-850 dark:bg-green-950 dark:text-green-305' },
      skipped: { label: 'Omitida', style: 'bg-red-100 text-red-850 dark:bg-red-950 dark:text-red-305' },
    };
    const c = maps[status] || { label: status, style: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.style}`}>{c.label}</span>;
  };

  // SVG-based Route map visualization
  const renderSVGMap = (stops: RouteStop[]) => {
    if (stops.length === 0) {
      return (
        <div className="h-64 flex flex-col items-center justify-center border border-dashed border-gray-300 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-400">
          <MapPin size={32} className="mb-2 text-gray-300" />
          <span className="text-xs">Agrega paradas para ver el mapa de la ruta</span>
        </div>
      );
    }

    // Determine bounds and scale coordinates for SVG viewport (e.g. 400x300)
    const padding = 40;
    const width = 450;
    const height = 280;

    const lats = stops.map((s) => Number(s.latitude));
    const lngs = stops.map((s) => Number(s.longitude));

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    // Projection helper
    const getX = (lng: number) => {
      return padding + ((lng - minLng) / lngRange) * (width - 2 * padding);
    };

    const getY = (lat: number) => {
      // Invert Y axis for screen coordinates
      return height - (padding + ((lat - minLat) / latRange) * (height - 2 * padding));
    };

    // Build path coordinates string
    const points = stops.map((s) => ({
      x: getX(Number(s.longitude)),
      y: getY(Number(s.latitude)),
      seq: s.sequence,
      status: s.status,
      address: s.address,
    }));

    let pathD = '';
    if (points.length > 1) {
      pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
    }

    return (
      <div className="relative border border-gray-200 dark:border-gray-800 rounded-xl bg-slate-900 overflow-hidden shadow-inner p-2">
        <div className="absolute top-3 left-3 bg-slate-800/80 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] text-gray-300 font-semibold uppercase tracking-wider z-10 border border-slate-700">
          Visualización Geográfica (Simulador)
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Grid lines */}
          <line x1="0" y1="70" x2={width} y2="70" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
          <line x1="0" y1="140" x2={width} y2="140" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
          <line x1="0" y1="210" x2={width} y2="210" stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
          
          {/* Connection Line */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-dash"
              strokeDasharray="6 6"
            />
          )}

          {/* Node points */}
          {points.map((p, index) => {
            let color = '#94a3b8'; // Default grey
            if (p.status === 'completed') color = '#22c55e'; // Green
            if (p.status === 'in_progress') color = '#3b82f6'; // Blue

            return (
              <g key={index} className="cursor-pointer group">
                <circle cx={p.x} cy={p.y} r="14" fill="#1e293b" stroke={color} strokeWidth="2.5" />
                <circle cx={p.x} cy={p.y} r="4" fill={color} />
                <text
                  x={p.x}
                  y={p.y + 4}
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {p.seq}
                </text>
                
                {/* Tooltip on hover */}
                <title>{`Parada ${p.seq}: ${p.address} (${p.status})`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const columns: Column<Route>[] = [
    {
      key: 'name',
      header: 'Nombre de Ruta',
      render: (_, r) => (
        <div>
          <p className="font-semibold text-gray-805 dark:text-gray-150">{r.name}</p>
          <p className="text-xs text-gray-400 truncate max-w-xs">{r.description || 'Sin descripción'}</p>
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      header: 'Fecha Programada',
      render: (_, r) => (
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Calendar size={12} />
          {r.scheduledDate}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (_, r) => getStatusBadge(r.status),
    },
    {
      key: 'ordersCount',
      header: 'Paradas',
      render: (_, r) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-105 dark:bg-slate-805 text-slate-700 dark:text-slate-300">
          {r.stops?.length || 0} envíos
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Eliminar',
      render: (_, r) => (
        <button
          onClick={(e) => handleDeleteRoute(r.id, e)}
          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
        >
          <Trash2 size={15} />
        </button>
      ),
    },
  ];

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

  return (
    <MainLayout title="Gestión de Rutas">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column - Route Directory */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">Rutas Disponibles</h3>
              <p className="text-xs text-gray-500">{routes.length} creadas</p>
            </div>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-1.5 transition-colors"
              title="Crear Nueva Ruta"
            >
              <Plus size={18} />
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm animate-in slide-in-from-top-4 duration-200">
              <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-3">Programar Ruta</h4>
              <form onSubmit={handleCreateRoute} className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Nombre de la Ruta *</label>
                  <input
                    required
                    type="text"
                    placeholder="Ej. Zona Centro - Mañana"
                    value={newRouteForm.name}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Descripción</label>
                  <input
                    type="text"
                    placeholder="Ej. Pedidos pesados para distribución"
                    value={newRouteForm.description}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, description: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Fecha de Ruta *</label>
                  <input
                    required
                    type="date"
                    value={newRouteForm.scheduledDate}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, scheduledDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400">Conductor</label>
                  <select
                    value={newRouteForm.driverId}
                    onChange={(e) => setNewRouteForm({ ...newRouteForm, driverId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Sin asignar</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.vehicleType || 'Sin vehículo'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 border border-gray-300 py-1.5 text-xs rounded-lg hover:bg-gray-55 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 text-xs rounded-lg font-semibold"
                  >
                    Crear Ruta
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List of Routes */}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {routes.map((r) => (
              <div
                key={r.id}
                onClick={() => setSelectedRoute(r)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedRoute?.id === r.id
                    ? 'border-blue-500 bg-blue-50/30 dark:bg-blue-950/20 shadow-md'
                    : 'border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-850'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-1.5">
                      <RouteIcon size={16} className="text-blue-500" />
                      {r.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{r.description || 'Sin descripción'}</p>
                  </div>
                  {getStatusBadge(r.status)}
                </div>
                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {r.scheduledDate}
                  </span>
                  <span className="font-semibold bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                    {r.stops?.length || 0} paradas
                  </span>
                </div>
              </div>
            ))}
            {routes.length === 0 && (
              <div className="py-12 text-center text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                No hay rutas programadas
              </div>
            )}
          </div>
        </div>

        {/* Right 2 columns - Route Detail, Map, Stops */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRoute ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-6">
              
              {/* Header details */}
              <div className="flex justify-between items-start border-b border-gray-105 dark:border-gray-805 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{selectedRoute.name}</h3>
                    {getStatusBadge(selectedRoute.status)}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{selectedRoute.description}</p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  {selectedRoute.status === 'planned' && (
                    <button
                      onClick={() => handleStartRoute(selectedRoute.id)}
                      className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                    >
                      <Play size={14} />
                      <span>Iniciar Ruta</span>
                    </button>
                  )}
                  {selectedRoute.status === 'in_progress' && (
                    <button
                      onClick={() => handleCompleteRoute(selectedRoute.id)}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                    >
                      <Check size={14} />
                      <span>Completar Ruta</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleOptimizeRoute(selectedRoute.id)}
                    disabled={optimizing || selectedRoute.stops?.length < 2}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-755 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors shadow-sm"
                  >
                    <Sliders size={14} />
                    <span>{optimizing ? 'Optimizando...' : 'Optimizar Orden'}</span>
                  </button>
                </div>
              </div>

              {/* Metrics cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-200/50 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Total Paradas</span>
                  <span className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-1">
                    {selectedRoute.stops?.length || 0}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-200/50 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Distancia Total</span>
                  <span className="text-lg font-bold text-gray-850 dark:text-gray-100 mt-1 flex items-center gap-1">
                    <Navigation size={14} className="text-gray-400" />
                    {selectedRoute.stops?.length > 0 ? (selectedRoute.stops.length * 4.2).toFixed(1) : 0} km
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-200/50 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Duración Est</span>
                  <span className="text-lg font-bold text-gray-805 dark:text-gray-100 mt-1 flex items-center gap-1">
                    <Clock size={14} className="text-gray-400" />
                    {selectedRoute.stops?.length > 0 ? (selectedRoute.stops.length * 20) : 0} mins
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-200/50 flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Conductor</span>
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-2 truncate flex items-center gap-1">
                    <Truck size={14} className="text-gray-400 flex-shrink-0" />
                    {drivers.find((d) => d.id === selectedRoute.driverId)?.name || 'Sin conductor'}
                  </span>
                </div>
              </div>

              {/* Map view */}
              {renderSVGMap(selectedRoute.stops || [])}

              {/* Stops management */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-850 dark:text-gray-200">Paradas Programadas</h4>
                  {selectedRoute.status === 'planned' && (
                    <button
                      onClick={() => setShowAddStopForm(!showAddStopForm)}
                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-350 font-bold"
                    >
                      <Plus size={14} />
                      <span>Agregar Parada</span>
                    </button>
                  )}
                </div>

                {showAddStopForm && (
                  <form onSubmit={handleAddStop} className="flex gap-3 bg-gray-50 dark:bg-gray-850 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
                    <select
                      required
                      value={selectedOrderForStop}
                      onChange={(e) => setSelectedOrderForStop(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    >
                      <option value="">Seleccionar pedido pendiente...</option>
                      {pendingOrders.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.orderNumber} - {o.destination} (Mercancía: {o.merchandiseType})
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddStopForm(false)}
                      className="border border-gray-300 dark:border-gray-700 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                      Cerrar
                    </button>
                  </form>
                )}

                {/* Stops sequence list */}
                <div className="space-y-2">
                  {selectedRoute.stops?.length > 0 ? (
                    selectedRoute.stops
                      .sort((a, b) => a.sequence - b.sequence)
                      .map((stop) => (
                        <div
                          key={stop.id}
                          className="flex items-center justify-between p-3 rounded-lg border border-gray-150 dark:border-gray-850 bg-gray-50/50 dark:bg-gray-900/40 hover:bg-gray-50 dark:hover:bg-gray-850/40 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                              {stop.sequence}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{stop.address}</p>
                              {stop.notes && <p className="text-[10px] text-gray-400 mt-0.5">{stop.notes}</p>}
                            </div>
                          </div>
                          <div>{getStopStatusBadge(stop.status)}</div>
                        </div>
                      ))
                  ) : (
                    <div className="py-6 text-center text-xs text-gray-400 italic">
                      No hay paradas agregadas. Haz clic en "Agregar Parada" arriba.
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full min-h-[50vh] flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 p-8 text-center text-gray-450">
              <RouteIcon size={48} className="text-blue-400/40 mb-3 animate-pulse" />
              <h3 className="font-bold text-gray-700 dark:text-gray-200 text-lg">Panel de Planificación de Rutas</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-sm">
                Selecciona una ruta de la lista lateral para visualizar su mapa geográfico, sus paradas, o programar nuevos despachos.
              </p>
            </div>
          )}
        </div>

      </div>
    </MainLayout>
  );
};

export default RoutesPage;
