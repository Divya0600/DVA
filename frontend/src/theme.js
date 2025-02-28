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

// Define custom component styles
const components = {
  Button: {
    // Add custom variants if needed
    variants: {
      solid: (props) => ({
        bg: props.colorScheme === 'brand' ? 'brand.500' : undefined,
        _hover: {
          bg: props.colorScheme === 'brand' ? 'brand.600' : undefined,
        },
      }),
    },
  },
  // Add more component customizations as needed
};

// Define global styles
const styles = {
  global: (props) => ({
    body: {
      bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.50',
    },
  }),
};

// Theme config
const config = {
  initialColorMode: 'light',
  useSystemColorMode: true,
};

// Export the theme
const theme = extendTheme({
  colors,
  components,
  styles,
  config,
});

export default theme;
