import React, { useState, useEffect } from 'react';
import { MessageSquare, Check, X, Clock, RefreshCcw } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/api';
import { useCart } from '../context/CartContext';

const Negotiations = () => {
    const { addToCart } = useCart();
    const [negotiations, setNegotiations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNegotiations();
    }, []);

    const fetchNegotiations = async () => {
        try {
            const response = await api.get('/api/negotiations/buyer/me');
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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return { background: '#fef3c7', color: '#92400e' };
            case 'ACCEPTED': return { background: '#d1fae5', color: '#065f46' };
            case 'REJECTED': return { background: '#fee2e2', color: '#991b1b' };
            case 'COUNTERED': return { background: '#f3e8ff', color: '#6b21a8' };
            default: return { background: '#f1f5f9', color: '#475569' };
        }
    };

    const getEffectivePrice = (neg) => {
        if (neg.status === 'COUNTERED') return neg.counterPrice;
        return neg.offeredPrice;
    };

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar />
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700' }}>My Price Offers</h1>
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
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No price offers sent</h2>
                        <p style={{ color: 'var(--text-muted)' }}>You can send custom price offers to farmers from the marketplace.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                        {negotiations.map(neg => (
                            <div key={neg.id} className="card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <MessageSquare size={24} color="var(--primary)" />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{neg.cropName}</h3>
                                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Farmer: {neg.farmerName}</p>
                                        </div>
                                    </div>
                                    <div style={{ padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', ...getStatusStyle(neg.status) }}>
                                        {neg.status}
                                    </div>
                                </div>

                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Original Price</span>
                                        <span style={{ fontWeight: '600' }}>₹{neg.originalPrice}/kg</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{neg.status === 'COUNTERED' ? "Buyer Offer" : "Your Offer"}</span>
                                        <span style={{ fontWeight: '700', color: neg.status === 'COUNTERED' ? 'var(--text-muted)' : 'var(--primary)', textDecoration: neg.status === 'COUNTERED' ? 'line-through' : 'none' }}>₹{neg.offeredPrice}/kg</span>
                                    </div>
                                    {neg.status === 'COUNTERED' && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#6b21a8' }}>Farmer's Counter</span>
                                            <span style={{ fontWeight: '800', color: '#6b21a8' }}>₹{neg.counterPrice}/kg</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Quantity Requested</span>
                                        <span style={{ fontWeight: '600' }}>{neg.quantity} kg</span>
                                    </div>
                                </div>

                                {(neg.message || neg.farmerMessage) && (
                                    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {neg.message && (
                                            <div>
                                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Your Message</p>
                                                <p style={{ fontSize: '13px', color: 'var(--text-main)', background: '#f1f5f9', padding: '10px', borderRadius: '8px', fontStyle: 'italic' }}>
                                                    "{neg.message}"
                                                </p>
                                            </div>
                                        )}
                                        {neg.farmerMessage && (
                                            <div>
                                                <p style={{ fontSize: '10px', color: '#6b21a8', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Farmer's Message</p>
                                                <p style={{ fontSize: '13px', color: '#6b21a8', background: '#f3e8ff', padding: '10px', borderRadius: '8px', fontStyle: 'italic' }}>
                                                    "{neg.farmerMessage}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    {neg.status === 'ACCEPTED' ? (
                                        <button
                                            onClick={() => {
                                                const price = neg.counterPrice || neg.offeredPrice;
                                                addToCart({ id: neg.cropId, name: neg.cropName, pricePerKg: price }, neg.quantity, neg.id);
                                                alert('Added negotiated item to cart!');
                                            }}
                                            className="btn btn-primary"
                                            style={{ flex: 1 }}
                                        >
                                            Add to Cart with this price
                                        </button>
                                    ) : neg.status === 'COUNTERED' ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdateStatus(neg.id, 'ACCEPTED')}
                                                className="btn btn-primary"
                                                style={{ flex: 1, background: '#6b21a8' }}
                                            >
                                                Accept Counter
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(neg.id, 'REJECTED')}
                                                className="btn"
                                                style={{ background: '#fee2e2', color: '#991b1b', flex: 1 }}
                                            >
                                                Decline
                                            </button>
                                        </>
                                    ) : neg.status === 'REJECTED' ? (
                                        <button className="btn" disabled style={{ flex: 1, background: '#fee2e2', color: '#991b1b' }}>
                                            Offer Rejected
                                        </button>
                                    ) : (
                                        <button className="btn" disabled style={{ flex: 1, background: '#f1f5f9', color: 'var(--text-muted)' }}>
                                            <Clock size={16} /> Waiting for Farmer
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Negotiations;
