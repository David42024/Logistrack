import React, { useEffect, useState, useCallback } from 'react';
import MainLayout from '../components/layout/MainLayout';
import CustomTable, { Column } from '../components/common/CustomTable';
import { usersApi } from '../api/users.api';
import { authApi } from '../api/auth.api';
import { User, Role } from '../types/user.types';
import toast from 'react-hot-toast';
import { X, Search, UserCheck, Shield, Mail, Calendar, Trash2, Pencil, UserPlus } from 'lucide-react';
import { formatDateTime } from '../utils/dateFormats';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'coordinator' as Role,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.getAll();
      setUsers(res.data);
    } catch {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Nombre y Correo son obligatorios');
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        // Edit User
        const payload: any = {
          name: form.name,
          email: form.email,
          role: form.role,
        };
        // Only update password if a new one is typed
        if (form.password) {
          if (form.password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            setSaving(false);
            return;
          }
          payload.password = form.password;
        }

        await usersApi.update(editingUser.id, payload);
        toast.success('Usuario actualizado correctamente');
      } else {
        // Create User
        if (!form.password) {
          toast.error('La contraseña es obligatoria');
          setSaving(false);
          return;
        }
        if (form.password.length < 6) {
          toast.error('La contraseña debe tener al menos 6 caracteres');
          setSaving(false);
          return;
        }

        await authApi.register(form);
        toast.success('Usuario registrado correctamente');
      }

      setShowForm(false);
      setEditingUser(null);
      setForm({ name: '', email: '', password: '', role: 'coordinator' });
      fetchUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al guardar usuario';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: '', // Reset to empty, user will fill it only if they want to change it
      role: u.role,
    });
    setShowForm(true);
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const newStatus = !user.isActive;
      await usersApi.updateStatus(user.id, newStatus);
      toast.success(`Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`);
      // Update local state directly for responsive feedback
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u))
      );
    } catch {
      toast.error('Error al actualizar estado del usuario');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de que desea desactivar este usuario?')) {
      return;
    }

    try {
      await usersApi.remove(id);
      toast.success('Usuario desactivado correctamente');
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: false } : u))
      );
    } catch {
      toast.error('Error al desactivar el usuario');
    }
  };

  // Filter users in client-side state
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (_, u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-gray-100">{u.name}</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">ID: {u.id.substring(0, 8)}...</p>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Usuario',
      render: (_, u) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
          <Mail size={12} className="text-gray-400" />
          <span>{u.email}</span>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rol de Sistema',
      render: (_, u) => {
        const roleMap: Record<Role, { label: string; color: string }> = {
          admin: { label: 'Administrador', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/40' },
          coordinator: { label: 'Coordinador', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40' },
          driver: { label: 'Transportista', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/40' },
          customer: { label: 'Cliente', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/40' },
        };
        const info = roleMap[u.role] || { label: u.role, color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border border-gray-200 dark:border-gray-800/40' };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${info.color}`}>
            {info.label}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      header: 'Fecha Registro',
      render: (val) => (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={12} />
          <span>{val ? formatDateTime(val) : 'No disponible'}</span>
        </div>
      ),
    },
    {
      key: 'isActive',
      header: 'Estado',
      render: (_, u) => (
        <div className="flex items-center">
          <button
            onClick={() => handleToggleStatus(u)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              u.isActive ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                u.isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="ml-2 text-xs font-medium text-gray-600 dark:text-gray-350">
            {u.isActive ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (_, u) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEditClick(u)}
            className="text-blue-600 hover:text-blue-800 dark:text-sky-450 dark:hover:text-sky-350 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
            title="Editar usuario"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={() => handleDelete(u.id)}
            disabled={!u.isActive}
            className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            title="Desactivar usuario"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const inputClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100';

  return (
    <MainLayout title="Usuarios">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Shield className="text-blue-600 dark:text-blue-400" size={22} />
            <span>Gestión de Usuarios</span>
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Administración de accesos, roles y estados operativos de usuarios del sistema.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setForm({ name: '', email: '', password: '', role: 'coordinator' });
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-blue-500/10"
        >
          {showForm ? 'Cerrar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="mb-4 font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            {editingUser ? <Pencil size={18} className="text-blue-500" /> : <UserPlus size={18} className="text-blue-500" />}
            <span>{editingUser ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}</span>
          </h3>
          <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Nombre Completo *
              </label>
              <input
                required
                type="text"
                placeholder="Ej. Roberto Alarcón"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Correo Electrónico *
              </label>
              <input
                required
                type="email"
                placeholder="Ej. roberto@logistrack.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                {editingUser
                  ? 'Nueva Contraseña (Dejar en blanco para no cambiar)'
                  : 'Contraseña Temporal * (Mín. 6 caracteres)'}
              </label>
              <input
                required={!editingUser}
                type="password"
                placeholder={editingUser ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                Rol del Sistema *
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                className={inputClass}
              >
                <option value="admin">Administrador</option>
                <option value="coordinator">Coordinador</option>
                <option value="driver">Transportista</option>
                <option value="customer">Cliente</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
                  setForm({ name: '', email: '', password: '', role: 'coordinator' });
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
                {saving ? 'Guardando...' : editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Real-time search bar */}
      <div className="mb-4 flex items-center relative max-w-md">
        <Search size={18} className="absolute left-3 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar usuario por nombre o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 dark:text-gray-200"
        />
      </div>

      {/* Users table */}
      <CustomTable
        columns={columns}
        data={filteredUsers}
        loading={loading}
        emptyMessage="No se encontraron usuarios registrados."
      />
    </MainLayout>
  );
};

export default UsersPage;
