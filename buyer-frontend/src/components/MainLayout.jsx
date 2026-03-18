import React from 'react';
import Navbar from './Navbar';

const MainLayout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Navbar />
            <main className="container" style={{ paddingBottom: '60px' }}>
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
