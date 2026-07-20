import React from 'react';
import { useSocket } from '../../contexts/SocketContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { Bell, Sun, Moon, ChevronDown, Menu } from 'lucide-react';

interface NavbarProps {
  title: string;
  showSearch?: boolean;
  notificationCount?: number;
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  title,
  showSearch = true,
  notificationCount,
  onMenuClick,
}) => {
  const { isConnected } = useSocket();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'US';

  return (
    <header className="flex items-center gap-4 border-b border-gray-200 bg-white px-4 sm:px-6 py-3 dark:border-gray-700 dark:bg-gray-800 sticky top-0 z-10">
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Title */}
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 flex-shrink-0">{title}</h2>



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
