// src/components/pipeline/SelectSourceType.js
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  FormHelperText,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Storage as StorageIcon,
  Code as CodeIcon,
  InsertDriveFile as FileIcon,
  Cloud as CloudIcon,
  BugReport as BugIcon,
} from '@mui/icons-material';

// Helper to get icon for a source type
const getSourceIcon = (sourceType) => {
  switch (sourceType.toLowerCase()) {
    case 'alm':
      return BugIcon;
    case 'mysql':
    case 'postgres':
    case 'mongodb':
      return StorageIcon;
    case 'jira':
      return BugIcon;
    case 'sharepoint':
    case 'confluence':
      return FileIcon;
    case 'rest':
      return CodeIcon;
    default:
      return CloudIcon;
  }
};

const SelectSourceType = ({ sourceTypes, selectedSourceType, onSelectSourceType, error }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter source types based on search query
  const filteredSourceTypes = sourceTypes.filter(source =>
    source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    source.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select a Data Source
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Choose the type of system you want to extract data from
      </Typography>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search sources..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      
      {error && (
        <FormHelperText error sx={{ mb: 2, fontSize: '0.9rem' }}>
          {error}
        </FormHelperText>
      )}
      
      <Grid container spacing={3}>
        {filteredSourceTypes.map((source) => {
          const SourceIcon = getSourceIcon(source.id);
          const isSelected = selectedSourceType === source.id;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={source.id}>
              <Card 
                raised={isSelected}
                sx={{
                  borderColor: isSelected ? 'primary.main' : 'transparent',
                  borderWidth: 2,
                  borderStyle: 'solid',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                <CardActionArea 
                  onClick={() => onSelectSourceType(source.id)}
                  sx={{ height: '100%', p: 2 }}
                >
                  <Box 
                    display="flex" 
                    flexDirection="column" 
                    alignItems="center" 
                    textAlign="center"
                  >
                    <Box
                      bgcolor={isSelected ? 'primary.light' : 'action.hover'}
                      color={isSelected ? 'primary.contrastText' : 'primary.main'}
                      borderRadius="50%"
                      p={2}
                      mb={2}
                    >
                      <SourceIcon fontSize="large" />
                    </Box>
                    
                    <Typography variant="h6" component="h3" gutterBottom>
                      {source.name}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary">
                      {source.description}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
        
        {filteredSourceTypes.length === 0 && (
          <Grid item xs={12}>
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="textSecondary">
                No sources match your search criteria
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SelectSourceType;
