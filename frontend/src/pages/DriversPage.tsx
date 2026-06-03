import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { DriverCard } from '../components/drivers/DriverCard';
import { LoadingSpinner } from '../components/common/StatsCard';
import { driversApi } from '../api/drivers.api';
import { Driver } from '../types/driver.types';
import { driverStatusColors, driverStatusLabels } from '../utils/statusColors';
import toast from 'react-hot-toast';

const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', vehicleType: '', vehiclePlate: '', licenseNumber: '' });
  const [saving, setSaving] = useState(false);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await driversApi.getAll();
      setDrivers(res.data);
    } catch {
      toast.error('Error al cargar transportistas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await driversApi.create(form);
      toast.success('Transportista creado');
      setShowForm(false);
      setForm({ name: '', phone: '', vehicleType: '', vehiclePlate: '', licenseNumber: '' });
      fetchDrivers();
    } catch {
      toast.error('Error al crear transportista');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

  return (
    <MainLayout title="Transportistas">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Transportistas</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
        >
          + Nuevo Transportista
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 font-semibold text-gray-700 dark:text-gray-200">Registrar Transportista</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Nombre *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Teléfono</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Tipo de Vehículo</label>
              <input value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} className={inputClass} placeholder="Camión, Furgón..." />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Placa</label>
              <input value={form.vehiclePlate} onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">N° Licencia</label>
              <input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} className={inputClass} />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <LoadingSpinner size="lg" /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((d) => (
            <div key={d.id} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-100">{d.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{d.vehicleType} · {d.vehiclePlate}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${driverStatusColors[d.status]}`}>
                  {driverStatusLabels[d.status]}
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-400 dark:text-gray-500">
                {d.phone && <p>📞 {d.phone}</p>}
                {d.licenseNumber && <p>🪪 {d.licenseNumber}</p>}
              </div>
            </div>
          ))}
          {drivers.length === 0 && (
            <div className="col-span-3 py-12 text-center text-gray-400 dark:text-gray-500">
              No hay transportistas registrados
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default DriversPage;
