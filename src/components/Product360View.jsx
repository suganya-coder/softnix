import { useState, useRef } from 'react';
import { RotateCw } from 'lucide-react';

// Drag-to-rotate 360° viewer. `frames` is an array of image URLs (one per angle).
export default function Product360View({ frames, productName }) {
  const [index, setIndex] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startIndex = useRef(0);

  const onDown = (clientX) => {
    dragging.current = true;
    startX.current = clientX;
    startIndex.current = index;
  };

  const onMove = (clientX) => {
    if (!dragging.current) return;
    const totalDelta = clientX - startX.current;
    const frameStep = Math.trunc(totalDelta / 12); // every 12px of drag = 1 frame step
    let next = (startIndex.current + frameStep) % frames.length;
    if (next < 0) next += frames.length;
    if (next !== index) {
      setIndex(next);
      setShowHint(false);
    }
  };

  const onUp = () => { dragging.current = false; };

  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-xl bg-[var(--surface)] cursor-grab select-none touch-none"
      onMouseDown={e => onDown(e.clientX)}
      onMouseMove={e => onMove(e.clientX)}
      onMouseUp={onUp}
      onMouseLeave={onUp}
      onTouchStart={e => onDown(e.touches[0].clientX)}
      onTouchMove={e => onMove(e.touches[0].clientX)}
      onTouchEnd={onUp}
    >
      <img
        src={frames[index]}
        alt={`${productName} 360 view frame ${index + 1}`}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* 360 badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[var(--white)]/90 text-[var(--ink)] text-xs font-bold px-2.5 py-1 rounded-full shadow-[var(--shadow-sm)]">
        <RotateCw size={12} /> 360°
      </div>

      {/* Frame counter */}
      <div className="absolute top-3 left-3 bg-[var(--ink)]/60 text-[var(--white)] text-[11px] font-semibold px-2 py-1 rounded-full">
        {index + 1} / {frames.length}
      </div>

      {/* Drag hint */}
      {showHint && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[var(--ink)]/70 text-[var(--white)] text-xs font-medium px-3 py-1.5 rounded-full animate-[fadeOut_2.5s_ease_forwards]">
          ↔ Drag to rotate
        </div>
      )}
    </div>
  );
}
