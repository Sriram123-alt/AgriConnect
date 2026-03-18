import React from 'react';
import AdminNavbar from './AdminNavbar';

const MainLayout = ({ children }) => {
    return (
        <div style={{ display: 'flex', background: '#f1f5f9', minHeight: '100vh' }}>
            <AdminNavbar />
            <main style={{ marginLeft: '280px', flex: 1, padding: '40px' }} className="animate-fade-in">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
