import axios from 'axios';
import { backendUrl } from '@/config/constants';

const api = axios.create({
  baseURL: backendUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('iehe_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => {
    if (res.data?.success !== undefined && res.data?.data !== undefined) {
      res.data = res.data.data;
    }
    return res;
  },
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('iehe_token');
      localStorage.removeItem('iehe_user');
      window.location.href = '/';
    }
    if (err.response?.data?.success !== undefined) {
      const outer = err.response.data;
      err.response.data = {
        ...(outer.data || {}),
        error: outer.data?.error || outer.message,
      };
    }
    return Promise.reject(err);
  }
);

export default api;
