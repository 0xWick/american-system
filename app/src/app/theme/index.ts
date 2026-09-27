import { extendTheme } from '@chakra-ui/react';

// The Wasuli Bhai purple, from the original gradient (#6441A5 → #2a0845).
const theme = extendTheme({
  colors: {
    brand: {
      50: '#f3eefb',
      100: '#e0d4f5',
      200: '#c6b0eb',
      300: '#a88ae0',
      400: '#8763c9',
      500: '#6441A5',
      600: '#56378f',
      700: '#452c73',
      800: '#341f57',
      900: '#2a0845',
    },
  },
  fonts: {
    heading: 'var(--font-inter), system-ui, sans-serif',
    body: 'var(--font-inter), system-ui, sans-serif',
  },
  styles: {
    global: {
      body: { bg: 'gray.50', color: 'gray.800' },
    },
  },
  components: {
    Button: { defaultProps: { colorScheme: 'brand' } },
  },
});

export default theme;
