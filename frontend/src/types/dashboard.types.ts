export enum SystemStatus {
  OPERATIONAL = 'operational',
  MODERATE = 'moderate',
  CRITICAL = 'critical',
}

export enum IncidentSeverity {
  CRITICAL = 'critical',
  MEDIUM = 'medium',
  INFO = 'info',
}

export enum DashboardMode {
  ANALYTICS = 'analytics',
  OPERATIONS = 'operations',
}

export enum MetricType {
  DELIVERIES = 'deliveries',
  INCIDENTS = 'incidents',
  AVG_TIME = 'avg_time',
  ACTIVE_ORDERS = 'active_orders',
}

export interface KPIMetric {
  value: number | string;
  variation: number;
  trend: number[];
  status: 'good' | 'warning' | 'critical';
  label: string;
}

export interface OperationalKPIs {
  ordersInRoute: KPIMetric;
  pendingOrders: KPIMetric;
  activeVehicles: KPIMetric;
  activeIncidents: KPIMetric;
  delayedOrders: KPIMetric;
}

export interface PerformanceKPIs {
  deliveredToday: KPIMetric;
  slaCompliance: KPIMetric;
  avgDeliveryTime: KPIMetric;
  successRate: KPIMetric;
  avgDelay: KPIMetric;
}

export interface Incident {
  id: string;
  severity: IncidentSeverity;
  orderId: string;
  orderNumber: string;
  activeTime: string;
  description: string;
  actions: {
    resolve: () => void;
    viewOrder: () => void;
    reassign: () => void;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  status: string;
  driver: string;
  eta: string;
  priority: 'low' | 'medium' | 'high';
}

export interface SystemHealth {
  status: SystemStatus;
  lastUpdate: string;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}
