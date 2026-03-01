import React, { useState, useEffect } from 'react';
import {
    Truck, MapPin, Package, User, Phone, Car, Calendar,
    Search, Filter, Clock, CheckCircle, XCircle, ArrowRight,
    Navigation, DollarSign, Weight, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/api';

/* ── Status config ──────────────────────────────────────────────────── */
const STATUS_CONFIG = {
    BOOKED: { bg: '#fef3c7', color: '#92400e', icon: Clock, label: 'Booked', step: 1 },
    DRIVER_ASSIGNED: { bg: '#dbeafe', color: '#1e40af', icon: User, label: 'Driver Assigned', step: 2 },
    PICKED_UP: { bg: '#f3e8ff', color: '#6b21a8', icon: Package, label: 'Picked Up', step: 3 },
    IN_TRANSIT: { bg: '#cffafe', color: '#155e75', icon: Truck, label: 'In Transit', step: 4 },
    DELIVERED: { bg: '#d1fae5', color: '#065f46', icon: CheckCircle, label: 'Delivered', step: 5 },
    CANCELLED: { bg: '#fee2e2', color: '#991b1b', icon: XCircle, label: 'Cancelled', step: -1 },
};

const TIMELINE_STEPS = ['BOOKED', 'DRIVER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'];

const VEHICLE_EMOJI = {
    MINI_TRUCK: '🚐',
    MEDIUM_LORRY: '🚛',
    LARGE_LORRY: '🚚',
    HEAVY_TRUCK: '🏗️',
};

/* ── Timeline component ─────────────────────────────────────────────── */
const TrackingTimeline = ({ currentStatus }) => {
    const config = STATUS_CONFIG[currentStatus] || {};
    const currentStep = config.step || 0;
    const isCancelled = currentStatus === 'CANCELLED';

    if (isCancelled) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', background: '#fef2f2', borderRadius: 10,
                border: '1px solid #fecaca',
            }}>
                <XCircle size={18} color="#ef4444" />
                <span style={{ fontWeight: 700, color: '#dc2626', fontSize: 14 }}>
                    Booking Cancelled
                </span>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '8px 0' }}>
            {TIMELINE_STEPS.map((stepKey, idx) => {
                const stepConfig = STATUS_CONFIG[stepKey];
                const stepNum = stepConfig.step;
                const isActive = stepNum === currentStep;
                const isDone = stepNum < currentStep;
                const StepIcon = stepConfig.icon;

                return (
                    <React.Fragment key={stepKey}>
                        <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            flex: 1, position: 'relative',
                        }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: '50%',
                                background: isDone ? '#16a34a' : isActive ? 'linear-gradient(135deg, #16a34a, #15803d)' : '#e2e8f0',
                                color: isDone || isActive ? '#fff' : '#94a3b8',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isActive ? '0 0 0 4px rgba(22,163,74,0.2)' : 'none',
                                transition: 'all 0.3s',
                            }}>
                                {isDone ? <CheckCircle size={16} /> : <StepIcon size={14} />}
                            </div>
                            <span style={{
                                fontSize: 10, fontWeight: isActive ? 700 : 500,
                                color: isActive ? '#16a34a' : isDone ? '#15803d' : '#94a3b8',
                                marginTop: 4, textAlign: 'center', lineHeight: 1.2,
                                maxWidth: 70,
                            }}>
                                {stepConfig.label}
                            </span>
                        </div>
                        {idx < TIMELINE_STEPS.length - 1 && (
                            <div style={{
                                flex: 1, height: 3, borderRadius: 2,
                                background: stepNum < currentStep ? '#16a34a' : '#e2e8f0',
                                marginTop: -18, transition: 'background 0.4s',
                            }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

/* ── Route visualization ────────────────────────────────────────────── */
const RouteVisual = ({ pickup, delivery }) => (
    <div style={{
        display: 'flex', alignItems: 'stretch', gap: 12,
        padding: '14px 16px', background: '#f8fafc', borderRadius: 12,
        border: '1px solid #e2e8f0',
    }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <div style={{
                width: 10, height: 10, borderRadius: '50%', background: '#16a34a',
                boxShadow: '0 0 0 3px rgba(22,163,74,0.2)',
            }} />
            <div style={{
                flex: 1, width: 2, background: 'linear-gradient(to bottom, #16a34a, #e2e8f0 40%, #e2e8f0 60%, #3b82f6)',
                minHeight: 30,
            }} />
            <div style={{
                width: 10, height: 10, borderRadius: '50%', background: '#3b82f6',
                boxShadow: '0 0 0 3px rgba(59,130,246,0.2)',
            }} />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
            <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                    Pickup — Farmer Location
                </p>
                <p style={{ fontSize: 13, color: '#1e293b', margin: '2px 0 0', fontWeight: 500 }}>{pickup || '—'}</p>
            </div>
            <div>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                    Delivery — Your Location
                </p>
                <p style={{ fontSize: 13, color: '#1e293b', margin: '2px 0 0', fontWeight: 500 }}>{delivery || '—'}</p>
            </div>
        </div>
    </div>
);

/* ── Detail pill ────────────────────────────────────────────────────── */
const DetailPill = ({ icon, label, value, accent }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', background: '#fff', borderRadius: 10,
        border: '1px solid #f1f5f9',
    }}>
        <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: accent ? '#dcfce7' : '#f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accent ? '#16a34a' : '#64748b', flexShrink: 0,
        }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '1px 0 0' }}>{value || '—'}</p>
        </div>
    </div>
);

/* ── Main page ──────────────────────────────────────────────────────── */
const MyTransport = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [expandedId, setExpandedId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { fetchBookings(); }, []);

    const fetchBookings = async () => {
        try {
            const res = await api.get('/api/transport/buyer/me?page=0&size=100');
            if (res.data.success) {
                setBookings(res.data.data.content || []);
            }
        } catch (err) {
            console.error('Failed to fetch transport bookings', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchBookings();
    };

    const filtered = bookings.filter(b => {
        const matchSearch =
            String(b.id).includes(search) ||
            String(b.orderId).includes(search) ||
            b.driverName?.toLowerCase().includes(search.toLowerCase()) ||
            b.vehicleNumber?.toLowerCase().includes(search.toLowerCase()) ||
            b.pickupAddress?.toLowerCase().includes(search.toLowerCase()) ||
            b.deliveryAddress?.toLowerCase().includes(search.toLowerCase());

        const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
        return matchSearch && matchStatus;
    });

    // Stats
    const activeCount = bookings.filter(b => !['DELIVERED', 'CANCELLED'].includes(b.status)).length;
    const deliveredCount = bookings.filter(b => b.status === 'DELIVERED').length;
    const totalSpent = bookings
        .filter(b => b.status !== 'CANCELLED')
        .reduce((sum, b) => sum + Number(b.estimatedCost || 0), 0);

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>

                {/* ── Page Header ── */}
                <div style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                        <div>
                            <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 12,
                                    background: 'linear-gradient(135deg, #16a34a, #15803d)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Truck size={22} color="#fff" />
                                </div>
                                My Transport
                            </h1>
                            <p style={{ color: '#64748b', marginTop: 4, fontSize: 14 }}>
                                Track and manage all your transport bookings
                            </p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '10px 18px', borderRadius: 10,
                                border: '1px solid #e2e8f0', background: '#fff',
                                cursor: 'pointer', fontWeight: 600, fontSize: 13,
                                color: '#475569', transition: 'all 0.2s',
                            }}
                        >
                            <RefreshCw size={15} style={{
                                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                            }} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* ── Stats Bar ── */}
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 14, marginBottom: 24,
                }}>
                    <StatCard icon={<Truck size={20} />} label="Total Bookings" value={bookings.length} color="#3b82f6" bg="#dbeafe" />
                    <StatCard icon={<Navigation size={20} />} label="Active / In Transit" value={activeCount} color="#f59e0b" bg="#fef3c7" />
                    <StatCard icon={<CheckCircle size={20} />} label="Delivered" value={deliveredCount} color="#16a34a" bg="#dcfce7" />
                    <StatCard icon={<DollarSign size={20} />} label="Total Spent" value={`₹${totalSpent.toFixed(0)}`} color="#8b5cf6" bg="#f3e8ff" />
                </div>

                {/* ── Filters ── */}
                <div style={{
                    display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center',
                }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search by ID, driver, vehicle, location..."
                            className="input-field"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: 36, width: '100%' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Filter size={14} color="#64748b" />
                        {['ALL', 'BOOKED', 'DRIVER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                style={{
                                    padding: '6px 12px', borderRadius: 100,
                                    border: statusFilter === s ? '2px solid #16a34a' : '1px solid #e2e8f0',
                                    background: statusFilter === s ? '#f0fdf4' : '#fff',
                                    color: statusFilter === s ? '#15803d' : '#64748b',
                                    fontWeight: statusFilter === s ? 700 : 500,
                                    fontSize: 12, cursor: 'pointer', transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {s === 'ALL' ? 'All' : STATUS_CONFIG[s]?.label || s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Content ── */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div className="animate-spin" style={{
                            width: 44, height: 44,
                            border: '4px solid var(--primary-light)',
                            borderTopColor: 'var(--primary)',
                            borderRadius: '50%', margin: '0 auto'
                        }} />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="card" style={{ padding: 60, textAlign: 'center' }}>
                        <Truck size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
                        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                            {search || statusFilter !== 'ALL' ? 'No bookings match your search' : 'No transport bookings yet'}
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 400, margin: '0 auto' }}>
                            {search || statusFilter !== 'ALL'
                                ? 'Try adjusting your filters.'
                                : 'When you place an order and book transport, your bookings will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {filtered.map(booking => {
                            const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.BOOKED;
                            const StatusIcon = config.icon;
                            const isExpanded = expandedId === booking.id;

                            return (
                                <div
                                    key={booking.id}
                                    className="card"
                                    style={{
                                        overflow: 'hidden',
                                        border: '1px solid var(--border)',
                                        transition: 'box-shadow 0.3s',
                                    }}
                                >
                                    {/* ── Header row ── */}
                                    <div
                                        onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                                        style={{
                                            padding: '16px 24px',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            cursor: 'pointer', flexWrap: 'wrap', gap: 12,
                                            background: '#f8fafc', borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                                            transition: 'background 0.2s',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <span style={{ fontSize: 32 }}>{VEHICLE_EMOJI[booking.vehicleType] || '🚛'}</span>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span style={{ fontWeight: 800, fontSize: 15 }}>Booking #{booking.id}</span>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 4,
                                                        padding: '3px 10px', borderRadius: 100,
                                                        background: config.bg, color: config.color,
                                                        fontWeight: 700, fontSize: 11,
                                                    }}>
                                                        <StatusIcon size={12} />
                                                        {config.label}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                                                    Order #{booking.orderId} · {booking.vehicleTypeLabel}
                                                    {booking.createdAt && ` · ${new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span style={{ fontWeight: 800, fontSize: 16, color: '#16a34a' }}>
                                                ₹{Number(booking.estimatedCost).toFixed(0)}
                                            </span>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 8,
                                                border: '1px solid #e2e8f0', background: '#fff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#64748b',
                                            }}>
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Collapsed quick info ── */}
                                    {!isExpanded && (
                                        <div style={{
                                            padding: '10px 24px',
                                            display: 'flex', flexWrap: 'wrap', gap: 16,
                                            fontSize: 12, color: '#64748b',
                                        }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <User size={12} /> {booking.driverName || '—'}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Car size={12} /> {booking.vehicleNumber || '—'}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Calendar size={12} /> Est. {booking.estimatedDeliveryDate || '—'}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Weight size={12} /> {booking.totalWeightKg?.toFixed(1)} kg
                                            </span>
                                        </div>
                                    )}

                                    {/* ── Expanded details ── */}
                                    {isExpanded && (
                                        <div style={{ padding: '20px 24px' }}>
                                            {/* Tracking Timeline */}
                                            <div style={{ marginBottom: 20 }}>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                                                    📍 Tracking Progress
                                                </p>
                                                <TrackingTimeline currentStatus={booking.status} />
                                            </div>

                                            {/* Driver & Vehicle Details */}
                                            <div style={{ marginBottom: 20 }}>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                                                    🚛 Driver & Vehicle
                                                </p>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                                                    <DetailPill icon={<User size={15} />} label="Driver Name" value={booking.driverName} accent />
                                                    <DetailPill icon={<Phone size={15} />} label="Contact" value={booking.driverPhone} />
                                                    <DetailPill icon={<Car size={15} />} label="Vehicle No." value={booking.vehicleNumber} />
                                                    <DetailPill icon={<Truck size={15} />} label="Vehicle Type" value={booking.vehicleTypeLabel} />
                                                    <DetailPill icon={<Calendar size={15} />} label="Est. Delivery" value={booking.estimatedDeliveryDate} accent />
                                                    <DetailPill icon={<Weight size={15} />} label="Total Weight" value={`${booking.totalWeightKg?.toFixed(1)} kg`} />
                                                </div>
                                            </div>

                                            {/* Route */}
                                            <div style={{ marginBottom: 16 }}>
                                                <p style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                                                    🗺️ Route
                                                </p>
                                                <RouteVisual pickup={booking.pickupAddress} delivery={booking.deliveryAddress} />
                                            </div>

                                            {/* Cost */}
                                            <div style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                padding: '14px 18px',
                                                background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                                                borderRadius: 12, border: '1px solid #bbf7d0',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <DollarSign size={18} color="#16a34a" />
                                                    <span style={{ fontWeight: 700, color: '#15803d', fontSize: 14 }}>Transport Cost</span>
                                                </div>
                                                <span style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>
                                                    ₹{Number(booking.estimatedCost).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

/* ── Stat card ──────────────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, color, bg }) => (
    <div className="card" style={{
        padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
        border: '1px solid var(--border)',
    }}>
        <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: bg, color: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>{label}</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', margin: '2px 0 0' }}>{value}</p>
        </div>
    </div>
);

export default MyTransport;
