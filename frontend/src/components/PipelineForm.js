// src/components/PipelineForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  Stack,
  Heading,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Spinner,
  HStack,
  Switch,
  FormHelperText,
} from '@chakra-ui/react';

import apiService from '../services/api';
import JsonEditor from './JsonEditor';

const PipelineForm = ({ pipeline, onSubmit, isSubmitting }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [sourceType, setSourceType] = useState(pipeline?.source_type || '');
  const [destinationType, setDestinationType] = useState(pipeline?.destination_type || '');
  
  // Get adapter types
  const { data: adapterTypes, isLoading: typesLoading } = useQuery(
    ['adapterTypes'],
    () => apiService.pipelines.getTypes()
  );
  
  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      name: pipeline?.name || '',
      description: pipeline?.description || '',
      source_type: pipeline?.source_type || '',
      source_config: pipeline?.source_config || {},
      destination_type: pipeline?.destination_type || '',
      destination_config: pipeline?.destination_config || {},
      schedule: pipeline?.schedule || '',
      transformation_config: pipeline?.transformation_config || {},
      status: pipeline?.status || 'inactive',
    }
  });
  
  // Watch for form field changes
  const watchedFields = watch(['source_type', 'destination_type']);
  
  useEffect(() => {
    // Update state when form fields change
    setSourceType(watchedFields[0]);
    setDestinationType(watchedFields[1]);
  }, [watchedFields]);
  
  // Reset form when pipeline changes
  useEffect(() => {
    if (pipeline) {
      reset({
        name: pipeline.name || '',
        description: pipeline.description || '',
        source_type: pipeline.source_type || '',
        source_config: pipeline.source_config || {},
        destination_type: pipeline.destination_type || '',
        destination_config: pipeline.destination_config || {},
        schedule: pipeline.schedule || '',
        transformation_config: pipeline.transformation_config || {},
        status: pipeline.status || 'inactive',
      });
      setSourceType(pipeline.source_type || '');
      setDestinationType(pipeline.destination_type || '');
    }
  }, [pipeline, reset]);
  
  // Handle JSON editor changes
  const handleJsonChange = (field, value) => {
    try {
      // Validate JSON
      const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
      setValue(field, parsedValue);
    } catch (error) {
      toast({
        title: 'Invalid JSON',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle form submission
  const submitForm = (data) => {
    onSubmit(data);
  };
  
  if (typesLoading) {
    return <Spinner size="xl" />;
  }
  
  // Extract lists of adapter types
  const sourceTypes = adapterTypes?.data?.source_types || [];
  const destinationTypes = adapterTypes?.data?.destination_types || [];
  
  return (
    <Box as="form" onSubmit={handleSubmit(submitForm)} width="100%">
      <Stack spacing={6}>
        {/* Basic information */}
        <Box>
          <Heading size="md" mb={4}>Basic Information</Heading>
          
          <Stack spacing={4}>
            <FormControl isInvalid={errors.name} isRequired>
              <FormLabel>Pipeline Name</FormLabel>
              <Input 
                {...register('name', { 
                  required: 'Name is required',
                  minLength: { value: 3, message: 'Name must be at least 3 characters' },
                })} 
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
            
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea 
                {...register('description')}
                placeholder="Describe the purpose of this pipeline" 
                rows={3}
              />
            </FormControl>
            
            <FormControl isInvalid={errors.status}>
              <FormLabel>Status</FormLabel>
              <HStack>
                <Switch 
                  id="status-switch"
                  isChecked={watch('status') === 'active'}
                  onChange={(e) => setValue('status', e.target.checked ? 'active' : 'inactive')}
                />
                <FormLabel htmlFor="status-switch" mb={0}>
                  {watch('status') === 'active' ? 'Active' : 'Inactive'}
                </FormLabel>
              </HStack>
              <FormHelperText>
                Active pipelines can be scheduled and executed
              </FormHelperText>
            </FormControl>
          </Stack>
        </Box>
        
        <Divider />
        
        {/* Source and destination configuration */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>Source Configuration</Tab>
            <Tab>Destination Configuration</Tab>
            <Tab>Advanced Settings</Tab>
          </TabList>
          
          <TabPanels>
            {/* Source Configuration */}
            <TabPanel>
              <Stack spacing={4}>
                <FormControl isInvalid={errors.source_type} isRequired>
                  <FormLabel>Source Type</FormLabel>
                  <Select 
                    {...register('source_type', { required: 'Source type is required' })}
                    placeholder="Select source type"
                  >
                    {sourceTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} - {type.description}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.source_type?.message}</FormErrorMessage>
                </FormControl>
                
                {sourceType && (
                  <FormControl isInvalid={errors.source_config}>
                    <FormLabel>Source Configuration</FormLabel>
                    <JsonEditor
                      value={watch('source_config')}
                      onChange={(value) => handleJsonChange('source_config', value)}
                    />
                    <FormHelperText>
                      Configure authentication and other settings for the source
                    </FormHelperText>
                    <FormErrorMessage>{errors.source_config?.message}</FormErrorMessage>
                  </FormControl>
                )}
              </Stack>
            </TabPanel>
            
            {/* Destination Configuration */}
            <TabPanel>
              <Stack spacing={4}>
                <FormControl isInvalid={errors.destination_type} isRequired>
                  <FormLabel>Destination Type</FormLabel>
                  <Select 
                    {...register('destination_type', { required: 'Destination type is required' })}
                    placeholder="Select destination type"
                  >
                    {destinationTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} - {type.description}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.destination_type?.message}</FormErrorMessage>
                </FormControl>
                
                {destinationType && (
                  <FormControl isInvalid={errors.destination_config}>
                    <FormLabel>Destination Configuration</FormLabel>
                    <JsonEditor
                      value={watch('destination_config')}
                      onChange={(value) => handleJsonChange('destination_config', value)}
                    />
                    <FormHelperText>
                      Configure authentication and other settings for the destination
                    </FormHelperText>
                    <FormErrorMessage>{errors.destination_config?.message}</FormErrorMessage>
                  </FormControl>
                )}
              </Stack>
            </TabPanel>
            
            {/* Advanced Settings */}
            <TabPanel>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Schedule (Cron Expression)</FormLabel>
                  <Input 
                    {...register('schedule')}
                    placeholder="e.g. 0 0 * * * (daily at midnight)"
                  />
                  <FormHelperText>
                    Optional: Schedule when this pipeline should run automatically
                  </FormHelperText>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Transformation Configuration</FormLabel>
                  <JsonEditor
                    value={watch('transformation_config')}
                    onChange={(value) => handleJsonChange('transformation_config', value)}
                  />
                  <FormHelperText>
                    Optional: Configure data transformations between source and destination
                  </FormHelperText>
                </FormControl>
              </Stack>
            </TabPanel>
          </TabPanels>
        </Tabs>
        
        {/* Form buttons */}
        <HStack justify="flex-end">
          <Button 
            onClick={() => navigate(-1)} 
            variant="outline"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            colorScheme="blue" 
            isLoading={isSubmitting}
          >
            {pipeline ? 'Update Pipeline' : 'Create Pipeline'}
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
};

export default PipelineForm;
