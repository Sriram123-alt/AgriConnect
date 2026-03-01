import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShoppingCart, Leaf, ShieldCheck, ArrowRight, Star, Users, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
    const { user } = useAuth();

    if (user) {
        if (user.role === 'ROLE_FARMER') return <Navigate to="/dashboard" />;
        if (user.role === 'ROLE_BUYER') return <Navigate to="/marketplace" />;
        if (user.role === 'ROLE_ADMIN') return <Navigate to="/admin" />;
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'white', color: 'var(--text-main)' }}>
            {/* Navbar */}
            <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '20px 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px' }}>
                            <ShoppingCart size={24} color="white" />
                        </div>
                        <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>AgriConnect</span>
                    </div>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                        <a href="#features" style={{ fontWeight: '600', color: 'var(--text-muted)', textDecoration: 'none' }}>Features</a>
                        <a href="#how-it-works" style={{ fontWeight: '600', color: 'var(--text-muted)', textDecoration: 'none' }}>How it Works</a>
                        <Link to="/login" className="btn btn-primary" style={{ padding: '10px 24px' }}>Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ padding: '100px 0', background: 'radial-gradient(circle at top right, #f0fdf4, white)' }}>
                <div className="container" style={{ textAlign: 'center', maxWidth: '900px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--primary-light)', color: 'var(--primary-dark)', padding: '8px 16px', borderRadius: '30px', marginBottom: '24px', fontSize: '14px', fontWeight: '700' }}>
                        <Leaf size={16} /> Connecting Farm to Table
                    </div>
                    <h1 style={{ fontSize: '64px', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1px' }}>
                        The Direct Link Between <span style={{ color: 'var(--primary)' }}>Farmers</span> and <span style={{ color: 'var(--secondary)' }}>Buyers</span>.
                    </h1>
                    <p style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: '1.6' }}>
                        Empowering farmers with fair prices and providing buyers with the freshest local produce. AgriConnect eliminates the middleman for a more sustainable future.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                        <Link to="/login" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '18px' }}>
                            Browse Marketplace <ArrowRight size={20} />
                        </Link>
                        <button className="btn" style={{ background: 'white', border: '1px solid var(--border)', padding: '14px 32px', fontSize: '18px' }}>
                            Learn More
                        </button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" style={{ padding: '100px 0', backgroundColor: '#f8fafc' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Why Choose AgriConnect?</h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>We provide the tools needed for a transparent and efficient agricultural marketplace.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                        {[
                            { icon: Leaf, title: '100% Fresh & Organic', desc: 'Direct access to the freshest harvest, including certified organic options from verified farms.' },
                            { icon: ShieldCheck, title: 'Secure Transactions', desc: 'Protected payments and transparent negotiation system ensure peace of mind for both parties.' },
                            { icon: MapPin, title: 'Local Sourcing', desc: 'Reduce your carbon footprint by buying from local farmers in your region.' }
                        ].map((f, i) => (
                            <div key={i} className="card" style={{ padding: '40px', textAlign: 'center' }}>
                                <div style={{ background: 'var(--primary-light)', width: '64px', height: '64px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                                    <f.icon size={32} />
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section style={{ padding: '80px 0', background: 'var(--primary)', color: 'white' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px', textAlign: 'center' }}>
                    {[
                        { label: 'Verified Farmers', value: '2,500+' },
                        { label: 'Active Buyers', value: '15,000+' },
                        { label: 'Crops Traded', value: '500 Tons' },
                        { label: 'Cities Covered', value: '120+' }
                    ].map((s, i) => (
                        <div key={i}>
                            <h4 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '8px' }}>{s.value}</h4>
                            <p style={{ opacity: 0.9, fontWeight: '600' }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '80px 0', borderTop: '1px solid var(--border)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ maxWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                            <ShoppingCart size={24} color="var(--primary)" />
                            <span style={{ fontSize: '20px', fontWeight: '800' }}>AgriConnect</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.5' }}>
                            The world's leading farmer-to-buyer platform. We're on a mission to revolutionize agriculture.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '64px' }}>
                        <div>
                            <h5 style={{ fontWeight: '700', marginBottom: '20px' }}>Platform</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                <span>Marketplace</span>
                                <span>For Farmers</span>
                                <span>For Buyers</span>
                            </div>
                        </div>
                        <div>
                            <h5 style={{ fontWeight: '700', marginBottom: '20px' }}>Company</h5>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)', fontSize: '14px' }}>
                                <span>About Us</span>
                                <span>Contact</span>
                                <span>Privacy Policy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
