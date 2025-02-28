// src/pages/JobList.js
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  Link,
  Spinner,
  useToast,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  FormControl,
  FormLabel,
  VStack,
} from '@chakra-ui/react';
import { 
  SearchIcon, 
  ChevronDownIcon, 
  RepeatIcon, 
  ChevronRightIcon,
  TimeIcon,
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
  CloseIcon,
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
      icon = TimeIcon;
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

const JobList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('-created_at'); // Default: newest first
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { isOpen, onOpen, onClose } = useDisclosure(); // For filter drawer
  
  // Get jobs with pagination and filters
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ['jobs', page, pageSize, searchQuery, statusFilter, pipelineFilter, sortOrder],
    () => apiService.jobs.getAll({
      page,
      page_size: pageSize,
      search: searchQuery,
      status: statusFilter,
      pipeline: pipelineFilter,
      ordering: sortOrder,
    }),
    {
      keepPreviousData: true,
    }
  );
  
  // Get pipelines for filter dropdown
  const {
    data: pipelinesData,
    isLoading: pipelinesLoading,
  } = useQuery(
    ['pipelines-minimal'],
    () => apiService.pipelines.getAll({ fields: 'id,name' }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
  
  // Handle clearing all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPipelineFilter('');
    setPage(1);
    onClose();
  };
  
  // Handle apply filters
  const handleApplyFilters = () => {
    setPage(1); // Reset to first page
    onClose();
  };
  
  // Get job details and navigate
  const handleViewJob = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };
  
  // Format column value based on field
  const formatColumnValue = (job, field) => {
    switch (field) {
      case 'id':
        return (
          <Link
            as={RouterLink}
            to={`/jobs/${job.id}`}
            color="blue.500"
            fontFamily="mono"
            fontSize="sm"
          >
            {job.id.split('-')[0]}...
          </Link>
        );
      case 'pipeline':
        return (
          <Link
            as={RouterLink}
            to={`/pipelines/${job.pipeline}`}
            color="blue.600"
            fontWeight="medium"
          >
            {job.pipeline_name}
          </Link>
        );
      case 'status':
        return <JobStatusBadge status={job.status} />;
      case 'started_at':
        return formatDate(job.started_at);
      case 'completed_at':
        return formatDate(job.completed_at);
      case 'duration':
        return formatDuration(job.duration);
      case 'records':
        return (
          job.source_record_count !== null ? (
            <HStack spacing={1}>
              <Text>{job.source_record_count}</Text>
              <Text color="gray.500">→</Text>
              <Text>{job.destination_record_count || 0}</Text>
            </HStack>
          ) : (
            <Text>-</Text>
          )
        );
      case 'errors':
        return (
          job.error_count > 0 ? (
            <Badge colorScheme="red">{job.error_count}</Badge>
          ) : (
            <Text>0</Text>
          )
        );
      default:
        return job[field];
    }
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
        <Heading size="md" color="red.500">Error loading jobs</Heading>
        <Text>{error.message}</Text>
        <Button mt={4} onClick={refetch}>Try Again</Button>
      </Box>
    );
  }
  
  // Extract jobs and pagination info - ensure jobs is always an array
  // FIXED: Correctly access the nested data structure
  const jobsData = data?.data?.data || [];
  const jobs = Array.isArray(jobsData) ? jobsData : [];
  const totalJobs = data?.data?.count || 0;
  const totalPages = Math.ceil(totalJobs / pageSize);
  
  // Ensure pipelines is always an array
  // FIXED: Correctly access the nested data structure
  const pipelinesDataList = pipelinesData?.data?.data || [];
  const pipelines = Array.isArray(pipelinesDataList) ? pipelinesDataList : [];
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Jobs</Heading>
        
        <HStack>
          <Button
            leftIcon={<RepeatIcon />}
            variant="outline"
            onClick={refetch}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>
      
      {/* Search and Filter Bar */}
      <Flex mb={6} justify="space-between" wrap="wrap" gap={4}>
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
        
        <HStack spacing={2}>
          <Button
            leftIcon={<SearchIcon />}
            onClick={onOpen}
            variant="outline"
          >
            Filters
            {(statusFilter || pipelineFilter) && (
              <Badge ml={2} colorScheme="blue" borderRadius="full">
                {(statusFilter ? 1 : 0) + (pipelineFilter ? 1 : 0)}
              </Badge>
            )}
          </Button>
          
          <Select
            w="180px"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="-created_at">Newest First</option>
            <option value="created_at">Oldest First</option>
            <option value="-started_at">Recently Started</option>
            <option value="duration">Shortest Duration</option>
            <option value="-duration">Longest Duration</option>
          </Select>
        </HStack>
      </Flex>
      
      {/* Jobs Table */}
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Job ID</Th>
              <Th>Pipeline</Th>
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
            {jobs.length === 0 ? (
              <Tr>
                <Td colSpan={9} textAlign="center" py={10}>
                  <Text color="gray.500">No jobs found</Text>
                </Td>
              </Tr>
            ) : (
              jobs.map((job) => (
                <Tr key={job.id} _hover={{ bg: "gray.50" }} cursor="pointer" onClick={() => handleViewJob(job.id)}>
                  <Td>{formatColumnValue(job, 'id')}</Td>
                  <Td>{formatColumnValue(job, 'pipeline')}</Td>
                  <Td>{formatColumnValue(job, 'status')}</Td>
                  <Td>{formatColumnValue(job, 'started_at')}</Td>
                  <Td>{formatColumnValue(job, 'completed_at')}</Td>
                  <Td>{formatColumnValue(job, 'duration')}</Td>
                  <Td>{formatColumnValue(job, 'records')}</Td>
                  <Td>{formatColumnValue(job, 'errors')}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        size="sm"
                        variant="ghost"
                      >
                        Actions
                      </MenuButton>
                      <MenuList>
                        <MenuItem
                          icon={<ChevronRightIcon />}
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          View Details
                        </MenuItem>
                        <MenuItem
                          icon={<ChevronRightIcon />}
                          onClick={() => navigate(`/pipelines/${job.pipeline}`)}
                        >
                          View Pipeline
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Flex justify="space-between" mt={6} align="center">
          <Text color="gray.600">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalJobs)} of {totalJobs} jobs
          </Text>
          
          <HStack>
            <Button
              size="sm"
              onClick={() => setPage(page - 1)}
              isDisabled={page === 1}
            >
              Previous
            </Button>
            
            <Select
              size="sm"
              width="auto"
              value={page}
              onChange={(e) => setPage(parseInt(e.target.value))}
            >
              {[...Array(totalPages)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Page {i + 1}
                </option>
              ))}
            </Select>
            
            <Button
              size="sm"
              onClick={() => setPage(page + 1)}
              isDisabled={page === totalPages}
            >
              Next
            </Button>
          </HStack>
          
          <Select
            size="sm"
            width="auto"
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value));
              setPage(1); // Reset to first page
            }}
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </Select>
        </Flex>
      )}
      
      {/* Filters Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Filter Jobs</DrawerHeader>
          
          <DrawerBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Status</FormLabel>
                <Select
                  placeholder="All Statuses"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="running">Running</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </FormControl>
              
              <FormControl>
                <FormLabel>Pipeline</FormLabel>
                <Select
                  placeholder="All Pipelines"
                  value={pipelineFilter}
                  onChange={(e) => setPipelineFilter(e.target.value)}
                  isDisabled={pipelinesLoading}
                >
                  <option value="">All Pipelines</option>
                  {pipelines.map((pipeline) => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </DrawerBody>
          
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={handleClearFilters}>
              Clear Filters
            </Button>
            <Button colorScheme="blue" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default JobList;