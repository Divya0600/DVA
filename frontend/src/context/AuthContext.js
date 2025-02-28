// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

// Create context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // For development purposes - set this to true to use mock auth instead of real backend auth
  const useMockAuth = false;
  
  // Mock user data (for development only)
  const MOCK_USER = {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    first_name: 'Admin',
    last_name: 'User',
    is_staff: true,
  };

  // Load user on initial render or token change
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        if (useMockAuth) {
          // For development, just set the mock user
          setUser(MOCK_USER);
        } else {
          // In production, call the API to get user data
          const response = await apiService.auth.getUser();
          setUser(response.data);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to load user:', err);
        setError('Failed to authenticate user');
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    try {
      if (useMockAuth) {
        // For development without backend, simulate a login
        const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
        
        // Store token
        localStorage.setItem('token', mockToken);
        setToken(mockToken);
        
        // Set user data
        setUser(MOCK_USER);
        setError(null);
        
        return true;
      } else {
        // For production with real backend
        const response = await apiService.auth.login(credentials);
        const { access, refresh } = response.data;
        
        // Store tokens
        localStorage.setItem('token', access);
        localStorage.setItem('refreshToken', refresh);
        setToken(access);
        
        // Get user data
        const userResponse = await apiService.auth.getUser();
        setUser(userResponse.data);
        setError(null);
        
        return true;
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.detail || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  };

  // Context value
  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};