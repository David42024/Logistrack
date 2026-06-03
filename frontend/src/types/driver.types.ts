export interface Driver {
  id: string;
  name: string;
  phone?: string;
  licenseNumber?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  status: 'available' | 'busy' | 'offline';
  userId?: string;
  createdAt?: string;
}
