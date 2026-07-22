import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import CustomTable, { Column } from '../components/common/CustomTable';
import { usersApi } from '../api/users.api';
import { authApi } from '../api/auth.api';
import { rolesApi } from '../api/roles.api';
import { User, Role } from '../types/user.types';
import toast from 'react-hot-toast';
import { formatDateTime } from '../utils/dateFormats';
import {
  Search, Shield, Mail, Calendar, Pencil, Trash2, UserPlus,
  X, Users, Settings, Check, Lock, Key, Save, RefreshCw, Loader
} from 'lucide-react';
import { LoadingSpinner } from '../components/common/StatsCard';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions, clearPermissionCache } from '../hooks/usePermissions';

type TabKey = 'users' | 'roles' | 'config';

const AdministracionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('users');

  const TabHeader = () => (
    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
      {([
        { key: 'users' as TabKey, label: 'Usuarios', icon: <Users size={16} /> },
        { key: 'roles' as TabKey, label: 'Roles y Permisos', icon: <Shield size={16} /> },
        { key: 'config' as TabKey, label: 'Configuración', icon: <Settings size={16} /> },
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
    <MainLayout title="Administración">
      <TabHeader />
      {activeTab === 'users' && <UsersTab />}
      {activeTab === 'roles' && <RolesTab />}
      {activeTab === 'config' && <ConfigTab />}
    </MainLayout>
  );
};

/* ════════════════════════ TAB: USUARIOS ════════════════════════ */
const UsersTab: React.FC = () => {
  const { user } = useAuth();
  const { can: canUser } = usePermissions(user?.role);
  const canCreateUser = canUser('users.create');
  const canUpdateUser = canUser('users.update');
  const canDeleteUser = canUser('users.delete');
  const canActivateUser = canUser('users.activate');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'coordinator' as Role });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll({ page, limit: 10 });
      setUsers(res.data.data);
      setTotalPages(res.data.totalPages);
    }
    catch { toast.error('Error al cargar usuarios'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error('Nombre y Correo son obligatorios'); return; }
    setSaving(true);
    try {
      if (editingUser) {
        const payload: any = { name: form.name, email: form.email, role: form.role };
        if (form.password) {
          if (form.password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); setSaving(false); return; }
          payload.password = form.password;
        }
        await usersApi.update(editingUser.id, payload);
        toast.success('Usuario actualizado');
      } else {
        if (!form.password) { toast.error('La contraseña es obligatoria'); setSaving(false); return; }
        if (form.password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); setSaving(false); return; }
        await authApi.register(form);
        toast.success('Usuario registrado');
      }
      setShowForm(false); setEditingUser(null);
      setForm({ name: '', email: '', password: '', role: 'coordinator' });
      fetchUsers();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Error al guardar usuario'); }
    finally { setSaving(false); }
  };

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setShowForm(true);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = !user.isActive;
      await usersApi.updateStatus(user.id, newStatus);
      toast.success(`Usuario ${newStatus ? 'activado' : 'desactivado'}`);
      setUsers(prev => prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u)));
    } catch { toast.error('Error al actualizar estado'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea desactivar este usuario?')) return;
    try {
      await usersApi.remove(id);
      toast.success('Usuario desactivado');
      setUsers(prev => prev.map((u) => (u.id === id ? { ...u, isActive: false } : u)));
    } catch { toast.error('Error al desactivar usuario'); }
  };

  const filteredUsers = search
    ? users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : users;

  const roleMap: Record<Role, { label: string; color: string }> = {
    admin: { label: 'Administrador', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/40' },
    coordinator: { label: 'Coordinador', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40' },
    driver: { label: 'Transportista', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40' },
    customer: { label: 'Cliente', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/40' },
  };

  const columns: Column<User>[] = [
    { key: 'name', header: 'Nombre', render: (_, u) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm">{u.name.charAt(0).toUpperCase()}</div>
        <div><p className="font-semibold text-gray-800 dark:text-gray-100">{u.name}</p><p className="text-[11px] text-gray-400">ID: {u.id.substring(0, 8)}...</p></div>
      </div>
    )},
    { key: 'email', header: 'Usuario', render: (_, u) => (
      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300"><Mail size={12} className="text-gray-400" /><span>{u.email}</span></div>
    )},
    { key: 'role', header: 'Rol', render: (_, u) => {
      const info = roleMap[u.role] || { label: u.role, color: 'bg-gray-100 text-gray-700' };
      return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${info.color}`}>{info.label}</span>;
    }},
    { key: 'createdAt', header: 'Registro', render: (val) => (
      <div className="flex items-center gap-1.5 text-xs text-gray-500"><Calendar size={12} /><span>{val ? formatDateTime(val) : 'N/A'}</span></div>
    )},
    { key: 'isActive', header: 'Estado', render: (_, u) => (
      <div className="flex items-center">
        {canActivateUser ? (
          <button onClick={() => handleToggleStatus(u)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${u.isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${u.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        ) : (
          <span className={`inline-block h-4 w-4 rounded-full ${u.isActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`} />
        )}
        <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-400">{u.isActive ? 'Activo' : 'Inactivo'}</span>
      </div>
    )},
    { key: 'actions', header: 'Acciones', render: (_, u) => (
      <div className="flex items-center gap-1">
        {canUpdateUser && <button onClick={() => handleEditClick(u)} className="text-blue-600 hover:text-blue-800 dark:text-sky-400 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20" title="Editar"><Pencil size={16} /></button>}
        {canDeleteUser && <button onClick={() => handleDelete(u.id)} disabled={!u.isActive} className="text-red-500 hover:text-red-700 disabled:opacity-30 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20" title="Desactivar"><Trash2 size={16} /></button>}
      </div>
    )},
  ];

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Shield className="text-blue-600" size={22} /><span>Gestión de Usuarios</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Administración de accesos, roles y estados operativos.</p>
        </div>
        {(showForm || canCreateUser) && (
          <button onClick={() => { setEditingUser(null); setForm({ name: '', email: '', password: '', role: 'coordinator' }); setShowForm(!showForm); }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
            {showForm ? 'Cerrar' : '+ Nuevo Usuario'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="mb-4 font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            {editingUser ? <><Pencil size={18} className="text-blue-500" /> Editar Usuario</> : <><UserPlus size={18} className="text-blue-500" /> Nuevo Usuario</>}
          </h3>
          <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Nombre *</label><input required type="text" placeholder="Nombre completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Correo *</label><input required type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">{editingUser ? 'Nueva contraseña (opcional)' : 'Contraseña *'}</label><input required={!editingUser} type="password" placeholder="Mín. 6 caracteres" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} /></div>
            <div><label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Rol *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className={inputClass}>
                <option value="admin">Administrador</option><option value="coordinator">Coordinador</option><option value="driver">Transportista</option><option value="customer">Cliente</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 flex gap-3 mt-2">
              <button type="button" onClick={() => { setShowForm(false); setEditingUser(null); }} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60">{saving ? 'Guardando...' : editingUser ? 'Guardar Cambios' : 'Crear Usuario'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4 flex items-center relative max-w-md">
        <Search size={18} className="absolute left-3 text-gray-400" />
        <input type="text" placeholder="Buscar usuario..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200" />
      </div>

      <CustomTable columns={columns} data={filteredUsers} loading={loading} emptyMessage="No se encontraron usuarios."
        pagination={{ currentPage: page, totalPages, onPageChange: (p) => setPage(p) }} />
    </div>
  );
};

/* ════════════════════════ TAB: ROLES Y PERMISOS ════════════════════════ */
interface PermModule {
  module: string;
  label: string;
  actions: { key: string; label: string }[];
}

const PERM_MODULES: PermModule[] = [
  {
    module: 'dashboard', label: 'Dashboard',
    actions: [{ key: 'read', label: 'Ver' }],
  },
  {
    module: 'orders', label: 'Pedidos',
    actions: [
      { key: 'create', label: 'Crear' },
      { key: 'read', label: 'Ver' },
      { key: 'update', label: 'Editar' },
      { key: 'delete', label: 'Eliminar' },
      { key: 'assign', label: 'Asignar' },
    ],
  },
  {
    module: 'routes', label: 'Rutas',
    actions: [
      { key: 'create', label: 'Crear' },
      { key: 'read', label: 'Ver' },
      { key: 'update', label: 'Editar' },
      { key: 'delete', label: 'Eliminar' },
    ],
  },
  {
    module: 'customers', label: 'Clientes',
    actions: [
      { key: 'create', label: 'Crear' },
      { key: 'read', label: 'Ver' },
      { key: 'update', label: 'Editar' },
      { key: 'delete', label: 'Eliminar' },
    ],
  },
  {
    module: 'drivers', label: 'Transportistas',
    actions: [
      { key: 'create', label: 'Crear' },
      { key: 'read', label: 'Ver' },
      { key: 'update', label: 'Editar' },
      { key: 'delete', label: 'Eliminar' },
    ],
  },
  {
    module: 'fleet', label: 'Flota',
    actions: [
      { key: 'create', label: 'Crear' },
      { key: 'read', label: 'Ver' },
      { key: 'update', label: 'Editar' },
      { key: 'delete', label: 'Eliminar' },
    ],
  },
  {
    module: 'incidents', label: 'Incidencias',
    actions: [
      { key: 'create', label: 'Crear' },
      { key: 'read', label: 'Ver' },
      { key: 'update', label: 'Editar' },
      { key: 'delete', label: 'Eliminar' },
      { key: 'assign', label: 'Asignar' },
    ],
  },
  {
    module: 'reports', label: 'Reportes',
    actions: [
      { key: 'read', label: 'Ver' },
      { key: 'export', label: 'Exportar' },
      { key: 'analytics', label: 'Analytics' },
    ],
  },
  {
    module: 'users', label: 'Usuarios',
    actions: [
      { key: 'create', label: 'Crear' },
      { key: 'read', label: 'Ver' },
      { key: 'update', label: 'Editar' },
      { key: 'delete', label: 'Eliminar' },
      { key: 'activate', label: 'Activ/Desact' },
    ],
  },
  {
    module: 'roles', label: 'Roles',
    actions: [
      { key: 'read', label: 'Ver' },
      { key: 'update', label: 'Editar' },
    ],
  },
];

const RolesTab: React.FC = () => {
  const [roles, setRoles] = useState<{ name: string; label: string; description: string }[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [savingRoles, setSavingRoles] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const res = await rolesApi.getAll();
        const fetchedRoles = res.data;
        setRoles(fetchedRoles.map((r: any) => ({ name: r.name, label: r.label, description: r.description })));
        const permMap: Record<string, string[]> = {};
        fetchedRoles.forEach((r: any) => { permMap[r.name] = r.permissions || []; });
        setRolePermissions(permMap);
      } catch {
        toast.error('Error al cargar roles desde el servidor');
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  const togglePermission = (roleName: string, perm: string) => {
    setRolePermissions(prev => {
      const current = prev[roleName] || [];
      const updated = current.includes(perm)
        ? current.filter(p => p !== perm)
        : [...current, perm];
      setDirty(true);
      return { ...prev, [roleName]: updated };
    });
  };

  const handleSavePermissions = async () => {
    setSavingRoles(true);
    try {
      const promises = roles.map(role =>
        rolesApi.updatePermissions(role.name, rolePermissions[role.name] || [])
      );
      await Promise.all(promises);
      toast.success('Permisos guardados en la base de datos');
      setDirty(false);
      clearPermissionCache();
    } catch {
      toast.error('Error al guardar permisos en el servidor');
    } finally {
      setSavingRoles(false);
    }
  };

  const handleResetPermissions = async () => {
    if (!window.confirm('¿Restaurar permisos a los valores originales de fábrica?')) return;
    setLoadingRoles(true);
    try {
      const res = await rolesApi.resetAll();
      const permMap: Record<string, string[]> = {};
      res.data.forEach((r: any) => { permMap[r.name] = r.permissions || []; });
      setRolePermissions(permMap);
      toast.success('Permisos restaurados a valores originales');
      setDirty(false);
      clearPermissionCache();
    } catch {
      toast.error('Error al restaurar permisos');
    } finally {
      setLoadingRoles(false);
    }
  };

  if (loadingRoles && roles.length === 0) {
    return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Shield className="text-blue-600" size={22} /><span>Matriz de Roles y Permisos</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Permisos detallados por módulo: Ver, Crear, Editar, Eliminar y acciones especiales.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleResetPermissions} disabled={loadingRoles}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50">
            <RefreshCw size={16} /> Restaurar
          </button>
          <button onClick={handleSavePermissions} disabled={savingRoles || !dirty}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
            {savingRoles ? <><Save size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> Guardar en BD</>}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase w-48">Módulo</th>
              <th className="text-left px-2 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase w-20">Acción</th>
              {roles.map(role => (
                <th key={role.name} className="text-center px-2 py-3 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase min-w-[100px]">
                  {role.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {PERM_MODULES.map(mod => (
              mod.actions.map((act, actIdx) => {
                const permKey = `${mod.module}.${act.key}`;
                const isFirstAction = actIdx === 0;
                return (
                  <tr key={permKey} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    {isFirstAction && (
                      <td rowSpan={mod.actions.length} className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-200 align-top">
                        {mod.label}
                      </td>
                    )}
                    <td className="px-2 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {act.label}
                    </td>
                    {roles.map(role => {
                      const hasPermission = (rolePermissions[role.name] || []).includes(permKey);
                      return (
                        <td key={role.name} className="text-center px-2 py-3">
                          <button
                            onClick={() => togglePermission(role.name, permKey)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all ${
                              hasPermission
                                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60'
                                : 'bg-gray-100 text-gray-300 dark:bg-gray-800 dark:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                            title={`${role.label}: ${act.label} ${hasPermission ? '(activado)' : '(desactivado)'}`}
                          >
                            {hasPermission ? <Check size={14} /> : <X size={14} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ))}
          </tbody>
        </table>
      </div>

      {/* Role summary cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {roles.map(role => {
          const perms = rolePermissions[role.name] || [];
          const grouped = PERM_MODULES.map(mod => ({
            label: mod.label,
            active: mod.actions.some(a => perms.includes(`${mod.module}.${a.key}`)),
            count: mod.actions.filter(a => perms.includes(`${mod.module}.${a.key}`)).length,
            total: mod.actions.length,
          }));
          return (
            <div key={role.name} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} className="text-blue-500" />
                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">{role.label}</h4>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{role.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {grouped.map(g => g.active && (
                  <span key={g.label} className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded text-[10px] font-medium">
                    {g.label} ({g.count}/{g.total})
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ════════════════════════ TAB: CONFIGURACIÓN ════════════════════════ */
const ConfigTab: React.FC = () => {
  const [settings, setSettings] = useState({
    refreshInterval: 30,
    defaultPageSize: 10,
    enableNotifications: true,
    enableAutoAssign: false,
    alertThreshold: 5,
    timezone: 'America/Lima',
    language: 'es',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('appSettings', JSON.stringify(settings));
      toast.success('Configuración guardada correctamente');
      setSaving(false);
    }, 600);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('appSettings');
      if (saved) setSettings(JSON.parse(saved));
    } catch { /* use defaults */ }
  }, []);

  const inputClass = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Settings className="text-blue-600" size={22} /><span>Configuración del Sistema</span>
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Personalización global de la plataforma.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Intervalo de Refresco (segundos)</label>
            <input type="number" min={5} max={300} value={settings.refreshInterval}
              onChange={(e) => setSettings({ ...settings, refreshInterval: Number(e.target.value) })} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Tiempo entre recargas automáticas de datos.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filas por Página</label>
            <input type="number" min={5} max={100} value={settings.defaultPageSize}
              onChange={(e) => setSettings({ ...settings, defaultPageSize: Number(e.target.value) })} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Cantidad de registros en tablas por defecto.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Umbral de Alertas</label>
            <input type="number" min={1} max={100} value={settings.alertThreshold}
              onChange={(e) => setSettings({ ...settings, alertThreshold: Number(e.target.value) })} className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">Incidencias activas para considerar estado crítico.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zona Horaria</label>
            <select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className={inputClass}>
              <option value="America/Lima">Lima (UTC-5)</option>
              <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
              <option value="America/Bogota">Bogotá (UTC-5)</option>
              <option value="America/Santiago">Santiago (UTC-4)</option>
              <option value="America/Argentina/Buenos_Aires">Buenos Aires (UTC-3)</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 space-y-4">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">Preferencias del Sistema</h3>
          {[
            { key: 'enableNotifications', label: 'Notificaciones en tiempo real', desc: 'Recibir notificaciones push de incidencias y cambios de estado' },
            { key: 'enableAutoAssign', label: 'Asignación automática de transportistas', desc: 'Asignar automáticamente pedidos pendientes a transportistas disponibles' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, [key]: !(settings as any)[key] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${(settings as any)[key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(settings as any)[key] ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {saving ? <><Save size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> Guardar Configuración</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdministracionPage;
