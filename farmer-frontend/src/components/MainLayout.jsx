import React from 'react';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            <Navbar />
            <main style={{ marginLeft: '260px', flex: 1, padding: '40px', overflowY: 'auto' }}>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
