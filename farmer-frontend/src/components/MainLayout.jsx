import React from 'react';
import Navbar from './Navbar';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MainLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            <Navbar />
            <div style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Global Header */}
                <header style={{ 
                    height: '70px', 
                    background: 'white', 
                    borderBottom: '1px solid var(--border)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'flex-end',
                    padding: '0 40px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                }}>
                    <button 
                        onClick={handleLogout}
                        className="btn btn-secondary"
                        style={{ 
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            padding: '8px 16px', border: '1px solid var(--border)',
                            background: 'transparent', color: 'var(--error)', 
                            fontWeight: '600'
                        }}
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </header>

                <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
