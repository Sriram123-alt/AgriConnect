import React, { useState } from 'react';
import { X, Send, AlertCircle } from 'lucide-react';
import api from '../api/api';

const NegotiationModal = ({ crop, onClose, onSuccess }) => {
    const [offerPrice, setOfferPrice] = useState(crop.pricePerKg);
    const [quantity, setQuantity] = useState(1);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const negotiationData = {
                cropId: crop.id,
                offeredPrice: parseFloat(offerPrice),
                quantity: parseFloat(quantity),
                message: message
            };

            const response = await api.post('/api/negotiations', negotiationData);
            if (response.data.success) {
                onSuccess();
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send offer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '20px'
        }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Send Price Offer</h2>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'white', overflow: 'hidden' }}>
                        <img src={crop.imageUrls?.[0] || 'https://images.unsplash.com/photo-1488459716781-6918f33427e1?auto=format&fit=crop&q=80&w=200'} alt={crop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: '700' }}>{crop.name}</h3>
                        <p style={{ fontSize: '14px', color: 'var(--primary-dark)', fontWeight: '600' }}>Listed Price: ₹{crop.pricePerKg}/kg</p>
                    </div>
                </div>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Your Offer (₹/kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="input-field"
                                value={offerPrice}
                                onChange={(e) => setOfferPrice(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group" style={{ marginBottom: 0 }}>
                            <label className="input-label">Quantity (kg)</label>
                            <input
                                type="number"
                                className="input-field"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                min="1"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Message to Farmer (Optional)</label>
                        <textarea
                            className="input-field"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Briefly explain your offer..."
                            rows="3"
                            style={{ resize: 'none' }}
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ flex: 1, border: '1px solid var(--border)', background: 'white' }}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                            <Send size={18} /> {loading ? 'Sending...' : 'Send Offer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NegotiationModal;
