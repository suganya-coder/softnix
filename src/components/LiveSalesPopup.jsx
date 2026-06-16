import { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';

const NAMES = ['Rahul', 'Priya', 'Arjun', 'Sneha', 'Vikram', 'Ananya', 'Karthik', 'Divya', 'Rohan', 'Meera'];
const CITIES = ['Chennai', 'Bangalore', 'Mumbai', 'Hyderabad', 'Delhi', 'Pune', 'Kolkata', 'Coimbatore'];

export default function LiveSalesPopup({ productName }) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const showPopup = () => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const mins = Math.floor(Math.random() * 14) + 1;
      setData({ name, city, mins });
      setVisible(true);
      setTimeout(() => setVisible(false), 4500);
    };

    const first = setTimeout(showPopup, 3000);
    const interval = setInterval(showPopup, 9000);

    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [dismissed]);

  if (!visible || !data || dismissed) return null;

  return (
    <div className="fixed bottom-[84px] left-3.5 right-3.5 max-w-[360px] bg-[var(--white)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-md)] px-3 py-2.5 flex items-center gap-2.5 z-[900] animate-[slideUpFade_0.35s_ease]">
      <div className="w-9 h-9 rounded-full bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
        <ShoppingBag size={16} color="var(--accent)" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold leading-tight text-[var(--ink)]">
          {data.name} from {data.city}
        </p>
        <p className="text-[11.5px] leading-tight text-[var(--muted)] overflow-hidden text-ellipsis whitespace-nowrap">
          purchased "{productName}" · {data.mins} min{data.mins > 1 ? 's' : ''} ago
        </p>
      </div>

      <button
        onClick={() => { setVisible(false); setDismissed(true); }}
        aria-label="Dismiss"
        className="bg-transparent border-none cursor-pointer text-[var(--muted)] flex-shrink-0 p-0.5"
      >
        <X size={15} />
      </button>
    </div>
  );
}
