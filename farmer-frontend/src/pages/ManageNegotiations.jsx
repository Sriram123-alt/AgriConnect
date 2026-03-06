import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, X, Clock, RefreshCcw, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/api';

const CounterOfferModal = ({ negotiation, onClose, onSuccess }) => {
    const [price, setPrice] = useState(negotiation.offeredPrice);
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post(`/api/negotiations/${negotiation.id}/counter`, null, {
                params: { counterPrice: price, farmerMessage: msg }
            });
            if (res.data.success) {
                onSuccess(res.data.data);
                onClose();
            }
        } catch (err) {
            alert('Failed to send counter offer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '32px', animation: 'fadeIn 0.3s ease-out' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Make Counter Offer</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                    Buyer offered ₹{negotiation.offeredPrice}/kg. What's your counter?
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Your Counter Price (per kg)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="input-field"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>Message to Buyer (Optional)</label>
                        <textarea
                            className="input-field"
                            style={{ minHeight: '80px', resize: 'vertical' }}
                            placeholder="e.g. I can't go that low, but I can do this price for this quality."
                            value={msg}
                            onChange={(e) => setMsg(e.target.value)}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
                            {loading ? 'Sending...' : 'Send Counter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ManageNegotiations = () => {
    const [negotiations, setNegotiations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [counterModal, setCounterModal] = useState(null);

    useEffect(() => {
        fetchNegotiations();
        const interval = setInterval(fetchNegotiations, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchNegotiations = async () => {
        try {
            const response = await api.get('/api/negotiations/farmer/me');
            if (response.data.success) {
                setNegotiations(response.data.data.content || []);
            }
        } catch (err) {
            console.error('Failed to fetch negotiations', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await api.patch(`/api/negotiations/${id}/status`, null, { params: { status } });
            if (response.data.success) {
                setNegotiations(negotiations.map(neg =>
                    neg.id === id ? { ...neg, status } : neg
                ));
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleCounterSuccess = (updatedNeg) => {
        setNegotiations(negotiations.map(neg => neg.id === updatedNeg.id ? updatedNeg : neg));
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return { background: '#fef3c7', color: '#92400e' };
            case 'ACCEPTED': return { background: '#d1fae5', color: '#065f46' };
            case 'REJECTED': return { background: '#fee2e2', color: '#991b1b' };
            case 'COUNTERED': return { background: '#f3e8ff', color: '#6b21a8' };
            default: return { background: '#f1f5f9', color: '#475569' };
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Navbar />
            <main style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Price Negotiations</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Review and respond to buyer offers.</p>
                    </div>
                    <button onClick={fetchNegotiations} className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
                        <RefreshCcw size={16} /> Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
                    </div>
                ) : negotiations.length === 0 ? (
                    <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                        <MessageSquare size={48} color="var(--text-muted)" style={{ margin: '0 auto 20px' }} />
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No pending offers</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Buyers will send offers when they want to negotiate your prices.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {negotiations.map(neg => (
                            <div key={neg.id} className="card" style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr 1fr', gap: '32px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <MessageSquare size={20} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{neg.cropName}</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                            <User size={12} /> {neg.buyerName}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '24px', background: '#f8fafc', padding: '12px 20px', borderRadius: '12px' }}>
                                    <div>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Listed Price</p>
                                        <p style={{ fontWeight: '600' }}>₹{neg.originalPrice}/kg</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{neg.status === 'COUNTERED' ? 'Your Counter' : "Buyer's Offer"}</p>
                                        <p style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{neg.status === 'COUNTERED' ? neg.counterPrice : neg.offeredPrice}/kg</p>
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Quantity</p>
                                        <p style={{ fontWeight: '600' }}>{neg.quantity} kg</p>
                                    </div>
                                    {neg.message && (
                                        <div style={{ flex: 1, borderLeft: '1px solid var(--border)', paddingLeft: '20px' }}>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Buyer Message</p>
                                            <p style={{ fontSize: '13px', fontStyle: 'italic' }}>"{neg.message}"</p>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'inline-flex', alignSelf: 'flex-end', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', ...getStatusStyle(neg.status) }}>
                                        {neg.status}
                                    </div>

                                    {neg.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleUpdateStatus(neg.id, 'ACCEPTED')}
                                                className="btn btn-primary"
                                                style={{ padding: '8px 12px', fontSize: '13px' }}
                                            >
                                                <Check size={14} /> Accept
                                            </button>
                                            <button
                                                onClick={() => setCounterModal(neg)}
                                                className="btn"
                                                style={{ padding: '8px 12px', fontSize: '13px', background: '#f3e8ff', color: '#6b21a8', border: 'none' }}
                                            >
                                                Counter
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(neg.id, 'REJECTED')}
                                                className="btn"
                                                style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 12px', fontSize: '13px' }}
                                            >
                                                <X size={14} /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {counterModal && (
                <CounterOfferModal
                    negotiation={counterModal}
                    onClose={() => setCounterModal(null)}
                    onSuccess={handleCounterSuccess}
                />
            )}
        </div>
    );
};

export default ManageNegotiations;
