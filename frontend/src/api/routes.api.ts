import api from './axios.config';

export interface RouteStop {
  id: string;
  sequence: number;
  address: string;
  latitude: number;
  longitude: number;
  orderId?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  estimatedArrival?: number;
  distanceFromPrevious?: number;
  notes?: string;
  routeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  name: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  totalDistance: number;
  estimatedDuration: number;
  scheduledDate: string;
  driverId?: string;
  ordersCount: number;
  stops: RouteStop[];
  createdAt: string;
  updatedAt: string;
}

export const routesApi = {
  getAll: () => api.get('/routes'),
  getOne: (id: string) => api.get(`/routes/${id}`),
  getByDriver: (driverId: string) => api.get(`/routes/driver/${driverId}`),
  getByDate: (date: string) => api.get(`/routes/date/${date}`),
  getByStatus: (status: string) => api.get(`/routes/status/${status}`),
  getMetrics: () => api.get('/routes/metrics'),
  
  create: (data: { name: string; description?: string; scheduledDate: string; driverId?: string }) =>
    api.post('/routes', data),
  
  update: (id: string, data: Partial<Route>) => api.put(`/routes/${id}`, data),
  
  addStop: (routeId: string, stopData: {
    address: string;
    latitude: number;
    longitude: number;
    orderId?: string;
    estimatedArrival?: number;
    distanceFromPrevious?: number;
    notes?: string;
  }) => api.post(`/routes/${routeId}/stops`, stopData),
  
  updateStatus: (id: string, status: 'planned' | 'in_progress' | 'completed' | 'cancelled') =>
    api.patch(`/routes/${id}/status`, { status }),
  
  updateStopStatus: (stopId: string, status: 'pending' | 'in_progress' | 'completed' | 'skipped') =>
    api.patch(`/routes/stops/${stopId}/status`, { status }),
  
  optimize: (id: string) => api.post(`/routes/${id}/optimize`),
  
  delete: (id: string) => api.delete(`/routes/${id}`),
};
