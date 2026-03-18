import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import api from '../api/api';

const ManageAllCrops = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCrops();
        const interval = setInterval(fetchCrops, 20000); // Admin poll every 20s
        return () => clearInterval(interval);
    }, []);

    const fetchCrops = async () => {
        try {
            const response = await api.get('/api/crops/search', { params: { page: 0, size: 50 } });
            if (response.data.success) {
                setCrops(response.data.data.content || []);
            }
        } catch (err) {
            console.error('Failed to fetch crops', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this listing?')) return;
        try {
            // Admin delete endpoint
            await api.delete(`/api/crops/${id}`);
            setCrops(crops.filter(c => c.id !== id));
        } catch (err) {
            alert('Failed to remove listing');
        }
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>Crop Listings Moderation</h1>
                        <p style={{ color: '#64748b' }}>Remove fraudulent or inappropriate listings.</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {loading ? (
                        <p>Loading...</p>
                    ) : crops.length === 0 ? (
                        <p>No listings found.</p>
                    ) : crops.map(crop => (
                        <div key={crop.id} className="card" style={{ overflow: 'hidden', border: 'none', background: 'white' }}>
                            <div style={{ height: '160px', position: 'relative' }}>
                                <img src={crop.imageUrls?.[0] || 'https://images.unsplash.com/photo-1488459716781-6918f33427e1?auto=format&fit=crop&q=80&w=400'} alt={crop.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {crop.status === 'FLAGGED' && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <AlertTriangle size={12} /> FLAGGED
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '20px' }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{crop.name}</h3>
                                    <p style={{ fontSize: '13px', color: '#64748b' }}>by <span style={{ color: '#3b82f6', fontWeight: '600' }}>{crop.farmerName}</span></p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <span style={{ fontSize: '15px', fontWeight: '800' }}>₹{crop.pricePerKg}/kg</span>
                                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{crop.quantity}kg available</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn" style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '8px' }}>
                                        <Eye size={16} /> View
                                    </button>
                                    <button onClick={() => handleDelete(crop.id)} className="btn" style={{ flex: 1, background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', padding: '8px' }}>
                                        <Trash2 size={16} /> Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
        </div>
    );
};

export default ManageAllCrops;
