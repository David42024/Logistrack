import React from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { Search, Bell, Sun, Moon, ChevronDown } from 'lucide-react';

const Navbar: React.FC<{ title: string; showSearch?: boolean; notificationCount?: number }> = ({
  title,
  showSearch = true,
  notificationCount,
}) => {
  const { isConnected } = useSocket();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'US';

  return (
    <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-800 sticky top-0 z-10">
      {/* Title */}
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex-shrink-0">{title}</h2>

      {/* Search bar - center */}
      {showSearch && (
        <div className="flex-1 px-4 max-w-md mx-auto">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="navbar-search"
              type="text"
              placeholder="Buscar pedidos, rutas..."
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 transition-all"
            />
          </div>
        </div>
      )}

      {/* Right side */}
      <div className="flex items-center gap-3 ml-auto flex-shrink-0">
        {/* Theme toggle */}
        <button
          id="theme-toggle-btn"
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Bell */}
        <div className="relative">
          <button
            id="notifications-btn"
            type="button"
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          >
            <Bell size={18} />
          </button>
          {typeof notificationCount === 'number' && notificationCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          )}
        </div>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-600">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-gray-800 dark:text-gray-100 leading-tight">
              {user?.name || 'Usuario'}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize leading-tight">
              {user?.role === 'admin' ? 'Administrador' : user?.role === 'coordinator' ? 'Coordinador' : user?.role || 'Empresa'}
            </p>
          </div>
          <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
