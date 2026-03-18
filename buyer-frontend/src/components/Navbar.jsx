import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Sprout, Bell, MessageCircle, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import NotificationDrawer from './NotificationDrawer';
import api from '../api/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();

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

    return (
        <>
            <nav className="glass" style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                padding: '16px 0',
                borderBottom: '1px solid var(--border)',
                marginBottom: '32px'
            }}>
                <div className="container" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Link to="/marketplace" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        textDecoration: 'none',
                        color: 'var(--text-main)'
                    }}>
                        <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px' }}>
                            <Sprout size={24} color="white" />
                        </div>
                        <span style={{ fontSize: '20px', fontWeight: '700' }}>AgriConnect</span>
                    </Link>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <Link to="/marketplace" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>Marketplace</Link>
                        <Link to="/negotiations" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>My Offers</Link>
                        <Link to="/orders" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>My Orders</Link>
                        <Link to="/payments" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>Payments</Link>
                        <Link to="/transport" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500' }}>Transport</Link>
                        <Link to="/messages" style={{
                            textDecoration: 'none',
                            color: 'var(--text-muted)',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            position: 'relative'
                        }}>
                            <MessageCircle size={14} />Chat
                            {unreadChatCount > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-12px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    fontSize: '8px',
                                    fontWeight: '700',
                                    padding: '1px 4px',
                                    borderRadius: '10px'
                                }}>
                                    {unreadChatCount}
                                </span>
                            )}
                        </Link>
                        <Link to="/reviews" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={14} />Reviews</Link>

                        <Link to="/cart" style={{
                            position: 'relative',
                            color: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <ShoppingCart size={24} />
                            {cartItems.length > 0 && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    padding: '2px 6px',
                                    borderRadius: '10px',
                                    border: '2px solid white'
                                }}>
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>

                        <div
                            onClick={() => setIsNotifOpen(true)}
                            style={{ position: 'relative', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        >
                            <Bell size={24} />
                            {unreadCount > 0 && (
                                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--error, #ef4444)', color: 'white', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '10px', border: '2px solid white' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '6px 12px',
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: '100px',
                            cursor: 'default'
                        }}>
                            <div style={{ width: '28px', height: '28px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={16} color="var(--primary-dark)" />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>{user?.fullName?.split(' ')[0]}</span>
                            <button onClick={handleLogout} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', marginLeft: '4px' }}>
                                <LogOut size={16} color="var(--error)" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <NotificationDrawer
                isOpen={isNotifOpen}
                onClose={() => {
                    setIsNotifOpen(false);
                    fetchCounts();
                }}
                setExternalUnreadCount={setUnreadCount}
            />
        </>
    );
};

export default Navbar;
