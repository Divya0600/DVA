// src/theme.js
import { extendTheme } from '@chakra-ui/react';

// Define custom colors
const colors = {
  brand: {
    50: '#e6f1ff',
    100: '#b3d4ff',
    200: '#80b8ff',
    300: '#4d9bff',
    400: '#1a7fff',
    500: '#0066e5',
    600: '#0052b8',
    700: '#003d8a',
    800: '#00295c',
    900: '#00142e',
  },
};

// Define custom fonts
const fonts = {
  body: 'Inter, system-ui, sans-serif',
  heading: 'Inter, system-ui, sans-serif',
};

// Define component styles
const components = {
  Button: {
    baseStyle: {
      fontWeight: 'medium',
      borderRadius: 'md',
    },
    variants: {
      solid: (props) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
        },
      }),
      outline: {
        _hover: {
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      p: '0',
      borderRadius: 'lg',
      boxShadow: 'sm',
    },
  },
  Table: {
    variants: {
      simple: {
        th: {
          borderColor: 'gray.200',
          padding: '1rem',
        },
        td: {
          borderColor: 'gray.100',
          padding: '1rem',
        },
      },
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'full',
    },
  },
  Heading: {
    baseStyle: {
      fontWeight: '600',
    },
  },
  Input: {
    variants: {
      outline: {
        field: {
          _focus: {
            borderColor: 'brand.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)',
          },
        },
      },
    },
  },
};

// Define global styles
const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
      color: props.colorMode === 'dark' ? 'white' : 'gray.800',
    },
    '*::placeholder': {
      color: props.colorMode === 'dark' ? 'gray.400' : 'gray.500',
    },
    '::selection': {
      backgroundColor: props.colorMode === 'dark' ? 'brand.700' : 'brand.100',
      color: props.colorMode === 'dark' ? 'white' : 'brand.900',
    },
  }),
};

// Fix z-index conflicts
const zIndices = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
};

// Theme config
const config = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

// Export the theme
const theme = extendTheme({
  colors,
  fonts,
  components,
  styles,
  zIndices,
  config,
});

export default theme;