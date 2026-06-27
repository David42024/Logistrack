import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import CustomTable, { Column } from '../components/common/CustomTable';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import { LoadingSpinner } from '../components/common/StatsCard';
import { customersApi } from '../api/customers.api';
import { driversApi } from '../api/drivers.api';
import { fleetApi, Vehicle } from '../api/fleet.api';
import { Customer, Order } from '../types/order.types';
import { Driver } from '../types/driver.types';
import { formatDate, formatDateTime } from '../utils/dateFormats';
import { driverStatusColors, driverStatusLabels } from '../utils/statusColors';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Search, User, Mail, Phone, MapPin, FileText, X, Truck, Users, Plus } from 'lucide-react';

type TabKey = 'customers' | 'drivers' | 'fleet';

const CatalogosPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('customers');

  const TabHeader = () => (
    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
      {([
        { key: 'customers' as TabKey, label: 'Clientes', icon: <Users size={16} /> },
        { key: 'drivers' as TabKey, label: 'Transportistas', icon: <Truck size={16} /> },
        { key: 'fleet' as TabKey, label: 'Flota (Vehículos)', icon: <Truck size={16} /> },
      ]).map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === tab.key
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <MainLayout title="Catálogos">
      <TabHeader />
      {activeTab === 'customers' && <CustomersTab />}
      {activeTab === 'drivers' && <DriversTab />}
      {activeTab === 'fleet' && <FleetTab />}
    </MainLayout>
  );
};

/* ════════════════════════ TAB: CLIENTES ════════════════════════ */
const CustomersTab: React.FC = () => {
  const { user } = useAuth();
  const { can: canCust } = usePermissions(user?.role);
  const canCreateCustomer = canCust('customers.create');
  const canUpdateCustomer = canCust('customers.update');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try { const res = await customersApi.getAll({ search }); setCustomers(res.data); }
    catch { toast.error('Error al cargar clientes'); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error('Nombre y Correo son obligatorios'); return; }
    setSaving(true);
    try {
      if (editingCustomer) { await customersApi.update(editingCustomer.id, form); toast.success('Cliente actualizado'); }
      else { await customersApi.create(form); toast.success('Cliente creado'); }
      setShowForm(false); setEditingCustomer(null);
      setForm({ name: '', email: '', phone: '', address: '' });
      fetchCustomers();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error al guardar cliente'); }
    finally { setSaving(false); }
  };

  const handleEditClick = (cust: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCustomer(cust);
    setForm({ name: cust.name, email: cust.email, phone: cust.phone || '', address: cust.address || '' });
    setShowForm(true);
  };

  const handleViewOrdersClick = async (cust: Customer, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(cust);
    setLoadingOrders(true);
    try { const res = await customersApi.getOrders(cust.id); setCustomerOrders(res.data); }
    catch { toast.error('Error al cargar historial'); }
    finally { setLoadingOrders(false); }
  };

  const getCustomerTier = (orderCount: number) => {
    if (orderCount >= 10) return { label: 'Corporativo', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' };
    if (orderCount >= 5) return { label: 'Frecuente', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    return { label: 'Estándar', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300' };
  };

  const columns: Column<Customer>[] = [
    { key: 'name', header: 'Nombre', render: (_, cust) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">{cust.name.charAt(0).toUpperCase()}</div>
        <div><p className="font-semibold text-gray-800 dark:text-gray-100">{cust.name}</p><p className="text-xs text-gray-400">ID: {cust.id.substring(0, 8)}...</p></div>
      </div>
    )},
    { key: 'email', header: 'Contacto', render: (_, cust) => (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><Mail size={12} className="text-gray-400" /><span>{cust.email}</span></div>
        {cust.phone && <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"><Phone size={12} className="text-gray-400" /><span>{cust.phone}</span></div>}
      </div>
    )},
    { key: 'address', header: 'Dirección', render: (_, cust) => (
      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 max-w-xs truncate">
        <MapPin size={12} className="text-gray-400 flex-shrink-0" />
        <span className="truncate">{cust.address || <span className="text-gray-400 italic">No especificada</span>}</span>
      </div>
    )},
    { key: 'actions', header: 'Acciones', render: (_, cust) => (
      <div className="flex gap-2">
        <button onClick={(e) => handleViewOrdersClick(cust, e)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-sky-400 font-semibold"><FileText size={14} /> Historial</button>
        {canUpdateCustomer && <button onClick={(e) => handleEditClick(cust, e)} className="text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 font-semibold">Editar</button>}
      </div>
    )},
  ];

  const orderColumns: Column<Order>[] = [
    { key: 'orderNumber', header: 'N° Pedido', render: (_, o) => <span className="font-mono font-bold text-blue-600 dark:text-sky-300">{o.orderNumber}</span> },
    { key: 'route', header: 'Ruta', render: (_, o) => <span className="text-xs">{o.origin} → {o.destination}</span> },
    { key: 'status', header: 'Estado', render: (_, o) => <OrderStatusBadge status={o.status} /> },
    { key: 'createdAt', header: 'Fecha', render: (_, o) => <span className="text-xs">{formatDate(o.createdAt)}</span> },
  ];

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Gestión de Clientes</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Directorio de clientes y registro de volumen comercial.</p>
        </div>
        {(showForm || canCreateCustomer) && (
          <button onClick={() => { setEditingCustomer(null); setForm({ name: '', email: '', phone: '', address: '' }); setShowForm(!showForm); }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            {showForm ? 'Cerrar' : '+ Nuevo Cliente'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">{editingCustomer ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h3>
          <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Nombre *</label><input required type="text" placeholder="Ej. Distribuidora del Norte" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Correo *</label><input required type="email" placeholder="Ej. contacto@cliente.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Teléfono</label><input type="text" placeholder="Ej. +51 987 654 321" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Dirección</label><input type="text" placeholder="Ej. Av. Industrial 456, Trujillo" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputClass} /></div>
            <div className="col-span-1 md:col-span-2 flex gap-3 mt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditingCustomer(null); }} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar Cliente'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4 flex items-center relative max-w-md">
        <Search size={18} className="absolute left-3 text-gray-400" />
        <input type="text" placeholder="Buscar por nombre o correo..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200" />
      </div>

      <CustomTable columns={columns} data={customers} loading={loading} emptyMessage="No se encontraron clientes registrados." />

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <User className="text-blue-600 dark:text-blue-400" size={20} />
                <div><h3 className="font-bold text-gray-900 dark:text-gray-100">{selectedCustomer.name}</h3><p className="text-xs text-gray-500 dark:text-gray-400">{selectedCustomer.email}</p></div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"><X size={20} /></button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200/60 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-500 mb-1">Total Pedidos</span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{loadingOrders ? '...' : customerOrders.length}</span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200/60 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-500 mb-1">Clasificación</span>
                  {loadingOrders ? <span className="text-sm">Cargando...</span> : <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getCustomerTier(customerOrders.length).color}`}>{getCustomerTier(customerOrders.length).label}</span>}
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200/60 flex flex-col items-center text-center">
                  <span className="text-xs text-gray-500 mb-1">Total Carga</span>
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{loadingOrders ? '...' : `${customerOrders.reduce((sum, ord) => sum + (ord.weight || 0), 0).toFixed(1)} kg`}</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Historial Consolidado de Despachos</h4>
                <CustomTable columns={orderColumns} data={customerOrders} loading={loadingOrders} emptyMessage="Este cliente aún no tiene pedidos." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex justify-end">
              <button onClick={() => setSelectedCustomer(null)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════ TAB: TRANSPORTISTAS ════════════════════════ */
const DriversTab: React.FC = () => {
  const { user } = useAuth();
  const { can: canDrv } = usePermissions(user?.role);
  const canCreateDriver = canDrv('drivers.create');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', vehicleType: '', vehiclePlate: '', licenseNumber: '' });
  const [saving, setSaving] = useState(false);

  const fetchDrivers = async () => {
    setLoading(true);
    try { const res = await driversApi.getAll(); setDrivers(res.data); }
    catch { toast.error('Error al cargar transportistas'); }
    finally { setLoading(false); }
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
    } catch { toast.error('Error al crear transportista'); }
    finally { setSaving(false); }
  };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Transportistas</h2>
        {(showForm || canCreateDriver) && <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">+ Nuevo Transportista</button>}
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 font-semibold text-gray-700 dark:text-gray-200">Registrar Transportista</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Nombre *</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Teléfono</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Tipo de Vehículo</label><input value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} className={inputClass} placeholder="Camión, Furgón..." /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Placa</label><input value={form.vehiclePlate} onChange={(e) => setForm({ ...form, vehiclePlate: e.target.value })} className={inputClass} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">N° Licencia</label><input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} className={inputClass} /></div>
            <div className="col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar'}</button>
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
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${driverStatusColors[d.status] || ''}`}>
                  {driverStatusLabels[d.status] || d.status}
                </span>
              </div>
              <div className="space-y-1 text-xs text-gray-400 dark:text-gray-500">
                {d.phone && <p>📞 {d.phone}</p>}
                {d.licenseNumber && <p>🪪 {d.licenseNumber}</p>}
              </div>
            </div>
          ))}
          {drivers.length === 0 && <div className="col-span-3 py-12 text-center text-gray-400">No hay transportistas registrados</div>}
        </div>
      )}
    </div>
  );
};

/* ════════════════════════ TAB: FLOTA (VEHÍCULOS) ════════════════════════ */
const FleetTab: React.FC = () => {
  const { user } = useAuth();
  const { can: canFleet } = usePermissions(user?.role);
  const canCreateFleet = canFleet('fleet.create');
  const canUpdateFleet = canFleet('fleet.update');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    plate: '', type: 'truck' as Vehicle['type'], model: '', year: new Date().getFullYear(),
    capacity: 0, status: 'active' as Vehicle['status'], insuranceExpiry: '', itvExpiry: '', mileage: 0,
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try { const res = await fleetApi.getAll(); setVehicles(res.data); }
    catch { toast.error('Error al cargar vehículos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.plate || !form.model) { toast.error('Placa y Modelo son obligatorios'); return; }
    setSaving(true);
    try {
      if (editing) {
        await fleetApi.update(editing.id, form);
        toast.success('Vehículo actualizado');
      } else {
        await fleetApi.create(form);
        toast.success('Vehículo registrado');
      }
      setShowForm(false); setEditing(null);
      setForm({ plate: '', type: 'truck', model: '', year: new Date().getFullYear(), capacity: 0, status: 'active', insuranceExpiry: '', itvExpiry: '', mileage: 0 });
      fetchVehicles();
    } catch { toast.error('Error al guardar vehículo'); }
    finally { setSaving(false); }
  };

  const handleEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({
      plate: v.plate, type: v.type, model: v.model, year: v.year, capacity: v.capacity,
      status: v.status, insuranceExpiry: v.insuranceExpiry || '', itvExpiry: v.itvExpiry || '', mileage: v.mileage || 0,
    });
    setShowForm(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try { await fleetApi.updateStatus(id, status); toast.success('Estado actualizado'); fetchVehicles(); }
    catch { toast.error('Error al actualizar estado'); }
  };

  const vehicleTypeLabels: Record<string, string> = { truck: 'Camión', van: 'Furgoneta', motorcycle: 'Moto' };
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
    maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200',
    inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };
  const statusLabels: Record<string, string> = { active: 'Activo', maintenance: 'Mantenimiento', inactive: 'Inactivo' };

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

  const columns: Column<Vehicle>[] = [
    { key: 'plate', header: 'Placa', render: (_, v) => <span className="font-mono font-bold text-gray-800 dark:text-gray-100">{v.plate}</span> },
    { key: 'type', header: 'Tipo', render: (_, v) => <span className="text-sm">{vehicleTypeLabels[v.type] || v.type}</span> },
    { key: 'model', header: 'Modelo', render: (_, v) => <span className="text-sm">{v.model} ({v.year})</span> },
    { key: 'capacity', header: 'Capacidad', render: (_, v) => <span className="text-sm font-medium">{v.capacity} kg</span> },
    { key: 'mileage', header: 'Kilometraje', render: (_, v) => <span className="text-sm">{v.mileage ? `${v.mileage.toLocaleString()} km` : '-'}</span> },
    { key: 'status', header: 'Estado', render: (_, v) =>
      canUpdateFleet ? (
        <select value={v.status} onChange={(e) => handleStatusChange(v.id, e.target.value)}
          className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer ${statusColors[v.status] || ''}`}>
          <option value="active">Activo</option>
          <option value="maintenance">Mantenimiento</option>
          <option value="inactive">Inactivo</option>
        </select>
      ) : (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[v.status] || ''}`}>
          {v.status === 'active' ? 'Activo' : v.status === 'maintenance' ? 'Mantenimiento' : 'Inactivo'}
        </span>
      )
    },
    { key: 'actions', header: 'Acciones', render: (_, v) => canUpdateFleet ? (
      <button onClick={() => handleEdit(v)} className="text-xs text-blue-600 hover:text-blue-800 dark:text-sky-400 font-semibold">Editar</button>
    ) : <span className="text-xs text-gray-400">—</span>},
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Flota de Vehículos</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Gestión completa de la flota comercial.</p>
        </div>
        {(showForm || canCreateFleet) && (
          <button onClick={() => { setEditing(null); setForm({ plate: '', type: 'truck', model: '', year: new Date().getFullYear(), capacity: 0, status: 'active', insuranceExpiry: '', itvExpiry: '', mileage: 0 }); setShowForm(!showForm); }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            {showForm ? 'Cerrar' : '+ Nuevo Vehículo'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 font-semibold text-gray-800 dark:text-gray-100">{editing ? 'Editar Vehículo' : 'Registrar Vehículo'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Placa *</label><input required value={form.plate} onChange={(e) => setForm({ ...form, plate: e.target.value })} className={inputClass} placeholder="ABC-123" /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Vehicle['type'] })} className={inputClass}>
                <option value="truck">Camión</option><option value="van">Furgoneta</option><option value="motorcycle">Moto</option>
              </select>
            </div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Modelo *</label><input required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className={inputClass} placeholder="Toyota Hiace" /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Año</label><input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Capacidad (kg)</label><input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Kilometraje</label><input type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: Number(e.target.value) })} className={inputClass} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Estado</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Vehicle['status'] })} className={inputClass}>
                <option value="active">Activo</option><option value="maintenance">Mantenimiento</option><option value="inactive">Inactivo</option>
              </select>
            </div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Vencimiento Seguro</label><input type="date" value={form.insuranceExpiry} onChange={(e) => setForm({ ...form, insuranceExpiry: e.target.value })} className={inputClass} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Vencimiento ITV</label><input type="date" value={form.itvExpiry} onChange={(e) => setForm({ ...form, itvExpiry: e.target.value })} className={inputClass} /></div>
            <div className="col-span-1 md:col-span-3 flex gap-3 mt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </div>
      )}

      <CustomTable columns={columns} data={vehicles} loading={loading} emptyMessage="No hay vehículos registrados en la flota." />
    </div>
  );
};

export default CatalogosPage;
