import api from './axios.config';

export const reportsApi = {
  getKPIs: () => api.get('/reports/kpis'),
  getLoginMetrics: () => api.get('/public/reports/login-metrics'),
  getDeliveriesByDay: (days?: number) => api.get('/reports/deliveries-by-day', { params: { days } }),
  getTopDrivers: () => api.get('/reports/top-drivers'),

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
