import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import './Login.css';

const Login = () => {
    const { login, user } = useContext(AuthContext);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    if (user) return <Navigate to="/dashboard" />;

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/auth/login', formData);
            login(res.data.token);
        } catch (err) {
            setError(err.response?.data?.msg || 'Login Failed');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/auth/google';
    };

    return (
        <div className="login-container">
            <div className="login-card glass-panel">
                <h1 className="login-title">Welcome to AIMS</h1>
                <p className="login-subtitle">Academic Information Management System</p>

                <button onClick={handleGoogleLogin} className="google-btn">
                    <FcGoogle size={24} />
                    <span>Sign in with Google</span>
                </button>

                <div className="divider">
                    <span>or continue with email</span>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        className="input-field"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="input-field"
                        required
                    />
                    {error && <p className="error-msg">{error}</p>}
                    <button type="submit" className="btn-primary">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
