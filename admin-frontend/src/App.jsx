import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import ManageAllCrops from './pages/ManageAllCrops';
import ManageAllOrders from './pages/ManageAllOrders';

import MainLayout from './components/MainLayout';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #cbd5e1', borderTopColor: '#3b82f6', borderRadius: '50%' }}></div>
        </div>
    );

    return user ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" />;
};

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <AdminDashboard />
                    </PrivateRoute>
                }
            />
            <Route
                path="/users"
                element={
                    <PrivateRoute>
                        <ManageUsers />
                    </PrivateRoute>
                }
            />
            <Route
                path="/crops"
                element={
                    <PrivateRoute>
                        <ManageAllCrops />
                    </PrivateRoute>
                }
            />
            <Route
                path="/orders"
                element={
                    <PrivateRoute>
                        <ManageAllOrders />
                    </PrivateRoute>
                }
            />
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
    );
}

export default App;
