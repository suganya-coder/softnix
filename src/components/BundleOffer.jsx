import { useState } from 'react';
import { Check, Zap, Package, Layers } from 'lucide-react';

const ICONS = [Package, Layers, Zap];

export default function BundleOffer({ price, onSelect }) {
  const [active, setActive] = useState(1);

  const bundles = [
    { qty: 1, label: 'Single',  save: 0,  desc: 'Just one unit' },
    { qty: 2, label: 'Duo',     save: 10, desc: 'Share or spare', badge: null },
    { qty: 3, label: 'Trio',    save: 20, desc: 'Best value deal', badge: 'MOST POPULAR' },
  ];

  const handleSelect = (b) => {
    setActive(b.qty);
    onSelect?.(b.qty);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.01em' }}>Buy More, Save More</p>
          <p style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>Unlock bigger discounts instantly</p>
        </div>
        <div style={{ background: 'var(--accent-light)', border: '1px solid var(--accent-light-2)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>
          Up to 20% off
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {bundles.map((b, idx) => {
          const Icon = ICONS[idx];
          const total = (price * b.qty * (1 - b.save / 100));
          const original = price * b.qty;
          const isActive = active === b.qty;

          return (
            <button
              key={b.qty}
              onClick={() => handleSelect(b)}
              style={{
                position: 'relative',
                width: '100%', textAlign: 'left', cursor: 'pointer',
                padding: '12px 14px',
                borderRadius: 12,
                border: isActive ? '2px solid var(--accent)' : '1.5px solid var(--border-2)',
                background: isActive
                  ? 'linear-gradient(135deg, var(--accent-light) 0%, #f0f8f4 100%)'
                  : 'var(--white)',
                transition: 'all .18s',
                boxShadow: isActive ? '0 2px 12px rgba(42,96,73,0.12)' : 'none',
                fontFamily: 'Outfit, sans-serif',
              }}
            >
              {/* Popular badge */}
              {b.badge && (
                <span style={{
                  position: 'absolute', top: -9, left: 14,
                  background: 'linear-gradient(90deg, #e65100, #f57c00)',
                  color: 'white', fontSize: 9.5, fontWeight: 800,
                  letterSpacing: '.06em', padding: '2px 8px',
                  borderRadius: 20, textTransform: 'uppercase',
                  boxShadow: '0 2px 6px rgba(230,81,0,0.35)',
                }}>
                  ★ {b.badge}
                </span>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                {/* Left: radio + icon + text */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {/* Radio */}
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? 'var(--accent)' : 'transparent',
                    border: isActive ? '2px solid var(--accent)' : '2px solid var(--border-2)',
                    transition: 'all .18s',
                  }}>
                    {isActive && <Check size={11} color="white" strokeWidth={3} />}
                  </div>

                  {/* Icon bubble */}
                  <div style={{
                    width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? 'var(--accent)' : 'var(--surface-2)',
                    transition: 'all .18s',
                  }}>
                    <Icon size={16} color={isActive ? 'white' : 'var(--muted)'} />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: isActive ? 'var(--accent)' : 'var(--ink)' }}>
                        Buy {b.qty} — {b.label}
                      </span>
                      {b.save > 0 && (
                        <span style={{
                          fontSize: 10.5, fontWeight: 800, color: '#e65100',
                          background: '#fff3e0', border: '1px solid #ffe0b2',
                          borderRadius: 20, padding: '1px 7px',
                        }}>
                          -{b.save}%
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 1, display: 'block' }}>{b.desc}</span>
                  </div>
                </div>

                {/* Right: price */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: isActive ? 'var(--accent)' : 'var(--ink)', fontFamily: 'Playfair Display, serif' }}>
                    ${total.toFixed(2)}
                  </div>
                  {b.save > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--muted)', textDecoration: 'line-through', marginTop: 1 }}>
                      ${original.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              {/* Active bottom strip */}
              {isActive && b.save > 0 && (
                <div style={{
                  marginTop: 10, paddingTop: 9,
                  borderTop: '1px dashed var(--accent-light-2)',
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: 11.5, color: 'var(--accent)', fontWeight: 600,
                }}>
                  <Zap size={11} color="var(--accent)" />
                  You save ${(original - total).toFixed(2)} with this bundle!
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
