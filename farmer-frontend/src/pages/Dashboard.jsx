import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, MessageSquare, TrendingUp, Plus, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/api';

const FarmerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState([
        { label: 'Active Listings', value: '0', icon: ShoppingBag, color: '#3b82f6' },
        { label: 'New Negotiations', value: '0', icon: MessageSquare, color: '#f59e0b' },
        { label: 'Total Earnings', value: '$0', icon: TrendingUp, color: '#10b981' },
    ]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats from backend
                const cropsRes = await api.get('/api/crops/farmer/me');
                const negRes = await api.get('/api/negotiations/farmer/me');

                if (cropsRes.data.success && negRes.data.success) {
                    const activeCrops = cropsRes.data.data.totalElements || 0;
                    const pendingNegs = negRes.data.data.content?.filter(n => n.status === 'PENDING').length || 0;

                    setStats([
                        { label: 'Active Listings', value: activeCrops.toString(), icon: ShoppingBag, color: '#3b82f6' },
                        { label: 'New Negotiations', value: pendingNegs.toString(), icon: MessageSquare, color: '#f59e0b' },
                        { label: 'Total Earnings', value: '₹25,400', icon: TrendingUp, color: '#10b981' }, // Hardcoded for demo
                    ]);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            }
        };
        fetchDashboardData();
    }, []);

    return (
        <div style={{ display: 'flex' }}>
            <Navbar />
            <div style={{ marginLeft: '260px', flex: 1, padding: '40px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Welcome back, {user?.fullName}!</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Here's what's happening with your farm today.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ background: stat.color + '20', padding: '16px', borderRadius: '16px' }}>
                                <stat.icon size={28} color={stat.color} />
                            </div>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>{stat.label}</p>
                                <p style={{ fontSize: '24px', fontWeight: '700' }}>{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                    {/* Recent Activity */}
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Quick Actions</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div onClick={() => navigate('/add-crop')} className="card" style={{ padding: '20px', cursor: 'pointer', border: '1px dashed var(--primary)', background: 'var(--primary-light)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <Plus size={24} color="var(--primary-dark)" />
                                <span style={{ fontWeight: '700' }}>List New Crop</span>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Add your latest harvest to the marketplace.</p>
                            </div>
                            <div onClick={() => navigate('/negotiations')} className="card" style={{ padding: '20px', cursor: 'pointer', border: '1px dashed var(--accent)', background: '#fffbeb', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <MessageSquare size={24} color="var(--accent)" />
                                <span style={{ fontWeight: '700' }}>Check Offers</span>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Review price offers from potential buyers.</p>
                            </div>
                        </div>
                    </div>

                    {/* Performance Card */}
                    <div className="card" style={{ padding: '24px', background: 'var(--primary-dark)', color: 'white' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px' }}>Farm Performance</h2>
                        <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '24px' }}>Your sales are up 12% compared to last month.</p>
                        <div style={{ fontSize: '36px', fontWeight: '800', marginBottom: '8px' }}>98%</div>
                        <p style={{ fontSize: '14px', opacity: 0.8 }}>Quality Rating</p>
                        <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '600' }}>
                            View analytics <ArrowUpRight size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerDashboard;
