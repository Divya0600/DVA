// src/components/Sidebar.js
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Icon,
  Text,
  VStack,
  Divider,
  useColorModeValue,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiHome,
  FiActivity,
  FiDatabase,
  FiSettings,
  FiInfo,
  FiMenu,
  FiX
} from 'react-icons/fi';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <Box position="relative">
      {/* Sidebar */}
      <Box
        as="nav"
        h="100vh"
        w={isCollapsed ? "70px" : "240px"}
        bg={bgColor}
        borderRight="1px"
        borderRightColor={borderColor}
        transition="width 0.3s ease"
        position="relative"
        zIndex="20" // Ensure sidebar stays above content
      >
        {/* Toggle Button */}
        <IconButton
          icon={isCollapsed ? <FiMenu /> : <FiX />}
          variant="ghost"
          position="absolute"
          top="4"
          right={isCollapsed ? "50%" : "4"}
          transform={isCollapsed ? "translateX(50%)" : "none"}
          onClick={toggleSidebar}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          zIndex="1"
        />
        
        {/* Logo/Header */}
        <Flex h="20" alignItems="center" justifyContent="center" px={4}>
          {!isCollapsed ? (
            <Text fontSize="xl" fontWeight="bold" color="blue.500">
              Pipeline Migration
            </Text>
          ) : (
            <Text fontSize="xl" fontWeight="bold" color="blue.500">
              PM
            </Text>
          )}
        </Flex>
        
        <Divider mb={4} />
        
        {/* Navigation Items */}
        <VStack spacing={1} align="stretch" px={2}>
          <NavItem 
            to="/dashboard" 
            icon={FiHome} 
            label="Dashboard" 
            isCollapsed={isCollapsed} 
            isActive={location.pathname === '/dashboard'} 
          />
          
          <NavItem 
            to="/pipelines" 
            icon={FiActivity} 
            label="Pipelines" 
            isCollapsed={isCollapsed} 
            isActive={location.pathname.startsWith('/pipelines')} 
          />
          
          <NavItem 
            to="/jobs" 
            icon={FiActivity} 
            label="Jobs" 
            isCollapsed={isCollapsed} 
            isActive={location.pathname.startsWith('/jobs')} 
          />
          
          <NavItem 
            to="/sources" 
            icon={FiDatabase} 
            label="Sources" 
            isCollapsed={isCollapsed} 
            isActive={location.pathname === '/sources'} 
          />
          
          <NavItem 
            to="/destinations" 
            icon={FiDatabase} 
            label="Destinations" 
            isCollapsed={isCollapsed} 
            isActive={location.pathname === '/destinations'} 
          />
          
          <Divider my={4} />
          
          <NavItem 
            to="/settings" 
            icon={FiSettings} 
            label="Settings" 
            isCollapsed={isCollapsed} 
            isActive={location.pathname === '/settings'} 
          />
          
          <NavItem 
            to="/help" 
            icon={FiInfo} 
            label="Help" 
            isCollapsed={isCollapsed} 
            isActive={location.pathname === '/help'} 
          />
        </VStack>
      </Box>
    </Box>
  );
};

// Navigation Item Component
const NavItem = ({ to, icon, label, isCollapsed, isActive }) => {
  // Colors
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  
  return (
    <Tooltip label={isCollapsed ? label : null} placement="right" hasArrow>
      <Box as={NavLink} to={to} w="100%" _activeLink={{ textDecoration: 'none' }}>
        <Flex
          align="center"
          p={3}
          borderRadius="md"
          role="group"
          cursor="pointer"
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : 'gray.500'}
          _hover={{ bg: hoverBg, color: activeColor }}
          transition="all 0.2s"
        >
          <Icon as={icon} boxSize={5} />
          {!isCollapsed && (
            <Text ml={4} fontWeight={isActive ? 'semibold' : 'medium'}>
              {label}
            </Text>
          )}
        </Flex>
      </Box>
    </Tooltip>
  );
};

export default Sidebar;