import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { User, MapPin, Phone } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || 'Tamil Nadu',
    pincode: user?.address?.pincode || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile({
      name: form.name,
      phone: form.phone,
      address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode }
    });
    if (result.success) toast.success('Profile updated!');
    else toast.error(result.message || 'Update failed');
    setSaving(false);
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{maxWidth:'640px'}}>
        <h1>My Profile</h1>
        <div className="card" style={{padding:'2rem',marginTop:'1.5rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'2rem'}}>
            <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'var(--accent-light)',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--primary)'}}>
              <User size={28} />
            </div>
            <div>
              <h3 style={{margin:0}}>{user?.name}</h3>
              <p style={{color:'var(--text-3)',fontSize:'0.875rem'}}>{user?.email}</p>
              <span className="badge badge-primary" style={{marginTop:'4px'}}>{user?.role}</span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Full Name</label><input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} /></div>
            <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} /></div>
            <h4 style={{margin:'1.25rem 0 1rem',fontFamily:'var(--font-body)',fontSize:'0.9rem',color:'var(--text-2)'}}>Address</h4>
            <div className="form-group"><label>Street</label><input value={form.street} onChange={e => setForm(p => ({...p, street: e.target.value}))} /></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
              <div className="form-group"><label>City</label><input value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} /></div>
              <div className="form-group"><label>Pincode</label><input value={form.pincode} onChange={e => setForm(p => ({...p, pincode: e.target.value}))} /></div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
