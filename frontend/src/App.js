// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Layout
import Layout from './components/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import PipelineList from './pages/PipelineList';
import PipelineDetail from './pages/PipelineDetail';
import PipelineCreate from './pages/PipelineCreate';
import PipelineEdit from './pages/PipelineEdit';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import Sources from './pages/Sources';
import Destinations from './pages/Destinations';
import Settings from './pages/Settings';
import Help from './pages/Help';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Context and Theme
import { AuthProvider } from './context/AuthContext';
import ThemeProvider from './ThemeProvider';

// Protected route
import ProtectedRoute from './components/ProtectedRoute';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60000, // 1 minute
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected routes with layout */}
              <Route element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                
                <Route path="pipelines">
                  <Route index element={<PipelineList />} />
                  <Route path="create" element={<PipelineCreate />} />
                  <Route path=":pipelineId" element={<PipelineDetail />} />
                  <Route path=":pipelineId/edit" element={<PipelineEdit />} />
                </Route>
                
                <Route path="jobs">
                  <Route index element={<JobList />} />
                  <Route path=":jobId" element={<JobDetail />} />
                </Route>
                
                <Route path="sources" element={<Sources />} />
                <Route path="destinations" element={<Destinations />} />
                <Route path="settings" element={<Settings />} />
                <Route path="help" element={<Help />} />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;