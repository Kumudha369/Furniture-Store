import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sofa } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [showPass, setShowPass] = useState(false);
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const r = await login(form.email, form.password);
    if (r.success) { toast.success('Welcome back!'); navigate('/'); }
    else toast.error(r.message);
  };

  return (
    <div style={{minHeight:'calc(100vh - 140px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem 1rem',background:'#f5f1ed'}}>
      <div className="card" style={{width:'100%',maxWidth:440,padding:'2.5rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:'1.5rem'}}>
          <div style={{width:44,height:44,background:'#5a4a3a',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'#c9a96e'}}><Sofa size={24}/></div>
          <div><div style={{fontFamily:'var(--font-display)',fontSize:'1rem',fontWeight:700,color:'#5a4a3a'}}>Jothi Furniture</div><div style={{fontSize:'0.7rem',color:'#9a8c7d'}}>Ilampillai, Salem</div></div>
        </div>
        <h2 style={{marginBottom:4}}>Welcome Back</h2>
        <p style={{color:'#9a8c7d',fontSize:'0.875rem',marginBottom:'1.5rem'}}>Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Email Address</label><input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} required placeholder="you@example.com"/></div>
          <div className="form-group">
            <label>Password</label>
            <div style={{position:'relative'}}>
              <input type={showPass?'text':'password'} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} required placeholder="Enter password" style={{paddingRight:40}}/>
              <button type="button" onClick={()=>setShowPass(!showPass)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#9a8c7d',display:'flex'}}>{showPass?<EyeOff size={16}/>:<Eye size={16}/>}</button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>{loading?'Signing in...':'Sign In'}</button>
        </form>
        <div style={{display:'flex',alignItems:'center',gap:'1rem',margin:'1.25rem 0',color:'#9a8c7d',fontSize:'0.8rem'}}>
          <hr style={{flex:1,border:'none',borderTop:'1px solid #ede8e0'}}/><span>Test Accounts</span><hr style={{flex:1,border:'none',borderTop:'1px solid #ede8e0'}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:'1.25rem'}}>
          <button onClick={()=>setForm({email:'admin@jothifurniture.com',password:'admin123'})} style={{padding:'8px',background:'#f5f1ed',border:'1.5px solid #ddd5c8',borderRadius:8,fontSize:'0.78rem',cursor:'pointer',fontFamily:'var(--font-body)',color:'#5a5047',transition:'all 0.25s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#8b6f47'} onMouseLeave={e=>e.currentTarget.style.borderColor='#ddd5c8'}>👑 Admin Login</button>
          <button onClick={()=>setForm({email:'customer@test.com',password:'customer123'})} style={{padding:'8px',background:'#f5f1ed',border:'1.5px solid #ddd5c8',borderRadius:8,fontSize:'0.78rem',cursor:'pointer',fontFamily:'var(--font-body)',color:'#5a5047',transition:'all 0.25s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#8b6f47'} onMouseLeave={e=>e.currentTarget.style.borderColor='#ddd5c8'}>👤 Customer Login</button>
        </div>
        <p style={{textAlign:'center',fontSize:'0.875rem',color:'#9a8c7d'}}>Don't have an account? <Link to="/register" style={{color:'#5a4a3a',fontWeight:600}}>Register here</Link></p>
      </div>
    </div>
  );
}
