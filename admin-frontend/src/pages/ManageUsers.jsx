import React, { useState, useEffect } from 'react';
import { Users, Shield, UserMinus, UserCheck, Search, Filter } from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';
import api from '../api/api';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/api/admin/users');
            if (response.data.success) {
                setUsers(response.data.data.content || []);
            }
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id, currentActive) => {
        try {
            const response = await api.patch(`/api/admin/users/${id}/status`, null, { params: { active: !currentActive } });
            if (response.data.success) {
                setUsers(users.map(u =>
                    u.id === id ? { ...u, active: !currentActive } : u
                ));
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleApprove = async (id) => {
        try {
            const response = await api.patch(`/api/admin/users/${id}/approve`);
            if (response.data.success) {
                setUsers(users.map(u =>
                    u.id === id ? { ...u, approved: true } : u
                ));
                alert('Farmer approved successfully');
            }
        } catch (err) {
            alert('Failed to approve farmer');
        }
    };

    return (
        <div style={{ display: 'flex', background: '#f1f5f9', minHeight: '100vh' }}>
            <AdminNavbar />
            <main style={{ marginLeft: '280px', flex: 1, padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>User Management</h1>
                        <p style={{ color: '#64748b' }}>Approve, suspend and manage platform users.</p>
                    </div>
                </div>

                <div className="card" style={{ border: 'none', background: 'white', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>User</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Role</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Join Date</th>
                                <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>No users found</td></tr>
                            ) : users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '36px', height: '36px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: '700', textTransform: 'uppercase' }}>
                                                {user.fullName ? user.fullName[0] : 'U'}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{user.fullName}</p>
                                                <p style={{ fontSize: '12px', color: '#94a3b8' }}>{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px', background: user.role === 'ROLE_FARMER' ? '#f0fdf4' : '#eff6ff', color: user.role === 'ROLE_FARMER' ? '#15803d' : '#1d4ed8' }}>
                                            {user.role?.replace('ROLE_', '')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.active ? '#22c55e' : '#f43f5e' }}></div>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#475569' }}>{user.active ? 'ACTIVE' : 'SUSPENDED'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: '14px', color: '#64748b' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {user.role === 'ROLE_FARMER' && !user.approved && (
                                                <button onClick={() => handleApprove(user.id)} className="btn" style={{ padding: '6px', background: '#ecfdf5', border: '1px solid #10b981', color: '#059669' }} title="Approve Farmer">
                                                    <UserCheck size={16} />
                                                </button>
                                            )}
                                            {user.active ? (
                                                <button onClick={() => toggleStatus(user.id, user.active)} className="btn" style={{ padding: '6px', background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48' }} title="Suspend User">
                                                    <UserMinus size={16} />
                                                </button>
                                            ) : (
                                                <button onClick={() => toggleStatus(user.id, user.active)} className="btn" style={{ padding: '6px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }} title="Activate User">
                                                    <UserCheck size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default ManageUsers;
