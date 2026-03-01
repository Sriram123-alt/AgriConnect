import React, { useState, useEffect } from 'react';
import {
    X, Truck, MapPin, Package, ChevronRight, CheckCircle,
    AlertCircle, Loader, User, Phone, Car, Calendar, DollarSign
} from 'lucide-react';
import api from '../api/api';

// ── Vehicle icons by type ─────────────────────────────────────────────
const VEHICLE_ICONS = {
    MINI_TRUCK: '🚐',
    MEDIUM_LORRY: '🚛',
    LARGE_LORRY: '🚚',
    HEAVY_TRUCK: '🏗️',
};

const STATUS_CONFIG = {
    BOOKED: { color: '#f59e0b', bg: '#fef3c7', label: 'Booked' },
    DRIVER_ASSIGNED: { color: '#3b82f6', bg: '#dbeafe', label: 'Driver Assigned' },
    PICKED_UP: { color: '#8b5cf6', bg: '#f3e8ff', label: 'Picked Up' },
    IN_TRANSIT: { color: '#06b6d4', bg: '#cffafe', label: 'In Transit' },
    DELIVERED: { color: '#10b981', bg: '#d1fae5', label: 'Delivered' },
    CANCELLED: { color: '#ef4444', bg: '#fee2e2', label: 'Cancelled' },
};

// ── Step indicator ───────────────────────────────────────────────────
const Step = ({ num, label, active, done }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: done ? '#16a34a' : active ? 'var(--primary, #16a34a)' : '#e2e8f0',
            color: done || active ? '#fff' : '#94a3b8',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 14,
            boxShadow: active ? '0 0 0 4px rgba(22,163,74,0.15)' : 'none',
            transition: 'all 0.3s',
        }}>
            {done ? <CheckCircle size={16} /> : num}
        </div>
        <span style={{ fontSize: 11, color: active ? 'var(--primary, #16a34a)' : '#94a3b8', marginTop: 4, fontWeight: active ? 700 : 500 }}>
            {label}
        </span>
    </div>
);

const StepConnector = ({ done }) => (
    <div style={{
        flex: 1, height: 2,
        background: done ? '#16a34a' : '#e2e8f0',
        marginTop: -12, transition: 'background 0.4s',
    }} />
);

// ── Main modal ───────────────────────────────────────────────────────
const TransportBookingModal = ({ order, onClose, onBooked }) => {
    const [step, setStep] = useState(1); // 1 = select vehicle, 2 = review, 3 = confirm
    const [vehicleOptions, setVehicleOptions] = useState([]);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [deliveryAddress, setDeliveryAddress] = useState(order?.shippingAddress || '');
    const [loading, setLoading] = useState(false);
    const [fetchingOptions, setFetchingOptions] = useState(true);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState('');

    const totalWeight = order?.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0;

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await api.get(`/api/transport/vehicle-options?weightKg=${totalWeight}`);
                if (res.data.success) {
                    setVehicleOptions(res.data.data);
                    // Pre-select the recommended one
                    const recommended = res.data.data.find(v => v.recommended === 'YES');
                    if (recommended) setSelectedVehicle(recommended.type);
                }
            } catch (e) {
                setError('Failed to load vehicle options.');
            } finally {
                setFetchingOptions(false);
            }
        };
        fetchOptions();
    }, [totalWeight]);

    const handleBook = async () => {
        if (!selectedVehicle) { setError('Please select a vehicle type.'); return; }
        if (!deliveryAddress.trim()) { setError('Please enter a delivery address.'); return; }
        setError('');
        setLoading(true);
        try {
            const res = await api.post('/api/transport/book', {
                orderId: order.id,
                vehicleType: selectedVehicle,
                deliveryAddress: deliveryAddress,
            });
            if (res.data.success) {
                setBooking(res.data.data);
                setStep(3);
                if (onBooked) onBooked(res.data.data);
            }
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to book transport. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const selectedOption = vehicleOptions.find(v => v.type === selectedVehicle);
    const estimatedCost = selectedOption
        ? (selectedOption.baseCostPerTon * Math.max(totalWeight / 1000, 0.5) + 250).toFixed(2)
        : '—';

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
        }}>
            <div style={{
                background: '#fff', borderRadius: 20,
                width: '100%', maxWidth: 580,
                maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                animation: 'slideUp 0.3s ease',
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    borderRadius: '20px 20px 0 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    color: '#fff',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8 }}>
                            <Truck size={22} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Book Transport</h2>
                            <p style={{ fontSize: 12, opacity: 0.85, margin: 0 }}>Order #{order?.id} · {totalWeight.toFixed(1)} kg total</p>
                        </div>
                    </div>
                    <button onClick={onClose}
                        style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Step Indicator */}
                <div style={{ padding: '18px 24px 0', display: 'flex', alignItems: 'center' }}>
                    <Step num={1} label="Select Vehicle" active={step === 1} done={step > 1} />
                    <StepConnector done={step > 1} />
                    <Step num={2} label="Confirm Route" active={step === 2} done={step > 2} />
                    <StepConnector done={step > 2} />
                    <Step num={3} label="Booked!" active={step === 3} done={false} />
                </div>

                <div style={{ padding: '16px 24px 24px' }}>
                    {error && (
                        <div style={{
                            background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10,
                            padding: '10px 14px', marginBottom: 14,
                            display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626', fontSize: 14
                        }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* ── STEP 1: Select Vehicle ── */}
                    {step === 1 && (
                        <div>
                            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 14 }}>
                                Total cargo: <strong style={{ color: '#1e293b' }}>{totalWeight.toFixed(1)} kg</strong>.
                                Choose the right vehicle for your shipment:
                            </p>

                            {fetchingOptions ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <Loader size={28} style={{ animation: 'spin 1s linear infinite', color: '#16a34a' }} />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {vehicleOptions.map(opt => {
                                        const isSelected = selectedVehicle === opt.type;
                                        const isRecommended = opt.recommended === 'YES';
                                        return (
                                            <div
                                                key={opt.type}
                                                onClick={() => setSelectedVehicle(opt.type)}
                                                style={{
                                                    border: `2px solid ${isSelected ? '#16a34a' : '#e2e8f0'}`,
                                                    borderRadius: 12,
                                                    padding: '14px 16px',
                                                    cursor: 'pointer',
                                                    background: isSelected ? '#f0fdf4' : '#fff',
                                                    transition: 'all 0.2s',
                                                    display: 'flex', alignItems: 'center', gap: 14,
                                                    position: 'relative',
                                                }}
                                            >
                                                {isRecommended && (
                                                    <span style={{
                                                        position: 'absolute', top: -10, right: 12,
                                                        background: '#16a34a', color: '#fff',
                                                        fontSize: 10, fontWeight: 700, padding: '2px 8px',
                                                        borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em'
                                                    }}>✓ Recommended</span>
                                                )}
                                                <span style={{ fontSize: 32 }}>{VEHICLE_ICONS[opt.type] || '🚛'}</span>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: '#1e293b' }}>{opt.label}</p>
                                                    <p style={{ fontSize: 12, color: '#64748b', margin: '2px 0 0' }}>
                                                        Capacity: up to {opt.maxWeightKg >= 999999 ? '15+ Tons' : (opt.maxWeightKg / 1000).toFixed(0) + ' Tons'}
                                                    </p>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontWeight: 700, color: '#16a34a', fontSize: 15, margin: 0 }}>
                                                        ₹{(opt.baseCostPerTon * Math.max(totalWeight / 1000, 0.5) + 250).toFixed(0)}
                                                    </p>
                                                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>est. cost</p>
                                                </div>
                                                {isSelected && (
                                                    <CheckCircle size={20} color="#16a34a" style={{ flexShrink: 0 }} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: 20, padding: '13px' }}
                                disabled={!selectedVehicle || fetchingOptions}
                                onClick={() => setStep(2)}
                            >
                                Continue <ChevronRight size={18} />
                            </button>
                        </div>
                    )}

                    {/* ── STEP 2: Confirm Route ── */}
                    {step === 2 && (
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {/* Pickup Address */}
                                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <MapPin size={14} color="#16a34a" />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Pickup (Farmer Location)
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 14, color: '#1e293b', margin: 0, paddingLeft: 36 }}>
                                        {order?.items?.[0]?.farmerLocation || 'Farmer\'s registered address (auto-detected from crop listing)'}
                                    </p>
                                </div>

                                {/* Route line */}
                                <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                        <div style={{ width: 2, height: 8, background: '#e2e8f0', borderRadius: 2 }} />
                                        <Truck size={20} color="#16a34a" />
                                        <div style={{ width: 2, height: 8, background: '#e2e8f0', borderRadius: 2 }} />
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div style={{ background: '#f8fafc', borderRadius: 12, padding: '14px 16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <MapPin size={14} color="#3b82f6" />
                                        </div>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            Delivery (Your Location) *
                                        </span>
                                    </div>
                                    <textarea
                                        value={deliveryAddress}
                                        onChange={e => setDeliveryAddress(e.target.value)}
                                        rows={3}
                                        placeholder="Enter your full delivery address..."
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            padding: '9px 12px', border: '1.5px solid #e2e8f0',
                                            borderRadius: 8, fontSize: 14, resize: 'vertical',
                                            outline: 'none', fontFamily: 'inherit',
                                        }}
                                    />
                                </div>

                                {/* Summary card */}
                                <div style={{
                                    background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                                    border: '1px solid #bbf7d0', borderRadius: 12,
                                    padding: '14px 16px',
                                }}>
                                    <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#15803d' }}>📋 Booking Summary</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <SummaryRow icon="🚛" label="Vehicle" value={selectedOption?.label} />
                                        <SummaryRow icon="⚖️" label="Total Weight" value={`${totalWeight.toFixed(1)} kg`} />
                                        <SummaryRow icon="📦" label="Items" value={`${order?.items?.length} crop(s)`} />
                                        <SummaryRow icon="💰" label="Est. Cost" value={`₹${estimatedCost}`} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                                <button
                                    onClick={() => setStep(1)}
                                    style={{
                                        flex: 1, padding: '12px', border: '1.5px solid #e2e8f0',
                                        borderRadius: 10, background: '#fff', cursor: 'pointer',
                                        fontWeight: 600, fontSize: 14,
                                    }}
                                >
                                    ← Back
                                </button>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 2, padding: '12px' }}
                                    onClick={handleBook}
                                    disabled={loading}
                                >
                                    {loading
                                        ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Booking...</>
                                        : <><Truck size={16} /> Book Now · ₹{estimatedCost}</>
                                    }
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Booked Confirmation ── */}
                    {step === 3 && booking && (
                        <div style={{ textAlign: 'center' }}>
                            {/* Success animation */}
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px',
                                boxShadow: '0 0 0 12px rgba(22,163,74,0.12)',
                            }}>
                                <CheckCircle size={36} color="#fff" />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#15803d', marginBottom: 4 }}>
                                Transport Booked! 🎉
                            </h3>
                            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
                                Your {booking.vehicleTypeLabel} has been successfully assigned.
                            </p>

                            {/* Driver card */}
                            <div style={{
                                background: '#f8fafc', borderRadius: 14, padding: '16px',
                                textAlign: 'left', marginBottom: 16,
                                border: '1px solid #e2e8f0',
                            }}>
                                <p style={{ fontWeight: 700, fontSize: 13, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                                    🚛 Driver Details
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <DriverRow icon={<User size={15} />} label="Driver" value={booking.driverName} />
                                    <DriverRow icon={<Phone size={15} />} label="Contact" value={booking.driverPhone} />
                                    <DriverRow icon={<Car size={15} />} label="Vehicle No." value={booking.vehicleNumber} />
                                    <DriverRow icon={<Calendar size={15} />} label="Est. Delivery" value={booking.estimatedDeliveryDate} />
                                    <DriverRow icon={<DollarSign size={15} />} label="Transport Cost" value={`₹${booking.estimatedCost}`} />
                                </div>
                            </div>

                            {/* Status badge */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '6px 14px', borderRadius: 100,
                                background: STATUS_CONFIG[booking.status]?.bg || '#f1f5f9',
                                color: STATUS_CONFIG[booking.status]?.color || '#475569',
                                fontWeight: 700, fontSize: 13, marginBottom: 20,
                            }}>
                                <Truck size={14} />
                                Status: {STATUS_CONFIG[booking.status]?.label || booking.status}
                            </div>

                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', padding: '13px' }}
                                onClick={onClose}
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(30px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// ── Small reusable pieces ─────────────────────────────────────────────
const SummaryRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <div>
            <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>{label}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: 0 }}>{value || '—'}</p>
        </div>
    </div>
);

const DriverRow = ({ icon, label, value }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexShrink: 0 }}>
            {icon}
        </div>
        <div>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{label}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>{value}</p>
        </div>
    </div>
);

export default TransportBookingModal;
