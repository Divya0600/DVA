// src/pages/NotFound.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  useTheme
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ErrorOutline as ErrorOutlineIcon
} from '@mui/icons-material';

const NotFound = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            boxShadow: theme.shadows[20]
          }}
        >
          <ErrorOutlineIcon 
            color="error" 
            sx={{ fontSize: 80, mb: 2 }} 
          />
          
          <Typography 
            variant="h1" 
            component="h1" 
            color="error.main"
            sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '4rem', sm: '6rem' } 
            }}
          >
            404
          </Typography>
          
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ fontWeight: 500 }}
          >
            Page Not Found
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary" 
            paragraph
            sx={{ mt: 2, mb: 4 }}
          >
            The page you are looking for doesn't exist or has been moved.
          </Typography>
          
          <Button
            component={RouterLink}
            to="/dashboard"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<ArrowBackIcon />}
            sx={{ minWidth: 200 }}
          >
            Back to Dashboard
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound;