// src/theme.js
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Create a customized Material UI theme
const createAppTheme = (mode = 'light') => {
  let theme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2', // Blue
        light: '#42a5f5',
        dark: '#1565c0',
        contrastText: '#fff',
      },
      secondary: {
        main: '#2e7d32', // Green
        light: '#4caf50',
        dark: '#1b5e20',
        contrastText: '#fff',
      },
      error: {
        main: '#d32f2f',
        light: '#ef5350',
        dark: '#c62828',
      },
      warning: {
        main: '#ed6c02',
        light: '#ff9800',
        dark: '#e65100',
      },
      info: {
        main: '#0288d1',
        light: '#03a9f4',
        dark: '#01579b',
      },
      success: {
        main: '#2e7d32',
        light: '#4caf50',
        dark: '#1b5e20',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
        secondary: mode === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
      }
    },
    typography: {
      fontFamily: [
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      button: {
        textTransform: 'none', // Don't uppercase button text
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
            },
          },
          contained: {
            boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.12), 0px 2px 2px rgba(0, 0, 0, 0.14), 0px 3px 1px -2px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: mode === 'light' 
              ? '0px 2px 4px rgba(0, 0, 0, 0.1), 0px 3px 5px rgba(0, 0, 0, 0.07)' 
              : '0px 2px 4px rgba(0, 0, 0, 0.5), 0px 3px 5px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
            '&:hover': {
              boxShadow: mode === 'light'
                ? '0px 5px 15px rgba(0, 0, 0, 0.12), 0px 8px 10px rgba(0, 0, 0, 0.08)'
                : '0px 5px 15px rgba(0, 0, 0, 0.5), 0px 8px 10px rgba(0, 0, 0, 0.4)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
          elevation1: {
            boxShadow: mode === 'light'
              ? '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)'
              : '0px 1px 3px rgba(0, 0, 0, 0.4), 0px 1px 2px rgba(0, 0, 0, 0.3)',
          },
          elevation2: {
            boxShadow: mode === 'light'
              ? '0px 2px 4px rgba(0, 0, 0, 0.1), 0px 3px 5px rgba(0, 0, 0, 0.07)'
              : '0px 2px 4px rgba(0, 0, 0, 0.5), 0px 3px 5px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '16px',
          },
          head: {
            fontWeight: 600,
            backgroundColor: mode === 'light' ? '#f5f5f5' : '#333333',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:last-child td': {
              borderBottom: 0,
            },
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 3,
            height: 8,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'light'
              ? '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)'
              : '0px 1px 3px rgba(0, 0, 0, 0.4), 0px 1px 2px rgba(0, 0, 0, 0.3)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            width: 'calc(100% - 16px)',
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontWeight: 'bold',
          },
        },
      },
    },
  });
  
  // Make typography responsive
  theme = responsiveFontSizes(theme);
  
  return theme;
};

// Export both light and dark themes
export const lightTheme = createAppTheme('light');
export const darkTheme = createAppTheme('dark');

// Export default theme (light)
export default lightTheme;