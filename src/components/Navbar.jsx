import { useState, useEffect, forwardRef } from 'react';
import { ShoppingBag, Search, Heart, X, Menu, ChevronDown, Sun, Moon, Plus } from 'lucide-react';

const NAV_LINKS = ['Shop', 'Collections', 'About', 'Blog'];

const Navbar = forwardRef(function Navbar({ cartCount, onCartOpen, onLogoClick, searchOpen, onSearchToggle, onAddProductClick, wishlistCount = 0, onWishlistOpen }, cartRef) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Dark mode: read saved preference, sync <html> class + localStorage
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <>
      <div className="announcement-bar">
        🚚 Free shipping over $75 &nbsp;·&nbsp; Use <strong>WELCOME10</strong> for 10% off
      </div>

      <header className="navbar">
        <div className="navbar-inner">
          {/* Mobile menu button */}
          <button
            className="btn-ghost nav-mobile-btn flex md:hidden"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2 bg-transparent border-none cursor-pointer flex-shrink-0"
            aria-label="Go to home"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-display" style={{ fontSize: 19, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              Luxe<span style={{ color: 'var(--accent)' }}>Shop</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="nav-desktop hidden md:flex items-center gap-1">
            {NAV_LINKS.map(link => (
              <button
                key={link}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer border-none transition-colors hover:bg-[var(--surface)] hover:text-[var(--ink)]"
                style={{ background: 'none', color: 'var(--ink-2)', fontFamily: 'Outfit, sans-serif' }}
              >
                {link} {link === 'Collections' && <ChevronDown size={12} />}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button className="btn-ghost" onClick={onAddProductClick} aria-label="Add product" title="Add new product">
              <Plus size={19} />
            </button>
            <button className="btn-ghost" onClick={() => setDark(d => !d)} aria-label="Toggle dark mode">
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button className="btn-ghost" onClick={() => onSearchToggle(o => !o)} aria-label="Search">
              <Search size={19} />
            </button>
            <button className="btn-ghost hidden md:flex relative" onClick={onWishlistOpen} aria-label={`Wishlist, ${wishlistCount} items`}>
              <Heart size={19} fill={wishlistCount > 0 ? 'var(--danger)' : 'none'} color={wishlistCount > 0 ? 'var(--danger)' : 'currentColor'} />
              {wishlistCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: 'var(--danger)' }}
                >
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </button>
            <button
              ref={cartRef}
              onClick={onCartOpen}
              aria-label={`Cart, ${cartCount} items`}
              className="relative flex items-center gap-1.5 text-white border-none rounded-lg px-3.5 py-2 cursor-pointer font-semibold text-sm transition-colors"
              style={{ background: 'var(--accent)', fontFamily: 'Outfit, sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              <ShoppingBag size={17} />
              <span className="hidden md:inline">Cart</span>
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: '#c8933a', color: 'var(--ink)' }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-[var(--border)] px-4 py-2.5 bg-white">
            <div className="max-w-lg mx-auto relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                autoFocus
                placeholder="Search products…"
                className="w-full pl-9 pr-10 py-2.5 border border-[var(--border-2)] rounded-lg text-sm bg-[var(--surface)] outline-none focus:border-[var(--accent)] transition-colors"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              />
              <button
                onClick={() => onSearchToggle(false)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-[var(--muted)]"
                aria-label="Close search"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Drawer Menu */}
        {mobileOpen && (
          <div className="border-t border-[var(--border)] bg-white py-2">
            {NAV_LINKS.map(link => (
              <button
                key={link}
                onClick={() => setMobileOpen(false)}
                className="flex w-full px-5 py-3.5 bg-transparent border-none cursor-pointer text-sm font-medium text-[var(--ink-2)] justify-between items-center"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {link} <ChevronDown size={15} color="var(--muted)" />
              </button>
            ))}
          </div>
        )}
      </header>
    </>
  );
});

export default Navbar;
