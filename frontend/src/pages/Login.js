// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Center,
  Divider,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
  VStack,
  HStack,
  Checkbox,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  
  // Get redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
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
      // In a real app, this would make an API call
      // For this example, we'll simulate a successful login
      const success = await login(credentials);
      
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
  
  // Colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  
  return (
    <Center minH="100vh" bg={useColorModeValue('gray.50', 'gray.800')}>
      <Box
        w={{ base: '90%', md: '450px' }}
        bg={cardBg}
        boxShadow="lg"
        rounded="lg"
        p={8}
      >
        <VStack spacing={6} align="stretch">
          <VStack spacing={2} textAlign="center">
            <Heading size="xl">Pipeline Migration</Heading>
            <Text color={textColor}>Sign in to your account</Text>
          </VStack>
          
          {errors.login && (
            <Box p={3} bg="red.50" color="red.500" borderRadius="md">
              {errors.login}
            </Box>
          )}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="username" isRequired isInvalid={!!errors.username}>
                <FormLabel>Username</FormLabel>
                <Input
                  name="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleChange}
                  autoComplete="username"
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
                  />
                  <InputRightElement width="4.5rem">
                    <Button
                      h="1.75rem"
                      size="sm"
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
                <Link color="blue.500" fontSize="sm">
                  Forgot password?
                </Link>
              </HStack>
              
              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                isLoading={isLoading}
                loadingText="Signing in"
              >
                Sign in
              </Button>
            </Stack>
          </form>
          
          <Divider />
          
          <Text fontSize="sm" textAlign="center" color={textColor}>
            Need an account? Contact your system administrator
          </Text>
        </VStack>
      </Box>
    </Center>
  );
};

export default Login;
