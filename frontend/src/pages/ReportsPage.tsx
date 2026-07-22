import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import {
  Package, Truck, CheckCircle2, Clock, AlertTriangle, TrendingUp,
  Download, FileText, FileSpreadsheet, BarChart3, MapPin, Award,
  Wrench, Route, Zap, Target, ArrowUpRight, ArrowDownRight, Layers
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import { reportsApi } from '../api/reports.api';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import toast from 'react-hot-toast';

/* ─────────── Types ─────────── */
interface KpiData {
  totalOrders: number; deliveredToday: number; inTransit: number;
  pending: number; slaCompliance: number; avgDeliveryTime: number;
  successRate: number; avgDelay: number;
}

interface DayCount { date: string; count: number }
interface DayAvg { date: string; avgTime: number }
interface DriverStat { driverId: string; driverName: string; deliveries: number }
interface ZoneStat { zone: string; count: number }
interface FleetMetrics { total: number; active: number; maintenance: number; inactive: number; utilizationRate: string }
interface RouteMetrics { total: number; planned: number; inProgress: number; completed: number; completionRate: string }
interface OrderStats { inRoute: number; pending: number; activeVehicles: number; activeIncidents: number; delayed: number }

type Period = 7 | 30 | 90;

/* ─────────── Helpers ─────────── */
const formatMinutes = (m: number) => {
  if (m < 60) return `${Math.round(m)}m`;
  return `${Math.floor(m / 60)}h ${Math.round(m % 60)}m`;
};

const trend = (current: number, previous?: number): { dir: 'up' | 'down' | 'flat'; pct: string } | null => {
  if (previous === undefined || previous === 0) return null;
  const diff = ((current - previous) / previous) * 100;
  const pct = `${Math.abs(diff).toFixed(1)}%`;
  if (Math.abs(diff) < 0.5) return { dir: 'flat', pct };
  return { dir: diff > 0 ? 'up' : 'down', pct };
};

/* ─────────── Sub-components ─────────── */
const KpiCard: React.FC<{
  label: string; value: string | number; icon: React.ReactNode;
  trendDir?: 'up' | 'down' | 'flat'; trendPct?: string; accent: string;
}> = ({ label, value, icon, trendDir, trendPct, accent }) => (
  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      {trendDir && trendPct && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${
          trendDir === 'up' ? 'text-emerald-600 dark:text-emerald-400' :
          trendDir === 'down' ? 'text-red-600 dark:text-red-400' :
          'text-gray-400'
        }`}>
          {trendDir === 'up' ? <ArrowUpRight size={12} /> :
           trendDir === 'down' ? <ArrowDownRight size={12} /> : null}
          {trendPct}
        </span>
      )}
    </div>
    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</p>
    <p className="text-2xl font-black text-gray-900 dark:text-gray-100 tabular-nums">{value}</p>
  </div>
);

const PeriodPill: React.FC<{ value: Period; active: Period; onClick: (v: Period) => void }> = ({ value, active, onClick }) => (
  <button onClick={() => onClick(value)}
    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
      active === value
        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
    }`}
  >
    {value === 7 ? '7 días' : value === 30 ? '30 días' : '90 días'}
  </button>
);

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 py-2.5 shadow-lg">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-bold" style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

/* ─────────── Main page ─────────── */
const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { can } = usePermissions(user?.role);
  const canExport = can('reports.export');

  const [period, setPeriod] = useState<Period>(30);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [deliveries, setDeliveries] = useState<DayCount[]>([]);
  const [avgTimes, setAvgTimes] = useState<DayAvg[]>([]);
  const [topDrivers, setTopDrivers] = useState<DriverStat[]>([]);
  const [zones, setZones] = useState<ZoneStat[]>([]);
  const [fleet, setFleet] = useState<FleetMetrics | null>(null);
  const [routes, setRoutes] = useState<RouteMetrics | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [analytics, avg, f, r, os] = await Promise.all([
        reportsApi.getAnalytics(),
        reportsApi.getAvgTimeByDay(period),
        reportsApi.getFleetMetrics(),
        reportsApi.getRoutesMetrics(),
        reportsApi.getOrderStats(),
      ]);
      const a = analytics.data;
      setKpis(a.kpis);
      setDeliveries(a.deliveriesByDay || []);
      setTopDrivers(a.topDrivers || []);
      setZones(a.zoneDistribution || []);
      setAvgTimes(avg.data || []);
      setFleet(f.data);
      setRoutes(r.data);
      setOrderStats(os.data);
    } catch {
      toast.error('Error al cargar reportes');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleExport = async (type: 'pdf' | 'excel') => {
    setExporting(type);
    try {
      if (type === 'pdf') await reportsApi.exportPdf();
      else await reportsApi.exportExcel();
      toast.success(`Reporte ${type.toUpperCase()} descargado`);
    } catch {
      toast.error('Error al exportar');
    } finally {
      setExporting('');
    }
  };

  if (loading) {
    return (
      <MainLayout title="Reportes y Métricas">
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-72 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            <div className="h-72 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Reportes y Métricas">
      <div className="space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BarChart3 size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Reportes y Métricas Logísticas</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Panorama general de operaciones · datos en tiempo real
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canExport && (
              <>
                <button onClick={() => handleExport('pdf')} disabled={!!exporting}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  <FileText size={14} /> {exporting === 'pdf' ? 'Exportando...' : 'PDF'}
                </button>
                <button onClick={() => handleExport('excel')} disabled={!!exporting}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 shadow-sm"
                >
                  <FileSpreadsheet size={14} /> {exporting === 'excel' ? 'Exportando...' : 'Excel'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Period pills ── */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">Período</span>
          {([7, 30, 90] as Period[]).map((p) => (
            <PeriodPill key={p} value={p} active={period} onClick={setPeriod} />
          ))}
        </div>

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard label="Total Pedidos" value={kpis?.totalOrders ?? 0}
            icon={<Package size={18} className="text-white" />}
            accent="bg-blue-600" />
          <KpiCard label="Entregados Hoy" value={kpis?.deliveredToday ?? 0}
            icon={<CheckCircle2 size={18} className="text-white" />}
            accent="bg-emerald-600" />
          <KpiCard label="En Tránsito" value={kpis?.inTransit ?? 0}
            icon={<Truck size={18} className="text-white" />}
            accent="bg-indigo-600" />
          <KpiCard label="Pendientes" value={kpis?.pending ?? 0}
            icon={<Clock size={18} className="text-white" />}
            accent="bg-amber-600" />
          <KpiCard label="Tasa de Éxito" value={kpis ? `${kpis.successRate}%` : '—'}
            icon={<Target size={18} className="text-white" />}
            accent="bg-emerald-600"
            trendDir={kpis && kpis.successRate >= 95 ? 'up' : kpis && kpis.successRate >= 80 ? undefined : 'down'}
            trendPct={kpis && kpis.successRate >= 95 ? 'óptimo' : kpis && kpis.successRate >= 80 ? undefined : 'bajo'} />
          <KpiCard label="Tiempo Prom." value={kpis ? formatMinutes(kpis.avgDeliveryTime) : '—'}
            icon={<Zap size={18} className="text-white" />}
            accent="bg-violet-600" />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Delivery Trend */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp size={15} className="text-blue-600" />
                Tendencia de Entregas
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md font-medium">
                últimos {period} días
              </span>
            </div>
            {deliveries.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                <BarChart3 size={36} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">Sin datos de entregas</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={deliveries} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="deliveryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--chart-axis, #9ca3af)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--chart-axis, #9ca3af)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="count" name="Entregas" stroke="#2563eb" strokeWidth={2.5} fill="url(#deliveryGrad)" dot={false} activeDot={{ r: 5, fill: '#2563eb' }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Zone Distribution */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <MapPin size={15} className="text-emerald-600" />
                Distribución por Zona
              </h3>
            </div>
            {zones.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-60 text-gray-400">
                <Layers size={36} className="mb-2 opacity-20" />
                <p className="text-sm font-medium">Sin datos de zonas</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={zones} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--chart-axis, #9ca3af)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="zone" tick={{ fontSize: 11, fill: 'var(--chart-axis, #9ca3af)' }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="count" name="Pedidos" radius={[0, 6, 6, 0]} fill="var(--chart-bar, #3b82f6)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Avg Time Trend ── */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <Clock size={15} className="text-violet-600" />
              Tiempo Promedio de Entrega
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md font-medium">
              últimos {period} días
            </span>
          </div>
          {avgTimes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <Clock size={36} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">Sin datos de tiempo promedio</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={avgTimes} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--chart-axis, #9ca3af)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--chart-axis, #9ca3af)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="avgTime" name="Tiempo promedio (min)" stroke="#7c3aed" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#7c3aed' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Bottom metrics row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Top Drivers */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Award size={15} className="text-amber-600" />
                Top Transportistas
              </h3>
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md font-medium">Ranking</span>
            </div>
            <div className="space-y-3">
              {topDrivers.map((d, i) => (
                <div key={d.driverId} className={`rounded-xl p-3.5 flex items-center gap-3 border transition-colors ${
                  i === 0
                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800'
                }`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${
                    i === 0 ? 'bg-amber-500 text-white' :
                    i === 1 ? 'bg-gray-400 text-white' :
                    'bg-orange-400 text-white'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">{d.driverName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{d.deliveries} entregas completadas</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-black ${i === 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500'}`}>
                      {topDrivers.length > 0 && kpis?.totalOrders
                        ? `${((d.deliveries / topDrivers.reduce((s, x) => s + x.deliveries, 0)) * 100).toFixed(0)}%`
                        : '—'}
                    </span>
                  </div>
                </div>
              ))}
              {topDrivers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Truck size={28} className="mb-2 opacity-20" />
                  <p className="text-sm">Sin datos de transportistas</p>
                </div>
              )}
            </div>
          </div>

          {/* Fleet Metrics */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Truck size={15} className="text-blue-600" />
                Estado de Flota
              </h3>
              {fleet && (
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-md">
                  {fleet.utilizationRate} uso
                </span>
              )}
            </div>
            {fleet ? (
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-black text-gray-900 dark:text-gray-100 tabular-nums">{fleet.active}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">de {fleet.total} vehículos activos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">En mantenimiento</p>
                    <p className="text-lg font-bold text-red-600 dark:text-red-400">{fleet.maintenance}</p>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${fleet.total ? (fleet.active / fleet.total) * 100 : 0}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/40">
                    <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Activos</p>
                    <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{fleet.active}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-950/20 rounded-xl p-3 border border-red-100 dark:border-red-900/40">
                    <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Inactivos</p>
                    <p className="text-xl font-black text-red-700 dark:text-red-300">{fleet.inactive}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400">
                <Wrench size={28} className="opacity-20" />
              </div>
            )}
          </div>

          {/* Route Metrics */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Route size={15} className="text-indigo-600" />
                Rendimiento de Rutas
              </h3>
              {routes && (
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded-md">
                  {routes.completionRate} completadas
                </span>
              )}
            </div>
            {routes ? (
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-3xl font-black text-gray-900 dark:text-gray-100 tabular-nums">{routes.completed}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">de {routes.total} rutas completadas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">En progreso</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{routes.inProgress}</p>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-600" style={{ width: `${routes.total ? (routes.completed / routes.total) * 100 : 0}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-100 dark:border-amber-900/40">
                    <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Planificadas</p>
                    <p className="text-xl font-black text-amber-700 dark:text-amber-300">{routes.planned}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-100 dark:border-blue-900/40">
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">En Ruta</p>
                    <p className="text-xl font-black text-blue-700 dark:text-blue-300">{routes.inProgress}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-gray-400">
                <Route size={28} className="opacity-20" />
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
