import React, { useState, useEffect } from 'react';
import {
    Truck, Package, CheckCircle, Clock, XCircle, MapPin, ArrowRight,
    TrendingUp, Users, RefreshCw, AlertTriangle, Navigation
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/api';

const STATUS_CONFIG = {
    BOOKED: { label: 'Booked', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Clock },
    DRIVER_ASSIGNED: { label: 'Driver Assigned', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: Users },
    PICKED_UP: { label: 'Picked Up', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Package },
    IN_TRANSIT: { label: 'In Transit', color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: Navigation },
    DELIVERED: { label: 'Delivered', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: CheckCircle },
    CANCELLED: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: XCircle },
};

const Dashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/api/transport/admin/all?page=0&size=100');
            if (res.data.success) {
                setBookings(res.data.data.content || []);
            }
        } catch (err) {
            console.error('Failed to fetch bookings', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        const interval = setInterval(fetchBookings, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const refresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    // Compute stats
    const stats = {
        total: bookings.length,
        booked: bookings.filter(b => b.status === 'BOOKED').length,
        driverAssigned: bookings.filter(b => b.status === 'DRIVER_ASSIGNED').length,
        pickedUp: bookings.filter(b => b.status === 'PICKED_UP').length,
        inTransit: bookings.filter(b => b.status === 'IN_TRANSIT').length,
        delivered: bookings.filter(b => b.status === 'DELIVERED').length,
        cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
        revenue: bookings
            .filter(b => b.status !== 'CANCELLED')
            .reduce((sum, b) => sum + (b.estimatedCost || 0), 0),
        activeCount: bookings.filter(b => ['BOOKED', 'DRIVER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT'].includes(b.status)).length,
    };

    const recentBookings = [...bookings]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 8);

    const statCards = [
        { title: 'Total Bookings', value: stats.total, icon: Package, color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
        { title: 'Active Shipments', value: stats.activeCount, icon: Truck, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
        { title: 'Delivered', value: stats.delivered, icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
        { title: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    ];

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="animate-spin" style={{
                        width: 44, height: 44,
                        border: '4px solid rgba(249,115,22,0.2)',
                        borderTopColor: '#f97316', borderRadius: '50%',
                    }} />
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container" style={{ padding: '32px 24px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Dashboard</h1>
                        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Real-time transport operations overview</p>
                    </div>
                    <button onClick={refresh} className="btn btn-secondary" disabled={refreshing}>
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>

                {/* Stat Cards */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: 18, marginBottom: 32,
                }}>
                    {statCards.map((s, i) => (
                        <div key={i} className="card" style={{
                            padding: '22px 24px',
                            animation: `fadeIn 0.4s ease-out ${i * 0.08}s both`,
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p style={{ color: '#64748b', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{s.title}</p>
                                    <p style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.1 }}>{s.value}</p>
                                </div>
                                <div style={{
                                    width: 46, height: 46,
                                    background: s.bg, borderRadius: 12,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <s.icon size={22} color={s.color} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
                    {/* Recent Bookings */}
                    <div className="card" style={{ padding: 24, animation: 'fadeIn 0.5s ease-out' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Recent Bookings</h2>
                        {recentBookings.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                                <AlertTriangle size={40} style={{ marginBottom: 10, opacity: 0.3 }} />
                                <p>No bookings yet</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {recentBookings.map((b, i) => {
                                    const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.BOOKED;
                                    const StatusIcon = sc.icon;
                                    return (
                                        <div key={b.id || i} style={{
                                            display: 'flex', alignItems: 'center', gap: 14,
                                            padding: '14px 16px', borderRadius: 10,
                                            background: 'var(--background)',
                                            border: '1px solid var(--border)',
                                            animation: `fadeIn 0.3s ease-out ${i * 0.05}s both`,
                                        }}>
                                            <div style={{
                                                width: 38, height: 38, borderRadius: 10,
                                                background: sc.bg,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                flexShrink: 0,
                                            }}>
                                                <StatusIcon size={18} color={sc.color} />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                                                        #{b.id} · {b.vehicleType?.replace(/_/g, ' ')}
                                                    </span>
                                                    <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                                                        {sc.label}
                                                    </span>
                                                </div>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                    marginTop: 4, fontSize: 12, color: '#64748b',
                                                }}>
                                                    <MapPin size={11} />
                                                    <span style={{
                                                        whiteSpace: 'nowrap', overflow: 'hidden',
                                                        textOverflow: 'ellipsis', maxWidth: 220,
                                                    }}>
                                                        {b.pickupAddress || 'N/A'}
                                                    </span>
                                                    <ArrowRight size={11} />
                                                    <span style={{
                                                        whiteSpace: 'nowrap', overflow: 'hidden',
                                                        textOverflow: 'ellipsis', maxWidth: 220,
                                                    }}>
                                                        {b.deliveryAddress || 'N/A'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <p style={{ fontWeight: 700, fontSize: 14, color: '#f97316' }}>
                                                    ₹{(b.estimatedCost || 0).toLocaleString()}
                                                </p>
                                                <p style={{ fontSize: 11, color: '#475569' }}>
                                                    {b.totalWeightKg ? `${b.totalWeightKg} kg` : ''}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Status Breakdown */}
                    <div className="card" style={{ padding: 24, animation: 'fadeIn 0.5s ease-out 0.1s both' }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Status Breakdown</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                                const count = bookings.filter(b => b.status === status).length;
                                const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                                const Icon = cfg.icon;
                                return (
                                    <div key={status}>
                                        <div style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            alignItems: 'center', marginBottom: 6,
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Icon size={14} color={cfg.color} />
                                                <span style={{ fontSize: 13, fontWeight: 600 }}>{cfg.label}</span>
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 700, color: cfg.color }}>{count}</span>
                                        </div>
                                        <div style={{
                                            height: 6, borderRadius: 3,
                                            background: 'var(--background)',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                width: `${pct}%`,
                                                height: '100%',
                                                background: cfg.color,
                                                borderRadius: 3,
                                                transition: 'width 0.5s ease',
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Quick Stats */}
                        <div style={{
                            marginTop: 28, padding: 18,
                            background: 'var(--background)',
                            borderRadius: 12, border: '1px solid var(--border)',
                        }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Quick stats
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#94a3b8' }}>Pending pickup</span>
                                    <span style={{ fontWeight: 700 }}>{stats.booked + stats.driverAssigned}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#94a3b8' }}>On the road</span>
                                    <span style={{ fontWeight: 700 }}>{stats.pickedUp + stats.inTransit}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#94a3b8' }}>Success rate</span>
                                    <span style={{ fontWeight: 700, color: '#10b981' }}>
                                        {stats.total - stats.cancelled > 0
                                            ? Math.round((stats.delivered / (stats.total - stats.cancelled)) * 100)
                                            : 0
                                        }%
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#94a3b8' }}>Cancellations</span>
                                    <span style={{ fontWeight: 700, color: '#ef4444' }}>{stats.cancelled}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;
