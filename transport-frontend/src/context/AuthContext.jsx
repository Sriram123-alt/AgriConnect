import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('transport_user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
            } catch (e) {
                localStorage.removeItem('transport_user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/api/auth/login', { email, password });
            const { success, data, message } = response.data;
            if (success) {
                if (data.role !== 'ROLE_TRANSPORT') {
                    throw new Error('Access denied. This portal is for Transport Managers only.');
                }
                setUser(data);
                localStorage.setItem('transport_user', JSON.stringify(data));
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
            const response = await api.post('/api/auth/register', {
                ...userData,
                role: 'ROLE_TRANSPORT',
            });
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
        localStorage.removeItem('transport_user');
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
