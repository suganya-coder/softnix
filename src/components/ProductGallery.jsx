import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';

export default function ProductGallery({ images, productName, countdown }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const prev = () => setActive(i => (i - 1 + images.length) % images.length);
  const next = () => setActive(i => (i + 1) % images.length);
  const pad = n => String(n).padStart(2, '0');

  return (
    <div>
      {/* Main image wrapper — overflow hidden to clip countdown inside rounded corners */}
      <div
        className="gallery-main"
        style={{ overflow: 'hidden', position: 'relative', aspectRatio: '1/1', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', cursor: 'zoom-in' }}
        onClick={() => setLightbox(true)}
      >
        <img
          key={active}
          src={images[active]}
          alt={`${productName} ${active + 1}`}
          className="card-img anim-scale"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/600x600?text=No+Image'; }}
        />

        {/* Amazon-style countdown overlay — sits inside image */}
        {countdown && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.0) 100%)',
              padding: '32px 14px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              pointerEvents: 'none',
            }}
          >
            {/* Label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={13} color="rgba(255,255,255,0.85)" />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '.02em' }}>
                Deal ends in
              </span>
            </div>

            {/* HH : MM : SS blocks */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {[
                { val: pad(countdown.h), label: 'hrs' },
                { val: pad(countdown.m), label: 'min' },
                { val: pad(countdown.s), label: 'sec' },
              ].map(({ val, label }, i) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    background: 'rgba(0,0,0,0.72)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 6,
                    padding: '4px 8px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    minWidth: 38,
                  }}>
                    <span style={{
                      fontSize: 20, fontWeight: 800, color: '#fff',
                      fontVariantNumeric: 'tabular-nums', lineHeight: 1.1,
                    }}>{val}</span>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 2 }}>{label}</span>
                  </div>
                  {i < 2 && (
                    <span style={{ fontSize: 17, fontWeight: 800, color: 'rgba(255,255,255,0.65)', lineHeight: 1, marginBottom: 10 }}>:</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prev / Next arrows */}
        {images.length > 1 && <>
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            style={{ position: 'absolute', left: 10, top: '45%', transform: 'translateY(-50%)', width: 34, height: 34, background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', zIndex: 2 }}
          >
            <ChevronLeft size={17} color="var(--ink)" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            style={{ position: 'absolute', right: 10, top: '45%', transform: 'translateY(-50%)', width: 34, height: 34, background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', zIndex: 2 }}
          >
            <ChevronRight size={17} color="var(--ink)" />
          </button>
        </>}

        {/* Dot indicators — top */}
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 2 }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setActive(i); }}
              style={{ width: i === active ? 18 : 6, height: 6, borderRadius: 10, background: i === active ? 'var(--accent)' : 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', transition: 'all 0.25s', padding: 0 }}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div style={{ display: 'flex', gap: 7, marginTop: 9, overflowX: 'auto', paddingBottom: 2 }}>
        {images.map((src, i) => (
          <button key={i} onClick={() => setActive(i)} style={{ background: 'none', border: 'none', padding: 0, flexShrink: 0 }}>
            <div className={`gallery-thumb ${i === active ? 'active' : ''}`} style={{ width: 64, height: 64 }}>
              <img src={src} alt={i + 1} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/64x64?text=?'; }} />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox — z-index 2000 to stay above everything */}
      {lightbox && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.94)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setLightbox(false)}
        >
          <img
            src={images[active]}
            alt={productName}
            style={{ maxWidth: '100%', maxHeight: '88vh', objectFit: 'contain', borderRadius: 8 }}
            onClick={e => e.stopPropagation()}
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/600x600?text=No+Image'; }}
          />
          <button
            onClick={() => setLightbox(false)}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <X size={20} color="white" />
          </button>
          {images.length > 1 && <>
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronLeft size={22} color="white" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <ChevronRight size={22} color="white" />
            </button>
          </>}
        </div>
      )}
    </div>
  );
}
