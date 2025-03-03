// src/pages/PipelineList.js
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemIcon,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  PlayArrow as PlayArrowIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

import apiService from '../services/api';

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
      icon = <ErrorIcon fontSize="small" />;
      label = 'Error';
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

const PipelineList = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State for search, filter, and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Pipeline actions menu state
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  
  // Get pipelines with filters
  const {
    data: pipelinesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(
    ['pipelines', searchQuery, statusFilter, page, rowsPerPage],
    () => apiService.pipelines.getAll({
      search: searchQuery,
      status: statusFilter,
      page: page + 1, // API uses 1-based indexing
      page_size: rowsPerPage,
    }),
    {
      keepPreviousData: true,
    }
  );
  
  // Execute pipeline mutation
  const executeMutation = useMutation(
    (pipelineId) => apiService.pipelines.execute(pipelineId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pipelines']);
        setActionMenuAnchor(null);
      },
    }
  );
  
  // Extract pipeline data and total count
  const pipelines = pipelinesResponse?.data?.data || [];
  const totalCount = pipelinesResponse?.data?.count || 0;
  
  // Open actions menu for a pipeline
  const handleOpenActionMenu = (event, pipeline) => {
    event.stopPropagation();
    setActionMenuAnchor(event.currentTarget);
    setSelectedPipeline(pipeline);
  };
  
  // Close actions menu
  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setSelectedPipeline(null);
  };
  
  // Execute pipeline
  const handleExecutePipeline = () => {
    if (selectedPipeline) {
      executeMutation.mutate(selectedPipeline.id);
    }
  };
  
  // Navigate to edit pipeline
  const handleEditPipeline = () => {
    if (selectedPipeline) {
      navigate(`/pipelines/${selectedPipeline.id}/edit`);
    }
    handleCloseActionMenu();
  };
  
  // Handle pagination changes
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle row click to navigate to pipeline details
  const handleRowClick = (pipelineId) => {
    navigate(`/pipelines/${pipelineId}`);
  };
  
  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'stretch', sm: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h5" component="h1" gutterBottom={1}>
              Pipelines
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure data flows between sources and destinations
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/pipelines/create"
          >
            Create Pipeline
          </Button>
        </Stack>
      </Paper>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          alignItems="center"
        >
          <TextField
            fullWidth
            placeholder="Search pipelines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
              displayEmpty
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="error">Error</MenuItem>
            </Select>
          </FormControl>
          
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={refetch}
          >
            Refresh
          </Button>
          
          {(searchQuery || statusFilter) && (
            <Button 
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          )}
        </Stack>
      </Paper>
      
      {/* Pipelines Table */}
      <Paper sx={{ width: '100%', mb: 3 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error" gutterBottom>
              Error loading pipelines: {error?.message || 'Unknown error'}
            </Typography>
            <Button 
              startIcon={<RefreshIcon />} 
              onClick={refetch}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Try Again
            </Button>
          </Box>
        ) : pipelines.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No Pipelines Found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {searchQuery || statusFilter ? 
                'No pipelines match your search criteria. Try adjusting your filters.' : 
                'Get started by creating your first pipeline'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={RouterLink}
              to="/pipelines/create"
              sx={{ mt: 2 }}
            >
              Create Pipeline
            </Button>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 750 }}>
                <TableHead>
                  <TableRow>
                    <TableCell width="50">Status</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Destination</TableCell>
                    <TableCell>Last Run</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pipelines.map((pipeline) => (
                    <TableRow
                      hover
                      key={pipeline.id}
                      onClick={() => handleRowClick(pipeline.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>
                        <StatusChip status={pipeline.status} />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="medium">{pipeline.name}</Typography>
                        {pipeline.description && (
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {pipeline.description}
                          </Typography>
                        )}
                        {pipeline.schedule && (
                          <Chip 
                            size="small" 
                            label={`Schedule: ${pipeline.schedule}`}
                            icon={<InfoIcon fontSize="small" />}
                            variant="outlined" 
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={pipeline.source_type || 'Unknown'} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={pipeline.destination_type || 'Unknown'} 
                          size="small" 
                          color="secondary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {formatDate(pipeline.last_run_at)}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title="Run Pipeline">
                            <IconButton 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                executeMutation.mutate(pipeline.id);
                              }}
                              disabled={pipeline.status !== 'active'}
                              size="small"
                            >
                              <PlayArrowIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Pipeline">
                            <IconButton 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/pipelines/${pipeline.id}/edit`);
                              }}
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <IconButton 
                            size="small"
                            onClick={(e) => handleOpenActionMenu(e, pipeline)}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalCount}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
        
        {/* Pipeline Actions Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleCloseActionMenu}
        >
          <MenuItem 
            onClick={handleExecutePipeline}
            disabled={selectedPipeline?.status !== 'active'}
          >
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" />
            </ListItemIcon>
            Run Pipeline
          </MenuItem>
          <MenuItem onClick={handleEditPipeline}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            Edit Pipeline
          </MenuItem>
          <Divider />
          <MenuItem 
            onClick={handleCloseActionMenu}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            Delete Pipeline
          </MenuItem>
        </Menu>
      </Paper>
    </Box>
  );
};

export default PipelineList;