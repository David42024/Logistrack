import api from './axios.config';

export const reportsApi = {
  getKPIs: () => api.get('/reports/kpis'),
  getLoginMetrics: () => api.get('/public/reports/login-metrics'),
  getDeliveriesByDay: (days?: number) => api.get('/reports/deliveries-by-day', { params: { days } }),
  getTopDrivers: () => api.get('/reports/top-drivers'),
  getAnalytics: () => api.get('/reports/analytics'),
  getAvgTimeByDay: (days?: number) => api.get('/reports/avg-time-by-day', { params: { days } }),
  getIncidentsByDay: (days?: number) => api.get('/reports/incidents-by-day', { params: { days } }),
  getActiveOrdersByDay: (days?: number) => api.get('/reports/active-orders-by-day', { params: { days } }),

  getFleetMetrics: () => api.get('/fleet/metrics'),
  getRoutesMetrics: () => api.get('/routes/metrics'),
  getOrderStats: () => api.get('/orders/stats'),

  exportPdf: () =>
    api.get('/reports/export/pdf', { responseType: 'blob' }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte.pdf';
      a.click();
    }),

  exportExcel: () =>
    api.get('/reports/export/excel', { responseType: 'blob' }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte.xlsx';
      a.click();
    }),
};
