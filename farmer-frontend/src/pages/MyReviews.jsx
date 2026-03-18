import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Star, MessageSquare, User, Award } from 'lucide-react';

const MyReviews = () => {
    const [receivedReviews, setReceivedReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Get current user info to get their ID
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;

            if (currentUser?.id) {
                const [reviewsRes, profileRes] = await Promise.all([
                    api.get(`/api/reviews/user/${currentUser.id}?size=50`),
                    api.get(`/api/reviews/profile/${currentUser.id}`)
                ]);
                if (reviewsRes.data.success) setReceivedReviews(reviewsRes.data.data.content || []);
                if (profileRes.data.success) setProfile(profileRes.data.data);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const StarDisplay = ({ value, size = 16 }) => (
        <div style={{ display: 'flex', gap: 2 }}>
            {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={size}
                    fill={value >= i ? '#f59e0b' : 'none'}
                    color={value >= i ? '#f59e0b' : '#d1d5db'}
                />
            ))}
        </div>
    );

    return (
        <div className="animate-fade-in" style={{ maxWidth: 900, margin: '0 auto' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <Award size={28} /> My Reviews &amp; Ratings
            </h1>

            {/* Rating Summary Card */}
            {profile && (
                <div style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                    borderRadius: 16, padding: 28, marginBottom: 24, color: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                        }}>
                            <User size={36} color="white" />
                        </div>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{profile.fullName}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 32, fontWeight: 800 }}>{profile.averageRating.toFixed(1)}</span>
                                <StarDisplay value={Math.round(profile.averageRating)} size={22} />
                            </div>
                            <div style={{ opacity: 0.8, fontSize: 14 }}>{profile.totalReviews} review{profile.totalReviews !== 1 ? 's' : ''} received</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Loading...</div>
            ) : receivedReviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: 12 }} />
                    <p>No reviews received yet.</p>
                    <p style={{ fontSize: 13 }}>Reviews will appear here once buyers rate your crops.</p>
                </div>
            ) : receivedReviews.map(review => (
                <div key={review.id} style={{
                    padding: 20, marginBottom: 12, border: '1px solid var(--border)',
                    borderRadius: 12, background: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%', background: '#dbeafe',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <User size={16} color="#2563eb" />
                                </div>
                                <span style={{ fontWeight: 600, fontSize: 14 }}>{review.reviewerName}</span>
                                <span style={{
                                    fontSize: 11, background: '#dbeafe', color: '#2563eb',
                                    padding: '2px 8px', borderRadius: 20, fontWeight: 600
                                }}>Buyer</span>
                            </div>
                            <StarDisplay value={review.rating} />
                            {review.cropName && (
                                <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                                    🌾 Crop: {review.cropName}
                                </div>
                            )}
                            {review.comment && (
                                <p style={{ marginTop: 8, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, fontStyle: 'italic' }}>
                                    "{review.comment}"
                                </p>
                            )}
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>
                            Order #{review.orderId} • {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MyReviews;
