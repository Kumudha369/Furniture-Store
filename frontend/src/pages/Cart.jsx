import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, removeItem, updateQuantity, getSubtotal, getShipping, getGrandTotal } = useCartStore();

  if (items.length === 0) return (
    <div className="page-wrapper container">
      <div className="empty-state"><ShoppingBag size={64} style={{margin:'0 auto 1rem',opacity:0.3,display:'block'}}/><h2>Your cart is empty</h2><p>Add some furniture to get started!</p><Link to="/products" className="btn btn-primary btn-lg" style={{marginTop:'1.5rem'}}>Browse Products</Link></div>
    </div>
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 style={{marginBottom:'1.5rem'}}>Shopping Cart</h1>
        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:'2rem'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            {items.map(item => (
              <div key={item._id} className="card" style={{display:'flex',alignItems:'center',gap:'1rem',padding:'1rem 1.25rem'}}>
                <div style={{width:64,height:64,background:'#ede8e0',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',flexShrink:0}}>🪑</div>
                <div style={{flex:1}}>
                  <span style={{fontSize:'0.72rem',textTransform:'uppercase',letterSpacing:'0.08em',color:'#8b6f47',fontWeight:600}}>{item.category}</span>
                  <h4 style={{fontFamily:'var(--font-body)',fontSize:'0.9rem',fontWeight:600,margin:'2px 0 4px'}}><Link to={`/products/${item._id}`} style={{color:'#2c2416'}}>{item.name}</Link></h4>
                  <span className="price">₹{item.price.toLocaleString('en-IN')}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',border:'1.5px solid #ddd5c8',borderRadius:8,overflow:'hidden',flexShrink:0}}>
                  <button onClick={()=>updateQuantity(item._id,item.quantity-1)} style={{width:30,height:34,border:'none',background:'#f5f1ed',cursor:'pointer',fontSize:'1rem',color:'#5a4a3a'}}>−</button>
                  <span style={{width:36,textAlign:'center',fontSize:'0.875rem',fontWeight:600}}>{item.quantity}</span>
                  <button onClick={()=>updateQuantity(item._id,item.quantity+1)} style={{width:30,height:34,border:'none',background:'#f5f1ed',cursor:'pointer',fontSize:'1rem',color:'#5a4a3a'}}>+</button>
                </div>
                <div className="price" style={{fontWeight:600,minWidth:90,textAlign:'right',flexShrink:0}}>₹{(item.price*item.quantity).toLocaleString('en-IN')}</div>
                <button onClick={()=>{removeItem(item._id);toast.success('Item removed');}} style={{background:'none',border:'none',cursor:'pointer',color:'#9a8c7d',padding:4,transition:'color 0.25s'}} onMouseEnter={e=>e.currentTarget.style.color='#c0392b'} onMouseLeave={e=>e.currentTarget.style.color='#9a8c7d'}><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
          <div className="card" style={{padding:'1.5rem',height:'fit-content',position:'sticky',top:90}}>
            <h3 style={{marginBottom:'1.25rem'}}>Order Summary</h3>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.9rem',color:'#5a5047',marginBottom:'0.75rem'}}><span>Subtotal ({items.reduce((s,i)=>s+i.quantity,0)} items)</span><span>₹{getSubtotal().toLocaleString('en-IN')}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.9rem',color:'#5a5047',marginBottom:'0.75rem'}}><span>Shipping</span><span style={{color: getShipping()===0?'#4a7c59':'inherit'}}>{getShipping()===0?'Free':`₹${getShipping()}`}</span></div>
            {getShipping()>0 && <p style={{fontSize:'0.78rem',color:'#4a7c59',marginBottom:'0.75rem'}}>Add ₹{(10000-getSubtotal()).toLocaleString('en-IN')} more for free shipping</p>}
            <hr style={{border:'none',borderTop:'1px solid #ede8e0',margin:'1rem 0'}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:'1.1rem',marginBottom:'1.25rem'}}><span>Total</span><span>₹{getGrandTotal().toLocaleString('en-IN')}</span></div>
            <Link to="/checkout" className="btn btn-primary btn-block btn-lg">Proceed to Checkout <ArrowRight size={18}/></Link>
            <Link to="/products" className="btn btn-ghost btn-block" style={{marginTop:'0.5rem'}}>Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
