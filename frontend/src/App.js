// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout component
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

// Auth protection component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes with layout */}
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
          
          <Route path="sources" element={<Sources />} />
          <Route path="destinations" element={<Destinations />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
        </Route>
        
        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;