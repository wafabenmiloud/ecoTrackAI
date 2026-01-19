// client/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Consumption API
export const consumptionAPI = {
  // Single data point
  addConsumption: (data) => api.post('/consumption/energy', data),
  getConsumption: (params) => api.get('/consumption', { params }),
  getConsumptionStats: (params) => api.get('/consumption/stats', { params }),
  
  // Batch operations
  batchImport: (data) => api.post('/consumption/batch', data),
  manualEntry: (data) => api.post('/consumption/manual', data),
  
  // Analysis
  analyzeData: (data) => api.post('/consumption/analyze', data),
  getForecast: (data) => api.post('/consumption/forecast', data),
  detectAnomalies: (data) => api.post('/consumption/detect-anomalies', data),
};

// Admin API
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getStats: () => api.get('/admin/stats'),
};

// File Upload
export const uploadFile = (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return api.post('/consumption/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

export default api;