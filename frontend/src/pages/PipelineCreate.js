// src/pages/PipelineCreate.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// FIXED: Add useQueryClient to imports
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Flex,
  FormControl,
  Select,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Progress,
  SimpleGrid,
  Stack,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  Stepper,
  StepSeparator,
  StepStatus,
  StepTitle,
  Switch,
  Text,
  Tooltip,
  VStack,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  ArrowBackIcon, 
  ArrowForwardIcon, 
  CheckIcon, 
  CloseIcon, 
  SearchIcon, 
  ViewIcon, 
  ViewOffIcon 
} from '@chakra-ui/icons';
import {
  FaDatabase,
  FaServer,
  FaCloud,
  FaTable,
  FaCheckCircle,
  FaCheck
} from 'react-icons/fa';

import apiService from '../services/api';

// Step 1: Select Source Type Component
const SelectSourceStep = ({ sources = [], selectedSource, onSelect, searchQuery, onSearchChange }) => {
  // Card colors and styles
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const selectedBorder = useColorModeValue('blue.500', 'blue.400');
  const iconBg = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Box width="100%">
      <VStack spacing={6} align="center" width="100%">
        <VStack spacing={1}>
          <Heading size="lg">Select Source Type</Heading>
          <Text color="gray.500" textAlign="center">
            Select the source type you want to create your pipeline from
          </Text>
        </VStack>
        
        {/* Search input */}
        <InputGroup maxW="600px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search Source Types"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            borderRadius="lg"
          />
        </InputGroup>
        
        {/* Source type grid */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6} width="100%" mt={4}>
          {sources.map((source) => {
            const isSelected = selectedSource === source.id;
            const SourceIcon = source.icon || FaDatabase;
            
            return (
              <Box
                key={source.id}
                as="button"
                onClick={() => onSelect(source.id)}
                width="100%"
              >
                <Box
                  p={6}
                  borderWidth="1px"
                  borderColor={isSelected ? selectedBorder : cardBorderColor}
                  borderRadius="lg"
                  bg={isSelected ? selectedBg : cardBg}
                  boxShadow={isSelected ? "md" : "sm"}
                  position="relative"
                  transition="all 0.2s"
                  height="180px"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                >
                  {isSelected && (
                    <Box
                      position="absolute"
                      top={2}
                      right={2}
                      bg="green.500"
                      borderRadius="full"
                      p={1}
                    >
                      <Icon as={CheckIcon} color="white" boxSize={3} />
                    </Box>
                  )}
                  
                  <Box
                    bg={iconBg}
                    p={4}
                    borderRadius="full"
                    mb={4}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={SourceIcon} boxSize={10} color={source.color || "blue.500"} />
                  </Box>
                  
                  <Text fontWeight="bold" fontSize="lg" textAlign="center">
                    {source.name}
                  </Text>
                  
                  <Text fontSize="sm" color="gray.500" textAlign="center" noOfLines={2} mt={1}>
                    {source.description}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

// Step 2: Configure Source Component
const ConfigureSourceStep = ({ sourceType, config, onChange, errors, sourceDetails }) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Styling
  const cardBg = useColorModeValue('white', 'gray.700');
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  
  // Layout for different source types
  const renderSourceConfig = () => {
    // Based on source type, customize form fields
    switch (sourceType) {
      case 'mongodb':
        return (
          <Stack spacing={6}>
            <Heading size="md">Configure Your Source</Heading>
            <Text color="gray.500">
              Please provide MongoDB connection settings or copy from one of the {' '}
              <Button variant="link" colorScheme="blue">Product Data</Button>
            </Text>
            
            <FormControl isRequired isInvalid={errors?.name}>
              <FormLabel>Pipeline Name *</FormLabel>
              <Input
                value={config.name || ''}
                onChange={(e) => onChange({ ...config, name: e.target.value })}
                placeholder="Give your pipeline a unique name"
              />
              <FormHelperText>Unique name for your pipeline</FormHelperText>
              {errors?.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
            </FormControl>
            
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <FormControl isRequired isInvalid={errors?.host}>
                <FormLabel>Database Host *</FormLabel>
                <Input
                  value={config.host || ''}
                  onChange={(e) => onChange({ ...config, host: e.target.value })}
                  placeholder="e.g. mongodb.example.com"
                />
                <FormHelperText>IP Address or the DNS name for your database server</FormHelperText>
                {errors?.host && <FormErrorMessage>{errors.host}</FormErrorMessage>}
              </FormControl>
              
              <FormControl isRequired isInvalid={errors?.port}>
                <FormLabel>Database Port *</FormLabel>
                <Input
                  value={config.port || ''}
                  onChange={(e) => onChange({ ...config, port: e.target.value })}
                  placeholder="e.g. 27017"
                />
                <FormHelperText>Port on which the database is accepting connections</FormHelperText>
                {errors?.port && <FormErrorMessage>{errors.port}</FormErrorMessage>}
              </FormControl>
            </Grid>
            
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <FormControl isRequired isInvalid={errors?.user}>
                <FormLabel>Database User *</FormLabel>
                <Input
                  value={config.user || ''}
                  onChange={(e) => onChange({ ...config, user: e.target.value })}
                  placeholder="username"
                />
                {errors?.user && <FormErrorMessage>{errors.user}</FormErrorMessage>}
              </FormControl>
              
              <FormControl isRequired isInvalid={errors?.password}>
                <FormLabel>Database Password *</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={config.password || ''}
                    onChange={(e) => onChange({ ...config, password: e.target.value })}
                    placeholder="••••••••"
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    />
                  </InputRightElement>
                </InputGroup>
                {errors?.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
              </FormControl>
            </Grid>
            
            <FormControl isInvalid={errors?.authdb}>
              <FormLabel>Auth DB Name</FormLabel>
              <Input
                value={config.authdb || ''}
                onChange={(e) => onChange({ ...config, authdb: e.target.value })}
                placeholder="admin"
              />
              <FormHelperText>Authentication database associated with the database user</FormHelperText>
              {errors?.authdb && <FormErrorMessage>{errors.authdb}</FormErrorMessage>}
            </FormControl>
            
            <Box p={4} bg="yellow.50" borderRadius="md" borderColor="yellow.200" borderWidth="1px">
              <Text color="yellow.800">
                Please open access to MongoDB port from Hevo's IP address <Code>{sourceDetails?.ipAddress || '10.2.7.152'}</Code>
              </Text>
            </Box>
            
            <FormControl display="flex" alignItems="center">
              <Switch
                id="ssh-tunnel"
                isChecked={config.useSSH || false}
                onChange={(e) => onChange({ ...config, useSSH: e.target.checked })}
              />
              <FormLabel htmlFor="ssh-tunnel" mb="0" ml={2}>
                Connect through SSH
              </FormLabel>
            </FormControl>
            
            <Heading size="md" mt={4}>Advanced Settings</Heading>
            {/* Add advanced settings fields as needed */}
          </Stack>
        );
        
      // Add other source types here
      default:
        return (
          <Stack spacing={6}>
            <Heading size="md">Configure Your {sourceType.toUpperCase()} Source</Heading>
            
            <FormControl isRequired isInvalid={errors?.name}>
              <FormLabel>Pipeline Name *</FormLabel>
              <Input
                value={config.name || ''}
                onChange={(e) => onChange({ ...config, name: e.target.value })}
                placeholder="Give your pipeline a unique name"
              />
              {errors?.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
            </FormControl>
            
            <FormControl isRequired isInvalid={errors?.host}>
              <FormLabel>Connection URL *</FormLabel>
              <Input
                value={config.host || ''}
                onChange={(e) => onChange({ ...config, host: e.target.value })}
                placeholder={`${sourceType}://hostname:port`}
              />
              {errors?.host && <FormErrorMessage>{errors.host}</FormErrorMessage>}
            </FormControl>
            
            <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
              <FormControl isRequired isInvalid={errors?.user}>
                <FormLabel>Username *</FormLabel>
                <Input
                  value={config.user || ''}
                  onChange={(e) => onChange({ ...config, user: e.target.value })}
                  placeholder="Enter username"
                />
                {errors?.user && <FormErrorMessage>{errors.user}</FormErrorMessage>}
              </FormControl>
              
              <FormControl isRequired isInvalid={errors?.password}>
                <FormLabel>Password *</FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={config.password || ''}
                    onChange={(e) => onChange({ ...config, password: e.target.value })}
                    placeholder="Enter password"
                  />
                  <InputRightElement>
                    <IconButton
                      size="sm"
                      icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                      onClick={() => setShowPassword(!showPassword)}
                      variant="ghost"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    />
                  </InputRightElement>
                </InputGroup>
                {errors?.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
              </FormControl>
            </Grid>
            
            <FormControl>
              <FormLabel>Additional Configuration</FormLabel>
              <Text fontSize="sm" color="gray.500">
                Configure additional parameters specific to this source type
              </Text>
              {/* Additional fields based on source type */}
            </FormControl>
          </Stack>
        );
    }
  };
  
  return (
    <Box width="100%">
      {renderSourceConfig()}
    </Box>
  );
};

// Helper component for code snippets
const Code = ({ children }) => (
  <Box as="span" 
    bg="gray.100" 
    color="blue.600" 
    px={1} 
    py={0.5} 
    borderRadius="md" 
    fontFamily="mono" 
    fontSize="sm"
  >
    {children}
  </Box>
);

// Similar components for Select Destination and Configure Destination steps
const SelectDestinationStep = ({ destinations = [], selectedDestination, onSelect, searchQuery, onSearchChange }) => {
  // Reuse the same pattern as SelectSourceStep but with destination-specific content
  // Card colors and styles
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const selectedBorder = useColorModeValue('blue.500', 'blue.400');
  const iconBg = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Box width="100%">
      <VStack spacing={6} align="center" width="100%">
        <VStack spacing={1}>
          <Heading size="lg">Select Destination Type</Heading>
          <Text color="gray.500" textAlign="center">
            Select where you want to send your data
          </Text>
        </VStack>
        
        {/* Search input */}
        <InputGroup maxW="600px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search Destination Types"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            borderRadius="lg"
          />
        </InputGroup>
        
        {/* Destination type grid */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6} width="100%" mt={4}>
          {destinations.map((destination) => {
            const isSelected = selectedDestination === destination.id;
            const DestinationIcon = destination.icon || FaDatabase;
            
            return (
              <Box
                key={destination.id}
                as="button"
                onClick={() => onSelect(destination.id)}
                width="100%"
              >
                <Box
                  p={6}
                  borderWidth="1px"
                  borderColor={isSelected ? selectedBorder : cardBorderColor}
                  borderRadius="lg"
                  bg={isSelected ? selectedBg : cardBg}
                  boxShadow={isSelected ? "md" : "sm"}
                  position="relative"
                  transition="all 0.2s"
                  height="180px"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "md",
                  }}
                >
                  {isSelected && (
                    <Box
                      position="absolute"
                      top={2}
                      right={2}
                      bg="green.500"
                      borderRadius="full"
                      p={1}
                    >
                      <Icon as={CheckIcon} color="white" boxSize={3} />
                    </Box>
                  )}
                  
                  <Box
                    bg={iconBg}
                    p={4}
                    borderRadius="full"
                    mb={4}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={DestinationIcon} boxSize={10} color={destination.color || "green.500"} />
                  </Box>
                  
                  <Text fontWeight="bold" fontSize="lg" textAlign="center">
                    {destination.name}
                  </Text>
                  
                  <Text fontSize="sm" color="gray.500" textAlign="center" noOfLines={2} mt={1}>
                    {destination.description}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </SimpleGrid>
      </VStack>
    </Box>
  );
};

const ConfigureDestinationStep = ({ destinationType, config, onChange, errors }) => {
  // Similar to ConfigureSourceStep but with destination-specific fields
  const [showPassword, setShowPassword] = useState(false);
  
  // Adapt this section to match the destination configuration UI from your mockups
  return (
    <Box width="100%">
      <Stack spacing={6}>
        <Heading size="md">Configure Your {destinationType.toUpperCase()} Destination</Heading>
        
        <FormControl isRequired isInvalid={errors?.connection_url}>
          <FormLabel>Connection URL</FormLabel>
          <Input
            value={config.connection_url || ''}
            onChange={(e) => onChange({ ...config, connection_url: e.target.value })}
            placeholder="e.g. https://your-instance.example.com"
          />
          {errors?.connection_url && <FormErrorMessage>{errors.connection_url}</FormErrorMessage>}
        </FormControl>
        
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
          <FormControl isRequired isInvalid={errors?.username}>
            <FormLabel>Username</FormLabel>
            <Input
              value={config.username || ''}
              onChange={(e) => onChange({ ...config, username: e.target.value })}
              placeholder="Enter username"
            />
            {errors?.username && <FormErrorMessage>{errors.username}</FormErrorMessage>}
          </FormControl>
          
          <FormControl isRequired isInvalid={errors?.password}>
            <FormLabel>Password or API Key</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={config.password || ''}
                onChange={(e) => onChange({ ...config, password: e.target.value })}
                placeholder="Enter password or API key"
              />
              <InputRightElement>
                <IconButton
                  size="sm"
                  icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                  onClick={() => setShowPassword(!showPassword)}
                  variant="ghost"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                />
              </InputRightElement>
            </InputGroup>
            {errors?.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
          </FormControl>
        </Grid>
        
        {/* Additional fields based on destination type */}
        {destinationType === 'jira' && (
          <FormControl isRequired isInvalid={errors?.project_key}>
            <FormLabel>Project Key</FormLabel>
            <Input
              value={config.project_key || ''}
              onChange={(e) => onChange({ ...config, project_key: e.target.value })}
              placeholder="e.g. PROJ"
            />
            <FormHelperText>The project key for your Jira project</FormHelperText>
            {errors?.project_key && <FormErrorMessage>{errors.project_key}</FormErrorMessage>}
          </FormControl>
        )}
      </Stack>
    </Box>
  );
};

// Final settings step
const FinalSettingsStep = ({ config, onChange, errors }) => {
  return (
    <Box width="100%">
      <Stack spacing={6}>
        <Heading size="md">Final Pipeline Settings</Heading>
        <Text color="gray.500">Configure additional settings for your pipeline</Text>
        
        <FormControl display="flex" flexDirection="column">
          <FormLabel>Pipeline Schedule</FormLabel>
          <HStack>
            <Switch
              isChecked={config.is_scheduled}
              onChange={(e) => onChange({ ...config, is_scheduled: e.target.checked })}
              colorScheme="blue"
              size="lg"
            />
            <Text>{config.is_scheduled ? 'Scheduled' : 'Manual execution only'}</Text>
          </HStack>
          <FormHelperText>Enable to run this pipeline on a schedule</FormHelperText>
        </FormControl>
        
        {config.is_scheduled && (
          <FormControl isInvalid={errors?.schedule}>
            <FormLabel>Cron Schedule</FormLabel>
            <Input
              value={config.schedule || ''}
              onChange={(e) => onChange({ ...config, schedule: e.target.value })}
              placeholder="e.g. 0 0 * * * (daily at midnight)"
            />
            <FormHelperText>Enter a cron expression for the schedule</FormHelperText>
            {errors?.schedule && <FormErrorMessage>{errors.schedule}</FormErrorMessage>}
          </FormControl>
        )}
        
        <FormControl>
          <FormLabel>Error Handling</FormLabel>
          <Select
            value={config.error_handling || 'retry'}
            onChange={(e) => onChange({ ...config, error_handling: e.target.value })}
          >
            <option value="retry">Retry on error (3 attempts)</option>
            <option value="skip">Skip errors and continue</option>
            <option value="fail">Fail immediately on any error</option>
          </Select>
          <FormHelperText>How to handle errors during pipeline execution</FormHelperText>
        </FormControl>
        
        <FormControl>
          <FormLabel>Data Transformation</FormLabel>
          <HStack>
            <Switch
              isChecked={config.enable_transformation}
              onChange={(e) => onChange({ ...config, enable_transformation: e.target.checked })}
              colorScheme="blue"
            />
            <Text>{config.enable_transformation ? 'Enabled' : 'Disabled'}</Text>
          </HStack>
          <FormHelperText>Enable to apply transformations to the data</FormHelperText>
        </FormControl>
        
        <FormControl display="flex" flexDirection="column">
          <FormLabel>Notifications</FormLabel>
          <HStack>
            <Switch
              isChecked={config.notifications_enabled}
              onChange={(e) => onChange({ ...config, notifications_enabled: e.target.checked })}
              colorScheme="blue"
            />
            <Text>{config.notifications_enabled ? 'Enabled' : 'Disabled'}</Text>
          </HStack>
          <FormHelperText>Receive notifications about pipeline status</FormHelperText>
        </FormControl>
      </Stack>
    </Box>
  );
};

// PipelineCreate main component
const PipelineCreate = () => {
  const navigate = useNavigate();
  const toast = useToast();
  // FIXED: Add queryClient to get the React Query client to invalidate queries
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Define pipeline configuration state
  const [pipelineConfig, setPipelineConfig] = useState({
    name: '',
    source_type: '',
    source_config: {},
    destination_type: '',
    destination_config: {},
    is_scheduled: false,
    schedule: '',
    error_handling: 'retry',
    enable_transformation: false,
    transformation_config: {},
    notifications_enabled: true,
  });
  
  // State for search queries
  const [sourceSearchQuery, setSourceSearchQuery] = useState('');
  const [destinationSearchQuery, setDestinationSearchQuery] = useState('');
  
  // State for validation errors
  const [errors, setErrors] = useState({});
  
  // Get available source and destination types
  const { data: typesData, isLoading: typesLoading } = useQuery(
    ['adapterTypes'],
    () => apiService.pipelines.getTypes(),
    {
      refetchOnWindowFocus: false,
    }
  );
  
  // Define mock source types for development (while API might not be ready)
  const sourceTypes = typesData?.data?.source_types || [
    { id: 'mysql', name: 'MySQL', description: 'MySQL Database', icon: FaCloud, color: 'orange.500' },
    { id: 'postgres', name: 'PostgreSQL', description: 'PostgreSQL Database', icon: FaDatabase, color: 'blue.500' },
    { id: 'mongodb', name: 'MongoDB', description: 'MongoDB Database', icon: FaDatabase, color: 'green.500' },
    { id: 'alm', name: 'ALM', description: 'HP ALM Defect Tracking', icon: FaServer, color: 'purple.500' },
    { id: 'salesforce', name: 'Salesforce', description: 'Salesforce CRM', icon: FaCloud, color: 'blue.500' },
    { id: 'oracle', name: 'Oracle', description: 'Oracle Database', icon: FaDatabase, color: 'red.500' },
  ];
  
  // Define mock destination types
  const destinationTypes = typesData?.data?.destination_types || [
    { id: 'jira', name: 'Jira', description: 'Atlassian Jira', icon: FaServer, color: 'blue.500' },
    { id: 'postgres', name: 'PostgreSQL', description: 'PostgreSQL Database', icon: FaDatabase, color: 'blue.500' },
    { id: 'mongodb', name: 'MongoDB', description: 'MongoDB Database', icon: FaDatabase, color: 'green.500' },
    { id: 'salesforce', name: 'Salesforce', description: 'Salesforce CRM', icon: FaCloud, color: 'blue.500' },
    { id: 'mysql', name: 'MySQL', description: 'MySQL Database', icon: FaCloud, color: 'orange.500' },
  ];
  
  // Filter source and destination types based on search queries
  const filteredSourceTypes = sourceTypes.filter(source => 
    source.name.toLowerCase().includes(sourceSearchQuery.toLowerCase()) ||
    source.description.toLowerCase().includes(sourceSearchQuery.toLowerCase())
  );
  
  const filteredDestinationTypes = destinationTypes.filter(dest => 
    dest.name.toLowerCase().includes(destinationSearchQuery.toLowerCase()) ||
    dest.description.toLowerCase().includes(destinationSearchQuery.toLowerCase())
  );
  
  // FIXED: Updated pipeline creation mutation with queryClient invalidation
  const createPipelineMutation = useMutation(
    (data) => apiService.pipelines.create(data),
    {
      onSuccess: (response) => {
        toast({
          title: 'Pipeline Created',
          description: 'Your pipeline has been created successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Force invalidate ALL pipeline queries to ensure UI refresh
        queryClient.invalidateQueries(['pipelines']);
        queryClient.invalidateQueries(['pipelines-recent']);
        queryClient.invalidateQueries(['pipeline']);
        
        // Force a refetch as well in case invalidation doesn't trigger properly
        queryClient.refetchQueries(['pipelines']);
        
        // Add a delay before navigation to ensure queries have time to update
        setTimeout(() => {
          navigate(`/pipelines/${response.data.id}`);
        }, 500);
      },
      onError: (error) => {
        toast({
          title: 'Error Creating Pipeline',
          description: error.response?.data?.message || 'An error occurred',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );
  
  // Validate the current step before proceeding
  const validateStep = () => {
    let newErrors = {};
    let isValid = true;
    
    switch (currentStep) {
      case 0: // Source selection
        if (!pipelineConfig.source_type) {
          newErrors.source_type = "Please select a source type";
          isValid = false;
        }
        break;
        
      case 1: // Source configuration
        if (!pipelineConfig.name) {
          newErrors.name = "Pipeline name is required";
          isValid = false;
        }
        
        if (!pipelineConfig.source_config.host) {
          newErrors.host = "Connection information is required";
          isValid = false;
        }
        
        if (!pipelineConfig.source_config.user) {
          newErrors.user = "Username is required";
          isValid = false;
        }
        
        if (!pipelineConfig.source_config.password) {
          newErrors.password = "Password is required";
          isValid = false;
        }
        break;
        
      case 2: // Destination selection
        if (!pipelineConfig.destination_type) {
          newErrors.destination_type = "Please select a destination type";
          isValid = false;
        }
        break;
        
      case 3: // Destination configuration
        if (!pipelineConfig.destination_config.connection_url) {
          newErrors.connection_url = "Connection URL is required";
          isValid = false;
        }
        
        if (!pipelineConfig.destination_config.username) {
          newErrors.username = "Username is required";
          isValid = false;
        }
        
        if (!pipelineConfig.destination_config.password) {
          newErrors.password = "Password is required";
          isValid = false;
        }
        break;
        
      case 4: // Final settings
        if (pipelineConfig.is_scheduled && !pipelineConfig.schedule) {
          newErrors.schedule = "Schedule is required when scheduling is enabled";
          isValid = false;
        }
        break;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };
  
  // Handle source selection
  const handleSourceSelect = (sourceType) => {
    setPipelineConfig(prev => ({
      ...prev,
      source_type: sourceType,
    }));
  };
  
  // Handle destination selection
  const handleDestinationSelect = (destinationType) => {
    setPipelineConfig(prev => ({
      ...prev,
      destination_type: destinationType,
    }));
  };
  
  // Handle source configuration change
  const handleSourceConfigChange = (config) => {
    setPipelineConfig(prev => ({
      ...prev,
      name: config.name || prev.name, // Update the pipeline name field
      source_config: config,
    }));
  };
  
  // Handle destination configuration change
  const handleDestinationConfigChange = (config) => {
    setPipelineConfig(prev => ({
      ...prev,
      destination_config: config,
    }));
  };
  
  // Handle final settings change
  const handleFinalSettingsChange = (updatedConfig) => {
    setPipelineConfig(prev => ({
      ...prev,
      ...updatedConfig,
    }));
  };
  
  // Define steps for the stepper
  const steps = [
    { title: 'Source', description: 'Select Source' },
    { title: 'Configure Source', description: 'Set up source' },
    { title: 'Destination', description: 'Select Destination' },
    { title: 'Configure Destination', description: 'Set up destination' },
    { title: 'Settings', description: 'Final settings' },
  ];
  
  // Handle create pipeline
  const handleCreatePipeline = () => {
    if (validateStep()) {
      // Format the data for API
      const pipelineData = {
        name: pipelineConfig.name,
        description: pipelineConfig.description || '',
        source_type: pipelineConfig.source_type,
        source_config: pipelineConfig.source_config,
        destination_type: pipelineConfig.destination_type,
        destination_config: pipelineConfig.destination_config,
        schedule: pipelineConfig.is_scheduled ? pipelineConfig.schedule : '',
        transformation_config: pipelineConfig.enable_transformation ? {} : {},
        status: 'active',
      };
      
      createPipelineMutation.mutate(pipelineData);
    }
  };
  
  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <SelectSourceStep
            sources={filteredSourceTypes}
            selectedSource={pipelineConfig.source_type}
            onSelect={handleSourceSelect}
            searchQuery={sourceSearchQuery}
            onSearchChange={setSourceSearchQuery}
          />
        );
      case 1:
        return (
          <ConfigureSourceStep
            sourceType={pipelineConfig.source_type}
            config={pipelineConfig.source_config}
            onChange={handleSourceConfigChange}
            errors={errors}
            sourceDetails={{ ipAddress: '10.2.7.152' }} // Example IP, would come from API in real app
          />
        );
      case 2:
        return (
          <SelectDestinationStep
            destinations={filteredDestinationTypes}
            selectedDestination={pipelineConfig.destination_type}
            onSelect={handleDestinationSelect}
            searchQuery={destinationSearchQuery}
            onSearchChange={setDestinationSearchQuery}
          />
        );
      case 3:
        return (
          <ConfigureDestinationStep
            destinationType={pipelineConfig.destination_type}
            config={pipelineConfig.destination_config}
            onChange={handleDestinationConfigChange}
            errors={errors}
          />
        );
      case 4:
        return (
          <FinalSettingsStep
            config={pipelineConfig}
            onChange={handleFinalSettingsChange}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };
  
  // Styling
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardBorder = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box>
      {/* Header with back button and steps */}
      <Flex 
        justify="space-between" 
        align="center" 
        mb={8}
        pb={4}
        borderBottomWidth="1px"
        borderColor={cardBorder}
      >
        <HStack>
          <IconButton
            icon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="ghost"
            aria-label="Go back"
          />
          <Text>GO BACK</Text>
        </HStack>
        
        <HStack spacing={8}>
          {steps.map((step, index) => (
            <HStack key={index} opacity={currentStep >= index ? 1 : 0.5}>
              <Box
                w="30px"
                h="30px"
                borderRadius="full"
                bg={currentStep >= index ? "blue.500" : "gray.200"}
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontWeight="bold"
              >
                {index + 1}
              </Box>
              <Text fontWeight={currentStep === index ? "bold" : "normal"}>
                {step.title}
              </Text>
            </HStack>
          ))}
        </HStack>
        
        <Button
          variant="ghost"
          rightIcon={<CloseIcon />}
          onClick={() => navigate('/pipelines')}
        >
          CANCEL
        </Button>
      </Flex>
      
      {/* Progress indicator */}
      <Progress 
        value={(currentStep / (steps.length - 1)) * 100} 
        size="xs" 
        colorScheme="blue" 
        mb={8} 
      />
      
      {/* Step content */}
      <Card bg={cardBg} borderColor={cardBorder} borderWidth="1px" mb={8} boxShadow="sm">
        <CardBody p={8}>
          {renderStep()}
        </CardBody>
      </Card>
      
      {/* Navigation buttons */}
      <Flex justify="space-between" mt={6}>
        <Button
          onClick={handlePrevious}
          isDisabled={currentStep === 0}
          leftIcon={<ArrowBackIcon />}
          variant="outline"
        >
          Previous
        </Button>
        
        {currentStep === steps.length - 1 ? (
          <Button
            colorScheme="blue"
            onClick={handleCreatePipeline}
            isLoading={createPipelineMutation.isLoading}
            rightIcon={<CheckIcon />}
          >
            Create Pipeline
          </Button>
        ) : (
          <Button
            colorScheme="blue"
            onClick={handleNext}
            rightIcon={<ArrowForwardIcon />}
          >
            Next
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default PipelineCreate;