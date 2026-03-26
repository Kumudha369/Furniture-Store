import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Sofa } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{background:'#3d3028',color:'#d4c5b0',marginTop:'4rem'}}>
      <div className="container" style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1.5fr',gap:'3rem',padding:'3.5rem 1.5rem'}}>
        <div>
          <div style={{display:'flex',alignItems:'flex-start',gap:12,marginBottom:'1rem'}}>
            <div style={{width:40,height:40,background:'#c9a96e',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',color:'#3d3028',flexShrink:0}}><Sofa size={20}/></div>
            <div><div style={{fontFamily:'var(--font-display)',fontSize:'0.95rem',fontWeight:700,color:'#f5f1ed',lineHeight:1.2}}>Jothi Industrial And Furniture</div><div style={{fontSize:'0.7rem',color:'#9a8c7d',marginTop:2}}>GST: 33MUBPS8703H1ZA</div></div>
          </div>
          <p style={{fontSize:'0.85rem',lineHeight:1.7,color:'#a89a8a',marginBottom:'1.25rem'}}>Premium quality furniture crafted with passion. Serving customers across Salem and Tamil Nadu.</p>
        </div>
        <div>
          <h4 style={{fontFamily:'var(--font-body)',fontSize:'0.85rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'#c9a96e',marginBottom:'1.25rem'}}>Quick Links</h4>
          <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:'0.6rem'}}>
            {[['/',  'Home'], ['/products','Products'], ['/space-optimizer','Space Optimizer'], ['/about','About'], ['/contact','Contact']].map(([to,l]) => (
              <li key={to}><Link to={to} style={{fontSize:'0.85rem',color:'#a89a8a'}}>{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{fontFamily:'var(--font-body)',fontSize:'0.85rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'#c9a96e',marginBottom:'1.25rem'}}>Categories</h4>
          <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:'0.6rem'}}>
            {['Sofas','Beds','Dining Sets','Wardrobes','Industrial'].map(c => (
              <li key={c}><Link to={`/products?category=${c.split(' ')[0]}`} style={{fontSize:'0.85rem',color:'#a89a8a'}}>{c}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{fontFamily:'var(--font-body)',fontSize:'0.85rem',fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em',color:'#c9a96e',marginBottom:'1.25rem'}}>Contact Us</h4>
          <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:'0.75rem'}}>
            <li style={{display:'flex',gap:10,alignItems:'flex-start',fontSize:'0.82rem',color:'#a89a8a'}}><MapPin size={15} style={{flexShrink:0,color:'#c9a96e',marginTop:2}}/><span>9/365 Elumathanoor, Edanganasalai Post, Sankari Taluk, Salem - 637502</span></li>
            <li style={{display:'flex',gap:10,alignItems:'flex-start',fontSize:'0.82rem',color:'#a89a8a'}}><Phone size={15} style={{color:'#c9a96e'}}/><span>Contact: Sathish</span></li>
            <li style={{display:'flex',gap:10,alignItems:'flex-start',fontSize:'0.82rem',color:'#a89a8a'}}><Mail size={15} style={{color:'#c9a96e'}}/><span>info@jothifurniture.com</span></li>
            <li style={{display:'flex',gap:10,alignItems:'flex-start',fontSize:'0.82rem',color:'#a89a8a'}}><Clock size={15} style={{color:'#c9a96e'}}/><span>Mon-Sat: 9AM - 7PM</span></li>
          </ul>
        </div>
      </div>
      <div className="container" style={{display:'flex',justifyContent:'space-between',padding:'1.25rem 1.5rem',borderTop:'1px solid rgba(255,255,255,0.07)',fontSize:'0.78rem',color:'#6e5e50'}}>
        <p>© {new Date().getFullYear()} Jothi Industrial And Furniture, Ilampillai, Salem. All rights reserved.</p>
        <p>Built with ❤️ for quality craftsmanship</p>
      </div>
    </footer>
  );
}
