// src/components/Navbar.js
import React from 'react';
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
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  MoonIcon,
  SunIcon,
  SearchIcon,
  BellIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box
      as="header"
      position="sticky"
      top="0"
      zIndex="1000"
      bg={bgColor}
      borderBottom="1px"
      borderBottomColor={borderColor}
      px="4"
      py="2"
    >
      <Flex alignItems="center" justifyContent="space-between">
        {/* Left side - Search */}
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input placeholder="Search..." variant="filled" />
        </InputGroup>
        
        {/* Right side - User menu and actions */}
        <HStack spacing="4">
          {/* Theme toggle */}
          <Tooltip label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="ghost"
              aria-label="Toggle color mode"
            />
          </Tooltip>
          
          {/* Notifications */}
          <Tooltip label="Notifications">
            <IconButton
              icon={<BellIcon />}
              variant="ghost"
              aria-label="Notifications"
            />
          </Tooltip>
          
          {/* User menu */}
          <Menu>
            <MenuButton
              as={Button}
              rounded="full"
              variant="link"
              cursor="pointer"
              minW={0}
            >
              <HStack>
                <Avatar
                  size="sm"
                  name={user?.name || "User"}
                  src={user?.avatar}
                />
                <Text>{user?.name || "User"}</Text>
                <ChevronDownIcon />
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
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
