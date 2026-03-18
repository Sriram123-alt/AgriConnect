import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, ShoppingCart, MessageCircle, ArrowLeft, Shield, Truck, Calendar, User, ChevronRight } from 'lucide-react';
import api from '../api/api';
import { useCart } from '../context/CartContext';
import NegotiationModal from '../components/NegotiationModal';

const CropDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isNegotiating, setIsNegotiating] = useState(false);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        fetchCrop();
    }, [id]);

    const fetchCrop = async () => {
        try {
            const res = await api.get(`/api/crops/${id}`);
            if (res.data.success) {
                setCrop(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch crop', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        addToCart({
            id: crop.id,
            name: crop.name,
            pricePerKg: crop.pricePerKg,
            farmerName: crop.farmerName
        }, quantity);
        alert(`Added ${quantity}kg of ${crop.name} to cart!`);
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div></div>;
    if (!crop) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}><p>Crop not found.</p><button onClick={() => navigate('/marketplace')} className="btn btn-primary">Back to Marketplace</button></div>;

    const images = crop.imageUrls?.length > 0 ? crop.imageUrls : ['https://images.unsplash.com/photo-1488459716781-6918f33427e1?auto=format&fit=crop&q=80&w=800'];

    return (
        <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            

            <main className="container" style={{ padding: '40px 20px 80px' }}>
                <button
                    onClick={() => navigate('/marketplace')}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontWeight: '600', cursor: 'pointer', marginBottom: '24px' }}
                >
                    <ArrowLeft size={18} /> Back to Marketplace
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: '48px' }}>
                    {/* Left: Images */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="card" style={{ height: '500px', overflow: 'hidden', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                            <img src={images[activeImage]} alt={crop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        {images.length > 1 && (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {images.map((img, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: activeImage === idx ? '2px solid var(--primary)' : '2px solid transparent',
                                            transition: 'var(--transition)'
                                        }}
                                    >
                                        <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="card" style={{ padding: '24px', marginTop: '16px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Harvest Description</h3>
                            <p style={{ color: '#475569', lineHeight: '1.7', fontSize: '15px' }}>
                                {crop.description || "This high-quality harvest is fresh from our local farm. We prioritize sustainable farming practices to ensure the best taste and nutritional value for our customers. Directly sourced and carefully handled."}
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: '#f0fdf4', padding: '8px', borderRadius: '8px' }}>
                                        <Shield size={18} color="#15803d" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Quality</p>
                                        <p style={{ fontSize: '14px', fontWeight: '700' }}>Grade A Verified</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px' }}>
                                        <Truck size={18} color="#1d4ed8" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Shipping</p>
                                        <p style={{ fontSize: '14px', fontWeight: '700' }}>Pan-India Delivery</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Info & Purchase */}
                    <div style={{ position: 'sticky', top: '24px', height: 'fit-content' }}>
                        <div className="card" style={{ padding: '32px', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                <div>
                                    {crop.organic && (
                                        <span style={{ display: 'inline-block', background: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>
                                            • Organic Certified
                                        </span>
                                    )}
                                    <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>{crop.name}</h1>
                                </div>
                                <div style={{ padding: '8px 12px', background: '#fef3c7', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Star size={16} color="#d97706" fill="#d97706" />
                                    <span style={{ fontWeight: '700', color: '#92400e' }}>{crop.averageRating?.toFixed(1) || '4.5'}</span>
                                </div>
                            </div>

                            <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '15px', marginBottom: '24px' }}>
                                <MapPin size={16} /> Sold by <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{crop.farmerName}</span> • {crop.location || "Maharashtra, India"}
                            </p>

                            <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>Price per kg</p>
                                    <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--primary)' }}>₹{crop.pricePerKg.toFixed(2)}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '4px' }}>Available Stock</p>
                                    <p style={{ fontSize: '18px', fontWeight: '700' }}>{crop.quantity} {crop.unit || 'kg'}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <label style={{ fontWeight: '700', fontSize: '15px' }}>Select Quantity (kg)</label>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Total Price: <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>₹{(crop.pricePerKg * quantity).toFixed(2)}</span></span>
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', background: 'white' }}>
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            style={{ width: '48px', height: '48px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', transition: 'var(--transition)' }}
                                            onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                                            onMouseOut={(e) => e.target.style.background = 'none'}
                                        >-</button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                            style={{ width: '60px', textAlign: 'center', border: 'none', fontWeight: '700', fontSize: '16px', outline: 'none' }}
                                        />
                                        <button
                                            onClick={() => setQuantity(Math.min(crop.quantity, quantity + 1))}
                                            style={{ width: '48px', height: '48px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer', transition: 'var(--transition)' }}
                                            onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                                            onMouseOut={(e) => e.target.style.background = 'none'}
                                        >+</button>
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 16px', background: '#f8fafc', borderRadius: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                        <Calendar size={14} style={{ marginRight: '8px' }} /> Freshness: Harvested on {crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'Recent'}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    onClick={handleAddToCart}
                                    className="btn btn-primary"
                                    style={{ padding: '16px', fontSize: '16px', width: '100%' }}
                                >
                                    <ShoppingCart size={20} /> Add to Cart
                                </button>
                                <button
                                    onClick={() => setIsNegotiating(true)}
                                    className="btn"
                                    style={{ padding: '16px', fontSize: '16px', width: '100%', border: '2px solid var(--primary)', background: 'white', color: 'var(--primary)' }}
                                >
                                    <MessageCircle size={20} /> Negotiate Price
                                </button>
                            </div>
                        </div>

                        {/* Farmer Card */}
                <div 
                    onClick={() => navigate(`/messages?userId=${crop.farmerId}`)}
                    className="card" style={{ padding: '24px', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <User size={24} color="var(--primary-dark)" />
                        </div>
                        <div>
                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: '600' }}>Farmer Profile</p>
                            <p style={{ fontWeight: '700' }}>{crop.farmerName}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontWeight: '600', fontSize: '13px' }}>
                        <MessageCircle size={16} /> Message
                        <ChevronRight size={18} color="var(--text-muted)" />
                    </div>
                </div>
                    </div>
                </div>

                {/* Reviews Section Placeholder */}
                <div id="reviews" style={{ marginTop: '64px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '32px' }}>Customer Reviews</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                        {[1, 2].map(i => (
                            <div key={i} className="card" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[...Array(5)].map((_, j) => <Star key={j} size={14} color="#f59e0b" fill={j < (i === 1 ? 5 : 4) ? "#f59e0b" : "none"} />)}
                                    </div>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>2 days ago</span>
                                </div>
                                <p style={{ fontSize: '14px', fontStyle: 'italic', marginBottom: '16px', color: '#475569' }}>
                                    "{i === 1 ? "Absolutely fresh and high quality. The delivery was fast and the tomatoes were perfectly ripe. Will definitely order again!" : "Good quality produce, but delivery took a bit longer than expected. Overall satisfied with the freshness."}"
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700' }}>
                                        {i === 1 ? 'JD' : 'AS'}
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{i === 1 ? 'John Doe' : 'Alice Smith'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            {isNegotiating && (
                <NegotiationModal
                    crop={crop}
                    onClose={() => setIsNegotiating(false)}
                    onSuccess={() => alert('Offer sent successfully!')}
                />
            )}
        </div>
    );
};

export default CropDetails;
