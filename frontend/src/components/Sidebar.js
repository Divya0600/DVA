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
  Button
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
  const [isOpen, setIsOpen] = useState(true); // State to track sidebar open/close
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        pos="fixed"
        top="4"
        left={isOpen ? "245px" : "10px"} // Adjust based on sidebar state
        zIndex="overlay"
        onClick={toggleSidebar}
        bg="blue.500"
        color="white"
        _hover={{ bg: 'blue.600' }}
      >
        {isOpen ? <FiX /> : <FiMenu />}
      </Button>

      {/* Sidebar */}
      <Box
        as="nav"
        pos="fixed"
        top="0"
        left="0"
        h="full"
        w={isOpen ? "240px" : "60px"} // Collapsible width
        transition="width 0.3s ease-in-out"
        bg={bgColor}
        borderRight="1px"
        borderRightColor={borderColor}
        display="flex"
        flexDirection="column"
        overflowX="hidden"
      >
        {/* Sidebar Header */}
        <Flex h="20" alignItems="center" justifyContent="center">
          {isOpen && (
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              Pipeline
            </Text>
          )}
        </Flex>

        {/* Navigation Items */}
        <VStack spacing={0} align="stretch" flex="1">
          <NavItem icon={FiHome} to="/dashboard" isOpen={isOpen}>
            Dashboard
          </NavItem>

          <NavItem icon={FiActivity} to="/pipelines" isOpen={isOpen}>
            Pipelines
          </NavItem>

          <NavItem icon={FiActivity} to="/jobs" isOpen={isOpen}>
            Jobs
          </NavItem>

          <NavItem icon={FiDatabase} to="/sources" isOpen={isOpen}>
            Sources
          </NavItem>

          <NavItem icon={FiDatabase} to="/destinations" isOpen={isOpen}>
            Destinations
          </NavItem>

          <Divider my={4} />

          <NavItem icon={FiSettings} to="/settings" isOpen={isOpen}>
            Settings
          </NavItem>

          <NavItem icon={FiInfo} to="/help" isOpen={isOpen}>
            Help
          </NavItem>
        </VStack>
      </Box>
    </>
  );
};

const NavItem = ({ icon, children, to, isOpen, ...rest }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  
  const activeBg = useColorModeValue('blue.50', 'blue.900');
  const activeColor = useColorModeValue('blue.600', 'blue.200');
  const inactiveColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <NavLink to={to} style={{ width: '100%' }}>
      <Flex
        align="center"
        p="3"
        mx="2"
        mb="1"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : inactiveColor}
        _hover={{
          bg: useColorModeValue('gray.100', 'gray.700'),
          color: useColorModeValue('blue.600', 'blue.200')
        }}
        {...rest}
      >
        <Icon mr={isOpen ? "3" : "0"} fontSize="16" as={icon} />
        {isOpen && <Text fontSize="sm" fontWeight={isActive ? 'semibold' : 'medium'}>{children}</Text>}
      </Flex>
    </NavLink>
  );
};

export default Sidebar;
