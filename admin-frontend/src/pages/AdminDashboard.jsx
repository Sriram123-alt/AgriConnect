import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, ShoppingBag, Package, TrendingUp, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';
import api from '../api/api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [metrics, setMetrics] = useState({
        totalUsers: 0,
        totalCrops: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await api.get('/api/admin/metrics');
                if (response.data.success) {
                    setMetrics(response.data.data);
                }
            } catch (err) {
                console.error('Failed to fetch metrics', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);

    const stats = [
        { label: 'Total Users', value: metrics.totalUsers, icon: Users, color: '#3b82f6', trend: '+12%', positive: true },
        { label: 'Total Crops', value: metrics.totalCrops, icon: ShoppingBag, color: '#10b981', trend: '+5%', positive: true },
        { label: 'Total Orders', value: metrics.totalOrders, icon: Package, color: '#8b5cf6', trend: '+18%', positive: true },
        { label: 'Total Revenue', value: `₹${(metrics.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: '#f59e0b', trend: '+24%', positive: true },
    ];

    return (
        <div style={{ display: 'flex', background: '#f1f5f9', minHeight: '100vh' }}>
            <AdminNavbar />
            <main style={{ marginLeft: '280px', flex: 1, padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>Platform Overview</h1>
                        <p style={{ color: '#64748b' }}>Here's what's happening globally across AgriConnect.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>Systems Online</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                    {stats.map((stat, i) => (
                        <div key={i} className="card" style={{ padding: '24px', border: 'none', background: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ background: stat.color + '15', padding: '12px', borderRadius: '12px' }}>
                                    <stat.icon size={24} color={stat.color} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '700', color: stat.positive ? '#16a34a' : '#dc2626' }}>
                                    {stat.positive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{stat.label}</p>
                                <p style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>{loading ? '...' : stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                    {/* Activity Placeholder */}
                    <div className="card" style={{ padding: '24px', border: 'none', background: 'white' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', color: '#1e293b' }}>Recent Disputes</h2>
                        <div style={{ textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
                            <AlertCircle size={40} color="#94a3b8" style={{ marginBottom: '16px' }} />
                            <p style={{ color: '#64748b', fontWeight: '600' }}>No active disputes or reports.</p>
                            <p style={{ fontSize: '13px', color: '#94a3b8' }}>All transactions and listings are within safety parameters.</p>
                        </div>
                    </div>

                    {/* Platform Health */}
                    <div className="card" style={{ padding: '24px', border: 'none', background: 'white' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', color: '#1e293b' }}>Platform Health</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
                                    <span style={{ color: '#64748b' }}>Farmer Verification</span>
                                    <span style={{ color: '#1e293b' }}>92%</span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: '92%', height: '100%', background: '#3b82f6' }}></div>
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
                                    <span style={{ color: '#64748b' }}>Order Success Rate</span>
                                    <span style={{ color: '#1e293b' }}>98.5%</span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: '98.5%', height: '100%', background: '#10b981' }}></div>
                                </div>
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontWeight: '700' }}>
                                    <span style={{ color: '#64748b' }}>Storage Utilization</span>
                                    <span style={{ color: '#1e293b' }}>45%</span>
                                </div>
                                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{ width: '45%', height: '100%', background: '#f59e0b' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
