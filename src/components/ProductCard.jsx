import { Star, ShoppingBag, Heart, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ProductCard({ product, onSelect, onDelete, wished = false, onWishlistToggle }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const disc = Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100);
  const isLow = product.stock <= 5;

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (confirmDelete) { onDelete(product.id); }
    else { setConfirmDelete(true); setTimeout(() => setConfirmDelete(false), 2500); }
  };

  return (
    <article
      className="product-card relative cursor-pointer rounded-2xl overflow-hidden border border-[var(--border)] bg-white transition-[transform,box-shadow] duration-250 hover:-translate-y-1 hover:shadow-md"
      onClick={() => onSelect(product)}
      role="button" tabIndex={0}
      aria-label={`View ${product.name}`}
      onKeyDown={e => e.key === 'Enter' && onSelect(product)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[var(--surface)]">
        <img
          src={product.images[0]} alt={product.name}
          className="card-img w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/400x400?text=No+Image'; }}
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="text-white font-bold px-2 py-0.5 rounded-full text-[11px]" style={{ background: 'var(--accent)' }}>
            −{disc}%
          </span>
          {isLow && (
            <span className="text-white font-bold px-2 py-0.5 rounded-full text-[10.5px]" style={{ background: 'var(--danger)' }}>
              Low Stock
            </span>
          )}
          {product.isCustom && (
            <span className="text-white font-bold px-2 py-0.5 rounded-full text-[10.5px]" style={{ background: 'var(--gold)' }}>
              Added
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); onWishlistToggle && onWishlistToggle(product); }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer shadow-sm bg-white/90"
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={wished}
        >
          <Heart size={13} fill={wished ? 'var(--danger)' : 'none'} color={wished ? 'var(--danger)' : 'var(--ink-2)'} />
        </button>
      </div>

      {/* Body */}
      <div className="p-2.5 sm:p-3">
        <p className="text-[10px] sm:text-[10.5px] font-bold tracking-widest uppercase mb-1" style={{ color: 'var(--accent)' }}>
          {product.brand}
        </p>
        <h3 className="text-[12.5px] sm:text-[13.5px] font-semibold leading-snug mb-2 line-clamp-2"
          style={{ color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>
          {product.name}
        </h3>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-2">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={10} fill={i <= Math.round(product.rating) ? 'var(--gold)' : 'none'} color={i <= Math.round(product.rating) ? 'var(--gold)' : 'var(--border-2)'} />
          ))}
          <span className="text-[10px] sm:text-[11px] ml-0.5" style={{ color: 'var(--muted)' }}>
            ({product.reviewCount >= 1000 ? (product.reviewCount/1000).toFixed(1)+'k' : product.reviewCount})
          </span>
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-base sm:text-[17px]" style={{ color: 'var(--ink)', fontFamily: 'Playfair Display, serif' }}>
              ${product.price.toFixed(0)}
            </span>
            <span className="text-[10.5px] line-through" style={{ color: 'var(--muted)' }}>${product.comparePrice}</span>
          </div>

          <div className="flex gap-1.5 items-center">
            {onDelete && (
              <button
                onClick={handleDeleteClick}
                title={confirmDelete ? 'Tap again to confirm' : 'Delete product'}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 border-none cursor-pointer transition-all"
                style={{ background: confirmDelete ? 'var(--danger)' : 'var(--danger-light)' }}
                aria-label="Delete product"
              >
                <Trash2 size={12} color={confirmDelete ? 'white' : 'var(--danger)'} />
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); onSelect(product); }}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 border-none cursor-pointer"
              style={{ background: 'var(--accent)' }}
              aria-label={`View ${product.name}`}
            >
              <ShoppingBag size={13} color="white" />
            </button>
          </div>
        </div>

        {confirmDelete && (
          <div className="mt-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-center" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            Tap 🗑 again to confirm
          </div>
        )}
      </div>
    </article>
  );
}
