import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            const { success, data, message } = response.data;
            if (success) {
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
                api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
                return data;
            }
            throw new Error(message || 'Login failed');
        } catch (err) {
            if (err.response && err.response.data) {
                throw new Error(err.response.data.message || 'Invalid credentials');
            }
            throw new Error(err.message || 'Network error. Please check your connection.');
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/api/auth/register', userData);
            const { success, data, message } = response.data;
            if (success) {
                return data;
            }
            throw new Error(message || 'Registration failed');
        } catch (err) {
            if (err.response && err.response.data) {
                throw new Error(err.response.data.message || 'Registration failed');
            }
            throw new Error(err.message || 'Network error. Please check your connection.');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
