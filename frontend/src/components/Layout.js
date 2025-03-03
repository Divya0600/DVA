// src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Calculate drawer width based on screen size and sidebar state
  const drawerWidth = isMobile ? 0 : 240;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar - Navbar component */}
      <Navbar />
      
      {/* Sidebar component */}
      <Sidebar />
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.default',
          minHeight: '100vh',
          overflow: 'auto',
        }}
      >
        <Toolbar /> {/* This creates space for the fixed app bar */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;