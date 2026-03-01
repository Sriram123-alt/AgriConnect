import React, { useState, useEffect } from 'react';
import { ShoppingBag, Edit2, Trash2, Plus, Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/api';

const MyCrops = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyCrops();
    }, []);

    const fetchMyCrops = async () => {
        try {
            const response = await api.get('/api/crops/farmer/me');
            if (response.data.success) {
                setCrops(response.data.data.content || []);
            }
        } catch (err) {
            console.error('Failed to fetch my crops', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this listing?')) return;

        try {
            const response = await api.delete(`/api/crops/${id}`);
            if (response.data.success) {
                setCrops(crops.filter(c => c.id !== id));
            }
        } catch (err) {
            alert('Failed to delete crop');
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Navbar />
            <main style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>My Crop Listings</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Manage your available harvest and pricing.</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/add-crop')}>
                        <Plus size={18} /> Add New Crop
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
                    </div>
                ) : crops.length === 0 ? (
                    <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                        <ShoppingBag size={48} color="var(--text-muted)" style={{ margin: '0 auto 20px' }} />
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>You haven't listed any crops yet</h2>
                        <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => navigate('/add-crop')}>
                            List Your First Crop
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {crops.map(crop => (
                            <div key={crop.id} className="card overflow-hidden">
                                <div style={{ height: '180px', position: 'relative' }}>
                                    <img
                                        src={crop.imageUrls?.[0] || 'https://images.unsplash.com/photo-1488459716781-6918f33427e1?auto=format&fit=crop&q=80&w=400'}
                                        alt={crop.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'white', padding: '4px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Star size={14} color="#f59e0b" fill="#f59e0b" /> {crop.averageRating || 'N/A'}
                                    </div>
                                </div>
                                <div style={{ padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <h3 style={{ fontWeight: '700', fontSize: '18px' }}>{crop.name}</h3>
                                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>₹{crop.pricePerKg}/kg</span>
                                    </div>
                                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MapPin size={14} /> {crop.category || 'Fresh Produce'} • {crop.organic ? 'Organic' : 'Traditional'}
                                    </p>

                                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                                        <div>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Available</p>
                                            <p style={{ fontWeight: '700' }}>{crop.quantity} kg</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Status</p>
                                            <p style={{ fontWeight: '700', color: 'var(--primary-dark)' }}>ACTIVE</p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            onClick={() => navigate(`/edit-crop/${crop.id}`)}
                                            className="btn"
                                            style={{ flex: 1, border: '1px solid var(--border)', background: 'white' }}
                                        >
                                            <Edit2 size={16} /> Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(crop.id)}
                                            className="btn"
                                            style={{ flex: 1, border: '1px solid var(--error)', background: 'white', color: 'var(--error)' }}
                                        >
                                            <Trash2 size={16} /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyCrops;
