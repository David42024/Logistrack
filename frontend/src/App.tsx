import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LogisticaPage from './pages/LogisticaPage';
import CatalogosPage from './pages/CatalogosPage';
import IncidenciasPage from './pages/IncidenciasPage';
import AdministracionPage from './pages/AdministracionPage';
import DriverDashboardPage from './pages/DriverDashboardPage';
import TrackOrderPage from './pages/TrackOrderPage';
import ReportsPage from './pages/ReportsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OrdersPage from './pages/OrdersPage';
import CreateOrderPage from './pages/CreateOrderPage';
import OrderDetailPage from './pages/OrderDetailPage';

const App: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/track" element={<TrackOrderPage />} />

            {/* Admin & Coordinator */}
            <Route path="/dashboard" element={
              <ProtectedRoute roles={['admin', 'coordinator']}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/logistica" element={
              <ProtectedRoute roles={['admin', 'coordinator']}>
                <LogisticaPage />
              </ProtectedRoute>
            } />
            <Route path="/catalogos" element={
              <ProtectedRoute roles={['admin', 'coordinator']}>
                <CatalogosPage />
              </ProtectedRoute>
            } />
            <Route path="/incidencias" element={
              <ProtectedRoute roles={['admin', 'coordinator']}>
                <IncidenciasPage />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute roles={['admin', 'coordinator']}>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/administracion" element={
              <ProtectedRoute roles={['admin']}>
                <AdministracionPage />
              </ProtectedRoute>
            } />

            {/* Orders */}
            <Route path="/orders" element={
              <ProtectedRoute roles={['admin', 'coordinator']}>
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/orders/create" element={
              <ProtectedRoute roles={['admin', 'coordinator']}>
                <CreateOrderPage />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute roles={['admin', 'coordinator', 'driver']}>
                <OrderDetailPage />
              </ProtectedRoute>
            } />

            {/* Driver */}
            <Route path="/driver-dashboard" element={
              <ProtectedRoute roles={['driver']}>
                <DriverDashboardPage />
              </ProtectedRoute>
            } />

            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
