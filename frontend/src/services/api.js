// src/services/api.js
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

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
      localStorage.removeItem('user');
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock data for development
const MOCK_DATA = {
  pipelines: [
    {
      id: uuidv4(),
      name: 'ALM to Jira Migration',
      description: 'Migrate defects from ALM to Jira issues',
      source_type: 'alm',
      source_config: {
        base_url: 'https://alm.example.com',
        username: 'alm_user',
        password: 'password',
        domain: 'DEFAULT',
        project: 'TestProject'
      },
      destination_type: 'jira',
      destination_config: {
        base_url: 'https://jira.example.com',
        username: 'jira_user',
        password: 'password',
        project_key: 'PROJ'
      },
      status: 'active',
      created_at: '2025-02-15T10:00:00Z',
      updated_at: '2025-02-28T15:30:00Z',
      last_run_at: '2025-02-28T15:30:00Z',
      job_count: 5,
      latest_job_status: 'completed'
    },
    {
      id: uuidv4(),
      name: 'Database Migration',
      description: 'Copy data from MySQL to PostgreSQL',
      source_type: 'mysql',
      source_config: {
        host: 'mysql.example.com',
        port: 3306,
        username: 'root',
        password: 'password',
        database: 'source_db'
      },
      destination_type: 'postgres',
      destination_config: {
        host: 'postgres.example.com',
        port: 5432,
        username: 'postgres',
        password: 'password',
        database: 'dest_db'
      },
      status: 'inactive',
      created_at: '2025-01-20T09:15:00Z',
      updated_at: '2025-02-25T11:45:00Z',
      last_run_at: '2025-02-22T14:20:00Z',
      job_count: 3,
      latest_job_status: 'failed'
    }
  ],
  jobs: [
    {
      id: uuidv4(),
      pipeline: "pipeline-id-1",
      pipeline_name: "ALM to Jira Migration",
      pipeline_source_type: "alm",
      pipeline_destination_type: "jira",
      status: "completed",
      started_at: "2025-02-28T14:30:00Z",
      completed_at: "2025-02-28T14:32:00Z",
      duration: 120,
      source_record_count: 150,
      destination_record_count: 148,
      error_count: 2,
      created_at: "2025-02-28T14:29:00Z",
      logs: [
        {
          timestamp: "2025-02-28T14:30:00Z",
          level: "info",
          message: "Pipeline execution started"
        },
        {
          timestamp: "2025-02-28T14:30:30Z",
          level: "info",
          message: "Fetching data from ALM"
        },
        {
          timestamp: "2025-02-28T14:31:00Z",
          level: "info",
          message: "Retrieved 150 defects from ALM"
        },
        {
          timestamp: "2025-02-28T14:31:30Z",
          level: "info",
          message: "Uploading data to Jira"
        },
        {
          timestamp: "2025-02-28T14:32:00Z",
          level: "warning",
          message: "2 records failed to upload"
        }
      ],
      errors: [
        {
          timestamp: "2025-02-28T14:31:45Z",
          message: "Invalid data format for defect ID 12345",
          details: {
            defect_id: 12345,
            field: "priority",
            reason: "Invalid value"
          }
        }
      ]
    },
    {
      id: uuidv4(),
      pipeline: "pipeline-id-1",
      pipeline_name: "ALM to Jira Migration",
      pipeline_source_type: "alm",
      pipeline_destination_type: "jira",
      status: "running",
      started_at: "2025-02-28T16:00:00Z",
      completed_at: null,
      duration: null,
      source_record_count: 200,
      destination_record_count: 75,
      error_count: 0,
      created_at: "2025-02-28T16:00:00Z",
      logs: [
        {
          timestamp: "2025-02-28T16:00:00Z",
          level: "info",
          message: "Pipeline execution started"
        },
        {
          timestamp: "2025-02-28T16:00:30Z",
          level: "info",
          message: "Fetching data from ALM"
        },
        {
          timestamp: "2025-02-28T16:01:00Z",
          level: "info",
          message: "Retrieved 200 defects from ALM"
        },
        {
          timestamp: "2025-02-28T16:01:30Z",
          level: "info",
          message: "Uploading data to Jira"
        }
      ],
      errors: []
    }
  ],
  source_types: [
    { id: 'alm', name: 'ALM', description: 'HP ALM Defect Tracking' },
    { id: 'mysql', name: 'MySQL', description: 'MySQL Database' },
    { id: 'postgres', name: 'PostgreSQL', description: 'PostgreSQL Database' },
    { id: 'mongodb', name: 'MongoDB', description: 'MongoDB Database' },
    { id: 'salesforce', name: 'Salesforce', description: 'Salesforce CRM' },
    { id: 'rest', name: 'REST API', description: 'Generic REST API' }
  ],
  destination_types: [
    { id: 'jira', name: 'Jira', description: 'Atlassian Jira Issue Tracking' },
    { id: 'mysql', name: 'MySQL', description: 'MySQL Database' },
    { id: 'postgres', name: 'PostgreSQL', description: 'PostgreSQL Database' },
    { id: 'mongodb', name: 'MongoDB', description: 'MongoDB Database' },
    { id: 'salesforce', name: 'Salesforce', description: 'Salesforce CRM' },
    { id: 'rest', name: 'REST API', description: 'Generic REST API' }
  ]
};

// Helper function to mock API responses
const mockResponse = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data });
    }, delay);
  });
};

// Add pipeline ID to MOCK_DATA.jobs
MOCK_DATA.jobs.forEach(job => {
  job.pipeline = MOCK_DATA.pipelines[0].id;
});

// API service functions
const apiService = {
  // Authentication
  auth: {
    login: (credentials) => {
      // Simulate login
      return mockResponse({ 
        access: 'mock-token', 
        refresh: 'mock-refresh-token' 
      });
    },
    refreshToken: (refresh) => {
      // Simulate token refresh
      return mockResponse({ access: 'new-mock-token' });
    },
    getUser: () => {
      // Simulate get user
      return mockResponse({
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        first_name: 'Admin',
        last_name: 'User',
        is_staff: true
      });
    },
  },
  
  // Pipelines
  pipelines: {
    getAll: (params) => {
      // Simulate fetching all pipelines
      return mockResponse({
        count: MOCK_DATA.pipelines.length,
        data: MOCK_DATA.pipelines
      });
    },
    get: (id) => {
      // Simulate fetching a single pipeline
      const pipeline = MOCK_DATA.pipelines.find(p => p.id === id) || MOCK_DATA.pipelines[0];
      return mockResponse({ data: pipeline });
    },
    create: (data) => {
      // Simulate creating a pipeline
      const newPipeline = {
        id: uuidv4(),
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        job_count: 0,
        latest_job_status: null
      };
      MOCK_DATA.pipelines.push(newPipeline);
      return mockResponse({ data: newPipeline });
    },
    update: (id, data) => {
      // Simulate updating a pipeline
      const index = MOCK_DATA.pipelines.findIndex(p => p.id === id);
      if (index >= 0) {
        MOCK_DATA.pipelines[index] = {
          ...MOCK_DATA.pipelines[index],
          ...data,
          updated_at: new Date().toISOString()
        };
        return mockResponse({ data: MOCK_DATA.pipelines[index] });
      }
      return Promise.reject(new Error('Pipeline not found'));
    },
    delete: (id) => {
      // Simulate deleting a pipeline
      const index = MOCK_DATA.pipelines.findIndex(p => p.id === id);
      if (index >= 0) {
        MOCK_DATA.pipelines.splice(index, 1);
        return mockResponse({ success: true });
      }
      return Promise.reject(new Error('Pipeline not found'));
    },
    execute: (id) => {
      // Simulate executing a pipeline
      const newJob = {
        id: uuidv4(),
        pipeline: id,
        pipeline_name: "Pipeline Execution",
        pipeline_source_type: "alm",
        pipeline_destination_type: "jira",
        status: "running",
        started_at: new Date().toISOString(),
        completed_at: null,
        duration: null,
        source_record_count: null,
        destination_record_count: null,
        error_count: 0,
        created_at: new Date().toISOString(),
        logs: [
          {
            timestamp: new Date().toISOString(),
            level: "info",
            message: "Pipeline execution started"
          }
        ],
        errors: []
      };
      MOCK_DATA.jobs.push(newJob);
      
      // Update pipeline last_run_at
      const pipeline = MOCK_DATA.pipelines.find(p => p.id === id);
      if (pipeline) {
        pipeline.last_run_at = new Date().toISOString();
      }
      
      return mockResponse({ 
        message: 'Pipeline execution started',
        job_id: newJob.id
      });
    },
    getJobs: (id) => {
      // Simulate fetching jobs for a pipeline
      const jobs = MOCK_DATA.jobs.filter(job => job.pipeline === id);
      return mockResponse({
        count: jobs.length,
        data: jobs
      });
    },
    getTypes: () => {
      // Simulate fetching adapter types
      return mockResponse({
        source_types: MOCK_DATA.source_types,
        destination_types: MOCK_DATA.destination_types
      });
    },
  },
  
  // Jobs
  jobs: {
    getAll: (params) => {
      // Simulate fetching all jobs with pagination
      return mockResponse({
        count: MOCK_DATA.jobs.length,
        data: MOCK_DATA.jobs
      });
    },
    get: (id) => {
      // Simulate fetching a single job
      const job = MOCK_DATA.jobs.find(j => j.id === id) || MOCK_DATA.jobs[0];
      return mockResponse({ data: job });
    },
    retry: (id) => {
      // Simulate retrying a failed job
      const job = MOCK_DATA.jobs.find(j => j.id === id);
      if (job) {
        const newJob = {
          ...job,
          id: uuidv4(),
          status: 'pending',
          started_at: null,
          completed_at: null,
          duration: null,
          created_at: new Date().toISOString(),
          logs: [
            {
              timestamp: new Date().toISOString(),
              level: "info",
              message: "Job retry initiated"
            }
          ],
          errors: []
        };
        MOCK_DATA.jobs.push(newJob);
        return mockResponse({ 
          message: 'Job retry started',
          job_id: newJob.id
        });
      }
      return Promise.reject(new Error('Job not found'));
    },
    cancel: (id) => {
      // Simulate cancelling a job
      const job = MOCK_DATA.jobs.find(j => j.id === id);
      if (job && (job.status === 'pending' || job.status === 'running')) {
        job.status = 'cancelled';
        job.completed_at = new Date().toISOString();
        job.logs.push({
          timestamp: new Date().toISOString(),
          level: "info",
          message: "Job cancelled by user"
        });
        return mockResponse({ success: true });
      }
      return Promise.reject(new Error('Job not found or cannot be cancelled'));
    },
    getStatus: (id) => {
      // Simulate fetching job status
      const job = MOCK_DATA.jobs.find(j => j.id === id);
      if (job) {
        return mockResponse({
          job: job,
          task: {
            task_id: 'mock-task-id',
            state: job.status === 'completed' ? 'SUCCESS' : 
                  job.status === 'running' ? 'STARTED' :
                  job.status === 'pending' ? 'PENDING' :
                  job.status === 'failed' ? 'FAILURE' : 'UNKNOWN',
            info: {
              status: job.status,
              source_count: job.source_record_count,
              destination_count: job.destination_record_count,
              error_count: job.error_count
            }
          }
        });
      }
      return Promise.reject(new Error('Job not found'));
    },
  }
};

export default apiService;