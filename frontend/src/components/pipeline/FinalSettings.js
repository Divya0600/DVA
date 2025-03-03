// src/components/pipeline/FinalSettings.js
import React from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

const FinalSettings = ({ pipelineConfig, onChange, errors }) => {
  // Handle schedule switch change
  const handleScheduleChange = (event) => {
    onChange({ is_scheduled: event.target.checked });
  };
  
  // Handle transformation switch change
  const handleTransformationChange = (event) => {
    onChange({ enable_transformation: event.target.checked });
  };
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    onChange({ [field]: value });
  };
  
  // Handle transformation config changes
  const handleTransformationConfigChange = (value) => {
    try {
      const config = JSON.parse(value);
      onChange({ 
        transformation_config: config,
        transformation_config_json: value
      });
    } catch (error) {
      onChange({ transformation_config_json: value });
    }
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Pipeline Settings
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Define pipeline name, schedule, and advanced settings
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Pipeline Name"
            value={pipelineConfig.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            error={Boolean(errors.name)}
            helperText={errors.name || 'Give your pipeline a descriptive name'}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            value={pipelineConfig.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            multiline
            rows={2}
            helperText="Optional: Describe the purpose of this pipeline"
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControl component="fieldset" variant="standard">
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={pipelineConfig.is_scheduled || false}
                    onChange={handleScheduleChange}
                    name="is_scheduled"
                  />
                }
                label="Run on Schedule"
              />
            </FormGroup>
            <FormHelperText>Enable to run this pipeline automatically on a schedule</FormHelperText>
          </FormControl>
        </Grid>
        
        {pipelineConfig.is_scheduled && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Cron Schedule"
              value={pipelineConfig.schedule || ''}
              onChange={(e) => handleInputChange('schedule', e.target.value)}
              required={pipelineConfig.is_scheduled}
              error={Boolean(errors.schedule)}
              helperText={errors.schedule || 'Cron expression (e.g., 0 0 * * * for daily at midnight)'}
              placeholder="0 0 * * *"
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="error-handling-label">Error Handling</InputLabel>
            <Select
              labelId="error-handling-label"
              value={pipelineConfig.error_handling || 'retry'}
              onChange={(e) => handleInputChange('error_handling', e.target.value)}
              label="Error Handling"
            >
              <MenuItem value="retry">Retry on error (3 attempts)</MenuItem>
              <MenuItem value="skip">Skip errors and continue</MenuItem>
              <MenuItem value="fail">Fail immediately on any error</MenuItem>
            </Select>
            <FormHelperText>How to handle errors during pipeline execution</FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12}>
          <FormControl component="fieldset" variant="standard">
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={pipelineConfig.enable_transformation || false}
                    onChange={handleTransformationChange}
                    name="enable_transformation"
                  />
                }
                label="Enable Data Transformation"
              />
            </FormGroup>
            <FormHelperText>Enable to apply transformations to the data</FormHelperText>
          </FormControl>
        </Grid>
        
        {pipelineConfig.enable_transformation && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Transformation Configuration"
              multiline
              rows={4}
              value={pipelineConfig.transformation_config_json || ''}
              onChange={(e) => handleTransformationConfigChange(e.target.value)}
              helperText="Data transformations as JSON object"
              placeholder={`{
  "field_mapping": {
    "source_field1": "destination_field1",
    "source_field2": "destination_field2"
  },
  "transformations": [
    {
      "type": "rename",
      "source": "old_name",
      "target": "new_name"
    },
    {
      "type": "convert",
      "field": "field_name",
      "to": "string"
    }
  ]
}`}
            />
          </Grid>
        )}
        
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="status-label">Initial Status</InputLabel>
            <Select
              labelId="status-label"
              value={pipelineConfig.status || 'inactive'}
              onChange={(e) => handleInputChange('status', e.target.value)}
              label="Initial Status"
            >
              <MenuItem value="active">Active (ready to run)</MenuItem>
              <MenuItem value="inactive">Inactive (disabled)</MenuItem>
            </Select>
            <FormHelperText>Initial pipeline status after creation</FormHelperText>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinalSettings;