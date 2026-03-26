import api from '@/utils/api';

export const getMyApplication = () => api.get('/application/my');
export const submitApplication = payload => api.post('/application/submit', payload);
export const getAllApplications = params => api.get('/application/all', { params });
export const getApplicationById = id => api.get(`/application/${id}`);
export const updateClearance = (id, clearanceType, status, reason) =>
  api.patch(`/application/${id}/clearance`, { clearanceType, status, reason });
export const processRefund = id => api.patch(`/application/${id}/refund`);
export const getDashboardStats = () => api.get('/application/stats/dashboard');
