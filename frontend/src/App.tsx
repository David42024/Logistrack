import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import CreateOrderPage from './pages/CreateOrderPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AssignmentsPage from './pages/AssignmentsPage';
import DriversPage from './pages/DriversPage';
import DriverDashboardPage from './pages/DriverDashboardPage';
import TrackOrderPage from './pages/TrackOrderPage';
import ReportsPage from './pages/ReportsPage';
import CustomersPage from './pages/CustomersPage';
import RoutesPage from './pages/RoutesPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UsersPage from './pages/UsersPage';

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
            <Route path="/orders" element={
              <ProtectedRoute roles={['admin', 'coordinator', 'driver']}>
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
            <Route path="/routes" element={
              <ProtectedRoute roles={['admin', 'coordinator']}>
                <RoutesPage />
              </ProtectedRoute>
            } />
            <Route path="/assignments" element={
              <ProtectedRoute roles={['admin', 'coordinator']}>
                <AssignmentsPage />
              </ProtectedRoute>
            } />
            <Route path="/drivers" element={
              <ProtectedRoute roles={['admin', 'coordinator']}>
                <DriversPage />
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute roles={['admin', 'coordinator']}>
                <CustomersPage />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute roles={['admin', 'coordinator']}>
                <ReportsPage />
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute roles={['admin']}>
                <UsersPage />
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
