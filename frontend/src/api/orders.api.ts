import api from './axios.config';

export const ordersApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; search?: string; driverId?: string }) =>
    api.get('/orders', { params }),

  getOne: (id: string) => api.get(`/orders/${id}`),

  trackByNumber: (orderNumber: string) => api.get(`/orders/track/${orderNumber}`),

  create: (data: any) => api.post('/orders', data),

  updateStatus: (id: string, data: { status: string; notes?: string; cancellationReason?: string; incidentImage?: string }) =>
    api.patch(`/orders/${id}/status`, data),

  assignDriver: (id: string, driverId: string) =>
    api.patch(`/orders/${id}/assign`, { driverId }),

  getDriverOrders: (driverId: string) => api.get(`/orders/driver/${driverId}`),

  getStats: () => api.get('/orders/stats'),
};
