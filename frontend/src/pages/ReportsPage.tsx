import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { StatsCard, LoadingSpinner } from '../components/common/StatsCard';
import { DeliveryChart } from '../components/reports/DeliveryChart';
import { ReportTable } from '../components/reports/ReportTable';
import { reportsApi } from '../api/reports.api';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import toast from 'react-hot-toast';

const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const { can } = usePermissions(user?.role);
  const canExport = can('reports.export');
  const [kpis, setKpis] = useState<any>(null);
  const [deliveries, setDeliveries] = useState([]);
  const [topDrivers, setTopDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState('');

  useEffect(() => {
    Promise.all([
      reportsApi.getKPIs(),
      reportsApi.getDeliveriesByDay(),
      reportsApi.getTopDrivers(),
    ]).then(([k, d, t]) => {
      setKpis(k.data);
      setDeliveries(d.data);
      setTopDrivers(t.data);
    }).catch(() => toast.error('Error al cargar reportes'))
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <MainLayout title="Reportes"><LoadingSpinner size="lg" /></MainLayout>;

  return (
    <MainLayout title="Reportes">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Reportes y KPIs</h2>
        <div className="flex gap-3">
          {canExport && (
            <>
              <button
                onClick={() => handleExport('pdf')}
                disabled={!!exporting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
              >
                {exporting === 'pdf' ? 'Exportando...' : '📄 Exportar PDF'}
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={!!exporting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60"
              >
                {exporting === 'excel' ? 'Exportando...' : '📊 Exportar Excel'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatsCard title="Total Pedidos" value={kpis?.totalOrders ?? 0} icon={<span>📦</span>} color="blue" />
        <StatsCard title="Pedidos Hoy" value={kpis?.ordersToday ?? 0} icon={<span>📅</span>} color="yellow" />
        <StatsCard title="Entregados Hoy" value={kpis?.deliveredToday ?? 0} icon={<span>✅</span>} color="green" />
        <StatsCard title="En Tránsito" value={kpis?.inTransit ?? 0} icon={<span>🚚</span>} color="purple" />
        <StatsCard title="Tiempo Prom." value={`${kpis?.avgDeliveryHours ?? 0}h`} icon={<span>⏱</span>} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DeliveryChart data={deliveries} />
        </div>
        <div>
          <ReportTable data={topDrivers} />
        </div>
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
