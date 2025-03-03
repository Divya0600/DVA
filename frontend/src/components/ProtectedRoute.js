// src/components/common/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            maxWidth: 400
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6">Authenticating...</Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we verify your credentials
          </Typography>
        </Paper>
      </Box>
    );
  }
  
  if (!isAuthenticated) {
    // Save the intended location to redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If authenticated, render the children
  return children;
};

export default ProtectedRoute;