// src/pages/PipelineDetail.js
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
  IconButton,
  Tooltip,
  Skeleton,
} from '@chakra-ui/react';
import { 
  ChevronRightIcon, 
  TimeIcon, 
  RepeatIcon, 
  SettingsIcon,
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
  CloseIcon,
  EditIcon,
} from '@chakra-ui/icons';

import apiService from '../services/api';
import JobsList from '../components/JobsList';
import PipelineVisualizer from '../components/PipelineVisualizer';
import JsonViewer from '../components/JsonViewer';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString();
};

// Status badge component
const StatusBadge = ({ status }) => {
  let color, icon;
  
  // Add null/undefined check before accessing status
  const statusStr = status || 'unknown';
  
  switch (statusStr) {
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
    <Tag colorScheme={color} size="md">
      <HStack spacing={1}>
        <Icon as={icon} boxSize={3} />
        <Text>{statusStr.charAt(0).toUpperCase() + statusStr.slice(1)}</Text>
      </HStack>
    </Tag>
  );
};

const PipelineDetail = () => {
  const { pipelineId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  
  // Fetch pipeline details
  const {
    data: pipelineData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ['pipeline', pipelineId],
    () => apiService.pipelines.get(pipelineId),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  );
  
  // Execute pipeline mutation
  const executeMutation = useMutation(
    () => apiService.pipelines.execute(pipelineId),
    {
      onSuccess: (data) => {
        toast({
          title: 'Pipeline Started',
          description: `Job ID: ${data.data?.job_id || 'unknown'}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        queryClient.invalidateQueries(['pipeline', pipelineId]);
        queryClient.invalidateQueries(['pipeline-jobs', pipelineId]);
      },
      onError: (err) => {
        toast({
          title: 'Failed to Start Pipeline',
          description: err.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );
  
  // Toggle pipeline status mutation
  const toggleStatusMutation = useMutation(
    (newStatus) => apiService.pipelines.update(pipelineId, { status: newStatus }),
    {
      onSuccess: () => {
        toast({
          title: 'Pipeline Status Updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        queryClient.invalidateQueries(['pipeline', pipelineId]);
      },
      onError: (err) => {
        toast({
          title: 'Failed to Update Status',
          description: err.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );
  
  if (isLoading) {
    return (
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Skeleton height="40px" width="200px" />
          <HStack spacing={3}>
            <Skeleton height="40px" width="100px" />
            <Skeleton height="40px" width="100px" />
          </HStack>
        </Flex>
        
        <Card mb={6}>
          <CardBody>
            <Skeleton height="100px" />
          </CardBody>
        </Card>
        
        <Card mb={6}>
          <CardHeader>
            <Skeleton height="30px" width="150px" />
          </CardHeader>
          <CardBody>
            <Skeleton height="150px" />
          </CardBody>
        </Card>
      </Box>
    );
  }
  
  if (isError) {
    return (
      <Box p={4}>
        <Heading size="md" color="red.500">Error loading pipeline</Heading>
        <Text>{error?.message || "An error occurred while loading the pipeline"}</Text>
        <Button mt={4} onClick={refetch}>Try Again</Button>
      </Box>
    );
  }
  
  // Safely extract pipeline data from the response - if no data found, use an empty object with defaults
  const pipeline = pipelineData?.data || {
    name: 'Pipeline Not Found',
    status: 'error',
    source_type: 'unknown',
    destination_type: 'unknown',
    source_config: {},
    destination_config: {},
    transformation_config: {},
  };
  
  // Handle execute button click
  const handleExecute = () => {
    executeMutation.mutate();
  };
  
  // Handle toggle status
  const handleToggleStatus = () => {
    const newStatus = pipeline.status === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate(newStatus);
  };
  
  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack>
          <Heading size="lg">{pipeline.name}</Heading>
          <StatusBadge status={pipeline.status} />
        </HStack>
        
        <HStack spacing={3}>
          <Tooltip label="Edit Pipeline">
            <IconButton
              icon={<EditIcon />}
              variant="outline"
              onClick={() => navigate(`/pipelines/${pipelineId}/edit`)}
            />
          </Tooltip>
          
          <Button
            leftIcon={<RepeatIcon />}
            colorScheme="blue"
            onClick={handleExecute}
            isLoading={executeMutation.isLoading}
            isDisabled={pipeline.status !== 'active'}
          >
            Run Now
          </Button>
          
          <Button
            leftIcon={pipeline.status === 'active' ? <CloseIcon /> : <CheckCircleIcon />}
            colorScheme={pipeline.status === 'active' ? 'red' : 'green'}
            variant="outline"
            onClick={handleToggleStatus}
            isLoading={toggleStatusMutation.isLoading}
          >
            {pipeline.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </HStack>
      </Flex>
      
      {/* Overview Card */}
      <Card mb={6}>
        <CardBody>
          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            <GridItem>
              <Stat>
                <StatLabel>Source</StatLabel>
                <StatNumber>{(pipeline.source_type || 'Unknown').toUpperCase()}</StatNumber>
                <StatHelpText>Data retrieval</StatHelpText>
              </Stat>
            </GridItem>
            
            <GridItem>
              <Stat>
                <StatLabel>Destination</StatLabel>
                <StatNumber>{(pipeline.destination_type || 'Unknown').toUpperCase()}</StatNumber>
                <StatHelpText>Data upload</StatHelpText>
              </Stat>
            </GridItem>
            
            <GridItem>
              <Stat>
                <StatLabel>Last Run</StatLabel>
                <StatNumber>{pipeline.last_run_at ? formatDate(pipeline.last_run_at).split(',')[0] : 'Never'}</StatNumber>
                <StatHelpText>{pipeline.last_run_at ? formatDate(pipeline.last_run_at).split(',')[1] : ''}</StatHelpText>
              </Stat>
            </GridItem>
          </Grid>
        </CardBody>
      </Card>
      
      {/* Pipeline Visualization */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Pipeline Flow</Heading>
        </CardHeader>
        <CardBody>
          <PipelineVisualizer 
            sourceName={pipeline.source_type || 'Unknown'} 
            destinationName={pipeline.destination_type || 'Unknown'}
            status={pipeline.status || 'inactive'}
          />
        </CardBody>
      </Card>
      
      {/* Tabs Section */}
      <Tabs colorScheme="blue" onChange={(index) => setActiveTab(index)}>
        <TabList>
          <Tab>Recent Jobs</Tab>
          <Tab>Configuration</Tab>
          <Tab>Details</Tab>
        </TabList>
        
        <TabPanels>
          {/* Jobs Tab */}
          <TabPanel px={0}>
            <JobsList pipelineId={pipelineId} />
          </TabPanel>
          
          {/* Configuration Tab */}
          <TabPanel>
            <Grid templateColumns="repeat(2, 1fr)" gap={8}>
              <GridItem>
                <Card variant="outline">
                  <CardHeader>
                    <Heading size="md">Source Configuration ({(pipeline.source_type || 'Unknown')})</Heading>
                  </CardHeader>
                  <CardBody>
                    <JsonViewer data={pipeline.source_config || {}} />
                  </CardBody>
                </Card>
              </GridItem>
              
              <GridItem>
                <Card variant="outline">
                  <CardHeader>
                    <Heading size="md">Destination Configuration ({(pipeline.destination_type || 'Unknown')})</Heading>
                  </CardHeader>
                  <CardBody>
                    <JsonViewer data={pipeline.destination_config || {}} />
                  </CardBody>
                </Card>
              </GridItem>
              
              {(pipeline.transformation_config && Object.keys(pipeline.transformation_config).length > 0) && (
                <GridItem colSpan={2}>
                  <Card variant="outline">
                    <CardHeader>
                      <Heading size="md">Transformation Rules</Heading>
                    </CardHeader>
                    <CardBody>
                      <JsonViewer data={pipeline.transformation_config || {}} />
                    </CardBody>
                  </Card>
                </GridItem>
              )}
            </Grid>
          </TabPanel>
          
          {/* Details Tab */}
          <TabPanel>
            <Stack spacing={4}>
              <Card variant="outline">
                <CardHeader>
                  <Heading size="md">Pipeline Details</Heading>
                </CardHeader>
                <CardBody>
                  <Stack spacing={4}>
                    <Flex>
                      <Text fontWeight="bold" minWidth="200px">ID:</Text>
                      <Text>{pipeline.id || 'N/A'}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="bold" minWidth="200px">Name:</Text>
                      <Text>{pipeline.name || 'N/A'}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="bold" minWidth="200px">Description:</Text>
                      <Text>{pipeline.description || 'No description'}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="bold" minWidth="200px">Created:</Text>
                      <Text>{formatDate(pipeline.created_at)}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="bold" minWidth="200px">Last Updated:</Text>
                      <Text>{formatDate(pipeline.updated_at)}</Text>
                    </Flex>
                    <Flex>
                      <Text fontWeight="bold" minWidth="200px">Status:</Text>
                      <StatusBadge status={pipeline.status} />
                    </Flex>
                    <Flex>
                      <Text fontWeight="bold" minWidth="200px">Schedule:</Text>
                      <Text>{pipeline.schedule || 'Not scheduled (manual execution only)'}</Text>
                    </Flex>
                  </Stack>
                </CardBody>
              </Card>
              
              <Card variant="outline">
                <CardHeader>
                  <Heading size="md">Metrics</Heading>
                </CardHeader>
                <CardBody>
                  <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                    <GridItem>
                      <Stat>
                        <StatLabel>Total Jobs</StatLabel>
                        <StatNumber>{pipeline.job_count || 0}</StatNumber>
                      </Stat>
                    </GridItem>
                    <GridItem>
                      <Stat>
                        <StatLabel>Success Rate</StatLabel>
                        <StatNumber>
                          {pipeline.job_count && pipeline.success_count ? 
                            `${Math.round((pipeline.success_count / pipeline.job_count) * 100)}%` : 
                            'N/A'}
                        </StatNumber>
                      </Stat>
                    </GridItem>
                    <GridItem>
                      <Stat>
                        <StatLabel>Last Run Duration</StatLabel>
                        <StatNumber>
                          {pipeline.last_job_duration ? 
                            `${Math.round(pipeline.last_job_duration)}s` : 
                            'N/A'}
                        </StatNumber>
                      </Stat>
                    </GridItem>
                  </Grid>
                </CardBody>
              </Card>
            </Stack>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PipelineDetail;