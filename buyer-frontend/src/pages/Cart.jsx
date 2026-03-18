import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, MapPin, Home, Building2, Navigation } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';
import api from '../api/api';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const emptyAddress = {
    flatNo: '',
    street: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    country: 'India',
};

const fieldStyle = {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid var(--border, #e2e8f0)',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    background: '#fff',
    color: '#1a202c',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
};

const labelStyle = {
    display: 'block',
    fontWeight: '600',
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '5px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
};

const rowStyle = {
    display: 'grid',
    gap: '10px',
    marginBottom: '10px',
};

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [addr, setAddr] = useState(emptyAddress);
    const [errors, setErrors] = useState({});
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handleAddrChange = (field, value) => {
        setAddr(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!addr.flatNo.trim()) errs.flatNo = 'Required';
        if (!addr.street.trim()) errs.street = 'Required';
        if (!addr.city.trim()) errs.city = 'Required';
        if (!addr.state) errs.state = 'Required';
        if (!/^\d{6}$/.test(addr.pincode.trim())) errs.pincode = 'Enter valid 6-digit pincode';
        return errs;
    };

    const buildAddressString = () => {
        const parts = [
            addr.flatNo.trim(),
            addr.street.trim(),
            addr.landmark.trim() ? `Near ${addr.landmark.trim()}` : '',
            addr.city.trim(),
            addr.district.trim(),
            addr.state,
            `Pincode: ${addr.pincode.trim()}`,
            addr.country,
        ].filter(Boolean);
        return parts.join(', ');
    };

    const handleCheckout = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        setShowPaymentModal(true);
    };

    const handlePaymentSuccess = async (paymentInfo) => {
        setShowPaymentModal(false);
        setLoading(true);
        try {
            const orderData = {
                shippingAddress: buildAddressString(),
                paymentMethod: paymentInfo.method,
                paymentTransactionId: paymentInfo.transactionId,
                items: cartItems.map(item => ({
                    cropId: item.id,
                    quantity: item.quantity,
                    negotiationId: item.negotiationId
                }))
            };

            const response = await api.post('/api/orders', orderData);
            if (response.data.success) {
                clearCart();
                const wantsTransport = window.confirm(
                    '✅ Order placed successfully!\n\n' +
                    '🚛 Would you like to book transport now?\n\n' +
                    'A lorry/truck will pick up the crops from the farmer\'s location and deliver to your address.'
                );
                if (wantsTransport) {
                    navigate('/orders', { state: { bookTransportForOrder: response.data.data } });
                } else {
                    navigate('/orders');
                }
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="animate-fade-in" style={{ textAlign: 'center', padding: '100px 0' }}>
                <div style={{ background: 'var(--primary-light)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <ShoppingCart size={40} color="var(--primary)" />
                </div>
                <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Your cart is empty</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Looks like you haven't added any harvest to your cart yet.</p>
                <button className="btn btn-primary" onClick={() => navigate('/marketplace')}>
                    <ArrowLeft size={18} /> Back to Marketplace
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '32px' }}>Shopping Cart</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '40px', alignItems: 'start' }}>
                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {cartItems.map(item => (
                        <div key={item.id} className="card" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: '#f1f5f9', flexShrink: 0 }}>
                                <img
                                    src={item.imageUrl || `https://images.unsplash.com/photo-1595231712325-9fdec20aa102?q=80&w=200&h=200&auto=format&fit=crop`}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>{item.name}</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Farmer: {item.farmerName}</p>
                                <p style={{ color: 'var(--primary)', fontWeight: '700', marginTop: '4px' }}>₹{item.pricePerKg}/kg</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ border: 'none', background: 'white', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>-</button>
                                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: '600' }}>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ border: 'none', background: 'white', width: '28px', height: '28px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>+</button>
                            </div>
                            <div style={{ minWidth: '80px', textAlign: 'right' }}>
                                <p style={{ fontWeight: '700' }}>₹{(item.pricePerKg * item.quantity).toFixed(2)}</p>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--error)', padding: '8px' }}>
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Summary + Address Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>

                    {/* Order Summary */}
                    <div className="card" style={{ padding: '24px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Order Summary</h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)' }}>
                            <span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-muted)' }}>
                            <span>Shipping</span><span style={{ color: 'var(--success)', fontWeight: '600' }}>FREE</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)', fontSize: '18px', fontWeight: '700' }}>
                            <span>Total</span>
                            <span style={{ color: 'var(--primary)' }}>₹{cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Delivery Address Form */}
                    <div className="card" style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                            <div style={{ background: 'var(--primary-light, #dcfce7)', borderRadius: '8px', padding: '6px' }}>
                                <MapPin size={18} color="var(--primary)" />
                            </div>
                            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Delivery Address</h2>
                        </div>

                        {/* Flat / House No */}
                        <div style={{ marginBottom: '10px' }}>
                            <label style={labelStyle}>
                                <Home size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                Flat / House / Door No. *
                            </label>
                            <input
                                style={{ ...fieldStyle, borderColor: errors.flatNo ? '#ef4444' : undefined }}
                                placeholder="e.g. Flat 4B, Plot 12, Door No. 8"
                                value={addr.flatNo}
                                onChange={e => handleAddrChange('flatNo', e.target.value)}
                            />
                            {errors.flatNo && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.flatNo}</span>}
                        </div>

                        {/* Street / Area */}
                        <div style={{ marginBottom: '10px' }}>
                            <label style={labelStyle}>
                                <Building2 size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                Street / Area / Colony *
                            </label>
                            <input
                                style={{ ...fieldStyle, borderColor: errors.street ? '#ef4444' : undefined }}
                                placeholder="e.g. MG Road, Banjara Hills"
                                value={addr.street}
                                onChange={e => handleAddrChange('street', e.target.value)}
                            />
                            {errors.street && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.street}</span>}
                        </div>

                        {/* Landmark */}
                        <div style={{ marginBottom: '10px' }}>
                            <label style={labelStyle}>Landmark (Optional)</label>
                            <input
                                style={fieldStyle}
                                placeholder="e.g. Near HP Petrol Pump"
                                value={addr.landmark}
                                onChange={e => handleAddrChange('landmark', e.target.value)}
                            />
                        </div>

                        {/* City + District */}
                        <div style={{ ...rowStyle, gridTemplateColumns: '1fr 1fr' }}>
                            <div>
                                <label style={labelStyle}>City / Town *</label>
                                <input
                                    style={{ ...fieldStyle, borderColor: errors.city ? '#ef4444' : undefined }}
                                    placeholder="e.g. Hyderabad"
                                    value={addr.city}
                                    onChange={e => handleAddrChange('city', e.target.value)}
                                />
                                {errors.city && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.city}</span>}
                            </div>
                            <div>
                                <label style={labelStyle}>District</label>
                                <input
                                    style={fieldStyle}
                                    placeholder="e.g. Rangareddy"
                                    value={addr.district}
                                    onChange={e => handleAddrChange('district', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* State + Pincode */}
                        <div style={{ ...rowStyle, gridTemplateColumns: '1fr 1fr' }}>
                            <div>
                                <label style={labelStyle}>State *</label>
                                <select
                                    style={{ ...fieldStyle, cursor: 'pointer', borderColor: errors.state ? '#ef4444' : undefined }}
                                    value={addr.state}
                                    onChange={e => handleAddrChange('state', e.target.value)}
                                >
                                    <option value="">Select State</option>
                                    {INDIAN_STATES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                {errors.state && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.state}</span>}
                            </div>
                            <div>
                                <label style={labelStyle}>
                                    <Navigation size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                    Pincode *
                                </label>
                                <input
                                    style={{ ...fieldStyle, borderColor: errors.pincode ? '#ef4444' : undefined }}
                                    placeholder="6-digit pincode"
                                    maxLength={6}
                                    value={addr.pincode}
                                    onChange={e => handleAddrChange('pincode', e.target.value.replace(/\D/g, ''))}
                                />
                                {errors.pincode && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.pincode}</span>}
                            </div>
                        </div>

                        {/* Country (read-only) */}
                        <div style={{ marginTop: '2px' }}>
                            <label style={labelStyle}>Country</label>
                            <input
                                style={{ ...fieldStyle, background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                                value="India"
                                readOnly
                            />
                        </div>

                        {/* Address Preview */}
                        {(addr.flatNo || addr.city || addr.pincode) && (
                            <div style={{ marginTop: '14px', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '13px', color: '#166534' }}>
                                <strong style={{ display: 'block', marginBottom: '4px' }}>📍 Preview:</strong>
                                {buildAddressString()}
                            </div>
                        )}

                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '14px', marginTop: '20px', fontSize: '15px' }}
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            <CreditCard size={20} /> {loading ? 'Processing...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>

            {showPaymentModal && (
                <PaymentModal
                    amount={cartTotal}
                    onPaymentSuccess={handlePaymentSuccess}
                    onClose={() => setShowPaymentModal(false)}
                />
            )}
        </div>
    );
};

export default Cart;
