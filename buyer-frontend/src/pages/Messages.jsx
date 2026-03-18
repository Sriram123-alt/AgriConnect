import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Send, ArrowLeft, User, Clock } from 'lucide-react';

const Messages = () => {
    const { user } = useAuth();
    const [partners, setPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchPartners();
        const interval = setInterval(fetchPartners, 8000);
        return () => clearInterval(interval);
    }, []);

    const startDirectChat = async (targetId) => {
        try {
            // First check if already in partners
            const existing = partners.find(p => p.userId === parseInt(targetId));
            if (existing) {
                setSelectedPartner(existing);
            } else {
                // Fetch user info to create a "temporary" partner object
                const res = await api.get(`/api/reviews/profile/${targetId}`);
                if (res.data.success) {
                    const u = res.data.data;
                    const newPartner = {
                        userId: u.id,
                        fullName: u.fullName,
                        role: u.role,
                        unreadCount: 0
                    };
                    setPartners(prev => {
                        if (prev.find(p => p.userId === newPartner.userId)) return prev;
                        return [newPartner, ...prev];
                    });
                    setSelectedPartner(newPartner);
                }
            }
        } catch (e) {
            console.error('Failed to start direct chat', e);
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const directUserId = params.get('userId');
        if (directUserId) {
            startDirectChat(directUserId);
            // Clear URL param after use to avoid re-triggering
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [window.location.search, partners.length]);

    useEffect(() => {
        if (selectedPartner) {
            fetchConversation(selectedPartner.userId);
            markAsRead(selectedPartner.userId);
            const interval = setInterval(() => fetchConversation(selectedPartner.userId), 5000);
            return () => clearInterval(interval);
        }
    }, [selectedPartner]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchPartners = async () => {
        try {
            const res = await api.get('/api/chat/partners');
            if (res.data.success) {
                const serverPartners = res.data.data;
                // Preserve temporary partner if they are currently selected but not in the server list yet
                setPartners(prev => {
                    if (selectedPartner && !serverPartners.find(p => p.userId === selectedPartner.userId)) {
                        return [selectedPartner, ...serverPartners];
                    }
                    return serverPartners;
                });
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchConversation = async (otherUserId) => {
        try {
            const res = await api.get(`/api/chat/conversation/${otherUserId}`);
            if (res.data.success) setMessages(res.data.data);
        } catch (e) { console.error(e); }
    };

    const markAsRead = async (otherUserId) => {
        try {
            await api.post(`/api/chat/read/${otherUserId}`);
            fetchPartners();
        } catch (e) { console.error(e); }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedPartner) return;
        setSending(true);
        try {
            const res = await api.post('/api/chat/send', {
                receiverId: selectedPartner.userId,
                content: newMessage.trim()
            });
            if (res.data.success) {
                setMessages(prev => [...prev, res.data.data]);
                setNewMessage('');
                fetchPartners();
            }
        } catch (e) { console.error(e); }
        finally { setSending(false); }
    };

    const formatTime = (d) => {
        const date = new Date(d);
        const now = new Date();
        const diff = now - date;
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
        if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString();
    };

    const roleLabel = (r) => {
        if (r === 'ROLE_FARMER') return 'Farmer';
        if (r === 'ROLE_BUYER') return 'Buyer';
        if (r === 'ROLE_TRANSPORTER') return 'Transporter';
        return r;
    };

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <MessageCircle size={28} /> Messages
            </h1>
            <div style={{
                display: 'grid',
                gridTemplateColumns: selectedPartner ? '300px 1fr' : '1fr',
                gap: 0,
                border: '1px solid var(--border)',
                borderRadius: 16,
                overflow: 'hidden',
                height: 600,
                background: 'white'
            }}>
                {/* Partners list */}
                <div style={{
                    borderRight: '1px solid var(--border)',
                    overflowY: 'auto'
                }}>
                    <div style={{ padding: 16, borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 16 }}>
                        Conversations
                    </div>
                    {loading ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                    ) : partners.length === 0 ? (
                        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                            <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
                            <p>No conversations yet</p>
                            <p style={{ fontSize: 13 }}>Start chatting from an order page!</p>
                        </div>
                    ) : partners.map(p => (
                        <div key={p.userId} onClick={() => setSelectedPartner(p)} style={{
                            padding: '14px 16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid var(--border)',
                            background: selectedPartner?.userId === p.userId ? 'var(--primary-light)' : 'transparent',
                            transition: 'background 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12
                        }}>
                            <div style={{
                                width: 42, height: 42, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <User size={20} color="white" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 600, fontSize: 14 }}>{p.fullName}</span>
                                    {p.unreadCount > 0 && (
                                        <span style={{
                                            background: 'var(--primary)', color: 'white',
                                            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10
                                        }}>{p.unreadCount}</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                                    <span style={{
                                        fontSize: 12, color: 'var(--text-muted)',
                                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140
                                    }}>
                                        {p.lastMessage?.content || 'No messages'}
                                    </span>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                                        {roleLabel(p.role)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Chat area */}
                {selectedPartner ? (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {/* Chat header */}
                        <div style={{
                            padding: '12px 20px', borderBottom: '1px solid var(--border)',
                            display: 'flex', alignItems: 'center', gap: 12, background: '#fafafa'
                        }}>
                            <button onClick={() => setSelectedPartner(null)} style={{
                                border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex'
                            }}>
                                <ArrowLeft size={20} />
                            </button>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <User size={16} color="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedPartner.fullName}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{roleLabel(selectedPartner.role)}</div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {messages.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 80 }}>
                                    <MessageCircle size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                                    <p>No messages yet. Say hello! 👋</p>
                                </div>
                            ) : messages.map(msg => {
                                const isMine = msg.senderId === user?.id;
                                return (
                                    <div key={msg.id} style={{
                                        display: 'flex',
                                        justifyContent: isMine ? 'flex-end' : 'flex-start'
                                    }}>
                                        <div style={{
                                            maxWidth: '70%',
                                            padding: '10px 16px',
                                            borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                            background: isMine
                                                ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                                                : '#f0f0f0',
                                            color: isMine ? 'white' : 'var(--text-main)',
                                            fontSize: 14,
                                            lineHeight: 1.5
                                        }}>
                                            <div>{msg.content}</div>
                                            <div style={{
                                                fontSize: 10,
                                                opacity: 0.7,
                                                marginTop: 4,
                                                textAlign: 'right',
                                                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4
                                            }}>
                                                <Clock size={10} /> {formatTime(msg.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={sendMessage} style={{
                            padding: '12px 20px', borderTop: '1px solid var(--border)',
                            display: 'flex', gap: 10, background: '#fafafa'
                        }}>
                            <input
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1, padding: '10px 16px', borderRadius: 24,
                                    border: '1px solid var(--border)', fontSize: 14, outline: 'none'
                                }}
                            />
                            <button type="submit" disabled={sending || !newMessage.trim()} style={{
                                width: 44, height: 44, borderRadius: '50%',
                                background: 'var(--primary)', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                opacity: (!newMessage.trim() || sending) ? 0.5 : 1,
                                transition: 'opacity 0.2s'
                            }}>
                                <Send size={18} color="white" />
                            </button>
                        </form>
                    </div>
                ) : (
                    !partners.length ? null :
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', color: 'var(--text-muted)'
                    }}>
                        <MessageCircle size={64} style={{ opacity: 0.15, marginBottom: 16 }} />
                        <p style={{ fontSize: 16 }}>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
