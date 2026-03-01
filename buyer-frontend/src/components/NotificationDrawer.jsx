import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Inbox, Clock, ExternalLink, Trash2, Package, Truck, MessageSquare, AlertCircle } from 'lucide-react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';

const TYPE_ICONS = {
    'ORDER': { icon: Package, color: '#3b82f6', bg: '#eff6ff' },
    'TRANSPORT': { icon: Truck, color: '#10b981', bg: '#f0fdf4' },
    'NEGOTIATION': { icon: MessageSquare, color: '#f59e0b', bg: '#fffbeb' },
    'ALERT': { icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' },
    'DEFAULT': { icon: Bell, color: '#64748b', bg: '#f8fafc' }
};

const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const NotificationDrawer = ({ isOpen, onClose, setExternalUnreadCount }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/notifications?page=0&size=20');
            if (res.data.success) {
                setNotifications(res.data.data.content);
                const unread = res.data.data.content.filter(n => !n.isRead).length;
                setUnreadCount(unread);
                if (setExternalUnreadCount) setExternalUnreadCount(unread);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            const newCount = Math.max(0, unreadCount - 1);
            setUnreadCount(newCount);
            if (setExternalUnreadCount) setExternalUnreadCount(newCount);
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.patch('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            if (setExternalUnreadCount) setExternalUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const deleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            // Assuming there's a delete endpoint or just hide from UI
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error('Failed to delete notification', err);
        }
    };

    const handleNotificationClick = (n) => {
        if (!n.isRead) markAsRead(n.id);
        if (n.link) {
            navigate(n.link);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'flex', justifyContent: 'flex-end', overflow: 'hidden' }}>
            <div
                onClick={onClose}
                style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(8px)',
                    animation: 'fadeIn 0.3s ease-out'
                }}
            />

            <div className="animate-slide-in-right" style={{
                position: 'relative',
                width: '100%', maxWidth: '420px',
                height: '100%',
                background: '#ffffff',
                boxShadow: '-20px 0 50px rgba(0,0,0,0.15)',
                display: 'flex', flexDirection: 'column',
                borderLeft: '1px solid #e2e8f0'
            }}>
                {/* Header */}
                <div style={{
                    padding: '32px 24px',
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'linear-gradient(to right, #ffffff, #f8fafc)'
                }}>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', color: '#0f172a', margin: 0 }}>
                            Notifications
                            {unreadCount > 0 && (
                                <span style={{
                                    background: 'var(--primary)',
                                    color: 'white', fontSize: '11px', padding: '2px 10px',
                                    borderRadius: '100px', fontWeight: '700'
                                }}>
                                    {unreadCount} New
                                </span>
                            )}
                        </h2>
                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', margin: '4px 0 0' }}>Stay updated with your activities</p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: '#f1f5f9', border: 'none', cursor: 'pointer',
                            color: '#0f172a', width: '40px', height: '40px',
                            borderRadius: '12px', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', transition: 'all 0.2s'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                    {notifications.length > 0 && unreadCount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px' }}>
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    background: 'none', border: 'none', color: 'var(--primary)',
                                    fontSize: '13px', fontWeight: '700', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px'
                                }}
                            >
                                <Check size={14} /> Mark all read
                            </button>
                        </div>
                    )}

                    {loading && notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 0' }}>
                            <div className="animate-spin" style={{
                                width: '32px', height: '32px', border: '3px solid #f1f5f9',
                                borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto'
                            }}></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#94a3b8' }}>
                            <div style={{
                                width: '64px', height: '64px', background: '#f8fafc',
                                borderRadius: '20px', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', margin: '0 auto 20px'
                            }}>
                                <Inbox size={32} style={{ opacity: 0.3 }} />
                            </div>
                            <h3 style={{ fontWeight: '700', color: '#1e293b', fontSize: '16px', marginBottom: '8px' }}>All caught up!</h3>
                            <p style={{ fontSize: '13px', lineHeight: '1.5' }}>You have no new notifications.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {notifications.map(n => {
                                const config = TYPE_ICONS[n.type] || TYPE_ICONS.DEFAULT;
                                const Icon = config.icon;
                                return (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        style={{
                                            padding: '16px', borderRadius: '14px', cursor: 'pointer',
                                            position: 'relative',
                                            background: n.isRead ? '#ffffff' : '#f0fdf9',
                                            border: n.isRead ? '1px solid #f1f5f9' : '1px solid rgba(16, 185, 129, 0.2)',
                                            transition: 'all 0.2s ease',
                                            display: 'flex', gap: '12px'
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = n.isRead ? '#f8fafc' : '#ecfdf5';
                                            const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                                            if (deleteBtn) deleteBtn.style.opacity = '1';
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = n.isRead ? '#ffffff' : '#f0fdf9';
                                            const deleteBtn = e.currentTarget.querySelector('.delete-btn');
                                            if (deleteBtn) deleteBtn.style.opacity = '0';
                                        }}
                                    >
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '10px',
                                            background: config.bg, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', flexShrink: 0, color: config.color
                                        }}>
                                            <Icon size={20} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2px' }}>
                                                <h4 style={{
                                                    fontSize: '14px', fontWeight: '700', color: '#0f172a',
                                                    margin: 0, display: 'flex', alignItems: 'center', gap: '6px'
                                                }}>
                                                    {n.title}
                                                    {!n.isRead && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)' }} />}
                                                </h4>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600' }}>
                                                        {formatTimeAgo(n.createdAt)}
                                                    </span>
                                                    <button
                                                        className="delete-btn"
                                                        onClick={(e) => deleteNotification(e, n.id)}
                                                        style={{
                                                            opacity: 0, background: 'none', border: 'none',
                                                            color: '#94a3b8', cursor: 'pointer', padding: '4px',
                                                            borderRadius: '4px', transition: 'all 0.2s',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.4', margin: '4px 0' }}>{n.message}</p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                                                <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} /> {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {n.link && (
                                                    <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        View <ExternalLink size={12} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '20px', borderTop: '1px solid #f1f5f9', background: '#ffffff', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', margin: 0 }}>Showing your recent updates</p>
                </div>
            </div>
        </div>
    );
};

export default NotificationDrawer;
