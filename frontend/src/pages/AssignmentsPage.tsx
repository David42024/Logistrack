import React, { useEffect, useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { ordersApi } from '../api/orders.api';
import { driversApi } from '../api/drivers.api';
import { Order, Driver } from '../types/order.types';
import { LoadingSpinner } from '../components/common/StatsCard';
import toast from 'react-hot-toast';
import { formatDateTime } from '../utils/dateFormats';
import { Package, Truck, MapPin, Weight, Navigation, ArrowRight, UserCheck } from 'lucide-react';

const AssignmentsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [ordersRes, driversRes] = await Promise.all([
        ordersApi.getAll({ status: 'pending', limit: 50 }),
        driversApi.getAvailable(), // Assuming this endpoint returns { data: Driver[] }
      ]);
      setOrders(ordersRes.data.data || ordersRes.data);
      setDrivers(driversRes.data.data || driversRes.data);
      // Ensure selected order still exists
      if (selectedOrder) {
        const stillExists = (ordersRes.data.data || ordersRes.data).find((o: Order) => o.id === selectedOrder.id);
        if (!stillExists) setSelectedOrder(null);
      }
    } catch {
      toast.error('Error al cargar datos para la asignación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssign = async (driverId: string) => {
    if (!selectedOrder) return;
    setAssigning(driverId);
    try {
      await ordersApi.assignDriver(selectedOrder.id, driverId);
      toast.success('Transportista asignado exitosamente');
      // Optimistic UI update
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      setSelectedOrder(null);
      // Wait a moment before fetching to allow backend state to settle
      setTimeout(fetchData, 500);
    } catch {
      toast.error('Error al asignar el transportista');
    } finally {
      setAssigning(null);
    }
  };

  return (
    <MainLayout title="Emparejamiento de Carga">
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Navigation className="w-6 h-6 text-blue-500" />
            Centro de Asignación
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Selecciona un pedido pendiente y asígnalo al transportista más adecuado.
          </p>
        </div>
      </div>

      {loading && !orders.length && !drivers.length ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
          
          {/* Panel Izquierdo: Pedidos */}
          <div className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-500" />
                Pedidos Pendientes
                <span className="ml-auto bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 py-0.5 px-2.5 rounded-full text-xs font-bold">
                  {orders.length}
                </span>
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/20">
              {orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No hay pedidos pendientes por asignar</p>
                </div>
              ) : (
                orders.map((order) => {
                  const isSelected = selectedOrder?.id === order.id;
                  return (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(isSelected ? null : order)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-md transform scale-[1.01]' 
                          : 'border-transparent bg-white dark:bg-gray-800 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 hover:shadow'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300">
                          {order.orderNumber}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">Origen</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{order.origin}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">Destino</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{order.destination}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium">
                          <Package className="w-4 h-4 text-gray-400" />
                          {order.merchandiseType}
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium">
                          <Weight className="w-4 h-4 text-gray-400" />
                          {order.weight} kg
                        </span>
                      </div>
                      
                      {isSelected && (
                        <div className="absolute inset-y-0 right-0 w-1 bg-blue-500 rounded-r-xl" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Panel Derecho: Transportistas */}
          <div className={`flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-opacity duration-300 ${!selectedOrder ? 'opacity-60' : 'opacity-100'}`}>
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Truck className="w-5 h-5 text-green-500" />
                Transportistas Disponibles
                <span className="ml-auto bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 py-0.5 px-2.5 rounded-full text-xs font-bold">
                  {drivers.length}
                </span>
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-900/20 relative">
              {!selectedOrder && orders.length > 0 && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 dark:bg-gray-800/60 backdrop-blur-[1px]">
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-center animate-pulse">
                    <ArrowRight className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <p className="font-medium text-gray-800 dark:text-gray-200">Selecciona un pedido primero</p>
                  </div>
                </div>
              )}

              {drivers.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No hay transportistas disponibles</p>
                </div>
              ) : (
                drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg">
                        {driver.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{driver.name}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5" />
                            {driver.vehicleType || 'Furgoneta'}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Disponible
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleAssign(driver.id)}
                      disabled={!selectedOrder || assigning === driver.id}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
                        selectedOrder 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {assigning === driver.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          Asignar
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AssignmentsPage;
