import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Settings, Package, Sofa, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout, isAdmin, isLoggedIn } = useAuthStore();
  const { getCount } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = getCount();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setOpen(false); setDropdownOpen(false); }, [location]);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/'); };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/recommendation', label: '✨ AI Advisor', special: true },
    { to: '/space-optimizer', label: 'Space Optimizer' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <header style={{ position:'sticky', top:0, zIndex:100, background: scrolled ? 'rgba(250,247,243,0.97)' : 'rgba(250,247,243,0.95)', borderBottom:'1px solid #ede8e0', backdropFilter:'blur(10px)', boxShadow: scrolled ? '0 4px 16px rgba(90,74,58,0.12)' : 'none', transition:'box-shadow 0.3s' }}>
      <div className="container" style={{display:'flex',alignItems:'center',gap:'1.5rem',height:'68px'}}>
        {/* Logo */}
        <Link to="/" style={{display:'flex',alignItems:'center',gap:'10px',flexShrink:0,textDecoration:'none'}}>
          <div style={{width:40,height:40,background:'#5a4a3a',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',color:'#c9a96e'}}><Sofa size={22}/></div>
          <div>
            <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',fontWeight:700,color:'#5a4a3a',lineHeight:1}}>Jothi Furniture</div>
            <div style={{fontSize:'0.65rem',color:'#9a8c7d'}}>Ilampillai, Salem</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{display:'flex',alignItems:'center',gap:'4px',flex:1,justifyContent:'center'}} className="desktop-nav-bar">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{
              padding:'6px 12px', borderRadius:'6px', fontSize:'0.85rem', fontWeight:500,
              color: isActive(l.to) ? '#5a4a3a' : '#5a5047',
              background: isActive(l.to) ? '#ede8e0' : 'transparent',
              transition:'all 0.25s', textDecoration:'none',
              ...(l.special ? { background:'linear-gradient(135deg,#5a4a3a,#8b6f47)', color:'white', borderRadius:'20px', padding:'6px 14px' } : {})
            }}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flexShrink:0}}>
          <Link to="/cart" style={{position:'relative',display:'flex',alignItems:'center',justifyContent:'center',width:40,height:40,borderRadius:'50%',color:'#5a4a3a',textDecoration:'none'}}>
            <ShoppingCart size={20}/>
            {cartCount > 0 && <span style={{position:'absolute',top:-2,right:-2,width:18,height:18,background:'#c9a96e',color:'#3d3028',fontSize:'0.65rem',fontWeight:700,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>{cartCount}</span>}
          </Link>

          {isLoggedIn() ? (
            <div style={{position:'relative'}}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#ede8e0',border:'none',borderRadius:'20px',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:'0.85rem',color:'#2c2416'}}>
                <User size={18}/> <span className="username-label">{user?.name?.split(' ')[0]}</span>
              </button>
              {dropdownOpen && (
                <div style={{position:'absolute',top:'calc(100% + 8px)',right:0,background:'#fff',border:'1px solid #ddd5c8',borderRadius:'8px',boxShadow:'0 10px 40px rgba(90,74,58,0.15)',minWidth:180,zIndex:200}}>
                  <Link to="/profile" style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',fontSize:'0.85rem',color:'#5a5047',textDecoration:'none'}} onClick={()=>setDropdownOpen(false)}><User size={15}/> Profile</Link>
                  <Link to="/orders" style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',fontSize:'0.85rem',color:'#5a5047',textDecoration:'none'}} onClick={()=>setDropdownOpen(false)}><Package size={15}/> My Orders</Link>
                  {isAdmin() && <Link to="/admin" style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',fontSize:'0.85rem',color:'#5a5047',textDecoration:'none'}} onClick={()=>setDropdownOpen(false)}><Settings size={15}/> Admin Panel</Link>}
                  <hr style={{border:'none',borderTop:'1px solid #ede8e0',margin:'4px 0'}}/>
                  <button onClick={handleLogout} style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'10px 16px',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:'0.85rem',color:'#c0392b',textAlign:'left'}}><LogOut size={15}/> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
          )}

          <button onClick={() => setOpen(!open)} style={{display:'none',background:'none',border:'none',cursor:'pointer',padding:6,color:'#5a4a3a'}} className="mobile-menu-btn">
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {open && (
        <div style={{padding:'1rem',borderTop:'1px solid #ede8e0',background:'#fff',display:'flex',flexDirection:'column',gap:'2px'}}>
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} style={{padding:'11px 16px',borderRadius:'8px',fontSize:'0.9rem',color: isActive(l.to) ? '#5a4a3a':'#5a5047', background: isActive(l.to)?'#ede8e0':'transparent', textDecoration:'none', fontFamily:'var(--font-body)'}}>{l.label}</Link>
          ))}
          {isLoggedIn() ? (
            <>
              <Link to="/profile" style={{padding:'11px 16px',borderRadius:'8px',fontSize:'0.9rem',color:'#5a5047',textDecoration:'none'}}>Profile</Link>
              <Link to="/orders" style={{padding:'11px 16px',borderRadius:'8px',fontSize:'0.9rem',color:'#5a5047',textDecoration:'none'}}>My Orders</Link>
              {isAdmin() && <Link to="/admin" style={{padding:'11px 16px',borderRadius:'8px',fontSize:'0.9rem',color:'#5a5047',textDecoration:'none'}}>Admin Panel</Link>}
              <button onClick={handleLogout} style={{padding:'11px 16px',background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:'0.9rem',color:'#c0392b',textAlign:'left'}}>Logout</button>
            </>
          ) : (
            <Link to="/login" style={{padding:'11px 16px',borderRadius:'8px',fontSize:'0.9rem',color:'#5a5047',textDecoration:'none'}}>Login / Register</Link>
          )}
        </div>
      )}
      <style>{`.desktop-nav-bar{display:flex!important}.mobile-menu-btn{display:none!important}@media(max-width:900px){.desktop-nav-bar{display:none!important}.mobile-menu-btn{display:flex!important}.username-label{display:none}}`}</style>
    </header>
  );
}
