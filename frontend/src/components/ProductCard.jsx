import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import useCartStore from '../store/cartStore';
import toast from 'react-hot-toast';

// Real fallback images per category when product has no image
const CATEGORY_IMAGES = {
  Sofa:       'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=75',
  Chair:      'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&q=75',
  Table:      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=500&q=75',
  Bed:        'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=500&q=75',
  Wardrobe:   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=75',
  Shelf:      'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=500&q=75',
  Desk:       'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&q=75',
  Cabinet:    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=75',
  Dining:     'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&q=75',
  Outdoor:    'https://images.unsplash.com/photo-1600210491892-03d54079b6ac?w=500&q=75',
  Industrial: 'https://images.unsplash.com/photo-1572373672978-0b9b74d05fba?w=500&q=75',
  Other:      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&q=75',
};

export default function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(w => !w);
    toast.success(wishlist ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Get the best image: product image → category fallback
  const productImg = (!imgError && product.images && product.images.length > 0)
    ? product.images[0]
    : null;
  const fallbackImg = CATEGORY_IMAGES[product.category] || CATEGORY_IMAGES.Other;
  const imageUrl = productImg || fallbackImg;

  return (
    <Link
      to={`/products/${product._id}`}
      style={{
        display: 'block',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #ede8e0',
        overflow: 'hidden',
        transition: 'transform 0.28s ease, box-shadow 0.28s ease',
        textDecoration: 'none',
        color: '#2c2416',
        position: 'relative'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 16px 48px rgba(90,74,58,0.18)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      {/* ── Product Image ── */}
      <div style={{
        position: 'relative',
        aspectRatio: '4/3',
        overflow: 'hidden',
        background: '#f0ebe2'
      }}>
        {/* Loading skeleton */}
        {!imgLoaded && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, #f0ebe2 25%, #e8e0d5 50%, #f0ebe2 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}/>
        )}

        {/* Real image */}
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={() => { setImgError(true); setImgLoaded(true); }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease',
            opacity: imgLoaded ? 1 : 0
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />

        {/* Badges */}
        {discount > 0 && (
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: '#c0392b', color: 'white',
            fontSize: '0.72rem', fontWeight: 700,
            padding: '4px 10px', borderRadius: 6
          }}>
            {discount}% OFF
          </span>
        )}

        {product.stock === 0 && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(0,0,0,0.65)', color: 'white',
            fontSize: '0.72rem', padding: '4px 10px', borderRadius: 6
          }}>
            Out of Stock
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fff'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.92)'}
        >
          <Heart
            size={16}
            fill={wishlist ? '#c0392b' : 'none'}
            color={wishlist ? '#c0392b' : '#9a8c7d'}
          />
        </button>

        {/* Featured badge */}
        {product.featured && (
          <span style={{
            position: 'absolute', bottom: 10, left: 10,
            background: 'rgba(201,169,110,0.92)', color: '#2c1a0a',
            fontSize: '0.65rem', fontWeight: 700,
            padding: '3px 9px', borderRadius: 20, letterSpacing: '0.06em'
          }}>
            ★ FEATURED
          </span>
        )}
      </div>

      {/* ── Product Info ── */}
      <div style={{ padding: '1rem' }}>
        {/* Category */}
        <span style={{
          fontSize: '0.68rem', textTransform: 'uppercase',
          letterSpacing: '0.09em', color: '#8b6f47', fontWeight: 700
        }}>
          {product.category}
        </span>

        {/* Name */}
        <h3 style={{
          fontFamily: 'var(--font-body)', fontSize: '0.9rem',
          fontWeight: 600, color: '#2c2416',
          margin: '5px 0 7px', lineHeight: 1.4,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'
        }}>
          {product.name}
        </h3>

        {/* Material */}
        {product.material && (
          <p style={{ fontSize: '0.73rem', color: '#9a8c7d', marginBottom: 6 }}>
            {product.material}
          </p>
        )}

        {/* Rating */}
        {product.averageRating > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 4, color: '#e6a817',
            fontSize: '0.78rem', marginBottom: 8
          }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i} size={11}
                fill={i < Math.round(product.averageRating) ? 'currentColor' : 'none'}
                color={i < Math.round(product.averageRating) ? '#e6a817' : '#ddd'}
              />
            ))}
            <span style={{ color: '#5a5047', marginLeft: 2 }}>{product.averageRating}</span>
            <span style={{ color: '#9a8c7d' }}>({product.reviewCount})</span>
          </div>
        )}

        {/* Dimensions */}
        {product.dimensions && (
          <p style={{ fontSize: '0.7rem', color: '#b0a090', marginBottom: 8 }}>
            📐 {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
          </p>
        )}

        {/* Price */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: '#5a4a3a' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && (
            <span style={{ fontSize: '0.82rem', textDecoration: 'line-through', color: '#9a8c7d' }}>
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
          {discount > 0 && (
            <span style={{ fontSize: '0.75rem', color: '#27ae60', fontWeight: 600 }}>
              Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          style={{
            width: '100%', padding: '9px 0',
            background: product.stock === 0 ? '#b0a090' : '#5a4a3a',
            color: 'white', border: 'none',
            borderRadius: 9,
            fontFamily: 'var(--font-body)', fontSize: '0.84rem',
            fontWeight: 600, cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            transition: 'all 0.25s',
            letterSpacing: '0.02em'
          }}
          onMouseEnter={e => { if (product.stock > 0) e.currentTarget.style.background = '#3d3028'; }}
          onMouseLeave={e => { if (product.stock > 0) e.currentTarget.style.background = '#5a4a3a'; }}
        >
          <ShoppingCart size={15}/>
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </Link>
  );
}
