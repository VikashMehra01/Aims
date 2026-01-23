import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2563EB',
            light: '#3B82F6',
            dark: '#1E40AF',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
            contrastText: '#ffffff',
        },
        success: {
            main: '#10b981',
            light: '#34d399',
            dark: '#059669',
        },
        error: {
            main: '#EF4444',
            light: '#F87171',
            dark: '#DC2626',
        },
        warning: {
            main: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
        },
        info: {
            main: '#3B82F6',
            light: '#60A5FA',
            dark: '#2563EB',
        },
        background: {
            default: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
            paper: 'rgba(255, 255, 255, 0.75)',
        },
        text: {
            primary: '#111827',
            secondary: '#6B7280',
        },
        divider: 'rgba(255, 255, 255, 0.3)',
    },
    typography: {
        fontFamily: '"Inter", "Geist", "SF Pro", -apple-system, BlinkMacSystemFont, sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
            color: '#111827',
            letterSpacing: '-0.02em',
        },
        h2: {
            fontWeight: 700,
            fontSize: '2rem',
            color: '#111827',
            letterSpacing: '-0.01em',
        },
        h3: {
            fontWeight: 700,
            fontSize: '1.75rem',
            color: '#111827',
        },
        h4: {
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#111827',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
            color: '#374151',
        },
        h6: {
            fontWeight: 600,
            fontSize: '1rem',
            color: '#374151',
        },
        subtitle1: {
            fontWeight: 600,
            color: '#374151',
        },
        subtitle2: {
            fontWeight: 500,
            color: '#6B7280',
        },
        body1: {
            fontSize: '1rem',
            color: '#374151',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            color: '#6B7280',
            lineHeight: 1.6,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
            letterSpacing: '0.01em',
        },
        caption: {
            fontWeight: 500,
            color: '#6B7280',
        },
    },
    shape: {
        borderRadius: 16,
    },
    shadows: [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        '0 10px 40px 0 rgba(31, 38, 135, 0.10)',
        '0 15px 50px 0 rgba(31, 38, 135, 0.12)',
        '0 20px 60px 0 rgba(31, 38, 135, 0.15)',
        ...Array(19).fill('0 20px 60px 0 rgba(31, 38, 135, 0.15)'),
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: 'linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)',
                    backgroundAttachment: 'fixed',
                    minHeight: '100vh',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 9999,
                    padding: '12px 24px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                        transform: 'translateY(-2px) scale(1.02)',
                        boxShadow: '0 10px 30px 0 rgba(31, 38, 135, 0.15)',
                    },
                    '&:active': {
                        transform: 'translateY(0) scale(0.98)',
                    },
                },
                contained: {
                    background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
                    },
                },
                outlined: {
                    borderColor: 'rgba(37, 99, 235, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                        borderColor: 'rgba(37, 99, 235, 0.5)',
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                    borderRadius: 20,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                    borderRadius: 20,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px) scale(1.02)',
                        boxShadow: '0 15px 50px 0 rgba(31, 38, 135, 0.12)',
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: 24,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: '#F3F4F6',
                        borderRadius: 9999,
                        padding: '4px 20px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '& fieldset': {
                            borderColor: 'rgba(107, 114, 128, 0.2)',
                        },
                        '&:hover fieldset': {
                            borderColor: 'rgba(37, 99, 235, 0.4)',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#2563EB',
                            borderWidth: 2,
                        },
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 9999,
                    fontWeight: 500,
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    color: '#2563EB',
                    border: '1px solid rgba(37, 99, 235, 0.2)',
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(243, 244, 246, 0.6)',
                    borderRadius: 9999,
                    padding: 4,
                    minHeight: 48,
                },
                indicator: {
                    display: 'none',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    borderRadius: 9999,
                    textTransform: 'none',
                    fontWeight: 600,
                    minHeight: 40,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&.Mui-selected': {
                        backgroundColor: '#2563EB',
                        color: '#ffffff',
                        boxShadow: '0 4px 12px 0 rgba(37, 99, 235, 0.3)',
                    },
                    '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
                    padding: '16px',
                },
                head: {
                    fontWeight: 600,
                    color: '#374151',
                    backgroundColor: 'rgba(248, 250, 252, 0.5)',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(37, 99, 235, 0.05)',
                        transform: 'scale(1.01)',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
                },
            },
        },
        MuiAvatar: {
            styleOverrides: {
                root: {
                    border: '2px solid white',
                    marginLeft: -10,
                    '&:first-of-type': {
                        marginLeft: 0,
                    },
                },
            },
        },
    },
});

export default theme;
