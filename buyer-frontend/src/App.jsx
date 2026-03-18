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
import Messages from './pages/Messages';
import Reviews from './pages/Reviews';
import OrderTracking from './pages/OrderTracking';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
        </div>
    );

    return user ? children : <Navigate to="/login" />;
};

import MainLayout from './components/MainLayout';

const PrivateLayout = ({ children }) => (
    <PrivateRoute>
        <MainLayout>{children}</MainLayout>
    </PrivateRoute>
);

function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private Routes wrapped in MainLayout */}
            <Route path="/marketplace" element={<PrivateLayout><Marketplace /></PrivateLayout>} />
            <Route path="/crop/:id" element={<PrivateLayout><CropDetails /></PrivateLayout>} />
            <Route path="/cart" element={<PrivateLayout><Cart /></PrivateLayout>} />
            <Route path="/orders" element={<PrivateLayout><Orders /></PrivateLayout>} />
            <Route path="/orders/:orderId" element={<PrivateLayout><Orders /></PrivateLayout>} />
            <Route path="/track/:orderId" element={<PrivateLayout><OrderTracking /></PrivateLayout>} />
            <Route path="/negotiations" element={<PrivateLayout><Negotiations /></PrivateLayout>} />
            <Route path="/negotiations/:id" element={<PrivateLayout><Negotiations /></PrivateLayout>} />
            <Route path="/transport" element={<PrivateLayout><MyTransport /></PrivateLayout>} />
            <Route path="/payments" element={<PrivateLayout><Payments /></PrivateLayout>} />
            <Route path="/messages" element={<PrivateLayout><Messages /></PrivateLayout>} />
            <Route path="/reviews" element={<PrivateLayout><Reviews /></PrivateLayout>} />

            {/* Catch-all route to home if not found */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;
