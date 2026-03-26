import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Award, Phone, MapPin, Layout, Star, ChevronRight } from 'lucide-react';
import axios from '../utils/axiosConfig.js';
import ProductCard from '../components/ProductCard';

// Real high-quality furniture images from Unsplash (free, no auth needed)
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80',  // luxury sofa living room
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=80', // modern living room
  'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=900&q=80', // bedroom
];

const CATEGORY_DATA = [
  { name:'Sofas',     q:'Sofa',       img:'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=70' },
  { name:'Beds',      q:'Bed',        img:'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&q=70' },
  { name:'Dining',    q:'Dining',     img:'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&q=70' },
  { name:'Wardrobes', q:'Wardrobe',   img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70' },
  { name:'Desks',     q:'Desk',       img:'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=70' },
  { name:'Industrial',q:'Industrial', img:'https://images.unsplash.com/photo-1572373672978-0b9b74d05fba?w=400&q=70' },
];

const TESTIMONIALS = [
  { name:'Ramesh K.', city:'Salem', rating:5, text:'Excellent quality teak sofa set. Delivered on time and setup was perfect. Highly recommend Jothi Furniture!' },
  { name:'Priya S.', city:'Namakkal', rating:5, text:'Bought a king bed and wardrobe set. The craftsmanship is outstanding. Worth every rupee spent.' },
  { name:'Arun M.', city:'Sankari', rating:5, text:'Industrial bookcase looks exactly like the picture. Very sturdy and great finish. Will buy again.' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroImg, setHeroImg] = useState(0);

  useEffect(() => {
    axios.get('/api/products?featured=true&limit=8')
      .then(r => setFeatured(r.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    // Auto-rotate hero image
    const t = setInterval(() => setHeroImg(i => (i + 1) % HERO_IMAGES.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ overflow: 'hidden' }}>

      {/* ══════════════════════════════════════
          HERO SECTION — full image background
      ══════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

        {/* Background images with crossfade */}
        {HERO_IMAGES.map((img, i) => (
          <div key={img} style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'opacity 1.2s ease',
            opacity: heroImg === i ? 1 : 0
          }}/>
        ))}

        {/* Dark overlay gradient */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(105deg, rgba(30,20,10,0.88) 0%, rgba(60,45,30,0.75) 50%, rgba(90,74,58,0.35) 100%)'
        }}/>

        {/* Content */}
        <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: '4rem', paddingBottom: '4rem' }}>
          <div style={{ maxWidth: 620 }}>

            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,169,110,0.18)', border: '1px solid rgba(201,169,110,0.5)', color: '#c9a96e', padding: '7px 16px', borderRadius: 30, fontSize: '0.78rem', fontWeight: 600, marginBottom: '1.5rem', backdropFilter: 'blur(8px)' }}>
              🏆 Salem's Premier Furniture Store
            </div>

            {/* Headline */}
            <h1 style={{ color: '#ffffff', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1.15, marginBottom: '1.25rem', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
              Crafting Homes,<br/>
              <span style={{ color: '#c9a96e', fontStyle: 'italic' }}>One Piece at a Time</span>
            </h1>

            {/* Subtext */}
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', lineHeight: 1.75, marginBottom: '2.25rem', maxWidth: 500 }}>
              Premium quality furniture handcrafted with teak, sheesham & engineered wood.
              Serving Salem, Namakkal & Tamil Nadu since our founding at Ilampillai.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <Link to="/products" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 30px', background: '#c9a96e', color: '#2c1a0a',
                borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: '1rem',
                fontWeight: 700, textDecoration: 'none', transition: 'all 0.25s',
                boxShadow: '0 4px 20px rgba(201,169,110,0.4)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#b8944f'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#c9a96e'; e.currentTarget.style.transform = ''; }}>
                Shop Now <ArrowRight size={18}/>
              </Link>

              <Link to="/recommendation" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', background: 'rgba(255,255,255,0.1)',
                color: 'white', border: '1.5px solid rgba(255,255,255,0.35)',
                borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: '1rem',
                fontWeight: 500, textDecoration: 'none', backdropFilter: 'blur(8px)', transition: 'all 0.25s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = ''; }}>
                ✨ AI Advisor
              </Link>

              <Link to="/space-optimizer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 28px', background: 'rgba(255,255,255,0.08)',
                color: 'white', border: '1.5px solid rgba(255,255,255,0.25)',
                borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: '1rem',
                fontWeight: 500, textDecoration: 'none', backdropFilter: 'blur(8px)', transition: 'all 0.25s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
                <Layout size={18}/> 3D Planner
              </Link>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
              {[['500+','Products'],['2000+','Happy Customers'],['2+','Years of Trust'],['100%','Handcrafted']].map(([v, l]) => (
                <div key={l}>
                  <div style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: '#c9a96e', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Image dot indicators */}
        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 3 }}>
          {HERO_IMAGES.map((_, i) => (
            <button key={i} onClick={() => setHeroImg(i)} style={{
              width: heroImg === i ? 24 : 8, height: 8,
              borderRadius: 4, border: 'none', cursor: 'pointer',
              background: heroImg === i ? '#c9a96e' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s', padding: 0
            }}/>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 28, right: 40, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em' }}>
          <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.25)' }}/>
          SCROLL
        </div>
      </section>

      {/* ══════════════════════════════════════
          CATEGORIES — real images
      ══════════════════════════════════════ */}
      <section style={{ padding: '5rem 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2>Shop by Category</h2>
            <p style={{ color: 'var(--text-3)', marginTop: '0.5rem' }}>Explore our full range of handcrafted furniture</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '1rem' }}>
            {CATEGORY_DATA.map(c => (
              <Link key={c.name} to={`/products?category=${c.q}`} style={{ display: 'block', borderRadius: 14, overflow: 'hidden', textDecoration: 'none', position: 'relative', aspectRatio: '3/4', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(90,74,58,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                <img src={c.img} alt={c.name} loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { e.target.style.display = 'none'; e.target.parentNode.style.background = 'var(--bg-3)'; }}/>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,20,10,0.75) 0%, rgba(0,0,0,0.1) 60%)' }}/>
                <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, textAlign: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
                  {c.name}
                  <div style={{ fontSize: '0.65rem', fontWeight: 400, opacity: 0.8, marginTop: 2 }}>View all →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURED PRODUCTS
      ══════════════════════════════════════ */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-2)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2>Featured Products</h2>
              <p style={{ color: 'var(--text-3)', marginTop: '0.4rem' }}>Handpicked bestsellers from our showroom in Ilampillai</p>
            </div>
            <Link to="/products" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              View All Products <ArrowRight size={16}/>
            </Link>
          </div>
          {loading ? (
            <div className="loading-center"><div className="spinner"/></div>
          ) : (
            <div className="grid-4 fade-in">
              {featured.map(p => <ProductCard key={p._id} product={p}/>)}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════
          SHOWCASE BANNER — real room photo
      ══════════════════════════════════════ */}
      <section style={{ padding: '5rem 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', borderRadius: 20, overflow: 'hidden', background: 'var(--white)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)' }}>
            <div style={{ padding: '3rem' }}>
              <span style={{ display: 'inline-block', background: 'var(--accent-light)', color: 'var(--primary)', padding: '5px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>✨ AI-Powered Feature</span>
              <h2 style={{ marginBottom: '1rem' }}>Not Sure What Furniture to Buy?</h2>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.75, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                Tell us your room size, style preference and budget. Our AI Space Advisor will analyse your room dimensions, detect furniture fit, calculate space utilization and recommend the perfect pieces — all in seconds.
              </p>
              <ul style={{ listStyle: 'none', marginBottom: '1.75rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['✅ Furniture fit & overlap detection','✅ Space utilization score','✅ Movement comfort analysis','✅ Theme-based layout suggestions'].map(item => (
                  <li key={item} style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>{item}</li>
                ))}
              </ul>
              <Link to="/recommendation" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', background: 'var(--primary)', color: 'white', borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 600, textDecoration: 'none', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--primary-dark)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.transform = ''; }}>
                Try AI Advisor Free <ArrowRight size={18}/>
              </Link>
            </div>
            <div style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=700&q=80"
                alt="Beautiful furnished living room"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={e => { e.target.style.background = 'var(--bg-3)'; }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,0.1), transparent)' }}/>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          WHY CHOOSE US
      ══════════════════════════════════════ */}
      <section style={{ padding: '5rem 0', background: 'var(--primary-dark)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ color: '#c9a96e' }}>Why Choose Jothi Furniture?</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>Trusted by 2000+ families across Salem and Tamil Nadu</p>
          </div>
          <div className="grid-4">
            {[
              { icon: '🪵', title: 'Premium Wood', desc: 'Select teak, sheesham & engineered woods sourced from certified suppliers with strict quality checks.' },
              { icon: '🚚', title: 'Salem Delivery', desc: 'Fast and safe delivery across Salem, Namakkal, Erode and surrounding districts.' },
              { icon: '🛡️', title: 'Warranty', desc: 'Every product comes with manufacturer warranty and dedicated after-sales service support.' },
              { icon: '📞', title: '24/7 Support', desc: 'Our team is always ready to assist with queries, customization and home delivery arrangements.' },
            ].map((f, i) => (
              <div key={i} style={{ padding: '2rem', background: 'rgba(255,255,255,0.05)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(201,169,110,0.1)'; e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h4 style={{ fontFamily: 'var(--font-body)', color: '#c9a96e', marginBottom: '0.5rem', fontSize: '1rem' }}>{f.title}</h4>
                <p style={{ fontSize: '0.84rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section style={{ padding: '5rem 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2>What Our Customers Say</h2>
            <p style={{ color: 'var(--text-3)', marginTop: '0.5rem' }}>Real reviews from real customers across Tamil Nadu</p>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ padding: '1.75rem', background: 'var(--white)', borderRadius: 16, border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', gap: 3, marginBottom: '1rem', color: '#e6a817' }}>
                  {[...Array(t.rating)].map((_, s) => <Star key={s} size={16} fill="currentColor"/>)}
                </div>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.7, marginBottom: '1.25rem', fontSize: '0.9rem', fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>{t.city}, Tamil Nadu</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SPACE OPTIMIZER BANNER
      ══════════════════════════════════════ */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-2)' }}>
        <div className="container">
          <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', minHeight: 280 }}>
            <img src="https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?w=1200&q=80" alt="Room planning"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => e.target.style.display = 'none'}/>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(30,20,10,0.9) 0%, rgba(90,74,58,0.7) 60%, rgba(90,74,58,0.3) 100%)' }}/>
            <div style={{ position: 'relative', zIndex: 1, padding: '3rem', maxWidth: 580 }}>
              <span style={{ display: 'inline-block', background: 'rgba(201,169,110,0.2)', border: '1px solid rgba(201,169,110,0.4)', color: '#c9a96e', padding: '5px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem' }}>🆕 2D &amp; 3D Room Planner</span>
              <h2 style={{ color: 'white', marginBottom: '0.75rem' }}>Visualize Before You Buy</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: '1.5rem', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Drag and drop furniture into your room, rotate items, check dimensions and view in 3D — all before making a purchase decision.
              </p>
              <Link to="/space-optimizer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', background: '#c9a96e', color: '#2c1a0a', borderRadius: 10, fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#b8944f'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#c9a96e'; }}>
                Open Room Planner <ArrowRight size={18}/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SHOWROOM ADDRESS BANNER
      ══════════════════════════════════════ */}
      <section style={{ padding: '3rem 0', background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '2rem 2.5rem', background: 'var(--white)', borderRadius: 16, border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap' }}>
            <div style={{ width: 56, height: 56, background: 'var(--accent-light)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={26} style={{ color: 'var(--primary)' }}/>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>Visit Our Showroom</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', marginBottom: 2 }}>
                9/365 Elumathanoor, Edanganasalai Post, Sankari Taluk, Salem – 637502, Tamil Nadu
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>GST: 33MUBPS8703H1ZA · Mon–Sat: 9AM – 7PM</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', flexShrink: 0 }}>
              <Link to="/contact" className="btn btn-primary">Get Directions</Link>
              <Link to="/products" className="btn btn-outline">Browse Products</Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
