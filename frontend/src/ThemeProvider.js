// src/ThemeProvider.js
import React, { createContext, useState, useContext, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme } from './theme';

// Create context for theme mode
const ColorModeContext = createContext({ 
  toggleColorMode: () => {},
  mode: 'light'
});

// Custom hook to use the color mode context
export const useColorMode = () => useContext(ColorModeContext);

export const ThemeProvider = ({ children }) => {
  // State to track the current theme mode
  const [mode, setMode] = useState(() => {
    // Check local storage for saved preference
    const savedMode = localStorage.getItem('themeMode');
    return savedMode === 'dark' ? 'dark' : 'light';
  });

  // Toggle function for switching between light and dark mode
  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode]
  );

  // Select the theme based on mode
  const theme = useMemo(
    () => (mode === 'light' ? lightTheme : darkTheme),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default ThemeProvider;