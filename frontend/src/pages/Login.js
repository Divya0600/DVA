// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  SwapHoriz as SwapHorizIcon,
  Storage as StorageIcon,
  Login as LoginIcon
} from '@mui/icons-material';

import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Get redirect path from location state, or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';
  
  // Form state
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear errors when typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Toggle remember me
  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!credentials.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!credentials.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await login(credentials);
      
      if (!success) {
        setErrors({
          general: 'Invalid username or password',
        });
      }
    } catch (error) {
      setErrors({
        general: error.message || 'An error occurred during login',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
      <Paper
        elevation={6}
        sx={{
          borderRadius: 2,
          maxWidth: 450,
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Header with brand color */}
        <Box 
          sx={{ 
            p: 3, 
            bgcolor: 'primary.main', 
            color: 'primary.contrastText',
            textAlign: 'center'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <StorageIcon sx={{ fontSize: 40, mr: 1 }} />
            <SwapHorizIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Pipeline Migration
          </Typography>
          <Typography variant="subtitle1">
            Sign in to your account
          </Typography>
        </Box>
        
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Show any auth errors */}
              {(errors.general || authError) && (
                <Alert severity="error">
                  {errors.general || authError}
                </Alert>
              )}
              
              {/* Username field */}
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                autoComplete="username"
                autoFocus
              />
              
              {/* Password field */}
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Remember me & Forgot password */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={handleRememberMeChange}
                      color="primary"
                    />
                  }
                  label="Remember me"
                />
                <Link 
                  href="#" 
                  variant="body2" 
                  sx={{ ml: 1 }}
                  onClick={(e) => e.preventDefault()}
                >
                  Forgot password?
                </Link>
              </Box>
              
              {/* Submit button */}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={isSubmitting}
                startIcon={<LoginIcon />}
                sx={{ mt: 2 }}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </form>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="body2" color="text.secondary" align="center">
            For development, you can use any username and password
          </Typography>
        </CardContent>
      </Paper>
    </Box>
  );
};

export default Login;