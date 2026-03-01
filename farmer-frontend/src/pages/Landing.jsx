import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, DollarSign, TrendingUp, ArrowRight, ShieldCheck, PieChart, Users } from 'lucide-react';

const Landing = () => {
    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'white', color: 'var(--text-main)' }}>
            {/* Navbar */}
            <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 100, padding: '20px 0' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px' }}>
                            <Leaf size={24} color="white" />
                        </div>
                        <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }}>AgriFarmer</span>
                    </div>
                    <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                        <Link to="/login" className="btn btn-primary" style={{ padding: '10px 24px' }}>Farmer Login</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ padding: '100px 0', background: 'radial-gradient(circle at top right, #f7fee7, white)' }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ecfccb', color: '#365314', padding: '8px 16px', borderRadius: '30px', marginBottom: '24px', fontSize: '14px', fontWeight: '700' }}>
                            <TrendingUp size={16} /> Maximize Your Profits
                        </div>
                        <h1 style={{ fontSize: '64px', fontWeight: '800', lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1px' }}>
                            Sell Your Harvest <span style={{ color: 'var(--primary)' }}>Directly</span> To Global Buyers.
                        </h1>
                        <p style={{ fontSize: '20px', color: 'var(--text-muted)', marginBottom: '40px', lineHeight: '1.6' }}>
                            AgriConnect provides farmers with the tools to reach thousands of buyers, manage negotiations, and get paid fairly for their hard work.
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Link to="/login" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '18px' }}>
                                Join as a Farmer <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <div className="card animate-fade-in" style={{ padding: '32px', border: '5px solid white', boxShadow: 'var(--shadow-lg)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                <h4 style={{ fontWeight: '700' }}>Sales Revenue</h4>
                                <TrendingUp color="var(--primary)" />
                            </div>
                            <div style={{ height: '200px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', gap: '10px', padding: '20px' }}>
                                {[40, 70, 45, 90, 65, 80].map((h, i) => (
                                    <div key={i} style={{ flex: 1, height: `${h}%`, background: 'var(--primary)', borderRadius: '4px' }}></div>
                                ))}
                            </div>
                            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                                <span style={{ fontSize: '24px', fontWeight: '800' }}>$12,450.00</span>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Monthly Earnings</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features for Farmers */}
            <section style={{ padding: '100px 0', backgroundColor: '#fafaf9' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>Build Your Digital Farm</h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>Everything you need to grow your agricultural business in the modern age.</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
                        {[
                            { icon: DollarSign, title: 'Better Pricing', desc: 'No middlemen means you set your prices and keep 100% of your earnings minus a small platform fee.' },
                            { icon: PieChart, title: 'Sales Analytics', desc: 'Track which crops are performing best and monitor your revenue growth over time.' },
                            { icon: ShieldCheck, title: 'Verified Buyers', desc: 'Connect with serious commercial and individual buyers who are vetted by our platform.' }
                        ].map((f, i) => (
                            <div key={i} className="card" style={{ padding: '40px' }}>
                                <div style={{ background: '#f5f5f4', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--primary)' }}>
                                    <f.icon size={28} />
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>{f.title}</h3>
                                <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
