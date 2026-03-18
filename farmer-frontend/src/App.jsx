import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddCrop from './pages/AddCrop';
import MyCrops from './pages/MyCrops';
import EditCrop from './pages/EditCrop';
import ManageNegotiations from './pages/ManageNegotiations';
import ManageOrders from './pages/ManageOrders';
import Payments from './pages/Payments';
import Messages from './pages/Messages';
import MyReviews from './pages/MyReviews';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
        </div>
    );

    return user ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />
            <Route
                path="/add-crop"
                element={
                    <PrivateRoute>
                        <AddCrop />
                    </PrivateRoute>
                }
            />
            <Route
                path="/crops"
                element={
                    <PrivateRoute>
                        <MyCrops />
                    </PrivateRoute>
                }
            />
            <Route
                path="/edit-crop/:id"
                element={
                    <PrivateRoute>
                        <EditCrop />
                    </PrivateRoute>
                }
            />
            <Route
                path="/negotiations"
                element={
                    <PrivateRoute>
                        <ManageNegotiations />
                    </PrivateRoute>
                }
            />
            <Route
                path="/negotiations/:id"
                element={
                    <PrivateRoute>
                        <ManageNegotiations />
                    </PrivateRoute>
                }
            />
            <Route
                path="/orders"
                element={
                    <PrivateRoute>
                        <ManageOrders />
                    </PrivateRoute>
                }
            />
            <Route
                path="/orders/:orderId"
                element={
                    <PrivateRoute>
                        <ManageOrders />
                    </PrivateRoute>
                }
            />
            <Route
                path="/payments"
                element={
                    <PrivateRoute>
                        <Payments />
                    </PrivateRoute>
                }
            />
            <Route
                path="/messages"
                element={
                    <PrivateRoute>
                        <Messages />
                    </PrivateRoute>
                }
            />
            <Route
                path="/reviews"
                element={
                    <PrivateRoute>
                        <MyReviews />
                    </PrivateRoute>
                }
            />
            {/* Catch-all route to home if not found */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;
