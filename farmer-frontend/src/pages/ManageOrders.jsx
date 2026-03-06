import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, XCircle, RefreshCcw, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../api/api';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Polling every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/api/orders/farmer/me');
            if (response.data.success) {
                setOrders(response.data.data.content || []);
            }
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            const response = await api.patch(`/api/orders/${id}/status`, null, { params: { status } });
            if (response.data.success) {
                setOrders(orders.map(order =>
                    order.id === id ? { ...order, status } : order
                ));
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return { background: '#fef3c7', color: '#92400e' };
            case 'PAID': return { background: '#dcfce7', color: '#16a34a' };
            case 'CONFIRMED': return { background: '#dbeafe', color: '#1e40af' };
            case 'SHIPPED': return { background: '#f3e8ff', color: '#6b21a8' };
            case 'DELIVERED': return { background: '#d1fae5', color: '#065f46' };
            case 'CANCELLED': return { background: '#fee2e2', color: '#991b1b' };
            default: return { background: '#f1f5f9', color: '#475569' };
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <Navbar />
            <main style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '700' }}>Order Management</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Track and fulfill buyer orders.</p>
                    </div>
                    <button onClick={fetchOrders} className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
                        <RefreshCcw size={16} /> Refresh
                    </button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                        <Package size={48} color="var(--text-muted)" style={{ margin: '0 auto 20px' }} />
                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>No orders found</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Incoming orders will appear here.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {orders.map(order => (
                            <div key={order.id} className="card" style={{ overflow: 'hidden' }}>
                                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                                    <div style={{ display: 'flex', gap: '40px' }}>
                                        <div>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Order ID</p>
                                            <p style={{ fontWeight: '700' }}>#{order.id}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Buyer</p>
                                            <p style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> {order.buyerName}</p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Date</p>
                                            <p style={{ fontWeight: '600' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '100px', ...getStatusStyle(order.status) }}>
                                            <span style={{ fontSize: '13px', fontWeight: '700' }}>{order.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px' }}>
                                        <div>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px' }}>Order Items</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {order.items.map(item => (
                                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                                                        <span style={{ fontWeight: '600' }}>{item.cropName}</span>
                                                        <span style={{ color: 'var(--text-muted)' }}>{item.quantity} kg</span>
                                                        <span style={{ fontWeight: '700' }}>₹{(item.quantity * item.priceAtPurchase).toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px' }}>Actions</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {(order.status === 'PENDING' || order.status === 'PAID') && (
                                                    <button onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')} className="btn btn-primary">Confirm Order</button>
                                                )}
                                                {order.status === 'CONFIRMED' && !order.hasTransport && (
                                                    <button onClick={() => handleUpdateStatus(order.id, 'SHIPPED')} className="btn btn-secondary">Mark Shipped</button>
                                                )}
                                                {order.status === 'SHIPPED' && !order.hasTransport && (
                                                    <button onClick={() => handleUpdateStatus(order.id, 'DELIVERED')} className="btn btn-primary" style={{ background: 'var(--success)' }}>Mark Delivered</button>
                                                )}
                                                {order.hasTransport && (
                                                    <div style={{ padding: '12px', background: 'var(--primary-light)', borderRadius: '10px', border: '1px solid var(--primary)', marginBottom: '10px' }}>
                                                        <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Truck size={14} /> Transport Status
                                                        </p>
                                                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                                                            {order.transportStatus?.replace(/_/g, ' ') || 'BOOKED'}
                                                        </p>
                                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                            Handled by Transport Service Hub
                                                        </p>
                                                    </div>
                                                )}
                                                <div style={{ marginTop: '10px' }}>
                                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Shipping Address</p>
                                                    <p style={{ fontSize: '14px', background: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>{order.shippingAddress}</p>
                                                </div>
                                            </div>
                                        </div>
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

export default ManageOrders;
