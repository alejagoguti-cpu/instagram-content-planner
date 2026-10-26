import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Carrusel deslizable de láminas (flechas, puntos y deslizar con el dedo o el mouse)
export default function SlideCarousel({ slides, alt }) {
  const trackRef = useRef(null);
  const [index, setIndex] = useState(0);

  const goTo = (i) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(slides.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    setIndex(next);
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="relative w-full h-full bg-[#0c0c0e]">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {slides.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${alt} · lámina ${i + 1}`}
            loading="lazy"
            draggable={false}
            className="w-full h-full object-contain shrink-0 snap-center"
          />
        ))}
      </div>

      {slides.length > 1 && (
        <>
          {index > 0 && (
            <button
              onClick={() => goTo(index - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow"
              title="Anterior"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {index < slides.length - 1 && (
            <button
              onClick={() => goTo(index + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow"
              title="Siguiente"
            >
              <ChevronRight size={16} />
            </button>
          )}
          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-3 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
