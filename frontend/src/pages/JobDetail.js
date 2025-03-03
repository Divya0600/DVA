// src/pages/JobDetail.js
import React, { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Link,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  AccessTime as AccessTimeIcon,
  ArrowForward as ArrowForwardIcon,
  Description as DescriptionIcon,
  BugReport as BugReportIcon,
  DataArray as DataArrayIcon,
  Details as DetailsIcon,
  Link as LinkIcon,
} from '@mui/icons-material';

import apiService from '../services/api';

// Status chip component
const StatusChip = ({ status }) => {
  let color, icon, label;
  
  switch (status) {
    case 'completed':
      color = 'success';
      icon = <CheckCircleIcon fontSize="small" />;
      label = 'Completed';
      break;
    case 'running':
      color = 'info';
      icon = <AccessTimeIcon fontSize="small" />;
      label = 'Running';
      break;
    case 'pending':
      color = 'warning';
      icon = <InfoIcon fontSize="small" />;
      label = 'Pending';
      break;
    case 'failed':
      color = 'error';
      icon = <ErrorIcon fontSize="small" />;
      label = 'Failed';
      break;
    case 'cancelled':
      color = 'default';
      icon = <CancelIcon fontSize="small" />;
      label = 'Cancelled';
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

// Helper function to format date
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

// Log Level component
const LogLevel = ({ level }) => {
  let color;
  
  switch (level) {
    case 'info':
      color = 'info';
      break;
    case 'warning':
      color = 'warning';
      break;
    case 'error':
      color = 'error';
      break;
    case 'debug':
      color = 'secondary';
      break;
    default:
      color = 'default';
  }
  
  return (
    <Chip 
      size="small" 
      color={color} 
      label={level.toUpperCase()} 
      variant="outlined" 
    />
  );
};

// JSON Viewer Component
const JsonViewer = ({ data }) => {
  // Format the JSON for display with proper indentation
  const formattedJson = JSON.stringify(data, null, 2);
  
  return (
    <Box
      component="pre"
      sx={{
        p: 2,
        borderRadius: 1,
        bgcolor: 'grey.100',
        color: 'grey.900',
        overflow: 'auto',
        fontSize: '0.875rem',
        fontFamily: '"Roboto Mono", monospace',
        maxHeight: '400px'
      }}
    >
      {formattedJson ? formattedJson : '{}'}
    </Box>
  );
};

// Tab Panel component
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
};

const JobDetail = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  
  // State for tabs and confirmation dialogs
  const [tabValue, setTabValue] = useState(0);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Fetch job details
  const {
    data: jobResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ['job', jobId],
    () => apiService.jobs.get(jobId),
    {
      refetchInterval: (data) => {
        const jobStatus = data?.data?.status;
        return tabValue === 0 && ['running', 'pending'].includes(jobStatus) ? 5000 : false;
      },
    }
  );
  
  // Get job status
  const {
    data: statusResponse,
    refetch: refetchStatus,
  } = useQuery(
    ['job-status', jobId],
    () => apiService.jobs.getStatus(jobId),
    {
      refetchInterval: (data) => {
        const jobStatus = jobResponse?.data?.status;
        return ['running', 'pending'].includes(jobStatus) ? 5000 : false;
      },
      enabled: !!jobResponse,
    }
  );
  
  // Retry job mutation
  const retryMutation = useMutation(
    () => apiService.jobs.retry(jobId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['job', jobId]);
        queryClient.invalidateQueries(['job-status', jobId]);
        queryClient.invalidateQueries(['jobs']);
        queryClient.invalidateQueries(['pipeline-jobs']);
        setConfirmDialogOpen(false);
      },
    }
  );
  
  // Cancel job mutation
  const cancelMutation = useMutation(
    () => apiService.jobs.cancel(jobId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['job', jobId]);
        queryClient.invalidateQueries(['job-status', jobId]);
        queryClient.invalidateQueries(['jobs']);
        queryClient.invalidateQueries(['pipeline-jobs']);
        setConfirmDialogOpen(false);
      },
    }
  );
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle retry job
  const handleRetry = () => {
    setConfirmAction('retry');
    setConfirmDialogOpen(true);
  };
  
  // Handle cancel job
  const handleCancel = () => {
    setConfirmAction('cancel');
    setConfirmDialogOpen(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setConfirmDialogOpen(false);
    setConfirmAction(null);
  };
  
  // Handle dialog confirm action
  const handleConfirmAction = () => {
    if (confirmAction === 'retry') {
      retryMutation.mutate();
    } else if (confirmAction === 'cancel') {
      cancelMutation.mutate();
    }
  };
  
  // Handle refresh
  const handleRefresh = () => {
    refetch();
    refetchStatus();
  };
  
  // Extract job data
  const job = jobResponse?.data;
  const taskStatus = statusResponse?.data?.task;
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (isError || !job) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading job: {error?.message || 'Unknown error'}
        </Alert>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/jobs')}
        >
          Back to Jobs
        </Button>
      </Box>
    );
  }
  
  // Format times for display
  const startTime = formatDate(job.started_at);
  const endTime = formatDate(job.completed_at);
  const duration = formatDuration(job.duration);
  
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge="start"
              onClick={() => navigate('/jobs')}
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5" component="h1">
                  Job Details
                </Typography>
                <StatusChip status={job.status} />
              </Stack>
              <Typography 
                variant="body2" 
                color="text.secondary"
                component={RouterLink}
                to={`/pipelines/${job.pipeline}`}
                sx={{ mt: 0.5, display: 'flex', alignItems: 'center', textDecoration: 'none' }}
              >
                Pipeline: {job.pipeline_name}
                <LinkIcon fontSize="small" sx={{ ml: 0.5 }} />
              </Typography>
            </Box>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            
            {job.status === 'failed' && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={handleRetry}
                disabled={retryMutation.isLoading}
              >
                Retry Job
              </Button>
            )}
            
            {(job.status === 'pending' || job.status === 'running') && (
              <Button
                variant="contained"
                color="error"
                startIcon={<CancelIcon />}
                onClick={handleCancel}
                disabled={cancelMutation.isLoading}
              >
                Cancel Job
              </Button>
            )}
            
            <Button
              variant="outlined"
              startIcon={<LinkIcon />}
              component={RouterLink}
              to={`/pipelines/${job.pipeline}`}
            >
              View Pipeline
            </Button>
          </Stack>
        </Stack>
      </Paper>
      
      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Pipeline
              </Typography>
              <Typography variant="h5" component={Link} 
                to={`/pipelines/${job.pipeline}`} 
                sx={{ textDecoration: 'none' }}
              >
                {job.pipeline_name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip 
                  label={job.pipeline_source_type || 'Unknown'} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
                <ArrowForwardIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Chip 
                  label={job.pipeline_destination_type || 'Unknown'} 
                  size="small" 
                  color="secondary" 
                  variant="outlined"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Timing
              </Typography>
              <Typography variant="h5">{duration}</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Started: {startTime}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed: {endTime}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Records
              </Typography>
              <Typography variant="h5">
                {job.source_record_count !== null ? job.source_record_count : '-'} → {job.destination_record_count !== null ? job.destination_record_count : '-'}
              </Typography>
              {job.error_count > 0 && (
                <Chip 
                  label={`${job.error_count} errors`} 
                  size="small" 
                  color="error"
                  sx={{ mt: 1 }}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Pending or Running status indicator */}
      {(job.status === 'pending' || job.status === 'running') && (
        <Alert 
          severity="info" 
          icon={<AccessTimeIcon />}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Refresh
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {job.status === 'running' 
            ? 'This job is currently running. Information will update automatically.' 
            : 'This job is pending execution. It will start soon.'}
          <LinearProgress sx={{ mt: 1 }} />
        </Alert>
      )}
      
      {/* Tabs */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="job details tabs"
          >
            <Tab 
              icon={<DescriptionIcon />} 
              iconPosition="start" 
              label="Logs" 
              id="tab-0" 
              aria-controls="tabpanel-0" 
            />
            <Tab 
              icon={<BugReportIcon />} 
              iconPosition="start" 
              label={`Errors (${job.error_count || 0})`} 
              id="tab-1" 
              aria-controls="tabpanel-1" 
            />
            <Tab 
              icon={<DataArrayIcon />} 
              iconPosition="start" 
              label="Results" 
              id="tab-2" 
              aria-controls="tabpanel-2" 
            />
            <Tab 
              icon={<DetailsIcon />} 
              iconPosition="start" 
              label="Details" 
              id="tab-3" 
              aria-controls="tabpanel-3" 
            />
          </Tabs>
        </Box>
        
        {/* Logs Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center" 
              sx={{ mb: 2 }}
            >
              <Typography variant="h6">Execution Logs</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
            </Stack>
            
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 500 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="180">Timestamp</TableCell>
                    <TableCell width="100">Level</TableCell>
                    <TableCell>Message</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {job.logs && job.logs.length > 0 ? (
                    job.logs.map((log, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {formatDate(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <LogLevel level={log.level} />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'pre-wrap' }}>
                          {log.message}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No logs available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
        
        {/* Errors Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Error Details
            </Typography>
            
            {job.errors && job.errors.length > 0 ? (
              <Stack spacing={2}>
                {job.errors.map((error, index) => (
                  <Card key={index} variant="outlined" sx={{ borderColor: 'error.light' }}>
                    <CardHeader
                      title={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <ErrorIcon color="error" />
                          <Typography variant="h6" color="error.main">
                            Error
                          </Typography>
                        </Stack>
                      }
                      subheader={formatDate(error.timestamp)}
                    />
                    <Divider />
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        {error.message}
                      </Typography>
                      
                      {error.details && (
                        <>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
                            Details:
                          </Typography>
                          <JsonViewer data={error.details} />
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Alert severity="success" icon={<CheckCircleIcon />}>
                No errors reported for this job
              </Alert>
            )}
          </Box>
        </TabPanel>
        
        {/* Results Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Data Transfer Results
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Source Data" />
                  <Divider />
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Records Retrieved</Typography>
                        <Typography variant="h4">{job.source_record_count !== null ? job.source_record_count : 'N/A'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          From {job.pipeline_source_type || 'Unknown'}
                        </Typography>
                      </Box>
                      
                      {taskStatus && taskStatus.info && taskStatus.info.source_details && (
                        <>
                          <Typography variant="subtitle2">Additional Details</Typography>
                          <JsonViewer data={taskStatus.info.source_details} />
                        </>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Destination Data" />
                  <Divider />
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">Records Uploaded</Typography>
                        <Typography variant="h4">{job.destination_record_count !== null ? job.destination_record_count : 'N/A'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          To {job.pipeline_destination_type || 'Unknown'}
                        </Typography>
                      </Box>
                      
                      {taskStatus && taskStatus.info && taskStatus.info.destination_details && (
                        <>
                          <Typography variant="subtitle2">Additional Details</Typography>
                          <JsonViewer data={taskStatus.info.destination_details} />
                        </>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardHeader title="Transfer Summary" />
                  <Divider />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">Success Rate</Typography>
                          <Typography variant="h4">
                            {job.source_record_count && job.destination_record_count ? 
                              `${Math.round((job.destination_record_count / job.source_record_count) * 100)}%` : 
                              'N/A'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {job.error_count > 0 ? 
                              <Box component="span" color="error.main">{job.error_count} errors</Box> : 
                              <Box component="span" color="success.main">No errors</Box>}
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">Processing Time</Typography>
                          <Typography variant="h4">{formatDuration(job.duration)}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total execution time
                          </Typography>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                          <Box sx={{ my: 1 }}>
                            <StatusChip status={job.status} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {job.status === 'completed' ? 'Successfully completed' : 
                              job.status === 'failed' ? 'Failed with errors' :
                              job.status === 'running' ? 'Currently in progress' :
                              job.status === 'pending' ? 'Waiting to start' :
                              job.status === 'cancelled' ? 'Cancelled by user' : ''}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        {/* Details Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Job Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Job Information" />
                  <Divider />
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ width: 150 }}>
                          Job ID:
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace', overflowWrap: 'break-word' }}>
                          {job.id}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" spacing={2}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ width: 150 }}>
                          Task ID:
                        </Typography>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace', overflowWrap: 'break-word' }}>
                          {job.task_id || 'None'}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" spacing={2}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ width: 150 }}>
                          Pipeline:
                        </Typography>
                        <Link 
                          component={RouterLink}
                          to={`/pipelines/${job.pipeline}`}
                          underline="hover"
                        >
                          {job.pipeline_name}
                        </Link>
                      </Stack>
                      
                      <Stack direction="row" spacing={2}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ width: 150 }}>
                          Created:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(job.created_at)}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" spacing={2}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ width: 150 }}>
                          Started:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(job.started_at)}
                        </Typography>
                      </Stack>
                      
                      <Stack direction="row" spacing={2}>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ width: 150 }}>
                          Completed:
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(job.completed_at)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardHeader title="Task Status" />
                  <Divider />
                  <CardContent>
                    {taskStatus ? (
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2}>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ width: 150 }}>
                            Task ID:
                          </Typography>
                          <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                            {taskStatus.task_id || 'None'}
                          </Typography>
                        </Stack>
                        
                        <Stack direction="row" spacing={2}>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ width: 150 }}>
                            State:
                          </Typography>
                          <Chip 
                            label={taskStatus.state} 
                            size="small"
                            color={
                              taskStatus.state === 'SUCCESS' ? 'success' :
                              taskStatus.state === 'FAILURE' ? 'error' :
                              taskStatus.state === 'PENDING' ? 'warning' :
                              taskStatus.state === 'STARTED' ? 'info' : 'default'
                            }
                          />
                        </Stack>
                        
                        {taskStatus.info && (
                          <>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Task Result:
                            </Typography>
                            <JsonViewer data={taskStatus.info} />
                          </>
                        )}
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">
                        No task status information available
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Box>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {confirmAction === 'retry' ? 'Retry Failed Job?' : 'Cancel Running Job?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmAction === 'retry'
              ? 'Are you sure you want to retry this failed job? A new job execution will be started.'
              : 'Are you sure you want to cancel this job? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>No</Button>
          <Button 
            onClick={handleConfirmAction} 
            autoFocus
            color={confirmAction === 'cancel' ? 'error' : 'primary'}
          >
            Yes, {confirmAction === 'retry' ? 'Retry' : 'Cancel'} Job
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobDetail;