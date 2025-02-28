// src/pages/JobDetail.js - Fixed data access patterns
import React, { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Link,
  List,
  ListItem,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tag,
  Text,
  useToast,
  Spinner,
  Badge,
  Code,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { 
  ChevronRightIcon, 
  TimeIcon, 
  RepeatIcon,
  WarningIcon,
  InfoIcon,
  CheckCircleIcon,
  TimeIcon as ClockIcon,
  CloseIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import { FiActivity, FiAlertCircle, FiCheck, FiFileText, FiPieChart } from 'react-icons/fi';

import apiService from '../services/api';
import JsonViewer from '../components/JsonViewer';

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString();
};

// Helper to format duration
const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '-';
  
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  return `${minutes}m ${remainingSeconds}s`;
};

// Status badge component with appropriate icon
const JobStatusBadge = ({ status }) => {
  let color, icon;
  
  switch (status) {
    case 'completed':
      color = 'green';
      icon = CheckCircleIcon;
      break;
    case 'running':
      color = 'blue';
      icon = ClockIcon;
      break;
    case 'pending':
      color = 'yellow';
      icon = InfoIcon;
      break;
    case 'failed':
      color = 'red';
      icon = WarningIcon;
      break;
    case 'cancelled':
      color = 'gray';
      icon = CloseIcon;
      break;
    default:
      color = 'gray';
      icon = InfoIcon;
  }
  
  return (
    <Badge colorScheme={color} px={2} py={1} borderRadius="md">
      <HStack spacing={1}>
        <Icon as={icon} w={3} h={3} />
        <Text>{status.charAt(0).toUpperCase() + status.slice(1)}</Text>
      </HStack>
    </Badge>
  );
};

// Log level badge
const LogLevelBadge = ({ level }) => {
  let color;
  
  switch (level) {
    case 'info':
      color = 'blue';
      break;
    case 'warning':
      color = 'yellow';
      break;
    case 'error':
      color = 'red';
      break;
    case 'debug':
      color = 'purple';
      break;
    default:
      color = 'gray';
  }
  
  return (
    <Badge colorScheme={color} variant="subtle" fontSize="xs">
      {level.toUpperCase()}
    </Badge>
  );
};

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  
  // Fetch job details including logs
  const {
    data: jobResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ['job', jobId],
    () => apiService.jobs.get(jobId),
    {
      refetchInterval: activeTab === 0 && ['running', 'pending'].includes(jobResponse?.data?.status) ? 5000 : false,
    }
  );
  
  // Get job status
  const {
    data: statusResponse,
    isLoading: statusLoading,
    refetch: refetchStatus,
  } = useQuery(
    ['job-status', jobId],
    () => apiService.jobs.getStatus(jobId),
    {
      refetchInterval: ['running', 'pending'].includes(jobResponse?.data?.status) ? 5000 : false,
      enabled: !!jobResponse,
    }
  );
  
  // Retry job mutation
  const retryMutation = useMutation(
    () => apiService.jobs.retry(jobId),
    {
      onSuccess: (data) => {
        toast({
          title: 'Job Retry Started',
          description: `Job ID: ${data.data.job_id}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        queryClient.invalidateQueries(['job', jobId]);
        queryClient.invalidateQueries(['job-status', jobId]);
        queryClient.invalidateQueries(['jobs']);
        queryClient.invalidateQueries(['pipeline-jobs']);
      },
      onError: (err) => {
        toast({
          title: 'Failed to Retry Job',
          description: err.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );
  
  // Cancel job mutation
  const cancelMutation = useMutation(
    () => apiService.jobs.cancel(jobId),
    {
      onSuccess: () => {
        toast({
          title: 'Job Cancelled',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries(['job', jobId]);
        queryClient.invalidateQueries(['job-status', jobId]);
        queryClient.invalidateQueries(['jobs']);
        queryClient.invalidateQueries(['pipeline-jobs']);
      },
      onError: (err) => {
        toast({
          title: 'Failed to Cancel Job',
          description: err.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );
  
  // Handle retry job
  const handleRetry = () => {
    if (window.confirm('Are you sure you want to retry this job?')) {
      retryMutation.mutate();
    }
  };
  
  // Handle cancel job
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this job?')) {
      cancelMutation.mutate();
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    refetch();
    refetchStatus();
  };
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  if (isError) {
    return (
      <Box p={4}>
        <Heading size="md" color="red.500">Error loading job</Heading>
        <Text>{error.message}</Text>
        <Button mt={4} onClick={refetch}>Try Again</Button>
      </Box>
    );
  }
  
  // FIXED: Fixed job data access
  const job = jobResponse?.data;
  // FIXED: Fixed task status data access
  const taskStatus = statusResponse?.data?.task;
  
  if (!job) {
    return (
      <Box p={4}>
        <Heading size="md">Job not found</Heading>
        <Button as={RouterLink} to="/jobs" mt={4} leftIcon={<ChevronRightIcon />}>
          Back to Jobs
        </Button>
      </Box>
    );
  }
  
  // Format times for display
  const startTime = formatDate(job.started_at);
  const endTime = formatDate(job.completed_at);
  const duration = formatDuration(job.duration);
  
  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack>
          <Heading size="lg">Job Detail</Heading>
          <JobStatusBadge status={job.status} />
        </HStack>
        
        <HStack spacing={3}>
          <Button
            leftIcon={<RepeatIcon />}
            variant="outline"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
          
          {job.status === 'failed' && (
            <Button
              leftIcon={<RepeatIcon />}
              colorScheme="blue"
              onClick={handleRetry}
              isLoading={retryMutation.isLoading}
            >
              Retry Job
            </Button>
          )}
          
          {(job.status === 'pending' || job.status === 'running') && (
            <Button
              leftIcon={<CloseIcon />}
              colorScheme="red"
              onClick={handleCancel}
              isLoading={cancelMutation.isLoading}
            >
              Cancel Job
            </Button>
          )}
          
          <Button
            as={RouterLink}
            to={`/pipelines/${job.pipeline}`}
            colorScheme="blue"
            variant="outline"
            rightIcon={<ExternalLinkIcon />}
          >
            View Pipeline
          </Button>
        </HStack>
      </Flex>
      
      {/* Job Overview */}
      <Card mb={6}>
        <CardBody>
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
            <GridItem>
              <VStack align="start" spacing={1}>
                <Text color="gray.500" fontSize="sm">Pipeline</Text>
                <Link
                  as={RouterLink}
                  to={`/pipelines/${job.pipeline}`}
                  fontWeight="bold"
                  fontSize="lg"
                  color="blue.500"
                >
                  {job.pipeline_name}
                </Link>
                <HStack>
                  <Text color="gray.500" fontSize="sm">Source:</Text>
                  <Text fontSize="sm">{job.pipeline_source_type}</Text>
                </HStack>
                <HStack>
                  <Text color="gray.500" fontSize="sm">Destination:</Text>
                  <Text fontSize="sm">{job.pipeline_destination_type}</Text>
                </HStack>
              </VStack>
            </GridItem>
            
            <GridItem>
              <VStack align="start" spacing={1}>
                <Text color="gray.500" fontSize="sm">Timing</Text>
                <HStack>
                  <Icon as={ClockIcon} color="blue.500" />
                  <Text fontWeight="bold" fontSize="lg">{duration}</Text>
                </HStack>
                <HStack>
                  <Text color="gray.500" fontSize="sm">Started:</Text>
                  <Text fontSize="sm">{startTime}</Text>
                </HStack>
                <HStack>
                  <Text color="gray.500" fontSize="sm">Completed:</Text>
                  <Text fontSize="sm">{endTime}</Text>
                </HStack>
              </VStack>
            </GridItem>
            
            <GridItem>
              <VStack align="start" spacing={1}>
                <Text color="gray.500" fontSize="sm">Records</Text>
                <HStack>
                  <Text fontWeight="bold" fontSize="lg">
                    {job.source_record_count !== null ? job.source_record_count : '-'} → {job.destination_record_count !== null ? job.destination_record_count : '-'}
                  </Text>
                </HStack>
                <HStack>
                  <Text color="gray.500" fontSize="sm">Source Records:</Text>
                  <Text fontSize="sm">{job.source_record_count !== null ? job.source_record_count : '-'}</Text>
                </HStack>
                <HStack>
                  <Text color="gray.500" fontSize="sm">Destination Records:</Text>
                  <Text fontSize="sm">{job.destination_record_count !== null ? job.destination_record_count : '-'}</Text>
                </HStack>
                {job.error_count > 0 && (
                  <HStack>
                    <Text color="red.500" fontSize="sm">Errors:</Text>
                    <Text fontSize="sm" color="red.500">{job.error_count}</Text>
                  </HStack>
                )}
              </VStack>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
      
      {/* Tab Section */}
      <Tabs colorScheme="blue" onChange={(index) => setActiveTab(index)}>
        <TabList>
          <Tab>
            <HStack>
              <Icon as={FiActivity} />
              <Text>Logs</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <Icon as={FiAlertCircle} />
              <Text>Errors</Text>
              {job.error_count > 0 && (
                <Badge colorScheme="red" ml={1}>
                  {job.error_count}
                </Badge>
              )}
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <Icon as={FiPieChart} />
              <Text>Results</Text>
            </HStack>
          </Tab>
          <Tab>
            <HStack>
              <Icon as={FiFileText} />
              <Text>Details</Text>
            </HStack>
          </Tab>
        </TabList>
        
        <TabPanels>
          {/* Logs Tab */}
          <TabPanel p={4}>
            <HStack mb={4} justify="space-between">
              <Heading size="sm">Execution Logs</Heading>
              <Button size="sm" leftIcon={<RepeatIcon />} onClick={handleRefresh} variant="outline">
                Refresh Logs
              </Button>
            </HStack>
            
            <Box 
              borderWidth="1px" 
              borderRadius="md" 
              p={0} 
              maxHeight="500px" 
              overflowY="auto"
              fontFamily="mono"
              fontSize="sm"
            >
              {job.logs && job.logs.length > 0 ? (
                <Table variant="simple" size="sm">
                  <Thead position="sticky" top={0} bg="white" zIndex={1}>
                    <Tr>
                      <Th width="180px">Timestamp</Th>
                      <Th width="80px">Level</Th>
                      <Th>Message</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {job.logs.map((log, index) => (
                      <Tr key={index}>
                        <Td color="gray.500">
                          {new Date(log.timestamp).toLocaleString()}
                        </Td>
                        <Td>
                          <LogLevelBadge level={log.level} />
                        </Td>
                        <Td whiteSpace="pre-wrap">
                          {log.message}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Flex p={4} justify="center" align="center">
                  <Text color="gray.500">No logs available</Text>
                </Flex>
              )}
            </Box>
            
            {(job.status === 'running' || job.status === 'pending') && (
              <Box mt={4} p={2} bg="blue.50" borderRadius="md">
                <Text fontSize="sm" color="blue.600">
                  {job.status === 'running' ? 'Job is currently running. Logs will update automatically.' : 'Job is pending execution. Logs will appear when the job starts.'}
                </Text>
              </Box>
            )}
          </TabPanel>
          
          {/* Errors Tab */}
          <TabPanel p={4}>
            <HStack mb={4} justify="space-between">
              <Heading size="sm">Error Details</Heading>
              <Text color="gray.500">{job.error_count} errors</Text>
            </HStack>
            
            {job.errors && job.errors.length > 0 ? (
              <Accordion allowMultiple defaultIndex={[0]}>
                {job.errors.map((error, index) => (
                  <AccordionItem key={index}>
                    <h2>
                      <AccordionButton py={3}>
                        <Box flex="1" textAlign="left">
                          <HStack>
                            <Icon as={WarningIcon} color="red.500" />
                            <Text fontWeight="medium">{error.message}</Text>
                          </HStack>
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            {new Date(error.timestamp).toLocaleString()}
                          </Text>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      {error.details ? (
                        <Box 
                          bg="gray.50" 
                          p={3} 
                          borderRadius="md" 
                          fontFamily="mono" 
                          fontSize="sm"
                          overflowX="auto"
                        >
                          <JsonViewer data={error.details} />
                        </Box>
                      ) : (
                        <Text color="gray.500">No additional details available</Text>
                      )}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <Flex 
                p={10} 
                justify="center" 
                align="center" 
                borderWidth="1px" 
                borderRadius="md"
                borderStyle="dashed"
              >
                <VStack>
                  <Icon as={FiCheck} boxSize={10} color="green.500" />
                  <Text color="gray.600">No errors reported for this job</Text>
                </VStack>
              </Flex>
            )}
          </TabPanel>
          
          {/* Results Tab */}
          <TabPanel p={4}>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="sm">Source Data Summary</Heading>
                  </CardHeader>
                  <CardBody>
                    <Stack spacing={4}>
                      <Stat>
                        <StatLabel>Records Retrieved</StatLabel>
                        <StatNumber>{job.source_record_count !== null ? job.source_record_count : '-'}</StatNumber>
                        <StatHelpText>From {job.pipeline_source_type}</StatHelpText>
                      </Stat>
                      
                      {taskStatus && taskStatus.info && taskStatus.info.source_details && (
                        <Box>
                          <Text fontWeight="medium" mb={2}>Additional Details</Text>
                          <JsonViewer data={taskStatus.info.source_details} />
                        </Box>
                      )}
                    </Stack>
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="sm">Destination Data Summary</Heading>
                  </CardHeader>
                  <CardBody>
                    <Stack spacing={4}>
                      <Stat>
                        <StatLabel>Records Uploaded</StatLabel>
                        <StatNumber>{job.destination_record_count !== null ? job.destination_record_count : '-'}</StatNumber>
                        <StatHelpText>To {job.pipeline_destination_type}</StatHelpText>
                      </Stat>
                      
                      {taskStatus && taskStatus.info && taskStatus.info.destination_details && (
                        <Box>
                          <Text fontWeight="medium" mb={2}>Additional Details</Text>
                          <JsonViewer data={taskStatus.info.destination_details} />
                        </Box>
                      )}
                    </Stack>
                  </CardBody>
                </Card>
              </GridItem>
              
              {/* Success Rate Card */}
              <GridItem colSpan={{ md: 2 }}>
                <Card>
                  <CardHeader>
                    <Heading size="sm">Transfer Results</Heading>
                  </CardHeader>
                  <CardBody>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6}>
                      <GridItem>
                        <Stat>
                          <StatLabel>Success Rate</StatLabel>
                          <StatNumber>
                            {job.source_record_count && job.destination_record_count ? 
                              `${Math.round((job.destination_record_count / job.source_record_count) * 100)}%` : 
                              'N/A'}
                          </StatNumber>
                          <StatHelpText>
                            {job.error_count > 0 ? 
                              <Text color="red.500">{job.error_count} errors occurred</Text> : 
                              <Text color="green.500">No errors</Text>}
                          </StatHelpText>
                        </Stat>
                      </GridItem>
                      
                      <GridItem>
                        <Stat>
                          <StatLabel>Processing Time</StatLabel>
                          <StatNumber>{formatDuration(job.duration)}</StatNumber>
                          <StatHelpText>Total execution time</StatHelpText>
                        </Stat>
                      </GridItem>
                      
                      <GridItem>
                        <Stat>
                          <StatLabel>Status</StatLabel>
                          <Box mt={1}>
                            <JobStatusBadge status={job.status} />
                          </Box>
                          <StatHelpText>
                            {job.status === 'completed' ? 'Successfully completed' : 
                              job.status === 'failed' ? 'Failed with errors' :
                              job.status === 'running' ? 'Currently in progress' :
                              job.status === 'pending' ? 'Waiting to start' :
                              job.status === 'cancelled' ? 'Cancelled by user' : ''}
                          </StatHelpText>
                        </Stat>
                      </GridItem>
                    </Grid>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>
          
          {/* Details Tab */}
          <TabPanel p={4}>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="sm">Job Information</Heading>
                  </CardHeader>
                  <CardBody>
                    <Stack spacing={3} divider={<Divider />}>
                      <Flex justify="space-between">
                        <Text color="gray.600">Job ID</Text>
                        <Code>{job.id}</Code>
                      </Flex>
                      
                      <Flex justify="space-between">
                        <Text color="gray.600">Task ID</Text>
                        <Code>{job.task_id || 'None'}</Code>
                      </Flex>
                      
                      <Flex justify="space-between">
                        <Text color="gray.600">Pipeline</Text>
                        <Link 
                          as={RouterLink} 
                          to={`/pipelines/${job.pipeline}`}
                          color="blue.500"
                        >
                          {job.pipeline_name}
                        </Link>
                      </Flex>
                      
                      <Flex justify="space-between">
                        <Text color="gray.600">Created</Text>
                        <Text>{formatDate(job.created_at)}</Text>
                      </Flex>
                      
                      <Flex justify="space-between">
                        <Text color="gray.600">Started</Text>
                        <Text>{formatDate(job.started_at)}</Text>
                      </Flex>
                      
                      <Flex justify="space-between">
                        <Text color="gray.600">Completed</Text>
                        <Text>{formatDate(job.completed_at)}</Text>
                      </Flex>
                    </Stack>
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="sm">Task Status</Heading>
                  </CardHeader>
                  <CardBody>
                    {taskStatus ? (
                      <Stack spacing={3} divider={<Divider />}>
                        <Flex justify="space-between">
                          <Text color="gray.600">Task ID</Text>
                          <Code>{taskStatus.task_id || 'None'}</Code>
                        </Flex>
                        
                        <Flex justify="space-between">
                          <Text color="gray.600">State</Text>
                          <Badge colorScheme={
                            taskStatus.state === 'SUCCESS' ? 'green' :
                            taskStatus.state === 'FAILURE' ? 'red' :
                            taskStatus.state === 'PENDING' ? 'yellow' :
                            taskStatus.state === 'STARTED' ? 'blue' : 'gray'
                          }>
                            {taskStatus.state}
                          </Badge>
                        </Flex>
                        
                        {taskStatus.info && (
                          <Box>
                            <Text color="gray.600" mb={2}>Task Result</Text>
                            <Box bg="gray.50" p={3} borderRadius="md">
                              <JsonViewer data={taskStatus.info} />
                            </Box>
                          </Box>
                        )}
                      </Stack>
                    ) : (
                      <Text color="gray.500">No task status information available</Text>
                    )}
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default JobDetail;