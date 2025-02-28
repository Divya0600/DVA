// src/pages/PipelineEdit.js
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  IconButton,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Select,
  Switch,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  useToast,
  Spinner,
  Textarea,
  Divider,
} from '@chakra-ui/react';
import { ArrowBackIcon, CheckIcon } from '@chakra-ui/icons';

import apiService from '../services/api';
import JsonEditor from '../components/JsonEditor';

const PipelineEdit = () => {
  const { pipelineId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [errors, setErrors] = useState({});
  
  // Form state
  const [pipelineData, setPipelineData] = useState({
    name: '',
    description: '',
    source_type: '',
    source_config: {},
    destination_type: '',
    destination_config: {},
    schedule: '',
    transformation_config: {},
    status: 'inactive',
  });
  
  // Fetch pipeline data
  const { 
    data: pipelineResponse, 
    isLoading: pipelineLoading, 
    isError,
    error 
  } = useQuery(
    ['pipeline', pipelineId],
    () => apiService.pipelines.get(pipelineId),
    {
      onSuccess: (data) => {
        setPipelineData(data.data);
      },
      refetchOnWindowFocus: false,
    }
  );
  
  // Fetch adapter types
  const { data: adapterTypes, isLoading: typesLoading } = useQuery(
    ['adapterTypes'],
    () => apiService.pipelines.getTypes()
  );
  
  // Update pipeline mutation
  const updateMutation = useMutation(
    (data) => apiService.pipelines.update(pipelineId, data),
    {
      onSuccess: () => {
        toast({
          title: 'Pipeline Updated',
          description: 'The pipeline has been updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        queryClient.invalidateQueries(['pipeline', pipelineId]);
        queryClient.invalidateQueries(['pipelines']);
        navigate(`/pipelines/${pipelineId}`);
      },
      onError: (err) => {
        toast({
          title: 'Update Failed',
          description: err.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );
  
  // Handle form field changes
  const handleInputChange = (field, value) => {
    setPipelineData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // Handle JSON editor changes for configs
  const handleConfigChange = (field, config) => {
    setPipelineData((prev) => ({
      ...prev,
      [field]: config,
    }));
  };
  
  // Toggle pipeline status
  const handleStatusToggle = () => {
    setPipelineData((prev) => ({
      ...prev,
      status: prev.status === 'active' ? 'inactive' : 'active',
    }));
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!pipelineData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!pipelineData.source_type) {
      newErrors.source_type = 'Source type is required';
    }
    
    if (!pipelineData.destination_type) {
      newErrors.destination_type = 'Destination type is required';
    }
    
    // Source config validation (simplified - in a real app, this would be more extensive)
    if (Object.keys(pipelineData.source_config).length === 0) {
      newErrors.source_config = 'Source configuration is required';
    }
    
    // Destination config validation
    if (Object.keys(pipelineData.destination_config).length === 0) {
      newErrors.destination_config = 'Destination configuration is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      updateMutation.mutate(pipelineData);
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Loading state
  if (pipelineLoading || typesLoading) {
    return (
      <Flex justify="center" align="center" height="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <Box p={4}>
        <Heading size="md" color="red.500">Error loading pipeline</Heading>
        <Text>{error.message}</Text>
        <Button mt={4} onClick={() => navigate('/pipelines')}>Back to Pipelines</Button>
      </Box>
    );
  }
  
  // Get source and destination types
  const sourceTypes = adapterTypes?.data?.source_types || [];
  const destinationTypes = adapterTypes?.data?.destination_types || [];
  
  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Flex align="center" justify="space-between" mb={6}>
        <HStack>
          <IconButton
            icon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => navigate(`/pipelines/${pipelineId}`)}
            aria-label="Back to pipeline details"
          />
          <Heading size="lg">Edit Pipeline</Heading>
        </HStack>
        
        <HStack spacing={3}>
          <Button
            variant="outline"
            onClick={() => navigate(`/pipelines/${pipelineId}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            leftIcon={<CheckIcon />}
            isLoading={updateMutation.isLoading}
          >
            Save Changes
          </Button>
        </HStack>
      </Flex>
      
      {/* Basic Information */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Basic Information</Heading>
        </CardHeader>
        <CardBody>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
            <FormControl isRequired isInvalid={errors.name}>
              <FormLabel>Pipeline Name</FormLabel>
              <Input
                value={pipelineData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter pipeline name"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>
            
            <FormControl>
              <FormLabel>Schedule (Cron Expression)</FormLabel>
              <Input
                value={pipelineData.schedule || ''}
                onChange={(e) => handleInputChange('schedule', e.target.value)}
                placeholder="e.g. 0 0 * * * (daily at midnight)"
              />
              <FormHelperText>
                Optional: Define when this pipeline should run automatically
              </FormHelperText>
            </FormControl>
            
            <FormControl gridColumn={{ md: "span 2" }}>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={pipelineData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the purpose of this pipeline"
                rows={3}
              />
            </FormControl>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">Pipeline Status</FormLabel>
              <Switch
                isChecked={pipelineData.status === 'active'}
                onChange={handleStatusToggle}
                colorScheme="green"
              />
              <Text ml={2}>
                {pipelineData.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </FormControl>
          </Grid>
        </CardBody>
      </Card>
      
      {/* Configuration Tabs */}
      <Tabs colorScheme="blue" onChange={(index) => setActiveTab(index)}>
        <TabList>
          <Tab>Source Configuration</Tab>
          <Tab>Destination Configuration</Tab>
          <Tab>Advanced Settings</Tab>
        </TabList>
        
        <TabPanels>
          {/* Source Configuration Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <FormControl isRequired isInvalid={errors.source_type}>
                <FormLabel>Source Type</FormLabel>
                <Select
                  value={pipelineData.source_type}
                  onChange={(e) => handleInputChange('source_type', e.target.value)}
                  placeholder="Select source type"
                >
                  {sourceTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {type.description}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.source_type}</FormErrorMessage>
              </FormControl>
              
              <Box></Box>
              
              <FormControl gridColumn={{ md: "span 2" }} isInvalid={errors.source_config}>
                <FormLabel>Source Configuration</FormLabel>
                <JsonEditor
                  value={pipelineData.source_config}
                  onChange={(config) => handleConfigChange('source_config', config)}
                />
                <FormHelperText>
                  Configure authentication and other settings for the source
                </FormHelperText>
                <FormErrorMessage>{errors.source_config}</FormErrorMessage>
              </FormControl>
            </Grid>
          </TabPanel>
          
          {/* Destination Configuration Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <FormControl isRequired isInvalid={errors.destination_type}>
                <FormLabel>Destination Type</FormLabel>
                <Select
                  value={pipelineData.destination_type}
                  onChange={(e) => handleInputChange('destination_type', e.target.value)}
                  placeholder="Select destination type"
                >
                  {destinationTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} - {type.description}
                    </option>
                  ))}
                </Select>
                <FormErrorMessage>{errors.destination_type}</FormErrorMessage>
              </FormControl>
              
              <Box></Box>
              
              <FormControl gridColumn={{ md: "span 2" }} isInvalid={errors.destination_config}>
                <FormLabel>Destination Configuration</FormLabel>
                <JsonEditor
                  value={pipelineData.destination_config}
                  onChange={(config) => handleConfigChange('destination_config', config)}
                />
                <FormHelperText>
                  Configure authentication and other settings for the destination
                </FormHelperText>
                <FormErrorMessage>{errors.destination_config}</FormErrorMessage>
              </FormControl>
            </Grid>
          </TabPanel>
          
          {/* Advanced Settings Tab */}
          <TabPanel>
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <FormControl gridColumn={{ md: "span 2" }}>
                <FormLabel>Transformation Configuration</FormLabel>
                <JsonEditor
                  value={pipelineData.transformation_config || {}}
                  onChange={(config) => handleConfigChange('transformation_config', config)}
                />
                <FormHelperText>
                  Optional: Configure data transformations between source and destination
                </FormHelperText>
              </FormControl>
            </Grid>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Divider my={6} />
      
      {/* Form Buttons */}
      <Flex justify="flex-end" mt={6}>
        <HStack spacing={3}>
          <Button
            variant="outline"
            onClick={() => navigate(`/pipelines/${pipelineId}`)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            leftIcon={<CheckIcon />}
            isLoading={updateMutation.isLoading}
          >
            Save Changes
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default PipelineEdit;
