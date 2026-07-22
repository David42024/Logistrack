import api from './axios.config';

export const driversApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/drivers', { params }),
  getAvailable: () => api.get('/drivers/available'),
  getSuggested: () => api.get('/drivers/suggested'),
  getOne: (id: string) => api.get(`/drivers/${id}`),
  create: (data: any) => api.post('/drivers', data),
  update: (id: string, data: any) => api.patch(`/drivers/${id}`, data),
  updateStatus: (id: string, status: string) => api.patch(`/drivers/${id}/status`, { status }),
};

