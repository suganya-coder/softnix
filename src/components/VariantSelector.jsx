export default function VariantSelector({ variants, selected, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {Object.entries(variants).map(([group, options]) => {
        const isColor = group === 'Color';
        return (
          <div key={group}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{group}</span>
              {isColor && (
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 400 }}>— {selected[group]}</span>
              )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {options.map(opt => {
                const label = isColor ? opt.label : opt;
                const isActive = selected[group] === label;

                if (isColor) {
                  return (
                    <button
                      key={label}
                      title={label}
                      onClick={() => onChange(group, label)}
                      style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: opt.hex,
                        border: isActive ? '2.5px solid var(--accent)' : '2.5px solid transparent',
                        outline: isActive ? '2px solid var(--accent-light-2)' : '2px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.18s',
                        transform: isActive ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                      }}
                      aria-pressed={isActive}
                      aria-label={label}
                    />
                  );
                }

                return (
                  <button
                    key={label}
                    onClick={() => onChange(group, label)}
                    className={`chip ${isActive ? 'active' : ''}`}
                    aria-pressed={isActive}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
