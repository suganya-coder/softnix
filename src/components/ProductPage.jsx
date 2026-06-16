import { useState, useMemo, useEffect } from 'react';
import { Star, Check, ChevronDown, ChevronUp, Heart, ShieldCheck, RefreshCw, Headphones, Award, Share2, ThumbsUp, MapPin, ChevronRight, Package, Trash2, Truck, Clock, Tag, CreditCard } from 'lucide-react';
import ProductGallery from './ProductGallery';
import VariantSelector from './VariantSelector';
import UrgencyBadges from './UrgencyBadges';
import BundleOffer from './BundleOffer';
import FreeShippingProgress from './FreeShippingProgress';
import LiveSalesPopup from './LiveSalesPopup';
import Product360View from './Product360View';
import PriceComparison from './PriceComparison';
import FrequentlyBoughtTogether from './FrequentlyBoughtTogether';
import RelatedProducts from './RelatedProducts';

function Stars({ rating, size = 13 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size}
          fill={i <= Math.round(rating) ? 'var(--gold)' : 'none'}
          color={i <= Math.round(rating) ? 'var(--gold)' : 'var(--border-2)'} />
      ))}
    </span>
  );
}

function RatingBadge({ rating }) {
  const bg = rating >= 4 ? '#388e3c' : rating >= 3 ? '#f9a825' : '#e53935';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: bg, color: 'white', fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
      {rating} <Star size={10} fill="white" color="white" />
    </span>
  );
}

function Divider() {
  return <div className="section-divider" />;
}

/**
 * Score-based relevance: returns allProducts (excluding current) sorted by
 * similarity to `product`, highest score first.
 *
 * Scoring weights:
 *  +40  – same brand
 *  +30  – product appears in this product's `similarProducts` id list
 *  +20  – at least 2 shared feature keywords
 *  +10  – at least 1 shared feature keyword
 *  +15  – price within ±30% range
 *  +10  – at least 1 shared highlight key (e.g. "Battery", "ANC")
 */
function getSimilarProducts(product, allProducts, limit = 6) {
  if (!allProducts || allProducts.length === 0) return [];

  const currentFeatures = new Set(
    (product.features || []).map(f => f.toLowerCase())
  );
  const currentHighlightKeys = new Set(
    (product.highlights || []).map(h => h.key.toLowerCase())
  );
  const explicitIds = new Set(product.similarProducts || []);

  return allProducts
    .filter(p => p.id !== product.id)
    .map(p => {
      let score = 0;

      // Same brand
      if (p.brand && product.brand && p.brand === product.brand) score += 40;

      // Explicitly listed in similarProducts
      if (explicitIds.has(p.id)) score += 30;

      // Shared features
      const pFeatures = (p.features || []).map(f => f.toLowerCase());
      const sharedFeatures = pFeatures.filter(f => currentFeatures.has(f)).length;
      if (sharedFeatures >= 2) score += 20;
      else if (sharedFeatures === 1) score += 10;

      // Price proximity (within ±30%)
      if (product.price > 0) {
        const ratio = p.price / product.price;
        if (ratio >= 0.7 && ratio <= 1.3) score += 15;
      }

      // Shared highlight keys (e.g., both have "Battery", "ANC")
      const pKeys = (p.highlights || []).map(h => h.key.toLowerCase());
      const sharedKeys = pKeys.filter(k => currentHighlightKeys.has(k)).length;
      if (sharedKeys >= 2) score += 10;

      return { product: p, score };
    })
    .filter(({ score }) => score > 0)  // only show genuinely related products
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product);
}

export default function ProductPage({ product, onAddToCart, onBack, allProducts, onProductSelect, apiLoading = false, onDelete = null, wished = false, onWishlistToggle, cartButtonRef }) {
  const [selected, setSelected] = useState(() =>
    Object.fromEntries(Object.entries(product.variants).map(([k, v]) => [k, v[0]?.label || v[0]]))
  );
  const [qty, setQty] = useState(1);
  const [bundleQty, setBundleQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [flying, setFlying] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);
  const [reviewFilter, setReviewFilter] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [pincode, setPincode] = useState(product.deliveryPin || '623514');
  const [view360, setView360] = useState(false);
  const [showStockPopup, setShowStockPopup] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const disc = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);

  const [cd, setCd] = useState({ h: 3, m: 20, s: 20 });
  useEffect(() => {
    const t = setInterval(() => setCd(p => {
      let { h, m, s } = p;
      s--; if (s < 0) { s = 59; m--; } if (m < 0) { m = 59; h--; } if (h < 0) { h = 0; m = 0; s = 0; clearInterval(t); }
      return { h, m, s };
    }), 1000);
    return () => clearInterval(t);
  }, []);

  const handleDelete = () => {
    if (deleteConfirm) { onDelete(product.id); }
    else { setDeleteConfirm(true); setTimeout(() => setDeleteConfirm(false), 2500); }
  };
  const totalReviews = Object.values(product.ratingBreakdown).reduce((a, b) => a + b, 0);
  const handleVC = (g, v) => setSelected(p => ({ ...p, [g]: v }));

  const handleAdd = (e) => {
    if (adding) return;
    onAddToCart({ ...product, selectedVariants: selected, qty: qty * bundleQty });
    setAdding(true);
    setTimeout(() => setAdding(false), 1800);
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const cartRect = cartButtonRef?.current
        ? cartButtonRef.current.getBoundingClientRect()
        : { left: window.innerWidth - 40, top: 16 };
      setFlying({ startX: rect.left + 20, startY: rect.top + 20, endX: cartRect.left + 14, endY: cartRect.top + 14, img: product.images[0], id: Date.now() });
      setTimeout(() => setFlying(null), 700);
    }
  };

  // Scored & filtered similar products — most relevant first
  const similar = useMemo(
    () => getSimilarProducts(product, allProducts || []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product.id, allProducts]
  );
  const timerMinutes = useMemo(
    () => similar.map(() => Math.floor(Math.random() * 60)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [similar.length]
  );
  const pad = n => String(n).padStart(2, '0');

  // ── Gallery section (shared between mobile single-col and desktop left-col)
  const GallerySection = (
    <div style={{ position: 'relative' }}>
      {view360 ? (
        <Product360View
          frames={product.images.length >= 3 ? [...product.images, ...product.images.slice().reverse()] : product.images}
          productName={product.name}
        />
      ) : (
        <ProductGallery images={product.images} productName={product.name} countdown={cd} />
      )}

      {/* Low Stock Icon */}
      {product.stock <= 10 && (
        <button
          onClick={e => { e.stopPropagation(); setShowStockPopup(true); }}
          aria-label="Stock info"
          style={{
            position: 'absolute', top: 12, right: 12,
            width: 34, height: 34, borderRadius: '50%',
            background: product.stock <= 5 ? 'linear-gradient(135deg,#e74c3c,#c0392b)' : 'linear-gradient(135deg,#e67e22,#d35400)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.25)', zIndex: 20,
            animation: 'stockPulse 2s ease-in-out infinite',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2"/>
            <path d="M12 16v-4M12 8h.01" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}

      {/* Low Stock Popup */}
      {showStockPopup && product.stock <= 10 && (
        <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', borderRadius: 'var(--radius-lg)', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(3px)', animation: 'fadeInPopup 0.2s ease-out' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '22px 20px', maxWidth: 300, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.35)', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: product.stock <= 5 ? 'linear-gradient(135deg,#fff0ee,#ffe0dc)' : 'linear-gradient(135deg,#fff8ec,#ffe5c0)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, border: `2px solid ${product.stock <= 5 ? '#ffc5be' : '#ffd9a0'}` }}>
              {product.stock <= 5 ? '🚨' : '🔥'}
            </div>
            <p style={{ fontSize: 17, fontWeight: 800, color: product.stock <= 5 ? '#c0392b' : '#a06020', marginBottom: 6, fontFamily: 'Outfit, sans-serif' }}>
              {product.stock <= 5 ? 'Almost Sold Out!' : 'Low Stock Alert!'}
            </p>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 6 }}>
              Only <strong style={{ color: product.stock <= 5 ? '#e74c3c' : '#e67e22', fontSize: 16 }}>{product.stock}</strong> units left in stock
            </p>
            <p style={{ fontSize: 12.5, color: '#888', lineHeight: 1.5, marginBottom: 18 }}>
              {product.stock <= 5 ? 'This item is nearly gone. Order now before it sells out!' : "This item is selling fast. Grab yours before it's too late!"}
            </p>
            <div style={{ background: '#f0f0f0', borderRadius: 10, height: 8, marginBottom: 18, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (product.stock / 10) * 100)}%`, height: '100%', borderRadius: 10, background: product.stock <= 5 ? 'linear-gradient(90deg,#e74c3c,#c0392b)' : 'linear-gradient(90deg,#e67e22,#d35400)', transition: 'width 0.5s ease' }} />
            </div>
            <button onClick={() => setShowStockPopup(false)} style={{ width: '100%', padding: '11px 0', borderRadius: 10, border: 'none', background: 'var(--accent)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', boxShadow: '0 3px 12px rgba(42,96,73,0.3)' }}>
              Got it, close
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setView360(v => !v)} className="mt-2 mx-4 text-[12.5px] font-semibold text-[var(--accent)] bg-[var(--accent-light)] border border-[var(--accent-light-2)] rounded-full px-3 py-1.5 cursor-pointer">
        {view360 ? '↩ Back to Photos' : '🔄 View in 360°'}
      </button>
    </div>
  );

  // ── Right/buy-box content (desktop: right panel, mobile: inline)
  const BuyBox = (
    <div className="pdp-buybox" style={{ border: '1px solid var(--border)', borderRadius: 14, padding: '20px 18px', background: 'var(--white)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'sticky', top: 80 }}>
      {/* In Stock badge */}
      <p style={{ fontSize: 16, fontWeight: 700, color: '#388e3c', marginBottom: 12 }}>In Stock</p>

      {/* Price */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>M.R.P.:</span>
          <span style={{ fontSize: 13, color: 'var(--muted)', textDecoration: 'line-through' }}>${product.comparePrice.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 3 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>${product.price.toFixed(2)}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#e74c3c', background: '#fff0ee', padding: '3px 8px', borderRadius: 6 }}>-{disc}%</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>Inclusive of all taxes</p>
      </div>

      {/* Delivery */}
      <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
          <Truck size={14} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div>
            <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>FREE delivery </span>
            <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{product.deliveryDate}</strong>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Delivering to {pincode} · </span>
          <button style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Outfit, sans-serif', fontWeight: 600 }}>Update</button>
        </div>
      </div>

      {/* Variant selector compact */}
      <div style={{ marginBottom: 14 }}>
        <VariantSelector variants={product.variants} selected={selected} onChange={handleVC} />
      </div>

      {/* Urgency */}
      {product.stock <= 10 && (
        <div style={{ marginBottom: 14 }}>
          <UrgencyBadges stock={product.stock} shipsIn={product.shipsIn} />
        </div>
      )}

      {/* Qty selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>Qty:</span>
        <div className="qty-ctrl">
          <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q-1))}>−</button>
          <span style={{ width: 36, textAlign: 'center', fontSize: 15, fontWeight: 700 }}>{qty}</span>
          <button className="qty-btn" onClick={() => setQty(q => q+1)}>+</button>
        </div>
      </div>

      {/* Add to Cart */}
      <button
        onClick={handleAdd}
        disabled={adding || apiLoading}
        style={{
          width: '100%', padding: '13px 0', borderRadius: 24, border: 'none',
          background: adding ? 'var(--accent-hover)' : '#FFD814',
          color: adding ? 'white' : '#111', fontWeight: 700, fontSize: 15,
          cursor: adding || apiLoading ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: 'Outfit, sans-serif', marginBottom: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'all .18s',
        }}
      >
        {adding ? <><Check size={16} /> Added!</> : apiLoading ? 'Adding…' : 'Add to Cart'}
      </button>

      {/* Buy Now */}
      <button
        onClick={() => alert('Checkout coming soon!')}
        style={{
          width: '100%', padding: '13px 0', borderRadius: 24,
          border: 'none', background: '#FF9900',
          color: '#111', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          fontFamily: 'Outfit, sans-serif', marginBottom: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'all .18s',
        }}
      >
        Buy Now
      </button>

      {/* Seller info */}
      <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.9, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 80 }}>Ships from</span><span style={{ color: 'var(--ink)', fontWeight: 500 }}>LuxeShop</span></div>
        <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 80 }}>Sold by</span><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{product.seller.name}</span></div>
        <div style={{ display: 'flex', gap: 8 }}><span style={{ color: 'var(--muted)', width: 80 }}>Payment</span><span style={{ color: 'var(--ink)', fontWeight: 500 }}>Secure transaction</span></div>
      </div>

      {/* Wishlist */}
      <button
        onClick={() => onWishlistToggle && onWishlistToggle(product)}
        style={{ width: '100%', marginTop: 12, padding: '10px 0', borderRadius: 10, border: '1.5px solid var(--border)', background: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: wished ? 'var(--danger)' : 'var(--ink-2)', fontFamily: 'Outfit, sans-serif', transition: 'all .18s' }}
      >
        <Heart size={15} fill={wished ? 'var(--danger)' : 'none'} color={wished ? 'var(--danger)' : 'var(--ink-2)'} />
        {wished ? 'Saved to Wishlist ♥' : 'Add to Wish List'}
      </button>
    </div>
  );

  return (
    <div className="pdp-content-wrapper" style={{ paddingBottom: 20 }}>

      {/* ── Mobile Top Bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px 8px', borderBottom: '1px solid var(--border)' }} className="mobile-only">
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink-2)', fontFamily: 'Outfit, sans-serif', fontSize: 14, padding: 0 }}>
          <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back
        </button>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <button className="btn-ghost" onClick={() => onWishlistToggle && onWishlistToggle(product)}>
            <Heart size={20} fill={wished ? 'var(--danger)' : 'none'} color={wished ? 'var(--danger)' : 'var(--ink-2)'} />
          </button>
          <button className="btn-ghost"><Share2 size={20} color="var(--ink-2)" /></button>
          {onDelete && (
            <button className="btn-ghost" onClick={() => { if(window.confirm('Delete this product?')) onDelete(product.id); }} title="Delete product">
              <Trash2 size={20} color="var(--danger)" />
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          DESKTOP: Amazon-style two-column layout
          LEFT = gallery + thumbnails (sticky)
          CENTER = product info + details
          RIGHT = buy box (sticky)
      ══════════════════════════════════════════════ */}
      <div className="pdp-amazon-grid">

        {/* ── LEFT COL: Gallery ── */}
        <div className="pdp-col-left">
          {GallerySection}
          {/* Similar thumbnails - desktop */}
          <div style={{ marginTop: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 8 }}>Similar Products</p>
            {similar.length === 0 ? (
              <p style={{ fontSize: 12, color: 'var(--muted)' }}>No similar products.</p>
            ) : (
              <div className="similar-scroll">
                {similar.map((p) => (
                  <div key={p.id} className={`similar-thumb ${p.id === product.id ? 'active' : ''}`}>
                    <img src={p.images[0]} alt={p.name} onClick={() => onProductSelect && onProductSelect(p)}
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/80x80?text=No+Image'; }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── CENTER COL: Product Info ── */}
        <div className="pdp-col-center">

          {/* Desktop breadcrumb / back */}
          <div className="pdp-desktop-only" style={{ marginBottom: 10 }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--accent)', fontFamily: 'Outfit, sans-serif', fontSize: 13, padding: 0, fontWeight: 600 }}>
              <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} /> All Products
            </button>
          </div>

          {/* Delete banner */}
          {onDelete && (
            <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 12, background: deleteConfirm ? 'var(--danger)' : 'var(--danger-light)', border: '1.5px solid', borderColor: deleteConfirm ? 'var(--danger)' : '#f5c6c2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, transition: 'all .2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trash2 size={15} color={deleteConfirm ? 'white' : 'var(--danger)'} />
                <span style={{ fontSize: 13, fontWeight: 600, color: deleteConfirm ? 'white' : 'var(--danger)' }}>
                  {deleteConfirm ? 'Confirm — tap again to delete' : 'You added this product'}
                </span>
              </div>
              <button onClick={handleDelete} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12.5, background: deleteConfirm ? 'rgba(255,255,255,0.25)' : 'var(--danger)', color: 'white', transition: 'all .2s' }}>
                {deleteConfirm ? 'Yes, delete' : 'Delete'}
              </button>
            </div>
          )}

          {/* Brand + Title */}
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 4 }}>{product.brand}</p>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4, fontFamily: 'Outfit, sans-serif', marginBottom: 10 }}>{product.name}</h1>

          {/* Rating row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <Stars rating={product.rating} size={15} />
            <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>{product.rating}</span>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>({product.totalRatings.toLocaleString()} ratings)</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>·</span>
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>400+ bought last month</span>
          </div>

          {/* Limited deal badge + price (mobile shows here, desktop in buybox) */}
          <div className="border-t border-[var(--border)] pt-3 mb-3">
            <div className="inline-flex items-center gap-1.5 bg-[#e74c3c] text-white text-[12px] font-bold px-2.5 py-1 rounded mb-2">
              <Clock size={11} /> Limited time deal
            </div>
            <div className="flex items-baseline gap-2 flex-wrap min-w-0">
              <span className="text-[13px] font-bold text-[#e74c3c] flex-shrink-0">-{disc}%</span>
              <span className="text-[24px] sm:text-[28px] font-bold text-[var(--ink)] font-[Outfit,sans-serif] break-all">${product.price.toFixed(2)}</span>
              <span className="text-[13px] text-[var(--muted)] line-through flex-shrink-0">M.R.P.: ${product.comparePrice.toFixed(2)}</span>
            </div>
            <p className="text-[12px] text-[var(--muted)] mt-0.5">Inclusive of all taxes</p>
          </div>

          {/* Price Comparison */}
          <div style={{ marginBottom: 14 }}>
            <PriceComparison currentPrice={product.price} />
          </div>

          {/* Offers section */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '14px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <Tag size={14} color="var(--accent)" />
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Offers</span>
            </div>
            <div className="pdp-offers-grid">
              {[
                { icon: '💰', title: 'Cashback', desc: 'Upto $5.00 cashback on select wallets', link: '1 offer' },
                { icon: '🏦', title: 'Bank Offer', desc: 'Upto $25 off on select Credit Cards', link: '2 offers' },
                { icon: '🤝', title: 'Partner Offers', desc: 'Get GST Invoice & save up to 18%', link: '1 offer' },
              ].map(o => (
                <div key={o.title} style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 16 }}>{o.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{o.title}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.4, marginBottom: 4 }}>{o.desc}</p>
                  <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>{o.link} &rsaquo;</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Show BuyBox inline here */}
          <div className="pdp-mobile-buybox">
            {BuyBox}
          </div>

          {/* Shipping info */}
          <div style={{ marginBottom: 16, padding: '12px 14px', background: 'var(--accent-light)', borderRadius: 10, border: '1px solid var(--accent-light-2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <Truck size={15} color="var(--accent)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Ships in {product.shipsIn}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={14} color="var(--accent)" />
              <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Delivering to <strong>{pincode}</strong></span>
              <button style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, padding: 0 }}>Change</button>
            </div>
          </div>

          {/* Bundle offer */}
          <div style={{ marginBottom: 16 }}>
            <BundleOffer price={product.price} onSelect={setBundleQty} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <FreeShippingProgress cartTotal={product.price * bundleQty} />
          </div>

          {/* Frequently Bought Together */}
          <FrequentlyBoughtTogether
            product={product}
            allProducts={allProducts}
            onAddToCart={onAddToCart}
          />

          <Divider />

          {/* Product Highlights */}
          <div style={{ padding: '14px 0' }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>Product Highlights</p>
            <div className="highlight-grid">
              {product.highlights.map((h, i) => (
                <div key={i} className="highlight-cell">
                  <p style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 3 }}>{h.key}</p>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{h.value}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAdditional(s => !s)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '13px 0 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', marginTop: 12, borderTop: '1px solid var(--border)' }}>
              Additional Details {showAdditional ? <ChevronUp size={16} color="var(--muted)" /> : <ChevronDown size={16} color="var(--muted)" />}
            </button>
            {showAdditional && (
              <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.75, marginTop: 10 }}>{product.description}</p>
            )}
          </div>

          <Divider />

          {/* Trust badges */}
          <div style={{ padding: '14px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: <ShieldCheck size={17} color="var(--accent)" />, title: '100% Secure Payments', desc: 'SSL encrypted · Protected checkout' },
                { icon: <RefreshCw size={17} color="var(--accent)" />, title: 'Easy 30-Day Returns', desc: 'No questions asked · Full refund' },
                { icon: <Award size={17} color="var(--accent)" />, title: '1-Year Warranty', desc: 'Direct manufacturer warranty' },
                { icon: <Headphones size={17} color="var(--accent)" />, title: '24/7 Customer Support', desc: 'Chat, call, or email anytime' },
              ].map(t => (
                <div key={t.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 34, height: 34, background: 'var(--accent-light)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{t.icon}</div>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>{t.title}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Divider />

          {/* You might also like */}
          <div style={{ padding: '16px 0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>You might also like</p>
              {similar.length > 0 && (
                <button style={{ fontSize: 12.5, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>View all <ChevronRight size={13} /></button>
              )}
            </div>
            {similar.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--muted)', padding: '12px 0' }}>No similar products found.</p>
            ) : (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                {similar.map((p, i) => (
                  <div key={p.id} style={{ flexShrink: 0, width: 148, cursor: 'pointer', background: 'var(--white)', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }} onClick={() => onProductSelect && onProductSelect(p)}>
                    <div style={{ aspectRatio: '1/1', overflow: 'hidden', background: 'var(--surface)', position: 'relative' }}>
                      <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/148x148?text=No+Image'; }} />
                      {i % 2 === 1 && (
                        <div style={{ position: 'absolute', top: 6, left: 6, background: '#e65100', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>
                          04h:{String(timerMinutes[i] ?? 0).padStart(2,'0')}m
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '8px 9px' }}>
                      <p style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.3, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.name}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>${p.price}</span>
                        <span style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through' }}>${p.comparePrice}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{Math.round(((p.comparePrice-p.price)/p.comparePrice)*100)}% off</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <RatingBadge rating={p.rating} />
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>({(p.reviewCount/1000).toFixed(1)}k)</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related products from stores */}
          <RelatedProducts
            products={allProducts}
            onProductSelect={onProductSelect}
            onAddToCart={onAddToCart}
            currentId={product.id}
          />

          <Divider />

          {/* Ratings & Reviews */}
          <div style={{ padding: '16px 0' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Customer Ratings & Reviews</p>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ background: '#388e3c', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 100 }}>
                <span style={{ fontSize: 36, fontWeight: 700, color: 'white', lineHeight: 1 }}>{product.rating}</span>
                <Star size={18} fill="white" color="white" style={{ margin: '5px 0 4px' }} />
                <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 1.3 }}>{product.totalRatings.toLocaleString()}{'\n'}ratings</span>
              </div>
              <div style={{ flex: 1 }}>
                {[
                  { label: 'Very Good', stars: 5, color: '#388e3c' },
                  { label: 'Good', stars: 4, color: '#66bb6a' },
                  { label: 'Ok-Ok', stars: 3, color: '#f9a825' },
                  { label: 'Bad', stars: 2, color: '#ff7043' },
                  { label: 'Very Bad', stars: 1, color: '#e53935' },
                ].map(({ label, stars, color }) => {
                  const count = product.ratingBreakdown[String(stars)] || 0;
                  const pct = Math.round((count / totalReviews) * 100);
                  return (
                    <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: 'var(--ink-2)', width: 62, flexShrink: 0 }}>{label}</span>
                      <div style={{ flex: 1, height: 6, background: 'var(--surface-2)', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 10, transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--muted)', width: 36, textAlign: 'right', flexShrink: 0 }}>{count.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', marginBottom: 16 }}>
              {product.ratingTags.map(tag => (
                <button key={tag} onClick={() => setReviewFilter(f => f === tag ? null : tag)}
                  className={`rating-tag ${reviewFilter === tag ? 'active' : ''}`}>
                  {reviewFilter === tag && <Check size={11} />} {tag}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>
                Real Photos ({product.reviews.flatMap(r => r.images).length + 484})
              </p>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
                {product.reviews.flatMap(r => r.images).map((img, i) => (
                  <img key={i} src={img} alt={`Review photo ${i+1}`} className="review-photo"
                    onClick={() => setLightboxImg(img)}
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/80x80?text=No+Image'; }}
                  />
                ))}
                <div className="more-photos-tile" onClick={() => setLightboxImg(product.reviews.flatMap(r => r.images)[0])}>+484<br />More</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {product.reviews.map((r, i) => (
                <div key={i} style={{ paddingBottom: 18, marginBottom: 18, borderBottom: i < product.reviews.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <RatingBadge rating={r.rating} />
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>
                      {r.rating >= 4 ? 'Very Good' : r.rating >= 3 ? 'Good' : 'Ok-Ok'}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}>Posted on {r.date}</span>
                  </div>
                  {r.images.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      {r.images.slice(0, 2).map((img, j) => (
                        <img key={j} src={img} alt="" className="review-photo" onClick={() => setLightboxImg(img)}
                          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/80x80?text=No+Image'; }}
                        />
                      ))}
                      {r.images.length > 2 && <div className="more-photos-tile">+{r.images.length - 2}</div>}
                    </div>
                  )}
                  <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65, marginBottom: 6 }}>{r.text}</p>
                  <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 10 }}>~{r.author}</p>
                  <button style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: '1px solid var(--border)', borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: 12.5, color: 'var(--muted)', fontFamily: 'Outfit, sans-serif' }}>
                    <ThumbsUp size={12} /> Helpful ({r.helpful})
                  </button>
                </div>
              ))}
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Outfit, sans-serif', letterSpacing: '0.04em', textTransform: 'uppercase', padding: '6px 0' }}>
              VIEW ALL REVIEWS <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ── RIGHT COL: Buy Box (desktop only) ── */}
        <div className="pdp-col-right pdp-desktop-only">
          {BuyBox}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImg && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.93)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setLightboxImg(null)}>
          <img src={lightboxImg} alt="Review" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/400x400?text=No+Image'; }} />
          <button onClick={() => setLightboxImg(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: 20 }}>✕</button>
        </div>
      )}

      {/* Fly-to-cart animation */}
      {flying && (
        <img key={flying.id} src={flying.img} alt=""
          className="fixed w-10 h-10 rounded-lg object-cover z-[1100] pointer-events-none animate-[flyToCart_0.65s_cubic-bezier(0.55,0,0.85,0.35)_forwards]"
          style={{ left: flying.startX, top: flying.startY, '--fly-end-x': `${flying.endX - flying.startX}px`, '--fly-end-y': `${flying.endY - flying.startY}px` }}
        />
      )}

      <LiveSalesPopup productName={product.name} />

      {/* Sticky Bottom CTA (mobile) */}
      <div className="pdp-sticky-bar">
        <button className="pdp-sticky-btn cart" onClick={handleAdd}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          {adding ? 'Added ✓' : apiLoading ? 'Adding…' : 'Add to Cart'}
        </button>
        <button className="pdp-sticky-btn buy" onClick={() => alert('Checkout coming soon!')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/><polygon points="12 3 19 12 12 21 12 3"/></svg>
          Buy Now
        </button>
      </div>
    </div>
  );
}
