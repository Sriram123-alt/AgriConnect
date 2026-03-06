import React, { useState, useEffect } from 'react';
import {
    Search, Filter, Truck, Package, MapPin, ArrowRight, User, Phone, Car,
    Calendar, CheckCircle, Clock, XCircle, RefreshCw, ChevronDown, ChevronUp,
    Navigation, Users, AlertTriangle, Hash
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

const STATUS_FLOW = ['BOOKED', 'DRIVER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [expandedId, setExpandedId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [assignData, setAssignData] = useState({
        driverName: '',
        driverPhone: '',
        vehicleNumber: '',
        estimatedDeliveryDate: ''
    });

    const fetchBookings = async () => {
        try {
            const res = await api.get('/api/transport/admin/all?page=0&size=200');
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

    const refresh = () => { setRefreshing(true); fetchBookings(); };

    const updateStatus = async (id, newStatus) => {
        setUpdatingId(id);
        try {
            const res = await api.patch(`/api/transport/${id}/status?status=${newStatus}`);
            if (res.data.success) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
            }
        } catch (err) {
            alert('Failed to update status: ' + (err.response?.data?.message || err.message));
        } finally {
            setUpdatingId(null);
        }
    };

    const cancelBooking = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;
        updateStatus(id, 'CANCELLED');
    };

    const handleAssignDriver = async (id) => {
        if (!assignData.driverName || !assignData.driverPhone || !assignData.vehicleNumber || !assignData.estimatedDeliveryDate) {
            alert('Please fill all driver details');
            return;
        }

        setUpdatingId(id);
        try {
            const params = new URLSearchParams(assignData);
            const res = await api.patch(`/api/transport/${id}/driver-details?${params.toString()}`);
            if (res.data.success) {
                setBookings(prev => prev.map(b => b.id === id ? { ...b, ...res.data.data, status: 'DRIVER_ASSIGNED' } : b));
                setExpandedId(null);
                setAssignData({ driverName: '', driverPhone: '', vehicleNumber: '', estimatedDeliveryDate: '' });
                alert('Driver assigned successfully!');
            }
        } catch (err) {
            alert('Failed to assign driver: ' + (err.response?.data?.message || err.message));
        } finally {
            setUpdatingId(null);
        }
    };

    const getNextStatus = (current) => {
        const idx = STATUS_FLOW.indexOf(current);
        if (idx === -1 || idx >= STATUS_FLOW.length - 1) return null;
        return STATUS_FLOW[idx + 1];
    };

    // Filter & Search
    const filtered = bookings.filter(b => {
        if (b.orderStatus === 'PENDING') return false;
        if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
        if (search.trim()) {
            const q = search.toLowerCase();
            return (
                String(b.id).includes(q) ||
                (b.driverName || '').toLowerCase().includes(q) ||
                (b.vehicleNumber || '').toLowerCase().includes(q) ||
                (b.pickupAddress || '').toLowerCase().includes(q) ||
                (b.deliveryAddress || '').toLowerCase().includes(q) ||
                (b.vehicleType || '').toLowerCase().includes(q)
            );
        }
        return true;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h1 style={{ fontSize: 28, fontWeight: 800 }}>All Bookings</h1>
                        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
                            Manage and track all transport bookings · <span style={{ fontWeight: 700, color: '#f97316' }}>{filtered.length}</span> results
                        </p>
                    </div>
                    <button onClick={refresh} className="btn btn-secondary" disabled={refreshing}>
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} /> Refresh
                    </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="card" style={{
                    padding: '16px 20px', marginBottom: 20,
                    display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap',
                }}>
                    <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                        <Search size={16} style={{
                            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                            color: '#475569',
                        }} />
                        <input
                            className="input-field"
                            style={{ paddingLeft: 40, margin: 0 }}
                            placeholder="Search by ID, driver, vehicle, location..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Filter size={14} color="#64748b" />
                        <select
                            className="input-field"
                            style={{ width: 'auto', minWidth: 160, margin: 0 }}
                            value={filterStatus}
                            onChange={e => setFilterStatus(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                                <option key={key} value={key}>{cfg.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Status filter pills */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
                    {[{ key: 'ALL', label: 'All', count: bookings.length }]
                        .concat(Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
                            key, label: cfg.label,
                            count: bookings.filter(b => b.status === key).length,
                        })))
                        .map(pill => (
                            <button
                                key={pill.key}
                                onClick={() => setFilterStatus(pill.key)}
                                style={{
                                    padding: '6px 16px',
                                    borderRadius: 100,
                                    border: filterStatus === pill.key ? '1.5px solid #f97316' : '1px solid var(--border)',
                                    background: filterStatus === pill.key ? 'rgba(249,115,22,0.12)' : 'transparent',
                                    color: filterStatus === pill.key ? '#f97316' : '#94a3b8',
                                    fontWeight: 600, fontSize: 12,
                                    cursor: 'pointer', fontFamily: 'inherit',
                                    transition: 'all 0.2s',
                                }}
                            >
                                {pill.label} ({pill.count})
                            </button>
                        ))}
                </div>

                {/* Bookings List */}
                {filtered.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                        <AlertTriangle size={44} style={{ color: '#475569', marginBottom: 12 }} />
                        <p style={{ color: '#64748b', fontSize: 16, fontWeight: 600 }}>No bookings found</p>
                        <p style={{ color: '#475569', fontSize: 13, marginTop: 4 }}>Try adjusting your search or filter.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {filtered.map((b, i) => {
                            const sc = STATUS_CONFIG[b.status] || STATUS_CONFIG.BOOKED;
                            const StatusIcon = sc.icon;
                            const expanded = expandedId === b.id;
                            const nextStatus = getNextStatus(b.status);

                            return (
                                <div key={b.id} className="card" style={{
                                    overflow: 'hidden',
                                    animation: `fadeIn 0.3s ease-out ${i * 0.03}s both`,
                                    border: expanded ? '1px solid rgba(249,115,22,0.4)' : undefined,
                                }}>
                                    {/* Summary row */}
                                    <div
                                        onClick={() => setExpandedId(expanded ? null : b.id)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 16,
                                            padding: '16px 20px', cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{
                                            width: 42, height: 42, borderRadius: 12,
                                            background: sc.bg,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <StatusIcon size={20} color={sc.color} />
                                        </div>

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                                                <span style={{ fontWeight: 700, fontSize: 15 }}>
                                                    <Hash size={13} style={{ verticalAlign: 'middle' }} />{b.id}
                                                </span>
                                                <span style={{ color: '#475569', fontSize: 13 }}>·</span>
                                                <span style={{ fontSize: 13, color: '#94a3b8' }}>
                                                    {b.vehicleType?.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                fontSize: 12, color: '#64748b',
                                            }}>
                                                <MapPin size={11} />
                                                <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {b.pickupAddress || 'N/A'}
                                                </span>
                                                <ArrowRight size={11} />
                                                <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {b.deliveryAddress || 'N/A'}
                                                </span>
                                            </div>
                                        </div>

                                        <span className="badge" style={{ background: sc.bg, color: sc.color, fontSize: 12 }}>
                                            {sc.label}
                                        </span>

                                        <div style={{ marginLeft: '12px', minWidth: '100px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {b.status === 'BOOKED' && <span style={{ fontSize: '11px', color: '#f97316', fontWeight: '700', padding: '2px 8px', borderRadius: '100px', background: 'rgba(249,115,22,0.1)', width: 'fit-content' }}>NEEDS ASSIGNMENT</span>}
                                            {b.transportPaymentStatus && (
                                                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px', width: 'fit-content', background: b.transportPaymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7', color: b.transportPaymentStatus === 'PAID' ? '#15803d' : '#92400e' }}>
                                                    Platform Payout: {b.transportPaymentStatus}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 80 }}>
                                            <p style={{ fontWeight: 700, fontSize: 15, color: '#f97316' }}>
                                                ₹{(b.estimatedCost || 0).toLocaleString()}
                                            </p>
                                            <p style={{ fontSize: 11, color: '#475569' }}>
                                                {b.totalWeightKg ? `${b.totalWeightKg} kg` : ''}
                                            </p>
                                        </div>

                                        {expanded
                                            ? <ChevronUp size={18} color="#64748b" />
                                            : <ChevronDown size={18} color="#64748b" />
                                        }
                                    </div>

                                    {/* Expanded Details */}
                                    {expanded && (
                                        <div style={{
                                            padding: '0 20px 20px', borderTop: '1px solid var(--border)',
                                            animation: 'fadeIn 0.25s ease-out',
                                        }}>
                                            <div style={{
                                                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                gap: 16, marginTop: 18,
                                            }}>
                                                {/* Route */}
                                                <div style={{
                                                    padding: 16, borderRadius: 10,
                                                    background: 'var(--background)', border: '1px solid var(--border)',
                                                }}>
                                                    <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>Route</p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                                                                <span style={{ fontSize: 11, fontWeight: 600, color: '#10b981' }}>PICKUP</span>
                                                            </div>
                                                            <p style={{ fontSize: 13, marginLeft: 14 }}>{b.pickupAddress || 'N/A'}</p>
                                                        </div>
                                                        <div style={{ marginLeft: 3, borderLeft: '2px dashed #334155', height: 12 }} />
                                                        <div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                                                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316' }} />
                                                                <span style={{ fontSize: 11, fontWeight: 600, color: '#f97316' }}>DELIVERY</span>
                                                            </div>
                                                            <p style={{ fontSize: 13, marginLeft: 14 }}>{b.deliveryAddress || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Driver Info */}
                                                <div style={{
                                                    padding: 16, borderRadius: 10,
                                                    background: 'var(--background)', border: '1px solid var(--border)',
                                                }}>
                                                    <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>Driver & Vehicle</p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <User size={14} color="#94a3b8" />
                                                            <span style={{ fontSize: 13 }}>{b.driverName || 'Not assigned'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <Phone size={14} color="#94a3b8" />
                                                            <span style={{ fontSize: 13 }}>{b.driverPhone || '—'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <Car size={14} color="#94a3b8" />
                                                            <span style={{ fontSize: 13 }}>{b.vehicleNumber || '—'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <Calendar size={14} color="#94a3b8" />
                                                            <span style={{ fontSize: 13 }}>ETA: {b.estimatedDeliveryDate || '—'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order & Shipment */}
                                                <div style={{
                                                    padding: 16, borderRadius: 10,
                                                    background: 'var(--background)', border: '1px solid var(--border)',
                                                }}>
                                                    <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 10 }}>Shipment Details</p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                            <span style={{ color: '#94a3b8' }}>Order ID</span>
                                                            <span style={{ fontWeight: 600 }}>#{b.orderId || '—'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                            <span style={{ color: '#94a3b8' }}>Weight</span>
                                                            <span style={{ fontWeight: 600 }}>{b.totalWeightKg || 0} kg</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                            <span style={{ color: '#94a3b8' }}>Vehicle</span>
                                                            <span style={{ fontWeight: 600 }}>{b.vehicleType?.replace(/_/g, ' ') || '—'}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                            <span style={{ color: '#94a3b8' }}>Cost</span>
                                                            <span style={{ fontWeight: 700, color: '#f97316' }}>₹{(b.estimatedCost || 0).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tracking Timeline */}
                                            <div style={{ marginTop: 18, padding: 16, borderRadius: 10, background: 'var(--background)', border: '1px solid var(--border)' }}>
                                                <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 14 }}>Tracking Timeline</p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                                                    {STATUS_FLOW.map((step, idx) => {
                                                        const stepCfg = STATUS_CONFIG[step];
                                                        const currentIdx = STATUS_FLOW.indexOf(b.status);
                                                        const isCancelled = b.status === 'CANCELLED';
                                                        const isCompleted = !isCancelled && idx <= currentIdx;
                                                        const isCurrent = !isCancelled && idx === currentIdx;
                                                        const StepIcon = stepCfg.icon;

                                                        return (
                                                            <React.Fragment key={step}>
                                                                <div style={{
                                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                                                    flex: '0 0 auto',
                                                                }}>
                                                                    <div style={{
                                                                        width: 34, height: 34, borderRadius: '50%',
                                                                        background: isCompleted ? stepCfg.bg : 'var(--surface)',
                                                                        border: isCurrent ? `2px solid ${stepCfg.color}` : '2px solid var(--border)',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        transition: 'all 0.3s',
                                                                    }}>
                                                                        <StepIcon size={14} color={isCompleted ? stepCfg.color : '#475569'} />
                                                                    </div>
                                                                    <span style={{
                                                                        fontSize: 10, fontWeight: 600,
                                                                        color: isCompleted ? stepCfg.color : '#475569',
                                                                        whiteSpace: 'nowrap',
                                                                    }}>
                                                                        {stepCfg.label}
                                                                    </span>
                                                                </div>
                                                                {idx < STATUS_FLOW.length - 1 && (
                                                                    <div style={{
                                                                        flex: 1, height: 2, minWidth: 24,
                                                                        background: idx < currentIdx && !isCancelled ? stepCfg.color : '#334155',
                                                                        margin: '0 4px',
                                                                        marginBottom: 22,
                                                                        transition: 'background 0.3s',
                                                                    }} />
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })}
                                                    {b.status === 'CANCELLED' && (
                                                        <div style={{
                                                            marginLeft: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                                        }}>
                                                            <div style={{
                                                                width: 34, height: 34, borderRadius: '50%',
                                                                background: 'rgba(239,68,68,0.12)',
                                                                border: '2px solid #ef4444',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            }}>
                                                                <XCircle size={14} color="#ef4444" />
                                                            </div>
                                                            <span style={{ fontSize: 10, fontWeight: 600, color: '#ef4444', whiteSpace: 'nowrap' }}>Cancelled</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {b.status === 'BOOKED' && (
                                                <div style={{ marginTop: 20, padding: 20, background: 'rgba(249,115,22,0.03)', borderRadius: 12, border: '1px solid rgba(249,115,22,0.2)' }}>
                                                    <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <Truck size={18} color="#f97316" /> Assign Driver & Vehicle
                                                    </h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                                        <div className="form-group">
                                                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>Driver Name</label>
                                                            <input
                                                                className="input-field" placeholder="e.g. Ramesh Kumar"
                                                                value={assignData.driverName}
                                                                onChange={e => setAssignData({ ...assignData, driverName: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>Driver Phone</label>
                                                            <input
                                                                className="input-field" placeholder="e.g. +91 98XXX XXX00"
                                                                value={assignData.driverPhone}
                                                                onChange={e => setAssignData({ ...assignData, driverPhone: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>Vehicle Number</label>
                                                            <input
                                                                className="input-field" placeholder="e.g. MH 12 AB 1234"
                                                                value={assignData.vehicleNumber}
                                                                onChange={e => setAssignData({ ...assignData, vehicleNumber: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="form-group">
                                                            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block' }}>Estimated Delivery Date</label>
                                                            <input
                                                                type="date" className="input-field"
                                                                value={assignData.estimatedDeliveryDate}
                                                                onChange={e => setAssignData({ ...assignData, estimatedDeliveryDate: e.target.value })}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                                                        <button
                                                            className="btn btn-primary"
                                                            disabled={updatingId === b.id}
                                                            onClick={(e) => { e.stopPropagation(); handleAssignDriver(b.id); }}
                                                        >
                                                            {updatingId === b.id ? 'Assigning...' : 'Assign Driver & Vehicle'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {b.status !== 'BOOKED' && b.status !== 'DELIVERED' && b.status !== 'CANCELLED' && (
                                                <div style={{
                                                    display: 'flex', gap: 10, marginTop: 16,
                                                    justifyContent: 'flex-end',
                                                }}>
                                                    {nextStatus && (
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => updateStatus(b.id, nextStatus)}
                                                            disabled={updatingId === b.id}
                                                            style={{ fontSize: 13, padding: '8px 20px' }}
                                                        >
                                                            {updatingId === b.id ? 'Updating...' : (
                                                                <>Move to {STATUS_CONFIG[nextStatus].label} <ArrowRight size={14} /></>
                                                            )}
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => cancelBooking(b.id)}
                                                        disabled={updatingId === b.id}
                                                        style={{ fontSize: 13, padding: '8px 20px' }}
                                                    >
                                                        <XCircle size={14} /> Cancel
                                                    </button>
                                                </div>
                                            )}

                                            {b.status === 'BOOKED' && (
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => cancelBooking(b.id)}
                                                        disabled={updatingId === b.id}
                                                        style={{ fontSize: 13, padding: '8px 20px' }}
                                                    >
                                                        <XCircle size={14} /> Cancel Booking
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default Bookings;
