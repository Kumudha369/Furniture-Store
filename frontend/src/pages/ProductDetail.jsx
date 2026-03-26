import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft, Package, Ruler, Heart, Share2, CheckCircle } from 'lucide-react';
import axios from '../utils/axiosConfig.js';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const CATEGORY_IMAGES = {
  Sofa:       'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80',
  Chair:      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=700&q=80',
  Table:      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=700&q=80',
  Bed:        'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=700&q=80',
  Wardrobe:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
  Shelf:      'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=700&q=80',
  Desk:       'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=700&q=80',
  Cabinet:    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80',
  Dining:     'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=700&q=80',
  Outdoor:    'https://images.unsplash.com/photo-1600210491892-03d54079b6ac?w=700&q=80',
  Industrial: 'https://images.unsplash.com/photo-1572373672978-0b9b74d05fba?w=700&q=80',
  Other:      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=700&q=80',
};

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [rf, setRf] = useState({ rating: 5, comment: '' });
  const [sub, setSub] = useState(false);
  const [added, setAdded] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const { addItem } = useCartStore();
  const { isLoggedIn } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`/api/products/${id}`),
      axios.get(`/api/reviews/${id}`)
    ])
      .then(([pr, rr]) => {
        setProduct(pr.data.product);
        setReviews(rr.data.reviews || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    addItem(product, qty);
    setAdded(true);
    toast.success(`${qty} × ${product.name} added to cart!`);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) { toast.error('Please login to write a review'); return; }
    setSub(true);
    try {
      const { data } = await axios.post(`/api/reviews/${id}`, rf);
      setReviews(prev => [data.review, ...prev]);
      setRf({ rating: 5, comment: '' });
      toast.success('Review added successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    } finally { setSub(false); }
  };

  if (loading) return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="spinner"/>
    </div>
  );

  if (!product) return (
    <div className="container page-wrapper">
      <h2>Product not found</h2>
      <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Products</Link>
    </div>
  );

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  const imageUrl = (!imgErr && product.images?.length > 0)
    ? product.images[0]
    : (CATEGORY_IMAGES[product.category] || CATEGORY_IMAGES.Other);

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="sep">/</span>
          <Link to="/products">Products</Link>
          <span className="sep">/</span>
          <Link to={`/products?category=${product.category}`}>{product.category}</Link>
          <span className="sep">/</span>
          <span style={{ color: 'var(--text-2)' }}>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>

          {/* ── LEFT: Image ── */}
          <div>
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              background: '#f0ebe2', position: 'relative',
              aspectRatio: '1', boxShadow: 'var(--shadow-md)'
            }}>
              <img
                src={imageUrl}
                alt={product.name}
                onError={() => setImgErr(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {discount > 0 && (
                <span style={{
                  position: 'absolute', top: 16, left: 16,
                  background: '#c0392b', color: 'white',
                  padding: '5px 12px', borderRadius: 7,
                  fontSize: '0.82rem', fontWeight: 700
                }}>{discount}% OFF</span>
              )}
              {product.featured && (
                <span style={{
                  position: 'absolute', bottom: 14, left: 14,
                  background: 'rgba(201,169,110,0.92)', color: '#2c1a0a',
                  padding: '4px 12px', borderRadius: 20,
                  fontSize: '0.7rem', fontWeight: 700
                }}>★ FEATURED</span>
              )}
            </div>
          </div>

          {/* ── RIGHT: Info ── */}
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary-light)', fontWeight: 700 }}>
              {product.category}
            </span>
            <h1 style={{ margin: '8px 0 14px', fontSize: 'clamp(1.5rem,3vw,2.1rem)' }}>{product.name}</h1>

            {/* Rating */}
            {product.averageRating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: 2, color: '#e6a817' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={17} fill={i < Math.round(product.averageRating) ? 'currentColor' : 'none'} color={i < Math.round(product.averageRating) ? '#e6a817' : '#ddd'}/>
                  ))}
                </div>
                <span style={{ fontWeight: 600, color: 'var(--text-2)' }}>{product.averageRating}</span>
                <span style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: 'var(--text-3)' }}>
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && (
                <span style={{ fontSize: '0.9rem', color: '#27ae60', fontWeight: 600 }}>
                  You save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <p style={{ color: 'var(--text-2)', fontSize: '0.92rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>
              {product.description}
            </p>

            {/* Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {[
                product.material && ['Material', product.material, '🪵'],
                product.color    && ['Colour',   product.color,    '🎨'],
                product.dimensions && ['Dimensions (cm)', `${product.dimensions.length}L × ${product.dimensions.width}W × ${product.dimensions.height}H`, '📐'],
                ['Stock', product.stock > 0 ? `${product.stock} available` : 'Out of Stock', '📦'],
              ].filter(Boolean).map(([label, value, icon]) => (
                <div key={label} style={{ padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 10 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-3)', marginBottom: 3 }}>{icon} {label}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: label === 'Stock' ? (product.stock > 0 ? '#27ae60' : '#c0392b') : 'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Quantity + Add to Cart */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--border)', borderRadius: 9, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 44, border: 'none', background: 'var(--bg-2)', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>−</button>
                <span style={{ padding: '0 18px', fontWeight: 700, fontSize: '1rem' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: 40, height: 44, border: 'none', background: 'var(--bg-2)', fontSize: '1.3rem', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}>+</button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{
                  flex: 1, padding: '12px 20px',
                  background: added ? '#27ae60' : (product.stock === 0 ? '#b0a090' : '#5a4a3a'),
                  color: 'white', border: 'none', borderRadius: 10,
                  fontFamily: 'var(--font-body)', fontSize: '0.95rem', fontWeight: 600,
                  cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.25s'
                }}
              >
                {added ? <><CheckCircle size={18}/> Added to Cart!</> : <><ShoppingCart size={18}/> Add to Cart</>}
              </button>

              <button
                onClick={() => { setWishlist(w => !w); toast.success(wishlist ? 'Removed from wishlist' : 'Added to wishlist!'); }}
                style={{ width: 46, height: 46, borderRadius: 10, border: '1.5px solid var(--border)', background: wishlist ? '#fdeaea' : 'var(--white)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
              >
                <Heart size={20} fill={wishlist ? '#c0392b' : 'none'} color={wishlist ? '#c0392b' : 'var(--text-3)'}/>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/space-optimizer" className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                📐 Plan in Room
              </Link>
              <Link to="/recommendation" className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                ✨ AI Advisor
              </Link>
            </div>

            {/* Store info */}
            <div style={{ marginTop: '1.5rem', padding: '12px 16px', background: 'var(--accent-light)', borderRadius: 10, fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <span>🏪</span>
              <span><strong>Jothi Industrial And Furniture</strong> · Ilampillai, Salem · GST: 33MUBPS8703H1ZA</span>
            </div>
          </div>
        </div>

        {/* ── REVIEWS ── */}
        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '2.5rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Customer Reviews</h2>

          {/* Write review form */}
          {isLoggedIn() ? (
            <form onSubmit={handleReview} className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h4 style={{ fontFamily: 'var(--font-body)', marginBottom: '1rem' }}>Write a Review</h4>
              <div style={{ display: 'flex', gap: 6, marginBottom: '1rem' }}>
                {[1,2,3,4,5].map(r => (
                  <button type="button" key={r} onClick={() => setRf(p => ({...p, rating: r}))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    <Star size={26} fill={r <= rf.rating ? '#e6a817' : 'none'} color={r <= rf.rating ? '#e6a817' : '#ccc'}/>
                  </button>
                ))}
              </div>
              <div className="form-group">
                <textarea value={rf.comment} onChange={e => setRf(p => ({...p, comment: e.target.value}))} placeholder="Share your experience with this product..." required rows={3}/>
              </div>
              <button type="submit" className="btn btn-primary" disabled={sub}>
                {sub ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div style={{ padding: '1.25rem', background: 'var(--bg-2)', borderRadius: 10, marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-2)' }}>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Login</Link> to write a review for this product.
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div style={{ padding: '2rem 0', color: 'var(--text-3)', fontSize: '0.9rem' }}>
              No reviews yet. Be the first to review this product!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map(r => (
                <div key={r._id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                      {r.user?.name?.[0] || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.user?.name}</div>
                      <div style={{ display: 'flex', gap: 2, color: '#e6a817', marginTop: 2 }}>
                        {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < r.rating ? 'currentColor' : 'none'} color={i < r.rating ? '#e6a817' : '#ddd'}/>)}
                      </div>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-3)' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.65 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media(max-width:768px) {
          .detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
