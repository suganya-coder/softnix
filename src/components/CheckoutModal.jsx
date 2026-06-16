import { useState } from 'react';
import { X, Lock, Check, Loader, CreditCard, Truck, MapPin } from 'lucide-react';
import { postCheckout, fetchPincodeInfo } from '../api';

const STEPS = ['Shipping', 'Payment', 'Review'];

function InputField({ label, placeholder, value, onChange, type = 'text', error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '11px 14px',
          border: `1.5px solid ${error ? 'var(--danger)' : 'var(--border-2)'}`,
          borderRadius: 'var(--radius)', fontSize: 14,
          fontFamily: 'Outfit, sans-serif', outline: 'none',
          background: 'var(--white)', color: 'var(--ink)',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = error ? 'var(--danger)' : 'var(--border-2)'}
      />
      {error && <p style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

export default function CheckoutModal({ items, onClose, onSuccess }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeInfo, setPincodeInfo] = useState(null);

  const [shipping, setShipping] = useState({ name: '', email: '', phone: '', address: '', pincode: '', city: '' });
  const [payment, setPayment] = useState({ card: '', expiry: '', cvv: '', name: '' });
  const [errors, setErrors] = useState({});

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = subtotal >= 75 ? 0 : 8.99;
  const total = subtotal + shippingCost;

  // ── Pincode lookup via API ──────────────────────────────
  const handlePincodeBlur = async () => {
    if (shipping.pincode.length === 6) {
      setPincodeLoading(true);
      try {
        const info = await fetchPincodeInfo(shipping.pincode);
        setPincodeInfo(info);
        setShipping(p => ({ ...p, city: info.city }));
      } catch {
        setPincodeInfo(null);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  const validateShipping = () => {
    const e = {};
    if (!shipping.name.trim()) e.name = 'Required';
    if (!/\S+@\S+\.\S+/.test(shipping.email)) e.email = 'Valid email required';
    if (!shipping.address.trim()) e.address = 'Required';
    if (!/^\d{6}$/.test(shipping.pincode)) e.pincode = '6-digit pincode required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    const e = {};
    if (payment.card.replace(/\s/g,'').length < 16) e.card = '16-digit card number required';
    if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) e.expiry = 'MM/YY format';
    if (payment.cvv.length < 3) e.cvv = '3-digit CVV';
    if (!payment.name.trim()) e.name = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateShipping()) return;
    if (step === 1 && !validatePayment()) return;
    setStep(s => s + 1);
  };

  // ── Place order — POST via API ──────────────────────────
  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const result = await postCheckout({
        items,
        total,
        shipping: shipping,
        payment: { last4: payment.card.slice(-4) },
      });
      setOrderResult(result);
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Order success screen ────────────────────────────────
  if (orderResult) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ background: 'var(--white)', borderRadius: 18, padding: '40px 32px', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Check size={32} color="var(--accent)" />
          </div>
          <h2 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Order Confirmed!</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
            Your order <strong style={{ color: 'var(--ink)' }}>{orderResult.orderId}</strong> has been placed.<br />
            Estimated delivery: <strong>{orderResult.estimatedDelivery}</strong>
          </p>
          <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Order total</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)' }}>${orderResult.total?.toFixed(2)}</p>
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={onSuccess}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'var(--white)', borderRadius: 18, maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-xl)' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--white)', zIndex: 1 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', fontFamily: 'Outfit, sans-serif' }}>Checkout</h2>
            <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
              {STEPS.map((s, i) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: i < step ? 'var(--accent)' : i === step ? 'var(--accent)' : 'var(--surface)',
                    color: i <= step ? 'white' : 'var(--muted)',
                  }}>
                    {i < step ? <Check size={12} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 12, color: i === step ? 'var(--ink)' : 'var(--muted)', fontWeight: i === step ? 600 : 400 }}>{s}</span>
                  {i < STEPS.length - 1 && <div style={{ width: 16, height: 1, background: 'var(--border-2)' }} />}
                </div>
              ))}
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose}><X size={19} /></button>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Step 0 — Shipping */}
          {step === 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <Truck size={16} color="var(--accent)" />
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Shipping Details</h3>
              </div>
              <InputField label="Full Name" placeholder="John Doe" value={shipping.name} onChange={v => setShipping(p => ({...p, name: v}))} error={errors.name} />
              <InputField label="Email" placeholder="john@example.com" type="email" value={shipping.email} onChange={v => setShipping(p => ({...p, email: v}))} error={errors.email} />
              <InputField label="Phone" placeholder="9876543210" type="tel" value={shipping.phone} onChange={v => setShipping(p => ({...p, phone: v}))} error={errors.phone} />
              <InputField label="Address" placeholder="Street, Area" value={shipping.address} onChange={v => setShipping(p => ({...p, address: v}))} error={errors.address} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pincode</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text" maxLength={6} placeholder="623514"
                      value={shipping.pincode}
                      onChange={e => setShipping(p => ({...p, pincode: e.target.value}))}
                      onBlur={handlePincodeBlur}
                      style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${errors.pincode ? 'var(--danger)' : 'var(--border-2)'}`, borderRadius: 'var(--radius)', fontSize: 14, fontFamily: 'Outfit, sans-serif', outline: 'none' }}
                    />
                    {pincodeLoading && (
                      <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}>
                        <Loader size={14} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
                      </div>
                    )}
                  </div>
                  {pincodeInfo && <p style={{ fontSize: 11.5, color: 'var(--accent)', marginTop: 4 }}>✓ {pincodeInfo.city}, {pincodeInfo.state}</p>}
                  {errors.pincode && <p style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 4 }}>{errors.pincode}</p>}
                </div>
                <InputField label="City" placeholder="Gurugram" value={shipping.city} onChange={v => setShipping(p => ({...p, city: v}))} />
              </div>
            </div>
          )}

          {/* Step 1 — Payment */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                <CreditCard size={16} color="var(--accent)" />
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>Payment Details</h3>
              </div>
              <div style={{ background: 'var(--surface)', borderRadius: 10, padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>
                <Lock size={13} /> Secured with 256-bit SSL encryption
              </div>
              <InputField
                label="Card Number" placeholder="1234 5678 9012 3456"
                value={payment.card}
                onChange={v => setPayment(p => ({...p, card: v.replace(/[^\d]/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19)}))}
                error={errors.card}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InputField label="Expiry" placeholder="MM/YY" value={payment.expiry}
                  onChange={v => {
                    const clean = v.replace(/[^\d]/g,'').slice(0,4);
                    setPayment(p => ({...p, expiry: clean.length > 2 ? `${clean.slice(0,2)}/${clean.slice(2)}` : clean}));
                  }}
                  error={errors.expiry}
                />
                <InputField label="CVV" placeholder="123" type="password" value={payment.cvv}
                  onChange={v => setPayment(p => ({...p, cvv: v.replace(/[^\d]/g,'').slice(0,3)}))}
                  error={errors.cvv}
                />
              </div>
              <InputField label="Cardholder Name" placeholder="John Doe" value={payment.name} onChange={v => setPayment(p => ({...p, name: v}))} error={errors.name} />
            </div>
          )}

          {/* Step 2 — Review */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 16 }}>Order Summary</h3>
              <div style={{ borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 18 }}>
                {items.map((item, i) => (
                  <div key={item.cartId} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <img src={item.images[0]} alt={item.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{item.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {Object.entries(item.selectedVariants).map(([k,v]) => `${k}: ${v}`).join(' · ')} · Qty: {item.qty}
                      </p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>${(item.price * item.qty).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '14px 16px', background: 'var(--surface)', borderRadius: 10, marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--ink-2)' }}>
                  <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--ink-2)' }}>
                  <span>Shipping</span>
                  <span style={{ color: shippingCost === 0 ? 'var(--accent)' : 'inherit' }}>
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--ink)', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <span>Total</span><span>${total.toFixed(2)}</span>
                </div>
              </div>
              {errors.submit && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{errors.submit}</p>}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {step > 0 && (
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>
                Back
              </button>
            )}
            {step < 2 ? (
              <button className="btn-primary" style={{ flex: 2 }} onClick={handleNext}>
                Continue →
              </button>
            ) : (
              <button
                className="btn-primary"
                style={{ flex: 2, opacity: submitting ? 0.7 : 1 }}
                onClick={handlePlaceOrder}
                disabled={submitting}
              >
                {submitting ? (
                  <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</>
                ) : (
                  <><Lock size={14} /> Place Order — ${total.toFixed(2)}</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
