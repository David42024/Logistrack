import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import OrderStatusBadge from '../components/orders/OrderStatusBadge';
import OrderStatusTimeline from '../components/common/OrderStatusTimeline';
import { ordersApi } from '../api/orders.api';
import { Order } from '../types/order.types';
import { formatDateTime } from '../utils/dateFormats';
import toast from 'react-hot-toast';
import { Search, MapPin, Package, Weight, Truck, Calendar, ArrowRight } from 'lucide-react';
import { LoadingSpinner } from '../components/common/StatsCard';

const TrackOrderPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setOrder(null);
    try {
      const res = await ordersApi.trackByNumber(orderNumber.trim().toUpperCase());
      setOrder(res.data);
    } catch {
      toast.error('No se pudo encontrar un pedido con ese código');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="max-w-3xl mx-auto w-full">
      {/* Search Section */}
      <div className="mb-8 relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-transparent rounded-full blur-3xl opacity-60"></div>
        
        <div className="relative p-6 sm:p-8">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-500" />
              Rastrear Pedido
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Ingresa tu código de seguimiento (ej. ORD-20250101-0001) para conocer el estado actual.
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ingresa tu código de seguimiento..."
                className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-gray-900 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-100 dark:focus:bg-gray-900 transition-all font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !orderNumber.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" /> Buscando...
                </>
              ) : (
                <>
                  Rastrear <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {order && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Order Details Card */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-900/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider uppercase mb-1">
                    Código de Pedido
                  </p>
                  <h3 className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
                    {order.orderNumber}
                  </h3>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Origen</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{order.origin}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Destino</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{order.destination}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-500">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Mercancía</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 flex items-center gap-1.5">
                    {order.merchandiseType}
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="flex items-center text-gray-600 dark:text-gray-300 font-normal text-sm">
                      <Weight className="w-3.5 h-3.5 mr-1" />
                      {order.weight} kg
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Fecha de Creación</p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 text-sm">
                    {formatDateTime(order.createdAt)}
                  </p>
                </div>
              </div>

              {order.driver && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Transportista</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5">{order.driver.name}</p>
                  </div>
                </div>
              )}

              {order.estimatedDate && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg text-cyan-600">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Entrega Estimada</p>
                    <p className="font-semibold text-gray-900 dark:text-gray-100 mt-0.5 text-sm">
                      {formatDateTime(order.estimatedDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Timeline Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm dark:border-gray-800 dark:bg-gray-800/80">
            <OrderStatusTimeline currentStatus={order.status} history={order.history || []} />
          </div>
        </div>
      )}
    </div>
  );

  if (isAuthenticated) return <MainLayout title="Seguimiento de Entregas">{content}</MainLayout>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background decorations for public tracking page */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 dark:bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-3xl z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-500/30 text-white mb-6">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Logistrack</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Portal Público de Seguimiento de Entregas</p>
        </div>
        {content}
      </div>
    </div>
  );
};

export default TrackOrderPage;
