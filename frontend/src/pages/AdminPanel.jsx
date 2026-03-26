import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BarChart2, Package, ShoppingBag, Users, MessageSquare, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';

const TABS = ['Dashboard', 'Products', 'Orders', 'Queries', 'Inventory'];
const STATUS_COLORS = { Pending:'warning', Confirmed:'info', Processing:'info', Shipped:'info', Delivered:'success', Cancelled:'error', New:'error', Read:'warning', Responded:'info', Closed:'success' };

export default function AdminPanel() {
  const [tab, setTab] = useState('Dashboard');
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [queries, setQueries] = useState([]);
  const [inventory, setInventory] = useState({ lowStock:[], outOfStock:[] });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editProd, setEditProd] = useState(null);
  const [pf, setPf] = useState({ name:'', price:'', originalPrice:'', category:'Sofa', description:'', material:'', color:'', stock:0, dl:100, dw:80, dh:75, featured:false });

  useEffect(() => { loadData(); }, [tab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'Dashboard') { const d = await axios.get('/api/admin/dashboard'); setStats(d.data.stats); setOrders(d.data.recentOrders||[]); }
      else if (tab === 'Products') { const d = await axios.get('/api/products?limit=50'); setProducts(d.data.products||[]); }
      else if (tab === 'Orders') { const d = await axios.get('/api/orders'); setOrders(d.data.orders||[]); }
      else if (tab === 'Queries') { const d = await axios.get('/api/contact'); setQueries(d.data.queries||[]); }
      else if (tab === 'Inventory') { const d = await axios.get('/api/admin/inventory'); setInventory(d.data); }
    } catch { toast.error('Load failed'); } finally { setLoading(false); }
  };

  const saveProd = async (e) => {
    e.preventDefault();
    try {
      const payload = { name:pf.name, price:+pf.price, originalPrice:pf.originalPrice?+pf.originalPrice:undefined, category:pf.category, description:pf.description, material:pf.material, color:pf.color, stock:+pf.stock, featured:pf.featured, dimensions:{length:+pf.dl,width:+pf.dw,height:+pf.dh} };
      if (editProd) await axios.put(`/api/products/${editProd._id}`, payload);
      else await axios.post('/api/products', payload);
      toast.success(editProd?'Product updated!':'Product created!'); setShowForm(false); setEditProd(null); loadData();
    } catch (err) { toast.error(err.response?.data?.message||'Failed'); }
  };

  const deleteProd = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await axios.delete(`/api/products/${id}`); toast.success('Deleted'); loadData(); } catch { toast.error('Failed'); }
  };

  const openEdit = (p) => {
    setEditProd(p);
    setPf({ name:p.name, price:p.price, originalPrice:p.originalPrice||'', category:p.category, description:p.description, material:p.material||'', color:p.color||'', stock:p.stock, dl:p.dimensions?.length||100, dw:p.dimensions?.width||80, dh:p.dimensions?.height||75, featured:p.featured||false });
    setShowForm(true);
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="flex-between" style={{marginBottom:'1rem'}}>
          <h1>Admin Panel</h1>
          <button className="btn btn-ghost btn-sm" onClick={loadData}><RefreshCw size={16}/> Refresh</button>
        </div>
        <div style={{display:'flex',gap:4,background:'#f5f1ed',padding:4,borderRadius:8,marginBottom:'1.5rem',overflowX:'auto'}}>
          {TABS.map(t=><button key={t} onClick={()=>setTab(t)} style={{padding:'8px 18px',border:'none',borderRadius:6,fontFamily:'var(--font-body)',fontSize:'0.85rem',fontWeight:500,cursor:'pointer',color: tab===t?'#5a4a3a':'#5a5047',background: tab===t?'#fff':'transparent',boxShadow: tab===t?'0 1px 3px rgba(90,74,58,0.1)':'none',whiteSpace:'nowrap'}}>{t}</button>)}
        </div>

        {loading ? <div className="loading-center"><div className="spinner"/></div> : (
          <>
            {tab === 'Dashboard' && (
              <div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'1rem',marginBottom:'1.5rem'}}>
                  {[{l:'Revenue',v:`₹${(stats.revenue||0).toLocaleString('en-IN')}`,i:<BarChart2 size={22}/>,c:'#5a4a3a'},{l:'Products',v:stats.totalProducts||0,i:<Package size={22}/>,c:'#8b6f47'},{l:'Orders',v:stats.totalOrders||0,i:<ShoppingBag size={22}/>,c:'#c9a96e'},{l:'Customers',v:stats.totalUsers||0,i:<Users size={22}/>,c:'#4a7c59'},{l:'New Queries',v:stats.newQueries||0,i:<MessageSquare size={22}/>,c:'#e67e22'}].map((s,i)=>(
                    <div key={i} className="card" style={{display:'flex',alignItems:'center',gap:'1rem',padding:'1.25rem'}}>
                      <div style={{width:48,height:48,borderRadius:'12px',background:s.c+'20',color:s.c,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{s.i}</div>
                      <div><p style={{fontFamily:'var(--font-display)',fontSize:'1.4rem',fontWeight:700,color:'#5a4a3a'}}>{s.v}</p><p style={{fontSize:'0.78rem',color:'#9a8c7d'}}>{s.l}</p></div>
                    </div>
                  ))}
                </div>
                <h3 style={{margin:'1.5rem 0 1rem'}}>Recent Orders</h3>
                <div className="card table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>
                  {orders.slice(0,5).map(o=><tr key={o._id}><td>#{o._id.slice(-6).toUpperCase()}</td><td>{o.user?.name}</td><td>₹{o.total?.toLocaleString('en-IN')}</td><td><span className={`badge badge-${STATUS_COLORS[o.status]||'primary'}`}>{o.status}</span></td><td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td></tr>)}
                </tbody></table></div>
              </div>
            )}

            {tab === 'Products' && (
              <div>
                <div className="flex-between" style={{marginBottom:'1rem'}}>
                  <h3>Products ({products.length})</h3>
                  <button className="btn btn-primary btn-sm" onClick={()=>{setEditProd(null);setPf({name:'',price:'',originalPrice:'',category:'Sofa',description:'',material:'',color:'',stock:0,dl:100,dw:80,dh:75,featured:false});setShowForm(true);}}><Plus size={16}/> Add Product</button>
                </div>
                {showForm && (
                  <div className="card" style={{padding:'1.5rem',marginBottom:'1.5rem'}}>
                    <h4 style={{marginBottom:'1.25rem',fontFamily:'var(--font-body)'}}>{editProd?'Edit':'Add'} Product</h4>
                    <form onSubmit={saveProd}>
                      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'1rem',marginBottom:'1rem'}}>
                        <div className="form-group"><label>Name *</label><input value={pf.name} onChange={e=>setPf(p=>({...p,name:e.target.value}))} required/></div>
                        <div className="form-group"><label>Category</label><select value={pf.category} onChange={e=>setPf(p=>({...p,category:e.target.value}))}>{['Sofa','Chair','Table','Bed','Wardrobe','Shelf','Desk','Cabinet','Dining','Outdoor','Industrial','Other'].map(c=><option key={c}>{c}</option>)}</select></div>
                        <div className="form-group"><label>Price (₹) *</label><input type="number" value={pf.price} onChange={e=>setPf(p=>({...p,price:e.target.value}))} required/></div>
                        <div className="form-group"><label>Original Price</label><input type="number" value={pf.originalPrice} onChange={e=>setPf(p=>({...p,originalPrice:e.target.value}))}/></div>
                        <div className="form-group"><label>Stock</label><input type="number" value={pf.stock} onChange={e=>setPf(p=>({...p,stock:e.target.value}))}/></div>
                        <div className="form-group"><label>Material</label><input value={pf.material} onChange={e=>setPf(p=>({...p,material:e.target.value}))}/></div>
                        <div className="form-group"><label>Length (cm)</label><input type="number" value={pf.dl} onChange={e=>setPf(p=>({...p,dl:e.target.value}))}/></div>
                        <div className="form-group"><label>Width (cm)</label><input type="number" value={pf.dw} onChange={e=>setPf(p=>({...p,dw:e.target.value}))}/></div>
                        <div className="form-group"><label>Height (cm)</label><input type="number" value={pf.dh} onChange={e=>setPf(p=>({...p,dh:e.target.value}))}/></div>
                      </div>
                      <div className="form-group"><label>Description *</label><textarea value={pf.description} onChange={e=>setPf(p=>({...p,description:e.target.value}))} required rows={3}/></div>
                      <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:'1rem',cursor:'pointer',fontSize:'0.875rem'}}><input type="checkbox" checked={pf.featured} onChange={e=>setPf(p=>({...p,featured:e.target.checked}))} style={{accentColor:'#5a4a3a'}}/><span>Featured Product</span></label>
                      <div style={{display:'flex',gap:'0.75rem'}}>
                        <button type="submit" className="btn btn-primary">{editProd?'Update':'Create'} Product</button>
                        <button type="button" className="btn btn-ghost" onClick={()=>setShowForm(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}
                <div className="card table-wrap"><table><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th></tr></thead><tbody>
                  {products.map(p=><tr key={p._id}><td style={{fontWeight:500}}>{p.name}</td><td><span className="badge badge-primary">{p.category}</span></td><td>₹{p.price.toLocaleString('en-IN')}</td><td><span className={`badge badge-${p.stock===0?'error':p.stock<5?'warning':'success'}`}>{p.stock}</span></td><td>{p.averageRating>0?`⭐ ${p.averageRating}`:'—'}</td><td><div style={{display:'flex',gap:6}}><button className="btn btn-ghost btn-sm" onClick={()=>openEdit(p)}><Edit size={14}/></button><button className="btn btn-danger btn-sm" onClick={()=>deleteProd(p._id)}><Trash2 size={14}/></button></div></td></tr>)}
                </tbody></table></div>
              </div>
            )}

            {tab === 'Orders' && (
              <div>
                <h3 style={{marginBottom:'1rem'}}>All Orders ({orders.length})</h3>
                <div className="card table-wrap"><table><thead><tr><th>ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Update</th><th>Date</th></tr></thead><tbody>
                  {orders.map(o=><tr key={o._id}><td>#{o._id.slice(-6).toUpperCase()}</td><td>{o.user?.name}</td><td>{o.items?.length}</td><td>₹{o.total?.toLocaleString('en-IN')}</td><td><span className={`badge badge-${o.paymentStatus==='Paid'?'success':'warning'}`}>{o.paymentStatus}</span></td><td><span className={`badge badge-${STATUS_COLORS[o.status]||'primary'}`}>{o.status}</span></td><td><select value={o.status} onChange={e=>axios.put(`/api/orders/${o._id}/status`,{status:e.target.value}).then(loadData)} style={{fontSize:'0.78rem',padding:'4px 8px',border:'1px solid #ddd5c8',borderRadius:6}}>{['Pending','Confirmed','Processing','Shipped','Delivered','Cancelled'].map(s=><option key={s}>{s}</option>)}</select></td><td>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td></tr>)}
                </tbody></table></div>
              </div>
            )}

            {tab === 'Queries' && (
              <div>
                <h3 style={{marginBottom:'1rem'}}>Contact Queries ({queries.length})</h3>
                <div className="card table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Status</th><th>Update</th><th>Date</th></tr></thead><tbody>
                  {queries.map(q=><tr key={q._id}><td>{q.name}</td><td>{q.email}</td><td>{q.subject||'—'}</td><td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{q.message}</td><td><span className={`badge badge-${STATUS_COLORS[q.status]||'primary'}`}>{q.status}</span></td><td><select value={q.status} onChange={e=>axios.put(`/api/contact/${q._id}`,{status:e.target.value}).then(loadData)} style={{fontSize:'0.78rem',padding:'4px 8px',border:'1px solid #ddd5c8',borderRadius:6}}>{['New','Read','Responded','Closed'].map(s=><option key={s}>{s}</option>)}</select></td><td>{new Date(q.createdAt).toLocaleDateString('en-IN')}</td></tr>)}
                </tbody></table></div>
              </div>
            )}

            {tab === 'Inventory' && (
              <div className="grid-2">
                <div>
                  <h3 style={{marginBottom:'1rem'}}>🔴 Out of Stock ({inventory.outOfStock?.length||0})</h3>
                  <div className="card table-wrap"><table><thead><tr><th>Product</th><th>Category</th></tr></thead><tbody>
                    {(inventory.outOfStock||[]).map(p=><tr key={p._id}><td>{p.name}</td><td><span className="badge badge-error">{p.category}</span></td></tr>)}
                  </tbody></table></div>
                </div>
                <div>
                  <h3 style={{marginBottom:'1rem'}}>⚠️ Low Stock ({inventory.lowStock?.length||0})</h3>
                  <div className="card table-wrap"><table><thead><tr><th>Product</th><th>Stock</th><th>Category</th></tr></thead><tbody>
                    {(inventory.lowStock||[]).map(p=><tr key={p._id}><td>{p.name}</td><td><span className="badge badge-warning">{p.stock}</span></td><td>{p.category}</td></tr>)}
                  </tbody></table></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
