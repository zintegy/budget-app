import { createMuiTheme } from '@material-ui/core/styles';

const minimal = createMuiTheme({
  palette: {
    type: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#d32f2f' },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  shape: { borderRadius: 6 },
  overrides: {
    MuiTableHead: {
      root: {
        backgroundColor: '#f5f5f5',
      },
    },
    MuiTableCell: {
      head: {
        fontWeight: 700,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        color: '#666',
      },
    },
    MuiButton: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    MuiTextField: {
      root: {
        '& .MuiOutlinedInput-root': {
          backgroundColor: '#fff',
        },
      },
    },
    MuiPaper: {
      elevation1: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      },
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },
    MuiDialog: {
      paper: {
        borderRadius: 8,
      },
    },
    MuiToggleButton: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        padding: '4px 16px',
      },
    },
  },
});

export default minimal;
