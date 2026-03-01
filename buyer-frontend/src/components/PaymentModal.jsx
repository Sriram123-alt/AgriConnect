import React, { useState, useEffect } from 'react';
import { X, CreditCard, Wallet, Building2, CheckCircle, ShieldCheck, Lock, AlertCircle, Package } from 'lucide-react';

const PaymentModal = ({ amount, onPaymentSuccess, onClose }) => {
    const [method, setMethod] = useState('UPI'); // UPI, CARD, NET_BANKING, COD
    const [step, setStep] = useState('SELECT'); // SELECT, PROCESSING, SUCCESS
    const [details, setDetails] = useState({ upiId: '', cardNumber: '', cardName: '', expiry: '', cvv: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (method === 'UPI' && !details.upiId.includes('@')) {
            setError('Please enter a valid UPI ID');
            return;
        }
        if (method === 'CARD' && details.cardNumber.length < 16) {
            setError('Please enter a valid 16-digit card number');
            return;
        }

        setStep('PROCESSING');

        // Simulate gateway latency
        setTimeout(() => {
            setStep('SUCCESS');
            setTimeout(() => {
                onPaymentSuccess({
                    method: method,
                    transactionId: 'PAY_' + Math.random().toString(36).substr(2, 9).toUpperCase()
                });
            }, 1500);
        }, 2000);
    };

    const handleCOD = () => {
        setStep('PROCESSING');
        setTimeout(() => {
            setStep('SUCCESS');
            setTimeout(() => {
                onPaymentSuccess({
                    method: 'COD',
                    transactionId: 'COD_' + Math.random().toString(36).substr(2, 9).toUpperCase()
                });
            }, 1000);
        }, 1000);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' }}>
            <div className="card animate-scale-in" style={{ width: '480px', padding: 0, overflow: 'hidden', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                {step === 'SELECT' && (
                    <>
                        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>Secure Checkout</h2>
                                <p style={{ fontSize: '13px', color: '#64748b' }}>Complete your purchase safely</p>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
                        </div>

                        <div style={{ padding: '24px' }}>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>Total Payable Amount</span>
                                <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>₹{amount.toFixed(2)}</span>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Select Payment Method</p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                                    {[
                                        { id: 'UPI', icon: Wallet, label: 'UPI' },
                                        { id: 'CARD', icon: CreditCard, label: 'Card' },
                                        { id: 'NET_BANKING', icon: Building2, label: 'Bank' },
                                        { id: 'COD', icon: Package, label: 'COD' }
                                    ].map(m => (
                                        <div
                                            key={m.id}
                                            onClick={() => setMethod(m.id)}
                                            style={{
                                                padding: '16px', borderRadius: '12px', border: '2px solid',
                                                borderColor: method === m.id ? 'var(--primary)' : '#e2e8f0',
                                                background: method === m.id ? 'var(--primary-light)' : 'white',
                                                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                                            }}
                                        >
                                            <m.icon size={24} color={method === m.id ? 'var(--primary)' : '#64748b'} style={{ marginBottom: '8px' }} />
                                            <p style={{ fontSize: '13px', fontWeight: '700', color: method === m.id ? 'var(--primary-dark)' : '#475569' }}>{m.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {method === 'UPI' && (
                                    <div className="input-group animate-fade-in">
                                        <label className="input-label">Enter UPI ID</label>
                                        <input
                                            className="input-field"
                                            placeholder="username@bank"
                                            value={details.upiId}
                                            onChange={e => setDetails({ ...details, upiId: e.target.value })}
                                            required
                                        />
                                    </div>
                                )}

                                {method === 'CARD' && (
                                    <div className="animate-fade-in">
                                        <div className="input-group">
                                            <label className="input-label">Card Number</label>
                                            <input
                                                className="input-field"
                                                placeholder="0000 0000 0000 0000"
                                                maxLength={16}
                                                value={details.cardNumber}
                                                onChange={e => setDetails({ ...details, cardNumber: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div className="input-group">
                                                <label className="input-label">Expiry</label>
                                                <input className="input-field" placeholder="MM/YY" maxLength={5} required />
                                            </div>
                                            <div className="input-group">
                                                <label className="input-label">CVV</label>
                                                <input className="input-field" placeholder="123" maxLength={3} type="password" required />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {method === 'NET_BANKING' && (
                                    <div className="input-group animate-fade-in">
                                        <label className="input-label">Select Bank</label>
                                        <select className="input-field">
                                            <option>State Bank of India</option>
                                            <option>HDFC Bank</option>
                                            <option>ICICI Bank</option>
                                            <option>Axis Bank</option>
                                        </select>
                                    </div>
                                )}

                                {method === 'COD' && (
                                    <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a', marginBottom: '20px' }}>
                                        <p style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
                                            <strong>Pay on Delivery:</strong> You can pay the farmer directly in cash or UPI when the harvest is delivered.
                                        </p>
                                    </div>
                                )}

                                {error && (
                                    <p style={{ color: '#dc2626', fontSize: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <AlertCircle size={14} /> {error}
                                    </p>
                                )}

                                {method !== 'COD' ? (
                                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px' }}>
                                        Pay ₹{amount.toFixed(2)} Now
                                    </button>
                                ) : (
                                    <button type="button" onClick={handleCOD} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '16px', background: '#1e293b' }}>
                                        Confirm Pay on Delivery
                                    </button>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px', color: '#94a3b8' }}>
                                    <Lock size={12} />
                                    <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>Secure 256-bit SSL Encryption</span>
                                </div>
                            </form>
                        </div>
                    </>
                )}

                {step === 'PROCESSING' && (
                    <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                        <div className="animate-spin" style={{ width: '50px', height: '50px', border: '4px solid #f1f5f9', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 24px' }}></div>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Verifying Transaction</h2>
                        <p style={{ color: '#64748b' }}>Please do not refresh or close this window.</p>
                    </div>
                )}

                {step === 'SUCCESS' && (
                    <div style={{ padding: '60px 40px', textAlign: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', animation: 'bounce 0.5s ease' }}>
                            <CheckCircle size={40} color="#16a34a" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>Payment Successful!</h2>
                        <p style={{ color: '#64748b' }}>Your transaction has been verified successfully.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
