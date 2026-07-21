import React, { useEffect, useState, useCallback, useRef } from 'react';
import MainLayout from '../components/layout/MainLayout';
import CustomTable, { Column } from '../components/common/CustomTable';
import { customersApi } from '../api/customers.api';
import { Customer, Order } from '../types/order.types';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import { formatDate } from '../utils/dateFormats';
import toast from 'react-hot-toast';
import {
  X,
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Award,
  Users,
  PlusCircle,
  Pencil,
  Package,
  Star,
  TrendingUp,
  Building2,
  ChevronRight,
} from 'lucide-react';

/* ─────────── Customer tier helper ─────────── */
const getCustomerTier = (orderCount: number) => {
  if (orderCount >= 10)
    return {
      label: 'Corporativo',
      sublabel: 'Alto volumen',
      icon: <Building2 size={12} />,
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300',
      dot: 'bg-indigo-500',
    };
  if (orderCount >= 5)
    return {
      label: 'Frecuente',
      sublabel: 'Volumen medio',
      icon: <Star size={12} />,
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    };
  return {
    label: 'Estándar',
    sublabel: 'Bajo volumen',
    icon: <User size={12} />,
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    dot: 'bg-gray-400',
  };
};

/* ─────────── Avatar helper ─────────── */
const AVATAR_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-purple-600',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-600',
  'from-cyan-500 to-sky-600',
];

const getAvatarGradient = (name: string) => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};

/* ─────────── Drawer component ─────────── */
interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Drawer: React.FC<DrawerProps> = ({ open, onClose, title, children }) => (
  <>
    {/* Backdrop */}
    <div
      className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    />
    {/* Panel */}
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-out ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  </>
);

/* ─────────── Main component ─────────── */
const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const searchDebounce = useRef<ReturnType<typeof setTimeout>>();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customersApi.getAll({ search });
      setCustomers(res.data);
    } catch {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleSearchChange = (val: string) => {
    setSearchInput(val);
    clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => setSearch(val), 350);
  };

  const openCreateDrawer = () => {
    setEditingCustomer(null);
    setForm({ name: '', email: '', phone: '', address: '' });
    setDrawerOpen(true);
  };

  const openEditDrawer = (cust: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(cust);
    setForm({ name: cust.name, email: cust.email, phone: cust.phone || '', address: cust.address || '' });
    setDrawerOpen(true);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Nombre y Correo son obligatorios');
      return;
    }
    setSaving(true);
    try {
      if (editingCustomer) {
        await customersApi.update(editingCustomer.id, form);
        toast.success('Cliente actualizado');
      } else {
        await customersApi.create(form);
        toast.success('Cliente registrado');
      }
      setDrawerOpen(false);
      setEditingCustomer(null);
      setForm({ name: '', email: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al guardar cliente');
    } finally {
      setSaving(false);
    }
  };

  const handleViewOrders = async (cust: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(cust);
    setLoadingOrders(true);
    setCustomerOrders([]);
    try {
      const res = await customersApi.getOrders(cust.id);
      setCustomerOrders(res.data);
    } catch {
      toast.error('Error al cargar el historial de pedidos');
    } finally {
      setLoadingOrders(false);
    }
  };

  /* ── Table columns ── */
  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Cliente',
      render: (_, cust) => (
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient(cust.name)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}
          >
            {cust.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{cust.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate font-mono">#{cust.id.substring(0, 8)}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contacto',
      render: (_, cust) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-200">
            <Mail size={12} className="text-blue-400 flex-shrink-0" />
            <span className="truncate max-w-[180px]">{cust.email}</span>
          </div>
          {cust.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Phone size={12} className="text-gray-400 flex-shrink-0" />
              <span>{cust.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'address',
      header: 'Dirección',
      render: (_, cust) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 max-w-[200px]">
          <MapPin size={12} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">
            {cust.address || <span className="text-gray-400 italic">No especificada</span>}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (_, cust) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => handleViewOrders(cust, e)}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-all"
          >
            <FileText size={13} />
            Historial
          </button>
          <button
            onClick={(e) => openEditDrawer(cust, e)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <Pencil size={13} />
            Editar
          </button>
        </div>
      ),
    },
  ];

  const orderHistoryColumns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'N° Pedido',
      render: (_, order) => (
        <span className="font-mono font-bold text-blue-600 dark:text-sky-400 text-xs">{order.orderNumber}</span>
      ),
    },
    {
      key: 'route',
      header: 'Ruta',
      render: (_, order) => (
        <span className="text-xs text-gray-600 dark:text-gray-300">
          {order.origin} <span className="text-gray-400">→</span> {order.destination}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (_, order) => <OrderStatusBadge status={order.status} />,
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      render: (_, order) => <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>,
    },
  ];

  /* ── Input styles ── */
  const inputClass =
    'w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';

  const labelClass = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5';

  return (
    <MainLayout title="Clientes">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600/10 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Users size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Gestión de Clientes</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {customers.length} cliente{customers.length !== 1 ? 's' : ''} registrado{customers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={openCreateDrawer}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm shadow-violet-600/20"
        >
          <PlusCircle size={16} />
          Nuevo Cliente
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          {
            label: 'Total Clientes',
            value: customers.length,
            icon: <Users size={14} />,
            color: 'text-violet-600 dark:text-violet-400',
            bg: 'bg-violet-50 dark:bg-violet-950/30',
          },
          {
            label: 'Corporativos',
            value: '—',
            icon: <Building2 size={14} />,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50 dark:bg-indigo-950/30',
          },
          {
            label: 'Frecuentes',
            value: '—',
            icon: <TrendingUp size={14} />,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/30',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 flex items-center gap-3"
          >
            <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.color} flex items-center justify-center flex-shrink-0`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
              <p className={`text-lg font-black ${card.color}`}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div className="mb-4 relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o correo electrónico..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <CustomTable
          columns={columns}
          data={customers}
          loading={loading}
          emptyMessage="No se encontraron clientes. Registra el primero con el botón de arriba."
        />
      </div>

      {/* ── Create / Edit Drawer ── */}
      <Drawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditingCustomer(null); }}
        title={editingCustomer ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
      >
        <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-5">
          {/* Avatar preview */}
          {form.name && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarGradient(form.name)} flex items-center justify-center text-white font-bold text-sm shadow-sm`}
              >
                {form.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{form.name}</p>
                <p className="text-xs text-gray-400">{editingCustomer ? 'Editando cliente existente' : 'Nuevo cliente'}</p>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Nombre / Razón Social *</label>
            <input
              required
              type="text"
              placeholder="Ej. Distribuidora del Norte"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Correo Electrónico *</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="email"
                placeholder="contacto@empresa.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Teléfono de Contacto</label>
            <div className="relative">
              <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="+51 987 654 321"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Dirección Fiscal / Entrega</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                rows={2}
                placeholder="Av. Industrial 456, Lima"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={`${inputClass} pl-9 resize-none`}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setDrawerOpen(false); setEditingCustomer(null); }}
              className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-all shadow-sm shadow-violet-600/20"
            >
              {saving ? 'Guardando...' : editingCustomer ? 'Actualizar Cliente' : 'Registrar Cliente'}
            </button>
          </div>
        </form>
      </Drawer>

      {/* ── Order History Modal ── */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getAvatarGradient(selectedCustomer.name)} flex items-center justify-center text-white font-bold text-base shadow-sm`}
                >
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base">{selectedCustomer.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-800">
              {[
                {
                  label: 'Total Pedidos',
                  value: loadingOrders ? '—' : customerOrders.length,
                  icon: <Package size={14} />,
                  color: 'text-blue-600 dark:text-blue-400',
                },
                {
                  label: 'Clasificación',
                  value: loadingOrders ? '—' : (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getCustomerTier(customerOrders.length).color}`}>
                      {getCustomerTier(customerOrders.length).label}
                    </span>
                  ),
                  icon: <Award size={14} />,
                  color: 'text-amber-500',
                },
                {
                  label: 'Carga Total',
                  value: loadingOrders
                    ? '—'
                    : `${customerOrders.reduce((s, o) => s + (o.weight || 0), 0).toFixed(1)} kg`,
                  icon: <TrendingUp size={14} />,
                  color: 'text-emerald-600 dark:text-emerald-400',
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-white dark:bg-gray-900 px-5 py-4 flex items-center gap-3">
                  <span className={stat.color}>{stat.icon}</span>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <div className="text-base font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={15} className="text-blue-500" />
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Historial Consolidado de Despachos</h4>
              </div>
              <CustomTable
                columns={orderHistoryColumns}
                data={customerOrders}
                loading={loadingOrders}
                emptyMessage="Este cliente aún no tiene pedidos registrados."
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={(e) => { setSelectedCustomer(null); openEditDrawer(selectedCustomer, e); }}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                <Pencil size={14} />
                Editar cliente
              </button>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default CustomersPage;
