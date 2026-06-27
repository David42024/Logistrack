import api from './axios.config';

export interface Vehicle {
  id: string;
  plate: string;
  type: 'truck' | 'van' | 'motorcycle';
  model: string;
  year: number;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
  insuranceExpiry?: string | null;
  itvExpiry?: string | null;
  mileage?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const fleetApi = {
  getAll: () => api.get<Vehicle[]>('/fleet/vehicles'),
  getOne: (id: string) => api.get<Vehicle>(`/fleet/vehicles/${id}`),
  create: (data: Partial<Vehicle>) => api.post<Vehicle>('/fleet/vehicles', data),
  update: (id: string, data: Partial<Vehicle>) => api.put<Vehicle>(`/fleet/vehicles/${id}`, data),
  delete: (id: string) => api.delete<void>(`/fleet/vehicles/${id}`),
  updateStatus: (id: string, status: string) => api.patch<Vehicle>(`/fleet/vehicles/${id}/status`, { status }),
  getMetrics: () => api.get('/fleet/metrics'),
};
