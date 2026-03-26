import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sofa } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    const r = await register(form.name, form.email, form.password, form.phone);
    if (r.success) { toast.success('Account created!'); navigate('/'); }
    else toast.error(r.message);
  };

  return (
    <div style={{minHeight:'calc(100vh - 140px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem 1rem',background:'#f5f1ed'}}>
      <div className="card" style={{width:'100%',maxWidth:440,padding:'2.5rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'1.5rem'}}>
          <div style={{width:44,height:44,background:'#5a4a3a',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'#c9a96e'}}><Sofa size={24}/></div>
          <div><div style={{fontFamily:'var(--font-display)',fontSize:'1rem',fontWeight:700,color:'#5a4a3a'}}>Jothi Furniture</div><div style={{fontSize:'0.7rem',color:'#9a8c7d'}}>Ilampillai, Salem</div></div>
        </div>
        <h2 style={{marginBottom:4}}>Create Account</h2>
        <p style={{color:'#9a8c7d',fontSize:'0.875rem',marginBottom:'1.5rem'}}>Join us for quality furniture shopping</p>
        <form onSubmit={handleSubmit}>
          {[['name','Full Name','text','Your full name'],['email','Email Address','email','you@example.com'],['phone','Phone (optional)','tel','10-digit mobile'],['password','Password','password','Min 6 characters'],['confirm','Confirm Password','password','Re-enter password']].map(([k,l,t,ph])=>(
            <div key={k} className="form-group"><label>{l}</label><input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} required={k!=='phone'} placeholder={ph}/></div>
          ))}
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>{loading?'Creating account...':'Create Account'}</button>
        </form>
        <p style={{textAlign:'center',fontSize:'0.875rem',color:'#9a8c7d',marginTop:'1rem'}}>Already have an account? <Link to="/login" style={{color:'#5a4a3a',fontWeight:600}}>Sign in</Link></p>
      </div>
    </div>
  );
}
