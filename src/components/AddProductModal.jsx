import { useState, useRef } from 'react';
import { X, PackagePlus, Upload, Tag, DollarSign, Layers, Image as ImageIcon, CheckCircle2, Sparkles, ChevronRight } from 'lucide-react';

const STEPS = ['Details', 'Pricing', 'Media'];

const FIELD_META = {
  name:         { label: 'Product Name', placeholder: 'e.g. Aurora Smart Watch', required: true },
  brand:        { label: 'Brand', placeholder: 'e.g. AURORA' },
  price:        { label: 'Sale Price ($)', placeholder: '49.99', type: 'number', required: true },
  comparePrice: { label: 'Original Price ($)', placeholder: '79.99', type: 'number' },
  stock:        { label: 'Stock Quantity', placeholder: '10', type: 'number' },
  image:        { label: 'Image URL', placeholder: 'https://images.unsplash.com/...', required: true },
};

function StepDot({ index, current, label }) {
  const done = index < current;
  const active = index === current;
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        style={{
          width: 32, height: 32, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13, transition: 'all .25s',
          background: done ? 'var(--accent)' : active ? 'var(--accent)' : 'var(--surface-2)',
          color: done || active ? '#fff' : 'var(--muted)',
          boxShadow: active ? '0 0 0 4px var(--accent-light-2)' : 'none',
        }}
      >
        {done ? <CheckCircle2 size={15} /> : index + 1}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: active ? 'var(--accent)' : done ? 'var(--ink-2)' : 'var(--muted)', letterSpacing: '.03em' }}>
        {label}
      </span>
    </div>
  );
}

function FieldInput({ fieldKey, value, onChange }) {
  const meta = FIELD_META[fieldKey];
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6, letterSpacing: '.04em', textTransform: 'uppercase' }}>
        {meta.label}{meta.required && <span style={{ color: 'var(--accent)', marginLeft: 3 }}>*</span>}
      </label>
      <input
        type={meta.type || 'text'}
        step={meta.type === 'number' ? '0.01' : undefined}
        required={meta.required}
        value={value}
        placeholder={meta.placeholder}
        onChange={e => onChange(fieldKey, e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '10px 12px',
          border: `1.5px solid ${focused ? 'var(--accent)' : 'var(--border-2)'}`,
          borderRadius: 10, fontSize: 14,
          background: focused ? 'var(--white)' : 'var(--surface)',
          color: 'var(--ink)', outline: 'none',
          transition: 'all .18s',
          boxShadow: focused ? '0 0 0 3px var(--accent-light-2)' : 'none',
        }}
      />
    </div>
  );
}

function ImagePreview({ url }) {
  const [err, setErr] = useState(false);
  if (!url) return null;
  return (
    <div style={{ marginTop: 10, borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--border)', background: 'var(--surface)', position: 'relative' }}>
      {!err ? (
        <img
          src={url} alt="Preview" onError={() => setErr(true)}
          style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{ height: 80, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <ImageIcon size={22} color="var(--muted)" />
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Unable to load preview</span>
        </div>
      )}
      {!err && (
        <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--accent)', borderRadius: 20, padding: '2px 9px', fontSize: 11, color: '#fff', fontWeight: 600 }}>
          Preview
        </div>
      )}
    </div>
  );
}

function DiscountBadge({ price, compare }) {
  const p = parseFloat(price), c = parseFloat(compare);
  if (!p || !c || c <= p) return null;
  const pct = Math.round(((c - p) / c) * 100);
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--accent-light)', border: '1px solid var(--accent-light-2)', borderRadius: 20, padding: '3px 10px', marginTop: 6 }}>
      <Sparkles size={12} color="var(--accent)" />
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{pct}% off — looks great!</span>
    </div>
  );
}

export default function AddProductModal({ onClose, onAdd }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name: '', brand: '', price: '', comparePrice: '', image: '', stock: '10' });
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const canAdvance = () => {
    if (step === 0) return form.name.trim() !== '';
    if (step === 1) return form.price.trim() !== '';
    return form.image.trim() !== '';
  };

  const handleNext = () => {
    if (step < 2) setStep(s => s + 1);
    else handleSubmit();
  };

  const handleSubmit = () => {
    if (!form.name || !form.price || !form.image) return;
    setSubmitting(true);
    setTimeout(() => {
      const price = parseFloat(form.price);
      const comparePrice = form.comparePrice ? parseFloat(form.comparePrice) : Math.round(price * 1.5);
      onAdd({
        id: Date.now(), name: form.name, brand: form.brand || 'GENERIC',
        tagline: 'Newly added product', price, comparePrice,
        rating: 4.5, reviewCount: 0, totalRatings: 0,
        stock: parseInt(form.stock) || 10, sku: `NEW-${Date.now()}`,
        shipsIn: '3–5 business days', badge: 'New',
        seller: { name: 'Your Store', rating: 4.5, totalSales: '0' },
        images: [form.image],
        variants: { Color: [{ label: 'Default', hex: '#888888' }], Size: ['One Size'] },
        highlights: [{ key: 'Brand', value: form.brand || 'Generic' }, { key: 'Stock', value: `${form.stock || 10} units` }],
        features: [], description: 'This product was added directly from the storefront.',
        ratingBreakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
        ratingTags: [], reviews: [], deliveryDate: 'within 5-7 days',
        deliveryPin: '623514', similarProducts: [],
      });
      onClose();
    }, 500);
  };

  const stepContent = [
    /* Step 0 – Details */
    <div key="details" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '14px 16px', background: 'var(--accent-light)', borderRadius: 12, border: '1px solid var(--accent-light-2)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Tag size={16} color="var(--accent)" style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>Start with the basics</div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>Give your product a clear name and brand so buyers can find it easily.</div>
        </div>
      </div>
      <FieldInput fieldKey="name" value={form.name} onChange={update} />
      <FieldInput fieldKey="brand" value={form.brand} onChange={update} />
      <FieldInput fieldKey="stock" value={form.stock} onChange={update} />
    </div>,

    /* Step 1 – Pricing */
    <div key="pricing" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '14px 16px', background: 'var(--gold-light)', borderRadius: 12, border: '1px solid #f5e0b8', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <DollarSign size={16} color="var(--gold)" style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)' }}>Set your price</div>
          <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 2 }}>Add an original price to show how much buyers save — a great way to boost conversions.</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <FieldInput fieldKey="price" value={form.price} onChange={update} />
        <FieldInput fieldKey="comparePrice" value={form.comparePrice} onChange={update} />
      </div>
      <DiscountBadge price={form.price} compare={form.comparePrice} />
      {/* Visual price preview */}
      {form.price && (
        <div style={{ background: 'var(--surface)', borderRadius: 12, padding: '12px 16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Layers size={16} color="var(--muted)" />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>${parseFloat(form.price || 0).toFixed(2)}</span>
            {form.comparePrice && parseFloat(form.comparePrice) > parseFloat(form.price) && (
              <span style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'line-through' }}>${parseFloat(form.comparePrice).toFixed(2)}</span>
            )}
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 'auto' }}>Price preview</span>
        </div>
      )}
    </div>,

    /* Step 2 – Media */
    <div key="media" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 12, border: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <Upload size={16} color="var(--ink-2)" style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-2)' }}>Add a product image</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Paste a public image URL. Products with photos get 3× more clicks.</div>
        </div>
      </div>
      <FieldInput fieldKey="image" value={form.image} onChange={update} />
      <ImagePreview url={form.image} />
    </div>,
  ];

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--white)', borderRadius: 20, width: '100%', maxWidth: 460,
          maxHeight: '92vh', overflowY: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px 0', borderBottom: '1px solid var(--border)', paddingBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PackagePlus size={18} color="var(--accent)" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2 }}>New Product</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>Step {step + 1} of {STEPS.length}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}>
              <X size={16} />
            </button>
          </div>

          {/* Step indicators */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0 }}>
            {STEPS.map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                <StepDot index={i} current={step} label={label} />
                {i < STEPS.length - 1 && (
                  <div style={{ width: 48, height: 2, background: i < step ? 'var(--accent)' : 'var(--border-2)', margin: '0 4px', marginBottom: 22, borderRadius: 2, transition: 'background .3s' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div ref={formRef} style={{ padding: '20px 24px', flex: 1 }}>
          {stepContent[step]}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              style={{ flex: 1, padding: '10px 0', border: '1.5px solid var(--border-2)', borderRadius: 12, background: 'transparent', color: 'var(--ink-2)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
            >
              Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canAdvance() || submitting}
            style={{
              flex: step === 0 ? 1 : 2,
              padding: '11px 0', borderRadius: 12, border: 'none',
              background: canAdvance() && !submitting ? 'var(--accent)' : 'var(--surface-2)',
              color: canAdvance() && !submitting ? '#fff' : 'var(--muted)',
              fontWeight: 700, fontSize: 14, cursor: canAdvance() && !submitting ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all .18s',
            }}
          >
            {submitting ? (
              <>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                Adding…
              </>
            ) : step < 2 ? (
              <>Continue <ChevronRight size={15} /></>
            ) : (
              <>Add Product <PackagePlus size={15} /></>
            )}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
