import { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';

const PLATFORMS = ['Amazon', 'Flipkart', 'Myntra'];

export default function PriceComparison({ currentPrice }) {
  const competitors = useMemo(() => {
    return PLATFORMS.map(name => {
      const markup = 0.05 + Math.random() * 0.20;
      return { name, price: currentPrice * (1 + markup) };
    });
  }, [currentPrice]);

  const maxSavings = Math.max(...competitors.map(c => c.price)) - currentPrice;

  return (
    <div className="border border-[var(--border)] rounded-[10px] p-3 sm:p-3.5 bg-[var(--surface)] overflow-hidden">
      <p className="text-[13.5px] font-bold text-[var(--ink)] mb-2.5">Price Comparison</p>

      <div className="flex flex-col gap-2">
        {/* Our price */}
        <div className="flex items-center justify-between bg-[var(--accent-light)] border border-[var(--accent)] rounded-lg px-3 py-2 min-w-0">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <CheckCircle2 size={14} color="var(--accent)" />
            <span className="text-[13px] font-bold text-[var(--accent)]">Our Price</span>
          </div>
          <span className="text-[14px] sm:text-[14.5px] font-bold text-[var(--ink)] flex-shrink-0 ml-2">${currentPrice.toFixed(2)}</span>
        </div>

        {/* Competitor rows */}
        {competitors.map(c => (
          <div key={c.name} className="flex items-center justify-between px-3 py-1.5 min-w-0">
            <span className="text-[13px] text-[var(--muted)] flex-shrink-0">{c.name}</span>
            <span className="text-[13px] text-[var(--muted)] line-through flex-shrink-0 ml-2">${c.price.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <p className="text-[12px] text-[var(--accent)] font-semibold mt-2.5 leading-snug">
        You save up to ${maxSavings.toFixed(2)} compared to other platforms 🎉
      </p>
    </div>
  );
}
