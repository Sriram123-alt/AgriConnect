import React, { useState, useEffect } from 'react';
import { RefreshCcw, HandCoins, Package, Truck, Search } from 'lucide-react';
import api from '../api/api';

const Payments = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/api/orders/buyer/me');
            if (res.data.success) {
                setOrders(res.data.data.content || []);
            }
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    const totalSpent = orders
        .filter(o => o.paymentStatus === 'PAID')
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingAmount = orders
        .filter(o => o.paymentStatus !== 'PAID')
        .reduce((sum, o) => sum + o.totalAmount, 0);

    const filtered = orders.filter(o =>
        String(o.id).includes(search) ||
        o.paymentStatus.toLowerCase().includes(search.toLowerCase()) ||
        o.items?.some(i => i.cropName?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>Payment History</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track all your payments for orders and shipping.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search payments..."
                            className="input-field"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ paddingLeft: 36, width: 250, margin: 0 }}
                        />
                    </div>
                    <button onClick={fetchOrders} className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
                        <RefreshCcw size={16} /> Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                        <div className="card" style={{ padding: '24px', borderLeft: '4px solid #10b981' }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Total Amount Paid</p>
                            <p style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>₹{totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="card" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Pending Payments</p>
                            <p style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b' }}>₹{pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                            <HandCoins size={20} color="var(--primary)" />
                            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Payment Invoices</h2>
                        </div>

                        {filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <p style={{ color: 'var(--text-muted)' }}>No payment records found.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                        <tr>
                                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reference</th>
                                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Details</th>
                                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Method</th>
                                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(order => (
                                            <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '16px' }}>
                                                    <p style={{ fontWeight: '700', marginBottom: '4px' }}>ORDER #{order.id}</p>
                                                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#475569', marginBottom: '4px' }}>
                                                        <Package size={14} /> {order.items.length} items
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                                                        {order.paymentMethod || '—'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px', fontWeight: '700' }}>
                                                    ₹{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td style={{ padding: '16px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: '700', padding: '6px 12px', borderRadius: '100px', background: order.paymentStatus === 'PAID' ? '#dcfce7' : order.paymentStatus === 'FAILED' ? '#fee2e2' : '#fef3c7', color: order.paymentStatus === 'PAID' ? '#15803d' : order.paymentStatus === 'FAILED' ? '#991b1b' : '#92400e' }}>
                                                        {order.paymentStatus || 'PENDING'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Payments;
