// src/pages/Dashboard.js
import React from 'react';
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
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  SwapHoriz as SwapHorizIcon,
  Task as TaskIcon
} from '@mui/icons-material';

import apiService from '../services/api';

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString();
};

// Status chip component
const StatusChip = ({ status }) => {
  let color, icon, label;
  
  switch (status) {
    case 'active':
      color = 'success';
      icon = <CheckCircleIcon fontSize="small" />;
      label = 'Active';
      break;
    case 'inactive':
      color = 'default';
      icon = <InfoIcon fontSize="small" />;
      label = 'Inactive';
      break;
    case 'error':
      color = 'error';
      icon = <WarningIcon fontSize="small" />;
      label = 'Error';
      break;
    case 'running':
      color = 'info';
      icon = <ScheduleIcon fontSize="small" />;
      label = 'Running';
      break;
    case 'completed':
      color = 'success';
      icon = <CheckCircleIcon fontSize="small" />;
      label = 'Completed';
      break;
    case 'failed':
      color = 'error';
      icon = <WarningIcon fontSize="small" />;
      label = 'Failed';
      break;
    default:
      color = 'default';
      icon = <InfoIcon fontSize="small" />;
      label = status || 'Unknown';
  }
  
  return (
    <Chip 
      size="small" 
      color={color} 
      icon={icon} 
      label={label}
      sx={{ fontWeight: 'medium' }}
    />
  );
};

const Dashboard = () => {
  const theme = useTheme();
  
  // Get recent pipelines
  const {
    data: pipelinesData,
    isLoading: pipelinesLoading,
    refetch: refetchPipelines
  } = useQuery(['pipelines-recent'], () => 
    apiService.pipelines.getAll({ limit: 5 }), {
      staleTime: 30000,
    }
  );

  // Get recent jobs
  const {
    data: jobsData,
    isLoading: jobsLoading,
    refetch: refetchJobs
  } = useQuery(['jobs-recent'], () => 
    apiService.jobs.getAll({ limit: 5 }), {
      staleTime: 30000,
    }
  );

  // Ensure data is arrays
  const pipelines = Array.isArray(pipelinesData?.data?.data) 
    ? pipelinesData?.data?.data 
    : [];
    
  const jobs = Array.isArray(jobsData?.data?.data) 
    ? jobsData?.data?.data 
    : [];
  
  // Calculate summary statistics
  const totalPipelines = pipelines.length;
  const activePipelines = pipelines.filter(p => p.status === 'active').length;
  const completedJobs = jobs.filter(j => j.status === 'completed').length;
  const failedJobs = jobs.filter(j => j.status === 'failed').length;

  // Refresh all data
  const handleRefresh = () => {
    refetchPipelines();
    refetchJobs();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          borderRadius: 2
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" gutterBottom>
              Pipeline Migration System
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
              Move data between any Source and Destination
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/pipelines/create"
              sx={{ mt: 1 }}
            >
              Create Pipeline
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: 'inherit' }}>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Active Pipelines</Typography>
                    <Typography variant="h3">{activePipelines}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>Recent Jobs</Typography>
                    <Typography variant="h3">{jobs.length}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'primary.light', 
                    color: 'primary.contrastText',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    mr: 2
                  }}
                >
                  <SwapHorizIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Pipelines</Typography>
                  <Typography variant="h4">{totalPipelines}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'info.light', 
                    color: 'info.contrastText',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    mr: 2
                  }}
                >
                  <TaskIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Jobs</Typography>
                  <Typography variant="h4">{jobs.length}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'success.light', 
                    color: 'success.contrastText',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    mr: 2
                  }}
                >
                  <StorageIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Sources</Typography>
                  <Typography variant="h4">6</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'warning.light', 
                    color: 'warning.contrastText',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    mr: 2
                  }}
                >
                  <StorageIcon />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Destinations</Typography>
                  <Typography variant="h4">6</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Recent Pipelines */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              title="Recent Pipelines" 
              action={
                <Box>
                  <IconButton 
                    size="small" 
                    aria-label="refresh" 
                    onClick={() => refetchPipelines()}
                  >
                    <RefreshIcon />
                  </IconButton>
                  <Button 
                    component={RouterLink} 
                    to="/pipelines" 
                    endIcon={<ArrowForwardIcon />}
                    sx={{ ml: 1 }}
                  >
                    View All
                  </Button>
                </Box>
              }
            />
            <Divider />
            
            {pipelinesLoading ? (
              <Box sx={{ p: 2 }}>
                <LinearProgress />
              </Box>
            ) : pipelines.length === 0 ? (
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No pipelines created yet
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  component={RouterLink}
                  to="/pipelines/create"
                  sx={{ mt: 2 }}
                >
                  Create Your First Pipeline
                </Button>
              </CardContent>
            ) : (
              <List sx={{ flex: 1, overflow: 'auto' }}>
                {pipelines.map((pipeline) => (
                  <React.Fragment key={pipeline.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          component={RouterLink}
                          to={`/pipelines/${pipeline.id}`}
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                      }
                      disablePadding
                    >
                      <ListItemButton component={RouterLink} to={`/pipelines/${pipeline.id}`}>
                        <ListItemAvatar>
                          <StatusChip status={pipeline.status} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={pipeline.name}
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {pipeline.source_type} → {pipeline.destination_type}
                              </Typography>
                              <br />
                              <Typography variant="caption" display="block">
                                Last run: {formatDate(pipeline.last_run_at)}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
            
            <CardActions sx={{ justifyContent: 'center', p: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                component={RouterLink}
                to="/pipelines/create"
                startIcon={<AddIcon />}
              >
                Create New Pipeline
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Recent Jobs */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              title="Recent Jobs" 
              action={
                <Box>
                  <IconButton 
                    size="small" 
                    aria-label="refresh" 
                    onClick={() => refetchJobs()}
                  >
                    <RefreshIcon />
                  </IconButton>
                  <Button 
                    component={RouterLink} 
                    to="/jobs" 
                    endIcon={<ArrowForwardIcon />}
                    sx={{ ml: 1 }}
                  >
                    View All
                  </Button>
                </Box>
              }
            />
            <Divider />
            
            {jobsLoading ? (
              <Box sx={{ p: 2 }}>
                <LinearProgress />
              </Box>
            ) : jobs.length === 0 ? (
              <CardContent sx={{ textAlign: 'center', py: 5 }}>
                <Typography variant="body1" color="text.secondary">
                  No jobs have been executed yet
                </Typography>
              </CardContent>
            ) : (
              <List sx={{ flex: 1, overflow: 'auto' }}>
                {jobs.map((job) => (
                  <React.Fragment key={job.id}>
                    <ListItem
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          component={RouterLink}
                          to={`/jobs/${job.id}`}
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                      }
                      disablePadding
                    >
                      <ListItemButton component={RouterLink} to={`/jobs/${job.id}`}>
                        <ListItemAvatar>
                          <StatusChip status={job.status} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={job.pipeline_name}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="caption" display="block">
                                Started: {formatDate(job.started_at)}
                              </Typography>
                              {job.error_count > 0 && (
                                <Chip
                                  label={`${job.error_count} errors`}
                                  size="small"
                                  color="error"
                                  sx={{ mt: 0.5 }}
                                />
                              )}
                            </React.Fragment>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Card>
        </Grid>
      </Grid>
      
      {/* Getting Started */}
      <Card sx={{ mt: 3 }}>
        <CardHeader title="Getting Started" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: 'primary.light', 
                      color: 'primary.contrastText',
                      borderRadius: '50%',
                      width: 48,
                      height: 48,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <StorageIcon />
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    1. Configure Source
                  </Typography>
                  <Typography variant="body2" align="center" color="text.secondary">
                    Set up connections to your data sources
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button 
                    component={RouterLink} 
                    to="/sources"
                    endIcon={<ArrowForwardIcon />}
                  >
                    Explore Sources
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: 'info.light', 
                      color: 'info.contrastText',
                      borderRadius: '50%',
                      width: 48,
                      height: 48,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <StorageIcon />
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    2. Configure Destinations
                  </Typography>
                  <Typography variant="body2" align="center" color="text.secondary">
                    Set up where you want to send your data
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button 
                    component={RouterLink} 
                    to="/destinations"
                    endIcon={<ArrowForwardIcon />}
                  >
                    Explore Destinations
                  </Button>
                </CardActions>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: 'success.light', 
                      color: 'success.contrastText',
                      borderRadius: '50%',
                      width: 48,
                      height: 48,
                      mx: 'auto',
                      mb: 2
                    }}
                  >
                    <SwapHorizIcon />
                  </Box>
                  <Typography variant="h6" align="center" gutterBottom>
                    3. Create Pipeline
                  </Typography>
                  <Typography variant="body2" align="center" color="text.secondary">
                    Connect sources to destinations and start moving data
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button 
                    variant="contained"
                    color="primary"
                    component={RouterLink} 
                    to="/pipelines/create"
                  >
                    Create Pipeline
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;