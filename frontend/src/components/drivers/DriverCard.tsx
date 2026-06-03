import React, { useState, useEffect } from 'react';
import { Driver } from '../../types/driver.types';
import { driversApi } from '../../api/drivers.api';
import { ordersApi } from '../../api/orders.api';
import { LoadingSpinner } from '../common/StatsCard';
import { driverStatusColors, driverStatusLabels } from '../../utils/statusColors';

export const DriverCard: React.FC<{ driver: Driver }> = ({ driver }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-semibold text-gray-800 dark:text-gray-100">{driver.name}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{driver.vehicleType} · {driver.vehiclePlate}</p>
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{driver.phone}</p>
      </div>
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${driverStatusColors[driver.status]}`}>
        {driverStatusLabels[driver.status]}
      </span>
    </div>
  </div>
);

export const DriverList: React.FC<{ drivers: Driver[] }> = ({ drivers }) => (
  <div className="grid gap-3">
    {drivers.map((d) => <DriverCard key={d.id} driver={d} />)}
  </div>
);

interface AssignDriverModalProps {
  orderId: string;
  onClose: () => void;
  onAssigned: (order: any) => void;
}

export const AssignDriverModal: React.FC<AssignDriverModalProps> = ({
  orderId, onClose, onAssigned,
}) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    driversApi.getAvailable().then((r: any) => {
      setDrivers(r.data);
      setLoading(false);
    });
  }, []);

  const handleAssign = async () => {
    if (!selected) return;
    setAssigning(true);
    try {
      const res = await ordersApi.assignDriver(orderId, selected);
      onAssigned(res.data);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-bold text-gray-800 dark:text-gray-100">Asignar Transportista</h2>
        {loading ? (
          <LoadingSpinner />
        ) : drivers.length === 0 ? (
          <p className="py-4 text-center text-gray-500 dark:text-gray-400">No hay transportistas disponibles</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {drivers.map((d) => (
              <label
                key={d.id}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer ${
                  selected === d.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="driver"
                  value={d.id}
                  checked={selected === d.id}
                  onChange={() => setSelected(d.id)}
                  className="accent-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{d.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{d.vehicleType} · {d.vehiclePlate}</p>
                </div>
              </label>
            ))}
          </div>
        )}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={handleAssign}
            disabled={!selected || assigning}
            className="flex-1 rounded-lg bg-blue-600 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {assigning ? 'Asignando...' : 'Asignar'}
          </button>
        </div>
      </div>
    </div>
  );
};
