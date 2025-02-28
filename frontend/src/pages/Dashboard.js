// src/pages/Dashboard.js
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Stack,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Icon,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import {
  AddIcon,
  ExternalLinkIcon,
  ArrowRightIcon,
  TimeIcon,
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
} from '@chakra-ui/icons';
import {
  FiActivity,
  FiDatabase,
  FiServer,
  FiPackage,
  FiArrowRight,
} from 'react-icons/fi';

import apiService from '../services/api';

// Status badge component
const StatusBadge = ({ status }) => {
  let color, icon;
  
  switch (status) {
    case 'active':
      color = 'green';
      icon = CheckCircleIcon;
      break;
    case 'inactive':
      color = 'gray';
      icon = InfoIcon;
      break;
    case 'error':
      color = 'red';
      icon = WarningIcon;
      break;
    default:
      color = 'gray';
      icon = InfoIcon;
  }
  
  return (
    <Badge colorScheme={color} display="flex" alignItems="center" px={2} py={1} borderRadius="full">
      <Box as={icon} mr={1} size="12px" />
      <Text>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
    </Badge>
  );
};

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const Dashboard = () => {
  // Get recent pipelines
  const {
    data: pipelinesData,
    isLoading: pipelinesLoading,
  } = useQuery(['pipelines-recent'], () => apiService.pipelines.getAll({ limit: 5 }), {
    staleTime: 30000,
  });

  // Get recent jobs
  const {
    data: jobsData,
    isLoading: jobsLoading,
  } = useQuery(['jobs-recent'], () => apiService.jobs.getAll({ limit: 5 }), {
    staleTime: 30000,
  });

  // Colors - MOVED ALL COLOR HOOKS TO TOP LEVEL
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconBgGreen = useColorModeValue('green.50', 'green.900');
  const iconBgBlue = useColorModeValue('blue.50', 'blue.900');
  const iconBgPurple = useColorModeValue('purple.50', 'purple.900');
  const iconBgOrange = useColorModeValue('orange.50', 'orange.900');
  const rowHoverBg = useColorModeValue('gray.50', 'gray.700');
  
  // Ensure data is arrays
  const pipelines = Array.isArray(pipelinesData?.data) ? pipelinesData.data : [];
  const jobs = Array.isArray(jobsData?.data) ? jobsData.data : [];
  
  // Calculate summary statistics
  const totalPipelines = pipelines.length;
  const activePipelines = pipelines.filter(p => p.status === 'active').length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const failedJobs = jobs.filter(j => j.status === 'failed').length;

  return (
    <Box>
      {/* Main Hero Section */}
      <Card mb={6} bg={cardBg} borderColor={borderColor} borderWidth="1px" boxShadow="sm">
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="space-between">
            <VStack align="start" spacing={3} mb={{ base: 6, md: 0 }} mr={{ md: 6 }}>
              <Heading size="lg">
                Pipeline Migration System
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Move data between any Source and Destination in Near Real-Time
              </Text>
              <Text color="gray.500">
                Configure adapters, transfer data, and monitor progress across various systems
              </Text>
              <Button
                as={RouterLink}
                to="/pipelines/create"
                colorScheme="blue"
                size="md"
                mt={2}
                leftIcon={<AddIcon />}
              >
                Create Pipeline
              </Button>
            </VStack>
            
            <Box flex={{ md: '1' }} w={{ base: '100%', md: 'auto' }}>
              <SimpleGrid columns={{ base: 2 }} spacing={4} width="100%">
                <Stat bg={iconBgGreen} p={4} borderRadius="lg">
                  <Flex align="center" mb={2}>
                    <Icon as={FiActivity} color="green.500" boxSize={5} mr={2} />
                    <StatLabel>Active Pipelines</StatLabel>
                  </Flex>
                  <StatNumber>{activePipelines}</StatNumber>
                  <StatHelpText>Ready to transfer data</StatHelpText>
                </Stat>
                
                <Stat bg={iconBgBlue} p={4} borderRadius="lg">
                  <Flex align="center" mb={2}>
                    <Icon as={FiPackage} color="blue.500" boxSize={5} mr={2} />
                    <StatLabel>Recent Jobs</StatLabel>
                  </Flex>
                  <StatNumber>{jobs.length}</StatNumber>
                  <StatHelpText>{completedJobs} completed, {failedJobs} failed</StatHelpText>
                </Stat>
              </SimpleGrid>
            </Box>
          </Flex>
        </CardBody>
      </Card>
      
      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={6} mb={8}>
        <Card bg={cardBg} boxShadow="sm">
          <CardBody>
            <Flex align="center">
              <Flex
                w="12"
                h="12"
                align="center"
                justify="center"
                borderRadius="full"
                bg={iconBgGreen}
                mr={4}
              >
                <Icon as={FiActivity} boxSize={6} color="green.500" />
              </Flex>
              <Box>
                <Text color="gray.500" fontSize="sm">Total Pipelines</Text>
                <Text fontSize="2xl" fontWeight="bold">{totalPipelines}</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} boxShadow="sm">
          <CardBody>
            <Flex align="center">
              <Flex
                w="12"
                h="12"
                align="center"
                justify="center"
                borderRadius="full"
                bg={iconBgBlue}
                mr={4}
              >
                <Icon as={FiPackage} boxSize={6} color="blue.500" />
              </Flex>
              <Box>
                <Text color="gray.500" fontSize="sm">Total Jobs</Text>
                <Text fontSize="2xl" fontWeight="bold">{jobs.length}</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} boxShadow="sm">
          <CardBody>
            <Flex align="center">
              <Flex
                w="12"
                h="12"
                align="center"
                justify="center"
                borderRadius="full"
                bg={iconBgPurple}
                mr={4}
              >
                <Icon as={FiDatabase} boxSize={6} color="purple.500" />
              </Flex>
              <Box>
                <Text color="gray.500" fontSize="sm">Sources</Text>
                <Text fontSize="2xl" fontWeight="bold">6</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
        
        <Card bg={cardBg} boxShadow="sm">
          <CardBody>
            <Flex align="center">
              <Flex
                w="12"
                h="12"
                align="center"
                justify="center"
                borderRadius="full"
                bg={iconBgOrange}
                mr={4}
              >
                <Icon as={FiServer} boxSize={6} color="orange.500" />
              </Flex>
              <Box>
                <Text color="gray.500" fontSize="sm">Destinations</Text>
                <Text fontSize="2xl" fontWeight="bold">6</Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Recent Pipelines */}
      <Card mb={8} bg={cardBg} boxShadow="sm">
        <CardHeader>
          <Flex justify="space-between" align="center">
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
        </CardHeader>
        <CardBody p={0}>
          {pipelinesLoading ? (
            <Flex justify="center" py={8}>
              <Spinner size="lg" />
            </Flex>
          ) : pipelines.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text mb={4}>No pipelines created yet</Text>
              <Button
                as={RouterLink}
                to="/pipelines/create"
                colorScheme="blue"
                leftIcon={<AddIcon />}
              >
                Create Your First Pipeline
              </Button>
            </Box>
          ) : (
            <Box>
              {pipelines.slice(0, 5).map((pipeline, index) => (
                <React.Fragment key={pipeline.id}>
                  {index > 0 && <Divider />}
                  <Flex 
                    p={4} 
                    align="center" 
                    justify="space-between"
                    _hover={{ bg: rowHoverBg }}
                  >
                    <Flex align="center">
                      <Box mr={4}>
                        <StatusBadge status={pipeline.status} />
                      </Box>
                      <Box>
                        <Text fontWeight="medium">{pipeline.name}</Text>
                        <Flex align="center" fontSize="sm" color="gray.500">
                          <Text>{pipeline.source_type}</Text>
                          <Icon as={FiArrowRight} mx={2} />
                          <Text>{pipeline.destination_type}</Text>
                        </Flex>
                      </Box>
                    </Flex>
                    <HStack>
                      <Text fontSize="sm" color="gray.500" mr={4}>
                        Last run: {formatDate(pipeline.last_run_at)}
                      </Text>
                      <Button
                        as={RouterLink}
                        to={`/pipelines/${pipeline.id}`}
                        size="sm"
                        variant="outline"
                        rightIcon={<ArrowRightIcon />}
                      >
                        View
                      </Button>
                    </HStack>
                  </Flex>
                </React.Fragment>
              ))}
            </Box>
          )}
        </CardBody>
      </Card>
      
      {/* Recent Jobs */}
      <Card mb={8} bg={cardBg} boxShadow="sm">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Heading size="md">Recent Jobs</Heading>
            <Button
              as={RouterLink}
              to="/jobs"
              variant="ghost"
              rightIcon={<ExternalLinkIcon />}
              size="sm"
            >
              View All
            </Button>
          </Flex>
        </CardHeader>
        <CardBody p={0}>
          {jobsLoading ? (
            <Flex justify="center" py={8}>
              <Spinner size="lg" />
            </Flex>
          ) : jobs.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text>No jobs have been executed yet</Text>
            </Box>
          ) : (
            <Box>
              {jobs.slice(0, 5).map((job, index) => (
                <React.Fragment key={job.id}>
                  {index > 0 && <Divider />}
                  <Flex 
                    p={4} 
                    align="center" 
                    justify="space-between"
                    _hover={{ bg: rowHoverBg }}
                  >
                    <HStack spacing={4}>
                      <Box>
                        <Badge colorScheme={
                          job.status === 'completed' ? 'green' :
                          job.status === 'running' ? 'blue' :
                          job.status === 'failed' ? 'red' :
                          'gray'
                        }>
                          {job.status}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontWeight="medium">{job.pipeline_name}</Text>
                        <Text fontSize="sm" color="gray.500">
                          Started: {formatDate(job.started_at)}
                        </Text>
                      </Box>
                    </HStack>
                    <HStack>
                      <Button
                        as={RouterLink}
                        to={`/jobs/${job.id}`}
                        size="sm"
                        variant="outline"
                        rightIcon={<ArrowRightIcon />}
                      >
                        Details
                      </Button>
                    </HStack>
                  </Flex>
                </React.Fragment>
              ))}
            </Box>
          )}
        </CardBody>
      </Card>
      
      {/* Getting Started */}
      <Card mb={8} bg={cardBg} boxShadow="sm">
        <CardHeader>
          <Heading size="md">Getting Started</Heading>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <Card variant="outline">
              <CardBody>
                <VStack spacing={4} align="start">
                  <Flex
                    w="12"
                    h="12"
                    align="center"
                    justify="center"
                    borderRadius="full"
                    bg={iconBgGreen}
                  >
                    <Icon as={FiDatabase} boxSize={6} color="green.500" />
                  </Flex>
                  <Heading size="sm">1. Configure Source</Heading>
                  <Text fontSize="sm">Set up connections to your data sources</Text>
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
                <VStack spacing={4} align="start">
                  <Flex
                    w="12"
                    h="12"
                    align="center"
                    justify="center"
                    borderRadius="full"
                    bg={iconBgBlue}
                  >
                    <Icon as={FiServer} boxSize={6} color="blue.500" />
                  </Flex>
                  <Heading size="sm">2. Configure Destinations</Heading>
                  <Text fontSize="sm">Set up where you want to send your data</Text>
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
                <VStack spacing={4} align="start">
                  <Flex
                    w="12"
                    h="12"
                    align="center"
                    justify="center"
                    borderRadius="full"
                    bg={iconBgOrange}
                  >
                    <Icon as={FiActivity} boxSize={6} color="orange.500" />
                  </Flex>
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