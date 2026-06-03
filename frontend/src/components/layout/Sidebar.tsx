import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  Route,
  Users,
  Truck,
  AlertTriangle,
  BarChart2,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';

interface NavItem {
  to?: string;
  label: string;
  icon: React.ReactNode;
  children?: { to: string; label: string }[];
  roles?: string[];
}

const allNavItems: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Inicio',
    icon: <LayoutDashboard size={18} />,
    roles: ['admin', 'coordinator'],
  },
  {
    to: '/orders',
    label: 'Pedidos',
    icon: <Package size={18} />,
    roles: ['admin', 'coordinator'],
  },
  {
    to: '/assignments',
    label: 'Rutas',
    icon: <Route size={18} />,
    roles: ['admin', 'coordinator'],
  },
  {
    to: '/drivers',
    label: 'Transportistas',
    icon: <Users size={18} />,
    roles: ['admin', 'coordinator'],
  },
  {
    to: '/fleet',
    label: 'Flota',
    icon: <Truck size={18} />,
    roles: ['admin', 'coordinator'],
  },
  {
    label: 'Incidencias',
    icon: <AlertTriangle size={18} />,
    roles: ['admin', 'coordinator'],
    children: [
      { to: '/orders', label: 'Ver incidencias' },
    ],
  },
  {
    label: 'Reportes',
    icon: <BarChart2 size={18} />,
    roles: ['admin', 'coordinator'],
    children: [
      { to: '/reports', label: 'Estadísticas' },
    ],
  },
  {
    to: '/settings',
    label: 'Configuración',
    icon: <Settings size={18} />,
    roles: ['admin', 'coordinator'],
  },
  // Específico para transportistas
  {
    to: '/driver-dashboard',
    label: 'Mis Pedidos',
    icon: <ClipboardList size={18} />,
    roles: ['driver'],
  },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const visibleItems = allNavItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role ?? '')
  );

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Truck size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide leading-tight">
            PLATAFORMA<br />
            <span className="text-blue-400">LOGÍSTICA</span>
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          if (item.children) {
            const isOpen = openMenus[item.label];
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors text-sm group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 group-hover:text-gray-300 transition-colors">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown size={14} className="text-gray-500" />
                  ) : (
                    <ChevronRight size={14} className="text-gray-500" />
                  )}
                </button>
                {isOpen && (
                  <div className="ml-9 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className={({ isActive }) =>
                          `block px-3 py-2 rounded-lg text-xs transition-colors ${
                            isActive
                              ? 'bg-blue-600/20 text-blue-400 font-semibold'
                              : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to!}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/30'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300 transition-colors'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
