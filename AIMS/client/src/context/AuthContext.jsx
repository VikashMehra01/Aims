import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            let token = localStorage.getItem('token');
            if (!token) {
                // Check URL params for token (from Google Login redirect)
                const urlParams = new URLSearchParams(window.location.search);
                token = urlParams.get('token');
                if (token) {
                    localStorage.setItem('token', token);
                    // Remove token from URL to clean it up
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }

            if (token) {
                try {
                    const res = await axios.get('http://localhost:5000/auth/me', {
                        headers: { 'x-auth-token': token }
                    });
                    setUser(res.data);
                } catch (err) {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkLoggedIn();
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        // Refresh or just fetch user
        window.location.href = '/dashboard';
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
