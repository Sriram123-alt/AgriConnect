import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Truck, LogOut, User, LayoutDashboard, ClipboardList, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDrawer from './NotificationDrawer';
import api from '../api/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isNotifOpen, setIsNotifOpen] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10s
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get('/api/notifications/unread-count');
            if (res.data.success) setUnreadCount(res.data.data);
        } catch (_) { }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const linkStyle = (path) => ({
        textDecoration: 'none',
        color: isActive(path) ? '#f97316' : 'var(--text-muted)',
        fontWeight: isActive(path) ? '700' : '500',
        fontSize: '14px',
        padding: '6px 14px',
        borderRadius: '8px',
        background: isActive(path) ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
        transition: 'all 0.2s',
    });

    return (
        <>
            <nav className="glass" style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                padding: '14px 0',
                borderBottom: '1px solid var(--border)',
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <Link to="/dashboard" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textDecoration: 'none',
                        color: 'var(--text-main)',
                    }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #f97316, #ea580c)',
                            padding: '8px',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Truck size={22} color="white" />
                        </div>
                        <div>
                            <span style={{ fontSize: '18px', fontWeight: '700', display: 'block', lineHeight: 1.1 }}>AgriConnect</span>
                            <span style={{ fontSize: '10px', fontWeight: '600', color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Transport Hub</span>
                        </div>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Link to="/dashboard" style={linkStyle('/dashboard')}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <LayoutDashboard size={15} /> Dashboard
                            </span>
                        </Link>
                        <Link to="/bookings" style={linkStyle('/bookings')}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <ClipboardList size={15} /> All Bookings
                            </span>
                        </Link>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div
                            onClick={() => setIsNotifOpen(true)}
                            style={{ position: 'relative', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <Bell size={22} color={unreadCount > 0 ? '#f97316' : 'var(--text-muted)'} />
                            {unreadCount > 0 && (
                                <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', fontSize: '9px', fontWeight: '700', padding: '1px 5px', borderRadius: '100px', border: '2px solid white' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>

                        <div
                            onClick={() => navigate('/profile')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '6px 14px',
                                background: 'var(--surface-hover)',
                                border: '1px solid var(--border)',
                                borderRadius: '100px',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{
                                width: '28px', height: '28px',
                                background: 'rgba(249, 115, 22, 0.2)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <User size={14} color="#f97316" />
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>
                                {user?.fullName?.split(' ')[0]}
                            </span>
                            <button onClick={handleLogout} style={{
                                border: 'none', background: 'transparent',
                                cursor: 'pointer', display: 'flex', marginLeft: '4px',
                            }}>
                                <LogOut size={15} color="#ef4444" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <NotificationDrawer
                isOpen={isNotifOpen}
                onClose={() => {
                    setIsNotifOpen(false);
                    fetchUnreadCount();
                }}
                setExternalUnreadCount={setUnreadCount}
            />
        </>
    );
};

export default Navbar;
