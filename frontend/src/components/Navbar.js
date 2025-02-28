// src/components/Navbar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Text,
  Avatar,
  useColorMode,
  Tooltip,
  InputGroup,
  Input,
  InputLeftElement,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Spacer,
} from '@chakra-ui/react';
import {
  MoonIcon,
  SunIcon,
  SearchIcon,
  BellIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Colors
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let breadcrumbs = [];
    
    if (pathSegments.length === 0) {
      return [{ path: '/dashboard', label: 'Dashboard' }];
    }
    
    let currentPath = '';
    
    // For each segment, build the path and create a breadcrumb
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Format the label (capitalize first letter, remove hyphens)
      let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      // Special case for IDs (e.g., UUIDs)
      if (
        (segment.includes('-') && segment.length > 10) || 
        (index > 0 && ['edit', 'create'].includes(segment))
      ) {
        switch (segment) {
          case 'create':
            label = 'Create New';
            break;
          case 'edit':
            label = 'Edit';
            break;
          default:
            if (segment.length > 8) {
              label = segment.substring(0, 8) + '...';
            }
        }
      }
      
      breadcrumbs.push({
        path: currentPath,
        label: label,
        isLast: index === pathSegments.length - 1
      });
    });
    
    // Always include Dashboard as the first breadcrumb
    return [{ path: '/dashboard', label: 'Dashboard' }, ...breadcrumbs];
  };
  
  const breadcrumbs = generateBreadcrumbs();
  
  // Item color variables - moved outside the render JSX
  const activeItemColor = "blue.500";
  const inactiveItemColor = "gray.500";

  return (
    <Box
      as="header"
      bg={bgColor}
      borderBottom="1px"
      borderBottomColor={borderColor}
      py={2}
      px={4}
      position="sticky"
      top="0"
      zIndex="10"
    >
      <Flex alignItems="center" justifyContent="space-between">
        {/* Breadcrumbs */}
        <Breadcrumb separator={<ChevronRightIcon color="gray.500" />}>
          {breadcrumbs.map((crumb, index) => (
            <BreadcrumbItem key={index} isCurrentPage={crumb.isLast}>
              <BreadcrumbLink 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate(crumb.path);
                }}
                fontWeight={crumb.isLast ? "semibold" : "normal"}
                color={crumb.isLast ? activeItemColor : inactiveItemColor}
              >
                {crumb.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
        
        <Spacer />
        
        {/* Search */}
        <InputGroup maxW="400px" mx={4} display={{ base: 'none', md: 'flex' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input placeholder="Search..." variant="filled" size="sm" />
        </InputGroup>
        
        <Spacer />
        
        {/* Right section with user controls */}
        <HStack spacing={3}>
          {/* Theme toggle */}
          <Tooltip label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              variant="ghost"
              onClick={toggleColorMode}
              aria-label="Toggle color mode"
              size="sm"
            />
          </Tooltip>
          
          {/* Notifications */}
          <Tooltip label="Notifications">
            <IconButton
              icon={<BellIcon />}
              variant="ghost"
              aria-label="Notifications"
              size="sm"
            />
          </Tooltip>
          
          {/* User menu */}
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
              size="sm"
            >
              <HStack>
                <Avatar
                  size="sm"
                  name={user?.name || "User"}
                  src={user?.avatar}
                  bg="blue.500"
                />
                <Text display={{ base: 'none', md: 'block' }}>
                  {user?.name || "User"}
                </Text>
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem onClick={() => navigate('/settings')}>Settings</MenuItem>
              <MenuItem onClick={() => navigate('/help')}>Help</MenuItem>
              <MenuDivider />
              <MenuItem onClick={logout}>Sign Out</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;