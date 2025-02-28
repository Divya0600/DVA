// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

// Create context
const AuthContext = createContext();

// Mock user data (remove in production)
const MOCK_USER = {
  id: '1',
  name: 'Admin User',
  email: 'admin@example.com',
  role: 'admin',
  avatar: '',
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on initial render or token change
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // In a real app, this would make an API call
        // For development without backend, simulate a successful response
        const response = await new Promise(resolve => {
          setTimeout(() => {
            resolve({ data: MOCK_USER });
          }, 500);
        });
        
        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to load user:', err);
        setError('Failed to authenticate user');
        // Clear invalid token
        localStorage.removeItem('token');
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
      // In a real app, this would use apiService.auth.login
      // For development without backend, simulate a login
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      
      // Store token
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      
      // Set user data
      setUser(MOCK_USER);
      setError(null);
      
      return true;
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