import axios from 'axios';
import { OperationalKPIs, PerformanceKPIs, Incident, Order, SystemHealth, ChartData, SystemStatus } from '../types/dashboard.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class DashboardService {
  private api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Operational KPIs
  async getOperationalKPIs(): Promise<OperationalKPIs> {
    try {
      const response = await this.api.get('/orders/stats');
      const stats = response.data;
      
      return {
        ordersInRoute: {
          value: stats.inRoute || 0,
          variation: 5.2,
          trend: [10, 15, 12, 18, 20, 22, 25],
          status: 'good',
          label: 'Pedidos en ruta',
        },
        pendingOrders: {
          value: stats.pending || 0,
          variation: -2.1,
          trend: [30, 28, 25, 22, 20, 18, 15],
          status: 'warning',
          label: 'Pendientes de asignación',
        },
        activeVehicles: {
          value: stats.activeVehicles || 0,
          variation: 3.5,
          trend: [40, 42, 45, 48, 50, 52, 55],
          status: 'good',
          label: 'Vehículos activos',
        },
        activeIncidents: {
          value: stats.activeIncidents || 0,
          variation: 12.5,
          trend: [2, 3, 4, 5, 6, 7, 8],
          status: 'critical',
          label: 'Incidencias activas',
        },
        delayedOrders: {
          value: stats.delayed || 0,
          variation: -8.3,
          trend: [15, 12, 10, 8, 6, 5, 4],
          status: 'good',
          label: 'Pedidos retrasados',
        },
      };
    } catch (error) {
      console.error('Error fetching operational KPIs:', error);
      throw error;
    }
  }

  // Performance KPIs
  async getPerformanceKPIs(): Promise<PerformanceKPIs> {
    try {
      const response = await this.api.get('/reports/kpis');
      const kpis = response.data;
      
      return {
        deliveredToday: {
          value: kpis.deliveredToday || 0,
          variation: 15.3,
          trend: [50, 60, 70, 80, 90, 100, 110],
          status: 'good',
          label: 'Entregados hoy',
        },
        slaCompliance: {
          value: `${kpis.slaCompliance || 95}%`,
          variation: 2.1,
          trend: [90, 91, 92, 93, 94, 95, 96],
          status: 'good',
          label: '% Cumplimiento SLA',
        },
        avgDeliveryTime: {
          value: `${kpis.avgDeliveryTime || 45} min`,
          variation: -5.2,
          trend: [50, 48, 47, 46, 45, 44, 43],
          status: 'good',
          label: 'Tiempo promedio entrega',
        },
        successRate: {
          value: `${kpis.successRate || 98}%`,
          variation: 1.5,
          trend: [95, 96, 96, 97, 97, 98, 98],
          status: 'good',
          label: 'Tasa de éxito',
        },
        avgDelay: {
          value: `${kpis.avgDelay || 5} min`,
          variation: -12.8,
          trend: [15, 12, 10, 8, 6, 5, 4],
          status: 'good',
          label: 'Nivel de retraso promedio',
        },
      };
    } catch (error) {
      console.error('Error fetching performance KPIs:', error);
      throw error;
    }
  }

  // Incidents
  async getActiveIncidents(): Promise<Incident[]> {
    try {
      const response = await this.api.get('/orders/incidents/active');
      return response.data.map((incident: any) => ({
        id: incident.id,
        severity: incident.severity || 'medium',
        orderId: incident.orderId,
        orderNumber: incident.orderNumber,
        activeTime: this.formatActiveTime(incident.createdAt),
        description: incident.description,
        actions: {
          resolve: () => this.resolveIncident(incident.id),
          viewOrder: () => this.viewOrder(incident.orderId),
          reassign: () => this.reassignOrder(incident.orderId),
        },
      }));
    } catch (error) {
      console.error('Error fetching incidents:', error);
      throw error;
    }
  }

  // Orders
  async getOrders(params?: { status?: string; limit?: number }): Promise<Order[]> {
    try {
      const response = await this.api.get('/orders', { params });
      const ordersList = response.data.data || [];
      return ordersList.map((order: any) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.customer?.name || 'N/A',
        status: order.status,
        driver: order.driver?.name || 'Sin asignar',
        eta: this.formatETA(order.estimatedDate),
        priority: order.priority || 'medium',
      }));
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  // Chart Data
  async getChartData(metricType: string): Promise<ChartData> {
    try {
      let endpoint: string;
      
      switch (metricType) {
        case 'deliveries':
          endpoint = '/reports/deliveries-by-day';
          break;
        case 'incidents':
          endpoint = '/reports/incidents-by-day';
          break;
        case 'avg_time':
          endpoint = '/reports/avg-time-by-day';
          break;
        case 'active_orders':
          endpoint = '/reports/active-orders-by-day';
          break;
        default:
          endpoint = '/reports/deliveries-by-day';
      }
      
      const response = await this.api.get(endpoint, { params: { days: 7 } });
      return this.transformChartData(response.data, metricType);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      throw error;
    }
  }

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await this.api.get('/metrics/public');
      return {
        status: this.determineSystemStatus(response.data),
        lastUpdate: new Date().toISOString(),
        connectionStatus: 'connected',
      };
    } catch (error) {
      return {
        status: SystemStatus.MODERATE,
        lastUpdate: new Date().toISOString(),
        connectionStatus: 'disconnected',
      };
    }
  }

  // Helper methods
  private formatActiveTime(createdAt: string): string {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = Math.floor((now.getTime() - created.getTime()) / 60000);
    
    if (diff < 60) return `hace ${diff} min`;
    if (diff < 1440) return `hace ${Math.floor(diff / 60)} h`;
    return `hace ${Math.floor(diff / 1440)} días`;
  }

  private formatETA(eta: string | null): string {
    if (!eta) return 'N/A';
    const now = new Date();
    const etaDate = new Date(eta);
    const diff = Math.floor((etaDate.getTime() - now.getTime()) / 60000);
    
    if (diff < 0) return 'Retrasado';
    if (diff < 60) return `${diff} min`;
    if (diff < 1440) return `${Math.floor(diff / 60)} h`;
    return `${Math.floor(diff / 1440)} días`;
  }

  private transformChartData(data: any, metricType: string): ChartData {
    // Transform real data from backend based on metric type
    if (!data) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Handle different data structures from backend
    if (metricType === 'deliveries' && Array.isArray(data)) {
      // Backend format: [{ date: 'DD/MM', count: 10 }, ...]
      const labels = data.map((item: any) => item.date);
      const values = data.map((item: any) => item.count || 0);

      return {
        labels,
        datasets: [
          {
            label: 'Entregas',
            data: values,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
          },
        ],
      };
    }

    if (metricType === 'incidents' && Array.isArray(data)) {
      const labels = data.map((item: any) => item.date);
      const values = data.map((item: any) => item.count || 0);

      return {
        labels,
        datasets: [
          {
            label: 'Incidencias',
            data: values,
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            borderColor: 'rgba(239, 68, 68, 1)',
          },
        ],
      };
    }

    if (metricType === 'avg_time' && Array.isArray(data)) {
      const labels = data.map((item: any) => item.date);
      const values = data.map((item: any) => item.avgTime || 0);

      return {
        labels,
        datasets: [
          {
            label: 'Tiempo promedio (min)',
            data: values,
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderColor: 'rgba(245, 158, 11, 1)',
          },
        ],
      };
    }

    if (metricType === 'active_orders' && Array.isArray(data)) {
      const labels = data.map((item: any) => item.date);
      const values = data.map((item: any) => item.count || 0);

      return {
        labels,
        datasets: [
          {
            label: 'Pedidos activos',
            data: values,
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgba(16, 185, 129, 1)',
          },
        ],
      };
    }

    // Fallback for other data formats
    return {
      labels: [],
      datasets: [],
    };
  }

  private determineSystemStatus(data: any): SystemStatus {
    const activeIncidents = data.activeIncidents || 0;
    const delayedOrders = data.delayedOrders || 0;
    
    if (activeIncidents > 10 || delayedOrders > 20) return SystemStatus.CRITICAL;
    if (activeIncidents > 5 || delayedOrders > 10) return SystemStatus.MODERATE;
    return SystemStatus.OPERATIONAL;
  }

  private async resolveIncident(incidentId: string): Promise<void> {
    await this.api.patch(`/orders/incidents/${incidentId}/resolve`);
  }

  private async viewOrder(orderId: string): Promise<void> {
    // Navigate to order detail page
    window.location.href = `/orders/${orderId}`;
  }

  private async reassignOrder(orderId: string): Promise<void> {
    await this.api.patch(`/orders/${orderId}/assign`, { driverId: null });
  }
}

export const dashboardService = new DashboardService();
