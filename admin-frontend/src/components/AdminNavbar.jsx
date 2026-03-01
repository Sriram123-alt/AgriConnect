import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingBag, Package, LogOut, ShieldCheck, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminNavbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Users', icon: Users, path: '/users' },
        { label: 'Crops', icon: ShoppingBag, path: '/crops' },
        { label: 'Orders', icon: Package, path: '/orders' },
    ];

    return (
        <div style={{
            width: '280px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            background: '#1e293b', // Dark theme for admin
            color: 'white',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
                <div style={{ background: '#3b82f6', padding: '8px', borderRadius: '12px' }}>
                    <ShieldCheck size={24} color="white" />
                </div>
                <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>AgriConnect <span style={{ color: '#3b82f6', fontSize: '12px' }}>ADMIN</span></span>
            </div>

            <div style={{ flex: 1 }}>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    textDecoration: 'none',
                                    fontWeight: '600',
                                    transition: 'var(--transition)',
                                    background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                    color: isActive ? '#3b82f6' : '#94a3b8'
                                }}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div style={{ paddingTop: '20px', borderTop: '1px solid #334155' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '0 8px' }}>
                    <div style={{ width: '40px', height: '40px', background: '#334155', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontWeight: '700', color: '#3b82f6' }}>A</span>
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>System Admin</p>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>Superuser</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: '#f87171',
                        fontWeight: '600'
                    }}
                >
                    <LogOut size={20} /> Logout
                </button>
            </div>
        </div>
    );
};

export default AdminNavbar;
