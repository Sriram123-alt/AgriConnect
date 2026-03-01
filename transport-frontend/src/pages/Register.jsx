import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Mail, Lock, User, Phone, MapPin, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
    const [form, setForm] = useState({ fullName: '', email: '', password: '', phoneNumber: '', address: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await register(form);
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            padding: 20,
        }}>
            <div style={{
                position: 'fixed', top: -150, right: -150,
                width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
            }} />

            <div style={{ width: '100%', maxWidth: 420, animation: 'fadeIn 0.5s ease-out' }}>
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 14,
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 14, boxShadow: '0 0 40px rgba(249,115,22,0.3)',
                    }}>
                        <Truck size={28} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Join Transport Hub</h1>
                    <p style={{ color: '#64748b', fontSize: 13 }}>Register as a Transport Manager</p>
                </div>

                <div className="card" style={{ padding: 28 }}>
                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 10, padding: '10px 14px', marginBottom: 14,
                            display: 'flex', alignItems: 'center', gap: 8,
                            color: '#fca5a5', fontSize: 13,
                        }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                    {success && (
                        <div style={{
                            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                            borderRadius: 10, padding: '10px 14px', marginBottom: 14,
                            display: 'flex', alignItems: 'center', gap: 8,
                            color: '#6ee7b7', fontSize: 13,
                        }}>
                            <CheckCircle size={16} /> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label"><User size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Full Name *</label>
                            <input className="input-field" placeholder="John Doe" value={form.fullName} onChange={e => handleChange('fullName', e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label className="input-label"><Mail size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Email *</label>
                            <input className="input-field" type="email" placeholder="you@company.com" value={form.email} onChange={e => handleChange('email', e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label className="input-label"><Lock size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Password *</label>
                            <input className="input-field" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => handleChange('password', e.target.value)} required />
                        </div>
                        <div className="input-group">
                            <label className="input-label"><Phone size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Phone</label>
                            <input className="input-field" placeholder="+91 98765 43210" value={form.phoneNumber} onChange={e => handleChange('phoneNumber', e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label"><MapPin size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Office Address</label>
                            <input className="input-field" placeholder="Transport office address" value={form.address} onChange={e => handleChange('address', e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '13px', fontSize: 15 }} disabled={loading}>
                            {loading ? 'Registering...' : <>Create Account <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: '#64748b' }}>
                        Already registered?{' '}
                        <Link to="/login" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
