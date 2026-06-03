export type OrderStatus = 'pending' | 'preparing' | 'transit' | 'delivered' | 'cancelled';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface Driver {
  id: string;
  name: string;
  phone?: string;
  licenseNumber?: string;
  vehicleType?: string;
  vehiclePlate?: string;
  status: 'available' | 'busy' | 'offline';
}

export interface OrderHistory {
  id: string;
  previousStatus?: string;
  newStatus: string;
  changedBy?: string;
  notes?: string;
  incidentImage?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  customerId: string;
  driver?: Driver;
  driverId?: string;
  origin: string;
  destination: string;
  merchandiseType: string;
  weight: number;
  status: OrderStatus;
  cancellationReason?: string;
  estimatedDate?: string;
  deliveredAt?: string;
  history: OrderHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOrders {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
