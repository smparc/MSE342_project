import { createTheme } from '@mui/material/styles';

/**
 * Global MUI theme
 * DM Sans / DM Serif Display, navy #1a1a2e, gold accent #f0b429, soft borders #e2e8f0 / #e8eaf0.
 * tertiary: purplish accent for messaging text fields (matches former SignIn gradient feel).
 */
const appTheme = createTheme({
  palette: {
    primary: {
      main: '#1a1a2e',
      light: '#2d2d52',
      dark: '#12121f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f0b429',
      dark: '#c9a020',
      contrastText: '#1a1a2e',
    },
    /** Messaging / purple UI: use tertiary.light for field bg, tertiary.main for borders & focus */
    tertiary: {
      main: '#667eea',
      light: '#e8ebff',
      dark: '#764ba2',
      contrastText: '#ffffff',
    },
    error: {
      main: '#b91c1c',
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#555555',
      disabled: '#888888',
    },
    background: {
      default: '#f5f6fa',
      paper: '#ffffff',
    },
    divider: '#e8eaf0',
    action: {
      hover: 'rgba(26, 26, 46, 0.06)',
      selected: 'rgba(26, 26, 46, 0.08)',
    },
  },
  typography: {
    fontFamily: [
      '"DM Sans"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: '"DM Serif Display", Georgia, "Times New Roman", serif',
      fontWeight: 400,
      color: '#1a1a2e',
    },
    h2: {
      fontFamily: '"DM Serif Display", Georgia, "Times New Roman", serif',
      fontWeight: 400,
      color: '#1a1a2e',
    },
    h3: {
      fontFamily: '"DM Serif Display", Georgia, "Times New Roman", serif',
      fontWeight: 400,
      color: '#1a1a2e',
    },
    h4: {
      fontFamily: '"DM Serif Display", Georgia, "Times New Roman", serif',
      fontWeight: 400,
      color: '#1a1a2e',
    },
    h5: {
      fontFamily: '"DM Serif Display", Georgia, "Times New Roman", serif',
      fontWeight: 400,
      color: '#1a1a2e',
    },
    h6: {
      fontFamily: '"DM Serif Display", Georgia, "Times New Roman", serif',
      fontWeight: 600,
      color: '#1a1a2e',
    },
    subtitle1: {
      fontWeight: 500,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          color: '#1a1a2e',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#2d2d52',
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#fafafa',
          transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#c8cade',
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
            borderColor: '#1a1a2e',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(26, 26, 46, 0.08)',
        },
        elevation6: {
          boxShadow: '0 6px 24px rgba(26, 26, 46, 0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

export default appTheme;
