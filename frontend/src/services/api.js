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

// API service with real endpoints
const apiService = {
  // Authentication
  auth: {
    login: (credentials) => {
      console.log('Login attempt with:', credentials);
      return api.post('/auth/token/', credentials);
    },
    refreshToken: (refresh) => {
      return api.post('/auth/token/refresh/', { refresh });
    },
    getUser: () => {
      return api.get('/auth/user/');
    },
  },


  
  // Pipelines
  pipelines: {
    getAll: (params) => {
      console.log("Fetching all pipelines with params:", params);
      return api.get('/pipelines/', { params })
        .then(response => {
          console.log("Pipeline API response:", response);
          return response;
        })
        .catch(error => {
          console.error("Pipeline API error:", error);
          throw error;
        });
    },
    get: (id) => {
      return api.get(`/pipelines/${id}/`);
    },
    create: (data) => {
      console.log("Creating pipeline with data:", data);
      return api.post('/pipelines/', data)
        .then(response => {
          console.log("Pipeline creation response:", response);
          return response;
        });
    },
    update: (id, data) => {
      return api.put(`/pipelines/${id}/`, data);
    },
    delete: (id) => {
      return api.delete(`/pipelines/${id}/`);
    },
    execute: (id) => {
      return api.post(`/pipelines/${id}/execute/`);
    },
    getJobs: (id) => {
      return api.get(`/pipelines/${id}/jobs/`);
    },
    getTypes: () => {
      return api.get('/pipelines/types/');
    },
  },
  
  // Jobs
  jobs: {
    getAll: (params) => {
      return api.get('/jobs/', { params });
    },
    get: (id) => {
      return api.get(`/jobs/${id}/`);
    },
    retry: (id) => {
      return api.post(`/jobs/${id}/retry/`);
    },
    cancel: (id) => {
      return api.post(`/jobs/${id}/cancel/`);
    },
    getStatus: (id) => {
      return api.get(`/jobs/${id}/status/`);
    },
  }
};

export default apiService;