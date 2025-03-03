// src/components/pipeline/SelectDestinationType.js
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

// Helper to get icon for a destination type
const getDestinationIcon = (destinationType) => {
  switch (destinationType.toLowerCase()) {
    case 'jira':
      return BugIcon;
    case 'mysql':
    case 'postgres':
    case 'mongodb':
      return StorageIcon;
    case 'alm':
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

const SelectDestinationType = ({ 
  destinationTypes, 
  selectedDestinationType, 
  onSelectDestinationType, 
  error 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter destination types based on search query
  const filteredDestinationTypes = destinationTypes.filter(destination =>
    destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select a Data Destination
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Choose where you want to send your extracted data
      </Typography>
      
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search destinations..."
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
        {filteredDestinationTypes.map((destination) => {
          const DestinationIcon = getDestinationIcon(destination.id);
          const isSelected = selectedDestinationType === destination.id;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={destination.id}>
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
                  onClick={() => onSelectDestinationType(destination.id)}
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
                      <DestinationIcon fontSize="large" />
                    </Box>
                    
                    <Typography variant="h6" component="h3" gutterBottom>
                      {destination.name}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary">
                      {destination.description}
                    </Typography>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
        
        {filteredDestinationTypes.length === 0 && (
          <Grid item xs={12}>
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="textSecondary">
                No destinations match your search criteria
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default SelectDestinationType;
