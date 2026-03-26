import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, getSubtotal, getShipping, getGrandTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({ name:user?.name||'', phone:user?.phone||'', street:'', city:'Salem', state:'Tamil Nadu', pincode:'', paymentMethod:'COD', notes:'' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    setPlacing(true);
    try {
      await axios.post('/api/orders', { items: items.map(i=>({product:i._id,quantity:i.quantity})), shippingAddress:{name:form.name,phone:form.phone,street:form.street,city:form.city,state:form.state,pincode:form.pincode}, paymentMethod:form.paymentMethod, notes:form.notes });
      clearCart(); toast.success('Order placed successfully!'); navigate('/orders');
    } catch (err) { toast.error(err.response?.data?.message||'Failed to place order'); } finally { setPlacing(false); }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 style={{marginBottom:'1.5rem'}}>Checkout</h1>
        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:'2rem',alignItems:'start'}}>
          <form onSubmit={handleSubmit}>
            <div className="card" style={{padding:'1.5rem',marginBottom:'1.5rem'}}>
              <h3 style={{marginBottom:'1.25rem'}}>Shipping Address</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
                <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required/></div>
                <div className="form-group"><label>Phone *</label><input value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} required/></div>
              </div>
              <div className="form-group"><label>Street Address *</label><input value={form.street} onChange={e=>setForm(p=>({...p,street:e.target.value}))} required placeholder="House/Flat no, Street, Area"/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'1rem'}}>
                <div className="form-group"><label>City *</label><input value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))} required/></div>
                <div className="form-group"><label>State</label><input value={form.state} onChange={e=>setForm(p=>({...p,state:e.target.value}))}/></div>
                <div className="form-group"><label>Pincode *</label><input value={form.pincode} onChange={e=>setForm(p=>({...p,pincode:e.target.value}))} required maxLength={6}/></div>
              </div>
            </div>
            <div className="card" style={{padding:'1.5rem',marginBottom:'1.5rem'}}>
              <h3 style={{marginBottom:'1rem'}}>Payment Method</h3>
              {['COD','UPI','Online'].map(m=>(
                <label key={m} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',cursor:'pointer',fontSize:'0.9rem',color:'#5a5047'}}>
                  <input type="radio" name="pm" value={m} checked={form.paymentMethod===m} onChange={()=>setForm(p=>({...p,paymentMethod:m}))} style={{accentColor:'#5a4a3a',width:16,height:16}}/>
                  {m==='COD'&&'💵 Cash on Delivery'}{m==='UPI'&&'📱 UPI (GPay, PhonePe)'}{m==='Online'&&'🏦 Net Banking / Card'}
                </label>
              ))}
            </div>
            <div className="form-group"><label>Special Instructions</label><textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Delivery notes..." rows={3}/></div>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={placing}>{placing?'Placing Order...':`Place Order • ₹${getGrandTotal().toLocaleString('en-IN')}`}</button>
          </form>
          <div className="card" style={{padding:'1.5rem'}}>
            <h3 style={{marginBottom:'1rem'}}>Order Summary</h3>
            <div style={{display:'flex',flexDirection:'column',gap:8,margin:'1rem 0'}}>
              {items.map(i=>(
                <div key={i._id} style={{display:'flex',alignItems:'center',gap:8,fontSize:'0.875rem'}}>
                  <span style={{flex:1,color:'#5a5047'}}>{i.name}</span>
                  <span style={{background:'#ede8e0',color:'#5a5047',padding:'1px 7px',borderRadius:10,fontSize:'0.78rem'}}>×{i.quantity}</span>
                  <span className="price">₹{(i.price*i.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <hr style={{border:'none',borderTop:'1px solid #ede8e0',margin:'1rem 0'}}/>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.9rem',color:'#5a5047',marginBottom:6}}><span>Subtotal</span><span>₹{getSubtotal().toLocaleString('en-IN')}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.9rem',color:'#5a5047',marginBottom:6}}><span>Shipping</span><span>{getShipping()===0?'Free':`₹${getShipping()}`}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontWeight:700,fontSize:'1.1rem',marginTop:'0.5rem'}}><span>Total</span><span>₹{getGrandTotal().toLocaleString('en-IN')}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
