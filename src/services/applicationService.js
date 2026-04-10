import api from '@/utils/api';

export const getMyApplication = () => api.get('/application/my');
export const submitApplication = payload => api.post('/application/submit', payload);
export const getAllApplications = params => api.get('/application/all', { params });
export const getApplicationById = id => api.get(`/application/${id}`);
export const updateClearance = (id, clearanceType, status, reason) =>
  api.patch(`/application/${id}/clearance`, { clearanceType, status, reason });
export const processRefund = id => api.patch(`/application/${id}/refund`);
export const getDashboardStats = () => api.get('/application/stats/dashboard');
export const submitOfflineNoDues = file => {
  const formData = new FormData();
  formData.append('noDuesImage', file);
  return api.patch('/application/my/offline-noDues', formData, {
    headers: { 'Content-Type': undefined },
  });
};

export const uploadDocuments = (tcOrAdmissionSlip, bankPassbook, feesSlip) => {
  const formData = new FormData();
  formData.append('tcOrAdmissionSlip', tcOrAdmissionSlip);
  formData.append('bankPassbook', bankPassbook);
  formData.append('feesSlip', feesSlip);
  return api.patch('/application/my/documents', formData, {
    headers: { 'Content-Type': undefined },
  });
};
