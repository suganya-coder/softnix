import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import ProductCard from './components/ProductCard';
import ProductPage from './components/ProductPage';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import AddProductModal from './components/AddProductModal';
import { fetchProducts, postCartAdd, patchCartItem, deleteCartItem, saveCustomProduct, deleteCustomProduct } from './api';
import WishlistDrawer from './components/WishlistDrawer';
import { ShoppingBag, Zap, Shield, Star, ArrowRight, TrendingUp } from 'lucide-react';

function Toast({ msg, type = 'success' }) {
  if (!msg) return null;
  const bg =
    type === 'error' ? 'bg-red-700' :
    type === 'info'  ? 'bg-[var(--accent)]' :
                       'bg-[var(--ink)]';
  return (
    <div className={`toast fixed bottom-20 left-1/2 -translate-x-1/2 ${bg} text-white px-5 py-[11px] rounded-[var(--radius)] text-sm font-medium z-[300] shadow-[var(--shadow-lg)] whitespace-nowrap animate-[slideUp_0.3s_ease,fadeOut_0.3s_ease_2s_forwards]`}>
      {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} {msg}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-[var(--border)] overflow-hidden bg-white">
          <div className="skeleton aspect-square" />
          <div className="p-3">
            <div className="skeleton h-2.5 w-2/5 mb-2 rounded" />
            <div className="skeleton h-3.5 w-3/4 mb-2 rounded" />
            <div className="skeleton h-3 w-1/2 mb-3 rounded" />
            <div className="skeleton h-5 w-2/5 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Hero({ onShop }) {
  return (
    <section className="relative flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl overflow-hidden px-5 sm:px-10 py-8 sm:py-14 mb-7 sm:mb-11 min-h-[220px] sm:min-h-[260px]"
      style={{ background: 'linear-gradient(135deg, #111110 0%, #1e2d26 100%)' }}>
      {/* Decorative circle */}
      <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.03)' }} />

      {/* Left: text */}
      <div className="relative z-10 max-w-[460px] w-full">
        <span className="inline-flex items-center gap-1.5 text-[11.5px] font-bold tracking-[0.1em] uppercase mb-3.5 px-3 py-1.5 rounded-full"
          style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)' }}>
          <Zap size={11} className="text-[#f5c518]" /> Flash Sale — Up to 45% off
        </span>
        <h1 className="font-display text-[26px] sm:text-[40px] font-bold text-white leading-[1.15] tracking-tight mb-3 sm:mb-4">
          Tech that works<br />as hard as you do.
        </h1>
        <p className="text-sm sm:text-[15.5px] font-light leading-relaxed mb-5 sm:mb-7"
          style={{ color: 'rgba(255,255,255,0.6)' }}>
          Premium, hand-picked gear. Free shipping over $75.
        </p>
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-2.5">
          <button className="btn-primary gap-1.5 w-full sm:w-auto justify-center" onClick={onShop}>
            Shop the Sale <ArrowRight size={15} />
          </button>
          <button onClick={onShop}
            className="inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-5 py-3 rounded-[10px] border border-white/20 bg-white/7 text-white/85 text-[14.5px] font-medium cursor-pointer font-[Outfit,sans-serif] transition-[background] hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            View All
          </button>
        </div>
      </div>

      {/* Right: stats — hidden on mobile */}
      <div className="hidden sm:flex flex-col gap-2.5 relative z-10 flex-shrink-0">
        {[
          { icon: <Star size={15} fill="#f5c518" color="#f5c518" />, stat: '4.9/5',  label: 'Avg rating' },
          { icon: <ShoppingBag size={15} color="#a8d5bc" />,          stat: '50k+',  label: 'Customers' },
          { icon: <Shield size={15} color="#a8d5bc" />,               stat: '30-Day', label: 'Money-back' },
        ].map(s => (
          <div key={s.stat}
            className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/[0.08] min-w-[180px]"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            {s.icon}
            <div>
              <p className="text-[15px] font-bold text-white leading-none">{s.stat}</p>
              <p className="text-[11.5px] mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-16 bg-[var(--white)] pt-10 pb-7">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-7 mb-9">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-display text-[17px] font-bold text-[var(--ink)] mb-2">LuxeShop</p>
            <p className="text-[13px] text-[var(--muted)] leading-[1.7]">
              Premium tech accessories for those who demand the best.
            </p>
          </div>
          {[
            { title: 'Shop',    links: ['All Products', 'Audio', 'Wearables', 'Power', 'Keyboards'] },
            { title: 'Help',    links: ['Track Order', 'Returns', 'Shipping', 'Contact', 'FAQ'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press', 'Partners'] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-[11.5px] font-bold tracking-[0.08em] uppercase text-[var(--ink)] mb-3">{col.title}</p>
              <ul className="flex flex-col gap-2.5 list-none">
                {col.links.map(l => (
                  <li key={l}>
                    <a href="#" className="text-[13px] text-[var(--muted)] no-underline hover:text-[var(--accent)] transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[var(--border)] pt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 flex-wrap">
          <p className="text-[12.5px] text-[var(--muted)]">© 2025 LuxeShop. All rights reserved.</p>
          <div className="flex gap-3.5 flex-wrap">
            {['Privacy', 'Terms', 'Cookies'].map(l => (
              <a key={l} href="#" className="text-xs text-[var(--muted)] no-underline hover:text-[var(--accent)] transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: 'success' });
  const [apiStatus, setApiStatus] = useState({ loading: false, action: '' });
  const [searchOpen, setSearchOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const productsRef = useRef(null);
  const cartIdRef = useRef(0);
  const cartButtonRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchProducts()
      .then(data => { setProducts(data); setLoading(false); })
      .catch(err => { setError(err.message || 'Failed to load products.'); setLoading(false); });
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 2600);
  };

  const toggleWishlist = useCallback((product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) { showToast(`"${product.name}" removed from wishlist`, 'info'); return prev.filter(p => p.id !== product.id); }
      showToast(`"${product.name}" added to wishlist ♥`, 'success');
      return [...prev, product];
    });
  }, []);

  const isWished = useCallback((productId) => wishlist.some(p => p.id === productId), [wishlist]);

  const addToCart = useCallback(async ({ qty, selectedVariants, ...product }) => {
    setApiStatus({ loading: true, action: 'add' });
    try {
      const result = await postCartAdd({ ...product, qty, selectedVariants });
      if (result.success) {
        setCart(prev => {
          const ex = prev.find(i => i.id === product.id && JSON.stringify(i.selectedVariants) === JSON.stringify(selectedVariants));
          if (ex) return prev.map(i => i.cartId === ex.cartId ? { ...i, qty: i.qty + qty } : i);
          cartIdRef.current++;
          return [...prev, { ...product, selectedVariants, qty, cartId: cartIdRef.current }];
        });
        setCartOpen(true);
        showToast(result.message, 'success');
      }
    } catch (err) { showToast(err.message, 'error'); }
    finally { setApiStatus({ loading: false, action: '' }); }
  }, []);

  const increment = useCallback(async (cartId) => {
    setApiStatus({ loading: true, action: `inc-${cartId}` });
    try {
      const item = cart.find(i => i.cartId === cartId);
      await patchCartItem(cartId, { qty: (item?.qty || 0) + 1 });
      setCart(p => p.map(i => i.cartId === cartId ? { ...i, qty: i.qty + 1 } : i));
    } catch (err) { showToast(err.message, 'error'); }
    finally { setApiStatus({ loading: false, action: '' }); }
  }, [cart]);

  const decrement = useCallback(async (cartId) => {
    setApiStatus({ loading: true, action: `dec-${cartId}` });
    try {
      const item = cart.find(i => i.cartId === cartId);
      const newQty = (item?.qty || 1) - 1;
      if (newQty <= 0) { await deleteCartItem(cartId); setCart(p => p.filter(i => i.cartId !== cartId)); }
      else { await patchCartItem(cartId, { qty: newQty }); setCart(p => p.map(i => i.cartId === cartId ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0)); }
    } catch (err) { showToast(err.message, 'error'); }
    finally { setApiStatus({ loading: false, action: '' }); }
  }, [cart]);

  const remove = useCallback(async (cartId) => {
    setApiStatus({ loading: true, action: `rm-${cartId}` });
    try { await deleteCartItem(cartId); setCart(p => p.filter(i => i.cartId !== cartId)); showToast('Item removed', 'info'); }
    catch (err) { showToast(err.message, 'error'); }
    finally { setApiStatus({ loading: false, action: '' }); }
  }, []);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const goToProducts = () => {
    setSelected(null);
    setTimeout(() => productsRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  const handleDeleteProduct = (productId) => {
    deleteCustomProduct(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
    setSelected(null);
    showToast('Product deleted', 'info');
  };

  const handleAddProduct = (newProduct) => {
    const product = { ...newProduct, isCustom: true };
    saveCustomProduct(product);
    setProducts(prev => [product, ...prev.filter(p => p.id !== product.id)]);
    showToast(`"${newProduct.name}" added to your store!`, 'success');
    setSelected(newProduct);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectProduct = (product) => {
    setSelected(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handler = (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === '/') { e.preventDefault(); setSearchOpen(o => !o); }
      else if (e.key === 'c' || e.key === 'C') { setCartOpen(o => !o); }
      else if (e.key === 'Escape') {
        setCartOpen(false); setCheckoutOpen(false); setSearchOpen(false);
        if (selected) goToProducts();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected]);

  return (
    <div className={`min-h-screen flex flex-col bg-[var(--bg)] ${cartOpen || checkoutOpen ? 'overflow-hidden h-screen' : ''}`}>
      <Navbar
        ref={cartButtonRef}
        cartCount={cartCount}
        onCartOpen={() => setCartOpen(true)}
        onLogoClick={() => setSelected(null)}
        searchOpen={searchOpen}
        onSearchToggle={setSearchOpen}
        onAddProductClick={() => setAddProductOpen(true)}
        wishlistCount={wishlist.length}
        onWishlistOpen={() => setWishlistOpen(true)}
      />

      {addProductOpen && <AddProductModal onClose={() => setAddProductOpen(false)} onAdd={handleAddProduct} />}

      {/* Keyboard shortcut hint — desktop only */}
      <div className="hidden md:block fixed bottom-4 left-4 z-50 text-[11px] text-[var(--muted)] bg-[var(--white)] border border-[var(--border)] rounded-full px-3 py-1.5 shadow-[var(--shadow-sm)]">
        Press <strong className="text-[var(--ink)]">/</strong> to search ·{' '}
        <strong className="text-[var(--ink)]">C</strong> for cart ·{' '}
        <strong className="text-[var(--ink)]">Esc</strong> to close
      </div>

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-3.5 sm:px-5 py-4 sm:py-7">
        {selected ? (
          <div className="max-w-[1100px] mx-auto w-full">
            <ProductPage
              product={selected}
              onAddToCart={addToCart}
              onBack={() => setSelected(null)}
              allProducts={products}
              onProductSelect={selectProduct}
              apiLoading={apiStatus.loading && apiStatus.action === 'add'}
              onDelete={selected?.isCustom ? handleDeleteProduct : null}
              wished={isWished(selected?.id)}
              onWishlistToggle={toggleWishlist}
              cartButtonRef={cartButtonRef}
            />
          </div>
        ) : (
          <>
            <Hero onShop={goToProducts} />

            <section id="products" ref={productsRef}>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-2 sm:gap-0">
                <div>
                  <p className="text-[11.5px] font-bold tracking-[0.1em] uppercase text-[var(--accent)] mb-1.5 flex items-center gap-1">
                    <TrendingUp size={11} className="inline" /> Trending Now
                  </p>
                  <h2 className="font-display text-2xl sm:text-[26px] font-bold text-[var(--ink)] leading-snug">Featured Products</h2>
                </div>
                <button className="flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--accent)] bg-transparent border-none cursor-pointer font-[Outfit,sans-serif] whitespace-nowrap self-start sm:self-auto">
                  View all <ArrowRight size={14} />
                </button>
              </div>

              {error ? (
                <div className="text-center py-10 px-5 text-[var(--danger)] text-[15px]">{error}</div>
              ) : loading ? <GridSkeleton /> : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                  {products.map((p, i) => (
                    <div key={p.id} className={`anim-up anim-d${Math.min(i + 1, 4)}`}>
                      <ProductCard
                        product={p}
                        onSelect={selectProduct}
                        onDelete={p.isCustom ? handleDeleteProduct : null}
                        wished={isWished(p.id)}
                        onWishlistToggle={toggleWishlist}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Value band */}
            <section className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--border)] border border-[var(--border)] rounded-2xl overflow-hidden">
              {[
                { emoji: '🚀', title: 'Fast Delivery',   desc: 'Same-day dispatch on orders before 2pm' },
                { emoji: '🔒', title: 'Secure Payments', desc: 'SSL encrypted · Always safe' },
                { emoji: '↩',  title: '30-Day Returns',  desc: 'Full refund, no questions asked' },
                { emoji: '🏆', title: 'Premium Quality', desc: 'Hand-tested before listing' },
              ].map(v => (
                <div key={v.title} className="bg-[var(--white)] px-4 py-5 text-center">
                  <div className="text-[26px] mb-2">{v.emoji}</div>
                  <p className="text-[13.5px] font-bold text-[var(--ink)] mb-1">{v.title}</p>
                  <p className="text-[12.5px] text-[var(--muted)] leading-snug">{v.desc}</p>
                </div>
              ))}
            </section>
          </>
        )}
      </main>

      <Footer />

      <CartDrawer
        isOpen={cartOpen} onClose={() => setCartOpen(false)}
        items={cart} onIncrement={increment} onDecrement={decrement} onRemove={remove}
        apiStatus={apiStatus} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />

      <WishlistDrawer
        isOpen={wishlistOpen} onClose={() => setWishlistOpen(false)}
        items={wishlist}
        onRemove={(productId) => { const p = wishlist.find(x => x.id === productId); if (p) toggleWishlist(p); }}
        onMoveToCart={(product) => { addToCart({ ...product, selectedVariants: {}, qty: 1 }); setWishlistOpen(false); setCartOpen(true); }}
      />

      {checkoutOpen && (
        <CheckoutModal
          items={cart} onClose={() => setCheckoutOpen(false)}
          onSuccess={() => { setCart([]); setCheckoutOpen(false); showToast('Order placed successfully! 🎉', 'success'); }}
        />
      )}

      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}
