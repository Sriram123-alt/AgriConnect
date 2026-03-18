import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';
import { Leaf, IndianRupee, Package, MapPin, Image as ImageIcon, Calendar, FileText, ArrowLeft, Save } from 'lucide-react';

const AddCrop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    pricePerKg: '',
    quantity: '',
    unit: 'kg',
    harvestDate: '',
    organic: false,
    description: '',
    location: '',
    imageUrls: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        pricePerKg: form.pricePerKg ? Number(form.pricePerKg) : null,
        quantity: form.quantity ? Number(form.quantity) : null,
        unit: form.unit,
        harvestDate: form.harvestDate || null,
        organic: !!form.organic,
        description: form.description,
        location: form.location,
        imageUrls: form.imageUrls ? form.imageUrls.split(',').map(s => s.trim()) : []
      };

      const resp = await api.post('/api/crops', payload);
      if (resp.data && resp.data.success) {
        alert('Crop added successfully');
        navigate('/dashboard');
      } else {
        throw new Error(resp.data?.message || 'Failed to add crop');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error adding crop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '32px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '16px', fontWeight: '600' }}
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>List New Harvest</h1>
        <p style={{ color: 'var(--text-muted)' }}>Share your high-quality produce with potential buyers across the platform.</p>
      </header>

      <div className="card animate-fade-in" style={{ maxWidth: '800px', padding: '40px', border: 'none', boxShadow: 'var(--shadow-lg)' }}>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Produce Name</label>
            <div style={{ position: 'relative' }}>
              <Leaf size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input name="name" className="input-field" style={{ paddingLeft: '48px' }} placeholder="e.g., Organic Red Tomatoes" value={form.name} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="input-group">
              <label className="input-label">Price per Unit</label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input name="pricePerKg" className="input-field" style={{ paddingLeft: '48px' }} placeholder="0.00" type="number" step="0.01" value={form.pricePerKg} onChange={handleChange} required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Total Quantity</label>
              <div style={{ position: 'relative' }}>
                <Package size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input name="quantity" className="input-field" style={{ paddingLeft: '48px', flex: 1 }} placeholder="0.00" type="number" step="0.1" value={form.quantity} onChange={handleChange} required />
                  <select name="unit" className="input-field" style={{ width: '100px' }} value={form.unit} onChange={handleChange}>
                    <option value="kg">kg</option>
                    <option value="tonne">tonne</option>
                    <option value="piece">piece</option>
                    <option value="box">box</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="input-group">
              <label className="input-label">Harvest Date</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input name="harvestDate" type="date" className="input-field" style={{ paddingLeft: '48px' }} value={form.harvestDate} onChange={handleChange} />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Farm Location</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input name="location" className="input-field" style={{ paddingLeft: '48px' }} placeholder="e.g., Salinas, CA" value={form.location} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Short Description</label>
            <div style={{ position: 'relative' }}>
              <FileText size={18} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
              <textarea name="description" className="input-field" style={{ paddingLeft: '48px', minHeight: '120px', paddingTop: '12px' }} placeholder="Describe the quality, freshness, and characteristics of your produce..." value={form.description} onChange={handleChange} />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Product Image URLs (max 3)</label>
            <div style={{ position: 'relative' }}>
              <ImageIcon size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input name="imageUrls" className="input-field" style={{ paddingLeft: '48px' }} placeholder="https://image1.com, https://image2.com" value={form.imageUrls} onChange={handleChange} />
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Separate multiple URLs with commas.</p>
          </div>

          <div style={{ marginBottom: '32px', background: 'var(--background)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                name="organic"
                type="checkbox"
                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                checked={form.organic}
                onChange={handleChange}
              />
              <div>
                <p style={{ fontWeight: '700', fontSize: '14px' }}>Certified Organic Produce</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Check this if your harvest is verified as organic.</p>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, padding: '14px', fontSize: '16px' }}
              disabled={loading}
            >
              {loading ? 'Listing Produce...' : <><Save size={20} /> Publish Listing</>}
            </button>
            <button
              type="button"
              className="btn"
              style={{ background: 'white', border: '1px solid var(--border)', padding: '14px', width: '120px' }}
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCrop;

