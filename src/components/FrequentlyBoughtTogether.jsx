import { useState } from 'react';
import { Star, Check, ShoppingCart } from 'lucide-react';

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
 * FrequentlyBoughtTogether
 * Props:
 *   product      — the current product object
 *   allProducts  — full product list (we pick 2 bundle companions)
 *   onAddToCart  — (items[]) => void
 */
export default function FrequentlyBoughtTogether({ product, allProducts, onAddToCart }) {
  // Pick up to 2 companions (exclude current product)
  const companions = (allProducts || [])
    .filter(p => p.id !== product.id)
    .slice(0, 2);

  const bundle = [product, ...companions];

  // Checkbox state — all checked by default
  const [checked, setChecked] = useState(() =>
    Object.fromEntries(bundle.map(p => [p.id, true]))
  );

  const selectedItems = bundle.filter(p => checked[p.id]);
  const totalPrice = selectedItems.reduce((sum, p) => sum + p.price, 0);
  const totalMRP    = selectedItems.reduce((sum, p) => sum + p.comparePrice, 0);
  const totalDisc   = Math.round(((totalMRP - totalPrice) / totalMRP) * 100);

  const toggle = (id) => {
    // Must keep at least 1 item checked
    const newState = { ...checked, [id]: !checked[id] };
    const anyChecked = Object.values(newState).some(Boolean);
    if (anyChecked) setChecked(newState);
  };

  const [added, setAdded] = useState(false);
  const handleAddAll = () => {
    onAddToCart && selectedItems.forEach(p =>
      onAddToCart({ ...p, selectedVariants: {}, qty: 1 })
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (companions.length === 0) return null;

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '18px 16px',
      background: 'var(--white)',
      marginBottom: 16,
    }}>
      {/* Header */}
      <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>
        Frequently bought together
      </p>

      {/* Products row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 16,
      }}>
        {bundle.map((p, idx) => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Product tile */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              width: 100,
            }}>
              {/* Checkbox overlay */}
              <label style={{
                position: 'absolute',
                top: 4,
                left: 4,
                zIndex: 2,
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={checked[p.id]}
                  onChange={() => toggle(p.id)}
                  style={{ display: 'none' }}
                />
                <span style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  border: checked[p.id] ? 'none' : '1.5px solid var(--border-2)',
                  background: checked[p.id] ? 'var(--accent)' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                  transition: 'all 0.15s',
                }}>
                  {checked[p.id] && <Check size={11} color="white" strokeWidth={3} />}
                </span>
              </label>

              {/* Image */}
              <div style={{
                width: 100,
                height: 100,
                borderRadius: 10,
                overflow: 'hidden',
                border: p.id === product.id
                  ? '2px solid var(--accent)'
                  : '1.5px solid var(--border)',
                opacity: checked[p.id] ? 1 : 0.4,
                transition: 'opacity 0.2s',
                background: 'var(--surface)',
                flexShrink: 0,
              }}>
                <img
                  src={p.images[0]}
                  alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://placehold.co/100x100?text=No+Image';
                  }}
                />
              </div>

              {/* "This item" label */}
              {p.id === product.id && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--accent)',
                  background: 'var(--accent-light)',
                  border: '1px solid var(--accent-light-2)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  marginTop: 5,
                  whiteSpace: 'nowrap',
                }}>
                  This item
                </span>
              )}
            </div>

            {/* Plus sign between products */}
            {idx < bundle.length - 1 && (
              <span style={{
                fontSize: 20,
                fontWeight: 300,
                color: 'var(--muted)',
                flexShrink: 0,
              }}>+</span>
            )}
          </div>
        ))}
      </div>

      {/* Per-item details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {bundle.map(p => (
          <div key={p.id} style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            opacity: checked[p.id] ? 1 : 0.4,
            transition: 'opacity 0.2s',
          }}>
            <label style={{ cursor: 'pointer', marginTop: 2, flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={checked[p.id]}
                onChange={() => toggle(p.id)}
                style={{ display: 'none' }}
              />
              <span style={{
                width: 16,
                height: 16,
                borderRadius: 3,
                border: checked[p.id] ? 'none' : '1.5px solid var(--border-2)',
                background: checked[p.id] ? 'var(--accent)' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.15s',
              }}>
                {checked[p.id] && <Check size={10} color="white" strokeWidth={3} />}
              </span>
            </label>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontSize: 13,
                color: 'var(--ink)',
                fontWeight: 500,
                lineHeight: 1.35,
                marginBottom: 3,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {p.id === product.id && (
                  <strong style={{ color: 'var(--ink-2)', fontWeight: 700 }}>This item: </strong>
                )}
                {p.name}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                <MiniStars rating={p.rating} />
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                  ({p.reviewCount.toLocaleString()})
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginLeft: 4 }}>
                  ${p.price.toFixed(2)}
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through' }}>
                  ${p.comparePrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total + CTA */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 10,
        padding: '14px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Total price:</span>
            <span style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--ink)',
              fontFamily: 'Outfit, sans-serif',
            }}>
              ${totalPrice.toFixed(2)}
            </span>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#e74c3c',
              background: '#fff0ee',
              padding: '2px 7px',
              borderRadius: 5,
            }}>
              -{totalDisc}%
            </span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
            M.R.P.: <span style={{ textDecoration: 'line-through' }}>${totalMRP.toFixed(2)}</span>
            {' '}· You save ${(totalMRP - totalPrice).toFixed(2)}
          </p>
        </div>

        <button
          onClick={handleAddAll}
          disabled={selectedItems.length === 0}
          style={{
            padding: '11px 20px',
            borderRadius: 24,
            border: 'none',
            background: added ? 'var(--accent)' : '#FFD814',
            color: added ? 'white' : '#111',
            fontWeight: 700,
            fontSize: 14,
            cursor: selectedItems.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'Outfit, sans-serif',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            transition: 'all 0.18s',
            opacity: selectedItems.length === 0 ? 0.5 : 1,
          }}
        >
          {added
            ? <><Check size={15} /> Added!</>
            : <><ShoppingCart size={15} /> Add all {selectedItems.length} to Cart</>
          }
        </button>
      </div>
    </div>
  );
}
