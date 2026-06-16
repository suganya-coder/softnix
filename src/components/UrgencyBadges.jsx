import { Truck, AlertCircle, Flame } from 'lucide-react';

export default function UrgencyBadges({ stock, shipsIn }) {
  const isLow = stock <= 10;
  const isCritical = stock <= 5;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Low stock warning */}
      {isLow && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px',
          borderRadius: 12,
          background: isCritical
            ? 'linear-gradient(135deg, #fff0ee, #fff5f4)'
            : 'linear-gradient(135deg, #fffbf0, #fff8e6)',
          border: `1.5px solid ${isCritical ? '#ffd5d0' : '#ffe8b8'}`,
          boxShadow: `0 2px 8px ${isCritical ? 'rgba(192,57,43,0.08)' : 'rgba(200,147,58,0.08)'}`,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isCritical ? 'var(--danger-light)' : 'var(--gold-light)',
            border: `1px solid ${isCritical ? '#f5c6c0' : '#f0d9b0'}`,
          }}>
            {isCritical
              ? <AlertCircle size={15} color="var(--danger)" />
              : <Flame size={15} color="var(--gold)" />
            }
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: isCritical ? 'var(--danger)' : '#a06020', lineHeight: 1.2 }}>
              Only <strong>{stock} left</strong> in stock
            </p>
            <p style={{ fontSize: 11, color: isCritical ? '#c0392b99' : '#a0602099', marginTop: 2 }}>
              {isCritical ? 'Almost sold out — order now!' : 'Selling fast, grab yours today'}
            </p>
          </div>
        </div>
      )}

      {/* Shipping badge */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 14px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, var(--accent-light) 0%, #f0f8f4 100%)',
        border: '1.5px solid var(--accent-light-2)',
        boxShadow: '0 2px 8px rgba(42,96,73,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--accent)',
          }}>
            <Truck size={15} color="white" />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', lineHeight: 1.2 }}>
              Ships in <strong>{shipsIn}</strong>
            </p>
            <p style={{ fontSize: 11, color: 'var(--accent)', opacity: 0.7, marginTop: 2 }}>
              Fast & reliable delivery
            </p>
          </div>
        </div>
        <div style={{
          fontSize: 11, fontWeight: 800,
          background: 'var(--accent)', color: 'white',
          padding: '4px 10px', borderRadius: 20,
          letterSpacing: '.03em', whiteSpace: 'nowrap',
          boxShadow: '0 2px 6px rgba(42,96,73,0.3)',
        }}>
          FREE over $75
        </div>
      </div>
    </div>
  );
}
