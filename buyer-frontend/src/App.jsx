import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Marketplace from './pages/Marketplace';
import CropDetails from './pages/CropDetails';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Negotiations from './pages/Negotiations';
import MyTransport from './pages/MyTransport';
import Payments from './pages/Payments';

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
                path="/marketplace"
                element={
                    <PrivateRoute>
                        <Marketplace />
                    </PrivateRoute>
                }
            />
            <Route
                path="/crop/:id"
                element={
                    <PrivateRoute>
                        <CropDetails />
                    </PrivateRoute>
                }
            />
            <Route
                path="/cart"
                element={
                    <PrivateRoute>
                        <Cart />
                    </PrivateRoute>
                }
            />
            <Route
                path="/orders"
                element={
                    <PrivateRoute>
                        <Orders />
                    </PrivateRoute>
                }
            />
            <Route
                path="/orders/:orderId"
                element={
                    <PrivateRoute>
                        <Orders />
                    </PrivateRoute>
                }
            />
            <Route
                path="/negotiations"
                element={
                    <PrivateRoute>
                        <Negotiations />
                    </PrivateRoute>
                }
            />
            <Route
                path="/negotiations/:id"
                element={
                    <PrivateRoute>
                        <Negotiations />
                    </PrivateRoute>
                }
            />
            <Route
                path="/transport"
                element={
                    <PrivateRoute>
                        <MyTransport />
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
            {/* Catch-all route to home if not found */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;
