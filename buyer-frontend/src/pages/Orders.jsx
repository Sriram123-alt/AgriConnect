import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
    Package, Truck, CheckCircle, Clock, XCircle, Search,
    MapPin, User, Phone, Car, Calendar, ChevronDown, ChevronUp, MessageCircle, Star
} from 'lucide-react';
import TransportBookingModal from '../components/TransportBookingModal';
import api from '../api/api';

const STATUS_CONFIG = {
    PENDING: { bg: '#fef3c7', color: '#92400e', icon: Clock },
    CONFIRMED: { bg: '#dbeafe', color: '#1e40af', icon: CheckCircle },
    SHIPPED: { bg: '#f3e8ff', color: '#6b21a8', icon: Truck },
    DELIVERED: { bg: '#d1fae5', color: '#065f46', icon: CheckCircle },
    CANCELLED: { bg: '#fee2e2', color: '#991b1b', icon: XCircle },
};

const TRANSPORT_STATUS = {
    BOOKED: { bg: '#fef3c7', color: '#92400e', label: 'Booked' },
    DRIVER_ASSIGNED: { bg: '#dbeafe', color: '#1e40af', label: 'Driver Assigned' },
    PICKED_UP: { bg: '#f3e8ff', color: '#6b21a8', label: 'Picked Up' },
    IN_TRANSIT: { bg: '#cffafe', color: '#155e75', label: 'In Transit' },
    DELIVERED: { bg: '#d1fae5', color: '#065f46', label: 'Delivered' },
    CANCELLED: { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [transportBookings, setTransportBookings] = useState({}); // orderId → booking
    const [bookingModal, setBookingModal] = useState(null); // order object or null
    const location = useLocation();
    const navigate = useNavigate();
    const { orderId } = useParams();

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [orderId]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/orders/buyer/me');
            if (res.data.success) {
                const fetched = res.data.data.content || [];
                setOrders(fetched);
                // Fetch transport bookings for all orders
                fetchAllTransportBookings(fetched);

                if (orderId) {
                    setExpandedOrder(parseInt(orderId));
                }

                // Auto-open transport booking modal if coming from Cart
                if (location.state?.bookTransportForOrder) {
                    const newOrder = location.state.bookTransportForOrder;
                    const matchingOrder = fetched.find(o => o.id === newOrder.id) || newOrder;
                    setExpandedOrder(matchingOrder.id);
                    setBookingModal(matchingOrder);
                    // Clear the state so refreshing doesn't re-trigger
                    window.history.replaceState({}, document.title);
                }
            }
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllTransportBookings = async (orderList) => {
        const map = {};
        await Promise.all(
            orderList.map(async (o) => {
                try {
                    const res = await api.get(`/api/transport/order/${o.id}`);
                    if (res.data.success) map[o.id] = res.data.data;
                } catch (_) {
                    // no booking yet — ignore 404
                }
            })
        );
        setTransportBookings(map);
    };

    const handleBooked = (booking) => {
        setTransportBookings(prev => ({ ...prev, [booking.orderId]: booking }));
    };

    const filtered = orders.filter(o =>
        String(o.id).includes(search) ||
        o.status?.toLowerCase().includes(search.toLowerCase()) ||
        o.items?.some(i => i.cropName?.toLowerCase().includes(search.toLowerCase()))
    );

    const getPlaceholder = (name) => {
        const n = name?.toLowerCase() || '';
        if (n.includes('wheat')) return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800';
        if (n.includes('rice')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800';
        if (n.includes('corn') || n.includes('maize')) return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800';
        if (n.includes('tomato')) return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800';
        if (n.includes('potato')) return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800';
        return 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800';
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>My Orders</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 14 }}>
                        Track your orders and book transport
                    </p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search orders..."
                        className="input-field"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ paddingLeft: 36, width: 280 }}
                    />
                </div>
            </div>

                {/* Content */}
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
                    <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                        <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 20px' }} />
                        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>No orders found</h2>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {search ? 'No orders match your search.' : "You haven't placed any orders yet."}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {filtered.map(order => {
                            const StatusIcon = STATUS_CONFIG[order.status]?.icon || Clock;
                            const statusStyle = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                            const isExpanded = expandedOrder === order.id;
                            const transport = transportBookings[order.id];
                            const canBookTransport = order.status !== 'CANCELLED' && !transport;

                            return (
                                <div key={order.id} className="card" style={{ overflow: 'hidden', border: '1px solid var(--border)' }}>

                                    {/* Order Header Row */}
                                    <div style={{
                                        padding: '18px 24px',
                                        borderBottom: '1px solid var(--border)',
                                        background: '#f8fafc',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        flexWrap: 'wrap', gap: 12
                                    }}>
                                        <div style={{ display: 'flex', gap: 36, flexWrap: 'wrap' }}>
                                            <MetaBlock label="Order ID" value={`#${order.id}`} bold />
                                            <MetaBlock label="Date" value={new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
                                            <MetaBlock label="Total" value={`₹${Number(order.totalAmount).toFixed(2)}`} accent />
                                            <MetaBlock label="Payment" value={order.paymentMethod || 'COD'} />
                                            <MetaBlock label="Pay Status" value={order.paymentStatus || 'PENDING'} bold color={order.paymentStatus === 'PAID' ? '#16a34a' : '#f59e0b'} />
                                            <MetaBlock label="Items" value={`${order.items?.length || 0} item(s)`} />
                                        </div>
                                            {order.status === 'DELIVERED' && (
                                                <button
                                                    onClick={() => navigate(`/reviews?orderId=${order.id}`)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                        padding: '5px 12px', borderRadius: 100,
                                                        background: 'var(--primary-light)', border: '1px solid var(--primary)',
                                                        color: 'var(--primary-dark)', fontWeight: 700, fontSize: 12,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <Star size={13} fill="var(--primary-dark)" /> Rate Order
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate(`/track/${order.id}`)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                    padding: '5px 12px', borderRadius: 100,
                                                    background: 'white', border: '1px solid var(--border)',
                                                    color: 'var(--primary)', fontWeight: 700, fontSize: 12,
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Track Order
                                            </button>
                                            {order.items?.[0] && (
                                                <button
                                                    onClick={() => navigate(`/messages?userId=${order.items[0].farmerId}`)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                        padding: '5px 12px', borderRadius: 100,
                                                        background: 'white', border: '1px solid var(--border)',
                                                        color: 'var(--text-main)', fontWeight: 700, fontSize: 12,
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <MessageCircle size={13} /> Message
                                                </button>
                                            )}
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                                padding: '5px 12px', borderRadius: 100,
                                                background: statusStyle.bg, color: statusStyle.color,
                                                fontWeight: 700, fontSize: 12,
                                            }}>
                                                <StatusIcon size={13} />
                                                {order.status}
                                            </span>
                                            <button
                                                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                                style={{
                                                    border: '1px solid #e2e8f0', background: '#fff',
                                                    borderRadius: 8, padding: '5px 8px', cursor: 'pointer',
                                                    color: '#64748b',
                                                }}
                                            >
                                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                    </div>

                                    {/* Collapsible Details */}
                                    {isExpanded && (
                                        <div style={{ padding: '20px 24px' }}>

                                            {/* Crop items */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                                                {order.items?.map(item => (
                                                    <div key={item.id} style={{
                                                        display: 'flex', gap: 14, alignItems: 'center',
                                                        padding: '12px', background: '#f8fafc',
                                                        borderRadius: 10, border: '1px solid #e2e8f0'
                                                    }}>
                                                        <div style={{
                                                            width: 56, height: 56, borderRadius: 8,
                                                            overflow: 'hidden', background: '#f1f5f9', flexShrink: 0
                                                        }}>
                                                            <img
                                                                src={item.imageUrl || getPlaceholder(item.cropName)}
                                                                alt={item.cropName}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                        <div style={{ flex: 1 }}>
                                                            <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{item.cropName}</p>
                                                            <p style={{ fontSize: 13, color: '#64748b', margin: '2px 0 0' }}>
                                                                {item.quantity} kg × ₹{Number(item.priceAtPurchase).toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <p style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                                            ₹{(item.quantity * item.priceAtPurchase).toFixed(2)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Shipping address */}
                                            <div style={{
                                                display: 'flex', gap: 10, alignItems: 'flex-start',
                                                padding: '12px 14px', background: '#f0fdf4',
                                                borderRadius: 10, border: '1px solid #bbf7d0', marginBottom: 16
                                            }}>
                                                <MapPin size={16} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                                                <div>
                                                    <p style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>Delivery Address</p>
                                                    <p style={{ fontSize: 14, color: '#1e293b', margin: '2px 0 0' }}>{order.shippingAddress}</p>
                                                </div>
                                            </div>

                                            {/* ── Transport Booking Section ── */}
                                            <div style={{
                                                borderTop: '1px solid #e2e8f0',
                                                paddingTop: 16,
                                                marginTop: 4,
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Truck size={14} color="#16a34a" />
                                                        </div>
                                                        <span style={{ fontWeight: 700, fontSize: 15 }}>Transport</span>
                                                    </div>
                                                    {canBookTransport && (
                                                        <button
                                                            onClick={() => setBookingModal(order)}
                                                            className="btn btn-primary"
                                                            style={{ padding: '8px 18px', fontSize: 13 }}
                                                        >
                                                            <Truck size={14} /> Book Transport
                                                        </button>
                                                    )}
                                                </div>

                                                {transport ? (
                                                    <TransportDetails transport={transport} />
                                                ) : (
                                                    <div style={{
                                                        background: '#f8fafc', borderRadius: 10,
                                                        padding: '16px', textAlign: 'center',
                                                        border: '1.5px dashed #e2e8f0',
                                                    }}>
                                                        {order.status === 'CANCELLED' ? (
                                                            <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>
                                                                Transport unavailable — order was cancelled.
                                                            </p>
                                                        ) : (
                                                            <>
                                                                <Truck size={28} color="#cbd5e1" style={{ marginBottom: 8 }} />
                                                                <p style={{ fontWeight: 600, color: '#475569', margin: '0 0 4px' }}>No Transport Booked</p>
                                                                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                                                                    Book a lorry or truck to deliver your crops from the farmer's location.
                                                                </p>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Collapsed transport badge */}
                                    {!isExpanded && transport && (
                                        <div style={{
                                            padding: '8px 24px',
                                            background: TRANSPORT_STATUS[transport.status]?.bg || '#f1f5f9',
                                            display: 'flex', alignItems: 'center', gap: 6,
                                        }}>
                                            <Truck size={13} color={TRANSPORT_STATUS[transport.status]?.color || '#64748b'} />
                                            <span style={{ fontSize: 12, fontWeight: 700, color: TRANSPORT_STATUS[transport.status]?.color || '#64748b' }}>
                                                Transport: {TRANSPORT_STATUS[transport.status]?.label || transport.status}
                                            </span>
                                            <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
                                                · {transport.vehicleTypeLabel} · Driver: {transport.driverName}
                                            </span>
                                        </div>
                                    )}
                                    {!isExpanded && !transport && order.status !== 'CANCELLED' && (
                                        <div style={{ padding: '8px 24px', background: '#fffbeb', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Truck size={13} color="#d97706" />
                                            <span style={{ fontSize: 12, fontWeight: 700, color: '#d97706' }}>Transport not yet booked</span>
                                            <button
                                                onClick={() => { setExpandedOrder(order.id); }}
                                                style={{ marginLeft: 'auto', fontSize: 12, color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                                            >
                                                Book now →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            {/* Transport Booking Modal */}
            {bookingModal && (
                <TransportBookingModal
                    order={bookingModal}
                    onClose={() => setBookingModal(null)}
                    onBooked={handleBooked}
                />
            )}
        </div>
    );
};

// ── Meta block helper ─────────────────────────────────────────────────
const MetaBlock = ({ label, value, bold, accent, color }) => (
    <div>
        <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', margin: 0 }}>{label}</p>
        <p style={{
            fontWeight: bold || accent ? 700 : 600,
            color: color || (accent ? 'var(--primary)' : '#1e293b'),
            margin: '2px 0 0', fontSize: 13
        }}>{value}</p>
    </div>
);

// ── Transport details panel inside expanded order ──────────────────────
const TransportDetails = ({ transport }) => {
    const ts = TRANSPORT_STATUS[transport.status] || {};
    return (
        <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Status bar */}
            <div style={{
                background: ts.bg || '#f1f5f9', padding: '10px 14px',
                display: 'flex', alignItems: 'center', gap: 8,
            }}>
                <Truck size={16} color={ts.color || '#64748b'} />
                <span style={{ fontWeight: 700, color: ts.color || '#64748b', fontSize: 14 }}>
                    {ts.label || transport.status}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>
                    Booking #{transport.id}
                </span>
            </div>
            {/* Details grid */}
            <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <TDetail icon={<Car size={14} />} label="Vehicle" value={transport.vehicleTypeLabel} />
                <TDetail icon={<User size={14} />} label="Driver" value={transport.driverName} />
                <TDetail icon={<Phone size={14} />} label="Contact" value={transport.driverPhone} />
                <TDetail icon={<Car size={14} />} label="Vehicle No." value={transport.vehicleNumber} />
                <TDetail icon={<Calendar size={14} />} label="Est. Delivery" value={transport.estimatedDeliveryDate} />
                <TDetail icon={<Package size={14} />} label="Weight" value={`${transport.totalWeightKg?.toFixed(1)} kg`} />
            </div>
            {/* Route */}
            <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <RouteRow color="#16a34a" label="Pickup" value={transport.pickupAddress} />
                <RouteRow color="#3b82f6" label="Delivery" value={transport.deliveryAddress} />
            </div>
            {/* Cost */}
            <div style={{
                borderTop: '1px solid #e2e8f0', padding: '10px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Transport Cost</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#16a34a' }}>₹{Number(transport.estimatedCost).toFixed(2)}</span>
            </div>
        </div>
    );
};

const TDetail = ({ icon, label, value }) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ color: '#94a3b8', marginTop: 1 }}>{icon}</span>
        <div>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{label}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '1px 0 0' }}>{value || '—'}</p>
        </div>
    </div>
);

const RouteRow = ({ color, label, value }) => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <MapPin size={14} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
            <p style={{ fontSize: 11, fontWeight: 700, color, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
            <p style={{ fontSize: 13, color: '#475569', margin: '1px 0 0' }}>{value}</p>
        </div>
    </div>
);

export default Orders;
