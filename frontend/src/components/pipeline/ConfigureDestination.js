// src/components/pipeline/ConfigureDestination.js
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';

// Dynamic destination configuration component
const ConfigureDestination = ({
  destinationType,
  config,
  onConfigChange,
  onTestConnection,
  isConnected,
  isConnecting,
  connectionError,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Generate form based on destination type
  const renderDestinationForm = () => {
    switch (destinationType) {
      case 'jira':
        return renderJiraForm();
      case 'alm':
        return renderALMForm();
      case 'mysql':
      case 'postgres':
      case 'mongodb':
        return renderDatabaseForm();
      case 'sharepoint':
        return renderSharePointForm();
      case 'confluence':
        return renderConfluenceForm();
      case 'rest':
        return renderRESTForm();
      default:
        return (
          <Typography variant="body1" color="error">
            Unknown destination type: {destinationType}
          </Typography>
        );
    }
  };
  
  // JIRA-specific form
  const renderJiraForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Jira URL"
          placeholder="https://your-domain.atlassian.net"
          value={config.base_url || ''}
          onChange={(e) => onConfigChange({ base_url: e.target.value })}
          required
          helperText="The base URL of your Jira instance"
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="auth-method-label">Authentication Method</InputLabel>
          <Select
            labelId="auth-method-label"
            value={config.auth_method || 'basic'}
            onChange={(e) => onConfigChange({ auth_method: e.target.value })}
            label="Authentication Method"
          >
            <MenuItem value="basic">Basic Authentication</MenuItem>
            <MenuItem value="token">API Token</MenuItem>
            <MenuItem value="oauth">OAuth</MenuItem>
          </Select>
          <FormHelperText>How to authenticate with Jira</FormHelperText>
        </FormControl>
      </Grid>
      
      {config.auth_method === 'basic' && (
        <>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Username"
              value={config.username || ''}
              onChange={(e) => onConfigChange({ username: e.target.value })}
              required
              helperText="Your Jira username or email"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="password">Password</InputLabel>
              <OutlinedInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={config.password || ''}
                onChange={(e) => onConfigChange({ password: e.target.value })}
                endAdornment={
                  <InputAdornment position="end">
                    <Button
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </Button>
                  </InputAdornment>
                }
                label="Password"
              />
              <FormHelperText>Your Jira password</FormHelperText>
            </FormControl>
          </Grid>
        </>
      )}
      
      {config.auth_method === 'token' && (
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined">
            <InputLabel htmlFor="api-token">API Token</InputLabel>
            <OutlinedInput
              id="api-token"
              type={showPassword ? 'text' : 'password'}
              value={config.api_token || ''}
              onChange={(e) => onConfigChange({ api_token: e.target.value })}
              endAdornment={
                <InputAdornment position="end">
                  <Button
                    aria-label="toggle token visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </Button>
                </InputAdornment>
              }
              label="API Token"
            />
            <FormHelperText>Your Jira API token</FormHelperText>
          </FormControl>
        </Grid>
      )}
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Project Key"
          value={config.project_key || ''}
          onChange={(e) => onConfigChange({ project_key: e.target.value })}
          required
          helperText="Jira project key (e.g., PROJ)"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Issue Type"
          value={config.issue_type || 'Bug'}
          onChange={(e) => onConfigChange({ issue_type: e.target.value })}
          required
          helperText="Default issue type to create"
          placeholder="Bug, Task, Story, etc."
        />
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Field Mapping
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Map fields from source to Jira fields
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Summary Field"
              value={config.field_mapping?.summary || 'summary'}
              onChange={(e) => onConfigChange({ 
                field_mapping: { 
                  ...(config.field_mapping || {}), 
                  summary: e.target.value 
                } 
              })}
              helperText="Source field to use for Jira issue summary"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Description Field"
              value={config.field_mapping?.description || 'description'}
              onChange={(e) => onConfigChange({ 
                field_mapping: { 
                  ...(config.field_mapping || {}), 
                  description: e.target.value 
                } 
              })}
              helperText="Source field to use for Jira issue description"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Additional Field Mappings"
              multiline
              rows={3}
              value={config.field_mapping_json || ''}
              onChange={(e) => {
                try {
                  const fieldMapping = JSON.parse(e.target.value);
                  onConfigChange({ 
                    field_mapping: { 
                      ...(config.field_mapping || {}),
                      ...fieldMapping
                    },
                    field_mapping_json: e.target.value
                  });
                } catch (error) {
                  onConfigChange({ field_mapping_json: e.target.value });
                }
              }}
              helperText="Additional field mappings as JSON object (e.g., { 'jiraField': 'sourceField' })"
              placeholder='{"priority": "severity", "labels": "tags"}'
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
  
  // ALM-specific form
  const renderALMForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="ALM URL"
          placeholder="https://quality-center.example.com/qcbin"
          value={config.base_url || ''}
          onChange={(e) => onConfigChange({ base_url: e.target.value })}
          required
          helperText="The base URL of your ALM instance"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Client ID"
          value={config.client_id || ''}
          onChange={(e) => onConfigChange({ client_id: e.target.value })}
          required
          helperText="API client ID for authentication"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="client-secret">Client Secret</InputLabel>
          <OutlinedInput
            id="client-secret"
            type={showPassword ? 'text' : 'password'}
            value={config.client_secret || ''}
            onChange={(e) => onConfigChange({ client_secret: e.target.value })}
            endAdornment={
              <InputAdornment position="end">
                <Button
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </Button>
              </InputAdornment>
            }
            label="Client Secret"
          />
          <FormHelperText>Secret key for API authentication</FormHelperText>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Domain"
          value={config.domain || ''}
          onChange={(e) => onConfigChange({ domain: e.target.value })}
          required
          helperText="ALM domain (e.g., DEFAULT)"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Project"
          value={config.project || ''}
          onChange={(e) => onConfigChange({ project: e.target.value })}
          required
          helperText="ALM project name"
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="entity-type-label">Entity Type</InputLabel>
          <Select
            labelId="entity-type-label"
            value={config.entity_type || 'defects'}
            onChange={(e) => onConfigChange({ entity_type: e.target.value })}
            label="Entity Type"
          >
            <MenuItem value="defects">Defects</MenuItem>
            <MenuItem value="tests">Tests</MenuItem>
            <MenuItem value="requirements">Requirements</MenuItem>
          </Select>
          <FormHelperText>Type of entities to create in ALM</FormHelperText>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Field Mapping
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Map fields from source to ALM fields
        </Typography>
        
        <TextField
          fullWidth
          label="Field Mappings"
          multiline
          rows={3}
          value={config.field_mapping ? JSON.stringify(config.field_mapping, null, 2) : ''}
          onChange={(e) => {
            try {
              const fieldMapping = JSON.parse(e.target.value);
              onConfigChange({ field_mapping: fieldMapping });
            } catch (error) {
              // Handle JSON parse error
            }
          }}
          helperText="Field mappings as JSON object (e.g., { 'almField': 'sourceField' })"
          placeholder='{"name": "summary", "description": "description"}'
        />
      </Grid>
    </Grid>
  );
  
  // Database-specific form (MySQL, PostgreSQL, MongoDB)
  const renderDatabaseForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <TextField
          fullWidth
          label="Host"
          placeholder="db.example.com"
          value={config.host || ''}
          onChange={(e) => onConfigChange({ host: e.target.value })}
          required
          helperText="Database server hostname or IP address"
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Port"
          placeholder={destinationType === 'mysql' ? '3306' : destinationType === 'postgres' ? '5432' : '27017'}
          value={config.port || ''}
          onChange={(e) => onConfigChange({ port: e.target.value })}
          required
          helperText="Database server port"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Database"
          value={config.database || ''}
          onChange={(e) => onConfigChange({ database: e.target.value })}
          required
          helperText="Database name"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Username"
          value={config.username || ''}
          onChange={(e) => onConfigChange({ username: e.target.value })}
          required
          helperText="Database username"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="password">Password</InputLabel>
          <OutlinedInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={config.password || ''}
            onChange={(e) => onConfigChange({ password: e.target.value })}
            endAdornment={
              <InputAdornment position="end">
                <Button
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </Button>
              </InputAdornment>
            }
            label="Password"
          />
          <FormHelperText>Database password</FormHelperText>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Table"
          value={config.table || ''}
          onChange={(e) => onConfigChange({ table: e.target.value })}
          required
          helperText="Table name to insert data into"
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Field Mappings"
          multiline
          rows={3}
          value={config.field_mapping ? JSON.stringify(config.field_mapping, null, 2) : ''}
          onChange={(e) => {
            try {
              const fieldMapping = JSON.parse(e.target.value);
              onConfigChange({ field_mapping: fieldMapping });
            } catch (error) {
              // Handle JSON parse error
            }
          }}
          helperText="Map source fields to database columns as JSON object"
          placeholder='{"source_field1": "db_column1", "source_field2": "db_column2"}'
        />
      </Grid>
    </Grid>
  );
  
  // REST API form
  const renderRESTForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="API URL"
          placeholder="https://api.example.com/v1/data"
          value={config.base_url || ''}
          onChange={(e) => onConfigChange({ base_url: e.target.value })}
          required
          helperText="The base URL of the REST API"
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="auth-method-label">Authentication Method</InputLabel>
          <Select
            labelId="auth-method-label"
            value={config.auth_method || 'none'}
            onChange={(e) => onConfigChange({ auth_method: e.target.value })}
            label="Authentication Method"
          >
            <MenuItem value="none">No Authentication</MenuItem>
            <MenuItem value="basic">Basic Authentication</MenuItem>
            <MenuItem value="token">API Token</MenuItem>
            <MenuItem value="oauth">OAuth</MenuItem>
          </Select>
          <FormHelperText>How to authenticate with the API</FormHelperText>
        </FormControl>
      </Grid>
      
      {config.auth_method === 'basic' && (
        <>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Username"
              value={config.username || ''}
              onChange={(e) => onConfigChange({ username: e.target.value })}
              required
              helperText="API username"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined">
              <InputLabel htmlFor="password">Password</InputLabel>
              <OutlinedInput
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={config.password || ''}
                onChange={(e) => onConfigChange({ password: e.target.value })}
                endAdornment={
                  <InputAdornment position="end">
                    <Button
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </Button>
                  </InputAdornment>
                }
                label="Password"
              />
              <FormHelperText>API password</FormHelperText>
            </FormControl>
          </Grid>
        </>
      )}
      
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="method-label">HTTP Method</InputLabel>
          <Select
            labelId="method-label"
            value={config.method || 'POST'}
            onChange={(e) => onConfigChange({ method: e.target.value })}
            label="HTTP Method"
          >
            <MenuItem value="POST">POST</MenuItem>
            <MenuItem value="PUT">PUT</MenuItem>
            <MenuItem value="PATCH">PATCH</MenuItem>
          </Select>
          <FormHelperText>HTTP method to use when calling the API</FormHelperText>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Headers"
          multiline
          rows={3}
          value={config.headers ? JSON.stringify(config.headers, null, 2) : ''}
          onChange={(e) => {
            try {
              const headers = JSON.parse(e.target.value);
              onConfigChange({ headers });
            } catch (error) {
              // Handle JSON parse error
            }
          }}
          helperText="HTTP headers as JSON object"
          placeholder='{"Content-Type": "application/json", "Accept": "application/json"}'
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Field Transformations"
          multiline
          rows={3}
          value={config.field_transformations ? JSON.stringify(config.field_transformations, null, 2) : ''}
          onChange={(e) => {
            try {
              const transformations = JSON.parse(e.target.value);
              onConfigChange({ field_transformations: transformations });
            } catch (error) {
              // Handle JSON parse error
            }
          }}
          helperText="Transformations to apply to source data before sending"
          placeholder='{"remap_fields": {"old_name": "new_name"}, "exclude_fields": ["field_to_exclude"]}'
        />
      </Grid>
    </Grid>
  );
  
  // SharePoint-specific form
  const renderSharePointForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="SharePoint URL"
          placeholder="https://company.sharepoint.com/sites/sitename"
          value={config.base_url || ''}
          onChange={(e) => onConfigChange({ base_url: e.target.value })}
          required
          helperText="The URL of your SharePoint site"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Client ID"
          value={config.client_id || ''}
          onChange={(e) => onConfigChange({ client_id: e.target.value })}
          required
          helperText="SharePoint app client ID"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="client-secret">Client Secret</InputLabel>
          <OutlinedInput
            id="client-secret"
            type={showPassword ? 'text' : 'password'}
            value={config.client_secret || ''}
            onChange={(e) => onConfigChange({ client_secret: e.target.value })}
            endAdornment={
              <InputAdornment position="end">
                <Button
                  aria-label="toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </Button>
              </InputAdornment>
            }
            label="Client Secret"
          />
          <FormHelperText>SharePoint app client secret</FormHelperText>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="List Name"
          value={config.list_name || ''}
          onChange={(e) => onConfigChange({ list_name: e.target.value })}
          required
          helperText="Name of the SharePoint list to add items to"
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Field Mappings"
          multiline
          rows={3}
          value={config.field_mapping ? JSON.stringify(config.field_mapping, null, 2) : ''}
          onChange={(e) => {
            try {
              const fieldMapping = JSON.parse(e.target.value);
              onConfigChange({ field_mapping: fieldMapping });
            } catch (error) {
              // Handle JSON parse error
            }
          }}
          helperText="Map source fields to SharePoint fields as JSON object"
          placeholder='{"source_field1": "sharepoint_field1", "source_field2": "sharepoint_field2"}'
        />
      </Grid>
    </Grid>
  );
  
  // Confluence-specific form
  const renderConfluenceForm = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Confluence URL"
          placeholder="https://company.atlassian.net/wiki"
          value={config.base_url || ''}
          onChange={(e) => onConfigChange({ base_url: e.target.value })}
          required
          helperText="The base URL of your Confluence instance"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Username"
          value={config.username || ''}
          onChange={(e) => onConfigChange({ username: e.target.value })}
          required
          helperText="Confluence username or email"
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="api-token">API Token</InputLabel>
          <OutlinedInput
            id="api-token"
            type={showPassword ? 'text' : 'password'}
            value={config.api_token || ''}
            onChange={(e) => onConfigChange({ api_token: e.target.value })}
            endAdornment={
              <InputAdornment position="end">
                <Button
                  aria-label="toggle token visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                >
                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </Button>
              </InputAdornment>
            }
            label="API Token"
          />
          <FormHelperText>Confluence API token</FormHelperText>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Space Key"
          value={config.space_key || ''}
          onChange={(e) => onConfigChange({ space_key: e.target.value })}
          required
          helperText="Confluence space key"
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="content-type-label">Content Type</InputLabel>
          <Select
            labelId="content-type-label"
            value={config.content_type || 'page'}
            onChange={(e) => onConfigChange({ content_type: e.target.value })}
            label="Content Type"
          >
            <MenuItem value="page">Page</MenuItem>
            <MenuItem value="blogpost">Blog Post</MenuItem>
          </Select>
          <FormHelperText>Type of content to create</FormHelperText>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Parent Page ID"
          value={config.parent_id || ''}
          onChange={(e) => onConfigChange({ parent_id: e.target.value })}
          helperText="ID of the parent page (leave empty for top-level pages)"
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Field Mappings"
          multiline
          rows={3}
          value={config.field_mapping ? JSON.stringify(config.field_mapping, null, 2) : ''}
          onChange={(e) => {
            try {
              const fieldMapping = JSON.parse(e.target.value);
              onConfigChange({ field_mapping: fieldMapping });
            } catch (error) {
              // Handle JSON parse error
            }
          }}
          helperText="Map source fields to Confluence fields as JSON object"
          placeholder='{"title_field": "sourceField1", "content_field": "sourceField2"}'
        />
      </Grid>
    </Grid>
  );
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure {destinationType.toUpperCase()} Connection
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Enter your connection details to establish a connection to the destination system
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 4, p: 3 }}>
        {renderDestinationForm()}
      </Card>
      
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          {isConnected && (
            <Alert
              icon={<CheckCircleIcon fontSize="inherit" />}
              severity="success"
              sx={{ mb: 2 }}
            >
              Connection established successfully!
            </Alert>
          )}
          
          {connectionError && (
            <Alert
              icon={<ErrorIcon fontSize="inherit" />}
              severity="error"
              sx={{ mb: 2 }}
            >
              {connectionError}
            </Alert>
          )}
        </Box>
        
        <Button
          variant="contained"
          color={isConnected ? "success" : "primary"}
          onClick={onTestConnection}
          disabled={isConnecting}
          sx={{ minWidth: '150px' }}
        >
          {isConnecting ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Testing...
            </>
          ) : isConnected ? (
            <>
              <CheckCircleIcon sx={{ mr: 1 }} />
              Connected
            </>
          ) : (
            'Test Connection'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ConfigureDestination;
