import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Search, Filter, Star, MapPin, ShoppingCart, MessageCircle } from 'lucide-react';
import { useCart as useCartState } from '../context/CartContext';
import NegotiationModal from '../components/NegotiationModal';

const Marketplace = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCartState();
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [isNegotiating, setIsNegotiating] = useState(false);

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/crops/search', { params: { page: 0, size: 20 } });
            if (res.data && res.data.success && res.data.data && res.data.data.content) {
                const cropsData = res.data.data.content.map(crop => ({
                    id: crop.id,
                    name: crop.name,
                    price: parseFloat(crop.pricePerKg),
                    unit: crop.unit || 'kg',
                    farmer: crop.farmerName || 'Unknown Farmer',
                    farmerEmail: crop.farmerEmail,
                    rating: crop.averageRating || 4.5,
                    image: crop.imageUrls && crop.imageUrls.length > 0
                        ? crop.imageUrls[0]
                        : 'https://images.unsplash.com/photo-1488459716781-6918f33427e1?auto=format&fit=crop&q=80&w=400',
                    location: crop.location || 'Unknown Location',
                    pricePerKg: crop.pricePerKg // Added for cart context
                }));
                setCrops(cropsData);
                setError(null);
            } else {
                setCrops([]);
            }
        } catch (err) {
            console.error('Failed to fetch crops:', err);
            setError('Failed to load crops. Please try again.');
            setCrops([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (crop) => {
        addToCart(crop, 1);
        // Simple visual feedback
        alert(`Added ${crop.name} to cart!`);
    };

    const openNegotiation = (crop) => {
        setSelectedCrop(crop);
        setIsNegotiating(true);
    };

    const filteredCrops = crops.filter(crop =>
        crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            

            <main className="container" style={{ paddingBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Fresh Harvest Marketplace</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Direct deals from local farmers to your doorstep.</p>
                    </div>

                    <div style={{ flex: 1, maxWidth: '400px', margin: '0 24px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            className="input-field"
                            style={{ paddingLeft: '48px', backgroundColor: 'white' }}
                            placeholder="Search crops, farms or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
                        <Filter size={18} /> Filters
                    </button>
                </div>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                        <div className="animate-spin" style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
                    </div>
                )}

                {error && (
                    <div className="card" style={{ padding: '24px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', textAlign: 'center' }}>
                        <p>{error}</p>
                        <button onClick={fetchCrops} className="btn btn-primary" style={{ marginTop: '16px' }}>Retry</button>
                    </div>
                )}

                {!loading && filteredCrops.length === 0 && !error && (
                    <div className="card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Search size={48} style={{ margin: '0 auto 20px' }} />
                        <p style={{ fontSize: '18px', fontWeight: '500' }}>No crops match your search "{searchTerm}"</p>
                        <button onClick={() => setSearchTerm('')} className="btn btn-primary" style={{ marginTop: '16px' }}>Clear Search</button>
                    </div>
                )}

                {/* Crops Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px' }}>
                    {filteredCrops.map((crop) => (
                        <div key={crop.id} className="card animate-fade-in" style={{ overflow: 'hidden' }}>
                            <div
                                onClick={() => navigate(`/crop/${crop.id}`)}
                                style={{ height: '220px', width: '100%', position: 'relative', cursor: 'pointer' }}
                            >
                                <img src={crop.image} alt={crop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.95)', padding: '6px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: 'var(--shadow)' }}>
                                    <Star size={14} color="#f59e0b" fill="#f59e0b" /> {crop.rating.toFixed(1)}
                                </div>
                            </div>
                            <div style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                    <h3
                                        onClick={() => navigate(`/crop/${crop.id}`)}
                                        style={{ fontSize: '19px', fontWeight: '700', cursor: 'pointer' }}
                                    >
                                        {crop.name}
                                    </h3>
                                    <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>₹{crop.price.toFixed(2)}<span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)' }}>/kg</span></span>
                                </div>
                                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MapPin size={14} /> {crop.farmer} • {crop.location}
                                </p>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button
                                        onClick={() => openNegotiation(crop)}
                                        className="btn"
                                        style={{ flex: 1, border: '1px solid var(--primary)', background: 'white', color: 'var(--primary)' }}
                                    >
                                        <MessageCircle size={18} /> Offer
                                    </button>
                                    <button
                                        onClick={() => handleAddToCart(crop)}
                                        className="btn btn-primary"
                                        style={{ flex: 1.5 }}
                                    >
                                        <ShoppingCart size={18} /> Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {isNegotiating && selectedCrop && (
                <NegotiationModal
                    crop={selectedCrop}
                    onClose={() => setIsNegotiating(false)}
                    onSuccess={() => alert('Offer sent successfully to the farmer!')}
                />
            )}
        </div>
    );
};

export default Marketplace;
