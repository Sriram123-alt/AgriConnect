import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, ShieldCheck, Camera, Edit3, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '+91 98765 43210',
        businessName: 'AgriExpress Logistics',
        address: '123 Logistics Park, Mumbai, Maharashtra 400001',
        experience: '8 Years',
        fleetSize: '25 Vehicles'
    });

    const handleSave = () => {
        setIsEditing(false);
        // Simulate API call
        alert('Profile updated successfully!');
    };

    return (
        <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Account Profile</h1>
                    <p style={{ color: '#64748b', marginTop: '6px' }}>Manage your transport business identity and contact details</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
                    {/* Left: Avatar Card */}
                    <div className="card" style={{ padding: '32px', textAlign: 'center', height: 'fit-content' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
                            <div style={{
                                width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ea580c)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: 'white', fontWeight: '800'
                            }}>
                                {profileData.fullName[0]}
                            </div>
                            <button style={{
                                position: 'absolute', bottom: '0', right: '0', width: '36px', height: '36px', borderRadius: '50%',
                                background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                            }}>
                                <Camera size={18} color="#64748b" />
                            </button>
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>{profileData.fullName}</h3>
                        <p style={{ color: '#f97316', fontWeight: '700', fontSize: '14px', marginBottom: '20px' }}>Transport Partner</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569' }}>
                                <ShieldCheck size={16} color="#10b981" />
                                <span>Verified Partner</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#475569' }}>
                                <Building size={16} color="#94a3b8" />
                                <span>{profileData.businessName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Details Form */}
                    <div className="card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Business Details</h2>
                            {isEditing ? (
                                <button onClick={handleSave} className="btn btn-primary" style={{ padding: '8px 20px', gap: '8px' }}>
                                    <Save size={18} /> Save Changes
                                </button>
                            ) : (
                                <button onClick={() => setIsEditing(true)} className="btn btn-secondary" style={{ padding: '8px 20px', gap: '8px' }}>
                                    <Edit3 size={18} /> Edit Profile
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                                    <User size={16} /> Full Name
                                </label>
                                <input
                                    className="input-field"
                                    disabled={!isEditing}
                                    value={profileData.fullName}
                                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                                    <Mail size={16} /> Email Address
                                </label>
                                <input
                                    className="input-field"
                                    disabled
                                    value={profileData.email}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                                    <Phone size={16} /> Phone Number
                                </label>
                                <input
                                    className="input-field"
                                    disabled={!isEditing}
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                                    <Building size={16} /> Business Name
                                </label>
                                <input
                                    className="input-field"
                                    disabled={!isEditing}
                                    value={profileData.businessName}
                                    onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                                    <MapPin size={16} /> Registered Address
                                </label>
                                <textarea
                                    className="input-field"
                                    disabled={!isEditing}
                                    rows="3"
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                                    Experience
                                </label>
                                <input
                                    className="input-field"
                                    disabled={!isEditing}
                                    value={profileData.experience}
                                    onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>
                                    Fleet Size
                                </label>
                                <input
                                    className="input-field"
                                    disabled={!isEditing}
                                    value={profileData.fleetSize}
                                    onChange={(e) => setProfileData({ ...profileData, fleetSize: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
        </div>
    );
};

export default Profile;
