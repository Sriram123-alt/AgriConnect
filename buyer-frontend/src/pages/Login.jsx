import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('buyer_23eg107a27@gmail.com');
    const [password, setPassword] = useState('Sriram@123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            // For simplicity, we allow any role to login but differentiate logic if needed
            navigate('/marketplace');
        } catch (err) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ background: 'var(--secondary)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <ShoppingCart size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Buyer Marketplace</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Find fresh produce directly from farms</p>
                </div>

                {error && <div style={{ backgroundColor: '#fef2f2', color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="email" className="input-field" style={{ paddingLeft: '40px' }} placeholder="buyer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input type="password" className="input-field" style={{ paddingLeft: '40px' }} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginBottom: '16px' }} disabled={loading}>
                        {loading ? 'Entering...' : 'Enter Marketplace'} <ArrowRight size={18} />
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                    New to AgriConnect? <Link to="/register" style={{ color: 'var(--secondary)', fontWeight: '600', textDecoration: 'none' }}>Join as Buyer</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
