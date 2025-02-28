// src/components/JobsList.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  Spinner,
  HStack,
  useToast,
  Link,
} from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  RepeatIcon, 
  ChevronRightIcon,
  CloseIcon 
} from '@chakra-ui/icons';

import apiService from '../services/api';

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

// Status badge component
const JobStatusBadge = ({ status }) => {
  let color;
  
  switch (status) {
    case 'completed':
      color = 'green';
      break;
    case 'running':
      color = 'blue';
      break;
    case 'pending':
      color = 'yellow';
      break;
    case 'failed':
      color = 'red';
      break;
    case 'cancelled':
      color = 'gray';
      break;
    default:
      color = 'gray';
  }
  
  return <Badge colorScheme={color}>{status}</Badge>;
};

const JobsList = ({ pipelineId }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  
  // Get jobs
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery(
    ['pipeline-jobs', pipelineId],
    () => apiService.pipelines.getJobs(pipelineId),
    {
      refetchInterval: 10000, // Refresh every 10 seconds
    }
  );
  
  // Retry job mutation
  const retryMutation = useMutation(
    (jobId) => apiService.jobs.retry(jobId),
    {
      onSuccess: (data) => {
        toast({
          title: 'Job Retry Started',
          description: `Job ID: ${data.data?.job_id || 'Unknown'}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        queryClient.invalidateQueries(['pipeline-jobs', pipelineId]);
      },
      onError: (err) => {
        toast({
          title: 'Failed to Retry Job',
          description: err.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );
  
  // Cancel job mutation
  const cancelMutation = useMutation(
    (jobId) => apiService.jobs.cancel(jobId),
    {
      onSuccess: () => {
        toast({
          title: 'Job Cancelled',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries(['pipeline-jobs', pipelineId]);
      },
      onError: (err) => {
        toast({
          title: 'Failed to Cancel Job',
          description: err.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );
  
  // Handle retry job
  const handleRetryJob = (jobId) => {
    retryMutation.mutate(jobId);
  };
  
  // Handle cancel job
  const handleCancelJob = (jobId) => {
    if (window.confirm('Are you sure you want to cancel this job?')) {
      cancelMutation.mutate(jobId);
    }
  };
  
  if (isLoading) {
    return (
      <Flex justify="center" align="center" p={10}>
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  if (isError) {
    return (
      <Box p={4}>
        <Text color="red.500">Error loading jobs: {error.message}</Text>
        <Button mt={2} onClick={refetch} size="sm">Try Again</Button>
      </Box>
    );
  }
  
  // Ensure jobs is always an array before using array methods
  const jobs = Array.isArray(data?.data) ? data.data : [];
  
  return (
    <Box>
      <Flex justify="flex-end" mb={4}>
        <Button
          leftIcon={<RepeatIcon />}
          size="sm"
          onClick={refetch}
          colorScheme="blue"
          variant="outline"
        >
          Refresh
        </Button>
      </Flex>
      
      {jobs.length === 0 ? (
        <Flex 
          justify="center" 
          align="center" 
          p={10} 
          border="1px dashed"
          borderColor="gray.200"
          borderRadius="md"
        >
          <Text color="gray.500">No jobs have been executed for this pipeline yet.</Text>
        </Flex>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Job ID</Th>
                <Th>Status</Th>
                <Th>Started</Th>
                <Th>Completed</Th>
                <Th>Duration</Th>
                <Th>Records</Th>
                <Th>Errors</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {jobs.map((job) => (
                <Tr key={job.id}>
                  <Td>
                    <Link 
                      color="blue.500" 
                      fontFamily="mono" 
                      fontSize="sm"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      cursor="pointer"
                    >
                      {job.id.split('-')[0]}...
                    </Link>
                  </Td>
                  <Td>
                    <JobStatusBadge status={job.status} />
                  </Td>
                  <Td fontSize="sm">{formatDate(job.started_at)}</Td>
                  <Td fontSize="sm">{formatDate(job.completed_at)}</Td>
                  <Td>{formatDuration(job.duration)}</Td>
                  <Td>
                    <HStack spacing={1}>
                      <Text>{job.source_record_count || 0}</Text>
                      <Text color="gray.500">→</Text>
                      <Text>{job.destination_record_count || 0}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    {job.error_count > 0 ? (
                      <Badge colorScheme="red">{job.error_count}</Badge>
                    ) : (
                      <Text>0</Text>
                    )}
                  </Td>
                  <Td>
                    <Menu>
                      <Tooltip label="Actions">
                        <MenuButton
                          as={IconButton}
                          icon={<ChevronDownIcon />}
                          variant="ghost"
                          size="sm"
                        />
                      </Tooltip>
                      <MenuList>
                        <MenuItem
                          icon={<ChevronRightIcon />}
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          View Details
                        </MenuItem>
                        
                        {job.status === 'failed' && (
                          <MenuItem
                            icon={<RepeatIcon />}
                            onClick={() => handleRetryJob(job.id)}
                            isDisabled={retryMutation.isLoading}
                          >
                            Retry Job
                          </MenuItem>
                        )}
                        
                        {(job.status === 'pending' || job.status === 'running') && (
                          <MenuItem
                            icon={<CloseIcon />}
                            onClick={() => handleCancelJob(job.id)}
                            isDisabled={cancelMutation.isLoading}
                          >
                            Cancel Job
                          </MenuItem>
                        )}
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default JobsList;