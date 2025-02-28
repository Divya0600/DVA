// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { 
  Center, 
  Spinner, 
  Text, 
  VStack, 
  Box,
  useColorModeValue 
} from '@chakra-ui/react';

import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute component that enforces authentication
 * Redirects to login if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const spinnerColor = useColorModeValue('blue.500', 'blue.300');
  
  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <Center h="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
        <Box 
          p={8} 
          borderRadius="lg" 
          bg={bgColor}
          boxShadow="lg"
          textAlign="center"
        >
          <VStack spacing={6}>
            <Spinner 
              size="xl" 
              color={spinnerColor} 
              thickness="4px" 
              speed="0.65s"
              emptyColor={useColorModeValue('gray.200', 'gray.700')}
            />
            <Text fontSize="lg">Authenticating...</Text>
          </VStack>
        </Box>
      </Center>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted location for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Render children if authenticated
  return children;
};

export default ProtectedRoute;