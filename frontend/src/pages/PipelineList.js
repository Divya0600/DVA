// src/pages/PipelineList.js
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  HStack,
  VStack,
  Tooltip,
  useToast,
  Spinner,
  Card,
  CardBody,
  useColorModeValue,
  Divider,
  Skeleton,
} from '@chakra-ui/react';
import { 
  AddIcon, 
  SearchIcon, 
  ChevronDownIcon, 
  RepeatIcon,
  SettingsIcon,
  CheckIcon,
  TimeIcon,
  WarningIcon,
  InfoIcon,
  ArrowRightIcon,
} from '@chakra-ui/icons';
import { FaFilter } from 'react-icons/fa';

import apiService from '../services/api';

// Status badge component
const StatusBadge = ({ status }) => {
  let color, icon;
  
  switch (status) {
    case 'active':
      color = 'green';
      icon = CheckIcon;
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
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const PipelineList = () => {
  const navigate = useNavigate();
  const toast = useToast();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Get pipelines data
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ['pipelines', searchQuery, statusFilter],
    () => apiService.pipelines.getAll({
      search: searchQuery,
      status: statusFilter,
    }),
    {
      keepPreviousData: true,
    }
  );
  
  // Execute pipeline function
  const handleExecutePipeline = async (pipelineId, e) => {
    e.stopPropagation(); // Prevent row click navigation
    
    try {
      await apiService.pipelines.execute(pipelineId);
      toast({
        title: 'Pipeline Started',
        description: 'The pipeline job has been initiated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetch();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to start pipeline',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle row click - navigate to pipeline details
  const handleRowClick = (pipelineId) => {
    navigate(`/pipelines/${pipelineId}`);
  };
  
  // Colors
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  
  // Ensure pipelines is always an array
  const pipelines = Array.isArray(data?.data) ? data.data : [];
  
  // Filter pipelines based on search query and status filter
  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesSearch = searchQuery === '' || 
      pipeline.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pipeline.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === '' || pipeline.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading size="lg">Pipelines</Heading>
          <Text color="gray.600">Move data between any Source and Destination</Text>
        </Box>
        
        <Button
          as={RouterLink}
          to="/pipelines/create"
          colorScheme="blue"
          leftIcon={<AddIcon />}
        >
          CREATE PIPELINE
        </Button>
      </Flex>
      
      {/* Filters */}
      <Flex
        mb={6}
        p={4}
        bg={cardBg}
        borderRadius="lg"
        boxShadow="sm"
        justifyContent="space-between"
        alignItems="center"
        borderWidth="1px"
        borderColor={borderColor}
        flexWrap={{ base: "wrap", md: "nowrap" }}
        gap={4}
      >
        {/* Search */}
        <InputGroup maxW={{ base: "100%", md: "320px" }} mb={{ base: 4, md: 0 }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search Pipelines"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg={useColorModeValue('gray.50', 'gray.800')}
          />
        </InputGroup>
        
        {/* Filters */}
        <HStack spacing={4}>
          <Menu closeOnSelect={false}>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              leftIcon={<FaFilter />}
              variant="outline"
            >
              FILTERS
            </MenuButton>
            <MenuList minWidth="240px">
              <Box px={4} py={2}>
                <Text fontWeight="medium" mb={2}>Status</Text>
                <HStack spacing={3}>
                  <Button
                    size="sm"
                    variant={statusFilter === '' ? 'solid' : 'outline'}
                    colorScheme="blue"
                    onClick={() => setStatusFilter('')}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === 'active' ? 'solid' : 'outline'}
                    colorScheme="green"
                    onClick={() => setStatusFilter('active')}
                  >
                    Active
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === 'inactive' ? 'solid' : 'outline'}
                    colorScheme="gray"
                    onClick={() => setStatusFilter('inactive')}
                  >
                    Inactive
                  </Button>
                </HStack>
              </Box>
            </MenuList>
          </Menu>
          
          <Button
            leftIcon={<RepeatIcon />}
            variant="ghost"
            onClick={refetch}
          >
            REFRESH
          </Button>
        </HStack>
      </Flex>
      
      {/* Loading state */}
      {isLoading && (
        <Card mb={6}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Skeleton height="40px" />
              <Divider />
              <Skeleton height="60px" />
              <Skeleton height="60px" />
              <Skeleton height="60px" />
            </VStack>
          </CardBody>
        </Card>
      )}
      
      {/* Error state */}
      {isError && (
        <Card bg="red.50" borderColor="red.200">
          <CardBody>
            <Heading size="md" color="red.500">Error loading pipelines</Heading>
            <Text mt={2}>{error.message}</Text>
            <Button mt={4} onClick={refetch} colorScheme="red" variant="outline">Try Again</Button>
          </CardBody>
        </Card>
      )}
      
      {/* Empty state */}
      {!isLoading && !isError && filteredPipelines.length === 0 && (
        <Card variant="outline" textAlign="center">
          <CardBody py={10}>
            <Heading size="md" mb={4}>No Pipelines Found</Heading>
            <Text mb={6}>
              {searchQuery || statusFilter ? 
                'No pipelines match your search criteria. Try adjusting your filters.' : 
                'Get started by creating your first pipeline'}
            </Text>
            <Button
              as={RouterLink}
              to="/pipelines/create"
              colorScheme="blue"
              leftIcon={<AddIcon />}
            >
              Create Pipeline
            </Button>
          </CardBody>
        </Card>
      )}
      
      {/* Pipelines Table */}
      {!isLoading && !isError && filteredPipelines.length > 0 && (
        <Box
          borderWidth="1px"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="sm"
          bg={cardBg}
        >
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg={useColorModeValue('gray.50', 'gray.800')}>
                <Tr>
                  <Th width="40px">#</Th>
                  <Th>Pipeline</Th>
                  <Th>Source</Th>
                  <Th>Destination</Th>
                  <Th>Status</Th>
                  <Th>Last Run</Th>
                  <Th width="100px">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPipelines.map((pipeline, index) => (
                  <Tr key={pipeline.id} 
                    _hover={{ bg: hoverBg }}
                    cursor="pointer"
                    onClick={() => handleRowClick(pipeline.id)}
                  >
                    <Td color="gray.500">{index + 1}</Td>
                    <Td>
                      <Text fontWeight="medium" color="blue.600">{pipeline.name}</Text>
                      {pipeline.schedule && (
                        <Text fontSize="xs" color="gray.500" display="flex" alignItems="center">
                          <TimeIcon mr={1} /> Runs every {pipeline.schedule}
                        </Text>
                      )}
                    </Td>
                    <Td>
                      <Badge variant="subtle" colorScheme="green">
                        {pipeline.source_type}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge variant="subtle" colorScheme="blue">
                        {pipeline.destination_type}
                      </Badge>
                    </Td>
                    <Td>
                      <StatusBadge status={pipeline.status} />
                    </Td>
                    <Td>
                      {pipeline.last_run_at ? formatDate(pipeline.last_run_at) : 'Never'}
                    </Td>
                    <Td onClick={(e) => e.stopPropagation()}>
                      <HStack spacing={2}>
                        <Tooltip label="Run Now">
                          <IconButton
                            icon={<ArrowRightIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            isDisabled={pipeline.status !== 'active'}
                            onClick={(e) => handleExecutePipeline(pipeline.id, e)}
                            aria-label="Run pipeline"
                          />
                        </Tooltip>
                        <Tooltip label="Settings">
                          <IconButton
                            icon={<SettingsIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/pipelines/${pipeline.id}/edit`);
                            }}
                            aria-label="Edit pipeline"
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PipelineList;