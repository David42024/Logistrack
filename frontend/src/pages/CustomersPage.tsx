import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import CustomTable, { Column } from '../components/common/CustomTable';
import { customersApi } from '../api/customers.api';
import { Customer, Order } from '../types/order.types';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import { formatDate } from '../utils/dateFormats';
import toast from 'react-hot-toast';
import { X, Search, User, Mail, Phone, MapPin, Eye, FileText, Award } from 'lucide-react';

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

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

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
        toast.success('Cliente actualizado correctamente');
      } else {
        await customersApi.create(form);
        toast.success('Cliente creado correctamente');
      }
      setShowForm(false);
      setEditingCustomer(null);
      setForm({ name: '', email: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al guardar cliente';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (cust: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(cust);
    setForm({
      name: cust.name,
      email: cust.email,
      phone: cust.phone || '',
      address: cust.address || '',
    });
    setShowForm(true);
  };

  const handleViewOrdersClick = async (cust: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(cust);
    setLoadingOrders(true);
    try {
      const res = await customersApi.getOrders(cust.id);
      setCustomerOrders(res.data);
    } catch {
      toast.error('Error al cargar el historial de pedidos');
    } finally {
      setLoadingOrders(false);
    }
  };

  // Classify volume / customer type
  const getCustomerTier = (orderCount: number) => {
    if (orderCount >= 10) return { label: 'Corporativo (Alto)', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' };
    if (orderCount >= 5) return { label: 'Frecuente (Medio)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    return { label: 'Estándar', color: 'bg-gray-100 text-gray-800 dark:bg-gray-850 dark:text-gray-300' };
  };

  const columns: Column<Customer>[] = [
    {
      key: 'name',
      header: 'Nombre / Razón Social',
      render: (_, cust) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            {cust.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{cust.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">ID: {cust.id.substring(0, 8)}...</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Contacto',
      render: (_, cust) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
            <Mail size={12} className="text-gray-400" />
            <span>{cust.email}</span>
          </div>
          {cust.phone && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Phone size={12} className="text-gray-400" />
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
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 max-w-xs truncate">
          <MapPin size={12} className="text-gray-400 flex-shrink-0" />
          <span className="truncate">{cust.address || <span className="text-gray-400 italic">No especificada</span>}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (_, cust) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => handleViewOrdersClick(cust, e)}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-sky-400 dark:hover:text-sky-300 font-semibold"
          >
            <FileText size={14} />
            <span>Historial</span>
          </button>
          <button
            onClick={(e) => handleEditClick(cust, e)}
            className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 font-semibold ml-2"
          >
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
        <span className="font-mono font-bold text-blue-600 dark:text-sky-300">
          {order.orderNumber}
        </span>
      ),
    },
    {
      key: 'route',
      header: 'Ruta',
      render: (_, order) => (
        <span className="text-xs">
          {order.origin} → {order.destination}
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
      render: (_, order) => <span className="text-xs">{formatDate(order.createdAt)}</span>,
    },
  ];

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

  return (
    <MainLayout title="Clientes">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gestión de Clientes</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Directorio de clientes y registro de volumen comercial.</p>
        </div>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setForm({ name: '', email: '', phone: '', address: '' });
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          {showForm ? 'Cerrar Formulario' : '+ Nuevo Cliente'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">
            {editingCustomer ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
          </h3>
          <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Nombre / Razón Social *</label>
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
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Correo Electrónico *</label>
              <input
                required
                type="email"
                placeholder="Ej. contacto@cliente.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Teléfono de Contacto</label>
              <input
                type="text"
                placeholder="Ej. +51 987 654 321"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Dirección Fiscal / Entrega</label>
              <input
                type="text"
                placeholder="Ej. Av. Industrial 456, Trujillo"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="col-span-1 md:col-span-2 flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingCustomer(null);
                }}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar Cliente'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search */}
      <div className="mb-4 flex items-center relative max-w-md">
        <Search size={18} className="absolute left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
        />
      </div>

      {/* Main Table */}
      <CustomTable
        columns={columns}
        data={customers}
        loading={loading}
        emptyMessage="No se encontraron clientes registrados."
      />

      {/* Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850">
              <div className="flex items-center gap-2">
                <User className="text-blue-600 dark:text-blue-400" size={20} />
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100">{selectedCustomer.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Stats & Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-200/60 dark:border-gray-800 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Pedidos</span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {loadingOrders ? '...' : customerOrders.length}
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-200/60 dark:border-gray-800 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Clasificación</span>
                  {loadingOrders ? (
                    <span className="text-sm font-medium">Cargando...</span>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getCustomerTier(customerOrders.length).color}`}>
                      {getCustomerTier(customerOrders.length).label}
                    </span>
                  )}
                </div>
                <div className="bg-gray-50 dark:bg-gray-850 p-4 rounded-xl border border-gray-200/60 dark:border-gray-800 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Carga</span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {loadingOrders
                      ? '...'
                      : `${customerOrders.reduce((sum, ord) => sum + (ord.weight || 0), 0).toFixed(1)} kg`}
                  </span>
                </div>
              </div>

              {/* Table of Orders */}
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-1.5">
                  <Award size={16} className="text-amber-500" />
                  <span>Historial Consolidado de Despachos</span>
                </h4>
                <CustomTable
                  columns={orderHistoryColumns}
                  data={customerOrders}
                  loading={loadingOrders}
                  emptyMessage="Este cliente aún no tiene pedidos registrados."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
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
