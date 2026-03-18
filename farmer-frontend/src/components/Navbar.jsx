import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, MessageSquare, LogOut, Sprout, Plus, Bell, HandCoins, MessageCircle, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDrawer from './NotificationDrawer';
import api from '../api/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isNotifOpen, setIsNotifOpen] = React.useState(false);
    const [unreadCount, setUnreadCount] = React.useState(0);
    const [unreadChatCount, setUnreadChatCount] = React.useState(0);

    React.useEffect(() => {
        if (user) {
            fetchCounts();
            const interval = setInterval(fetchCounts, 10000); // Poll every 10s
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchCounts = async () => {
        try {
            const [notifRes, chatRes] = await Promise.all([
                api.get('/api/notifications/unread-count'),
                api.get('/api/chat/unread-count')
            ]);
            if (notifRes.data.success) setUnreadCount(notifRes.data.data);
            if (chatRes.data.success) setUnreadChatCount(chatRes.data.data);
        } catch (_) { }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'My Crops', icon: ShoppingBag, path: '/crops' },
        { label: 'Negotiations', icon: MessageSquare, path: '/negotiations' },
        { label: 'Orders', icon: Sprout, path: '/orders' },
        { label: 'Payments', icon: HandCoins, path: '/payments' },
        { label: 'Messages', icon: MessageCircle, path: '/messages' },
        { label: 'Reviews', icon: Star, path: '/reviews' },
    ];

    return (
        <div style={{
            width: '260px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            background: 'white',
            borderRight: '1px solid var(--border)',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
        }}>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', textDecoration: 'none', color: 'var(--text-main)' }}>
                <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px' }}>
                    <Sprout size={24} color="white" />
                </div>
                <span style={{ fontSize: '20px', fontWeight: '800' }}>AgriConnect</span>
            </Link>

            <div style={{ flex: 1 }}>
                <Link to="/add-crop" className="btn btn-primary" style={{ width: '100%', marginBottom: '32px', padding: '12px' }}>
                    <Plus size={18} /> Add New Crop
                </Link>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                                    background: isActive ? 'var(--primary-light)' : 'transparent',
                                    color: isActive ? 'var(--primary-dark)' : 'var(--text-muted)'
                                }}
                            >
                                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                    <item.icon size={20} />
                                    {item.label === 'Messages' && unreadChatCount > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-4px',
                                            right: '-4px',
                                            background: 'var(--primary)',
                                            color: 'white',
                                            fontSize: '8px',
                                            padding: '1px 4px',
                                            borderRadius: '10px'
                                        }}>{unreadChatCount}</span>
                                    )}
                                </div>
                                {item.label}
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setIsNotifOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            fontWeight: '600',
                            color: 'var(--text-muted)',
                            width: '100%',
                            textAlign: 'left'
                        }}
                    >
                        <div style={{ position: 'relative' }}>
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span style={{ position: 'absolute', top: '-4px', right: '-4px', background: 'var(--error)', color: 'white', fontSize: '8px', padding: '1px 4px', borderRadius: '10px' }}>{unreadCount}</span>
                            )}
                        </div>
                        Notifications
                    </button>
                </nav>
            </div>

            <div style={{ paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', padding: '0 8px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>{user?.fullName?.[0]}</span>
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontWeight: '700', fontSize: '14px', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.fullName}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Farmer</p>
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
                        color: 'var(--error)',
                        fontWeight: '600'
                    }}
                >
                    <LogOut size={20} /> Logout
                </button>
            </div>
            <NotificationDrawer
                isOpen={isNotifOpen}
                onClose={() => {
                    setIsNotifOpen(false);
                    fetchCounts();
                }}
                setExternalUnreadCount={setUnreadCount}
            />
        </div>
    );
};

export default Navbar;
