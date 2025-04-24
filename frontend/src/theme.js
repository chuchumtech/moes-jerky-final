import { createTheme } from '@mui/material/styles';

// Moe's Jerky Red (sample from logo or #c00 as a strong red)
const moesRed = '#b02a2a';
const neutralGray = '#f4f4f6';
const darkGray = '#232323';

const theme = createTheme({
  palette: {
    primary: {
      main: moesRed,
      contrastText: '#fff',
    },
    secondary: {
      main: darkGray,
      contrastText: '#fff',
    },
    background: {
      default: neutralGray,
      paper: '#fff',
    },
    text: {
      primary: darkGray,
      secondary: '#555',
    },
    divider: '#e0e0e0',
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h6: {
      fontWeight: 700,
      letterSpacing: 0.5,
    },
    h4: {
      fontWeight: 700,
      letterSpacing: 0.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          fontWeight: 600,
        },
        containedPrimary: {
          backgroundColor: moesRed,
          '&:hover': { backgroundColor: '#8a1e1e' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 6px rgba(50,50,50,0.07)',
          border: '1px solid #e0e0e0',
        },
      },
    },
  },
});

export default theme;
