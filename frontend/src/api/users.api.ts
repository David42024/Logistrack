import api from './axios.config';

export const usersApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/users', { params }),
  getOne: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  updateStatus: (id: string, isActive: boolean) => api.patch(`/users/${id}/status`, { isActive }),
  remove: (id: string) => api.delete(`/users/${id}`),
};
