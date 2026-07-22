import api from './axios.config';

export const customersApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/customers', { params }),

  getOne: (id: string) => api.get(`/customers/${id}`),

  create: (data: { name: string; email: string; phone?: string; address?: string }) =>
    api.post('/customers', data),

  update: (id: string, data: { name?: string; email?: string; phone?: string; address?: string }) =>
    api.patch(`/customers/${id}`, data),

  getOrders: (id: string) => api.get(`/customers/${id}/orders`),
};
