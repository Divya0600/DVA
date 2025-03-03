// src/components/pipeline/ConfigureSource.js
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

// Dynamic source configuration component that renders different forms based on source type
const ConfigureSource = ({
  sourceType,
  config,
  onConfigChange,
  onTestConnection,
  isConnected,
  isConnecting,
  connectionError,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  // Generate form based on source type
  const renderSourceForm = () => {
    switch (sourceType) {
      case 'alm':
        return renderALMForm();
      case 'jira':
        return renderJiraForm();
      case 'rest':
        return renderRESTForm();
      case 'mysql':
      case 'postgres':
      case 'mongodb':
        return renderDatabaseForm();
      case 'sharepoint':
        return renderSharePointForm();
      case 'confluence':
        return renderConfluenceForm();
      default:
        return (
          <Typography variant="body1" color="error">
            Unknown source type: {sourceType}
          </Typography>
        );
    }
  };
  
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
            <MenuItem value="test-instances">Test Instances</MenuItem>
          </Select>
          <FormHelperText>Type of entities to retrieve from ALM</FormHelperText>
        </FormControl>
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
          placeholder={sourceType === 'mysql' ? '3306' : sourceType === 'postgres' ? '5432' : '27017'}
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
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="SQL Query"
          multiline
          rows={3}
          value={config.query || ''}
          onChange={(e) => onConfigChange({ query: e.target.value })}
          helperText="SQL query to execute (leave empty to use table configuration below)"
          placeholder={`SELECT * FROM users\nWHERE created_at > '2023-01-01'`}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Table"
          value={config.table || ''}
          onChange={(e) => onConfigChange({ table: e.target.value })}
          helperText="Table name (if not using custom query)"
        />
      </Grid>
    </Grid>
  );
  
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
      
      {config.auth_method === 'oauth' && (
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined">
            <InputLabel htmlFor="oauth-token">OAuth Token</InputLabel>
            <OutlinedInput
              id="oauth-token"
              type={showPassword ? 'text' : 'password'}
              value={config.oauth_token || ''}
              onChange={(e) => onConfigChange({ oauth_token: e.target.value })}
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
              label="OAuth Token"
            />
            <FormHelperText>Your Jira OAuth token</FormHelperText>
          </FormControl>
        </Grid>
      )}
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="JQL Query"
          multiline
          rows={3}
          value={config.jql_query || ''}
          onChange={(e) => onConfigChange({ jql_query: e.target.value })}
          helperText="JQL query to filter the issues"
          placeholder="project = PROJ AND status = 'In Progress'"
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
            <FormHelperText>Your API token</FormHelperText>
          </FormControl>
        </Grid>
      )}
      
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="method-label">HTTP Method</InputLabel>
          <Select
            labelId="method-label"
            value={config.method || 'GET'}
            onChange={(e) => onConfigChange({ method: e.target.value })}
            label="HTTP Method"
          >
            <MenuItem value="GET">GET</MenuItem>
            <MenuItem value="POST">POST</MenuItem>
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
      
      {config.method === 'POST' && (
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Request Body"
            multiline
            rows={3}
            value={config.body ? JSON.stringify(config.body, null, 2) : ''}
            onChange={(e) => {
              try {
                const body = JSON.parse(e.target.value);
                onConfigChange({ body });
              } catch (error) {
                // Handle JSON parse error
              }
            }}
            helperText="Request body as JSON object"
            placeholder='{"filter": {"status": "active"}}'
          />
        </Grid>
      )}
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
          helperText="Name of the SharePoint list to read from"
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
        <TextField
          fullWidth
          label="CQL Query"
          multiline
          rows={3}
          value={config.cql_query || ''}
          onChange={(e) => onConfigChange({ cql_query: e.target.value })}
          helperText="Confluence Query Language (CQL) to filter content"
          placeholder="space = 'SPACEKEY' AND type = 'page'"
        />
      </Grid>
    </Grid>
  );
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Configure {sourceType.toUpperCase()} Connection
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Enter your connection details to establish a connection to the source system
      </Typography>
      
      <Card variant="outlined" sx={{ mb: 4, p: 3 }}>
        {renderSourceForm()}
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

export default ConfigureSource;
