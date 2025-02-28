// src/components/CustomDrawer.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  useColorModeValue, 
  IconButton, 
  useDisclosure, 
  Drawer, 
  DrawerOverlay, 
  DrawerContent,
  Flex,
  VStack,
  Text,
  Divider,
  useBreakpointValue,
} from '@chakra-ui/react';
import { NavLink, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

// Custom drawer component for responsive sidebar
const CustomDrawer = ({ children, navItems }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Show drawer only on mobile
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  // Close drawer when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      onClose();
    }
  }, [location.pathname, isMobile, onClose]);
  
  return (
    <>
      {/* Mobile drawer toggle button */}
      {isMobile && (
        <IconButton
          aria-label="Open menu"
          icon={<FiMenu />}
          onClick={onOpen}
          position="fixed"
          top="4"
          left="4"
          zIndex="2000"
          boxShadow="md"
          colorScheme="blue"
          size="md"
          display={{ md: 'none' }}
        />
      )}
      
      {/* Mobile drawer */}
      <Drawer
        isOpen={isMobile && isOpen}
        placement="left"
        onClose={onClose}
        size="xs"
      >
        <DrawerOverlay />
        <DrawerContent>
          <Flex p={4} justify="space-between" align="center">
            <Text fontWeight="bold" fontSize="lg">Pipeline Migration</Text>
            <IconButton
              icon={<FiX />}
              variant="ghost"
              onClick={onClose}
              aria-label="Close menu"
            />
          </Flex>
          
          <Divider />
          
          <VStack align="stretch" spacing={0}>
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                to={item.path}
                icon={item.icon}
                label={item.label}
                isMobile={true}
                onClick={onClose}
              />
            ))}
          </VStack>
        </DrawerContent>
      </Drawer>
      
      {/* Desktop sidebar */}
      <Box
        as="aside"
        h="100vh"
        w="240px"
        bg={bgColor}
        borderRight="1px"
        borderRightColor={borderColor}
        position="fixed"
        display={{ base: 'none', md: 'block' }}
        zIndex="10"
      >
        <Flex h="16" alignItems="center" justifyContent="center" px={4}>
          <Text fontSize="xl" fontWeight="bold" color="blue.500">
            Pipeline Migration
          </Text>
        </Flex>
        
        <Divider mb={4} />
        
        <VStack spacing={1} align="stretch" px={2}>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              to={item.path}
              icon={item.icon}
              label={item.label}
              isMobile={false}
            />
          ))}
        </VStack>
      </Box>
      
      {/* Main content */}
      <Box ml={{ base: 0, md: '240px' }} transition="margin-left 0.3s">
        {children}
      </Box>
    </>
  );
};

// Navigation Item Component
const NavItem = ({ to, icon, label, isMobile, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
                  (to !== '/dashboard' && location.pathname.startsWith(to));
  
  // Colors
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const Icon = icon;
  
  return (
    <Box as={NavLink} to={to} w="100%" onClick={onClick} _activeLink={{ textDecoration: 'none' }}>
      <Flex
        align="center"
        p={3}
        mx={2}
        borderRadius="md"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : 'gray.500'}
        _hover={{ bg: hoverBg, color: activeColor }}
        transition="all 0.2s"
      >
        <Icon size={isMobile ? 22 : 18} style={{ marginRight: '12px' }} />
        <Text fontWeight={isActive ? 'semibold' : 'medium'}>
          {label}
        </Text>
      </Flex>
    </Box>
  );
};

export default CustomDrawer;