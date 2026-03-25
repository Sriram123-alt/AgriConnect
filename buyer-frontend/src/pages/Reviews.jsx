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
            
            let reviews = [];
            if (reviewsRes.data.success) {
                reviews = reviewsRes.data.data.content || [];
                setMyReviews(reviews);
            }

            if (ordersRes.data.success) {
                const eligible = (ordersRes.data.data.content || []).filter(o => o.status !== 'PENDING' && o.status !== 'CANCELLED');
                setDeliveredOrders(eligible);
                
                // Auto-open first item if orderId is in URL
                const params = new URLSearchParams(window.location.search);
                const oId = params.get('orderId');
                if (oId) {
                    const targetOrder = eligible.find(o => o.id === parseInt(oId));
                    if (targetOrder && targetOrder.items?.length > 0) {
                        const firstItem = targetOrder.items[0];
                        // Only open if not already reviewed
                        const alreadyReviewed = reviews.some(r => r.orderId === targetOrder.id && r.cropId === firstItem.cropId);
                        if (!alreadyReviewed) {
                            setShowReviewForm(`${targetOrder.id}-${firstItem.id}`);
                            setTab('pending');
                        }
                    }
                }
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

    // Helper to check if an item is already reviewed
    const isItemReviewed = (orderId, cropId) => {
        return myReviews.some(r => r.orderId === orderId && r.cropId === cropId);
    };

    // An order is pending if it has at least one item not yet reviewed
    const pendingOrders = deliveredOrders.filter(order => 
        order.items?.some(item => !isItemReviewed(order.id, item.cropId))
    );

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
        <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Award size={28} /> Reviews &amp; Ratings
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

                        {order.items?.map(item => {
                            const isAlreadyReviewed = isItemReviewed(order.id, item.cropId);
                            const isReviewingThis = showReviewForm === `${order.id}-${item.id}`;

                            return (
                                <div key={item.id} style={{
                                    margin: '12px 0 12px 30px', padding: '12px', background: '#f8fafc',
                                    borderRadius: 10, border: '1px solid #e2e8f0'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: 13, color: 'var(--text-main)', fontWeight: 600 }}>
                                            🌾 {item.cropName} — {item.quantity} kg by {item.farmerName}
                                        </div>
                                        {!isAlreadyReviewed && !isReviewingThis && (
                                            <button onClick={() => {
                                                setShowReviewForm(`${order.id}-${item.id}`);
                                                setRating(0);
                                                setComment('');
                                            }} style={{
                                                padding: '4px 12px', background: 'var(--primary)',
                                                color: 'white', border: 'none', borderRadius: 6,
                                                fontWeight: 600, cursor: 'pointer', fontSize: 12
                                            }}>Review</button>
                                        )}
                                        {isAlreadyReviewed && (
                                            <span style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>Already Reviewed</span>
                                        )}
                                    </div>

                                    {isReviewingThis && (
                                        <div style={{
                                            marginTop: 12, padding: 12, background: 'white',
                                            borderRadius: 8, border: '1px solid var(--border)'
                                        }}>
                                            <div style={{ marginBottom: 12 }}>
                                                <StarRating value={rating} onHover={setHoverRating} onClick={setRating} size={24} />
                                            </div>
                                            <textarea value={comment} onChange={e => setComment(e.target.value)}
                                                placeholder={`How was the ${item.cropName}?`}
                                                rows={2} style={{
                                                    width: '100%', padding: '8px 12px', borderRadius: 8,
                                                    border: '1px solid var(--border)', fontSize: 13,
                                                    resize: 'vertical', outline: 'none', fontFamily: 'inherit', marginBottom: 10
                                                }} />
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button onClick={() => {
                                                    if (rating === 0) return alert('Please select a rating');
                                                    setSubmitting(true);
                                                    api.post('/api/reviews', {
                                                        orderId: order.id,
                                                        revieweeId: item.farmerId,
                                                        cropId: item.cropId,
                                                        rating: rating,
                                                        comment: comment
                                                    }).then(res => {
                                                        if (res.data.success) {
                                                            setShowReviewForm(null);
                                                            fetchData();
                                                        }
                                                    }).catch(e => {
                                                        alert(e.response?.data?.message || 'Failed to submit review');
                                                    }).finally(() => setSubmitting(false));
                                                }} disabled={submitting} style={{
                                                    padding: '6px 16px', background: 'var(--primary)', color: 'white',
                                                    border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer',
                                                    fontSize: 12, opacity: submitting ? 0.6 : 1
                                                }}>Submit</button>
                                                <button onClick={() => setShowReviewForm(null)} style={{
                                                    padding: '6px 16px', background: 'transparent', color: 'var(--text-muted)',
                                                    border: '1px solid var(--border)', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 12
                                                }}>Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
                                    <span style={{ fontWeight: 600, fontSize: 14 }}>Farmer: {review.revieweeName}</span>
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
    );
};

export default Reviews;
