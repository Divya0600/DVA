// src/pages/PipelineCreate.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Material UI imports
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

import apiService from '../services/api';

// Step components
import SelectSourceType from '../components/pipeline/SelectSourceType';
import ConfigureSource from '../components/pipeline/ConfigureSource';
import SelectDestinationType from '../components/pipeline/SelectDestinationType';
import ConfigureDestination from '../components/pipeline/ConfigureDestination';
import FinalSettings from '../components/pipeline/FinalSettings';

const PipelineCreate = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeStep, setActiveStep] = useState(0);
  const [pipelineConfig, setPipelineConfig] = useState({
    name: '',
    description: '',
    source_type: '',
    source_config: {},
    destination_type: '',
    destination_config: {},
    schedule: '',
    is_scheduled: false,
    transformation_config: {},
    status: 'inactive',
  });
  
  const [sourceConnected, setSourceConnected] = useState(false);
  const [destinationConnected, setDestinationConnected] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  // Fetch available adapter types
  const { data: typesData, isLoading: typesLoading } = useQuery(
    ['adapterTypes'],
    () => apiService.pipelines.getTypes(),
    {
      refetchOnWindowFocus: false,
    }
  );
  
  // Create pipeline mutation
  const createPipelineMutation = useMutation(
    (data) => apiService.pipelines.create(data),
    {
      onSuccess: (response) => {
        // Show success notification
        // Invalidate queries
        queryClient.invalidateQueries(['pipelines']);
        // Navigate to the new pipeline
        navigate(`/pipelines/${response.data.id}`);
      },
    }
  );
  
  // Test source connection mutation
  const testSourceConnectionMutation = useMutation(
    (data) => apiService.pipelines.testSourceConnection(data),
    {
      onSuccess: (response) => {
        if (response.data.status === 'success') {
          setSourceConnected(true);
          setValidationErrors({
            ...validationErrors,
            source_connection: null,
          });
        } else {
          setSourceConnected(false);
          setValidationErrors({
            ...validationErrors,
            source_connection: response.data.message,
          });
        }
      },
      onError: (error) => {
        setSourceConnected(false);
        setValidationErrors({
          ...validationErrors,
          source_connection: error.response?.data?.message || 'Connection test failed',
        });
      },
    }
  );
  
  // Test destination connection mutation
  const testDestinationConnectionMutation = useMutation(
    (data) => apiService.pipelines.testDestinationConnection(data),
    {
      onSuccess: (response) => {
        if (response.data.status === 'success') {
          setDestinationConnected(true);
          setValidationErrors({
            ...validationErrors,
            destination_connection: null,
          });
        } else {
          setDestinationConnected(false);
          setValidationErrors({
            ...validationErrors,
            destination_connection: response.data.message,
          });
        }
      },
      onError: (error) => {
        setDestinationConnected(false);
        setValidationErrors({
          ...validationErrors,
          destination_connection: error.response?.data?.message || 'Connection test failed',
        });
      },
    }
  );
  
  // Define steps
  const steps = [
    'Select Source',
    'Configure Source',
    'Select Destination',
    'Configure Destination',
    'Pipeline Settings',
  ];
  
  // Check if the current step is valid
  const validateStep = () => {
    let errors = {};
    let isValid = true;
    
    switch (activeStep) {
      case 0: // Source selection
        if (!pipelineConfig.source_type) {
          errors.source_type = 'Please select a source type';
          isValid = false;
        }
        break;
        
      case 1: // Source configuration
        if (!sourceConnected) {
          errors.source_connection = 'Please establish a successful connection before proceeding';
          isValid = false;
        }
        break;
        
      case 2: // Destination selection
        if (!pipelineConfig.destination_type) {
          errors.destination_type = 'Please select a destination type';
          isValid = false;
        }
        break;
        
      case 3: // Destination configuration
        if (!destinationConnected) {
          errors.destination_connection = 'Please establish a successful connection before proceeding';
          isValid = false;
        }
        break;
        
      case 4: // Final settings
        if (!pipelineConfig.name) {
          errors.name = 'Pipeline name is required';
          isValid = false;
        }
        if (pipelineConfig.is_scheduled && !pipelineConfig.schedule) {
          errors.schedule = 'Schedule is required when scheduling is enabled';
          isValid = false;
        }
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
    return isValid;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  // Handle source type selection
  const handleSourceTypeSelect = (sourceType) => {
    setPipelineConfig((prev) => ({
      ...prev,
      source_type: sourceType,
      source_config: {}, // Reset source config when changing source type
    }));
    setSourceConnected(false);
  };
  
  // Handle source configuration change
  const handleSourceConfigChange = (config) => {
    setPipelineConfig((prev) => ({
      ...prev,
      source_config: {
        ...prev.source_config,
        ...config,
      },
    }));
    
    // If connection was established, reset it when config changes
    if (sourceConnected) {
      setSourceConnected(false);
    }
  };
  
  // Handle test source connection
  const handleTestSourceConnection = () => {
    testSourceConnectionMutation.mutate({
      source_type: pipelineConfig.source_type,
      source_config: pipelineConfig.source_config,
    });
  };
  
  // Handle destination type selection
  const handleDestinationTypeSelect = (destinationType) => {
    setPipelineConfig((prev) => ({
      ...prev,
      destination_type: destinationType,
      destination_config: {}, // Reset destination config when changing destination type
    }));
    setDestinationConnected(false);
  };
  
  // Handle destination configuration change
  const handleDestinationConfigChange = (config) => {
    setPipelineConfig((prev) => ({
      ...prev,
      destination_config: {
        ...prev.destination_config,
        ...config,
      },
    }));
    
    // If connection was established, reset it when config changes
    if (destinationConnected) {
      setDestinationConnected(false);
    }
  };
  
  // Handle test destination connection
  const handleTestDestinationConnection = () => {
    testDestinationConnectionMutation.mutate({
      destination_type: pipelineConfig.destination_type,
      destination_config: pipelineConfig.destination_config,
    });
  };
  
  // Handle final settings change
  const handleFinalSettingsChange = (settings) => {
    setPipelineConfig((prev) => ({
      ...prev,
      ...settings,
    }));
  };
  
  // Handle create pipeline
  const handleCreatePipeline = () => {
    if (validateStep()) {
      // Prepare data for API
      const apiData = {
        name: pipelineConfig.name,
        description: pipelineConfig.description,
        source_type: pipelineConfig.source_type,
        source_config: pipelineConfig.source_config,
        destination_type: pipelineConfig.destination_type,
        destination_config: pipelineConfig.destination_config,
        schedule: pipelineConfig.is_scheduled ? pipelineConfig.schedule : '',
        transformation_config: pipelineConfig.transformation_config || {},
        status: pipelineConfig.status,
      };
      
      createPipelineMutation.mutate(apiData);
    }
  };
  
  // Get step content based on active step
  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <SelectSourceType
            sourceTypes={typesData?.data?.source_types || []}
            selectedSourceType={pipelineConfig.source_type}
            onSelectSourceType={handleSourceTypeSelect}
            error={validationErrors.source_type}
          />
        );
      case 1:
        return (
          <ConfigureSource
            sourceType={pipelineConfig.source_type}
            config={pipelineConfig.source_config}
            onConfigChange={handleSourceConfigChange}
            onTestConnection={handleTestSourceConnection}
            isConnected={sourceConnected}
            isConnecting={testSourceConnectionMutation.isLoading}
            connectionError={validationErrors.source_connection}
          />
        );
      case 2:
        return (
          <SelectDestinationType
            destinationTypes={typesData?.data?.destination_types || []}
            selectedDestinationType={pipelineConfig.destination_type}
            onSelectDestinationType={handleDestinationTypeSelect}
            error={validationErrors.destination_type}
          />
        );
      case 3:
        return (
          <ConfigureDestination
            destinationType={pipelineConfig.destination_type}
            config={pipelineConfig.destination_config}
            onConfigChange={handleDestinationConfigChange}
            onTestConnection={handleTestDestinationConnection}
            isConnected={destinationConnected}
            isConnecting={testDestinationConnectionMutation.isLoading}
            connectionError={validationErrors.destination_connection}
          />
        );
      case 4:
        return (
          <FinalSettings
            pipelineConfig={pipelineConfig}
            onChange={handleFinalSettingsChange}
            errors={validationErrors}
          />
        );
      default:
        return 'Unknown step';
    }
  };
  
  if (typesLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/pipelines')}
          sx={{ mb: 2 }}
        >
          Back to Pipelines
        </Button>
        
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Pipeline
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box my={3}>
          {getStepContent(activeStep)}
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>
          
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreatePipeline}
              startIcon={<SaveIcon />}
              disabled={createPipelineMutation.isLoading}
            >
              {createPipelineMutation.isLoading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Creating...
                </>
              ) : (
                'Create Pipeline'
              )}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
            >
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default PipelineCreate;