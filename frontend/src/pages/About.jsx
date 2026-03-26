import React from 'react';
import { Link } from 'react-router-dom';
import { Award, Users, MapPin, Clock } from 'lucide-react';

export default function About() {
  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{textAlign:'center',padding:'3rem 0 2rem'}}>
          <span style={{display:'inline-block',background:'var(--accent-light)',color:'var(--primary)',padding:'6px 14px',borderRadius:'20px',fontSize:'0.78rem',fontWeight:600,marginBottom:'1rem'}}>Est. 2+ Years</span>
          <h1>About Jothi Industrial And Furniture</h1>
          <p style={{color:'var(--text-3)',maxWidth:'600px',margin:'0.75rem auto 0',fontSize:'1rem',lineHeight:1.7}}>
            Crafting premium quality furniture with passion, tradition, and modern craftsmanship from the heart of Ilampillai, Salem, Tamil Nadu.
          </p>
        </div>

        <div className="grid-2" style={{marginBottom:'3rem'}}>
          <div className="card" style={{padding:'2rem'}}>
            <h2>Our Story</h2>
            <p style={{color:'var(--text-2)',lineHeight:1.8,marginTop:'1rem'}}>
              Jothi Industrial And Furniture was founded with a simple mission: to bring premium quality furniture to homes across Salem and Tamil Nadu at honest prices. Located in Ilampillai, we've grown to become a trusted name in furniture retail and manufacturing.
            </p>
            <p style={{color:'var(--text-2)',lineHeight:1.8,marginTop:'1rem'}}>
              Our showroom features a wide range of furniture — from elegant teak wood sofas and beds to modern industrial-style pieces crafted with metal and reclaimed wood. Each piece is built to last and designed to enhance your living space.
            </p>
          </div>
          <div>
            <div className="grid-2" style={{gap:'1rem'}}>
              {[
                { icon: <Award size={24} />, title: 'Premium Quality', desc: 'Select teak, sheesham & engineered woods' },
                { icon: <Users size={24} />, title: '2000+ Customers', desc: 'Serving Salem & surrounding areas' },
                { icon: <MapPin size={24} />, title: 'Salem, TN', desc: 'Ilampillai showroom — visit us!' },
                { icon: <Clock size={24} />, title: '2+ Years', desc: 'Of trusted service & craftsmanship' },
              ].map((f, i) => (
                <div key={i} className="card" style={{padding:'1.5rem',textAlign:'center'}}>
                  <div style={{color:'var(--primary-light)',marginBottom:'0.75rem'}}>{f.icon}</div>
                  <h4 style={{fontFamily:'var(--font-body)',fontSize:'0.9rem'}}>{f.title}</h4>
                  <p style={{fontSize:'0.8rem',color:'var(--text-3)',marginTop:'4px'}}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{padding:'2rem',background:'var(--primary)',color:'white',textAlign:'center'}}>
          <h2 style={{color:'var(--accent)'}}>Visit Our Showroom</h2>
          <p style={{color:'rgba(255,255,255,0.8)',margin:'0.75rem 0 1.5rem'}}>
            9/365 Elumathanoor, Edanganasalai Post, Sankari Taluk, Salem – 637502, Tamil Nadu
          </p>
          <div style={{display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}}>
            <Link to="/products" className="btn btn-accent">Browse Products</Link>
            <Link to="/contact" className="btn btn-outline" style={{color:'white',borderColor:'white'}}>Contact Us</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
