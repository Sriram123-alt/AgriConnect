import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Star, MessageSquare, User, Award, Package } from 'lucide-react';

const Reviews = () => {
    const [myReviews, setMyReviews] = useState([]);
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [showReviewForm, setShowReviewForm] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('pending');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [reviewsRes, ordersRes] = await Promise.all([
                api.get('/api/reviews/my?size=50'),
                api.get('/api/orders/buyer/me?size=50')
            ]);
            if (reviewsRes.data.success) setMyReviews(reviewsRes.data.data.content || []);
            if (ordersRes.data.success) {
                const delivered = (ordersRes.data.data.content || []).filter(o => o.status === 'DELIVERED');
                setDeliveredOrders(delivered);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const submitReview = async (order) => {
        if (rating === 0) return alert('Please select a rating');
        setSubmitting(true);
        try {
            const firstItem = order.items?.[0];
            if (!firstItem || !firstItem.farmerId) {
                alert('Unable to determine the farmer for this order.');
                setSubmitting(false);
                return;
            }

            const res = await api.post('/api/reviews', {
                orderId: order.id,
                revieweeId: firstItem.farmerId,
                cropId: firstItem.cropId,
                rating: rating,
                comment: comment
            });
            if (res.data.success) {
                setShowReviewForm(null);
                setRating(0);
                setComment('');
                fetchData();
            }
        } catch (e) {
            alert(e.response?.data?.message || 'Failed to submit review');
        }
        finally { setSubmitting(false); }
    };

    const reviewedOrderIds = myReviews.map(r => r.orderId);
    const pendingOrders = deliveredOrders.filter(o => !reviewedOrderIds.includes(o.id));

    const StarRating = ({ value, onHover, onClick, interactive = true, size = 22 }) => (
        <div style={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i}
                    size={size}
                    fill={(interactive ? (hoverRating || value) : value) >= i ? '#f59e0b' : 'none'}
                    color={(interactive ? (hoverRating || value) : value) >= i ? '#f59e0b' : '#d1d5db'}
                    style={{ cursor: interactive ? 'pointer' : 'default', transition: 'all 0.15s' }}
                    onMouseEnter={() => interactive && onHover?.(i)}
                    onMouseLeave={() => interactive && onHover?.(0)}
                    onClick={() => interactive && onClick?.(i)}
                />
            ))}
        </div>
    );

    return (
        <>
            
            <div className="container" style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px 40px' }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Award size={28} /> Reviews & Ratings
                </h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Rate your experience with farmers and products</p>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid var(--border)' }}>
                    {[
                        { key: 'pending', label: `Pending Reviews (${pendingOrders.length})` },
                        { key: 'submitted', label: `My Reviews (${myReviews.length})` }
                    ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)} style={{
                            padding: '12px 24px', border: 'none', background: 'transparent',
                            fontWeight: 600, fontSize: 14, cursor: 'pointer',
                            borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
                            color: tab === t.key ? 'var(--primary)' : 'var(--text-muted)',
                            marginBottom: -2, transition: 'all 0.2s'
                        }}>{t.label}</button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading...</div>
                ) : tab === 'pending' ? (
                    pendingOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                            <Star size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                            <p>No pending reviews!</p>
                            <p style={{ fontSize: 13 }}>All delivered orders have been reviewed.</p>
                        </div>
                    ) : pendingOrders.map(order => (
                        <div key={order.id} className="card" style={{
                            padding: 20, marginBottom: 16, border: '1px solid var(--border)',
                            borderRadius: 12, background: 'white'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Package size={20} color="var(--primary)" />
                                    <span style={{ fontWeight: 600 }}>Order #{order.id}</span>
                                    <span style={{
                                        fontSize: 11, background: '#dcfce7', color: '#15803d',
                                        padding: '2px 10px', borderRadius: 20, fontWeight: 600
                                    }}>DELIVERED</span>
                                </div>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {order.items?.map(item => (
                                <div key={item.id} style={{
                                    fontSize: 13, color: 'var(--text-muted)', marginLeft: 30,
                                    marginBottom: 4
                                }}>
                                    🌾 {item.cropName} — {item.quantity} kg by {item.farmerName}
                                </div>
                            ))}

                            {showReviewForm === order.id ? (
                                <div style={{
                                    marginTop: 16, padding: 20, background: '#f9fafb',
                                    borderRadius: 12, border: '1px solid var(--border)'
                                }}>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'block' }}>
                                            How was your experience?
                                        </label>
                                        <StarRating value={rating} onHover={setHoverRating} onClick={setRating} size={32} />
                                    </div>
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'block' }}>
                                            Your Comment (optional)
                                        </label>
                                        <textarea value={comment} onChange={e => setComment(e.target.value)}
                                            placeholder="Share your thoughts about the quality, freshness, packaging..."
                                            rows={3} style={{
                                                width: '100%', padding: '10px 14px', borderRadius: 10,
                                                border: '1px solid var(--border)', fontSize: 14,
                                                resize: 'vertical', outline: 'none', fontFamily: 'inherit'
                                            }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: 10 }}>
                                        <button onClick={() => submitReview(order)} disabled={submitting} style={{
                                            padding: '10px 24px', background: 'var(--primary)', color: 'white',
                                            border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
                                            opacity: submitting ? 0.6 : 1
                                        }}>
                                            {submitting ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                        <button onClick={() => { setShowReviewForm(null); setRating(0); setComment(''); }} style={{
                                            padding: '10px 24px', background: 'transparent', color: 'var(--text-muted)',
                                            border: '1px solid var(--border)', borderRadius: 10, fontWeight: 600, cursor: 'pointer'
                                        }}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setShowReviewForm(order.id)} style={{
                                    marginTop: 12, padding: '8px 20px', background: 'var(--primary)',
                                    color: 'white', border: 'none', borderRadius: 10, fontWeight: 600,
                                    cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6
                                }}>
                                    <Star size={14} /> Write Review
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    myReviews.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                            <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                            <p>You haven't written any reviews yet.</p>
                        </div>
                    ) : myReviews.map(review => (
                        <div key={review.id} style={{
                            padding: 20, marginBottom: 12, border: '1px solid var(--border)',
                            borderRadius: 12, background: 'white'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                        <div style={{
                                            width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <User size={16} color="var(--primary-dark)" />
                                        </div>
                                        <span style={{ fontWeight: 600, fontSize: 14 }}>{review.revieweeName}</span>
                                        {review.cropName && (
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                                — {review.cropName}
                                            </span>
                                        )}
                                    </div>
                                    <StarRating value={review.rating} interactive={false} size={16} />
                                    {review.comment && (
                                        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                            "{review.comment}"
                                        </p>
                                    )}
                                </div>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                                    Order #{review.orderId} • {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default Reviews;
