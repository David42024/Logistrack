import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { ordersApi } from '../api/orders.api';
import { customersApi } from '../api/customers.api';
import toast from 'react-hot-toast';

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customerId: '',
    origin: '',
    destination: '',
    merchandiseType: '',
    weight: '',
    estimatedDate: '',
  });

  useEffect(() => {
    if (form.customerId) return;
    customersApi.getAll({ search: customerSearch }).then((r) => setCustomers(r.data));
  }, [customerSearch, form.customerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId) { toast.error('Selecciona un cliente'); return; }
    if (+form.weight <= 0) { toast.error('Peso inválido'); return; }

    setLoading(true);
    try {
      const res = await ordersApi.create({ ...form, weight: parseFloat(form.weight) });
      toast.success(`Pedido ${res.data.orderNumber} creado`);
      navigate(`/orders/${res.data.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear pedido');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  return (
    <MainLayout title="Nuevo Pedido">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-6 text-lg font-bold text-gray-800 dark:text-gray-100">Crear Nuevo Pedido</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Customer */}
            <div>
              <label className={labelClass}>Cliente</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  disabled={!!form.customerId}
                  className={`${inputClass} ${form.customerId ? 'bg-gray-100 dark:bg-gray-850 cursor-not-allowed border-green-400 dark:border-green-600' : ''}`}
                />
                {form.customerId && (
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, customerId: '' });
                      setCustomerSearch('');
                      setCustomers([]);
                    }}
                    className="absolute right-3 top-2 text-xs font-semibold text-red-500 hover:text-red-750 dark:text-red-400"
                  >
                    Cambiar
                  </button>
                )}
              </div>
              {customers.length > 0 && !form.customerId && customerSearch && (
                <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10 relative">
                  {customers.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full border-b border-gray-100 dark:border-gray-700 px-3 py-2 text-left text-sm hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                      onClick={() => {
                        setForm({ ...form, customerId: c.id });
                        setCustomerSearch(c.name);
                      }}
                    >
                      <span className="font-semibold">{c.name}</span>
                      <span className="ml-2 text-gray-400 dark:text-gray-500 text-xs">{c.email}</span>
                    </button>
                  ))}
                </div>
              )}
              {form.customerId && (
                <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span>✓ Cliente seleccionado correctamente</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Origen</label>
                <input name="origin" value={form.origin} onChange={handleChange} required className={inputClass} placeholder="Ciudad de origen" />
              </div>
              <div>
                <label className={labelClass}>Destino</label>
                <input name="destination" value={form.destination} onChange={handleChange} required className={inputClass} placeholder="Ciudad de destino" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo de Mercancía</label>
                <input name="merchandiseType" value={form.merchandiseType} onChange={handleChange} required className={inputClass} placeholder="Ej: Electrónicos" />
              </div>
              <div>
                <label className={labelClass}>Peso (kg)</label>
                <input name="weight" type="number" min="0.1" step="0.1" value={form.weight} onChange={handleChange} required className={inputClass} placeholder="0.0" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Fecha Estimada de Entrega</label>
              <input name="estimatedDate" type="date" value={form.estimatedDate} onChange={handleChange} className={inputClass} />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/orders')}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? 'Creando...' : 'Crear Pedido'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreateOrderPage;
