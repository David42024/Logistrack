import api from './axios.config';

export const usersApi = {
  getAll: () => api.get('/users'),
  getOne: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  updateStatus: (id: string, isActive: boolean) => api.patch(`/users/${id}/status`, { isActive }),
  remove: (id: string) => api.delete(`/users/${id}`),
};
