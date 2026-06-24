import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const MainLayout: React.FC<{
  children: React.ReactNode;
  title?: string;
  showSearch?: boolean;
  notificationCount?: number;
  showFooter?: boolean;
}> = ({
  children,
  title = 'Sistema de Transporte',
  showSearch = true,
  notificationCount,
  showFooter = false,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-h-screen overflow-hidden">
        <Navbar 
          title={title} 
          showSearch={showSearch} 
          notificationCount={notificationCount} 
          onMenuClick={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
        {showFooter && (
          <footer className="flex items-center justify-between px-6 py-2.5 bg-gray-900 border-t border-gray-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-xs text-gray-400">
                Sistema operativo · Todos los servicios activos · Última sincronización: hace 2 min
              </span>
            </div>
            <span className="text-xs text-gray-500">LogisTrack v3.2.1 · © 2025</span>
          </footer>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
