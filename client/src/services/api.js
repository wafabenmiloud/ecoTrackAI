// client/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Public routes
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Protected routes
  getMe: () => api.get('/auth/me'),
  updateDetails: (userData) => api.put('/auth/updatedetails', userData),
  updatePassword: (passwords) => api.put('/auth/updatepassword', passwords),
  logout: () => api.get('/auth/logout'),
  
  // Password reset (currently inactive)
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password })
};

// Admin API
export const adminAPI = {
  // User Management
  users: {
    getAll: (params) => api.get('/admin/users', { params }),
    getById: (id) => api.get(`/admin/users/${id}`),
    create: (userData) => api.post('/admin/users', userData),
    update: (id, userData) => api.put(`/admin/users/${id}`, userData),
    delete: (id) => api.delete(`/admin/users/${id}`)
  },
  
  // Device Management
  devices: {
    getAll: (params) => api.get('/admin/devices', { params }),
    getById: (id) => api.get(`/admin/devices/${id}`),
    create: (deviceData) => api.post('/admin/devices', deviceData),
    update: (id, deviceData) => api.put(`/admin/devices/${id}`, deviceData),
    delete: (id) => api.delete(`/admin/devices/${id}`)
  },
  
  // Analytics & Monitoring
  analytics: {
    getConsumptionStats: () => api.get('/admin/analytics/consumption'),
    getAnomalies: (params) => api.get('/admin/analytics/anomalies', { params }),
    getPredictions: (params) => api.get('/admin/analytics/predictions', { params })
  },
  
  // System Management
  system: {
    getStatus: () => api.get('/admin/system/status'),
    getAuditLogs: (params) => api.get('/admin/audit-logs', { params })
  },
  
  // User Support
  support: {
    getTickets: (params) => api.get('/admin/support-tickets', { params }),
    getTicketById: (id) => api.get(`/admin/support-tickets/${id}`),
    updateTicket: (id, ticketData) => api.put(`/admin/support-tickets/${id}`, ticketData)
  }
};

// Consumption API
export const consumptionAPI = {
  // Data Operations
  addConsumption: (data) => api.post('/consumption', data),
  getConsumption: (params) => api.get('/consumption', { params }),
  deleteConsumption: (id) => api.delete(`/consumption/${id}`),
  
  // Import/Export
  importCSV: (formData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return api.post('/consumption/import/csv', formData, config);
  },
  exportData: (params) => {
    return api.get('/consumption/export', { 
      params,
      responseType: 'blob' 
    });
  },
  
  // Analytics
  getStats: (params) => api.get('/consumption/stats', { params }),
  getAnomalies: (params) => api.get('/consumption/anomalies', { params }),
  getPredictions: (params) => api.get('/consumption/predictions', { params })
};

// Export the configured axios instance
export default api;