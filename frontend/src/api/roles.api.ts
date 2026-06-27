import api from './axios.config';

export interface RoleConfig {
  name: string;
  label: string;
  description: string;
  permissions: string[];
}

export const rolesApi = {
  getAll: () => api.get<RoleConfig[]>('/roles'),

  getOne: (name: string) => api.get<RoleConfig>(`/roles/${name}`),

  updatePermissions: (name: string, permissions: string[]) =>
    api.patch<RoleConfig>(`/roles/${name}`, { permissions }),

  resetAll: () => api.post<RoleConfig[]>('/roles/reset'),
};
