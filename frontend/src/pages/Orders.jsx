import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/axiosConfig.js';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';
import './Orders.css';

const STATUS_STEPS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    axios.get('/api/orders/my')
      .then(r => setOrders(r.data.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusColor = { Pending: 'warning', Confirmed: 'info', Processing: 'info', Shipped: 'info', Delivered: 'success', Cancelled: 'error' };

  if (loading) return <div className="loading-center" style={{minHeight:'60vh'}}><div className="spinner" /></div>;

  if (orders.length === 0) {
    return (
      <div className="page-wrapper container">
        <div className="empty-state">
          <Package size={64} style={{margin:'0 auto 1rem',opacity:0.3,display:'block'}} />
          <h2>No orders yet</h2>
          <p>Start shopping to see your orders here</p>
          <Link to="/products" className="btn btn-primary btn-lg" style={{marginTop:'1.5rem'}}>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page page-wrapper">
      <div className="container">
        <h1>My Orders</h1>
        <div className="orders-list">
          {orders.map(order => (
            <div key={order._id} className="order-card card">
              <div className="order-header" onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                <div className="order-id">
                  <strong>Order #{order._id.slice(-8).toUpperCase()}</strong>
                  <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                </div>
                <div className="order-meta">
                  <span className={`badge badge-${statusColor[order.status] || 'primary'}`}>{order.status}</span>
                  <strong className="price">&#8377;{order.total.toLocaleString('en-IN')}</strong>
                  {expanded === order._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>

              {expanded === order._id && (
                <div className="order-body">
                  {order.status !== 'Cancelled' && (
                    <div className="status-tracker">
                      {STATUS_STEPS.map((step, i) => {
                        const currentIdx = STATUS_STEPS.indexOf(order.status);
                        const done = i <= currentIdx;
                        return (
                          <React.Fragment key={step}>
                            <div className={`status-step ${done ? 'done' : ''}`}>
                              <div className="step-dot">{done ? '✓' : i + 1}</div>
                              <span>{step}</span>
                            </div>
                            {i < STATUS_STEPS.length - 1 && <div className={`step-line ${i < currentIdx ? 'done' : ''}`} />}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}

                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <span className="order-item-emoji">🪑</span>
                        <div style={{flex:1}}>
                          <p style={{fontWeight:600,fontSize:'0.9rem'}}>{item.name}</p>
                          <p style={{fontSize:'0.78rem',color:'var(--text-3)'}}>Qty: {item.quantity} × &#8377;{item.price.toLocaleString('en-IN')}</p>
                        </div>
                        <span className="price">&#8377;{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary">
                    <div className="sum-row"><span>Subtotal</span><span>&#8377;{(order.subtotal||0).toLocaleString('en-IN')}</span></div>
                    <div className="sum-row"><span>Shipping</span><span>{order.shippingCost === 0 ? 'Free' : `₹${order.shippingCost}`}</span></div>
                    <div className="sum-row total-row"><span>Total</span><strong>&#8377;{order.total.toLocaleString('en-IN')}</strong></div>
                  </div>

                  {order.shippingAddress && (
                    <div className="shipping-info">
                      <p style={{fontWeight:600,fontSize:'0.85rem',marginBottom:'4px'}}>Shipping Address</p>
                      <p style={{fontSize:'0.82rem',color:'var(--text-2)'}}>
                        {order.shippingAddress.name}, {order.shippingAddress.phone}<br/>
                        {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
