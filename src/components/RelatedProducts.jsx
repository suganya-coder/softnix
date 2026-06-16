import { useRef, useState } from 'react';
import { Star, ChevronLeft, ChevronRight, ShoppingCart, Check } from 'lucide-react';

function MiniStars({ rating }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={11}
          fill={i <= Math.round(rating) ? '#f5a623' : 'none'}
          color={i <= Math.round(rating) ? '#f5a623' : '#d4d4cc'} />
      ))}
    </span>
  );
}

/**
 * RelatedProducts
 * Props:
 *   products        — scored & filtered related products array
 *   onProductSelect — (product) => void
 *   onAddToCart     — (product) => void
 *   currentId       — id of current product (excluded)
 */
export default function RelatedProducts({ products, onProductSelect, onAddToCart, currentId }) {
  const scrollRef = useRef(null);
  const [addedId, setAddedId] = useState(null);

  const items = (products || []).filter(p => p.id !== currentId);
  if (items.length === 0) return null;

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  const handleAdd = (e, product) => {
    e.stopPropagation();
    onAddToCart && onAddToCart({ ...product, selectedVariants: {}, qty: 1 });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  // Page count indicator
  const pageCount = Math.ceil(items.length / 3);

  return (
    <div style={{ padding: '16px 0 10px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
          Related products from stores
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
            Page 1 of {pageCount}
          </span>
          {/* Prev / Next arrows */}
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => scroll(-1)}
              style={{
                width: 30, height: 30,
                borderRadius: '50%',
                border: '1.5px solid var(--border-2)',
                background: 'var(--white)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-xs)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
            >
              <ChevronLeft size={15} color="var(--ink-2)" />
            </button>
            <button
              onClick={() => scroll(1)}
              style={{
                width: 30, height: 30,
                borderRadius: '50%',
                border: '1.5px solid var(--border-2)',
                background: 'var(--white)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-xs)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
            >
              <ChevronRight size={15} color="var(--ink-2)" />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll container */}
      <div style={{ position: 'relative' }}>
        {/* Left fade arrow (desktop) */}
        <button
          onClick={() => scroll(-1)}
          className="related-arrow related-arrow-left"
          style={{
            position: 'absolute', left: -14, top: '50%', transform: 'translateY(-50%)',
            width: 36, height: 36,
            borderRadius: '50%',
            border: '1.5px solid var(--border-2)',
            background: 'var(--white)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10,
          }}
        >
          <ChevronLeft size={18} color="var(--ink-2)" />
        </button>

        <div
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: 12,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: 4,
            scrollSnapType: 'x mandatory',
          }}
        >
          {items.map((p) => {
            const disc = Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100);
            const isAdded = addedId === p.id;

            return (
              <div
                key={p.id}
                onClick={() => onProductSelect && onProductSelect(p)}
                style={{
                  flexShrink: 0,
                  width: 168,
                  cursor: 'pointer',
                  background: 'var(--white)',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  scrollSnapAlign: 'start',
                  transition: 'box-shadow 0.18s, transform 0.18s',
                  display: 'flex',
                  flexDirection: 'column',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Image */}
                <div style={{
                  aspectRatio: '1/1',
                  overflow: 'hidden',
                  background: 'var(--surface)',
                  position: 'relative',
                }}>
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://placehold.co/168x168?text=No+Image';
                    }}
                  />
                  {/* Discount badge */}
                  {disc > 0 && (
                    <div style={{
                      position: 'absolute', top: 8, left: 8,
                      background: '#e74c3c',
                      color: 'white',
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: 4,
                    }}>
                      -{disc}%
                    </div>
                  )}
                  {/* Badge (Best Seller etc) */}
                  {p.badge && (
                    <div style={{
                      position: 'absolute', top: disc > 0 ? 30 : 8, left: 8,
                      background: p.badge === 'Best Seller' ? '#e65100' : 'var(--accent)',
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}>
                      {p.badge === 'Best Seller' ? '#1 Best Seller' : p.badge}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div style={{ padding: '10px 10px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{
                    fontSize: 12.5,
                    color: 'var(--ink)',
                    fontWeight: 500,
                    lineHeight: 1.35,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {p.name}
                  </p>

                  {/* Stars + count */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MiniStars rating={p.rating} />
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {p.reviewCount.toLocaleString()}
                    </span>
                  </div>

                  {/* Prices */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
                        ${p.price.toFixed(2)}
                      </span>
                      <span style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through' }}>
                        ${p.comparePrice.toFixed(2)}
                      </span>
                    </div>
                    {/* Limited time deal */}
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      background: '#e74c3c',
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      marginTop: 3,
                    }}>
                      Limited time deal
                    </div>
                  </div>

                  {/* Delivery */}
                  <p style={{ fontSize: 11, color: '#388e3c', fontWeight: 500, marginTop: 2 }}>
                    FREE Delivery by {p.deliveryDate}
                  </p>

                  {/* Add to Cart button */}
                  <button
                    onClick={(e) => handleAdd(e, p)}
                    style={{
                      marginTop: 'auto',
                      paddingTop: 6,
                      width: '100%',
                      padding: '8px 0',
                      borderRadius: 20,
                      border: 'none',
                      background: isAdded ? 'var(--accent)' : '#FFD814',
                      color: isAdded ? 'white' : '#111',
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      fontFamily: 'Outfit, sans-serif',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      transition: 'all 0.18s',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    {isAdded
                      ? <><Check size={12} /> Added!</>
                      : <><ShoppingCart size={12} /> Add to Cart</>
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right fade arrow (desktop) */}
        <button
          onClick={() => scroll(1)}
          className="related-arrow related-arrow-right"
          style={{
            position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)',
            width: 36, height: 36,
            borderRadius: '50%',
            border: '1.5px solid var(--border-2)',
            background: 'var(--white)',
            boxShadow: 'var(--shadow-md)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10,
          }}
        >
          <ChevronRight size={18} color="var(--ink-2)" />
        </button>
      </div>
    </div>
  );
}
