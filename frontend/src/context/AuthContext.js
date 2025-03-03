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
  
  // No mock auth - always use the real backend

  // Load user on initial render or token change
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Call the API to get user data
        const response = await apiService.auth.getUser();
        setUser(response.data);
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
  }, [token]); // Remove unused dependencies

  // Login function
  const login = async (credentials) => {
    setLoading(true);
    console.log('Login function called with:', credentials);
    try {
      console.log('Making API request to login endpoint');
      const response = await apiService.auth.login(credentials);
      console.log('Login response received:', response);
      
      const { access, refresh } = response.data;
      
      // Store tokens
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      setToken(access);
      
      // Get user data
      console.log('Getting user data with token');
      const userResponse = await apiService.auth.getUser();
      console.log('User data received:', userResponse);
      
      setUser(userResponse.data);
      setError(null);
      
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      // More detailed error logging
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error details:', err.message);
      }
      
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