import React, { useState, useEffect } from 'react';
import { RefreshCcw, HandCoins } from 'lucide-react';
import api from '../api/api';

const Payments = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
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

    const totalEarned = orders
        .filter(o => o.farmerPaymentStatus === 'PAID')
        .reduce((sum, o) => sum + (o.farmerEarnings || 0), 0);

    const pendingAmount = orders
        .filter(o => o.farmerPaymentStatus !== 'PAID')
        .reduce((sum, o) => sum + (o.farmerEarnings || 0), 0);

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>Payments &amp; Payouts</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Track the money you receive for fulfilled orders.</p>
                </div>
                <button onClick={fetchOrders} className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>
                    <RefreshCcw size={16} /> Refresh
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto' }}></div>
                </div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                        <div className="card" style={{ padding: '24px', borderLeft: '4px solid #10b981' }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Total Payouts Received (Net)</p>
                            <p style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>₹{totalEarned.toFixed(2)}</p>
                        </div>
                        <div className="card" style={{ padding: '24px', borderLeft: '4px solid #f59e0b' }}>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Pending Payouts (Net)</p>
                            <p style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b' }}>₹{pendingAmount.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                            <HandCoins size={20} color="var(--primary)" />
                            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Payout History</h2>
                        </div>

                        {orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <p style={{ color: 'var(--text-muted)' }}>No completed orders with payment tracked yet.</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                                        <tr>
                                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Order Details</th>
                                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Amount</th>
                                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fee (5%)</th>
                                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net Payout</th>
                                            <th style={{ padding: '16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(order => {
                                            const earnings = order.farmerEarnings || 0;
                                            const grossAmount = earnings / 0.95;
                                            const fee = grossAmount * 0.05;
                                            return (
                                                <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                    <td style={{ padding: '16px' }}>
                                                        <p style={{ fontWeight: '700', marginBottom: '4px' }}>Order #{order.id}</p>
                                                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                                                    </td>
                                                    <td style={{ padding: '16px' }}>₹{grossAmount.toFixed(2)}</td>
                                                    <td style={{ padding: '16px', color: '#dc2626' }}>-₹{fee.toFixed(2)}</td>
                                                    <td style={{ padding: '16px', fontWeight: '800', color: 'var(--primary)' }}>₹{earnings.toFixed(2)}</td>
                                                    <td style={{ padding: '16px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: '700', padding: '6px 12px', borderRadius: '100px', background: order.farmerPaymentStatus === 'PAID' ? '#dcfce7' : '#fef3c7', color: order.farmerPaymentStatus === 'PAID' ? '#15803d' : '#92400e' }}>
                                                            {order.farmerPaymentStatus || 'PENDING'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
