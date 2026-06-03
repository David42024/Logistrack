import api from './axios.config';

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: { email: string; password: string; name: string; role?: string }) =>
    api.post('/auth/register', data),

  getMe: () => api.get('/auth/me'),
};
