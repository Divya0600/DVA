// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  VStack,
  HStack,
  Checkbox,
  useColorModeValue,
  useToast,
  Icon,
  Divider,
  Flex,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { FiDatabase, FiActivity } from 'react-icons/fi';

import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const brandColor = useColorModeValue('blue.600', 'blue.300');
  const inputBgColor = useColorModeValue('white', 'gray.700');
  
  // Get redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Form state
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!credentials.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // For development, you can use any credentials or hardcode a specific test user
      const testCredentials = {
        username: credentials.username,
        password: credentials.password,
      };
      
      const success = await login(testCredentials);
      
      if (success) {
        toast({
          title: 'Login Successful',
          description: 'Welcome to the Pipeline Migration System',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        
        navigate(from, { replace: true });
      } else {
        setErrors({
          login: 'Invalid username or password',
        });
      }
    } catch (error) {
      setErrors({
        login: error.message || 'An error occurred during login',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Center minH="100vh" bg={bgColor}>
      <Box
        w={{ base: '90%', md: '450px' }}
        bg={cardBg}
        boxShadow="lg"
        rounded="xl"
        p={8}
      >
        <VStack spacing={8} align="stretch">
          <VStack spacing={4} textAlign="center">
            <Flex align="center" justify="center">
              <Icon as={FiDatabase} boxSize={10} color={brandColor} mr={2} />
              <Icon as={FiActivity} boxSize={10} color={brandColor} />
            </Flex>
            <Heading size="xl" color={brandColor}>Pipeline Migration</Heading>
            <Text color={textColor}>Sign in to your account</Text>
          </VStack>
          
          {errors.login && (
            <Box p={3} bg="red.50" color="red.500" borderRadius="md">
              {errors.login}
            </Box>
          )}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={6}>
              <FormControl id="username" isRequired isInvalid={!!errors.username}>
                <FormLabel>Username</FormLabel>
                <Input
                  name="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleChange}
                  autoComplete="username"
                  size="lg"
                  placeholder="Enter your username"
                  bg={inputBgColor}
                />
                <FormErrorMessage>{errors.username}</FormErrorMessage>
              </FormControl>
              
              <FormControl id="password" isRequired isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    size="lg"
                    placeholder="Enter your password"
                    bg={inputBgColor}
                  />
                  <InputRightElement height="full">
                    <Button
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              
              <HStack justify="space-between">
                <Checkbox
                  colorScheme="blue"
                  isChecked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                >
                  Remember me
                </Checkbox>
                <Button variant="link" colorScheme="blue" size="sm">
                  Forgot password?
                </Button>
              </HStack>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
                loadingText="Signing in"
              >
                Sign in
              </Button>
            </Stack>
          </form>
          
          <Divider />
          
          <Text fontSize="sm" textAlign="center" color={textColor}>
            For development, you can use any username and password
          </Text>
        </VStack>
      </Box>
    </Center>
  );
};

export default Login;