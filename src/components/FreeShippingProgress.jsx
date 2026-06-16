import { Truck, CheckCircle2, Gift } from 'lucide-react';

export default function FreeShippingProgress({ cartTotal, threshold = 75 }) {
  const pct = Math.min(100, (cartTotal / threshold) * 100);
  const remaining = Math.max(0, threshold - cartTotal).toFixed(2);
  const unlocked = cartTotal >= threshold;

  return (
    <div style={{
      borderRadius: 14,
      border: unlocked ? '1.5px solid var(--accent-light-2)' : '1.5px solid var(--border)',
      background: unlocked
        ? 'linear-gradient(135deg, var(--accent-light) 0%, #f0f8f4 100%)'
        : 'var(--surface)',
      padding: '13px 14px',
      transition: 'all .3s',
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: unlocked ? 'var(--accent)' : 'var(--surface-2)',
          transition: 'all .3s',
        }}>
          {unlocked
            ? <CheckCircle2 size={16} color="white" />
            : <Truck size={16} color="var(--muted)" />
          }
        </div>

        <div style={{ flex: 1 }}>
          {unlocked ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                Free Shipping Unlocked!
              </span>
              <Gift size={13} color="var(--accent)" />
            </div>
          ) : (
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3 }}>
              Add{' '}
              <span style={{ color: 'var(--accent)', fontWeight: 800 }}>${remaining}</span>
              {' '}more to unlock free shipping
            </p>
          )}
          <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            {unlocked ? 'Your order ships for free 🎉' : `${Math.round(pct)}% of the way there`}
          </p>
        </div>

        {/* Threshold badge */}
        <div style={{
          fontSize: 11, fontWeight: 700,
          color: unlocked ? 'var(--accent)' : 'var(--muted)',
          background: unlocked ? 'var(--accent-light-2)' : 'var(--surface-2)',
          borderRadius: 20, padding: '3px 9px',
          flexShrink: 0, transition: 'all .3s',
        }}>
          ${threshold}
        </div>
      </div>

      {/* Progress track */}
      <div style={{
        height: 7, background: 'var(--border-2)', borderRadius: 99,
        overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct}%`,
          borderRadius: 99,
          background: unlocked
            ? 'var(--accent)'
            : 'linear-gradient(90deg, var(--accent-light-2) 0%, var(--accent) 100%)',
          transition: 'width .5s cubic-bezier(.4,0,.2,1)',
          boxShadow: unlocked ? '0 0 8px rgba(42,96,73,0.4)' : 'none',
        }} />
        {/* Glow dot at progress end */}
        {!unlocked && pct > 5 && (
          <div style={{
            position: 'absolute', top: '50%', transform: 'translate(-50%, -50%)',
            left: `${pct}%`,
            width: 11, height: 11, borderRadius: '50%',
            background: 'var(--accent)',
            border: '2px solid white',
            boxShadow: '0 0 6px rgba(42,96,73,0.5)',
          }} />
        )}
      </div>

      {/* Bottom labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 500 }}>
          ${cartTotal.toFixed(2)}
        </span>
        <span style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 500 }}>
          Free shipping at ${threshold}
        </span>
      </div>
    </div>
  );
}
