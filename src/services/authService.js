import api from '@/utils/api';

export const studentLogin = creds => api.post('/auth/student/login', creds);
export const studentRegister = payload => api.post('/auth/student/register', payload);
export const adminLogin = creds => api.post('/auth/admin/login', creds);
export const getMe = () => api.get('/auth/me');
