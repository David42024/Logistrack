import api from './axios.config';

export const driversApi = {
  getAll: () => api.get('/drivers'),
  getAvailable: () => api.get('/drivers/available'),
  getSuggested: () => api.get('/drivers/suggested'),
  getOne: (id: string) => api.get(`/drivers/${id}`),
  create: (data: any) => api.post('/drivers', data),
  update: (id: string, data: any) => api.patch(`/drivers/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/drivers/${id}/status`, { status }),
};

export const customersApi = {
  getAll: (search?: string) => api.get('/customers', { params: { search } }),
  getOne: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
};
