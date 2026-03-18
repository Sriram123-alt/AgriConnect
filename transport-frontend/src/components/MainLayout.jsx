import React from 'react';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
            <Navbar />
            <div className="container" style={{ padding: '32px 20px 48px' }}>
                {children}
            </div>
        </div>
    );
};

export default MainLayout;
