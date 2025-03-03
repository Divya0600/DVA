// src/services/api.js
import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

// API service with endpoints
const apiService = {
  // Authentication
  auth: {
    login: (credentials) => api.post('/auth/token/', credentials),
    refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
    getUser: () => api.get('/auth/user/'),
  },
  
  // Pipelines
  pipelines: {
    getAll: (params) => api.get('/pipelines/', { params }),
    get: (id) => api.get(`/pipelines/${id}/`),
    create: (data) => api.post('/pipelines/', data),
    update: (id, data) => api.put(`/pipelines/${id}/`, data),
    delete: (id) => api.delete(`/pipelines/${id}/`),
    execute: (id) => api.post(`/pipelines/${id}/execute/`),
    getJobs: (id) => api.get(`/pipelines/${id}/jobs/`),
    getTypes: () => api.get('/pipelines/types/'),
    
    // Connection testing endpoints
    testSourceConnection: (data) => api.post('/pipelines/test-source-connection/', data),
    testDestinationConnection: (data) => api.post('/pipelines/test-destination-connection/', data),
  },
  
  // Jobs
  jobs: {
    getAll: (params) => api.get('/jobs/', { params }),
    get: (id) => api.get(`/jobs/${id}/`),
    retry: (id) => api.post(`/jobs/${id}/retry/`),
    cancel: (id) => api.post(`/jobs/${id}/cancel/`),
    getStatus: (id) => api.get(`/jobs/${id}/status/`),
  }
};

export default apiService;