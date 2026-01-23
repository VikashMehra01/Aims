import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    Link,
    Fade,
    Slide,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { School, CheckCircle } from '@mui/icons-material';

const Register = () => {
    const { login } = useContext(AuthContext);
    
    // Check for query params (from Google Auth redirect)
    const queryParams = new URLSearchParams(window.location.search);
    const initialName = queryParams.get('name') || '';
    const initialEmail = queryParams.get('email') || '';
    const initialGoogleId = queryParams.get('googleId') || '';

    const [formData, setFormData] = useState({
        name: initialName,
        rollNumber: '',
        email: initialEmail,
        password: '',
        confirmPassword: '',
        department: '',
        degree: '',
        googleId: initialGoogleId
    });
    const [role, setRole] = useState('student'); // 'student' or 'faculty'
    const [authStep, setAuthStep] = useState('register'); // 'register' or 'otp'
    const [otp, setOtp] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const DEPARTMENTS = [
        "Computer Science and Engineering",
        "Electronics and Communication Engineering",
        "Mechanical Engineering",
        "Civil Engineering",
        "Chemical Engineering",
        "Biotechnology",
        "Mathematics",
        "Humanities and Social Sciences"
    ];

    const DEGREES = ["B.Tech", "M.Tech", "PhD", "M.Sc"];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        if (authStep === 'register') {
            if (formData.password !== formData.confirmPassword) {
                setIsLoading(false);
                return setError('Passwords do not match');
            }

            if (!formData.email.endsWith('@iitrpr.ac.in')) {
                setIsLoading(false);
                return setError('Only @iitrpr.ac.in emails are allowed');
            }

            if (!formData.department) {
                setIsLoading(false);
                return setError('Please select your department');
            }

            if (!formData.degree) {
                setIsLoading(false);
                return setError('Please select your degree');
            }

            try {
                // Determine role
                let roleToSend = role;
                if (role === 'faculty') roleToSend = 'faculty';

                await axios.post(`${apiUrl}/auth/register`, {
                    name: formData.name,
                    rollNumber: formData.rollNumber,
                    email: formData.email,
                    password: formData.password,
                    department: formData.department,
                    degree: formData.degree,
                    yearOfEntry: new Date().getFullYear().toString(),
                    googleId: formData.googleId, // Send googleId if present
                    role: roleToSend
                });
                
                setAuthStep('otp');
                setError('');
            } catch (err) {
                setError(err.response?.data?.msg || 'Registration Failed');
            } finally {
                setIsLoading(false);
            }
        } else {
            // Verify OTP
            try {
                const res = await axios.post(`${apiUrl}/auth/verify-registration`, {
                    email: formData.email,
                    otp
                });
                // Login immediately
                login(res.data.token);
                setSuccess(true);
            } catch (err) {
                setError(err.response?.data?.msg || 'Verification Failed');
            } finally {
                setIsLoading(false);
            }
        }
    };

    if (success) {
        return (
            <Container component="main" maxWidth="xs">
                <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Fade in={true} timeout={800}>
                        <Paper
                            elevation={24}
                            className="glass-paper"
                            sx={{
                                p: 5,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                borderRadius: 4,
                                textAlign: 'center',
                            }}
                        >
                            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                            <Typography component="h1" variant="h4" fontWeight="bold" color="success.main" gutterBottom>
                                Registration Successful!
                            </Typography>
                            <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
                                Your account has been verified and created. Redirecting...
                            </Typography>
                            <Button
                                component={RouterLink}
                                to="/dashboard"
                                variant="contained"
                                size="large"
                                fullWidth
                                sx={{
                                    py: 1.8,
                                    fontWeight: 'bold',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                }}
                            >
                                Go to Dashboard
                            </Button>
                        </Paper>
                    </Fade>
                </Box>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="sm">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                }}
            >
                <Fade in={true} timeout={800}>
                    <Paper
                        elevation={24}
                        className="glass-paper"
                        sx={{
                            p: 5,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            borderRadius: 4,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            width: '100%',
                        }}
                    >
                        <Slide direction="down" in={true} timeout={600}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <School sx={{ fontSize: 36, color: 'primary.main', mr: 1 }} />
                                <Typography component="h1" variant="h4" fontWeight="bold" className="gradient-text">
                                    {authStep === 'otp' ? 'Verify OTP' : 'Create Account'}
                                </Typography>
                            </Box>
                        </Slide>
                        <Typography component="p" variant="subtitle1" color="textSecondary" gutterBottom sx={{ mb: 3 }}>
                            {authStep === 'otp' ? 'Check your email for code' : 'Join AIMS today'}
                        </Typography>

                        {authStep === 'register' && (
                            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                                <Button
                                    variant={role === 'student' ? 'contained' : 'outlined'}
                                    onClick={() => setRole('student')}
                                    sx={{ borderRadius: 20, px: 3 }}
                                >
                                    Student
                                </Button>
                                <Button
                                    variant={role === 'faculty' ? 'contained' : 'outlined'}
                                    onClick={() => setRole('faculty')}
                                    sx={{ borderRadius: 20, px: 3 }}
                                >
                                    Faculty
                                </Button>
                            </Box>
                        )}

                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                            {authStep === 'register' ? (
                                <>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="name"
                                        label="Full Name"
                                        name="name"
                                        autoComplete="name"
                                        autoFocus
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                    {role === 'student' && (
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            id="rollNumber"
                                            label="Entry No."
                                            name="rollNumber"
                                            value={formData.rollNumber}
                                            onChange={handleChange}
                                        />
                                    )}

                                    <TextField
                                        select
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="degree"
                                        label="Degree"
                                        name="degree"
                                        value={formData.degree}
                                        onChange={handleChange}
                                        SelectProps={{
                                            native: true,
                                        }}
                                    >
                                        <option value="" disabled></option>
                                        {DEGREES.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </TextField>
                                    
                                    <TextField
                                        select
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="department"
                                        label="Department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        SelectProps={{
                                            native: true,
                                        }}
                                    >
                                        <option value="" disabled></option>
                                        {DEPARTMENTS.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </TextField>

                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="confirmPassword"
                                        label="Confirm Password"
                                        type={showPassword ? "text" : "password"}
                                        id="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                    
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={showPassword}
                                                    onChange={(e) => setShowPassword(e.target.checked)}
                                                    color="primary"
                                                    size="small"
                                                />
                                            }
                                            label={<Typography variant="body2">Show Password</Typography>}
                                            sx={{ mb: 1, mr: 0 }}
                                        />
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        An OTP has been sent to <strong>{formData.email}</strong>. Please enter it below to verify your account.
                                    </Alert>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="otp"
                                        label="Enter 6-Digit OTP"
                                        name="otp"
                                        autoFocus
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        inputProps={{ 
                                            maxLength: 6, 
                                            style: { textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem', fontWeight: 'bold' } 
                                        }}
                                    />
                                </>
                            )}

                            {error && (
                                <Fade in={true}>
                                    <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
                                </Fade>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={isLoading}
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    py: 1.8,
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    '&:hover': {
                                        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    },
                                }}
                            >
                                {isLoading ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 3 }} />
                                        <span>{authStep === 'register' ? 'Creating account...' : 'Verifying...'}</span>
                                    </Box>
                                ) : (
                                    authStep === 'register' ? 'Sign Up' : 'Verify & Login'
                                )}
                            </Button>

                            <Box textAlign="center">
                                <Link
                                    component={RouterLink}
                                    to="/login"
                                    variant="body2"
                                    sx={{
                                        fontWeight: 500,
                                        '&:hover': {
                                            color: 'primary.dark',
                                            textDecoration: 'underline',
                                        }
                                    }}
                                >
                                    Already have an account? Login here
                                </Link>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>
            </Box>
        </Container>
    );
};

export default Register;
