import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import axios from '../utils/axiosConfig.js';
import ProductCard from '../components/ProductCard';

const CATS = ['All','Sofa','Chair','Table','Bed','Wardrobe','Shelf','Desk','Cabinet','Dining','Outdoor','Industrial','Other'];

export default function Products() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ search:'', category: searchParams.get('category')||'All', minPrice:'', maxPrice:'', sort:'', page:1 });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { fetchProducts(); }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filters.search) p.set('search', filters.search);
      if (filters.category && filters.category !== 'All') p.set('category', filters.category);
      if (filters.minPrice) p.set('minPrice', filters.minPrice);
      if (filters.maxPrice) p.set('maxPrice', filters.maxPrice);
      if (filters.sort) p.set('sort', filters.sort);
      p.set('page', filters.page); p.set('limit', 12);
      const { data } = await axios.get(`/api/products?${p}`);
      setProducts(data.products||[]); setTotal(data.total||0); setPages(data.pages||1);
    } catch(e){console.error(e);} finally{setLoading(false);}
  };

  const set = (k,v) => setFilters(p=>({...p,[k]:v,page:1}));
  const clear = () => setFilters({search:'',category:'All',minPrice:'',maxPrice:'',sort:'',page:1});

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="flex-between" style={{marginBottom:'1.5rem'}}>
          <div><h1>Our Products</h1><p style={{color:'var(--text-3)',fontSize:'0.9rem'}}>{total} products found</p></div>
          <button className="btn btn-outline btn-sm" onClick={()=>setShowFilters(!showFilters)}><SlidersHorizontal size={16}/> Filters</button>
        </div>

        <div style={{display:'flex',gap:'1rem',marginBottom:'1rem',alignItems:'center',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:200,display:'flex',alignItems:'center',gap:10,background:'#fff',border:'1.5px solid #ddd5c8',borderRadius:'8px',padding:'8px 14px',color:'#9a8c7d'}}>
            <Search size={18}/>
            <input value={filters.search} onChange={e=>set('search',e.target.value)} placeholder="Search furniture..." style={{flex:1,border:'none',outline:'none',fontFamily:'var(--font-body)',fontSize:'0.9rem',background:'transparent',color:'#2c2416'}}/>
            {filters.search && <button onClick={()=>set('search','')} style={{background:'none',border:'none',cursor:'pointer',display:'flex'}}><X size={16}/></button>}
          </div>
          <select value={filters.sort} onChange={e=>set('sort',e.target.value)} style={{padding:'9px 14px',border:'1.5px solid #ddd5c8',borderRadius:'8px',fontFamily:'var(--font-body)',fontSize:'0.85rem',background:'#fff',color:'#2c2416',outline:'none'}}>
            <option value="">Latest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'1.25rem'}}>
          {CATS.map(c => (
            <button key={c} onClick={()=>set('category',c)} style={{padding:'6px 16px',borderRadius:'20px',border:`1.5px solid ${filters.category===c?'#5a4a3a':'#ddd5c8'}`,background: filters.category===c?'#5a4a3a':'#fff',color: filters.category===c?'white':'#5a5047',fontSize:'0.82rem',fontFamily:'var(--font-body)',cursor:'pointer',transition:'all 0.25s'}}>{c}</button>
          ))}
        </div>

        {showFilters && (
          <div style={{display:'flex',gap:'1rem',alignItems:'flex-end',padding:'1.25rem',background:'#f5f1ed',borderRadius:'8px',marginBottom:'1rem',flexWrap:'wrap'}}>
            <div><label style={{display:'block',fontSize:'0.8rem',fontWeight:500,color:'#5a5047',marginBottom:4}}>Min Price (₹)</label><input type="number" value={filters.minPrice} onChange={e=>set('minPrice',e.target.value)} placeholder="0" style={{padding:'8px 12px',border:'1.5px solid #ddd5c8',borderRadius:'8px',fontSize:'0.875rem',outline:'none',fontFamily:'var(--font-body)',width:140}}/></div>
            <div><label style={{display:'block',fontSize:'0.8rem',fontWeight:500,color:'#5a5047',marginBottom:4}}>Max Price (₹)</label><input type="number" value={filters.maxPrice} onChange={e=>set('maxPrice',e.target.value)} placeholder="100000" style={{padding:'8px 12px',border:'1.5px solid #ddd5c8',borderRadius:'8px',fontSize:'0.875rem',outline:'none',fontFamily:'var(--font-body)',width:140}}/></div>
            <button className="btn btn-ghost btn-sm" onClick={clear}>Clear All</button>
          </div>
        )}

        {loading ? <div className="loading-center"><div className="spinner"/><p>Loading...</p></div> :
          products.length === 0 ? (
            <div className="empty-state"><p style={{fontSize:'3rem'}}>🪑</p><h3>No products found</h3><p>Try adjusting your filters</p><button className="btn btn-outline" onClick={clear} style={{marginTop:'1rem'}}>Clear Filters</button></div>
          ) : (
            <div className="grid-4 fade-in" style={{marginTop:'1.5rem'}}>{products.map(p=><ProductCard key={p._id} product={p}/>)}</div>
          )
        }

        {pages > 1 && (
          <div style={{display:'flex',justifyContent:'center',gap:'8px',marginTop:'2.5rem'}}>
            {Array.from({length:pages},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setFilters(f=>({...f,page:p}))} style={{width:40,height:40,borderRadius:'8px',border:`1.5px solid ${filters.page===p?'transparent':'#ddd5c8'}`,background: filters.page===p?'#5a4a3a':'#fff',color: filters.page===p?'white':'#5a5047',fontFamily:'var(--font-body)',cursor:'pointer',fontSize:'0.875rem'}}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
