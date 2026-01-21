import React, { useState } from 'react';
import axios from 'axios';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    Link
} from '@mui/material';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isStudent, setIsStudent] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'email') {
            const isStudentEmail = /^\d/.test(value);
            setIsStudent(isStudentEmail);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        if (!formData.email.endsWith('@iitrpr.ac.in')) {
            return setError('Only @iitrpr.ac.in emails are allowed');
        }

        try {
            await axios.post('http://localhost:5000/auth/register', {
                name: formData.name,
                rollNumber: formData.rollNumber,
                email: formData.email,
                password: formData.password,
                department: 'Unknown',
                degree: 'B.Tech',
                yearOfEntry: new Date().getFullYear().toString()
            });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration Failed');
        }
    };

    if (success) {
        return (
            <Container component="main" maxWidth="xs">
                <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper elevation={6} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                        <Typography component="h1" variant="h5" color="primary" gutterBottom>
                            Registration Successful!
                        </Typography>
                        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
                            You can now login with your credentials.
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/login"
                            variant="contained"
                            fullWidth
                        >
                            Go to Login
                        </Button>
                    </Paper>
                </Box>
            </Container>
        );
    }

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 2,
                        background: 'rgba(255, 255, 255, 0.8)',
                    }}
                >
                    <Typography component="h1" variant="h5" gutterBottom fontWeight="bold">
                        Create Account
                    </Typography>
                    <Typography component="p" variant="subtitle1" color="textSecondary" gutterBottom>
                        Join AIMS today
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
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
                        {isStudent && (
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
                            type="password"
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
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />

                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, py: 1.5 }}
                        >
                            Sign Up
                        </Button>

                        <Box textAlign="center">
                            <Link component={RouterLink} to="/login" variant="body2">
                                {"Already have an account? Login here"}
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;
