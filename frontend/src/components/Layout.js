// src/components/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { 
  FiHome, 
  FiActivity, 
  FiDatabase, 
  FiSettings, 
  FiInfo, 
  FiPackage 
} from 'react-icons/fi';

import Navbar from './Navbar';
import CustomDrawer from './CustomDrawer';

// Define navigation items
const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/pipelines', label: 'Pipelines', icon: FiActivity },
  { path: '/jobs', label: 'Jobs', icon: FiPackage },
  { path: '/sources', label: 'Sources', icon: FiDatabase },
  { path: '/destinations', label: 'Destinations', icon: FiDatabase },
  { path: '/settings', label: 'Settings', icon: FiSettings },
  { path: '/help', label: 'Help', icon: FiInfo },
];

const Layout = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <CustomDrawer navItems={NAV_ITEMS}>
      <Box minH="100vh" bg={bgColor}>
        <Navbar />
        <Box as="main" p={4} maxW="1400px" mx="auto">
          <Outlet />
        </Box>
      </Box>
    </CustomDrawer>
  );
};

export default Layout;