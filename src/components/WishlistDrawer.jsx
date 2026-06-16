import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

const FALLBACK_IMG = 'https://placehold.co/80x80?text=No+Image';

export default function WishlistDrawer({ isOpen, onClose, items, onRemove, onMoveToCart }) {
  return (
    <>
      {isOpen && <div className="drawer-backdrop" onClick={onClose} />}

      <aside
        className={`drawer-panel ${isOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal
        aria-label="Wishlist"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <Heart size={20} color="var(--danger)" fill="var(--danger)" />
            <span className="font-display text-lg font-bold" style={{ color: 'var(--ink)' }}>
              Wishlist
            </span>
            {items.length > 0 && (
              <span
                className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'var(--danger)' }}
              >
                {items.length}
              </span>
            )}
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* ── Items ── */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-10 text-center">
              <div
                className="w-[72px] h-[72px] flex items-center justify-center rounded-[var(--radius-lg)]"
                style={{ background: 'var(--surface)' }}
              >
                <Heart size={30} color="var(--muted)" />
              </div>
              <div>
                <p
                  className="font-display text-[17px] font-semibold mb-1.5"
                  style={{ color: 'var(--ink)' }}
                >
                  Your wishlist is empty
                </p>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>
                  Tap the ♥ on any product to save it here
                </p>
              </div>
              <button className="btn-primary text-sm px-6 py-2.5" onClick={onClose}>
                Browse Products
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map((item, idx) => {
                const disc = Math.round(
                  ((item.comparePrice - item.price) / item.comparePrice) * 100
                );
                return (
                  <div
                    key={item.id}
                    className="flex gap-3.5 py-4"
                    style={{
                      borderBottom:
                        idx < items.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    {/* Image */}
                    <div
                      className="w-20 h-20 rounded-[var(--radius)] overflow-hidden flex-shrink-0"
                      style={{ background: 'var(--surface)' }}
                    >
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={e => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_IMG;
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p
                            className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-0.5"
                            style={{ color: 'var(--accent)' }}
                          >
                            {item.brand}
                          </p>
                          <p
                            className="text-sm font-semibold leading-snug"
                            style={{
                              color: 'var(--ink)',
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {item.name}
                          </p>
                        </div>
                        {/* Remove from wishlist */}
                        <button
                          onClick={() => onRemove(item.id)}
                          className="btn-ghost p-1 flex-shrink-0"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Price row */}
                      <div className="flex items-center gap-2 mt-1.5 mb-2.5 flex-wrap">
                        <span
                          className="font-bold"
                          style={{ fontSize: 16, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}
                        >
                          ${item.price.toFixed(2)}
                        </span>
                        <span
                          className="text-xs line-through"
                          style={{ color: 'var(--muted)' }}
                        >
                          ${item.comparePrice.toFixed(2)}
                        </span>
                        <span
                          className="text-xs font-bold px-1.5 py-0.5 rounded"
                          style={{ background: '#fff0ee', color: '#e74c3c' }}
                        >
                          -{disc}%
                        </span>
                      </div>

                      {/* Move to Cart */}
                      <button
                        onClick={() => onMoveToCart(item)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border-none cursor-pointer transition-colors"
                        style={{
                          background: 'var(--accent)',
                          color: 'white',
                          fontFamily: 'Outfit, sans-serif',
                        }}
                        onMouseEnter={e =>
                          (e.currentTarget.style.background = 'var(--accent-hover)')
                        }
                        onMouseLeave={e =>
                          (e.currentTarget.style.background = 'var(--accent)')
                        }
                      >
                        <ShoppingBag size={12} /> Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer: Move all to cart ── */}
        {items.length > 0 && (
          <div
            className="border-t border-[var(--border)] px-5 py-4 flex-shrink-0"
            style={{ background: 'var(--white)' }}
          >
            <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>
              {items.length} item{items.length > 1 ? 's' : ''} saved
            </p>
            <button
              className="btn-primary w-full text-[15px] py-[13px]"
              onClick={() => {
                items.forEach(item => onMoveToCart(item));
              }}
            >
              <ShoppingBag size={15} /> Move All to Cart
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
