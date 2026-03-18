import React, { useState } from 'react';
import { Star, X, MessageSquare } from 'lucide-react';
import api from '../api/api';

const ReviewModal = ({ order, onClose, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return alert('Please select a rating');
        setSubmitting(true);
        try {
            const res = await api.post('/api/reviews', {
                orderId: order.id,
                revieweeId: order.buyerId,
                rating: rating,
                comment: comment,
                type: 'FARMER_TO_BUYER'
            });
            if (res.data.success) {
                onSuccess();
                onClose();
            }
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(4px)'
        }}>
            <div className="card animate-fade-in" style={{
                width: '100%', maxWidth: '450px', padding: '32px', position: 'relative'
            }}>
                <button onClick={onClose} style={{
                    position: 'absolute', top: '20px', right: '20px',
                    border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)'
                }}>
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{
                        width: '64px', height: '64px', background: 'var(--primary-light)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', margin: '0 auto 16px'
                    }}>
                        <Star size={32} color="var(--primary-dark)" fill="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800' }}>Rate Buyer</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Share your experience with <b>{order.buyerName}</b> for Order #{order.id}</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                        <label style={{ display: 'block', fontWeight: '700', marginBottom: '12px' }}>Your Rating</label>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star
                                    key={i}
                                    size={36}
                                    fill={(hoverRating || rating) >= i ? '#f59e0b' : 'none'}
                                    color={(hoverRating || rating) >= i ? '#f59e0b' : '#d1d5db'}
                                    style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                                    onMouseEnter={() => setHoverRating(i)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(i)}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontWeight: '700', marginBottom: '8px' }}>Comments (Optional)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="How was the communication? Was the payment prompt?"
                            rows={4}
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '12px',
                                border: '1px solid var(--border)', outline: 'none',
                                fontSize: '14px', resize: 'none', fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '12px',
                                border: '1px solid var(--border)', background: 'white',
                                fontWeight: '700', cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || rating === 0}
                            className="btn btn-primary"
                            style={{ flex: 1, padding: '12px', borderRadius: '12px', opacity: (submitting || rating === 0) ? 0.6 : 1 }}
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;
