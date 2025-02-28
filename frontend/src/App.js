// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import PipelineList from './pages/PipelineList';
import PipelineDetail from './pages/PipelineDetail';
import PipelineCreate from './pages/PipelineCreate';
import PipelineEdit from './pages/PipelineEdit';
import JobList from './pages/JobList';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Auth protection component
import ProtectedRoute from './components/ProtectedRoute';

// Create a client for React Query
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
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Box display="flex" height="100vh">
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
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
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
        </Router>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

// Layout wrapper for authenticated routes
function Layout() {
  return (
    <>
      <Sidebar />
      <Box flex="1" display="flex" flexDirection="column">
        <Navbar />
        <Box as="main" p={4} overflowY="auto">
          <Routes>
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
          </Routes>
        </Box>
      </Box>
    </>
  );
}

export default App;
