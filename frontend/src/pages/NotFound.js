// src/pages/NotFound.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

const NotFound = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={bgColor}
      p={4}
    >
      <Center>
        <VStack spacing={8} textAlign="center">
          <Heading size="4xl" color="blue.500">404</Heading>
          
          <VStack spacing={2}>
            <Heading size="xl">Page Not Found</Heading>
            <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
              The page you are looking for doesn't exist or has been moved.
            </Text>
          </VStack>
          
          <Box>
            <Button
              as={RouterLink}
              to="/dashboard"
              leftIcon={<ArrowBackIcon />}
              colorScheme="blue"
              size="lg"
            >
              Back to Dashboard
            </Button>
          </Box>
        </VStack>
      </Center>
    </Flex>
  );
};

export default NotFound;
