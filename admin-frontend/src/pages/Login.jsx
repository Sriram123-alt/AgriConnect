import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('23eg107a27@gmail.com');
    const [password, setPassword] = useState('Sriram@123');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid admin credentials');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px', background: '#1e293b', border: '1px solid #334155' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ background: 'var(--primary)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <ShieldCheck size={32} color="white" />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>Admin Portal</h1>
                    <p style={{ color: '#94a3b8' }}>Secure management system</p>
                </div>

                {error && <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label" style={{ color: '#94a3b8' }}>Admin Email</label>
                        <input type="email" className="input-field" style={{ background: '#0f172a', border: '1px solid #334155', color: 'white' }} value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>

                    <div className="input-group">
                        <label className="input-label" style={{ color: '#94a3b8' }}>Password</label>
                        <input type="password" className="input-field" style={{ background: '#0f172a', border: '1px solid #334155', color: 'white' }} value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Authenticate <ArrowRight size={18} />
                    </button>
                </form>

                <p style={{ textAlign: 'center', fontSize: '14px', color: '#94a3b8', marginTop: '20px' }}>
                    Need a new admin account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600', textDecoration: 'none' }}>Register Here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
