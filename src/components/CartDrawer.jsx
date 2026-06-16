import { X, Plus, Minus, Trash2, ShoppingBag, Lock, RefreshCw, Loader } from 'lucide-react';

const FREE_SHIP = 75;
const FALLBACK_IMG = 'https://placehold.co/80x80?text=No+Image';

export default function CartDrawer({ isOpen, onClose, items, onIncrement, onDecrement, onRemove, apiStatus, onCheckout }) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= FREE_SHIP ? 0 : 8.99;
  const total = subtotal + shipping;
  const toFree = Math.max(0, FREE_SHIP - subtotal);
  const pct = Math.min(100, (subtotal / FREE_SHIP) * 100);

  const isActing = (cartId, prefix) =>
    apiStatus?.loading && apiStatus?.action?.startsWith(`${prefix}-${cartId}`);

  return (
    <>
      {isOpen && <div className="drawer-backdrop" onClick={onClose} />}

      <aside className={`drawer-panel ${isOpen ? 'open' : ''}`} role="dialog" aria-modal aria-label="Shopping cart">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-[18px] border-b border-[var(--border)] flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={20} color="var(--ink)" />
            <span className="font-display text-lg font-bold text-[var(--ink)]">Your Cart</span>
            {items.length > 0 && (
              <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'var(--accent)' }}>
                {items.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && (
          <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
            {toFree > 0 ? (
              <p className="text-[13px] mb-2 text-[var(--ink-2)]">
                Add <strong className="text-[var(--accent)]">${toFree.toFixed(2)}</strong> more for <strong>free shipping</strong>
              </p>
            ) : (
              <p className="text-[13px] font-semibold flex items-center gap-1.5 mb-2 text-[var(--accent)]">
                🎉 You've unlocked free shipping!
              </p>
            )}
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-10 text-center">
              <div className="w-[72px] h-[72px] flex items-center justify-center rounded-[var(--radius-lg)] bg-[var(--surface)]">
                <ShoppingBag size={30} color="var(--muted)" />
              </div>
              <div>
                <p className="font-display text-[17px] font-semibold mb-1.5 text-[var(--ink)]">Your cart is empty</p>
                <p className="text-sm text-[var(--muted)]">Add products to get started</p>
              </div>
              <button className="btn-primary text-sm px-6 py-2.5" onClick={onClose}>Continue Shopping</button>
            </div>
          ) : (
            <div className="flex flex-col">
              {items.map((item, idx) => (
                <div
                  key={item.cartId}
                  className="flex gap-3.5 py-4 transition-opacity duration-200"
                  style={{
                    borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none',
                    opacity: isActing(item.cartId, 'rm') ? 0.45 : 1,
                  }}
                >
                  <div className="w-20 h-20 rounded-[var(--radius)] overflow-hidden flex-shrink-0 bg-[var(--surface)]">
                    <img
                      src={item.images[0]} alt={item.name}
                      className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.06em] mb-0.5 text-[var(--accent)]">{item.brand}</p>
                        <p className="text-sm font-semibold leading-snug text-[var(--ink)]">{item.name}</p>
                      </div>
                      <button
                        onClick={() => onRemove(item.cartId)}
                        className="btn-ghost p-1 flex-shrink-0"
                        aria-label="Remove" disabled={apiStatus?.loading}
                      >
                        {isActing(item.cartId, 'rm')
                          ? <Loader size={14} className="animate-spin" />
                          : <Trash2 size={14} />}
                      </button>
                    </div>
                    <p className="text-xs my-1 mb-2.5 text-[var(--muted)]">
                      {Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="qty-ctrl" style={{ height: 34 }}>
                        <button className="qty-btn" onClick={() => onDecrement(item.cartId)} aria-label="Decrease"
                          style={{ width: 34, height: 34 }} disabled={apiStatus?.loading}>
                          {isActing(item.cartId, 'dec') ? <Loader size={12} className="animate-spin" /> : <Minus size={13} />}
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-[var(--ink)]">{item.qty}</span>
                        <button className="qty-btn" onClick={() => onIncrement(item.cartId)} aria-label="Increase"
                          style={{ width: 34, height: 34 }} disabled={apiStatus?.loading}>
                          {isActing(item.cartId, 'inc') ? <Loader size={12} className="animate-spin" /> : <Plus size={13} />}
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-[15px] font-bold text-[var(--ink)]">${(item.price * item.qty).toFixed(2)}</p>
                        {item.qty > 1 && <p className="text-[11px] text-[var(--muted)]">${item.price.toFixed(2)} each</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--border)] px-5 py-4 flex-shrink-0 bg-[var(--white)]">
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-sm text-[var(--ink-2)]">
                <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--ink-2)]">Shipping</span>
                <span className={shipping === 0 ? 'text-[var(--accent)] font-semibold' : 'text-[var(--ink-2)]'}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between pt-2.5 border-t border-[var(--border)] font-bold text-base text-[var(--ink)]">
                <span>Total</span><span>${total.toFixed(2)}</span>
              </div>
              <p className="text-xs text-right text-[var(--muted)]">Taxes calculated at checkout</p>
            </div>

            <button className="btn-primary w-full text-[15px] py-[15px] gap-2" onClick={onCheckout}>
              <Lock size={15} /> Checkout — ${total.toFixed(2)}
            </button>

            <div className="flex items-center justify-center gap-4 mt-3">
              {['Visa', 'Mastercard', 'PayPal', 'Apple Pay'].map(p => (
                <span key={p} className="text-[11px] font-semibold px-1.5 py-0.5 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]">{p}</span>
              ))}
            </div>
            <div className="flex items-center justify-center gap-1 mt-2.5 text-xs text-[var(--muted)]">
              <Lock size={11} /> Secure & encrypted · <RefreshCw size={11} /> 30-day returns
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
