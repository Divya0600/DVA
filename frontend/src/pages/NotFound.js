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
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg={bgColor}
      p={4}
    >
      <Center>
        <Box
          bg={cardBgColor}
          p={12}
          borderRadius="xl"
          boxShadow="lg"
          maxW="md"
          textAlign="center"
        >
          <VStack spacing={8}>
            <Icon as={FiAlertTriangle} boxSize={20} color="orange.500" />
            
            <VStack spacing={3}>
              <Heading size="2xl" color="orange.500">404</Heading>
              <Heading size="xl">Page Not Found</Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')}>
                The page you are looking for doesn't exist or has been moved.
              </Text>
            </VStack>
            
            <Button
              as={RouterLink}
              to="/dashboard"
              leftIcon={<ArrowBackIcon />}
              colorScheme="blue"
              size="lg"
              w="full"
            >
              Back to Dashboard
            </Button>
          </VStack>
        </Box>
      </Center>
    </Flex>
  );
};

export default NotFound;