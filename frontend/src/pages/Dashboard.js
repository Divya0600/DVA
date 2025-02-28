// src/pages/Dashboard.js - Redesigned to match the mockup
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Image,
  Stack,
  VStack,
  HStack,
  Card,
  CardBody,
  SimpleGrid,
  Icon,
  Spinner,
  useColorModeValue,
} from '@chakra-ui/react';
import { AddIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { FaDatabase, FaArrowRight } from 'react-icons/fa';

import apiService from '../services/api';

const Dashboard = () => {
  // Get recent pipelines
  const {
    data: pipelinesData,
    isLoading: pipelinesLoading,
  } = useQuery(['pipelines-recent'], () => apiService.pipelines.getAll({ limit: 5 }), {
    staleTime: 30000,
  });

  // Background colors
  const cardBg = useColorModeValue('white', 'gray.700');
  const primaryColor = useColorModeValue('blue.500', 'blue.300');
  const secondaryColor = useColorModeValue('green.500', 'green.300');
  
  // Ensure data is an array before using array methods
  const pipelines = Array.isArray(pipelinesData?.data) ? pipelinesData.data : [];

  return (
    <Box>
      {/* Main Hero Section */}
      <Card mb={8} borderRadius="lg" overflow="hidden" boxShadow="md">
        <CardBody p={0}>
          <Flex direction={{ base: 'column', md: 'row' }} align="center">
            <Box p={8} flex="1">
              <Heading size="lg" mb={4}>
                Move your data from any Source to Destination in Near Real-Time
              </Heading>
              <Text color="gray.600" mb={6}>
                Get data in your Destinations in near real-time, easily manage schema drift with Auto Mapping, 
                apply transformations and track progress.
              </Text>
              <Button
                as={RouterLink}
                to="/pipelines/create"
                colorScheme="blue"
                size="lg"
                leftIcon={<AddIcon />}
              >
                CREATE PIPELINE
              </Button>
            </Box>
            
            <Flex flex="1" justify="center" p={8}>
              <Box position="relative" width="100%" maxW="400px">
                {/* Source Icon */}
                <Box
                  position="relative"
                  bg="green.50"
                  p={6}
                  borderRadius="md"
                  boxShadow="md"
                  width="150px"
                  height="150px"
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Icon as={FaDatabase} boxSize="50px" color={primaryColor} />
                  <Text mt={2} fontWeight="bold" textAlign="center">SOURCE</Text>
                </Box>
                
                {/* Arrow */}
                <Flex 
                  position="absolute" 
                  top="60px" 
                  left="180px" 
                  zIndex="2"
                  align="center"
                >
                  <Box height="2px" width="80px" bg="blue.400" />
                  <Icon as={FaArrowRight} color="blue.500" boxSize="24px" />
                </Flex>
                
                {/* Destination Icon */}
                <Box
                  position="absolute"
                  top="0"
                  right="0"
                  bg="blue.50"
                  p={6}
                  borderRadius="md"
                  boxShadow="md"
                  width="150px"
                  height="150px"
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Icon as={FaDatabase} boxSize="50px" color={secondaryColor} />
                  <Text mt={2} fontWeight="bold" textAlign="center">DESTINATION</Text>
                </Box>
              </Box>
            </Flex>
          </Flex>
        </CardBody>
      </Card>
      
      {/* Recent Pipelines Section */}
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Recent Pipelines</Heading>
          <Button
            as={RouterLink}
            to="/pipelines"
            variant="ghost"
            rightIcon={<ExternalLinkIcon />}
            size="sm"
          >
            View All
          </Button>
        </Flex>
        
        {pipelinesLoading ? (
          <Flex justify="center" py={10}>
            <Spinner size="xl" />
          </Flex>
        ) : pipelines.length === 0 ? (
          <Card variant="outline">
            <CardBody textAlign="center" py={10}>
              <Text mb={4}>You haven't created any pipelines yet.</Text>
              <Button
                as={RouterLink}
                to="/pipelines/create"
                colorScheme="blue"
                leftIcon={<AddIcon />}
              >
                Create Your First Pipeline
              </Button>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {pipelines.slice(0, 3).map((pipeline) => (
              <Card key={pipeline.id} boxShadow="sm" variant="outline">
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <Heading size="sm">{pipeline.name}</Heading>
                    <HStack>
                      <Box 
                        bg="green.50" 
                        p={2} 
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                      >
                        <Text fontWeight="medium" fontSize="sm">{pipeline.source_type}</Text>
                      </Box>
                      <Icon as={FaArrowRight} color="gray.300" />
                      <Box 
                        bg="blue.50" 
                        p={2} 
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                      >
                        <Text fontWeight="medium" fontSize="sm">{pipeline.destination_type}</Text>
                      </Box>
                    </HStack>
                    <Button 
                      as={RouterLink}
                      to={`/pipelines/${pipeline.id}`}
                      variant="outline"
                      size="sm"
                      width="full"
                    >
                      View Pipeline
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>
      
      {/* Getting Started Section */}
      <Card mb={8}>
        <CardBody>
          <Heading size="md" mb={4}>Getting Started</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <Card variant="outline">
              <CardBody>
                <VStack spacing={3} align="start">
                  <Heading size="sm">1. Set Up Sources</Heading>
                  <Text fontSize="sm">Configure connections to your data sources</Text>
                  <Button 
                    as={RouterLink}
                    to="/sources"
                    variant="outline"
                    size="sm"
                    rightIcon={<ExternalLinkIcon />}
                  >
                    Explore Sources
                  </Button>
                </VStack>
              </CardBody>
            </Card>
            
            <Card variant="outline">
              <CardBody>
                <VStack spacing={3} align="start">
                  <Heading size="sm">2. Set Up Destinations</Heading>
                  <Text fontSize="sm">Configure where you want to send your data</Text>
                  <Button 
                    as={RouterLink}
                    to="/destinations"
                    variant="outline"
                    size="sm"
                    rightIcon={<ExternalLinkIcon />}
                  >
                    Explore Destinations
                  </Button>
                </VStack>
              </CardBody>
            </Card>
            
            <Card variant="outline">
              <CardBody>
                <VStack spacing={3} align="start">
                  <Heading size="sm">3. Create Pipeline</Heading>
                  <Text fontSize="sm">Connect sources to destinations and start moving data</Text>
                  <Button 
                    as={RouterLink}
                    to="/pipelines/create"
                    colorScheme="blue"
                    size="sm"
                  >
                    Create Pipeline
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Dashboard;