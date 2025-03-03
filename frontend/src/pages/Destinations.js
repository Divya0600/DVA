// src/pages/Destinations.js
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Storage as StorageIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  Cloud as CloudIcon,
  CloudUpload as CloudUploadIcon,
  Link as LinkIcon,
  InfoOutlined as InfoOutlinedIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

import apiService from '../services/api';

// Helper to get icon for a destination type
const getDestinationIcon = (destinationType) => {
  switch (destinationType?.toLowerCase()) {
    case 'alm':
      return BugReportIcon;
    case 'mysql':
    case 'postgres':
    case 'mongodb':
      return StorageIcon;
    case 'jira':
      return BugReportIcon;
    case 'salesforce':
      return CloudIcon;
    case 'rest':
      return CloudUploadIcon;
    default:
      return CodeIcon;
  }
};

const Destinations = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch destinations
  const {
    data: typesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(['adapter-types'], () => apiService.pipelines.getTypes());
  
  // Count how many pipelines use each destination
  const { data: pipelinesResponse } = useQuery(['pipelines'], () => apiService.pipelines.getAll());
  
  const getDestinationUsageCount = (destinationType) => {
    if (!pipelinesResponse?.data?.data) return 0;
    
    const pipelines = Array.isArray(pipelinesResponse.data.data) 
      ? pipelinesResponse.data.data 
      : [];
      
    return pipelines.filter(p => p.destination_type === destinationType).length;
  };
  
  // Get destinations from API data and filter based on search
  const destinations = (typesResponse?.data?.destination_types || []).filter(destination => 
    destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (isError) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>
            Error loading destinations: {error?.message || 'Unknown error'}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={refetch}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }
  
  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack 
          direction={{ xs: 'column', md: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              Data Destinations
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure where to send your extracted data
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/pipelines/create"
            startIcon={<AddIcon />}
          >
            Create Pipeline
          </Button>
        </Stack>
      </Paper>
      
      {/* Search */}
      <TextField
        fullWidth
        placeholder="Search destinations..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />
      
      {/* Destinations Grid */}
      <Grid container spacing={3}>
        {destinations.map((destination) => {
          const DestinationIcon = getDestinationIcon(destination.id);
          const usageCount = getDestinationUsageCount(destination.id);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={destination.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardHeader
                  avatar={
                    <Box 
                      sx={{ 
                        bgcolor: 'secondary.light', 
                        color: 'secondary.contrastText',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex'
                      }}
                    >
                      <DestinationIcon />
                    </Box>
                  }
                  title={destination.name}
                  titleTypographyProps={{ variant: 'h6' }}
                  action={
                    usageCount > 0 && (
                      <Tooltip title={`Used in ${usageCount} pipeline${usageCount === 1 ? '' : 's'}`}>
                        <Chip 
                          label={usageCount} 
                          size="small" 
                          color="success" 
                          sx={{ mr: 1 }}
                        />
                      </Tooltip>
                    )
                  }
                />
                <Divider />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {destination.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Capabilities:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    <Chip 
                      label="Data Upload" 
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                      sx={{ mb: 1 }}
                    />
                    
                    {destination.id === 'jira' && (
                      <>
                        <Chip 
                          label="Issue Creation" 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        <Chip 
                          label="Field Mapping" 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      </>
                    )}
                    
                    {destination.id === 'alm' && (
                      <>
                        <Chip 
                          label="Defect Creation" 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        <Chip 
                          label="Test Results" 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      </>
                    )}
                    
                    {destination.id === 'rest' && (
                      <>
                        <Chip 
                          label="Custom Endpoints" 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        <Chip 
                          label="Flexible Payloads" 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      </>
                    )}
                  </Stack>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <InfoOutlinedIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                    Adapter ID: {destination.id}
                  </Typography>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    component={RouterLink}
                    to={{
                      pathname: "/pipelines/create",
                      state: { preselectedDestination: destination.id }
                    }}
                    sx={{ mr: 1 }}
                  >
                    Use Destination
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    component={RouterLink}
                    to={`/documentation/destinations/${destination.id}`}
                    endIcon={<LinkIcon />}
                  >
                    Documentation
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
        
        {destinations.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No destinations found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'Try adjusting your search query' : 'No data destinations available'}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Configuration Examples */}
      <Paper sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h6" p={2}>
          Configuration Examples
        </Typography>
        <Divider />
        
        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: 'background.default' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BugReportIcon sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="subtitle1">
                Jira Configuration Example
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              To configure a Jira destination, you'll need the following information:
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'grey.100',
                color: 'grey.900',
                overflow: 'auto',
                mb: 2,
                fontSize: '0.875rem',
                fontFamily: '"Roboto Mono", monospace',
              }}
            >
{`{
  "base_url": "https://your-domain.atlassian.net",
  "auth_method": "token",
  "project_key": "PROJ",
  "issue_type": "Bug",
  "username": "your.email@example.com",
  "api_token": "your-api-token",
  "field_mapping": {
    "summary": "name",
    "description": "description",
    "priority": "priority"
  }
}`}
            </Box>
            <Typography variant="body2">
              The <code>field_mapping</code> section defines how source fields map to Jira fields.
            </Typography>
          </AccordionDetails>
        </Accordion>
        
        <Accordion>
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ bgcolor: 'background.default' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BugReportIcon sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="subtitle1">
                ALM Configuration Example
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              To configure an ALM destination, you'll need the following information:
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'grey.100',
                color: 'grey.900',
                overflow: 'auto',
                mb: 2,
                fontSize: '0.875rem',
                fontFamily: '"Roboto Mono", monospace',
              }}
            >
{`{
  "base_url": "https://alm.example.com",
  "domain": "DEFAULT",
  "project": "Project Name",
  "username": "alm_username",
  "password": "alm_password",
  "defect_defaults": {
    "severity": "2-Medium",
    "priority": "1-High"
  }
}`}
            </Box>
            <Typography variant="body2">
              The <code>defect_defaults</code> section sets default values for created defects.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>
      
      {/* Info Card */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'success.light', color: 'success.contrastText' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <InfoOutlinedIcon fontSize="large" />
          <Box>
            <Typography variant="h6" gutterBottom>
              Extending Destinations
            </Typography>
            <Typography variant="body2" paragraph>
              Need to push data to a system not listed here? You can create custom destination adapters
              by implementing the destination adapter interface. This allows you to connect with any system
              that provides API access.
            </Typography>
            <Button 
              variant="outlined" 
              component={RouterLink}
              to="/documentation/custom-adapters"
              sx={{ 
                color: 'success.contrastText', 
                borderColor: 'success.contrastText',
                '&:hover': {
                  borderColor: 'success.contrastText',
                  bgcolor: 'rgba(255, 255, 255, 0.08)'
                }
              }}
            >
              Read Developer Guide
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Destinations;