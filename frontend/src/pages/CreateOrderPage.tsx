import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { ordersApi } from '../api/orders.api';
import { customersApi } from '../api/customers.api';
import toast from 'react-hot-toast';
import {
  User,
  MapPin,
  Package,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  Search,
  ChevronRight,
  X,
  Weight,
  Boxes,
} from 'lucide-react';

/* ─────────── Section card ─────────── */
const SectionCard: React.FC<{
  step: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ step, title, subtitle, icon, children }) => (
  <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-black flex-shrink-0">
        {step}
      </div>
      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">{icon}</div>
      <div>
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

/* ─────────── Input helper styles ─────────── */
const INPUT =
  'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';

const LABEL = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5';

const MERCHANDISE_TYPES = [
  'Electrónicos',
  'Alimentos y Bebidas',
  'Textiles y Ropa',
  'Materiales de Construcción',
  'Medicamentos',
  'Maquinaria Industrial',
  'Muebles y Decoración',
  'Productos Químicos',
  'Papelería y Oficina',
  'Otros',
];

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customMerchandise, setCustomMerchandise] = useState(false);

  const [form, setForm] = useState({
    customerId: '',
    origin: '',
    destination: '',
    merchandiseType: '',
    weight: '',
    estimatedDate: '',
  });

  // Fetch customers for autocomplete
  useEffect(() => {
    if (form.customerId) return;
    if (!customerSearch.trim()) { setCustomers([]); return; }
    const t = setTimeout(() => {
      customersApi.getAll({ search: customerSearch }).then((r) => {
        setCustomers(r.data);
        setShowDropdown(true);
      });
    }, 250);
    return () => clearTimeout(t);
  }, [customerSearch, form.customerId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId) { toast.error('Selecciona un cliente'); return; }
    if (!form.origin.trim()) { toast.error('El origen es obligatorio'); return; }
    if (!form.destination.trim()) { toast.error('El destino es obligatorio'); return; }
    if (!form.merchandiseType.trim()) { toast.error('Especifica el tipo de mercancía'); return; }
    if (!form.weight || +form.weight <= 0) { toast.error('El peso debe ser mayor a 0'); return; }

    setLoading(true);
    try {
      const res = await ordersApi.create({ ...form, weight: parseFloat(form.weight) });
      toast.success(`Pedido ${res.data.orderNumber} creado correctamente`);
      navigate(`/orders/${res.data.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Error al crear pedido');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    form.customerId &&
    form.origin.trim() &&
    form.destination.trim() &&
    form.merchandiseType.trim() &&
    form.weight &&
    +form.weight > 0;

  return (
    <MainLayout title="Nuevo Pedido">
      <div className="max-w-2xl mx-auto">
        {/* ── Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={17} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Crear Nuevo Pedido</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Completa los datos del despacho · se generará un ID automático
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Section 1: Client ── */}
          <SectionCard
            step={1}
            title="Datos del Cliente"
            subtitle="Selecciona el destinatario del pedido"
            icon={<User size={15} />}
          >
            <div className="relative">
              <label className={LABEL}>Cliente *</label>
              {/* Selected state */}
              {form.customerId ? (
                <div className="flex items-center justify-between rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                      {customerSearch}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, customerId: '' });
                      setCustomerSearch('');
                      setCustomers([]);
                      setShowDropdown(false);
                    }}
                    className="p-1 text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Escribe para buscar clientes..."
                      value={customerSearch}
                      onChange={(e) => { setCustomerSearch(e.target.value); setShowDropdown(true); }}
                      onFocus={() => customerSearch && setShowDropdown(true)}
                      className={`${INPUT} pl-9`}
                    />
                  </div>
                  {showDropdown && customers.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl">
                      {customers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, customerId: c.id });
                            setCustomerSearch(c.name);
                            setShowDropdown(false);
                          }}
                          className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 text-left hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors group"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                              {c.name}
                            </p>
                            <p className="text-xs text-gray-400">{c.email}</p>
                          </div>
                          <ChevronRight size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                  {showDropdown && customerSearch && customers.length === 0 && (
                    <div className="mt-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-6 text-center shadow-lg">
                      <User size={24} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No se encontraron clientes</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Intenta con otro nombre o correo</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </SectionCard>

          {/* ── Section 2: Route ── */}
          <SectionCard
            step={2}
            title="Ruta de Envío"
            subtitle="Origen y destino del despacho"
            icon={<MapPin size={15} />}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Ciudad de Origen *</label>
                <input
                  name="origin"
                  value={form.origin}
                  onChange={handleChange}
                  required
                  placeholder="Ej. Lima"
                  className={INPUT}
                />
              </div>
              <div>
                <label className={LABEL}>Ciudad de Destino *</label>
                <input
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  required
                  placeholder="Ej. Arequipa"
                  className={INPUT}
                />
              </div>
            </div>
            {form.origin && form.destination && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-950/20 rounded-lg px-3 py-2 border border-blue-100 dark:border-blue-900/40">
                <MapPin size={12} className="text-blue-500" />
                <span className="font-semibold text-blue-700 dark:text-blue-300">{form.origin}</span>
                <span className="text-gray-400">→</span>
                <span className="font-semibold text-blue-700 dark:text-blue-300">{form.destination}</span>
              </div>
            )}
          </SectionCard>

          {/* ── Section 3: Merchandise ── */}
          <SectionCard
            step={3}
            title="Detalles de Mercancía"
            subtitle="Tipo de carga y peso del envío"
            icon={<Boxes size={15} />}
          >
            <div className="space-y-4">
              <div>
                <label className={LABEL}>Tipo de Mercancía *</label>
                {!customMerchandise ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                      {MERCHANDISE_TYPES.slice(0, -1).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setForm({ ...form, merchandiseType: type })}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                            form.merchandiseType === type
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-600/20'
                              : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setCustomMerchandise(true); setForm({ ...form, merchandiseType: '' }); }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      + Especificar otro tipo
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <input
                      name="merchandiseType"
                      value={form.merchandiseType}
                      onChange={handleChange}
                      required
                      placeholder="Ej. Maquinaria pesada"
                      className={`${INPUT} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={() => { setCustomMerchandise(false); setForm({ ...form, merchandiseType: '' }); }}
                      className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>

              <div className="max-w-xs">
                <label className={LABEL}>
                  <span className="flex items-center gap-1.5">
                    <Weight size={12} />
                    Peso Total (kg) *
                  </span>
                </label>
                <input
                  name="weight"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.weight}
                  onChange={handleChange}
                  required
                  placeholder="0.0"
                  className={INPUT}
                />
                {form.weight && +form.weight > 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Equivale a aproximadamente {(+form.weight / 1000).toFixed(3)} toneladas métricas
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── Section 4: Scheduling (optional) ── */}
          <SectionCard
            step={4}
            title="Fecha Estimada de Entrega"
            subtitle="Opcional · ayuda a priorizar el despacho"
            icon={<Calendar size={15} />}
          >
            <div className="max-w-xs">
              <label className={LABEL}>Fecha Límite de Entrega</label>
              <input
                name="estimatedDate"
                type="date"
                value={form.estimatedDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={INPUT}
              />
            </div>
          </SectionCard>

          {/* ── Summary preview ── */}
          {isFormValid && (
            <div className="rounded-2xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-4">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-3">
                Resumen del Pedido
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                {[
                  { label: 'Cliente', value: customerSearch },
                  { label: 'Mercancía', value: form.merchandiseType },
                  { label: 'Origen', value: form.origin },
                  { label: 'Peso', value: `${form.weight} kg` },
                  { label: 'Destino', value: form.destination },
                  { label: 'Entrega', value: form.estimatedDate || 'Sin definir' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between border-b border-blue-100 dark:border-blue-900/40 py-1.5">
                    <span className="text-blue-600/70 dark:text-blue-500/70 font-medium">{row.label}</span>
                    <span className="font-semibold text-blue-800 dark:text-blue-300 text-right max-w-[60%] truncate">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-1 pb-8">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="flex-2 flex-grow-[2] py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Creando pedido...
                </>
              ) : (
                <>
                  <Package size={16} />
                  Crear Pedido
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default CreateOrderPage;
