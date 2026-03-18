import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { Package, Truck, CheckCircle, Clock, MapPin, MessageCircle, ArrowLeft, AlertCircle } from 'lucide-react';

const OrderTracking = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [transport, setTransport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
        const interval = setInterval(fetchOrder, 15000);
        return () => clearInterval(interval);
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/api/orders/${orderId}`);
            if (res.data.success) {
                setOrder(res.data.data);
                if (res.data.data.transportId) {
                    const tRes = await api.get(`/api/transport/${res.data.data.transportId}`);
                    if (tRes.data.success) setTransport(tRes.data.data);
                }
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const steps = [
        { key: 'PENDING', label: 'Order Placed', icon: Package, desc: 'Your order has been placed' },
        { key: 'PAID', label: 'Payment Confirmed', icon: CheckCircle, desc: 'Payment received successfully' },
        { key: 'CONFIRMED', label: 'Confirmed by Farmer', icon: CheckCircle, desc: 'Farmer accepted your order' },
        { key: 'SHIPPED', label: 'Shipped / In Transit', icon: Truck, desc: 'Your order is on its way' },
        { key: 'DELIVERED', label: 'Delivered', icon: MapPin, desc: 'Order delivered to your address' },
    ];

    const statusOrder = ['PENDING', 'PAID', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

    const getCurrentStepIndex = () => {
        if (!order) return 0;
        if (order.status === 'CANCELLED') return -1;
        return statusOrder.indexOf(order.status);
    };

    const currentStep = getCurrentStepIndex();

    if (loading) {
        return (
            <>
                
                <div style={{ textAlign: 'center', padding: 100, color: 'var(--text-muted)' }}>Loading order details...</div>
            </>
        );
    }

    if (!order) {
        return (
            <>
                
                <div style={{ textAlign: 'center', padding: 100, color: 'var(--text-muted)' }}>Order not found.</div>
            </>
        );
    }

    return (
        <>
            
            <div className="container" style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px 40px' }}>
                <button onClick={() => navigate('/orders')} style={{
                    display: 'flex', alignItems: 'center', gap: 6, border: 'none',
                    background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)',
                    fontSize: 14, marginBottom: 20
                }}>
                    <ArrowLeft size={18} /> Back to Orders
                </button>

                <div style={{
                    background: 'white', borderRadius: 16, padding: 28,
                    border: '1px solid var(--border)', marginBottom: 24
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <div>
                            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
                                Order #{order.id}
                            </h2>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </p>
                        </div>
                        <div style={{
                            padding: '6px 16px', borderRadius: 20, fontWeight: 600, fontSize: 13,
                            background: order.status === 'DELIVERED' ? '#dcfce7' :
                                order.status === 'CANCELLED' ? '#fee2e2' : '#fef3c7',
                            color: order.status === 'DELIVERED' ? '#15803d' :
                                order.status === 'CANCELLED' ? '#dc2626' : '#92400e'
                        }}>
                            {order.status}
                        </div>
                    </div>

                    {/* Tracking Timeline */}
                    {order.status === 'CANCELLED' ? (
                        <div style={{
                            padding: 20, background: '#fef2f2', borderRadius: 12,
                            display: 'flex', alignItems: 'center', gap: 12
                        }}>
                            <AlertCircle size={24} color="#dc2626" />
                            <div>
                                <div style={{ fontWeight: 600, color: '#dc2626' }}>Order Cancelled</div>
                                <div style={{ fontSize: 13, color: '#991b1b' }}>This order has been cancelled.</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', paddingLeft: 32 }}>
                            {/* Vertical line */}
                            <div style={{
                                position: 'absolute', left: 15, top: 0, bottom: 0,
                                width: 2, background: 'var(--border)'
                            }} />
                            {/* Progress line */}
                            <div style={{
                                position: 'absolute', left: 15, top: 0,
                                width: 2,
                                height: `${(currentStep / (steps.length - 1)) * 100}%`,
                                background: 'var(--primary)',
                                transition: 'height 0.5s ease'
                            }} />

                            {steps.map((step, idx) => {
                                const isCompleted = idx <= currentStep;
                                const isCurrent = idx === currentStep;
                                const Icon = step.icon;

                                return (
                                    <div key={step.key} style={{
                                        display: 'flex', alignItems: 'flex-start',
                                        marginBottom: idx < steps.length - 1 ? 32 : 0,
                                        position: 'relative'
                                    }}>
                                        <div style={{
                                            position: 'absolute', left: -32 + 4,
                                            width: 24, height: 24, borderRadius: '50%',
                                            background: isCompleted ? 'var(--primary)' : 'white',
                                            border: `2px solid ${isCompleted ? 'var(--primary)' : 'var(--border)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.3s',
                                            boxShadow: isCurrent ? '0 0 0 4px rgba(34,197,94,0.2)' : 'none',
                                            zIndex: 1
                                        }}>
                                            <Icon size={12} color={isCompleted ? 'white' : '#d1d5db'} />
                                        </div>
                                        <div style={{ marginLeft: 12 }}>
                                            <div style={{
                                                fontWeight: 600, fontSize: 15,
                                                color: isCompleted ? 'var(--text-main)' : 'var(--text-muted)'
                                            }}>
                                                {step.label}
                                            </div>
                                            <div style={{
                                                fontSize: 13, color: 'var(--text-muted)', marginTop: 2
                                            }}>
                                                {step.desc}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Transport Details */}
                {transport && (
                    <div style={{
                        background: 'white', borderRadius: 16, padding: 24,
                        border: '1px solid var(--border)', marginBottom: 24
                    }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Truck size={20} /> Transport Details
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[
                                { label: 'Status', value: transport.status?.replace(/_/g, ' ') },
                                { label: 'Vehicle', value: transport.vehicleType?.replace(/_/g, ' ') },
                                { label: 'Driver', value: transport.driverName || 'Not assigned' },
                                { label: 'Driver Phone', value: transport.driverPhone || 'N/A' },
                                { label: 'Vehicle Number', value: transport.vehicleNumber || 'N/A' },
                                { label: 'Est. Delivery', value: transport.estimatedDeliveryDate || 'N/A' },
                            ].map((item, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Order Items */}
                <div style={{
                    background: 'white', borderRadius: 16, padding: 24,
                    border: '1px solid var(--border)', marginBottom: 24
                }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Order Items</h3>
                    {order.items?.map(item => (
                        <div key={item.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '12px 0', borderBottom: '1px solid var(--border)'
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: 14 }}>🌾 {item.cropName}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                    by {item.farmerName} • {item.quantity} kg
                                </div>
                            </div>
                            <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                                ₹{(item.priceAtPurchase * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        paddingTop: 16, fontWeight: 700, fontSize: 16
                    }}>
                        <span>Total</span>
                        <span style={{ color: 'var(--primary)' }}>₹{order.totalAmount?.toFixed(2)}</span>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {order.items?.[0] && (
                        <button onClick={() => navigate(`/messages?userId=${order.items[0].farmerId}`)} style={{
                            padding: '10px 20px', background: 'white', border: '1px solid var(--border)',
                            borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6
                        }}>
                            <MessageCircle size={16} /> Message Farmer
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

export default OrderTracking;
