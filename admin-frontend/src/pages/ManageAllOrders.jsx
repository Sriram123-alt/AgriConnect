import React, { useState, useEffect } from 'react';
import { Package, Search, Download, ExternalLink, Clock, CheckCircle, Truck, XCircle, IndianRupee } from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';
import api from '../api/api';

const ManageAllOrders = () => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ totalRevenue: 0, totalCommission: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        fetchStats();
        const interval = setInterval(() => {
            fetchOrders();
            fetchStats();
        }, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/api/orders/admin/all');
            if (response.data.success) {
                setOrders(response.data.data.content || []);
            }
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    const updatePayment = async (id, paymentStatus, farmerPayment, transportPayment) => {
        try {
            const params = new URLSearchParams();
            if (paymentStatus) params.append('paymentStatus', paymentStatus);
            if (farmerPayment) params.append('farmerPayment', farmerPayment);
            if (transportPayment) params.append('transportPayment', transportPayment);
            const res = await api.patch(`/api/orders/${id}/payment-status?${params.toString()}`);
            if (res.data.success) {
                setOrders(orders.map(o => o.id === id ? {
                    ...o,
                    paymentStatus: res.data.data.paymentStatus,
                    farmerPaymentStatus: res.data.data.farmerPaymentStatus,
                    transportPaymentStatus: res.data.data.transportPaymentStatus
                } : o));
            }
        } catch (err) {
            alert('Failed to update payment status');
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/api/admin/metrics');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch stats', err);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING': return { background: '#fef3c7', color: '#92400e' }; // Amber
            case 'CONFIRMED': return { background: '#eff6ff', color: '#1d4ed8' }; // Blue
            case 'SHIPPED': return { background: '#f5f3ff', color: '#6d28d9' }; // Purple
            case 'DELIVERED': return { background: '#f0fdf4', color: '#15803d' }; // Green
            case 'CANCELLED': return { background: '#fff1f2', color: '#e11d48' }; // Red
            default: return { background: '#f8fafc', color: '#64748b' };
        }
    };

    const [selectedOrder, setSelectedOrder] = useState(null);

    return (
        <div style={{ display: 'flex', background: '#f1f5f9', minHeight: '100vh' }}>
            <AdminNavbar />
            <main style={{ marginLeft: '280px', flex: 1, padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>Global Orders</h1>
                        <p style={{ color: '#64748b' }}>Monitor transactions and platform commission.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn" style={{ background: 'white', border: '1px solid #e2e8f0', color: '#475569' }}>
                            <Download size={18} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="card" style={{ border: 'none', background: 'white', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ background: '#dcfce7', padding: '6px', borderRadius: '8px' }}>
                                <IndianRupee size={16} color="#15803d" />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Revenue</p>
                                <p style={{ fontWeight: '800', fontSize: '18px' }}>₹{(stats.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <div style={{ background: '#eff6ff', padding: '6px', borderRadius: '8px' }}>
                                <Package size={16} color="#1d4ed8" />
                            </div>
                            <div>
                                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Commission (5%)</p>
                                <p style={{ fontWeight: '800', fontSize: '18px', color: '#1d4ed8' }}>₹{(stats.totalCommission || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Order ID</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Parties</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No orders found</td></tr>
                            ) : orders.map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <p style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>#{order.id}</p>
                                        <p style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <div style={{ fontSize: '13px' }}><span style={{ color: '#94a3b8', fontWeight: '600' }}>B:</span> {order.buyerName}</div>
                                            <div style={{ fontSize: '13px' }}><span style={{ color: '#94a3b8', fontWeight: '600' }}>F:</span> {order.items[0]?.farmerName || 'Farmer'}</div>
                                            {order.hasTransport && (
                                                <div style={{ fontSize: '11px', fontWeight: '700', color: '#f97316', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Truck size={10} /> {order.transportStatus}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <p style={{ fontWeight: '800', fontSize: '15px' }}>₹{(order.totalAmount || 0).toFixed(2)}</p>
                                        <p style={{ fontSize: '11px', color: '#15803d', fontWeight: '700' }}>Fee: ₹{((order.totalAmount || 0) * 0.05).toFixed(2)}</p>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px', width: 'fit-content', ...getStatusStyle(order.status) }}>
                                                Order: {order.status}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px', background: order.paymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7', color: order.paymentStatus === 'PAID' ? '#15803d' : '#92400e' }}>
                                                    Buyer: {order.paymentStatus}
                                                </span>
                                                {order.paymentStatus !== 'PAID' && (
                                                    <button onClick={() => updatePayment(order.id, 'PAID', null, null)} style={{ fontSize: '10px', background: '#e2e8f0', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Mark Paid</button>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px', background: order.farmerPaymentStatus === 'PAID' ? '#dcfce7' : '#f1f5f9', color: order.farmerPaymentStatus === 'PAID' ? '#15803d' : '#475569' }}>
                                                    Farmer: {order.farmerPaymentStatus}
                                                </span>
                                                {order.farmerPaymentStatus !== 'PAID' && (
                                                    <button onClick={() => updatePayment(order.id, null, 'PAID', null)} style={{ fontSize: '10px', background: '#e2e8f0', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Mark Paid</button>
                                                )}
                                            </div>
                                            {order.hasTransport && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px', background: order.transportPaymentStatus === 'PAID' ? '#dcfce7' : '#f1f5f9', color: order.transportPaymentStatus === 'PAID' ? '#15803d' : '#475569' }}>
                                                        Transport: {order.transportPaymentStatus}
                                                    </span>
                                                    {order.transportPaymentStatus !== 'PAID' && (
                                                        <button onClick={() => updatePayment(order.id, null, null, 'PAID')} style={{ fontSize: '10px', background: '#e2e8f0', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Mark Paid</button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="btn"
                                            style={{ padding: '6px', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                                        >
                                            <ExternalLink size={16} color="#64748b" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Order Detail #{selectedOrder.id}</h2>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                                <div>
                                    <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Buyer Name</p>
                                    <p style={{ fontWeight: '700' }}>{selectedOrder.buyerName}</p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '4px' }}>Payment Method</p>
                                    <p style={{ fontWeight: '700' }}>{selectedOrder.paymentMethod}</p>
                                </div>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <p style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px' }}>Order Items</p>
                                {selectedOrder.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', marginBottom: '8px' }}>
                                        <div>
                                            <p style={{ fontWeight: '700', fontSize: '14px' }}>{item.cropName}</p>
                                            <p style={{ fontSize: '12px', color: '#64748b' }}>by {item.farmerName}</p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: '700', fontSize: '14px' }}>₹{(item.quantity * item.priceAtPurchase).toFixed(2)}</p>
                                            <p style={{ fontSize: '12px', color: '#64748b' }}>{item.quantity}kg @ ₹{item.priceAtPurchase}/kg</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '14px', color: '#64748b' }}>Subtotal</span>
                                    <span style={{ fontSize: '14px', fontWeight: '700' }}>₹{(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '8px' }}>
                                    <span style={{ fontSize: '16px', fontWeight: '800' }}>Total</span>
                                    <span style={{ fontSize: '16px', fontWeight: '800', color: '#10b981' }}>₹{(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageAllOrders;
