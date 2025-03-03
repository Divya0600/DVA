// src/pages/Sources.js
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
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Storage as StorageIcon,
  Code as CodeIcon,
  BugReport as BugReportIcon,
  Cloud as CloudIcon,
  CloudDownload as CloudDownloadIcon,
  Link as LinkIcon,
  InfoOutlined as InfoOutlinedIcon,
} from '@mui/icons-material';

import apiService from '../services/api';

// Helper to get icon for a source type
const getSourceIcon = (sourceType) => {
  switch (sourceType?.toLowerCase()) {
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
      return CloudDownloadIcon;
    default:
      return CodeIcon;
  }
};

const Sources = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch sources
  const {
    data: typesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(['adapter-types'], () => apiService.pipelines.getTypes());
  
  // Count how many pipelines use each source
  const { data: pipelinesResponse } = useQuery(['pipelines'], () => apiService.pipelines.getAll());
  
  const getSourceUsageCount = (sourceType) => {
    if (!pipelinesResponse?.data?.data) return 0;
    
    const pipelines = Array.isArray(pipelinesResponse.data.data) 
      ? pipelinesResponse.data.data 
      : [];
      
    return pipelines.filter(p => p.source_type === sourceType).length;
  };
  
  // Get sources from API data and filter based on search
  const sources = (typesResponse?.data?.source_types || []).filter(source => 
    source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.description.toLowerCase().includes(searchQuery.toLowerCase())
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
            Error loading sources: {error?.message || 'Unknown error'}
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
              Data Sources
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect to various data sources to create pipelines
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
        placeholder="Search sources..."
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
      
      {/* Sources Grid */}
      <Grid container spacing={3}>
        {sources.map((source) => {
          const SourceIcon = getSourceIcon(source.id);
          const usageCount = getSourceUsageCount(source.id);
          
          return (
            <Grid item xs={12} sm={6} md={4} key={source.id}>
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
                        bgcolor: 'primary.light', 
                        color: 'primary.contrastText',
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex'
                      }}
                    >
                      <SourceIcon />
                    </Box>
                  }
                  title={source.name}
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
                    {source.description}
                  </Typography>
                  
                  <Typography variant="subtitle2" gutterBottom>
                    Capabilities:
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                    <Chip 
                      label="Data Extraction" 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ mb: 1 }}
                    />
                    
                    {source.id === 'alm' && (
                      <>
                        <Chip 
                          label="Defect Tracking" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        <Chip 
                          label="Test Management" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      </>
                    )}
                    
                    {(source.id === 'mysql' || source.id === 'postgres') && (
                      <>
                        <Chip 
                          label="SQL Database" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        <Chip 
                          label="Tables" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      </>
                    )}
                    
                    {source.id === 'rest' && (
                      <>
                        <Chip 
                          label="API" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                        <Chip 
                          label="Custom Endpoints" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      </>
                    )}
                  </Stack>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                    <InfoOutlinedIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                    Adapter ID: {source.id}
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
                      state: { preselectedSource: source.id }
                    }}
                    sx={{ mr: 1 }}
                  >
                    Use Source
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    component={RouterLink}
                    to={`/documentation/sources/${source.id}`}
                    endIcon={<LinkIcon />}
                  >
                    Documentation
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
        
        {sources.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No sources found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery ? 'Try adjusting your search query' : 'No data sources available'}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
      
      {/* Info Card */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <InfoOutlinedIcon fontSize="large" />
          <Box>
            <Typography variant="h6" gutterBottom>
              Creating Custom Sources
            </Typography>
            <Typography variant="body2" paragraph>
              Need to connect to a system not listed here? You can create custom source adapters 
              by implementing the source adapter interface. This allows you to connect with any 
              system that provides API access.
            </Typography>
            <Button 
              variant="outlined" 
              component={RouterLink}
              to="/documentation/custom-adapters"
              sx={{ 
                color: 'info.contrastText', 
                borderColor: 'info.contrastText',
                '&:hover': {
                  borderColor: 'info.contrastText',
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

export default Sources;