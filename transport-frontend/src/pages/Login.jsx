import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
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
            {/* Decorative background elements */}
            <div style={{
                position: 'fixed', top: -150, right: -150,
                width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)',
            }} />
            <div style={{
                position: 'fixed', bottom: -100, left: -100,
                width: 300, height: 300, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)',
            }} />

            <div style={{
                width: '100%', maxWidth: 420,
                animation: 'fadeIn 0.5s ease-out',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: 'linear-gradient(135deg, #f97316, #ea580c)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: 16,
                        boxShadow: '0 0 40px rgba(249,115,22,0.3)',
                    }}>
                        <Truck size={32} color="#fff" />
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Transport Hub</h1>
                    <p style={{ color: '#64748b', fontSize: 14 }}>
                        AgriConnect Logistics Management Portal
                    </p>
                </div>

                {/* Form */}
                <div className="card" style={{ padding: 32 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Sign In</h2>

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
                            display: 'flex', alignItems: 'center', gap: 8,
                            color: '#fca5a5', fontSize: 13,
                        }}>
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label className="input-label">
                                <Mail size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="input-field"
                                placeholder="you@company.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">
                                <Lock size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                Password
                            </label>
                            <input
                                type="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '13px', fontSize: 15, marginTop: 8 }}
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : <>Sign In <ArrowRight size={18} /></>}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
                        Don't have an account?{' '}
                        <Link to="/register" style={{ color: '#f97316', fontWeight: 600, textDecoration: 'none' }}>
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
